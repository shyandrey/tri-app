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
import './theme-refinements.css'
import './athletes-refinements.css'
import './bottom-nav-glass.css'
import RaceCard from './components/RaceCard'
import BottomNav from './components/BottomNav'
import MorePage from './pages/MorePage'
import HorizontalScroller from './components/HorizontalScroller'
import HomeShowcase from './components/HomeShowcase'
import { AthleteIcon, CalendarIcon, GearIcon, PaceIcon, PointsTableIcon, RankingIcon } from './components/AppIcons'
import { groupRacesForHome } from './utils/homeRacePresentation'
import { raceResults } from './data/results/index'
import { getResultsByAthlete, linkResultsToAthletes } from './utils/raceResults'

const linkedRaceResults = linkResultsToAthletes(raceResults)

const initialCalendarViewState: CalendarViewState = {
  search: '',
  filter: 'Все',
  timeFilter: 'upcoming',
  openArchiveYears: [],
  scrollY: 0,
}

const regionalChampionship = '(?:North American|European|Asia-Pacific|African|Latin American|Oceania)'

function getMoscowTodayISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function stripSponsorPrefix(name: string) {
  return name
    .replace(/^Sokin\s+/i, '')
    .replace(/^VinFast\s+/i, '')
    .replace(/^Qiddiya\s+/i, '')
    .replace(/^PTO\s+/i, '')
}

function getHomeRaceTitle(race: Race) {
  let name = stripSponsorPrefix(race.name)

  name = name
    .replace(new RegExp(`\\s+${regionalChampionship} Championship(?:s)?`, 'i'), '')
    .replace(/\s+World Championship(?:s)?/i, '')
    .replace(/\s+Championship(?:s)?/i, '')
    .replace(/\s+Final(?:s)?/i, '')
    .replace(/\s+Grand Final(?:s)?/i, '')

  if (/IRONMAN 70\.3/i.test(name)) {
    const city = race.city?.trim()
    if (city && !name.toLowerCase().includes(city.toLowerCase())) return `IRONMAN 70.3 ${city}`
  }

  return name.trim()
}

function isRaceUpcoming(race: Race) {
  return race.dateISO > getMoscowTodayISO()
}

