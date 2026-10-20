import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawnSync} from 'node:child_process'
import {createServer} from 'vite'
import {competitionAge,profileSocials} from '../src/utils/athleteProfileData.ts'

test('approved photo registry is deterministic: 720 additions, pilot unchanged, no replacements',async()=>{
 const expected=await fs.readFile('src/data/athletes/ptoProfileEnrichment.json','utf8')
 for(let i=0;i<2;i++){const r=spawnSync(process.execPath,['scripts/prepare-pto-photo-registry.mjs'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stdout,expected)}
 const reg=JSON.parse(expected);let ages=0,socials=0;const urls=new Set()
 for(const entry of Object.values(reg.entries)){
  for(const key of ['reportedAge','birthYear'])if(entry.profile[key])ages++
  for(const f of Object.values(entry.profile.socials)){socials++;assert.ok(!urls.has(f.value));urls.add(f.value);assert.ok(f.observedAt&&f.raw&&f.sourceUrl&&f.snapshotSha256)}
 }
 assert.equal(ages,394);assert.equal(socials,402)
 const pilot=spawnSync(process.execPath,['scripts/prepare-pto-pilot-registry.mjs'],{encoding:'utf8'});assert.equal(pilot.status,0)
 for(const [id,e] of Object.entries(JSON.parse(pilot.stdout).entries))assert.deepEqual(reg.entries[id],e)
 for(const id of ['38','10825'])assert.equal(reg.entries[id].profile.socials.youtube,undefined)
 assert.equal(reg.entries['10825'].profile.reportedAge,undefined);assert.equal(reg.entries['10825'].profile.birthYear,undefined)
 for(const [id,platform]of [[1,'youtube'],[7,'instagram'],[20,'website'],[10521,'twitter'],[10521,'facebook'],[109,'website']])assert.equal(reg.entries[id]?.profile.socials[platform],undefined)
})
test('registry overlay preserves identities, existing fields, result links and ranking',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
 try{
  const d=await server.ssrLoadModule('/src/sports/data.ts')
  const {enrichPtoProfile}=await server.ssrLoadModule('/src/data/athletes/ptoProfileEnrichment.ts')
  const {athletePhotosByName}=await server.ssrLoadModule('/src/data/athletes/athletePhotos.generated.ts')
  const {reviewedAthletePhoto}=await server.ssrLoadModule('/src/data/athletes/photoReview.ts')
  const {localizeAthlete}=await server.ssrLoadModule('/src/data/athletes/localization.ts')
  const c=await server.ssrLoadModule('/src/data/athletes/index.ts')
  const before=[...c.maleAthletes,...c.femaleAthletes,...c.resultAthletes,...c.verifiedResultAthletes].map(a=>localizeAthlete({...a,image:reviewedAthletePhoto(a.id,a.image??athletePhotosByName[a.nameEn])}))
  assert.deepEqual(d.athletes.map(a=>{const copy={...a};delete copy.ptoProfile;return copy}),before)
  assert.equal(new Set(d.athletes.map(a=>a.id)).size,1167)
  for(const a of before){const snapshot=structuredClone(a);enrichPtoProfile(a);assert.deepEqual(a,snapshot)}
  const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
  const {calculateAthleteRanking,sortAthletesByRanking}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
  const {getRankingDatasetClock}=await server.ssrLoadModule('/src/utils/rankingDatasetClock.ts')
  const clock=getRankingDatasetClock(before,d.linkedRaceResults,allRaceEditionViews)
  assert.deepEqual(calculateAthleteRanking(before,d.linkedRaceResults,allRaceEditionViews,clock),d.athleteRanking)
  assert.deepEqual(sortAthletesByRanking(before,d.linkedRaceResults,allRaceEditionViews,clock).map(a=>a.id),d.rankedAthletes.map(a=>a.id))
  for(const [id,age] of [[2,34],[10521,28]])assert.equal(competitionAge(d.athletes.find(a=>a.id===id).ptoProfile,new Date('2026-10-19')),age)
  const k=d.athletes.find(a=>a.id===1);assert.equal(Object.fromEntries(profileSocials(k)).youtube,'https://youtube.com/@kristian.blummenfelt')
  const protectedAthlete={...before.find(a=>a.id===2),ptoProfile:{birthYear:{value:1901},socials:{instagram:{value:'https://instagram.com/existing'}}}}
  const protectedResult=enrichPtoProfile(protectedAthlete);assert.equal(protectedResult.ptoProfile.birthYear.value,1901);assert.equal(protectedResult.ptoProfile.socials.instagram.value,'https://instagram.com/existing')
 }finally{await server.close()}
})
test('AGE freshness uses observation, not later approval/verification; BORN rolls forward',()=>{
 const f={value:30,raw:'30',sourceUrl:'https://stats.protriathletes.org/athlete/test',snapshotSha256:'test',observedAt:'2026-10-18T10:00:00Z',verifiedAt:'2027-01-01T00:00:00Z'}
 assert.equal(competitionAge({reportedAge:f},new Date('2027-02-01')),undefined)
 assert.equal(competitionAge({birthYear:{...f,value:1992}},new Date('2027-02-01')),35)
})

test('all 720 owner-approved additions match raw CSV provenance; holds and rejected raw URLs excluded',async()=>{
 const readCsv=path=>{const p=spawnSync('python3',['-c','import csv,json,sys;print(json.dumps(list(csv.DictReader(open(sys.argv[1])))))',path],{encoding:'utf8',maxBuffer:4*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout)}
 const auto=readCsv('docs/athlete-pto-owner-field-review-2026-10-20-batch-651.csv'),review=readCsv('docs/athlete-pto-owner-field-review-2026-10-20-review-fields.csv')
 const additions=[...auto,...review.filter(r=>['COMPETITION_AGE_COMPATIBLE','PROFILE_WIDE_DUPLICATE_COLLATERAL'].includes(r.category))]
 assert.equal(additions.length,720);assert.equal(new Set(additions.map(r=>r.id+':'+r.field)).size,720)
 const reg=JSON.parse(await fs.readFile('src/data/athletes/ptoProfileEnrichment.json','utf8'))
 for(const r of additions){
  const p=reg.entries[r.id].profile,actual=r.field.startsWith('socials.')?p.socials[r.field.slice(8)]:p[r.field]
  assert.deepEqual(actual,{value:r.field.startsWith('socials.')?r.value:Number(r.value),raw:r.raw,sourceUrl:r.url,observedAt:r.observedAt,verifiedAt:r.observedAt,snapshotSha256:r.snapshotSha256})
  if(r.category==='COMPETITION_AGE_COMPATIBLE'){
   assert.equal(competitionAge(p,new Date('2026-10-20')),2026-p.birthYear.value)
   assert.equal(competitionAge(p,new Date('2027-01-01')),2027-p.birthYear.value)
   assert.equal(p.reportedAge.value,2026-p.birthYear.value-1)
  }
 }
 const rejected=readCsv('docs/athlete-pto-owner-field-review-2026-10-20-rejected-urls.csv')
 assert.equal(rejected.length,57)
 for(const r of rejected)assert.ok(!Object.values(reg.entries[r.id]?.profile.socials??{}).some(f=>f.raw===r.raw))
})
