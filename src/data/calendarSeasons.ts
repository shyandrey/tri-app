import { getMoscowDateISO } from '../utils/raceDate'

// Explicit, reviewed completion metadata; never derived from the last imported race.
// Add future seasons only after confirmation, with their own date and provenance.
export const calendarSeasonCompletions = [
  {
    series: 'IRONMAN Pro Series',
    year: 2026,
    finalRaceDate: '2026-10-10',
    finalEditionId: 'ironman-world-championship-kona-2026',
    provenance: 'Owner-confirmed 2026-10-18: season ended with IRONMAN World Championship Kona.',
  },
] as const

export function isCalendarSeasonCompleted(series: string, year: number) {
  const today = getMoscowDateISO()
  // Do not carry a previous season's banner into an unverified new calendar year.
  return Number(today.slice(0, 4)) === year && calendarSeasonCompletions.some(
    season => season.series === series && season.year === year && today > season.finalRaceDate,
  )
}
