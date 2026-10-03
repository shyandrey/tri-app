import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { parseUniqueJSON, reviewAthleteNames, formatReports } from './athlete-name-review.mjs'
const base = 'src/data/athletes/'
const registry = parseUniqueJSON(await fs.readFile(base + 'athleteLocalization.json', 'utf8'), 'localization')
const reviewed = parseUniqueJSON(await fs.readFile(base + 'athleteLocalizationReviewed.json', 'utf8'), 'reviewed')
const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
try {
  const c = await server.ssrLoadModule('/src/data/athletes/index.ts')
  const raw = [...c.maleAthletes, ...c.femaleAthletes, ...c.resultAthletes, ...c.verifiedResultAthletes]
  const { issues, rows } = reviewAthleteNames(registry, reviewed, raw, c.athletes)
  const { normalizeAthleteIdentityName: norm } = await server.ssrLoadModule('/src/data/athleteIdentity.ts')
  const normalized = new Map()
  for (const a of raw) {
    const key = norm(a.nameEn)
    if (normalized.has(key)) issues.push(`AMBIGUOUS_NORMALIZED_IDENTITY: ${a.nameEn}`)
    normalized.set(key, a.id)
  }
  const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
  const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
  const snapshot = structuredClone(raceResults)
  assert.deepEqual(linkResultsToAthletes(raceResults), raceResults.map(r => ({ ...r, athleteId: normalized.get(norm(r.athleteName)) ?? r.athleteId })), 'Result linkage changed')
  assert.deepEqual(raceResults, snapshot, 'Raw results mutated')
  if (issues.length) throw Error(issues.join('\n'))
  const report = formatReports(rows), out = '.generated/athlete-names'
  await fs.mkdir(out, { recursive: true })
  await fs.writeFile(out + '/review.csv', report.csv)
  await fs.writeFile(out + '/review.md', report.md)
  console.log(JSON.stringify({ total: rows.length, ...Object.fromEntries(['MISSING', 'REVIEW', 'APPROVED'].map(status => [status, rows.filter(r => r.status === status).length])) }))
  console.log(`Validation PASS; source data unchanged; reports: ${out}/review.{csv,md}`)
} finally { await server.close() }
