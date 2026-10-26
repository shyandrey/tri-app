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


const out='/tmp/300w-nav03';await fs.mkdir(out,{recursive:true})
const goto=async(route='rankings')=>{await send('Page.navigate',{url:`${base}/?test=${Date.now()}#/${route}`});await wait(650)}
const tap=async(i,touch=false)=>{const p=await js(`(()=>{const e=document.querySelectorAll('.bottom-nav button')[${i}],b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2,hit:e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2))}})()`);assert.ok(p.hit);const {x,y}=p;if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}else{await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1})}await wait(300)}
const shot=async(name)=>{const s=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${out}/${name}.png`,Buffer.from(s.data,'base64'))}
const alignment=async()=>assert.ok(await js(`(()=>{const c=document.querySelector('.bottom-nav__capsule').getBoundingClientRect(),b=document.querySelector('.bottom-nav [aria-current]').getBoundingClientRect();return Math.abs(c.x-b.x)<2&&Math.abs(c.width-b.width)<2})()`),'capsule alignment')
const stats=[]
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true})
 for(const [width,height]of [[320,700],[375,812],[390,844],[440,956],[667,375],[844,390],[956,440]])for(const theme of ['dark','light']){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]})
  await goto();const panel=await js("document.querySelector('.bottom-nav').getBoundingClientRect().height");assert.equal(panel,height<500?48:58)
  for(const [i,route] of ['home','calendar','athletes','rankings','more'].entries()){
   await tap(i,i%2===0);assert.equal(await js('location.hash'),'#/'+route);await alignment()
   assert.equal(await js("document.querySelectorAll('.bottom-nav__capsule').length"),1)
   assert.equal(await js("getComputedStyle(document.querySelector('.bottom-nav [aria-current]')).color"),'rgb(243, 183, 43)')
   assert.equal(await js("getComputedStyle(document.querySelector('.bottom-nav [aria-current]')).backgroundColor"),'rgba(0, 0, 0, 0)')
   assert.ok(await js("[...document.querySelectorAll('.bottom-nav button')].every(e=>{const b=e.getBoundingClientRect();return b.width>=44&&b.height>=44})"))
   assert.equal(await js('document.documentElement.scrollWidth'),width);await shot(`nav03-${width}-${theme}-${route}`)
  }
  await tap(3);await js("scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await wait(80)
  assert.ok(await js("document.querySelector('.standings-feedback').getBoundingClientRect().bottom<document.querySelector('.bottom-nav').getBoundingClientRect().top"))
  await shot(`bottom-${width}-${theme}`)
  // Live Telegram inset variables must move the panel clear of its reserved bottom region.
  await js("document.documentElement.style.setProperty('--tg-safe-area-inset-bottom','34px')")
  assert.ok(await js("innerHeight-document.querySelector('.bottom-nav').getBoundingClientRect().bottom>=42"));await alignment()
  await js("document.documentElement.style.removeProperty('--tg-safe-area-inset-bottom')")
  stats.push({width,height,theme,panel});console.log(`PASS ${width}x${height} ${theme}: ${panel}px, 5 routes, touch, capsule, insets, clearance`)
 }
 await goto('athlete/108');await alignment();assert.equal(await js("document.querySelector('.bottom-nav [aria-current]').ariaLabel"),'Профили атлетов')
 await js("document.querySelector('.athlete-result-card').click()");await wait(300);await alignment();assert.equal(await js("document.querySelector('.bottom-nav [aria-current]').ariaLabel"),'Календарь')
 await js("document.querySelector('.page-back-button').click()");await wait(300);await alignment()
 await tap(3);await tap(4);await js('history.back()');await wait(300);assert.equal(await js('location.hash'),'#/rankings');await alignment();await js('history.forward()');await wait(300);assert.equal(await js('location.hash'),'#/more');await alignment()
 // Capture movement during remount and interrupt it before it finishes.
 await tap(0)
 await js("document.querySelectorAll('.bottom-nav button')[3].click()");await wait(40)
 assert.ok(await js("document.querySelector('.bottom-nav__capsule').getAnimations().length>0"),'moving capsule must animate across page mounts')
 await js("document.querySelectorAll('.bottom-nav button')[2].click()");await wait(30)
 await js("document.querySelectorAll('.bottom-nav button')[4].click()");await wait(300);await alignment();assert.equal(await js('location.hash'),'#/more')

 // Every destination pair through physical mouse and touch input (including active tab).
 const routes=['home','calendar','athletes','rankings','more']
 for(const touch of [false,true])for(let from=0;from<5;from++)for(let to=0;to<5;to++){
  await tap(from,touch);await tap(to,touch);assert.equal(await js('location.hash'),'#/'+routes[to]);await alignment()
 }
 console.log('PASS 50 mouse/touch destination pairs')
 // Direct loading, refresh, and legacy query parameters all resolve to global nav.
 for(const route of routes){await goto(route);await send('Page.reload');await wait(500);await alignment();assert.equal(await js('location.hash'),'#/'+route)}
 for(const oldFlag of ['02','baseline']){
  await send('Page.navigate',{url:`${base}/?nav=${oldFlag}#/rankings`});await wait(500)
  assert.equal(await js("document.querySelectorAll('.bottom-nav__capsule').length"),1);await alignment()
 }
 console.log('PASS direct loading, refresh and ignored legacy query flags')
 // Keyboard activation and reduced motion.
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
 await js("document.querySelector('.bottom-nav button').focus()")
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});await wait(100)
 assert.equal(await js('location.hash'),'#/home');await alignment();assert.equal(await js("document.querySelector('.bottom-nav__capsule').getAnimations().length"),0)


 await js("document.querySelectorAll('.bottom-nav button')[1].focus()")
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab'});
 assert.equal(await js('document.activeElement.ariaLabel'),'Профили атлетов')
 assert.equal(await js('getComputedStyle(document.activeElement).outlineStyle'),'solid')
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});await wait(300);assert.equal(await js('location.hash'),'#/athletes');await alignment()
 // Race Results has an independent content layout: verify its bottom clearance too.
 for(const [width,height]of [[667,375],[844,390],[956,440]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true})
  await goto('athlete/108');await js("document.querySelector('.athlete-result-card').click()");await wait(300)
  await js("scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");await wait(80)
  assert.ok(await js("document.querySelector('.feedback-entry').getBoundingClientRect().bottom<document.querySelector('.bottom-nav').getBoundingClientRect().top"))
  await alignment();await shot(`race-bottom-${width}`)
 }
 console.log('PASS Race Results landscape clearance')
 await fs.writeFile(out+'/measurements.json',JSON.stringify(stats,null,2))
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS nested routes, Back/Forward, keyboard, reduced motion; no runtime exceptions')
}finally{socket.close()}
