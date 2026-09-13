import { useState } from 'react'
import type { Athlete } from '../types/Athlete'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Race } from '../types/Race'

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
  const [bioExpanded, setBioExpanded] = useState(true)
  const [achievementsExpanded, setAchievementsExpanded] = useState(true)
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
                <ul>{athlete.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}</ul>
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
