import type { Race } from '../types/Race'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'

type RaceDetailPageProps = {
  race: Race
  onBack: () => void
  onNavigate: (page: Page) => void
}

function RaceDetailPage({
  race,
  onBack,
  onNavigate,
}: RaceDetailPageProps) {
  return (
  <main className="app">
    <section className="section race-detail-page">
      <button className="race-detail-back" onClick={onBack}>
        ← Назад
      </button>

      <div className="race-detail">
        <span className="race-card__tag">{race.distance}</span>

        <h1>{race.name}</h1>

        <p className="race-detail-meta">
          {race.date} · {race.city}, {race.country}
        </p>

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
    </section>
  <BottomNav
  currentPage="calendar"
  onNavigate={onNavigate}
/>
  </main>
)
}
export default RaceDetailPage