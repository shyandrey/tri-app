// Manual Preview guards. Read-only APIs; no claims, publication or persistent activation.
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
export function assertManualContext(env) {
  assert.equal(env.GITHUB_REPOSITORY,'shyandrey/tri-app')
  assert.equal(env.GITHUB_EVENT_NAME,'workflow_dispatch')
  assert.equal(env.GITHUB_REF,'refs/heads/preview')
  assert.equal(env.MANUAL_PREVIEW_CONFIRM,'deploy-preview')
  assert.notEqual(env.PREVIEW_AUTO_DEPLOY_ENABLED,'true')
  assert.match(env.MANUAL_PREVIEW_SHA??'',/^[a-f0-9]{40}$/)
  assert.equal(env.GITHUB_SHA,env.MANUAL_PREVIEW_SHA,'Dispatch/application SHA mismatch')
  for(const key of ['MANUAL_CI_RUN_ID','MANUAL_ARTIFACT_ID'])assert.match(env[key]??'',/^[1-9][0-9]*$/)
  assert.match(env.MANIFEST_DIGEST??'',/^[a-f0-9]{64}$/)
  assert.match(env.MANUAL_ROLLBACK_DEPLOYMENT_ID??'',/^[a-f0-9-]{36}$/)
}
export async function verifyManualSource(env,fetcher=fetch) {
  assertManualContext(env)
  const get=async suffix=>{const r=await fetcher('https://api.github.com/repos/shyandrey/tri-app/'+suffix,{headers:{Authorization:`Bearer ${env.GH_READ_TOKEN}`},redirect:'error',signal:AbortSignal.timeout(15000)});assert.ok(r.ok,`GitHub ${suffix}: HTTP ${r.status}`);return r.json()}
  const ref=await get('git/ref/heads/preview');assert.equal(ref.object.sha,env.MANUAL_PREVIEW_SHA,'Stale Preview SHA')
  const run=await get('actions/runs/'+env.MANUAL_CI_RUN_ID)
  assert.equal(String(run.id),env.MANUAL_CI_RUN_ID);assert.equal(run.repository?.full_name,'shyandrey/tri-app')
  assert.equal(run.head_sha,env.MANUAL_PREVIEW_SHA);assert.equal(run.head_branch,'preview');assert.equal(run.event,'push')
  assert.equal(run.path,'.github/workflows/preview-ci.yml');assert.equal(run.status,'completed');assert.equal(run.conclusion,'success')
  const jobs=await get(`actions/runs/${run.id}/attempts/${run.run_attempt}/jobs?per_page=100`)
  assert.equal(jobs.total_count,jobs.jobs.length,'Incomplete CI jobs response')
  for(const name of ['Portable verification','Browser verification']){const matching=jobs.jobs.filter(j=>j.name===name);assert.equal(matching.length,1);assert.equal(matching[0].conclusion,'success')}
  const artifact=await get('actions/artifacts/'+env.MANUAL_ARTIFACT_ID)
  assert.equal(String(artifact.id),env.MANUAL_ARTIFACT_ID);assert.equal(artifact.expired,false)
  assert.ok(Date.parse(artifact.expires_at)>Date.now(),'Artifact expired')
  assert.equal(String(artifact.workflow_run?.id),env.MANUAL_CI_RUN_ID);assert.equal(artifact.workflow_run?.head_sha,env.MANUAL_PREVIEW_SHA)
  assert.equal(artifact.name,`preview-package-${env.MANUAL_PREVIEW_SHA}-${run.id}-${run.run_attempt}`)
  assert.match(artifact.digest??'',/^sha256:[a-f0-9]{64}$/)
  return {runId:run.id,artifactId:artifact.id,archiveDigest:artifact.digest,applicationSha:env.MANUAL_PREVIEW_SHA,workflowSha:env.GITHUB_SHA}
}
export function assertManualBaseline(deployment,domains,expectedId) {
  assert.ok(deployment?.id,'Rollback baseline missing')
  assert.equal(deployment.id,expectedId,'Live deployment changed; inspect before retry')
  assert.equal(deployment.versions?.length,1,'Split traffic requires owner review')
  assert.match(deployment.versions[0].version_id,/^[a-f0-9-]{36}$/)
  assert.equal(deployment.versions[0].percentage,100)
  assert.ok(Array.isArray(domains));assert.equal(domains.length,1)
  const domain=domains[0];assert.equal(domain.hostname,'preview.300w.app');assert.equal(domain.service,'tri-app-preview');assert.equal(domain.enabled,true);assert.ok(domain.id)
  return domain
}
export function sameCommitDecision(health,sha) {
  assert.equal(health.ok,true);assert.equal(health.service,'tri-app');assert.match(health.commit??'',/^[a-f0-9]{40}$/)
  // Conservative no-upload refusal, not proof that all deployed artifact bytes match.
  return health.commit===sha?'STOP_ALREADY_PRESENT':'UPLOAD_ALLOWED'
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){await verifyManualSource(process.env);console.log('Manual source CI/artifact/current-SHA verification PASS')}
