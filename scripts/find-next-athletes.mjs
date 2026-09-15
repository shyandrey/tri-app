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

function existingNames(source) {
  const names = new Set()
  for (const match of source.matchAll(/makeAthlete\(\s*\d+\s*,\s*'[^']*'\s*,\s*'([^']+)'/g)) names.add(match[1])
  for (const match of source.matchAll(/nameEn:\s*'([^']+)'/g)) names.add(match[1])
  return names
}

function parseObjects(source) {
  const rows = []
  for (const match of source.matchAll(/\{([\s\S]*?)\}/g)) {
    const body = match[1]
    const athleteName = body.match(/athleteName:\s*['"]([^'"]+)['"]/)?.[1]
    if (!athleteName) continue
    const gender = body.match(/gender:\s*['"]([MW])['"]/)?.[1]
    const countryCode = body.match(/countryCode:\s*['"]([A-Z]{3})['"]/)?.[1]
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
    if (existing.has(row.athleteName)) continue
    const current = stats.get(row.athleteName) ?? { name: row.athleteName, M: 0, W: 0, unknown: 0, countryCodes: new Map(), starts: 0 }
    current.starts += 1
    if (row.gender === 'M') current.M += 1
    else if (row.gender === 'W') current.W += 1
    else current.unknown += 1
    if (row.countryCode) current.countryCodes.set(row.countryCode, (current.countryCodes.get(row.countryCode) ?? 0) + 1)
    stats.set(row.athleteName, current)
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
function printGroup(gender, limit = 50) {
  const rows = [...stats.values()]
    .filter((item) => inferredGender(item) === gender)
    .sort((a,b) => b.starts-a.starts || a.name.localeCompare(b.name))
    .slice(0, limit)
  console.log(`\n${gender === 'M' ? 'MEN' : 'WOMEN'} (${rows.length})`)
  rows.forEach((item, index) => console.log(`${String(index+1).padStart(2,' ')}. ${item.name} | ${topCountry(item) ?? '???'} | ${item.starts} result row(s)`))
}

console.log(`Existing catalog: ${existing.size} athletes`)
console.log(`Uncatalogued names found in result files: ${stats.size}`)
printGroup('M')
printGroup('W')
console.log('\nNote: rows without explicit gender are intentionally not guessed. Country codes come only from result rows that explicitly contain them.')
