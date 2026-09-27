import { formErrors } from '../../shared/feedback.ts'
import type { FeedbackPayload } from '../../shared/feedback.ts'
export class FeedbackError extends Error {
  status: number
  code: string
  constructor(status: number, code: string) { super(code); this.status = status; this.code = code }
}
const bad = (): never => { throw new FeedbackError(400, 'VALIDATION') }
const object = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : bad()
// Reject non-printing controls while allowing ordinary plain-text newlines/tabs.
// eslint-disable-next-line no-control-regex
const text = (v: unknown, max: number): string => typeof v === 'string' && v.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v) ? v : bad()
const nullable = (v: unknown, max: number) => v === null ? null : text(v, max)
export async function readPayload(request: Request): Promise<FeedbackPayload> {
  if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) bad()
  if (Number(request.headers.get('Content-Length')) > 16384) throw new FeedbackError(413, 'BODY_TOO_LARGE')
  const reader = request.body?.getReader()
  if (!reader) throw new FeedbackError(400, 'VALIDATION')
  const chunks: Uint8Array[] = []; let size = 0
  while (true) {
    const part = await reader.read(); if (part.done) break
    size += part.value.byteLength
    if (size > 16384) { await reader.cancel(); throw new FeedbackError(413, 'BODY_TOO_LARGE') }
    chunks.push(part.value)
  }
  const bytes = new Uint8Array(size); let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  let data: unknown
  try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)) } catch { bad() }
  const v = object(data), c = object(v.context), b = object(v.build), viewport = object(v.viewport)
  // Explicit allowlist reconstruction: unknown keys are never stored or forwarded.
  const category = text(v.category, 20), description = text(v.description, 4000).trim(), email = nullable(v.contactEmail, 254)?.trim() || null
  if (Object.keys(formErrors(category, description, email ?? '')).length) bad()
  const requestId = text(v.requestId, 36)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) bad()
  const screen = text(c.screen, 16), route = text(c.route, 220)
  if (!['more', 'athlete', 'race'].includes(screen)) bad()
  if (!(screen === 'more' ? route === '#/more' : new RegExp(`^#/${screen}/[A-Za-z0-9_-]+$`).test(route))) bad()
  const athleteId = c.athleteId === null ? null : Number.isSafeInteger(c.athleteId) && Number(c.athleteId) > 0 ? c.athleteId as number : bad()
  const athleteName = nullable(c.athleteName, 300), raceEditionId = nullable(c.raceEditionId, 160), raceName = nullable(c.raceName, 300)
  if (screen === 'athlete' && (athleteId === null || route !== `#/athlete/${athleteId}` || !athleteName)) bad()
  if (screen === 'race' && (!raceEditionId || route !== `#/race/${raceEditionId}` || !raceName)) bad()
  if (screen !== 'athlete' && (athleteId !== null || athleteName !== null)) bad()
  if (screen !== 'race' && (raceEditionId !== null || raceName !== null || c.gender !== null)) bad()
  if (c.gender !== null && c.gender !== 'M' && c.gender !== 'W') bad()
  for (const n of [viewport.width, viewport.height]) if (!Number.isInteger(n) || Number(n) < 1 || Number(n) > 20000) bad()
  const version = text(b.version, 64), commit = text(b.commit, 40)
  if (!/^(unknown|[a-f0-9]{40})$/.test(commit) || !version.trim()) bad()
  const clientInfo = nullable(v.clientInfo, 512)
  return { requestId: requestId.toLowerCase(), category: category as FeedbackPayload['category'], description, contactEmail: email,
    context: { screen: screen as FeedbackPayload['context']['screen'], route, athleteId, athleteName, raceEditionId, raceName, gender: c.gender as 'M' | 'W' | null },
    build: { version, commit }, viewport: { width: viewport.width as number, height: viewport.height as number },
    clientInfo: category === 'app' ? clientInfo : null, turnstileToken: text(v.turnstileToken, 2048), website: text(v.website, 200) }
}
export async function payloadHash(payload: FeedbackPayload) {
  const stored = { ...payload, turnstileToken: undefined, website: undefined }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(stored)))
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}
