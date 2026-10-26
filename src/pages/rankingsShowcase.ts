import type { OfficialSeries } from '../data/officialStandings'

// Full-resolution WebP derivatives; owner-approved PNG originals retained for rollback.
// Portrait uses the unchanged shared 2.35:1 cover frame.
// Landscape selects approved WebP via <picture>; originals stay untouched.
export type RankingsShowcase = {
  path: string
  landscapePath: string
  series: OfficialSeries
  scene: string
  aspectRatio: number
  focalPoint: readonly [number, number]
  portraitObjectPosition: string
  landscapeObjectPosition: string
}
const landscapeAssets: Record<string, readonly [string, string]> = {
  ironman_01_swim: ['ironman_swimming', '50% 60%'],
  ironman_02_bike: ['ironman_cycling', '50% 60%'],
  ironman_03_run_finish: ['ironman_running', '50% 52%'],
  ironman_04_transition: ['ironman_transition', '50% 58%'],
  t100_01_swim: ['t100_swimming', '50% 48%'],
  t100_02_bike: ['t100_cycling_final', '50% 50%'],
  t100_03_run_city: ['t100_running_city', '50% 30%'],
  t100_04_transition: ['t100_transition', '50% 62%'],
}
const asset = (series: OfficialSeries, file: string, scene: string, focalPoint: readonly [number, number], portraitObjectPosition: string): RankingsShowcase => ({
  path: `/images/showcase/rankings/optimized/${file}.webp`, series, scene, focalPoint,
  landscapePath: `/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/${landscapeAssets[file][0]}.webp`,
  aspectRatio: series === 'IRONMAN_PRO_SERIES' && scene !== 'transition' ? 1983 / 793 : (file === 't100_02_bike' || file === 't100_03_run_city' ? 1672 : 1671) / 941,
  portraitObjectPosition, landscapeObjectPosition: landscapeAssets[file][1],
})
export const rankingsShowcase: Record<OfficialSeries, RankingsShowcase[]> = {
  IRONMAN_PRO_SERIES: [
    asset('IRONMAN_PRO_SERIES', 'ironman_01_swim', 'swim', [73, 52], '50% 45%'),
    asset('IRONMAN_PRO_SERIES', 'ironman_02_bike', 'bike', [70, 54], '50% 48%'),
    asset('IRONMAN_PRO_SERIES', 'ironman_03_run_finish', 'run-finish', [63, 47], '50% 40%'),
    asset('IRONMAN_PRO_SERIES', 'ironman_04_transition', 'transition', [64, 55], '50% 30%'),
  ],
  T100: [
    asset('T100', 't100_01_swim', 'swim', [74, 46], '50% 44%'),
    asset('T100', 't100_02_bike', 'bike', [72, 50], '50% 25%'),
    asset('T100', 't100_03_run_city', 'run-city', [66, 48], '50% 25%'),
    asset('T100', 't100_04_transition', 'transition', [65, 51], '50% 50%'),
  ],
}
