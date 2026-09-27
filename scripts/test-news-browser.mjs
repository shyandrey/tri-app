import { newsSeed } from '../src/data/newsSeed.ts'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms)),base=process.env.TRI_APP_URL??'http://localhost:8787'
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const item=(id,title,excerpt)=>({id:String(id),title,excerpt,publishedAt:'2026-09-27T12:00:00.000Z',telegramUrl:'https://t.me/trista_watt/'+id})
const cases={three:[item(1,'TEST — Результаты гонки','Описание результатов.'),item(2,'TEST — Highlights','Короткий обзор.'),item(3,'TEST — Без описания','')],one:[item(1,'TEST — Одна новость','Текст')],long:[item(1,'Длинный заголовок '.repeat(10),'Очень длинный текст '.repeat(45)),item(2,'x'.repeat(200),'y'.repeat(1000)),item(3,'<img src=x onerror=alert(1)>','<script>alert(1)</script>')],empty:[],error:null}
try{
 await send('Page.enable');await send('Runtime.enable')
 for(const width of [320,390,430,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768})
  for(const [name,items] of Object.entries(cases)){
   const script=await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{const originalFetch=window.fetch;window.fetch=(...args)=>args[0]==='/api/news'?${items===null?"Promise.reject(Error('test offline'))":`Promise.resolve(new Response(${JSON.stringify(JSON.stringify({items,source:'telegram',updatedAt:'2026-09-27T12:00:00Z'}))},{headers:{'Content-Type':'application/json'}}))`}:originalFetch(...args)})()`})
   await send('Page.navigate',{url:base+'/?news-test='+Date.now()+'#/home'});await wait(450)
   assert.equal(await js('document.querySelectorAll(".latest-news__card").length'),items?.length?items.length:newsSeed.length,`${width}/${name}`)
   assert.equal(await js('document.documentElement.scrollWidth'),width,`overflow ${width}/${name}`)
   assert.equal(await js('document.querySelector(".latest-news__all").href'),"https://t.me/trista_watt")
   if(!items?.length)assert.deepEqual(await js('[...document.querySelectorAll(".latest-news__card h3")].map(e=>e.textContent)'),newsSeed.map(i=>i.title))
   else{
    assert.equal(await js('document.querySelector(".latest-news time").textContent'),'27 сентября')
    assert.ok(await js('[...document.querySelectorAll(".latest-news a")].every(a=>a.target==="_blank"&&a.rel.includes("noopener")&&a.rel.includes("noreferrer"))'))
    assert.equal(await js('document.querySelectorAll(".latest-news img,.latest-news script").length'),0)
    await js('document.querySelector(".latest-news a").focus();window.linkActivated=false;document.querySelector(".latest-news a").addEventListener("click",e=>{e.preventDefault();window.linkActivated=true},{once:true})')
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(30)
    assert.equal(await js('window.linkActivated'),true)
   }
   if(name==='three'&&[390,1440].includes(width)){
    await js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"});document.activeElement?.blur()');await wait(50)
    assert.ok(await js('document.querySelector(".latest-news__all").getBoundingClientRect().bottom < document.querySelector(".bottom-nav").getBoundingClientRect().top'), 'Channel link accessible above navigation')
    const image=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`/tmp/tri-home-news-${width}.png`,Buffer.from(image.data,'base64'))
   }
   await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:script.identifier})
  }
  console.log(`PASS ${width}px: 3/1 cards, long title/excerpt, empty excerpt, empty/error fallback, no overflow, keyboard, safe links/plain text`)
 }
 // Real local API and generated fallback must show the same approved publication content.
 for(const width of [320,390,430,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<768})
  await send('Page.navigate',{url:base+'/?real-news-test='+Date.now()+'#/home'});await wait(500)
  const actual=await js('[...document.querySelectorAll(".latest-news__card")].map(e=>({title:e.querySelector("h3").textContent,excerpt:e.querySelector("p")?.textContent,href:(e.matches("a")?e:e.querySelector("a")).href,date:e.querySelector("time").dateTime}))')
  assert.deepEqual(actual,newsSeed.map(i=>({title:i.title,excerpt:i.excerpt,href:i.telegramUrl,date:i.publishedAt})))
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  if([390,1440].includes(width)){
   await js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(50)
   const image=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`/tmp/tri-home-news-real-${width}.png`,Buffer.from(image.data,'base64'))
  }
  console.log(`PASS real approved seed ${width}px: exact title/excerpt/date/link, three cards, no overflow`)
 }
 assert.deepEqual(errors,[])
}finally{socket.close()}
