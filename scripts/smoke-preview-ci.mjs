import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {spawn,spawnSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {sha256,validSHA} from './preview-artifact.mjs'

export function assertHealth(health,sha,version){assert.ok(validSHA(sha));assert.equal(health.ok,true);assert.equal(health.service,'tri-app');assert.equal(health.commit,sha);assert.equal(health.version,version)}
export async function smoke(directory,sha,reports){
 const origin='https://preview.300w.app',manifest=JSON.parse(await fs.readFile(path.join(directory,'manifest.json'),'utf8'))
 const get=async url=>{const r=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});assert.equal(r.status,200,new URL(url).pathname);return r}
 assertHealth(await(await get(origin+'/api/health')).json(),sha,manifest.version)
 assert.equal(sha256(Buffer.from(await(await get(origin+'/')).arrayBuffer())),manifest.files['dist/index.html'],'Published HTML differs from tested artifact')
 assert.ok(Array.isArray((await(await get(origin+'/api/news')).json()).items))
 await fs.mkdir(reports,{recursive:true})
 const chrome=['google-chrome','google-chrome-stable','chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(c=>spawnSync(c,['--version']).status===0)
 assert.ok(chrome,'Chrome required')
 const browser=spawn(chrome,['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9387','--user-data-dir='+await fs.mkdtemp(path.join(os.tmpdir(),'tri-smoke-')),'--no-first-run','about:blank'],{stdio:'ignore'})
 const wait=ms=>new Promise(r=>setTimeout(r,ms));let socket;const errors=[]
 try{
  let targets;for(let i=0;i<50;i++){try{targets=await(await fetch('http://127.0.0.1:9387/json/list')).json();if(targets.some(t=>t.type==='page'))break}catch{}await wait(100)}
  socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject})
  let seq=0;const pending=new Map()
  socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);if(!p)return;pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(d.error.message)):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);else if(d.method==='Network.responseReceived'&&d.params.response.status>=400)errors.push('HTTP '+d.params.response.status+' '+new URL(d.params.response.url).pathname)}
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timeout '+method))},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))})
  const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert.ok(!r.exceptionDetails);return r.result.value}
  const until=async expr=>{for(let i=0;i<100;i++){if(await js(expr))return;await wait(100)}throw Error('Smoke state timeout: '+expr)}
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable')
  for(const [width,height] of [[390,844],[844,390]]){
   await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true})
   await send('Page.navigate',{url:origin+'/#/'});await until("history.state?.triNavigation?.route?.page==='home' && document.querySelectorAll('.bottom-nav button').length===5")
   for(const [i,page] of ['home','calendar','athletes','rankings','more'].entries()){
    await js(`document.querySelectorAll('.bottom-nav button')[${i}].click()`);await until(`history.state?.triNavigation?.route?.page===${JSON.stringify(page)}`)
    assert.ok(await js('document.querySelector("main")?.textContent.length>0'))
    assert.ok(await js('document.documentElement.scrollWidth<=document.documentElement.clientWidth'))
    if(page==='rankings'){
     await until("document.querySelectorAll('.rankings-table-panel:not([inert]) tbody tr').length===10")
     await js('Promise.all([...document.querySelectorAll(".standings-showcase img")].map(i=>i.decode()))')
     const sources=await js('[...document.querySelectorAll(".standings-showcase img")].map(i=>({src:i.currentSrc,ready:i.complete&&i.naturalWidth>0}))')
     assert.ok(sources.length===2&&sources.every(x=>x.ready&&x.src.endsWith('.webp')&&x.src.includes(width>height?'rankings_landscape/':'rankings/optimized/')))
     await js('document.querySelector(".rankings-table-panel:not([inert]) .standings-name").closest("a").click()');await until("history.state?.triNavigation?.route?.page==='athlete'")
     await until("!!document.querySelector('.athlete-result-card')");await js('document.querySelector(".athlete-result-card").click()');await until("history.state?.triNavigation?.route?.page==='race'")
     await js('document.querySelector(".page-back-button").click()');await until("history.state?.triNavigation?.route?.page==='athlete'")
    }
    const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(reports,`${width}-${page}.png`),Buffer.from(shot.data,'base64'))
   }
  }
  assert.deepEqual(errors,[])
  await fs.writeFile(path.join(reports,'smoke.json'),JSON.stringify({sha,result:'PASS',routes:['Home','Calendar','Rankings','Athlete','Race','More'],viewports:['390x844','844x390'],physicalDeviceQA:false},null,2))
 }finally{socket?.close();browser.kill('SIGTERM');await fs.writeFile(path.join(reports,'browser-errors.json'),JSON.stringify(errors))}
 console.log('Preview SHA/API/routes/navigation/responsive artwork smoke PASS; physical iPhone QA separate')
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [directory,sha,reports]=process.argv.slice(2)
 try {await smoke(directory,sha,reports)} catch(error){await fs.mkdir(reports,{recursive:true});await fs.writeFile(path.join(reports,'smoke.json'),JSON.stringify({sha,result:'FAIL',error:error.message,automaticRollback:false},null,2));throw error}
}
