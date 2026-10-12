import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {createServer} from 'vite'
import {auditAthleteLocalization} from './athlete-localization-audit.mjs'
import {auditPhotoFiles} from './athlete-photo-core.mjs'

test('current localization preserves identity, linkage and ranking; current photo registry binds reviewed bytes',async()=>{
  const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
  try{
    const c=await server.ssrLoadModule('/src/data/athletes/index.ts')
    const raw=[...c.maleAthletes,...c.femaleAthletes,...c.resultAthletes,...c.verifiedResultAthletes]
    const registry=JSON.parse(await fs.readFile('src/data/athletes/athleteLocalization.json','utf8'))
    assert.deepEqual(auditAthleteLocalization(registry,raw,c.athletes),[])
    assert.deepEqual(c.athletes.map(a=>[a.id,a.nameEn,a.gender]),raw.map(a=>[a.id,a.nameEn,a.gender]))
    const {raceResults}=await server.ssrLoadModule('/src/data/results/index.ts')
    const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
    const {linkResultsToAthletes}=await server.ssrLoadModule('/src/utils/raceResults.ts')
    const {calculateAthleteRanking,sortAthletesByRanking}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const {normalizeAthleteIdentityName:norm}=await server.ssrLoadModule('/src/data/athleteIdentity.ts')
    const linked=linkResultsToAthletes(raceResults),ids=new Map(raw.map(a=>[norm(a.nameEn),a.id]))
    for(const row of linked)assert.equal(row.athleteId,ids.get(norm(row.athleteName)))
    for(const asOf of ['2026-09-24T00:00:00Z','2026-09-26T12:00:00Z']){
      assert.deepEqual(calculateAthleteRanking(c.athletes,linked,allRaceEditionViews,new Date(asOf)),calculateAthleteRanking(raw,linked,allRaceEditionViews,new Date(asOf)))
      assert.deepEqual(sortAthletesByRanking(c.athletes,linked,allRaceEditionViews,new Date(asOf)).map(a=>a.id),sortAthletesByRanking(raw,linked,allRaceEditionViews,new Date(asOf)).map(a=>a.id))
    }
    const {athletePhotosByName}=await server.ssrLoadModule('/src/data/athletes/athletePhotos.generated.ts')
    assert.deepEqual((await auditPhotoFiles(process.cwd(),athletePhotosByName)).issues,[])
    const evidence=JSON.parse(await fs.readFile('src/data/athletes/athletePhotoEvidence.json','utf8'))
    for(const [id,e]of Object.entries(evidence.entries)){
      const athlete=c.athletes.find(a=>a.id===Number(id));assert.ok(athlete)
      assert.equal(athlete.image,e.localPath)
      assert.equal(athletePhotosByName[athlete.nameEn],e.localPath)
      assert.equal(createHash('sha256').update(await fs.readFile('public'+e.localPath)).digest('hex'),e.sha256??e.publishedSha256)
    }
  }finally{await server.close()}
})

test('Wave C verified countries preserve four identities, historical countries and ranking', async () => {
  const server = await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
  try {
    const {athletes,resultAthletes} = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const {raceResults} = await server.ssrLoadModule('/src/data/results/index.ts')
    const {allRaceEditionViews} = await server.ssrLoadModule('/src/data/raceEditions.ts')
    const {linkResultsToAthletes} = await server.ssrLoadModule('/src/utils/raceResults.ts')
    const {calculateAthleteRanking,sortAthletesByRanking} = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const registry = JSON.parse(await fs.readFile('src/data/athletes/countryEnrichment.json','utf8'))
    const cases = [
      [10144,'Erik Olsson','SE','Швеция', [undefined]],
      [10541,'Sebastian Schober','DE','Германия', [undefined]],
      [10235,'Jeremy Maclean','US','США', ['US','US','US']],
      [10435,'Nick Thompson','AU','Австралия', Array(12).fill('AU')],
    ]
    const linked = linkResultsToAthletes(raceResults)
    for (const [id,nameEn,countryCode,country,countries] of cases) {
      const profile = athletes.find(a=>a.id===id)
      assert.equal(profile.nameEn,nameEn)
      assert.equal(profile.countryCode,countryCode)
      assert.equal(profile.country,country)
      assert.equal(resultAthletes.find(a=>a.id===id).countryCode,countryCode)
      assert.equal(registry[nameEn].countryCode,countryCode)
      const rows = linked.filter(r=>r.athleteName===nameEn && r.raceEditionId!=='ironman-world-championship-kona-2026')
      assert.deepEqual(rows.map(r=>r.countryCode),countries, 'Historical countries must match reviewed race-row evidence')
      assert.ok(rows.every(r=>r.athleteId===id))
      if (id===10144 || id===10541) {
        const evidence = registry[nameEn]
        assert.equal(evidence.athleteId,id)
        assert.equal(evidence.verifiedName,nameEn)
        assert.match(evidence.provenance,/^official-(federation|results)-verified$/)
        assert.equal(new URL(evidence.sourceUrl).protocol,'https:')
        assert.ok(evidence.sourceEvidence && evidence.verificationNote)
        assert.equal(rows[0].position,evidence.matchingResult.position)
        assert.equal(rows[0].totalTime,evidence.matchingResult.totalTime)
      }
    }
    const before = athletes.map(a=>a.id===10144 || a.id===10541 ? {...a,countryCode:undefined,country:'',countryEn:''} : a)
    const asOf = new Date('2026-10-06T00:00:00Z')
    assert.deepEqual(calculateAthleteRanking(athletes,linked,allRaceEditionViews,asOf),calculateAthleteRanking(before,linked,allRaceEditionViews,asOf))
    assert.deepEqual(sortAthletesByRanking(athletes,linked,allRaceEditionViews,asOf).map(a=>a.id),sortAthletesByRanking(before,linked,allRaceEditionViews,asOf).map(a=>a.id))
  } finally { await server.close() }
})

