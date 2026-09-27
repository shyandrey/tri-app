import type { Env } from '../env.ts'
import { FeedbackError } from './validation.ts'
export function requireProtection(request: Request, env: Env, local: boolean) {
  const url = new URL(request.url)
  // Local bypass is reachable only through worker/local.ts AND loopback requests.
  if (local && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new FeedbackError(503, 'UNAVAILABLE')
  if (!local && (!env.TURNSTILE_SECRET_KEY || !env.TURNSTILE_SITE_KEY || !env.RATE_LIMIT_HMAC_SECRET || !env.FEEDBACK_RATE_LIMITER || !env.ALLOWED_ORIGIN)) throw new FeedbackError(503, 'UNAVAILABLE')
  if (request.headers.get('Origin') !== (local ? url.origin : env.ALLOWED_ORIGIN)) throw new FeedbackError(403, 'ORIGIN')
}
export async function rateLimit(request: Request, env: Env, local: boolean) {
  if (local) return
  const ip = request.headers.get('CF-Connecting-IP')
  if (!ip) throw new FeedbackError(503, 'UNAVAILABLE')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.RATE_LIMIT_HMAC_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ip))
  const bucket = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
  if (!(await env.FEEDBACK_RATE_LIMITER!.limit({ key: bucket })).success) throw new FeedbackError(429, 'RATE_LIMIT')
}
export async function verifyTurnstile(token: string, env: Env, local: boolean, fetcher: typeof fetch = fetch) {
  if (local) { if (token !== 'local-feedback') throw new FeedbackError(400, 'CHALLENGE'); return }
  if (!token) throw new FeedbackError(400, 'CHALLENGE')
  const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8000),
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
  })
  const result = await response.json() as { success?: boolean; hostname?: string; action?: string }
  if (!response.ok || !result.success || result.hostname !== new URL(env.ALLOWED_ORIGIN!).hostname || result.action !== 'feedback') throw new FeedbackError(400, 'CHALLENGE')
}
