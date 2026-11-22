// Local-only targeted browser qualification. Telegram transport is mocked, UI is real.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {createServer} from 'vite'
import {assertBrowserPortFree,waitForBrowserTarget,stopBrowser} from './preview-browser-readiness.mjs'
const out=process.env.TRI_CAL03B2_EVIDENCE??'/private/tmp/300w-cal03b2-browser'
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
 for(const width of [390,1024]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<768})
  for(const [clock,key] of [['2027-05-15','french-riviera'],['2027-10-09','kona-'],['2027-11-26','saudi-arabia'],['2027-12-10','qatar-']]){
   await go('?clock='+clock+'T12:00:00Z#/home')
   await until(`!!document.querySelector('.showcase-card__image[src*="${key}"]')`)
   await until(`[...document.querySelectorAll('.showcase-card__image[src*="${key}"]')].every(i=>i.complete&&i.naturalWidth>0)`)
   await js(`[...document.querySelectorAll('.showcase-card__image[src*="${key}"]')][0].closest('.showcase-card').scrollIntoView({block:'nearest',inline:'start',behavior:'instant'})`)
   await until(`document.querySelector('.showcase-card__image[src*="${key}"]').getBoundingClientRect().left>=-1 && document.querySelector('.showcase-card__image[src*="${key}"]').getBoundingClientRect().left<100`)
   assert.ok(await js("document.documentElement.scrollWidth<=innerWidth+1"))
   await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+`/${key}-${width}.png`,Buffer.from(r.data,'base64')))
  }
  await go('?clock=2027-07-01T12:00:00Z#/home')
  await until("[...document.querySelectorAll('.showcase-card')].some(c=>c.textContent.includes('Roth'))")
  assert.equal(await js("[...document.querySelectorAll('.showcase-card')].find(c=>c.textContent.includes('Roth')).querySelector('img')===null"),true)
  await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+`/roth-neutral-${width}.png`,Buffer.from(r.data,'base64')))
  await js("[...document.querySelectorAll('.showcase-card')].find(c=>c.textContent.includes('Roth')).click()")
  await until("location.hash==='#/race/challenge-roth-2027' && !!document.querySelector('.race-detail')")
  for(const year of [2024,2025,2026]){
   await js(`[...document.querySelectorAll('.race-season-switcher__year')].find(b=>b.textContent==='${year}').click()`)
   await until(`document.querySelector('.race-season-switcher__year--active')?.textContent==='${year}'`)
   await until("document.querySelectorAll('tbody tr').length>0")
  }
  await go('#/calendar');await until("document.querySelectorAll('.race-card').length===25")
  assert.ok(await js("[...document.querySelectorAll('.race-card')].some(c=>c.textContent.includes('Roth'))"))
  await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+`/calendar-${width}.png`,Buffer.from(r.data,'base64')))
  await go('#/athlete/111');await until("!!document.querySelector('.athlete-detail')")
  await js("document.querySelectorAll('.athlete-results-year__toggle[aria-expanded=false]').forEach(b=>b.click())")
  await until("[...document.querySelectorAll('.athlete-result-card')].some(c=>c.textContent.includes('Roth'))")
  await js("[...document.querySelectorAll('.athlete-result-card')].find(c=>c.textContent.includes('Roth')).click()")
  await until("location.hash.startsWith('#/race/challenge-roth-')")
 }
 assert.deepEqual(errors,[])
 await fs.writeFile(out+'/result.json',JSON.stringify({status:'PASS',widths:[390,1024],checks:['Production2026/Preview2027','4 mapped Showcase artworks mobile/desktop','Roth neutral Showcase and Calendar','Roth historic results and athlete profile links'],errors},null,2))
 console.log('PASS CAL-03B2 targeted browser smoke')
}finally{socket?.close();if(browser)await stopBrowser(browser);await server.close();await prodServer.close();await fs.writeFile(out+'/chrome-diagnostics.json',JSON.stringify(startup,null,2))}
