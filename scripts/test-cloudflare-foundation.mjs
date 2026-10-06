import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import worker from '../worker/index.ts'
import {buildMetadata} from '../src/utils/buildMetadata.ts'
import {resolveBuildMetadata} from './build-metadata.mjs'
import {checkPreview} from './check-preview.mjs'
import {checkProduction,productionCheckArgs} from './check-production.mjs'

test('deployment shortcuts explicitly select environments; no generic deploy shortcut',async()=>{
 const {scripts}=JSON.parse(await fs.readFile('package.json','utf8'))
 assert.equal(scripts['deploy:preview:dry'],'wrangler deploy --env preview --dry-run')
 assert.equal(scripts['deploy:preview'],'wrangler deploy --env preview')
 for(const name of ['deploy:preview:dry','deploy:preview'])assert.match(scripts[name],/--env preview(?:\s|$)/)
 assert.match(scripts['deploy:preview:dry'],/--dry-run(?:\s|$)/)
 assert.equal(scripts['deploy:production:dry'],'wrangler deploy --env production --dry-run')
 assert.equal(scripts['deploy:production'],'wrangler deploy --env production')
 assert.equal(scripts['check:production'],'node scripts/check-production.mjs')
 for(const name of ['deploy','release'])assert.equal(scripts[name],undefined)
 assert.equal(scripts['check:preview'],'node scripts/check-preview.mjs')
})
test('preview check only reads canonical preview.300w.app health/news endpoints and accepts an empty feed',async()=>{
 const calls=[]
 const result=await checkPreview(async(url,options)=>{
  calls.push(url);assert.equal(options.method,'GET');assert.equal(options.redirect,'error')
  assert.ok(options.signal instanceof AbortSignal)
  assert.equal(options.body,undefined)
  assert.ok(['https://preview.300w.app/api/health','https://preview.300w.app/api/news'].includes(url))
  return Response.json(url.endsWith('/health')?{ok:true,service:'tri-app',version:'0.0.0',commit:'test-commit'}:{items:[]})
 })
 assert.equal(calls.length,2);assert.equal(new Set(calls).size,2)
 assert.equal(result.newsCount,0);assert.equal(result.health.commit,'test-commit')
})
test('preview check fails on HTTP errors, SPA HTML, invalid health and invalid News payloads',async()=>{
 const health={ok:true,service:'tri-app',version:'0.0.0',commit:'test-commit'}
 for(const broken of [()=>new Response('unavailable',{status:503}),()=>new Response('<html/>',{headers:{'Content-Type':'text/html'}}),()=>Response.json({})]){
  await assert.rejects(()=>checkPreview(async()=>broken()))
 }
 await assert.rejects(()=>checkPreview(async url=>Response.json(url.endsWith('/health')?health:{items:null})))
 await assert.rejects(()=>checkPreview(async()=>{throw Error('network unavailable')}))
})

