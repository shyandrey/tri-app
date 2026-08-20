import type { RaceDistance, RaceSeries } from '../types/Race'

type RaceCardProps = {
  distance: RaceDistance
  series: RaceSeries
  name: string
  date: string
  city: string
  country: string
  onClick?: () => void
}

function RaceCard({
  distance,
  series,
  name,
  date,
  city,
  country,
  onClick,
}: RaceCardProps) {
  return (
    <article
      className="race-card"
      onClick={onClick}
    >
      <div>
        <span className="race-card__tag">
          {distance}
        </span>

        <h3>{name}</h3>

        <p>
          {date} · {city}, {country}
        </p>

        <p className="race-card__series">
          {series}
        </p>
      </div>

      <span className="race-card__arrow">›</span>
    </article>
  )
}

export default RaceCard