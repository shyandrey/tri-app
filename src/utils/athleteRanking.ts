import type { Athlete, AthleteGender } from '../types/Athlete'
import type { RaceEditionView } from '../types/Race'
import type { RaceResult } from '../types/RaceResult'
import { resolveAthleteId } from '../data/athleteIdentity'

const DAY = 86_400_000
const HALF_LIFE_DAYS = 730
const PLACE_EXPONENT = 0.65

export type AthleteRankingRow = {
  athleteId: number
  score: number
  performance: number
  confidence: number
  activityBonus: number
  starts: number
  wins: number
  podiums: number
  sWins: number
}

const isWorldChampionship = (edition: RaceEditionView) => /world championship/i.test(edition.name || '')
const isT100Final = (edition: RaceEditionView) => /t100.*(?:final|world championship)|(?:final|world championship).*t100/i.test(edition.name || '')
const isTierAChampionship = (edition: RaceEditionView) => /ironman (?:texas|frankfurt|hamburg)/i.test(edition.name || '')
const isT100 = (edition: RaceEditionView) => edition.distance === 'T100' || /t100/i.test(edition.name || '')
const isRoth = (edition: RaceEditionView) => /challenge roth/i.test(edition.name || '')

const raceTier = (edition: RaceEditionView): 'S' | 'A' | 'B' => {
  if (isWorldChampionship(edition) || isT100Final(edition)) return 'S'
  if (isTierAChampionship(edition) || isT100(edition) || isRoth(edition)) return 'A'
  return 'B'
}

const tierWeight = (tier: 'S' | 'A' | 'B') => tier === 'S' ? 1.20 : tier === 'A' ? 1.10 : 1

const placeScore = (position: RaceResult['position']) =>
  typeof position === 'number' ? 100 / Math.pow(position, PLACE_EXPONENT) : 0

const recencyWeight = (dateISO: string, asOf: Date) => {
  const raceDate = new Date(`${dateISO}T12:00:00Z`)
  const ageDays = Math.max(0, (asOf.getTime() - raceDate.getTime()) / DAY)
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
}

const interpolateCurve = (value: number, curve: Array<[number, number]>, maximum: number) => {
  if (value >= curve[curve.length - 1][0]) return maximum
  for (let index = 1; index < curve.length; index += 1) {
    const [rightValue, rightScore] = curve[index]
    if (value <= rightValue) {
      const [leftValue, leftScore] = curve[index - 1]
      const progress = (value - leftValue) / (rightValue - leftValue)
      return leftScore + (rightScore - leftScore) * progress
    }
  }
  return maximum
}

const activityConfidence = (starts: number) => interpolateCurve(starts, [
  [0, 0], [1, 0.45], [2, 0.60], [3, 0.72], [4, 0.80], [5, 0.86],
  [6, 0.90], [8, 0.94], [10, 0.97], [12, 1.00],
], 1)

const activityBonus = (starts: number) => interpolateCurve(starts, [
  [0, 0], [1, 0], [3, 0.03], [5, 0.06], [8, 0.09], [12, 0.12],
  [16, 0.14], [20, 0.15],
], 0.15)

const sPodiumBonus = (position: RaceResult['position']) => {
  if (position === 1) return 0.50
  if (position === 2) return 0.25
  if (position === 3) return 0.15
  return 0
}

const sofFactor = (sof?: number) => {
  if (typeof sof !== 'number') return 1
  return Math.max(0.7, Math.min(1.15, 1 + (sof - 90) / 100))
}

const resultSof = (result: RaceResult, edition: RaceEditionView, athleteGender?: AthleteGender) => {
  const gender = result.gender ?? athleteGender
  if (gender === 'W') return edition.sof?.women
  if (gender === 'M') return edition.sof?.men
  if (edition.gender === 'WPRO') return edition.sof?.women
  if (edition.gender === 'MPRO') return edition.sof?.men
  return undefined
}

export function calculateAthleteRanking(
  athletes: Athlete[],
  results: RaceResult[],
  editions: RaceEditionView[],
  asOf = new Date()
): AthleteRankingRow[] {
  const editionById = new Map(editions.map((edition) => [edition.editionId, edition]))
  const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]))
  const entriesByAthlete = new Map<number, Array<{ result: RaceResult; edition: RaceEditionView }>>()

  for (const result of results) {
    if (result.position === 'DNS') continue
    const athleteId = result.athleteId ?? resolveAthleteId(result.athleteName)
    const athlete = athleteId ? athleteById.get(athleteId) : undefined
    const edition = result.raceEditionId ? editionById.get(result.raceEditionId) : undefined
    if (!athlete || !edition || new Date(`${edition.dateISO}T12:00:00Z`) > asOf) continue
    const entries = entriesByAthlete.get(athlete.id) ?? []
    entries.push({ result, edition })
    entriesByAthlete.set(athlete.id, entries)
  }

  return athletes.map((athlete) => {
    const entries = entriesByAthlete.get(athlete.id) ?? []
    let numerator = 0
    let denominator = 0
    let wins = 0
    let podiums = 0
    let sWins = 0

    for (const { result, edition } of entries) {
      const tier = raceTier(edition)
      const recency = recencyWeight(edition.dateISO, asOf)
      const fieldStrength = sofFactor(resultSof(result, edition, athlete.gender))
      let score = placeScore(result.position)

      if (tier === 'S' && typeof result.position === 'number') {
        score *= 1 + sPodiumBonus(result.position)
        if (result.position === 1) sWins += 1
      }

      numerator += score * tierWeight(tier) * fieldStrength * recency
      denominator += recency

      if (typeof result.position === 'number') {
        if (result.position === 1) wins += 1
        if (result.position <= 3) podiums += 1
      }
    }

    const performance = denominator ? numerator / denominator : 0
    const confidence = activityConfidence(entries.length)
    const bonus = activityBonus(entries.length)

    return {
      athleteId: athlete.id,
      score: performance * confidence * (1 + bonus),
      performance,
      confidence,
      activityBonus: bonus,
      starts: entries.length,
      wins,
      podiums,
      sWins,
    }
  }).filter((row) => row.starts > 0)
}

export function sortAthletesByRanking(
  athletes: Athlete[],
  results: RaceResult[],
  editions: RaceEditionView[],
  asOf = new Date()
): Athlete[] {
  const ranking = calculateAthleteRanking(athletes, results, editions, asOf)
  const rankingById = new Map(ranking.map((row) => [row.athleteId, row]))
  const originalIndex = new Map(athletes.map((athlete, index) => [athlete.id, index]))

  return [...athletes].sort((a, b) => {
    const left = rankingById.get(a.id)
    const right = rankingById.get(b.id)
    if (left && right) {
      return right.score - left.score ||
        right.sWins - left.sWins ||
        right.wins - left.wins ||
        right.podiums - left.podiums ||
        right.starts - left.starts ||
        (a.nameEn || a.name).localeCompare(b.nameEn || b.name)
    }
    if (left) return -1
    if (right) return 1
    return (originalIndex.get(a.id) ?? 0) - (originalIndex.get(b.id) ?? 0)
  })
}
