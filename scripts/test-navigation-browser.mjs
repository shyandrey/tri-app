import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms)),targets=await(await fetch((process.env.TRI_CDP_URL ?? 'http://127.0.0.1:9231')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text+': '+d.params.exceptionDetails.exception?.description)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const click=async selector=>{assert.ok(await js(`Boolean(document.querySelector(${JSON.stringify(selector)}))`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(300)}
const page=()=>js('history.state.triNavigation.route.page')
const scroll=async y=>{await js(`window.scrollTo({top:${y},behavior:'instant'})`);await wait(250);return js('scrollY')}
const position=async expected=>{assert.ok(Math.abs((await js('scrollY'))-expected)<=2,`scroll expected ${expected}, actual ${await js('scrollY')}`)}
const start=async hash=>{await send('Page.navigate',{url:(process.env.TRI_APP_URL ?? 'http://127.0.0.1:5190')+'/?check='+Date.now()+hash});await wait(1000)}
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:700,deviceScaleFactor:1,mobile:true})
await start('#/athletes');assert.equal(await page(),'athletes')
const listY=await scroll(1200);await click('.athlete-card');assert.equal(await page(),'athlete');await click('.page-back-button');assert.equal(await page(),'athletes');await position(listY);console.log('PASS A: list scroll')
await js(`(()=>{const input=document.querySelector('.athletes-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'a');input.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(200)
await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.textContent.includes('WOMEN')).click()`);await wait(200)
await js(`[...document.querySelectorAll('.athletes-country-chip')].find(e=>e.textContent.includes('US')).click()`);await wait(200)
const filterY=await scroll(430);await click('.athlete-card');const athleteURL=await js('location.hash')
await js(`[...document.querySelectorAll('.athlete-results-year__toggle')].find(e=>e.textContent.includes('2025'))?.click()`);await wait(200)
const years=await js(`[...document.querySelectorAll('.athlete-results-year__toggle')].map(e=>[e.textContent,e.getAttribute('aria-expanded')])`)
const profileY=await scroll(280);await click('.athlete-result-card');assert.equal(await page(),'race');const raceURL=await js('location.hash')
await click('.page-back-button');assert.equal(await js('location.hash'),athleteURL);assert.deepEqual(await js(`[...document.querySelectorAll('.athlete-results-year__toggle')].map(e=>[e.textContent,e.getAttribute('aria-expanded')])`),years);await position(profileY)
await click('.page-back-button');assert.equal(await page(),'athletes');await position(filterY);assert.equal(await js(`document.querySelector('.athletes-search').value`),'a');assert.ok((await js(`document.querySelector('.athletes-gender-card.is-active').textContent`)).includes('WOMEN'));assert.ok((await js(`document.querySelector('.athletes-country-chip.is-active').textContent`)).includes('US'));console.log('PASS B/C/D: filters, expanded years, nested Back, scroll')
await js('history.forward()');await wait(350);assert.equal(await page(),'athlete');await js('history.forward()');await wait(350);assert.equal(await page(),'race');await js('history.back()');await wait(350);await position(profileY);await js('history.back()');await wait(350);await position(filterY);console.log('PASS H: browser Back/Forward')
await start('#/calendar');await js(`[...document.querySelectorAll('button')].find(e=>e.textContent==='Прошедшие').click()`);await wait(250)
console.log('calendar toggles',await js(`[...document.querySelectorAll('button[aria-expanded]')].map(e=>e.textContent)`))
await js(`document.querySelector('button[aria-expanded="false"]')?.click()`);await wait(250)
const calendarState=await js('history.state.triNavigation.ui.calendar'),calY=await scroll(650)
await click('.race-card');assert.equal(await page(),'race');await click('.page-back-button');assert.equal(await page(),'calendar');assert.deepEqual(await js('history.state.triNavigation.ui.calendar'),calendarState);await position(calY);console.log('PASS E: calendar archive/filter/scroll')
await start('#/home');const homeY=await scroll(320);await click('.home-races-section .race-card');assert.equal(await page(),'race');await js('history.back()');await wait(350);assert.equal(await page(),'home');await position(homeY);console.log('PASS F: home scroll and browser Back')
await start(raceURL);const count=await js('history.length');await send('Page.reload');await wait(900);assert.equal(await page(),'race');assert.equal(await js('history.length'),count);await click('.page-back-button');assert.equal(await page(),'calendar');console.log('PASS G: direct race and refresh fallback')
await start('#/top');await click('.top-athlete-card');assert.equal(await page(),'athlete');await click('.page-back-button');assert.equal(await page(),'top');console.log('PASS ranking origin')
await start(raceURL);await js(`[...document.querySelectorAll('.results-table__sort-tabs button')].find(e=>e.textContent==='Bike').click()`);await wait(200)
const raceY=await scroll(400);await click('.results-table__mobile-row.is-clickable');assert.equal(await page(),'athlete');await click('.page-back-button');assert.equal(await page(),'race');await position(raceY);assert.equal(await js(`document.querySelector('.results-table__sort-tabs .is-active').textContent`),'Bike');console.log('PASS race results sort and scroll')
await send('Page.captureScreenshot',{format:'png'}).then(s=>fs.writeFile('/tmp/tri-navigation-race.png',Buffer.from(s.data,'base64')))
assert.deepEqual(errors,[])
await fs.writeFile('/tmp/tri-nav-browser-results.json',JSON.stringify({passed:['A','B','C','D','E','F','G','H'],errors,profileY,filterY,listY,calY,homeY},null,2));socket.close()
