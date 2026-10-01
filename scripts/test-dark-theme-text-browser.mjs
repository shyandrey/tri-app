import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const cdp = process.env.TRI_CDP_URL ?? 'http://127.0.0.1:9231'
// Isolate history and request fixtures from other browser suites.
const target = await (await fetch(cdp + '/json/new?about:blank', { method: 'PUT' })).json()
const socket = new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r);
let seq=0;const pending=new Map();const errors=[];
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)};
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value};
const start=async(hash='#/home')=>{await send('Page.navigate',{url:(process.env.TRI_APP_URL??'http://127.0.0.1:5190')+'/?check='+Date.now()+hash});await wait(650)};
const shot=async path=>{const s=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await fs.writeFile(path,Buffer.from(s.data,'base64'))};

// --audit records pre-fix failures without suppressing them in normal regression runs.
const audit = process.argv.includes('--audit')
const output = process.env.TRI_TEXT_EVIDENCE_DIR ?? '/tmp/tri-dark-theme-text'
await fs.mkdir(output, { recursive: true })
const reports = [], failures = []
const check = (condition, message) => { if (!condition) failures.push(message) }
// Alpha-composite ancestor backgrounds and foreground text. Image-backed showcase
// headings are checked for scheme stability, not a misleading solid-color contrast.
function inspectText() {
 const parse = value => { const n = value.match(/[\d.]+/g).map(Number); return [...n.slice(0,3), n[3] ?? 1] }
 const over = (fg,bg) => [...fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3])),1]
 const luminance = c => c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
 const selectors = 'h1,h2,h3,h4,h5,h6,label,.feature-card__title,.calendar-time-filters button,.series-filter__label,.calendar-archive__toggle,.athletes-gender-card__label,.athletes-gender-card__count,.athletes-country-chip__code,.athletes-country-chip__count,.athlete-card__name-en,.athlete-card__info p,.athletes-presentation-count,.athletes-expand,.athlete-detail__section-toggle,.athlete-results-year__label,.athlete-detail__meta,.athlete-detail__facts,.results-table__desktop th,.results-table__mobile-head,.results-table__gender-tabs button,.results-table__sort-tabs button,.more-panel p,.more-panel small,.feedback-context,.feedback-privacy,.feedback-page small,.feedback-page [role=alert],.feedback-page [role=status],.feedback-page [id$="-error"],.feedback-success p,.bottom-nav button,.latest-news__title'
 return [...document.querySelectorAll(selectors)].filter(e=>e.getClientRects().length && getComputedStyle(e).visibility!=='hidden' && e.textContent.trim() && !e.closest('.feedback-honeypot')).map(e=>{
  const s=getComputedStyle(e), chain=[];for(let p=e;p;p=p.parentElement)chain.unshift(p)
  let bg=[15,17,21,1],opacity=1;for(const p of chain){const style=getComputedStyle(p);bg=over(parse(style.backgroundColor),bg);opacity*=Number(style.opacity)}
  const color=parse(s.color);color[3]*=opacity;const fg=over(color,bg),a=luminance(fg),b=luminance(bg)
  const disabled=!!e.closest(':disabled,[aria-disabled="true"],.feature-card--disabled,.series-filter--disabled,.settings-row--disabled')
  const image=!!e.closest('.showcase-card')
  const heading=/^H[1-6]$/.test(e.tagName), large=parseFloat(s.fontSize)>=24 || (parseFloat(s.fontSize)>=18.66 && Number(s.fontWeight)>=700)
  return {selector:e.id?'#'+e.id:e.tagName.toLowerCase()+'.'+e.className,text:e.textContent.trim().slice(0,90),color:s.color,fill:s.webkitTextFillColor,background:bg.slice(0,3),contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),threshold:heading?(large?3:4.5):4.5,heading,disabled,image}
 })
}
async function capture(page, mode, width, anchor) {
 if(anchor)await js(`document.querySelector(${JSON.stringify(anchor)}).scrollIntoView({block:'center',behavior:'instant'})`)
 await wait(180)
 const items=await js(`(${inspectText.toString()})()`)
 assert.ok(items.some(i=>i.heading),page+' missing headings')
 const info=await js(`({scheme:getComputedStyle(document.documentElement).colorScheme,preference:matchMedia('(prefers-color-scheme: light)').matches?'light':'dark',supports:CSS.supports('color','var(--tri-text)'),headingToken:getComputedStyle(document.documentElement).getPropertyValue('--tri-text-heading').trim()})`)
 check(info.preference===mode, 'media emulation failed')
 check(info.supports, 'CSS variable colors unsupported')
 check(info.scheme==='dark', `${page}/${width}/${mode}: uncontrolled color-scheme ${info.scheme}`)
 for(const item of items) {
  if(item.heading && !item.disabled && !item.image)check(item.contrast>=item.threshold,`${page}/${width}/${mode}: ${item.text} contrast ${item.contrast.toFixed(2)}`)
  // Primary body text and form labels must also meet normal-text contrast.
  if(!item.disabled && /^(label|p\.feedback|p\.more|span\.latest-news__title)/.test(item.selector))check(item.contrast>=4.5,`${page}/${mode}: ${item.selector} contrast ${item.contrast.toFixed(2)}`)
 }
 const previous=reports.find(r=>r.page===page&&r.width===width)
 if(previous)check(JSON.stringify(previous.items.map(i=>[i.selector,i.color,i.fill]))===JSON.stringify(items.map(i=>[i.selector,i.color,i.fill])),`${page}/${width}: text colors depend on OS preference`)
 reports.push({page,mode,width,...info,items})
 if(width===390)await shot(`${output}/${page}-${mode}-390.png`)
}
await send('Page.enable');await send('Runtime.enable')
// Local browser fixtures only; never send feedback or modify News/backend data.
const fixture = await send('Page.addScriptToEvaluateOnNewDocument',{source:`{
 const original=window.fetch;
 window.fetch=async (url,options)=>{
  if(url==='/api/feedback/config')return new Response(JSON.stringify({mode:'local'}),{status:200});
  if(url==='/api/feedback'){
   await new Promise(r=>setTimeout(r,300));
   if(!window.testFeedbackSuccess)return new Response('{}',{status:503});
   return new Response(JSON.stringify({ok:true,reportId:JSON.parse(options.body).requestId}),{status:201});
  }
  return original(url,options);
 };
}`})
try {
 for(const width of [390,1440])for(const mode of ['light','dark']) {
  await send('Emulation.setDeviceMetricsOverride',{width,height:width===390?844:900,deviceScaleFactor:1,mobile:width===390})
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:mode}]})
  await start('#/home');await capture('home',mode,width,'.latest-news')
  await js('document.querySelector(".home-header__settings").click()');await capture('settings',mode,width)
  await start('#/calendar');await capture('calendar',mode,width)
  await start('#/athletes');await capture('athletes',mode,width)
  await capture('athletes-bottom',mode,width,'.athletes-expand')
  await js('document.querySelector(".athlete-card").click()');await wait(250)
  assert.ok(await js('!!document.querySelector(".athlete-detail__results h2")'))
  await capture('profile',mode,width,'.athlete-detail__results h2')
  await js('document.querySelector(".athlete-result-card").click()');await wait(250)
  assert.ok(await js('!!document.querySelector(".results-table h2")'))
  await capture('race',mode,width,'.results-table')
  await start('#/more');await capture('more',mode,width)
  await js('document.querySelector(".feedback-entry").click()');await wait(250);await capture('feedback',mode,width)
  await js('document.querySelector(".feedback-submit").click()');await wait(100)
  assert.ok(await js('!!document.querySelector("#feedback-description-error").textContent'))
  await capture('feedback-validation',mode,width)
  await js(`(()=>{const e=document.querySelector('#feedback-description');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(e,'Browser-only theme regression fixture');e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(100)
  await js('document.querySelector(".feedback-submit").click()');await wait(80);await capture('feedback-sending',mode,width)
  await wait(350);assert.ok(await js('!!document.querySelector("[role=alert]")'));await capture('feedback-error',mode,width)
  await js('window.testFeedbackSuccess=true;document.querySelector(".feedback-submit").click()');await wait(450)
  assert.ok(await js('!!document.querySelector(".feedback-success h2")'));await capture('feedback-success',mode,width)
  console.log(`AUDIT ${width} ${mode}: all pages and Feedback states measured`)
 }
 await fs.writeFile(`${output}/measurements.json`,JSON.stringify({browser:await send('Browser.getVersion'),reports,failures},null,2))
 assert.deepEqual(errors,[])
 if(!audit)assert.deepEqual(failures,[])
 console.log(`${audit?'AUDIT':'PASS'}: ${reports.length} page/state samples; ${failures.length} failures; evidence: ${output}`)
 if(audit)console.log(failures.join('\n'))
} finally {
 await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fixture.identifier})
 await send('Emulation.setEmulatedMedia',{features:[]})
 socket.close()
 await fetch(cdp + '/json/close/' + target.id)
}
