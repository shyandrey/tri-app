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

type RaceDetailPageProps = {
  race: Race
  onBack: () => void
}

function RaceDetailPage({ race, onBack }: RaceDetailPageProps) {
  return (
  <main className="app">
    <section className="section race-detail-page">
      <button className="race-detail-back" onClick={onBack}>
        ← Назад
      </button>

      <div className="race-detail">
        <span className="race-card__tag">{race.tag}</span>

        <h1>{race.name}</h1>

        <p className="race-detail-meta">
          {race.date} · {race.city}, {race.location}
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
  </main>
)
}
export default RaceDetailPage