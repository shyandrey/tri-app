import type { RaceResult } from '../../types/RaceResult'
import { athleteCountryCodes } from '../athleteCountries'
import { getRaceEditionId } from '../raceIdentity'
import { oceanside2024Results } from './2024/ironman/oceanside'
import { texas2024Results } from './2024/ironman/texas'
import { stGeorge2024Results } from './2024/ironman/st-george'
import { mallorca2024Results } from './2024/ironman/mallorca'
import { chattanooga2024Results } from './2024/ironman/chattanooga'
import { hamburg2024Results } from './2024/ironman/hamburg'
import { boulder2024Results } from './2024/ironman/boulder'
import { cairns2024Results } from './2024/ironman/cairns'
import { montTremblant2024Results } from './2024/ironman/mont-tremblant'
import { lesSables2024Results } from './2024/ironman/les-sables'
import { vitoriaGasteiz2024Results } from './2024/ironman/vitoria-gasteiz'
import { lakePlacid2024Results } from './2024/ironman/lake-placid'
import { frankfurt2024Results } from './2024/ironman/frankfurt'
import { tallinn2024Results } from './2024/ironman/tallinn'
import { zellAmSee2024Results } from './2024/ironman/zell-am-see'
import { niceWorldChampionship2024Results } from './2024/ironman/nice-world-championship'
import { kona2024Results } from './2024/ironman/kona'
import { westernAustralia2024Results } from './2024/ironman/western-australia'
import { taupoWomen2024Results, taupoMen2024Results } from './2024/ironman/taupo-world-championship'
import { geelong2025Results } from './2025/ironman/geelong'
import { southAfrica2025Results } from './2025/ironman/south-africa'
import { oceanside2025Results } from './2025/ironman/oceanside'
import { texas2025Results } from './2025/ironman/texas'
import { veniceJesolo2025Results } from './2025/ironman/venice-jesolo'
import { stGeorge2025Results } from './2025/ironman/st-george'
import { aixEnProvence2025Results } from './2025/ironman/aix-en-provence'
import { hamburg2025Results } from './2025/ironman/hamburg'
import { eagleman2025Results } from './2025/ironman/eagleman'
import { cairns2025Results } from './2025/ironman/cairns'
import { frankfurt2025Results } from './2025/ironman/frankfurt'
import { swansea2025Results } from './2025/ironman/swansea'
import { lakePlacid2025Results } from './2025/ironman/lake-placid'
import { zellAmSee2025Results } from './2025/ironman/zell-am-see'
import { niceWorldChampionship2025Results } from './2025/ironman/nice-world-championship'
import { kona2025Results } from './2025/ironman/kona'
import { marbellaWomen2025Results, marbellaMen2025Results } from './2025/ironman/marbella-world-championship'
import { singapore2025Results } from './2025/t100/singapore'
import { sanFrancisco2025Results } from './2025/t100/san-francisco'
import { vancouver2025Results } from './2025/t100/vancouver'
import { london2025Results } from './2025/t100/london'
import { frenchRiviera2025Results } from './2025/t100/french-riviera'
import { spain2025Results } from './2025/t100/spain'
import { wollongong2025Results } from './2025/t100/wollongong'
import { dubai2025Results } from './2025/t100/dubai'
import { qatar2025Results } from './2025/t100/qatar'
import { newZealand2026Results } from './2026/ironman/new-zealand'
import { geelong2026Results } from './2026/ironman/geelong'
import { oceanside2026Results } from './2026/ironman/oceanside'
import { texas2026Results } from './2026/ironman/texas'
import { aixEnProvence2026Results } from './2026/ironman/aix-en-provence'
import { hamburg2026Results } from './2026/ironman/hamburg'
import { pennsylvania2026Results } from './2026/ironman/pennsylvania'
import { elsinore2026Results } from './2026/ironman/elsinore'
import { frankfurt2026Results } from './2026/ironman/frankfurt'
import { swansea2026Results } from './2026/ironman/swansea'
import { lakePlacid2026Results } from './2026/ironman/lake-placid'
import { boise2026Results } from './2026/ironman/boise'
import { kalmar2026Results } from './2026/ironman/kalmar'
import { zellAmSee2026Results } from './2026/ironman/zell-am-see'
import { goldCoast2026Results } from './2026/t100/gold-coast'
import { singapore2026Results } from './2026/t100/singapore'
import { spainT1002026Results } from './2026/t100/spain'
import { sanFrancisco2026Results } from './2026/t100/san-francisco'
import { vancouver2026Results } from './2026/t100/vancouver'

