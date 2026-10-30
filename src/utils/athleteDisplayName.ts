import type { Athlete } from '../types/Athlete'

// `name` is the canonical display value produced by localizeAthlete from the
// approved override/embedded-name sources. Never transliterate or infer identity.
export function athleteDisplayName(athlete?: Pick<Athlete, 'name' | 'nameEn'> | null, sourceName = ''): string {
  for (const value of [athlete?.name, athlete?.nameEn, sourceName]) {
    if (value?.trim()) return value
  }
  return ''
}
