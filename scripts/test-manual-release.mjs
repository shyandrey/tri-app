import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {options,assertSource,assertBaseline,uploadArgs,uploadOnce,readiness,jsonGet} from './manual-release.mjs'
import {ACCOUNT,releaseConfig,verifyArtifact,inventory,sha256} from './manual-release-artifact.mjs'
const sha='a'.repeat(40),old='b'.repeat(40),digest='c'.repeat(64)
const source=JSON.parse(await fs.readFile('wrangler.jsonc'))
const args=['--sha',sha,'--env','production','--package','/tmp/package','--evidence','/tmp/evidence','--digest',digest]
for(const [key,value] of [['--sha','HEAD'],['--sha','abc'],['--env','prod'],['--env',''],['--digest','bad']])test('reject '+key+' '+JSON.stringify(value),()=>{const a=[...args];a[a.indexOf(key)+1]=value;assert.throws(()=>options(['preflight',...a]))})
test('explicit authorization required',()=>{assert.throws(()=>options(['deploy',...args]));assert.throws(()=>options(['deploy',...args,'--authorize','preview:'+sha]));assert.equal(options(['deploy',...args,'--authorize','production:'+sha]).sha,sha)})
test('HEAD and dirty guards',()=>{assertSource(sha,sha,'',{});assert.throws(()=>assertSource(sha,old,'',{}));assert.throws(()=>assertSource(sha,sha,'?? rogue',{}));assert.throws(()=>assertSource(sha,sha,'',{BUILD_COMMIT:sha}))})
for(const env of ['production','preview'])test(env+' target and route guards',()=>{const c=releaseConfig(source,env);assert.equal(c.account_id,ACCOUNT);assert.ok(!c.build);for(const key of ['name','d1_databases','ratelimits']){const s=structuredClone(source);s.env[env][key]=key==='name'?'wrong':[];assert.throws(()=>releaseConfig(s,env))}const s=structuredClone(source);s.env[env].routes=[];assert.throws(()=>releaseConfig(s,env))})
const config=releaseConfig(source,'production')
const secretNames=['PUBLIC_TELEGRAM_BOT_TOKEN','PUBLIC_TELEGRAM_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TURNSTILE_SECRET_KEY','RATE_LIMIT_HMAC_SECRET','FEEDBACK_TELEGRAM_CHAT_ID','NEWS_TELEGRAM_CHANNEL_ID']
const bindings=[...secretNames.map(name=>({name,type:'secret_text'})),...Object.entries(config.vars).map(([name,text])=>({name,text,type:'plain_text'})),{name:'ASSETS',type:'assets'},{name:'DB',type:'d1',id:config.d1_databases[0].database_id},{name:'FEEDBACK_RATE_LIMITER',type:'ratelimit',namespace_id:'40001',simple:{limit:5,period:60}}]
const versionId='11111111-1111-1111-1111-111111111111'
const baseline={account:ACCOUNT,worker:'tri-app',health:{ok:true,service:'tri-app',commit:old,version:'1.0.0'},settings:{compatibility_date:config.compatibility_date,bindings},schedules:[{cron:'*/5 * * * *'}],deployment:{id:versionId,versions:[{version_id:versionId,percentage:100}]},version:{id:versionId,resources:{script_runtime:{compatibility_date:config.compatibility_date},bindings}}}
test('compatible rollback baseline',()=>assertBaseline(structuredClone(baseline),config))
for(const change of [b=>b.account='wrong',b=>b.worker='tri-app-preview',b=>b.settings.bindings.pop(),b=>b.schedules=[],b=>b.deployment.versions[0].percentage=50,b=>b.health.commit='unknown',b=>b.version.id='wrong'])test('baseline drift fails closed '+change.toString(),()=>{const b=structuredClone(baseline);change(b);assert.throws(()=>assertBaseline(b,config))})
test('artifact bytes, environment and file inventory guarded',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'manual-artifact-test-'))
 try{await fs.mkdir(path.join(root,'worker'));await fs.mkdir(path.join(root,'dist'));await fs.writeFile(path.join(root,'worker/index.js'),'worker');await fs.writeFile(path.join(root,'dist/index.html'),'html');await fs.writeFile(path.join(root,'wrangler.json'),JSON.stringify(config))
 await fs.writeFile(path.join(root,'dist/season.json'),JSON.stringify({profile:'production',primarySeason:2026}))
 const m={season:{profile:'production',primarySeason:2026},sha,worker:'tri-app',environment:'production',version:JSON.parse(await fs.readFile('package.json')).version,lockHash:sha256(await fs.readFile('package-lock.json')),files:await inventory(root)}
 const bytes=JSON.stringify(m);await fs.writeFile(path.join(root,'manifest.json'),bytes);const d=sha256(bytes)
 await verifyArtifact(root,sha,d,source,'production')
 await assert.rejects(verifyArtifact(root,sha,digest,source,'production'))
 await assert.rejects(verifyArtifact(root,sha,d,source,'preview'))
 await fs.writeFile(path.join(root,'dist/index.html'),'tampered');await assert.rejects(verifyArtifact(root,sha,d,source,'production'))
 }finally{await fs.rm(root,{recursive:true,force:true})}
})
test('one failed upload; no retry, rollback or build',async()=>{
 const evidence=await fs.mkdtemp(path.join(os.tmpdir(),'manual-upload-test-'));let calls=0
 try{const o={sha,env:'production',digest,evidence,authorize:'production:'+sha}
 assert.deepEqual(uploadArgs('/tmp/config'),['node_modules/wrangler/bin/wrangler.js','deploy','--config','/tmp/config','--no-bundle'])
 await assert.rejects(uploadOnce(o,'/tmp/config',()=>{calls++;throw Error('upload failed')}))
 await assert.rejects(uploadOnce(o,'/tmp/config',()=>calls++));assert.equal(calls,1)
 await assert.rejects(uploadOnce({...o,authorize:undefined},'/tmp/config',()=>calls++));assert.equal(calls,1)
 }finally{await fs.rm(evidence,{recursive:true,force:true})}
})
const health=(commit,version)=>({ok:true,service:'tri-app',commit,version})
async function simulate(sequence,version='1.0.1') {let time=0,i=0;return readiness({sha,version,previous:health(old,'1.0.0'),read:async()=>{const v=sequence[Math.min(i++,sequence.length-1)];if(v instanceof Error)throw v;return v},now:()=>time,sleep:async n=>{time+=n},log:()=>{},timeout:6000})}
test('previous then two targets',()=>simulate([health(old,'1.0.0'),health(sha,'1.0.1'),health(sha,'1.0.1')]))
test('same version transition supported',()=>simulate([health(old,'1.0.0'),health(sha,'1.0.0'),health(sha,'1.0.0')],'1.0.0'))
for(const [name,seq] of [['timeout',[health(old,'1.0.0')]],['mismatch',[health(sha,'1.0.0')]],['unknown',[health('d'.repeat(40),'1.0.1')]],['malformed',[null]],['network',[new Error('HTTP/network')]],['not consecutive',[health(sha,'1.0.1'),health(old,'1.0.0'),health(sha,'1.0.1')]]])test('readiness rejects '+name,()=>assert.rejects(simulate(seq)))

