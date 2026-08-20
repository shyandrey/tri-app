import type { Race } from '../types/Race'

function getMoscowDateISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function isRaceFinished(race: Race) {
  const today = getMoscowDateISO()

  return race.dateISO < today
}

export function isRaceUpcoming(race: Race) {
  return !isRaceFinished(race)
}