import { useState } from 'react'
import type { Athlete } from '../types/Athlete'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Race } from '../types/Race'
import '../athlete-detail.css'

type AthleteDetailPageProps = {
  athlete: Athlete
  results: RaceResult[]
  races: Race[]
  onBack: () => void
  onNavigate: (page: Page) => void
  onRaceClick: (race: Race) => void
}

function podiumMedal(position: RaceResult['position']) {
  if (position === 1) return '🥇'
  if (position === 2) return '🥈'
  if (position === 3) return '🥉'
  return null
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.6" cy="6.7" r="1" className="athlete-social-icon__dot" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 8.2a3 3 0 0 0-2.1-2.1C17.1 5.6 12 5.6 12 5.6s-5.1 0-6.9.5A3 3 0 0 0 3 8.2 31 31 0 0 0 2.6 12 31 31 0 0 0 3 15.8a3 3 0 0 0 2.1 2.1c1.8.5 6.9.5 6.9.5s5.1 0 6.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8Z" />
      <path d="m10 9 5 3-5 3Z" className="athlete-social-icon__play" />
    </svg>
  )
}

function LaurelIcon() {
  const leftLeaves = [
    { x: 7.6, y: 17.9, angle: -60, scale: 1.08 },
    { x: 5.7, y: 15.7, angle: -48, scale: 1.06 },
    { x: 4.6, y: 13.0, angle: -35, scale: 1.02 },
    { x: 4.4, y: 10.0, angle: -23, scale: 0.98 },
    { x: 5.2, y: 7.2, angle: -12, scale: 0.94 },
    { x: 6.7, y: 4.9, angle: -4, scale: 0.88 },
  ]

  return (
    <svg className="athlete-achievement__laurel" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="laurelLeafGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cfff82" />
          <stop offset="34%" stopColor="#86e95b" />
          <stop offset="68%" stopColor="#4fc845" />
          <stop offset="100%" stopColor="#2b8b39" />
        </linearGradient>
        <linearGradient id="laurelStemGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#72d852" />
          <stop offset="100%" stopColor="#2d8d38" />
        </linearGradient>
      </defs>

      <path
        className="athlete-achievement__laurel-stem"
        d="M11.2 20.5C7.3 19.7 4.7 17.5 3.8 14.2C2.9 10.9 3.6 7.6 6.6 4.1"
      />
      <path
        className="athlete-achievement__laurel-stem"
        d="M12.8 20.5C16.7 19.7 19.3 17.5 20.2 14.2C21.1 10.9 20.4 7.6 17.4 4.1"
      />
      <path
        className="athlete-achievement__laurel-stem"
        d="M10.8 20.2C11.2 20.5 11.6 20.7 12 20.9C12.4 20.7 12.8 20.5 13.2 20.2"
      />

      {leftLeaves.map((leaf, index) => (
        <g key={`left-${index}`} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}>
          <path
            className="athlete-achievement__laurel-leaf"
            d="M0 0C-1.75-1.05-2.25-2.95-.95-4.55C-.1-5.55 1.35-5.25 2.05-4.05C2.85-2.7 2.35-1.05 0 0Z"
          />
          <path className="athlete-achievement__laurel-leaf-vein" d="M0-.2C.25-1.45.15-2.7-.35-4.05" />
        </g>
      ))}

      {leftLeaves.map((leaf, index) => {
        const mirrorX = 24 - leaf.x
        return (
          <g key={`right-${index}`} transform={`translate(${mirrorX} ${leaf.y}) rotate(${-leaf.angle}) scale(${-leaf.scale} ${leaf.scale})`}>
            <path
              className="athlete-achievement__laurel-leaf"
              d="M0 0C-1.75-1.05-2.25-2.95-.95-4.55C-.1-5.55 1.35-5.25 2.05-4.05C2.85-2.7 2.35-1.05 0 0Z"
            />
            <path className="athlete-achievement__laurel-leaf-vein" d="M0-.2C.25-1.45.15-2.7-.35-4.05" />
          </g>
        )
      })}
    </svg>
  )
}

function cleanAchievementText(achievement: string) {
  return achievement.replace(/^[\s🥇🥈🥉🏅🏆👑]+/u, '').trim()
}

function achievementIcon(achievement: string) {
  const normalized = cleanAchievementText(achievement).toLowerCase()
  if (normalized.includes('олимп')) return <LaurelIcon />
  if (normalized.includes('ironman pro series') || normalized.includes('t100 world tour') || normalized.includes('победитель серии')) {
    return <span className="athlete-achievement__emoji" aria-hidden="true">👑</span>
  }
  return <span className="athlete-achievement__emoji" aria-hidden="true">🏆</span>
}

