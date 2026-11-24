// Injected by vite.config.ts from the reviewed build profile, never the clock/hostname.
declare const __PRIMARY_SEASON__: number
export const primarySeason = __PRIMARY_SEASON__
export function selectPrimarySeason<T extends { year: number }>(races: T[], season = primarySeason): T[] {
  return races.filter(race => race.year === season)
}
