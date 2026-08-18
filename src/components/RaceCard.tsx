type RaceCardProps = {
  tag: string
  name: string
  date: string
  location: string
  onClick?: () => void
}

function RaceCard({
  tag,
  name,
  date,
  location,
  onClick,
}: RaceCardProps) {
  return (
    <article
      className="race-card"
      onClick={onClick}
    >
      <div>
        <span className="race-card__tag">{tag}</span>
        <h3>{name}</h3>
        <p>{date} · {location}</p>
      </div>

      <span className="race-card__arrow">›</span>
    </article>
  )
}

export default RaceCard