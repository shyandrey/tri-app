import { athletes } from '../data/athletes'

// Canonical identities only: no result linking or internal ranking initialization.
export { default } from './RankingsArea'
export const hasAthlete = (id?: string) => athletes.some(athlete => String(athlete.id) === id)
