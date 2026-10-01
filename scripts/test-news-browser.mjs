import { newsPresentation } from '../src/utils/newsPresentation.ts'
import { newsSeed } from '../src/data/newsSeed.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms)),base=process.env.TRI_APP_URL??'http://127.0.0.1:5190'
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const heights={}
try {
 await send('Page.enable');await send('Runtime.enable')
 for(const width of [320,390,430,768,1024,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768})
  for(const mode of ['seed','long','empty','error']){
   const items=mode==='empty'?[]:mode==='long'?newsSeed.map(i=>({...i,title:'Очень длинный заголовок '.repeat(8)})):newsSeed
   const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const original=window.fetch;window.fetch=(...args)=>args[0]==='/api/news'?${mode==='error'?"Promise.reject(Error('offline'))":`Promise.resolve(Response.json({items:${JSON.stringify(items)}}))`}:original(...args)})()`})
   await send('Page.navigate',{url:base+'/?test='+Date.now()+'#/home'});await wait(500)
   assert.ok(await js('[...document.querySelectorAll(".latest-news__icon")].every(e=>getComputedStyle(e).borderRadius==="50%"&&getComputedStyle(e).backgroundColor!=="rgba(0, 0, 0, 0)")'))
   const expected=items.length?items:newsSeed
   assert.equal(await js('document.querySelectorAll(".latest-news__row").length'),3)
   assert.equal(await js('document.querySelectorAll(".latest-news time,.latest-news p").length'),0)
   assert.ok(!(await js('document.querySelector(".latest-news").textContent')).includes('Читать в Telegram'))
   assert.deepEqual(await js('[...document.querySelectorAll(".latest-news__title")].map(e=>e.textContent)'),expected.map(i=>newsPresentation(i.title).title))
   assert.deepEqual(await js('[...document.querySelectorAll(".latest-news__row")].map(e=>e.href)'),newsSeed.map(i=>i.telegramUrl))
   assert.ok(await js('[...document.querySelectorAll(".latest-news a")].every(e=>e.target==="_blank"&&e.rel.includes("noopener")&&e.rel.includes("noreferrer")&&e.getBoundingClientRect().height>=44)'))
   assert.ok(await js('[...document.querySelectorAll(".latest-news__title")].every(e=>e.getBoundingClientRect().height<=40)'))
   assert.ok(await js('[...document.querySelectorAll(".latest-news svg")].every(e=>e.getAttribute("aria-hidden")==="true")'))
   assert.equal(await js('document.documentElement.scrollWidth'),width)
   assert.ok(await js('Math.abs(document.querySelector(".latest-news").getBoundingClientRect().width-document.querySelector(".home-races-section .race-card").getBoundingClientRect().width)<1'))
   await js('document.querySelector(".latest-news__row").focus()')
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
   assert.equal(await js('getComputedStyle(document.activeElement).outlineStyle'),'solid')
   await js('window.activated=false;document.activeElement.addEventListener("click",e=>{e.preventDefault();window.activated=true},{once:true})')
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
   assert.equal(await js('window.activated'),true)
   if(mode==='seed'){
    if(width===390)heights.final=await js('document.querySelector(".latest-news").getBoundingClientRect().height')
    if([390,1440].includes(width)){
     await js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"});document.activeElement.blur()');await wait(80)
     const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`/tmp/tri-news-final-${width}.png`,Buffer.from(shot.data,'base64'))
    }
   }
   await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier})
  }
  console.log(`PASS ${width}: seed/long/empty/error, links, keyboard, two-line clamp, no metadata/overflow`)
 }
 assert.deepEqual(errors,[])
 console.log('390px heights',heights)
 await fs.writeFile('/tmp/tri-news-design-heights.json',JSON.stringify({old:699.125,...heights},null,2))
}finally{socket.close()}
