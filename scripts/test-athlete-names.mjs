import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { parseUniqueJSON, catalogRows, formatReports, makeBaseline, planImport, parseCSV } from './athlete-name-review.mjs'
import { exportNameReview } from './audit-athlete-names.mjs'
import { importNames } from './import-athlete-names.mjs'
const raw = [
  { id: 1, nameEn: 'Example Athlete', name: 'Старое Имя' },
  { id: 2, nameEn: 'Missing Athlete', name: 'Missing Athlete' },
  { id: 3, nameEn: 'Other Athlete', name: 'Другое Имя' },
]
const registry = { 'Example Athlete': { nameRu: 'Старое Имя', provenance: 'generated-reviewed' }, 'Other Athlete': 'Другое Имя' }
const registryText = JSON.stringify(registry, null, 2) + '\n'
const rows = catalogRows(registry, raw, raw)
const baseline = makeBaseline(rows, raw, registryText)
const csv = value => formatReports(value).csv
const edited = () => rows.map(r => ({ ...r, name_ru: r.athlete_id === 1 ? 'Новое Имя' : r.athlete_id === 2 ? 'Добавленное Имя' : r.name_ru }))

test('export/import detects only edited names, preserves metadata and accepts CSV row sorting', () => {
  assert.deepEqual(parseCSV(csv(rows))[1], ['2', 'Missing Athlete', ''])
  assert.equal(planImport(csv(rows), baseline, baseline, registry).changes.length, 0)
  const plan = planImport(csv(edited().reverse()), baseline, baseline, registry)
  assert.equal(plan.unchanged, 1)
  assert.deepEqual(plan.changes.map(c => c.kind).sort(), ['ADDED', 'CHANGED'])
  assert.equal(plan.next['Example Athlete'].provenance, 'generated-reviewed')
  assert.equal(plan.next['Other Athlete'], registry['Other Athlete'])
  assert.deepEqual(registry, JSON.parse(registryText))
  assert.ok(!formatReports(rows).md.includes('Status'))
})
test('duplicate JSON properties are detected before parse, including escaped equivalents', () => {
  for (const text of ['{"x":1,"x":2}', '{"x":1,"\\u0078":2}', '{"x":{"nameRu":"А","nameRu":"Б"}}']) assert.throws(() => parseUniqueJSON(text), /DUPLICATE_JSON_KEY/)
})
test('entire import rejects identity/row edits, deletion, malformed CSV and stale snapshots', () => {
  const rejects = values => assert.throws(() => planImport(csv(values), baseline, baseline, registry))
  rejects(rows.map((r, i) => i === 0 ? { ...r, name_ru: '' } : r))
  rejects(rows.map((r, i) => i === 0 ? { ...r, name_en: 'Renamed' } : r))
  rejects(rows.map((r, i) => i === 0 ? { ...r, athlete_id: 99 } : r))
  rejects(rows.slice(1)); rejects([...rows, { ...rows[0], athlete_id: 99 }])
  rejects([rows[0], rows[0], rows[2]])
  rejects(rows.map((r, i) => i === 0 ? { ...r, athlete_id: 2 } : i === 1 ? { ...r, athlete_id: 1 } : r))
  for (const name of ['English', 'Имя Smith', ' Имя', 'Имя123', 'Имя\nДругое']) rejects(rows.map((r, i) => i === 0 ? { ...r, name_ru: name } : r))
  for (const name of ['Анна-Мария', 'Д’Анджело', "Д'Анджело"]) assert.equal(planImport(csv(rows.map((r, i) => i === 0 ? { ...r, name_ru: name } : r)), baseline, baseline, registry).changes.length, 1)
  for (const current of [{ ...baseline, catalog_sha256: 'changed' }, { ...baseline, localization_sha256: 'changed' }, { ...baseline, rows: rows.slice(1) }]) assert.throws(() => planImport(csv(rows), baseline, current, registry), /STALE_BASELINE/)
  for (const bad of ['athlete_id;name_en;name_ru\n', 'athlete_id,name_en,name_ru\n1,"unfinished', 'athlete_id,name_en,name_ru\n1,"x"junk,y']) assert.throws(() => parseCSV(bad))
  assert.deepEqual(parseCSV('athlete_id,name_en,name_ru\r\n1,"Example, ""Quoted""",Имя\r\n'), [['1', 'Example, "Quoted"', 'Имя']])
})
test('catalog validation rejects orphan/ambiguous/malformed overrides and changed identities', () => {
  assert.throws(() => catalogRows({ Unknown: 'Имя' }, raw, raw), /ORPHAN/)
  assert.throws(() => catalogRows({}, [...raw, raw[0]], raw), /DUPLICATE_ID/)
  assert.throws(() => catalogRows({}, [...raw, { ...raw[0], id: 4 }], raw), /AMBIGUOUS/)
  assert.throws(() => catalogRows({}, raw, raw.map((a, i) => i ? a : { ...a, nameEn: 'Different' })), /IDENTITY_CHANGED/)
  for (const value of ['', null, 3, {}, { nameRu: 3 }]) assert.throws(() => catalogRows({ 'Example Athlete': value }, raw, raw), /INVALID_NAME/)
})
test('filesystem round-trip: dry-run/no-op/invalid batch write nothing; write changes only registry', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'tri-name-csv-'))
  const target = path.join(dir, 'localization.json'), directory = path.join(dir, 'review')
  const load = async () => {
    const registryText = await fs.readFile(target, 'utf8'), registry = parseUniqueJSON(registryText)
    const localized = raw.map(a => { const e = registry[a.nameEn]; return { ...a, name: (typeof e === 'string' ? e : e?.nameRu) ?? a.name } })
    return { registryText, registry, baseline: makeBaseline(catalogRows(registry, raw, localized), raw, registryText) }
  }
  const tree = async () => Object.fromEntries(await Promise.all((await fs.readdir(dir, { recursive: true })).sort().map(async f => {
    const p = path.join(dir, f); return [f, (await fs.stat(p)).isFile() ? await fs.readFile(p, 'utf8') : null]
  })))
  try {
    await fs.writeFile(target, registryText)
    await fs.writeFile(path.join(dir, 'unrelated.json'), '{"keep":true}')
    await exportNameReview(await load(), directory)
    const unchanged = await tree()
    await importNames({ write: true, directory, target, load })
    assert.deepEqual(await tree(), unchanged)
    await fs.writeFile(path.join(directory, 'review.csv'), csv(edited()))
    const before = await tree()
    const dry = await importNames({ directory, target, load })
    assert.equal(dry.changes.length, 2); assert.deepEqual(await tree(), before)
    const invalid = edited(); invalid[1].name_ru = 'Latin'
    await fs.writeFile(path.join(directory, 'review.csv'), csv(invalid))
    const invalidBefore = await tree()
    await assert.rejects(importNames({ write: true, directory, target, load }), /NON_RUSSIAN/)
    assert.deepEqual(await tree(), invalidBefore)
    await fs.writeFile(path.join(directory, 'review.csv'), csv(edited()))
    const validBefore = await tree()
    let loads = 0
    await assert.rejects(importNames({ write: true, directory, target, load: async () => {
      const state = await load()
      if (++loads === 2) state.baseline.catalog_sha256 = 'concurrent-change'
      return state
    } }), /STALE_BASELINE/)
    assert.deepEqual(await tree(), validBefore, 'late validation failure cleans temp file and preserves registry')
    await importNames({ write: true, directory, target, load })
    const after = await tree()
    assert.deepEqual(Object.keys(after).filter(k => after[k] !== validBefore[k]), ['localization.json'])
    assert.equal(JSON.parse(after['localization.json'])['Other Athlete'], 'Другое Имя')
    await assert.rejects(importNames({ directory, target, load }), /STALE_BASELINE/)
    await exportNameReview(await load(), directory)
    const exported = parseCSV(await fs.readFile(path.join(directory, 'review.csv'), 'utf8'))
    assert.equal(exported[0][2], 'Новое Имя'); assert.equal(exported[1][2], 'Добавленное Имя')
    assert.equal((await importNames({ directory, target, load })).changes.length, 0)
    assert.deepEqual(raw.map(a => [a.id, a.nameEn]), [[1, 'Example Athlete'], [2, 'Missing Athlete'], [3, 'Other Athlete']])
  } finally { await fs.rm(dir, { recursive: true, force: true }) }
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
