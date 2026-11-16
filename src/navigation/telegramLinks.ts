import { parseRoute, routeURL } from './history.ts'
import type { Route } from './history.ts'

// Main Mini App: no short-name path. Bot identity is owner-confirmed in telegram-commands.md.
export const TELEGRAM_MAIN_APP = 'https://t.me/tri_app_bot'
export const MAX_START_PARAMETER = 128 // Local contract, deliberately bounded.
export type TelegramWebApp = { initDataUnsafe?: { start_param?: unknown }; ready?: () => void }
export function parseStartParameter(value: unknown): Route | null {
  if (typeof value !== 'string' || value.length > MAX_START_PARAMETER) return null
  const race = /^race_([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(value)
  if (race) return { page: 'race', id: race[1] }
  const athlete = /^athlete_([1-9][0-9]*)$/.exec(value)
  if (athlete && Number.isSafeInteger(Number(athlete[1]))) return { page: 'athlete', id: athlete[1] }
  return null
}
export function hasDirectHash(hash: string) {
  // Only app-route fragments, never Telegram's tgWebAppData launch fragment.
  const normalized = '#/' + hash.replace(/^#\/?/, '')
  return hash.startsWith('#') && routeURL(parseRoute(hash)) === normalized
}
export async function resolveStartParameter(value: unknown, exists: (route: Route) => Promise<boolean>): Promise<Route | null> {
  const route = parseStartParameter(value)
  return route && await exists(route) ? route : null
}
export async function telegramLink(route: Route, exists: (route: Route) => Promise<boolean>): Promise<string> {
  const payload = `${route.page}_${route.id ?? ''}`
  if (!await resolveStartParameter(payload, exists)) throw new Error('Unknown or unsupported Telegram link target')
  return `${TELEGRAM_MAIN_APP}?startapp=${payload}`
}
export const raceTelegramLink = (id: string, exists: (route: Route) => Promise<boolean>) => telegramLink({ page: 'race', id }, exists)
export const athleteTelegramLink = (id: number, exists: (route: Route) => Promise<boolean>) => telegramLink({ page: 'athlete', id: String(id) }, exists)

// Capture once outside React: StrictMode render/effect replay cannot launch twice.
export async function initialTelegramHash(getHash: () => string, app: TelegramWebApp | undefined, exists: (route: Route) => Promise<boolean>): Promise<string | undefined> {
  if (hasDirectHash(getHash())) return undefined
  try {
    const route = await resolveStartParameter(app?.initDataUnsafe?.start_param, exists)
    // A navigation during asynchronous catalog loading has precedence too.
    return route && !hasDirectHash(getHash()) ? routeURL(route) : undefined
  } catch { return undefined } // SDK/catalog failure is not permission to guess a target.
}
