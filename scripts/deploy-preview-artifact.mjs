import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {verifyArtifact, validSHA} from './preview-artifact.mjs'

// Nonsecret account identity pinned from the approved Preview Environment readback.
export const expectedPreviewAccountId='3fd801274d556b3ffc138463a0f20830'
const secretNames=['PUBLIC_TELEGRAM_BOT_TOKEN','PUBLIC_TELEGRAM_WEBHOOK_SECRET','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','TURNSTILE_SECRET_KEY','RATE_LIMIT_HMAC_SECRET','FEEDBACK_TELEGRAM_CHAT_ID','NEWS_TELEGRAM_CHANNEL_ID'].sort()
export function assertDeployContext(env) {
  assert.equal(env.GITHUB_REPOSITORY,'shyandrey/tri-app')
  assert.equal(env.GITHUB_EVENT_NAME,'push')
  assert.equal(env.GITHUB_REF,'refs/heads/preview')
  assert.equal(env.PREVIEW_AUTO_DEPLOY_ENABLED,'true','Deployment activation not approved/enabled')
  assert.ok(validSHA(env.GITHUB_SHA))
  assert.equal(env.CLOUDFLARE_ACCOUNT_ID,expectedPreviewAccountId,'Unexpected Cloudflare Account ID')
  assert.ok(env.CLOUDFLARE_API_TOKEN && env.GH_READ_TOKEN)
}
export function assertLiveBindings(settings, config, schedules) {
  assert.equal(settings.compatibility_date,config.compatibility_date)
  const bindings=settings.bindings
  const names=bindings.map(b=>b.name)
  const expected=[...secretNames,...Object.keys(config.vars),'ASSETS',...config.d1_databases.map(x=>x.binding),...config.ratelimits.map(x=>x.name)].sort()
  assert.deepEqual(names.sort(),expected,'Unexpected/missing live Preview bindings')
  assert.deepEqual(bindings.filter(b=>b.type==='secret_text').map(b=>b.name).sort(),secretNames)
  for(const [name,value] of Object.entries(config.vars)) assert.ok(bindings.some(b=>b.name===name&&b.type==='plain_text'&&b.text===value),'Preview var mismatch: '+name)
  assert.ok(bindings.some(b=>b.name==='ASSETS'&&b.type==='assets'))
  for(const db of config.d1_databases) assert.ok(bindings.some(b=>b.name===db.binding&&b.type==='d1'&&b.id===db.database_id),'Preview D1 mismatch')
  for(const limit of config.ratelimits){const b=bindings.find(x=>x.name===limit.name);assert.equal(b.type,'ratelimit');assert.equal(String(b.namespace_id),limit.namespace_id);assert.deepEqual(b.simple,limit.simple)}
  assert.deepEqual(schedules.map(s=>s.cron).sort(),[...config.triggers.crons].sort(),'Preview cron mismatch')
}
export function assertRollbackBaseline(deployment) {
  assert.match(deployment?.id??'',/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/,'Rollback deployment missing/invalid')
  assert.equal(deployment.versions?.length,1,'Split/missing rollback versions require review')
  assert.match(deployment.versions[0].version_id??'',/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/)
  assert.equal(deployment.versions[0].percentage,100,'Rollback must cover 100% traffic')
}
export function assertPreviewDomain(domains) {
  assert.ok(Array.isArray(domains),'Custom Domain response missing')
  assert.equal(domains.length,1,'Expected exactly one Preview Custom Domain')
  const domain=domains[0]
  assert.ok(domain.id,'Custom Domain ID missing')
  assert.equal(domain.hostname,'preview.300w.app')
  assert.equal(domain.service,'tri-app-preview')
  assert.equal(domain.enabled,true,'Custom Domain disabled')
  return domain
}
export async function deploy(directory, digest, reportDirectory, env=process.env, fetcher=fetch) {
  assertDeployContext(env)
  const manifest=await verifyArtifact(directory,env.GITHUB_SHA,digest,JSON.parse(await fs.readFile('wrangler.jsonc','utf8')))
  const config=JSON.parse(await fs.readFile(path.join(directory,'wrangler.json'),'utf8'))
  assert.equal(config.name,'tri-app-preview','Unexpected target Worker')
  await fs.mkdir(reportDirectory,{recursive:true})
  const cfBase=`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/tri-app-preview`
  const read=async (url,token,label)=>{
    const r=await fetcher(url,{headers:{Authorization:`Bearer ${token}`,'User-Agent':'300W-preview-ci'},redirect:'error',signal:AbortSignal.timeout(15000)})
    const data=await r.json()
    if(!r.ok||data.success===false)throw Error(`${label}: HTTP ${r.status}; codes=${(data.errors??[]).map(e=>e.code).join(',')}; STOP, no permission broadening/retry`)
    return data.result??data
  }
  const settings=await read(cfBase+'/settings',env.CLOUDFLARE_API_TOKEN,'Preview settings GET')
  const schedules=await read(cfBase+'/schedules',env.CLOUDFLARE_API_TOKEN,'Preview schedules GET')
  assertLiveBindings(settings,config,schedules.schedules??schedules)
  const before=await read(cfBase+'/deployments',env.CLOUDFLARE_API_TOKEN,'Preview deployments GET')
  assertRollbackBaseline(before.deployments?.[0])
  const domainUrl=`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/domains?hostname=preview.300w.app&service=tri-app-preview`
  const domain=assertPreviewDomain(await read(domainUrl,env.CLOUDFLARE_API_TOKEN,'Preview Custom Domain GET'))
  const record={accountId:env.CLOUDFLARE_ACCOUNT_ID,worker:config.name,customDomain:domain,baseline:{secretNames,bindingNames:settings.bindings.map(b=>b.name).sort(),cron:schedules.schedules??schedules},sha:manifest.sha,manifestDigest:digest,previousDeployment:before.deployments?.[0]??null,startedAt:new Date().toISOString(),status:'preflight'}
  const save=()=>fs.writeFile(path.join(reportDirectory,'deployment.json'),JSON.stringify(record,null,2)+'\n')
  await save()
  const fresh=await read(cfBase+'/deployments',env.CLOUDFLARE_API_TOKEN,'Rollback baseline recheck GET')
  assert.deepEqual(fresh.deployments?.[0],record.previousDeployment,'Rollback deployment changed during preflight')
  // Last check inside the non-cancelling workflow concurrency lock. No stale promotion.
  const ref=await read('https://api.github.com/repos/shyandrey/tri-app/git/ref/heads/preview',env.GH_READ_TOKEN,'Preview Git ref GET')
  assert.equal(ref.object.sha,manifest.sha,'Stale queued build; no deployment')
  // Operational config lives outside the immutable artifact (Wrangler creates .wrangler nearby).
  const operationalConfig={...config,main:path.resolve(directory,'worker/index.js'),assets:{...config.assets,directory:path.resolve(directory,'dist')}}
  const configPath=path.resolve(reportDirectory,'deploy-config.json')
  await fs.writeFile(configPath,JSON.stringify(operationalConfig,null,2))
  const cli=path.resolve('node_modules/wrangler/bin/wrangler.js')
  const result=spawnSync(process.execPath,[cli,'deploy','--no-bundle','--config',configPath],{cwd:process.cwd(),env:{...env,WRANGLER_SEND_METRICS:'false'},encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024})
  const log=((result.stdout??'')+(result.stderr??'')).split(env.CLOUDFLARE_API_TOKEN).join('[REDACTED]').split(env.GH_READ_TOKEN).join('[REDACTED]')
  await fs.writeFile(path.join(reportDirectory,'wrangler.log'),log)
  record.status=result.status===0?'uploaded-awaiting-verification':'FAILED_OR_UNCERTAIN';await save()
  assert.equal(result.status,0,'Preview upload failed/uncertain; inspect sanitized log; no retry or rollback')
  const version=log.match(/Current Version ID:\s*([a-f0-9-]{36})/i)?.[1]
  const current=await read(cfBase+'/deployments',env.CLOUDFLARE_API_TOKEN,'Published deployment GET')
  const latest=current.deployments?.[0]
  record.deploymentId=latest?.id;record.versionId=version;await save()
  assert.ok(version&&latest?.id&&latest.versions?.some(v=>v.version_id===version&&v.percentage===100),'Cannot identify exact published version/deployment')
  const afterSchedules=await read(cfBase+'/schedules',env.CLOUDFLARE_API_TOKEN,'Post schedules GET')
  assertLiveBindings(await read(cfBase+'/settings',env.CLOUDFLARE_API_TOKEN,'Post settings GET'),config,afterSchedules.schedules??afterSchedules)
  assert.deepEqual(assertPreviewDomain(await read(domainUrl,env.CLOUDFLARE_API_TOKEN,'Post Custom Domain GET')),domain,'Custom Domain changed')
  record.status='deployed-awaiting-smoke';await save()
  console.log(`Preview SHA ${manifest.sha}; version ${version}; deployment ${latest.id}`)
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) await deploy(...process.argv.slice(2))
