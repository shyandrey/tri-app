import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { createServer } from 'vite'
import { auditAthleteLocalization } from './athlete-localization-audit.mjs'
import { parseUniqueJSON } from './athlete-name-review.mjs'

// Compare against the current catalog, not historical localization-wave spellings
// or ranking hashes from older result datasets. Manual reviews may change names.
const registryPath = 'src/data/athletes/athleteLocalization.json'
const registryBytes = await fs.readFile(registryPath, 'utf8')
const registry = parseUniqueJSON(registryBytes)
const directory = await fs.mkdtemp(`${process.cwd()}/.localization-test-`)
const output = `${directory}/athletes.ts`
const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
try {
  const c = await server.ssrLoadModule('/src/data/athletes/index.ts')
  const { localizeAthlete } = await server.ssrLoadModule('/src/data/athletes/localization.ts')
  const raw = [...c.maleAthletes, ...c.femaleAthletes, ...c.resultAthletes, ...c.verifiedResultAthletes]
  assert.deepEqual(auditAthleteLocalization(registry, raw, c.athletes), [])
  assert.deepEqual(c.athletes.map(a => [a.id, a.nameEn]), raw.map(a => [a.id, a.nameEn]))
  const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
  const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
  const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
  const { normalizeAthleteIdentityName: norm } = await server.ssrLoadModule('/src/data/athleteIdentity.ts')
  const { sortAthletesByRanking, calculateAthleteRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
  const resultSnapshot = structuredClone(raceResults), linked = linkResultsToAthletes(raceResults)
  const rawIds = new Map(raw.map(a => [norm(a.nameEn), a.id]))
  assert.deepEqual(linked, raceResults.map(r => ({ ...r, athleteId: rawIds.get(norm(r.athleteName)) ?? r.athleteId })))
  execFileSync(process.execPath, ['scripts/find-next-athletes.mjs', '--write', '--full-regenerate', '--output', output], { stdio: 'pipe' })
  const bytes = await fs.readFile(output, 'utf8')
  const { resultAthletes: regenerated } = await server.ssrLoadModule(output)
  assert.deepEqual(regenerated.map(({ name, ...rest }) => rest), c.resultAthletes.map(({ name, ...rest }) => rest), 'Regeneration must preserve all non-display data')
  assert.deepEqual(regenerated.map(localizeAthlete), c.resultAthletes.map(localizeAthlete))
  const replacement = new Map(regenerated.map(a => [a.id, localizeAthlete(a)]))
  const after = c.athletes.map(a => replacement.get(a.id) ?? a)
  // Keep the historical as-of dates as useful ranking checks, with current inputs.
  const fixtures = await Promise.all([1, 2, 3].map(n => fs.readFile(`scripts/fixtures/athlete-localization-wave${n}.json`, 'utf8').then(JSON.parse)))
  const review = JSON.parse(await fs.readFile('scripts/fixtures/athlete-localization-priority-a-review.json', 'utf8'))
  for (const fixture of [...fixtures, review]) {
    const date = new Date(fixture.asOf)
    const scores = calculateAthleteRanking(raw, linked, allRaceEditionViews, date)
    const order = sortAthletesByRanking(raw, linked, allRaceEditionViews, date).map(a => a.id)
    for (const catalog of [c.athletes, after]) {
      assert.deepEqual(calculateAthleteRanking(catalog, linked, allRaceEditionViews, date), scores)
      assert.deepEqual(sortAthletesByRanking(catalog, linked, allRaceEditionViews, date).map(a => a.id), order)
    }
  }
  for (const [nameEn, entry] of Object.entries(registry)) {
    const nameRu = typeof entry === 'string' ? entry : entry.nameRu
    assert.equal(c.athletes.find(a => a.nameEn === nameEn)?.name, nameRu)
    assert.equal(after.find(a => a.nameEn === nameEn)?.name, nameRu)
  }
  execFileSync(process.execPath, ['scripts/find-next-athletes.mjs', '--write', '--full-regenerate', '--output', output], { stdio: 'pipe' })
  assert.equal(await fs.readFile(output, 'utf8'), bytes)
  assert.equal(await fs.readFile(registryPath, 'utf8'), registryBytes)
  assert.deepEqual(linkResultsToAthletes(raceResults), linked)
  assert.deepEqual(raceResults, resultSnapshot)
  console.log(`PASS: ${Object.keys(registry).length} current overrides; runtime and full regeneration agree; deterministic output; IDs/nameEn/non-display data/ranking/linkage unchanged; source registry untouched.`)
} finally { await server.close(); await fs.rm(directory, { recursive: true, force: true }) }
