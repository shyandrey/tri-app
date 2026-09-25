import test from 'node:test'
import assert from 'node:assert/strict'
import { NavigationHistory, parseRoute } from '../src/navigation/history.ts'
function setup(hash='#/home') {
 const entries=[{state:null,url:hash}];let index=0, pops=0
 const port={get state(){return entries[index].state},pushState(state,_,url){entries.splice(++index);entries.push({state:structuredClone(state),url})},replaceState(state,_,url){entries[index]={state:structuredClone(state),url}},back(){pops++}}
 let nav=new NavigationHistory(port,hash)
 return {get nav(){return nav},entries,get index(){return index},get pops(){return pops},back(){nav.back();if(pops){pops=0;index--;nav.pop(port.state,entries[index].url)}},browserBack(){index--;nav.pop(port.state,entries[index].url)},forward(){index++;nav.pop(port.state,entries[index].url)},reload(){nav=new NavigationHistory(port,entries[index].url)}}
}
for(const origin of ['athlete','calendar','home'])test(`${origin} → Race → Back restores actual route and state`,()=>{
 const s=setup(origin==='athlete'?'#/athlete/42':`#/${origin}`)
 const route=s.nav.current.route,key=s.nav.current.key
 s.nav.saveUI('expandedYears',['2025']);s.nav.saveScroll({x:0,y:712,elements:{countries:130}})
 s.nav.navigate({page:'race',id:'race-2025'});s.back()
 assert.deepEqual(s.nav.current.route,route);assert.equal(s.nav.current.key,key)
 assert.deepEqual(s.nav.current.ui.expandedYears,['2025']);assert.equal(s.nav.current.scroll.y,712)
 assert.equal(s.nav.current.scroll.elements.countries,130)
})
test('Athletes → Athlete → Race → UI/browser Back → Back; Forward and reload retain independent state',()=>{
 const s=setup('#/athletes')
 s.nav.saveUI('search','knibb');s.nav.saveUI('genderFilter','W');s.nav.saveUI('countryFilter','US');s.nav.saveScroll({x:0,y:400,elements:{}})
 s.nav.navigate({page:'athlete',id:'42'});s.nav.saveUI('expandedYears',['2024','2025']);s.nav.saveScroll({x:0,y:600,elements:{}})
 s.nav.navigate({page:'race',id:'race-2025'});s.nav.saveUI('resultSort','bike')
 const length=s.entries.length;s.browserBack();assert.equal(s.nav.current.route.id,'42');assert.equal(s.nav.current.scroll.y,600)
 s.back();assert.equal(s.nav.current.route.page,'athletes');assert.equal(s.nav.current.ui.search,'knibb');assert.equal(s.nav.current.ui.genderFilter,'W');assert.equal(s.nav.current.ui.countryFilter,'US');assert.equal(s.nav.current.scroll.y,400)
 s.forward();s.reload();assert.deepEqual(s.nav.current.ui.expandedYears,['2024','2025']);s.forward();assert.equal(s.nav.current.ui.resultSort,'bike');assert.equal(s.entries.length,length)
})
test('same-route navigation and UI changes do not push; repeated Back is guarded; new branch discards Forward',()=>{
 const s=setup();assert.equal(s.nav.navigate({page:'home'}),false)
 s.nav.saveUI('index',2);assert.equal(s.entries.length,1)
 s.nav.navigate({page:'athletes'});s.nav.navigate({page:'athlete',id:'1'})
 s.nav.back();s.nav.back();assert.equal(s.pops,1)
 s.browserBack();s.nav.navigate({page:'calendar'});assert.equal(s.entries.length,3);assert.equal(s.nav.current.route.page,'calendar')
})
test('direct detail link seeds exactly one safe fallback, refresh does not duplicate, no fallback loop',()=>{
 const s=setup('#/race/test');assert.equal(s.entries.length,2);s.reload();assert.equal(s.entries.length,2)
 s.back();assert.equal(s.nav.current.route.page,'calendar');s.back();assert.equal(s.nav.current.route.page,'home');s.back();assert.equal(s.entries.length,2)
 assert.deepEqual(parseRoute('#/athlete/42'),{page:'athlete',id:'42'});assert.deepEqual(parseRoute('#/race/%invalid'),{page:'home'})
})
test('invalid entry/unknown URL is recovered without a push loop',()=>{
 const s=setup();s.nav.pop({triNavigation:{version:1}},'#/invalid');assert.equal(s.nav.current.route.page,'home');assert.equal(s.entries.length,1)
 s.nav.pop(null,'#/race/test');s.back();assert.equal(s.nav.current.route.page,'calendar')
})

test('browser Back during an unsettled scroll uses the latest in-memory snapshot on Forward',()=>{
 const s=setup('#/athletes');s.nav.navigate({page:'athlete',id:'42'})
 s.nav.saveScroll({x:0,y:917,elements:{}},false)
 s.browserBack();s.forward();assert.equal(s.nav.current.scroll.y,917)
})
