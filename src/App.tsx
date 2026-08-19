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
import triLogo from './assets/300w_5.png'
import RaceCard from './components/RaceCard'
import BottomNav from './components/BottomNav'
import MorePage from './pages/MorePage'


function App() {
  const [page, setPage] = useState<Page>('home')
  const [previousPage, setPreviousPage] = useState<'home' | 'calendar'>('home')
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  if (page === 'calendar') {
  return (
    <CalendarPage
  races={races}
  onBack={() => setPage('home')}
  onNavigate={setPage}
  onRaceClick={(race) => {
    setSelectedRace(race)
    setPreviousPage('calendar')
    setPage('race')
  }}
/>
  )
}
if (page === 'race' && selectedRace) {
  return (
    <RaceDetailPage
      race={selectedRace}
      onBack={() => setPage(previousPage)}
      onNavigate={setPage}
    />
  )
}
if (page === 'athletes') {
  return (
    <AthletesPage
  athletes={athletes}
  onBack={() => setPage('home')}
  onNavigate={setPage}
  onAthleteClick={(athlete) => {
    setSelectedAthlete(athlete)
    setPage('athlete')
  }}
/>
  )
}
if (page === 'athlete' && selectedAthlete) {
  return (
    <AthleteDetailPage
  athlete={selectedAthlete}
  onBack={() => setPage('athletes')}
  onNavigate={setPage}
    />
  )
}
if (page === 'top') {
  return (
    <TopAthletesPage
      athletes={athletes}
      onBack={() => setPage('home')}
      onNavigate={setPage}
      onAthleteClick={(athlete) => {
        setSelectedAthlete(athlete)
        setPage('athlete')
      }}
    />
  )
}
if (page === 'more') {
  return (
    <MorePage
      onNavigate={setPage}
    />
  )
}  
return (
    <main className="app">
      <header className="hero">
        <div className="hero__brand">
          <img
            className="hero__logo-image"
            src={triLogo}
            alt="TRI App"
/>

          <div>
            <h1>TRI APP</h1>
            <p>Триатлон в одном приложении</p>
          </div>
        </div>

        <div className="hero__text">
          <h2>
            ТРИАТЛОН —
            <br />
            ЭТО <span>МОЩНО</span>
          </h2>

          <p>
            Календарь стартов, профили атлетов
            <br />
            и всё, что нужно триатлету.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="section__header">
          <h2>⚡ Ближайшие старты</h2>
          <button onClick={() => setPage('calendar')}>
            Смотреть все
          </button>
        </div>
        {races.map((race) => (
  <RaceCard
  key={race.id}
  tag={race.tag}
  name={race.name}
  date={race.date}
  location={race.location}
  onClick={() => {
    setSelectedRace(race)
    setPreviousPage('home')
    setPage('race')
  }}
/>
))}
</section>

      <section className="features">
  <article
    className="feature-card"
    onClick={() => setPage('calendar')}
  >
    <div className="feature-card__icon">〰️</div>
    <h3>Календарь стартов</h3>
    <p>Соревнования по триатлону</p>
  </article>

  <article
    className="feature-card"
    onClick={() => setPage('athletes')}
  >
    <div className="feature-card__icon">⚡</div>
    <h3>Профили атлетов</h3>
    <p>Результаты и достижения</p>
  </article>

  <article
    className="feature-card"
    onClick={() => setPage('top')}
  >
    <div className="feature-card__icon">🏆</div>
    <h3>Топ атлетов</h3>
    <p>Рейтинг и лучшие результаты</p>
  </article>
</section>

      <section className="section">
        <div className="section__header">
          <h2>Новости из канала</h2>
          <button>@trista_watt</button>
        </div>

        <article className="news-card">
          <div>
            <h3>IRONMAN объявил новый календарь стартов</h3>
            <p>Последние новости из Telegram-канала</p>
          </div>

          <span className="news-card__telegram">➤</span>
        </article>
      </section>

      <BottomNav
        currentPage={page}
        onNavigate={setPage}
      />
    </main>
  )
}

export default App