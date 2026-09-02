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

// Flattened view used by the current UI while pages are migrated to Race + RaceEdition.
export type Race = RaceEntity &
  Omit<RaceEdition, 'id' | 'raceId'> & {
    id: number
    raceId: string
    editionId: string
  }
