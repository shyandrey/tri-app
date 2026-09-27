import { buildMetadata } from '../.generated/build-metadata.ts'
import type { Env } from './env.ts'
import { acceptFeedback, json } from './feedback/handler.ts'
import { retryFeedback, telegramDelivery } from './feedback/delivery.ts'
import type { Deliver } from './feedback/delivery.ts'

export function createWorker(local = false, deliver?: Deliver) {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url), pathname = url.pathname
      if (local && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return json({ error: { code: 'UNAVAILABLE' } }, 503)
      if (pathname !== '/api' && !pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
      if (pathname === '/api/feedback/config') {
        if (request.method !== 'GET') return json({ error: { code: 'METHOD_NOT_ALLOWED' } }, 405, { Allow: 'GET' })
        return json({ mode: local ? 'local' : 'protected', siteKey: env.TURNSTILE_SITE_KEY ?? null })
      }
      if (pathname === '/api/feedback') {
        if (request.method !== 'POST') return json({ error: { code: 'METHOD_NOT_ALLOWED' } }, 405, { Allow: 'POST' })
        return acceptFeedback(request, env, { local, deliver })
      }
      if (pathname !== '/api/health') return json({ error: { code: 'NOT_FOUND', message: 'API route not found' } }, 404)
      if (request.method !== 'GET') return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET' } }, 405, { Allow: 'GET' })
      return json({ ok: true, service: 'tri-app', version: buildMetadata.version, commit: buildMetadata.commit })
    },
    async scheduled(_event: ScheduledController, env: Env) {
      await retryFeedback(env.DB, deliver ?? telegramDelivery(env))
    },
  } satisfies ExportedHandler<Env>
}
// Production never reads a bypass flag from env/request headers.
export default createWorker()