function AthleteDetailPage({ athlete, results, races, onBack, onNavigate, onRaceClick }: AthleteDetailPageProps) {
  const resultsByYear = results
    .map((result) => ({ ...result, race: races.find((race) => race.editionId === result.raceEditionId) }))
    .filter((result) => result.race)
    .sort((a, b) => new Date(b.race!.dateISO).getTime() - new Date(a.race!.dateISO).getTime())
    .reduce<Record<string, Array<RaceResult & { race: Race }>>>((groups, result) => {
      const year = (result.race!.year ?? new Date(result.race!.dateISO).getFullYear()).toString()
      if (!groups[year]) groups[year] = []
      groups[year].push(result as RaceResult & { race: Race })
      return groups
    }, {})

  const years = Object.keys(resultsByYear).sort((a, b) => Number(b) - Number(a))
  const latestYear = years[0]
  const [expandedYears, setExpandedYears] = useState<string[]>(latestYear ? [latestYear] : [])
  const [bioExpanded, setBioExpanded] = useState(false)
  const [achievementsExpanded, setAchievementsExpanded] = useState(false)
  const bioFacts = athlete.bioFacts?.length ? athlete.bioFacts : athlete.bio ? [athlete.bio] : []
  const hasAchievements = athlete.achievements.length > 0
  const hasSocialLinks = Boolean(athlete.socialLinks?.instagram || athlete.socialLinks?.youtube)

  const toggleYear = (year: string) => {
    setExpandedYears((current) =>
      current.includes(year)
        ? current.filter((item) => item !== year)
        : [...current, year]
    )
  }

  return (
    <main className="app app--athlete-detail">
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className="section athlete-detail-page">
        <div className="athlete-detail">
          <div className="athlete-detail__hero">
            <div className="athlete-detail__portrait-wrap">
              {athlete.image ? (
                <img className="athlete-detail__image" src={athlete.image} alt={athlete.name} />
              ) : (
                <div className="athlete-detail__image athlete-detail__image--placeholder" aria-hidden="true">{athlete.name.charAt(0)}</div>
              )}
            </div>

            <div className="athlete-detail__identity">
              <h1>{athlete.name} <span className="athlete-detail__flag-inline">{athlete.flag}</span></h1>
              <div className="athlete-detail__facts">
                {athlete.age && <span>{athlete.age} лет</span>}
                {athlete.age && <span className="athlete-detail__facts-divider" aria-hidden="true" />}
                <span>{athlete.country}</span>
              </div>
              {athlete.nameEn && <p className="athlete-detail__meta">{athlete.nameEn}</p>}

              {hasSocialLinks && (
                <div className="athlete-detail__socials" aria-label="Социальные сети">
                  {athlete.socialLinks?.instagram && (
                    <a
                      className="athlete-social-icon"
                      href={`https://www.instagram.com/${athlete.socialLinks.instagram}/`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                    >
                      <InstagramIcon />
                    </a>
                  )}
                  {athlete.socialLinks?.youtube && (
                    <a
                      className="athlete-social-icon"
                      href={`https://www.youtube.com/@${athlete.socialLinks.youtube}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="YouTube"
                    >
                      <YouTubeIcon />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {bioFacts.length > 0 && (
            <div className="athlete-detail__about athlete-detail__collapsible">
              <button
                className="athlete-detail__section-toggle"
                type="button"
                onClick={() => setBioExpanded((current) => !current)}
                aria-expanded={bioExpanded}
              >
                <span>Био</span>
                <span className={`athlete-detail__section-chevron ${bioExpanded ? 'athlete-detail__section-chevron--open' : ''}`} aria-hidden="true">›</span>
              </button>
              <div className={bioExpanded ? 'athlete-detail__section-body' : 'athlete-detail__section-body athlete-detail__section-body--collapsed'}>
                <ul className="athlete-detail__bio-list">
                  {bioFacts.map((fact) => <li key={fact}>{fact}</li>)}
                </ul>
              </div>
            </div>
          )}

          {hasAchievements && (
            <div className="athlete-detail__achievements athlete-detail__collapsible">
              <button
                className="athlete-detail__section-toggle"
                type="button"
                onClick={() => setAchievementsExpanded((current) => !current)}
                aria-expanded={achievementsExpanded}
              >
                <span>Достижения</span>
                <span className={`athlete-detail__section-chevron ${achievementsExpanded ? 'athlete-detail__section-chevron--open' : ''}`} aria-hidden="true">›</span>
              </button>
              <div className={achievementsExpanded ? 'athlete-detail__section-body' : 'athlete-detail__section-body athlete-detail__section-body--collapsed'}>
                <ul className="athlete-detail__achievements-list">
                  {athlete.achievements.map((achievement) => (
                    <li key={achievement}>
                      <span className="athlete-achievement__icon">{achievementIcon(achievement)}</span>
                      <span>{cleanAchievementText(achievement)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {years.length > 0 && (
            <div className="athlete-detail__results">
              <h2>Недавние результаты</h2>
              {years.map((year) => {
                const yearResults = resultsByYear[year]
                const isExpanded = expandedYears.includes(year)

                return (
                  <div className="athlete-results-year" key={year}>
                    <button
                      className="athlete-results-year__toggle"
                      type="button"
                      onClick={() => toggleYear(year)}
                      aria-expanded={isExpanded}
                    >
                      <span>{year}</span>
                      <span className={`athlete-results-year__chevron ${isExpanded ? 'athlete-results-year__chevron--open' : ''}`} aria-hidden="true">›</span>
                    </button>

                    {isExpanded && (
                      <div className="athlete-results-list">
                        {yearResults.map((result) => {
                          const medal = podiumMedal(result.position)

                          return (
                            <article className="athlete-result-card" key={result.id} onClick={() => onRaceClick(result.race)}>
                              {medal ? (
                                <div className="athlete-result-card__medal" aria-label={`${result.position} место`}>{medal}</div>
                              ) : (
                                <div className="athlete-result-card__place">{result.position}</div>
                              )}
                              <div className="athlete-result-card__info">
                                <strong>{result.race.name}</strong>
                                <span>{result.race.date} · {result.race.city ? `${result.race.city}, ${result.race.country}` : result.race.country}</span>
                              </div>
                              <strong className="athlete-result-card__time">{result.totalTime ?? '—'}</strong>
                            </article>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <BottomNav currentPage="athletes" onNavigate={onNavigate} />
    </main>
  )
}

export default AthleteDetailPage