function App() {
  const [page, setPage] = useState<Page>('home')
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null)
  const [calendarEntryMode, setCalendarEntryMode] = useState<'top' | 'restore'>('top')
  const [athletesBackPage, setAthletesBackPage] = useState<Page>('home')
  const [calendarViewState, setCalendarViewState] = useState<CalendarViewState>(initialCalendarViewState)

  const captureCalendarPosition = () => {
    if (page !== 'calendar') return
    setCalendarViewState((current) => ({ ...current, scrollY: window.scrollY }))
  }

  const navigateSection = (target: Page) => {
    if (target === page) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (page === 'calendar') captureCalendarPosition()

    if (target === 'calendar') {
      setCalendarEntryMode('top')
      setSelectedRace(null)
      setSelectedAthlete(null)
    }

    if (target === 'athletes') {
      setAthletesBackPage(page)
      setSelectedAthlete(null)
      setSelectedRace(null)
    }

    setPage(target)
  }

  const openRace = (race: Race) => {
    if (page === 'calendar') {
      captureCalendarPosition()
      setCalendarEntryMode('restore')
    }
    setSelectedRace(race)
    setPage('raceDetail')
    window.scrollTo(0, 0)
  }

  const openAthlete = (athlete: Athlete) => {
    setAthletesBackPage(page)
    setSelectedAthlete(athlete)
    setPage('athleteDetail')
    window.scrollTo(0, 0)
  }

  const backFromRace = () => {
    setSelectedRace(null)
    setPage('calendar')
    setCalendarEntryMode('restore')
  }

  const backFromAthlete = () => {
    setSelectedAthlete(null)
    setPage(athletesBackPage)
  }

  const upcomingRaces = groupRacesForHome(races)
    .filter(isRaceUpcoming)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    .slice(0, 5)

  if (page === 'calendar') {
    return (
      <CalendarPage
        races={allRaceEditionViews}
        onBack={() => setPage('home')}
        onRaceClick={openRace}
        onNavigate={navigateSection}
        viewState={calendarViewState}
        onViewStateChange={setCalendarViewState}
        restoreScroll={calendarEntryMode === 'restore'}
      />
    )
  }

  if (page === 'athletes') {
    return (
      <AthletesPage
        athletes={athletes}
        onBack={() => setPage(athletesBackPage)}
        onAthleteClick={openAthlete}
        onNavigate={navigateSection}
      />
    )
  }

  if (page === 'top') {
    return <TopAthletesPage athletes={athletes} onBack={() => setPage('home')} onNavigate={navigateSection} />
  }

  if (page === 'more') {
    return <MorePage onBack={() => setPage('home')} onNavigate={navigateSection} />
  }

  if (page === 'raceDetail' && selectedRace) {
    return (
      <RaceDetailPage
        race={selectedRace}
        raceEditions={allRaceEditionViews}
        allResults={linkedRaceResults}
        athletes={athletes}
        onBack={backFromRace}
        onNavigate={navigateSection}
        onAthleteClick={openAthlete}
      />
    )
  }

  if (page === 'athleteDetail' && selectedAthlete) {
    return (
      <AthleteDetailPage
        athlete={selectedAthlete}
        results={getResultsByAthlete(linkedRaceResults, selectedAthlete.id)}
        races={allRaceEditionViews}
        onBack={backFromAthlete}
        onNavigate={navigateSection}
        onRaceClick={openRace}
      />
    )
  }

  return (
    <main className="app app--home-experiment">
      <header className="home-topbar">
        <div className="home-topbar__brand">TRI APP</div>
        <button className="home-topbar__settings" type="button" aria-label="Настройки" onClick={() => setPage('more')}>
          <GearIcon />
        </button>
      </header>

      <div className="home-kicker">ТРИАТЛОН — ЭТО <strong>МОЩНО!</strong></div>

      {upcomingRaces.length > 0 && (
        <HomeShowcase
          races={upcomingRaces}
          getRaceName={(name) => {
            const race = upcomingRaces.find((item) => item.name === name)
            return race ? getHomeRaceTitle(race) : stripSponsorPrefix(name)
          }}
          onRaceClick={openRace}
        />
      )}

      <section className="section home-section home-section--races">
        <div className="section__header home-section__header">
          <h2>Ближайшие гонки</h2>
        </div>
        <HorizontalScroller className="home-races-scroller" itemClassName="home-races-scroller__item">
          {upcomingRaces.slice(0, 3).map((race) => (
            <RaceCard
              key={race.editionId}
              distance={race.distance}
              series={race.series}
              name={race.name}
              date={race.date}
              city={race.city}
              country={race.country}
              gender={race.gender}
              onClick={() => openRace(race)}
            />
          ))}
        </HorizontalScroller>
        <button className="home-all-races" onClick={() => navigateSection('calendar')}>
          Все гонки <span aria-hidden="true">›</span>
        </button>
      </section>

      <section className="section home-section home-section--shortcuts">
        <div className="section__header home-section__header">
          <h2>Разделы</h2>
        </div>
        <HorizontalScroller className="features features--compact" itemClassName="features__item">
          <button className="feature-card feature-card--compact" onClick={() => navigateSection('calendar')}>
            <CalendarIcon className="feature-card__icon" />
            <span className="feature-card__copy">
              <h3>Календарь и результаты</h3>
              <p>Профессиональные старты и архив</p>
            </span>
          </button>
          <button className="feature-card feature-card--compact" onClick={() => navigateSection('athletes')}>
            <AthleteIcon className="feature-card__icon" />
            <span className="feature-card__copy">
              <h3>Профили атлетов</h3>
              <p>Био, достижения и последние результаты</p>
            </span>
          </button>
          <button className="feature-card feature-card--compact" onClick={() => navigateSection('top')}>
            <RankingIcon className="feature-card__icon" />
            <span className="feature-card__copy">
              <h3>Рейтинг атлетов</h3>
              <p>Топ профессионального триатлона</p>
            </span>
          </button>
          <button className="feature-card feature-card--compact feature-card--disabled" disabled>
            <PointsTableIcon className="feature-card__icon" />
            <span className="feature-card__copy">
              <h3>Таблицы очков</h3>
              <p>Скоро</p>
            </span>
          </button>
          <button className="feature-card feature-card--compact feature-card--disabled" disabled>
            <PaceIcon className="feature-card__icon" />
            <span className="feature-card__copy">
              <h3>Калькулятор темпа</h3>
              <p>Скоро</p>
            </span>
          </button>
        </HorizontalScroller>
      </section>

      <section className="section home-section home-section--news">
        <div className="section__header home-section__header">
          <h2>Новости</h2>
        </div>
        <article className="news-card">
          <div>
            <h3>@trista_watt</h3>
            <p>Свежие новости профессионального триатлона.</p>
          </div>
          <span className="news-card__telegram">✈</span>
        </article>
      </section>

      <BottomNav currentPage="home" onNavigate={navigateSection} />
    </main>
  )
}

export default App