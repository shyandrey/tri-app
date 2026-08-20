export type RaceResult = {
  id: number

  raceId: number
  athleteId: number

  position: number

  totalTime: string

  swimTime?: string
  bikeTime?: string
  runTime?: string

  points?: number
}