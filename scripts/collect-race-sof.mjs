import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

function extractSof(html, gender) {
  const text = decodeText(html)
  const values = [...text.matchAll(/SOF:\s*([0-9]+(?:\.[0-9]+)?)/gi)]
    .map((match) => Number(match[1]))
    .filter((value, index, values) => values.indexOf(value) === index)

  // Stats PTO result pages render Women first, then Men.
  if (values.length >= 2) {
    return { women: values[0], men: values[1] }
  }
  if (values.length === 1) {
    if (gender === 'WPRO') return { women: values[0] }
    if (gender === 'MPRO') return { men: values[0] }
    return { unknown: values[0] }
  }
  return {}
}

async function fetchRace(race) {
  if (!race.statsPtoUrl) {
    return { sof: {}, unresolved: true, reason: 'NO_STATS_PTO_URL' }
  }

  try {
    const response = await fetch(race.statsPtoUrl, {
      headers: { 'user-agent': 'TRI-APP SOF collector/1.0' },
    })
    if (!response.ok) {
      return { sof: {}, unresolved: true, reason: `HTTP_${response.status}` }
    }

    const html = await response.text()
    const sof = extractSof(html, race.gender)
    if (!Object.keys(sof).length) {
      return { sof: {}, unresolved: true, reason: 'SOF_NOT_FOUND' }
    }

    return { url: race.statsPtoUrl, sof }
  } catch (error) {
    return {
      sof: {},
      unresolved: true,
      reason: 'FETCH_FAILED',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

try {
  const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
  const uniqueRaces = [...new Map(
    allRaceEditionViews.map((edition) => [
      `${edition.raceId}::${edition.year}`,
      {
        raceId: edition.raceId,
        year: edition.year,
        name: edition.name,
        gender: edition.gender,
        statsPtoUrl: edition.statsPtoUrl,
      },
    ])
  ).values()]

  const collected = []
  for (const [index, race] of uniqueRaces.entries()) {
    const result = await fetchRace(race)
    collected.push({ ...race, ...result })
    const sofValues = Object.entries(result.sof).map(([sex, value]) => `${sex}=${value}`)
    const status = sofValues.length
      ? sofValues.join(' / ')
      : `UNRESOLVED (${result.reason})`
    console.error(`[${index + 1}/${uniqueRaces.length}] ${race.year} ${race.name}: ${status}`)
    await sleep(200)
  }

  console.log(JSON.stringify(collected, null, 2))
} finally {
  await server.close()
}
