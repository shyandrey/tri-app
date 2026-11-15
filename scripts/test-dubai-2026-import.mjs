import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { createServer } from 'vite'
import { parseStatsPtoResults, proposeResults } from './import-race-results.mjs'

const evidence = JSON.parse(await fs.readFile('scripts/fixtures/result-imports/dubai-2026.json', 'utf8'))
const html = await fs.readFile(evidence.snapshot, 'utf8')
const parsed = parseStatsPtoResults(html)
const server = await createServer({server: {middlewareMode: true, hmr: false}, appType: 'custom', logLevel: 'silent'})
let athletes, raceResults, editions, normalize, rows, linkResultsToAthletes, Table, Profile
try {
  ;({default:Table} = await server.ssrLoadModule('/src/components/RaceResultsTable.tsx'))
  ;({default:Profile} = await server.ssrLoadModule('/src/pages/AthleteDetailPage.tsx'))
  ;({linkResultsToAthletes} = await server.ssrLoadModule('/src/utils/raceResults.ts'))
  ;({athletes} = await server.ssrLoadModule('/src/data/athletes/index.ts'))
  ;({raceResults} = await server.ssrLoadModule('/src/data/results/index.ts'))
  ;({allRaceEditionViews: editions} = await server.ssrLoadModule('/src/data/raceEditions.ts'))
  ;({normalizeAthleteIdentityName: normalize} = await server.ssrLoadModule('/src/data/athleteIdentity.ts'))
  ;({dubai2026Results: rows} = await server.ssrLoadModule('/src/data/results/2026/t100/dubai.ts'))
} finally { await server.close() }
const edition = editions.find(e => e.editionId === 't100-dubai-2026')
const propose = (source = parsed, catalog = athletes, existing = raceResults.slice(0,4592)) => proposeResults(source, [edition], existing, catalog, normalize)

