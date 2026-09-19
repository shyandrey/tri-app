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
    if (isWorldChampionship(edition) || isT100Final(edition)) return { tier: 'S', weight: 1.5 }
    if (isTierAChampionship(edition) || isT100(edition) || isRoth(edition)) return { tier: 'A', weight: 1.2 }
    return { tier: 'B', weight: 1.0 }
  }

  const modelTierWeight = (tier, model) => {
    if (tier === 'S') return model.sWeight
    if (tier === 'A') return model.aWeight ?? 1.2
    return 1
  }

  const placeScore = (position, exponent) =>
    typeof position === 'number' ? 100 / Math.pow(position, exponent) : 0

  const recencyWeight = (dateISO) => {
    const raceDate = new Date(`${dateISO}T12:00:00Z`)
    const ageDays = Math.max(0, (AS_OF - raceDate) / DAY)
    return Math.pow(0.5, ageDays / HALF_LIFE_DAYS)
  }

  const activityConfidence = (starts) => {
    const curve = [
      [0, 0],
      [1, 0.45],
      [2, 0.60],
      [3, 0.72],
      [4, 0.80],
      [5, 0.86],
      [6, 0.90],
      [8, 0.94],
      [10, 0.97],
      [12, 1.00],
    ]

    if (starts >= 12) return 1
    for (let index = 1; index < curve.length; index += 1) {
      const [rightStarts, rightValue] = curve[index]
      if (starts <= rightStarts) {
        const [leftStarts, leftValue] = curve[index - 1]
        const progress = (starts - leftStarts) / (rightStarts - leftStarts)
        return leftValue + (rightValue - leftValue) * progress
      }
    }
    return 1
  }

  const activityBonus = (starts) => {
    const curve = [
      [0, 0],
      [1, 0],
      [3, 0.03],
      [5, 0.06],
      [8, 0.09],
      [12, 0.12],
      [16, 0.14],
      [20, 0.15],
    ]

    if (starts >= 20) return 0.15
    for (let index = 1; index < curve.length; index += 1) {
      const [rightStarts, rightValue] = curve[index]
      if (starts <= rightStarts) {
        const [leftStarts, leftValue] = curve[index - 1]
        const progress = (starts - leftStarts) / (rightStarts - leftStarts)
        return leftValue + (rightValue - leftValue) * progress
      }
    }
    return 0.15
  }

  const sPodiumBonus = (position) => {
    if (position === 1) return 0.50
    if (position === 2) return 0.25
    if (position === 3) return 0.15
    return 0
  }

  const sofFactor = (sof) => {
    if (typeof sof !== 'number') return 1
    return Math.max(0.7, Math.min(1.15, 1 + (sof - 90) / 100))
  }

  const resultSof = (result, edition) => {
    if (result.gender === 'W') return edition.sof?.women
    if (result.gender === 'M') return edition.sof?.men
    if (edition.gender === 'WPRO') return edition.sof?.women
    if (edition.gender === 'MPRO') return edition.sof?.men
    return undefined
  }

  const models = [
    { id: 'G', label: 'direct-prestige: p^-0.65, A x1.20, S x1.40, no SOF', exponent: 0.65, aWeight: 1.20, sWeight: 1.40, directPrestige: true, useSof: false },
    { id: 'H', label: 'SOF-adjusted: G + Stats PTO field strength', exponent: 0.65, aWeight: 1.20, sWeight: 1.40, directPrestige: true, useSof: true },
    { id: 'I', label: 'SOF-led prestige: p^-0.65, A x1.10, S x1.20, S podium +50/+25/+15%', exponent: 0.65, aWeight: 1.10, sWeight: 1.20, directPrestige: true, useSof: true },
    { id: 'J', label: 'Model I + bounded activity bonus up to +15%', exponent: 0.65, aWeight: 1.10, sWeight: 1.20, directPrestige: true, useSof: true, useActivityBonus: true },
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
      const raceWeight = modelTierWeight(baseTier.tier, model)
      const recency = recencyWeight(edition.dateISO)
      const sof = resultSof(result, edition)
      const fieldStrength = model.useSof ? sofFactor(sof) : 1
      const weight = raceWeight * fieldStrength * recency
      let score = placeScore(result.position, model.exponent)
      if (baseTier.tier === 'S' && typeof result.position === 'number') {
        score *= 1 + sPodiumBonus(result.position)
        if (result.position === 1) sWins += 1
      }
      numerator += score * weight
      denominator += model.directPrestige ? recency : weight
      if (typeof result.position === 'number') {
        finishes += 1
        if (result.position === 1) wins += 1
        if (result.position <= 3) podiums += 1
      }
    }

    const performance = denominator ? numerator / denominator : 0
    const confidence = activityConfidence(entries.length)
    const bonus = model.useActivityBonus ? activityBonus(entries.length) : 0
    return {
      athlete,
      score: performance * confidence * (1 + bonus),
      performance,
      confidence,
      activityBonus: bonus,
      starts: entries.length,
      finishes,
      wins,
      podiums,
      sWins,
      entries: entries.map(({ result, edition }) => {
        const tierInfo = raceTier(edition)
        const raceWeight = modelTierWeight(tierInfo.tier, model)
        const recency = recencyWeight(edition.dateISO)
        const podiumBonus = tierInfo.tier === 'S' && typeof result.position === 'number'
          ? sPodiumBonus(result.position)
          : 0
        const sof = resultSof(result, edition)
        const fieldStrength = model.useSof ? sofFactor(sof) : 1
        const rawPlaceScore = placeScore(result.position, model.exponent)
        const adjustedPlaceScore = rawPlaceScore * (1 + podiumBonus)
        return {
          name: edition.name,
          dateISO: edition.dateISO,
          position: result.position,
          tier: tierInfo.tier,
          raceWeight,
          sof,
          fieldStrength,
          recency,
          placeScore: adjustedPlaceScore,
          contribution: adjustedPlaceScore * raceWeight * fieldStrength * recency,
        }
      }).sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
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
          const activityLabel = model.useActivityBonus ? ` | act +${(row.activityBonus * 100).toFixed(1)}%` : ''
          console.log(
            `${String(index + 1).padStart(2)}. ${name.padEnd(28)} ` +
            `TRI ${row.score.toFixed(2).padStart(6)} | perf ${row.performance.toFixed(2).padStart(6)} | conf ${row.confidence.toFixed(2)}${activityLabel} | ` +
            `starts ${String(row.starts).padStart(2)} | wins ${row.wins} | podiums ${row.podiums} | S-wins ${row.sWins}`
          )
          row.entries
            .slice()
            .sort((a, b) => b.contribution - a.contribution)
            .slice(0, 5)
            .forEach((entry) => {
              const sofLabel = typeof entry.sof === 'number' ? entry.sof.toFixed(2) : '—'
              console.log(
                `    ↳ ${entry.dateISO} | ${String(entry.position).padStart(3)} | ${entry.tier} | SOF ${sofLabel.padStart(5)} | ` +
                `xTier ${entry.raceWeight.toFixed(2)} | xSOF ${entry.fieldStrength.toFixed(3)} | contribution ${entry.contribution.toFixed(2)} | ${entry.name}`
              )
            })
        })
    }
  }

  console.log('\nTIER RULES')
  console.log('S: IRONMAN World Championship, IRONMAN 70.3 World Championship, T100 Final')
  console.log('A: Frankfurt, Hamburg, Texas, Challenge Roth, regular T100')
  console.log('B: other races currently in the database')
  console.log('Recency: 730-day half-life; DNS excluded; DNF/DSQ = 0 and count as starts.')
  console.log('Model G: direct prestige; A x1.20, S x1.40; no SOF.')
  console.log('Model H: Model G + gender-specific Stats PTO SOF; 90 is neutral, each SOF point changes race value by 1%, capped at x0.70..x1.15. Missing SOF is neutral.')
  console.log('Model I: SOF-led prestige; A x1.10, S x1.20; same SOF factor and S-tier podium bonuses +50% / +25% / +15%.')
  console.log('Model J: Model I + bounded activity bonus: 1=0%, 3=3%, 5=6%, 8=9%, 12=12%, 16=14%, 20+=15% (linear interpolation).')
  console.log('Activity confidence: 1=.45, 2=.60, 3=.72, 4=.80, 5=.86, 6=.90, 8=.94, 10=.97, 12+=1.00 (linear interpolation).')
} finally {
  await server.close()
}
