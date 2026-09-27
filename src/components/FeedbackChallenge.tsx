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
export default function FeedbackChallenge({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const element = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let cancelled = false, widget: string | undefined
    void loadWidget().then(() => {
      if (cancelled || !element.current || !window.turnstile) return
      widget = window.turnstile.render(element.current, { sitekey: siteKey, action: 'feedback', callback: onToken,
        'expired-callback': () => onToken(''), 'error-callback': () => onToken('') })
    }).catch(() => onToken(''))
    return () => { cancelled = true; if (widget !== undefined) window.turnstile?.remove(widget) }
  }, [siteKey, onToken])
  return <div ref={element} aria-label="Проверка перед отправкой" />
}
