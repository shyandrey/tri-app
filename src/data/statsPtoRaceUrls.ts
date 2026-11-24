import type { RaceEdition } from '../types/Race'

const statsPtoSlugByRaceId: Record<string, string> = {
  'ironman-new-zealand': 'im-new-zealand',
  'ironman-70-3-geelong': 'im-703-geelong',
  'ironman-70-3-oceanside': 'im-703-california',
  'ironman-texas': 'im-texas',
  'ironman-70-3-aix-en-provence': 'im-703-pays-daix',
  'ironman-hamburg': 'im-hamburg',
  'ironman-70-3-pennsylvania': 'ironman-703-pennsylvania',
  'ironman-70-3-elsinore': 'im-703-elsinore',
  'ironman-frankfurt': 'im-germany',
  'ironman-70-3-swansea': 'im-703-swansea',
  'ironman-lake-placid': 'im-lake-placid',
  'ironman-70-3-boise': 'ironman-703-boise',
  'ironman-kalmar': 'im-sweden',
  'ironman-70-3-zell-am-see': 'im-703-zell-am-see',
  'ironman-70-3-world-championship': 'im-703-world-championship',
  'ironman-70-3-world-championship-taupo': 'im-703-world-championship',
  'ironman-70-3-world-championship-marbella': 'im-703-world-championship',
  'ironman-world-championship-kona': 'im-hawaii',
  'ironman-world-championship-nice': 'ironman-nice-world-championships',
  'ironman-south-africa': 'im-south-africa',
  'ironman-70-3-st-george': 'im-703-st-george',
  'ironman-70-3-venice-jesolo': 'im-703-jesolo',
  'ironman-70-3-mallorca': 'im-703-mallorca',
  'ironman-70-3-chattanooga': 'im-703-chattanooga',
  'ironman-70-3-boulder': 'im-703-boulder',
  'ironman-cairns': 'im-cairns',
  'ironman-70-3-mont-tremblant': 'im-703-mont-tremblant',
  'ironman-70-3-les-sables': 'im-703-les-sables-dolonne',
  'ironman-vitoria-gasteiz': 'im-vitoria-gasteiz',
  'ironman-70-3-tallinn': 'im-703-tallinn',
  'ironman-70-3-western-australia': 'ironman-703-western-australia',
  'ironman-70-3-eagleman': 'im-703-eagleman',
  't100-miami': 'miami-t100',
  't100-singapore': 'singapore-t100',
  't100-san-francisco': 'san-francisco-t100',
  't100-london': 'london-t100',
  't100-ibiza': 'ibiza-t100',
  't100-lake-las-vegas': 'lake-las-vegas-t100',
  't100-dubai': 'dubai-t100',
  't100-vancouver': 'vancouver-t100',
  't100-french-riviera': 'french-riviera-t100',
  't100-spain': 'spain-t100',
  't100-wollongong': 'wollongong-t100',
  't100-qatar': 'qatar-t100',
  't100-gold-coast': 'gold-coast-t100',
  't100-saudi-arabia': 'saudi-arabia-t100',
  'challenge-roth': 'challenge-roth',
}

export function getStatsPtoUrl(raceId: string, year: number) {
  // The working 2027 calendar does not establish official results-page URLs.
  if (year === 2027) return undefined
  const slug = statsPtoSlugByRaceId[raceId]
  return slug ? `https://stats.protriathletes.org/race/${slug}/${year}/results` : undefined
}

// A supplied string alone is not verification. The review reference must be
// checked by the owner/import reviewer; this guard cannot certify its contents.
export function resolveEditionStatsPtoUrl(edition: Pick<RaceEdition, 'raceId' | 'year' | 'statsPtoUrl' | 'statsPtoVerification'>) {
  if (edition.year !== 2027) return edition.statsPtoUrl ?? getStatsPtoUrl(edition.raceId, edition.year)
  const { statsPtoUrl: url, statsPtoVerification: review } = edition
  if (!url || review?.url !== url || typeof review.evidenceRef !== 'string' || !review.evidenceRef.trim()) return undefined
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'stats.protriathletes.org' || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash || !/^\/race\/[^/]+\/2027\/results\/?$/.test(parsed.pathname)) return undefined
    return url
  } catch { return undefined }
}
