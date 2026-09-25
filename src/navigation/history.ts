import type { Page } from '../types/Page.ts'

export type Route = { page: Page; id?: string }
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }
export type Entry = { version: 1; key: string; parent: string | null; route: Route; ui: Record<string, Json>; scroll: { x: number; y: number; elements: Record<string, number> } }
export type HistoryPort = { state: unknown; pushState: (state: unknown, unused: string, url: string) => void; replaceState: (state: unknown, unused: string, url: string) => void; back: () => void }
const pages: Page[] = ['home', 'calendar', 'athletes', 'top', 'more', 'race', 'athlete']
export const routeURL = (route: Route) => `#/${route.page}${route.id ? '/' + encodeURIComponent(route.id) : ''}`
export function parseRoute(hash: string): Route {
  try {
    const [page, id, extra] = hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent)
    if (!pages.includes(page as Page) || extra !== undefined) return { page: 'home' }
    if (page === 'race' || page === 'athlete') return id ? { page, id } : fallback({ page })
    return { page: page as Page }
  } catch { return { page: 'home' } }
}
export function fallback(route: Route): Route {
  return { page: route.page === 'race' ? 'calendar' : route.page === 'athlete' ? 'athletes' : 'home' }
}
function readEntry(state: unknown): Entry | null {
  const e = (state as { triNavigation?: Entry } | null)?.triNavigation
  if (!e || e.version !== 1 || typeof e.key !== 'string' || !(e.parent === null || typeof e.parent === 'string') || !e.route || !pages.includes(e.route.page)) return null
  if ((e.route.page === 'race' || e.route.page === 'athlete') && typeof e.route.id !== 'string') return null
  if (!e.ui || Array.isArray(e.ui) || typeof e.ui !== 'object' || !e.scroll || !Number.isFinite(e.scroll.x) || !Number.isFinite(e.scroll.y) || e.scroll.y < 0 || !e.scroll.elements || typeof e.scroll.elements !== 'object') return null
  return e
}
export class NavigationHistory {
  current: Entry
  private port: HistoryPort
  private entries = new Map<string, Entry>()
  private resolve: (route: Route) => Route
  private waiting = false
  constructor(port: HistoryPort, hash: string, resolve: (route: Route) => Route = r => r) {
    this.port = port
    this.resolve = resolve
    const saved = readEntry(port.state)
    const route = resolve(parseRoute(hash))
    if (saved && routeURL(saved.route) === routeURL(route)) {
      this.current = saved
    } else {
      // Seed one safe predecessor for a direct detail link, shared by UI/browser Back.
      this.current = this.create(route.id ? fallback(route) : route, null)
      this.write(false)
      if (route.id) {
        this.current = this.create(route, this.current.key)
        this.write(true)
      }
    }
    this.entries.set(this.current.key, this.current)
  }
  private create(route: Route, parent: string | null): Entry {
    return { version: 1, key: crypto.randomUUID(), parent, route, ui: {}, scroll: { x: 0, y: 0, elements: {} } }
  }
  private write(push: boolean) {
    this.entries.set(this.current.key, this.current)
    const state = { triNavigation: this.current }
    if (push) this.port.pushState(state, '', routeURL(this.current.route))
    else this.port.replaceState(state, '', routeURL(this.current.route))
  }
  saveUI(key: string, value: Json) {
    this.current = { ...this.current, ui: { ...this.current.ui, [key]: value } }
    this.write(false)
  }
  saveScroll(scroll: Entry['scroll'], persist = true) {
    this.current = { ...this.current, scroll }
    this.entries.set(this.current.key, this.current)
    if (persist) this.write(false)
  }
  navigate(route: Route) {
    if (this.waiting) return false
    route = this.resolve(route)
    if (routeURL(route) === routeURL(this.current.route)) return false
    this.current = this.create(route, this.current.key)
    this.write(true)
    return true
  }
  back() {
    if (this.waiting) return false
    if (this.current.parent) { this.waiting = true; this.port.back(); return false }
    const route = fallback(this.current.route)
    if (routeURL(route) === routeURL(this.current.route)) return false
    this.current = this.create(route, null)
    this.write(false)
    return true
  }
  pop(state: unknown, hash: string) {
    this.waiting = false
    const saved = readEntry(state)
    const route = this.resolve(parseRoute(hash))
    this.current = saved && routeURL(saved.route) === routeURL(route)
      ? this.entries.get(saved.key) ?? saved
      : this.create(route, null)
    this.write(false) // Never push during popstate: Forward remains available.
  }
}
