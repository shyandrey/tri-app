import type { Race } from '../types/Race'
import BottomNav from '../components/BottomNav'
import RaceResultsTable from '../components/RaceResultsTable'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Athlete } from '../types/Athlete'
import { countryCodeToFlag } from '../utils/countryFlag'

type RaceDetailPageProps = {
  race: Race
  results: RaceResult[]
  athletes: Athlete[]
  onBack: () => void
  onNavigate: (page: Page) => void
  onAthleteClick: (athlete: Athlete) => void
}

const seriesYears = [2026, 2025, 2024]

function RaceDetailPage({ race, results, athletes, onBack, onNavigate, onAthleteClick }: RaceDetailPageProps) {
  const hasResults = results.length > 0
  const currentYear = race.year ?? new Date(race.dateISO).getFullYear()
  const winners = results.filter((result) => result.position === 1)
  const maleWinner = winners.find((result) => result.gender === 'M')
  const femaleWinner = winners.find((result) => result.gender === 'W')

  const winnerLine = (winner?: RaceResult) => {
    if (!winner) return null
    const flag = winner.countryCode ? countryCodeToFlag(winner.countryCode) : ''
    return (
      <div className="race-winner">
        <span className="race-winner__flag">{flag}</span>
        <strong>{winner.athleteName}</strong>
        <span>{winner.totalTime ?? '—'}</span>
      </div>
    )
  }

  return (
    <main className="app">
      <span className="race-detail-page__distance-tag race-card__tag">{race.distance}</span>
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className={`section race-detail-page ${hasResults ? 'race-detail-page--table' : ''}`}>
        <div className="race-detail">
          <h1>{race.name}</h1>
          <p className="race-detail-meta">{race.date} · {race.city}, {race.country}</p>

          <div className="race-season-switcher" aria-label="Сезон гонки">
            {seriesYears.map((year) => (
              <button
                key={year}
                type="button"
                className={year === currentYear ? 'race-season-switcher__year race-season-switcher__year--active' : 'race-season-switcher__year'}
                disabled={year !== currentYear}
                title={year !== currentYear ? 'Результаты этого сезона скоро появятся' : undefined}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="race-detail__summary">
            <div className="race-detail-about">
              <h2>О гонке</h2>
              <p>{race.description}</p>
            </div>
          </div>

          {hasResults && <RaceResultsTable results={results} athletes={athletes} onAthleteClick={onAthleteClick} />}

          {winners.length > 0 && (
            <section className="race-winners">
              <h2>Победители Pro Series</h2>
              <div className="race-winners__year">
                <strong className="race-winners__year-label">{currentYear}</strong>
                <div className="race-winners__people">
                  {winnerLine(maleWinner)}
                  {winnerLine(femaleWinner)}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default RaceDetailPage
