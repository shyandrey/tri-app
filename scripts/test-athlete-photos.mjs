import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { loadPhotoRuntime } from './athlete-photo-runtime.mjs'
import { selectBatch, expectedProfileUrl, verifyProfile, fetchProfile, discoverImages, sharedAssets, classify, discoverBatch, photoProtection, snapshotTree, auditPhotoFiles, stagingPlan, validatePublishPlan } from './athlete-photo-core.mjs'
import { runImporter } from './import-athlete-photos.mjs'
import { VERIFIED_NO_PHOTO_NAMES, LOW_CONFIDENCE_NAMES, PROFILE_SLUG_OVERRIDES } from './athlete-photo-policy.mjs'

const runtime = await loadPhotoRuntime()
const manifest = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-pilot-batch.json', 'utf8'))
const targets = selectBatch(runtime.athletes, manifest)
const expectedMen = ['Harry Palmer','Panagiotis Bitados','Justus Nieschlag','Nick Thompson','Cameron Main','Pierre Le Corre','Alistair Brownlee','David McNamee','Nicolas Mann','Wilhelm Hirsch']
const expectedWomen = ['Emma Pallant-Browne','Anne Reischmann','Nikki Bartlett','Laura Madsen','Anne Haug','Alice Alberts','Maja Stage Nielsen','Laura Jansen','Lisa Becharas','Nina Derron']
const imageUrl = 'https://content.protriathletes.org/content/images/2026/01/11111111-1111-1111-1111-111111111111.png'
function html(a, image = imageUrl) {
  const url = expectedProfileUrl(a)
  return `<html><head><link rel="canonical" href="${url}"><meta property="og:title" content="${a.nameEn} - Pro Triathlon Results | PTO">${image ? `<meta property="og:image" content="${image}">` : ''}</head><body><h2 class="headline">${a.nameEn}</h2>${image ? `<a class="athlete-pic-group" href="${url}"><picture><img src="${image}"></picture></a>` : ''}</body></html>`
}
function response(a, content = html(a)) { return { requestedUrl: expectedProfileUrl(a), finalUrl: expectedProfileUrl(a), status: 200, html: content } }
async function tempRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tri-photo-test-'))
  await fs.mkdir(path.join(root, 'public/athletes'), { recursive: true })
  await fs.mkdir(path.join(root, '.athlete-photo-staging/keep'), { recursive: true })
  await fs.writeFile(path.join(root, '.athlete-photo-staging/keep/existing'), 'unchanged staging')
  await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest))
  return root
}

test('runtime exact identities include apostrophes, diacritics, hyphens, composite names and every catalog type', () => {
  assert.equal(runtime.athletes.length, 1161)
  const valentina = runtime.athletes.find(a => a.nameEn === "Valentina D'Angeli")
  assert.ok(valentina)
  assert.equal(runtime.athletes.some(a => a.nameEn === 'Valentina D'), false)
  assert.notEqual(valentina.nameEn, 'Valentina D')
  const one = { schemaVersion: 1, batchId: 'exact', athletes: [{ athleteId: valentina.id, nameEn: valentina.nameEn, gender: valentina.gender }] }
  assert.equal(selectBatch(runtime.athletes, one)[0].id, valentina.id)
  assert.throws(() => selectBatch(runtime.athletes, { ...one, athletes: [{ ...one.athletes[0], nameEn: 'Valentina D' }] }), /identity mismatch/)
  for (const n of ['Daniel Bækkegård','Emma Pallant-Browne','Maja Stage Nielsen']) assert.ok(runtime.athletes.some(a => a.nameEn === n))
  assert.deepEqual([...new Set(runtime.athletes.map(a => a.catalogType))].sort(), ['curated','generated','verified generated'])
})

test('pilot manifest is exactly the independently specified 10 MEN and 10 WOMEN; rejects duplicates/unknown IDs', () => {
  assert.deepEqual(targets.filter(a => a.gender === 'M').map(a => a.nameEn), expectedMen)
  assert.deepEqual(targets.filter(a => a.gender === 'W').map(a => a.nameEn), expectedWomen)
  assert.equal(targets.length, 20)
  assert.throws(() => selectBatch(runtime.athletes, { ...manifest, athletes: [...manifest.athletes, manifest.athletes[0]] }), /Duplicate/)
  assert.throws(() => selectBatch(runtime.athletes, { ...manifest, athletes: [{ ...manifest.athletes[0], athleteId: -1 }] }), /identity mismatch/)
})

