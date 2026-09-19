import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function slugCandidates(raceId) {
  const candidates = new Set([raceId])

  if (raceId.startsWith('ironman-70-3-')) {
    candidates.add(raceId.replace('ironman-70-3-', 'im-703-'))
    candidates.add(raceId.replace('ironman-70-3-', 'im703-'))
  } else if (raceId.startsWith('ironman-')) {
    candidates.add(raceId.replace('ironman-', 'im-'))
  }

  const special = {
    'ironman-70-3-oceanside': ['im-703-california'],
    'ironman-world-championship-kona': ['im-kona', 'ironman-world-championship-kona'],
    'ironman-world-championship-nice': ['im-nice', 'ironman-world-championship-nice'],
    'ironman-70-3-world-championship': ['im703-world-championship'],
    'ironman-70-3-world-championship-taupo': ['im703-taupo', 'im703-world-championship-taupo'],
    'ironman-70-3-world-championship-marbella': ['im703-marbella', 'im703-world-championship-marbella'],
    'challenge-roth': ['challenge-roth'],
    't100-san-francisco': ['san-francisco-t100'],
  }

  if (raceId.startsWith('t100-')) {
    candidates.add(`${raceId.slice('t100-'.length)}-t100`)
  }

  for (const slug of special[raceId] || []) candidates.add(slug)
  return [...candidates]
}

function decodeText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
}

function extractSof(html) {
  const text = decodeText(html)
  const matches = [...text.matchAll(/SOF:\s*([0-9]+(?:\\.[0-9]+)?)/gi)]
    .map((match) => Number(match[1]))
  const values = matches.filter((value, index) => matches.indexOf(value) === index)
  return values
}

async function fetchRace(raceId, year) {
  for (const slug of slugCandidates(raceId)) {
    const url = `https://stats.protriathletes.org/race/${slug}/${year}/results`
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'TRI-APP SOF collector/1.0' },
      })
      if (!response.ok) continue
      const html = await response.text()
      const sof = extractSof(html)
      if (!sof.length) continue
      return { raceId, year, slug, url, sof }
    } catch {
      // Try the next candidate slug.
    }
    await sleep(150)
  }
  return { raceId, year, sof: [], unresolved: true }
}

try {
  const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
  const uniqueRaces = [...new Map(
    allRaceEditionViews.map((edition) => [
      `${edition.raceId}::${edition.year}`,
      { raceId: edition.raceId, year: edition.year, name: edition.name },
    ])
  ).values()]

  const collected = []
  for (const [index, race] of uniqueRaces.entries()) {
    const result = await fetchRace(race.raceId, race.year)
    collected.push({ ...race, ...result })
    const status = result.sof.length ? result.sof.join(' / ') : 'UNRESOLVED'
    console.error(`[${index + 1}/${uniqueRaces.length}] ${race.year} ${race.name}: ${status}`)
    await sleep(200)
  }

  console.log(JSON.stringify(collected, null, 2))
} finally {
  await server.close()
}
