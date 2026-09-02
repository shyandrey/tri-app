import { races as legacyRaces } from './races'
import type { RaceEdition, RaceEditionView } from '../types/Race'
import { getRaceEditionId, getRaceId } from './raceIdentity'

const CURRENT_SEASON = 2026

export const raceEditions: RaceEdition[] = legacyRaces.map((race) => ({
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
