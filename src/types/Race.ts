export type RaceSeries =
  | 'IRONMAN Pro Series'
  | 'T100'
  | 'Challenge'

export type RaceDistance =
  | 'IRONMAN'
  | '70.3'
  | 'T100'
  | 'Challenge Roth'

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

  gender?: 'WPRO' | 'MPRO' | 'WPRO & MPRO'

  sourceUrl?: string
}