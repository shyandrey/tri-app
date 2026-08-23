import type { Athlete } from '../types/Athlete'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Race } from '../types/Race'

type AthleteDetailPageProps = {
  athlete: Athlete
  results: RaceResult[]
  races: Race[]
  onBack: () => void
  onNavigate: (page: Page) => void
  onRaceClick: (race: Race) => void
}

function AthleteDetailPage({
  athlete,
  results,
  races,
  onBack,
  onNavigate,
  onRaceClick,
}: AthleteDetailPageProps) {
  const recentResults = results
    .map((result) => {
      const race = races.find((race) => race.id === result.raceId)

      return {
        ...result,
        race,
      }
    })
    .filter((result) => result.race)
    .sort((a, b) => {
      return (
        new Date(b.race!.dateISO).getTime() -
        new Date(a.race!.dateISO).getTime()
      )
    })
    .slice(0, 3)

  return (
    <main className="app">
      <section className="section athlete-detail-page">
        <button className="race-detail-back" onClick={onBack}>
          ← Назад
        </button>

        <div className="athlete-detail">
          {athlete.image && (
            <img
              className="athlete-detail__image"
              src={athlete.image}
              alt={athlete.name}
            />
          )}

          <h1>
            {athlete.name}{' '}
            <span className="athlete-detail__flag-inline">{athlete.flag}</span>
          </h1>

          <p className="athlete-detail__meta">
            {athlete.nameEn}
            {athlete.nameEn && athlete.countryEn && ' · '}
            {athlete.countryEn}
          </p>

          <div className="athlete-detail__about">
            <h2>Об атлете</h2>
            <p>{athlete.bio}</p>
          </div>

          <div className="athlete-detail__achievements">
            <h2>Основные достижения</h2>

            {recentResults.length > 0 && (
              <div className="athlete-detail__results">
                <h2>Недавние результаты</h2>

                <div className="athlete-results-list">
                  {recentResults.map((result) => (
                    <article
                      className="athlete-result-card"
                      key={result.id}
                      onClick={() => onRaceClick(result.race!)}
                    >
                      <div className="athlete-result-card__place">
                        {result.position}
                      </div>

                      <div className="athlete-result-card__info">
                        <strong>{result.race!.name}</strong>

                        <span>
                          {result.race!.date} · {result.race!.city}
                        </span>
                      </div>

                      <strong className="athlete-result-card__time">
                        {result.totalTime ?? '—'}
                      </strong>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <ul>
              {athlete.achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <BottomNav currentPage="athletes" onNavigate={onNavigate} />
    </main>
  )
}

export default AthleteDetailPage
