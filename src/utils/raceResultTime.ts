import type { RaceResult } from '../types/RaceResult'

export type ResultSortKey = 'overall' | 'swim' | 'bike' | 'run'

export function timeToSeconds(value?: string) {
  if (!value) return Number.POSITIVE_INFINITY

  const parts = value.split(':').map(Number)

  if (parts.some(Number.isNaN)) {
    return Number.POSITIVE_INFINITY
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return Number.POSITIVE_INFINITY
}

export function getResultTime(result: RaceResult, sortKey: ResultSortKey) {
  if (sortKey === 'swim') return result.swimTime
  if (sortKey === 'bike') return result.bikeTime
  if (sortKey === 'run') return result.runTime
  return result.totalTime
}

export function sortRaceResults(results: RaceResult[], sortKey: ResultSortKey) {
  if (sortKey === 'overall') {
    return [...results].sort((a, b) => {
      if (typeof a.position === 'number' && typeof b.position === 'number') {
        return a.position - b.position
      }
      if (typeof a.position === 'number') return -1
      if (typeof b.position === 'number') return 1
      return 0
    })
  }

  return [...results].sort(
    (a, b) =>
      timeToSeconds(getResultTime(a, sortKey)) -
      timeToSeconds(getResultTime(b, sortKey))
  )
}

export function getBestSplit(results: RaceResult[], key: 'swim' | 'bike' | 'run') {
  const times = results
    .map((result) => getResultTime(result, key))
    .filter((value): value is string => Boolean(value))

  if (times.length === 0) return undefined

  return times.reduce((best, current) =>
    timeToSeconds(current) < timeToSeconds(best) ? current : best
  )
}
