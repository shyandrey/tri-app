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
import { sortAthletesByRanking } from './utils/athleteRanking'

const linkedRaceResults = linkResultsToAthletes(raceResults)
const rankedAthletes = sortAthletesByRanking(athletes, linkedRaceResults, allRaceEditionViews)

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

function getShowcaseRaceName(name: string) {
  const cleanName = name.replace(/\s+/g, ' ').trim()

  if (/IRONMAN 70\.3 World Championship/i.test(cleanName)) return 'IRONMAN 70.3 World Championship'
  if (/IRONMAN World Championship/i.test(cleanName)) return 'IRONMAN World Championship'

  const t100Index = cleanName.search(/\bT100\b/i)
  if (t100Index >= 0) {
    const beforeT100 = cleanName.slice(0, t100Index).replace(/^(?:EKOÏ|Sokin)\s+/i, '').trim()
    const afterT100 = cleanName.slice(t100Index + 4).replace(/\s+(?:Triathlon )?World Tour.*$/i, '').trim()
    return ['T100', beforeT100, afterT100].filter(Boolean).join(' ')
  }

  const ironman703Index = cleanName.search(/\bIRONMAN 70\.3\b/i)
  if (ironman703Index >= 0) {
    const ironmanName = cleanName.slice(ironman703Index)
    const leadingChampionship = ironmanName.match(new RegExp(`^IRONMAN 70\\.3 ${regionalChampionship} Championship (.+)$`, 'i'))
    if (leadingChampionship) return `IRONMAN 70.3 ${leadingChampionship[1]}`
    return ironmanName.replace(new RegExp(`\\s+${regionalChampionship} Championship.*$`, 'i'), '').trim()
  }

  const ironmanIndex = cleanName.search(/\bIRONMAN\b/i)
  if (ironmanIndex >= 0) {
    const ironmanName = cleanName.slice(ironmanIndex)
    const leadingChampionship = ironmanName.match(new RegExp(`^IRONMAN ${regionalChampionship} Championship (.+)$`, 'i'))
    if (leadingChampionship) return `IRONMAN ${leadingChampionship[1]}`
    return ironmanName.replace(new RegExp(`\\s+${regionalChampionship} Championship.*$`, 'i'), '').trim()
  }

  return cleanName
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

  const futureHomeRaces = groupRacesForHome(races)
    .filter((race) => race.dateISO > getMoscowTodayISO())
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
  const showcaseRaces = futureHomeRaces.slice(0, 5)
  const upcomingRaces = futureHomeRaces.slice(0, 3)

  if (page === 'calendar') {
    return <CalendarPage races={allRaceEditionViews} onBack={() => setPage('home')} onRaceClick={openRace} onNavigate={navigateSection} viewState={calendarViewState} onViewStateChange={setCalendarViewState} restoreScroll={calendarEntryMode === 'restore'} />
  }

  if (page === 'athletes') {
    return <AthletesPage athletes={rankedAthletes} onBack={() => setPage(athletesBackPage)} onAthleteClick={openAthlete} onNavigate={navigateSection} />
  }

  if (page === 'top') return <TopAthletesPage athletes={athletes} onBack={() => setPage('home')} onNavigate={navigateSection} />
  if (page === 'more') return <MorePage onBack={() => setPage('home')} onNavigate={navigateSection} />

  if (page === 'raceDetail' && selectedRace) {
    return <RaceDetailPage race={selectedRace} raceEditions={allRaceEditionViews} allResults={linkedRaceResults} athletes={athletes} onBack={backFromRace} onNavigate={navigateSection} onAthleteClick={openAthlete} />
  }

  if (page === 'athleteDetail' && selectedAthlete) {
    return <AthleteDetailPage athlete={selectedAthlete} results={getResultsByAthlete(linkedRaceResults, selectedAthlete.id)} races={allRaceEditionViews} onBack={backFromAthlete} onNavigate={navigateSection} onRaceClick={openRace} />
  }

  return (
    <main className="app app--home-experiment">
      <header className="home-header">
        <div className="home-header__top-row">
          <h1>TRI APP</h1>
          <button className="home-header__settings" type="button" aria-label="Настройки" onClick={() => setPage('more')}>
            <GearIcon />
          </button>
        </div>
        <h2>ТРИАТЛОН — ЭТО <span>МОЩНО!</span></h2>
      </header>

      <HomeShowcase races={showcaseRaces} onRaceClick={openRace} getRaceName={getShowcaseRaceName} />

      <section className="section home-races-section">
        <div className="section__header home-races-section__header">
          <h2>Ближайшие гонки</h2>
          <button onClick={() => navigateSection('calendar')}>Все гонки <span className="home-races-section__chevron">›</span></button>
        </div>
        {upcomingRaces.map((race) => (
          <RaceCard key={race.editionId} distance={race.distance} series={race.series} name={race.name} date={race.date} city={race.city} country={race.country} gender={race.gender} onClick={() => openRace(race)} />
        ))}
      </section>

      <HorizontalScroller className="features features--compact" ariaLabel="Разделы приложения">
        <article className="feature-card feature-card--compact" onClick={() => navigateSection('calendar')}><div className="feature-card__icon"><CalendarIcon /></div><div className="feature-card__copy"><h3>Календарь и результаты</h3><p>Старты и результаты</p></div></article>
        <article className="feature-card feature-card--compact" onClick={() => navigateSection('athletes')}><div className="feature-card__icon"><AthleteIcon /></div><div className="feature-card__copy"><h3>Профили атлетов</h3><p>Атлеты и достижения</p></div></article>
        <article className="feature-card feature-card--compact" onClick={() => navigateSection('top')}><div className="feature-card__icon"><RankingIcon /></div><div className="feature-card__copy"><h3>Рейтинг атлетов</h3><p>Рейтинг сильнейших</p></div></article>
        <article className="feature-card feature-card--compact feature-card--disabled" aria-disabled="true"><div className="feature-card__icon"><PointsTableIcon /></div><div className="feature-card__copy"><h3>Таблицы очков</h3><p>Скоро</p></div></article>
        <article className="feature-card feature-card--compact feature-card--disabled" aria-disabled="true"><div className="feature-card__icon"><PaceIcon /></div><div className="feature-card__copy"><h3>Калькулятор темпа</h3><p>Скоро</p></div></article>
      </HorizontalScroller>

      <section className="section">
        <div className="section__header"><h2>Новости из канала</h2><button>@trista_watt</button></div>
        <article className="news-card"><div><h3>IRONMAN объявил новый календарь стартов</h3><p>Последние новости из Telegram-канала</p></div><span className="news-card__telegram">➤</span></article>
      </section>

      <BottomNav currentPage="home" onNavigate={navigateSection} />
    </main>
  )
}

export default App