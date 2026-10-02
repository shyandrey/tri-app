import LatestNews from './components/LatestNews'
import FeedbackPage from './pages/FeedbackPage'
import { genericFeedbackContext } from '../shared/feedback'
import type { FeedbackContext } from '../shared/feedback'
import { allRaceEditionViews, currentRaceEditions as races } from './data/raceEditions'
import type { Race } from './types/Race'
import { athletes } from './data/athletes'
import type { Athlete } from './types/Athlete'
import type { Page } from './types/Page'
import AthleteDetailPage from './pages/AthleteDetailPage'
import AthletesPage from './pages/AthletesPage'
import RaceDetailPage from './pages/RaceDetailPage'
import CalendarPage, { type CalendarViewState } from './pages/CalendarPage'
import { NavigationRoot } from './navigation/Navigation'
import { usePageState } from './navigation/usePageState'
import { fallback } from './navigation/history'
import type { Route } from './navigation/history'
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
import HomeShowcase from './components/HomeShowcase'
import { AthleteIcon, CalendarIcon, GearIcon, PointsTableIcon, ChevronRightIcon, LightningIcon } from './components/AppIcons'
import { groupRacesForHome } from './utils/homeRacePresentation'
import { raceResults } from './data/results/index'
import { getResultsByAthlete, linkResultsToAthletes } from './utils/raceResults'
import { calculateAthleteRanking, sortAthletesByRanking } from './utils/athleteRanking'
import { getRankingDatasetClock } from './utils/rankingDatasetClock'

const linkedRaceResults = linkResultsToAthletes(raceResults)
const rankingAsOf = getRankingDatasetClock(athletes, linkedRaceResults, allRaceEditionViews)
const athleteRanking = calculateAthleteRanking(athletes, linkedRaceResults, allRaceEditionViews, rankingAsOf)
const rankedAthletes = sortAthletesByRanking(athletes, linkedRaceResults, allRaceEditionViews, rankingAsOf)

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

function resolveRoute(route: Route): Route {
  if (route.page === 'race' && !allRaceEditionViews.some(r => r.editionId === route.id)) return fallback(route)
  if (route.page === 'athlete' && !athletes.some(a => String(a.id) === route.id)) return fallback(route)
  return route
}

function App() {
  return <NavigationRoot resolve={resolveRoute}>{(route, navigate, back) => <AppScreen route={route} navigate={navigate} back={back} />}</NavigationRoot>
}

function AppScreen({ route, navigate, back }: { route: Route; navigate: (route: Route) => void; back: () => void }) {
  const openFeedback = (feedback: FeedbackContext) => navigate({ page: 'feedback', feedback })
  const page = route.page
  const selectedRace = allRaceEditionViews.find(r => r.editionId === route.id)
  const selectedAthlete = athletes.find(a => String(a.id) === route.id)
  const navigateSection = (page: Page) => navigate({ page })
  const openRace = (race: Race) => navigate({ page: 'race', id: race.editionId })
  const openAthlete = (athlete: Athlete) => navigate({ page: 'athlete', id: String(athlete.id) })
  const [calendarViewState, setCalendarViewState] = usePageState<CalendarViewState>('calendar', {
    search: '', filter: 'Все', timeFilter: 'upcoming', openArchiveYears: [],
  })

  const futureHomeRaces = groupRacesForHome(races)
    .filter((race) => race.dateISO > getMoscowTodayISO())
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
  const showcaseRaces = futureHomeRaces.slice(0, 5)
  const upcomingRaces = futureHomeRaces.slice(0, 3)

  if (page === 'calendar') {
    return <CalendarPage races={races} searchRaces={allRaceEditionViews} onBack={back} onRaceClick={openRace} onNavigate={navigateSection} viewState={calendarViewState} onViewStateChange={setCalendarViewState} />
  }

  if (page === 'athletes') {
    return <AthletesPage athletes={rankedAthletes} ranking={athleteRanking} onBack={back} onAthleteClick={openAthlete} onNavigate={navigateSection} />
  }

  if (page === 'feedback') return <FeedbackPage context={route.feedback ?? genericFeedbackContext} onBack={back} />
  if (page === 'more') return <MorePage onBack={back} onNavigate={navigateSection} onFeedback={() => openFeedback(genericFeedbackContext)} />

  if (page === 'race' && selectedRace) {
    return <RaceDetailPage onFeedback={openFeedback} race={selectedRace} raceEditions={allRaceEditionViews} allResults={linkedRaceResults} athletes={athletes} onBack={back} onNavigate={navigateSection} onAthleteClick={openAthlete} />
  }

  if (page === 'athlete' && selectedAthlete) {
    return <AthleteDetailPage onFeedback={() => openFeedback({ ...genericFeedbackContext, screen: 'athlete', route: `#/athlete/${selectedAthlete.id}`, athleteId: selectedAthlete.id, athleteName: [selectedAthlete.name, selectedAthlete.nameEn].filter((v, i, a) => v && a.indexOf(v) === i).join(' / ') })} athlete={selectedAthlete} results={getResultsByAthlete(linkedRaceResults, selectedAthlete.id)} races={allRaceEditionViews} onBack={back} onNavigate={navigateSection} onRaceClick={openRace} />
  }

  return (
    <main className="app app--home-experiment">
      <header className="home-header">
        <div className="home-header__top-row">
          <h1 className="home-wordmark" aria-label="300W⚡">
            <span className="home-wordmark__mark" aria-hidden="true"><LightningIcon /></span>
            <span className="home-wordmark__text" aria-hidden="true">300W</span>
          </h1>
          <button className="home-header__settings" type="button" aria-label="Настройки" onClick={() => navigateSection('more')}>
            <GearIcon />
          </button>
        </div>
        <h2>ТРИАТЛОН — ЭТО <span>МОЩНО!</span></h2>
      </header>

      <div className="home-content">
        <HomeShowcase races={showcaseRaces} onRaceClick={openRace} getRaceName={getShowcaseRaceName} />

        <section className="section home-races-section">
          <div className="section__header home-races-section__header">
            <h2>Ближайшие гонки</h2>
            <button onClick={() => navigateSection('calendar')}>Все <ChevronRightIcon className="home-races-section__chevron" /></button>
          </div>
          {upcomingRaces.map((race) => (
            <RaceCard key={race.editionId} distance={race.distance} series={race.series} name={race.name} date={race.date} city={race.city} country={race.country} gender={race.gender} onClick={() => openRace(race)} />
          ))}
        </section>

        <section className="features features--compact" aria-label="Разделы приложения">
          <button type="button" className="feature-card feature-card--compact" onClick={() => navigateSection('calendar')}><span className="feature-card__icon"><CalendarIcon /></span><span className="feature-card__copy"><span className="feature-card__title">Календарь и результаты</span></span></button>
          <button type="button" className="feature-card feature-card--compact" onClick={() => navigateSection('athletes')}><span className="feature-card__icon"><AthleteIcon /></span><span className="feature-card__copy"><span className="feature-card__title">Профили атлетов</span></span></button>
          <div className="feature-card feature-card--compact feature-card--disabled" role="group" aria-disabled="true" aria-label="Таблицы и очки — скоро"><span className="feature-card__icon"><PointsTableIcon /></span><span className="feature-card__copy"><span className="feature-card__title">Таблицы и очки</span><small>Скоро</small></span></div>
        </section>

        <LatestNews />
      </div>

      <BottomNav currentPage="home" onNavigate={navigateSection} />
    </main>
  )
}

export default App
