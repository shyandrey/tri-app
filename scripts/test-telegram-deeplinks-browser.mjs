// Local-only targeted browser qualification. Telegram transport is mocked, UI is real.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {createServer} from 'vite'
import {assertBrowserPortFree,waitForBrowserTarget,stopBrowser} from './preview-browser-readiness.mjs'
const out=process.env.TRI_TG_EVIDENCE??'/private/tmp/300w-tg-deeplink01-browser'
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
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__tgDocument=crypto.randomUUID();const p=new URLSearchParams(location.search).get('testPayload');window.__tgReady=0;if(p!==null)window.Telegram={WebApp:{initDataUnsafe:{start_param:p},ready(){window.__tgReady++}}};`})
 const open=async(payload,hash='')=>{const previous=await js('window.__tgDocument');await send('Page.navigate',{url:'http://127.0.0.1:5198/?testRun='+crypto.randomUUID()+(payload===null?'':'&testPayload='+encodeURIComponent(payload))+hash});await until(`window.__tgDocument && window.__tgDocument!==${JSON.stringify(previous??'')} && !!document.querySelector('main') && !!history.state?.triNavigation && !document.querySelector('[data-route-pending]')`)}
 await open('race_t100-dubai-2026');assert.deepEqual(await js('history.state.triNavigation.route'),{page:'race',id:'t100-dubai-2026'});assert.equal(await js('window.__tgReady'),1)
 const length=await js('history.length'),documentId=await js('window.__tgDocument');await send('Page.reload');await until(`window.__tgDocument!==${JSON.stringify(documentId)} && document.querySelector('.page-back-button') && !document.querySelector('[data-route-pending]')`);assert.equal(await js('history.length'),length)
 await js("document.querySelector('.page-back-button').click()");await until("history.state?.triNavigation.route.page==='calendar'")
 await js('history.forward()');await until("history.state?.triNavigation.route.page==='race' && !document.querySelector('[data-route-pending]')")
 await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+'/dubai.png',Buffer.from(r.data,'base64')))
 await open('athlete_101');assert.deepEqual(await js('history.state.triNavigation.route'),{page:'athlete',id:'101'});assert.ok(await js("document.body.innerText.includes('Kate Waugh')"))
 await js("document.querySelector('.page-back-button').click()");await until("history.state?.triNavigation.route.page==='athletes'")
 await open('athlete_101','#/more');assert.equal(await js('history.state.triNavigation.route.page'),'more')
 await open('athlete_99999999');assert.equal(await js('history.state.triNavigation.route.page'),'home')
 await open('https://evil.invalid');assert.equal(await js('history.state.triNavigation.route.page'),'home')
 await open(null,'#/race/t100-dubai-2026');assert.equal(await js('history.state.triNavigation.route.page'),'race');assert.equal(await js("!!document.querySelector('script[src*=\"telegram.org\"]')"),false)
 assert.deepEqual(errors,[])
 await fs.writeFile(out+'/result.json',JSON.stringify({status:'PASS',transport:'MOCK_TELEGRAM_WEBAPP',strictMode:'DEVELOPMENT_REACT',checks:['Dubai','athlete101','Back/Forward','reload no duplicate history','ready once','hash precedence','unknown/malformed fallback','browser hash without SDK'],errors},null,2))
 console.log('PASS targeted Telegram navigation browser smoke')
}finally{socket?.close();if(browser)await stopBrowser(browser);await server.close();await fs.writeFile(out+'/chrome-diagnostics.json',JSON.stringify(startup,null,2))}
