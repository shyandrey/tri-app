import type { RaceDistance, RaceSeries } from '../types/Race'

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

const monthAbbreviations: Record<string, string> = {
  января: 'ЯНВ',
  февраля: 'ФЕВ',
  марта: 'МАР',
  апреля: 'АПР',
  мая: 'МАЙ',
  июня: 'ИЮН',
  июля: 'ИЮЛ',
  августа: 'АВГ',
  сентября: 'СЕН',
  октября: 'ОКТ',
  ноября: 'НОЯ',
  декабря: 'ДЕК',
}

function getCompactDate(date: string) {
  const [day = '', month = ''] = date.trim().split(/\s+/)

  return {
    day,
    month: monthAbbreviations[month.toLowerCase()] ?? month.slice(0, 3).toUpperCase(),
  }
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
  const compactDate = getCompactDate(date)

  const genderLabel =
    gender === 'WPRO'
      ? { symbol: '♀︎', label: 'WOMEN' }
      : gender === 'MPRO'
        ? { symbol: '♂︎', label: 'MEN' }
        : null

  return (
    <article className="race-card race-card--compact" onClick={onClick}>
      <div className="race-card__date-block" aria-label={date}>
        <strong>{compactDate.day}</strong>
        <span>{compactDate.month}</span>
      </div>

      <div className="race-card__content">
        <h3>{name}</h3>

        <p className="race-card__location">
          {city ? `${city}, ${country}` : country}
        </p>

        <div className="race-card__meta-row">
          <span className="race-card__tag">{distance}</span>
          <p className="race-card__series">{series}</p>
          {genderLabel && (
            <span className="race-card__gender">
              <span className="race-card__gender-symbol" aria-hidden="true">{genderLabel.symbol}</span>
              {genderLabel.label}
            </span>
          )}
        </div>
      </div>

      <span className="race-card__arrow">›</span>
    </article>
  )
}

export default RaceCard