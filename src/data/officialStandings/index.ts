import im2024men from './ironman/2024-men.json'
import im2024women from './ironman/2024-women.json'
import im2025men from './ironman/2025-men.json'
import im2025women from './ironman/2025-women.json'
import im2026men from './ironman/2026-men.json'
import im2026women from './ironman/2026-women.json'
import t2024men from './t100/2024-men.json'
import t2024women from './t100/2024-women.json'
import t2025men from './t100/2025-men.json'
import t2025women from './t100/2025-women.json'
import t2026men from './t100/2026-men.json'
import t2026women from './t100/2026-women.json'

export type OfficialSeries = 'IRONMAN_PRO_SERIES' | 'T100'
export type StandingGender = 'M' | 'W'
export const standingSeasons = [2024, 2025, 2026] as const
export type StandingSeason = typeof standingSeasons[number]
export type OfficialRow = { officialRank: number; athleteName: string; nationalityNormalized: string; officialPoints: number; athleteId: number }
export type OfficialTable = { series: OfficialSeries; seasonYear: number; gender: StandingGender; seasonStatus: string; acceptedAt: string; rows: OfficialRow[] }
// Presentation projection only. Never sort, recompute points or mutate the evidence registries.
const registries = [im2024men, im2024women, im2025men, im2025women, im2026men, im2026women, t2024men, t2024women, t2025men, t2025women, t2026men, t2026women]
export const officialStandings: OfficialTable[] = registries.map(d => ({
  series: d.series as OfficialSeries, seasonYear: d.seasonYear, gender: d.gender as StandingGender,
  seasonStatus: d.seasonStatus,
  acceptedAt: 'ownerApprovedAt' in d.provenance ? d.provenance.ownerApprovedAt : d.provenance.localApplicationApproval.date,
  rows: d.rows.map(r => {
    if (r.identityStatus !== 'CONFIRMED' || r.athleteId === null) throw new Error('Unapproved official athlete mapping')
    return { officialRank: r.officialRank, athleteName: r.athleteName, nationalityNormalized: r.nationalityNormalized, officialPoints: r.officialPoints, athleteId: r.athleteId }
  }),
}))
export const seriesTitles = { IRONMAN_PRO_SERIES: 'IRONMAN Pro Series', T100: 'T100 Triathlon World Tour' }
