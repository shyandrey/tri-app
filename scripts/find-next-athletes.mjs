import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'

const ROOT = process.cwd()
const EXPORT_PATH = path.join(ROOT, 'src/data/athletes/resultAthletes.generated.ts')
const EXPORT = process.argv.includes('--write')

function normalizeName(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`.-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function loadRuntimeData() {
  const server = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const [catalog, results, menModule, womenModule, verifiedModule] = await Promise.all([
      server.ssrLoadModule('/src/data/athletes/index.ts'),
      server.ssrLoadModule('/src/data/results/index.ts'),
      server.ssrLoadModule('/src/data/athletes/men.ts'),
      server.ssrLoadModule('/src/data/athletes/women.ts'),
      server.ssrLoadModule('/src/data/athletes/verifiedResultAthletes.ts'),
    ])
    return {
      athletes: catalog.athletes,
      raceResults: results.raceResults,
      curatedAthletes: [
        ...(menModule.men ?? menModule.menAthletes ?? []),
        ...(womenModule.women ?? womenModule.womenAthletes ?? []),
        ...(verifiedModule.verifiedResultAthletes ?? []),
      ],
    }
  } finally {
    await server.close()
  }
}

const { athletes: runtimeAthletes, raceResults, curatedAthletes } = await loadRuntimeData()
const existing = new Set(runtimeAthletes.map((athlete) => normalizeName(athlete.nameEn)).filter(Boolean))

function collectStats(excludedNames) {
  const stats = new Map()
  for (const row of raceResults) {
    const key = normalizeName(row.athleteName)
    if (!key || excludedNames.has(key)) continue
    const current = stats.get(key) ?? { key, names: new Map(), M: 0, W: 0, unknown: 0, countryCodes: new Map(), editions: new Map(), starts: 0 }
    current.names.set(row.athleteName, (current.names.get(row.athleteName) ?? 0) + 1)
    current.starts += 1
    if (row.gender === 'M') current.M += 1
    else if (row.gender === 'W') current.W += 1
    else current.unknown += 1
    if (row.countryCode) current.countryCodes.set(row.countryCode, (current.countryCodes.get(row.countryCode) ?? 0) + 1)
    if (row.raceEditionId) current.editions.set(row.raceEditionId, (current.editions.get(row.raceEditionId) ?? 0) + 1)
    stats.set(key, current)
  }
  return stats
}

const stats = collectStats(existing)

function inferredGender(item) {
  if (item.M > item.W) return 'M'
  if (item.W > item.M) return 'W'
  return undefined
}
function topCountry(item) {
  return [...item.countryCodes.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))[0]?.[0]
}
function preferredName(item) {
  return [...item.names.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))[0][0]
}
function sortedRows(gender) {
  return [...stats.values()]
    .filter((item) => inferredGender(item) === gender)
    .sort((a,b) => b.starts-a.starts || preferredName(a).localeCompare(preferredName(b)))
}
function printGroup(gender, limit = 50) {
  const allRows = sortedRows(gender)
  const rows = allRows.slice(0, limit)
  console.log(`\n${gender === 'M' ? 'MEN' : 'WOMEN'} (${allRows.length})`)
  rows.forEach((item, index) => {
    const aliases = item.names.size > 1 ? ` | aliases: ${[...item.names.keys()].join(' / ')}` : ''
    console.log(`${String(index+1).padStart(2,' ')}. ${preferredName(item)} | ${topCountry(item) ?? '???'} | ${item.starts} result row(s)${aliases}`)
  })
  if (allRows.length > rows.length) console.log(`    ... ${allRows.length - rows.length} more`)
}
function printUnresolved() {
  const rows = [...stats.values()]
    .filter((item) => !inferredGender(item))
    .sort((a,b) => b.starts-a.starts || preferredName(a).localeCompare(preferredName(b)))
  console.log(`\nUNRESOLVED (${rows.length})`)
  rows.forEach((item, index) => {
    const aliases = item.names.size > 1 ? ` | aliases: ${[...item.names.keys()].join(' / ')}` : ''
    const countries = item.countryCodes.size
      ? [...item.countryCodes.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([code, count]) => `${code}:${count}`).join(', ')
      : '???'
    console.log(`${String(index+1).padStart(2,' ')}. ${preferredName(item)} | country ${countries} | rows ${item.starts} | gender M:${item.M} W:${item.W} missing:${item.unknown}${aliases}`)
    for (const [edition, count] of [...item.editions.entries()].sort((a,b) => a[0].localeCompare(b[0]))) {
      console.log(`    - ${edition} | ${count} row(s)`)
    }
  })
}

function quote(value) {
  return JSON.stringify(value)
}

async function writeGeneratedProfiles() {
  const curated = new Set(curatedAthletes.map((athlete) => normalizeName(athlete.nameEn)).filter(Boolean))
  const allStats = collectStats(curated)
  const rows = [...allStats.values()]
    .filter((item) => inferredGender(item))
    .sort((a,b) => inferredGender(a).localeCompare(inferredGender(b)) || preferredName(a).localeCompare(preferredName(b)))

  const lines = [
    "import type { Athlete } from '../../types/Athlete'",
    '',
    '// Generated from runtime result rows by: npm run find:next-athletes -- --write',
    '// Do not curate names, photos or biographies here; add a normal profile instead.',
    'export const resultAthletes: Athlete[] = [',
  ]

  rows.forEach((item, index) => {
    const name = preferredName(item)
    const gender = inferredGender(item)
    const countryCode = topCountry(item)
    const fields = [
      `id: ${10000 + index}`,
      `name: ${quote(name)}`,
      `nameEn: ${quote(name)}`,
      countryCode ? `country: ${quote(countryCode)}` : `country: ''`,
      countryCode ? `countryEn: ${quote(countryCode)}` : `countryEn: ''`,
      countryCode ? `countryCode: ${quote(countryCode)}` : null,
      `flag: ''`,
      `gender: ${quote(gender)}`,
      `discipline: 'IRONMAN / T100'`,
      `bio: ''`,
      `achievements: []`,
    ].filter(Boolean)
    lines.push(`  { ${fields.join(', ')} },`)
  })
  lines.push(']', '')
  await fs.writeFile(EXPORT_PATH, lines.join('\n'), 'utf8')
  console.log(`\nWrote ${rows.length} result-derived athlete profile(s) to ${path.relative(ROOT, EXPORT_PATH)}`)
  const unresolved = allStats.size - rows.length
  if (unresolved) console.log(`Skipped ${unresolved} identity/identities with unresolved gender; they remain visible in the audit.`)
}

console.log(`Existing runtime catalog: ${runtimeAthletes.length} athlete profiles / ${existing.size} normalized identities`)
console.log(`Runtime result rows scanned: ${raceResults.length}`)
console.log(`Uncatalogued normalized identities found in runtime results: ${stats.size}`)
printGroup('M')
printGroup('W')
printUnresolved()
if (EXPORT) await writeGeneratedProfiles()
console.log('\nNote: both catalog coverage and result rows are read from the actual runtime modules. Country codes come only from result rows that explicitly contain them.')
