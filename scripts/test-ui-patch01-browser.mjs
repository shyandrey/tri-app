// Local-only targeted browser qualification. Telegram transport is mocked, UI is real.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {createServer} from 'vite'
import {assertBrowserPortFree,waitForBrowserTarget,stopBrowser} from './preview-browser-readiness.mjs'
const out=process.env.TRI_UI_EVIDENCE??'/private/tmp/300w-ui-patch01-browser'
await fs.mkdir(out,{recursive:true})
const server=await createServer({server:{host:'127.0.0.1',port:5198,strictPort:true},logLevel:'silent'});await server.listen()
let browser,socket;const errors=[],startup={observations:[],stderr:'',exit:null}
try{
 await assertBrowserPortFree()
 browser=spawn(process.env.CHROME_BIN??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=9387','--user-data-dir='+out+'/chrome','about:blank'],{stdio:['ignore','ignore','pipe']})
 browser.stderr.on('data',b=>{startup.stderr+=b.toString()});browser.on('error',e=>{startup.spawnError=e.message});browser.on('exit',(code,signal)=>{startup.exit={code,signal}})
 const target=await waitForBrowserTarget({browser,startup});socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j})
 let seq=0;const pending=new Map()
 socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text)}
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method))},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))})
 const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value}
 const until=async expression=>{const end=Date.now()+15000;while(Date.now()<end){if(await js(expression))return;await new Promise(r=>setTimeout(r,50))}throw Error('UI timeout: '+expression)}
 await send('Page.enable');await send('Runtime.enable')
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true})
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`const RealDate=Date;window.__clock=Date.parse('2026-11-13T12:00:00Z');window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[window.__clock]))}static now(){return window.__clock}};const realFetch=fetch;window.__posts=0;window.fetch=(url,options)=>{if(String(url).includes('/api/feedback')){if(options?.method==='POST'){window.__posts++;throw Error('No submissions in this smoke')}return Promise.resolve(new Response(JSON.stringify({mode:'local',siteKey:null}),{headers:{'Content-Type':'application/json'}}))}if(String(url).includes('/api/news'))return Promise.resolve(new Response(JSON.stringify({items:[]}),{headers:{'Content-Type':'application/json'}}));return realFetch(url,options)};`})
 await send('Page.navigate',{url:'http://127.0.0.1:5198/#/home'})
 const dubai=`[...document.querySelectorAll('.showcase-card')].find(e=>e.textContent.includes('Dubai'))`
 await until(`${dubai}?.querySelector('.showcase-card__eyebrow').textContent==='Завтра'`)
 // Schedule the actual midnight timer, then advance the controlled wall clock across it.
 await js("window.__clock=Date.parse('2026-11-13T20:59:59.800Z');dispatchEvent(new Event('focus'))")
 await js("window.__clock=Date.parse('2026-11-13T21:00:00Z')")
 await until(`${dubai}?.querySelector('.showcase-card__eyebrow').textContent==='Сегодня!'`)
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+'/showcase.png',Buffer.from(r.data,'base64')))
 await js("window.__clock=Date.parse('2026-11-14T20:59:59.800Z');dispatchEvent(new Event('focus'))")
 assert.ok(await js(`!!${dubai}`))
 await js("window.__clock=Date.parse('2026-11-14T21:00:00Z')")
 await until(`!${dubai}`)
 await js("document.querySelector('.bottom-nav button[aria-label=\"Ещё\"]').click()")
 await until("!!document.querySelector('details.more-release')")
 assert.equal(await js("document.querySelector('details.more-release').open"),false)
 assert.ok(await js("document.querySelector('.more-release summary').innerText.includes('Версия 1.0.1')"))
 await js("document.querySelector('.more-release summary').click()")
 assert.equal(await js("document.querySelector('details.more-release').open"),true)
 assert.ok(await js("document.querySelector('.more-release-notes').getBoundingClientRect().height>0"))
 await js("document.querySelector('.more-release summary').focus()")
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13})
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
 assert.equal(await js("document.querySelector('details.more-release').open"),false)
 await js("document.querySelector('.more-release-arrow').click()")
 assert.equal(await js("document.querySelector('details.more-release').open"),true)
 await js("document.querySelector('.feedback-entry').click()")
 await until("!!document.querySelector('.feedback-header')")
 for(const width of [320,390,1024]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<768})
  await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  assert.ok(await js("(()=>{const h=document.querySelector('.feedback-header h1').getBoundingClientRect(),b=document.querySelector('.feedback-header .page-back-button').getBoundingClientRect();return h.right<=b.left && b.right<=innerWidth && Math.abs((h.top+h.bottom)/2-(b.top+b.bottom)/2)<3})()"))
 }
 await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+'/feedback.png',Buffer.from(r.data,'base64')))
 await js("document.querySelector('.feedback-submit').click()")
 await until("document.querySelector('#feedback-description').getAttribute('aria-invalid')==='true'")
 assert.equal(await js('window.__posts'),0)
 const point=await js("(()=>{const b=document.querySelector('.page-back-button'),r=b.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return {x,y,hit:document.elementFromPoint(x,y)===b}})()")
 assert.equal(point.hit,true)
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1})
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1})
 await until("location.hash==='#/more' && !!document.querySelector('.more-content')")
 await js('history.forward()');await until("!!document.querySelector('.feedback-header')")
 await js('history.back()');await until("!!document.querySelector('.more-content')")
 assert.deepEqual(errors,[])
 await fs.writeFile(out+'/result.json',JSON.stringify({status:'PASS',checks:['Moscow tomorrow/today/live midnight removal','native disclosure pointer/keyboard','Feedback left title/right Back at320/390/1024','Feedback validation no submission','Back/Forward'],errors},null,2))
 console.log('PASS UI-PATCH-01 targeted browser smoke')

}finally{socket?.close();if(browser)await stopBrowser(browser);await server.close();await fs.writeFile(out+'/chrome-diagnostics.json',JSON.stringify(startup,null,2))}
