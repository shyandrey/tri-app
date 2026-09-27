import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker/index.ts'
import {testD1} from './lib/test-d1.mjs'
import {seedSQL} from './seed-news.mjs'
import {loadNews,validNewsItems,newsDate} from '../src/api/news.ts'
const CHANNEL=-1009000001, SECRET='local-test-webhook-secret', DATE=1790500000
const heading='TEST ONLY — результаты'
const message=(id,options={})=>({message_id:id,date:DATE,chat:{id:CHANNEL,type:'channel'},text:heading+'\nТестовый текст',entities:[{type:'bold',offset:0,length:heading.length}],...options})
const update=(id,options={},edit=false,revision=id)=>({update_id:revision,[edit?'edited_channel_post':'channel_post']:message(id,{...options,...(edit?{edit_date:options.edit_date??DATE+1}:{})})})
const env=db=>({DB:db,TELEGRAM_WEBHOOK_SECRET:SECRET,NEWS_TELEGRAM_CHANNEL_ID:String(CHANNEL)})
const req=(payload,secret=SECRET)=>new Request('https://tri.example/api/telegram-webhook',{method:'POST',headers:{'Content-Type':'application/json',...(secret?{'X-Telegram-Bot-Api-Secret-Token':secret}:{})},body:JSON.stringify(payload)})
const send=(db,u)=>worker.fetch(req(u),env(db))
const feed=db=>worker.fetch(new Request('https://tri.example/api/news'),env(db))

