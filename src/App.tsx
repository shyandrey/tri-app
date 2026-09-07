import { allRaceEditionViews, currentRaceEditions as races } from './data/raceEditions'
import type { Race } from './types/Race'
import { athletes } from './data/athletes'
import type { Athlete } from './types/Athlete'
import type { Page } from './types/Page'
import AthleteDetailPage from './pages/AthleteDetailPage'
import AthletesPage from './pages/AthletesPage'
import RaceDetailPage from './pages/RaceDetailPage'
import CalendarPage, { type CalendarViewState } from './pages/CalendarPage'
import TopAthletesPage from './pages/TopAthletesPage'
import { useState } from 'react'
import './App.css'
import './refinements.css'
import './series-colors.css'
import './home-refinements.css'
import './history-refinements.css'
import './calendar-mobile-refinements.css'
import RaceCard from './components/RaceCard'
import BottomNav from './components/BottomNav'
import MorePage from './pages/MorePage'
import HorizontalScroller from './components/HorizontalScroller'
import { AthleteIcon, CalendarIcon, GearIcon, PaceIcon, PointsTableIcon, RankingIcon } from './components/AppIcons'
import { isRaceUpcoming } from './utils/raceDate'
import { raceResults } from './data/results/index'
import { getResultsByAthlete } from './utils/raceResults'

const initialCalendarViewState: CalendarViewState = {
  search: '',
  filter: 'Все',
  timeFilter: 'upcoming',
  openArchiveYears: [],
  scrollY: 0,
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [previousPage, setPreviousPage] = useState<'home' | 'calendar' | 'athlete'>('home')
  const [previousAthletePage, setPreviousAthletePage] = useState<'athletes' | 'top' | 'race'>('athletes')
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [calendarViewState, setCalendarViewState] = useState<CalendarViewState>(initialCalendarViewState)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const upcomingRaces = races.filter(isRaceUpcoming).sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()).slice(0, 3)

  if (page === 'calendar') {
    return <CalendarPage races={races} searchRaces={allRaceEditionViews} viewState={calendarViewState} onViewStateChange={setCalendarViewState} onBack={() => setPage('home')} onNavigate={setPage} onRaceClick={(race) => { setSelectedRace(race); setPreviousPage('calendar'); setPage('race') }} />
  }

  if (page === 'race' && selectedRace && selectedRace.editionId) {
    return <RaceDetailPage race={selectedRace} raceEditions={allRaceEditionViews} allResults={raceResults} athletes={athletes} onBack={() => setPage(previousPage)} onNavigate={setPage} onAthleteClick={(athlete) => { setSelectedAthlete(athlete); setPreviousAthletePage('race'); setPage('athlete') }} />
  }

  if (page === 'athletes') {
    return <AthletesPage athletes={athletes} onBack={() => setPage('home')} onNavigate={setPage} onAthleteClick={(athlete) => { setSelectedAthlete(athlete); setPreviousAthletePage('athletes'); setPage('athlete') }} />
  }

  if (page === 'athlete' && selectedAthlete) {
    const results = getResultsByAthlete(raceResults, selectedAthlete.id)
    return <AthleteDetailPage athlete={selectedAthlete} results={results} races={allRaceEditionViews} onBack={() => setPage(previousAthletePage)} onNavigate={setPage} onRaceClick={(race) => { setSelectedRace(race); setPreviousPage('athlete'); setPage('race') }} />
  }

  if (page === 'top') {
    return <TopAthletesPage athletes={athletes} onBack={() => setPage('home')} onNavigate={setPage} onAthleteClick={(athlete) => { setSelectedAthlete(athlete); setPreviousAthletePage('top'); setPage('athlete') }} />
  }

  if (page === 'more') return <MorePage onNavigate={setPage} />

  return (
    <main className="app">
      <header className="home-header">
        <div className="home-header__top-row">
          <h1>TRI APP</h1>
          <button className="home-header__settings" type="button" aria-label="Настройки" onClick={() => setSettingsOpen(true)}>
            <GearIcon />
          </button>
        </div>
        <h2>ТРИАТЛОН — ЭТО <span>МОЩНО!</span></h2>
      </header>

      <section className="section">
        <div className="section__header"><h2>⚡ Ближайшие гонки</h2><button onClick={() => setPage('calendar')}>Смотреть все</button></div>
        {upcomingRaces.map((race) => <RaceCard key={race.editionId} distance={race.distance} series={race.series} name={race.name} date={race.date} city={race.city} country={race.country} gender={race.gender} onClick={() => { setSelectedRace(race); setPreviousPage('home'); setPage('race') }} />)}
      </section>

      <HorizontalScroller className="features features--compact" ariaLabel="Разделы приложения">
        <article className="feature-card feature-card--compact" onClick={() => setPage('calendar')}><div className="feature-card__icon"><CalendarIcon /></div><div className="feature-card__copy"><h3>Календарь и результаты</h3><p>Старты и результаты</p></div></article>
        <article className="feature-card feature-card--compact" onClick={() => setPage('athletes')}><div className="feature-card__icon"><AthleteIcon /></div><div className="feature-card__copy"><h3>Профили атлетов</h3><p>Атлеты и достижения</p></div></article>
        <article className="feature-card feature-card--compact" onClick={() => setPage('top')}><div className="feature-card__icon"><RankingIcon /></div><div className="feature-card__copy"><h3>Рейтинг атлетов</h3><p>Рейтинг сильнейших</p></div></article>
        <article className="feature-card feature-card--compact feature-card--disabled" aria-disabled="true"><div className="feature-card__icon"><PointsTableIcon /></div><div className="feature-card__copy"><h3>Таблицы очков</h3><p>Скоро</p></div></article>
        <article className="feature-card feature-card--compact feature-card--disabled" aria-disabled="true"><div className="feature-card__icon"><PaceIcon /></div><div className="feature-card__copy"><h3>Калькулятор темпа</h3><p>Скоро</p></div></article>
      </HorizontalScroller>

      <section className="section">
        <div className="section__header"><h2>Новости из канала</h2><button>@trista_watt</button></div>
        <article className="news-card"><div><h3>IRONMAN объявил новый календарь стартов</h3><p>Последние новости из Telegram-канала</p></div><span className="news-card__telegram">➤</span></article>
      </section>

      <BottomNav currentPage={page} onNavigate={setPage} />

      {settingsOpen && (
        <div className="settings-overlay" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section className="settings-sheet" role="dialog" aria-modal="true" aria-label="Настройки" onClick={(event) => event.stopPropagation()}>
            <div className="settings-sheet__handle" aria-hidden="true" />
            <div className="settings-sheet__header">
              <h2>Настройки</h2>
              <button type="button" aria-label="Закрыть настройки" onClick={() => setSettingsOpen(false)}>×</button>
            </div>

            <div className="settings-sheet__list">
              <div className="settings-row settings-row--disabled">
                <div>
                  <strong>Светлая тема</strong>
                  <span>Скоро</span>
                </div>
                <span className="settings-switch" aria-hidden="true"><span /></span>
              </div>

              <button className="settings-row settings-row--button" type="button" disabled>
                <div>
                  <strong>Сообщить об ошибке</strong>
                  <span>Скоро</span>
                </div>
                <span className="settings-row__arrow">›</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App