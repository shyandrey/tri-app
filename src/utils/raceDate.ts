import type { Race } from '../types/Race'

export function isRaceFinished(race: Race) {
  const today = new Date()
  const raceDate = new Date(`${race.dateISO}T23:59:59`)

  return raceDate < today
}

export function isRaceUpcoming(race: Race) {
  return !isRaceFinished(race)
}