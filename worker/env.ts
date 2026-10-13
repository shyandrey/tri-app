export interface Env {
  PUBLIC_TELEGRAM_BOT_TOKEN?: string
  PUBLIC_TELEGRAM_WEBHOOK_SECRET?: string
  PUBLIC_TELEGRAM_COMMANDS_ENABLED?: string
  PUBLIC_TELEGRAM_BOT_USERNAME?: string
  PUBLIC_TELEGRAM_MINI_APP_URL?: string
  APP_ENV?: 'preview' | 'production'
  TURNSTILE_SITE_KEY?: string
  FEEDBACK_RATE_LIMITER?: { limit: (options: { key: string }) => Promise<{ success: boolean }> }
  ASSETS: Fetcher
  DB: D1Database
  // Future features only: health/static serving never require these values.
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_WEBHOOK_SECRET?: string
  TURNSTILE_SECRET_KEY?: string
  RATE_LIMIT_HMAC_SECRET?: string
  FEEDBACK_TELEGRAM_CHAT_ID?: string
  NEWS_TELEGRAM_CHANNEL_ID?: string
  ALLOWED_ORIGIN?: string
}
