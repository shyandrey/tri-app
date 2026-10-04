import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { parseUniqueJSON, catalogRows, formatReports, makeBaseline, rankReviewRows } from './athlete-name-review.mjs'
export const registryPath = 'src/data/athletes/athleteLocalization.json'
export const reviewDirectory = '.generated/athlete-names'
export async function loadNameSnapshot() {
  const registryText = await fs.readFile(registryPath, 'utf8')
  const registry = parseUniqueJSON(registryText, 'localization')
  const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
  try {
    const c = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const raw = [...c.maleAthletes, ...c.femaleAthletes, ...c.resultAthletes, ...c.verifiedResultAthletes]
    const nameRows = catalogRows(registry, raw, c.athletes)
    const { normalizeAthleteIdentityName: norm } = await server.ssrLoadModule('/src/data/athleteIdentity.ts')
    const normalized = new Map()
    for (const a of raw) {
      const key = norm(a.nameEn)
      if (normalized.has(key)) throw Error(`AMBIGUOUS_NORMALIZED_IDENTITY: ${a.nameEn}`)
      normalized.set(key, a.id)
    }
    const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
    const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
    const snapshot = structuredClone(raceResults)
    assert.deepEqual(linkResultsToAthletes(raceResults), raceResults.map(r => ({ ...r, athleteId: normalized.get(norm(r.athleteName)) ?? r.athleteId })), 'Result linkage changed')
    assert.deepEqual(raceResults, snapshot, 'Raw results mutated')
    assert.equal(await fs.readFile(registryPath, 'utf8'), registryText, 'Localization changed while reading; retry')
    const { rankedAthletes, athleteRanking } = await server.ssrLoadModule('/src/sports/data.ts')
    const rows = rankReviewRows(nameRows, rankedAthletes, athleteRanking)
    // Results affect review priority, not the identity/name snapshot for import.
    return { registryText, registry, baseline: makeBaseline(rows, raw, registryText) }
  } finally { await server.close() }
}
export async function exportNameReview(snapshot, directory = reviewDirectory) {
  const { rows } = snapshot.baseline, report = formatReports(rows)
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(path.join(directory, 'review.csv'), report.csv)
  await fs.writeFile(path.join(directory, 'review.md'), report.md)
  await fs.writeFile(path.join(directory, 'baseline.json'), JSON.stringify(snapshot.baseline, null, 2) + '\n')
  return { total: rows.length, present: rows.filter(r => r.name_ru).length, missing: rows.filter(r => !r.name_ru).length }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    if (process.argv.length !== 2) throw Error('Usage: npm run audit:athlete-names (no arguments)')
    console.log(JSON.stringify(await exportNameReview(await loadNameSnapshot())))
    console.log(`Source data unchanged. Exported ${reviewDirectory}/review.csv, review.md, baseline.json. Edit only name_ru in CSV.`)
  } catch (e) { console.error(e.message); process.exitCode = 1 }
}
