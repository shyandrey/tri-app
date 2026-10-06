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
