const raceIdsByLegacyId: Record<number, string> = {
  1: 'ironman-new-zealand',
  2: 'ironman-70-3-geelong',
  3: 'ironman-70-3-oceanside',
  4: 'ironman-texas',
  5: 'ironman-70-3-aix-en-provence',
  6: 'ironman-hamburg',
  7: 'ironman-70-3-pennsylvania',
  8: 'ironman-70-3-elsinore',
  9: 'ironman-frankfurt',
  10: 'ironman-70-3-swansea',
  11: 'ironman-lake-placid',
  12: 'ironman-70-3-boise',
  13: 'ironman-kalmar',
  14: 'ironman-70-3-zell-am-see',
  15: 'ironman-70-3-world-championship',
  16: 'ironman-70-3-world-championship',
  17: 'ironman-world-championship-kona',
  18: 't100-gold-coast',
  19: 't100-singapore',
  20: 't100-spain',
  21: 't100-san-francisco',
  22: 't100-vancouver',
  23: 't100-french-riviera',
  24: 't100-dubai',
  25: 't100-saudi-arabia',
  26: 't100-qatar',
  27: 'challenge-roth',
}

export function getRaceId(legacyId: number) {
  return raceIdsByLegacyId[legacyId] ?? `race-${legacyId}`
}

export function getRaceEditionId(legacyId: number, year: number) {
  const raceId = getRaceId(legacyId)
  const genderSuffix = legacyId === 15 ? '-women' : legacyId === 16 ? '-men' : ''
  return `${raceId}-${year}${genderSuffix}`
}
