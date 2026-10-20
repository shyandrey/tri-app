// Local Vite dev server + isolated Chrome CDP. Synthetic fields exist in browser memory only.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5196'
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('LOCAL_ONLY')
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9396')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map()
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error('CDP_FAILED')):p.resolve(d.result)}}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description??'BROWSER_EXCEPTION');return r.result.value}
const wait=()=>new Promise(r=>setTimeout(r,600))
try{
 await send('Page.enable');await send('Runtime.enable')
 await send('Page.navigate',{url:base+'/?pto-test='+Date.now()+'#/athlete/1'});await wait()
 assert.deepEqual(await js('[...document.querySelectorAll(".athlete-social-icon")].map(a=>a.href)'),['https://instagram.com/kristianblu','https://youtube.com/@kristian.blummenfelt','https://twitter.com/kristianblu'])
 for(const [id,born,links] of [[2,1992,2],[10521,1998,3],[20,null,2],[7,1997,1],[109,1987,2],[38,1993,4],[10825,null,3]]){
  await send('Page.navigate',{url:base+'/?pilot='+Date.now()+'#/athlete/'+id});await wait()
  assert.equal(await js('document.querySelectorAll(".athlete-social-icon").length'),links)
  const facts=await js('document.querySelector(".athlete-detail__facts").textContent')
  if(born)assert.ok(facts.includes(String(new Date().getFullYear()-born)))
  else assert.ok(!/\d/.test(facts))
  assert.ok(await js('[...document.querySelectorAll(".athlete-social-icon")].every(a=>!a.href.includes("linkedin.com")&&!a.href.includes("instagram.com/p/")&&!a.href.includes("?lang="))'))
 }
 await js(`(async()=>{const {default:React}=await import('/node_modules/.vite/deps/react.js');const {default:{createRoot}}=await import('/node_modules/.vite/deps/react-dom_client.js');const {default:Page}=await import('/src/pages/AthleteDetailPage.tsx');const urls={instagram:'https://instagram.com/test',twitter:'https://x.com/test',youtube:'https://youtube.com/channel/UC123',facebook:'https://facebook.com/test',tiktok:'https://tiktok.com/@test',website:'https://athlete.example/'};const field=value=>({value,raw:String(value),sourceUrl:'https://stats.protriathletes.org/athlete/test',verifiedAt:new Date().toISOString(),snapshotSha256:'synthetic'});document.querySelector('#root').style.display='none';const host=document.createElement('div');host.id='pto-test';document.body.append(host);createRoot(host).render(React.createElement(Page,{athlete:{id:999999,name:'Тест',nameEn:'Test',country:'Испания',countryCode:'ES',gender:'M',achievements:[],ptoProfile:{birthYear:field(2000),socials:Object.fromEntries(Object.entries(urls).map(([k,v])=>[k,field(v)]))}},results:[],races:[],onBack:()=>{},onNavigate:()=>{},onRaceClick:()=>{}}))})()`)
 await wait()
 for(const width of [320,390,768]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:850,deviceScaleFactor:1,mobile:width<768});await wait()
  assert.equal(await js('document.querySelectorAll("#pto-test .athlete-social-icon").length'),6)
  assert.ok(await js('[...document.querySelectorAll("#pto-test .athlete-social-icon")].every(a=>a.href.startsWith("https://")&&a.target==="_blank"&&a.rel.includes("noopener")&&a.getAttribute("aria-label")&&a.getBoundingClientRect().right<=innerWidth)'))
  assert.ok(await js('document.documentElement.scrollWidth<=innerWidth'))
  const icons=await js(`['facebook','twitter','Официальный сайт'].map(label=>{const a=document.querySelector('#pto-test a[aria-label="'+label+'"]'),svg=a.querySelector('svg'),shape=svg?.querySelector('path'),box=a.getBoundingClientRect();return {label,viewBox:svg?.getAttribute('viewBox'),hidden:svg?.getAttribute('aria-hidden'),text:a.textContent,fill:shape&&getComputedStyle(shape).fill,stroke:shape&&getComputedStyle(shape).stroke,color:getComputedStyle(a).color,width:box.width,height:box.height,cssWidth:getComputedStyle(a).width,raster:!!svg?.querySelector('image'),circle:!!svg?.querySelector('circle'),ellipse:!!svg?.querySelector('ellipse')}})`)
  for(const icon of icons){
   assert.equal(icon.viewBox,'0 0 24 24');assert.equal(icon.hidden,'true');assert.equal(icon.text,'');assert.equal(icon.raster,false)
   assert.equal(icon.cssWidth,width<=640?'34px':'36px');assert.equal(icon.height,icon.width)
   if(icon.label==='Официальный сайт'){assert.ok(icon.circle&&icon.ellipse);assert.equal(icon.stroke,icon.color)}
   else {assert.equal(icon.fill,icon.color);assert.equal(icon.stroke,'none')}
  }
  await js('document.querySelector("#pto-test a[aria-label=facebook]").focus()')
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
  assert.equal(await js('document.activeElement.getAttribute("aria-label")'),'tiktok')
  const screenshot=await send('Page.captureScreenshot',{format:'png'})
  await fs.writeFile(`/tmp/300w-social-icons-${width}.png`,Buffer.from(screenshot.data,'base64'))
  assert.ok(await js('document.querySelector("#pto-test .athlete-detail__facts").textContent.includes(String(Number(new Intl.DateTimeFormat("en",{timeZone:"Europe/Moscow",year:"numeric"}).format(new Date()))-2000))'))
  await js('document.querySelector("#pto-test .athlete-social-icon").focus()');assert.ok(await js('document.activeElement.classList.contains("athlete-social-icon")'))
 }
 console.log('PASS profile UI: existing links, six full URLs, computed age, accessible anchors, 320/390/768px')
}finally{socket.close()}
