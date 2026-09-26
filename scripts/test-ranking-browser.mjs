import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createServer } from 'vite'

const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
let expected
try {
 const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
 const {raceResults}=await server.ssrLoadModule('/src/data/results/index.ts')
 const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
 const {linkResultsToAthletes}=await server.ssrLoadModule('/src/utils/raceResults.ts')
 const {sortAthletesByRanking}=await server.ssrLoadModule('/src/utils/athleteRanking.ts')
 const ranked=sortAthletesByRanking(athletes,linkResultsToAthletes(raceResults),allRaceEditionViews)
 expected=Object.fromEntries(['M','W'].map(g=>[g,ranked.filter(a=>a.gender===g)]))
} finally {await server.close()}
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9231')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
try {
 await send('Page.enable');await send('Runtime.enable')
 for(const width of [390,1440]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:800,deviceScaleFactor:1,mobile:width<768})
  await send('Page.navigate',{url:(process.env.TRI_APP_URL??'http://127.0.0.1:5190')+'/?ranking='+Date.now()+'#/top'});await wait(700)
  for(const [gender,label] of [['M','MEN'],['W','WOMEN']]) {
   await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.textContent.includes('${label}')).click()`);await wait(150)
   const order=await js(`[...document.querySelectorAll('.top-athlete-card h3')].map(e=>e.textContent.trim())`)
   assert.deepEqual(order,expected[gender].map(a=>`${a.name} ${a.flag}`.trim()))
   assert.deepEqual(await js(`[...document.querySelectorAll('.top-athlete-card__position')].map(e=>Number(e.textContent))`),order.map((_,i)=>i+1))
   assert.equal(await js('document.documentElement.scrollWidth'),width)
   await js('window.scrollTo({top:700,behavior:"instant"})');await wait(200)
   const y=await js('scrollY')
   await js('document.querySelectorAll(".top-athlete-card")[5].click()');await wait(200)
   assert.equal(await js('history.state.triNavigation.route.page'),'athlete')
   await js('document.querySelector(".page-back-button").click()');await wait(300)
   assert.equal(await js('history.state.triNavigation.route.page'),'top')
   assert.equal(await js('history.state.triNavigation.ui.rankingGender ?? "M"'),gender)
   assert.equal(await js('document.querySelector(".athletes-gender-card.is-active .athletes-gender-card__label").textContent'),label)
   assert.ok(Math.abs(await js('scrollY')-y)<=2)
   assert.deepEqual(await js(`[...document.querySelectorAll('.top-athlete-card h3')].map(e=>e.textContent.trim())`),order)
   await js('window.scrollTo({top:0,behavior:"instant"})');await wait(100)
   const screenshot=await send('Page.captureScreenshot',{format:'png'})
   await fs.writeFile(`/tmp/tri-ranking-${width}-${gender}.png`,Buffer.from(screenshot.data,'base64'))
   console.log(`PASS ${width}px ${label}: production order, numbering, Back selection/scroll, no overflow`)
  }
 }
 assert.deepEqual(errors,[])
 for(const g of ['M','W'])console.log(g,'TOP-10:',expected[g].slice(0,10).map(a=>a.nameEn).join(' | '))
} finally {socket.close()}