test('webhook exact secret/channel, no bot token; malformed update rejected without storage',async t=>{
 const db=testD1(t)
 for(const secret of ['', 'wrong'])assert.equal((await worker.fetch(req(update(1),secret),env(db))).status,401)
 assert.equal((await worker.fetch(req(update(1)),{DB:db})).status,503)
 assert.equal((await send(db,update(1,{chat:{id:CHANNEL-1,type:'channel'}}))).status,403)
 for(const u of [{}, {update_id:1,channel_post:{}}, {...update(1),edited_channel_post:message(1)}, update(1,{text:12}),update(1,{entities:[{type:'bold',offset:0,length:999999}]})])assert.equal((await send(db,u)).status,400)
 assert.equal(db.query('SELECT count(*) n FROM news_post_state')[0].n,0)
 assert.equal((await send(db,update(1))).status,200)
 assert.equal(db.query('SELECT count(*) n FROM news')[0].n,1)
})
test('duplicate delivery idempotent; stable identity; secrets and channel absent from API',async t=>{
 const db=testD1(t)
 await send(db,update(1));const row=db.query('SELECT * FROM news')[0];await send(db,update(1))
 assert.deepEqual(db.query('SELECT * FROM news'),[row]);const r=await feed(db);const body=await r.json()
 assert.deepEqual(Object.keys(body).sort(),['items','source','updatedAt']);assert.deepEqual(Object.keys(body.items[0]).sort(),['excerpt','id','publishedAt','telegramUrl','title'])
 assert.ok(!JSON.stringify(body).includes(String(CHANNEL)));assert.ok(!JSON.stringify(body).includes(SECRET))
})
test('ordinary ignored; edits add, change, hide and unhide; original publication date retained',async t=>{
 const db=testD1(t)
 await send(db,update(1,{entities:[]}));assert.equal((await (await feed(db)).json()).items.length,0)
 await send(db,update(1,{},true,2));const original=db.query('SELECT * FROM news')[0]
 await send(db,update(1,{edit_date:DATE+2,text:'Новый title\nBody',entities:[{type:'bold',offset:0,length:11}]},true,3))
 assert.equal(db.query('SELECT title FROM news')[0].title,'Новый title')
 await send(db,update(1,{edit_date:DATE+3,entities:[]},true,4));assert.equal(db.query('SELECT hidden FROM news')[0].hidden,1)
 assert.equal((await (await feed(db)).json()).items.length,0)
 await send(db,update(1,{edit_date:DATE+4},true,5));const row=db.query('SELECT * FROM news')[0]
 assert.equal(row.hidden,0);assert.equal(row.id,original.id);assert.equal(row.published_at,original.published_at)
})
test('stale/duplicate updates cannot resurrect hidden or ignored posts; same-second update IDs order edits',async t=>{
 const db=testD1(t)
 await send(db,update(1,{},false,100));await send(db,update(1,{entities:[]},true,102));await send(db,update(1,{},true,101));await send(db,update(1,{},false,100))
 assert.equal(db.query('SELECT hidden FROM news')[0].hidden,1)
 await send(db,update(2,{entities:[]},true,104));await send(db,update(2,{},false,103));assert.equal(db.query('SELECT count(*) n FROM news WHERE message_id=2')[0].n,0)
 // A later event wins even after Telegram update_id resets after inactivity.
 await send(db,update(1,{edit_date:DATE+864000},true,1));assert.equal(db.query('SELECT hidden FROM news')[0].hidden,0)
})
test('photo/video captions and media group canonical smallest eligible ID, independent of arrival order',async t=>{
 const db=testD1(t),caption={text:undefined,entities:undefined,caption:heading+'\nHighlights',caption_entities:[{type:'bold',offset:0,length:heading.length}],media_group_id:'album-1',video:{file_id:'ignored'}}
 await send(db,update(12,caption));await send(db,update(10,caption));await send(db,update(11,{...caption,caption_entities:[]}))
 let items=(await (await feed(db)).json()).items;assert.equal(items.length,1);assert.ok(items[0].telegramUrl.endsWith('/10'))
 await send(db,update(10,{...caption,caption_entities:[]},true,100));items=(await (await feed(db)).json()).items
 assert.equal(items.length,1);assert.ok(items[0].telegramUrl.endsWith('/12'))
 assert.ok(!JSON.stringify(db.query('SELECT * FROM news')).includes('file_id'))
})
test('normalization after eligibility; malicious text stays plain; URLs generated server-side',async t=>{
 const db=testD1(t),title='<script>alert(1)</script>'
 await send(db,update(1,{text:title+'\nBody\u0000\n  spacing',entities:[{type:'bold',offset:0,length:title.length}],telegramUrl:'javascript:evil'}))
 const item=(await (await feed(db)).json()).items[0]
 assert.equal(item.title,title);assert.equal(item.excerpt,'Body spacing');assert.equal(item.telegramUrl,'https://t.me/trista_watt/1')
 const long='a'.repeat(250);await send(db,update(2,{text:long+'\n'+'x'.repeat(1200),entities:[{type:'bold',offset:0,length:long.length}]}))
 assert.equal(db.query('SELECT title FROM news WHERE message_id=2')[0].title.length,200)
 assert.equal(db.query('SELECT excerpt FROM news WHERE message_id=2')[0].excerpt.length,1000)
})
test('GET newest three with deterministic ties, hidden exclusion, 15m cache and no Telegram request',async t=>{
 const db=testD1(t)
 for(const id of [1,4,2,3,5])await send(db,update(id))
 await send(db,update(5,{entities:[]},true,99))
 const response=await feed(db),body=await response.json()
 assert.equal(response.headers.get('Cache-Control'),'public, max-age=900')
 assert.deepEqual(body.items.map(i=>i.telegramUrl.split('/').at(-1)),['4','3','2']);assert.equal(body.source,'telegram')
 assert.equal(body.updatedAt,new Date((DATE+1)*1000).toISOString())
 assert.equal((await worker.fetch(new Request('https://tri.example/api/news',{method:'POST'}),env(db))).status,405)
})
test('database failure yields no-cache 503; webhook response does not expose errors/payload',async()=>{
 const db={batch(){throw Error('private failure')}}
 const r=await feed(db);assert.equal(r.status,503);assert.equal(r.headers.get('Cache-Control'),'no-store')
 const response=await send(db,update(1));assert.equal(response.status,503);assert.ok(!(await response.text()).includes('private failure'))
})
test('idempotent reviewed seed shares ingestion, validates identity, cannot overwrite newer edits',async t=>{
 const db=testD1(t),sql=await seedSQL({version:1,channelId:String(CHANNEL),posts:[message(1)]})
 db.script(sql);db.script(sql);assert.equal(db.query('SELECT count(*) n FROM news')[0].n,1)
 await send(db,update(1,{entities:[]},true,4));db.script(sql);assert.equal(db.query('SELECT hidden FROM news')[0].hidden,1)
 await assert.rejects(seedSQL({version:1,channelId:'-1002',posts:[message(1)]}))
})
test('frontend uses valid API/seed or empty fallback; strips extra fields and rejects hostile URLs',async()=>{
 const item={id:'test',title:'Title',excerpt:'',publishedAt:'2026-09-27T12:00:00.000Z',telegramUrl:'https://t.me/trista_watt/1'}
 assert.deepEqual(await loadNews([],async()=>Response.json({items:[item]})),[item])
 for(const fetcher of [async()=>{throw Error()},async()=>Response.json({items:[]}),async()=>new Response('bad',{status:503})]){
  assert.deepEqual(await loadNews([item],fetcher),[item]);assert.deepEqual(await loadNews([],fetcher),[])
 }
 assert.deepEqual(validNewsItems([{...item,secret:'not forwarded'}]),[item])
 assert.deepEqual(validNewsItems([{...item,telegramUrl:'https://t.me/evil/1'},{...item,telegramUrl:'javascript:alert(1)'}]),[])
 assert.equal(newsDate(item.publishedAt),'27 сентября')
})
