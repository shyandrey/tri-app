import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseUniqueJSON, reviewAthleteNames, formatReports } from './athlete-name-review.mjs'
const raw = [{ id: 1, nameEn: 'Example Athlete', name: 'Example Athlete' }]
const localized = [{ ...raw[0], name: 'Пример' }]
test('review validation and status cover malformed/ambiguous inputs without guessing names', () => {
  const check = (registry = {}, reviewed = [], source = raw, runtime = localized) => reviewAthleteNames(registry, reviewed, source, runtime)
  assert.equal(check({}, [], raw, raw).rows[0].status, 'MISSING')
  assert.equal(check().rows[0].status, 'REVIEW')
  assert.equal(check({}, ['Example Athlete']).rows[0].status, 'APPROVED')
  for (const [registry, reviewed, source, runtime, code] of [
    [{ Unknown: 'Пример' }, [], raw, localized, 'ORPHAN_LOCALIZATION'],
    [{}, ['Unknown'], raw, localized, 'ORPHAN_REVIEW_KEY'],
    [{}, ['Example Athlete', 'Example Athlete'], raw, localized, 'DUPLICATE_REVIEW_KEY'],
    [{}, [42], raw, localized, 'INVALID_REVIEW_KEY'],
    [{}, {}, raw, localized, 'INVALID_REVIEW_LIST'],
    [{}, [], [...raw, ...raw], [...localized, ...localized], 'DUPLICATE_ID'],
    [{}, [], [...raw, { ...raw[0], id: 2 }], localized, 'AMBIGUOUS_IDENTITY'],
    [{}, [], raw, [{ ...localized[0], nameEn: 'Changed', id: 2 }], 'IDENTITY_CHANGED'],
    [{}, ['Example Athlete'], raw, raw, 'APPROVED_WITHOUT_RUSSIAN_NAME'],
  ]) assert.ok(check(registry, reviewed, source, runtime).issues.some(x => x.includes(code)), code)
  for (const value of ['', ' ', 7, null, {}, { nameRu: 7 }]) assert.ok(check({ 'Example Athlete': value }).issues.some(x => x.includes('INVALID_NAME')))
  assert.ok(check({ 'Example Athlete': 'Example' }).issues.some(x => x.includes('NON_RUSSIAN')))
  assert.ok(check({ 'Example Athlete': 'Пример Smith' }).issues.some(x => x.includes('MIXED_SCRIPT')))
  for (const name of ['Анна-Мария', 'Д’Анджело', "Д'Анджело", 'Жан — Поль']) assert.deepEqual(check({ 'Example Athlete': name }, [], raw, [{ ...raw[0], name }]).issues, [])
  for (const text of ['{"x":1,"x":2}', '{"x":1,"\\u0078":2}', '{"x":{"nameRu":"А","nameRu":"Б"}}']) assert.throws(() => parseUniqueJSON(text), /DUPLICATE_JSON_KEY/)
  assert.deepEqual(parseUniqueJSON('{"x":{"nameRu":"А"},"y":{"nameRu":"Б"}}'), { x: { nameRu: 'А' }, y: { nameRu: 'Б' } })
  const report = formatReports(check().rows)
  assert.ok(report.csv.startsWith('\uFEFF')); assert.ok(report.csv.includes('Пример')); assert.ok(report.md.includes('REVIEW'))
})
test('synthetic overrides propagate through runtime, pages, search and both result views without changing identities or ranking', async () => {
  const original = await fs.readFile('src/data/athletes/athleteLocalization.json', 'utf8')
  const registry = JSON.parse(original)
  const overrides = { 'Kristian Blummenfelt': 'Тестовое Имя', 'Aaron Belcher': 'Проверочное Имя' }
  const server = await createServer({ plugins: [{ name: 'in-memory-name-fixture', enforce: 'pre', load(id) {
    if (id.endsWith('/athleteLocalization.json')) return JSON.stringify({ ...registry, ...overrides })
  } }], server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
  try {
    const c = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const rawCatalog = [...c.maleAthletes, ...c.femaleAthletes, ...c.resultAthletes, ...c.verifiedResultAthletes]
    const { filterAthletes } = await server.ssrLoadModule('/src/utils/athleteSearch.ts')
    const { default: Profiles } = await server.ssrLoadModule('/src/pages/AthletesPage.tsx')
    const { default: Detail } = await server.ssrLoadModule('/src/pages/AthleteDetailPage.tsx')
    const { default: Results } = await server.ssrLoadModule('/src/components/RaceResultsTable.tsx')
    const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
    const snapshot = structuredClone(raceResults)
    const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
    const linked = linkResultsToAthletes(raceResults)
    const { calculateAthleteRanking, sortAthletesByRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
    const date = new Date('2026-10-02T00:00:00Z')
    assert.deepEqual(c.athletes.map(a => [a.id, a.nameEn]), rawCatalog.map(a => [a.id, a.nameEn]))
    assert.deepEqual(calculateAthleteRanking(c.athletes, linked, allRaceEditionViews, date), calculateAthleteRanking(rawCatalog, linked, allRaceEditionViews, date))
    assert.deepEqual(sortAthletesByRanking(c.athletes, linked, allRaceEditionViews, date).map(a => a.id), sortAthletesByRanking(rawCatalog, linked, allRaceEditionViews, date).map(a => a.id))
    for (const [nameEn, name] of Object.entries(overrides)) {
      const a = c.athletes.find(a => a.nameEn === nameEn)
      assert.equal(a.name, name)
      for (const search of [name, nameEn]) assert.ok(filterAthletes(c.athletes, { search, genderFilter: 'ALL', countryFilter: 'ALL' }).some(x => x.id === a.id))
      const noop = () => {}
      assert.ok(renderToStaticMarkup(React.createElement(Profiles, { athletes: [a], ranking: [], onBack: noop, onNavigate: noop, onAthleteClick: noop })).includes(name))
      assert.ok(renderToStaticMarkup(React.createElement(Detail, { athlete: a, results: [], races: [], onBack: noop, onNavigate: noop, onRaceClick: noop })).includes(name))
      const row = linked.find(r => r.athleteId === a.id)
      assert.ok(row)
      const html = renderToStaticMarkup(React.createElement(Results, { athletes: [a], results: [row], onAthleteClick: noop }))
      assert.equal(html.split(name).length - 1, 2, 'desktop and mobile use the same localized name')
      const fallback = renderToStaticMarkup(React.createElement(Results, { athletes: [], results: [{ ...row, athleteName: 'Unlinked Example' }], onAthleteClick: noop }))
      assert.equal(fallback.split('Unlinked Example').length - 1, 2)
    }
    assert.deepEqual(linkResultsToAthletes(raceResults), linked)
    assert.deepEqual(raceResults, snapshot)
    assert.equal(await fs.readFile('src/data/athletes/athleteLocalization.json', 'utf8'), original)
  } finally { await server.close() }
})
