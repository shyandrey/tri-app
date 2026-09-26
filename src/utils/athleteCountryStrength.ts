import type { Athlete, AthleteGender } from '../types/Athlete'
import type { AthleteRankingRow } from './athleteRanking'

// Remaining ISO3 variants in the runtime catalog; do not mutate source records.
const COUNTRY_ALIASES: Record<string, string> = { ZAF: 'ZA', LVA: 'LV' }
export function canonicalCountryKey(value: string): string {
  const key = value.trim().toUpperCase()
  return COUNTRY_ALIASES[key] ?? key
}
export const athleteCountryKey = (athlete: Athlete) =>
  canonicalCountryKey(athlete.countryCode?.trim() || athlete.country?.trim() || '')

export type CountryStrengthOption = {
  key: string
  label: string
  flag: string
  count: number
  strength: number
}

export function athleteCountryStrength(
  athletes: readonly Athlete[],
  ranking: readonly Pick<AthleteRankingRow, 'athleteId' | 'score'>[],
  gender: 'ALL' | AthleteGender,
): CountryStrengthOption[] {
  const scores = new Map(ranking.map(row => [row.athleteId, row.score]))
  const groups = new Map<string, { option: CountryStrengthOption; scores: number[] }>()
  for (const athlete of athletes) {
    if (gender !== 'ALL' && athlete.gender !== gender) continue
    const key = athleteCountryKey(athlete)
    if (!key) continue
    let group = groups.get(key)
    if (!group) {
      const flag = /^[A-Z]{2}$/.test(key)
        ? String.fromCodePoint(...Array.from(key, char => 127397 + char.charCodeAt(0)))
        : athlete.flag || ''
      group = { option: { key, label: key, flag, count: 0, strength: 0 }, scores: [] }
      groups.set(key, group)
    }
    group.option.count += 1
    const score = scores.get(athlete.id)
    if (score !== undefined) group.scores.push(score)
  }
  return Array.from(groups.values(), ({ option, scores }) => ({
    ...option,
    // Fixed denominator: missing slots contribute zero; long-tail never dilutes strength.
    strength: scores.sort((a, b) => b - a).slice(0, 5).reduce((sum, score) => sum + score, 0) / 5,
  })).sort((a, b) => b.strength - a.strength || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
}
