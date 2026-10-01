import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const wait=ms=>new Promise(r=>setTimeout(r,ms))
const targets=await(await fetch((process.env.TRI_CDP_URL??'http://127.0.0.1:9232')+'/json/list')).json()
const socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl)
await new Promise(r=>socket.onopen=r)
let seq=0;const pending=new Map(),errors=[]
socket.onmessage=e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p.reject(Error(JSON.stringify(d.error))):p.resolve(d.result)}else if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails)}
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))})
const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description);return r.result.value}
const click=async selector=>{await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(250)}
const input=async(selector,value)=>{await js(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}))})()`);await wait(80)}
const start=async hash=>{await send('Page.navigate',{url:(process.env.TRI_APP_URL??'http://localhost:8787')+'/?feedback-ux='+Date.now()+hash});await wait(700)}
// Controlled Turnstile callbacks exercise our UI contract, not real Cloudflare verification.
// Every Feedback/config request is intercepted; never run against a remote deployment.
const base = process.env.TRI_APP_URL ?? 'http://localhost:8787'
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname))
const fixture = `
const nativeTimeout=window.setTimeout;
window.setTimeout=(fn,ms,...args)=>{const id=nativeTimeout(fn,ms,...args);if(ms===90000)window.expireWait=()=>{clearTimeout(id);fn(...args)};return id};
window.feedbackPosts=[]; window.feedbackReply='success'; window.widgetOptions=[];
window.turnstile={render(el,options){window.widgetOptions.push(options);window.challenge=options;el.textContent='Проверка Cloudflare — тестовый виджет';return String(window.widgetOptions.length)},remove(){}};
const originalFetch=window.fetch;
window.fetch=async (url,options)=>{
 if(url==='/api/feedback/config')return Response.json({mode:'protected',siteKey:'browser-fixture'});
 if(url==='/api/feedback'){
  const payload=JSON.parse(options.body);window.feedbackPosts.push(payload);
  return new Promise(resolve=>{window.finishPost=()=>resolve(window.feedbackReply==='success'?Response.json({ok:true,reportId:payload.requestId},{status:201}):Response.json({error:{code:window.feedbackReply}},{status:window.feedbackReply==='CHALLENGE'?400:503}))});
 }
 return originalFetch(url,options);
};`
const label=()=>js('document.querySelector(".feedback-submit")?.textContent')
async function open(){await start('#/more');await click('.feedback-entry');await input('#feedback-description','Проверка UX без реальной отправки.');await input('#feedback-email','review@example.com')}
async function shot(width,name){await js('(document.querySelector(".feedback-submit")??document.querySelector(".feedback-success")).scrollIntoView({block:"end"})');await wait(100);const s=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`/tmp/feedback-ux-${width}-${name}.png`,Buffer.from(s.data,'base64'))}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:fixture});
 for(const width of [390,440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await open();assert.equal(await label(),'Отправить');
  await js('document.querySelector(".feedback-submit").focus()');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await wait(100);
  assert.equal(await label(),'Проверяем…');
  await js('document.querySelector(".feedback-submit").click();document.querySelector("form").requestSubmit();window.challenge["before-interactive-callback"]()');await wait(100);
  assert.equal(await js('window.feedbackPosts.length'),0);
  assert.ok(await js('document.querySelector(".feedback-submit").disabled'));
  assert.ok(await js('document.querySelector(".feedback-page form > div").closest("fieldset")===null'));
  assert.ok(await js('document.querySelector("form [role=status]").textContent.includes("Завершите")'));
  await shot(width,'verifying');
  await js('window.challenge.callback("fresh-token")');await wait(100);
  assert.equal(await label(),'Отправляем…');assert.equal(await js('window.feedbackPosts.length'),1);
  await js('window.challenge.callback("fresh-token");document.querySelector("form").requestSubmit()');await wait(100);
  assert.equal(await js('window.feedbackPosts.length'),1);await shot(width,'sending');
  await js('window.finishPost()');await wait(100);assert.ok(await js('!!document.querySelector(".feedback-success")'));
  assert.ok(await js('document.querySelector(".feedback-success small").textContent.includes(window.feedbackPosts[0].requestId)'));
  await shot(width,'success');await click('.feedback-success button');assert.equal(await js('location.hash'),'#/more');
  await open();await click('.feedback-submit');await js('window.challenge["error-callback"]("fixture-error")');await wait(100);
  assert.equal(await label(),'Отправить');assert.equal(await js('window.feedbackPosts.length'),0);
  assert.ok(await js('document.querySelector("#feedback-description").value.includes("Проверка UX")'));await shot(width,'verification-error');
  await js('[...document.querySelectorAll("button")].find(b=>b.textContent==="Повторить подключение").click()');await wait(200);
  await js('window.widgetOptions[0].callback("obsolete-token")');await click('.feedback-submit');assert.equal(await label(),'Проверяем…');
  await js('window.challenge.callback("retry-token");window.feedbackReply="CHALLENGE"');await wait(100);await js('window.finishPost()');await wait(100);
  assert.equal(await label(),'Отправить');assert.ok(await js('document.querySelector("[role=alert]").textContent.includes("ещё раз")'));
  await js('window.challenge.callback("next-token")');await click('.feedback-submit');await js('window.feedbackReply="UNAVAILABLE";window.finishPost()');await wait(100);
  assert.equal(await label(),'Отправить');assert.ok(await js('document.querySelector("[role=alert]").textContent.includes("не удалось сохранить")'));await shot(width,'api-error');
  await js('window.challenge.callback("final-token")');await click('.feedback-submit');await js('window.feedbackReply="success";window.finishPost()');await wait(100);
  assert.equal(await js('new Set(window.feedbackPosts.map(p=>p.requestId)).size'),1);
  assert.ok(await js('!!document.querySelector(".feedback-success")'));
  assert.equal(await js('document.documentElement.scrollWidth'),width);
  await open();await js('window.challenge.callback("expired-token");window.challenge["expired-callback"]()');await click('.feedback-submit');assert.equal(await label(),'Проверяем…');
  await js('window.challenge["timeout-callback"]()');await wait(100);assert.equal(await label(),'Отправить');assert.equal(await js('window.feedbackPosts.length'),0);
  await open();await click('.feedback-submit');await js('window.expireWait()');await wait(100);assert.equal(await label(),'Отправить');assert.ok(await js('document.querySelector("[role=alert]").textContent.includes("слишком много времени")'));await js('window.challenge.callback("late-token")');assert.equal(await js('window.feedbackPosts.length'),0);
  await open();await click('.feedback-submit');await click('.page-back-button');await js('window.challenge.callback("after-unmount")');assert.equal(await js('window.feedbackPosts.length'),0);
  console.log(`PASS ${width}: keyboard, delayed/interactive verification, duplicate submit, success/UUID/Back, failure/retry, stale callback, CHALLENGE/503, idempotency, expiry/timeout, unmount`);
 }
 assert.deepEqual(errors,[]);
}finally{socket.close()}
