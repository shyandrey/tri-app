import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5390',cdp=process.env.TRI_CDP_URL??'http://127.0.0.1:9241'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch(cdp+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}).catch(e=>{throw Error(expression+': '+e.message)});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(100)}
const key=async k=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code:k,windowsVirtualKeyCode:({Tab:9,Escape:27,Home:36,End:35,ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39})[k],...(k==='Enter'?{text:'\r',windowsVirtualKeyCode:13}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:k})}
const phase=process.env.TRI_CONTROLS_PHASE??'after';const output=process.env.TRI_ARTIFACT_DIR??`/tmp/300w-rank04/${phase}`;await fs.mkdir(output,{recursive:true});
const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${name}.png`,Buffer.from(r.data,'base64'))};
try{
await send('Page.enable');await send('Runtime.enable');
for(const [width,height] of [[320,700],[375,812],[390,844],[440,956],[667,375],[844,390],[956,440]])for(const theme of ['dark','light']){
await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:'reduce'}]});
const seed=await send('Page.addScriptToEvaluateOnNewDocument',{source:'Math.random=()=>0'});await send('Page.navigate',{url:base+'/?controls='+Date.now()+'#/rankings'});await wait(400);await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:seed.identifier});
await click('.standings-series button:nth-child(2)');await click('.standings-gender button:nth-child(2)');await js('document.querySelector(".standings-showcase__art").decode()');
if(phase!=='before'){
 const metrics=await js(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,cx:(b.left+b.right)/2,cy:(b.top+b.bottom)/2,width:b.width,height:b.height}};const series=document.querySelector('.standings-series'),gender=document.querySelector('.standings-gender > div');return {series:r(series),gender:r(gender),label:r(document.querySelector('.standings-gender > span')),season:r(document.querySelector('.standings-season')),buttons:[...series.querySelectorAll('button'),...gender.querySelectorAll('button')].map(r),dots:[...series.querySelectorAll('button span'),...gender.querySelectorAll('button span')].map(e=>({rect:r(e),color:e.closest('.standings-gender')?getComputedStyle(e).color:getComputedStyle(e).backgroundColor,text:e.textContent,radius:getComputedStyle(e).borderRadius})),overflow:document.documentElement.scrollWidth}})()`);
 assert.ok(Math.abs(metrics.series.cx-width/2)<1);assert.ok(Math.abs(metrics.gender.cx-width/2)<1);
 assert.ok(Math.abs(metrics.label.cy-metrics.season.cy)<1);assert.ok(Math.abs(metrics.gender.cy-metrics.season.cy)<1);
 assert.ok(metrics.label.right<=metrics.gender.left);assert.ok(metrics.gender.right<=metrics.season.left);assert.ok(metrics.series.bottom<=metrics.gender.top);
 assert.equal(metrics.overflow,width);assert.ok(metrics.buttons.every(b=>b.width>=44&&b.height>=44));assert.ok(metrics.season.height>=44);
 assert.ok(Math.abs((metrics.dots[0].rect.cx+metrics.dots[1].rect.cx)/2-width/2)<1,'Series dots truly centered');
 assert.ok(Math.abs((metrics.dots[2].rect.cx+metrics.dots[3].rect.cx)/2-width/2)<1,'Gender dots truly centered');
 assert.ok(metrics.dots.slice(0,2).every(d=>d.rect.width===7&&d.rect.height===7));assert.ok(metrics.dots.slice(2).every(d=>d.rect.width===24&&d.rect.height===24));assert.deepEqual(metrics.dots.slice(2).map(d=>d.text),['♂︎','♀︎']);assert.equal(metrics.dots[0].color,metrics.dots[2].color);assert.equal(metrics.dots[1].color,metrics.dots[3].color);
 assert.equal(metrics.dots[1].rect.cx-metrics.dots[0].rect.cx,metrics.dots[3].rect.cx-metrics.dots[2].rect.cx);
}
await shot(`controls-${width}-${theme}-women`);await click('.standings-gender > div button:first-child');await wait(200);assert.equal(await js('document.querySelector(".standings-gender button[aria-pressed=true]").ariaLabel'),'Мужчины');await shot(`controls-${width}-${theme}-men`);await click('.standings-gender > div button:last-child');await click('.standings-season');await wait(100);await shot(`picker-${width}-${theme}`);
if(phase!=='before'){
 assert.equal(await js("getComputedStyle(document.querySelector('.standings-wheel')).outlineStyle"),'none');
 assert.equal(await js("getComputedStyle(document.querySelector('.standings-wheel__selection')).borderTopWidth"),'0px');
 assert.ok(await js("document.querySelector('.standings-wheel__selection').getBoundingClientRect().height===48"));
 await key('End');await wait(350);const year=await js("document.querySelector('.standings-wheel [role=option]:last-child').textContent");assert.equal(await js("document.querySelector('.standings-season span').textContent"),year);
 await send('Emulation.setDeviceMetricsOverride',{width:height,height:width,deviceScaleFactor:1,mobile:true});await wait(150);
 assert.equal(await js("document.querySelector('.standings-wheel [aria-selected=true]').textContent"),year);
 assert.ok(await js("(()=>{const r=document.querySelector('dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight+1})()"));
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await wait(100);
 await js("document.querySelector('.standings-wheel').focus()");await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});await wait(50);assert.equal(await js('document.activeElement.textContent'),'Готово');await key('Enter');await wait(100);
 assert.equal(await js('Boolean(document.querySelector("dialog"))'),false);assert.equal(await js('document.activeElement.className'),'standings-season');assert.notEqual(await js('document.body.style.overflow'),'hidden');
 assert.equal(await js("getComputedStyle(document.querySelector('.bottom-nav')).zIndex"),'40');
}else await click('.standings-sheet header button');
console.log(`PASS ${phase} ${width}x${height} ${theme}: controls and picker`);
}
assert.equal(errors.length,0,JSON.stringify(errors));
}finally{socket.close()}