test('profile verification requires final URL, canonical, headline and title; HTTP 200 or name elsewhere insufficient', () => {
  const a = targets[0], ok = response(a)
  assert.equal(verifyProfile(a, ok).status, 'VERIFIED')
  for (const patch of [
    { finalUrl: 'https://stats.protriathletes.org/athlete/someone-else' },
    { finalUrl: 'https://other.example/athlete/harry-palmer' },
    { html: html(a).replace('class="headline">Harry Palmer', 'class="headline">Someone Else') },
    { html: html(a).replace('rel="canonical"', 'rel="alternate"') },
    { html: html(a).replace('Harry Palmer - Pro', 'Someone Else - Pro') },
    { html: '<h2>Someone Else</h2><p>Harry Palmer rivals</p>' },
    { status: 404 },
  ]) assert.equal(verifyProfile(a, { ...ok, ...patch }).status, 'RETRY_UNRESOLVED')
})

test('overrides are respected; name aliases require source and reason', () => {
  const a = runtime.athletes.find(a => a.nameEn === 'Hannah Berry')
  assert.equal(expectedProfileUrl(a), 'https://stats.protriathletes.org/athlete/hannah-wells')
  assert.equal(Object.keys(PROFILE_SLUG_OVERRIDES).length, 14)
  const page = response(a, html(a).replaceAll('Hannah Berry', 'Hannah Wells'))
  assert.equal(verifyProfile(a, page).status, 'RETRY_UNRESOLVED')
  assert.equal(verifyProfile(a, page, { 'Hannah Berry': [{ name: 'Hannah Wells' }] }).status, 'RETRY_UNRESOLVED')
  const documented = { 'Hannah Berry': [{ name: 'Hannah Wells', sourceUrl: 'https://example.org/test-alias-evidence', reason: 'Synthetic documented alias fixture, not production evidence' }] }
  assert.equal(verifyProfile(a, page, documented).status, 'VERIFIED')
})

test('redirects to another athlete are not followed; same-profile slash redirect may pass', async () => {
  const a = targets[0], url = expectedProfileUrl(a); const calls = []
  const rejected = await fetchProfile(url, { fetchImpl: async u => { calls.push(u); return new Response('', { status: 302, headers: { location: '/athlete/other' } }) } })
  assert.equal(calls.length, 1)
  assert.match(rejected.error, /Unexpected redirect/)
  let count = 0
  const accepted = await fetchProfile(url, { fetchImpl: async () => ++count === 1 ? new Response('', { status: 301, headers: { location: url+'/' } }) : new Response(html(a), { headers: { 'content-type': 'text/html' } }) })
  assert.equal(count, 2)
  assert.equal(verifyProfile(a, accepted).status, 'VERIFIED')
  const bad = await fetchProfile(url, { fetchImpl: async () => new Response('image bytes', { headers: { 'content-type': 'image/png' } }) })
  assert.match(bad.error, /non-HTML/)
})

test('shared assets rejected at two distinct profiles, including PTO responsive derivatives; score cannot override rejection', () => {
  const c1 = discoverImages(html(targets[0]), expectedProfileUrl(targets[0]))
  const c2 = discoverImages(html(targets[1], imageUrl.replace('.png', '-w300.webp')), expectedProfileUrl(targets[1]))
  const shared = sharedAssets([{ athlete: { athleteId: 1 }, candidates: c1 }, { athlete: { athleteId: 2 }, candidates: c2 }])
  assert.equal(shared.size, 1)
  assert.equal(classify(c1.map(c => ({ ...c, score: 999999 })), shared).bestCandidateUrl, null)
  assert.notEqual(classify(c1, shared).confidence, 'HIGH')
})

