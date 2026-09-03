import { races as legacyRaces } from './races'
import type { RaceEdition, RaceEditionView } from '../types/Race'
import { getRaceEditionId, getRaceId } from './raceIdentity'
import { archiveIronmanRaceEntities, ironmanProSeries2024Editions, ironmanProSeries2025Editions } from './archiveIronmanProSeries'
import { archiveT100RaceEntities, t1002025Editions } from './archiveT100'

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

export const raceEditions: RaceEdition[] = [
  ...ironmanProSeries2024Editions,
  ...ironmanProSeries2025Editions,
  ...t1002025Editions,
  ...currentSeasonEditions,
]

const raceEntityById = new Map(
  [
    ...archiveIronmanRaceEntities,
    ...archiveT100RaceEntities,
    ...currentRaceEditions.map((edition) => ({
      id: edition.raceId,
      name: edition.name,
      country: edition.country,
      city: edition.city,
      distance: edition.distance,
    })),
  ].map((entity) => [entity.id, entity])
)

function editionToView(edition: RaceEdition, index: number): RaceEditionView {
  const entity = raceEntityById.get(edition.raceId)

  if (!entity) {
    throw new Error(`Race entity ${edition.raceId} is missing for ${edition.id}`)
  }

  return {
    id: edition.legacyId ?? -(index + 1),
    name: entity.name,
    series: edition.series,
    distance: entity.distance,
    date: edition.date,
    dateISO: edition.dateISO,
    country: entity.country,
    city: entity.city,
    swim: edition.swim,
    bike: edition.bike,
    run: edition.run,
    description: edition.description,
    gender: edition.gender,
    sourceUrl: edition.sourceUrl,
    raceId: edition.raceId,
    editionId: edition.id,
    year: edition.year,
  }
}

const archiveRaceEditionViews = [
  ...ironmanProSeries2024Editions,
  ...ironmanProSeries2025Editions,
  ...t1002025Editions,
].map(editionToView)

export const allRaceEditionViews: RaceEditionView[] = [
  ...archiveRaceEditionViews,
  ...currentRaceEditions,
]