test('read-only transport bounded; HTTP/auth/JSON/network errors are not PASS',async()=>{
 let calls=0
 const mock=async(url,opts)=>{calls++;assert.equal(opts.method,'GET');assert.equal(opts.redirect,'error');assert.ok(opts.signal);return {status:200,json:async()=>({ok:true})}}
 assert.deepEqual(await jsonGet('https://example.test',{},mock),{ok:true});assert.equal(calls,1)
 for(const status of [401,403,500])await assert.rejects(jsonGet('https://example.test',{},async()=>({status})))
 await assert.rejects(jsonGet('https://example.test',{},async()=>({status:200,json:async()=>{throw Error('invalid JSON')}})))
 await assert.rejects(jsonGet('https://example.test',{},async()=>{throw Error('network')}))
})
test('configured account cannot be silently overridden',()=>{const s=structuredClone(source);s.env.production.account_id='other';assert.throws(()=>releaseConfig(s,'production'))})

// Exercise installed Wrangler with a fake credential, not a mock of its logger.
test('credential subprocess cannot persist token despite inherited log settings',async()=>{
 const {spawnSync}=await import('node:child_process')
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'manual-auth-security-'))
 const marker='SYNTHETIC_NOT_A_REAL_TOKEN_POSTDEVOPS01C'
 try {
  const moduleUrl=new URL('./manual-release.mjs',import.meta.url).href
  const code=`import {cfHeaders} from ${JSON.stringify(moduleUrl)};const h=cfHeaders();if(!h.Authorization)process.exit(2)`
  const r=spawnSync(process.execPath,['--input-type=module','-e',code],{encoding:'utf8',env:{...process.env,CLOUDFLARE_API_TOKEN:marker,WRANGLER_WRITE_LOGS:'true',WRANGLER_SEND_METRICS:'true',WRANGLER_LOG_PATH:path.join(root,'credential.log')},timeout:30000})
  assert.equal(r.status,0,'Synthetic auth helper must succeed')
  assert.equal(r.stdout,'');assert.equal(r.stderr,'')
  assert.deepEqual(await fs.readdir(root),[],'Credential-bearing subprocess wrote disk logs')
 }finally{await fs.rm(root,{recursive:true,force:true})}
})
test('credential errors and malformed output are sanitized, without cause/evidence leakage',async()=>{
 const {cfHeaders,command}=await import('./manual-release.mjs')
 const marker='SYNTHETIC_SECRET_ERROR'
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'manual-auth-error-'))
 try {
  for(const run of [()=>{throw Error(marker)},()=>marker,()=>JSON.stringify({type:'oauth',token:''}),()=>JSON.stringify({type:'api_key',key:marker})]){
   let error;try{cfHeaders(run)}catch(e){error=e}
   assert.ok(error);assert.equal(error.cause,undefined);assert.ok(!error.stack.includes(marker))
   await fs.writeFile(path.join(root,'failure.json'),JSON.stringify({error:error.message}))
   assert.ok(!(await fs.readFile(path.join(root,'failure.json'),'utf8')).includes(marker))
  }
  assert.throws(()=>command(process.execPath,['-e',`console.log('${marker}');console.error('${marker}');process.exit(1)`],{secret:true}),e=>!e.message.includes(marker))
 }finally{await fs.rm(root,{recursive:true,force:true})}
})
test('qualification accepts current pair but cannot authorize upload or supply release evidence',async()=>{
 const {assertPreflightMode,assertReleaseEvidence}=await import('./manual-release.mjs')
 const h=health(sha,'1.0.1')
 assertPreflightMode('qualify',h,sha,'1.0.1')
 assert.throws(()=>assertPreflightMode('qualify',h,old,'1.0.1'))
 assert.throws(()=>assertPreflightMode('qualify',h,sha,'1.0.0'))
 for(const action of ['preflight','deploy'])assert.throws(()=>assertPreflightMode(action,h,sha,'1.0.1'))
 assert.throws(()=>options(['qualify',...args,'--authorize','production:'+sha]))
 const o=options(['qualify',...args]);assert.equal(o.authorize,undefined)
 assert.throws(()=>assertReleaseEvidence({purpose:'read-only-qualification',releaseSha:sha,manifestDigest:digest,environment:'production'},o))
 assertReleaseEvidence({purpose:'release-preflight',releaseSha:sha,manifestDigest:digest,environment:'production'},o)
})
