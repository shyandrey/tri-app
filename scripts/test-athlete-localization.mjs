import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
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
  // Execute the real full generator: output starts absent, no copying of generated names.
  execFileSync(process.execPath, ['scripts/find-next-athletes.mjs', '--write', '--output', output], { stdio: 'pipe' })
  const firstOutput = await fs.readFile(output, 'utf8')
  const { resultAthletes: regenerated } = await server.ssrLoadModule(output)
  assert.equal(regenerated.length, resultAthletes.length)
  assert.deepEqual(regenerated.map(({ name, ...identityAndData }) => identityAndData),
    resultAthletes.map(({ name, ...identityAndData }) => identityAndData), 'IDs, English names, order and country enrichment must survive')
  assert.deepEqual(regenerated.map(localizeAthlete), resultAthletes.map(localizeAthlete), 'All display names must survive full regeneration')
  const after = [...curated, ...regenerated].map(localizeAthlete)
  assert.deepEqual(auditAthleteLocalization(registry, [...curated, ...regenerated], after), [])
  for (const [nameEn, nameRu] of Object.entries(registry)) {
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
  assert.match(auditAthleteLocalization(fixture, [], [])[0], /IDENTITY MISSING/)
  assert.match(auditAthleteLocalization(fixture, [raw, raw], [])[0], /IDENTITY AMBIGUOUS/)
  assert.match(auditAthleteLocalization({ 'Example Athlete': 'English' }, [raw], [raw])[0], /ENTRY INVALID/)
  assert.match(auditAthleteLocalization(fixture, [raw], [raw])[0], /NOT APPLIED/)
  assert.match(auditAthleteLocalization(fixture, [{ ...raw, name: 'Другое имя' }], [raw])[0], /CONFLICT/)
  const registered = resultAthletes.find(a => Object.hasOwn(registry, a.nameEn))
  assert.equal(localizeAthlete({ ...registered, name: 'Ручное имя' }).name, 'Ручное имя')
  assert.equal(localizeAthlete(raw).name, raw.name, 'Unknown names must remain unchanged')
  console.log(`PASS: ${registry && Object.keys(registry).length} registry names preserved across full regeneration of ${regenerated.length} profiles; data/order unchanged; repeat output identical; audit failures detected.`)
} finally {
  await server.close()
  await fs.rm(temporaryDirectory, { recursive: true, force: true })
}
