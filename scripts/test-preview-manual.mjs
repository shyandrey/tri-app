import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {assertManualContext,verifyManualSource,assertManualBaseline,sameCommitDecision} from './preview-manual-preflight.mjs'
import {assertDeployContext} from './deploy-preview-artifact.mjs'
const sha='a'.repeat(40), id='11111111-1111-1111-1111-111111111111'
const env={GITHUB_REPOSITORY:'shyandrey/tri-app',GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_REF:'refs/heads/preview',GITHUB_SHA:sha,MANUAL_PREVIEW_MODE:'true',MANUAL_PREVIEW_CONFIRM:'deploy-preview',MANUAL_PREVIEW_SHA:sha,MANUAL_CI_RUN_ID:'12',MANUAL_ARTIFACT_ID:'34',MANIFEST_DIGEST:'b'.repeat(64),MANUAL_ROLLBACK_DEPLOYMENT_ID:id,CLOUDFLARE_ACCOUNT_ID:'c'.repeat(32),CLOUDFLARE_API_TOKEN:'fake',GH_READ_TOKEN:'fake'}
const baseline=()=>({id,versions:[{version_id:id,percentage:100}]})
const domains=()=>[{id:'domain-id',hostname:'preview.300w.app',service:'tri-app-preview',enabled:true}]
const run=()=>({id:12,repository:{full_name:'shyandrey/tri-app'},head_sha:sha,head_branch:'preview',event:'push',path:'.github/workflows/preview-ci.yml',status:'completed',conclusion:'success',run_attempt:1})
const artifact=()=>({id:34,expired:false,expires_at:'2099-01-01T00:00:00Z',workflow_run:{id:12,head_sha:sha},name:`preview-package-${sha}-12-1`,digest:'sha256:'+'d'.repeat(64)})
function mock(change=()=>{}){return async url=>{let value=url.includes('/git/ref/')?{object:{sha}}:url.includes('/jobs?')?{total_count:2,jobs:[{name:'Portable verification',conclusion:'success'},{name:'Browser verification',conclusion:'success'}]}:url.includes('/artifacts/')?artifact():run();change(value,url);return new Response(JSON.stringify(value))}}
test('Manual context accepted without permanent activation',()=>assertDeployContext(env))
for(const [key,value] of [['GITHUB_EVENT_NAME','push'],['GITHUB_EVENT_NAME','pull_request'],['GITHUB_REF','refs/heads/main'],['GITHUB_SHA','b'.repeat(40)],['MANUAL_PREVIEW_CONFIRM',''],['PREVIEW_AUTO_DEPLOY_ENABLED','true'],['MANUAL_ARTIFACT_ID','34,35'],['MANIFEST_DIGEST','bad'],['MANUAL_ROLLBACK_DEPLOYMENT_ID','']])test('Reject '+key+'='+value,()=>assert.throws(()=>assertManualContext({...env,[key]:value})))
test('Successful CI and exact immutable artifact accepted',async()=>{const r=await verifyManualSource(env,mock());assert.equal(r.applicationSha,sha)})
for(const [label,change] of [
 ['stale branch',(v,u)=>{if(u.includes('/git/ref/'))v.object.sha='b'.repeat(40)}],
 ['failed CI',(v,u)=>{if(u.endsWith('/runs/12'))v.conclusion='failure'}],
 ['different workflow',(v,u)=>{if(u.endsWith('/runs/12'))v.path='other.yml'}],
 ['failed browser',(v,u)=>{if(u.includes('/jobs?'))v.jobs[1].conclusion='failure'}],
 ['expired artifact',(v,u)=>{if(u.includes('/artifacts/'))v.expired=true}],
 ['different source run',(v,u)=>{if(u.includes('/artifacts/'))v.workflow_run.id=13}],
 ['different source SHA',(v,u)=>{if(u.includes('/artifacts/'))v.workflow_run.head_sha='b'.repeat(40)}],
 ['wrong attempt',(v,u)=>{if(u.includes('/artifacts/'))v.name='wrong-attempt'}],
 ['incomplete jobs',(v,u)=>{if(u.includes('/jobs?'))v.total_count=3}]
])test('Reject '+label,async()=>assert.rejects(verifyManualSource(env,mock(change))))
test('GitHub permission failure stops',async()=>assert.rejects(verifyManualSource(env,async()=>new Response('{}',{status:403}))))
test('Valid rollback/domain accepted',()=>assertManualBaseline(baseline(),domains(),id))
for(const [name,fn] of [['missing rollback',()=>assertManualBaseline(null,domains(),id)],['changed deployment',()=>assertManualBaseline({...baseline(),id:'changed'},domains(),id)],['split traffic',()=>assertManualBaseline({...baseline(),versions:[]},domains(),id)],['wrong domain Worker',()=>assertManualBaseline(baseline(),[{...domains()[0],service:'tri-app'}],id)],['disabled domain',()=>assertManualBaseline(baseline(),[{...domains()[0],enabled:false}],id)]])test('Reject '+name,()=>assert.throws(fn))
test('Same SHA stops upload, other valid SHA permits further checks',()=>{const h={ok:true,service:'tri-app',commit:sha};assert.equal(sameCommitDecision(h,sha),'STOP_ALREADY_PRESENT');assert.equal(sameCommitDecision({...h,commit:'b'.repeat(40)},sha),'UPLOAD_ALLOWED');assert.throws(()=>sameCommitDecision({},sha))})
test('Manual workflow dispatch only, same lock, no build/claims/activation writes',async()=>{const w=JSON.parse(await fs.readFile('.github/workflows/preview-manual.yml','utf8'));assert.deepEqual(Object.keys(w.on),['workflow_dispatch']);assert.deepEqual(w.permissions,{contents:'read',actions:'read'});const j=w.jobs.manual;assert.equal(j.environment,'preview');assert.equal(j.concurrency.group,'tri-app-preview-publish');assert.equal(j.concurrency['cancel-in-progress'],false);const s=JSON.stringify(w);assert.ok(!s.includes('npm run build'));assert.ok(!s.includes('contents:write'));assert.equal(j.steps.filter(x=>x.env?.CLOUDFLARE_API_TOKEN).length,1);const d=j.steps.find(x=>x.uses?.includes('download-artifact'));assert.equal(d.with['artifact-ids'],'${{ inputs.artifact_id }}');assert.equal(d.with['run-id'],'${{ inputs.ci_run_id }}');assert.equal(d.with['merge-multiple'],true)})

