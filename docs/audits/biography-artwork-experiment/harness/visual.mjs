import fs from 'node:fs/promises';const out='/private/tmp/300w-bio-art-experiment-20261110';const t=(await(await fetch('http://127.0.0.1:9491/json/list')).json()).find(t=>t.type==='page');const w=new WebSocket(t.webSocketDebuggerUrl);await new Promise(r=>w.onopen=r);let id=0,req=new Map();const pending=new Map();const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;const timer=setTimeout(()=>{pending.delete(n);reject(Error('CDP timeout: '+method))},15000);pending.set(n,{resolve,reject,timer});w.send(JSON.stringify({id:n,method,params}));});w.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);if(!p)return;clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result);return}const p=d.params;if(d.method==='Network.requestWillBeSent')req.set(p.requestId,{url:p.request.url,type:p.type,loader:p.loaderId,requestId:p.requestId,start:p.timestamp,priority:p.request.initialPriority,initiator:p.initiator.type});if(d.method==='Network.responseReceived'){const r=req.get(p.requestId);if(r)Object.assign(r,{status:p.response.status,disk:p.response.fromDiskCache,mime:p.response.mimeType,cache:p.response.fromServiceWorker,protocol:p.response.protocol})}if(d.method==='Network.loadingFailed'){const r=req.get(p.requestId);if(r)Object.assign(r,{failure:p.errorText,canceled:p.canceled})}if(d.method==='Network.loadingFinished'){const r=req.get(p.requestId);if(r)r.bytes=p.encodedDataLength}};const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value};const wait=ms=>new Promise(r=>setTimeout(r,ms));


await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
await send('Page.addScriptToEvaluateOnNewDocument',{source:'Math.random=()=>0.99'});
const evidence=[];
for(const [label,port] of [['baseline',5490],['art',5492]])for(const [width,height,dpr]of [[390,844,3],[440,956,3],[844,390,3],[956,440,3],[1440,900,1],[1024,1366,2]]){
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:width<1024});
 await send('Page.navigate',{url:'about:blank'});await send('Network.clearBrowserCache');req=new Map();
 const nav=await send('Page.navigate',{url:`http://127.0.0.1:${port}/#/rankings`});
 for(let n=0;n<100;n++){if(await js(`document.querySelector('.standings-showcase__art')&&[...document.querySelectorAll('.standings-showcase__art')].every(i=>i.complete&&i.naturalWidth)`))break;await wait(100)}
 for(const series of ['IRONMAN_PRO_SERIES','T100']){
  if(series==='T100'){await js(`document.querySelector('.standings-series button:nth-child(2)').click()`);await wait(500)}
  const data=await js(`({series:document.querySelector('.app--official-rankings').dataset.series,overflow:document.documentElement.scrollWidth>innerWidth,images:[...document.querySelectorAll('.standings-showcase__art')].map(i=>({url:i.currentSrc,width:i.getBoundingClientRect().width,height:i.getBoundingClientRect().height,naturalWidth:i.naturalWidth,complete:i.complete}))})`);
  if(!data.images.every(i=>i.complete&&i.naturalWidth)||data.overflow||data.series!==series)throw Error('Artwork layout failed '+JSON.stringify(data));
  const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.mkdir(out+'/visual-corrected',{recursive:true});await fs.writeFile(out+`/visual-corrected/${label}-${width}-${height}-${series}.png`,Buffer.from(shot.data,'base64'));
  evidence.push({label,width,height,dpr,...data,requests:[...req.values()].filter(r=>r.loader===nav.loaderId)});
 }
}
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:3,mobile:true});
await send('Emulation.setDisabledImageTypes',{imageTypes:['avif']});
await send('Page.navigate',{url:'about:blank'});await send('Network.clearBrowserCache');req=new Map();
const fallbackNav=await send('Page.navigate',{url:'http://127.0.0.1:5492/#/rankings'});
for(let n=0;n<100;n++){if(await js(`document.querySelector('.standings-showcase__art')&&[...document.querySelectorAll('.standings-showcase__art')].every(i=>i.complete&&i.naturalWidth)`))break;await wait(100)}
const fallback=await js(`[...document.querySelectorAll('.standings-showcase__art')].map(i=>({url:i.currentSrc,w:i.naturalWidth,ready:i.complete}))`);
if(fallback.length!==2||!fallback.every(i=>i.ready&&i.w===1320&&i.url.endsWith('-1320.webp')))throw Error('WebP fallback failed '+JSON.stringify(fallback));
const transfers=[...req.values()].filter(r=>r.loader===fallbackNav.loaderId&&r.url.includes('/showcase/rankings'));
if(transfers.length!==2||transfers.some(r=>r.url.endsWith('.avif')))throw Error('Unexpected fallback requests '+JSON.stringify(transfers));
evidence.push({label:'art-webp-fallback',width:390,height:844,dpr:3,images:fallback,requests:transfers});
await send('Emulation.setDisabledImageTypes',{imageTypes:[]});
console.log('PASS 24 comparison captures and AVIF-disabled WebP fallback; exactly two required artwork requests');
await fs.writeFile(out+'/visual.json' ,JSON.stringify(evidence,null,2));w.close();
