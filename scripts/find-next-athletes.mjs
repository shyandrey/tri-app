import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'

const ROOT = process.cwd()
// Validate all arguments before loading the catalog or opening any output file.
const args = process.argv.slice(2), options = new Map()
for (let i = 0; i < args.length; i++) {
  const flag = args[i]
  if (!['--write', '--append', '--full-regenerate', '--output'].includes(flag)) throw new Error(`Unknown argument: ${flag}`)
  if (options.has(flag)) throw new Error(`Duplicate argument: ${flag}`)
  if (flag === '--output') {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--output requires a file path')
    options.set(flag, args[++i])
  } else options.set(flag, true)
}
if (options.has('--append') && options.has('--full-regenerate')) throw new Error('--append and --full-regenerate are mutually exclusive')
const EXPORT = options.has('--write')
if (EXPORT && !options.has('--append') && !options.has('--full-regenerate')) {
  throw new Error('For new athletes use --write --append. Full regeneration may renumber existing generated athlete IDs; explicit --write --full-regenerate is required. No output written.')
}
if (!EXPORT && options.size) throw new Error('Read-only discovery takes no flags. --append, --full-regenerate and --output require --write.')
const EXPORT_PATH = options.has('--output')
  ? path.resolve(ROOT, options.get('--output'))
  : path.join(ROOT, 'src/data/athletes/resultAthletes.generated.ts')
const countryEnrichment = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/athletes/countryEnrichment.json'), 'utf8'))

// Persistent, manually reviewed names keyed by exact English identity.
const athleteLocalization = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/athletes/athleteLocalization.json'), 'utf8'))

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
        ...(menModule.maleAthletes ?? []),
        ...(womenModule.femaleAthletes ?? []),
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

async function appendGeneratedProfiles() {
  // Preserve every existing record/ID; only add exact unmatched source identities.
  const rows = [...stats.values()].sort((a,b) => preferredName(a).localeCompare(preferredName(b)))
  for (const item of rows) {
    const registryCountry = countryEnrichment[preferredName(item)]?.countryCode
    if ((item.M && item.W) || item.unknown || !inferredGender(item) || item.countryCodes.size > 1 || (registryCountry && topCountry(item) && registryCountry !== topCountry(item))) {
      throw new Error(`Ambiguous new identity: ${preferredName(item)}; no output written`)
    }
  }
  const sourcePath = path.join(ROOT, 'src/data/athletes/resultAthletes.generated.ts')
  const source = await fs.readFile(sourcePath, 'utf8')
  if (!source.endsWith(']\n')) throw new Error('Unexpected generated file format; no output written')
  let nextId = Math.max(9999, ...runtimeAthletes.map(a => a.id)) + 1
  const additions = rows.map(item => {
    const name = preferredName(item), countryCode = topCountry(item)
    const fields = { id: nextId++, name, nameEn: name, country: countryCode ?? '', countryEn: countryCode ?? '', ...(countryCode ? {countryCode} : {}), flag: '', gender: inferredGender(item), discipline: 'IRONMAN / T100', achievements: [] }
    return `  ${JSON.stringify(fields)},`
  })
  if (!additions.length) { console.log('No unmatched identities to append'); return }
  await fs.writeFile(EXPORT_PATH, source.slice(0, -2) + additions.join('\n') + '\n]\n', 'utf8')
  console.log(`Appended ${additions.length} profiles with stable new IDs; all existing records preserved`)
}

async function writeGeneratedProfiles() {
  const curated = new Set(curatedAthletes.map((athlete) => normalizeName(athlete.nameEn)).filter(Boolean))
  const allStats = collectStats(curated)
  const rows = [...allStats.values()]
    .filter((item) => inferredGender(item))
    .sort((a,b) => inferredGender(a).localeCompare(inferredGender(b)) || preferredName(a).localeCompare(preferredName(b)))

  const conflicts = rows.flatMap(item => {
    const name = preferredName(item)
    const entry = countryEnrichment[name]
    const codes = [...item.countryCodes.keys()]
    return codes.length > 1 || (entry && codes.some(code => code !== entry.countryCode))
      ? [`${name}: results ${codes.join(', ') || '(none)'}, registry ${entry?.countryCode ?? '(none)'}`]
      : []
  })
  if (conflicts.length) {
    throw new Error(`Country conflicts (${conflicts.length}); no output written:\n${conflicts.join('\n')}`)
  }

  const lines = [
    "import type { Athlete } from '../../types/Athlete'",
    '',
    '// Generated from runtime result rows by: npm run find:next-athletes -- --write --full-regenerate',
    '// Do not edit here. Russian names belong in athleteLocalization.json; photos/bios in normal profiles.',
    'export const resultAthletes: Athlete[] = [',
  ]

  rows.forEach((item, index) => {
    const name = preferredName(item)
    const gender = inferredGender(item)
    const localization = athleteLocalization[name]
    const nameRu = typeof localization === 'string' ? localization : localization?.nameRu
    const enrichment = countryEnrichment[name]
    const resultCountry = topCountry(item)
    const countryCode = resultCountry ?? enrichment?.countryCode
    const fields = [
      `id: ${10000 + index}`,
      `name: ${quote(nameRu ?? name)}`,
      `nameEn: ${quote(name)}`,
      countryCode ? `country: ${quote(enrichment?.country ?? countryCode)}` : `country: ''`,
      countryCode ? `countryEn: ${quote(enrichment?.countryEn ?? countryCode)}` : `countryEn: ''`,
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
  console.log(`\nCurated/verified identities excluded from generation: ${curated.size}`)
  console.log(`Wrote ${rows.length} result-derived athlete profile(s) to ${path.relative(ROOT, EXPORT_PATH)}`)
  const unresolved = allStats.size - rows.length
  if (unresolved) console.log(`Skipped ${unresolved} identity/identities with unresolved gender; they remain visible in the audit.`)
}

console.log(`Existing runtime catalog: ${runtimeAthletes.length} athlete profiles / ${existing.size} normalized identities`)
console.log(`Runtime result rows scanned: ${raceResults.length}`)
console.log(`Uncatalogued normalized identities found in runtime results: ${stats.size}`)
printGroup('M')
printGroup('W')
printUnresolved()
if (EXPORT) {
  if (options.has('--append')) await appendGeneratedProfiles()
  else await writeGeneratedProfiles()
}
console.log('\nNote: catalog and results come from runtime modules. Generated countries use explicit result codes or countryEnrichment.json (verified or migrated existing data); conflicts stop generation before writing.')
