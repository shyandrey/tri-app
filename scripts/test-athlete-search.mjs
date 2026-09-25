import test from 'node:test'
import assert from 'node:assert/strict'
import { filterAthletes } from '../src/utils/athleteSearch.ts'
import { NavigationHistory } from '../src/navigation/history.ts'
import { loadPhotoRuntime } from './athlete-photo-runtime.mjs'
const { athletes } = await loadPhotoRuntime()
const options = {search:'Blummenfelt',genderFilter:'W',countryFilter:'FR'}
const has = (rows, name) => rows.some(a => a.nameEn === name)
for (const [label, filters] of [
  ['gender mismatch',{...options,countryFilter:'ALL'}],
  ['country mismatch',{...options,genderFilter:'ALL'}],
  ['both mismatches',options],
]) test(`global search ignores ${label}`,()=>assert.ok(has(filterAthletes(athletes,filters),'Kristian Blummenfelt')))
test('Men/Germany still finds Flora Duffy',()=>assert.ok(has(filterAthletes(athletes,{search:'Flora Duffy',genderFilter:'M',countryFilter:'DE'}),'Flora Duffy')))
for(const search of ['', ' \t\n '])test(`cleared/whitespace search ${JSON.stringify(search)} reapplies unchanged filters`,()=>{
 const state={...options,search},before=structuredClone(state)
 assert.deepEqual(filterAthletes(athletes,state),athletes.filter(a=>a.gender==='W'&&a.countryCode==='FR'))
 assert.deepEqual(state,before)
})
test('Russian and English names, case/trim and wrong keyboard layout remain searchable',()=>{
 const a=athletes.find(a=>a.nameEn==='Kristian Blummenfelt')
 for(const search of [a.name,'  KRISTIAN BLUMMENFELT  ']) {
  assert.ok(filterAthletes(athletes,{...options,search}).includes(a),search)
 }
 const en="qwertyuiop[]asdfghjkl;'zxcvbnm,.",ru='йцукенгшщзхъфывапролджэячсмитьбю'
 const wrong=Array.from(a.nameEn.toLowerCase(),c=>en.includes(c)?ru[en.indexOf(c)]:c).join('')
 assert.ok(filterAthletes(athletes,{...options,search:wrong}).includes(a))
})
test('all existing searchable fields and ё normalization are retained; incoming order is preserved',()=>{
 const source=athletes.slice().reverse()
 const selected=filterAthletes(source,{...options,search:'a'})
 assert.ok(selected.length>1)
 assert.deepEqual(selected,source.filter(a=>selected.includes(a)))
 const sample={...athletes[0],name:'Тест Ёлкин',nameEn:'Test Name',country:'Страна',countryEn:'Country',countryCode:'ZZ',discipline:'UniqueDiscipline'}
 for(const search of ['тест елкин','Test Name','Страна','Country','ZZ','UniqueDiscipline'])assert.deepEqual(filterAthletes([sample],{...options,search}),[sample])
})
test('Back preserves global query, selected filters and scroll; clearing restores filtered list',()=>{
 const stack=[];let index=-1,nav
 const port={get state(){return stack[index]??null},pushState(s){stack.splice(++index);stack.push(structuredClone(s))},replaceState(s){if(index<0)index=0;stack[index]=structuredClone(s)},back(){index--;nav.pop(stack[index],'#/athletes')}}
 nav=new NavigationHistory(port,'#/athletes')
 for(const [k,v]of Object.entries(options))nav.saveUI(k,v)
 nav.saveScroll({x:0,y:180,elements:{countries:250}})
 nav.navigate({page:'athlete',id:'1'});nav.back()
 assert.deepEqual(nav.current.ui,options);assert.equal(nav.current.scroll.y,180)
 assert.ok(has(filterAthletes(athletes,nav.current.ui),'Kristian Blummenfelt'))
 nav.saveUI('search','')
 assert.deepEqual(filterAthletes(athletes,nav.current.ui),athletes.filter(a=>a.gender==='W'&&a.countryCode==='FR'))
})
