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
  // Frozen selections and hashes are captured before adding each wave.
  const waves = await Promise.all([1, 2, 3].map(async number => JSON.parse(
    await fs.readFile(`scripts/fixtures/athlete-localization-wave${number}.json`, 'utf8')
  )))
  const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
  const review = JSON.parse(await fs.readFile('scripts/fixtures/athlete-localization-priority-a-review.json', 'utf8'))
  const priorities = JSON.parse(await fs.readFile('scripts/fixtures/athlete-localization-review-priorities.json', 'utf8'))
  assert.equal(review.selectionMode, 'priority-a-review')
  assert.equal(hash(priorities), review.sourcePriorityReportHash, 'Priority selection snapshot changed')
  const priorityA = priorities.athletes.filter(a => a.priority === 'A')
  assert.equal(priorityA.length, 31)
  assert.deepEqual(review.athletes.map(({ proposedNameRu, confidence, status, evidence, rationale, ...original }) => original),
    priorityA, 'Review must cover exactly Priority A, preserving the original identities and reasons')
  const resolvedNames = new Set(review.athletes.filter(a => a.status === 'LOCALIZED').map(a => a.nameEn))
  const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
  const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
  const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
  const { sortAthletesByRanking, calculateAthleteRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
  const linked = linkResultsToAthletes(raceResults)
  const generatedIds = new Set([...resultAthletes, ...verifiedResultAthletes].map(a => a.id))
  const previousParticipants = new Set()
  const expectedRegistry = { ...waves[0].originalRegistry }
  for (const [index, wave] of waves.entries()) {
    if (index === 2) assert.equal(wave.selectionMode, 'all-remaining')
    assert.deepEqual(wave.originalRegistry, expectedRegistry, `Wave ${index + 1} baseline must match earlier accepted entries`)
    for (const [nameEn, original] of Object.entries(wave.originalRegistry)) {
      assert.deepEqual(registry[nameEn], original, `Earlier localization changed: ${nameEn}`)
    }
    const asOf = new Date(wave.asOf)
    const ranked = sortAthletesByRanking(athletes, linked, allRaceEditionViews, asOf)
    assert.equal(hash(ranked.map(a => a.id)), wave.beforeHashes.rankingOrder, 'Production ranking order changed')
    assert.equal(hash(calculateAthleteRanking(athletes, linked, allRaceEditionViews, asOf)), wave.beforeHashes.rankingScores, 'Production ranking scores changed')
    assert.equal(hash(resultAthletes.map(({ name, ...rest }) => rest)), wave.beforeHashes.generatedNonDisplayData, 'Non-display generated data changed')
    assert.equal(hash(linked), wave.beforeHashes.linkedResults, 'Result linkage changed')
    for (const gender of ['M', 'W']) {
      const genderRanked = ranked.filter(a => a.gender === gender)
      const selected = genderRanked.filter(a => generatedIds.has(a.id) &&
        !Object.hasOwn(wave.originalRegistry, a.nameEn) && !previousParticipants.has(a.nameEn)).slice(0, index < 2 ? 100 : undefined)
      const expected = wave.athletes.filter(a => a.gender === gender)
      if (index < 2) assert.equal(expected.length, 100)
      else assert.deepEqual(wave.summary[gender], {
        candidates: selected.length,
        localized: expected.filter(a => a.status === 'LOCALIZED').length,
        reviewRequired: expected.filter(a => a.status === 'REVIEW_REQUIRED').length,
      })
      assert.deepEqual(selected.map((a, i) => ({ id: a.id, nameEn: a.nameEn, countryCode: a.countryCode,
        selectionRank: i + 1, genderRank: genderRanked.findIndex(b => b.id === a.id) + 1 })),
      expected.map(({ id, nameEn, countryCode, selectionRank, genderRank }) => ({ id, nameEn, countryCode, selectionRank, genderRank })),
      'Wave must use production ranking, not generated-file order')
    }
    for (const row of wave.athletes) {
      assert.equal(previousParticipants.has(row.nameEn), false, 'Waves must not overlap, including REVIEW_REQUIRED')
      previousParticipants.add(row.nameEn)
      if (row.status === 'REVIEW_REQUIRED') {
        assert.ok(row.reason)
        if (!resolvedNames.has(row.nameEn)) {
          assert.equal(Object.hasOwn(registry, row.nameEn), false, `Unresolved name added: ${row.nameEn}`)
        }
      } else {
        assert.equal(row.status, 'LOCALIZED')
        assert.match(row.nameRu, /^[А-Яа-яЁё '\-]+$/, 'Russian display name must not contain Latin letters; particles may retain apostrophes')
        assert.deepEqual(registry[row.nameEn], { nameRu: row.nameRu, provenance: 'generated-reviewed' })
        expectedRegistry[row.nameEn] = registry[row.nameEn]
      }
    }
    if (wave.complexAccepted) {
      assert.equal(new Set(wave.complexAccepted).size, index === 2 ? 25 : 20)
      for (const nameEn of wave.complexAccepted) {
        const row = wave.athletes.find(a => a.nameEn === nameEn)
        assert.equal(row?.status, 'LOCALIZED', 'Complex examples must be accepted forms')
        assert.ok(row.localizationNote)
      }
    }
  }
  const allReviews = waves.flatMap(wave => wave.athletes.filter(a => a.status === 'REVIEW_REQUIRED'))
  const unlocalized = [...resultAthletes, ...verifiedResultAthletes].filter(a => !Object.hasOwn(registry, a.nameEn))
  assert.deepEqual(unlocalized.map(a => a.nameEn).sort(), allReviews.filter(a => !resolvedNames.has(a.nameEn)).map(a => a.nameEn).sort(),
    'Only explicitly resolved Priority A reviews may leave the unresolved set')
  // Wave 3 coverage is a historical snapshot, before the subsequent Priority A review.
  assert.deepEqual(waves[2].coverage, {
    generatedTotal: generatedIds.size,
    registryBefore: Object.keys(waves[2].originalRegistry).length,
    registryAfter: Object.keys(expectedRegistry).length,
    unlocalizedBefore: [...resultAthletes, ...verifiedResultAthletes].filter(a => !Object.hasOwn(waves[2].originalRegistry, a.nameEn)).length,
    unlocalizedAfter: allReviews.length,
    priorReviewRequiredExcluded: waves.slice(0, 2).flatMap(wave => wave.athletes.filter(a => a.status === 'REVIEW_REQUIRED')).length,
    allWavesReviewRequired: allReviews.length,
  })
  assert.equal(hash(expectedRegistry), review.beforeHashes.registry, 'All 656 earlier entries must remain unchanged')
  const generated = [...resultAthletes, ...verifiedResultAthletes]
  const count = rows => ({ MEN: rows.filter(a => a.gender === 'M').length, WOMEN: rows.filter(a => a.gender === 'W').length, total: rows.length })
  const localizedBefore = generated.filter(a => Object.hasOwn(expectedRegistry, a.nameEn))
  for (const row of review.athletes) {
    const original = allReviews.find(a => a.nameEn === row.nameEn)
    assert.ok(original, 'Reviewed athlete must have a historical REVIEW_REQUIRED decision')
    assert.equal(row.athleteId, original.id)
    assert.equal(Object.hasOwn(expectedRegistry, row.nameEn), false, 'Review cannot overwrite an existing localization')
    assert.ok(row.rationale && row.evidence.length)
    for (const source of row.evidence) {
      assert.match(source.url, /^https:\/\//)
      assert.ok(source.title && source.type && source.observation)
    }
    if (row.status === 'LOCALIZED') {
      assert.ok(['HIGH', 'MEDIUM'].includes(row.confidence))
      assert.match(row.proposedNameRu, /^[А-Яа-яЁё '\-]+$/)
      expectedRegistry[row.nameEn] = { nameRu: row.proposedNameRu, provenance: 'generated-reviewed' }
    } else {
      assert.equal(row.status, 'REVIEW_REQUIRED')
      assert.equal(row.confidence, 'UNRESOLVED')
      assert.equal(row.proposedNameRu, null)
      assert.equal(Object.hasOwn(registry, row.nameEn), false)
    }
  }
  assert.deepEqual(registry, expectedRegistry, 'No additions outside the waves and explicitly accepted Priority A decisions')
  assert.deepEqual(review.summary, {
    candidates: count(review.athletes),
    localized: count(review.athletes.filter(a => a.status === 'LOCALIZED')),
    reviewRequired: count(review.athletes.filter(a => a.status === 'REVIEW_REQUIRED')),
    HIGH: review.athletes.filter(a => a.confidence === 'HIGH').length,
    MEDIUM: review.athletes.filter(a => a.confidence === 'MEDIUM').length,
  })
  assert.deepEqual(review.coverage, {
    generatedTotal: generated.length, localizedBefore: count(localizedBefore),
    localizedAfter: count(generated.filter(a => Object.hasOwn(registry, a.nameEn))),
    unlocalizedBefore: allReviews.length, unlocalizedAfter: unlocalized.length,
  })
  const reviewDate = new Date(review.asOf)
  assert.equal(hash(sortAthletesByRanking(athletes, linked, allRaceEditionViews, reviewDate).map(a => a.id)), review.beforeHashes.rankingOrder)
  assert.equal(hash(calculateAthleteRanking(athletes, linked, allRaceEditionViews, reviewDate)), review.beforeHashes.rankingScores)
  assert.equal(hash(resultAthletes.map(({ name, ...rest }) => rest)), review.beforeHashes.generatedNonDisplayData)
  assert.equal(hash(linked), review.beforeHashes.linkedResults)
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
  for (const wave of [...waves, review]) {
    assert.equal(hash(sortAthletesByRanking(regeneratedCatalog, linked, allRaceEditionViews, new Date(wave.asOf)).map(a => a.id)), wave.beforeHashes.rankingOrder, 'Regeneration changed production ranking order')
    assert.equal(hash(calculateAthleteRanking(regeneratedCatalog, linked, allRaceEditionViews, new Date(wave.asOf))), wave.beforeHashes.rankingScores, 'Regeneration changed production ranking scores')
  }
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
  console.log('PASS: waves 1 and 2 each TOP-100 MEN + TOP-100 WOMEN; wave 3 covers all remaining candidates excluding earlier reviews; no overlap; earlier localizations unchanged; production ranking order/scores and result links match all three pre-localization snapshots.')
  console.log(`PASS: exactly 31 Priority A decisions; ${resolvedNames.size} explicit resolutions, ${review.athletes.length - resolvedNames.size} still unresolved; all earlier entries and other reviews unchanged; ranking order/scores and result links match the pre-review snapshot, including after regeneration.`)
} finally {
  await server.close()
  await fs.rm(temporaryDirectory, { recursive: true, force: true })
}
