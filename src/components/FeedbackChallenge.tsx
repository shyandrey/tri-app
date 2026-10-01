import { useEffect, useRef } from 'react'
type Turnstile = { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void }
declare global { interface Window { turnstile?: Turnstile } }
let loading: Promise<void> | undefined
function loadWidget() {
  if (window.turnstile) return Promise.resolve()
  if (!loading) loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true; script.onload = () => resolve(); script.onerror = () => { script.remove(); loading = undefined; reject(Error('challenge')) }
    document.head.appendChild(script)
  })
  return loading
}
export default function FeedbackChallenge({ siteKey, onToken, onIssue, onInteraction }: { siteKey: string; onToken: (token: string) => void; onIssue: (message: string) => void; onInteraction: (active: boolean) => void }) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false, widget: string | undefined
    void loadWidget().then(() => {
      if (cancelled || !element.current || !window.turnstile) return
      const issue = (message: string) => { if (!cancelled) { onToken(''); onIssue(message) } }
      widget = window.turnstile.render(element.current, { sitekey: siteKey, action: 'feedback',
        callback: (token: string) => { if (!cancelled) { onInteraction(false); onToken(token) } },
        'before-interactive-callback': () => { if (!cancelled) onInteraction(true) },
        'after-interactive-callback': () => { if (!cancelled) onInteraction(false) },
        'expired-callback': () => issue('Срок проверки истёк. Пройдите её ещё раз и нажмите «Отправить».'),
        'timeout-callback': () => issue('Проверка не завершена. Повторите подключение и попробуйте снова.'),
        'unsupported-callback': () => issue('Проверка недоступна в этом браузере. Попробуйте другой браузер.'),
        'error-callback': () => issue('Не удалось пройти проверку. Повторите подключение и попробуйте снова.') })
    }).catch(() => { if (!cancelled) { onToken(''); onIssue('Не удалось загрузить проверку. Повторите подключение.') } })
    return () => { cancelled = true; if (widget !== undefined) window.turnstile?.remove(widget) }
  }, [siteKey, onToken, onIssue, onInteraction])
  return <div ref={element} aria-label="Проверка перед отправкой" />
}
