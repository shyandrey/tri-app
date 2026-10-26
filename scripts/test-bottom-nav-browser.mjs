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

// Real coordinate input is essential: HTMLElement.click() bypasses overlapping hit areas.
const output=process.env.TRI_NAV_OUTPUT??'/tmp/300w-rank02'
await fs.mkdir(output,{recursive:true})
const trace=[]
const tap=async(selector,mode='mouse')=>{
 const point=await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,owns:e.contains(document.elementFromPoint(x,y))}})()`)
 assert.ok(point.owns,`Occluded target: ${selector}`)
 const {x,y}=point
 if(mode==='touch'){
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]})
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
 }else{
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1})
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1})
 }
 await wait(100)
}
const navigate=async route=>{await send('Page.navigate',{url:base+'/?navtest='+Date.now()+'#/'+route});await wait(250)}
const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${name}.png`,Buffer.from(r.data,'base64'))}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true})
 for(const [width,height] of [[320,700],[375,812],[390,844],[440,956],[667,375],[844,390],[956,440]])for(const theme of ['dark','light']){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true})
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:'reduce'}]})
  await navigate('athlete/108')
  const race=await js("document.querySelector('.athlete-result-card')?.getAttribute('data-edition-id')")
  // Resolve a real race through the existing profile interaction, never invent an edition ID.
  await js("document.querySelector('.athlete-result-card')?.click()")
  await wait(150)
  const raceRoute=await js('location.hash.slice(2)')
  assert.ok(raceRoute.startsWith('race/'),`Missing race route (${race})`)
  for(const mode of ['mouse','touch'])for(const route of ['home','calendar','athletes','athlete/108',raceRoute,'rankings','more']){
   await navigate(route)
   await js("scrollTo({top:300,behavior:'instant'})");await wait(50)
   await js("window.__navPushes=0;window.__originalPush??=history.pushState.bind(history);history.pushState=(...args)=>{window.__navPushes++;return window.__originalPush(...args)}")
   const before=0
   await tap('.bottom-nav button:nth-of-type(4)',mode)
   assert.equal(await js('location.hash'),'#/rankings')
   const first=await js('window.__navPushes')
   assert.equal(first,before+(route==='rankings'?0:1),'Exactly one navigation')
   await tap('.bottom-nav button:nth-of-type(4)',mode)
   assert.equal(await js('location.hash'),'#/rankings')
   assert.equal(await js('window.__navPushes'),first,'Active tab must not push history')
   trace.push({width,height,theme,mode,from:route,first:'#/rankings',repeat:'#/rankings',historyDelta:first-before})
  }
  for(const mode of ['mouse','touch'])for(const [i,route]of ['home','calendar','athletes','rankings','more'].entries()){
   await navigate('rankings');await tap(`.bottom-nav button:nth-of-type(${i+1})`,mode)
   assert.equal(await js('location.hash'),'#/'+route)
  }
  await navigate('rankings')
  // Hit-test the whole interior, not only the fourth tab, at overlapping scroll offsets.
  for(const top of [0,60,120,240,400]){
   await js(`scrollTo({top:${top},behavior:'instant'})`);await wait(40)
   assert.ok(await js(`(()=>{const n=document.querySelector('.bottom-nav'),r=n.getBoundingClientRect();for(let x=r.left+24;x<r.right-24;x+=8)for(let y=r.top+20;y<r.bottom-20;y+=8)if(!n.contains(document.elementFromPoint(x,y)))return false;return true})()`),'Content must not intercept nav')
  }
  await js("scrollTo({top:0,behavior:'instant'})");await wait(40)
  await shot(`after-overlap-${width}-${theme}`)
  // Each row can be placed above the panel and remains a real profile link.
  for(let i=1;i<=10;i++){
   await js(`document.querySelector('.official-standings tbody tr:nth-child(${i})').scrollIntoView({block:'center',behavior:'instant'})`);await wait(30)
   assert.ok(await js(`(()=>{const r=document.querySelector('.official-standings tbody tr:nth-child(${i})').getBoundingClientRect(),n=document.querySelector('.bottom-nav').getBoundingClientRect();return r.top>=0&&r.bottom<n.top})()`))
  }
  await js("scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await wait(40)
  assert.ok(await js("document.querySelector('.standings-feedback').getBoundingClientRect().bottom<document.querySelector('.bottom-nav').getBoundingClientRect().top"))
  await shot(`after-bottom-${width}-${theme}`)
  const href=await js("document.querySelector('.official-standings tbody tr:last-child a').getAttribute('href')")
  await tap('.official-standings tbody tr:last-child a');assert.equal(await js('location.hash'),href)
  await tap('.page-back-button');assert.equal(await js('location.hash'),'#/rankings')
  await js("scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await wait(50)
  await tap('.feedback-entry');assert.equal(await js('location.hash'),'#/feedback')
  await tap('.page-back-button');assert.equal(await js('location.hash'),'#/rankings')
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  console.log(`PASS ${width}x${height} ${theme}: physical mouse/touch, all tabs, history, row hit testing, scroll clearance, Back/Feedback`)
 }
 assert.equal(errors.length,0,JSON.stringify(errors))
 await fs.writeFile(`${output}/interaction-trace.json`,JSON.stringify(trace,null,2)+'\n')
}finally{socket.close()}
