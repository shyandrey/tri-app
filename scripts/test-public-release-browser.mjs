// Local-only targeted browser qualification. Telegram transport is mocked, UI is real.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {spawn} from 'node:child_process'
import {createServer} from 'vite'
import {assertBrowserPortFree,waitForBrowserTarget,stopBrowser} from './preview-browser-readiness.mjs'
const out=process.env.TRI_UI_EVIDENCE??'/private/tmp/300w-ui08b-browser'
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
 await send('Accessibility.enable')
 await send('Page.navigate',{url:'http://127.0.0.1:5198/#/more'})
 await until("!!document.querySelector('details.more-release')")
 for(const width of [320,390,1024]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<768})
  await js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
  assert.equal(await js("document.querySelector('details.more-release').open"),false)
  assert.equal(await js("document.querySelector('.more-release-title').checkVisibility()"),false)
  assert.equal(await js("document.querySelector('.more-release summary').textContent.trim()"),'Версия 1.0.1›')
  assert.equal(await js("getComputedStyle(document.querySelector('.more-release-arrow')).transform"),'matrix(1, 0, 0, 1, 0, 0)')
  const collapsed=await send('Accessibility.getFullAXTree')
  assert.ok(!collapsed.nodes.some(n=>!n.ignored&&n.name?.value==='Первый релиз 300W'))
  assert.ok(collapsed.nodes.some(n=>n.name?.value?.includes('Версия 1.0.1')&&n.properties?.some(p=>p.name==='expanded'&&p.value.value===false)))
  const point=await js("(()=>{const r=document.querySelector('.more-release summary').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
  await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1})
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1})
  await until("document.querySelector('details.more-release').open")
  assert.equal(await js("document.querySelector('.more-release-title').textContent"),'Первый релиз 300W')
  assert.equal(await js("document.querySelector('.more-release-title').checkVisibility()"),true)
  assert.equal(await js("getComputedStyle(document.querySelector('.more-release-arrow')).transform"),'matrix(0, 1, -1, 0, 0, 0)')
  assert.doesNotMatch(await js("document.querySelector('.more-release').textContent"),/При выпуске|Изменено|раскрываемые подробности|Technical|CHANGELOG/)
  assert.equal(await js("document.querySelectorAll('.more-release :is(ul,h4)').length"),0)
  const expanded=await send('Accessibility.getFullAXTree')
  assert.ok(expanded.nodes.some(n=>!n.ignored&&n.name?.value==='Первый релиз 300W'))
  assert.ok(expanded.nodes.some(n=>n.name?.value?.includes('Версия 1.0.1')&&n.properties?.some(p=>p.name==='expanded'&&p.value.value===true)))
  await send('Page.captureScreenshot',{format:'png'}).then(r=>fs.writeFile(out+'/expanded-'+width+'.png',Buffer.from(r.data,'base64')))
  await js("document.querySelector('.more-release summary').focus()")
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
  assert.equal(await js("document.querySelector('details.more-release').open"),false)
  await js("document.querySelector('.more-release-arrow').click()")
  assert.equal(await js("document.querySelector('details.more-release').open"),true)
  await js("document.querySelector('.more-release summary').click()")
  assert.equal(await js("document.querySelector('details.more-release').open"),false)
 }
 assert.deepEqual(errors,[])
 await fs.writeFile(out+'/result.json',JSON.stringify({status:'PASS',widths:[320,390,1024],checks:['version only collapsed','description only expanded','right/down arrow','entire row pointer','Enter and arrow activation','AX expanded state/hidden description','no technical notes'],errors},null,2))
 console.log('PASS UI-08B public release browser smoke')

}finally{socket?.close();if(browser)await stopBrowser(browser);await server.close();await fs.writeFile(out+'/chrome-diagnostics.json',JSON.stringify(startup,null,2))}
