import type { FeedbackPayload } from '../../shared/feedback.ts'
export type FeedbackRow = {
  id: string; request_hash: string | null; category: FeedbackPayload['category']; description: string;
  contact_email: string | null; athlete_name: string | null; race_name: string | null; active_gender: string | null;
  build_version: string; build_commit: string; delivery_attempts: number; delivery_status: string
}
export async function saveReport(db: D1Database, p: FeedbackPayload, hash: string, now: string) {
  return db.prepare(`INSERT INTO feedback
    (id, created_at, category, description, contact_email, screen, route, athlete_id, athlete_name,
     race_edition_id, race_name, build_version, build_commit, viewport, client_info, request_hash, active_gender, next_delivery_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING RETURNING id`).bind(p.requestId, now, p.category, p.description, p.contactEmail,
      p.context.screen, p.context.route, p.context.athleteId, p.context.athleteName, p.context.raceEditionId,
      p.context.raceName, p.build.version, p.build.commit, JSON.stringify(p.viewport), p.clientInfo, hash, p.context.gender, now).first<{ id: string }>()
}
export const findReport = (db: D1Database, id: string) => db.prepare('SELECT id, request_hash FROM feedback WHERE id = ?').bind(id).first<{ id: string; request_hash: string | null }>()
