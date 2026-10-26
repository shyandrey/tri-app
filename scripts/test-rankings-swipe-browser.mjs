import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5396',cdp=process.env.TRI_CDP_URL??'http://127.0.0.1:9254'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch(cdp+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[],requests=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Network.requestWillBeSent')requests.push(d.params.request.url);else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}).catch(e=>{throw Error(expression+': '+e.message)});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(100)}
const key=async k=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code:k,windowsVirtualKeyCode:({Tab:9,Escape:27,Home:36,End:35,ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39})[k],...(k==='Enter'?{text:'\r',windowsVirtualKeyCode:13}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:k})}

const output=process.env.TRI_ARTIFACT_DIR??'/tmp/300w-rank05';await fs.mkdir(output,{recursive:true});
const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${name}.png`,Buffer.from(r.data,'base64'))};
const drag=async(selector,dx,dy=0,mouse=false,check=true)=>{
 const r=await js(`(()=>{const t=document.querySelector(${JSON.stringify(selector)});t.scrollIntoView({block:'start',behavior:'instant'});const r=t.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,left:t.scrollLeft}})()`);await wait(80);
 const x=r.x+r.w*(dx<0?.8:.2),y=r.y+Math.min(85,r.h/2);
 const input=async(type,x,y)=>mouse?send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:1}):send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y}]});
 await input(mouse?'mousePressed':'touchStart',x,y);
 for(let i=1;i<=12;i++){await input(mouse?'mouseMoved':'touchMove',x+dx*i/12,y+dy*i/12);await wait(25);if(i===6&&check&&Math.abs(dx)>80&&dy===0){const left=await js(`document.querySelector(${JSON.stringify(selector)}).scrollLeft`);assert.ok(Math.abs(left-r.left)>10,'continuous finger following')}}
 await wait(100);await input(mouse?'mouseReleased':'touchEnd',x+dx,y+dy);await wait(750);
};
try{
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true});
for(const [width,height] of [[320,700],[375,812],[390,844],[440,956],[667,375],[844,390],[956,440]])for(const theme of ['dark','light']){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:'no-preference'}]});
 await send('Page.navigate',{url:base+'/?rank05='+Date.now()+'#/rankings'});await wait(600);
 await js('Promise.all([...document.querySelectorAll(".standings-showcase__art")].map(i=>i.decode()))');
 const hero='.standings-showcase .rankings-snap-track',tables='.standings-swipe .rankings-snap-track';
 await drag(hero,-width*.6);assert.equal(await js('document.querySelector("main").dataset.series'),'T100');
 await drag(hero,width*.6,0,true);assert.equal(await js('document.querySelector("main").dataset.series'),'IRONMAN_PRO_SERIES');
 await drag(hero,-15,0,true,false);assert.equal(await js('document.querySelector("main").dataset.series'),'IRONMAN_PRO_SERIES');
 await drag(tables,-width*.6);assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),'W');assert.equal(await js('location.hash'),'#/rankings');
 await drag(tables,width*.6,0,true);assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),'M');assert.equal(await js('location.hash'),'#/rankings');
 await drag(tables,3,-140,false,false);assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),'M');
 assert.equal(await js('document.documentElement.scrollWidth'),width);
 await js('scrollTo(0,0)');await click('.standings-season');await click('#season-2025');await wait(250);await click('.standings-sheet__done');assert.equal(await js('document.querySelector(".standings-season span").textContent'),'2025');
 await click('.rankings-table-panel:not([inert]) tbody a');assert.match(await js('location.hash'),/^#\/athlete\//);await click('.page-back-button');assert.equal(await js('location.hash'),'#/rankings');assert.equal(await js('document.querySelector(".standings-season span").textContent'),'2025');
 await shot(`after-${width}-${theme}`);
 assert.equal(await js('getComputedStyle(document.querySelector(".bottom-nav")).zIndex'),'40');
 console.log(`PASS ${width}x${height} ${theme}: touch/mouse tracking, snap/return, vertical arbitration, links, season, NAV`);
}
await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});requests.length=0;
await send('Page.navigate',{url:base+'/?performance=rank05#/rankings'});await wait(700);await js('Promise.all([...document.querySelectorAll(".standings-showcase__art")].map(i=>i.decode()))');
let images=requests.filter(u=>u.includes('/images/showcase/'));assert.equal(images.length,2);assert.equal(new Set(images).size,2);assert.ok(images.every(u=>u.includes('/rankings/optimized/')&&u.endsWith('.webp')));
await click('.standings-series button:nth-child(2)');await wait(200);assert.equal(await js('document.querySelector("main").dataset.series'),'T100');
await click('.standings-series button:nth-child(1)');await wait(200);
await drag('.standings-showcase .rankings-snap-track',180,0,true,false);assert.equal(await js('document.querySelector("main").dataset.series'),'IRONMAN_PRO_SERIES');
await send('Emulation.setDeviceMetricsOverride',{width:956,height:440,deviceScaleFactor:1,mobile:true});await wait(300);await js('Promise.all([...document.querySelectorAll(".standings-showcase__art")].map(i=>i.decode()))');
images=requests.filter(u=>u.includes('/images/showcase/'));assert.equal(images.length,4);assert.equal(new Set(images).size,4);assert.equal(images.filter(u=>u.includes('/rankings_landscape/')).length,2);
await send('Network.setCacheDisabled',{cacheDisabled:false});console.log('PASS reduced motion, boundary return, orientation, exactly two current-scene sources per orientation, no duplicates');
assert.equal(errors.length,0,JSON.stringify(errors));
}finally{socket.close()}
