import type { RaceResult } from '../types/RaceResult'

export function getResultsByRace(
  results: RaceResult[],
  raceId: number
) {
  return results
    .filter((result) => result.raceId === raceId)
    .sort((a, b) => {
      if (typeof a.position !== 'number') return 1
      if (typeof b.position !== 'number') return -1

      return a.position - b.position
    })
}

export function getResultsByAthlete(
  results: RaceResult[],
  athleteId: number
) {
  return results.filter(
    (result) => result.athleteId === athleteId
  )
}