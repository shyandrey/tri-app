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

function RaceDetailPage({
  race,
  results,
  athletes,
  onBack,
  onNavigate,
  onAthleteClick,
}: RaceDetailPageProps) {
  const useResultsTable = race.id === 22

  return (
    <main className="app">
      <section className={`section race-detail-page ${useResultsTable ? 'race-detail-page--table' : ''}`}>
        <button className="race-detail-back" onClick={onBack}>
          ← Назад
        </button>

        <div className="race-detail">
          <span className="race-card__tag">{race.distance}</span>

          <h1>{race.name}</h1>

          <p className="race-detail-meta">
            {race.date} · {race.city}, {race.country}
          </p>

          <div className="race-detail__summary">
            <div className="race-detail-distances">
              <div className="race-detail-distance">
                <span>🏊</span>
                <strong>{race.swim}</strong>
                <small>Плавание</small>
              </div>

              <div className="race-detail-distance">
                <span>🚴</span>
                <strong>{race.bike}</strong>
                <small>Велосипед</small>
              </div>

              <div className="race-detail-distance">
                <span>🏃</span>
                <strong>{race.run}</strong>
                <small>Бег</small>
              </div>
            </div>

            <div className="race-detail-about">
              <h2>О гонке</h2>
              <p>{race.description}</p>
            </div>
          </div>

          {results.length > 0 && useResultsTable && (
            <RaceResultsTable
              results={results}
              athletes={athletes}
              onAthleteClick={onAthleteClick}
            />
          )}

          {results.length > 0 && !useResultsTable && (
            <div className="race-results">
              <h2>Результаты</h2>

              <div className="race-results__list">
                {results.map((result) => {
                  const athlete = result.athleteId
                    ? athletes.find((athlete) => athlete.id === result.athleteId)
                    : undefined

                  return (
                    <article
                      className={`race-result-card ${
                        athlete ? 'race-result-card--clickable' : ''
                      }`}
                      key={result.id}
                      onClick={() => {
                        if (athlete) {
                          onAthleteClick(athlete)
                        }
                      }}
                    >
                      <div className="race-result-card__top">
                        <span className="race-result-card__position">
                          {result.position}
                        </span>

                        <div className="race-result-card__athlete">
                          <strong>
                            {result.athleteName}{' '}
                            {countryCodeToFlag(result.countryCode)}
                          </strong>

                          {result.country && <small>{result.country}</small>}
                        </div>

                        <strong className="race-result-card__time">
                          {typeof result.position === 'string'
                            ? result.position
                            : result.totalTime ?? '—'}
                        </strong>
                      </div>

                      <div className="race-result-card__splits">
                        <span>🏊 {result.swimTime ?? '—'}</span>
                        <span>🚴 {result.bikeTime ?? '—'}</span>
                        <span>🏃 {result.runTime ?? '—'}</span>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default RaceDetailPage
