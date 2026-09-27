export const NEWS_CHANNEL_URL = 'https://t.me/trista_watt'
export type NewsItem = { id: string; publishedAt: string; title: string; excerpt: string; telegramUrl: string }
export type NewsResponse = { items: NewsItem[]; updatedAt: string; source: 'telegram' }
