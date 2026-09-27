// Offline SQL generator only. Never deploys or writes production D1.
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseNewsUpdate, newsStatements } from '../worker/news/ingestion.ts'
const quote=value=>value===null?'NULL':typeof value==='number'?String(value):"'"+value.replaceAll("'","''")+"'"
export function approvedSeedItems(input) {
  if (input?.version !== 2 || input.source !== 'manually-approved-telegram-seed' || !Array.isArray(input.posts) || !input.posts.length) throw Error('Expected a versioned manually approved seed')
  const seen=new Set()
  return input.posts.map(p=>{
    if(!Number.isSafeInteger(p.messageId)||p.messageId<=0||seen.has(p.messageId))throw Error('Invalid/duplicate message ID')
    seen.add(p.messageId)
    if(p.telegramUrl!==`https://t.me/trista_watt/${p.messageId}`)throw Error('Invalid approved URL')
    if(typeof p.publishedAt!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(p.publishedAt)||!Number.isFinite(Date.parse(p.publishedAt)))throw Error('Exact publication time required')
    if(typeof p.title!=='string'||!p.title.trim()||Array.from(p.title).length>200||typeof p.publishedText!=='string'||!p.publishedText.startsWith(p.title+'\n'))throw Error('Exact published heading/text required')
    const body=p.publishedText.slice(p.title.length).trimStart()
    if(typeof p.excerpt!=='string'||!p.excerpt||Array.from(p.excerpt).length>1000||!body.startsWith(p.excerpt))throw Error('Excerpt must be verbatim body prefix')
    return {id:`telegram-seed-${p.messageId}`,publishedAt:new Date(p.publishedAt).toISOString(),title:p.title,excerpt:p.excerpt,telegramUrl:p.telegramUrl}
  }).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)||Number(b.telegramUrl.split('/').at(-1))-Number(a.telegramUrl.split('/').at(-1)))
}
export const seedFrontend = input => `// Generated from scripts/fixtures/news-seed/approved-v1.json by scripts/seed-news.mjs.
// Do not edit: D1 seed and fallback share the same canonical approved source.
import type { NewsItem } from '../../shared/news'
export const newsSeed: NewsItem[] = ${JSON.stringify(approvedSeedItems(input),null,2)}
`
export async function seedSQL(input, channelId) {
  if(input?.version===2){
    if(typeof channelId!=='string'||!/^-[0-9]+$/.test(channelId)||!Number.isSafeInteger(Number(channelId)))throw Error('Explicit --channel-id server config required for D1 seed')
    const sql=[]
    for(const item of approvedSeedItems(input)) {
      const messageId=Number(item.telegramUrl.split('/').at(-1)),seconds=Date.parse(item.publishedAt)/1000
      // Negative INTERNAL seed revision can never supersede a received live update.
      sql.push(`INSERT INTO news_post_state(channel_id,message_id,event_at,update_id,media_group_id) VALUES(${quote(channelId)},${messageId},${seconds},-1,NULL) ON CONFLICT(channel_id,message_id) DO NOTHING;`)
      sql.push(`INSERT INTO news(id,channel_id,message_id,published_at,updated_at,title,excerpt,telegram_url,hidden,created_at,source)
        SELECT ${[item.id,channelId,messageId,item.publishedAt,item.publishedAt,item.title,item.excerpt,item.telegramUrl,0,item.publishedAt,input.source].map(quote).join(',')}
        WHERE EXISTS(SELECT 1 FROM news_post_state WHERE channel_id=${quote(channelId)} AND message_id=${messageId} AND update_id=-1)
        ON CONFLICT(channel_id,message_id) DO UPDATE SET title=excluded.title,excerpt=excluded.excerpt,source=excluded.source
        WHERE news.source='manually-approved-telegram-seed';`)
    }
    return '-- Explicitly approved manual seed; requires migration 0004. No eligibility override for webhook.\n'+sql.join('\n')+'\n'
  }
  if (!input || input.version !== 1 || !/^-\d+$/.test(input.channelId) || !Array.isArray(input.posts) || !input.posts.length) throw Error('Expected version=1, channelId and reviewed posts')
  const sql=[]
  for(const message of input.posts) {
    // 0 is a seed revision sentinel, not a fabricated Telegram update_id.
    const update={update_id:0,[message.edit_date===undefined?'channel_post':'edited_channel_post']:message}
    const post=parseNewsUpdate(update,input.channelId)
    for(const statement of await newsStatements(post)) {
      let index=0
      sql.push(statement.sql.replace(/\?/g,()=>quote(statement.params[index++]))+';')
      if(index!==statement.params.length)throw Error('SQL parameter mismatch')
    }
  }
  return '-- Reviewed News seed; applies after migration 0004. Replays are idempotent.\n'+sql.join('\n')+'\n'
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const args=process.argv.slice(2),get=name=>args[args.indexOf(name)+1]
 if(!args.includes('--input')||(!args.includes('--out')&&!args.includes('--frontend-out')&&!args.includes('--check-frontend')))throw Error('Usage: --input reviewed.json [--channel-id <server-config> --out /tmp/news.sql] [--frontend-out src/data/newsSeed.ts | --check-frontend src/data/newsSeed.ts]')
 const input=JSON.parse(await fs.readFile(get('--input'),'utf8'))
 if(args.includes('--out'))await fs.writeFile(get('--out'),await seedSQL(input,args.includes('--channel-id')?get('--channel-id'):undefined),{flag:'wx'})
 if(args.includes('--frontend-out'))await fs.writeFile(get('--frontend-out'),seedFrontend(input))
 if(args.includes('--check-frontend')&&(await fs.readFile(get('--check-frontend'),'utf8'))!==seedFrontend(input))throw Error('Bundled seed diverged from canonical source')
 console.log('Seed generated/verified; no database changed.')
}
