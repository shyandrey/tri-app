import {assertReleaseSeason} from './release-season.mjs'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'

import {sha256,validSHA,inventory} from './preview-artifact.mjs'
export {sha256,validSHA,inventory}
export const ACCOUNT = '3fd801274d556b3ffc138463a0f20830'
export function target(environment) {
  assert.ok(['preview','production'].includes(environment), 'Explicit production or preview required')
  return environment === 'production'
    ? {worker:'tri-app', origin:'https://300w.app', db:'2b5cd1b9-d9bf-483d-b710-23d00b6db7fd', limiter:'40001'}
    : {worker:'tri-app-preview', origin:'https://preview.300w.app', db:'4dfe9210-0cc7-484f-8eea-fe5216f5c17a', limiter:'30001'}
}
export function releaseConfig(source, environment) {
  const t=target(environment), selected=source.env[environment]
  for(const c of [source,selected])if(c.account_id!==undefined)assert.equal(c.account_id,ACCOUNT,'Wrong account')
  assert.equal(selected.name,t.worker)
  assert.equal(selected.vars.APP_ENV,environment)
  assert.equal(selected.vars.ALLOWED_ORIGIN,t.origin)
  assert.equal(selected.vars.PUBLIC_TELEGRAM_MINI_APP_URL,t.origin)
  assert.equal(selected.d1_databases.length,1)
  assert.equal(selected.d1_databases[0].database_id,t.db)
  assert.equal(selected.d1_databases[0].database_name,'tri-app-'+environment)
  assert.equal(selected.ratelimits.length,1)
  assert.equal(selected.ratelimits[0].namespace_id,t.limiter)
  for(const key of ['route','routes']) assert.ok(!Object.hasOwn(source,key)&&!Object.hasOwn(selected,key),'Route mutation forbidden')
  assert.ok(!selected.build&&!selected.env)
  const config={compatibility_date:source.compatibility_date,...selected,account_id:ACCOUNT,
    main:'./worker/index.js',assets:{...source.assets,directory:'./dist'},keep_vars:true}
  return config
}
export async function verifyArtifact(directory, expectedSHA, expectedDigest, source, environment) {
  assert.ok(validSHA(expectedSHA), 'Exact commit SHA required')
  assert.match(expectedDigest ?? '', /^[a-f0-9]{64}$/, 'Trusted manifest digest required')
  const bytes = await fs.readFile(path.join(directory, 'manifest.json'))
  assert.equal(sha256(bytes), expectedDigest, 'Manifest digest mismatch')
  const manifest = JSON.parse(bytes)
  assert.equal(manifest.sha, expectedSHA)
  assert.equal(manifest.worker, target(environment).worker)
  assert.equal(manifest.environment, environment)
  assert.deepEqual(await inventory(directory), manifest.files, 'Artifact file set/content changed')
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(directory, 'wrangler.json'), 'utf8')), releaseConfig(source, environment), 'Release config drift')
  assert.equal(manifest.lockHash, sha256(await fs.readFile('package-lock.json')))
  assert.equal(manifest.version, JSON.parse(await fs.readFile('package.json', 'utf8')).version)
  const season=assertReleaseSeason(JSON.parse(await fs.readFile(path.join(directory,'dist/season.json'),'utf8')),environment)
  assert.deepEqual(manifest.season,season,'Manifest season evidence mismatch')
  assert.ok(manifest.files['worker/index.js'] && manifest.files['dist/index.html'])
  return manifest
}
export async function prepareArtifact(directory, sha, environment) {
  assert.ok(validSHA(sha))
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),sha)
  const metadata = await fs.readFile('.generated/build-metadata.ts','utf8')
  assert.ok(metadata.includes(sha), 'Build metadata must match source commit')
  const season=assertReleaseSeason(JSON.parse(await fs.readFile('dist/season.json','utf8')),environment)
  await fs.mkdir(directory) // Refuse to overwrite a prior package.
  const source = JSON.parse(await fs.readFile('wrangler.jsonc','utf8'))
  const config = releaseConfig(source, environment)
  // Only committed runtime assets enter the package; local originals never enter CI.
  const tracked = new Set(spawnSync('git',['ls-files','public'],{encoding:'utf8'}).stdout.trim().split('\n').map(x=>x.slice(7)))
  await fs.cp('dist',path.join(directory,'dist'),{recursive:true,filter: async file=>{
    if ((await fs.lstat(file)).isDirectory()) return true
    const relative = path.relative('dist',file).split(path.sep).join('/')
    return relative==='index.html'||relative==='season.json'||relative.startsWith('assets/')||tracked.has(relative)
  }})
  const bundleConfig = {...config, main:path.resolve(source.env[environment].main), assets:{...config.assets,directory:path.resolve(directory,'dist')}}
  const temp = path.join(await fs.mkdtemp(path.join(os.tmpdir(),'tri-preview-bundle-')),'bundle-config.json')
  await fs.writeFile(temp,JSON.stringify(bundleConfig))
  const buildEnv={...process.env,WRANGLER_SEND_METRICS:'false'}
  for(const key of ['CLOUDFLARE_API_TOKEN','CF_API_TOKEN','CLOUDFLARE_API_KEY','CF_API_KEY','CLOUDFLARE_EMAIL','CF_EMAIL'])delete buildEnv[key]
  const result = spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--config',temp,'--outdir',path.join(directory,'worker')],{encoding:'utf8',timeout:120000,env:buildEnv})
  await fs.unlink(temp)
  if(result.status!==0) throw Error('Credential-free bundle failed: '+(result.stderr||result.error||result.stdout))
  assert.ok((await fs.readFile(path.join(directory,'worker/index.js'),'utf8')).includes(sha),'Bundled Worker metadata must match tested SHA')
  // Wrangler output is prebundled; no custom build command is present in either config.
  await fs.writeFile(path.join(directory,'wrangler.json'),JSON.stringify(config,null,2)+'\n')
  const manifest={schemaVersion:1,season,toolchain:{node:process.versions.node,wrangler:JSON.parse(await fs.readFile('node_modules/wrangler/package.json')).version},sha,environment,worker:target(environment).worker,version:JSON.parse(await fs.readFile('package.json','utf8')).version,
    lockHash:sha256(await fs.readFile('package-lock.json')),files:await inventory(directory)}
  const bytes=JSON.stringify(manifest,null,2)+'\n'
  await fs.writeFile(path.join(directory,'manifest.json'),bytes)
  const digest=sha256(bytes)
  await verifyArtifact(directory,sha,digest,source,environment)
  console.log(`Verified package ${sha}; manifest ${digest}; ${Object.keys(manifest.files).length} files`)
}
