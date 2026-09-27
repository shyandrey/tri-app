import { useEffect, useRef, useState } from 'react'
import { feedbackCategories, formErrors } from '../../shared/feedback'
import type { FeedbackCategory, FeedbackContext, FeedbackPayload } from '../../shared/feedback'
import { buildMetadata } from '../utils/buildMetadata'
import { sendFeedback } from '../api/feedback'
import FeedbackChallenge from '../components/FeedbackChallenge'
import '../feedback.css'

export default function FeedbackPage({ context, onBack }: { context: FeedbackContext; onBack: () => void }) {
  const [category, setCategory] = useState<FeedbackCategory>(context.screen === 'race' ? 'results' : context.screen === 'athlete' ? 'athlete' : 'app')
  const [description, setDescription] = useState(''), [email, setEmail] = useState(''), [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({}), [error, setError] = useState('')
  const [reportId, setReportId] = useState(''), [token, setToken] = useState(''), [challengeAttempt, setChallengeAttempt] = useState(0)
  const [config, setConfig] = useState<{ mode: string; siteKey: string | null } | null>(null)
  const [configAttempt, setConfigAttempt] = useState(0)
  const lastAttempt = useRef<{ signature: string; payload: FeedbackPayload } | null>(null)
  const busy = useRef(false), heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  useEffect(() => {
    let active = true
    void fetch('/api/feedback/config', { signal: AbortSignal.timeout(10000) }).then(async r => {
      if (!r.ok) throw Error()
      const c = await r.json() as { mode: string; siteKey: string | null }
      if (c.mode !== 'local' && (c.mode !== 'protected' || !c.siteKey)) throw Error()
      if (active) { setConfig(c); if (c.mode === 'local') setToken('local-feedback') }
    }).catch(() => { if (active) setError('Не удалось подготовить отправку. Повторите подключение ниже.') })
    return () => { active = false }
  }, [configAttempt])
  const contextLabel = context.screen === 'athlete' ? `Отчёт об атлете: ${context.athleteName}`
    : context.screen === 'race' ? `Отчёт о гонке: ${context.raceName}${context.gender ? ' · ' + (context.gender === 'M' ? 'MEN' : 'WOMEN') : ''}` : 'Общий отзыв о TRI APP'
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const problems = formErrors(category, description, email.trim())
    setErrors(problems); setError('')
    if (Object.keys(problems).length) { document.getElementById(`feedback-${Object.keys(problems)[0]}`)?.focus(); return }
    if (!token) { setError('Пройдите проверку перед отправкой. Если она не загрузилась, повторите подключение.'); return }
    const signature = JSON.stringify([category, description.trim(), email.trim()])
    // Preserve the exact original snapshot/UUID after an ambiguous network outcome.
    // Editing content explicitly creates a new report; refreshing only the token does not.
    if (lastAttempt.current?.signature !== signature) lastAttempt.current = { signature, payload: {
      requestId: crypto.randomUUID(), category, description: description.trim(), contactEmail: email.trim() || null, context,
      build: buildMetadata, viewport: { width: innerWidth, height: innerHeight },
      clientInfo: category === 'app' ? navigator.userAgent.slice(0, 512) : null, turnstileToken: token, website,
    } }
    busy.current = true; setState('sending')
    try {
      const id = await sendFeedback({ ...lastAttempt.current.payload, turnstileToken: token, website })
      setReportId(id); setState('success')
    } catch (e) {
      setState('error'); setError(e instanceof Error ? e.message : 'Не удалось отправить сообщение.')
      if (config?.mode !== 'local') { setToken(''); setChallengeAttempt(n => n + 1) }
    } finally { busy.current = false }
  }
  return <main className="app feedback-page">
    <button className="page-back-button" type="button" onClick={onBack}>← Назад</button>
    <section className="section">
      <h1 ref={heading} tabIndex={-1}>Сообщить об ошибке</h1>
      <p className="feedback-context">{contextLabel}</p>
      {state === 'success' ? <div role="status" className="feedback-success">
        <h2>Спасибо за сообщение</h2><p>Мы получили и сохранили ваше обращение.</p>
        <small>Номер: {reportId}</small><button type="button" onClick={onBack}>Назад</button>
      </div> : <form onSubmit={submit} noValidate aria-busy={state === 'sending'}>
        <fieldset disabled={state === 'sending'}>
          <label htmlFor="feedback-category">Категория</label>
          <select id="feedback-category" value={category} onChange={e => setCategory(e.target.value as FeedbackCategory)} required aria-invalid={!!errors.category} aria-describedby="feedback-category-error">
            {Object.entries(feedbackCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select><span id="feedback-category-error">{errors.category}</span>
          <label htmlFor="feedback-description">Описание</label>
          <textarea id="feedback-description" value={description} onChange={e => setDescription(e.target.value)} minLength={10} maxLength={4000} required rows={7} aria-invalid={!!errors.description} aria-describedby="feedback-description-hint feedback-description-error" />
          <small id="feedback-description-hint">От 10 до 4000 символов · {description.length}/4000</small><span id="feedback-description-error">{errors.description}</span>
          <label htmlFor="feedback-email">Email для ответа (необязательно)</label>
          <input id="feedback-email" type="email" autoComplete="email" value={email} maxLength={254} onChange={e => setEmail(e.target.value)} aria-invalid={!!errors.email} aria-describedby="feedback-email-error" />
          <span id="feedback-email-error">{errors.email}</span>
          <div className="feedback-honeypot" aria-hidden="true"><label htmlFor="feedback-website">Сайт</label><input id="feedback-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
          <p className="feedback-privacy">Описание и технический контекст будут сохранены для обработки обращения. Email необязателен; без него мы не сможем ответить лично.</p>
          {config?.mode === 'protected' && config.siteKey && <FeedbackChallenge key={challengeAttempt} siteKey={config.siteKey} onToken={setToken} />}
          {(!config || (config.mode !== 'local' && !token)) && <button type="button" onClick={() => { setError(''); setConfigAttempt(n => n + 1); setChallengeAttempt(n => n + 1) }}>Повторить подключение</button>}
          {error && <p role="alert">{error}</p>}
          <button className="feedback-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Отправляем…' : 'Отправить'}</button>
          <span role="status">{state === 'sending' ? 'Сохраняем обращение…' : ''}</span>
        </fieldset>
      </form>}
    </section>
  </main>
}
