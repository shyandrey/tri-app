import { assertDocumentWidth, assertEdgeToEdge, assertResponsiveHeight, isSnapAt, verifyGeometryFixtures } from './browser-geometry-contract.mjs'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { rankingsShowcase } from '../src/pages/rankingsShowcase.ts'
verifyGeometryFixtures()
// Approved active bytes pinned at GIT-01B review. No archived PNG/manifest dependency.
const activeAssets = {
  "/images/showcase/rankings/optimized/ironman_01_swim.webp": {
    "dimensions": [
      1983,
      793
    ],
    "bytes": 296142,
    "sha256": "28dbbacba9677a7ce20172f9f2ea2354a6a0b0eb2ab806262c9e236b3610d820"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_swimming.webp": {
    "dimensions": [
      1947,
      808
    ],
    "bytes": 220256,
    "sha256": "69964ad9acd60c0f0aa074a7f9cac32bccfd531fa7d0b8be65aba1983fab62d2"
  },
  "/images/showcase/rankings/optimized/ironman_02_bike.webp": {
    "dimensions": [
      1983,
      793
    ],
    "bytes": 297866,
    "sha256": "5ee4751c977454413625ecda91122ed191e50479b730c259d19e7ba9e134ccec"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_cycling.webp": {
    "dimensions": [
      1947,
      808
    ],
    "bytes": 244476,
    "sha256": "ed8613247fa49c58571711b7d5a0e5ff40e7c6e4228c6820fc4198f3dffd74df"
  },
  "/images/showcase/rankings/optimized/ironman_03_run_finish.webp": {
    "dimensions": [
      1983,
      793
    ],
    "bytes": 225230,
    "sha256": "476a340232ebf48618e0ed2ee9b3b12010d4e3a70731e05da194337434b948bb"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_running.webp": {
    "dimensions": [
      1947,
      808
    ],
    "bytes": 210922,
    "sha256": "04d77c0b9c14a2f5acab6b147d594a5442ed2946b045f9c55d85e92d33486926"
  },
  "/images/showcase/rankings/optimized/ironman_04_transition.webp": {
    "dimensions": [
      1671,
      941
    ],
    "bytes": 325420,
    "sha256": "e5ea491fc704f476952a1fd2566b126aec5a3a8d5c665bf3657c0d54b8f5cc8a"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_transition.webp": {
    "dimensions": [
      1947,
      808
    ],
    "bytes": 355328,
    "sha256": "4318915509cfd374f86cfabe473e43ee5ae8fec9319135a5d328a12b2f8807f1"
  },
  "/images/showcase/rankings/optimized/t100_01_swim.webp": {
    "dimensions": [
      1671,
      941
    ],
    "bytes": 278206,
    "sha256": "f9a120dc3e6511d0c7f692218133534991a57c44043f0f74bad22fe6bdc43efb"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_swimming.webp": {
    "dimensions": [
      1947,
      808
    ],
    "bytes": 224646,
    "sha256": "46a7d3120cd49a3b2969f87e79b24e5add053dfaee2f338d0cc630c4901e83df"
  },
  "/images/showcase/rankings/optimized/t100_02_bike.webp": {
    "dimensions": [
      1672,
      941
    ],
    "bytes": 285070,
    "sha256": "df6ff612551048d45aa8984ad2af4fdc1a1e9ebd115fdbaffd8439a102801a50"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_cycling_final.webp": {
    "dimensions": [
      2078,
      378
    ],
    "bytes": 211262,
    "sha256": "c897c1b1275d20a21b520ec7f10ad33bc5915625c838c5af4c5df48a29bc53a2"
  },
  "/images/showcase/rankings/optimized/t100_03_run_city.webp": {
    "dimensions": [
      1672,
      941
    ],
    "bytes": 262532,
    "sha256": "21945a25d68537879e4966ba114c38ede576c3b76e2e19d48a1750f82d08e692"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_running_city.webp": {
    "dimensions": [
      1950,
      807
    ],
    "bytes": 188666,
    "sha256": "5e2b9228f7ac53aebd5dcf676932d0857cbc3458ead77cb5b5c4422062eda808"
  },
  "/images/showcase/rankings/optimized/t100_04_transition.webp": {
    "dimensions": [
      1671,
      941
    ],
    "bytes": 490150,
    "sha256": "d7085b43b19b4ee8b9865a1dbe1e8621d09e79ec2948485e91bd1dceba947cbc"
  },
  "/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_transition.webp": {
    "dimensions": [
      1947,
      808
    ],
    "bytes": 269846,
    "sha256": "01cff8d59c8bd2efecf7c1bad9ee872f8acda2e042d3daf70c5598fc21fee384"
  }
}
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
// Require settled state across the track's 120ms debounce, not a fixed post-click sleep.
const until=async(expression)=>{let stableAt=0;for(let n=0;n<120;n++){if(await js(expression)){stableAt ||= Date.now();if(Date.now()-stableAt>=200)return}else stableAt=0;await wait(50)}throw Error('Timed out: '+expression+'; '+await js(`JSON.stringify({series:document.querySelector('main')?.dataset.series,left:document.querySelector('.standings-showcase .rankings-snap-track')?.scrollLeft,width:innerWidth})`))}

