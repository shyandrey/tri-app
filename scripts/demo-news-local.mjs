// Synthetic fixtures for isolated LOCAL D1 only; never production seed.
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const base=process.env.TRI_APP_URL??'http://localhost:8787'
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Local demo only')
const secret='local-news-demo-secret',channel=-1009000001,heading='LOCAL TEST — Новость',date=1790500000
const post=(id,options={})=>({message_id:id,date,chat:{id:channel,type:'channel'},text:heading+'\nЛокальный тест. Не production seed.',entities:[{type:'bold',offset:0,length:heading.length}],...options})
const request=async(id,message,edit=false)=>{
 const r=await fetch(base+'/api/telegram-webhook',{method:'POST',headers:{'Content-Type':'application/json','X-Telegram-Bot-Api-Secret-Token':secret},body:JSON.stringify({update_id:id,[edit?'edited_channel_post':'channel_post']:message})})
 assert.equal(r.status,200,await r.text())
}
await request(900001,post(990001))
await request(900002,post(990002,{entities:[],text:'LOCAL TEST ordinary meme'}))
let feed=await(await fetch(base+'/api/news',{cache:'no-store'})).json();assert.ok(!feed.items.some(i=>i.telegramUrl.endsWith('/990002')))
await request(900003,post(990002,{edit_date:date+1}),true)
await request(900004,post(990003))
await request(900005,post(990003,{edit_date:date+2,entities:[]}),true)
await request(900006,post(990004,{text:undefined,entities:undefined,caption:heading+'\nVideo highlights (local fixture)',caption_entities:[{type:'bold',offset:0,length:heading.length}],video:{file_id:'local-fixture-only'}}))
await request(900001,post(990001))
feed=await(await fetch(base+'/api/news',{cache:'no-store'})).json()
assert.deepEqual(feed.items.map(i=>i.telegramUrl.split('/').at(-1)),['990004','990002','990001'])
await fs.writeFile('/tmp/tri-news-local-demo.json',JSON.stringify(feed,null,2));console.log('PASS local webhook/D1/API: eligible, ordinary, edit-add, edit-hide, caption, duplicate; active messages 990004,990002,990001')
