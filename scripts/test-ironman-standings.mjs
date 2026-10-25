import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createServer} from 'vite'
import {buildStandings, classifyIdentity, normalizeCountry, normalizeName, fixtureUrl, serialize} from './prepare-ironman-standings.mjs'

const approved=JSON.parse(await fs.readFile(fixtureUrl,'utf8'))
const tables=buildStandings(approved)

test('6/60 exact CSV values and provenance, original order, pending historical status',()=>{
  assert.equal(Object.keys(tables).length,6)
  for(const t of Object.values(tables)){
    const rows=approved.rows.filter(r=>Number(r.seasonYear)===t.seasonYear&&r.gender==={M:'men',W:'women'}[t.gender])
    assert.equal(t.rows.length,10)
    assert.equal(t.seasonStatus,t.seasonYear===2026?'LIVE':'HISTORICAL_FINAL_PENDING_CONFIRMATION')
    assert.equal(new Set(t.rows.map(r=>r.proposedAthleteId)).size,10)
    for(const [i,r]of t.rows.entries()){
      const o=rows[i]
      assert.deepEqual([r.officialRank,r.athleteName,r.nationality,r.officialPoints,r.sourceUrl],[Number(o.rank),o.athleteName,o.countryISO3,Number(o.points),o.sourceUrl])
      assert.equal(r.officialRank,i+1);assert.equal(r.provenance.type,o.provenanceType);assert.equal(r.provenance.ownerApprovedAt,o.ownerApprovedAt);assert.equal(r.provenance.approvedCsvSha256,approved.source.sha256);assert.equal(r.sourceObservedAt,null)
    }
    assert.equal(t.provenance.htmlVerified,false)
  }
})

test('deterministic offline replay matches registry and preserves input',async()=>{
  const before=serialize(approved);assert.deepEqual(buildStandings(approved),buildStandings(approved));assert.equal(before,serialize(approved))
  for(const [file,t]of Object.entries(tables))assert.equal(await fs.readFile(`src/data/officialStandings/ironman/${file}`,'utf8'),serialize(t))
})

test('60 confirmed including exactly four owner-approved identity rows; source values preserved',()=>{
  const rows=Object.values(tables).flatMap(t=>t.rows)
  assert.equal(rows.filter(r=>r.identityStatus==='CONFIRMED').length,60)
  assert.equal(rows.filter(r=>r.identityStatus==='REVIEW').length,0)
  assert.equal(rows.filter(r=>r.identityApproval).length,4)
  for(const r of rows.filter(r=>r.identityApproval)){assert.equal(r.athleteId,r.identityApproval.athleteId);assert.equal(r.identityApproval.approvedAt,'2026-10-22')}
  for(const r of rows.filter(r=>r.identityStatus==='REVIEW')){assert.equal(r.athleteId,null);assert.ok([100,10840,10435].includes(r.proposedAthleteId));assert.ok(r.identityFlags.length)}
  assert.equal(tables['2024-men.json'].rows[7].athleteName,'Mathias Lyngsø Petersen')
})

test('country normalization: ISO pairs plus existing project sports aliases; unknown stays null',()=>{
  for(const [code,want]of [['ITA','IT'],['GER','DE'],['DEU','DE'],['DEN','DK'],['DNK','DK'],['NED','NL'],['NLD','NL'],['RSA','ZA'],['ZAF','ZA']])assert.equal(normalizeCountry(code),want)
  assert.equal(normalizeCountry('ZZZ'),null)
})

test('all proposed IDs/genders/countries and independent historical tuples match current catalog',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
  try{
    const d=await server.ssrLoadModule('/src/sports/data.ts');const {localizeAthlete}=await server.ssrLoadModule('/src/data/athletes/localization.ts')
    const mappings=JSON.parse(await fs.readFile('src/data/athletes/ptoProfileMappings.json','utf8')).mappings
    assert.equal(d.athletes.length,1167);assert.equal(d.linkedRaceResults.length,4592)
    const nameIds=new Map()
    for(const t of Object.values(tables))for(const r of t.rows){
      const a=d.athletes.find(a=>a.id===r.proposedAthleteId),e=approved.identityEvidence[r.athleteName];assert.ok(a)
      assert.equal(a.countryCode,r.nationalityNormalized);assert.equal(a.gender,t.gender)
      assert.equal(localizeAthlete({...a,countryCode:r.nationality}).countryCode,r.nationalityNormalized)
      if(nameIds.has(r.athleteName))assert.equal(nameIds.get(r.athleteName),r.proposedAthleteId);nameIds.set(r.athleteName,r.proposedAthleteId)
      if(r.identityStatus==='CONFIRMED' && !r.identityApproval){
        const m=mappings.find(m=>m.id===r.athleteId);assert.ok(m);assert.equal(m.approvedBy,'owner');assert.equal(m.url,e.profileEvidence.sourceUrl);assert.equal(normalizeName(a.nameEn),normalizeName(r.athleteName));assert.equal(e.profileEvidence.identity.sourceCountryNormalized,r.nationalityNormalized)
        assert.ok(e.profileEvidence.identity.sourceName.some(n=>normalizeName(n)===normalizeName(a.nameEn)));assert.ok(e.historicalMatches.length)
      }
      for(const h of e.historicalMatches){
        const z=d.linkedRaceResults.find(z=>z.id===h.localResultId);assert.equal(z.athleteId,r.proposedAthleteId);assert.equal(z.raceEditionId,h.edition);assert.equal(String(z.position),h.position)
        for(const [k,v]of [['totalTime','total'],['swimTime','swim'],['bikeTime','bike'],['runTime','run']])assert.equal(z[k],h[v])
      }
    }
  }finally{await server.close()}
})

test('unknown and conflicting nationality cannot auto-confirm identity',()=>{
  const row=approved.rows[0],e=approved.identityEvidence[row.athleteName]
  for(const code of ['ZZZ','GBR'])assert.equal(classifyIdentity({...row,countryISO3:code},e).identityStatus,'REVIEW')
  assert.equal(classifyIdentity(row,null).identityStatus,'UNRESOLVED')
})
for(const [label,change]of [
  ['missing row',x=>x.rows.pop()],
  ['duplicate rank',x=>x.rows[1].rank='1'],
  ['duplicate athlete',x=>{x.rows[1].athleteName=x.rows[0].athleteName}],
  ['wrong source',x=>x.rows[0].sourceUrl='https://example.com/'],
])test(`rejects ${label}`,()=>{const x=structuredClone(approved);change(x);assert.throws(()=>buildStandings(x))})

// Approval of these identities is not a generic name/country bypass.
test('owner decisions are row-bound and cannot override nationality, gender or ID conflicts',()=>{
  for(const row of approved.rows.filter(r=>approved.identityEvidence[r.athleteName].ownerIdentityApproval)){
    const e=approved.identityEvidence[row.athleteName]
    assert.equal(classifyIdentity(row,e).identityStatus,'CONFIRMED')
    for(const patch of [{countryISO3:'ZZZ'},{countryISO3:'GBR'},{gender:row.gender==='men'?'women':'men'},{rank:'99'},{seasonYear:'2027'},{athleteName:'Unapproved alias'}])assert.equal(classifyIdentity({...row,...patch},e).identityStatus,'REVIEW')
    for(const patch of [{athleteId:999999},{localCountry:'GB'},{gender:'UNKNOWN'},{ownerIdentityApproval:undefined}])assert.equal(classifyIdentity(row,{...e,...patch}).identityStatus,'REVIEW')
    assert.equal(e.ownerIdentityApproval.evidenceReportSha256,approved.identityReviewCloseout.reportSha256)
  }
})
