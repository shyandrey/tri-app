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
await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:400,deviceScaleFactor:1,mobile:true})
await start('#/athletes')
await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.textContent.includes('WOMEN')).click()`);await wait(200)
await js(`[...document.querySelectorAll('.athletes-country-chip')].find(e=>e.querySelector('.athletes-country-chip__code').textContent==='FR').click()`);await wait(200)
const names=()=>js(`[...document.querySelectorAll('.athlete-card__name-en')].map(e=>e.textContent)`)
const filtered=await names();assert.ok(filtered.length>0)
const query=async value=>{await js(`(()=>{const input=document.querySelector('.athletes-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(250)}
await query('Blummenfelt');assert.deepEqual(await names(),['Kristian Blummenfelt'])
const y=await scroll(160);assert.ok(y>0)
await click('.athlete-card');assert.equal(await page(),'athlete');await click('.page-back-button');assert.equal(await page(),'athletes');await position(y)
assert.equal(await js(`document.querySelector('.athletes-search').value`),'Blummenfelt')
assert.ok((await js(`document.querySelector('.athletes-gender-card.is-active').textContent`)).includes('WOMEN'))
assert.equal(await js(`document.querySelector('.athletes-country-chip.is-active .athletes-country-chip__code').textContent`),'FR')
assert.deepEqual(await names(),['Kristian Blummenfelt'])
await click('.calendar-search-clear');assert.deepEqual(await names(),filtered)
await query('   ');assert.deepEqual(await names(),filtered)
await query('');await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.querySelector('.athletes-gender-card__label').textContent==='MEN').click()`);await wait(200)
await js(`[...document.querySelectorAll('.athletes-country-chip')].find(e=>e.querySelector('.athletes-country-chip__code').textContent==='DE').click()`);await wait(200)
await query('Flora Duffy');assert.deepEqual(await names(),['Flora Duffy'])
assert.deepEqual(errors,[])
await fs.writeFile('/tmp/tri-global-search-browser-results.json',JSON.stringify({passed:true,scrollRestored:y,errors},null,2))
console.log('PASS global search, selected filters, profile Back + scroll, clear, whitespace and Flora Duffy');socket.close()
