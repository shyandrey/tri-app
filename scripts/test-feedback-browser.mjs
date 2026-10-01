import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[],reports=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(250)}
const input=async(selector,value)=>{await js(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(80)}
const start=async hash=>{await send('Page.navigate',{url:(process.env.TRI_APP_URL??'http://localhost:8787')+'/'+hash});await wait(700)}
const snapshot=()=>js('({route:history.state.triNavigation.route,ui:history.state.triNavigation.ui,y:scrollY})')
const backCheck=async before=>{await click('.page-back-button');const after=await snapshot();assert.deepEqual(after.route,before.route);assert.deepEqual(after.ui,before.ui);assert.ok(Math.abs(after.y-before.y)<=2,`scroll ${after.y} vs ${before.y}`)}
async function openReport(){await click('.feedback-entry');assert.equal(await js('history.state.triNavigation.route.page'),'feedback');assert.equal(await js('location.hash'),'#/feedback');assert.equal(await js('document.activeElement.tagName'),'H1')}
async function submit(label){
 await input('#feedback-description',`Локальный demo: ${label}. Проверка Feedback без реальной доставки.`)
 await input('#feedback-email','review@example.com')
 await click('.feedback-submit');await wait(400)
 assert.ok(await js(`document.querySelector('.feedback-success')?.textContent.includes('получили и сохранили')`))
 const id=await js(`document.querySelector('.feedback-success small').textContent.replace('Номер: ','')`);reports.push({label,id})
}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:390,height:700,deviceScaleFactor:1,mobile:true})
 await start('#/more');const more=await snapshot();await openReport();assert.equal(await js('document.querySelector(".feedback-context").textContent'),'Общий отзыв о 300W⚡')
 // Keyboard activates native submit and invalid input is associated/focused.
 await js('document.querySelector(".feedback-submit").focus()');await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(150)
 assert.equal(await js('document.activeElement.id'),'feedback-description');assert.equal(await js('document.querySelector("#feedback-description").getAttribute("aria-invalid")'),'true')
 await input('#feedback-description','Текст должен сохраниться при любой ошибке отправки.')
 await input('#feedback-email','review@example.com')
 // Simulate network/HTTP failures only; final attempt goes through local Worker/D1.
 await js(`window.realFetch=window.fetch;window.attempts=[];window.failureMode='server';window.fetch=async (...args)=>{if(args[0]==='/api/feedback'){window.attempts.push(JSON.parse(args[1].body));if(window.failureMode==='network')throw Error('offline');if(window.failureMode==='server')return new Response('{}',{status:503});if(window.failureMode==='delayed')await new Promise(r=>setTimeout(r,600))}return window.realFetch(...args)}`)
 for(const mode of ['server','network']){await js(`window.failureMode='${mode}'`);await click('.feedback-submit');assert.equal(await js('document.querySelector("#feedback-description").value'),'Текст должен сохраниться при любой ошибке отправки.');assert.equal(await js('document.querySelector("#feedback-email").value'),'review@example.com');assert.ok(await js('!!document.querySelector("[role=alert]")'))}
 await js("window.failureMode='delayed';document.querySelector('.feedback-submit').click()");await wait(70);assert.ok(await js('document.querySelector("fieldset").disabled'));assert.equal(await js('document.querySelector("form").getAttribute("aria-busy")'),'true');await wait(900)
 assert.ok(await js('!!document.querySelector(".feedback-success")'));assert.equal(await js('new Set(window.attempts.map(p=>p.requestId)).size'),1)
 reports.push({label:'More',id:await js('window.attempts[0].requestId')});assert.ok(!(await js('JSON.stringify(history.state)')).includes('Текст должен'))
 await backCheck(more);console.log('PASS More: keyboard, validation, sending, errors retain input, retry idempotency, success, Back')
 await start('#/athletes');await js(`[...document.querySelectorAll('.athletes-gender-card')].find(e=>e.textContent.includes('WOMEN')).click()`);await wait(100)
 await js(`[...document.querySelectorAll('.athletes-country-chip')].find(e=>e.textContent.includes('US')).click()`);await wait(100)
 await js('scrollTo({top:350,behavior:"instant"})');await wait(200);const list=await snapshot();await click('.athlete-card')
 await js(`[...document.querySelectorAll('.athlete-results-year__toggle')].find(e=>e.textContent.includes('2025'))?.click()`);await wait(100)
 await js('scrollTo({top:300,behavior:"instant"})');await wait(200);const athlete=await snapshot();await openReport()
 assert.equal(await js('history.state.triNavigation.route.feedback.athleteId'),Number(athlete.route.id));assert.ok((await js('document.querySelector(".feedback-context").textContent')).startsWith('Отчёт об атлете:'))
 await send('Page.captureScreenshot',{format:'png'}).then(s=>fs.writeFile('/tmp/tri-feedback-mobile.png',Buffer.from(s.data,'base64')))
 assert.equal(await js('document.documentElement.scrollWidth'),390)
 await submit('Athlete');await backCheck(athlete);await backCheck(list);console.log('PASS Athlete: context, expanded years, parent filters and scroll')
 await start('#/race/ironman-703-world-championship-2026')
 // Use actual current production ID discovered through catalog navigation if direct ID changes.
 if(await js('history.state.triNavigation.route.page')!=='race'){
  await start('#/athlete/1');await click('.athlete-result-card')
 }
 await js(`(()=>{const years=[...document.querySelectorAll('.race-season-switcher__year')];(years.find(e=>e.textContent==='2025')??years[years.length-1])?.click()})()`);await wait(200)
 await js(`[...document.querySelectorAll('.results-table__gender-tabs button')].find(e=>e.textContent==='WOMEN')?.click()`);await wait(200)
 await js(`[...document.querySelectorAll('.results-table__sort-tabs button')].find(e=>e.textContent==='Bike')?.click()`);await wait(100)
 await js('scrollTo({top:350,behavior:"instant"})');await wait(200);const race=await snapshot();await openReport()
 const context=await js('history.state.triNavigation.route.feedback');assert.equal(context.raceEditionId,race.ui.activeEditionId??race.route.id)
 assert.equal(context.gender,race.ui.activeGender??race.ui.resultGender??'M')
 assert.ok(context.raceName.includes('2025'));await submit('Race');await backCheck(race);console.log('PASS Race: actual changed edition/category, result sort and scroll')
 assert.deepEqual(errors,[]);await fs.writeFile('/tmp/tri-feedback-demo.json',JSON.stringify({reports,raceContext:context},null,2));console.log(JSON.stringify({reports,raceContext:context},null,2))
}finally{socket.close()}
