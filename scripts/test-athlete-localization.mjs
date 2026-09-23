import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createServer } from 'vite'
import { auditAthleteLocalization } from './athlete-localization-audit.mjs'

const registryPath = 'src/data/athletes/athleteLocalization.json'
const registryBytes = await fs.readFile(registryPath, 'utf8')
const registry = JSON.parse(registryBytes)
const temporaryDirectory = await fs.mkdtemp(`${process.cwd()}/.localization-test-`)
const output = `${temporaryDirectory}/athletes.ts`
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
try {
  const { athletes, resultAthletes, maleAthletes, femaleAthletes, verifiedResultAthletes } = await server.ssrLoadModule('/src/data/athletes/index.ts')
  const { localizeAthlete } = await server.ssrLoadModule('/src/data/athletes/localization.ts')
  const curated = [...maleAthletes, ...femaleAthletes, ...verifiedResultAthletes]
  // Frozen wave selection and hashes were captured before adding any names.
  const wave = JSON.parse(await fs.readFile('scripts/fixtures/athlete-localization-wave1.json', 'utf8'))
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
  for (const [nameEn, original] of Object.entries(wave.originalRegistry)) {
    assert.equal(registry[nameEn], original, `Original override changed: ${nameEn}`)
  }
  const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
  const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
  const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
  const { sortAthletesByRanking, calculateAthleteRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
  const linked = linkResultsToAthletes(raceResults)
  const asOf = new Date(wave.asOf)
  const ranked = sortAthletesByRanking(athletes, linked, allRaceEditionViews, asOf)
  assert.equal(hash(ranked.map(a => a.id)), wave.beforeHashes.rankingOrder, 'Production ranking order changed')
  assert.equal(hash(calculateAthleteRanking(athletes, linked, allRaceEditionViews, asOf)), wave.beforeHashes.rankingScores, 'Production ranking scores changed')
  assert.equal(hash(resultAthletes.map(({ name, ...rest }) => rest)), wave.beforeHashes.generatedNonDisplayData, 'Non-display generated data changed')
  assert.equal(hash(linked), wave.beforeHashes.linkedResults, 'Result linkage changed')
  const generatedIds = new Set([...resultAthletes, ...verifiedResultAthletes].map(a => a.id))
  for (const gender of ['M', 'W']) {
    const selected = ranked.filter(a => a.gender === gender && generatedIds.has(a.id) && !Object.hasOwn(wave.originalRegistry, a.nameEn)).slice(0, 100)
    const expected = wave.athletes.filter(a => a.gender === gender)
    assert.equal(expected.length, 100)
    assert.deepEqual(selected.map(a => a.nameEn), expected.map(a => a.nameEn), 'Wave must use production ranking, not generated-file order')
  }
  for (const row of wave.athletes) {
    if (row.status === 'REVIEW_REQUIRED') {
      assert.ok(row.reason)
      assert.equal(Object.hasOwn(registry, row.nameEn), false, `Unresolved name added: ${row.nameEn}`)
    } else {
      assert.deepEqual(registry[row.nameEn], { nameRu: row.nameRu, provenance: 'generated-reviewed' })
    }
  }
  assert.equal(Object.keys(registry).length, Object.keys(wave.originalRegistry).length + wave.athletes.filter(a => a.status === 'LOCALIZED').length, 'No names outside the selected wave')
  // Execute the real full generator: output starts absent, no copying of generated names.
  execFileSync(process.execPath, ['scripts/find-next-athletes.mjs', '--write', '--output', output], { stdio: 'pipe' })
  const firstOutput = await fs.readFile(output, 'utf8')
  const { resultAthletes: regenerated } = await server.ssrLoadModule(output)
  assert.equal(regenerated.length, resultAthletes.length)
  assert.deepEqual(regenerated.map(({ name, ...identityAndData }) => identityAndData),
    resultAthletes.map(({ name, ...identityAndData }) => identityAndData), 'IDs, English names, order and country enrichment must survive')
  assert.deepEqual(regenerated.map(localizeAthlete), resultAthletes.map(localizeAthlete), 'All display names must survive full regeneration')
  const regeneratedById = new Map(regenerated.map(a => [a.id, localizeAthlete(a)]))
  const regeneratedCatalog = athletes.map(a => regeneratedById.get(a.id) ?? a)
  assert.equal(hash(sortAthletesByRanking(regeneratedCatalog, linked, allRaceEditionViews, asOf).map(a => a.id)), wave.beforeHashes.rankingOrder, 'Regeneration changed production ranking order')
  const after = [...curated, ...regenerated].map(localizeAthlete)
  assert.deepEqual(auditAthleteLocalization(registry, [...curated, ...regenerated], after), [])
  for (const [nameEn, entry] of Object.entries(registry)) {
    const nameRu = typeof entry === 'string' ? entry : entry.nameRu
    assert.equal(athletes.find(a => a.nameEn === nameEn)?.name, nameRu)
    assert.equal(after.find(a => a.nameEn === nameEn)?.name, nameRu)
    const generated = regenerated.find(a => a.nameEn === nameEn)
    if (generated) assert.equal(generated.name, nameRu, 'Generator must persist the localized display name itself')
  }
  execFileSync(process.execPath, ['scripts/find-next-athletes.mjs', '--write', '--output', output], { stdio: 'pipe' })
  assert.equal(await fs.readFile(output, 'utf8'), firstOutput, 'Regeneration must be deterministic')
  assert.equal(await fs.readFile(registryPath, 'utf8'), registryBytes, 'Generator must never rewrite the registry')

  const raw = { ...resultAthletes[0], name: 'Example Athlete', nameEn: 'Example Athlete' }
  const fixture = { 'Example Athlete': 'Пример' }
  assert.deepEqual(auditAthleteLocalization({}, [raw], [raw]), [], 'Missing translations are coverage TODOs, not consistency errors')
  assert.deepEqual(auditAthleteLocalization({ 'Example Athlete': { nameRu: 'Пример', provenance: 'generated-reviewed' } }, [raw], [{ ...raw, name: 'Пример' }]), [])
  assert.match(auditAthleteLocalization({ 'Example Athlete': { nameRu: 'Пример' } }, [raw], [{ ...raw, name: 'Пример' }])[0], /PROVENANCE INVALID/)
  assert.match(auditAthleteLocalization(fixture, [], [])[0], /IDENTITY MISSING/)
  assert.match(auditAthleteLocalization(fixture, [raw, raw], [])[0], /IDENTITY AMBIGUOUS/)
  assert.match(auditAthleteLocalization({ 'Example Athlete': 'English' }, [raw], [raw])[0], /ENTRY INVALID/)
  assert.match(auditAthleteLocalization(fixture, [raw], [raw])[0], /NOT APPLIED/)
  assert.match(auditAthleteLocalization(fixture, [{ ...raw, name: 'Другое имя' }], [raw])[0], /CONFLICT/)
  const registered = resultAthletes.find(a => Object.hasOwn(registry, a.nameEn))
  assert.equal(localizeAthlete({ ...registered, name: 'Ручное имя' }).name, 'Ручное имя')
  assert.equal(localizeAthlete(raw).name, raw.name, 'Unknown names must remain unchanged')
  console.log(`PASS: ${registry && Object.keys(registry).length} registry names preserved across full regeneration of ${regenerated.length} profiles; data/order unchanged; repeat output identical; audit failures detected.`)
  console.log(`PASS: wave 1 TOP-100 MEN + TOP-100 WOMEN; original 15 overrides unchanged; production ranking order/scores and result links match the pre-localization snapshot (${wave.asOf}).`)
} finally {
  await server.close()
  await fs.rm(temporaryDirectory, { recursive: true, force: true })
}
