import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {parseStatsPtoResults} from './import-race-results.mjs'
import {parseFreshTop10} from './prepare-t100-standings.mjs'
import {selectEditions,prepareRace,matchStandings,verifyFreshness,validateStandingsReview,fetchSource,parseArgs,hash} from './prepare-sports-update.mjs'
const url='https://stats.protriathletes.org/race/dubai-t100/2026/results'
const evidence=JSON.parse(await fs.readFile('scripts/fixtures/result-imports/dubai-2026.json'))
const parsed=parseStatsPtoResults(await fs.readFile('scripts/fixtures/result-imports/dubai-2026.html','utf8'))
const normalize=s=>s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z]/g,'')
const athletes=parsed.groups.flatMap(g=>g.rows).map((r,i)=>({id:500+i,nameEn:r.result.athleteName,gender:r.result.gender,countryCode:r.result.countryCode}))
const editions=evidence.editions.map(e=>({...e,statsPtoUrl:url}))
test('full source fields/statuses and stable matched IDs preserved without mutations',()=>{
 const before=structuredClone({parsed,athletes,editions});const p=prepareRace(parsed,editions,[],athletes,normalize,[])
 assert.equal(p.rows.length,41);assert.equal(p.counts.MPRO.total,21);assert.equal(p.counts.WPRO.total,20);assert.equal(p.counts.MPRO.DNF+p.counts.WPRO.DNF,4);assert.equal(p.blockers.length,0)
 assert.deepEqual(p.matches.map(x=>x.athleteId).sort(),athletes.map(a=>a.id).sort());assert.deepEqual({parsed,athletes,editions},before)
 for(const r of p.rows){const source=parsed.groups.flatMap(g=>g.rows).find(x=>x.result.athleteName===r.athleteName).result;assert.deepEqual(r,{...source,raceEditionId:editions[0].editionId})}
})
test('edition/source/year/date/full-gender guards',()=>{
 assert.equal(selectEditions([editions[0].editionId],url,editions,parsed,'2026-11-15').length,1)
 for(const mutate of [x=>x[0].dateISO='2026-11-13',x=>x[0].gender='MPRO',x=>x[0].statsPtoUrl=url+'x']){const e=structuredClone(editions);mutate(e);assert.throws(()=>selectEditions([e[0].editionId],url,e,parsed,'2026-11-15'))}
 assert.throws(()=>selectEditions(['missing'],url,editions,parsed));assert.throws(()=>selectEditions([editions[0].editionId],url,editions,parsed,'2026-11-01'))
})
test('existing results, duplicate/ambiguous identity and source profile conflicts block',()=>{
 assert.throws(()=>prepareRace(parsed,editions,[{raceEditionId:editions[0].editionId}],athletes,normalize,[]))
 assert.throws(()=>prepareRace(parsed,editions,[],[...athletes,athletes[0]],normalize,[]))
 const p=structuredClone(parsed);p.groups[0].rows.push(p.groups[0].rows[0]);assert.throws(()=>prepareRace(p,editions,[],athletes,normalize,[]))
 assert.ok(prepareRace(parsed,editions,[],athletes,normalize,[{id:athletes[0].id,url:'https://stats.protriathletes.org/athlete/wrong'}]).blockers.length)
})
test('unmatched profiles/names remain proposals with no invented IDs or transliteration',()=>{
 const p=prepareRace(parsed,editions,[],[],normalize,[]);assert.equal(p.proposals.length,41);assert.ok(p.blockers.length);assert.ok(p.proposals.every(x=>x.athleteId===null&&x.proposedNameRu===null))
})
test('DNS/DSQ retained by existing parser/proposal mechanism',()=>{
 const p=structuredClone(parsed);p.groups[0].rows[0].result.position='DNS';p.groups[0].rows[1].result.position='DSQ';const r=prepareRace(p,editions,[],athletes,normalize,[]);assert.equal(r.counts.WPRO.DNS,1);assert.equal(r.counts.WPRO.DSQ,1)
})
const tables=[]
for(const [g,sex]of [['M','men'],['W','women']]){
 const html=await fs.readFile(`scripts/fixtures/official-standings/t100-2026-post-dubai-${sex}.html`,'utf8')
 const approved=JSON.parse(await fs.readFile(`src/data/officialStandings/t100/2026-${sex}.json`))
 test('fresh T100 '+g+' exact source TOP10 and approved stable IDs',()=>{
  const t=parseFreshTop10(html,g,2026),a=approved.rows.map(r=>({id:r.athleteId,nameEn:r.athleteName,gender:g,countryCode:r.nationalityNormalized})),m=approved.rows.map(r=>({id:r.athleteId,url:r.athleteSourceUrl,approvedBy:'owner'}))
  const matched=matchStandings(t,a,m,normalize);assert.deepEqual(matched.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints]),approved.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints]));assert.throws(()=>matchStandings(t,a.slice(1),m,normalize));assert.throws(()=>matchStandings(t,[...a,a[0]],m,normalize))
 })
 test('T100 '+g+' rejects wrong season/missing table/points',()=>{assert.throws(()=>parseFreshTop10(html,g,2025));assert.throws(()=>parseFreshTop10('',g,2026));assert.throws(()=>parseFreshTop10(html.replace('class="points">','class="missing">'),g,2026))})
 tables.push({...parseFreshTop10(html,g,2026),source:{method:'OFFICIAL_HTML',url:approved.sourceUrl,sha256:hash(html),observedAt:'2026-11-15T00:00:00Z'}})
}
test('source order and tied points preserved; equal official ranks not renumbered',()=>{
 assert.deepEqual(tables[1].rows.slice(7,9).map(r=>[r.officialRank,r.officialPoints]),[[8,41],[9,41]])
 const t=structuredClone(tables[1]);t.rows=t.rows.map((r,i)=>({...r,athleteId:i+1}));t.rows[8].officialRank=8;validateStandingsReview(t);assert.equal(t.rows[8].officialRank,8)
})
test('common IRONMAN review interface, no scraper or runtime integration',()=>{
 const t=structuredClone(tables[0]);t.series='IRONMAN_PRO_SERIES';t.source.method='OWNER_OFFICIAL_SCREENSHOT';t.source.url='https://www.ironman.com/proseries/standings/2026';t.rows=t.rows.map((r,i)=>({...r,athleteId:i+1}));validateStandingsReview(t);t.rows[0].athleteId=null;assert.throws(()=>validateStandingsReview(t))
})
test('freshness is explicit, expires, binds both snapshots and after-race identity',()=>{
 const now=Date.parse('2026-11-15T12:00:00Z'),e={afterRace:url,reviewedBy:'test-reviewer',reviewedAt:'2026-11-15T11:00:00Z',statement:'synthetic reviewed fixture',tables:tables.map(t=>({sourceUrl:t.sourceUrl,sha256:t.source.sha256,evidenceUrl:url,explanation:'test only'}))}
 verifyFreshness(e,tables,url,now);assert.throws(()=>verifyFreshness(null,tables,url,now));assert.throws(()=>verifyFreshness(e,tables,url,now+86400001));assert.throws(()=>verifyFreshness(e,tables,url+'x',now));e.tables[0].sha256='0'.repeat(64);assert.throws(()=>verifyFreshness(e,tables,url,now))
})
test('HTTP/source failures and unsupported CLI fail closed',async()=>{
 await assert.rejects(fetchSource(url,async()=>({status:404})));await assert.rejects(fetchSource(url,async()=>{throw Error('redirect')}));assert.throws(()=>parseArgs(['results','--url',url,'--race','x','--out','relative']));assert.throws(()=>parseArgs(['results','--url',url,'--race','x','--out','/tmp/x','--write','true']))
})
test('historical data, IDs, registries and TRI formula unchanged in candidate',()=>{assert.equal(execFileSync('git',['diff','HEAD','--','src/data','src/utils/athleteRanking.ts'],{encoding:'utf8'}),'')})
