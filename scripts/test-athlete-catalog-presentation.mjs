import test from 'node:test'
import assert from 'node:assert/strict'
import { athleteGenderCounts, athleteCatalogPresentation } from '../src/utils/athleteCatalogPresentation.ts'
import { athleteCountryStrength } from '../src/utils/athleteCountryStrength.ts'
const catalog = Array.from({length:260},(_,i)=>({id:i,name:`Athlete ${i}`,nameEn:`Athlete ${i}`,gender:i<130?'M':'W',country:'France',countryCode:'FR'}))
const all = {search:'',genderFilter:'ALL',countryFilter:'ALL'}
test('counters follow additions/removals, including generated profiles; country counts follow gender',()=>{
 for(const rows of [catalog,catalog.slice(1),[...catalog,{...catalog[0],id:999,gender:'W',catalogType:'generated'}]]) {
  assert.deepEqual(athleteGenderCounts(rows),{ALL:rows.length,M:rows.filter(a=>a.gender==='M').length,W:rows.filter(a=>a.gender==='W').length})
  for(const gender of ['ALL','M','W'])assert.equal(athleteCountryStrength(rows,[],gender)[0].count,rows.filter(a=>gender==='ALL'||a.gender===gender).length)
 }
})
test('only empty ALL/ALL is capped; incoming ranking order and source are preserved',()=>{
 const before=structuredClone(catalog)
 for(const search of ['', '   '])assert.deepEqual(athleteCatalogPresentation(catalog,{...all,search}),{athletes:catalog.slice(0,50),total:260,limited:true,progressive:true})
 assert.deepEqual(athleteCatalogPresentation(catalog.slice(0,50),all),{athletes:catalog.slice(0,50),total:50,limited:false,progressive:true})
 assert.deepEqual(catalog,before)
})
test('gender/country/combined views retain all matches, including more than 100',()=>{
 for(const filters of [{genderFilter:'M'},{genderFilter:'W'},{countryFilter:'FR'},{genderFilter:'W',countryFilter:'FR'}]){
  const result=athleteCatalogPresentation(catalog,{...all,...filters})
  assert.equal(result.limited,false)
  assert.deepEqual(result.athletes,catalog.filter(a=>!filters.genderFilter||a.gender===filters.genderFilter))
 }
})
test('global search sees tail profiles and ignores selected filters; broad search is not capped',()=>{
 assert.deepEqual(athleteCatalogPresentation(catalog,{search:'Athlete 259',genderFilter:'M',countryFilter:'DE'}).athletes,[catalog[259]])
 assert.equal(athleteCatalogPresentation(catalog,{...all,search:'Athlete'}).athletes.length,260)
})

test('50-row batches preserve prefixes, final remainder and complete state',()=>{
 for(const count of [50,100,150,200,250,300]){
  const result=athleteCatalogPresentation(catalog,all,count)
  assert.deepEqual(result.athletes,catalog.slice(0,count))
  assert.equal(result.limited,count<260)
  assert.equal(result.progressive,true)
 }
 for(const count of [50,250])assert.equal(athleteCatalogPresentation(catalog,{...all,search:'Athlete'},count).athletes.length,260)
})
