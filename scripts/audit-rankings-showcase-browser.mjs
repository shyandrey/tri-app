import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5390',cdp=process.env.TRI_CDP_URL??'http://127.0.0.1:9241'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch(cdp+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}).catch(e=>{throw Error(expression+': '+e.message)});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}



const out=process.env.RANK_PERF_PHASE??'after';const results=[]
await send('Page.enable');await send('Runtime.enable');await send('Network.enable')
const seed=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Math.random=()=>0;window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});document.addEventListener('load',e=>{if(e.target?.classList?.contains('standings-showcase__art'))window.__artLoaded=performance.now()},true)`})
const capture=async(label)=>{
 for(let i=0;i<150;i++){if(await js("Boolean(document.querySelector('.standings-showcase__art')?.complete&&document.querySelector('.standings-showcase__art')?.naturalWidth)"))break;await wait(40)}
 const timing=await js(`(async()=>{const img=document.querySelector('.standings-showcase__art');const t=performance.now();await img.decode();return {src:img.currentSrc,artLoadedMs:window.__artLoaded,decodeMs:performance.now()-t,routeReadyObservedMs:performance.now(),cls:window.__cls}})()`);await wait(400)
 const images=await js("performance.getEntriesByType('resource').filter(r=>/\\.(png|webp|jpe?g|avif)(\\?|$)/.test(r.name)).map(r=>({url:r.name.replace(location.origin,''),initiator:r.initiatorType,transfer:r.transferSize,encoded:r.encodedBodySize,duration:r.duration}))")
 results.push({label,...timing,images,imageRequests:images.length,transferredBytes:images.reduce((s,r)=>s+r.transfer,0)});console.log(label,images.length,results.at(-1).transferredBytes,timing.src)
}
try{
 for(const [width,height]of [[390,844],[844,390]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true})
  await send('Page.navigate',{url:'about:blank'});await wait(100)
  await send('Network.clearBrowserCache')
  await send('Page.navigate',{url:base+'/?perf='+Date.now()+'#/rankings'});await capture(`${width}-cold`)
  await send('Page.reload');await wait(80);await capture(`${width}-warm`)
 }
 await js('performance.clearResourceTimings()');await js("document.querySelector('.standings-series button:nth-child(2)').click()");await wait(100);await capture('landscape-series-switch')
 await js('performance.clearResourceTimings()');await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(150);await capture('rotate-to-portrait')
 await js('performance.clearResourceTimings()');await send('Emulation.setDeviceMetricsOverride',{width:844,height:390,deviceScaleFactor:1,mobile:true});await wait(150);await capture('rotate-back-cached')
 await js('performance.clearResourceTimings()');await js("document.querySelector('.standings-gender button:nth-child(2)').click()");await wait(150);await capture('gender-rerender')
 await fs.writeFile(`/tmp/300w-rank03/${out}-network.json`,JSON.stringify(results,null,2))
}finally{await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:seed.identifier});socket.close()}