test('site assets, placeholders and portraits linking to rivals rejected; ambiguous image stays MEDIUM/LOW', () => {
  const a = targets[0]
  const content = html(a)+`<img src="https://example.org/logo.png"><img src="https://example.org/placeholder.png"><a class="athlete-pic-group" href="/athlete/other"><img src="https://example.org/other.png"></a>`
  const cs = discoverImages(content, expectedProfileUrl(a))
  assert.equal(cs.filter(c => c.rejection).length, 3)
  assert.equal(classify(cs, new Set()).confidence, 'HIGH')
  const conflicting = discoverImages(html(a)+'<meta property="og:image" content="https://example.org/conflicting.png">', expectedProfileUrl(a))
  assert.equal(classify(conflicting, new Set()).confidence, 'MEDIUM')
  const unbound = discoverImages(html(a).replace('athlete-pic-group', 'unrelated'), expectedProfileUrl(a))
  assert.equal(classify(unbound, new Set()).confidence, 'MEDIUM')
  const raw = discoverImages(`<img src="${imageUrl}">`, expectedProfileUrl(a))
  assert.equal(classify(raw.map(c => ({ ...c, score: 999999 })), new Set()).confidence, 'LOW')
  assert.equal(classify([], new Set()).confidence, 'NO_PHOTO')
})

test('discovery isolated to exactly 20 profile URLs; no image requests, download metadata or automatic publication', async () => {
  const calls = []
  const decisions = await discoverBatch(targets, runtime.registry, { fetchPage: async url => {
    calls.push(url); const a = targets.find(a => expectedProfileUrl(a) === url); assert.ok(a)
    return response(a, html(a, `https://content.protriathletes.org/content/images/portrait-${a.id}.png`))
  } })
  assert.deepEqual(calls, targets.map(expectedProfileUrl))
  assert.equal(decisions.length, 20)
  for (const d of decisions) {
    assert.equal(d.confidence, 'HIGH')
    assert.equal(d.proposedAction, 'ACCEPT_FOR_MANUAL_REVIEW')
    assert.ok(d.checkedAt && d.verifiedProfileUrl && d.bestCandidateUrl && d.evidence.length)
    assert.equal(Object.hasOwn(d, 'localPath'), false)
    assert.equal(Object.hasOwn(d, 'checksum'), false)
  }
})

test('profile mismatch prevents image discovery, rather than merely lowering image score', async () => {
  const result = await discoverBatch([targets[0]], {}, { fetchPage: async () => response(targets[0], html(targets[1])) })
  assert.equal(result[0].confidence, 'RETRY_UNRESOLVED'); assert.deepEqual(result[0].candidates, [])
})

test('legacy no-photo normal skip is undated/unresolved; explicit recheck and audit-weak fetch within manifest', async () => {
  assert.equal(VERIFIED_NO_PHOTO_NAMES.size, 52); assert.equal(LOW_CONFIDENCE_NAMES.length, 50)
  const a = runtime.athletes.find(a => a.nameEn === 'Andy Krueger'); let calls = 0
  const fetchPage = async () => { calls++; return response(a, html(a, null)) }
  const normal = await discoverBatch([a], {}, { fetchPage })
  assert.equal(calls, 0); assert.equal(normal[0].confidence, 'RETRY_UNRESOLVED')
  for (const option of [{ recheck: true }, { auditWeak: true }]) {
    const result = await discoverBatch([a], {}, { ...option, fetchPage })
    assert.equal(result[0].confidence, 'NO_PHOTO'); assert.ok(result[0].checkedAt)
  }
  assert.equal(calls, 2)
})

test('existing/manual and Blummenfelt dual-source photos protected without both refresh and replace', () => {
  for (const name of ['Mika Noodt','Jelle Geens','Kristian Blummenfelt']) {
    const a = runtime.athletes.find(a => a.nameEn === name)
    assert.equal(photoProtection(a, runtime.registry).manual, true)
    assert.equal(photoProtection(a, runtime.registry).publishAllowed, false)
    assert.equal(photoProtection(a, runtime.registry, { refresh: true }).publishAllowed, false)
    assert.equal(photoProtection(a, runtime.registry, { refresh: true, replace: true }).publishAllowed, true)
  }
})

