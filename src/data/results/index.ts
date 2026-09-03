import type { RaceResult } from '../../types/RaceResult'
import { athleteCountryCodes } from '../athleteCountries'
import { getRaceEditionId } from '../raceIdentity'
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

const results2025: RaceResult[] = [
  ...geelong2025Results, ...southAfrica2025Results, ...oceanside2025Results, ...texas2025Results,
  ...veniceJesolo2025Results, ...stGeorge2025Results, ...aixEnProvence2025Results, ...hamburg2025Results,
  ...eagleman2025Results, ...cairns2025Results, ...frankfurt2025Results, ...swansea2025Results,
]

const countryCodeByAthlete = new Map<string, string>(Object.entries(athleteCountryCodes))
for (const result of [...results2026, ...results2025]) {
  if (result.countryCode) countryCodeByAthlete.set(result.athleteName, result.countryCode)
}

const withKnownCountryCode = (result: RaceResult): RaceResult => ({
  ...result,
  countryCode: result.countryCode ?? countryCodeByAthlete.get(result.athleteName),
})

export const raceResults: RaceResult[] = [
  ...results2025.map(withKnownCountryCode),
  ...results2026.map(withKnownCountryCode),
]
