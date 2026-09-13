import type { RaceResult } from '../types/RaceResult'
import { resolveAthleteId } from '../data/athleteIdentity'

export function linkResultsToAthletes(results: RaceResult[]): RaceResult[] {
  return results.map((result) => ({
    ...result,
    athleteId: resolveAthleteId(result.athleteName) ?? result.athleteId,
  }))
}

export function getResultsByRace(
  results: RaceResult[],
  raceEditionId: string
) {
  return results
    .filter((result) => result.raceEditionId === raceEditionId)
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
