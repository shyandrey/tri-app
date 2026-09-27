import type { FeedbackPayload } from '../../shared/feedback.ts'
export async function sendFeedback(payload: FeedbackPayload, fetcher: typeof fetch = fetch): Promise<string> {
  let response: Response
  try {
    response = await fetcher('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(20000) })
  } catch { throw Error('Не удалось связаться с сервером. Проверьте соединение и повторите отправку.') }
  let body: { ok?: boolean; reportId?: string; error?: { code?: string } } = {}
  try { body = await response.json() } catch { /* generic safe message below */ }
  if ((response.status === 201 || response.status === 409) && body.ok && body.reportId === payload.requestId) return body.reportId
  if (response.status === 429) throw Error('Слишком много обращений. Подождите минуту и попробуйте снова.')
  if (response.status === 409) throw Error('Этот номер обращения уже использован с другим текстом. Вернитесь назад и откройте новую форму.')
  if (body.error?.code === 'CHALLENGE') throw Error('Пройдите проверку ещё раз и повторите отправку.')
  if (response.status === 400 || response.status === 413) throw Error('Проверьте поля формы и длину сообщения.')
  throw Error('Сейчас не удалось сохранить сообщение. Ваш текст остался в форме — попробуйте позже.')
}
