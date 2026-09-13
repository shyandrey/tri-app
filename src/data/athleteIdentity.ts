import { athletes } from './athletes'

export const normalizeAthleteIdentityName = (value: string) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/['’`.-]/g, ' ')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

const athleteIdByNormalizedName = new Map<string, number>()

for (const athlete of athletes) {
  if (athlete.nameEn) {
    athleteIdByNormalizedName.set(normalizeAthleteIdentityName(athlete.nameEn), athlete.id)
  }
}

export const resolveAthleteId = (athleteName: string): number | undefined =>
  athleteIdByNormalizedName.get(normalizeAthleteIdentityName(athleteName))
