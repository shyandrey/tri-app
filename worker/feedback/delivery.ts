import { feedbackCategories } from '../../shared/feedback.ts'
import type { Env } from '../env.ts'
import type { FeedbackRow } from './storage.ts'
export type Deliver = (row: FeedbackRow) => Promise<void>
export function telegramText(row: FeedbackRow) {
  return ['TRI APP · Новый report', `#${row.id}`, feedbackCategories[row.category],
    row.athlete_name ? `Атлет: ${row.athlete_name}` : '', row.race_name ? `Гонка: ${row.race_name}` : '',
    row.active_gender === 'M' ? 'MEN' : row.active_gender === 'W' ? 'WOMEN' : '',
    'Сообщение:', row.description.length > 2800 ? row.description.slice(0, 2800) + '\n[Полный текст сохранён в D1]' : row.description,
    row.contact_email ? `Контакт: ${row.contact_email}` : '', `Build: ${row.build_version} / ${row.build_commit}`].filter(Boolean).join('\n\n')
}
export const telegramDelivery = (env: Env, fetcher: typeof fetch = fetch): Deliver => async row => {
  if (!env.TELEGRAM_BOT_TOKEN || !env.FEEDBACK_TELEGRAM_CHAT_ID) throw Error('DELIVERY_UNCONFIGURED')
  const response = await fetcher(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8000),
    body: JSON.stringify({ chat_id: env.FEEDBACK_TELEGRAM_CHAT_ID, text: telegramText(row), link_preview_options: { is_disabled: true } }),
  })
  if (!response.ok || !(await response.json() as { ok?: boolean }).ok) throw Error('DELIVERY_FAILED')
}
export async function deliverReport(db: D1Database, id: string, deliver: Deliver, now = new Date()) {
  const lease = crypto.randomUUID(), at = now.toISOString()
  const row = await db.prepare(`UPDATE feedback SET delivery_lease = ?, delivery_attempts = delivery_attempts + 1,
    last_delivery_at = ?, next_delivery_at = ? WHERE id = ? AND delivery_status IN ('pending', 'failed')
    AND delivery_attempts < 5 AND (next_delivery_at IS NULL OR next_delivery_at <= ?) RETURNING *`)
    .bind(lease, at, new Date(now.getTime() + 60000).toISOString(), id, at).first<FeedbackRow>()
  if (!row) return
  let sent = false
  try { await deliver(row); sent = true } catch { /* Do not log payloads, URLs with tokens, or provider errors. */ }
  const retryAt = new Date(now.getTime() + Math.min(3600, 60 * 2 ** row.delivery_attempts) * 1000).toISOString()
  await db.prepare(`UPDATE feedback SET delivery_status = ?, next_delivery_at = ?, delivery_lease = NULL
    WHERE id = ? AND delivery_lease = ?`).bind(sent ? 'sent' : 'failed', sent || row.delivery_attempts >= 5 ? null : retryAt, id, lease).run()
}
export async function retryFeedback(db: D1Database, deliver: Deliver, now = new Date()) {
  const rows = await db.prepare(`SELECT id FROM feedback WHERE delivery_status IN ('pending', 'failed')
    AND delivery_attempts < 5 AND (next_delivery_at IS NULL OR next_delivery_at <= ?)
    ORDER BY created_at LIMIT 10`).bind(now.toISOString()).all<{ id: string }>()
  for (const row of rows.results) await deliverReport(db, row.id, deliver, now)
}
