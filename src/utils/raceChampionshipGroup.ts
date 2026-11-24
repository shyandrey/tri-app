import type { Race, RaceDesignation } from '../types/Race'

// Presentation aliases only: historical raceIds, editionIds and result references stay intact.
const championshipIdentities: Record<string, ChampionshipNavigationGroup> = {
  'ironman-70-3-world-championship': 'ironman-70-3-world-championship',
  'ironman-70-3-world-championship-taupo': 'ironman-70-3-world-championship',
  'ironman-70-3-world-championship-marbella': 'ironman-70-3-world-championship',
  'ironman-world-championship': 'ironman-world-championship',
  'ironman-world-championship-kona': 'ironman-world-championship',
  'ironman-world-championship-nice': 'ironman-world-championship',
}
export type ChampionshipNavigationGroup = 'ironman-world-championship' | 'ironman-70-3-world-championship'
export function getChampionshipNavigationGroup(race: Pick<Race, 'raceId'>): ChampionshipNavigationGroup | undefined {
  return race.raceId ? championshipIdentities[race.raceId] : undefined
}
export function getRaceDesignation(race: Pick<Race, 'raceId' | 'year' | 'designation'>): RaceDesignation {
  if (race.designation) return race.designation
  const group = getChampionshipNavigationGroup(race)
  if (group) return group === 'ironman-70-3-world-championship' ? 'world_championship_70_3' : 'world_championship_ironman'
  if ((race.raceId === 't100-dubai' && race.year === 2024) || (race.raceId === 't100-qatar' && [2025, 2026, 2027].includes(race.year ?? 0))) return 'series_final'
  return 'regular'
}
