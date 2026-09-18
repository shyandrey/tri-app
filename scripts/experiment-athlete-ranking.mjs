import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const [{ raceResults }, { allRaceEditionViews }, { athletes }] = await Promise.all([
    server.ssrLoadModule('/src/data/results/index.ts'),
    server.ssrLoadModule('/src/data/raceEditions.ts'),
    server.ssrLoadModule('/src/data/athletes/index.ts'),
  ])

  const AS_OF = new Date('2026-09-18T12:00:00Z')
  const DAY = 86_400_000
  const HALF_LIFE_DAYS = 730

  const normalize = (value) => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`.-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const athleteByName = new Map(athletes.map((athlete) => [normalize(athlete.nameEn || athlete.name), athlete]))
  const editionById = new Map(allRaceEditionViews.map((edition) => [edition.editionId, edition]))

  const isWorldChampionship = (edition) => /world championship/i.test(edition?.name || '')
  const isT100Final = (edition) => /t100.*(?:final|world championship)|(?:final|world championship).*t100/i.test(edition?.name || '')
  const isTierAChampionship = (edition) =>
    /ironman (?:texas|frankfurt|hamburg)/i.test(edition?.name || '')
  const isT100 = (edition) => edition?.distance === 'T100' || /t100/i.test(edition?.name || '')
  const isRoth = (edition) => /challenge roth/i.test(edition?.name || '')

  function raceTier(edition) {
    if (isWorldChampionship(edition) || isT100Final(edition)) return { tier: 'S', weight: 1.4 }
    if (isTierAChampionship(edition) || isT100(edition) || isRoth(edition)) return { tier: 'A', weight: 1.2 }
    return { tier: 'B', weight: 1.0 }
  }

  const placeScore = (position, exponent) =>
    typeof position === 'number' ? 100 / Math.pow(position, exponent) : 0

  const recencyWeight = (dateISO) => {
    const raceDate = new Date(`${dateISO}T12:00:00Z`)
    const ageDays = Math.max(0, (AS_OF - raceDate) / DAY)
    return Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
  }

  const activityConfidence = (starts) => 0.70 + 0.30 * (1 - Math.exp(-starts / 5))

  const models = [
    { id: 'A', label: 'base: p^-0.65, S x1.40', exponent: 0.65, sWeight: 1.40, sWinBonus: 0 },
    { id: 'B', label: 'S stronger: p^-0.65, S x1.55', exponent: 0.65, sWeight: 1.55, sWinBonus: 0 },
    { id: 'C', label: 'S win bonus: S x1.50 + 25% win', exponent: 0.65, sWeight: 1.50, sWinBonus: 0.25 },
    { id: 'D', label: 'flatter places + S win: p^-0.60, S x1.50 + 25% win', exponent: 0.60, sWeight: 1.50, sWinBonus: 0.25 },
  ]

  const resultsByAthlete = new Map()
  for (const result of raceResults) {
    if (result.position === 'DNS') continue
    const athlete = athleteByName.get(normalize(result.athleteName))
    const edition = editionById.get(result.raceEditionId)
    if (!athlete || !edition || new Date(`${edition.dateISO}T12:00:00Z`) > AS_OF) continue
    const list = resultsByAthlete.get(athlete.id) || []
    list.push({ result, edition })
    resultsByAthlete.set(athlete.id, list)
  }

  function calculate(athlete, entries, model) {
    let numerator = 0
    let denominator = 0
    let wins = 0
    let podiums = 0
    let finishes = 0
    let sWins = 0

    for (const { result, edition } of entries) {
      const baseTier = raceTier(edition)
      const raceWeight = baseTier.tier === 'S' ? model.sWeight : baseTier.weight
      const recency = recencyWeight(edition.dateISO)
      const weight = raceWeight * recency
      let score = placeScore(result.position, model.exponent)
      if (baseTier.tier === 'S' && result.position === 1 && model.sWinBonus) {
        score *= 1 + model.sWinBonus
        sWins += 1
      } else if (baseTier.tier === 'S' && result.position === 1) {
        sWins += 1
      }
      numerator += score * weight
      denominator += weight
      if (typeof result.position === 'number') {
        finishes += 1
        if (result.position === 1) wins += 1
        if (result.position <= 3) podiums += 1
      }
    }

    const performance = denominator ? numerator / denominator : 0
    const confidence = activityConfidence(entries.length)
    return {
      athlete,
      score: performance * confidence,
      performance,
      confidence,
      starts: entries.length,
      finishes,
      wins,
      podiums,
      sWins,
    }
  }

  const compare = (a, b) =>
    b.score - a.score ||
    b.sWins - a.sWins ||
    b.wins - a.wins ||
    b.podiums - a.podiums ||
    b.starts - a.starts ||
    (a.athlete.nameEn || a.athlete.name).localeCompare(b.athlete.nameEn || b.athlete.name)

  for (const model of models) {
    const ranked = athletes
      .map((athlete) => calculate(athlete, resultsByAthlete.get(athlete.id) || [], model))
      .filter((row) => row.starts > 0)

    console.log(`\nMODEL ${model.id} — ${model.label}`)
    console.log('='.repeat(78))

    for (const [gender, label] of [['M', 'MEN'], ['W', 'WOMEN']]) {
      console.log(`\nTOP 30 ${label}`)
      ranked
        .filter((row) => row.athlete.gender === gender)
        .sort(compare)
        .slice(0, 30)
        .forEach((row, index) => {
          const name = row.athlete.nameEn || row.athlete.name
          console.log(
            `${String(index + 1).padStart(2)}. ${name.padEnd(28)} ` +
            `TRI ${row.score.toFixed(2).padStart(6)} | perf ${row.performance.toFixed(2).padStart(6)} | ` +
            `starts ${String(row.starts).padStart(2)} | wins ${row.wins} | podiums ${row.podiums} | S-wins ${row.sWins}`
          )
        })
    }
  }

  console.log('\nTIER RULES')
  console.log('S: IRONMAN World Championship, IRONMAN 70.3 World Championship, T100 Final')
  console.log('A: Frankfurt, Hamburg, Texas, Challenge Roth, regular T100')
  console.log('B: other races currently in the database')
  console.log('Recency: 730-day half-life; DNS excluded; DNF/DSQ = 0 and count as starts.')
  console.log('Model C/D: an S-tier victory receives an additional +25% place-score bonus before weighting.')
} finally {
  await server.close()
}
