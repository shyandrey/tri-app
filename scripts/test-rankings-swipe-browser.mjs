import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
// One listener, explicit reset per navigation; retain redirect hops and retries.
function networkMeasurement() {
 const hops=[];const latest=new Map();let activeLoader
 return {
  reset(){hops.length=0;latest.clear();activeLoader=undefined},
  activate(loader){assert.ok(loader,'Measured navigation must return a loaderId');activeLoader=loader},
  event({method,params:p={}}){
   if(method==='Network.requestWillBeSent'){
    const previous=latest.get(p.requestId)
    if(p.redirectResponse&&previous){previous.response=p.redirectResponse;previous.finished=true}
    const hop={id:p.requestId,loader:p.loaderId,url:p.request.url,type:p.type,startedAt:p.timestamp,bytes:0,finished:false}
    hops.push(hop);latest.set(p.requestId,hop)
   }else{
    const hop=latest.get(p.requestId);if(!hop)return
    if(method==='Network.responseReceived'){
     // responseReceived.loaderId independently identifies the request document.
     if(!hop.loader&&p.loaderId)hop.loader=p.loaderId
     hop.response=p.response
    }
    if(method==='Network.requestServedFromCache')hop.cached=true
    if(method==='Network.dataReceived')hop.bytes+=p.encodedDataLength??0
    if(method==='Network.loadingFinished'){hop.finished=true;hop.encoded=p.encodedDataLength}
    if(method==='Network.loadingFailed'){hop.finished=true;hop.failure=p.errorText}
   }
  },
  rows(){
   assert.ok(activeLoader,'No active measurement document')
   const imageIds=new Set(hops.filter(h=>h.url.includes('/images/showcase/')).map(h=>h.id))
   const images=hops.filter(h=>imageIds.has(h.id))
   assert.ok(images.every(h=>h.loader),'Unattributed showcase request: '+JSON.stringify(images))
   return images.filter(h=>h.loader===activeLoader)
  },
  verify(expected){
   const rows=this.rows(),detail=JSON.stringify({activeLoader,expected,rows})
   assert.ok(rows.length>0,'No network evidence: '+detail)
   assert.ok(rows.every(h=>h.finished&&!h.failure),'Incomplete/failed showcase request: '+detail)
   assert.deepEqual([...new Set(rows.map(h=>h.url))].sort(),[...expected].sort(),'Unexpected artwork payload/orientation: '+detail)
   const transfers=rows.filter(h=>!h.cached&&!h.response?.fromDiskCache&&!h.response?.fromServiceWorker&&h.response?.status!==304&&(h.bytes>0||(h.encoded>0&&h.response?.status===200)))
   assert.equal(new Set(transfers.map(h=>h.url)).size,transfers.length,'Duplicate artwork transfer: '+detail)
   return {activeLoader,rows,transfers:transfers.length}
  }
 }
}
function networkSelfTests(){
 const m=networkMeasurement(),url='/images/showcase/rankings/optimized/a.webp',land='/images/showcase/rankings_landscape/b.webp'
 const event=(method,params)=>m.event({method:'Network.'+method,params})
 const request=(id,loader,u=url)=>event('requestWillBeSent',{requestId:id,loaderId:loader,type:'Image',request:{url:u}})
 const finish=(id,status=200,cache=false)=>{event('responseReceived',{requestId:id,loaderId:'new',response:{status,fromDiskCache:cache}});event('dataReceived',{requestId:id,encodedDataLength:cache||status===304?0:100});event('loadingFinished',{requestId:id,encodedDataLength:cache?0:120})}
 m.activate('new');request('old','old');finish('old');request('one','new');finish('one');assert.equal(m.verify([url]).rows.length,1)
 request('duplicate','new');finish('duplicate');assert.throws(()=>m.verify([url]),/Duplicate artwork transfer/)
 m.reset();m.activate('new');request('one','new');finish('one');request('cache','new');finish('cache',200,true);request('revalidate','new');finish('revalidate',304);assert.equal(m.verify([url]).transfers,1)
 m.reset();m.activate('reload');request('stale','new',land);finish('stale');request('reload','reload');finish('reload');assert.equal(m.verify([url]).rows.length,1)
 request('unknown','');assert.throws(()=>m.rows(),/Unattributed/);finish('unknown');assert.equal(m.rows().length,1) // response loader resolves old document
 m.reset();m.activate('new');request('redirect','new');event('requestWillBeSent',{requestId:'redirect',loaderId:'new',type:'Image',request:{url:'/redirected-image.webp'},redirectResponse:{status:302}});finish('redirect');assert.equal(m.rows().length,2)
 assert.throws(()=>m.verify([url]),/Unexpected artwork/)
 m.reset();m.activate('new');request('failed','new');event('loadingFailed',{requestId:'failed',errorText:'net::ERR_ABORTED'});assert.throws(()=>m.verify([url]),/Incomplete\/failed/)
 console.log('PASS network fixtures: old/current documents, duplicate transfer rejection, cache/304, reload/orientation isolation, response loader fallback, missing-loader failure, redirect preservation, failed-request retention')
}
networkSelfTests()
if(process.argv.includes('--network-self-test'))process.exit(0)

const base=process.env.TRI_APP_URL??'http://127.0.0.1:5396',cdp=process.env.TRI_CDP_URL??'http://127.0.0.1:9254'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch(cdp+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[];const network=networkMeasurement()
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else {network.event(d);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}}
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
await send('Network.enable');await send('Page.navigate',{url:'about:blank'});await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});network.reset();
const navigation=await send('Page.navigate',{url:base+'/?performance=rank05#/rankings'});network.activate(navigation.loaderId);
const artwork=async()=>{const deadline=Date.now()+5000;while(Date.now()<deadline){const images=await js('[...document.querySelectorAll(".standings-showcase__art")].map(i=>({url:i.currentSrc,ready:i.complete&&i.naturalWidth>0}))');if(images.length===2&&images.every(i=>i.ready)&&network.rows().every(r=>r.finished))return images.map(i=>i.url);await wait(50)}throw Error('Artwork timeout: '+JSON.stringify(network.rows()))};
const portrait=await artwork();
assert.equal(new Set(portrait).size,2);assert.ok(portrait.every(u=>u.includes('/rankings/optimized/')&&u.endsWith('.webp')));network.verify(portrait);
await click('.standings-series button:nth-child(2)');await wait(200);assert.equal(await js('document.querySelector("main").dataset.series'),'T100');
await click('.standings-series button:nth-child(1)');await wait(200);
await drag('.standings-showcase .rankings-snap-track',180,0,true,false);assert.equal(await js('document.querySelector("main").dataset.series'),'IRONMAN_PRO_SERIES');
await send('Emulation.setDeviceMetricsOverride',{width:956,height:440,deviceScaleFactor:1,mobile:true});await wait(300);await js('Promise.all([...document.querySelectorAll(".standings-showcase__art")].map(i=>i.decode()))');
const landscape=await artwork();assert.equal(new Set(landscape).size,2);assert.ok(landscape.every(u=>u.includes('/rankings_landscape/')&&u.endsWith('.webp')));
await fs.writeFile(`${output}/network-measurement.json`,JSON.stringify(network.verify([...portrait,...landscape]),null,2));
await send('Network.setCacheDisabled',{cacheDisabled:false});console.log('PASS reduced motion, boundary return, orientation, exactly two current-scene sources per orientation, no duplicates');
assert.equal(errors.length,0,JSON.stringify(errors));
}finally{socket.close()}
