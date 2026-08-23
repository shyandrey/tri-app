import type { Race } from '../types/Race'
import BottomNav from '../components/BottomNav'
import RaceResultsTable from '../components/RaceResultsTable'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Athlete } from '../types/Athlete'

type RaceDetailPageProps = {
  race: Race
  results: RaceResult[]
  athletes: Athlete[]
  onBack: () => void
  onNavigate: (page: Page) => void
  onAthleteClick: (athlete: Athlete) => void
}

function RaceDetailPage({ race, results, athletes, onBack, onNavigate, onAthleteClick }: RaceDetailPageProps) {
  const hasResults = results.length > 0

  return (
    <main className="app">
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className={`section race-detail-page ${hasResults ? 'race-detail-page--table' : ''}`}>
        <div className="race-detail">
          <span className="race-card__tag">{race.distance}</span>
          <h1>{race.name}</h1>
          <p className="race-detail-meta">{race.date} · {race.city}, {race.country}</p>

          <div className="race-detail__summary">
            <div className="race-detail-distances">
              <div className="race-detail-distance"><span>🏊</span><strong>{race.swim}</strong><small>Плавание</small></div>
              <div className="race-detail-distance"><span>🚴</span><strong>{race.bike}</strong><small>Велосипед</small></div>
              <div className="race-detail-distance"><span>🏃</span><strong>{race.run}</strong><small>Бег</small></div>
            </div>

            <div className="race-detail-about">
              <h2>О гонке</h2>
              <p>{race.description}</p>
            </div>
          </div>

          {hasResults && <RaceResultsTable results={results} athletes={athletes} onAthleteClick={onAthleteClick} />}
        </div>
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default RaceDetailPage
