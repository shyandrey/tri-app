import type { Race } from '../types/Race'

export type ChampionshipNavigationGroup =
  | 'ironman-world-championship'
  | 'ironman-70-3-world-championship'

export function getChampionshipNavigationGroup(race: Race): ChampionshipNavigationGroup | undefined {
  if (race.series !== 'IRONMAN Pro Series') return undefined

  if (race.name === 'IRONMAN World Championship' && race.distance === 'IRONMAN') {
    return 'ironman-world-championship'
  }

  if (race.name === 'IRONMAN 70.3 World Championship' && race.distance === '70.3') {
    return 'ironman-70-3-world-championship'
  }

  return undefined
}
