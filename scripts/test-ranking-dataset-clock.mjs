import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createServer} from 'vite'
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
const {raceResults}=await server.ssrLoadModule('/src/data/results/index.ts')
const {allRaceEditionViews:editions}=await server.ssrLoadModule('/src/data/raceEditions.ts')
const {getRankingDatasetClock:clock}=await server.ssrLoadModule('/src/utils/rankingDatasetClock.ts')
const {calculateAthleteRanking:calculate,sortAthletesByRanking:sort}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
const {athleteCountryStrength:strength}=await server.ssrLoadModule('/src/utils/athleteCountryStrength.ts')
await server.close()
const a=[athletes[0]], edition=(id,dateISO)=>({...editions[0],editionId:id,dateISO}), row=(id,position=1)=>({id:1,athleteId:a[0].id,athleteName:a[0].nameEn,raceEditionId:id,position})
test('latest represented participating edition; future empty, DNS-only and unlinked editions ignored',()=>{
 const es=[edition('older','2025-09-01'),edition('latest','2026-09-19'),edition('future','2099-01-01')]
 assert.equal(clock(a,[row('older'),row('latest')],es).toISOString(),'2026-09-19T12:00:00.000Z')
 assert.equal(clock(a,[row('older'),row('future','DNS')],es).toISOString(),'2025-09-01T12:00:00.000Z')
 assert.equal(clock(a,[row('older'),{...row('future'),athleteId:-999}],es).toISOString(),'2025-09-01T12:00:00.000Z')
 assert.equal(clock(a,[],es).getTime(),0)
 assert.equal(clock(a,[row('future','DNS')],es).getTime(),0)
})
test('older dataset and appended completed race move clock automatically; DNF remains a start',()=>{
 const es=[edition('old','2026-09-13'),edition('new','2026-09-19')]
 assert.equal(clock(a,[row('old')],es).toISOString(),'2026-09-13T12:00:00.000Z')
 for(const status of [1,'DNF','DSQ'])assert.equal(clock(a,[row('old'),row('new',status)],es).toISOString(),'2026-09-19T12:00:00.000Z')
})
test('production ranking/sort/country strength are deterministic and share dataset clock defaults',()=>{
 const asOf=clock(athletes,raceResults,editions)
 assert.equal(asOf.toISOString(),'2026-09-19T12:00:00.000Z')
 const explicit=calculate(athletes,raceResults,editions,asOf)
 assert.deepEqual(calculate(athletes,raceResults,editions),explicit)
 assert.deepEqual(calculate(athletes,raceResults,editions),explicit)
 assert.deepEqual(sort(athletes,raceResults,editions),sort(athletes,raceResults,editions,asOf))
 for(const g of ['ALL','M','W'])assert.deepEqual(strength(athletes,explicit,g),strength(athletes,calculate(athletes,raceResults,editions),g))
})
test('App shares one clock for Ranking, Athletes order and derived Country Strength',async()=>{
 const app=await fs.readFile('src/sports/data.ts','utf8')+'\n'+await fs.readFile('src/sports/SportsArea.tsx','utf8')
 assert.match(app,/const rankingAsOf = getRankingDatasetClock\(athletes, linkedRaceResults, allRaceEditionViews\)/)
 for(const fn of ['calculateAthleteRanking','sortAthletesByRanking'])assert.match(app,new RegExp(fn+'\\(athletes, linkedRaceResults, allRaceEditionViews, rankingAsOf(?:, athleteRanking)?\\)'))
 assert.match(app,/ranking=\{athleteRanking\}/)
 assert.match(app,/athletes=\{rankedAthletes\}/)
})
test('reviewed country registry and generated runtime retain identities and source evidence',async()=>{
 const registry=JSON.parse(await fs.readFile('src/data/athletes/countryEnrichment.json','utf8'))
 for(const [name,id,code]of [['Nick Thompson',10435,'AU'],['Jeremy Maclean',10235,'US']]){
  const athlete=athletes.find(a=>a.id===id)
  assert.equal(athlete.nameEn,name);assert.equal(athlete.countryCode,code)
  assert.equal(registry[name].countryCode,code);assert.equal(registry[name].provenance,'stats-pto-verified')
  assert.equal(registry[name].verifiedName,name);assert.ok(registry[name].profileUrl);assert.ok(registry[name].matchingResult)
 }
})
