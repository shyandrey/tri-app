import type { Athlete } from '../types/Athlete'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'

type AthletesPageProps = {
  athletes: Athlete[]
  onBack: () => void
  onAthleteClick: (athlete: Athlete) => void
  onNavigate: (page: Page) => void
}

function AthletesPage({ athletes, onBack, onAthleteClick, onNavigate }: AthletesPageProps) {
  return (
    <main className="app">
      <section className="section">
        <div className="section__header">
          <h1>Профили атлетов</h1>
          <button onClick={onBack}>← Назад</button>
        </div>

        <div className="athletes-list">
          {athletes.map((athlete) => (
            <article className="athlete-card" key={athlete.id} onClick={() => onAthleteClick(athlete)}>
              <div className="athlete-card__flag">{athlete.flag}</div>
              {athlete.image ? (
                <img className="athlete-card__image" src={athlete.image} alt="" />
              ) : (
                <div className="athlete-card__image athlete-card__image--placeholder">{athlete.name.charAt(0)}</div>
              )}
              <div className="athlete-card__info">
                <h3>{athlete.name}</h3>
                <p>{athlete.country}</p>
              </div>
              <span className="athlete-card__arrow">›</span>
            </article>
          ))}
        </div>
      </section>
      <BottomNav currentPage="athletes" onNavigate={onNavigate} />
    </main>
  )
}

export default AthletesPage