test('registry/file audit detects orphan, missing, duplicate paths/hashes and extension leftovers', async () => {
  const root = await tempRoot()
  try {
    await fs.writeFile(path.join(root, 'public/athletes/person.png'), 'bytes1')
    await fs.writeFile(path.join(root, 'public/athletes/person.jpg'), 'bytes1')
    const audit = await auditPhotoFiles(root, { One: '/athletes/person.png', Two: '/athletes/person.png', Missing: '/athletes/missing.png', Bad: '/athletes/../../secret' })
    for (const type of ['ORPHAN_FILE','MISSING_FILE','DUPLICATE_PATH','DUPLICATE_HASH','MULTIPLE_SLUG_FILES','INVALID_PATH']) assert.ok(audit.issues.some(i => i.startsWith(type)))
    const real = await auditPhotoFiles(process.cwd(), runtime.registry)
    assert.deepEqual(real.issues, []); assert.equal(real.entries, Object.keys(runtime.registry).length); assert.equal(real.files, real.entries)
    assert.equal(real.dualSourceCases[0].nameEn, 'Kristian Blummenfelt')
  } finally { await fs.rm(root, { recursive: true, force: true }) }
})

test('all 128 combinations of mutation/recheck/audit flags with dry-run preserve production, staging and registry snapshots', async () => {
  const root = await tempRoot()
  try {
    await fs.writeFile(path.join(root, 'registry.ts'), 'existing registry unchanged')
    await fs.writeFile(path.join(root, 'public/athletes/existing.png'), 'existing photo')
    const fakeRuntime = { athletes: runtime.athletes, registry: { Existing: '/athletes/existing.png' }, invariants: runtime.invariants }
    const flags = ['--clean-no-photo','--stage','--publish','--refresh','--replace','--audit-weak','--recheck']
    const before = await snapshotTree(root)
    for (let mask = 0; mask < 128; mask++) {
      const args = ['--batch','manifest.json','--dry-run', ...flags.filter((_, i) => mask & (1 << i))]
      const report = await runImporter(args, { root, runtime: fakeRuntime, delayMs: 0, fetchPage: async url => response(targets.find(a => expectedProfileUrl(a) === url), html(targets.find(a => expectedProfileUrl(a) === url), null)) })
      assert.equal(report.immutability.passed, true)
      assert.equal(report.immutability.before, report.immutability.after)
    }
    for (const extra of [['--all'],['--only','Someone'],['--unknown'],['--batch'],['--batch','manifest.json']]) {
      await assert.rejects(runImporter(['--batch','manifest.json','--dry-run',...extra], { root, runtime: fakeRuntime }))
    }
    for (const flag of ['--stage','--publish','--clean-no-photo']) await assert.rejects(runImporter(['--batch','manifest.json',flag], { root, runtime: fakeRuntime }), /disabled/)
    assert.deepEqual(await snapshotTree(root), before)
  } finally { await fs.rm(root, { recursive: true, force: true }) }
})

test('snapshot guard detects unexpected mutation even during discovery', async () => {
  const root = await tempRoot()
  try {
    await assert.rejects(runImporter(['--batch','manifest.json','--dry-run'], { root, runtime: { ...runtime, registry: {} }, delayMs: 0, fetchPage: async () => { await fs.writeFile(path.join(root, '.athlete-photo-staging/unexpected'), 'bad'); throw new Error('network failure') } }), /mutated repository/)
  } finally { await fs.rm(root, { recursive: true, force: true }) }
})

test('future staging/publish contracts require bound identity, human review, staged checksum and clean projected filesystem', async () => {
  const [d] = await discoverBatch([targets[0]], {}, { fetchPage: async () => response(targets[0]) })
  const plan = stagingPlan(d)
  assert.ok(plan.stagingDirectory.startsWith('.athlete-photo-staging/'))
  assert.equal('checksum' in plan, false); assert.equal('localPath' in plan, false)
  assert.throws(() => stagingPlan({ ...d, confidence: 'LOW' }), /eligible/)
  const checksum = 'a'.repeat(64)
  const acceptance = { reviewer: 'test', reviewedAt: '2026-09-24', athleteId: d.athlete.athleteId, sourceUrl: d.bestCandidateUrl, checksum }
  const staged = { decoded: true, checksum, sourceUrl: d.bestCandidateUrl, athleteId: d.athlete.athleteId, stagingPath: plan.stagingDirectory+'/portrait.png' }
  const proposal = { decision: d, acceptance, staged, projectedAudit: { issues: [] } }
  assert.equal(validatePublishPlan(proposal).writerEnabled, false)
  assert.throws(() => validatePublishPlan({ ...proposal, acceptance: null }), /acceptance/)
  assert.throws(() => validatePublishPlan({ ...proposal, staged: { ...staged, checksum: 'b'.repeat(64) } }), /checksum/)
  assert.throws(() => validatePublishPlan({ ...proposal, existing: '/athletes/old.jpg' }), /protected/)
  assert.throws(() => validatePublishPlan({ ...proposal, projectedAudit: { issues: ['MULTIPLE_SLUG_FILES: old.jpg'] } }), /Projected/)
})