const env={ASSETS:{fetch:async request=>new Response(`asset:${new URL(request.url).pathname}`)},DB:{},TELEGRAM_BOT_TOKEN:'do-not-expose',TURNSTILE_SECRET_KEY:'private-turnstile'}
const request=(path,method='GET')=>new Request('https://tri.example'+path,{method})
test('health returns only shared public metadata; no secrets, no database dependency',async()=>{
 const response=await worker.fetch(request('/api/health'),env)
 assert.equal(response.status,200)
 assert.deepEqual(await response.json(),{ok:true,service:'tri-app',...buildMetadata})
 assert.equal(response.headers.get('Cache-Control'),'no-store')
 assert.equal(response.headers.get('Access-Control-Allow-Origin'),null)
})
test('unknown API routes are JSON 404 even on browser navigation; safe 405 with Allow',async()=>{
 for(const path of ['/api','/api/missing','/api/missing-news','/api/missing-feedback']){
  const response=await worker.fetch(request(path),env)
  assert.equal(response.status,404);assert.equal((await response.json()).error.code,'NOT_FOUND')
 }
 for(const method of ['POST','PUT','DELETE','OPTIONS','HEAD']){
  const response=await worker.fetch(request('/api/health',method),env)
  assert.equal(response.status,405);assert.equal(response.headers.get('Allow'),'GET')
  assert.ok(!(await response.text()).includes('do-not-expose'))
 }
})
test('non-API paths go to ASSETS without being parsed as API',async()=>{
 for(const path of ['/','/assets/app.js','/athletes/test.png','/apiary','/index.html'])assert.equal(await (await worker.fetch(request(path),env)).text(),'asset:'+path)
})
test('metadata uses version and validated commit only; Git absence does not break development',()=>{
 const sha='a'.repeat(40)
 assert.deepEqual(resolveBuildMetadata('0.0.0',{},()=>{throw Error('no git')}),{version:'0.0.0',commit:'unknown'})
 assert.equal(resolveBuildMetadata('1.0.0',{BUILD_COMMIT:sha},()=>{throw Error()}).commit,sha)
 assert.equal(resolveBuildMetadata('1.0.0',{BUILD_COMMIT:'secret-token',TELEGRAM_BOT_TOKEN:'private'},()=>sha).commit,sha)
 assert.equal(resolveBuildMetadata('1.0.0',{CF_WORKERS_BUILD_COMMIT:sha}).commit,sha)
})
test('D1 migration applies to SQLite; constraints, edit/deduplication and retry/feed indexes work',async()=>{
 const sql=await fs.readFile('migrations/0001_feedback_news.sql','utf8')
 const python=spawnSync('python3',['-c',`
import sqlite3,sys
c=sqlite3.connect(':memory:'); c.executescript(sys.stdin.read())
assert {'feedback','news'} <= {r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'")}
assert {'feedback_retry','feedback_created_at','news_feed'} <= {r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='index'")}
cols={r[1] for r in c.execute('PRAGMA table_info(feedback)')}; assert not any('ip'==v or v.endswith('_ip') for v in cols)
def bad(sql,args=()):
 try: c.execute(sql,args)
 except sqlite3.IntegrityError: return
 raise AssertionError('Constraint not enforced: '+sql)
insert="INSERT INTO feedback(id,created_at,category,description,screen,route,build_version,build_commit) VALUES(?,?,?,?,?,?,?,?)"
row=('report-1','2026-09-27T12:00:00Z','app','A real test description','more','#/more','0.0.0','unknown')
c.execute(insert,row); bad(insert,row)
for category,description in [('invalid','long enough message'),('app','short'),('app','x'*4001)]: bad(insert,('other-id',row[1],category,description,*row[4:]))
bad("UPDATE feedback SET delivery_attempts=-1"); bad("UPDATE feedback SET delivery_status='unknown'"); bad("UPDATE feedback SET viewport='not JSON'")
c.execute("UPDATE feedback SET delivery_attempts=1,delivery_status='failed',next_delivery_at='2026-09-27T13:00:00Z'")
assert c.execute('SELECT delivery_attempts FROM feedback').fetchone()[0]==1
news="INSERT INTO news(id,channel_id,message_id,published_at,updated_at,title,excerpt,telegram_url,created_at) VALUES(?,?,?,?,?,?,?,?,?)"
n=('post-1','channel-1',1,row[1],row[1],'Title','Excerpt','https://t.me/trista_watt/1',row[1])
c.execute(news,n); bad(news,('different-id',*n[1:])); bad("UPDATE news SET hidden=2")
c.execute("UPDATE news SET title='Edited' WHERE channel_id=? AND message_id=?",('channel-1',1))
assert c.execute('SELECT title FROM news').fetchone()[0]=='Edited'
c.execute(news,('post-2','channel-1',2,'2026-09-28T12:00:00Z',*n[4:]))
assert c.execute('SELECT id FROM news WHERE hidden=0 ORDER BY published_at DESC,message_id DESC LIMIT 1').fetchone()[0]=='post-2'
print('schema/constraints passed')
`],{input:sql,encoding:'utf8'})
 assert.equal(python.status,0,python.stderr)
})


