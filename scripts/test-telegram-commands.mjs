import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import {publicTelegramWebhook} from '../worker/telegram/commands.ts'
import worker from '../worker/index.ts'
const env={PUBLIC_TELEGRAM_COMMANDS_ENABLED:'true',PUBLIC_TELEGRAM_BOT_TOKEN:'test-public',PUBLIC_TELEGRAM_WEBHOOK_SECRET:'test-secret',PUBLIC_TELEGRAM_BOT_USERNAME:'tri_app_preview_bot',PUBLIC_TELEGRAM_MINI_APP_URL:'https://preview.300w.app'}
const update=text=>({update_id:1,message:{message_id:2,chat:{id:123,type:'private'},text}})
const request=(data,secret='test-secret')=>new Request('https://example.test/api/telegram-public-webhook',{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Bot-Api-Secret-Token':secret},body:JSON.stringify(data)})
const noSend=()=>{throw Error('Unexpected send')}
const ok=()=>Response.json({ok:true,result:{message_id:10,chat:{id:123}}})
test('authentication precedes JSON/body reads and never falls back to News secret',async()=>{
 let read=false
 const req={method:'POST',headers:new Headers({'X-Telegram-Bot-Api-Secret-Token':'news-secret'}),get body(){read=true;throw Error('read')}}
 assert.equal((await publicTelegramWebhook(req,{...env,TELEGRAM_WEBHOOK_SECRET:'news-secret'},noSend)).status,401)
 assert.equal(read,false)
 assert.equal((await publicTelegramWebhook(request(update('/start'),''),env,noSend)).status,401)
})
test('each required field is mandatory; disabled/invalid configuration fails closed',async()=>{
 for(const key of Object.keys(env)){
  const config={...env,TELEGRAM_BOT_TOKEN:'old',TELEGRAM_WEBHOOK_SECRET:'old'};delete config[key]
  assert.equal((await publicTelegramWebhook(request(update('/start')),config,noSend)).status,503,key)
 }
 for(const patch of [{PUBLIC_TELEGRAM_COMMANDS_ENABLED:'false'},{PUBLIC_TELEGRAM_COMMANDS_ENABLED:'TRUE'},{PUBLIC_TELEGRAM_MINI_APP_URL:'http://preview.300w.app'},{PUBLIC_TELEGRAM_MINI_APP_URL:'https://user:pass@example.test'},{PUBLIC_TELEGRAM_BOT_USERNAME:'@tri_app_bot'}])
  assert.equal((await publicTelegramWebhook(request(update('/start')),{...env,...patch},noSend)).status,503)
})
test('commands, addressed username, safe payload and fixed URL; no DB or Feedback access',async()=>{
 for(const [username,url] of [['tri_app_preview_bot','https://preview.300w.app'],['tri_app_bot','https://300w.app']]){
  for(const command of ['/start','/app','/help',`/start@${username.toUpperCase()} safe_-123`]){
   let calls=0
   const config={...env,PUBLIC_TELEGRAM_BOT_USERNAME:username,PUBLIC_TELEGRAM_MINI_APP_URL:url}
   for(const key of ['DB','TELEGRAM_BOT_TOKEN','TELEGRAM_WEBHOOK_SECRET','FEEDBACK_TELEGRAM_CHAT_ID'])Object.defineProperty(config,key,{get(){throw Error(`Forbidden access: ${key}`)}})
   const result=await publicTelegramWebhook(request(update(command)),config,async(target,options)=>{
    calls++;assert.equal(target,'https://api.telegram.org/bottest-public/sendMessage');assert.equal(options.redirect,'manual')
    assert.ok(options.signal instanceof AbortSignal)
    const body=JSON.parse(options.body);assert.equal(body.chat_id,123);assert.equal(body.reply_markup.inline_keyboard[0][0].web_app.url,url)
    assert.ok(!body.text.includes('safe_-123'));assert.equal(body.parse_mode,undefined)
    if(command==='/help'){assert.match(body.text,/https:\/\/t.me\/trista_watt/);assert.match(body.text,/Сообщить об ошибке/)}
    return ok()
   });assert.equal(result.status,200);assert.equal(calls,1)
  }
 }
})
test('unsupported updates, non-private chats and unrelated/unsafe commands ignored without sends',async()=>{
 const cases=[{update_id:1,channel_post:{}},{update_id:1,edited_message:{}},update('hello'),update('/starter'),update('/start@other_bot'),update('/start https://evil.test'),update('/app payload'),update('/start '+ 'a'.repeat(65)),update('/start\n/help')]
 for(const type of ['group','supergroup','channel']){const u=update('/start');u.message.chat.type=type;cases.push(u)}
 const noText=update('/start');delete noText.message.text;cases.push(noText)
 for(const u of cases)assert.equal((await publicTelegramWebhook(request(u),env,noSend)).status,200)
})
test('malformed updates and oversized bodies rejected',async()=>{
 for(const u of [null,[],{}, {update_id:-1}, {update_id:1,message:null},{update_id:1,message:{chat:{type:'private',id:-1},message_id:2,text:'/start'}},update(123)])
  assert.equal((await publicTelegramWebhook(request(u),env,noSend)).status,400)
 const req=request(update('/start'));const headers=req.headers
 assert.equal((await publicTelegramWebhook(new Request(req.url,{method:'POST',headers,body:'{broken'}),env,noSend)).status,400)
 assert.equal((await publicTelegramWebhook(request(update('x'.repeat(131072))),env,noSend)).status,413)
 headers.set('Content-Type','text/plain')
 assert.equal((await publicTelegramWebhook(new Request(req.url,{method:'POST',headers,body:'{}'}),env,noSend)).status,400)
})
test('Telegram HTTP/API/malformed response/network failures are generic; timeout signal is bounded',async()=>{
 for(const response of [()=>new Response('oops',{status:500}),()=>Response.json({ok:false}),()=>Response.json({ok:true}),()=>Response.json({ok:true,result:{message_id:1,chat:{id:999}}}),()=>{throw Error('secret or private provider detail')},()=>{throw new DOMException('expired','TimeoutError')}]){
  const r=await publicTelegramWebhook(request(update('/start')),env,response);assert.equal(r.status,503);assert.deepEqual(await r.json(),{ok:false})
 }
 const original=AbortSignal.timeout;let duration
 try{
  AbortSignal.timeout=ms=>{duration=ms;return original(ms)}
  assert.equal((await publicTelegramWebhook(request(update('/app')),env,ok)).status,200)
  assert.equal(duration,8000)
 }finally{AbortSignal.timeout=original}
})
test('Worker route preserves News auth and enables commands only in Preview',async()=>{
 assert.equal((await worker.fetch(new Request('https://example.test/api/telegram-public-webhook'),env)).status,405)
 assert.equal((await worker.fetch(request(update('/start')),{})).status,503)
 const r=request(update('/start'))
 assert.equal((await worker.fetch(new Request('https://example.test/api/telegram-webhook',r),{...env,TELEGRAM_WEBHOOK_SECRET:'news-secret',NEWS_TELEGRAM_CHANNEL_ID:'-123'})).status,401)
 const config=JSON.parse(await fs.readFile('wrangler.jsonc','utf8'))
 for(const [name,enabled,user,url] of [['preview','true','tri_app_preview_bot','https://preview.300w.app'],['production','false','tri_app_bot','https://300w.app']]){
  const vars=config.env[name].vars
  assert.equal(vars.PUBLIC_TELEGRAM_COMMANDS_ENABLED,enabled);assert.equal(vars.PUBLIC_TELEGRAM_BOT_USERNAME,user);assert.equal(vars.PUBLIC_TELEGRAM_MINI_APP_URL,url)
  assert.equal(vars.PUBLIC_TELEGRAM_BOT_TOKEN,undefined);assert.equal(vars.PUBLIC_TELEGRAM_WEBHOOK_SECRET,undefined)
 }
})

test('workerd sends successfully and rejects redirects without following them',async()=>{
 const config=JSON.parse(await fs.readFile('wrangler.jsonc','utf8'))
 const source=stripTypeScriptTypes(await fs.readFile('worker/telegram/commands.ts','utf8'))
 let upstreamStatus=200,calls=0,followed=0
 // All outbound requests terminate in this local stub, including redirect targets.
 // Exercise the actual handler with workerd's native fetch, not an injected fetcher.
 const mf=new Miniflare(convertV4MiniflareOptions({
  modules:true,compatibilityDate:config.compatibility_date,bindings:env,
  script:source+'\nexport default { fetch(request, env) { return publicTelegramWebhook(request, env) } }',
  outboundService:async req=>{
   calls++
   if(req.url!=='https://api.telegram.org/bottest-public/sendMessage'){
    followed++
    return Response.json({ok:true,result:{message_id:10,chat:{id:123}}})
   }
   if(upstreamStatus>=300&&upstreamStatus<400)
    return new Response(null,{status:upstreamStatus,headers:{Location:'https://redirect.invalid/blocked'}})
   if(upstreamStatus!==200)return new Response('upstream unavailable',{status:upstreamStatus})
   return Response.json({ok:true,result:{message_id:10,chat:{id:123}}})
  },
 }))
 try{
  for(const status of [200,301,302,303,304,307,308,401,429,500]){
   upstreamStatus=status;calls=0;followed=0
   const r=await mf.dispatchFetch('https://example.test/api/telegram-public-webhook',{
    method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Bot-Api-Secret-Token':env.PUBLIC_TELEGRAM_WEBHOOK_SECRET},
    body:JSON.stringify(update('/app')),
   })
   assert.equal(r.status,status===200?200:503,`upstream ${status}`)
   assert.deepEqual(await r.json(),{ok:status===200})
   assert.equal(r.headers.get('Cache-Control'),'no-store')
   assert.equal(calls,1,'exactly one outbound request')
   assert.equal(followed,0,'redirect destination must never be requested')
  }
 }finally{await mf.dispose()}
})

test('503 diagnostics use fixed categories, emit once, preserve responses and never retry or leak',async()=>{
 const privateDetail='PRIVATE_TOKEN_SECRET_TEXT_HEADER_URL'
 const cases=[
  [{PUBLIC_TELEGRAM_COMMANDS_ENABLED:'false'},null,'CONFIG_DISABLED'],
  [{PUBLIC_TELEGRAM_BOT_TOKEN:'  '},null,'CONFIG_TOKEN_EMPTY'],
  [{PUBLIC_TELEGRAM_WEBHOOK_SECRET:' '},null,'CONFIG_SECRET_EMPTY'],
  [{PUBLIC_TELEGRAM_BOT_USERNAME:'@invalid'},null,'CONFIG_USERNAME_INVALID'],
  [{PUBLIC_TELEGRAM_MINI_APP_URL:'bad'},null,'CONFIG_URL_INVALID'],
  [{PUBLIC_TELEGRAM_MINI_APP_URL:''},null,'CONFIG_URL_INVALID'],
  [{PUBLIC_TELEGRAM_MINI_APP_URL:'http://example.test'},null,'CONFIG_URL_INVALID'],
  [{},()=>new Response(privateDetail,{status:401}),'UPSTREAM_HTTP_ERROR',401],
  [{},()=>Response.json({ok:false,error_code:403,description:privateDetail},{status:403}),'UPSTREAM_HTTP_ERROR',403,403],
  [{},()=>Response.json({ok:false,error_code:429,description:privateDetail}),'UPSTREAM_API_ERROR',200,429],
  [{},()=>Response.json({ok:false,error_code:privateDetail}),'UPSTREAM_API_ERROR',200],
  [{},()=>new Response(privateDetail),'UPSTREAM_INVALID_JSON',200],
  [{},()=>({ok:true,status:200,json:async()=>{throw new TypeError(privateDetail)}}),'SEND_NETWORK_OR_RUNTIME_ERROR',200],
  [{},()=>Response.json(null),'UPSTREAM_INVALID_RESULT',200],
  [{},()=>Response.json({ok:true,result:{message_id:privateDetail}}),'UPSTREAM_INVALID_RESULT',200],
  [{},()=>Response.json({ok:true,result:{message_id:1,chat:{id:987654321},text:privateDetail}}),'UPSTREAM_CHAT_MISMATCH',200],
  [{},()=>{throw new DOMException(privateDetail,'TimeoutError')},'SEND_TIMEOUT'],
  [{},()=>{throw new Error(privateDetail)},'SEND_NETWORK_OR_RUNTIME_ERROR'],
  [{},()=>({ok:true,status:200,json:async()=>{throw new DOMException(privateDetail,'TimeoutError')}}),'SEND_TIMEOUT',200],
 ]
 const original=console.warn
 try{
  for(const [patch,sender,reason,status,errorCode] of cases){
   const logs=[];let calls=0
   console.warn=(...args)=>logs.push(args)
   const r=await publicTelegramWebhook(request(update('/start '+privateDetail)),{...env,...patch},async()=>{
    calls++
    assert.ok(sender,'configuration errors must not send')
    return sender()
   })
   assert.equal(r.status,503);assert.deepEqual(await r.json(),{ok:false})
   assert.equal(r.headers.get('Cache-Control'),'no-store')
   assert.equal(calls,sender?1:0);assert.equal(logs.length,1);assert.equal(logs[0].length,1)
   const expected={event:'telegram_command_failure',reason}
   if(status!==undefined)expected.http_status=status
   if(errorCode!==undefined)expected.error_code=errorCode
   assert.deepEqual(JSON.parse(logs[0][0]),expected)
   for(const sensitive of [privateDetail,env.PUBLIC_TELEGRAM_BOT_TOKEN,env.PUBLIC_TELEGRAM_WEBHOOK_SECRET,'987654321','api.telegram.org'])
    assert.ok(!logs[0][0].includes(sensitive))
  }
  const logs=[];console.warn=(...args)=>logs.push(args)
  assert.equal((await publicTelegramWebhook(request(update('/app')),env,ok)).status,200)
  assert.equal((await publicTelegramWebhook(request(update('/app'),'wrong'),env,noSend)).status,401)
  assert.equal((await publicTelegramWebhook(request(update('hello')),env,noSend)).status,200)
  assert.equal(logs.length,0)
  console.warn=()=>{throw Error(privateDetail)}
  assert.equal((await publicTelegramWebhook(request(update('/app')),{...env,PUBLIC_TELEGRAM_COMMANDS_ENABLED:'false'},noSend)).status,503)
 }finally{console.warn=original}
})
