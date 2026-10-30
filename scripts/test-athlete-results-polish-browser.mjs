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
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(220)}
const output=process.env.TRI_ARTIFACT_DIR??'/tmp/300w-athlete-results-polish';await fs.mkdir(output,{recursive:true})
try {
 await send('Page.enable');await send('Runtime.enable');await send('DOM.enable');await send('CSS.enable')
 for(const [width,height] of [[320,700],[390,844],[440,956],[667,375],[844,390],[956,440],[1440,900]])for(const theme of ['light','dark']){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768})
  await send('Emulation.setTouchEmulationEnabled',{enabled:width<768})
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]})
  await send('Page.navigate',{url:base+'/?results-polish='+Date.now()+'#/athlete/1'});await wait(600)
  await js('document.querySelector(".athlete-detail__results").scrollIntoView({block:"start",behavior:"instant"})')
  const geometry=()=>js(`Array.from(document.querySelectorAll('.athlete-results-year__toggle'),e=>{const b=e.getBoundingClientRect(),l=e.firstElementChild.getBoundingClientRect(),c=e.lastElementChild.getBoundingClientRect();return {h:b.height,centerDelta:Math.abs(l.top+l.height/2-c.top-c.height/2),gap:c.left-l.right,top:l.top-b.top,bottom:b.bottom-l.bottom}})`)
  const before=await geometry();assert.ok(before.length>=2)
  for(const g of before){assert.ok(g.centerDelta<.5);assert.ok(Math.abs(g.gap-12)<.5);assert.ok(Math.abs(g.top-g.bottom)<.5);assert.ok(g.top>=10)}
  await click('.athlete-results-year__toggle');assert.equal(await js('document.querySelector(".athlete-results-year__toggle").ariaExpanded'),'false')
  assert.deepEqual(await geometry(),before)
  let shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${width}-${theme}-collapsed.png`,Buffer.from(shot.data,'base64'))
  await click('.athlete-results-year__toggle');assert.equal(await js('document.querySelector(".athlete-results-year__toggle").ariaExpanded'),'true')
  assert.deepEqual(await geometry(),before)
  await js('document.querySelector(".athlete-detail__results").scrollIntoView({block:"start",behavior:"instant"})');await wait(180)
  const rowGeometry=()=>js(`(()=>{const e=document.querySelector('.athlete-result-card'),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,y:r.y,w:r.width,h:r.height,text:e.textContent,color:s.color,padding:s.padding,borderRadius:s.borderRadius}})()`)
  const rowBefore=await rowGeometry();assert.equal(rowBefore.borderRadius,'9px');assert.equal(rowBefore.padding,'12px 8px')
  const root=await send('DOM.getDocument');const {nodeId}=await send('DOM.querySelector',{nodeId:root.root.nodeId,selector:'.athlete-result-card'})
  await send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['hover']});await wait(180)
  assert.deepEqual(await rowGeometry(),rowBefore)
  const hoverSupported=await js('matchMedia("(hover:hover) and (pointer:fine)").matches')
  assert.equal(await js('getComputedStyle(document.querySelector(".athlete-result-card")).backgroundColor'),hoverSupported?'rgb(32, 37, 43)':'rgba(0, 0, 0, 0)')
  if(hoverSupported){const hoverShot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${width}-${theme}-hover.png`,Buffer.from(hoverShot.data,'base64'))}
  await send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]})
  await js('document.querySelector(".athlete-result-card").focus()')
  await send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:['focus-visible']})
  assert.equal(await js('getComputedStyle(document.querySelector(".athlete-result-card")).outlineStyle'),'solid')
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${width}-${theme}-expanded.png`,Buffer.from(shot.data,'base64'))
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await wait(200)
  assert.match(await js('location.hash'),/^#\/race\//)
  await click('.page-back-button');assert.match(await js('location.hash'),/^#\/athlete\/1$/)
  await click('.athlete-result-card');assert.match(await js('location.hash'),/^#\/race\//)
  console.log(`PASS ${width} ${theme}: season centers/gap/padding stable, collapse/expand, ${hoverSupported?'mouse hover':'touch hover suppressed'}, no shift, focus/Enter/click navigation`)
 }
 assert.equal(errors.length,0,JSON.stringify(errors))
} finally { socket.close() }
