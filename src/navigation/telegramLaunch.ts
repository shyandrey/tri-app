import { allRaceEditionViews } from '../data/raceEditions'
import { sportsArea } from '../sports/loader'
import type { Route } from './history'
import { initialTelegramHash } from './telegramLinks'
import type { TelegramWebApp } from './telegramLinks'

declare global { interface Window { Telegram?: { WebApp?: TelegramWebApp } } }
export async function telegramTargetExists(route: Route) {
  if (route.page === 'race') return allRaceEditionViews.some(r => r.editionId === route.id)
  if (route.page === 'athlete') return (await sportsArea.load()).hasAthlete(route.id)
  return false
}
export function isTelegramLaunch(location: Pick<Location, 'search' | 'hash'>) {
  return [new URLSearchParams(location.search), new URLSearchParams(location.hash.slice(1))]
    .some(params => ['tgWebAppData', 'tgWebAppVersion', 'tgWebAppStartParam'].some(key => params.has(key)))
}
export async function loadTelegramSDK(): Promise<TelegramWebApp | undefined> {
  if (window.Telegram?.WebApp) return window.Telegram.WebApp
  if (!isTelegramLaunch(window.location)) return undefined
  return new Promise(resolve => {
    const script = document.createElement('script')
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      script.onload = script.onerror = null
      resolve(window.Telegram?.WebApp)
    }
    const timer = setTimeout(finish, 3000)
    script.src = 'https://telegram.org/js/telegram-web-app.js'
    script.async = true
    script.onload = script.onerror = finish
    document.head.appendChild(script)
  })
}
export async function prepareTelegramLaunch() {
  const app = await loadTelegramSDK()
  const initialHash = await initialTelegramHash(() => window.location.hash, app, telegramTargetExists)
  return { initialHash, ready: () => { try { app?.ready?.() } catch { /* Browser fallback stays usable. */ } } }
}
