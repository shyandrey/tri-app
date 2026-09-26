import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { athleteCountryStrength, athleteCountryKey, canonicalCountryKey } from '../src/utils/athleteCountryStrength.ts'
import { filterAthletes } from '../src/utils/athleteSearch.ts'
import { NavigationHistory } from '../src/navigation/history.ts'

const athlete = (id, countryCode, gender = 'M', extra = {}) => ({id,countryCode,gender,name:`Name ${id}`,nameEn:`Name ${id}`,country:countryCode,...extra})
const ranking = scores => scores.map(([athleteId, score]) => ({athleteId,score}))
const sample = [athlete(1,'US'),athlete(2,'GB'),athlete(3,'GB'),athlete(4,'GB'),athlete(5,'GB'),athlete(6,'GB'),athlete(7,'FR','W'),athlete(8,'DE','W')]
const scores = ranking([[1,100],[2,30],[3,30],[4,30],[5,30],[6,30],[7,200],[8,0]])
const keys = options => options.map(c=>c.key)

test('fixed TOP-5 denominator prevents singleton average advantage; full count and zero countries retained',()=>{
 const options=athleteCountryStrength(sample,scores,'ALL')
 assert.equal(options.find(c=>c.key==='US').strength,20)
 assert.equal(options.find(c=>c.key==='GB').strength,30)
 assert.equal(options.find(c=>c.key==='GB').count,5)
 assert.equal(options.find(c=>c.key==='DE').strength,0)
})
test('actual five best scores determine strength, regardless of input order; long tail cannot dilute it',()=>{
 const a=Array.from({length:8},(_,i)=>athlete(i,'FR'))
 const r=ranking([[0,1],[1,50],[2,10],[3,40],[4,0],[5,20],[6,30]])
 const before=structuredClone({a,r})
 const option=athleteCountryStrength(a,r,'ALL')[0]
 assert.equal(option.strength,30);assert.equal(option.count,8)
 assert.equal(athleteCountryStrength(a.slice().reverse(),r.slice().reverse(),'ALL')[0].strength,30)
 assert.deepEqual({a,r},before)
})
for(const [gender,expected] of [['ALL',['FR','GB','US','DE']],['M',['GB','US']],['W',['FR','DE']]])test(`${gender} order and gender visibility`,()=>assert.deepEqual(keys(athleteCountryStrength(sample,scores,gender)),expected))
test('canonical aliases aggregate and filter in both directions; tie-break is canonical key',()=>{
 const a=[athlete(1,'ZAF'),athlete(2,'ZA'),athlete(3,'LVA'),athlete(4,'LV')]
 const options=athleteCountryStrength(a,[],'ALL')
 assert.deepEqual(keys(options),['LV','ZA']);assert.deepEqual(options.map(c=>c.count),[2,2])
 assert.deepEqual(options.map(c=>c.flag),['🇱🇻','🇿🇦'])
 for(const key of ['za',' ZAF ','ZA'])assert.deepEqual(filterAthletes(a,{search:'',genderFilter:'ALL',countryFilter:key}),a.slice(0,2))
 for(const key of ['LV','LVA'])assert.deepEqual(filterAthletes(a,{search:'',genderFilter:'ALL',countryFilter:key}),a.slice(2))
 assert.equal(canonicalCountryKey(' lva '),'LV')
})
test('unranked, zero-score, generated and photo-free profiles all remain selectable in incoming order',()=>{
 const a=[athlete(1,'FR','M',{catalogType:'curated',image:'photo.png'}),athlete(2,'FR','M',{catalogType:'generated'}),athlete(3,'FR','M',{catalogType:'verified generated'}),athlete(4,'FR','W')]
 assert.equal(athleteCountryStrength(a,ranking([[1,100],[2,0]]),'M')[0].count,3)
 assert.deepEqual(filterAthletes(a,{search:'',genderFilter:'M',countryFilter:'FR'}),a.slice(0,3))
 assert.deepEqual(athleteCountryStrength(a,[],'ALL'),athleteCountryStrength(a.map(x=>({...x,image:'other.png'})),[],'ALL'))
})

