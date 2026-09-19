import { races as legacyRaces } from './races'
import type { RaceEdition, RaceEditionView } from '../types/Race'
import { getRaceEditionId, getRaceId } from './raceIdentity'
import { archiveIronmanRaceEntities, ironmanProSeries2024Editions, ironmanProSeries2025Editions } from './archiveIronmanProSeries'
import { archiveT100RaceEntities, t1002024Editions, t1002025Editions } from './archiveT100'
import { challengeRothEditions, challengeRothRaceEntity } from './archiveChallengeRoth'
import { normalizeRaceGender } from '../utils/raceGender'
import { getStatsPtoUrl } from './statsPtoRaceUrls'

const CURRENT_SEASON = 2026

const currentSeasonSofByRaceId: Record<string, { women?: number; men?: number }> = {
  'ironman-new-zealand': {"women":88.05,"men":83.63},
  'ironman-70-3-geelong': {"women":81.01,"men":92.19},
  'ironman-70-3-oceanside': {"women":92.75,"men":92.74},
  'ironman-texas': {"women":94.11,"men":95.57},
  'ironman-70-3-aix-en-provence': {"women":89.45,"men":88.22},
  'ironman-hamburg': {"women":91.01},
  'ironman-70-3-pennsylvania': {"women":86.44,"men":88.75},
  'ironman-70-3-elsinore': {"women":87.6,"men":80.23},
  'ironman-frankfurt': {"men":88.91},
  'ironman-70-3-swansea': {"women":83.23,"men":81.53},
  'ironman-lake-placid': {"women":86.26,"men":88.06},
  'ironman-70-3-boise': {"women":80.58,"men":80.09},
  'ironman-kalmar': {"women":73.79,"men":87.34},
  'ironman-70-3-zell-am-see': {"women":85.22,"men":87.85},
  'ironman-70-3-world-championship': {"women":96.18,"men":96.35},
  't100-gold-coast': {"women":91.16},
  't100-singapore': {"men":96.38},
  't100-spain': {"women":93.19},
  't100-san-francisco': {"men":93.47},
  't100-vancouver': {"women":95.52},
  't100-french-riviera': {"men":96.12},
}

const normalizeEdition = (edition: RaceEdition): RaceEdition => ({
  ...edition,
  gender: normalizeRaceGender(edition.gender),
  statsPtoUrl: edition.statsPtoUrl ?? getStatsPtoUrl(edition.raceId, edition.year),
})

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
  gender: normalizeRaceGender(race.gender),
  sourceUrl: race.sourceUrl,
  sof: currentSeasonSofByRaceId[getRaceId(race.id)],
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
  gender: normalizeRaceGender(challengeRoth2026Edition.gender),
  sourceUrl: challengeRoth2026Edition.sourceUrl,
  statsPtoUrl: getStatsPtoUrl(challengeRoth2026Edition.raceId, CURRENT_SEASON),
  sof: challengeRoth2026Edition.sof,
  raceId: challengeRoth2026Edition.raceId,
  editionId: challengeRoth2026Edition.id,
  year: CURRENT_SEASON,
}

export const currentRaceEditions: RaceEditionView[] = [
  ...legacyRaces.map((race) => ({
    ...race,
    gender: normalizeRaceGender(race.gender),
    raceId: getRaceId(race.id),
    editionId: getRaceEditionId(race.id, CURRENT_SEASON),
    year: CURRENT_SEASON,
    statsPtoUrl: getStatsPtoUrl(getRaceId(race.id), CURRENT_SEASON),
    sof: currentSeasonSofByRaceId[getRaceId(race.id)],
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
].map(normalizeEdition)

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
    gender: normalizeRaceGender(edition.gender),
    sourceUrl: edition.sourceUrl,
    statsPtoUrl: edition.statsPtoUrl,
    sof: edition.sof,
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
].map(normalizeEdition).map(editionToView)

export const allRaceEditionViews: RaceEditionView[] = [
  ...archiveRaceEditionViews,
  ...currentRaceEditions,
]
