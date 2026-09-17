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

  const errors = []
  const warnings = []
  const info = []
  const sourceNotes = []

  const normalizeAthleteIdentityName = (value) => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`.-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const editionById = new Map(allRaceEditionViews.map((edition) => [edition.editionId, edition]))
  const resultIds = new Map()
  const athleteKeys = new Map()
  const athleteIds = new Map()
  const normalizedAthleteNames = new Map()
  let linkedResultRows = 0

  for (const athlete of athletes) {
    if (athleteIds.has(athlete.id)) {
      errors.push(`Duplicate athlete id ${athlete.id}: ${athleteIds.get(athlete.id)} / ${athlete.nameEn || athlete.name}`)
    } else {
      athleteIds.set(athlete.id, athlete.nameEn || athlete.name)
    }

    if (!athlete.nameEn) {
      errors.push(`Missing athlete nameEn: id ${athlete.id} — ${athlete.name}`)
      continue
    }

    const normalizedName = normalizeAthleteIdentityName(athlete.nameEn)
    if (!normalizedName) {
      errors.push(`Empty normalized athlete identity: id ${athlete.id} — ${athlete.nameEn}`)
    } else if (normalizedAthleteNames.has(normalizedName)) {
      const previous = normalizedAthleteNames.get(normalizedName)
      errors.push(`Duplicate normalized athlete identity "${normalizedName}": ${previous.name} [id ${previous.id}] / ${athlete.nameEn} [id ${athlete.id}]`)
    } else {
      normalizedAthleteNames.set(normalizedName, { id: athlete.id, name: athlete.nameEn })
    }
  }

  const diagnosticNames = ['Sam Laidlow', 'Alistair Brownlee', 'Anne Haug', 'Michael Boult', 'Henri Schoeman']
  info.push(`Catalog ID ranges: curated(1-9999)=${athletes.filter((athlete) => athlete.id < 10000).length}, generated(10000-19999)=${athletes.filter((athlete) => athlete.id >= 10000 && athlete.id < 20000).length}, verified(20000+)=${athletes.filter((athlete) => athlete.id >= 20000).length}`)
  for (const name of diagnosticNames) {
    const normalized = normalizeAthleteIdentityName(name)
    const match = normalizedAthleteNames.get(normalized)
    info.push(`Catalog probe ${name}: ${match ? `FOUND id=${match.id} name=${match.name}` : 'MISSING'}`)
  }

  const resolveAuditedAthleteId = (athleteName) =>
    normalizedAthleteNames.get(normalizeAthleteIdentityName(athleteName))?.id

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

  const verifiedSourceSplitTotalAnomalies = new Set([
    't100-san-francisco-2024',
    't100-spain-2025',
  ])

  const verifiedSourceAthleteSplitTotalAnomalies = new Set([
    'ironman-texas-2026::Olivia Dietzel',
  ])

  for (const result of raceResults) {
    const resolvedAthleteId = resolveAuditedAthleteId(result.athleteName)
    if (resolvedAthleteId === undefined) {
      errors.push(`Unlinked result athlete: ${result.raceEditionId ?? '?'} — ${result.athleteName} [result id ${result.id}]`)
    } else {
      linkedResultRows += 1
    }

    if (result.athleteId !== undefined && resolvedAthleteId !== undefined && result.athleteId !== resolvedAthleteId) {
      errors.push(`Athlete id mismatch: ${result.raceEditionId ?? '?'} — ${result.athleteName} has ${result.athleteId}, resolves to ${resolvedAthleteId}`)
    }

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
        const difference = Math.abs(sum - total)
        if (difference > 5) {
          const athleteSourceKey = `${result.raceEditionId}::${result.athleteName}`
          if (
            verifiedSourceSplitTotalAnomalies.has(result.raceEditionId) ||
            verifiedSourceAthleteSplitTotalAnomalies.has(athleteSourceKey)
          ) {
            sourceNotes.push(`Verified source split/total mismatch ${difference}s: ${result.raceEditionId} — ${result.athleteName}`)
          } else {
            warnings.push(`Split sum differs from total by ${difference}s: ${result.raceEditionId} — ${result.athleteName}`)
          }
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

  info.unshift(`Race results: ${raceResults.length}`)
  info.unshift(`Race editions: ${allRaceEditionViews.length}`)
  info.unshift(`Editions with results: ${editionsWithResults.length}`)
  info.unshift(`Unique result IDs: ${resultIds.size}`)
  info.unshift(`Athlete profiles: ${athletes.length}`)
  info.unshift(`Unique athlete IDs: ${athleteIds.size}`)
  info.unshift(`Unique athlete identities: ${normalizedAthleteNames.size}`)
  info.unshift(`Result rows linked to athlete profiles: ${linkedResultRows}/${raceResults.length}`)
  info.unshift(`Verified source anomalies: ${sourceNotes.length}`)

  console.log('\nTRI APP — RESULTS SANITY CHECK')
  console.log('================================')
  for (const line of info) console.log(`INFO  ${line}`)

  console.log(`\nERRORS (${errors.length})`)
  if (!errors.length) console.log('  none')
  else errors.forEach((message) => console.log(`  - ${message}`))

  console.log(`\nWARNINGS (${warnings.length})`)
  if (!warnings.length) console.log('  none')
  else warnings.forEach((message) => console.log(`  - ${message}`))

  console.log(`\nVERIFIED SOURCE NOTES (${sourceNotes.length})`)
  if (!sourceNotes.length) console.log('  none')
  else sourceNotes.forEach((message) => console.log(`  - ${message}`))

  process.exitCode = errors.length ? 1 : 0
} finally {
  await server.close()
}
