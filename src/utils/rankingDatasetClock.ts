import type { Athlete } from '../types/Athlete'
import type { RaceEditionView } from '../types/Race'
import type { RaceResult } from '../types/RaceResult'
import { resolveAthleteId } from '../data/athleteIdentity'

// Production imports contain completed results only. Do not consult a device
// clock here: completion/date verification belongs to the import review gate.
export function getRankingDatasetClock(
  athletes: Athlete[], results: RaceResult[], editions: RaceEditionView[],
): Date {
  const athleteIds = new Set(athletes.map(athlete => athlete.id))
  const editionById = new Map(editions.map(edition => [edition.editionId, edition]))
  let latest = 0 // Empty/nonparticipating dataset: deterministic epoch, no ranking rows.
  for (const result of results) {
    if (result.position === 'DNS') continue
    const athleteId = result.athleteId ?? resolveAthleteId(result.athleteName)
    if (!athleteId || !athleteIds.has(athleteId)) continue
    const edition = editionById.get(result.raceEditionId ?? '')
    if (!edition) continue
    const timestamp = Date.parse(`${edition.dateISO}T12:00:00Z`)
    if (Number.isFinite(timestamp)) latest = Math.max(latest, timestamp)
  }
  return new Date(latest)
}