test('official snapshot and complete M/W terminal tables replay exactly', () => {
  assert.equal(createHash('sha256').update(html).digest('hex'), evidence.sourceSha256)
  assert.deepEqual(parsed.groups, evidence.groups)
  assert.equal(parsed.title, '2026 Dubai T100')
  for (const [gender, count, finishers] of [['M',21,19], ['W',20,18]]) {
    const group = rows.filter(r => r.gender === gender)
    assert.equal(group.length, count)
    assert.deepEqual(group.filter(r => typeof r.position === 'number').map(r => r.position), Array.from({length: finishers}, (_, i) => i + 1))
    assert.equal(group.filter(r => r.position === 'DNF').length, 2)
    assert.equal(group.filter(r => r.position === 'DNS' || r.position === 'DSQ').length, 0)
    for (const r of group.filter(r => typeof r.position === 'number')) {
      for (const field of ['totalTime','swimTime','t1Time','bikeTime','t2Time','runTime','countryCode']) assert.ok(r[field], `${r.athleteName}/${field}`)
    }
  }
})
test('proposal preserves every source value and existing edition identity', () => {
  assert.equal(edition.raceId, 't100-dubai')
  assert.equal(edition.dateISO, '2026-11-14')
  assert.equal(edition.gender, 'WPRO+MPRO')
  const proposal = propose()
  assert.deepEqual(rows, proposal.rows.map((r, i) => ({id: i + 1, ...r})))
  assert.equal(new Set(rows.map(r => `${r.gender}:${normalize(r.athleteName)}`)).size, 41)
  assert.equal(proposal.matches.length, 41)
  assert.equal(new Set(proposal.matches.map(m => m.athleteId)).size, 41)
  assert.deepEqual(proposal.unmatched.map(r => r.athleteName).sort(), [])
  assert.equal(proposal.anomalies.length, 4)
  assert.ok(proposal.anomalies.every(a => a.type === 'missing-splits' && a.status === 'DNF'))
  assert.deepEqual(proposal.editionSof[0].sof, {men:91.03, women:92.11})
  for (const match of proposal.matches) assert.equal(normalize(athletes.find(a => a.id === match.athleteId).nameEn), normalize(match.athleteName))
})
test('duplicate source, ambiguous catalog and repeated edition imports fail closed', () => {
  const duplicate = structuredClone(parsed)
  duplicate.groups[0].rows.push(duplicate.groups[0].rows[0])
  assert.throws(() => propose(duplicate), /Duplicate result/)
  assert.throws(() => propose(parsed, [...athletes, {...athletes[0], id:-1}]), /Ambiguous catalog identity/)
  assert.throws(() => propose(parsed, athletes, [...raceResults, rows[0]]), /Edition already has results/)
})
const baseline = JSON.parse(await fs.readFile('scripts/fixtures/result-imports/dubai-baseline-2026.json','utf8'))
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex')
function assertHistorical(catalog, results) {
  assert.equal(catalog.length,1170)
  assert.equal(new Set(catalog.map(a=>a.id)).size,1170)
  assert.equal(hash(catalog.filter(a=>a.id<=baseline.maxAthleteId)),baseline.athletesSha256)
  assert.equal(results.length,4633)
  assert.equal(new Set(results.map(r=>r.id)).size,4633)
  assert.equal(hash(results.slice(0,4592)),baseline.resultsSha256)
}
test('all existing profiles and historical results remain byte-equivalent',()=>assertHistorical(athletes,raceResults))
test('historical preservation rejects ID, name and result mutations',()=>{
  for(const kind of ['athleteId','name','resultId','time']) {
    const a=structuredClone(athletes),r=structuredClone(raceResults)
    if(kind==='athleteId')a[0].id=-1
    if(kind==='name')a[0].name='changed'
    if(kind==='resultId')r[0].id=-1
    if(kind==='time')r[0].totalTime='00:00:01'
    assert.throws(()=>assertHistorical(a,r),assert.AssertionError)
  }
})
test('runtime Dubai rows allocate new IDs and link all 41 athletes',()=>{
  const actual=raceResults.slice(4592)
  assert.deepEqual(actual,rows.map((r,i)=>({...r,id:4593+i})))
  const linked=linkResultsToAthletes(actual)
  assert.equal(new Set(linked.map(r=>r.athleteId)).size,41)
  assert.ok(linked.every(r=>athletes.some(a=>a.id===r.athleteId)))
  for(const old of evidence.matches)assert.equal(linked.find(r=>r.athleteName===old.athleteName).athleteId,old.athleteId)
})
test('approved Russian names, countries and PTO identity mappings resolve for all new profiles',async()=>{
  const registry=JSON.parse(await fs.readFile('src/data/athletes/ptoProfileMappings.json','utf8'))
  for(const [id,en,ru,code,slug] of [[20016,'Brooke Gillies','Брук Гиллис','GB','brooke-gillies'],[20017,'Enzo Bourdon','Энцо Бурдон','FR','enzo-bourdon'],[20018,'Sara Sandrini','Сара Сандрини','IT','sara-sandrini']]) {
    const a=athletes.find(a=>a.id===id)
    assert.equal(a.nameEn,en);assert.equal(a.name,ru);assert.equal(a.countryCode,code)
    assert.equal(registry.mappings.find(m=>m.id===id).url,'https://stats.protriathletes.org/athlete/'+slug)
    assert.equal(linkResultsToAthletes(raceResults).filter(r=>r.athleteId===id).length,1)
  }
})

test('Race Detail tables and three profiles render approved Russian names, flags and Dubai results',()=>{
 const linked=linkResultsToAthletes(raceResults.slice(4592))
 for(const id of [20016,20017,20018]) {
  const a=athletes.find(a=>a.id===id)
  const table=renderToStaticMarkup(createElement(Table,{results:linked,athletes,selectedGender:a.gender,onAthleteClick:()=>{}}))
  const profile=renderToStaticMarkup(createElement(Profile,{athlete:a,results:linked.filter(r=>r.athleteId===id),races:editions,onBack:()=>{},onNavigate:()=>{},onRaceClick:()=>{}}))
  assert.ok(table.includes(a.name));assert.ok(profile.includes(a.name))
  const flag=String.fromCodePoint(...[...a.countryCode].map(c=>127397+c.charCodeAt(0)))
  assert.ok(table.includes(flag));assert.ok(profile.includes(flag))
  assert.ok(profile.includes('Dubai'))
 }
})