const results2024: RaceResult[] = [
  ...oceanside2024Results, ...texas2024Results, ...stGeorge2024Results, ...mallorca2024Results,
  ...chattanooga2024Results, ...hamburg2024Results, ...boulder2024Results,
  ...cairns2024Results, ...montTremblant2024Results, ...lesSables2024Results,
  ...vitoriaGasteiz2024Results, ...lakePlacid2024Results, ...frankfurt2024Results,
  ...tallinn2024Results, ...zellAmSee2024Results, ...niceWorldChampionship2024Results,
  ...kona2024Results, ...westernAustralia2024Results, ...taupoWomen2024Results, ...taupoMen2024Results,
]

const results2026: RaceResult[] = [
  ...newZealand2026Results, ...geelong2026Results, ...oceanside2026Results, ...texas2026Results,
  ...aixEnProvence2026Results, ...hamburg2026Results, ...pennsylvania2026Results, ...elsinore2026Results,
  ...frankfurt2026Results, ...swansea2026Results, ...lakePlacid2026Results, ...boise2026Results,
  ...kalmar2026Results, ...zellAmSee2026Results, ...goldCoast2026Results, ...singapore2026Results,
  ...spainT1002026Results, ...sanFrancisco2026Results, ...vancouver2026Results,
].map((result) => ({
  ...result,
  raceEditionId: result.raceEditionId ?? (result.raceId ? getRaceEditionId(result.raceId, 2026) : undefined),
}))

const normalizeArchivedT100EditionId = (editionId?: string) => {
  if (!editionId) return editionId
  return editionId
    .replace(/^singapore-t100-/, 't100-singapore-')
    .replace(/^san-francisco-t100-/, 't100-san-francisco-')
    .replace(/^vancouver-t100-/, 't100-vancouver-')
}

const results2025: RaceResult[] = [
  ...geelong2025Results, ...southAfrica2025Results, ...oceanside2025Results, ...texas2025Results,
  ...veniceJesolo2025Results, ...stGeorge2025Results, ...aixEnProvence2025Results, ...hamburg2025Results,
  ...eagleman2025Results, ...cairns2025Results, ...frankfurt2025Results, ...swansea2025Results,
  ...lakePlacid2025Results, ...zellAmSee2025Results, ...niceWorldChampionship2025Results,
  ...kona2025Results, ...marbellaWomen2025Results, ...marbellaMen2025Results,
  ...singapore2025Results, ...sanFrancisco2025Results, ...vancouver2025Results,
  ...london2025Results, ...frenchRiviera2025Results, ...spain2025Results,
  ...wollongong2025Results, ...dubai2025Results, ...qatar2025Results,
].map((result) => ({ ...result, raceEditionId: normalizeArchivedT100EditionId(result.raceEditionId) }))

const countryCodeByAthlete = new Map<string, string>(Object.entries(athleteCountryCodes))
for (const result of [...results2026, ...results2025, ...results2024]) {
  if (result.countryCode) countryCodeByAthlete.set(result.athleteName, result.countryCode)
}

const withKnownCountryCode = (result: RaceResult): RaceResult => ({
  ...result,
  countryCode: result.countryCode ?? countryCodeByAthlete.get(result.athleteName),
})

export const raceResults: RaceResult[] = [
  ...results2024.map(withKnownCountryCode),
  ...results2025.map(withKnownCountryCode),
  ...results2026.map(withKnownCountryCode),
]
