import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { createServer } from 'vite'
import { parseStatsPtoResults, proposeResults, proposeEditionSof, validateSourceURL } from './import-race-results.mjs'

const fixtures=await Promise.all(['nice-world-championship-2026','french-riviera-2026'].map(async stem=>{
 const evidence=JSON.parse(await fs.readFile(`scripts/fixtures/result-imports/${stem}.json`,'utf8'))
 const html=await fs.readFile(evidence.snapshot,'utf8')
 return {evidence,html,parsed:parseStatsPtoResults(html)}
}))
for(const {evidence,html,parsed} of fixtures)test(`source replay: ${evidence.title}`,()=>{
 assert.equal(createHash('sha256').update(html).digest('hex'),evidence.sourceSha256)
 assert.deepEqual(parsed.groups,evidence.groups)
})
test('complete professional fields, source spelling, country, splits, points and DNF retained',()=>{
 const [nice,riviera]=fixtures.map(f=>f.parsed)
 assert.deepEqual(nice.groups.map(g=>[g.gender,g.rows.length]),[['W',50],['M',56]])
 assert.deepEqual(riviera.groups.map(g=>[g.gender,g.rows.length]),[['M',20]])
 assert.deepEqual(nice.groups.map(g=>g.rows.filter(r=>r.result.position==='DNF').length),[2,6])
 const winner=riviera.groups[0].rows[0].result
 assert.equal(winner.totalTime,'3:06:24');assert.equal(winner.countryCode,'NZ');assert.equal(winner.seriesPoints,35)
 const dnf=nice.groups[0].rows.at(-1).result
 assert.equal(dnf.position,'DNF');assert.equal(dnf.totalTime,undefined);assert.equal(dnf.bikeTime,undefined)
})
test('DNS/DSQ preserved; unknown status/columns/gender/empty pages fail closed',()=>{
 const html=fixtures[1].html
 for(const status of ['DNS','DSQ'])assert.equal(parseStatsPtoResults(html.replace('<td>DNF</td>',`<td>${status}</td>`)).groups[0].rows.at(-1).result.position,status)
 for(const changed of [html.replace('<td>DNF</td>','<td>UNKNOWN</td>'),html.replace('>Swim</td>','>Unknown</td>'),html.replace('id="MPRO"','id="AGEGROUP"'),'<html>Login required</html>'])assert.throws(()=>parseStatsPtoResults(changed))
})
test('URLs require explicit primary-source race/year/results without query or redirect aliases',()=>{
 assert.equal(validateSourceURL(fixtures[0].evidence.sourceUrl),fixtures[0].evidence.sourceUrl)
 for(const url of ['https://example.com/race/test/2026/results',fixtures[0].evidence.sourceUrl+'?tracking=1','https://stats.protriathletes.org/athlete/test'])assert.throws(()=>validateSourceURL(url))
})
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
const {raceResults}=await server.ssrLoadModule('/src/data/results/index.ts')
const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
const {normalizeAthleteIdentityName,resolveAthleteId}=await server.ssrLoadModule('/src/data/athleteIdentity.ts')
const {calculateAthleteRanking}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
await server.close()
test('SOF is bound to explicit gender panels and existing production editions',()=>{
 assert.deepEqual(fixtures[0].parsed.groups.map(g=>[g.gender,g.sof]),[['W',96.18],['M',96.35]])
 assert.deepEqual(fixtures[1].parsed.groups.map(g=>[g.gender,g.sof]),[['M',96.12]])
 for(const {parsed,evidence} of fixtures){
  const editions=evidence.editions.map(e=>allRaceEditionViews.find(x=>x.editionId===e.editionId))
  const proposed=proposeEditionSof({...parsed,groups:[...parsed.groups].reverse()},editions)
  assert.deepEqual(proposed,evidence.editionSof)
  for(const item of proposed)for(const [gender,sof]of Object.entries(item.sof))assert.equal(editions.find(e=>e.editionId===item.editionId).sof[gender],sof)
 }
 assert.equal(allRaceEditionViews.find(e=>e.editionId==='t100-french-riviera-2026').sof.women,undefined)
})
test('SOF absent stays absent; conflicting/ambiguous/invalid SOF fails before writing',()=>{
 const {html,parsed,evidence}=fixtures[1], edition=allRaceEditionViews.find(e=>e.editionId===evidence.editions[0].editionId)
 const without=parseStatsPtoResults(html.replace(/<div class="d-flex justify-content-between mb-3 sof-heading">.*?<\/div><\/div>/,'')).groups[0]
 assert.equal(without.sof,undefined)
 assert.deepEqual(proposeEditionSof({groups:[without]},[{...edition,sof:undefined}]),[{editionId:edition.editionId,sof:{},missing:['men']}])
 assert.throws(()=>proposeEditionSof(parsed,[{...edition,sof:{men:80}}]),/SOF conflict/)
 assert.throws(()=>proposeResults(parsed,[{...edition,sof:{men:80}}],[],athletes,normalizeAthleteIdentityName),/SOF conflict/)
 assert.throws(()=>parseStatsPtoResults(html.replace('SOF: 96.12','SOF: estimated')),/Unsupported SOF/)
 assert.throws(()=>parseStatsPtoResults(html.replace('SOF: 96.12','SOF: 96.12</div><div class="sof-heading">SOF: 90')),/Ambiguous SOF/)
})
test('ranking uses result gender SOF and neutral factor 1 when absent',()=>{
 const edition={...allRaceEditionViews.find(e=>e.editionId==='t100-french-riviera-2026'),gender:'MPRO',sof:{men:96.12,women:96.18}}
 const asOf=new Date('2026-09-26T12:00:00Z')
 for(const [gender,sof]of [['M',96.12],['W',96.18]]){
  const athlete=athletes.find(a=>a.gender===gender)
  const row={id:1,athleteId:athlete.id,athleteName:athlete.nameEn,gender,position:1,raceEditionId:edition.editionId}
  const calc=e=>calculateAthleteRanking([athlete],[row],[e],asOf)[0].score
  const neutral=calc({...edition,sof:undefined})
  assert.ok(Math.abs(neutral-100*1.1*0.45)<1e-10)
  assert.ok(Math.abs(calc(edition)/neutral-(1+(sof-90)/100))<1e-12)
  assert.equal(calc({...edition,sof:{[gender==='M'?'women':'men']:100}}),neutral)
 }
})
test('production rows exactly match source proposal; unique linkage, canonical countries and correct editions',()=>{
 let total=0
 for(const {parsed,evidence}of fixtures){
  const editions=evidence.editions.map(e=>allRaceEditionViews.find(x=>x.editionId===e.editionId))
  const proposal=proposeResults(parsed,editions,[],athletes,normalizeAthleteIdentityName)
  assert.equal(proposal.unmatched.length,0)
  const actual=raceResults.filter(r=>editions.some(e=>e.editionId===r.raceEditionId)).map(({id,...r})=>{assert.ok(id);assert.ok(resolveAthleteId(r.athleteName));return r})
  assert.deepEqual(actual,proposal.rows)
  total+=actual.length
  assert.equal(new Set(actual.map(r=>`${r.raceEditionId}:${r.gender}:${resolveAthleteId(r.athleteName)}`)).size,actual.length)
 }
 assert.equal(total,126)
})
test('existing editions cannot be overwritten, catalog ambiguity/gender conflicts stop proposals',()=>{
 const {parsed,evidence}=fixtures[1], editions=evidence.editions.map(e=>allRaceEditionViews.find(x=>x.editionId===e.editionId))
 assert.throws(()=>proposeResults(parsed,editions,raceResults,athletes,normalizeAthleteIdentityName),/already has results/)
 assert.throws(()=>proposeResults(parsed,editions,[],[...athletes,athletes[0]],normalizeAthleteIdentityName),/Ambiguous/)
 const conflict=athletes.map(a=>a.nameEn==='Hayden Wilde'?{...a,gender:'W'}:a)
 assert.throws(()=>proposeResults(parsed,editions,[],conflict,normalizeAthleteIdentityName),/Gender conflict/)
})
test('CLI dry-run/write refuse existing edition and wrong source; no production file is overwritten',()=>{
 const {evidence}=fixtures[1]
 const target='src/data/results/2026/t100/french-riviera.ts'
 const args=['scripts/import-race-results.mjs','--url',evidence.sourceUrl,'--race',evidence.editions[0].editionId,'--html',evidence.snapshot]
 for(const extra of [[],['--write','--out',target,'--export','replacement']]){
  const run=spawnSync(process.execPath,[...args,...extra],{encoding:'utf8'})
  assert.equal(run.status,1);assert.match(run.stderr,/already has results/)
 }
})

