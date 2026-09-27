export interface Env {
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
