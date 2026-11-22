import test from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import path from 'node:path'
import {createServer} from 'vite'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n')
async function load(baseline=false){
 const s=await createServer({configFile:false,define:{__PRIMARY_SEASON__:'2026'},plugins:baseline?[{name:'historical-head',enforce:'pre',load(id){const p=path.relative(process.cwd(),id);if(p.startsWith('src/')&&changed.includes(p))return execFileSync('git',['show','HEAD:'+p],{encoding:'utf8'})}}]:[],server:{middlewareMode:true,watch:null,hmr:false},appType:'custom',logLevel:'silent'})
 try{return await Promise.all(['/src/data/raceEditions.ts','/src/data/statsPtoRaceUrls.ts','/src/pages/RaceDetailPage.tsx','/src/components/RaceCard.tsx'].map(p=>s.ssrLoadModule(p)))}finally{await s.close()}
}
const [data,urls,{default:Detail},{default:Card}]=await load(),[old,oldUrls]=await load(true)
const future=data.raceEditions.filter(e=>e.year===2027)
const url='https://stats.protriathletes.org/race/synthetic-fixture/2027/results'
const fixture={raceId:'t100-spain',year:2027,statsPtoUrl:url,statsPtoVerification:{url,evidenceRef:'SYNTHETIC TEST REVIEW ONLY; not real sporting evidence'}}
test('every2027 edition/view has no inferred URL; baseline slug matches cannot escape guard',()=>{
 assert.ok(future.length>0)
 const previouslyInferred=future.filter(e=>oldUrls.getStatsPtoUrl(e.raceId,e.year))
 assert.ok(previouslyInferred.length>0) // audit count is evidence, not a permanent rule
 for(const e of future){assert.equal(e.statsPtoUrl,undefined);assert.equal(urls.getStatsPtoUrl(e.raceId,e.year),undefined);assert.equal(urls.resolveEditionStatsPtoUrl(e),undefined)}
 for(const view of data.allRaceEditionViews.filter(e=>e.year===2027))assert.equal(view.statsPtoUrl,undefined)
 assert.equal(urls.getStatsPtoUrl('challenge-roth',2027),undefined)
})
test('explicit reviewed URL retained exactly; historical slug is not needed',()=>{
 assert.equal(urls.resolveEditionStatsPtoUrl(fixture),url)
 assert.equal(urls.resolveEditionStatsPtoUrl({...fixture,raceId:'synthetic-new-race'}),url)
})
test('supplied string, missing review, empty evidence and mismatched review are not verification',()=>{
 for(const patch of [{statsPtoVerification:undefined},{statsPtoVerification:{url}},{statsPtoVerification:{url,evidenceRef:''}},{statsPtoVerification:{url,evidenceRef:'  '}},{statsPtoVerification:{url:url+'/',evidenceRef:'synthetic'}},{statsPtoUrl:undefined}])assert.equal(urls.resolveEditionStatsPtoUrl({...fixture,...patch}),undefined)
})
test('review cannot admit malformed, foreign, wrong-year or decorated URL',()=>{
 for(const bad of ['bad','https://example.org/race/test/2027/results',url.replace('/2027/','/2026/'),url+'?tracking=1',url+'#fragment',url.replace('https:','http:')])assert.equal(urls.resolveEditionStatsPtoUrl({...fixture,statsPtoUrl:bad,statsPtoVerification:{url:bad,evidenceRef:'synthetic'}}),undefined)
})
test('2024–2026 normalized and presentation URLs exactly match committed history',()=>{
 const projection=rows=>rows.map(e=>[e.id??e.editionId,e.raceId,e.year,e.statsPtoUrl])
 assert.deepEqual(projection(data.raceEditions.filter(e=>e.year<2027)),projection(old.raceEditions))
 assert.deepEqual(projection(data.allRaceEditionViews.filter(e=>e.year<2027)),projection(old.allRaceEditionViews))
 for(const e of old.raceEditions)assert.equal(urls.getStatsPtoUrl(e.raceId,e.year),oldUrls.getStatsPtoUrl(e.raceId,e.year))
 for(const year of [2024,2025,2026])assert.equal(urls.resolveEditionStatsPtoUrl({...fixture,year,statsPtoVerification:undefined}),url) // historical explicit-override behavior unchanged
})
test('Roth historical URL references remain intact',()=>{
 for(const year of [2024,2025,2026]){
  const e=data.raceEditions.find(e=>e.id===`challenge-roth-${year}`),before=old.raceEditions.find(e=>e.id===`challenge-roth-${year}`)
  assert.ok(e.statsPtoUrl);assert.equal(e.statsPtoUrl,before.statsPtoUrl)
 }
})
test('all25 future cards/details render without PTO links or unknown URL placeholders',()=>{
 const noOp=()=>{}
 for(const race of data.calendar2027Views){
  const detail=renderToStaticMarkup(React.createElement(Detail,{race,raceEditions:data.allRaceEditionViews,allResults:[],athletes:[],onBack:noOp,onNavigate:noOp,onAthleteClick:noOp}))
  const card=renderToStaticMarkup(React.createElement(Card,{edition:race,...race,onClick:noOp}))
  assert.ok(detail.includes(race.name));assert.ok(card.includes(race.name))
  for(const html of [detail,card]){assert.doesNotMatch(html,/<a\b[^>]*href=["'][^"']*stats\.protriathletes\.org/i);assert.doesNotMatch(html,/href=["'](?:undefined|null)["']/)}
 }
})
