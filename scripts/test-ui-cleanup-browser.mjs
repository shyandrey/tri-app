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
const sizes=[[320,800],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[844,390]];
const metrics=()=>js(`Object.fromEntries(['.home-header','.home-showcase__track','.showcase-card','.home-races-section .race-card','.features','.latest-news','.bottom-nav'].map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return [s,r?{left:r.left,right:r.right,width:r.width}:null]}))`);
await send('Page.enable');await send('Runtime.enable');

const output=process.env.TRI_UI_EVIDENCE_DIR??'/tmp/tri-ui-cleanup'
await fs.mkdir(output,{recursive:true})
const evidence=[]
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(250)}
const bounds=selectors=>js(`Object.fromEntries(${JSON.stringify(selectors)}.map(s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return [s,r?{left:r.left,right:r.right,width:r.width}:null]}))`)
const align=(rects,width)=>{
 const gutter=width<=640?12:20,left=Math.max(0,(width-1126)/2)+gutter,right=width-left
 for(const [selector,r] of Object.entries(rects)){assert.ok(r,selector);assert.ok(Math.abs(r.left-left)<1&&Math.abs(r.right-right)<1,`${selector}: ${JSON.stringify(r)}, expected ${left}..${right}`)}
}
try {
 for(const [width,height] of sizes){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768})
  await start()
  const home=await metrics();align(home,width)
  await js('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(150)
  const spacing=await js(`(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect(),showcase=rect('.home-showcase'),races=rect('.home-races-section'),lastRace=rect('.home-races-section .race-card:last-child'),shortcuts=rect('.features'),news=rect('.latest-news'),nav=rect('.bottom-nav');
   return {showcaseToRaces:races.top-showcase.bottom,raceToShortcuts:shortcuts.top-lastRace.bottom,shortcutsToNews:news.top-shortcuts.bottom,newsToNavigation:nav.top-news.bottom,bottomSpace:innerHeight-news.bottom,navHeight:nav.height,navBottom:innerHeight-nav.bottom}
  })()`)
  for(const key of ['showcaseToRaces','raceToShortcuts','shortcutsToNews','newsToNavigation'])assert.ok(Math.abs(spacing[key]-24)<1,`${width} ${key}: ${spacing[key]}`)
  if([390,844].includes(width)){
   await shot(`${output}/home-bottom-${width}.png`)
   if(width===844){await js('document.querySelector(".home-races-section .race-card:last-child").scrollIntoView({block:"start"})');await wait(150);await shot(`${output}/home-transition-${width}.png`)}
  }
  await js('window.scrollTo({top:0,behavior:"instant"})')

  assert.equal(await js('document.documentElement.scrollWidth'),width)
  assert.equal(await js('document.querySelectorAll(".features > *").length'),3)
  assert.equal(await js('document.querySelectorAll(".features button").length'),2)
  assert.equal(await js('document.querySelector(".features").scrollWidth'),await js('document.querySelector(".features").clientWidth'))
  assert.equal(await js('document.querySelectorAll(".bottom-nav button").length'),4)
  assert.equal(await js('document.querySelector(".home-races-section__header button").textContent.trim()'),'Все')
  assert.ok(await js('Boolean(document.querySelector(".home-races-section__header button svg"))'))
  assert.ok(await js('Math.abs(document.querySelector(".home-races-section__chevron").getBoundingClientRect().right-document.querySelector(".race-card__arrow").getBoundingClientRect().right)<1'))
  assert.equal(await js('document.querySelector(".latest-news__channel").href'),'https://t.me/trista_watt')
  assert.ok(await js('Boolean(document.querySelector(".latest-news__channel svg"))'))
  assert.ok(!(await js('document.querySelector(".latest-news").textContent')).includes('Все новости в Telegram'))
  if(width===390){
   await js('document.querySelectorAll(".features button")[1].focus()')
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9})
   assert.equal(await js('document.activeElement.className'),'latest-news__channel')
   assert.equal(await js('getComputedStyle(document.activeElement).outlineStyle'),'solid')
   await js('window.channelActivated=false;document.activeElement.addEventListener("click",e=>{e.preventDefault();window.channelActivated=true},{once:true})')
   await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13})
   assert.equal(await js('window.channelActivated'),true)
   await js('document.activeElement.blur();window.scrollTo({top:0,behavior:"instant"})')
  }
  const before=await js('location.hash')
  await click('.feature-card--disabled')
  await js('document.querySelector(".feature-card--disabled").dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))')
  assert.equal(await js('location.hash'),before)
  assert.ok(await js('document.querySelector(".feature-card--disabled").tabIndex<0&&document.querySelector(".feature-card--disabled").getAttribute("aria-disabled")==="true"'))
  if([390,844,1440].includes(width)){
   await shot(`${output}/home-${width}.png`)
   await js('document.querySelector(".latest-news").scrollIntoView({block:"center"})');await wait(150)
   await shot(`${output}/home-news-${width}.png`)
  }
  await js('window.scrollTo({top:250,behavior:"instant"})');await wait(150)
  const homeY=await js('scrollY')
  for(const [index,page] of [[0,'calendar'],[1,'athletes']]){
   await js(`document.querySelectorAll('.features button')[${index}].click()`);await wait(250)
   assert.equal(await js('history.state.triNavigation.route.page'),page)
   if(page==='calendar'){align(await bounds(['.app > .section','.calendar-search','.calendar-time-filters','.race-card','.bottom-nav']),width);assert.equal(await js('document.documentElement.scrollWidth'),width)}
   await click('.page-back-button');assert.equal(await js('location.hash'),'#/home')
   assert.ok(Math.abs(await js('scrollY')-homeY)<2)
  }
  await start('#/athletes')
  const athletes=await bounds(['.athletes-page','.athletes-search','.athletes-gender-filter','.athletes-country-chip','.athletes-list','.athlete-card','.bottom-nav']);const {['.athletes-country-chip']:countryChip,...athleteFrames}=athletes;align(athleteFrames,width);assert.ok(Math.abs(countryChip.left-athleteFrames['.athletes-page'].left)<=2) // Existing country scroller has a 2px overflow inset.
  assert.equal(await js('document.querySelectorAll(".athlete-card").length'),50)
  const counts=await js('[...document.querySelectorAll(".athletes-gender-card__count,.athletes-country-chip__count")].map(e=>e.textContent)')
  assert.deepEqual(counts,[])
  assert.equal(await js('document.querySelector(".athletes-presentation-count").textContent'),'Показаны 50 из 1167')
  if(width===390)await shot(`${output}/athletes-390.png`)
  await click('.athlete-card')
  const profile=await bounds(['.athlete-detail-page','.athlete-detail__results','.bottom-nav']);align(profile,width)
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  await js('document.querySelectorAll(".athlete-results-year__toggle[aria-expanded=true]").forEach(e=>e.click())');await wait(200)
  assert.ok(await js('getComputedStyle(document.querySelector(".athlete-results-year__label")).fontSize==="15px"'))
  if(width===390){await js('document.querySelector(".athlete-detail__results").scrollIntoView({block:"center"})');await wait(150);await shot(`${output}/profile-year-collapsed.png`)}

  const yearGroups=await js(`[...document.querySelectorAll('.athlete-results-year__toggle')].map(e=>{const row=e.getBoundingClientRect(),year=e.querySelector('.athlete-results-year__label').getBoundingClientRect(),chevron=e.querySelector('.athlete-results-year__chevron').getBoundingClientRect();return {right:chevron.right,gap:chevron.left-year.right,height:row.height,width:row.width}})`)
  for(const row of yearGroups){assert.equal(row.right,yearGroups[0].right);assert.equal(row.gap,8);assert.ok(row.height>=44);assert.ok(row.width>250)}
  // Stress the available left column without introducing new product text or data.
  for(const text of ['История','История результатов на длинных и средних дистанциях за сезон']){
   assert.ok(await js(`(()=>{const row=document.querySelector('.athlete-results-year__toggle'),left=document.createElement('span');left.textContent=${JSON.stringify(text)};row.prepend(left);const a=left.getBoundingClientRect(),b=row.querySelector('.athlete-results-year__label').getBoundingClientRect(),ok=a.right+8<=b.left&&row.scrollWidth<=row.clientWidth;left.remove();return ok})()`))
  }
  if(width===390){
   await js('document.querySelector(".athlete-results-year__toggle").focus()')
   for(const [key,code,vk] of [['Enter','Enter',13],[' ','Space',32]]){
    await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,text:key==='Enter'?'\r':' ',windowsVirtualKeyCode:vk})
    await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk});await wait(200)
    assert.equal(await js('document.querySelector(".athlete-results-year__toggle").getAttribute("aria-expanded")'),key==='Enter'?'true':'false')
   }
   // A pointer tap at the empty left edge must still toggle the entire row.
   const point=await js('(()=>{const r=document.querySelector(".athlete-results-year__toggle").getBoundingClientRect();return {x:r.left+10,y:r.top+15}})()')
   for(const expanded of ['true','false']){
    await send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});await wait(150)
    assert.equal(await js('document.querySelector(".athlete-results-year__toggle").getAttribute("aria-expanded")'),expanded)
   }
   await js('document.activeElement.blur()')
  }
  await click('.athlete-results-year__toggle')
  assert.equal(await js('document.querySelector(".athlete-results-year__toggle").getAttribute("aria-expanded")'),'true')
  if(width===390)await shot(`${output}/profile-year-expanded.png`)
  await click('.athlete-result-card')
  assert.equal(await js('history.state.triNavigation.route.page'),'race')
  await start('#/race/ironman-texas-2026')
  const frame=width<=700&&height>width?'.results-table__mobile':'.results-table__desktop-wrap'
  const race=await bounds(['.race-detail-page','.results-table',frame,'.bottom-nav']);align(race,width)
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  for(const selector of [frame,'.results-table__gender-tabs'])assert.equal(await js(`getComputedStyle(document.querySelector('${selector}')).backgroundColor`),'rgb(27, 31, 36)')
  if([390,1440].includes(width))await shot(`${output}/race-${width}.png`)
  await start('#/more')
  const more=await bounds(['.more-content','.more-block','.bottom-nav']);align(more,width)
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  if(width===390)await shot(`${output}/more-390.png`)
  evidence.push({width,height,spacing,yearGroups,home,athletes,profile,race,more,counts})
  console.log(`PASS ${width}x${height}: common outer grid, Home shortcuts/Back/News/action, catalog, profile years, race surfaces, More, no overflow`)
 }
 assert.deepEqual(errors,[])
 await fs.writeFile(`${output}/alignment.json`,JSON.stringify(evidence,null,2))
} finally {socket.close()}
