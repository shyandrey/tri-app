import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5197'
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0,mode='normal';const pending=new Map(),held=[],requests=[]
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}
 else if(d.method==='Network.requestWillBeSent'&&d.params.type==='Script')requests.push(d.params.request.url)
 else if(d.method==='Fetch.requestPaused'){
  if(mode==='hold')held.push(d.params.requestId)
  else void send(mode==='fail'?'Fetch.failRequest':'Fetch.continueRequest',{requestId:d.params.requestId,...(mode==='fail'?{errorReason:'ConnectionFailed'}:{})})
 }}
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const until=async expression=>{for(let i=0;i<100;i++){if(await js(expression))return;await wait(100)}throw Error('Timeout: '+expression)}
const start=async hash=>{requests.length=0;await send('Page.navigate',{url:base+'/?split='+Date.now()+hash});await until('!!document.querySelector(".bottom-nav")')}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(150)}
const output=process.env.TRI_ARTIFACT_DIR??'/tmp/tri-release-polish';await fs.mkdir(output,{recursive:true});
const shot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(output+'/'+name+'.png',Buffer.from(s.data,'base64'))}

const observations=[]
await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true})
try {
 for(const [width,height] of [[320,740],[390,844],[440,956]]) {
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true})
  await start('#/home');await until('!!document.querySelector(".feature-card__title")');await js('document.fonts.ready')
  const geometry=await js(`(()=>{const title=document.querySelector('.feature-card__title'),tile=title.closest('button');const lines=new Map();const walk=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);while(walk.nextNode()){const node=walk.currentNode;for(let i=0;i<node.length;i++){const r=document.createRange();r.setStart(node,i);r.setEnd(node,i+1);const rect=r.getBoundingClientRect();const key=Math.round(rect.top);lines.set(key,(lines.get(key)||'')+node.textContent[i])}}return {lines:[...lines.values()].map(x=>x.trim()),br:title.querySelectorAll('br').length,tile:{width:tile.offsetWidth,height:tile.offsetHeight},titleOverflow:title.scrollWidth>title.clientWidth,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,bottom:[...document.querySelectorAll('.bottom-nav button')].map(b=>b.textContent)}})()`)
  observations.push({width,...geometry});assert.deepEqual(geometry.lines,['Календарь','и результаты']);assert.equal(geometry.br,1);assert.equal(geometry.overflow,false);assert.equal(geometry.titleOverflow,false)
  await shot('home-'+width);await click('.feature-card');await until('location.hash==="#/calendar"')
 }
 await send('Fetch.enable',{patterns:[{urlPattern:'*sports-entry*.js'},{urlPattern:'*rankings-entry*.js'}]})
 for(const route of ['rankings','athletes','athlete/101','race/ironman-70-3-oceanside-2026']) {
  mode='hold';await start('#/'+route);await until('!!document.querySelector("[data-route-pending]")')
  assert.equal(await js('document.querySelector(".sports-loading").textContent'),'Загрузка...')
  assert.equal(await js('document.querySelector(".sports-loading [role=status]").textContent'),'Загрузка...')
  await shot('loading-'+route.replaceAll('/','-'))
  mode='normal';for(const requestId of held.splice(0))await send('Fetch.continueRequest',{requestId})
  await until('!document.querySelector("[data-route-pending]")')
 }
 await fs.writeFile(output+'/measurements.json',JSON.stringify(observations,null,2));console.log('PASS Home lines320/390/440, navigation; Rankings/Athletes/Profile/Race exact loading and completion')
}finally{socket.close()}
