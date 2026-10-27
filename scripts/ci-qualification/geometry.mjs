import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const out=process.env.TRI_ARTIFACT_DIR,base=process.env.TRI_APP_URL,cdp=process.env.TRI_CDP_URL
if(!out||!base||!cdp)throw Error('Explicit diagnostic paths/endpoints required')
await fs.mkdir(out,{recursive:true})
const targets=await(await fetch(cdp+'/json/list')).json(),socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const until=async expression=>{const end=Date.now()+10000;while(!await js(expression)){assert.ok(Date.now()<end,'Diagnostic readiness: '+expression);await sleep(50)}}
const measure=()=>js(`(()=>{const rect=e=>{if(!e)return null;const b=e.getBoundingClientRect(),c=getComputedStyle(e);return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,scrollLeft:e.scrollLeft,overflowX:c.overflowX,overflowY:c.overflowY,scrollbarGutter:c.scrollbarGutter,scrollbarWidth:c.scrollbarWidth}};const d=document.documentElement;return {innerWidth,outerWidth,innerHeight,outerHeight,dpr:devicePixelRatio,visualViewport:visualViewport?{width:visualViewport.width,height:visualViewport.height,scale:visualViewport.scale}:null,root:rect(d),body:rect(document.body),scrollHeight:d.scrollHeight,clientHeight:d.clientHeight,verticalScrollable:d.scrollHeight>d.clientHeight,scrollbarReserved:innerWidth-d.clientWidth,series:document.querySelector('main')?.dataset.series,season:document.querySelector('.standings-season span')?.textContent,table:rect(document.querySelector('.rankings-table-panel:not([inert]) table')),hero:rect(document.querySelector('.standings-showcase')),track:rect(document.querySelector('.standings-showcase .rankings-snap-track')),panels:[...document.querySelectorAll('.rankings-showcase-panel')].map(rect),more:rect(document.querySelector('.more-content'))}})()`)
const results=[]
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const version=await send('Browser.getVersion');await fs.writeFile(path.join(out,'browser.json'),JSON.stringify(version,null,2))
 for(const scenario of [{name:'rankings-desktop',route:'rankings',width:844,height:390,mobile:false},{name:'showcase-desktop',route:'rankings',width:1440,height:900,mobile:false},{name:'more-desktop',route:'more',width:768,height:900,mobile:false},{name:'rankings-mobile',route:'rankings',width:390,height:844,mobile:true}]){
  await send('Emulation.setDeviceMetricsOverride',{width:scenario.width,height:scenario.height,deviceScaleFactor:1,mobile:scenario.mobile})
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'reduce'}]})
  await send('Page.navigate',{url:base+'/?qa05='+scenario.name+'#/'+scenario.route})
  await until(scenario.route==='rankings'?"document.querySelectorAll('.rankings-showcase-panel img').length===2 && document.querySelectorAll('.rankings-table-panel:not([inert]) tbody tr').length===10":"!!document.querySelector('.more-release summary')")
  if(scenario.route==='rankings'){
   await js("Promise.all([...document.querySelectorAll('.rankings-showcase-panel img')].map(i=>i.decode()))")
   if(scenario.name==='rankings-desktop'){
    await js("document.querySelector('.standings-season').click()")
    await until("!!document.querySelector('#season-2024')")
    await js("document.querySelector('#season-2024').click()")
    await until("document.querySelector('.standings-season span').textContent==='2024' && document.querySelector('.rankings-table-panel:not([inert]) table').dataset.season==='2024'")
    await js("document.querySelector('.standings-sheet header button').click()")
   }else if(scenario.name==='showcase-desktop'){
    await js("document.querySelector('.standings-series button:nth-child(2)').click()")
    await until("document.querySelector('main').dataset.series==='T100' && Math.abs(document.querySelector('.standings-showcase .rankings-snap-track').scrollLeft-document.querySelector('.standings-showcase .rankings-snap-track').clientWidth)<1")
   }
  }else{
   await js("document.querySelector('.more-release summary').click();document.querySelector('.more-release summary').click()")
  }
  await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  const before=await measure(),shot=await send('Page.captureScreenshot',{format:'png'}),png=Buffer.from(shot.data,'base64');await fs.writeFile(path.join(out,scenario.name+'.png'),png)
  // Diagnostic-only causal intervention on this document, restored before leaving it.
  const prior=await js("document.documentElement.getAttribute('style')")
  await js("document.documentElement.style.setProperty('scrollbar-width','none','important')")
  await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  const hidden=await measure()
  await js(`(()=>{const s=${JSON.stringify(prior)};s===null?document.documentElement.removeAttribute('style'):document.documentElement.setAttribute('style',s)})()`)
  await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  const restored=await measure()
  const result={scenario,platform:process.platform,browser:version.product,screenshot:{width:png.readUInt32BE(16),height:png.readUInt32BE(20)},before,hidden,restored}
  results.push(result);console.log('QA05_GEOMETRY '+JSON.stringify(result))
 }
 assert.equal(errors.length,0,JSON.stringify(errors))
}finally{await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify({results,errors},null,2));socket.close()}
