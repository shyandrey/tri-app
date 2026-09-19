import type { RaceEdition, RaceEntity } from '../types/Race'

export const challengeRothRaceEntity: RaceEntity = {
  id: 'challenge-roth',
  name: 'Challenge Roth',
  country: 'Германия',
  city: 'Рот',
  distance: 'Challenge Roth',
}

const sofByYear = {
  2024: { women: 88.12, men: 91.65 },
  2025: { women: 87.14, men: 88.82 },
  2026: { women: 90.51, men: 93.64 },
} as const

const dates = {
  2024: { date: '7 июля', dateISO: '2024-07-07' },
  2025: { date: '6 июля', dateISO: '2025-07-06' },
  2026: { date: '5 июля', dateISO: '2026-07-05' },
} as const

export const challengeRothEditions: RaceEdition[] = ([2024, 2025, 2026] as const).map((year) => ({
  id: `challenge-roth-${year}`,
  raceId: 'challenge-roth',
  year,
  series: 'Challenge',
  date: dates[year].date,
  dateISO: dates[year].dateISO,
  swim: '3.8 км',
  bike: '180 км',
  run: '42.2 км',
  description: `Challenge Roth ${year} — профессиональная гонка на полной дистанции в Роте, Германия.`,
  gender: 'ALL',
  sourceUrl: `https://stats.protriathletes.org/race/challenge-roth/${year}/results`,
  sof: sofByYear[year],
}))
