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

function CalendarPage({ races, onBack, onRaceClick, onNavigate }: CalendarPageProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Все')
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'finished' | 'all'>('upcoming')

  const filteredRaces = races.filter((race) => {
    const matchesSearch =
      race.name.toLowerCase().includes(search.toLowerCase()) ||
      race.city.toLowerCase().includes(search.toLowerCase()) ||
      race.country.toLowerCase().includes(search.toLowerCase())

    const matchesFilter = filter === 'Все' || race.distance === filter
    const matchesTime =
      timeFilter === 'all' ||
      (timeFilter === 'upcoming' && isRaceUpcoming(race)) ||
      (timeFilter === 'finished' && isRaceFinished(race))

    return matchesSearch && matchesFilter && matchesTime
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

        <div className="calendar-filters">
          {['Все', '70.3', 'IRONMAN', 'T100'].map((item) => (
            <button key={item} className={filter === item ? 'filter-active' : ''} onClick={() => setFilter(item)}>{item}</button>
          ))}
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
            onClick={() => onRaceClick(race)}
          />
        ))}
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default CalendarPage