test('import preserves prior rows/IDs and athlete identity except the two reviewed country corrections',async()=>{
 const baseline=JSON.parse(await fs.readFile('scripts/fixtures/result-imports/ranking-comparison-2026-09-26.json','utf8'))
 const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex')
 assert.equal(hash(raceResults.slice(0,baseline.oldResultsPreserved)),baseline.oldResultsSha256)
 const restored=baseline.oldAthleteIds.map(id=>{
  const a=athletes.find(a=>a.id===id)
  if(id===10435){assert.equal(a.countryCode,'AU');return {...a,countryCode:'US',country:'США',countryEn:'United States'}}
  if(id===10235){assert.equal(a.countryCode,'US');return {...a,countryCode:'AU',country:'Австралия',countryEn:'Australia'}}
  return a
 })
 // Derived from 71523cf^ (pre-import catalog), independently reconstructed via Vite.
 // Its FULL object hash equals baseline.oldAthletesSha256. Mutable display names
 // are intentionally excluded; the historical fixture itself is not rewritten.
 const identity = rows => rows.map(({id,nameEn,gender,countryCode})=>({id,nameEn,gender,countryCode}))
 const expectedIdentityHash='91a0f5b0b7788348a88e0cd261f3f905adc865716a6dfa2202756b61c227011b'
 assert.equal(hash(identity(restored)),expectedIdentityHash)
 assert.equal(hash(identity(restored.map(a=>({...a,name:'Reviewed name',image:'/reviewed.png'})))),expectedIdentityHash)
 for(const field of ['id','nameEn','gender','countryCode']){
  const changed=structuredClone(restored);changed[0][field]='different'
  assert.notEqual(hash(identity(changed)),expectedIdentityHash,field)
 }
 for(const row of raceResults.slice(0,baseline.oldResultsPreserved)){
  const old=restored.find(a=>normalizeAthleteIdentityName(a.nameEn)===normalizeAthleteIdentityName(row.athleteName))
  assert.ok(old,`Historical result ${row.id} must still resolve`)
  assert.equal(resolveAthleteId(row.athleteName),old.id)
 }
})
