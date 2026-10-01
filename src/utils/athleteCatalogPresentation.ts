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

// Presentation only: keep the full catalog and incoming TRI order for search/filters.
export function athleteCatalogPresentation(athletes: Athlete[], filters: AthleteFilters) {
  const matches = filterAthletes(athletes, filters)
  const limited = !filters.search.trim() && filters.genderFilter === 'ALL'
    && canonicalCountryKey(filters.countryFilter) === 'ALL' && matches.length > 100
  return { athletes: limited ? matches.slice(0, 100) : matches, total: matches.length, limited }
}
