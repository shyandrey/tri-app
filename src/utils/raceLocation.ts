import type { RaceEdition, RaceEntity } from '../types/Race'

export function resolveRaceLocation(
  edition: Pick<RaceEdition, 'city' | 'country'>,
  entity: Pick<RaceEntity, 'city' | 'country'>,
) {
  return {
    city: edition.city ?? entity.city,
    country: edition.country ?? entity.country,
  }
}
