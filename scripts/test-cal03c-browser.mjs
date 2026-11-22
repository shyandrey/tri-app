// Local-only targeted browser qualification. Telegram transport is mocked, UI is real.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {createServer} from 'vite'
import {assertBrowserPortFree,waitForBrowserTarget,stopBrowser} from './preview-browser-readiness.mjs'
const out=process.env.TRI_CAL03C_EVIDENCE??'/private/tmp/300w-cal03c-browser'
await fs.mkdir(out,{recursive:true})
const server=await createServer({mode:'season2027-preview',server:{host:'127.0.0.1',port:5198,strictPort:true},logLevel:'silent'});await server.listen()
const prodServer=await createServer({mode:'production',server:{host:'127.0.0.1',port:5199,strictPort:true},logLevel:'silent'});await prodServer.listen()
let browser,socket;const errors=[],startup={observations:[],stderr:'',exit:null}
try{
 await assertBrowserPortFree()
 browser=spawn(process.env.CHROME_BIN??'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=9387','--user-data-dir='+out+'/chrome','about:blank'],{stdio:['ignore','ignore','pipe']})
 browser.stderr.on('data',b=>{startup.stderr+=b.toString()});browser.on('error',e=>{startup.spawnError=e.message});browser.on('exit',(code,signal)=>{startup.exit={code,signal}})
 const target=await waitForBrowserTarget({browser,startup});socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j})
 let seq=0;const pending=new Map()
 socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);else if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')errors.push(JSON.stringify(d.params.args))}
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method))},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))})
 const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value}
 const until=async expression=>{const end=Date.now()+15000;while(Date.now()<end){if(await js(expression))return;await new Promise(r=>setTimeout(r,50))}throw Error('UI timeout: '+expression)}
 await send('Page.enable');await send('Runtime.enable')
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`const clock=new URLSearchParams(location.search).get('clock')||'2027-01-01T12:00:00Z';const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[clock]))}static now(){return Date.parse(clock)}}; const p=new URLSearchParams(location.search).get('tgWebAppStartParam'); if(p)window.Telegram={WebApp:{initDataUnsafe:{start_param:p},ready(){}}}; const f=fetch;window.fetch=(u,o)=>{if(String(u).includes('/api/news'))return Promise.resolve(new Response(JSON.stringify({items:[]}),{headers:{'Content-Type':'application/json'}}));return f(u,o)};`})
 const go=async path=>{await send('Page.navigate',{url:'http://127.0.0.1:5198/'+path})}
 await send('Page.navigate',{url:'http://127.0.0.1:5199/#/calendar'})
 await until("!!document.querySelector('[aria-label=\"Сезон\"]')")
 assert.equal(await js("document.querySelector('[aria-label=\"Сезон\"] [aria-pressed=true]').textContent"),'2026')
 await js("document.querySelector('.bottom-nav button[aria-label=\"Главная\"]').click()")
 await until("location.hash==='#/home'")
 assert.equal(await js("document.querySelectorAll('.showcase-card').length"),0)
 const measurements=[]
 for(const width of [320,375,390,440,1024]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<768})
  for(const [clock,key,title] of [['2027-12-10','qatar','T100 Qatar World Championship Final'],['2027-08-28','worlds','IRONMAN 70.3 World Championship']]){
   await go('?clock='+clock+'T12:00:00Z#/home')
   await until("!!document.querySelector('.showcase-card__title')")
   if(key==='qatar')await until("document.querySelector('.showcase-card__image')?.naturalWidth>0")
   const m=await js(`(()=>{const card=document.querySelector('.showcase-card'),h=card.querySelector('h2'),content=card.querySelector('.showcase-card__content'),button=card.querySelector('.showcase-card__open');const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};const range=document.createRange();range.selectNodeContents(h);return {card:rect(card),content:rect(content),button:rect(button),title:rect(h),text:[...h.children].map(e=>e.textContent).join(' '),lines:[...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),whiteSpace:getComputedStyle(h.lastElementChild).whiteSpace,scrollWidth:h.scrollWidth,clientWidth:h.clientWidth}})()`)
   measurements.push({width,key,...m})
   await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+`/${key}-${width}.png`,Buffer.from(r.data,'base64')))
   assert.equal(m.text,title)
   assert.equal(m.card.height,width<=640?230:245,'Card height unchanged')
   if(!process.env.TRI_CAL03C_DIAGNOSE){
    assert.ok(m.scrollWidth<=m.clientWidth+1,`${key} ${width} title overflow`)
    assert.ok(m.content.top>=m.card.top+1,`${key} ${width} content clipped vertically`)
    assert.ok(m.lines.every(r=>r.left>=m.title.left-1&&r.right<=m.title.right+1&&r.top>=m.card.top&&r.bottom<=m.card.bottom),`${key} ${width} clipped text`)
    assert.ok(m.title.right<=m.button.left,`${key} ${width} title overlaps action`)
   }
   await js("document.querySelector('.showcase-card__open').click()")
   await until("location.hash.startsWith('#/race/')&&!!document.querySelector('.race-detail')")
  }
 }
 await fs.writeFile(out+'/measurements.json',JSON.stringify(measurements,null,2))
 assert.deepEqual(errors,[])
 await fs.writeFile(out+'/result.json',JSON.stringify({status:'PASS',widths:[320,375,390,440,1024],mode:process.env.TRI_CAL03C_DIAGNOSE?'diagnosis':'regression',checks:['full Qatar and Worlds titles','unchanged card dimensions','no text overflow or action overlap','race navigation','Production2026 default'],errors},null,2))
 console.log('PASS CAL-03C targeted browser smoke')
}finally{socket?.close();if(browser)await stopBrowser(browser);await server.close();await prodServer.close();await fs.writeFile(out+'/chrome-diagnostics.json',JSON.stringify(startup,null,2))}
