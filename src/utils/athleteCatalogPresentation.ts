import type { Athlete } from '../types/Athlete'
import { filterAthletes, type AthleteFilters } from './athleteSearch.ts'
import { canonicalCountryKey } from './athleteCountryStrength.ts'

export function athleteGenderCounts(athletes: Athlete[]) {
  return {
    ALL: athletes.length,
    M: athletes.filter(athlete => athlete.gender === 'M').length,
    W: athletes.filter(athlete => athlete.gender === 'W').length,
  }
}

export const ATHLETE_BATCH_SIZE = 50

// Presentation only: keep the full catalog and incoming TRI order for search/filters.
export function athleteCatalogPresentation(athletes: Athlete[], filters: AthleteFilters, visibleCount = ATHLETE_BATCH_SIZE) {
  const matches = filterAthletes(athletes, filters)
  const progressive = !filters.search.trim() && filters.genderFilter === 'ALL'
    && canonicalCountryKey(filters.countryFilter) === 'ALL'
  const count = Number.isFinite(visibleCount) ? Math.max(ATHLETE_BATCH_SIZE, Math.floor(visibleCount)) : ATHLETE_BATCH_SIZE
  const visible = progressive ? matches.slice(0, count) : matches
  return { athletes: visible, total: matches.length, limited: visible.length < matches.length, progressive }
}
