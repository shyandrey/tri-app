import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9231')+'/json/list')).json();
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r);
let seq=0;const pending=new Map();const errors=[];
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};
const start=async(hash='#/home')=>{await send('Page.navigate',{url:(process.env.TRI_APP_URL??'http://127.0.0.1:5190')+'/?check='+Date.now()+hash});await wait(650)};
const shot=async path=>{const s=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path,Buffer.from(s.data,'base64'))};

const output=process.env.TRI_BRAND_EVIDENCE_DIR??'/tmp/tri-300w-review'
await fs.mkdir(output,{recursive:true})
const pkg=JSON.parse(await fs.readFile('package.json','utf8'))
assert.equal(pkg.name,'tri-app')
const config=await fs.readFile('wrangler.jsonc','utf8')
for(const name of ['tri-app-local','tri-app-preview','tri-app-production'])assert.ok(config.includes(name))
assert.ok((await fs.readFile('worker/index.ts','utf8')).includes("service: 'tri-app'"))
for(const path of await fs.readdir('src',{recursive:true})){
 if(/\.(tsx?|css)$/.test(path))assert.ok(!/tri[ -]?app/i.test(await fs.readFile('src/'+path,'utf8')),`old frontend brand in ${path}`)
}
const measurements=[]
await send('Page.enable');await send('Runtime.enable')
try {
 for(const [width,height] of [[320,800],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[844,390]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:2,mobile:width<768})
  await start()
  assert.equal(await js('document.title'),'300W⚡ APP')
  assert.equal(await js('document.querySelector(".home-wordmark__text").textContent'),'300W')
  assert.equal(await js('document.querySelector(".home-wordmark").getAttribute("aria-label")'),'300W⚡')
  assert.equal(await js('document.querySelector(".home-wordmark").querySelectorAll("button, a, [role=button], [tabindex]").length'),0)
  assert.equal(await js('document.querySelector(".home-header h2").textContent'),'ТРИАТЛОН — ЭТО МОЩНО!')
  const metrics=await js(`(()=>{const e=document.querySelector('.home-wordmark'),r=e.getBoundingClientRect(),mark=document.querySelector('.home-wordmark__mark'),m=mark.getBoundingClientRect(),t=document.querySelector('.home-wordmark__text').getBoundingClientRect(),button=document.querySelector('.home-header__settings').getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height,font:getComputedStyle(e).fontSize,settingsLeft:button.left,markWidth:m.width,markHeight:m.height,gap:t.left-m.right,centerDelta:(t.top+t.height/2)-(m.top+m.height/2),cursor:getComputedStyle(mark).cursor,ring:getComputedStyle(mark).boxShadow,radius:getComputedStyle(mark).borderRadius,weight:getComputedStyle(e).fontWeight,gearCenterDelta:button.top+button.height/2-(m.top+m.height/2),iconCenterDelta:(()=>{const i=mark.querySelector('svg').getBoundingClientRect();return {x:i.left+i.width/2-(m.left+m.width/2),y:i.top+i.height/2-(m.top+m.height/2)}})()}})()`)
  assert.ok(metrics.right+16<=metrics.settingsLeft)
  assert.equal(metrics.markWidth,36);assert.equal(metrics.markWidth,metrics.markHeight)
  assert.equal(metrics.gap,10);assert.ok(Math.abs(metrics.centerDelta)<1);assert.notEqual(metrics.cursor,'pointer')
  assert.equal(metrics.font,'20px');assert.equal(metrics.weight,'800');assert.ok(metrics.ring.includes('1.5px')&&metrics.ring.includes('inset'));assert.equal(metrics.radius,'50%')
  assert.equal(metrics.gearCenterDelta,0);assert.deepEqual(metrics.iconCenterDelta,{x:0,y:0})
  const previous=await js('location.hash');await js('document.querySelector(".home-wordmark__mark").click()');assert.equal(await js('location.hash'),previous)
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  assert.equal(await js('document.querySelector(".latest-news__channel").href'),'https://t.me/trista_watt')
  assert.ok(!/tri[ -]?app/i.test(await js('document.body.innerText')))
  if([320,390,430,1440,844].includes(width))await shot(`${output}/home-${width}.png`)
  if(width===390){
   const clip=await js('(()=>{const r=document.querySelector(".home-header").getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()')
   const crop=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip})
   await fs.writeFile(`${output}/header-390-crop.png`,Buffer.from(crop.data,'base64'))
  }
  await start('#/more')
  assert.equal(await js('document.querySelector(".more-brand").textContent'),'300W⚡ APP')
  const about=await js('document.querySelector(".more-panel").textContent')
  assert.ok(about.includes('Профессиональный триатлон: календарь, результаты, профили атлетов и многое другое.'))
  assert.ok(!/tri[ -]?app|TRI Ranking/i.test(await js('document.body.innerText')))
  assert.equal(await js('document.title'),'300W⚡ APP')
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  if(width===390)await shot(`${output}/more-390.png`)
  if(width===390){
   await js('document.querySelector(".feedback-entry").click()');await wait(200)
   assert.equal(await js('document.querySelector(".feedback-context").textContent'),'Общий отзыв о 300W⚡')
   assert.equal(await js('document.title'),'300W⚡ APP')
   assert.ok(!/tri[ -]?app/i.test(await js('document.body.innerText')))
   await shot(`${output}/feedback-390.png`)
  }
  measurements.push({viewportWidth:width,viewportHeight:height,...metrics})
  console.log(`PASS brand ${width}x${height}: Home/About/title, no old brand or overflow, Telegram link preserved`)
 }
 await send('Page.navigate',{url:(process.env.TRI_APP_URL??'http://127.0.0.1:5190')+'/favicon.svg'});await wait(300)
 await shot(`${output}/favicon-existing.png`)
 assert.deepEqual(errors,[])
 await fs.writeFile(`${output}/metrics.json`,JSON.stringify(measurements,null,2))
} finally {socket.close()}
