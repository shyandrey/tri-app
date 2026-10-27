import { assertDocumentWidth, verifyGeometryFixtures } from './browser-geometry-contract.mjs'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
verifyGeometryFixtures()
const base=process.env.TRI_APP_URL??'http://127.0.0.1:5390',cdp=process.env.TRI_CDP_URL??'http://127.0.0.1:9241'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch(cdp+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[],consoleErrors=[],cdpDiagnostics=[]
const failPending=reason=>{cdpDiagnostics.push(reason);for(const p of pending.values()){clearTimeout(p.timer);p.reject(Error(reason))}pending.clear()}
socket.onclose=e=>failPending(`CDP closed (${e.code})`)
socket.onerror=()=>failPending('CDP socket error')
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);if(!p)return;pending.delete(d.id);clearTimeout(p.timer);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails);else if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')consoleErrors.push(d.params)}
const send=(method,params={})=>new Promise((resolve,reject)=>{
 const id=++seq
 const timer=setTimeout(()=>{pending.delete(id);const reason=`CDP timeout: ${method}`;cdpDiagnostics.push(reason);reject(Error(reason))},5000)
 pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))
})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}).catch(e=>{throw Error(expression+': '+e.message)});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(100)}
const key=async k=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:k,code:k,windowsVirtualKeyCode:({Escape:27,Home:36,End:35,ArrowUp:38,ArrowDown:40,ArrowLeft:37,ArrowRight:39})[k],...(k==='Enter'?{text:'\r',windowsVirtualKeyCode:13}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key:k,code:k})}
const luminance=rgb=>rgb.match(/\d+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
const expected={}
for(const s of ['ironman','t100'])for(const y of [2024,2025,2026])for(const g of ['men','women'])expected[`${s}-${y}-${g}`]=JSON.parse(await fs.readFile(`src/data/officialStandings/${s}/${y}-${g}.json`))
const output=process.env.TRI_ARTIFACT_DIR??'/tmp/300w-rankings-v22a';await fs.mkdir(output,{recursive:true})
// Wait for the selected wheel option AND the exact authoritative visible table.
// A changed year label alone cannot satisfy this condition.
const seasonSnapshot = () => {
 const table=document.querySelector('.rankings-table-panel:not([inert]) table')
 const wheel=document.querySelector('.standings-wheel')
 const option=wheel?.querySelector('[aria-selected="true"]')
 const wr=wheel?.getBoundingClientRect(),or=option?.getBoundingClientRect()
 return {url:location.href,series:document.querySelector('main').dataset.series,
  displayedYear:document.querySelector('.standings-season span')?.textContent,
  tableYear:table?.dataset.season,gender:table?.dataset.gender,
  picker:{open:document.querySelector('dialog')?.open??false,selected:option?.textContent,active:wheel?.getAttribute('aria-activedescendant'),scrollTop:wheel?.scrollTop,centerOffset:wr&&or?(or.top+or.height/2)-(wr.top+wr.height/2):null},
  rows:[...(table?.querySelectorAll('tbody tr')??[])].map(r=>({rank:Number(r.cells[0].textContent),name:r.querySelector('.standings-name').firstChild.textContent,points:Number(r.cells[2].textContent.replace(/\s/g,'')),id:Number(r.dataset.athleteId),href:r.querySelector('a').getAttribute('href'),country:r.querySelector('.standings-flag')?.getAttribute('aria-label')}))}
}
const waitForSeason = async (series,year,gender) => {
 const wanted=expected[`${series}-${year}-${gender==='M'?'men':'women'}`]
 assert.ok(wanted,`Missing approved table ${series}/${year}/${gender}`)
 const rows=wanted.rows.map(r=>({rank:r.officialRank,name:r.athleteName,points:r.officialPoints,id:r.athleteId,href:`#/athlete/${r.athleteId}`,country:r.nationalityNormalized}))
 const deadline=performance.now()+5000
 let state,lastError,stableSince=null
 while(performance.now()<deadline){
  try{
   state=await js(`(${seasonSnapshot.toString()})()`)
   assert.equal(state.series,series==='ironman'?'IRONMAN_PRO_SERIES':'T100')
   assert.equal(state.gender,gender)
   assert.equal(state.displayedYear,String(year));assert.equal(state.tableYear,String(year))
   assert.equal(state.picker.open,true);assert.equal(state.picker.selected,String(year))
   assert.equal(state.picker.active,`season-${year}`);assert.ok(Math.abs(state.picker.centerOffset)<2)
   assert.deepEqual(state.rows,rows)
   stableSince??=performance.now()
   if(performance.now()-stableSince>=100)return
  }catch(error){lastError=error.message;stableSince=null;if(cdpDiagnostics.length)break}
  await wait(50)
 }
 const diagnostic={requested:{series,year,gender},state,lastError,consoleErrors,runtimeErrors:errors,cdpDiagnostics}
 const file=`${output}/season-timeout-${Date.now()}`
 await fs.writeFile(file+'.json',JSON.stringify(diagnostic,null,2))
 try{const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(file+'.png',Buffer.from(shot.data,'base64'))}catch(error){diagnostic.screenshotError=error.message}
 throw Error('Season selection did not settle: '+JSON.stringify(diagnostic))
}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setTouchEmulationEnabled',{enabled:true})
 for(const [width,height] of [[320,700],[390,844],[440,956],[667,375],[844,390],[956,440],[1440,900]])for(const theme of ['dark','light']){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768})
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme},{name:'prefers-reduced-motion',value:'reduce'}]})
  await send('Page.navigate',{url:base+'/?rankings='+Date.now()+'#/rankings'});await wait(600)
  assert.equal(await js('document.querySelectorAll(".bottom-nav button").length'),5)
  assert.equal(await js('document.querySelector(".bottom-nav button[aria-current=page]").ariaLabel'),'Рейтинги')
  assert.deepEqual(await js('[...document.querySelectorAll(".bottom-nav button")].map(b=>b.ariaLabel)'),['Главная','Календарь','Профили атлетов','Рейтинги','Ещё'])
  for(const [si,s]of ['ironman','t100'].entries()){
   await click(`.standings-series button:nth-child(${si+1})`)
   for(const y of [2024,2025,2026]){
    await click('.standings-season')
    assert.equal(await js('document.querySelector("dialog").open'),true)
    assert.equal(await js('document.body.style.overflow'),'hidden')
    const selectedGender=await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender')
    await js(`document.querySelector('#season-${y}').click()`)
    await waitForSeason(s,y,selectedGender)
    assert.equal(await js('document.querySelector(".standings-season span").textContent'),String(y))
    await click('.standings-sheet header button');assert.equal(await js('Boolean(document.querySelector("dialog"))'),false)
    assert.equal(await js('document.activeElement.className'),'standings-season')
    for(const [gi,g]of ['men','women'].entries()){
     await click(`.standings-gender button:nth-child(${gi+1})`)
     const got=await js('[...document.querySelectorAll(".rankings-table-panel:not([inert]) .official-standings tbody tr")].map(r=>({rank:Number(r.cells[0].textContent),name:r.querySelector(".standings-name").firstChild.textContent,points:Number(r.cells[2].textContent.replace(/\\s/g,"")),id:Number(r.dataset.athleteId),href:r.querySelector("a").getAttribute("href")}))')
     assert.deepEqual(got,expected[`${s}-${y}-${g}`].rows.map(r=>({rank:r.officialRank,name:r.athleteName,points:r.officialPoints,id:r.athleteId,href:`#/athlete/${r.athleteId}`})))
     assertDocumentWidth(await js('({clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth})'))
     assert.equal(await js('document.querySelector(".official-standings").scrollWidth<=document.querySelector(".standings-swipe").clientWidth'),true)
    }
   }
   if(true){
    await js('scrollTo({top:0,behavior:"instant"});document.activeElement.blur()');await wait(80)
    const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width,height:await js('document.documentElement.scrollHeight'),scale:1}})
    await fs.writeFile(`${output}/${s}-${theme}-${width}x${height}.png`,Buffer.from(shot.data,'base64'))
   }
  }
  const bg=await js('getComputedStyle(document.querySelector(".rankings-table-panel:not([inert])")).backgroundColor')
  assert.equal(bg,'rgb(27, 31, 36)')
  for(const color of await js('[...document.querySelectorAll(".official-standings th,.standings-name,.official-standings tbody tr td:first-child")].map(e=>getComputedStyle(e).color)'))assert.ok(contrast(color,bg)>=4.5,`${theme} text contrast ${color}/${bg}`)
  assert.equal(await js('getComputedStyle(document.documentElement).colorScheme'),'dark')
  assert.ok(await js('[...document.querySelectorAll(".page-back-button,.standings-season")].every(e=>getComputedStyle(e).fontFamily===getComputedStyle(document.documentElement).fontFamily)'))
  // Keyboard wheel, confirmation, Escape, focus restoration, body unlock.

  await click('.standings-season');await key('Home');await wait(260);assert.equal(await js('document.querySelector("[role=option][aria-selected=true]").textContent'),'2024')
  await key('ArrowDown');await wait(260);await key('Enter');assert.equal(await js('document.querySelector(".standings-season span").textContent'),'2025')
  await click('.standings-season');await key('Escape');await wait(80);assert.equal(await js('Boolean(document.querySelector("dialog"))'),false);assert.notEqual(await js('document.body.style.overflow'),'hidden')
  // Native wheel scroll -> nearest year, only after settling.
  await click('.standings-season');await js('document.querySelector(".standings-wheel").scrollTop=96');await wait(280);await click('.standings-sheet header button')
  assert.equal(await js('document.querySelector(".standings-season span").textContent'),'2026')
  // Native touch/momentum inside wheel must not scroll the page or commit mid-drag.
  await js('scrollTo({top:0,behavior:"instant"})');await wait(80)
  const pageY=await js('scrollY')
  await click('.standings-season')
  const wb=await js('(()=>{const b=document.querySelector(".standings-wheel").getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+Math.min(90,b.height/2)}})()')
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[wb]})
  for(let i=1;i<=5;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:wb.x,y:wb.y+i*18}]});await wait(30)}
  assert.equal(await js('document.querySelector(".standings-season span").textContent'),'2026')
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(700)
  assert.notEqual(await js('document.querySelector(".standings-season span").textContent'),'2026')
  assert.equal(await js('scrollY'),pageY)
  if(width===390&&theme==='dark'){
   const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/season-wheel-390.png`,Buffer.from(shot.data,'base64'))
  }
  // Backdrop click closes the native modal; no global scroll lock remains.
  await send('Input.dispatchMouseEvent',{type:'mousePressed',x:2,y:2,button:'left',clickCount:1})
  await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:2,y:2,button:'left',clickCount:1});await wait(100)
  assert.equal(await js('Boolean(document.querySelector("dialog"))'),false)
  assert.notEqual(await js('document.body.style.overflow'),'hidden')
  // Region arrows, actual touch swipe, vertical scroll must not change category.
  await js('document.querySelector(".standings-swipe").focus()');await key('ArrowLeft');assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),'M')
  await js('scrollTo({top:0,behavior:"instant"})');await wait(80)
  await js('document.querySelector(".standings-swipe").scrollIntoView({block:"start",behavior:"instant"})');await wait(80)
  const box=await js('(()=>{const b=document.querySelector(".standings-swipe").getBoundingClientRect();return {x:b.left,y:b.top,w:b.width}})()')
  const gesture=async(dx,dy)=>{const x=box.x+box.w*.8,y=box.y+80;await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=5;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/5,y:y+dy*i/5}]});await wait(20)}await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(750)}
  await gesture(-box.w*.6,3);await js(`new Promise((resolve,reject)=>{const end=Date.now()+3000;const poll=()=>{if(document.querySelector('.rankings-table-panel:not([inert]) table').dataset.gender==='W')resolve(true);else if(Date.now()>end)reject(Error('Gender did not settle'));else setTimeout(poll,50)};poll()})`);assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),'W');assert.equal(await js('location.hash'),'#/rankings')
  await gesture(2,-80);assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),'W')
  await wait(550)
  // Profile click and Back preserve all three selectors.
  const selected=await js('JSON.stringify(history.state.triNavigation.ui.officialStandings)')
  const backStyle=()=>js('(()=>{const s=getComputedStyle(document.querySelector(".page-back-button"));return [s.padding,s.borderRadius,s.fontSize,s.lineHeight,s.top,s.right]})()')
  const rankingsBackStyle=await backStyle()
  await click('.rankings-table-panel:not([inert]) .official-standings tbody a');assert.match(await js('location.hash'),/^#\/athlete\/\d+$/)
  assert.deepEqual(await backStyle(),rankingsBackStyle)
  await click('.page-back-button');assert.equal(await js('location.hash'),'#/rankings');assert.equal(await js('JSON.stringify(history.state.triNavigation.ui.officialStandings)'),selected)
  // Failed photo keeps initials; no data rewrite.
  await js('document.querySelector(".standings-avatar img")?.dispatchEvent(new Event("error"))')
  assert.ok(await js('[...document.querySelectorAll(".standings-avatar > span")].every(e=>e.textContent.length>0)'))
  await js('scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(80)
  assert.ok(await js('document.querySelector(".standings-feedback").getBoundingClientRect().bottom<document.querySelector(".bottom-nav").getBoundingClientRect().top'))
  assert.equal(await js('document.querySelector(".feedback-entry").textContent'),'Сообщить об ошибке')
  assert.equal(await js('document.body.textContent.includes("Снимок принят")'),false)
  const beforeFeedback=await js('JSON.stringify(history.state.triNavigation.ui.officialStandings)')
  await click('.feedback-entry');assert.equal(await js('location.hash'),'#/feedback')
  assert.ok(await js('Boolean(document.querySelector(".feedback-page form"))'))
  // Open existing form only; never submit a report.
  await click('.page-back-button');assert.equal(await js('location.hash'),'#/rankings')
  assert.equal(await js('JSON.stringify(history.state.triNavigation.ui.officialStandings)'),beforeFeedback)
  // Series gestures are independent from gender and season.
  await js('scrollTo({top:0,behavior:"instant"})');await wait(80)
  await click('.standings-series button:first-child');await wait(400)
  const beforeSeries=await js('({series:document.querySelector("main").dataset.series,gender:document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender,season:document.querySelector(".rankings-table-panel:not([inert]) table").dataset.season})')
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width*.8,y:80}]})
  await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width*.2,y:82}]})
  await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  // Native touch snap plus the selection debounce can exceed 750ms at 1440px.
  // Wait for the actual destination and aligned slide, not a fixed animation duration.
  await js(`new Promise((resolve,reject)=>{
    const deadline=performance.now()+3000
    const poll=()=>{
      const track=document.querySelector('.standings-showcase .rankings-snap-track')
      const series=document.querySelector('main').dataset.series
      if(series==='T100' && Math.abs(track.scrollLeft-track.clientWidth)<2)return resolve(true)
      if(performance.now()>=deadline)return reject(Error('Series swipe did not settle: '+JSON.stringify({series,scrollLeft:track.scrollLeft,width:track.clientWidth})))
      setTimeout(poll,50)
    }
    poll()
  })`)
  assert.notEqual(await js('document.querySelector("main").dataset.series'),beforeSeries.series)
  assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.gender'),beforeSeries.gender)
  assert.equal(await js('document.querySelector(".rankings-table-panel:not([inert]) table").dataset.season'),beforeSeries.season)
  assert.deepEqual(await js('[...document.querySelectorAll(".rankings-table-panel:not([inert]) thead th")].map(e=>e.textContent)'),['#','ATHLETE','POINTS'])
  assert.equal(await js('document.querySelectorAll(".standings-name small").length'),0)
  assert.equal(await js('document.querySelectorAll(".rankings-table-panel:not([inert]) .standings-flag").length'),10)
  assert.ok(await js('[...document.querySelectorAll(".rankings-table-panel:not([inert]) .standings-flag")].every(e=>e.getBoundingClientRect().right<=e.closest("tr").cells[2].getBoundingClientRect().left)'))
  assert.ok(await js('(()=>{const r=document.querySelector(".standings-showcase").getBoundingClientRect();return r.left===0&&r.width===innerWidth&&r.top===0})()'))
  assert.ok(await js('document.querySelector(".page-back-button").getBoundingClientRect().height>=32'))
  console.log(`PASS ${width}px ${theme}: all 12 tables, exact values/links, wheel, touch/keyboard, history, layout, fallback`)
 }
 await send('Page.navigate',{url:base+'/?home='+Date.now()+'#/home'});await wait(350)
 await click('.features button:last-child');assert.equal(await js('location.hash'),'#/rankings');await click('.page-back-button');assert.equal(await js('location.hash'),'#/home')
 await click('.bottom-nav button[aria-label="Рейтинги"]');assert.equal(await js('location.hash'),'#/rankings')
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS home/bottom navigation, zero runtime exceptions')
}finally{socket.close()}
