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
  assert.equal(Object.keys(runtime.registry).length, baseline.registryCount + 16)
  assert.equal(runtime.athletes.filter(a => a.image).length, 165)
  assert.equal(runtime.athletes.filter(a => !a.image).length, 996)
  assert.deepEqual(Object.keys(evidence.entries).sort(), reviewed.entries.map(e => String(e.athlete.athleteId)).sort())
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
