import type { RaceGender } from '../types/Race'

export function normalizeRaceGender(gender?: RaceGender): RaceGender {
  return gender ?? 'ALL'
}

export function getRaceGenderLabel(gender: RaceGender) {
  if (gender === 'WPRO') return 'WOMEN'
  if (gender === 'MPRO') return 'MEN'
  if (gender === 'UNKNOWN') return 'Категории уточняются'
  return null
}
