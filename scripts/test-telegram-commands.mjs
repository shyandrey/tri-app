import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
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
    calls++;assert.equal(target,'https://api.telegram.org/bottest-public/sendMessage');assert.equal(options.redirect,'error')
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
