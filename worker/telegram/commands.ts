import type { Env } from '../env.ts'

const json = (status = 200) => Response.json({ ok: status === 200 }, { status, headers: { 'Cache-Control': 'no-store' } })
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const integer = (value: unknown, min = 0): value is number => Number.isSafeInteger(value) && (value as number) >= min

type FailureReason =
  | 'CONFIG_DISABLED' | 'CONFIG_TOKEN_EMPTY' | 'CONFIG_SECRET_EMPTY'
  | 'CONFIG_USERNAME_INVALID' | 'CONFIG_URL_INVALID'
  | 'UPSTREAM_HTTP_ERROR' | 'UPSTREAM_API_ERROR' | 'UPSTREAM_INVALID_JSON'
  | 'UPSTREAM_INVALID_RESULT' | 'UPSTREAM_CHAT_MISMATCH'
  | 'SEND_TIMEOUT' | 'SEND_NETWORK_OR_RUNTIME_ERROR'

const timeout = (error: unknown) => error instanceof Error && error.name === 'TimeoutError'
function failure(reason: FailureReason, status?: number, errorCode?: unknown) {
  const event: Record<string, string | number> = { event: 'telegram_command_failure', reason }
  if (typeof status === 'number' && Number.isInteger(status)) event.http_status = status
  if (typeof errorCode === 'number' && Number.isSafeInteger(errorCode)) event.error_code = errorCode
  // No provider-controlled strings, identifiers, URLs or exception details.
  try { console.warn(JSON.stringify(event)) } catch { /* Diagnostics must not alter the response. */ }
  return json(503)
}

export async function publicTelegramWebhook(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  const token = env.PUBLIC_TELEGRAM_BOT_TOKEN, secret = env.PUBLIC_TELEGRAM_WEBHOOK_SECRET
  const username = env.PUBLIC_TELEGRAM_BOT_USERNAME, appUrl = env.PUBLIC_TELEGRAM_MINI_APP_URL
  if (env.PUBLIC_TELEGRAM_COMMANDS_ENABLED !== 'true') return failure('CONFIG_DISABLED')
  if (!token?.trim()) return failure('CONFIG_TOKEN_EMPTY')
  if (!secret?.trim()) return failure('CONFIG_SECRET_EMPTY')
  if (!username || !/^[A-Za-z0-9_]{5,32}$/.test(username)) return failure('CONFIG_USERNAME_INVALID')
  if (!appUrl) return failure('CONFIG_URL_INVALID')
  try {
    const url = new URL(appUrl)
    if (url.protocol !== 'https:' || url.username || url.password) return failure('CONFIG_URL_INVALID')
  } catch { return failure('CONFIG_URL_INVALID') }
  const supplied = request.headers.get('X-Telegram-Bot-Api-Secret-Token') ?? ''
  const digest = (s: string) => crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  const [a, b] = await Promise.all([digest(supplied), digest(secret)])
  const x = new Uint8Array(a), y = new Uint8Array(b)
  let different = 0
  for (let i = 0; i < x.length; i++) different |= x[i] ^ y[i]
  if (!supplied || different) return json(401)
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(400)
  let input: unknown
  try {
    const reader = request.body?.getReader()
    if (!reader) return json(400)
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const part = await reader.read()
      if (part.done) break
      length += part.value.byteLength
      if (length > 131072) { await reader.cancel(); return json(413) }
      chunks.push(part.value)
    }
    const bytes = new Uint8Array(length)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
    input = JSON.parse(new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes))
  } catch { return json(400) }
  if (!object(input) || !integer(input.update_id)) return json(400)
  if (input.message === undefined) return json()
  const message = input.message
  if (!object(message) || !object(message.chat)) return json(400)
  if (message.chat.type !== 'private') return json()
  if (!integer(message.chat.id, 1) || !integer(message.message_id, 1)) return json(400)
  if (message.text === undefined) return json()
  if (typeof message.text !== 'string' || message.text.length > 4096) return json(400)
  const match = /^\/(start|app|help)(?:@([A-Za-z0-9_]{5,32}))?(?: ([A-Za-z0-9_-]{1,64}))?$/.exec(message.text)
  if (!match || (match[2] && match[2].toLowerCase() !== username.toLowerCase()) || (match[3] && match[1] !== 'start')) return json()
  // Start payload is accepted but never reflected, executed or used as a URL/chat destination.
  const text = match[1] === 'start'
    ? 'Добро пожаловать в 300W⚡!\nКалендарь профессионального триатлона, результаты гонок, профили атлетов, рейтинг и новости — в одном приложении.\nНажмите «Открыть 300W».'
    : match[1] === 'app' ? 'Откройте 300W кнопкой ниже.'
      : '/app — открыть 300W\nНовости и сообщество: https://t.me/trista_watt\nНашли ошибку? В приложении откройте «Ещё» → «Сообщить об ошибке».'
  try {
    const response = await fetcher(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, redirect: 'manual', signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ chat_id: message.chat.id, text, link_preview_options: { is_disabled: true },
        reply_markup: { inline_keyboard: [[{ text: 'Открыть 300W', web_app: { url: appUrl } }]] } }),
    })
    let body: unknown
    try { body = await response.json() } catch (error) {
      if (!response.ok) return failure('UPSTREAM_HTTP_ERROR', response.status)
      return failure(timeout(error) ? 'SEND_TIMEOUT'
        : error instanceof SyntaxError ? 'UPSTREAM_INVALID_JSON' : 'SEND_NETWORK_OR_RUNTIME_ERROR', response.status)
    }
    const errorCode = object(body) ? body.error_code : undefined
    if (!response.ok) return failure('UPSTREAM_HTTP_ERROR', response.status, errorCode)
    if (!object(body)) return failure('UPSTREAM_INVALID_RESULT', response.status)
    if (body.ok !== true) return failure('UPSTREAM_API_ERROR', response.status, errorCode)
    if (!object(body.result) || !integer(body.result.message_id, 1) || !object(body.result.chat))
      return failure('UPSTREAM_INVALID_RESULT', response.status)
    if (body.result.chat.id !== message.chat.id) return failure('UPSTREAM_CHAT_MISMATCH', response.status)
    return json()
  } catch (error) { return failure(timeout(error) ? 'SEND_TIMEOUT' : 'SEND_NETWORK_OR_RUNTIME_ERROR') }
}
