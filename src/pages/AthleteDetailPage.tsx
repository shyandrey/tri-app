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
  const athleteResults = results
    .filter((result) => result.athleteId === athlete.id)
    .map((result) => ({
      ...result,
      race: races.find((race) => race.id === result.raceId),
    }))
    .filter((result) => result.race)
    .sort(
      (a, b) =>
        new Date(b.race!.dateISO).getTime() -
        new Date(a.race!.dateISO).getTime(),
    )

  const resultsByYear = athleteResults.reduce<Record<string, typeof athleteResults>>(
    (groups, result) => {
      const year = result.race!.dateISO.slice(0, 4)
      groups[year] = [...(groups[year] ?? []), result]
      return groups
    },
    {},
  )

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
            <h2>Ключевые достижения</h2>
            <ul>
              {athlete.achievements.map((achievement) => (
                <li key={achievement}>{achievement}</li>
              ))}
            </ul>
          </div>

          {athleteResults.length > 0 && (
            <div className="athlete-detail__results">
              <h2>Результаты</h2>

              {Object.entries(resultsByYear)
                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                .map(([year, yearResults]) => (
                  <div className="athlete-results-season" key={year}>
                    <h3>{year}</h3>

                    <div className="athlete-results-list">
                      {yearResults.map((result) => (
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
                ))}
            </div>
          )}
        </div>
      </section>

      <BottomNav currentPage="athletes" onNavigate={onNavigate} />
    </main>
  )
}

export default AthleteDetailPage
