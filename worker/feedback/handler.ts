import type { Env } from '../env.ts'
import { readPayload, payloadHash, FeedbackError } from './validation.ts'
import { findReport, saveReport } from './storage.ts'
import { deliverReport, telegramDelivery } from './delivery.ts'
import type { Deliver } from './delivery.ts'
import { requireProtection, rateLimit, verifyTurnstile } from './antispam.ts'
export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } })
export async function acceptFeedback(request: Request, env: Env, options: { local?: boolean; deliver?: Deliver; fetcher?: typeof fetch } = {}) {
  try {
    const local = options.local === true
    requireProtection(request, env, local)
    await rateLimit(request, env, local)
    const payload = await readPayload(request)
    if (payload.website) throw new FeedbackError(400, 'VALIDATION')
    const hash = await payloadHash(payload)
    const duplicate = (row: { id: string; request_hash: string | null }) => row.request_hash === hash
      ? json({ ok: true, reportId: row.id }, 409)
      : json({ ok: false, error: { code: 'IDEMPOTENCY_CONFLICT' } }, 409)
    // Replays may have an already-consumed challenge token. Exact stored hash + random UUID
    // allow safe acknowledgement without reusing Turnstile or sending another notification.
    const existing = await findReport(env.DB, payload.requestId)
    if (existing) return duplicate(existing)
    await verifyTurnstile(payload.turnstileToken, env, local, options.fetcher)
    const created = await saveReport(env.DB, payload, hash, new Date().toISOString())
    if (!created) {
      const raced = await findReport(env.DB, payload.requestId)
      if (!raced) throw Error('STORAGE')
      return duplicate(raced)
    }
    // Successful INSERT is committed before any external delivery. Even bookkeeping
    // failure must not turn an accepted report into a user-visible storage failure.
    try { await deliverReport(env.DB, created.id, options.deliver ?? telegramDelivery(env)) } catch { /* scheduled retry */ }
    return json({ ok: true, reportId: created.id }, 201)
  } catch (error) {
    const known = error instanceof FeedbackError
    return json({ ok: false, error: { code: known ? error.code : 'UNAVAILABLE' } }, known ? error.status : 503,
      error instanceof FeedbackError && error.status === 429 ? { 'Retry-After': '60' } : {})
  }
}
