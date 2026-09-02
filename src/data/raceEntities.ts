import type { RaceEntity } from '../types/Race'
import { currentRaceEditions } from './raceEditions'

export const raceEntities: RaceEntity[] = Array.from(
  new Map(
    currentRaceEditions.map((edition) => [
      edition.raceId,
      {
        id: edition.raceId,
        name: edition.name,
        country: edition.country,
        city: edition.city,
        distance: edition.distance,
      },
    ])
  ).values()
)