// Staging/publish integration tests use isolated temporary production roots only.
import "./test-athlete-photo-staging.mjs"

test('published pilot preserves baseline photos and binds all 16 runtime images to manually reviewed bytes', async () => {
  const baseline = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-pilot-production-baseline.json', 'utf8'))
  const reviewed = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-pilot-reviewed-manifest.json', 'utf8'))
  const approvals = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-pilot-manual-review.json', 'utf8'))
  const evidence = JSON.parse(await fs.readFile('src/data/athletes/athletePhotoEvidence.json', 'utf8'))
  const { sha256 } = await import('./athlete-photo-core.mjs')
  assert.equal(approvals.manifestSha256, sha256(Buffer.from(JSON.stringify(reviewed))))
  assert.equal(reviewed.entries.length, 16)
  assert.equal(Object.keys(runtime.registry).length, baseline.registryCount + 16 + 28 + 29)
  assert.equal(runtime.athletes.filter(a => a.image).length, 222)
  assert.equal(runtime.athletes.filter(a => !a.image).length, 939)
  const batch2 = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch2-reviewed-manifest.json', 'utf8'))
  const batch3 = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch3-reviewed-manifest.json', 'utf8'))
  assert.deepEqual(Object.keys(evidence.entries).sort(), [...reviewed.entries, ...batch2.entries, ...batch3.entries].map(e => String(e.athlete.athleteId)).sort())
  for (const [name, oldPath] of Object.entries(baseline.registry)) assert.equal(runtime.registry[name], oldPath)
  for (const [file, hash] of Object.entries({ ...baseline.existingPhotoHashes, ...baseline.bundledPhotoHashes })) assert.equal(sha256(await fs.readFile(file)), hash, file)
  for (const entry of reviewed.entries) {
    const approved = approvals.entries.find(a => a.athleteId === entry.athlete.athleteId)
    const published = evidence.entries[entry.athlete.athleteId]
    assert.equal(entry.reviewStatus, 'APPROVED'); assert.equal(approved.reviewStatus, 'APPROVED')
    assert.equal(approved.reviewMethod, 'manual-visual-review')
    assert.equal(published.sha256, approved.sha256)
    assert.equal(sha256(await fs.readFile('public' + published.localPath)), approved.sha256)
    assert.equal(runtime.registry[entry.athlete.nameEn], published.localPath)
    assert.equal(runtime.athletes.find(a => a.id === entry.athlete.athleteId).image, published.localPath)
    assert.deepEqual(published.review, approved)
  }
})

test('Batch 2 selection replays production ranking at saved asOf and isolates 50 missing-photo identities',async()=>{
  const batch=JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch2-batch.json','utf8'))
  const {selectPhotoBatch2}=await import('./select-athlete-photo-batch.mjs')
  const baseline=JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch2-production-baseline.json','utf8'))
  assert.deepEqual(await selectPhotoBatch2(new Date(batch.asOf),baseline),batch)
  assert.equal(batch.athletes.length,50);assert.equal(new Set(batch.athletes.map(a=>a.athleteId)).size,50)
  for(const gender of ['M','W']){
    const group=batch.athletes.filter(a=>a.gender===gender);assert.equal(group.length,25)
    assert.ok(group.every(a=>a.rankingPosition<=100&&a.selectionPriority==='TOP100'))
    assert.deepEqual(group.map(a=>a.rankingPosition),group.map(a=>a.rankingPosition).sort((a,b)=>a-b))
  }
  for(const row of batch.athletes){
    const athlete=runtime.athletes.find(a=>a.id===row.athleteId)
    assert.equal(athlete.nameEn,row.nameEn);assert.equal(athlete.gender,row.gender)
    assert.ok(!baseline.runtimeImages.find(a=>a.id===row.athleteId).image);assert.ok(!baseline.registry[row.nameEn]);assert.ok(!batch.exclusions.includes(row.nameEn))
  }
  const discovery=JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch2-discovery.json','utf8'))
  const staged=JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch2-staging-manifest.json','utf8'))
  const high=discovery.decisions.filter(d=>d.confidence==='HIGH')
  assert.deepEqual(staged.entries.map(e=>[e.athlete.athleteId,e.sourceImageUrl]),high.map(d=>[d.athlete.athleteId,d.bestCandidateUrl]))
  assert.ok(staged.entries.every(e=>e.reviewStatus==='PENDING_MANUAL_REVIEW'&&!e.manualReview&&!e.reviewedAt&&!e.localPath))
  assert.equal(staged.productionPhotosCompared,165)
})

