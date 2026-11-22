import { calendar2027Entities } from './calendar2027'
import type { RaceEntity } from '../types/Race'
import { currentRaceEditions } from './raceEditions'
import { archiveIronmanRaceEntities } from './archiveIronmanProSeries'

const currentRaceEntities: RaceEntity[] = currentRaceEditions.map((edition) => ({
  id: edition.raceId,
  name: edition.name,
  country: edition.country,
  city: edition.city,
  distance: edition.distance,
}))

export const raceEntities: RaceEntity[] = Array.from(
  new Map(
    [...archiveIronmanRaceEntities, ...currentRaceEntities, ...calendar2027Entities].map((race) => [race.id, race])
  ).values()
)
