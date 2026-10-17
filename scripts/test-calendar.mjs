import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
const [{ default: Calendar }, { currentRaceEditions, allRaceEditionViews }] = await Promise.all([
  server.ssrLoadModule('/src/pages/CalendarPage.tsx'), server.ssrLoadModule('/src/data/raceEditions.ts'),
])
await server.close()
const initial = { search: '', filter: 'Все', timeFilter: 'upcoming', openArchiveYears: [] }
function render(patch = {}) {
  let clicked
  const root = Calendar({ races: currentRaceEditions, searchRaces: allRaceEditionViews,
    viewState: { ...initial, ...patch }, onViewStateChange() {}, onBack() {}, onNavigate() {}, onRaceClick(r) { clicked = r } })
  const cards = [], text = []
  function walk(node, archive = null) {
    if (Array.isArray(node)) return node.forEach(n => walk(n, archive))
    if (typeof node === 'string') { text.push(node); return }
    if (!node || typeof node !== 'object') return
    if (node.props?.className === 'calendar-archive') archive = Number(node.key)
    if (node.type?.name === 'RaceCard') {
      node.props.onClick()
      cards.push({ ...clicked, archive, displayedDate: node.props.date })
    }
    walk(node.props?.children, archive)
  }
  walk(root)
  return { cards, text: text.join(' ') }
}
const freeze = t => t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-02T09:00:00Z') })
const ids = rows => rows.map(r => r.editionId)
const series = ['Все', 'IRONMAN Pro Series', 'Triathlon World Tour']

test('default Moscow 2026-10-02: exact four upcoming editions in order', t => {
  freeze(t)
  assert.deepEqual(ids(render().cards), ['ironman-world-championship-kona-2026', 't100-dubai-2026', 't100-saudi-arabia-2026', 't100-qatar-2026'])
})
test('time × series × archives: season scopes, unique cards, exact sets and ordering', t => {
  freeze(t)
  const before = JSON.stringify(allRaceEditionViews)
  const counts = { upcoming: [4, 1, 3], finished: [21, 15, 6], all: [25, 16, 9] }
  for (const timeFilter of Object.keys(counts)) for (const [i, filter] of series.entries()) {
    const state = { timeFilter, filter, openArchiveYears: [2025, 2024] }
    const rows = render(state).cards, main = rows.filter(r => r.archive === null)
    assert.equal(main.length, counts[timeFilter][i])
    assert.ok(main.every(r => r.year === 2026 && r.series !== 'Challenge'))
    assert.equal(new Set(ids(rows)).size, rows.length)
    const raw = currentRaceEditions.filter(r => r.series !== 'Challenge' && (filter === 'Все' || r.series === filter)
      && (timeFilter === 'all' || (timeFilter === 'finished' ? r.dateISO < '2026-10-02' : r.dateISO >= '2026-10-02')))
    // The only current-season grouped pair is Nice W/M. Both editions are represented by the women-first card.
    const expected = raw.filter(r => r.editionId !== 'ironman-70-3-world-championship-2026-men')
      .sort((a, b) => (timeFilter === 'finished' ? -1 : 1) * a.dateISO.localeCompare(b.dateISO))
    assert.deepEqual(ids(main), ids(expected))
    for (const year of [2025, 2024]) {
      const archive = rows.filter(r => r.archive === year)
      assert.equal(archive.length, timeFilter === 'upcoming' ? 0 : (year === 2025 ? [26, 17, 9] : [26, 19, 7])[i])
      assert.ok(archive.every(r => r.year === year && (filter === 'Все' || r.series === filter)))
      assert.deepEqual(archive.map(r => r.dateISO), archive.map(r => r.dateISO).sort())
    }
    render({ timeFilter: 'all', filter: 'Triathlon World Tour', search: 'IRONMAN' })
    assert.deepEqual(render(state).cards, rows)
  }
  assert.equal(JSON.stringify(allRaceEditionViews), before)
})
test('global search ignores preserved filters, shows years/notice; clearing restores filters', t => {
  freeze(t)
  const filters = { timeFilter: 'upcoming', filter: 'IRONMAN Pro Series', openArchiveYears: [2025, 2024] }
  const before = render(filters)
  const search = render({ ...filters, search: 'T100' })
  assert.equal(search.cards.length, 25)
  assert.ok(search.cards.every(r => r.series === 'Triathlon World Tour' && r.archive === null))
  assert.deepEqual([...new Set(search.cards.map(r => r.year))], [2026, 2025, 2024])
  assert.ok(search.cards.every(r => r.displayedDate.endsWith(String(r.year))))
  assert.match(search.text, /Поиск по всем гонкам — фильтры временно не применяются/)
  assert.deepEqual(render({ ...filters, search: '' }), before)
  assert.deepEqual(render({ ...filters, search: '  ' }).cards, before.cards)
})
test('no-results searches show compact empty state; year search remains unsupported', t => {
  freeze(t)
  for (const search of ['zzznorace', '2025']) {
    const result = render({ search })
    assert.equal(result.cards.length, 0)
    assert.match(result.text, /Гонки не найдены/)
    assert.match(result.text, /Поиск по всем гонкам/)
  }
})

