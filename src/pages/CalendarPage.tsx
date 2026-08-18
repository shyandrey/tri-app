import { useState } from 'react'
import RaceCard from '../components/RaceCard'

type Race = {
  id: number
  tag: string
  name: string
  date: string
  location: string
  city: string
  swim: string
  bike: string
  run: string
  description: string
}

type CalendarPageProps = {
  races: Race[]
  onBack: () => void
  onRaceClick: (race: Race) => void
}

function CalendarPage({ races, onBack, onRaceClick }: CalendarPageProps) {
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('Все')
    const filteredRaces = races.filter((race) => {
        const matchesSearch =
            race.name.toLowerCase().includes(search.toLowerCase()) ||
            race.location.toLowerCase().includes(search.toLowerCase())

        const matchesFilter =
            filter === 'Все' || race.tag === filter

        return matchesSearch && matchesFilter
  })
  return (
    <main className="app">
      <section className="section">
        <div className="section__header">
          <h1>Календарь стартов</h1>

          <button onClick={onBack}>
            ← Назад
          </button>
        </div>
    <input
  className="calendar-search"
  type="text"
  placeholder="Поиск стартов..."
  value={search}
  onChange={(event) => setSearch(event.target.value)}
/>

<div className="calendar-filters">
  {['Все', '70.3', 'IRONMAN', 'T100'].map((item) => (
    <button
      key={item}
      className={filter === item ? 'filter-active' : ''}
      onClick={() => setFilter(item)}
    >
      {item}
    </button>
  ))}
</div>

        {filteredRaces.map((race) => (
          <RaceCard
            key={race.id}
            tag={race.tag}
            name={race.name}
            date={race.date}
            location={race.location}
            onClick={() => {
  onRaceClick(race)
}}
          />
        ))}
      </section>
    </main>
  )
}

export default CalendarPage