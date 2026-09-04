import { useEffect, useMemo, useState } from 'react'
import type { Race } from '../types/Race'
import BottomNav from '../components/BottomNav'
import RaceResultsTable from '../components/RaceResultsTable'
import type { Page } from '../types/Page'
import type { RaceResult } from '../types/RaceResult'
import type { Athlete } from '../types/Athlete'
import { getChampionshipNavigationGroup } from '../utils/raceChampionshipGroup'

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

const getMoscowToday = () => {
  const dateISO = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return new Date(`${dateISO}T00:00:00Z`)
}

const getDaysUntilRace = (dateISO: string) => {
  const today = getMoscowToday()
  const raceDate = new Date(`${dateISO}T00:00:00Z`)
  return Math.max(0, Math.ceil((raceDate.getTime() - today.getTime()) / 86_400_000))
}

const getDaysLabel = (days: number) => {
  const lastTwo = days % 100
  const last = days % 10
  if (lastTwo >= 11 && lastTwo <= 14) return 'дней'
  if (last === 1) return 'день'
  if (last >= 2 && last <= 4) return 'дня'
  return 'дней'
}

function RaceDetailPage({ race, raceEditions, allResults, athletes, onBack, onNavigate, onAthleteClick }: RaceDetailPageProps) {
  const championshipGroup = getChampionshipNavigationGroup(race)
  const initialGender = genderFromEdition(race) ?? (championshipGroup ? 'M' : undefined)
  const [activeRace, setActiveRace] = useState(race)
  const [activeGender, setActiveGender] = useState<ResultGender | undefined>(initialGender)

  useEffect(() => {
    const nextGroup = getChampionshipNavigationGroup(race)
    setActiveRace(race)
    setActiveGender(genderFromEdition(race) ?? (nextGroup ? 'M' : undefined))
  }, [race])

  const siblingEditions = useMemo(() => {
    const group = getChampionshipNavigationGroup(race)

    return raceEditions
      .filter((edition) => {
        if (group) return getChampionshipNavigationGroup(edition) === group
        return edition.raceId === race.raceId
      })
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.dateISO.localeCompare(b.dateISO))
  }, [race, raceEditions])

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

  const rawResults = useMemo(
    () => allResults.filter((result) => result.raceEditionId && activeYearEditionIds.has(result.raceEditionId)),
    [allResults, activeYearEditionIds]
  )

  const results = useMemo(() => {
    if (activeYearEditions.length !== 1 || !activeGender) return rawResults
    return rawResults.map((result) => result.gender ? result : { ...result, gender: activeGender })
  }, [rawResults, activeYearEditions.length, activeGender])

  const hasResults = results.length > 0
  const todayISO = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const isFutureRace = activeRace.dateISO > todayISO
  const daysUntilRace = isFutureRace ? getDaysUntilRace(activeRace.dateISO) : 0

  const findEditionForGender = (editions: Race[], gender: ResultGender) =>
    editions.find((edition) => genderFromEdition(edition) === gender)
    ?? editions.find((edition) => edition.gender === 'WPRO & MPRO')

  const switchYear = (year: number) => {
    const targetEditions = editionsByYear.get(year)
    if (!targetEditions?.length) return

    const targetEdition = activeGender
      ? findEditionForGender(targetEditions, activeGender)
      : undefined

    setActiveRace(targetEdition ?? targetEditions[0])
  }

  const switchGender = (gender: ResultGender) => {
    setActiveGender(gender)
    const targetEdition = findEditionForGender(activeYearEditions, gender)
    if (targetEdition) setActiveRace(targetEdition)
  }

  const location = activeRace.city
    ? `${activeRace.city}, ${activeRace.country}`
    : activeRace.country

  const isChampionship = Boolean(getChampionshipNavigationGroup(activeRace))

  return (
    <main className="app">
      <span className="race-detail-page__distance-tag race-card__tag">{activeRace.distance}</span>
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className={`section race-detail-page ${hasResults ? 'race-detail-page--table' : ''}`}>
        <div className="race-detail">
          <h1>{activeRace.name}</h1>
          <p className="race-detail-meta">{activeRace.date} {currentYear} · {location}</p>

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

          {isChampionship && activeGender && !hasResults && (
            <div
              className="results-table__gender-tabs"
              style={{ width: 'fit-content', margin: '16px auto 0' }}
              aria-label="Категория чемпионата"
            >
              {(['M', 'W'] as const).map((gender) => (
                <button
                  key={gender}
                  type="button"
                  className={activeGender === gender ? 'is-active' : ''}
                  onClick={() => switchGender(gender)}
                >
                  {gender === 'M' ? 'MEN' : 'WOMEN'}
                </button>
              ))}
            </div>
          )}

          {isFutureRace ? (
            <div className="race-detail-countdown" role="status">
              До гонки осталось {daysUntilRace} {getDaysLabel(daysUntilRace)}
            </div>
          ) : hasResults ? (
            <RaceResultsTable
              results={results}
              athletes={athletes}
              onAthleteClick={onAthleteClick}
              selectedGender={activeGender}
              onGenderChange={isChampionship || activeGender ? switchGender : undefined}
              showGenderTabs
            />
          ) : (
            <div className="race-detail-countdown" role="status">
              Скоро здесь будут результаты!
            </div>
          )}
        </div>
      </section>

      <BottomNav currentPage="calendar" onNavigate={onNavigate} />
    </main>
  )
}

export default RaceDetailPage
