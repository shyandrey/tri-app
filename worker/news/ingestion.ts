import { evaluateNews, isNewsEmoji } from './eligibility.ts'
import type { TelegramEntity, TelegramNewsContent, NewsEvaluation } from './eligibility.ts'
import { NEWS_CHANNEL_URL } from '../../shared/news.ts'

export class NewsInputError extends Error {}
type ObjectValue = Record<string, unknown>
const object = (v: unknown): ObjectValue => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw new NewsInputError(); return v as ObjectValue }
const integer = (v: unknown, min = 0): number => { if (!Number.isSafeInteger(v) || Number(v) < min) throw new NewsInputError(); return v as number }
const string = (v: unknown, max: number): string => { if (typeof v !== 'string' || v.length > max) throw new NewsInputError(); return v }
export type NewsPost = { eventType: 'channel_post' | 'edited_channel_post'; channelId: string; messageId: number; date: number; eventAt: number; updateId: number; mediaGroupId: string | null; content: TelegramNewsContent }
export function parseNewsUpdate(input: unknown, expectedChannel: string): NewsPost {
  const update = object(input), updateId = integer(update.update_id)
  if (!!update.channel_post === !!update.edited_channel_post) throw new NewsInputError()
  const message = object(update.channel_post ?? update.edited_channel_post), chat = object(message.chat)
  if (chat.type !== 'channel' || !Number.isSafeInteger(chat.id)) throw new NewsInputError()
  const channelId = String(chat.id)
  if (channelId !== expectedChannel) throw new NewsInputError('WRONG_CHANNEL')
  const messageId = integer(message.message_id, 1), date = integer(message.date, 1)
  const eventAt = update.edited_channel_post ? integer(message.edit_date, date) : date
  if (eventAt > 253402300799) throw new NewsInputError()
  const mediaGroupId = message.media_group_id === undefined ? null : string(message.media_group_id, 128)
  if (mediaGroupId === '') throw new NewsInputError()
  if (message.text !== undefined && message.caption !== undefined) throw new NewsInputError()
  const content: TelegramNewsContent = {}
  for (const [field, entityField] of [['text','entities'], ['caption','caption_entities']] as const) {
    if (message[field] === undefined) { if (message[entityField] !== undefined) throw new NewsInputError(); continue }
    const text = string(message[field], 16384)
    content[field] = text
    if (message[entityField] !== undefined) {
      if (!Array.isArray(message[entityField]) || message[entityField].length > 256) throw new NewsInputError()
      content[entityField] = message[entityField].map((value): TelegramEntity => {
        const entity = object(value), offset = integer(entity.offset), length = integer(entity.length, 1)
        if (offset + length > text.length) throw new NewsInputError()
        return { type: string(entity.type, 64), offset, length }
      })
    }
  }
  return { eventType: update.channel_post ? 'channel_post' : 'edited_channel_post', channelId, messageId, date, eventAt, updateId, mediaGroupId, content }
}
export type NewsStatement = { sql: string; params: (string | number | null)[] }
// Eligibility always sees original text/offsets. Normalize only after extraction.
const segments = new Intl.Segmenter('und', { granularity: 'grapheme' })
const clean = (text: string, limit: number) => Array.from(text.normalize('NFC').replace(/[\p{Cc}\p{Cf}\s]+/gu, ' ').trim()).slice(0, limit).join('')
const cleanTitle = (text: string, limit: number) => {
  // Preserve joiners/tag characters only inside recognized emoji sequences.
  const normalized = [...segments.segment(text.normalize('NFC'))].map(({ segment }) =>
    isNewsEmoji(segment) ? segment : segment.replace(/[\p{Cc}\p{Cf}\s]+/gu, ' ')).join('').replace(/\s+/gu, ' ').trim()
  let result = '', length = 0
  for (const { segment } of segments.segment(normalized)) {
    const size = Array.from(segment).length
    if (length + size > limit) break
    result += segment; length += size
  }
  return result
}
export async function newsStatements(post: NewsPost, evaluation: NewsEvaluation = evaluateNews(post.content)): Promise<NewsStatement[]> {
  const { channelId, messageId, eventAt, updateId, mediaGroupId } = post
  const eligible = evaluation.eligible
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${channelId}:${messageId}`))
  const id = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
  const watermark: NewsStatement = {
    sql: `INSERT INTO news_post_state(channel_id,message_id,event_at,update_id,media_group_id) VALUES(?,?,?,?,?)
      ON CONFLICT(channel_id,message_id) DO UPDATE SET event_at=excluded.event_at, update_id=excluded.update_id, media_group_id=excluded.media_group_id
      WHERE excluded.event_at > news_post_state.event_at OR (excluded.event_at = news_post_state.event_at AND excluded.update_id > news_post_state.update_id)`,
    params: [channelId, messageId, eventAt, updateId, mediaGroupId],
  }
  // D1 batch is transactional; stale payloads cannot pass the watermark condition.
  const condition = 'EXISTS(SELECT 1 FROM news_post_state WHERE channel_id=? AND message_id=? AND event_at=? AND update_id=?)'
  const version = [channelId, messageId, eventAt, updateId]
  if (!eligible || !cleanTitle(eligible.title, 200)) return [watermark, {
    sql: `UPDATE news SET hidden=1, source='telegram', updated_at=? WHERE channel_id=? AND message_id=? AND ${condition}`,
    params: [new Date(eventAt * 1000).toISOString(), channelId, messageId, ...version],
  }]
  return [watermark, {
    sql: `INSERT INTO news(id,channel_id,message_id,published_at,updated_at,title,excerpt,telegram_url,hidden,created_at,media_group_id)
      SELECT ?,?,?,?,?,?,?,?,0,?,? WHERE ${condition}
      ON CONFLICT(channel_id,message_id) DO UPDATE SET updated_at=excluded.updated_at,title=excluded.title,excerpt=excluded.excerpt,
      telegram_url=excluded.telegram_url,hidden=0,source='telegram',media_group_id=excluded.media_group_id`,
    params: [id, channelId, messageId, new Date(post.date * 1000).toISOString(), new Date(eventAt * 1000).toISOString(),
      cleanTitle(eligible.title, 200), clean(eligible.excerpt, 1000), `${NEWS_CHANNEL_URL}/${messageId}`,
      new Date(post.date * 1000).toISOString(), mediaGroupId, ...version],
  }]
}
export async function ingestNews(db: D1Database, post: NewsPost) {
  const evaluation = evaluateNews(post.content)
  const statements = await newsStatements(post, evaluation)
  await db.batch(statements.map(s => db.prepare(s.sql).bind(...s.params)))
  if (!evaluation.eligible) {
    const entities = (evaluation.contentSource === 'text' ? post.content.entities : post.content.caption_entities) ?? []
    // Never copy arbitrary entity properties/type strings into logs (URLs, users, etc.).
    const safeTypes = new Set(['mention', 'hashtag', 'cashtag', 'bot_command', 'url', 'email', 'phone_number', 'bold', 'italic', 'underline', 'strikethrough', 'spoiler', 'blockquote', 'expandable_blockquote', 'code', 'pre', 'text_link', 'text_mention', 'custom_emoji', 'date_time'])
    console.info(JSON.stringify({
      event: 'news_eligibility_rejected', message_id: post.messageId, update_id: post.updateId,
      event_type: post.eventType, content_source: evaluation.contentSource,
      first_line_utf16_length: evaluation.firstLineUtf16Length,
      entities: entities.map(({ type, offset, length }) => ({ type: safeTypes.has(type) ? type : 'unknown', offset, length })),
      reason: evaluation.reason,
    }))
  }
}
