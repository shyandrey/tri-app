import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5197'
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0,mode='normal';const pending=new Map(),held=[],requests=[]
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}
 else if(d.method==='Network.requestWillBeSent'&&d.params.type==='Script')requests.push(d.params.request.url)
 else if(d.method==='Fetch.requestPaused'){
  if(mode==='hold')held.push(d.params.requestId)
  else void send(mode==='fail'?'Fetch.failRequest':'Fetch.continueRequest',{requestId:d.params.requestId,...(mode==='fail'?{errorReason:'ConnectionFailed'}:{})})
 }}
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const until=async expression=>{for(let i=0;i<100;i++){if(await js(expression))return;await wait(100)}throw Error('Timeout: '+expression)}
const start=async hash=>{requests.length=0;await send('Page.navigate',{url:base+'/?split='+Date.now()+hash});await until('!!document.querySelector(".bottom-nav")')}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(150)}
const shot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('/tmp/tri-split-'+name+'.png',Buffer.from(s.data,'base64'))}
const sportsRequests=()=>requests.filter(u=>/sports-entry.*\.js/.test(u))
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true})
await send('Fetch.enable',{patterns:[{urlPattern:'*sports-entry*.js',requestStage:'Request'}]})
try{
 for(const [width,height]of [[390,844],[440,844],[844,390],[1440,900]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000})
  mode='hold';await start('#/home');await wait(300);assert.equal(sportsRequests().length,0);if(width===390)await shot('home-390')
  await start('#/calendar');assert.equal(sportsRequests().length,0);assert.equal(await js('document.querySelectorAll(".race-card").length'),4)
  await start('#/athletes');await until('!!document.querySelector("[data-route-pending]")');assert.equal(await js('location.hash'),'#/athletes');if(width===390)await shot('loading-390')
  // Leave while requests are blocked. A stale resolution must not navigate back.
  await js("[...document.querySelectorAll('.bottom-nav button')].find(e=>e.getAttribute('aria-label')==='Главная').click()")
  mode='normal';for(const id of held.splice(0))await send('Fetch.continueRequest',{requestId:id})
  await wait(600);assert.equal(await js('location.hash'),'#/home')
  await js("[...document.querySelectorAll('.bottom-nav button')].find(e=>e.getAttribute('aria-label')==='Профили атлетов').click()")
  await until('document.querySelectorAll(".athlete-card").length===50')
  const loaded=sportsRequests().length
  await js("[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.textContent.includes('WOMEN')).click()")
  await click('.athletes-expand');await click('.athletes-expand');assert.equal(await js('document.querySelectorAll(".athlete-card").length'),150)
  await js('scrollTo({top:900,behavior:"instant"})');await wait(200)
  const state=await js('history.state.triNavigation.ui'),y=await js('scrollY')
  await click('.athlete-card');const athleteHash=await js('location.hash');await until('!!document.querySelector(".athlete-detail-page")')
  if(width===390)await shot('athlete-390')
  await click('.page-back-button');await until('document.querySelectorAll(".athlete-card").length===150')
  assert.deepEqual(await js('history.state.triNavigation.ui'),state);assert.ok(Math.abs(await js('scrollY')-y)<3)
  if(width===390)await shot('back-390')
  await js('history.forward()');await until('!!document.querySelector(".athlete-detail-page")');await js('history.back()');await until('document.querySelectorAll(".athlete-card").length===150');assert.ok(Math.abs(await js('scrollY')-y)<3)
  assert.equal(sportsRequests().length,loaded)
  // Cold reload of an expanded history entry: restore only after delayed page is ready.
  mode='hold';await send('Page.reload');await until('!!document.querySelector("[data-route-pending]")')
  mode='normal';for(const id of held.splice(0))await send('Fetch.continueRequest',{requestId:id})
  await until('document.querySelectorAll(".athlete-card").length===150');await wait(100)
  assert.deepEqual(await js('history.state.triNavigation.ui'),state);assert.ok(Math.abs(await js('scrollY')-y)<3)
  // Failed cold reload must not overwrite the expanded entry with loading-page scroll.
  mode='fail';await send('Page.reload');await until('!!document.querySelector(".sports-loading__retry")')
  assert.deepEqual(await js('history.state.triNavigation.ui'),state)
  mode='normal';await click('.sports-loading__retry');await until('document.querySelectorAll(".athlete-card").length===150');await wait(100)
  assert.deepEqual(await js('history.state.triNavigation.ui'),state);assert.ok(Math.abs(await js('scrollY')-y)<3)
  mode='hold';await start(athleteHash);assert.equal(await js('location.hash'),athleteHash)
  mode='normal';for(const id of held.splice(0))await send('Fetch.continueRequest',{requestId:id})
  await until('!!document.querySelector(".athlete-detail-page")')
  if(width===390)await shot('athlete-deep-link-390')
  await start('#/race/ironman-70-3-oceanside-2026');await until('!!document.querySelector(".race-detail-page")');if(width===390)await shot('race-390')
  await start('#/athlete/not-real');await until('location.hash==="#/athletes" && document.querySelectorAll(".athlete-card").length===50')
  await start('#/race/not-real');await until('location.hash==="#/calendar" && document.querySelectorAll(".race-card").length===4')
  mode='fail';await start('#/athletes');await until('!!document.querySelector(".sports-loading__retry")');if(width===390)await shot('error-390')
  const failedState=await js('history.state.triNavigation.key');mode='normal';await click('.sports-loading__retry')
  await until('document.querySelectorAll(".athlete-card").length===50');assert.equal(await js('history.state.triNavigation.key'),failedState)
  if(width===390)await shot('athletes-390')
  assert.equal(await js('document.documentElement.scrollWidth>innerWidth'),false)
  console.log(`PASS ${width}: cold shell/calendar, delayed sports, leave while loading, Back/Forward, delayed reload scroll, deep links, unknown ID, failed import + real retry, shared load`)
 }
}finally{await send('Fetch.disable');socket.close()}
