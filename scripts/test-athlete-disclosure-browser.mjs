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


const output='/tmp/tri-progressive-review';await fs.mkdir(output,{recursive:true})
const count=()=>js('document.querySelectorAll(".athlete-card").length')
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(220)}
const query=async value=>{await js(`(()=>{const e=document.querySelector('.athletes-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(200)}
const bottom=async()=>{await js('scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');await wait(200)}
const key=async(key,code,vk)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,windowsVirtualKeyCode:vk,text:key==='Enter'?'\r':' '});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,windowsVirtualKeyCode:vk});await wait(220)}
await send('Page.enable');await send('Runtime.enable')
try{
 for(const width of [390,440,844,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:width===844?390:844,deviceScaleFactor:1,mobile:width<768})
  await start('#/athletes');assert.equal(await count(),50)
  const total=await js('Number(document.querySelector(".athletes-presentation-count").textContent.split(" из ")[1])')
  const indicator=async n=>assert.equal(await js('document.querySelector(".athletes-presentation-count").textContent'),`Показаны ${n} из ${total}`)
  await indicator(50);await bottom();await shot(`${output}/initial-bottom-${width}.png`)
  if(width===390){const clip=await js('(()=>{const r=document.querySelector(".athletes-disclosure").getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:2}})()');const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await fs.writeFile(`${output}/control-closeup.png`,Buffer.from(result.data,'base64'))}
  await js('document.querySelector(".athletes-expand").focus({preventScroll:true})')
  const before=await js('scrollY'),historyLength=await js('history.length')
  await key('Enter','Enter',13);assert.equal(await count(),100);await indicator(100)
  assert.ok(Math.abs(await js('scrollY')-before)<2);assert.equal(await js('document.activeElement.className'),'athletes-expand')
  assert.equal(await js('history.length'),historyLength)
  await shot(`${output}/reveal-same-scroll-${width}.png`)
  await bottom();await shot(`${output}/expanded-bottom-${width}.png`)
  await key(' ','Space',32);assert.equal(await count(),150)
  await click('.athletes-expand');await click('.athletes-expand');assert.equal(await count(),250)
  await js('document.querySelectorAll(".athlete-card")[210].scrollIntoView({block:"center"})');await wait(200)
  const y=await js('scrollY'),names=await js('[...document.querySelectorAll(".athlete-card h3")].map(e=>e.textContent)')
  await click('.athlete-card:nth-child(211)');await click('.page-back-button')
  assert.equal(await count(),250);assert.ok(Math.abs(await js('scrollY')-y)<2)
  assert.deepEqual(await js('[...document.querySelectorAll(".athlete-card h3")].map(e=>e.textContent)'),names)
  // Every result set uses the same disclosure; filters remain selected during global search.
  const selectGender=async label=>{await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.querySelector('.athletes-gender-card__label').textContent==='${label}').click()`);await wait(220)}
  const selectCountry=async code=>{await js(`[...document.querySelectorAll('.athletes-country-chip')].find(e=>e.querySelector('.athletes-country-chip__code').textContent==='${code}').click()`);await wait(220)}
  const status=async()=>{const n=await count();const text=await js('document.querySelector(".athletes-presentation-count")?.textContent');assert.ok(text);const y=Number(text.split(' из ')[1]);assert.equal(text,`Показаны ${n} из ${y}`);assert.equal(await js('Boolean(document.querySelector(".athletes-expand"))'),n<y);return y}
  const screenshot=async name=>{await js('scrollTo({top:0,behavior:"instant"})');await wait(100);await shot(`${output}/${name}-${width}.png`)}
  await query('a');assert.equal(await count(),50);await status();await screenshot('search-many');await click('.athletes-expand');assert.equal(await count(),100)
  await query('');assert.equal(await count(),50);await screenshot('all-initial')
  assert.equal(await js('document.querySelectorAll(".athletes-gender-card__count,.athletes-country-chip__count").length'),0)
  for(const gender of ['MEN','WOMEN']){
   await selectGender(gender);assert.equal(await count(),50);const genderTotal=await status()
   await screenshot(`${gender.toLowerCase()}-initial`)
   await click('.athletes-expand');assert.equal(await count(),100);await status()
   await bottom();await shot(`${output}/${gender.toLowerCase()}-expanded-${width}.png`)
   // Preserve a filtered expansion plus list scroll across Profile → Back.
   await js('scrollTo({top:650,behavior:"instant"})');await wait(150)
   const saved=await js('history.state.triNavigation.ui'),filteredY=await js('scrollY')
   await click('.athlete-card');await click('.page-back-button')
   assert.deepEqual(await js('history.state.triNavigation.ui'),saved);assert.equal(await count(),100);assert.ok(Math.abs(await js('scrollY')-filteredY)<2)
   await selectCountry('FR');const combined=await status();assert.equal(await count(),Math.min(50,combined))
   if(combined>50){await click('.athletes-expand');assert.equal(await count(),Math.min(100,combined))}
   await selectCountry('ALL');assert.equal(await count(),50);assert.equal(await status(),genderTotal)
  }
  await selectGender('ALL');await selectCountry('FR');assert.equal(await count(),50);const countryTotal=await status();assert.ok(countryTotal>50)
  await screenshot('country');await click('.athletes-expand');assert.equal(await count(),Math.min(100,countryTotal))
  await selectCountry('LV');const small=await status();assert.ok(small<=50);assert.equal(await count(),small);await screenshot('small-final')
  await query('a');assert.equal(await count(),50);await click('.athletes-expand');assert.equal(await count(),100)
  await js('scrollTo({top:650,behavior:"instant"})');await wait(150)
  const searchState=await js('history.state.triNavigation.ui'),searchY=await js('scrollY')
  await click('.athlete-card');await click('.page-back-button');assert.deepEqual(await js('history.state.triNavigation.ui'),searchState);assert.equal(await count(),100);assert.ok(Math.abs(await js('scrollY')-searchY)<2)
  await query('Blummenfelt');assert.ok(await count()<=50);await status()
  await query('zzzz-no-athlete');assert.equal(await count(),0);assert.equal(await js('Boolean(document.querySelector(".athletes-presentation-count"))'),false)
  await query('');assert.equal(await count(),small);await selectCountry('ALL');assert.equal(await count(),50)
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await bottom();await js('document.querySelector(".athletes-expand").focus({preventScroll:true})')
  assert.equal(await js('getComputedStyle(document.activeElement).outlineStyle'),'solid')
  assert.ok(await js('document.activeElement.getBoundingClientRect().height>=44'))
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32,text:' '});await wait(180)
  assert.equal(await js('getComputedStyle(document.querySelector(".athletes-expand__chevron")).transitionDuration'),'0s')
  assert.equal(await js('getComputedStyle(document.querySelector(".athletes-expand__chevron")).transform'),'none')
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});await wait(200)
  await send('Emulation.setEmulatedMedia',{features:[]})
  while(await count()+50<total)await click('.athletes-expand')
  const previous=await count();assert.ok(total-previous>0&&total-previous<=50)
  await bottom();await js('document.querySelector(".athletes-expand").focus({preventScroll:true})');const finalY=await js('scrollY')
  await key('Enter','Enter',13);assert.equal(await count(),total);await indicator(total)
  assert.equal(await js('Boolean(document.querySelector(".athletes-expand"))'),false)
  assert.equal(await js('document.activeElement.className'),'athletes-presentation-count')
  assert.ok(Math.abs(await js('scrollY')-finalY)<2)
  const tail=await js('document.querySelector(".athlete-card:last-child .athlete-card__name-en").textContent')
  await query(tail);assert.ok(await count()>0);assert.ok((await js('document.querySelector(".athletes-list").textContent')).includes(tail))
  await query('');assert.equal(await count(),50)
  assert.equal(await js('document.documentElement.scrollWidth'),width)
  console.log(`PASS ${width}: 50→100→150→250→${total}, last batch ${total-previous}, full search/filters, reset, Back order/scroll, keyboard/focus, reduced motion`)
 }
 assert.deepEqual(errors,[])
}finally{socket.close()}
