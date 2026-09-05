import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
})

try {
  const [{ raceResults }, { allRaceEditionViews }] = await Promise.all([
    server.ssrLoadModule('/src/data/results/index.ts'),
    server.ssrLoadModule('/src/data/raceEditions.ts'),
  ])

  const errors = []
  const warnings = []
  const info = []

  const editionById = new Map(allRaceEditionViews.map((edition) => [edition.editionId, edition]))
  const resultIds = new Map()
  const athleteKeys = new Map()

  const parseTime = (value) => {
    if (!value) return undefined
    const parts = value.split(':').map(Number)
    if (parts.some(Number.isNaN)) return Number.NaN
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return Number.NaN
  }

  const plausibleMinimum = {
    swimTime: 10 * 60,
    bikeTime: 30 * 60,
    runTime: 20 * 60,
  }

  for (const result of raceResults) {
    if (resultIds.has(result.id)) {
      errors.push(`Duplicate result id ${result.id}: ${resultIds.get(result.id)} / ${result.athleteName}`)
    } else {
      resultIds.set(result.id, result.athleteName)
    }

    if (!result.raceEditionId) {
      errors.push(`Missing raceEditionId: ${result.athleteName} [id ${result.id}]`)
      continue
    }

    const edition = editionById.get(result.raceEditionId)
    if (!edition) {
      errors.push(`Unknown raceEditionId ${result.raceEditionId}: ${result.athleteName} [id ${result.id}]`)
    } else {
      if (edition.gender === 'WPRO' && result.gender === 'M') {
        errors.push(`Gender mismatch: M result in WPRO edition ${result.raceEditionId}: ${result.athleteName}`)
      }
      if (edition.gender === 'MPRO' && result.gender === 'W') {
        errors.push(`Gender mismatch: W result in MPRO edition ${result.raceEditionId}: ${result.athleteName}`)
      }
    }

    if (!['M', 'W'].includes(result.gender)) {
      warnings.push(`Missing/invalid gender: ${result.raceEditionId} — ${result.athleteName}`)
    }

    const athleteKey = `${result.raceEditionId}::${result.gender ?? '?'}::${result.athleteName.trim().toLowerCase()}`
    if (athleteKeys.has(athleteKey)) {
      errors.push(`Duplicate athlete in edition/gender: ${result.raceEditionId} ${result.gender ?? '?'} — ${result.athleteName}`)
    } else {
      athleteKeys.set(athleteKey, result.id)
    }

    const validPosition = typeof result.position === 'number' || ['DNF', 'DNS', 'DSQ'].includes(result.position)
    if (!validPosition) {
      errors.push(`Invalid position/status ${String(result.position)}: ${result.raceEditionId} — ${result.athleteName}`)
    }
    if (typeof result.position === 'number' && (!Number.isInteger(result.position) || result.position < 1)) {
      errors.push(`Invalid numeric position ${result.position}: ${result.raceEditionId} — ${result.athleteName}`)
    }

    for (const field of ['swimTime', 't1Time', 'bikeTime', 't2Time', 'runTime', 'totalTime']) {
      const value = result[field]
      if (!value) continue
      const seconds = parseTime(value)
      if (!Number.isFinite(seconds)) {
        errors.push(`Malformed ${field}=${value}: ${result.raceEditionId} — ${result.athleteName}`)
      }
    }

    for (const [field, minimum] of Object.entries(plausibleMinimum)) {
      const value = result[field]
      if (!value) continue
      const seconds = parseTime(value)
      if (Number.isFinite(seconds) && seconds < minimum) {
        warnings.push(`Implausibly short ${field}=${value}: ${result.raceEditionId} — ${result.athleteName}`)
      }
    }

    if (typeof result.position === 'number' && result.totalTime) {
      const total = parseTime(result.totalTime)
      const splitFields = ['swimTime', 't1Time', 'bikeTime', 't2Time', 'runTime']
      const splitSeconds = splitFields.map((field) => parseTime(result[field])).filter(Number.isFinite)
      if (splitSeconds.length === 5 && Number.isFinite(total)) {
        const sum = splitSeconds.reduce((acc, value) => acc + value, 0)
        if (Math.abs(sum - total) > 5) {
          warnings.push(`Split sum differs from total by ${Math.abs(sum - total)}s: ${result.raceEditionId} — ${result.athleteName}`)
        }
      }
    }
  }

  const grouped = new Map()
  for (const result of raceResults) {
    if (!result.raceEditionId || !result.gender) continue
    const key = `${result.raceEditionId}::${result.gender}`
    const list = grouped.get(key) ?? []
    list.push(result)
    grouped.set(key, list)
  }

  for (const [key, list] of grouped) {
    const positions = list.filter((r) => typeof r.position === 'number').map((r) => r.position).sort((a, b) => a - b)
    const seen = new Set()
    for (const position of positions) {
      if (seen.has(position)) errors.push(`Duplicate finish position ${position}: ${key}`)
      seen.add(position)
    }
    if (positions.length) {
      const expected = Array.from({ length: positions.length }, (_, i) => i + 1)
      if (positions.some((value, index) => value !== expected[index])) {
        warnings.push(`Non-contiguous finish positions in ${key}: ${positions.join(', ')}`)
      }
    }
  }

  const resultEditionIds = new Set(raceResults.map((result) => result.raceEditionId).filter(Boolean))
  const editionsWithResults = allRaceEditionViews.filter((edition) => resultEditionIds.has(edition.editionId))

  info.push(`Race results: ${raceResults.length}`)
  info.push(`Race editions: ${allRaceEditionViews.length}`)
  info.push(`Editions with results: ${editionsWithResults.length}`)
  info.push(`Unique result IDs: ${resultIds.size}`)

  console.log('\nTRI APP — RESULTS SANITY CHECK')
  console.log('================================')
  for (const line of info) console.log(`INFO  ${line}`)

  console.log(`\nERRORS (${errors.length})`)
  if (!errors.length) console.log('  none')
  else errors.forEach((message) => console.log(`  - ${message}`))

  console.log(`\nWARNINGS (${warnings.length})`)
  if (!warnings.length) console.log('  none')
  else warnings.forEach((message) => console.log(`  - ${message}`))

  process.exitCode = errors.length ? 1 : 0
} finally {
  await server.close()
}
