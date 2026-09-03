import type { RaceDistance, RaceSeries } from '../types/Race'
import ironmanProImage from '../assets/series/ironman-pro.jpeg'
import t100WorldTourImage from '../assets/series/t100-worldtour.jpeg'

type RaceCardProps = {
  distance: RaceDistance
  series: RaceSeries
  name: string
  date: string
  city: string
  country: string
  gender?: 'WPRO' | 'MPRO' | 'WPRO & MPRO'
  onClick?: () => void
}

function CalendarIcon() {
  return (
    <svg className="race-card__info-icon race-card__info-icon--calendar" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4.5 8.5h15M5.5 5h13a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="M7.5 12h1M11.5 12h1M15.5 12h1M7.5 16h1M11.5 16h1M15.5 16h1" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="race-card__info-icon race-card__info-icon--location" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

function RaceCard({
  distance,
  series,
  name,
  date,
  city,
  country,
  gender,
  onClick,
}: RaceCardProps) {
  const genderLabel =
    gender === 'WPRO'
      ? { symbol: '♀︎', label: 'WOMEN' }
      : gender === 'MPRO'
        ? { symbol: '♂︎', label: 'MEN' }
        : null

  const seriesImage =
    series === 'IRONMAN Pro Series'
      ? ironmanProImage
      : series === 'Triathlon World Tour'
        ? t100WorldTourImage
        : null

  const seriesClass =
    series === 'IRONMAN Pro Series'
      ? 'race-card--ironman'
      : series === 'Triathlon World Tour'
        ? 'race-card--t100'
        : 'race-card--roth'

  const distanceLabel = series === 'Challenge' ? 'ROTH' : distance

  return (
    <article className={`race-card race-card--compact ${seriesClass}`} onClick={onClick}>
      <div className="race-card__series-mark" aria-hidden="true">
        {seriesImage ? (
          <img className="race-card__series-image" src={seriesImage} alt="" />
        ) : (
          <span>R</span>
        )}
      </div>

      <h3 className="race-card__title">{name}</h3>

      <div className="race-card__info-row">
        <span className="race-card__info-item">
          <CalendarIcon />
          <span>{date}</span>
        </span>
        <span className="race-card__info-divider" aria-hidden="true" />
        <span className="race-card__info-item race-card__location">
          <LocationIcon />
          <span>{city ? `${city}, ${country}` : country}</span>
        </span>
      </div>

      <span className="race-card__tag race-card__tag--series">{distanceLabel}</span>

      <div className="race-card__meta-row">
        <p className="race-card__series">{series}</p>
        {genderLabel && (
          <span className="race-card__gender">
            <span className="race-card__gender-symbol" aria-hidden="true">{genderLabel.symbol}</span>
            {genderLabel.label}
          </span>
        )}
      </div>

      <span className="race-card__arrow">›</span>
    </article>
  )
}

export default RaceCard