const output=process.env.TRI_SHOWCASE_OUTPUT??'/tmp/300w-rank03/screenshots';await fs.mkdir(output,{recursive:true})
try {

 await send('Page.enable');await send('Runtime.enable')
 const mapped=Object.values(rankingsShowcase).flatMap(a=>a.flatMap(x=>[x.path,x.landscapePath]))
 assert.equal(mapped.length,16);assert.equal(new Set(mapped).size,16)
 assert.deepEqual(mapped,Object.keys(activeAssets),'Approved series/scene/orientation mapping order')
 for(const path of mapped){
  const bytes=await fs.readFile('public'+path),expected=activeAssets[path]
  assert.equal(bytes.length,expected.bytes,path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256,path)
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP')
 }
 await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true})
 await send('Emulation.setTouchEmulationEnabled',{enabled:true})
 console.log('PASS 16 unique active WebP paths, byte sizes and approved SHA-256; no originals required')
 for(const [width,height] of [[320,700],[375,812],[390,844],[440,956],[667,375],[844,390],[956,440],[1440,900]])for(const theme of ['dark','light']){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<1000})
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]})
  for(let scene=0;scene<4;scene++){
   const seed=await send('Page.addScriptToEvaluateOnNewDocument',{source:`Math.random=()=>${scene/4}`})
   await send('Page.navigate',{url:base+'/?crop='+Date.now()+'#/rankings'});await until('document.querySelectorAll(".rankings-showcase-panel img").length===2')
   await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:seed.identifier})
   await js('Promise.all([...document.querySelectorAll(".standings-showcase__art")].map(i=>i.decode()))')
   const seriesKeys=['IRONMAN_PRO_SERIES','T100']
   const expectedPaths=seriesKeys.map(key=>rankingsShowcase[key][scene][width>height?'landscapePath':'path'])
   const decoded=await js(`[...document.querySelectorAll('.standings-showcase__art')].map(i=>({path:new URL(i.currentSrc).pathname,w:i.naturalWidth,h:i.naturalHeight,complete:i.complete}))`)
   assert.deepEqual(decoded.map(x=>x.path),expectedPaths)
   for(const image of decoded){assert.ok(image.complete);assert.deepEqual([image.w,image.h],activeAssets[image.path].dimensions)}
   // Actual pointer drag: decoded neighboring panels must cover the frame continuously.
   const hero=await js(`(()=>{const r=document.querySelector('.standings-showcase').getBoundingClientRect();return {w:r.width,h:r.height,trackWidth:document.querySelector('.standings-showcase .rankings-snap-track').clientWidth}})()`)
   const x=hero.w*.8,y=Math.min(hero.h*.65,100)
   await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1})
   for(let step=1;step<=6;step++){
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x-hero.w*.6*step/6,y,button:'left',buttons:1});await wait(20)
    const frame=await js(`(()=>{const track=document.querySelector('.standings-showcase .rankings-snap-track'),panels=[...track.children];return {left:track.scrollLeft,ready:panels.every(p=>{const i=p.querySelector('img'),c=getComputedStyle(i);return i.complete&&i.naturalWidth>0&&c.visibility==='visible'&&c.opacity!=='0'}),bounds:panels.map(p=>{const r=p.getBoundingClientRect();return [r.left,r.right]})}})()`)
    assert.ok(frame.ready,'Both decoded images available during drag')
    assert.ok(frame.bounds[0][0]<=1&&frame.bounds[1][1]>=hero.w-1,'No uncovered frame edge')
    assert.ok(Math.abs(frame.bounds[0][1]-frame.bounds[1][0])<1,'No gap between images')
    if(step===6)assert.ok(frame.left>hero.w*.3,'Track follows pointer')
   }
   await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x-hero.w*.6,y,button:'left',buttons:0})
   await until(`document.querySelector('main').dataset.series==='T100' && (${isSnapAt.toString()})(document.querySelector('.standings-showcase .rankings-snap-track').scrollLeft,1,${hero.trackWidth})`)
   for(const [i,series] of ['ironman','t100'].entries()){
    await click(`.standings-series button:nth-child(${i+1})`)
    await until(`document.querySelector('main').dataset.series===${JSON.stringify(['IRONMAN_PRO_SERIES','T100'][i])} && (${isSnapAt.toString()})(document.querySelector('.standings-showcase .rankings-snap-track').scrollLeft,${i},${hero.trackWidth})`)
    await js('Promise.all([...document.querySelectorAll(".standings-showcase__art")].map(i=>i.decode()))')
    const info=await js(`(()=>{const e=document.querySelector('.rankings-showcase-panel[aria-hidden="false"] .standings-showcase__art'),b=e.getBoundingClientRect(),hero=document.querySelector('.standings-showcase').getBoundingClientRect(),back=document.querySelector('.page-back-button').getBoundingClientRect();return {src:e.currentSrc,w:e.naturalWidth,h:e.naturalHeight,fit:getComputedStyle(e).objectFit,left:hero.left,width:hero.width,heroHeight:hero.height,top:hero.top,backBottom:back.bottom,artTop:b.top,backWidth:back.width,backHeight:back.height}})()`)
    const finalCycling=width>height&&series==='t100'&&scene===1
    if(finalCycling){assert.equal(info.w,2078);assert.equal(info.h,378)}else assert.ok(info.w>1500&&info.h>700)
    if(width>height){
     const name=series==='ironman'?['swimming','cycling','running','transition'][scene]:['swimming','cycling_final','running_city','transition'][scene]
     assert.ok(info.src.endsWith(`/optimized/${series}_${name}.webp`))

    }else assert.equal(new URL(info.src).pathname,expectedPaths[i])
    const requests=await js("performance.getEntriesByType('resource').filter(r=>r.name.includes('/showcase/rankings')).map(r=>r.name)")
    assert.deepEqual(requests.map(u=>new URL(u).pathname).sort(),[...expectedPaths].sort(),'Exactly two active-orientation requests; no inactive or duplicate requests')
    const edge=await js(`(()=>{const h=document.querySelector('.standings-showcase'),i=document.querySelector('.rankings-showcase-panel[aria-hidden="false"] .standings-showcase__art'),a=getComputedStyle(h,'::after'),b=getComputedStyle(h,'::before'),c=getComputedStyle(i),s=getComputedStyle(h);return {after:a.content,beforeFilter:b.filter,imageFilter:c.filter,mask:c.maskImage,shadow:s.boxShadow,radius:s.borderBottomLeftRadius,border:s.borderBottomWidth}})()`)
    assert.ok(['none','normal'].includes(edge.after),'No bottom fade pseudo-element')
    assert.equal(edge.beforeFilter,'none');assert.equal(edge.imageFilter,'none');assert.equal(edge.mask,'none')
    assert.equal(edge.shadow,'none');assert.equal(edge.radius,'0px');assert.equal(edge.border,'0px')
    assert.equal(await js("getComputedStyle(document.querySelector('.bottom-nav')).zIndex"),'40')
    assert.equal(await js("document.querySelectorAll('.bottom-nav__capsule').length"),1)
    assert.equal(info.fit,finalCycling||width<=height&&width>=1024?'contain':'cover')
    assertResponsiveHeight(info.heroHeight,width,height)
    assert.equal(info.top,0);assertEdgeToEdge(info,await js('document.documentElement.clientWidth'))
    assert.ok(info.backWidth>=44&&info.backWidth<150&&info.backHeight>=32)
    assert.ok(info.backBottom<=60)
    assertDocumentWidth(await js('({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth})'))
    const shot=await send('Page.captureScreenshot',{format:'png'})
    await fs.writeFile(`${output}/crop-${series}-${scene+1}-${theme}-${width}x${height}.png`,Buffer.from(shot.data,'base64'))
   }
  }
  // Emulate Telegram inset variables; the complete art remains below controls.
  await js('document.querySelector("main").style.setProperty("--tg-safe-area-inset-top","24px");document.querySelector("main").style.setProperty("--tg-content-safe-area-inset-top","32px");document.querySelector("main").style.setProperty("--tg-safe-area-inset-right","24px")')
  assert.ok(await js('document.querySelector(".page-back-button").getBoundingClientRect().top>=60'))
  assert.ok(await js('innerWidth-document.querySelector(".page-back-button").getBoundingClientRect().right>=24'))
  console.log(`PASS 8 mapped scenes: ${width}x${height} ${theme}, responsive artwork, edge-to-edge, safe area, compact Back`)
 }
 assert.equal(errors.length,0,JSON.stringify(errors))
} finally { await send('Network.setCacheDisabled',{cacheDisabled:false});socket.close() }
