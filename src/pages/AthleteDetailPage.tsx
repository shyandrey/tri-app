import type { Athlete } from '../types/Athlete'

type AthleteDetailPageProps = {
  athlete: Athlete
  onBack: () => void
}

function AthleteDetailPage({
  athlete,
  onBack,
}: AthleteDetailPageProps) {
  return (
    <main className="app">
      <section className="section athlete-detail-page">
        <button
          className="race-detail-back"
          onClick={onBack}
        >
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
             {athlete.name} <span className="athlete-detail__flag-inline">{athlete.flag}</span>
          </h1>

          <p className="athlete-detail__meta">
            {athlete.country} · {athlete.discipline}
          </p>

          <div className="athlete-detail__about">
            <h2>Об атлете</h2>
            <p>{athlete.bio}</p>
          </div>

          <div className="athlete-detail__achievements">
            <h2>Основные достижения</h2>

            <ul>
              {athlete.achievements.map((achievement) => (
                <li key={achievement}>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AthleteDetailPage