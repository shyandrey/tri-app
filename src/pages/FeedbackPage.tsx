import { useCallback, useEffect, useRef, useState } from 'react'
import { feedbackCategories, formErrors } from '../../shared/feedback'
import type { FeedbackCategory, FeedbackContext, FeedbackPayload } from '../../shared/feedback'
import { buildMetadata } from '../utils/buildMetadata'
import { sendFeedback } from '../api/feedback'
import FeedbackChallenge from '../components/FeedbackChallenge'
import '../feedback.css'

export default function FeedbackPage({ context, onBack }: { context: FeedbackContext; onBack: () => void }) {
  const [category, setCategory] = useState<FeedbackCategory>(context.screen === 'race' ? 'results' : context.screen === 'athlete' ? 'athlete' : 'app')
  const [description, setDescription] = useState(''), [email, setEmail] = useState(''), [website, setWebsite] = useState('')
  const [state, setState] = useState<'idle' | 'verifying' | 'sending' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({}), [error, setError] = useState('')
  const [reportId, setReportId] = useState(''), [token, setToken] = useState(''), [challengeAttempt, setChallengeAttempt] = useState(0)
  const [config, setConfig] = useState<{ mode: string; siteKey: string | null } | null>(null)
  const [configAttempt, setConfigAttempt] = useState(0)
  const lastAttempt = useRef<{ signature: string; payload: FeedbackPayload } | null>(null)
  const busy = useRef(false), heading = useRef<HTMLHeadingElement>(null)
  const tokenRef = useRef('')
  const waiting = useRef<{ resolve: (token: string) => void; reject: (error: Error) => void } | null>(null)
  const mounted = useRef(true)
  const [challengeError, setChallengeError] = useState('')
  const [interactive, setInteractive] = useState(false)
  const pending = state === 'verifying' || state === 'sending'
  const receiveToken = useCallback((value: string) => {
    tokenRef.current = value; setToken(value)
    if (value) { setChallengeError(''); waiting.current?.resolve(value); waiting.current = null }
  }, [])
  const challengeIssue = useCallback((message: string) => {
    setInteractive(false); setChallengeError(message)
    waiting.current?.reject(Error(message)); waiting.current = null
  }, [])
  useEffect(() => {
    mounted.current = true; heading.current?.focus()
    return () => { mounted.current = false; waiting.current?.reject(Error('cancelled')); waiting.current = null }
  }, [])
  useEffect(() => {
    let active = true
    void fetch('/api/feedback/config', { signal: AbortSignal.timeout(10000) }).then(async r => {
      if (!r.ok) throw Error()
      const c = await r.json() as { mode: string; siteKey: string | null }
      if (c.mode !== 'local' && (c.mode !== 'protected' || !c.siteKey)) throw Error()
      if (active) { setConfig(c); if (c.mode === 'local') receiveToken('local-feedback') }
    }).catch(() => { if (active) setError('Не удалось подготовить отправку. Повторите подключение ниже.') })
    return () => { active = false }
  }, [configAttempt, receiveToken])
  const contextLabel = context.screen === 'athlete' ? `Отчёт об атлете: ${context.athleteName}`
    : context.screen === 'race' ? `Отчёт о гонке: ${context.raceName}${context.gender ? ' · ' + (context.gender === 'M' ? 'MEN' : 'WOMEN') : ''}` : 'Общий отзыв о 300W⚡'
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    const problems = formErrors(category, description, email.trim())
    setErrors(problems); setError('')
    if (Object.keys(problems).length) { document.getElementById(`feedback-${Object.keys(problems)[0]}`)?.focus(); return }
    if (!config) { setError('Не удалось подготовить отправку. Повторите подключение ниже.'); return }
    const signature = JSON.stringify([category, description.trim(), email.trim()])
    // Preserve the exact original snapshot/UUID after an ambiguous network outcome.
    // Editing content explicitly creates a new report; refreshing only the token does not.
    if (lastAttempt.current?.signature !== signature) lastAttempt.current = { signature, payload: {
      requestId: crypto.randomUUID(), category, description: description.trim(), contactEmail: email.trim() || null, context,
      build: buildMetadata, viewport: { width: innerWidth, height: innerHeight },
      clientInfo: category === 'app' ? navigator.userAgent.slice(0, 512) : null, turnstileToken: token, website,
    } }
    busy.current = true
    let posting = false
    try {
      let currentToken = tokenRef.current
      if (!currentToken) {
        setState('verifying'); setChallengeError('')
        currentToken = await new Promise<string>((resolve, reject) => {
          const timer = window.setTimeout(() => reject(Error('Проверка заняла слишком много времени. Повторите подключение и попробуйте снова.')), 90000)
          waiting.current = {
            resolve: value => { clearTimeout(timer); resolve(value) },
            reject: reason => { clearTimeout(timer); reject(reason) },
          }
        })
      }
      if (!mounted.current) return
      posting = true; setState('sending')
      const id = await sendFeedback({ ...lastAttempt.current.payload, turnstileToken: currentToken, website })
      if (!mounted.current) return
      setReportId(id); setState('success')
    } catch (e) {
      if (!mounted.current) return
      setState('error')
      const message = e instanceof Error ? e.message : 'Не удалось отправить сообщение.'
      if (posting) setError(message)
      else setChallengeError(message)
      if (config.mode !== 'local') {
        receiveToken('')
        if (posting) setChallengeAttempt(n => n + 1)
      }
    } finally { busy.current = false; waiting.current = null }
  }
  return <main className="app feedback-page">
    <button className="page-back-button" type="button" onClick={onBack}>← Назад</button>
    <section className="section">
      <h1 ref={heading} tabIndex={-1}>Сообщить об ошибке</h1>
      <p className="feedback-context">{contextLabel}</p>
      {state === 'success' ? <div role="status" className="feedback-success">
        <h2>Спасибо за сообщение</h2><p>Мы получили и сохранили ваше обращение.</p>
        <small>Номер: {reportId}</small><button type="button" onClick={onBack}>Назад</button>
      </div> : <form onSubmit={submit} noValidate aria-busy={pending}>
        <fieldset disabled={pending}>
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
        </fieldset>
          {config?.mode === 'protected' && config.siteKey && <FeedbackChallenge key={challengeAttempt} siteKey={config.siteKey} onToken={receiveToken} onIssue={challengeIssue} onInteraction={setInteractive} />}
          {!pending && (!config || (config.mode !== 'local' && !token)) && <button type="button" onClick={() => { setError(''); setChallengeError(''); setInteractive(false); receiveToken(''); setConfigAttempt(n => n + 1); setChallengeAttempt(n => n + 1) }}>Повторить подключение</button>}
          {challengeError && <p role="alert">{challengeError}</p>}
          {error && <p role="alert">{error}</p>}
          <button className="feedback-submit" type="submit" disabled={pending}>{state === 'verifying' ? 'Проверяем…' : state === 'sending' ? 'Отправляем…' : 'Отправить'}</button>
          <span role="status">{state === 'verifying' ? (interactive ? 'Завершите проверку Cloudflare. После неё сообщение отправится автоматически.' : 'Ждём завершения проверки Cloudflare. Повторно нажимать не нужно.') : state === 'sending' ? 'Сохраняем обращение…' : interactive ? 'Завершите проверку Cloudflare перед отправкой.' : ''}</span>
      </form>}
    </section>
  </main>
}
