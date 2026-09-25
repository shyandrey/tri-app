import { useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { NavigationHistory, routeURL } from './history'
import type { Route } from './history'
import { NavigationContext } from './usePageState'

const scrollElements = () => [...document.querySelectorAll<HTMLElement>('[data-navigation-scroll]')]
export function NavigationRoot({ resolve, children }: { resolve: (route: Route) => Route; children: (route: Route, navigate: (route: Route) => void, back: () => void) => ReactNode }) {
  const [navigation] = useState(() => new NavigationHistory(window.history, window.location.hash, resolve))
  const [entry, setEntry] = useState(navigation.current)
  const capture = (persist = true) => navigation.saveScroll({ x: window.scrollX, y: window.scrollY, elements: Object.fromEntries(scrollElements().map((e, i) => [e.dataset.navigationScroll || String(i), e.scrollLeft])) }, persist)
  useLayoutEffect(() => {
    const previous = history.scrollRestoration
    history.scrollRestoration = 'manual'
    const pop = (event: PopStateEvent) => { navigation.pop(event.state, location.hash); setEntry(navigation.current) }
    window.addEventListener('popstate', pop)
    return () => { history.scrollRestoration = previous; window.removeEventListener('popstate', pop) }
  }, [navigation])
  useLayoutEffect(() => {
    let restoring = true
    const scroll = entry.scroll
    const restore = () => {
      window.scrollTo({ left: scroll.x, top: scroll.y, behavior: 'instant' })
      scrollElements().forEach((e, i) => { e.scrollLeft = scroll.elements[e.dataset.navigationScroll || String(i)] ?? 0 })
    }
    restore()
    const frame = requestAnimationFrame(() => { restore(); restoring = false })
    let timer: ReturnType<typeof setTimeout> | undefined
    const flush = () => { if (navigation.current.key === entry.key) capture() }
    const save = () => {
      if (restoring || navigation.current.key !== entry.key) return
      capture(false) // Keep Back/Forward accurate without writing History API at scroll-frame frequency.
      clearTimeout(timer)
      timer = setTimeout(flush, 150)
    }
    window.addEventListener('scroll', save, true)
    window.addEventListener('pagehide', flush)
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); window.removeEventListener('scroll', save, true); window.removeEventListener('pagehide', flush) }
    // Entry identity alone triggers restoration; ordinary UI edits must not jump the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.key])
  const navigate = (route: Route) => {
    capture()
    if (routeURL(route) === routeURL(navigation.current.route)) { window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    if (navigation.navigate(route)) setEntry(navigation.current)
  }
  const back = () => { capture(); if (navigation.back()) setEntry(navigation.current) }
  return <NavigationContext.Provider value={navigation}><div key={entry.key} style={{ display: 'contents' }}>{children(entry.route, navigate, back)}</div></NavigationContext.Provider>
}