test('Lara verified country preserves identity, historical results and ranking', async () => {
  const server = await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
  try {
    const {athletes,resultAthletes} = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const {raceResults} = await server.ssrLoadModule('/src/data/results/index.ts')
    const {allRaceEditionViews} = await server.ssrLoadModule('/src/data/raceEditions.ts')
    const {linkResultsToAthletes} = await server.ssrLoadModule('/src/utils/raceResults.ts')
    const {calculateAthleteRanking,sortAthletesByRanking} = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const profile = athletes.find(a=>a.id===10803)
    assert.equal(profile.nameEn,'Lara Hernandez-Tome')
    assert.equal(profile.countryCode,'ES')
    assert.equal(profile.country,'Испания')
    assert.equal(profile.countryEn,'Spain')
    assert.equal(resultAthletes.find(a=>a.id===10803).countryCode,'ES')
    const registry = JSON.parse(await fs.readFile('src/data/athletes/countryEnrichment.json','utf8'))
    const evidence = registry[profile.nameEn]
    assert.equal(evidence.athleteId,profile.id)
    assert.equal(evidence.countryCode,profile.countryCode)
    assert.equal(evidence.provenance,'stats-pto-verified')
    assert.equal(evidence.profileUrl,'https://stats.protriathletes.org/athlete/lara-hernandez-tome')
    assert.equal(evidence.matchingResult.raceUrl,'https://stats.protriathletes.org/race/im-hawaii/2026/results')
    assert.equal(evidence.supportingSource.athleteId,201326)
    assert.equal(evidence.supportingSource.sourceUrl,'https://triathlon.org/athletes/profile/201326/lara-maria-hernandez-tome')
    assert.equal(evidence.previousCountryEvidence.countryCode,'US')
    assert.equal(evidence.previousCountryEvidence.provenance,'migrated-existing')
    const linked = linkResultsToAthletes(raceResults)
    const rows = linked.filter(r=>r.athleteName===profile.nameEn && r.raceEditionId!=='ironman-world-championship-kona-2026')
    assert.equal(rows.length,2)
    assert.ok(rows.every(r=>r.countryCode==='ES' && r.athleteId===10803))
    assert.deepEqual(rows.map(r=>[r.position,r.totalTime]),[[16,'4:33:19'],[8,'9:28:45']])
    assert.deepEqual(rows.map(r=>[r.id,r.raceEditionId,r.swimTime,r.t1Time,r.bikeTime,r.t2Time,r.runTime,r.ptoPoints]),[
      [3397,'ironman-70-3-oceanside-2026','23:26','3:59','2:29:54','3:06','1:32:55',54.61],
      [3923,'ironman-lake-placid-2026','52:13','4:54','5:09:28','2:55','3:19:17',67.49],
    ])
    assert.deepEqual(evidence.historicalCountryCorrections.map(e=>[e.runtimeResultId,e.editionId,e.previousCountryCode,e.verifiedCountryCode]),rows.map(r=>[r.id,r.raceEditionId,'US','ES']))
    const beforeResults=linked.map(r=>r.athleteId===10803 ? {...r,countryCode:'US'} : r)
    const before = athletes.map(a=>a.id===10803 ? {...a,countryCode:'US',country:'США',countryEn:'United States'} : a)
    const asOf = new Date('2026-10-11T12:00:00Z')
    assert.deepEqual(calculateAthleteRanking(athletes,linked,allRaceEditionViews,asOf),calculateAthleteRanking(before,beforeResults,allRaceEditionViews,asOf))
    assert.deepEqual(sortAthletesByRanking(athletes,linked,allRaceEditionViews,asOf).map(a=>a.id),sortAthletesByRanking(before,beforeResults,allRaceEditionViews,asOf).map(a=>a.id))
  } finally { await server.close() }
})
