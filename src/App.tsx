import { races } from './data/races'
import type { Race } from './types/Race'
import { athletes } from './data/athletes'
import type { Athlete } from './types/Athlete'
import type { Page } from './types/Page'
import AthleteDetailPage from './pages/AthleteDetailPage'
import AthletesPage from './pages/AthletesPage'
import RaceDetailPage from './pages/RaceDetailPage'
import CalendarPage from './pages/CalendarPage'
import TopAthletesPage from './pages/TopAthletesPage'
import { useState } from 'react'
import './App.css'
import './refinements.css'
import './series-colors.css'
import './home-refinements.css'
import triLogo from './assets/300w_5.png'
import RaceCard from './components/RaceCard'
import BottomNav from './components/BottomNav'
import MorePage from './pages/MorePage'

import { isRaceUpcoming } from './utils/raceDate'
import { raceResults } from './data/results/index'
import { getResultsByAthlete, getResultsByRace } from './utils/raceResults'

function App() {
  const [page, setPage] = useState<Page>('home')
  const [previousPage, setPreviousPage] = useState<'home' | 'calendar' | 'athlete'>('home')
  const [previousAthletePage, setPreviousAthletePage] = useState<'athletes' | 'top' | 'race'>('athletes')
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)

  const upcomingRaces = races
    .filter(isRaceUpcoming)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    .slice(0, 3)

  if (page === 'calendar') {
    return <CalendarPage races={races} onBack={() => setPage('home')} onNavigate={setPage} onRaceClick={(race) => { setSelectedRace(race); setPreviousPage('calendar'); setPage('race') }} />
  }

  if (page === 'race' && selectedRace) {
    const results = getResultsByRace(raceResults, selectedRace.id)
    return <RaceDetailPage race={selectedRace} results={results} athletes={athletes} onBack={() => setPage(previousPage)} onNavigate={setPage} onAthleteClick={(athlete) => { setSelectedAthlete(athlete); setPreviousAthletePage('race'); setPage('athlete') }} />
  }

  if (page === 'athletes') {
    return <AthletesPage athletes={athletes} onBack={() => setPage('home')} onNavigate={setPage} onAthleteClick={(athlete) => { setSelectedAthlete(athlete); setPreviousAthletePage('athletes'); setPage('athlete') }} />
  }

  if (page === 'athlete' && selectedAthlete) {
    const results = getResultsByAthlete(raceResults, selectedAthlete.id)
    return <AthleteDetailPage athlete={selectedAthlete} results={results} races={races} onBack={() => setPage(previousAthletePage)} onNavigate={setPage} onRaceClick={(race) => { setSelectedRace(race); setPreviousPage('athlete'); setPage('race') }} />
  }

  if (page === 'top') {
    return <TopAthletesPage athletes={athletes} onBack={() => setPage('home')} onNavigate={setPage} onAthleteClick={(athlete) => { setSelectedAthlete(athlete); setPreviousAthletePage('top'); setPage('athlete') }} />
  }

  if (page === 'more') return <MorePage onNavigate={setPage} />

  return (
    <main className="app">
      <header className="hero">
        <div className="hero__brand">
          <img className="hero__logo-image" src={triLogo} alt="TRI App" />
          <div className="hero__brand-copy">
            <h1>TRI APP</h1>
            <p>Триатлон в одном приложении</p>
          </div>
        </div>
        <div className="hero__text">
          <h2>ТРИАТЛОН — ЭТО <span>МОЩНО</span></h2>
          <p>Календарь стартов, профили атлетов и всё, что нужно триатлету.</p>
        </div>
      </header>

      <section className="section">
        <div className="section__header"><h2>⚡ Ближайшие старты</h2><button onClick={() => setPage('calendar')}>Смотреть все</button></div>
        {upcomingRaces.map((race) => <RaceCard key={race.id} distance={race.distance} series={race.series} name={race.name} date={race.date} city={race.city} country={race.country} gender={race.gender} onClick={() => { setSelectedRace(race); setPreviousPage('home'); setPage('race') }} />)}
      </section>

      <section className="features features--compact">
        <article className="feature-card feature-card--compact" onClick={() => setPage('calendar')}>
          <div className="feature-card__icon">📅</div>
          <div className="feature-card__copy"><h3>Календарь стартов</h3><p>Старты и результаты</p></div>
        </article>
        <article className="feature-card feature-card--compact" onClick={() => setPage('athletes')}>
          <div className="feature-card__icon">♙</div>
          <div className="feature-card__copy"><h3>Профили атлетов</h3><p>Атлеты и достижения</p></div>
        </article>
        <article className="feature-card feature-card--compact" onClick={() => setPage('top')}>
          <div className="feature-card__icon">★</div>
          <div className="feature-card__copy"><h3>Топ атлетов</h3><p>Рейтинг сильнейших</p></div>
        </article>
      </section>

      <section className="section">
        <div className="section__header"><h2>Новости из канала</h2><button>@trista_watt</button></div>
        <article className="news-card"><div><h3>IRONMAN объявил новый календарь стартов</h3><p>Последние новости из Telegram-канала</p></div><span className="news-card__telegram">➤</span></article>
      </section>

      <BottomNav currentPage={page} onNavigate={setPage} />
    </main>
  )
}

export default App
