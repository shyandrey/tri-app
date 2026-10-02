import { useContext, useEffect, useState } from 'react'
import { sportsArea } from './loader'
import type { Route } from '../navigation/history'
import { fallback } from '../navigation/history'
import { NavigationContext } from '../navigation/usePageState'
import BottomNav from '../components/BottomNav'
import { allRaceEditionViews } from '../data/raceEditions'
import './sports-loading.css'

export default function SportsRoute({ route, navigate, back }: { route: Route; navigate: (route: Route) => void; back: () => void }) {
  const navigation = useContext(NavigationContext)
  const [area, setArea] = useState(() => sportsArea.peek())
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    sportsArea.load().then(module => { if (active) setArea(module) }, () => { if (active) setFailed(true) })
    return () => { active = false }
  }, [])
  const invalid = area && ((route.page === 'athlete' && !area.hasAthlete(route.id))
    || (route.page === 'race' && !allRaceEditionViews.some(r => r.editionId === route.id)))
  useEffect(() => {
    if (invalid) {
      navigation?.replaceRoute(fallback(route))
      window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }))
    }
  }, [invalid, navigation, route])
  if (area && !invalid) return <area.default route={route} navigate={navigate} back={back} />
  return <main className="app" data-route-pending="true">
    <button className="page-back-button" onClick={back}>← Назад</button>
    <section className="sports-loading" aria-labelledby="sports-loading-title">
      <h1 id="sports-loading-title">{route.page === 'athletes' || route.page === 'athlete' ? 'Профили атлетов' : 'Результаты гонки'}</h1>
      {failed ? <div role="alert"><p>Не удалось загрузить данные. Проверьте соединение и повторите попытку.</p>
        <button className="sports-loading__retry" onClick={() => window.location.reload()}>Повторить</button>
      </div> : <p role="status">Загрузка…</p>}
    </section>
    <BottomNav currentPage={route.page === 'race' ? 'calendar' : 'athletes'} onNavigate={page => navigate({ page })} />
  </main>
}
