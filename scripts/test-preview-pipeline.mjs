import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {previewConfig,inventory,sha256,verifyArtifact} from './preview-artifact.mjs'
import {assertDeployContext,assertLiveBindings,deploy,expectedPreviewAccountId,assertRollbackBaseline,assertPreviewDomain} from './deploy-preview-artifact.mjs'
import {assertHealth} from './smoke-preview-ci.mjs'
const source=JSON.parse(await fs.readFile('wrangler.jsonc','utf8')),config=previewConfig(source),sha='3ab99c4805bc33c76a5aca67b94251e7488eacd3'
const env={GITHUB_REPOSITORY:'shyandrey/tri-app',GITHUB_EVENT_NAME:'push',GITHUB_REF:'refs/heads/preview',GITHUB_SHA:sha,PREVIEW_AUTO_DEPLOY_ENABLED:'true',CLOUDFLARE_ACCOUNT_ID:expectedPreviewAccountId,CLOUDFLARE_API_TOKEN:'fake-test-token',GH_READ_TOKEN:'fake-github-token'}
const names=['PUBLIC_TELEGRAM_BOT_TOKEN','PUBLIC_TELEGRAM_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TURNSTILE_SECRET_KEY','RATE_LIMIT_HMAC_SECRET','FEEDBACK_TELEGRAM_CHAT_ID','NEWS_TELEGRAM_CHANNEL_ID']
const live=()=>({compatibility_date:config.compatibility_date,bindings:[...names.map(name=>({name,type:'secret_text'})),...Object.entries(config.vars).map(([name,text])=>({name,text,type:'plain_text'})),{name:'ASSETS',type:'assets'},{name:'DB',type:'d1',id:config.d1_databases[0].database_id},{name:'FEEDBACK_RATE_LIMITER',type:'ratelimit',...config.ratelimits[0]}]})
const rollback={id:'11111111-1111-1111-1111-111111111111',versions:[{version_id:'22222222-2222-2222-2222-222222222222',percentage:100}]}
const domain={id:'fixture-domain',hostname:'preview.300w.app',service:'tri-app-preview',enabled:true}
const schedules=[{cron:'*/5 * * * *'}]
async function fixture(){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tri-package-test-'));await fs.mkdir(path.join(dir,'worker'));await fs.mkdir(path.join(dir,'dist'));await fs.writeFile(path.join(dir,'worker/index.js'),'export default {}');await fs.writeFile(path.join(dir,'dist/index.html'),'<html></html>');await fs.writeFile(path.join(dir,'wrangler.json'),JSON.stringify(config));const m={sha,worker:'tri-app-preview',version:JSON.parse(await fs.readFile('package.json')).version,lockHash:sha256(await fs.readFile('package-lock.json')),files:await inventory(dir)};const bytes=JSON.stringify(m);await fs.writeFile(path.join(dir,'manifest.json'),bytes);return{dir,digest:sha256(bytes)}}
test('Preview-only config has no build hook, production or route changes',()=>{assert.equal(config.name,'tri-app-preview');assert.equal(config.main,'./worker/index.js');assert.ok(config.keep_vars);for(const key of ['build','env','route','routes'])assert.equal(config[key],undefined);const bad=structuredClone(source);bad.env.preview.name='tri-app';assert.throws(()=>previewConfig(bad))})
for(const [key,value] of [['GITHUB_REF','refs/heads/main'],['GITHUB_EVENT_NAME','pull_request'],['GITHUB_REPOSITORY','other/repo'],['PREVIEW_AUTO_DEPLOY_ENABLED','false'],['GITHUB_SHA','unknown'],['CLOUDFLARE_ACCOUNT_ID','bad']])test('Deployment rejects '+key,()=>assert.throws(()=>assertDeployContext({...env,[key]:value})))
test('Expected live Preview bindings and eight secrets accepted',()=>assertLiveBindings(live(),config,schedules))
for(const mutation of ['d1','secret','vars','cron','extra'])test('Live drift rejected: '+mutation,()=>{const x=live();let crons=schedules;if(mutation==='d1')x.bindings.find(b=>b.name==='DB').id=source.env.production.d1_databases[0].database_id;if(mutation==='secret')x.bindings.shift();if(mutation==='vars')x.bindings.find(b=>b.name==='APP_ENV').text='production';if(mutation==='cron')crons=[];if(mutation==='extra')x.bindings.push({name:'NEW',type:'plain_text',text:'x'});assert.throws(()=>assertLiveBindings(x,config,crons))})
test('Artifact accepts exact bytes and rejects wrong SHA/digest',async()=>{const{dir,digest}=await fixture();await verifyArtifact(dir,sha,digest,source);await assert.rejects(verifyArtifact(dir,'b'.repeat(40),digest,source));await assert.rejects(verifyArtifact(dir,sha,'b'.repeat(64),source))})
for(const kind of ['changed','extra','missing','symlink','hidden'])test('Artifact rejects '+kind,async()=>{const{dir,digest}=await fixture();if(kind==='changed')await fs.writeFile(path.join(dir,'worker/index.js'),'tampered');if(kind==='extra')await fs.writeFile(path.join(dir,'unexpected'),'extra');if(kind==='missing')await fs.unlink(path.join(dir,'dist/index.html'));if(kind==='hidden')await fs.writeFile(path.join(dir,'.env'),'forbidden');if(kind==='symlink')await fs.symlink('/etc/hosts',path.join(dir,'link'));await assert.rejects(verifyArtifact(dir,sha,digest,source))})
test('Permission failure stops before any deployment',async()=>{const{dir,digest}=await fixture();let calls=0;await assert.rejects(deploy(dir,digest,path.join(dir,'reports-outside'),env,async()=>{calls++;return new Response(JSON.stringify({success:false,errors:[{code:10000}]}),{status:403})}),/HTTP 403/);assert.equal(calls,1)})
test('Stale head stops after read-only preflight, before upload',async()=>{const{dir,digest}=await fixture();const urls=[];await assert.rejects(deploy(dir,digest,await fs.mkdtemp(path.join(os.tmpdir(),'tri-deploy-report-')),env,async url=>{urls.push(url);const data=url.endsWith('/settings')?live():url.endsWith('/schedules')?schedules:url.endsWith('/deployments')?{deployments:[rollback]}:url.includes('/workers/domains?')?[domain]: {object:{sha:'b'.repeat(40)}};return new Response(JSON.stringify({success:true,result:data}))}),/Stale queued/);assert.equal(urls.length,6)})
test('Health requires exact deployed commit and unchanged version',()=>{const h={ok:true,service:'tri-app',commit:sha,version:'0.0.0'};assertHealth(h,sha,'0.0.0');assert.throws(()=>assertHealth({...h,commit:'b'.repeat(40)},sha,'0.0.0'));assert.throws(()=>assertHealth({...h,version:'1.0.0'},sha,'0.0.0'))})
test('Workflow keeps deployment gated and tests blocking',async()=>{const yaml=await fs.readFile('.github/workflows/preview-ci.yml','utf8');assert.ok(yaml.includes('needs: [portable, browser]'));assert.ok(yaml.includes("steps.activation.outputs.enabled == 'true'"));assert.ok(!yaml.includes("&& vars.PREVIEW_AUTO_DEPLOY_ENABLED"));assert.ok(yaml.includes('cancel-in-progress: false'));assert.ok(!yaml.includes('continue-on-error'));assert.equal((yaml.match(/secrets.CLOUDFLARE_API_TOKEN/g)??[]).length,1);assert.ok(!yaml.includes('npm run deploy:preview'));assert.ok(!yaml.includes('pull_request_target'))})

for(const [label,value] of [['absent',undefined],['empty',{}],['split',{...rollback,versions:[...rollback.versions,...rollback.versions]}],['partial',{...rollback,versions:[{...rollback.versions[0],percentage:50}]}],['missing-version',{...rollback,versions:[{percentage:100}]}]]) test('Rollback fails closed: '+label,()=>assert.throws(()=>assertRollbackBaseline(value)))
for(const patch of [{hostname:'300w.app'},{service:'tri-app'},{enabled:false},{id:''}]) test('Custom Domain rejects '+JSON.stringify(patch),()=>assert.throws(()=>assertPreviewDomain([{...domain,...patch}])))
test('Valid rollback/domain accepted; missing or duplicate domains rejected',()=>{assertRollbackBaseline(rollback);assertPreviewDomain([domain]);for(const ds of [undefined,[],[domain,domain]])assert.throws(()=>assertPreviewDomain(ds))})
test('Valid-format wrong account rejected before network',()=>assert.throws(()=>assertDeployContext({...env,CLOUDFLARE_ACCOUNT_ID:'b'.repeat(32)})))
for(const fault of ['rollback','domain','drift'])test('Pre-upload GET-only rejection: '+fault,async()=>{
  const{dir,digest}=await fixture();let deploymentReads=0;const urls=[]
  await assert.rejects(deploy(dir,digest,await fs.mkdtemp(path.join(os.tmpdir(),'tri-preflight-')),env,async(url,options)=>{
    assert.ok(!options.method||options.method==='GET');urls.push(url)
    let data
    if(url.endsWith('/settings'))data=live()
    else if(url.endsWith('/schedules'))data=schedules
    else if(url.endsWith('/deployments')){deploymentReads++;data={deployments:fault==='rollback'?[]:[{...rollback,id:fault==='drift'&&deploymentReads===2?'33333333-3333-3333-3333-333333333333':rollback.id}]}}
    else if(url.includes('/workers/domains?'))data=[{...domain,service:fault==='domain'?'tri-app':'tri-app-preview'}]
    else throw Error('Unexpected request before fail-closed stop')
    return new Response(JSON.stringify({success:true,result:data}))
  }),fault==='rollback'?/Rollback deployment/:fault==='domain'?/tri-app/:/Rollback deployment changed/)
  assert.ok(urls.every(url=>url.startsWith('https://api.cloudflare.com/')))
})

// Execute the exact production gate shell; no credential/environment or network access.
function activationContract(yaml) {
  const job=yaml.slice(yaml.indexOf('\n  deploy:\n'))
  assert.match(job,/if: github.event_name == 'push' && github.ref == 'refs\/heads\/preview'\n/)
  assert.ok(job.includes('    environment: preview\n'))
  const steps=job.split(/^      - /m).slice(1)
  assert.ok(steps[0].includes('id: activation'))
  assert.ok(!steps[0].includes('secrets.'))
  assert.ok(steps[0].includes('PREVIEW_AUTO_DEPLOY_ENABLED: ${{ vars.PREVIEW_AUTO_DEPLOY_ENABLED }}'))
  assert.ok(!job.split('    steps:')[0].includes('vars.'))
  for(const step of steps.slice(1))assert.match(step,/if: (?:always\(\) && )?steps.activation.outputs.enabled == 'true'\n/)
  const match=steps[0].match(/        run: \|\n((?:          .*\n)+)/)
  assert.ok(match)
  return match[1].replace(/^          /gm,'')
}
test('All deployment steps gated, including credential access and diagnostics',async()=>{
  const yaml=await fs.readFile('.github/workflows/preview-ci.yml','utf8');activationContract(yaml)
  const start=yaml.indexOf('\n  deploy:\n'),prefix=yaml.slice(0,start),job=yaml.slice(start)
  await assert.rejects(async()=>activationContract(prefix+job.replace("if: steps.activation.outputs.enabled == 'true'",'if: always()')))
  assert.throws(()=>activationContract(yaml.replace('    environment: preview\n','')))
})
for(const flag of [undefined,'','false','true','TRUE',' true','true '])test('Exact runner activation shell: '+JSON.stringify(flag),async()=>{
  const {spawnSync}=await import('node:child_process')
  const shell=activationContract(await fs.readFile('.github/workflows/preview-ci.yml','utf8'))
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'tri-gate-'))
  const output=path.join(dir,'output'),summary=path.join(dir,'summary')
  const variables={PATH:process.env.PATH,GITHUB_OUTPUT:output,GITHUB_STEP_SUMMARY:summary,...(flag===undefined?{}:{PREVIEW_AUTO_DEPLOY_ENABLED:flag})}
  assert.equal(spawnSync('bash',['-n'],{input:shell,encoding:'utf8',env:variables}).status,0)
  const result=spawnSync('bash',['--noprofile','--norc','-e','-o','pipefail'],{input:shell,encoding:'utf8',env:variables})
  assert.equal(result.status,0,result.stderr)
  assert.equal(await fs.readFile(output,'utf8'),`enabled=${flag==='true'}\n`)
  assert.equal(Object.keys(variables).some(key=>key.includes('TOKEN')),false)
})
