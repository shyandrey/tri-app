export type RaceResult = {
  id: number
  raceId: number

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