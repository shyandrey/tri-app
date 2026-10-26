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
const output=process.env.TRI_NAV_OUTPUT??'/tmp/300w-rank03e/navigation'
await fs.mkdir(output,{recursive:true})
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
try {
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true});
 for(const [width,height] of [[320,700],[375,812],[390,844],[440,956],[667,375],[844,390],[956,440]])for(const theme of ['dark','light']){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate('rankings');await wait(150);
  assert.equal(await js("getComputedStyle(document.querySelector('.bottom-nav')).zIndex"),'40');
  await shot(`initial-overlap-${width}-${theme}`);
  for(const mode of ['mouse','touch']){
   await js("document.querySelector('.official-standings tbody tr:first-child').scrollIntoView({block:'center',behavior:'instant'})");await wait(80);
   const row=await js("(()=>{const e=document.querySelector('.official-standings tbody tr:first-child'),r=e.getBoundingClientRect(),n=document.querySelector('.bottom-nav').getBoundingClientRect();return {top:r.top,bottom:r.bottom,navTop:n.top,href:e.querySelector('a').getAttribute('href')}})()");
   assert.ok(row.top>=0&&row.bottom<row.navTop,'Entire first row can be revealed above nav');
   await shot(`first-row-${width}-${theme}-${mode}`);
   await tap('.official-standings tbody tr:first-child a',mode);assert.equal(await js('location.hash'),row.href);
   await tap('.page-back-button',mode);assert.equal(await js('location.hash'),'#/rankings');
   await js('scrollTo({top:0,behavior:"instant"})');await wait(60);
   const expected=await js("(()=>{const n=document.querySelector('.bottom-nav'),r=n.getBoundingClientRect();for(let x=r.left+24;x<r.right-24;x+=8)for(let y=r.top+20;y<r.bottom-20;y+=8)if(!n.contains(document.elementFromPoint(x,y)))return false;return true})()");assert.ok(expected,'Rows do not intercept nav');
   await tap('.bottom-nav button:nth-of-type(4)',mode);assert.equal(await js('location.hash'),'#/rankings');
   await js('scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(60);
   assert.ok(await js("document.querySelector('.standings-feedback').getBoundingClientRect().bottom<document.querySelector('.bottom-nav').getBoundingClientRect().top"));
   const last=await js("document.querySelector('.official-standings tbody tr:last-child a').getAttribute('href')");
   await tap('.official-standings tbody tr:last-child a',mode);assert.equal(await js('location.hash'),last);
   await tap('.page-back-button',mode);await js('scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(60);
   await shot(`last-row-feedback-${width}-${theme}-${mode}`);
   await tap('.feedback-entry',mode);assert.equal(await js('location.hash'),'#/feedback');await tap('.page-back-button',mode);
  }
  assert.equal(await js('document.documentElement.scrollWidth'),width);
  console.log(`PASS ${width}x${height} ${theme}: first/last row, physical mouse/touch hit targets, nav stacking, Feedback`);
 }
 assert.equal(errors.length,0,JSON.stringify(errors));
} finally { socket.close() }
