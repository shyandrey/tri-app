import { useState } from 'react'
import RaceCard from '../components/RaceCard'
import type { Race } from '../types/Race'
import type { Page } from '../types/Page'
import BottomNav from '../components/BottomNav'
import { isRaceFinished, isRaceUpcoming } from '../utils/raceDate'

type CalendarPageProps = {
  races: Race[]
  onBack: () => void
  onRaceClick: (race: Race) => void
  onNavigate: (page: Page) => void
}

const seriesFilters = [
  { value: 'Все', short: 'ALL', label: 'ВСЕ' },
  { value: 'IRONMAN Pro Series', short: 'IM', label: 'IRONMAN\nPRO SERIES' },
  { value: 'Triathlon World Tour', short: 'T', label: 'TRIATHLON\nWORLD TOUR' },
] as const

function CalendarPage({ races, onBack, onRaceClick, onNavigate }: CalendarPageProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'finished' | 'all'>('upcoming')

  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.name.toLowerCase().includes(search.toLowerCase()) ||
      race.city.toLowerCase().includes(search.toLowerCase()) ||
      race.country.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === 'Все' || race.series === filter
    const matchesTime =
      timeFilter === 'all' ||
      (timeFilter === 'upcoming' && isRaceUpcoming(race)) ||
      (timeFilter === 'finished' && isRaceFinished(race))

    const isSearching = search.trim().length > 0

    return isSearching
      ? matchesSearch
      : matchesFilter && matchesTime
  })

  return (
    <main className="app">
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className="section">
        <div className="section__header">
          <h1>Календарь стартов</h1>
        </div>

        <input
          className="calendar-search"
          type="text"
          placeholder="Поиск стартов..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="calendar-time-filters">
          <button className={timeFilter === 'upcoming' ? 'filter-active' : ''} onClick={() => setTimeFilter('upcoming')}>Предстоящие</button>
          <button className={timeFilter === 'finished' ? 'filter-active' : ''} onClick={() => setTimeFilter('finished')}>Прошедшие</button>
          <button className={timeFilter === 'all' ? 'filter-active' : ''} onClick={() => setTimeFilter('all')}>Все</button>
        </div>

        <div className="calendar-filters calendar-filters--series">
          {seriesFilters.map((item) => (
            <button
              key={item.value}
              className={filter === item.value ? 'filter-active' : ''}
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              aria-label={item.value}
            >
              <span className="series-filter__circle">{item.short}</span>
              <span className="series-filter__label">
                {item.label.split('\n').map((line, index) => (
                  <span key={line}>{line}{index === 0 && item.label.includes('\n') ? <br /> : null}</span>
                ))}
              </span>
              <span className="series-filter__desktop-label">{item.value}</span>
            </button>
          ))}

          <button
            className="series-filter--disabled"
            type="button"
            disabled
            aria-label="Challenge Roth — скоро"
          >
            <span className="series-filter__circle">R</span>
            <span className="series-filter__label">CHALLENGE<br />ROTH</span>
            <span className="series-filter__desktop-label">Challenge Roth</span>
          </button>
        </div>

        {filteredRaces.map((race) => (
          <RaceCard
            key={race.id}
            distance={race.distance}
            series={race.series}
            name={race.name}
            date={race.date}
            city={race.city}
            country={race.country}
            gender={race.gender}
            onClick={() => onRaceClick(race)}
          />
        ))}
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default CalendarPage
