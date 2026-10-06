import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const pkg=JSON.parse(await fs.readFile('package.json','utf8'))
const wait=ms=>new Promise(r=>setTimeout(r,ms)),base=process.env.TRI_APP_URL??'http://localhost:8787'
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
try {
 await send('Page.enable');await send('Runtime.enable')
 for(const width of [320,390,430,768,1024,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768})
  await send('Page.navigate',{url:base+'/?more-test='+Date.now()+'#/more'});await wait(700)
  assert.equal(await js('document.querySelector(".page-back-button").textContent'),'← Назад')
  assert.ok(await js('document.querySelector(".page-back-button").getBoundingClientRect().right<=innerWidth'))
  const text=await js('document.querySelector(".more-content").textContent')
  assert.ok(text.includes('Версия '+pkg.version));assert.ok(!/[a-f0-9]{40}|unknown|rankingAsOf/.test(text))
  assert.ok(text.includes('Профессиональный триатлон: календарь, результаты, профили атлетов и многое другое.'));assert.ok(!text.includes('TRI Ranking'))
  for(const phrase of ['текст сообщения','технический контекст','Email указывается по желанию','IP-адрес не сохраняется в обращении'])assert.ok(text.includes(phrase))
  assert.equal(await js('document.querySelectorAll(".more-content > section").length'),4)
  assert.equal(await js('document.querySelectorAll(".more-content button").length'),1)
  assert.equal(await js('document.querySelectorAll(".more-content a").length'),2)
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  assert.equal(await js('document.querySelector(".more-action[href]").href'),'https://t.me/trista_watt')
  assert.ok(await js('[...document.querySelectorAll(".more-content a")].every(e=>e.target==="_blank"&&e.rel.includes("noopener")&&e.rel.includes("noreferrer")&&e.getBoundingClientRect().height>=44)'))
  const historyBefore=await js('JSON.stringify(history.state)')
  await js('document.querySelector(".feedback-entry").focus();window.activated=false;document.querySelector(".more-action[href]").addEventListener("click",e=>{e.preventDefault();window.activated=true},{once:true})')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  assert.equal(await js('document.activeElement.href'),'https://t.me/trista_watt')
  assert.equal(await js('getComputedStyle(document.activeElement).outlineStyle'),'solid')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  assert.equal(await js('window.activated'),true);assert.equal(await js('JSON.stringify(history.state)'),historyBefore)
  await js('window.scrollTo({top:170,behavior:"instant"})');await wait(200)
  const before=await js('({y:scrollY,ui:history.state.triNavigation.ui})')
  await js('document.querySelector(".feedback-entry").click()');await wait(400)
  assert.equal(await js('location.hash'),'#/feedback')
  await js('document.querySelector(".page-back-button").click()');await wait(400)
  assert.equal(await js('location.hash'),'#/more');assert.deepEqual(await js('history.state.triNavigation.ui'),before.ui)
  assert.ok(Math.abs(await js('scrollY')-before.y)<=2)
  await js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(100)
  assert.ok(await js('document.querySelector(".more-block:last-child").getBoundingClientRect().bottom <= document.querySelector(".bottom-nav").getBoundingClientRect().top'))
  if([390,1440].includes(width)){
   await js('window.scrollTo({top:0,behavior:"instant"});document.activeElement?.blur()');await wait(100)
   const screenshot=await send('Page.captureScreenshot',{format:'png'})
   await fs.writeFile(`/tmp/tri-more-${width}.png`,Buffer.from(screenshot.data,'base64'))
   await js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(100)
   const bottom=await send('Page.captureScreenshot',{format:'png'})
   await fs.writeFile(`/tmp/tri-more-${width}-bottom.png`,Buffer.from(bottom.data,'base64'))
  }
  console.log(`PASS More ${width}px: content/version/privacy, actions, keyboard/focus, history/scroll, bottom nav, no overflow`)
 }
 const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(400)}
 const start=async page=>{
  await send('Page.navigate',{url:base+'/?back-test='+Date.now()+'#/'+page});await wait(700)
  // Athletes is lazy-loaded. Wait for readiness, never retry an action/assertion.
  if(page==='athletes'){
   const deadline=Date.now()+5000
   while(await js('document.querySelectorAll(".athletes-gender-card").length!==3 || !!document.querySelector("[data-route-pending]")')){
    assert.ok(Date.now()<deadline,'Timed out waiting for lazy Athletes before More navigation')
    await wait(50)
   }
  }
 }
 const snapshot=()=>js('({page:history.state.triNavigation.route.page,ui:history.state.triNavigation.ui,y:scrollY})')
 const restore=async expected=>{const actual=await snapshot();assert.equal(actual.page,expected.page);assert.deepEqual(actual.ui,expected.ui);assert.ok(Math.abs(actual.y-expected.y)<=2)}
 for(const origin of ['home','athletes']){
  await start(origin)
  if(origin!=='home'){
   await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.textContent.includes('WOMEN')).click()`);await wait(200)
  }
  if(origin==='athletes'){
   await js(`[...document.querySelectorAll('.athletes-country-chip')].find(e=>e.textContent.includes('FR')).click()`)
   await js(`(()=>{const e=document.querySelector('.athletes-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'a');e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(200)
  }
  await js('window.scrollTo({top:420,behavior:"instant"})');await wait(200)
  const before=await snapshot()
  await click('.bottom-nav button[aria-label="Ещё"]');assert.equal(await js('location.hash'),'#/more')
  await click('.feedback-entry');await click('.page-back-button');assert.equal(await js('location.hash'),'#/more')
  await click('.page-back-button');await restore(before)
  await js('history.forward()');await wait(400);assert.equal(await js('location.hash'),'#/more')
  await js('history.back()');await wait(400);await restore(before)
  console.log('PASS '+origin+' → More → Feedback → Back → More → Back, state/scroll, browser Forward/Back')
 }
 await start('more');const length=await js('history.length')
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
 assert.equal(await js('document.activeElement.className'),'page-back-button')
 assert.notEqual(await js('getComputedStyle(document.activeElement).outlineStyle'),'none')
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(400)
 assert.equal(await js('location.hash'),'#/home');assert.equal(await js('history.length'),length)
 assert.equal(await js('history.state.triNavigation.parent'),null)
 console.log('PASS direct More: existing replace-to-Home fallback, no added history/loop')
 assert.deepEqual(errors,[])
} finally {socket.close()}
