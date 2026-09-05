import { useEffect } from 'react'
import RaceCard from '../components/RaceCard'
import type { Race } from '../types/Race'
import type { Page } from '../types/Page'
import BottomNav from '../components/BottomNav'
import { isRaceFinished, isRaceUpcoming } from '../utils/raceDate'

export type CalendarViewState = {
  search: string
  filter: string
  timeFilter: 'upcoming' | 'finished' | 'all'
  openArchiveYears: number[]
  scrollY: number
}

type CalendarPageProps = {
  races: Race[]
  searchRaces?: Race[]
  viewState: CalendarViewState
  onViewStateChange: (state: CalendarViewState) => void
  onBack: () => void
  onRaceClick: (race: Race) => void
  onNavigate: (page: Page) => void
}

const seriesFilters = [
  { value: 'Все', short: 'ALL', label: 'ВСЕ', desktopLabel: 'Все гонки' },
  { value: 'IRONMAN Pro Series', short: 'IM', label: 'IRONMAN\nPRO SERIES', desktopLabel: 'IRONMAN Pro Series' },
  { value: 'Triathlon World Tour', short: 'T', label: 'TRIATHLON\nWORLD TOUR', desktopLabel: 'Triathlon World Tour' },
  { value: 'Challenge', short: 'R', label: 'CHALLENGE\nROTH', desktopLabel: 'Challenge Roth' },
] as const

const archiveYears = [2025, 2024] as const

function CalendarPage({ races, searchRaces = races, viewState, onViewStateChange, onBack, onRaceClick, onNavigate }: CalendarPageProps) {
  const { search, filter, timeFilter, openArchiveYears } = viewState

  useEffect(() => {
    const frame = requestAnimationFrame(() => window.scrollTo(0, viewState.scrollY))
    return () => cancelAnimationFrame(frame)
  }, [])

  const updateViewState = (patch: Partial<CalendarViewState>) => {
    onViewStateChange({ ...viewState, ...patch })
  }

  const isSearching = search.trim().length > 0
  const normalizedSearch = search.trim().toLowerCase()

  const filteredRaces = (isSearching ? searchRaces : races)
    .filter((race) => {
      const matchesSearch =
        race.name.toLowerCase().includes(normalizedSearch) ||
        race.city.toLowerCase().includes(normalizedSearch) ||
        race.country.toLowerCase().includes(normalizedSearch)

      const matchesFilter = filter === 'Все' || race.series === filter
      const matchesTime =
        timeFilter === 'all' ||
        (timeFilter === 'upcoming' && isRaceUpcoming(race)) ||
        (timeFilter === 'finished' && isRaceFinished(race))

      return isSearching ? matchesSearch : matchesFilter && matchesTime
    })
    .sort((a, b) => {
      const aDate = new Date(a.dateISO).getTime()
      const bDate = new Date(b.dateISO).getTime()
      if (isSearching || timeFilter === 'finished') return bDate - aDate
      return aDate - bDate
    })

  const archiveRacesByYear = archiveYears.map((year) => ({
    year,
    races: searchRaces
      .filter((race) => race.year === year)
      .filter((race) => filter === 'Все' || race.series === filter)
      .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()),
  }))

  const showArchive = !isSearching && timeFilter !== 'upcoming'

  const toggleArchiveYear = (year: number) => {
    updateViewState({
      openArchiveYears: openArchiveYears.includes(year)
        ? openArchiveYears.filter((item) => item !== year)
        : [...openArchiveYears, year],
    })
  }

  const openRace = (race: Race) => {
    updateViewState({ scrollY: window.scrollY })
    onRaceClick(race)
  }

  const renderRaceCard = (race: Race, showYear = false) => (
    <RaceCard
      key={race.editionId ?? race.id}
      distance={race.distance}
      series={race.series}
      name={race.name}
      date={`${race.date}${showYear && race.year ? ` ${race.year}` : ''}`}
      city={race.city}
      country={race.country}
      gender={race.gender}
      onClick={() => openRace(race)}
    />
  )

  return (
    <main className="app">
      <button className="page-back-button" onClick={onBack}>← Назад</button>
      <section className="section">
        <div className="section__header"><h1>Календарь стартов</h1></div>
        <input className="calendar-search" type="text" placeholder="Поиск стартов..." value={search} onChange={(event) => updateViewState({ search: event.target.value, scrollY: 0 })} />
        <div className="calendar-time-filters">
          <button className={timeFilter === 'upcoming' ? 'filter-active' : ''} onClick={() => updateViewState({ timeFilter: 'upcoming', scrollY: 0 })}>Предстоящие</button>
          <button className={timeFilter === 'finished' ? 'filter-active' : ''} onClick={() => updateViewState({ timeFilter: 'finished', scrollY: 0 })}>Прошедшие</button>
          <button className={timeFilter === 'all' ? 'filter-active' : ''} onClick={() => updateViewState({ timeFilter: 'all', scrollY: 0 })}>Все</button>
        </div>
        <div className="calendar-filters calendar-filters--series">
          {seriesFilters.map((item) => (
            <button key={item.value} className={filter === item.value ? 'filter-active' : ''} onClick={() => updateViewState({ filter: item.value, scrollY: 0 })} aria-pressed={filter === item.value} aria-label={item.value}>
              <span className="series-filter__circle">{item.short}</span>
              <span className="series-filter__label">{item.label.split('\n').map((line, index) => <span key={line}>{line}{index === 0 && item.label.includes('\n') ? <br /> : null}</span>)}</span>
              <span className="series-filter__desktop-label">{item.desktopLabel}</span>
            </button>
          ))}
        </div>
        {filteredRaces.map((race) => renderRaceCard(race, isSearching))}
        {showArchive && archiveRacesByYear.map(({ year, races: archiveRaces }) => {
          if (archiveRaces.length === 0) return null
          const isOpen = openArchiveYears.includes(year)
          return (
            <section className="calendar-archive" key={year}>
              <button type="button" className="calendar-archive__toggle" onClick={() => toggleArchiveYear(year)} aria-expanded={isOpen}>
                <span>{year}</span><span className={`calendar-archive__chevron${isOpen ? ' calendar-archive__chevron--open' : ''}`}>›</span>
              </button>
              {isOpen && <div className="calendar-archive__races">{archiveRaces.map((race) => renderRaceCard(race))}</div>}
            </section>
          )
        })}
      </section>
      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default CalendarPage
