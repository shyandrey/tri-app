import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5201',label=process.env.TRI_IMAGE_LABEL??'before',out=process.env.TRI_IMAGE_OUT??'/tmp/tri-images-review'
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname))
await fs.mkdir(out,{recursive:true})
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9235')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0,loaderId;const pending=new Map(),requests=new Map(),reports=[]
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Network.responseReceived'){const r=d.params.response;requests.set(d.params.requestId,{url:r.url,loaderId:d.params.loaderId,type:d.params.type,mime:r.mimeType,status:r.status,cached:!!(r.fromDiskCache||r.fromServiceWorker),wire:0})}else if(d.method==='Network.loadingFinished'){const r=requests.get(d.params.requestId);if(r)r.wire=d.params.encodedDataLength}}
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const until=async expression=>{for(let n=0;n<100;n++){if(await js(expression))return;await wait(100)}throw Error(expression)}
const shot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${label}-${name}.png`,Buffer.from(s.data,'base64'))}
const start=async hash=>{requests.clear();loaderId=(await send('Page.navigate',{url:base+'/?images='+Date.now()+hash})).loaderId;await until('!!document.querySelector(".bottom-nav")');await wait(1200)}
async function record(name,width,dpr){
 const dom=await js(`({images:[...document.images].map(i=>{const r=i.getBoundingClientRect(),s=getComputedStyle(i);return {src:i.currentSrc||i.src,width:r.width,height:r.height,top:r.top,left:r.left,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,loading:i.loading,visible:r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth,objectFit:s.objectFit,objectPosition:s.objectPosition}}),slides:[...document.querySelectorAll('.showcase-card')].map(i=>{const r=i.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,background:getComputedStyle(i,'::before').backgroundImage}}),cls:window.imageCLS||0,resources:performance.getEntriesByType('resource').map(r=>({url:r.name,transfer:r.transferSize,encoded:r.encodedBodySize,decoded:r.decodedBodySize}))})`)
 reports.push({name,width,dpr,requests:[...requests.values()].filter(r=>r.loaderId===loaderId),...dom});await shot(`${name}-${width}`)
 const images=[...requests.values()].filter(r=>r.loaderId===loaderId&&r.type==='Image');console.log(`${label} ${name} ${width}@${dpr}: ${images.length} image requests, ${images.reduce((n,r)=>n+r.wire,0)} wire bytes`)
}
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true})
const fixture=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Math.random=()=>0.99;const interval=window.setInterval;window.setInterval=(fn,ms,...args)=>ms===4000&&${process.env.TRI_IMAGE_IDLE!=='1'}?(window.carouselTick=fn,0):interval(fn,ms,...args);window.imageCLS=0;new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.imageCLS+=e.value}).observe({type:'layout-shift',buffered:true})`})
try{
 for(const [width,height,dpr]of (process.env.TRI_IMAGE_IDLE==='1'?[[390,844,3],[1440,900,2]]:[[390,844,3],[440,844,3],[844,390,2],[1440,900,2]])){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:width<1000})
  await start('#/home');await record('home',width,dpr)
  if(process.env.TRI_IMAGE_IDLE==='1'){await wait(13000);await record('home-idle',width,dpr);continue}
  const count=await js('document.querySelectorAll(".showcase-card").length')
  for(let i=1;i<count;i++){await js(`(()=>{const t=document.querySelector('.home-showcase__track'),c=document.querySelectorAll('.showcase-card')[${i}];t.scrollTo({left:c.offsetLeft-(t.clientWidth-c.clientWidth)/2,behavior:'instant'})})()`);await wait(650);await shot(`slide-${i}-${width}`)}
  await record('home-all-slides',width,dpr)
  await start('#/athletes');await until('document.querySelectorAll(".athlete-card").length===50');await record('athletes-50',width,dpr)
  await js('document.querySelector(".athletes-expand").scrollIntoView({block:"end",behavior:"instant"})');await wait(650);await record('athletes-50-bottom',width,dpr)
  await js('document.querySelector(".athletes-expand").click()');await wait(650);assert.equal(await js('document.querySelectorAll(".athlete-card").length'),100);await record('athletes-100',width,dpr)
  await js('scrollTo({top:0,behavior:"instant"});document.querySelector(".athlete-card").click()');await wait(700);await record('athlete-detail',width,dpr)
  await start('#/race/ironman-70-3-oceanside-2026');await until('!!document.querySelector(".race-detail-page")');await record('race-detail',width,dpr)
 }
 await fs.writeFile(`${out}/${label}.json`,JSON.stringify(reports,null,2))
}finally{await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fixture.identifier});socket.close()}
