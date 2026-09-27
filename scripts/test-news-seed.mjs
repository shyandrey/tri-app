import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {seedSQL,seedFrontend,approvedSeedItems} from './seed-news.mjs'
import {testD1} from './lib/test-d1.mjs'
import {newsSeed} from '../src/data/newsSeed.ts'
import {ingestNews,parseNewsUpdate} from '../worker/news/ingestion.ts'
import {loadNews} from '../src/api/news.ts'
const canonical=JSON.parse(await fs.readFile('scripts/fixtures/news-seed/approved-v1.json','utf8'))
test('approved posts replay exact publicly published text/time evidence; no draft reconstruction',async()=>{
 assert.deepEqual(canonical.posts.map(p=>p.messageId),[993,992,988])
 for(const post of canonical.posts){
  const file='scripts/fixtures/news-seed/'+post.evidence.file,html=await fs.readFile(file,'utf8')
  assert.equal(createHash('sha256').update(html).digest('hex'),post.evidence.sha256)
  const result=spawnSync('python3',['scripts/extract-approved-news.py',file],{encoding:'utf8'})
  assert.equal(result.status,0,result.stderr);const parsed=JSON.parse(result.stdout)
  assert.equal(parsed.post,'trista_watt/'+post.messageId);assert.equal(parsed.publishedText,post.publishedText)
  assert.equal(Date.parse(parsed.publishedAt),Date.parse(post.publishedAt));assert.equal(parsed.publishedText.split('\n')[0],post.title)
  assert.ok(post.publishedText.slice(post.title.length).trimStart().startsWith(post.excerpt))
 }
 assert.equal(canonical.posts[0].title,'📺 Видео Т100 French Rivera')
})
test('one canonical source generates matching frontend and D1 items; repeated manual seed is idempotent',async t=>{
 const db=testD1(t),sql=await seedSQL(canonical,'-1009000002')
 db.script(sql);const rows=db.query('SELECT id,published_at AS publishedAt,title,excerpt,telegram_url AS telegramUrl FROM news ORDER BY message_id DESC')
 db.script(sql);assert.equal(db.query('SELECT count(*) n FROM news')[0].n,3)
 assert.deepEqual(rows,newsSeed);assert.deepEqual(newsSeed,approvedSeedItems(canonical))
 assert.equal(await fs.readFile('src/data/newsSeed.ts','utf8'),seedFrontend(canonical))
 assert.ok(db.query('SELECT source FROM news').every(row=>row.source==='manually-approved-telegram-seed'))
})
test('manual approval does not weaken NEW/EDIT webhook eligibility; edits override same identity, re-seed cannot resurrect',async t=>{
 const db=testD1(t),channel='-1009000002',sql=await seedSQL(canonical,channel);db.script(sql)
 const p=canonical.posts[0],original=db.query('SELECT * FROM news WHERE message_id=993')[0],date=Date.parse(p.publishedAt)/1000
 const update=(revision,entities)=>parseNewsUpdate({update_id:revision,edited_channel_post:{message_id:993,date,edit_date:date+revision,chat:{id:Number(channel),type:'channel'},text:p.publishedText,entities,source:'manually-approved-telegram-seed'}},channel)
 await ingestNews(db,update(1,[]));assert.equal(db.query('SELECT hidden FROM news WHERE message_id=993')[0].hidden,1)
 db.script(sql);assert.equal(db.query('SELECT hidden FROM news WHERE message_id=993')[0].hidden,1)
 await ingestNews(db,update(2,[{type:'bold',offset:0,length:p.title.length}]))
 const edited=db.query('SELECT * FROM news WHERE message_id=993')[0]
 assert.equal(edited.hidden,0);assert.equal(edited.id,original.id);assert.equal(edited.published_at,original.published_at);assert.equal(edited.source,'telegram')
 db.script(sql);assert.equal(db.query('SELECT source FROM news WHERE message_id=993')[0].source,'telegram')
})
test('incomplete/manual nonverbatim content rejected; real bundled fallback on unavailable or empty API',async()=>{
 await assert.rejects(seedSQL(canonical))
 for(const change of [{publishedAt:''},{title:'Invented title'},{excerpt:'Invented summary'},{telegramUrl:'https://t.me/else/993'}]){
  assert.throws(()=>approvedSeedItems({...canonical,posts:[{...canonical.posts[0],...change}]}))
 }
 for(const fetcher of [async()=>{throw Error('offline')},async()=>Response.json({items:[]})])assert.deepEqual(await loadNews(newsSeed,fetcher),newsSeed)
})
