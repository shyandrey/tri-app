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

type ResultGender = 'M' | 'W'

const genderFromEdition = (race: Race): ResultGender | undefined => {
  if (race.gender === 'MPRO') return 'M'
  if (race.gender === 'WPRO') return 'W'
  return undefined
}

function RaceDetailPage({ race, raceEditions, allResults, athletes, onBack, onNavigate, onAthleteClick }: RaceDetailPageProps) {
  const [activeRace, setActiveRace] = useState(race)

  useEffect(() => {
    setActiveRace(race)
  }, [race])

  const siblingEditions = useMemo(
    () => raceEditions
      .filter((edition) => edition.raceId === race.raceId)
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.dateISO.localeCompare(b.dateISO)),
    [race.raceId, raceEditions]
  )

  const currentYear = activeRace.year ?? new Date(activeRace.dateISO).getFullYear()

  const editionsByYear = useMemo(() => {
    const map = new Map<number, Race[]>()
    for (const edition of siblingEditions) {
      const year = edition.year ?? new Date(edition.dateISO).getFullYear()
      const editions = map.get(year) ?? []
      editions.push(edition)
      map.set(year, editions)
    }
    return map
  }, [siblingEditions])

  const years = useMemo(
    () => Array.from(editionsByYear.keys()).sort((a, b) => b - a),
    [editionsByYear]
  )

  const activeYearEditions = editionsByYear.get(currentYear) ?? [activeRace]
  const activeYearEditionIds = new Set(activeYearEditions.map((edition) => edition.editionId))

  const results = useMemo(
    () => allResults.filter((result) => result.raceEditionId && activeYearEditionIds.has(result.raceEditionId)),
    [allResults, activeYearEditionIds]
  )

  const activeGender = genderFromEdition(activeRace)
  const hasResults = results.length > 0
  const winners = results.filter((result) => result.position === 1)
  const maleWinner = winners.find((result) => result.gender === 'M')
  const femaleWinner = winners.find((result) => result.gender === 'W')

  const switchYear = (year: number) => {
    const targetEditions = editionsByYear.get(year)
    if (!targetEditions?.length) return

    const sameGender = activeGender
      ? targetEditions.find((edition) => genderFromEdition(edition) === activeGender)
      : undefined

    setActiveRace(sameGender ?? targetEditions[0])
  }

  const switchGender = (gender: ResultGender) => {
    const targetEdition = activeYearEditions.find((edition) => genderFromEdition(edition) === gender)
    if (targetEdition) setActiveRace(targetEdition)
  }

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

          {years.length > 1 && (
            <div className="race-season-switcher" aria-label="Сезон гонки">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={year === currentYear ? 'race-season-switcher__year race-season-switcher__year--active' : 'race-season-switcher__year'}
                  onClick={() => switchYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          <div className="race-detail__summary">
            <div className="race-detail-about">
              <h2>О гонке</h2>
              <p>{activeRace.description}</p>
            </div>
          </div>

          {hasResults && (
            <RaceResultsTable
              results={results}
              athletes={athletes}
              onAthleteClick={onAthleteClick}
              selectedGender={activeGender}
              onGenderChange={switchGender}
            />
          )}

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
