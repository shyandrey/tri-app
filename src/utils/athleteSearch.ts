import type { Athlete, AthleteGender } from '../types/Athlete'

export type AthleteFilters = { search: string; genderFilter: 'ALL' | AthleteGender; countryFilter: string }
const EN_KEYS = "qwertyuiop[]asdfghjkl;'zxcvbnm,."
const RU_KEYS = 'йцукенгшщзхъфывапролджэячсмитьбю'
function swapKeyboardLayout(value: string) {
  return Array.from(value.toLowerCase(), char => {
    const en = EN_KEYS.indexOf(char)
    if (en >= 0) return RU_KEYS[en]
    const ru = RU_KEYS.indexOf(char)
    return ru >= 0 ? EN_KEYS[ru] : char
  }).join('')
}
const normalizeSearch = (value: string) => value.trim().toLowerCase().replace(/ё/g, 'е')
export const athleteCountryKey = (athlete: Athlete) => athlete.countryCode?.trim() || athlete.country?.trim() || ''

// Filtering preserves the incoming ranking order. Search temporarily takes priority;
// the selected filters are never mutated and apply again when the query is cleared.
export function filterAthletes(athletes: Athlete[], { search, genderFilter, countryFilter }: AthleteFilters) {
  const query = normalizeSearch(search)
  if (!query) return athletes.filter(a => (genderFilter === 'ALL' || a.gender === genderFilter) && (countryFilter === 'ALL' || athleteCountryKey(a) === countryFilter))
  const queries = [...new Set([query, normalizeSearch(swapKeyboardLayout(search))].filter(Boolean))]
  return athletes.filter(a => {
    const haystack = normalizeSearch([a.name, a.nameEn, a.country, a.countryEn, a.countryCode, a.discipline].filter(Boolean).join(' '))
    return queries.some(q => haystack.includes(q))
  })
}
