import type { LegacyRaceGender, RaceGender } from '../types/Race'

export function normalizeRaceGender(gender?: LegacyRaceGender): RaceGender {
  if (gender === 'WPRO' || gender === 'MPRO' || gender === 'WPRO+MPRO' || gender === 'ALL') {
    return gender
  }

  return 'ALL'
}

export function getRaceGenderLabel(gender: RaceGender) {
  if (gender === 'WPRO') return 'WOMEN'
  if (gender === 'MPRO') return 'MEN'
  return null
}
