import { races as legacyRaces } from './races'
import type { RaceEdition, RaceEditionView } from '../types/Race'
import { getRaceEditionId, getRaceId } from './raceIdentity'
import { archiveIronmanRaceEntities, ironmanProSeries2024Editions, ironmanProSeries2025Editions } from './archiveIronmanProSeries'
import { archiveT100RaceEntities, t1002024Editions, t1002025Editions } from './archiveT100'
import { challengeRothEditions, challengeRothRaceEntity } from './archiveChallengeRoth'

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

const challengeRoth2026Edition = challengeRothEditions.find((edition) => edition.year === CURRENT_SEASON)!

const challengeRoth2026View: RaceEditionView = {
  id: -2700,
  name: challengeRothRaceEntity.name,
  series: challengeRoth2026Edition.series,
  distance: challengeRothRaceEntity.distance,
  date: challengeRoth2026Edition.date,
  dateISO: challengeRoth2026Edition.dateISO,
  country: challengeRothRaceEntity.country,
  city: challengeRothRaceEntity.city,
  swim: challengeRoth2026Edition.swim,
  bike: challengeRoth2026Edition.bike,
  run: challengeRoth2026Edition.run,
  description: challengeRoth2026Edition.description,
  gender: challengeRoth2026Edition.gender,
  sourceUrl: challengeRoth2026Edition.sourceUrl,
  raceId: challengeRoth2026Edition.raceId,
  editionId: challengeRoth2026Edition.id,
  year: CURRENT_SEASON,
}

export const currentRaceEditions: RaceEditionView[] = [
  ...legacyRaces.map((race) => ({
    ...race,
    raceId: getRaceId(race.id),
    editionId: getRaceEditionId(race.id, CURRENT_SEASON),
    year: CURRENT_SEASON,
  })),
  challengeRoth2026View,
]

export const raceEditions: RaceEdition[] = [
  ...ironmanProSeries2024Editions,
  ...ironmanProSeries2025Editions,
  ...t1002024Editions,
  ...t1002025Editions,
  ...challengeRothEditions,
  ...currentSeasonEditions,
]

const raceEntityById = new Map(
  [
    ...archiveIronmanRaceEntities,
    ...archiveT100RaceEntities,
    challengeRothRaceEntity,
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
  ...t1002024Editions,
  ...t1002025Editions,
  ...challengeRothEditions.filter((edition) => edition.year !== CURRENT_SEASON),
].map(editionToView)

export const allRaceEditionViews: RaceEditionView[] = [
  ...archiveRaceEditionViews,
  ...currentRaceEditions,
]
