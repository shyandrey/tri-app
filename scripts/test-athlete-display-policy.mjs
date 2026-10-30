import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createServer} from 'vite'
import {localizationReviewQueue} from './athlete-localization-review.mjs'

test('Russian-first canonical resolver and non-blocking English/source fallbacks',async()=>{
 const server=await createServer({server:{middlewareMode:true,watch:null,ws:false},appType:'custom',logLevel:'silent'})
 try{
  const {athleteDisplayName:display}=await server.ssrLoadModule('/src/utils/athleteDisplayName.ts')
  const {localizeAthlete}=await server.ssrLoadModule('/src/data/athletes/localization.ts')
  assert.equal(display({name:'Тест Имя',nameEn:'Test Name'}),'Тест Имя')
  for(const name of ['', '   '])assert.equal(display({name,nameEn:'Latin Original'}),'Latin Original')
  assert.equal(display(undefined,'Source Original'),'Source Original')
  assert.equal(display(null,'Source Original'),'Source Original')
  assert.equal(display({name:'',nameEn:''},'Source Original'),'Source Original')
  const a={id:999999,name:' ',nameEn:'Latin Original',country:'',flag:'',discipline:'',achievements:[]}
  const localized=localizeAthlete(a);assert.equal(localized.name,'Latin Original');assert.equal(localized.id,a.id);assert.equal(a.name,' ')
  const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
  const {officialStandings}=await server.ssrLoadModule('/src/data/officialStandings/index.ts')
  const snapshot=JSON.stringify(officialStandings)
  for(const t of officialStandings)for(const r of t.rows){const a=athletes.find(a=>a.id===r.athleteId);assert.ok(a);assert.equal(display(a,r.athleteName),a.name);assert.match(display(a),/[А-Яа-яЁё]/)}
  assert.equal(JSON.stringify(officialStandings),snapshot)
  assert.equal(athletes.length,1167)
  const batches=(await fs.readdir('scripts/fixtures/approved-athlete-names')).filter(f=>f.endsWith('.csv'))
  assert.equal(localizationReviewQueue(athletes).length,230-115*batches.length)
  const registry=JSON.parse(await fs.readFile('src/data/athletes/athleteLocalization.json','utf8'))
  for(const [name,entry] of Object.entries(registry))assert.equal(display(athletes.find(a=>a.nameEn===name)),typeof entry==='string'?entry:entry.nameRu)
 }finally{await server.close()}
})
test('Editorial queue does not mutate identities or block missing names',()=>{
 const input=[{id:1,nameEn:'Approved',name:'Проверенный'},{id:2,nameEn:'Latin',name:'Latin'},{id:3,nameEn:'Empty',name:''},{athleteName:'Unmatched'}];const before=JSON.stringify(input)
 assert.deepEqual(localizationReviewQueue(input),[
  {athleteId:2,nameEn:'Latin',status:'LOCALIZATION_REVIEW_REQUIRED',blocking:false},
  {athleteId:3,nameEn:'Empty',status:'LOCALIZATION_REVIEW_REQUIRED',blocking:false},
  {athleteId:null,nameEn:'Unmatched',status:'LOCALIZATION_REVIEW_REQUIRED',blocking:false},
 ])
 assert.equal(JSON.stringify(input),before)
})