test('production D1 is isolated; preview and default bindings/config stay intact',async()=>{
 const config=JSON.parse(await fs.readFile('wrangler.jsonc','utf8'))
 assert.deepEqual(config.env.production,{
  main:'worker/index.ts',name:'tri-app',workers_dev:true,
  d1_databases:[{binding:'DB',database_name:'tri-app-production',database_id:'2b5cd1b9-d9bf-483d-b710-23d00b6db7fd',migrations_dir:'migrations'}],
 }) // Exact allowlist: no copied preview vars, secret values or fabricated bindings.
 assert.deepEqual(config.env.preview,{
  main:'worker/index.ts',name:'tri-app-preview',workers_dev:true,
  vars:{TURNSTILE_SITE_KEY:'0x4AAAAAAFLWMQLuWNz_aJ5j',ALLOWED_ORIGIN:'https://preview.300w.app'},
  ratelimits:[{name:'FEEDBACK_RATE_LIMITER',namespace_id:'30001',simple:{limit:5,period:60}}],
  triggers:{crons:['*/5 * * * *']},
  d1_databases:[{binding:'DB',database_name:'tri-app-preview',database_id:'4dfe9210-0cc7-484f-8eea-fe5216f5c17a',migrations_dir:'migrations'}],
 })
 assert.deepEqual(config.d1_databases,[{binding:'DB',database_name:'tri-app-local',database_id:'00000000-0000-0000-0000-000000000000',migrations_dir:'migrations'}])
 assert.notEqual(config.env.production.d1_databases[0].database_id,config.env.preview.d1_databases[0].database_id)
})

test('production checker uses only canonical GET endpoints and verifies expected SHA',async()=>{
 const expected='a'.repeat(40), calls=[]
 const result=await checkProduction(async(url,options)=>{
  calls.push(url)
  assert.equal(options.method,'GET');assert.equal(options.redirect,'error');assert.equal(options.body,undefined)
  assert.ok(options.signal instanceof AbortSignal)
  return Response.json(url.endsWith('/health')?{ok:true,service:'tri-app',version:'0.0.0',commit:expected}:{items:[]})
 },expected)
 assert.deepEqual(calls.sort(),['https://300w.app/api/health','https://300w.app/api/news'])
 assert.equal(result.health.commit,expected);assert.equal(result.newsCount,0)
})

test('production checker fails without fallback on network/redirect/HTTP/schema/SHA failure',async()=>{
 const expected='a'.repeat(40)
 for(const kind of ['network','redirect','http','html','health','news','unknown-sha','wrong-sha']){
  const calls=[]
  await assert.rejects(()=>checkProduction(async(url,options)=>{
   calls.push(url);assert.equal(options.redirect,'error')
   if(kind==='network' || kind==='redirect')throw new TypeError('fetch failed')
   if(kind==='http')return new Response('unavailable',{status:503})
   if(kind==='html')return new Response('<html/>',{headers:{'Content-Type':'text/html'}})
   const health={ok:kind!=='health',service:'tri-app',version:'0.0.0',commit:kind==='unknown-sha'?'unknown':kind==='wrong-sha'?'b'.repeat(40):expected}
   return Response.json(url.endsWith('/health')?health:{items:kind==='news'?null:[]})
  },expected))
  assert.deepEqual(calls.sort(),['https://300w.app/api/health','https://300w.app/api/news'])
 }
 let requested=false
 await assert.rejects(()=>checkProduction(async()=>{requested=true},'invalid'))
 assert.equal(requested,false)
})

test('production checker rejects ambiguous CLI arguments before any network request',()=>{
 const expected='a'.repeat(40)
 assert.equal(productionCheckArgs(['--expected-sha',expected]),expected)
 for(const args of [['--expected-sha'],['--expected-sha','unknown'],['--url','https://preview.300w.app'],['--expected-sha',expected,'--expected-sha',expected]]){
  assert.throws(()=>productionCheckArgs(args),/Usage/)
 }
})
