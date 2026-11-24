import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { initialTelegramHash } from '../src/navigation/telegramLinks.ts'
const s = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
const [data, entities, classification, dates, genders, home, { default: Calendar }, results] = await Promise.all([
  '/src/data/raceEditions.ts', '/src/data/raceEntities.ts', '/src/utils/raceChampionshipGroup.ts', '/src/utils/raceDate.ts', '/src/utils/raceGender.ts', '/src/utils/homeRacePresentation.ts', '/src/pages/CalendarPage.tsx', '/src/data/results/index.ts',
].map(p => s.ssrLoadModule(p)))
await s.close()
const { allRaceEditionViews: all, calendar2027Views: future } = data
const master = JSON.parse(readFileSync('data/calendar/2027-master.json'))
const group = classification.getChampionshipNavigationGroup
function cards(season, filter = 'Все') {
  const found = []
  let clicked
  const root = Calendar({ races: data.calendarRaceEditions, searchRaces: all, viewState: { season, search: '', filter, timeFilter: 'all', openArchiveYears: [] }, onViewStateChange() {}, onBack() {}, onNavigate() {}, onRaceClick(r) { clicked = r } })
  function walk(n) {
    if (Array.isArray(n)) return n.forEach(walk)
    if (!n || typeof n !== 'object') return
    if (n.type?.name === 'RaceCard') { n.props.onClick(); found.push(clicked) }
    walk(n.props?.children)
  }
  walk(root)
  return found
}
test('25 approved dates/ranges, series 16/8/1; stable unique views and editions', () => {
  assert.equal(future.length, 25)
  assert.deepEqual(['IRONMAN Pro Series', 'Triathlon World Tour', 'Challenge'].map(x => future.filter(r => r.series === x).length), [16, 8, 1])
  for (const [i, r] of future.entries()) {
    assert.equal(r.dateISO, master.races[i].dateStart)
    assert.equal(r.dateEndISO, master.races[i].dateEnd)
    assert.equal(r.dateKind, master.races[i].dateKind)
    assert.equal(r.sof, undefined)
    assert.equal(r.statsPtoUrl, undefined)
  }
  assert.equal(new Set(all.map(r => r.id)).size, all.length)
  assert.equal(new Set(all.map(r => r.editionId)).size, all.length)
  assert.ok(future.every(r => entities.raceEntities.some(e => e.id === r.raceId)))
})
test('70.3 Worlds four years one group, ordinary Chattanooga separate, legacy IDs retained', () => {
  const worlds = all.filter(r => group(r) === 'ironman-70-3-world-championship')
  assert.deepEqual([...new Set(worlds.map(r => r.year))].sort(), [2024, 2025, 2026, 2027])
  for (const [year, city] of [[2024, 'Таупо'], [2025, 'Марбелья'], [2026, 'Ницца'], [2027, 'Чаттануга']]) {
    assert.ok(worlds.filter(r => r.year === year).every(r => r.city === city))
  }
  assert.equal(worlds.find(r => r.year === 2027).editionId, 'ironman-70-3-world-championship-2027')
  const ordinary = all.find(r => r.editionId === 'ironman-70-3-chattanooga-2024')
  assert.equal(group(ordinary), undefined)
  assert.equal(classification.getRaceDesignation(ordinary), 'regular')
  assert.notEqual(ordinary.raceId, worlds.find(r => r.year === 2027).raceId)
})
test('IRONMAN Worlds canonical group and edition designation; finals never become world championship identities', () => {
  const worlds = all.filter(r => group(r) === 'ironman-world-championship')
  assert.deepEqual([...new Set(worlds.map(r => r.year))].sort(), [2024, 2025, 2026, 2027])
  assert.equal(classification.getRaceDesignation(all.find(r => r.editionId === 't100-dubai-2024-men')), 'series_final')
  assert.equal(classification.getRaceDesignation(all.find(r => r.editionId === 't100-dubai-2026')), 'regular')
  const qatar = future.find(r => r.raceId === 't100-qatar')
  assert.equal(qatar.designation, 'series_final')
  assert.equal(group(qatar), undefined)
  assert.ok(data.raceEditions.some(r => r.designation === 'continental_championship'))
})
test('Spain three edition venues; new races have only available history', () => {
  for (const [year, city] of [[2025, 'Оропеса-дель-Мар'], [2026, 'Памплона'], [2027, 'Марбелья']]) {
    assert.equal(all.find(r => r.editionId === `t100-spain-${year}`).city, city)
  }
  assert.deepEqual(all.filter(r => r.raceId === 'ironman-70-3-muscat').map(r => r.year), [2027])
})
test('UNKNOWN is explicit and never normalizes to both genders', () => {
  assert.equal(future.filter(r => r.gender === 'UNKNOWN').length, 9)
  assert.equal(genders.normalizeRaceGender('UNKNOWN'), 'UNKNOWN')
  assert.equal(genders.getRaceGenderLabel('UNKNOWN'), 'Категории уточняются')
  assert.equal(home.groupRacesForHome(future).length, 25)
})
test('2024–2027 selectable; 2027 has all 25 including Roth, historical Roth is first-class after CAL-03B2', () => {
  assert.equal(cards(2027).length, 25)
  assert.equal(cards(2027, 'IRONMAN Pro Series').length, 16)
  assert.equal(cards(2027, 'Triathlon World Tour').length, 8)
  for (const year of [2024, 2025, 2026]) {
    const rows = cards(year)
    assert.ok(rows.length > 0)
    assert.ok(rows.every(r => r.year === year))
  }
  const rows = cards(2027)
  assert.deepEqual(rows.map(r => r.dateISO), rows.map(r => r.dateISO).sort())
})
test('event weekend remains upcoming through last Moscow day, no exact PRO day asserted', t => {
  const race = future.find(r => r.raceId === 't100-spain')
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2027-09-19T20:59:59.999Z') })
  assert.equal(dates.isRaceUpcoming(race), true)
  t.mock.timers.setTime(new Date('2027-09-19T21:00:00Z').getTime())
  assert.equal(dates.isRaceUpcoming(race), false)
  assert.match(race.description, /уточняется/)
})
test('historical and future deep links resolve exact editions and results still refer to original editions', async () => {
  const exists = async r => all.some(e => e.editionId === r.id)
  for (const id of ['ironman-70-3-world-championship-taupo-2024-men', 'ironman-70-3-world-championship-marbella-2025-women', 't100-spain-2027', 'ironman-70-3-world-championship-2027']) {
    assert.equal(await initialTelegramHash(() => '', { initDataUnsafe: { start_param: `race_${id}` } }, exists), `#/race/${id}`)
  }
  assert.ok(results.raceResults.every(r => all.some(e => e.editionId === r.raceEditionId)))
  assert.equal(new Set(results.raceResults.map(r => r.id)).size, 4633)
})
test('historical results, athlete registry, ranking and edition identity sources remain byte-identical', () => {
  const paths = ['src/data/results', 'src/data/athletes', 'src/data/raceIdentity.ts', 'src/data/races.ts', 'src/utils/athleteRanking.ts']
  assert.equal(execFileSync('git', ['diff', 'HEAD', '--', ...paths], { encoding: 'utf8' }), '')
})
