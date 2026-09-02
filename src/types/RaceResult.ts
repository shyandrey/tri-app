export type RaceResult = {
  id: number

  // New canonical relation. Populated by the results index for all 2026 data.
  raceEditionId?: string

  // Temporary legacy relation kept inside existing result source files during migration.
  raceId?: number

  athleteId?: number
  athleteName: string
  country?: string
  countryCode?: string
  gender?: 'M' | 'W'

  position: number | 'DNF' | 'DNS' | 'DSQ'

  swimTime?: string
  t1Time?: string
  bikeTime?: string
  t2Time?: string
  runTime?: string
  totalTime?: string

  seriesPoints?: number
  ptoPoints?: number
}