test('published Batch 2 preserves all 165 photos and binds exactly 28 runtime portraits to user-reviewed bytes',async()=>{
  const read=async suffix=>JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch2-'+suffix+'.json','utf8'))
  const baseline=await read('production-baseline'),manifest=await read('reviewed-manifest'),reviews=await read('manual-review')
  const evidence=JSON.parse(await fs.readFile('src/data/athletes/athletePhotoEvidence.json','utf8'))
  const {sha256}=await import('./athlete-photo-core.mjs')
  assert.equal(manifest.entries.length,28);assert.equal(reviews.entries.length,28)
  assert.equal(reviews.manifestSha256,sha256(Buffer.from(JSON.stringify(manifest))))
  const audit=await auditPhotoFiles(process.cwd(),runtime.registry)
  assert.equal(audit.entries,222);assert.equal(audit.files,222);assert.deepEqual(audit.issues,[])
  for(const [p,h]of Object.entries(baseline.photos))assert.equal(sha256(await fs.readFile('public'+p)),h,p)
  for(const [id,e]of Object.entries(baseline.evidence.entries))assert.deepEqual(evidence.entries[id],e)
  for(const old of baseline.runtimeImages.filter(a=>a.image))assert.equal(runtime.athletes.find(a=>a.id===old.id).image,old.image)
  for(const e of manifest.entries){
    const review=reviews.entries.find(r=>r.athleteId===e.athlete.athleteId),published=evidence.entries[e.athlete.athleteId]
    assert.equal(e.discoveryConfidence,'HIGH');assert.equal(e.reviewStatus,'APPROVED');assert.equal(review.reviewStatus,'APPROVED');assert.equal(review.reviewMethod,'manual-visual-review')
    assert.deepEqual(review.athlete,e.athlete);assert.equal(review.sha256,e.sha256);assert.equal(review.sourceImageUrl,e.sourceImageUrl);assert.equal(review.verifiedProfileUrl,e.verifiedProfileUrl)
    assert.equal(published.batchId,'photo-batch-2');assert.equal(published.reviewedSha256,e.sha256);assert.equal(published.publishedSha256,e.sha256);assert.deepEqual(published.review,review)
    assert.equal(sha256(await fs.readFile(e.localStagingPath)),e.sha256);assert.equal(sha256(await fs.readFile('public'+published.localPath)),e.sha256)
    assert.equal(runtime.registry[e.athlete.nameEn],published.localPath);assert.equal(runtime.athletes.find(a=>a.id===e.athlete.athleteId).image,published.localPath)
  }
})

