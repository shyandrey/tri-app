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

const getRaceYear = (race: Race) => race.year ?? new Date(race.dateISO).getFullYear()

const genderLabel = (race: Race) => {
  if (race.gender === 'MPRO') return 'MEN'
  if (race.gender === 'WPRO') return 'WOMEN'
  return null
}

function RaceDetailPage({ race, raceEditions, allResults, athletes, onBack, onNavigate, onAthleteClick }: RaceDetailPageProps) {
  const [activeRace, setActiveRace] = useState(race)

  useEffect(() => {
    setActiveRace(race)
  }, [race])

  const siblingEditions = useMemo(
    () => raceEditions
      .filter((edition) => edition.raceId === race.raceId)
      .sort((a, b) => getRaceYear(b) - getRaceYear(a)),
    [race.raceId, raceEditions]
  )

  const availableYears = useMemo(
    () => Array.from(new Set(siblingEditions.map(getRaceYear))).sort((a, b) => b - a),
    [siblingEditions]
  )

  const currentYear = getRaceYear(activeRace)

  const editionsInCurrentYear = useMemo(
    () => siblingEditions
      .filter((edition) => getRaceYear(edition) === currentYear)
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    [currentYear, siblingEditions]
  )

  const genderEditions = editionsInCurrentYear.filter((edition) => genderLabel(edition) !== null)
  const showGenderSwitcher = genderEditions.length > 1

  const selectYear = (year: number) => {
    const editions = siblingEditions.filter((edition) => getRaceYear(edition) === year)
    if (editions.length === 0) return

    const sameGender = editions.find((edition) => edition.gender === activeRace.gender)
    const combinedEdition = editions.find((edition) => edition.gender === 'WPRO & MPRO')

    setActiveRace(sameGender ?? combinedEdition ?? editions[0])
  }

  const results = useMemo(
    () => allResults.filter((result) => result.raceEditionId === activeRace.editionId),
    [activeRace.editionId, allResults]
  )

  const hasResults = results.length > 0
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

          {availableYears.length > 1 && (
            <div className="race-season-switcher" aria-label="Сезон гонки">
              {availableYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={year === currentYear ? 'race-season-switcher__year race-season-switcher__year--active' : 'race-season-switcher__year'}
                  onClick={() => selectYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {showGenderSwitcher && (
            <div className="race-season-switcher" aria-label="Категория гонки">
              {genderEditions.map((edition) => {
                const label = genderLabel(edition)
                const isActive = edition.editionId === activeRace.editionId

                return (
                  <button
                    key={edition.editionId}
                    type="button"
                    className={isActive ? 'race-season-switcher__year race-season-switcher__year--active' : 'race-season-switcher__year'}
                    onClick={() => setActiveRace(edition)}
                  >
                    {label}
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
