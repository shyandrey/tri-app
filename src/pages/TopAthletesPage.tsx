import { usePageState } from '../navigation/usePageState'
import type { Athlete, AthleteGender } from '../types/Athlete'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'

type TopAthletesPageProps = {
  athletes: Athlete[]
  onBack: () => void
  onAthleteClick: (athlete: Athlete) => void
  onNavigate: (page: Page) => void
}

function TopAthletesPage({ athletes, onBack, onAthleteClick, onNavigate }: TopAthletesPageProps) {
  const [gender, setGender] = usePageState<AthleteGender>('rankingGender', 'M')
  const visibleAthletes = athletes.filter(athlete => athlete.gender === gender)
  return (
    <main className="app">
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className="section">
        <div className="section__header">
          <h1>Топ атлетов</h1>
        </div>

        <div className="athletes-gender-filter" aria-label="Пол атлета в рейтинге">
          {([{ value: 'M', label: 'MEN', symbol: '♂' }, { value: 'W', label: 'WOMEN', symbol: '♀' }] as const).map(item => (
            <button key={item.value} type="button" className={gender === item.value ? 'athletes-gender-card is-active' : 'athletes-gender-card'} aria-pressed={gender === item.value} onClick={() => setGender(item.value)}>
              <span className="athletes-gender-card__symbol">{item.symbol}</span>
              <span className="athletes-gender-card__label">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="top-athletes">
          {visibleAthletes.map((athlete, index) => (
            <article className="top-athlete-card" key={athlete.id} onClick={() => onAthleteClick(athlete)}>
              <div className="top-athlete-card__position">{index + 1}</div>
              <div className="top-athlete-card__info">
                <h3>{athlete.name} {athlete.flag}</h3>
                <p>{athlete.country} · {athlete.discipline}</p>
              </div>
              <span className="top-athlete-card__arrow">›</span>
            </article>
          ))}
        </div>
      </section>

      <BottomNav currentPage="top" onNavigate={onNavigate} />
    </main>
  )
}

export default TopAthletesPage
