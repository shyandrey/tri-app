import type { RaceResult } from '../types/RaceResult'

export type ResultSortKey = 'overall' | 'swim' | 'bike' | 'run'

type SplitKey = Exclude<ResultSortKey, 'overall'>

const minimumSplitSeconds: Record<SplitKey, number> = {
  swim: 10 * 60,
  bike: 30 * 60,
  run: 20 * 60,
}

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

export function isPlausibleSplit(value: string | undefined, key: SplitKey) {
  const seconds = timeToSeconds(value)
  return Number.isFinite(seconds) && seconds >= minimumSplitSeconds[key]
}

export function getResultTime(result: RaceResult, sortKey: ResultSortKey) {
  if (sortKey === 'swim') return isPlausibleSplit(result.swimTime, 'swim') ? result.swimTime : undefined
  if (sortKey === 'bike') return isPlausibleSplit(result.bikeTime, 'bike') ? result.bikeTime : undefined
  if (sortKey === 'run') return isPlausibleSplit(result.runTime, 'run') ? result.runTime : undefined
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

export function getBestSplit(results: RaceResult[], key: SplitKey) {
  const times = results
    .map((result) => getResultTime(result, key))
    .filter((value): value is string => Boolean(value))

  if (times.length === 0) return undefined

  return times.reduce((best, current) =>
    timeToSeconds(current) < timeToSeconds(best) ? current : best
  )
}
