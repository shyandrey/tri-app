import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const RESULTS_ROOT = path.join(ROOT, 'src/data/results')
const ATHLETE_FILES = [
  path.join(ROOT, 'src/data/athletes/men.ts'),
  path.join(ROOT, 'src/data/athletes/women.ts'),
]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await walk(full))
    else if (/\.ts$/.test(entry.name) && entry.name !== 'index.ts') files.push(full)
  }
  return files
}

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

function existingNames(source) {
  const names = new Set()
  for (const match of source.matchAll(/makeAthlete\(\s*\d+\s*,\s*'[^']*'\s*,\s*'([^']+)'/g)) names.add(normalizeName(match[1]))
  for (const match of source.matchAll(/nameEn:\s*'([^']+)'/g)) names.add(normalizeName(match[1]))
  return names
}

function parseObjects(source) {
  const rows = []
  for (const match of source.matchAll(/\{([\s\S]*?)\}/g)) {
    const body = match[1]
    const athleteName = body.match(/athleteName:\s*['"]([^'"]+)['"]/)?.[1]
    if (!athleteName) continue
    const gender = body.match(/gender:\s*['"]([MW])['"]/)?.[1]
    const countryCode = body.match(/countryCode:\s*['"]([A-Z]{2,3})['"]/)?.[1]
    rows.push({ athleteName, gender, countryCode })
  }
  return rows
}

const athleteSources = await Promise.all(ATHLETE_FILES.map((file) => fs.readFile(file, 'utf8')))
const existing = new Set(athleteSources.flatMap((source) => [...existingNames(source)]))
const resultFiles = await walk(RESULTS_ROOT)
const stats = new Map()

for (const file of resultFiles) {
  const source = await fs.readFile(file, 'utf8')
  for (const row of parseObjects(source)) {
    const key = normalizeName(row.athleteName)
    if (existing.has(key)) continue
    const current = stats.get(key) ?? { key, names: new Map(), M: 0, W: 0, unknown: 0, countryCodes: new Map(), starts: 0 }
    current.names.set(row.athleteName, (current.names.get(row.athleteName) ?? 0) + 1)
    current.starts += 1
    if (row.gender === 'M') current.M += 1
    else if (row.gender === 'W') current.W += 1
    else current.unknown += 1
    if (row.countryCode) current.countryCodes.set(row.countryCode, (current.countryCodes.get(row.countryCode) ?? 0) + 1)
    stats.set(key, current)
  }
}

function inferredGender(item) {
  if (item.M > item.W) return 'M'
  if (item.W > item.M) return 'W'
  return undefined
}
function topCountry(item) {
  return [...item.countryCodes.entries()].sort((a,b) => b[1]-a[1])[0]?.[0]
}
function preferredName(item) {
  return [...item.names.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))[0][0]
}
function printGroup(gender, limit = 50) {
  const rows = [...stats.values()]
    .filter((item) => inferredGender(item) === gender)
    .sort((a,b) => b.starts-a.starts || preferredName(a).localeCompare(preferredName(b)))
    .slice(0, limit)
  console.log(`\n${gender === 'M' ? 'MEN' : 'WOMEN'} (${rows.length})`)
  rows.forEach((item, index) => {
    const aliases = item.names.size > 1 ? ` | aliases: ${[...item.names.keys()].join(' / ')}` : ''
    console.log(`${String(index+1).padStart(2,' ')}. ${preferredName(item)} | ${topCountry(item) ?? '???'} | ${item.starts} result row(s)${aliases}`)
  })
}

console.log(`Existing catalog: ${existing.size} athletes`)
console.log(`Uncatalogued normalized identities found in result files: ${stats.size}`)
printGroup('M')
printGroup('W')
console.log('\nNote: catalog/result names are compared with the same normalization used by athlete identity linking. Country codes come only from result rows that explicitly contain them.')
