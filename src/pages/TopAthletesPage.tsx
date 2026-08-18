import type { Athlete } from '../types/Athlete'

type TopAthletesPageProps = {
  athletes: Athlete[]
  onBack: () => void
  onAthleteClick: (athlete: Athlete) => void
}

function TopAthletesPage({
  athletes,
  onBack,
  onAthleteClick,
}: TopAthletesPageProps) {
  return (
    <main className="app">
      <section className="section">
        <div className="section__header">
          <h1>Топ атлетов</h1>

          <button onClick={onBack}>
            ← Назад
          </button>
        </div>

        <div className="top-athletes">
          {athletes.map((athlete, index) => (
            <article
              className="top-athlete-card"
              key={athlete.id}
              onClick={() => onAthleteClick(athlete)}
            >
              <div className="top-athlete-card__position">
                {index + 1}
              </div>

              <div className="top-athlete-card__info">
                <h3>
                  {athlete.name} {athlete.flag}
                </h3>

                <p>
                  {athlete.country} · {athlete.discipline}
                </p>
              </div>

              <span className="top-athlete-card__arrow">›</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default TopAthletesPage