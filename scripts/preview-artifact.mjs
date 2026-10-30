import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'

export const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex')
export const validSHA = value => /^[a-f0-9]{40}$/.test(value ?? '')
export function previewConfig(source) {
  assert.equal(source.env.preview.name, 'tri-app-preview')
  assert.equal(source.env.preview.d1_databases.length, 1)
  assert.equal(source.env.preview.d1_databases[0].database_id, '4dfe9210-0cc7-484f-8eea-fe5216f5c17a')
  const config = {compatibility_date: source.compatibility_date, ...source.env.preview,
    main: './worker/index.js', assets: {...source.assets, directory: './dist'}, keep_vars: true}
  assert.ok(!config.build && !config.env)
  // Even empty/null route declarations can express mutation intent. Custom Domains
  // are configured through route objects with custom_domain: true in Wrangler.
  for (const key of ['route', 'routes']) {
    assert.ok(!Object.hasOwn(source, key) && !Object.hasOwn(config, key), 'Route/Custom Domain mutation forbidden: '+key)
  }
  return config
}
export async function inventory(root, prefix = '') {
  const files = {}
  for (const item of (await fs.readdir(path.join(root, prefix), {withFileTypes: true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, item.name)
    assert.ok(!item.name.startsWith('.') || relative==='dist/.assetsignore', 'Unexpected hidden artifact path: '+relative)
    assert.ok(!item.isSymbolicLink(), 'Symlink forbidden: '+relative)
    if (item.isDirectory()) Object.assign(files, await inventory(root, relative))
    else {assert.ok(item.isFile()); if (relative !== 'manifest.json') files[relative] = sha256(await fs.readFile(path.join(root, relative)))}
  }
  return files
}
export async function verifyArtifact(directory, expectedSHA, expectedDigest, source) {
  assert.ok(validSHA(expectedSHA), 'Exact commit SHA required')
  assert.match(expectedDigest ?? '', /^[a-f0-9]{64}$/, 'Trusted manifest digest required')
  const bytes = await fs.readFile(path.join(directory, 'manifest.json'))
  assert.equal(sha256(bytes), expectedDigest, 'Manifest digest differs from CI output')
  const manifest = JSON.parse(bytes)
  assert.equal(manifest.sha, expectedSHA)
  assert.equal(manifest.worker, 'tri-app-preview')
  assert.deepEqual(await inventory(directory), manifest.files, 'Artifact file set/content changed')
  assert.deepEqual(JSON.parse(await fs.readFile(path.join(directory, 'wrangler.json'), 'utf8')), previewConfig(source), 'Preview config drift')
  assert.equal(manifest.lockHash, sha256(await fs.readFile('package-lock.json')))
  assert.equal(manifest.version, JSON.parse(await fs.readFile('package.json', 'utf8')).version)
  assert.ok(manifest.files['worker/index.js'] && manifest.files['dist/index.html'])
  return manifest
}
export async function prepareArtifact(directory, sha) {
  assert.ok(validSHA(sha))
  assert.equal(spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),sha)
  const metadata = await fs.readFile('.generated/build-metadata.ts','utf8')
  assert.ok(metadata.includes(sha), 'Build metadata must match CI commit')
  await fs.mkdir(directory) // Refuse to overwrite a prior package.
  const source = JSON.parse(await fs.readFile('wrangler.jsonc','utf8'))
  const config = previewConfig(source)
  // Only committed runtime assets enter the package; local originals never enter CI.
  const tracked = new Set(spawnSync('git',['ls-files','public'],{encoding:'utf8'}).stdout.trim().split('\n').map(x=>x.slice(7)))
  await fs.cp('dist',path.join(directory,'dist'),{recursive:true,filter: async file=>{
    if ((await fs.lstat(file)).isDirectory()) return true
    const relative = path.relative('dist',file).split(path.sep).join('/')
    return relative==='index.html'||relative.startsWith('assets/')||tracked.has(relative)
  }})
  const bundleConfig = {...config, main:path.resolve(source.env.preview.main), assets:{...config.assets,directory:path.resolve(directory,'dist')}}
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
  const manifest={sha,worker:'tri-app-preview',version:JSON.parse(await fs.readFile('package.json','utf8')).version,
    lockHash:sha256(await fs.readFile('package-lock.json')),files:await inventory(directory)}
  const bytes=JSON.stringify(manifest,null,2)+'\n'
  await fs.writeFile(path.join(directory,'manifest.json'),bytes)
  const digest=sha256(bytes)
  await verifyArtifact(directory,sha,digest,source)
  if(process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT,`manifest_digest=${digest}\n`)
  console.log(`Verified package ${sha}; manifest ${digest}; ${Object.keys(manifest.files).length} files`)
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const [mode,directory,sha,digest]=process.argv.slice(2)
  if(mode==='prepare') await prepareArtifact(directory,sha)
  else if(mode==='verify') await verifyArtifact(directory,sha,digest,JSON.parse(await fs.readFile('wrangler.jsonc','utf8')))
  else throw Error('Usage: preview-artifact.mjs prepare|verify directory sha [trusted-digest]')
}
