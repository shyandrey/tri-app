import type { NewsItem } from '../../shared/news.ts'
import { NEWS_CHANNEL_URL } from '../../shared/news.ts'
export function validNewsItems(input: unknown): NewsItem[] {
  if (!Array.isArray(input)) return []
  return input.flatMap(v => {
    if (!v || typeof v !== 'object' || typeof v.id !== 'string' || !v.id || v.id.length > 100
      || typeof v.title !== 'string' || !v.title.trim() || Array.from(v.title).length > 200
      || typeof v.excerpt !== 'string' || Array.from(v.excerpt).length > 1000
      || typeof v.publishedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(v.publishedAt) || !Number.isFinite(Date.parse(v.publishedAt))
      || typeof v.telegramUrl !== 'string' || !v.telegramUrl.startsWith(NEWS_CHANNEL_URL + '/') || !/^\d+$/.test(v.telegramUrl.slice(NEWS_CHANNEL_URL.length+1))) return []
    return [{ id:v.id, title:v.title, excerpt:v.excerpt, publishedAt:v.publishedAt, telegramUrl:v.telegramUrl }]
  }).filter((v,i,a)=>a.findIndex(other=>other.id===v.id)===i).slice(0,3)
}
export async function loadNews(seed: readonly NewsItem[] = [], fetcher: typeof fetch = fetch): Promise<NewsItem[]> {
  try {
    const response = await fetcher('/api/news', { signal: AbortSignal.timeout(5000) })
    if (response.ok) {
      const body = await response.json() as { items?: unknown }
      const items = validNewsItems(body.items)
      if (items.length) return items
    }
  } catch { /* Verified bundled fallback, never made-up headlines. */ }
  return validNewsItems(seed)
}
export const newsDate = (date: string) => new Intl.DateTimeFormat('ru-RU', { day:'numeric', month:'long', timeZone:'Europe/Moscow' }).format(new Date(date))