test('Integrated manual preflight stops before CLI on same SHA, baseline/domain drift or domain 403',async()=>{
  const {deploy}=await import('./deploy-preview-artifact.mjs')
  const {previewConfig,inventory,sha256}=await import('./preview-artifact.mjs')
  const os=await import('node:os'),path=await import('node:path')
  const source=JSON.parse(await fs.readFile('wrangler.jsonc','utf8')),config=previewConfig(source)
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'preview-manual-test-'))
  try{
    await fs.mkdir(path.join(dir,'worker'));await fs.mkdir(path.join(dir,'dist'))
    await fs.writeFile(path.join(dir,'worker/index.js'),'export default {}');await fs.writeFile(path.join(dir,'dist/index.html'),'<html></html>');await fs.writeFile(path.join(dir,'wrangler.json'),JSON.stringify(config))
    const manifest={sha,worker:'tri-app-preview',version:JSON.parse(await fs.readFile('package.json')).version,lockHash:sha256(await fs.readFile('package-lock.json')),files:await inventory(dir)}
    const bytes=JSON.stringify(manifest);await fs.writeFile(path.join(dir,'manifest.json'),bytes);const digest=sha256(bytes)
    const secrets=['PUBLIC_TELEGRAM_BOT_TOKEN','PUBLIC_TELEGRAM_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TURNSTILE_SECRET_KEY','RATE_LIMIT_HMAC_SECRET','FEEDBACK_TELEGRAM_CHAT_ID','NEWS_TELEGRAM_CHANNEL_ID']
    const settings={compatibility_date:config.compatibility_date,bindings:[...secrets.map(name=>({name,type:'secret_text'})),...Object.entries(config.vars).map(([name,text])=>({name,text,type:'plain_text'})),{name:'ASSETS',type:'assets'},{name:'DB',type:'d1',id:config.d1_databases[0].database_id},{name:'FEEDBACK_RATE_LIMITER',type:'ratelimit',...config.ratelimits[0]}]}
    for(const mode of ['same','changed','domain','permission']){
      const reports=await fs.mkdtemp(path.join(os.tmpdir(),'preview-manual-report-'));const requests=[]
      try{
        const fetcher=async(url,options)=>{
          requests.push(url);assert.ok(!options.method||options.method==='GET')
          if(url.startsWith('https://api.github.com/'))return mock()(url)
          if(url.includes('/workers/scripts/'))assert.ok(url.includes('/tri-app-preview/'))
          let result
          if(url.endsWith('/settings'))result=settings
          else if(url.endsWith('/schedules'))result=[{cron:'*/5 * * * *'}]
          else if(url.endsWith('/deployments'))result={deployments:[mode==='changed'?{...baseline(),id:'changed'}:baseline()]}
          else if(url.includes('/workers/domains?')){
            if(mode==='permission')return new Response(JSON.stringify({success:false,errors:[{code:10000}]}),{status:403})
            result=mode==='domain'?[]:domains()
          }else if(url==='https://preview.300w.app/api/health'){assert.equal(options.headers.Authorization,undefined);return new Response(JSON.stringify({ok:true,service:'tri-app',commit:sha}))}
          else throw Error('Unexpected request '+url)
          return new Response(JSON.stringify({success:true,result}))
        }
        await assert.rejects(deploy(dir,digest,reports,{...env,MANIFEST_DIGEST:digest},fetcher),mode==='same'?/already present/:mode==='changed'?/Live deployment changed/:mode==='permission'?/HTTP 403/:/0 !== 1/)
        assert.ok(requests.length>4)
        await assert.rejects(fs.access(path.join(reports,'wrangler.log')))
      }finally{await fs.rm(reports,{recursive:true,force:true})}
    }
  }finally{await fs.rm(dir,{recursive:true,force:true})}
})

for(const key of ['CLOUDFLARE_API_TOKEN','GH_READ_TOKEN'])test('Missing credential '+key,()=>assert.throws(()=>assertDeployContext({...env,[key]:''})))
test('Wrong application SHA',()=>assert.throws(()=>assertManualContext({...env,MANUAL_PREVIEW_SHA:'f'.repeat(40)})))
test('Wrong numeric artifact ID',async()=>assert.rejects(verifyManualSource({...env,MANUAL_ARTIFACT_ID:'35'},mock())))
test('Missing Environment/permissions fail qualification contract',async()=>{const w=JSON.parse(await fs.readFile('.github/workflows/preview-manual.yml','utf8'));const contract=x=>{assert.equal(x.jobs.manual.environment,'preview');assert.ok(x.jobs.manual.if.includes("github.ref == 'refs/heads/preview'"));assert.equal(x.permissions.contents,'read');assert.equal(x.permissions.actions,'read')};contract(w);for(const mutate of [x=>delete x.jobs.manual.environment,x=>delete x.permissions.actions,x=>delete x.permissions.contents,x=>x.jobs.manual.if='true']){const bad=structuredClone(w);mutate(bad);assert.throws(()=>contract(bad))}})
