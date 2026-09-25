import RaceCard from '../components/RaceCard'
import type { RaceEditionView, RaceGender } from '../types/Race'
import type { Page } from '../types/Page'
import BottomNav from '../components/BottomNav'
import { isRaceFinished, isRaceUpcoming } from '../utils/raceDate'
import { getChampionshipNavigationGroup } from '../utils/raceChampionshipGroup'

export type CalendarViewState = {
  search: string
  filter: string
  timeFilter: 'upcoming' | 'finished' | 'all'
  openArchiveYears: number[]
}

type CalendarPageProps = {
  races: RaceEditionView[]
  searchRaces?: RaceEditionView[]
  viewState: CalendarViewState
  onViewStateChange: (state: CalendarViewState) => void
  onBack: () => void
  onRaceClick: (race: RaceEditionView) => void
  onNavigate: (page: Page) => void
}

type RaceCardItem = {
  race: RaceEditionView
  displayDate: string
  displayGender: RaceGender
}

const seriesFilters = [
  { value: 'Все', short: 'ALL', label: 'ВСЕ', desktopLabel: 'Все гонки' },
  { value: 'IRONMAN Pro Series', short: 'IM', label: 'IRONMAN\nPRO SERIES', desktopLabel: 'IRONMAN Pro Series' },
  { value: 'Triathlon World Tour', short: 'T', label: 'TRIATHLON\nWORLD TOUR', desktopLabel: 'Triathlon World Tour' },
] as const

const archiveYears = [2025, 2024] as const
const DAY_MS = 86_400_000
const russianMonthsGenitive = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
] as const

const getRussianMonthGenitive = (date: Date) => russianMonthsGenitive[date.getUTCMonth()]

const formatEventDateRange = (first: RaceEditionView, second: RaceEditionView) => {
  const firstDate = new Date(`${first.dateISO}T00:00:00Z`)
  const secondDate = new Date(`${second.dateISO}T00:00:00Z`)
  const firstDay = firstDate.getUTCDate()
  const secondDay = secondDate.getUTCDate()
  const firstMonth = getRussianMonthGenitive(firstDate)
  const secondMonth = getRussianMonthGenitive(secondDate)

  if (firstDate.getUTCMonth() === secondDate.getUTCMonth()) return `${firstDay}–${secondDay} ${secondMonth}`
  return `${firstDay} ${firstMonth} – ${secondDay} ${secondMonth}`
}

const getRaceSearchTags = (race: RaceEditionView) => {
  const tags: string[] = []
  const championshipGroup = getChampionshipNavigationGroup(race)

  if (championshipGroup) {
    tags.push('чемпионат', 'чемпионат мира', 'финал', 'финал серии', 'world championship')
  }

  const raceYear = race.year
  const isT100Final = race.series === 'Triathlon World Tour' && (
    (race.raceId === 't100-dubai' && raceYear === 2024)
    || race.raceId === 't100-qatar'
    || race.name.toLowerCase().includes('final')
  )

  if (isT100Final) {
    tags.push('финал', 'финал серии', 'гранд финал', 'чемпионат', 'чемпионат мира', 'grand final', 'world championship')
  }

  return tags
}

const groupRaceEventCards = (source: RaceEditionView[]): RaceCardItem[] => {
  const sorted = [...source].sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
  const used = new Set<number>()
  const items: RaceCardItem[] = []

  for (let index = 0; index < sorted.length; index += 1) {
    if (used.has(index)) continue

    const race = sorted[index]
    const oppositeGender = race.gender === 'WPRO' ? 'MPRO' : race.gender === 'MPRO' ? 'WPRO' : undefined

    let pairIndex = -1
    if (oppositeGender) {
      pairIndex = sorted.findIndex((candidate, candidateIndex) => {
        if (candidateIndex === index || used.has(candidateIndex)) return false
        const dateGap = Math.abs(new Date(candidate.dateISO).getTime() - new Date(race.dateISO).getTime())

        return candidate.raceId === race.raceId
          && candidate.year === race.year
          && candidate.gender === oppositeGender
          && candidate.name === race.name
          && candidate.city === race.city
          && candidate.country === race.country
          && dateGap <= DAY_MS
      })
    }

    if (pairIndex >= 0) {
      const pair = sorted[pairIndex]
      const [first, second] = race.dateISO <= pair.dateISO ? [race, pair] : [pair, race]
      used.add(index)
      used.add(pairIndex)
      items.push({ race: first, displayDate: formatEventDateRange(first, second), displayGender: 'WPRO+MPRO' })
      continue
    }

    used.add(index)
    items.push({ race, displayDate: race.date, displayGender: race.gender })
  }

  return items
}

