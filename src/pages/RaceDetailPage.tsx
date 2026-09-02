import { useEffect, useMemo, useState } from 'react'
import type { Race } from '../types/Race'
import BottomNav from '../components/BottomNav'
import RaceResultsTable from '../components/RaceResultsTable'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Athlete } from '../types/Athlete'
import { countryCodeToFlag } from '../utils/countryFlag'

type RaceDetailPageProps = {
  race: Race
  raceEditions: Race[]
  allResults: RaceResult[]
  athletes: Athlete[]
  onBack: () => void
  onNavigate: (page: Page) => void
  onAthleteClick: (athlete: Athlete) => void
}

function RaceDetailPage({ race, raceEditions, allResults, athletes, onBack, onNavigate, onAthleteClick }: RaceDetailPageProps) {
  const [activeRace, setActiveRace] = useState(race)

  useEffect(() => {
    setActiveRace(race)
  }, [race])

  const siblingEditions = useMemo(
    () => raceEditions
      .filter((edition) => edition.raceId === race.raceId)
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0)),
    [race.raceId, raceEditions]
  )

  const results = useMemo(
    () => allResults.filter((result) => result.raceEditionId === activeRace.editionId),
    [activeRace.editionId, allResults]
  )

  const hasResults = results.length > 0
  const currentYear = activeRace.year ?? new Date(activeRace.dateISO).getFullYear()
  const winners = results.filter((result) => result.position === 1)
  const maleWinner = winners.find((result) => result.gender === 'M')
  const femaleWinner = winners.find((result) => result.gender === 'W')

  const winnerLine = (winner?: RaceResult) => {
    if (!winner) return null
    const flag = winner.countryCode ? countryCodeToFlag(winner.countryCode) : ''
    return (
      <div className="race-winner">
        <span className="race-winner__flag">{flag}</span>
        <strong>{winner.athleteName}</strong>
        <span>{winner.totalTime ?? '—'}</span>
      </div>
    )
  }

  return (
    <main className="app">
      <span className="race-detail-page__distance-tag race-card__tag">{activeRace.distance}</span>
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className={`section race-detail-page ${hasResults ? 'race-detail-page--table' : ''}`}>
        <div className="race-detail">
          <h1>{activeRace.name}</h1>
          <p className="race-detail-meta">{activeRace.date} · {activeRace.city}, {activeRace.country}</p>

          {siblingEditions.length > 1 && (
            <div className="race-season-switcher" aria-label="Сезон гонки">
              {siblingEditions.map((edition) => {
                const year = edition.year ?? new Date(edition.dateISO).getFullYear()
                const isActive = edition.editionId === activeRace.editionId

                return (
                  <button
                    key={edition.editionId}
                    type="button"
                    className={isActive ? 'race-season-switcher__year race-season-switcher__year--active' : 'race-season-switcher__year'}
                    onClick={() => setActiveRace(edition)}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          )}

          <div className="race-detail__summary">
            <div className="race-detail-about">
              <h2>О гонке</h2>
              <p>{activeRace.description}</p>
            </div>
          </div>

          {hasResults && <RaceResultsTable results={results} athletes={athletes} onAthleteClick={onAthleteClick} />}

          {winners.length > 0 && (
            <section className="race-winners">
              <h2>Победители Pro Series</h2>
              <div className="race-winners__year">
                <strong className="race-winners__year-label">{currentYear}</strong>
                <div className="race-winners__people">
                  {winnerLine(maleWinner)}
                  {winnerLine(femaleWinner)}
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default RaceDetailPage
