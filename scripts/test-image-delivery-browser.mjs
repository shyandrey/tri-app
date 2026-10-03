import assert from 'node:assert/strict'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5202'
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname))
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9235')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0,hold=false;const pending=new Map(),held=[],images=[],failures=[]
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}
 else if(d.method==='Fetch.requestPaused'){if(hold)held.push(d.params.requestId);else void send('Fetch.continueRequest',{requestId:d.params.requestId})}
 else if(d.method==='Network.responseReceived'&&d.params.type==='Image'){images.push(d.params.response.url);if(d.params.response.status>=400)failures.push(d.params.response.url)}}
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const wait=ms=>new Promise(r=>setTimeout(r,ms)),until=async expression=>{for(let n=0;n<100;n++){if(await js(expression))return;await wait(100)}throw Error('Timeout '+expression)}
const start=async hash=>{images.length=0;await send('Page.navigate',{url:base+'/?image-test='+Date.now()+hash});await until('!!document.querySelector(".bottom-nav")')}
const geometry=()=>js(`({height:document.documentElement.scrollHeight,cards:[...document.querySelectorAll('.athlete-card')].map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height,r.top]})})`)
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true})
await send('Fetch.enable',{patterns:[{urlPattern:'*-180-*.webp'},{urlPattern:'*-396-*.webp'}]})
const fixture=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Math.random=()=>0.99;const interval=window.setInterval;window.setInterval=(fn,ms,...a)=>ms===4000?(window.carouselTick=fn,0):interval(fn,ms,...a)`})
try{
 for(const [width,height,dpr]of [[390,844,3],[440,844,3],[844,390,2],[1440,900,2]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:width<1000})
  await start('#/home');await wait(900)
  assert.equal(await js('document.querySelectorAll(".showcase-card__image").length'),2)
  assert.equal(images.filter(u=>/-(640|1280|1672)-.*\.webp/.test(u)).length,2)
  assert.ok(await js('[...document.querySelectorAll(".showcase-card__image")].every(i=>i.complete&&i.naturalWidth>0)'))
  await js('window.carouselTick()');await wait(800)
  assert.equal(await js('document.querySelectorAll(".home-showcase__hint span")[1].className'),'is-active')
  for(const index of [3,0,2,1]){
   await js(`(()=>{const t=document.querySelector('.home-showcase__track'),c=document.querySelectorAll('.showcase-card')[${index}];t.scrollTo({left:c.offsetLeft-(t.clientWidth-c.clientWidth)/2,behavior:'instant'})})()`)
   await until(`(()=>{const i=document.querySelectorAll('.showcase-card')[${index}].querySelector('img');return i?.complete&&i.naturalWidth>0})()`)
  }
  hold=true;await start('#/athletes');await until('document.querySelectorAll(".athlete-card").length===50');await wait(200)
  const before=await geometry()
  assert.ok(await js('[...document.querySelectorAll(".athlete-card img")].every(i=>i.loading==="lazy"&&i.hasAttribute("width")&&i.hasAttribute("height"))'))
  hold=false;for(const id of held.splice(0))await send('Fetch.continueRequest',{requestId:id});await wait(600)
  assert.deepEqual(await geometry(),before)
  assert.ok(images.length<50,'far below-fold photos must not all download on initial list')
  for(const y of [2200,0,4500,0]){
   await js(`scrollTo({top:${y},behavior:'instant'})`);await wait(150)
   await until('[...document.querySelectorAll(".athlete-card img")].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight}).every(i=>i.complete&&i.naturalWidth>0)')
  }
  await js('document.querySelector(".athletes-expand").scrollIntoView({block:"end",behavior:"instant"})');await wait(300)
  const oldCount=images.length
  await js('document.querySelector(".athletes-expand").click()');await wait(500)
  assert.equal(await js('document.querySelectorAll(".athlete-card").length'),100)
  assert.ok(images.length-oldCount<50,'expansion must not eagerly download every newly appended photo')
  assert.equal(await js('document.documentElement.scrollWidth>innerWidth'),false)
  console.log(`PASS ${width}@${dpr}: two initial showcase images, auto/rapid carousel, lazy thumbnails, delayed-image geometry, rapid scroll, +50 network bound`)
 }
 assert.deepEqual(failures,[])
}finally{await send('Fetch.disable');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fixture.identifier});socket.close()}