test('Batch 3 selection replays 50 per gender, excludes previous batches, and stages only HIGH without approval',async()=>{
  const read=async name=>JSON.parse(await fs.readFile(`scripts/fixtures/athlete-photo-${name}.json`,'utf8'))
  const batch=await read('batch3-batch'),discovery=await read('batch3-discovery'),accepted=await read('batch3-download-candidates'),staging=await read('batch3-staging-manifest'),previous=await read('batch2-discovery'),published=await read('batch2-reviewed-manifest')
  const {selectPhotoBatch}=await import('./select-athlete-photo-batch.mjs')
  const baseline=await read('batch3-production-baseline')
  const replay=await selectPhotoBatch({photoBaseline:baseline,asOf:new Date(batch.asOf),batchId:'photo-batch-3',perGender:50,priorityRankLimit:200,additionalExclusions:[...previous.decisions.filter(d=>d.confidence!=='HIGH').map(d=>d.athlete.nameEn),...published.entries.map(e=>e.athlete.nameEn)]})
  assert.deepEqual({...batch,athletes:batch.athletes.map(({nameRu,...row})=>{void nameRu;return row})},replay)
  assert.equal(batch.athletes.length,100);assert.equal(new Set(batch.athletes.map(a=>a.athleteId)).size,100)
  for(const gender of ['M','W'])assert.equal(batch.athletes.filter(a=>a.gender===gender).length,50)
  for(const row of batch.athletes){const a=runtime.athletes.find(a=>a.id===row.athleteId);assert.ok(a);assert.ok(!baseline.runtimeImages.find(r=>r.id===a.id).image&&!baseline.registry[a.nameEn]);assert.ok(!batch.exclusions.includes(a.nameEn));assert.ok(row.rankingPosition<=200||row.resultRows>=5);assert.equal(row.nameRu,/[А-Яа-яЁё]/.test(a.name)?a.name:null)}
  const high=discovery.decisions.filter(d=>d.confidence==='HIGH')
  assert.equal(discovery.targetCount,100);assert.equal(discovery.immutability.passed,true)
  assert.deepEqual(accepted.candidates.map(c=>[c.athleteId,c.sourceImageUrl]),high.map(d=>[d.athlete.athleteId,d.bestCandidateUrl]))
  assert.deepEqual(staging.entries.map(e=>[e.athlete.athleteId,e.sourceImageUrl]),high.map(d=>[d.athlete.athleteId,d.bestCandidateUrl]))
  assert.equal(staging.productionPhotosCompared,193)
  const {sha256}=await import('./athlete-photo-core.mjs')
  for(const e of staging.entries){assert.equal(e.reviewStatus,'PENDING_MANUAL_REVIEW');assert.ok(!e.reviewedAt&&!e.review&&!e.localPath);assert.equal(sha256(await fs.readFile(e.localStagingPath)),e.sha256)}
})

test('published Batch 3 preserves all 193 photos and binds exactly 29 runtime portraits to user-reviewed bytes',async()=>{
  const read=async suffix=>JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-batch3-'+suffix+'.json','utf8'))
  const baseline=await read('production-baseline'),manifest=await read('reviewed-manifest'),reviews=await read('manual-review')
  const evidence=JSON.parse(await fs.readFile('src/data/athletes/athletePhotoEvidence.json','utf8'))
  const {sha256}=await import('./athlete-photo-core.mjs')
  assert.equal(manifest.entries.length,29);assert.equal(reviews.entries.length,29)
  assert.equal(reviews.manifestSha256,sha256(Buffer.from(JSON.stringify(manifest))))
  const audit=await auditPhotoFiles(process.cwd(),runtime.registry)
  assert.equal(audit.entries,222);assert.equal(audit.files,222);assert.deepEqual(audit.issues,[])
  for(const [p,h]of Object.entries(baseline.photos))assert.equal(sha256(await fs.readFile('public'+p)),h,p)
  for(const [id,e]of Object.entries(baseline.evidence.entries))assert.deepEqual(evidence.entries[id],e)
  for(const old of baseline.runtimeImages.filter(a=>a.image))assert.equal(runtime.athletes.find(a=>a.id===old.id).image,old.image)
  for(const e of manifest.entries){
    const review=reviews.entries.find(r=>r.athleteId===e.athlete.athleteId),published=evidence.entries[e.athlete.athleteId]
    assert.equal(e.discoveryConfidence,'HIGH');assert.equal(e.reviewStatus,'APPROVED');assert.equal(review.reviewStatus,'APPROVED');assert.equal(review.reviewMethod,'manual-visual-review')
    assert.deepEqual(review.athlete,e.athlete);assert.equal(review.sha256,e.sha256);assert.equal(review.sourceImageUrl,e.sourceImageUrl);assert.equal(review.verifiedProfileUrl,e.verifiedProfileUrl)
    assert.equal(published.batchId,'photo-batch-3');assert.equal(published.reviewedSha256,e.sha256);assert.equal(published.publishedSha256,e.sha256);assert.deepEqual(published.review,review)
    assert.equal(sha256(await fs.readFile(e.localStagingPath)),e.sha256);assert.equal(sha256(await fs.readFile('public'+published.localPath)),e.sha256)
    assert.equal(runtime.registry[e.athlete.nameEn],published.localPath);assert.equal(runtime.athletes.find(a=>a.id===e.athlete.athleteId).image,published.localPath)
  }
})
