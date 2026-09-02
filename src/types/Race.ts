export type RaceSeries =
  | 'IRONMAN Pro Series'
  | 'Triathlon World Tour'
  | 'Challenge'

export type RaceDistance =
  | 'IRONMAN'
  | '70.3'
  | 'T100'
  | 'Challenge Roth'

export type RaceGender = 'WPRO' | 'MPRO' | 'WPRO & MPRO'

export type RaceEntity = {
  id: string
  name: string
  country: string
  city: string
  distance: RaceDistance
}

export type RaceEdition = {
  id: string
  raceId: string
  legacyId: number
  year: number

  series: RaceSeries
  date: string
  dateISO: string

  swim: string
  bike: string
  run: string

  description: string
  gender?: RaceGender
  sourceUrl?: string
}

// Legacy flattened shape still accepted by the current UI during migration.
export type Race = {
  id: number
  name: string

  series: RaceSeries
  distance: RaceDistance

  date: string
  dateISO: string

  country: string
  city: string

  swim: string
  bike: string
  run: string

  description: string
  gender?: RaceGender
  sourceUrl?: string

  raceId?: string
  editionId?: string
  year?: number
}

export type RaceEditionView = Race & {
  raceId: string
  editionId: string
  year: number
}
