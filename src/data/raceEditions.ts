import { races as legacyRaces } from './races'
import type { RaceEdition, RaceEditionView } from '../types/Race'
import { getRaceEditionId, getRaceId } from './raceIdentity'

const CURRENT_SEASON = 2026

const currentSeasonEditions: RaceEdition[] = legacyRaces.map((race) => ({
  id: getRaceEditionId(race.id, CURRENT_SEASON),
  raceId: getRaceId(race.id),
  legacyId: race.id,
  year: CURRENT_SEASON,
  series: race.series,
  date: race.date,
  dateISO: race.dateISO,
  swim: race.swim,
  bike: race.bike,
  run: race.run,
  description: race.description,
  gender: race.gender,
  sourceUrl: race.sourceUrl,
}))

export const currentRaceEditions: RaceEditionView[] = legacyRaces.map((race) => ({
  ...race,
  raceId: getRaceId(race.id),
  editionId: getRaceEditionId(race.id, CURRENT_SEASON),
  year: CURRENT_SEASON,
}))

const geelong2026 = legacyRaces.find((race) => race.id === 2)

if (!geelong2026) {
  throw new Error('IRONMAN 70.3 Geelong base race is missing')
}

export const geelong2025Edition: RaceEdition = {
  id: 'ironman-70-3-geelong-2025',
  raceId: 'ironman-70-3-geelong',
  legacyId: 2,
  year: 2025,
  series: 'IRONMAN Pro Series',
  date: '23 марта',
  dateISO: '2025-03-23',
  swim: '1.9 км',
  bike: '90 км',
  run: '21.1 км',
  description: 'Первый этап IRONMAN Pro Series 2025 на дистанции 70.3 в Джилонге, Австралия.',
  gender: 'WPRO & MPRO',
  sourceUrl: 'https://www.ironman.com/proseries/pro-series-schedule-2025',
}

export const geelong2025View: RaceEditionView = {
  ...geelong2026,
  id: geelong2026.id,
  raceId: geelong2025Edition.raceId,
  editionId: geelong2025Edition.id,
  year: geelong2025Edition.year,
  series: geelong2025Edition.series,
  date: geelong2025Edition.date,
  dateISO: geelong2025Edition.dateISO,
  swim: geelong2025Edition.swim,
  bike: geelong2025Edition.bike,
  run: geelong2025Edition.run,
  description: geelong2025Edition.description,
  gender: geelong2025Edition.gender,
  sourceUrl: geelong2025Edition.sourceUrl,
}

export const raceEditions: RaceEdition[] = [
  ...currentSeasonEditions,
  geelong2025Edition,
]

export const allRaceEditionViews: RaceEditionView[] = [
  ...currentRaceEditions,
  geelong2025View,
]
