// Manual release orchestration. Network reads are GET-only; the sole write is Wrangler deploy.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {ACCOUNT,target,releaseConfig,prepareArtifact,verifyArtifact,sha256,validSHA} from './manual-release-artifact.mjs'
import {assertLiveBindings,assertRollbackBaseline} from './deploy-preview-artifact.mjs'
import {checkDeployment} from './check-deployment.mjs'

export function options(args) {
  const [action,...rest]=args, o={action}
  assert.ok(['prepare','qualify','preflight','deploy','smoke'].includes(action),'Expected prepare/preflight/deploy/smoke')
  for(let i=0;i<rest.length;i+=2){
    const k=rest[i]?.replace(/^--/,'')
    assert.ok(['sha','env','package','digest','evidence','authorize','task-smoke'].includes(k)&&!Object.hasOwn(o,k)&&rest[i+1]&&!rest[i+1].startsWith('--'),'Invalid/duplicate option')
    o[k]=rest[i+1]
  }
  assert.ok(validSHA(o.sha),'Full lowercase Git SHA required');target(o.env)
  assert.ok(o.package&&path.isAbsolute(o.package),'Absolute package path required')
  assert.ok(o.evidence&&path.isAbsolute(o.evidence),'Absolute evidence directory required')
  if(action!=='prepare')assert.match(o.digest??'',/^[a-f0-9]{64}$/,'Trusted manifest digest required')
  if(action==='qualify')assert.ok(!o.authorize&&!o['task-smoke'],'Qualification cannot authorize deployment or run hooks')
  if(action==='deploy')assert.equal(o.authorize,`${o.env}:${o.sha}`,'Explicit environment:SHA deployment authorization required')
  return o
}
export function command(file,args,{secret=false,env=process.env,timeout=120000}={}) {
  const childEnv=secret?{...env,WRANGLER_WRITE_LOGS:'false',WRANGLER_SEND_METRICS:'false'}:env
  const r=spawnSync(file,args,{encoding:'utf8',timeout,env:childEnv,maxBuffer:16*1024*1024,stdio:['pipe','pipe','pipe']})
  // Never include captured credential output in errors.
  if(r.status!==0)throw Error(`${path.basename(file)} ${secret?'authentication':args[0]} failed (exit ${r.status}); ${secret?'check authentication separately':(r.stderr||r.error?.message||r.stdout).slice(-4000)}`)
  return r.stdout
}
const git=(...args)=>command('git',args).trim()
const wrangler=(args,opts)=>command(process.execPath,['node_modules/wrangler/bin/wrangler.js',...args],opts)
export function assertSource(sha,head,status,env=process.env) {
  assert.ok(validSHA(sha));assert.equal(head,sha,'Wrong HEAD');assert.equal(status,'','Dirty checkout forbidden')
  for(const key of Object.keys(env))assert.ok(!/^(BUILD_COMMIT|CF_WORKERS_BUILD_COMMIT|CF_PAGES_COMMIT_SHA|GITHUB_SHA|VITE_.*)$/.test(key),'Metadata/build override forbidden: '+key)
}
async function source(o) {
  assertSource(o.sha,git('rev-parse','HEAD'),git('status','--porcelain','--untracked-files=all'))
  assert.equal(process.versions.node,'24.19.0','Pinned Node required')
  const wr=JSON.parse(await fs.readFile('node_modules/wrangler/package.json'));assert.equal(wr.version,'4.142.0')
  for(const name of await fs.readdir('.'))assert.ok(name==='.dev.vars.example'||!/^\.env(?:\.|$)|^\.dev\.vars/.test(name),'Local env files forbidden')
  const root=await fs.realpath('.'), pkg=path.resolve(o.package), evidence=path.resolve(o.evidence)
  for(const p of [pkg,evidence])assert.ok(p!==root&&!p.startsWith(root+path.sep),'Package/evidence must be outside checkout')
  assert.ok(pkg!==evidence&&!evidence.startsWith(pkg+path.sep)&&!pkg.startsWith(evidence+path.sep))
  return JSON.parse(await fs.readFile('wrangler.jsonc'))
}
export async function jsonGet(url,headers={},fetcher=fetch) {
  const r=await fetcher(url,{method:'GET',headers,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)})
  assert.equal(r.status,200,`${new URL(url).pathname}: HTTP ${r.status}`);return r.json()
}
export function cfHeaders(run=wrangler) {
  // No public Wrangler read command covers settings + schedules. Use its supported
  // auth interface, with disk logging forcibly disabled in command(secret:true).
  // Never propagate subprocess/parser errors or their causes (may contain tokens).
  try {
    const a=JSON.parse(run(['auth','token','--json'],{secret:true}))
    if(!['oauth','api_token'].includes(a?.type)||typeof a.token!=='string'||!a.token.trim())throw Error('invalid credentials')
    return {Authorization:`Bearer ${a.token}`}
  } catch {throw Error('Cloudflare authentication failed; credential output suppressed')}
}
export function assertPreflightMode(action,health,sha,version) {
  if(action==='qualify'){
    assert.equal(health.commit,sha,'Qualification expected SHA mismatch')
    assert.equal(health.version,version,'Qualification expected version mismatch')
  } else {
    assert.ok(['preflight','deploy'].includes(action))
    assert.notEqual(health.commit,sha,'Target already published')
  }
}
export function assertReleaseEvidence(before,o) {
  assert.equal(before.purpose,'release-preflight','Read-only qualification is not release evidence')
  assert.equal(before.releaseSha,o.sha);assert.equal(before.manifestDigest,o.digest);assert.equal(before.environment,o.env)
}
async function github() {
  const token=process.env.GH_READ_TOKEN||process.env.GITHUB_TOKEN
  assert.ok(token,'GH_READ_TOKEN required for read-only activation/publisher checks')
  const get=p=>jsonGet('https://api.github.com/repos/shyandrey/tri-app/'+p,{Authorization:`Bearer ${token}`,'User-Agent':'300W-manual-release'})
  const activation=await get('environments/preview/variables/PREVIEW_AUTO_DEPLOY_ENABLED')
  assert.equal(activation.value,'false','Auto Deploy must be explicitly false')
  const vars=await get('actions/variables?per_page=100');assert.ok(vars.total_count<=100)
  assert.ok(!vars.variables.some(v=>v.name==='PREVIEW_AUTO_DEPLOY_ENABLED'&&v.value==='true'))
  for(const status of ['queued','in_progress','waiting','pending','requested'])assert.equal((await get('actions/runs?per_page=1&status='+status)).total_count,0,'Active workflow: '+status)
  return {activation:'false',activeRuns:0}
}
export function assertBaseline(b,config) {
  assert.equal(b.account,ACCOUNT);assert.equal(b.worker,config.name)
  assert.ok(validSHA(b.health.commit)&&/^\d+\.\d+\.\d+$/.test(b.health.version))
  assert.equal(b.health.ok,true);assert.equal(b.health.service,'tri-app')
  assertLiveBindings(b.settings,config,b.schedules)
  assertRollbackBaseline(b.deployment)
  assert.equal(b.version.id,b.deployment.versions[0].version_id)
  assertLiveBindings({compatibility_date:b.version.resources.script_runtime.compatibility_date,bindings:b.version.resources.bindings},config,b.schedules)
}
async function baseline(o,config) {
  const h=cfHeaders(), t=target(o.env), base=`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}`
  const cf=async endpoint=>{const d=await jsonGet(base+endpoint,h);assert.equal(d.success,true,'Cloudflare read failed');return d.result}
  const p='/workers/scripts/'+t.worker
  const deployments=await cf(p+'/deployments');const deployment=deployments.deployments?.[0];assertRollbackBaseline(deployment)
  const b={account:ACCOUNT,worker:t.worker,health:await jsonGet(t.origin+'/api/health'),
    settings:await cf(p+'/settings'),schedules:(await cf(p+'/schedules')).schedules,
    deployment,version:await cf(p+'/versions/'+deployment.versions[0].version_id)}
  assertBaseline(b,config)
  b.otherHealth=await jsonGet(target(o.env==='production'?'preview':'production').origin+'/api/health')
  b.github=await github()
  // Observe local publishers without recording arguments (which might contain credentials).
  const processes=command('ps',['-axo','pid=,command='])
  assert.ok(!processes.split('\n').some(line=>/wrangler(?:\.js)?\s+(?:deploy|versions upload|versions deploy)/.test(line)),'Competing local publisher')
  if(o.env==='production'){
    const d=await cf(`/d1/database/${t.db}/time_travel/bookmark`)
    assert.match(d.bookmark??'',/^[a-f0-9-]+$/,'Time Travel bookmark unavailable');b.bookmark=d.bookmark
  }
  b.releaseSha=o.sha;b.manifestDigest=o.digest;b.environment=o.env
  b.observedAt=new Date().toISOString();return b
}
export function uploadArgs(config){return ['node_modules/wrangler/bin/wrangler.js','deploy','--config',config,'--no-bundle']}
export async function uploadOnce(o,config,run=command) {
  assert.equal(o.authorize,`${o.env}:${o.sha}`,'Deployment not authorized')
  // Exclusive attempt record: timeout/error does not grant a second upload.
  await fs.writeFile(path.join(o.evidence,'upload-attempt.json'),JSON.stringify({sha:o.sha,env:o.env,digest:o.digest,at:new Date().toISOString()}),{flag:'wx'})
  try {return run(process.execPath,uploadArgs(config),{timeout:180000,env:{...process.env,WRANGLER_SEND_METRICS:'false'}})}
  catch(e){await fs.writeFile(path.join(o.evidence,'upload-failure.txt'),e.message);throw e}
}
export async function readiness({sha,version,previous,read,log=console.log,now=()=>performance.now(),sleep=ms=>new Promise(r=>setTimeout(r,ms)),timeout=60000}) {
  assert.ok(validSHA(sha)&&validSHA(previous.commit));assert.ok(version&&previous.version)
  assert.ok(timeout>0&&timeout<=60000)
  const start=now();let count=0
  while(now()-start<timeout){
    const h=await read(Math.min(5000,timeout-(now()-start)))
    assert.ok(h&&h.ok===true&&h.service==='tri-app','Malformed health')
    log({elapsedMs:now()-start,sha:h.commit,version:h.version})
    assert.ok(now()-start<timeout,'Readiness timeout')
    if(h.commit===sha&&h.version===version){if(++count===2)return h}
    else {assert.ok(h.commit===previous.commit&&h.version===previous.version,'Unknown SHA/version pair');count=0}
    await sleep(Math.min(2000,timeout-(now()-start)))
  }
  throw Error('Readiness timeout')
}
async function write(o,name,data){await fs.writeFile(path.join(o.evidence,name),JSON.stringify(data,null,2)+'\n')}
export async function main(args) {
  const o=options(args), src=await source(o), config=releaseConfig(src,o.env)
  await fs.mkdir(o.evidence,{recursive:true})
  if(o.action==='prepare'){
    await fs.access(o.package).then(()=>{throw Error('Package already exists')},e=>{if(e.code!=='ENOENT')throw e})
    await fs.writeFile(path.join(o.evidence,'prepare-attempt.json'),JSON.stringify(o),{flag:'wx'})
    await fs.rm('dist',{recursive:true,force:true}) // ignored build output only, in clean checkout
    const build=command('npm',['run','build'],{timeout:180000});await fs.writeFile(path.join(o.evidence,'build.log'),build)
    await source(o);await prepareArtifact(o.package,o.sha,o.env)
    await write(o,'wrangler.json',{...config,main:path.join(o.package,'worker/index.js'),assets:{...config.assets,directory:path.join(o.package,'dist')}})
    console.log('Manifest SHA256:',sha256(await fs.readFile(path.join(o.package,'manifest.json'))));return
  }
  const m=await verifyArtifact(o.package,o.sha,o.digest,src,o.env)
  if(o.action==='qualify'){
    const observed=await baseline(o,config)
    assertPreflightMode('qualify',observed.health,o.sha,m.version)
    await write(o,'qualification.json',{...observed,purpose:'read-only-qualification',deploymentAuthorized:false})
    console.log('Read-only qualification PASS; no deployment authorization')
    return
  }
  const operational={...config,main:path.join(o.package,'worker/index.js'),assets:{...config.assets,directory:path.join(o.package,'dist')}}
  const configPath=path.join(o.evidence,'wrangler.json')
  if(o.action==='preflight'||o.action==='deploy'){
    await fs.access(path.join(o.evidence,'upload-attempt.json')).then(()=>{throw Error('Upload already attempted; preserve evidence and seek owner decision')},e=>{if(e.code!=='ENOENT')throw e})
    const before=await baseline(o,config);assertPreflightMode(o.action,before.health,o.sha,m.version)
    before.purpose='release-preflight'
    await write(o,'preflight.json',before)
    if(o.action==='preflight'){console.log('Preflight PASS; deploy will recheck live baseline');return}
    await source(o);await verifyArtifact(o.package,o.sha,o.digest,src,o.env)
    await write(o,'wrangler.json',operational)
    // Recheck active deployment immediately before the one upload.
    const fresh=await baseline(o,config)
    assert.deepEqual(fresh.deployment,before.deployment,'Deployment changed during preflight')
    assert.deepEqual(fresh.settings,before.settings);assert.deepEqual(fresh.schedules,before.schedules)
    await source(o);await verifyArtifact(o.package,o.sha,o.digest,src,o.env)
    const output=await uploadOnce(o,configPath);await fs.writeFile(path.join(o.evidence,'deploy.log'),output)
    const after=await baseline(o,config)
    assert.notEqual(after.deployment.id,before.deployment.id)
    assert.deepEqual(after.settings.bindings,before.settings.bindings)
    assert.deepEqual(after.schedules,before.schedules)
    assert.deepEqual(after.otherHealth,before.otherHealth)
    await write(o,'deployment.json',after);console.log('Published deployment',after.deployment.id,'version',after.version.id);return
  }
  const before=JSON.parse(await fs.readFile(path.join(o.evidence,'preflight.json')))
  assert.equal(before.worker,config.name);assert.equal(before.account,ACCOUNT)
  assertReleaseEvidence(before,o)
  const observations=[],origin=target(o.env).origin
  try {
    await readiness({sha:o.sha,version:m.version,previous:before.health,read:async timeout=>{
      const r=await fetch(origin+'/api/health',{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(timeout)});assert.equal(r.status,200);return r.json()
    },log:x=>{observations.push(x);console.log(x)}})
    const {health}=await checkDeployment(origin);assert.equal(health.commit,o.sha);assert.equal(health.version,m.version)
    const html=await fetch(origin+'/',{redirect:'error',signal:AbortSignal.timeout(15000)});assert.equal(html.status,200)
    const htmlBytes=Buffer.from(await html.arrayBuffer())
    assert.equal(sha256(htmlBytes),m.files['dist/index.html'],'Published HTML integrity')
    const initialAssets=[...htmlBytes.toString().matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(x=>x[1])
    assert.ok(initialAssets.length,'No initial assets in packaged HTML')
    for(const asset of new Set(initialAssets)){
      assert.ok(m.files['dist'+asset],'Unpackaged asset reference')
      const r=await fetch(origin+asset,{redirect:'error',signal:AbortSignal.timeout(15000)});assert.equal(r.status,200)
      assert.equal(sha256(Buffer.from(await r.arrayBuffer())),m.files['dist'+asset],'Published asset integrity: '+asset)
    }
    if(o['task-smoke']){
      const file=path.resolve(o['task-smoke']);assert.equal(git('ls-files','--',file),path.relative(process.cwd(),file),'Task smoke must be reviewed tracked script')
      await fs.writeFile(path.join(o.evidence,'task-smoke.log'),command(process.execPath,[file,'--origin',origin,'--expected-sha',o.sha],{timeout:120000}))
    }
    const after=await baseline(o,config);assert.equal(after.health.commit,o.sha);assert.equal(after.health.version,m.version)
    assert.deepEqual(after.settings.bindings,before.settings.bindings);assert.deepEqual(after.schedules,before.schedules);assert.deepEqual(after.otherHealth,before.otherHealth)
    await write(o,'smoke.json',{result:'PASS',sha:o.sha,version:m.version,taskSmoke:o['task-smoke']??'NOT RUN',deployment:after.deployment.id,versionId:after.version.id})
  } catch(e){await write(o,'smoke.json',{result:'FAIL',error:e.message,rollback:before.deployment,automaticRollback:false});throw e}
  finally{await write(o,'readiness.json',observations)}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main(process.argv.slice(2)).catch(async e=>{
    console.error('STOP:',e.message,'No automatic retry or rollback.')
    try {
      const o=options(process.argv.slice(2))
      const before=JSON.parse(await fs.readFile(path.join(o.evidence,'preflight.json')))
      let actualHealth='UNKNOWN'
      try {actualHealth=await jsonGet(target(o.env).origin+'/api/health')} catch { /* Preserve uncertainty. */ }
      const failure={error:e.message,actualHealth,availableRollback:before.deployment,automaticRetry:false,automaticRollback:false}
      await write(o,'failure.json',failure)
      console.error(JSON.stringify(failure))
    } catch { /* Invalid options or missing preflight: no deployment state inferred. */ }
    process.exitCode=1
  })
}
