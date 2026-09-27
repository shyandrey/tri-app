import type { Env } from '../env.ts'
import { json } from '../feedback/handler.ts'
import { ingestNews, NewsInputError, parseNewsUpdate } from './ingestion.ts'
import type { NewsItem, NewsResponse } from '../../shared/news.ts'
export async function telegramWebhook(request: Request, env: Env) {
  if (!env.TELEGRAM_WEBHOOK_SECRET || !env.NEWS_TELEGRAM_CHANNEL_ID) return json({ error: { code: 'UNAVAILABLE' } }, 503)
  // Hash both values before comparison so secret-prefix comparisons do not short circuit.
  const supplied = request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? ''
  const digest = async (s: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))
  const [a,b] = await Promise.all([digest(supplied), digest(env.TELEGRAM_WEBHOOK_SECRET)])
  let different = 0; for (let i=0;i<a.length;i++) different |= a[i] ^ b[i]
  if (!supplied || different) return json({ error: { code: 'UNAUTHORIZED' } }, 401)
  try {
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new NewsInputError()
    const reader = request.body?.getReader(); if (!reader) throw new NewsInputError()
    const chunks: Uint8Array[] = []; let length = 0
    while (true) {
      const part = await reader.read(); if (part.done) break
      length += part.value.byteLength
      if (length > 131072) { await reader.cancel(); return json({ error: { code: 'TOO_LARGE' } }, 413) }
      chunks.push(part.value)
    }
    const bytes = new Uint8Array(length); let offset=0
    for (const chunk of chunks) { bytes.set(chunk,offset); offset+=chunk.length }
    let input: unknown
    try { input = JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)) } catch { throw new NewsInputError() }
    await ingestNews(env.DB, parseNewsUpdate(input, env.NEWS_TELEGRAM_CHANNEL_ID))
    return json({ ok: true })
  } catch (error) {
    return json({ error: { code: error instanceof NewsInputError ? 'INVALID_UPDATE' : 'UNAVAILABLE' } },
      error instanceof NewsInputError ? (error.message === 'WRONG_CHANNEL' ? 403 : 400) : 503)
  }
}
export async function latestNews(env: Env) {
  try {
    let items: NewsItem[] = [], updatedAt = new Date(0).toISOString()
    if (env.NEWS_TELEGRAM_CHANNEL_ID) {
      const results = await env.DB.batch([
        env.DB.prepare(`SELECT n.id,n.published_at AS publishedAt,n.title,n.excerpt,n.telegram_url AS telegramUrl
          FROM news n WHERE n.channel_id=? AND n.hidden=0 AND (n.media_group_id IS NULL OR NOT EXISTS(
            SELECT 1 FROM news other WHERE other.channel_id=n.channel_id AND other.media_group_id=n.media_group_id
            AND other.hidden=0 AND other.message_id<n.message_id))
          ORDER BY n.published_at DESC,n.message_id DESC,n.id DESC LIMIT 3`).bind(env.NEWS_TELEGRAM_CHANNEL_ID),
        env.DB.prepare('SELECT MAX(event_at) AS latest FROM news_post_state WHERE channel_id=?').bind(env.NEWS_TELEGRAM_CHANNEL_ID),
      ])
      items = results[0].results as unknown as NewsItem[]
      const latest = (results[1].results[0] as { latest: number | null }).latest
      if (latest !== null) updatedAt = new Date(latest * 1000).toISOString()
    }
    return json({ items, updatedAt, source: 'telegram' } satisfies NewsResponse, 200, { 'Cache-Control': 'public, max-age=900' })
  } catch { return json({ error: { code: 'UNAVAILABLE' } }, 503) }
}
