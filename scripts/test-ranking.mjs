import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { NavigationHistory } from '../src/navigation/history.ts'

const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
const { athletes } = await server.ssrLoadModule('/src/data/athletes/index.ts')
const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
const { sortAthletesByRanking, calculateAthleteRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
const { default: App } = await server.ssrLoadModule('/src/App.tsx')
const { default: Page } = await server.ssrLoadModule('/src/pages/AthletesPage.tsx')
const { NavigationContext } = await server.ssrLoadModule('/src/navigation/usePageState.ts')
const { getRankingDatasetClock } = await server.ssrLoadModule('/src/utils/rankingDatasetClock.ts')
const linked = linkResultsToAthletes(raceResults), asOf = getRankingDatasetClock(athletes, linked, allRaceEditionViews)
const ranked = sortAthletesByRanking(athletes, linked, allRaceEditionViews, asOf)
const headings = html => [...html.matchAll(/<h3>(.*?)<\/h3>/g)].map(m=>m[1])
const expectedHeadings = rows => rows.map(a=>renderToStaticMarkup(createElement('h3',null,a.name)).replace(/^<h3>|<\/h3>$/g,''))
function historyPort() {
 const stack=[];let index=-1,nav
 const port={get state(){return stack[index]??null},pushState(s){stack.splice(++index);stack.push(structuredClone(s))},replaceState(s){if(index<0)index=0;stack[index]=structuredClone(s)},back(){index--;nav.pop(stack[index],'#/athletes')}}
 nav=new NavigationHistory(port,'#/athletes')
 return {port,nav}
}
function renderApp(gender, search='') {
 const {port,nav}=historyPort();nav.saveUI('genderFilter',gender);nav.saveUI('search',search)
 const previous=globalThis.window
 globalThis.window={history:port,location:{hash:'#/athletes'}}
 try{return renderToStaticMarkup(createElement(App))}finally{if(previous===undefined)delete globalThis.window;else globalThis.window=previous}
}
for(const gender of ['M','W'])test(`full App ${gender} catalog matches production ranked order and full gender count`,()=>{
 const expected=ranked.filter(a=>a.gender===gender),html=renderApp(gender)
 assert.deepEqual(headings(html),expectedHeadings(expected))
})
test('Taylor Knibb is first in current women ranking, not catalog position 104',()=>{
 assert.equal(ranked.filter(a=>a.gender==='W')[0].nameEn,'Taylor Knibb')
 assert.equal(headings(renderApp('W'))[0],expectedHeadings(athletes.filter(a=>a.nameEn==='Taylor Knibb'))[0])
})
test('catalog permutation does not change ranked order',()=>{
 const scored=new Set(calculateAthleteRanking(athletes,linked,allRaceEditionViews,asOf).map(r=>r.athleteId))
 const reverse=sortAthletesByRanking([...athletes].reverse(),linked,allRaceEditionViews,asOf)
 assert.deepEqual(reverse.filter(a=>scored.has(a.id)).map(a=>a.id),ranked.filter(a=>scored.has(a.id)).map(a=>a.id))
})
test('zero-score and unranked generated profiles stay in the tail without a cutoff',()=>{
 const rankedIds=new Set(calculateAthleteRanking(athletes,linked,allRaceEditionViews,asOf).map(r=>r.athleteId))
 const zero=calculateAthleteRanking(athletes,linked,allRaceEditionViews,asOf).find(r=>r.score===0)
 assert.ok(headings(renderApp(athletes.find(a=>a.id===zero.athleteId).gender)).includes(expectedHeadings(athletes.filter(a=>a.id===zero.athleteId))[0]))
 const unranked={...athletes[0],id:-1,name:'Unranked generated profile',nameEn:'Unranked generated profile',image:undefined}
 const sorted=sortAthletesByRanking([unranked,...athletes],linked,allRaceEditionViews,asOf)
 assert.equal(sorted.at(-1).id,-1)
 const html=renderToStaticMarkup(createElement(NavigationContext.Provider,{value:{current:{ui:{genderFilter:unranked.gender}}}},createElement(Page,{athletes:sorted,ranking:[],onBack(){},onAthleteClick(){},onNavigate(){}})))
 assert.ok(headings(html).includes(expectedHeadings([unranked])[0]));assert.equal(rankedIds.size,athletes.length)
})
test('Catalog -> Athlete -> Back preserves gender, order and scroll',()=>{
 const {nav}=historyPort();nav.saveUI('genderFilter','W');nav.saveScroll({x:0,y:850,elements:{}})
 const render=()=>renderToStaticMarkup(createElement(NavigationContext.Provider,{value:nav},createElement(Page,{athletes:ranked,ranking:[],onBack(){},onAthleteClick(){},onNavigate(){}})))
 const before=render();nav.navigate({page:'athlete',id:'104'});nav.back()
 assert.equal(nav.current.ui.genderFilter,'W');assert.equal(nav.current.scroll.y,850);assert.equal(render(),before)
})

test('full App ALL uses first 50 production-ranked profiles; counts still describe the complete catalog',()=>{
 const html=renderApp('ALL')
 assert.deepEqual(headings(html),expectedHeadings(ranked.slice(0,50)))
 assert.deepEqual([...html.matchAll(/class="athletes-gender-card__count">(\d+)</g)].map(m=>Number(m[1])),[athletes.length,athletes.filter(a=>a.gender==='M').length,athletes.filter(a=>a.gender==='W').length])
 assert.ok(html.includes(`Показаны 50 из ${athletes.length}`))
})
test('full App search finds a real profile outside the initial 50, even under opposite gender',()=>{
 const tail=ranked.at(-1)
 assert.ok(!ranked.slice(0,50).some(a=>a.id===tail.id))
 assert.ok(headings(renderApp(tail.gender==='M'?'W':'M',tail.nameEn)).includes(expectedHeadings([tail])[0]))
})
await server.close()
