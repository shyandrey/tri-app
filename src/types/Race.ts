export type RaceSeries =
  | 'IRONMAN Pro Series'
  | 'Triathlon World Tour'
  | 'Challenge'

export type RaceDistance =
  | 'IRONMAN'
  | '70.3'
  | 'T100'
  | 'Challenge Roth'

export type RaceGender = 'WPRO' | 'MPRO' | 'WPRO+MPRO' | 'ALL' | 'UNKNOWN'

export type RaceDesignation = 'regular' | 'world_championship_70_3' | 'world_championship_ironman' | 'continental_championship' | 'series_final'

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
  displayName?: string
  legacyId?: number
  // Edition venue overrides the permanent entity when the host city changes.
  city?: string
  country?: string
  year: number

  series: RaceSeries
  date: string
  dateISO: string
  dateEndISO?: string
  dateKind?: string
  designation?: RaceDesignation

  swim: string
  bike: string
  run: string

  description: string
  gender?: RaceGender
  sourceUrl?: string
  statsPtoUrl?: string
  // Explicit source review bound to the exact URL; never populated by slug inference.
  statsPtoVerification?: { url: string; evidenceRef: string }
  sof?: { women?: number; men?: number }
}

// Legacy flattened shape still accepted by the current UI during migration.
export type Race = {
  id: number
  name: string

  series: RaceSeries
  distance: RaceDistance

  date: string
  dateISO: string
  dateEndISO?: string
  dateKind?: string
  designation?: RaceDesignation

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

export type RaceEditionView = Omit<Race, 'gender'> & {
  statsPtoUrl?: string
  sof?: { women?: number; men?: number }
  raceId: string
  editionId: string
  year: number
  gender: RaceGender
}