test('empty state matrix, reset and explicit load states preserve calendar semantics', t => {
  freeze(t)
  const inspect = (state, races = currentRaceEditions, searchRaces = allRaceEditionViews, dataStatus = 'ready') => {
    let next
    const nodes = []
    const root = Calendar({races,searchRaces,dataStatus,viewState:state,onViewStateChange:s=>{next=s},onBack(){},onNavigate(){},onRaceClick(){}})
    const walk = node => {if(Array.isArray(node))return node.forEach(walk);if(!node||typeof node!=='object')return;nodes.push(node);walk(node.props?.children)}
    walk(root)
    const reset = nodes.find(n=>n.props?.className==='calendar-empty__reset')
    reset?.props.onClick()
    return {nodes,reset,next,empty:nodes.some(n=>n.props?.className==='calendar-empty')}
  }
  for(const filter of series)for(const timeFilter of ['upcoming','finished','all']) {
    const state={search:'zzznorace',filter,timeFilter,openArchiveYears:[2025]}
    const result=inspect(state)
    assert.equal(result.empty,true)
    assert.equal(result.reset.props.type,'button')
    assert.deepEqual(result.next,{...state,search:'',filter:'Все',timeFilter:'all'})
    assert.equal(inspect(result.next).empty,false)
    assert.equal(inspect({...state,search:''}).empty,false)
    for(const dataStatus of ['loading','error']) {
      const r=inspect(state,[],[],dataStatus)
      assert.equal(r.empty,false)
      assert.equal(r.reset,undefined)
      assert.ok(r.nodes.some(n=>n.props?.role===(dataStatus==='error'?'alert':'status')))
    }
  }
  assert.equal(inspect(initial,[],[]).empty,true)
  // An available archive is a result even while its accordion is collapsed.
  assert.equal(inspect({...initial,timeFilter:'all'},[],allRaceEditionViews).empty,false)
  t.mock.timers.setTime(new Date('2028-01-01T00:00:00Z').getTime())
  for(const filter of series){
    const r=inspect({...initial,filter})
    assert.equal(r.empty,true)
    assert.ok(!r.nodes.some(n=>n.props?.children==='Сезон завершён!'))
    assert.ok(r.nodes.some(n=>n.type==='h2'&&n.props.children==='Гонки не найдены'))
  }
})

test('confirmed season completion is scoped by date, series, search and catalog year', t => {
  freeze(t)
  const inspect = (patch = {}, races = currentRaceEditions, dataStatus = 'ready') => {
    let next
    const state = {...initial, filter:'IRONMAN Pro Series', openArchiveYears:[2025], ...patch}
    const root = Calendar({races,searchRaces:allRaceEditionViews,dataStatus,viewState:state,onViewStateChange:s=>{next=s},onBack(){},onNavigate(){},onRaceClick(){}})
    const nodes=[]
    const walk=n=>{if(Array.isArray(n))return n.forEach(walk);if(!n||typeof n!=='object')return;nodes.push(n);walk(n.props?.children)}
    walk(root)
    const heading=nodes.find(n=>n.type==='h2')?.props.children
    const button=nodes.find(n=>n.props?.className==='calendar-empty__reset')
    button?.props.onClick()
    return {heading,button,next}
  }
  assert.equal(inspect().heading,undefined)
  t.mock.timers.setTime(new Date('2026-10-10T12:00:00Z').getTime())
  assert.equal(inspect().heading,undefined)
  t.mock.timers.setTime(new Date('2026-10-11T09:00:00Z').getTime())
  const completed=inspect()
  assert.equal(completed.heading,'Сезон завершён!')
  assert.equal(completed.button.props.children,'Результаты сезона')
  assert.deepEqual(completed.next,{...initial,filter:'IRONMAN Pro Series',timeFilter:'finished',openArchiveYears:[2025]})
  assert.ok(render(completed.next).cards.length>0)
  assert.equal(inspect({search:'zzznorace'}).heading,'Гонки не найдены')
  assert.equal(inspect({search:'zzznorace'}).next.filter,'Все')
  for(const dataStatus of ['loading','error'])assert.equal(inspect({},currentRaceEditions,dataStatus).heading,undefined)
  assert.equal(inspect({},[]).heading,'Гонки не найдены')
  for(const year of [2027,2028]) {
    t.mock.timers.setTime(new Date(`${year}-11-01T09:00:00Z`).getTime())
    const future=currentRaceEditions.map(r=>({...r,year,dateISO:r.dateISO.replace('2026',String(year))}))
    assert.equal(inspect({},future).heading,'Гонки не найдены')
    assert.equal(inspect().heading,'Гонки не найдены')
  }
})