function CalendarPage({ races, searchRaces = races, viewState, onViewStateChange, onBack, onRaceClick, onNavigate }: CalendarPageProps) {
  const { search, filter, timeFilter, openArchiveYears } = viewState

  const updateViewState = (patch: Partial<CalendarViewState>) => {
    onViewStateChange({ ...viewState, ...patch })
  }

  const isSearching = search.trim().length > 0
  const normalizedSearch = search.trim().toLowerCase()
  const visibleRaces = (isSearching ? searchRaces : races).filter((race) => race.series !== 'Challenge')

  const filteredRaces = visibleRaces
    .filter((race) => {
      const searchableText = [
        race.name,
        race.city,
        race.country,
        race.series,
        ...getRaceSearchTags(race),
      ].join(' ').toLowerCase()
      const matchesSearch = searchableText.includes(normalizedSearch)

      const matchesFilter = filter === 'Все' || race.series === filter
      const matchesTime =
        timeFilter === 'all' ||
        (timeFilter === 'upcoming' && isRaceUpcoming(race)) ||
        (timeFilter === 'finished' && isRaceFinished(race))

      return isSearching ? matchesSearch : matchesFilter && matchesTime
    })

  const groupedFilteredRaces = groupRaceEventCards(filteredRaces)
    .sort((a, b) => {
      const aDate = new Date(a.race.dateISO).getTime()
      const bDate = new Date(b.race.dateISO).getTime()
      if (isSearching || timeFilter === 'finished') return bDate - aDate
      return aDate - bDate
    })

  const archiveRacesByYear = archiveYears.map((year) => ({
    year,
    races: groupRaceEventCards(
      searchRaces
        .filter((race) => race.series !== 'Challenge')
        .filter((race) => race.year === year)
        .filter((race) => filter === 'Все' || race.series === filter)
    ).sort((a, b) => new Date(a.race.dateISO).getTime() - new Date(b.race.dateISO).getTime()),
  }))

  const showArchive = !isSearching && timeFilter !== 'upcoming'

  const toggleArchiveYear = (year: number) => {
    updateViewState({
      openArchiveYears: openArchiveYears.includes(year)
        ? openArchiveYears.filter((item) => item !== year)
        : [...openArchiveYears, year],
    })
  }

  const openRace = (race: RaceEditionView) => {
    onRaceClick(race)
  }

  const navigateFromCalendar = (target: Page) => {
    onNavigate(target)
  }

  const renderRaceCard = (item: RaceCardItem, showYear = false) => {
    const { race, displayDate, displayGender } = item
    return (
      <RaceCard
        key={`${race.raceId}-${race.year}-${displayDate}`}
        distance={race.distance}
        series={race.series}
        name={race.name}
        date={`${displayDate}${showYear ? ` ${race.year}` : ''}`}
        city={race.city}
        country={race.country}
        gender={displayGender}
        onClick={() => openRace(race)}
      />
    )
  }

  return (
    <main className="app">
      <button className="page-back-button" onClick={onBack}>← Назад</button>
      <section className="section">
        <div className="section__header"><h1>Календарь и результаты</h1></div>
        <div className="calendar-search-wrap">
          <input className="calendar-search" type="text" placeholder="Найти старт..." value={search} onChange={(event) => updateViewState({ search: event.target.value })} />
          {search && (
            <button type="button" className="calendar-search-clear" aria-label="Очистить поиск" onClick={() => updateViewState({ search: '' })}>×</button>
          )}
        </div>
        <div className="calendar-time-filters">
          <button className={timeFilter === 'upcoming' ? 'filter-active' : ''} onClick={() => updateViewState({ timeFilter: 'upcoming' })}>Предстоящие</button>
          <button className={timeFilter === 'finished' ? 'filter-active' : ''} onClick={() => updateViewState({ timeFilter: 'finished' })}>Прошедшие</button>
          <button className={timeFilter === 'all' ? 'filter-active' : ''} onClick={() => updateViewState({ timeFilter: 'all' })}>Все</button>
        </div>
        <div className="calendar-filters calendar-filters--series">
          {seriesFilters.map((item) => (
            <button key={item.value} className={filter === item.value ? 'filter-active' : ''} onClick={() => updateViewState({ filter: item.value })} aria-pressed={filter === item.value} aria-label={item.value}>
              <span className="series-filter__circle">{item.short}</span>
              <span className="series-filter__label">{item.label.split('\n').map((line, index) => <span key={line}>{line}{index === 0 && item.label.includes('\n') ? <br /> : null}</span>)}</span>
              <span className="series-filter__desktop-label">{item.desktopLabel}</span>
            </button>
          ))}
        </div>
        {groupedFilteredRaces.map((item) => renderRaceCard(item, isSearching))}
        {showArchive && archiveRacesByYear.map(({ year, races: archiveRaces }) => {
          if (archiveRaces.length === 0) return null
          const isOpen = openArchiveYears.includes(year)
          return (
            <section className="calendar-archive" key={year}>
              <button type="button" className="calendar-archive__toggle" onClick={() => toggleArchiveYear(year)} aria-expanded={isOpen}>
                <span>{year}</span><span className={`calendar-archive__chevron${isOpen ? ' calendar-archive__chevron--open' : ''}`}>›</span>
              </button>
              {isOpen && <div className="calendar-archive__races">{archiveRaces.map((item) => renderRaceCard(item))}</div>}
            </section>
          )
        })}
      </section>
      <BottomNav currentPage="calendar" onNavigate={navigateFromCalendar} />
    </main>
  )
}

export default CalendarPage