const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
const catalog=await server.ssrLoadModule('/src/data/athletes/index.ts')
const {raceResults}=await server.ssrLoadModule('/src/data/results/index.ts')
const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
const {linkResultsToAthletes}=await server.ssrLoadModule('/src/utils/raceResults.ts')
const {calculateAthleteRanking,sortAthletesByRanking}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
const {default:Page}=await server.ssrLoadModule('/src/pages/AthletesPage.tsx')
const {NavigationContext}=await server.ssrLoadModule('/src/navigation/usePageState.ts')
const linked=linkResultsToAthletes(raceResults),asOf=new Date('2026-09-26T12:00:00Z')
const productionRanking=calculateAthleteRanking(catalog.athletes,linked,allRaceEditionViews,asOf)
const athletes=sortAthletesByRanking(catalog.athletes,linked,allRaceEditionViews,asOf)
const render=ui=>renderToStaticMarkup(createElement(NavigationContext.Provider,{value:{current:{ui}}},createElement(Page,{athletes,ranking:productionRanking,onBack(){},onAthleteClick(){},onNavigate(){}})))
const carousel=html=>html.split('<div data-navigation-scroll="countries"')[1].split('<div class="athletes-list')[0]
const chips=html=>[...carousel(html).matchAll(/class="athletes-country-chip__code">([^<]+)/g)].map(m=>m[1])
await server.close()

test('production SSR: ALL chip first; gender changes order; search does not change carousel/counts',()=>{
 const all=render({genderFilter:'ALL'}),men=render({genderFilter:'M'}),women=render({genderFilter:'W'})
 assert.deepEqual(chips(all).slice(0,6),['ALL','GB','US','NO','DE','BE'])
 assert.deepEqual(chips(men).slice(0,6),['ALL','DE','US','NO','BE','NZ'])
 assert.deepEqual(chips(women).slice(0,6),['ALL','GB','US','DE','CH','AU'])
 const state={genderFilter:'W',countryFilter:'FR'}
 assert.equal(carousel(render(state)),carousel(render({...state,search:'Blummenfelt'})))
 assert.ok(render({...state,search:'Blummenfelt'}).includes('Kristian Blummenfelt'))
})
test('production catalog: 51 legacy options become 50 canonical options; all generated with countries remain included',()=>{
 const old=new Set(athletes.map(a=>a.countryCode?.trim()||a.country?.trim()).filter(Boolean))
 const options=athleteCountryStrength(athletes,productionRanking,'ALL')
 assert.equal(old.size,51);assert.equal(options.length,50)
 assert.equal(options.find(c=>c.key==='ZA').count,13);assert.equal(options.find(c=>c.key==='LV').count,1)
 const generated=new Set([...catalog.resultAthletes,...catalog.verifiedResultAthletes].map(a=>a.id))
 for(const genderFilter of ['ALL','M','W'])for(const option of athleteCountryStrength(athletes,productionRanking,genderFilter)){
  const expected=athletes.filter(a=>athleteCountryKey(a)===option.key&&(genderFilter==='ALL'||a.gender===genderFilter))
  const actual=filterAthletes(athletes,{search:'',genderFilter,countryFilter:option.key})
  assert.deepEqual(actual,expected);assert.equal(actual.length,option.count)
  assert.equal(actual.filter(a=>generated.has(a.id)).length,expected.filter(a=>generated.has(a.id)).length)
 }
})
test('Back restores legacy selection as canonical active chip, query, gender and both scroll positions',()=>{
 const stack=[];let index=-1,nav
 const port={get state(){return stack[index]??null},pushState(s){stack.splice(++index);stack.push(structuredClone(s))},replaceState(s){if(index<0)index=0;stack[index]=structuredClone(s)},back(){index--;nav.pop(stack[index],'#/athletes')}}
 nav=new NavigationHistory(port,'#/athletes')
 for(const [k,v] of Object.entries({genderFilter:'M',countryFilter:'ZAF',search:'Blummenfelt'}))nav.saveUI(k,v)
 nav.saveScroll({x:0,y:150,elements:{countries:210}})
 const before=carousel(render(nav.current.ui))
 nav.navigate({page:'athlete',id:'1'});nav.back()
 assert.deepEqual(nav.current.scroll,{x:0,y:150,elements:{countries:210}})
 assert.equal(nav.current.ui.genderFilter,'M');assert.equal(nav.current.ui.search,'Blummenfelt')
 const html=render(nav.current.ui)
 assert.equal(carousel(html),before)
 assert.match(carousel(html),/class="athletes-country-chip is-active"[^]*?chip__code">ZA</)
 nav.saveUI('search','')
 assert.equal(filterAthletes(athletes,nav.current.ui).length,athletes.filter(a=>a.gender==='M'&&athleteCountryKey(a)==='ZA').length)
})
