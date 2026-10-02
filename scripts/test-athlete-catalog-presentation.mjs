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
test('every result set is capped; incoming ranking order and source are preserved',()=>{
 const before=structuredClone(catalog)
 for(const search of ['', '   '])assert.deepEqual(athleteCatalogPresentation(catalog,{...all,search}),{athletes:catalog.slice(0,50),total:260,limited:true,progressive:true})
 assert.deepEqual(athleteCatalogPresentation(catalog.slice(0,50),all),{athletes:catalog.slice(0,50),total:50,limited:false,progressive:true})
 assert.deepEqual(catalog,before)
})
test('gender/country/combined views slice matches after computing their full total',()=>{
 for(const filters of [{genderFilter:'M'},{genderFilter:'W'},{countryFilter:'FR'},{genderFilter:'W',countryFilter:'FR'}]){
  const result=athleteCatalogPresentation(catalog,{...all,...filters})
  assert.equal(result.limited,true)
  const matches=catalog.filter(a=>!filters.genderFilter||a.gender===filters.genderFilter)
  assert.equal(result.total,matches.length)
  assert.deepEqual(result.athletes,matches.slice(0,50))
  assert.deepEqual(athleteCatalogPresentation(catalog,{...all,...filters},100).athletes,matches.slice(0,100))
 }
})
test('global search sees tail profiles and ignores selected filters; broad search is progressively revealed',()=>{
 assert.deepEqual(athleteCatalogPresentation(catalog,{search:'Athlete 259',genderFilter:'M',countryFilter:'DE'}).athletes,[catalog[259]])
 assert.equal(athleteCatalogPresentation(catalog,{...all,search:'Athlete'}).athletes.length,50)
})

test('50-row batches preserve prefixes, final remainder and complete state',()=>{
 for(const count of [50,100,150,200,250,300]){
  const result=athleteCatalogPresentation(catalog,all,count)
  assert.deepEqual(result.athletes,catalog.slice(0,count))
  assert.equal(result.limited,count<260)
  assert.equal(result.progressive,true)
 }
 for(const count of [50,250])assert.equal(athleteCatalogPresentation(catalog,{...all,search:'Athlete'},count).athletes.length,count)
})

test('short/empty results and 117-result remainder preserve exact order without duplicate batches',()=>{
 for(const total of [0,34,117]) for(const count of [50,100,150]) {
  const rows=catalog.slice(0,total),result=athleteCatalogPresentation(rows,{...all,countryFilter:'FR'},count)
  assert.equal(result.total,total)
  assert.deepEqual(result.athletes,rows.slice(0,count))
  assert.equal(result.limited,count<total)
  assert.equal(new Set(result.athletes.map(a=>a.id)).size,result.athletes.length)
 }
})
