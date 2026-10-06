import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import worker from '../worker/index.ts'
import localWorker from '../worker/local.ts'
import { acceptFeedback } from '../worker/feedback/handler.ts'
import { retryFeedback, telegramDelivery, telegramText } from '../worker/feedback/delivery.ts'
import { genericFeedbackContext, formErrors } from '../shared/feedback.ts'
import { sendFeedback } from '../src/api/feedback.ts'

// Execute the actual production SQL/constraints against SQLite, not a map that
// merely imitates INSERTs. Each call is a committed connection like D1 autocommit.
function database(t) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tri-feedback-')), file=path.join(dir,'db.sqlite')
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}))
 const run=(sql,params=[],mode='all')=>{
  const r=spawnSync('python3',['-c',`import sqlite3,json,sys
p=json.load(sys.stdin); c=sqlite3.connect(p['file']); c.row_factory=sqlite3.Row
if p['mode']=='script': c.executescript(p['sql']); rows=[]
else: rows=[dict(r) for r in c.execute(p['sql'],p['params']).fetchall()]
c.commit(); print(json.dumps(rows))`,],{input:JSON.stringify({file,sql,params,mode}),encoding:'utf8'})
  if(r.status!==0)throw Error('SQL test failed: '+r.stderr)
  return JSON.parse(r.stdout)
 }
 for(const name of ['0001_feedback_news.sql','0002_feedback_delivery.sql'])run(fs.readFileSync('migrations/'+name,'utf8'),[],'script')
 return {run,prepare(sql){let params=[];return {bind(...v){params=v;return this},async first(){return run(sql,params)[0]??null},async all(){return {results:run(sql,params)}},async run(){run(sql,params);return {success:true}}}}}
}
const payload=()=>({requestId:crypto.randomUUID(),category:'app',description:'Проверка отправки обращения',contactEmail:'test@example.com',context:genericFeedbackContext,build:{version:'0.0.0',commit:'unknown'},viewport:{width:390,height:844},clientInfo:'Test browser',turnstileToken:'local-feedback',website:''})
const request=(p,origin='http://localhost:8787')=>new Request(origin+'/api/feedback',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,'CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify(p)})
const local={local:true,deliver:async()=>{}}
const configured=db=>({DB:db,ALLOWED_ORIGIN:'https://tri.example',TURNSTILE_SECRET_KEY:'test-secret',TURNSTILE_SITE_KEY:'test-site',RATE_LIMIT_HMAC_SECRET:'test-hmac',FEEDBACK_RATE_LIMITER:{limit:async()=>({success:true})}})

test('valid report durably saved before Telegram; delivery marked sent, no extra fields or raw IP',async t=>{
 const db=database(t),p=payload();p.untrusted={rawIp:'bad'};p.context.extra='ignored'
 const r=await acceptFeedback(request(p),{DB:db},{local:true,deliver:async row=>{assert.equal(db.run('SELECT count(*) n FROM feedback')[0].n,1);assert.equal(row.description,p.description)}})
 assert.equal(r.status,201);assert.deepEqual(await r.json(),{ok:true,reportId:p.requestId})
 const row=db.run('SELECT * FROM feedback')[0];assert.equal(row.delivery_status,'sent');assert.equal(row.delivery_attempts,1)
 assert.ok(!JSON.stringify(row).includes('192.0.2.1'));assert.ok(!JSON.stringify(row).includes('untrusted'));assert.ok(!JSON.stringify(row).includes('local-feedback'))
})
test('server validation: category, lengths, email, context, type and honeypot',async t=>{
 const db=database(t)
 for(const override of [{category:'invalid'},{category:'toString'},{description:'short'},{description:'x'.repeat(4001)},{contactEmail:'invalid'},{contactEmail:'a'.repeat(255)},{requestId:'bad'},{website:'spam'},{viewport:{width:0,height:10}},{context:{...genericFeedbackContext,route:'#/more?secret=yes'}},{clientInfo:42}]){
  const r=await acceptFeedback(request({...payload(),...override}),{DB:db},local);assert.equal(r.status,400,JSON.stringify(override))
 }
 assert.equal(db.run('SELECT count(*) n FROM feedback')[0].n,0)
})
test('streamed oversized JSON is bounded without trusting Content-Length',async t=>{
 const db=database(t);assert.equal((await acceptFeedback(request({...payload(),ignored:'x'.repeat(17000)}),{DB:db},local)).status,413)
 assert.equal(db.run('SELECT count(*) n FROM feedback')[0].n,0)
})
test('production fails closed; env bypass flags and remote local entry cannot enable bypass',async t=>{
 const db=database(t),p=payload()
 assert.equal((await worker.fetch(request(p,'https://tri.example'),{DB:db,LOCAL:true,TEST:true})).status,503)
 assert.equal((await localWorker.fetch(request(p,'https://tri.example'),{DB:db})).status,503)
 assert.equal((await acceptFeedback(request(p,'https://tri.example'),configured(db),{local:true})).status,503)
})
test('production Turnstile checks token, hostname and action; origin checked; rate limit hashes IP',async t=>{
 const db=database(t),env=configured(db);let seen
 env.FEEDBACK_RATE_LIMITER={limit:async({key})=>{seen=key;return {success:true}}}
 const send=(p,answer)=>acceptFeedback(request(p,'https://tri.example'),env,{deliver:async()=>{},fetcher:async()=>Response.json(answer)})
 assert.equal((await send({...payload(),turnstileToken:''},{success:true})).status,400)
 for(const answer of [{success:false},{success:true,hostname:'evil.example',action:'feedback'},{success:true,hostname:'tri.example',action:'other'}])assert.equal((await send(payload(),answer)).status,400)
 assert.match(seen,/^[0-9a-f]{64}$/)
 assert.equal((await send(payload(),{success:true,hostname:'tri.example',action:'feedback'})).status,201)
 assert.equal((await acceptFeedback(request(payload(),'https://evil.example'),env)).status,403)
 env.FEEDBACK_RATE_LIMITER={limit:async()=>({success:false})}
 const limited=await send(payload(),{});assert.equal(limited.status,429);assert.equal(limited.headers.get('Retry-After'),'60')
})
test('idempotency replay acknowledges same ID; different body conflicts; notification only once',async t=>{
 const db=database(t),p=payload();let sends=0;const opts={local:true,deliver:async()=>{sends++}}
 assert.equal((await acceptFeedback(request(p),{DB:db},opts)).status,201)
 const duplicate=await acceptFeedback(request({...p,turnstileToken:'expired'}),{DB:db},opts)
 assert.equal(duplicate.status,409);assert.deepEqual(await duplicate.json(),{ok:true,reportId:p.requestId})
 const conflict=await acceptFeedback(request({...p,description:'Different report content'}),{DB:db},opts)
 assert.equal(conflict.status,409);assert.equal((await conflict.json()).error.code,'IDEMPOTENCY_CONFLICT')
 assert.equal(sends,1);assert.equal(db.run('SELECT count(*) n FROM feedback')[0].n,1)
})
test('D1 failure returns safe error; Telegram failure cannot lose saved report; retry succeeds once',async t=>{
 let sends=0
 assert.equal((await acceptFeedback(request(payload()),{DB:{prepare(){throw Error('private DB detail')}}},{local:true,deliver:async()=>{sends++}})).status,503)
 assert.equal(sends,0)
 const db=database(t),p=payload()
 assert.equal((await acceptFeedback(request(p),{DB:db},{local:true,deliver:async()=>{throw Error('provider secret')}})).status,201)
 let row=db.run('SELECT * FROM feedback')[0];assert.equal(row.delivery_status,'failed');assert.equal(row.delivery_attempts,1);assert.ok(row.last_delivery_at)
 const future=new Date(Date.now()+3600000)
 await retryFeedback(db,async()=>{sends++},future);await retryFeedback(db,async()=>{sends++},future)
 row=db.run('SELECT * FROM feedback')[0];assert.equal(row.delivery_status,'sent');assert.equal(row.delivery_attempts,2);assert.equal(sends,1)
})
test('retry bounded to five attempts, protects concurrent leases and skips delivered',async t=>{
 const db=database(t),p=payload()
 await acceptFeedback(request(p),{DB:db},{local:true,deliver:async()=>{throw Error()}})
 for(let i=1;i<8;i++) await retryFeedback(db,async()=>{throw Error()},new Date(Date.now()+i*86400000))
 assert.equal(db.run('SELECT delivery_attempts n FROM feedback')[0].n,5)
 const p2=payload();await acceptFeedback(request(p2),{DB:db},local)
 db.run("UPDATE feedback SET delivery_status='pending', next_delivery_at=? WHERE id=?",[new Date(Date.now()+60000).toISOString(),p2.requestId])
 let sent=0;await retryFeedback(db,async()=>{sent++});assert.equal(sent,0)
})
test('Telegram uses plain text, bounded text, no parse_mode or client info; failures are generic',async()=>{
 const row={id:crypto.randomUUID(),category:'app',description:'<b>hello</b>'.repeat(400),contact_email:'reply@example.com',athlete_name:'A'.repeat(300),race_name:'R'.repeat(300),active_gender:'M',build_version:'1',build_commit:'unknown'}
 assert.ok(telegramText(row).length<4096)
 let sent
 await telegramDelivery({TELEGRAM_BOT_TOKEN:'fake',FEEDBACK_TELEGRAM_CHAT_ID:'fake'},async(_url,options)=>{sent=JSON.parse(options.body);return Response.json({ok:true})})(row)
 assert.equal(sent.parse_mode,undefined);assert.ok(sent.text.includes('<b>'));assert.equal(sent.clientInfo,undefined)
 assert.equal(sent.text.split('\n\n')[0],'300W⚡ · Новый report · ⚠️ ENV UNKNOWN')
 await assert.rejects(telegramDelivery({},async()=>{throw Error()})(row),/DELIVERY_UNCONFIGURED/)
 await assert.rejects(telegramDelivery({TELEGRAM_BOT_TOKEN:'fake',FEEDBACK_TELEGRAM_CHAT_ID:'fake'},async()=>Response.json({ok:false}))(row),/DELIVERY_FAILED/)
})
test('privacy: non-app category discards browser info and failure paths log no payloads',async t=>{
 const db=database(t),p={...payload(),category:'other'};const captured=[]
 const originals={...console};for(const name of ['log','error','warn','info'])console[name]=(...args)=>captured.push(args)
 try { await acceptFeedback(request(p),{DB:db},{local:true,deliver:async()=>{throw Error(p.description+p.contactEmail)}}) }
 finally {for(const name of ['log','error','warn','info'])console[name]=originals[name]}
 assert.equal(db.run('SELECT client_info FROM feedback')[0].client_info,null);assert.deepEqual(captured,[])
})
test('form validation and typed API response semantics (201,409,400,429,500,network)',async()=>{
 assert.deepEqual(formErrors('app','valid description',''),{})
 assert.ok(formErrors('bad','short','bad').category);assert.ok(formErrors('app','x'.repeat(4001),'bad').description)
 const p=payload()
 for(const status of [201,409])assert.equal(await sendFeedback(p,async()=>Response.json({ok:true,reportId:p.requestId},{status})),p.requestId)
 for(const status of [400,409,429,500])await assert.rejects(sendFeedback(p,async()=>Response.json({ok:false},{status})))
 await assert.rejects(sendFeedback(p,async()=>{throw Error('private raw error')}),e=>!e.message.includes('private raw error'))
})
test('deployment config uses protected entry points; foundation migration remains unchanged',()=>{
 const config=JSON.parse(fs.readFileSync('wrangler.jsonc','utf8'))
 assert.equal(config.main,'worker/local.ts')
 for(const name of ['preview','production'])assert.equal(config.env[name].main,'worker/index.ts')
 const original=spawnSync('git',['show','b511238210cba253bd4b90b6b9fdf8b2b2611a9d:migrations/0001_feedback_news.sql'],{encoding:'utf8'})
 assert.equal(fs.readFileSync('migrations/0001_feedback_news.sql','utf8'),original.stdout)
})
test('concurrent insert collision returns existing report; no duplicate delivery',async t=>{
 const db=database(t),p=payload();let deliveries=0
 const reports=await Promise.all([acceptFeedback(request(p),{DB:db},{local:true,deliver:async()=>{deliveries++}}),acceptFeedback(request(p),{DB:db},{local:true,deliver:async()=>{deliveries++}})])
 assert.deepEqual(reports.map(r=>r.status).sort(),[201,409]);assert.equal(deliveries,1);assert.equal(db.run('SELECT count(*) n FROM feedback')[0].n,1)
})
test('retry batch is limited and scheduled handler uses the same delivery path',async t=>{
 const db=database(t)
 for(let i=0;i<12;i++) db.run(`INSERT INTO feedback(id,created_at,category,description,screen,route,build_version,build_commit) VALUES(?,?,'app','A pending feedback report','more','#/more','0','unknown')`,[crypto.randomUUID(),new Date().toISOString()])
 await localWorker.scheduled({}, {DB:db})
 assert.equal(db.run("SELECT count(*) n FROM feedback WHERE delivery_status='sent'")[0].n,10)
 assert.equal(db.run("SELECT count(*) n FROM feedback WHERE delivery_status='pending'")[0].n,2)
})


test('explicit Feedback environment changes only heading; unknown never becomes production',async()=>{
 const row={id:'report-id',category:'other',description:'Unchanged report body',contact_email:'reply@example.com',athlete_name:'Athlete',race_name:'Race',active_gender:'W',build_version:'1',build_commit:'test'}
 const body=['#report-id','Другое','Атлет: Athlete','Гонка: Race','WOMEN','Сообщение:','Unchanged report body','Контакт: reply@example.com','Build: 1 / test'].join('\n\n')
 for(const [APP_ENV,marker] of [['preview','🧪 PREVIEW'],['production','🟢 PRODUCTION'],[undefined,'⚠️ ENV UNKNOWN'],['','⚠️ ENV UNKNOWN'],['PRODUCTION','⚠️ ENV UNKNOWN'],['other','⚠️ ENV UNKNOWN']]){
  let sent
  await telegramDelivery({APP_ENV,TELEGRAM_BOT_TOKEN:'fake',FEEDBACK_TELEGRAM_CHAT_ID:'shared-test-group'},async(_url,options)=>{sent=JSON.parse(options.body);return Response.json({ok:true})})(row)
  assert.equal(sent.text,`300W⚡ · Новый report · ${marker}\n\n${body}`)
  assert.equal(sent.chat_id,'shared-test-group')
 }
})
test('initial delivery and scheduled retry preserve explicit environment heading',async t=>{
 const originalFetch=globalThis.fetch
 t.after(()=>{globalThis.fetch=originalFetch})
 for(const APP_ENV of ['preview','production']){
  const db=database(t),messages=[]
  globalThis.fetch=async(_url,options)=>{messages.push(JSON.parse(options.body).text);return Response.json({ok:messages.length>1})}
  const env={DB:db,APP_ENV,TELEGRAM_BOT_TOKEN:'fake',FEEDBACK_TELEGRAM_CHAT_ID:'shared-test-group'}
  assert.equal((await acceptFeedback(request(payload()),env,{local:true})).status,201)
  db.run('UPDATE feedback SET next_delivery_at=NULL')
  await worker.scheduled({},env)
  assert.equal(messages.length,2);assert.equal(messages[0],messages[1])
  assert.equal(messages[0].split('\n\n')[0],`300W⚡ · Новый report · ${APP_ENV==='preview'?'🧪 PREVIEW':'🟢 PRODUCTION'}`)
  assert.equal(db.run('SELECT delivery_status FROM feedback')[0].delivery_status,'sent')
 }
})
