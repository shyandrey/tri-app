import { createServer } from 'vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

export const PILOT_UNRESOLVED = ['Maja Stage Nielsen', 'Nick Thompson', 'Cameron Main', 'Wilhelm Hirsch']
export async function selectPhotoBatch2(asOf = new Date(), photoBaseline = null) {
  return selectPhotoBatch({asOf,photoBaseline})
}
export async function selectPhotoBatch({asOf = new Date(), photoBaseline = null, batchId = 'photo-batch-2', perGender = 25, priorityRankLimit = 100, additionalExclusions = []} = {}) {
  assert.ok(Number.isSafeInteger(perGender) && perGender > 0)

  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  try {
    const { athletes } = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const { athletePhotosByName } = await server.ssrLoadModule('/src/data/athletes/athletePhotos.generated.ts')
    const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
    const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
    const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
    const { calculateAthleteRanking, sortAthletesByRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const pilot = JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-pilot-reviewed-manifest.json', 'utf8'))
    const exclusions = new Set([...PILOT_UNRESOLVED, ...additionalExclusions, ...pilot.entries.map(e => e.athlete.nameEn)])
    const linked = linkResultsToAthletes(raceResults)
    const scores = new Map(calculateAthleteRanking(athletes, linked, allRaceEditionViews, asOf).map(r => [r.athleteId, r.score]))
    const order = sortAthletesByRanking(athletes, linked, allRaceEditionViews, asOf).filter(a => scores.has(a.id))
    const positions = new Map()
    for (const gender of ['M','W']) order.filter(a => a.gender === gender).forEach((a, i) => positions.set(a.id, i + 1))
    const editions = new Map(allRaceEditionViews.map(e => [e.editionId,e]))
    // Replay historical selection against captured photo coverage after publication.
    const registry = photoBaseline?.registry ?? athletePhotosByName
    const images = photoBaseline ? new Map(photoBaseline.runtimeImages.map(a => [a.id, a.image])) : null
    if (images) assert.ok(athletes.every(a => images.has(a.id)), 'Incomplete photo baseline')
    const eligible = athletes.filter(a => !(images ? images.get(a.id) : a.image) && !registry[a.nameEn] && !exclusions.has(a.nameEn)).map(a => {
      const rows = linked.filter(r => r.athleteId === a.id), rankingPosition = positions.get(a.id) ?? null
      const priority = rankingPosition !== null && rankingPosition <= 100 ? 'TOP100' : (rankingPosition !== null && rankingPosition <= priorityRankLimit) || rows.length >= 5 ? 'OTHER_PRIORITY_A' : 'OTHER'
      return { athleteId:a.id,nameEn:a.nameEn,gender:a.gender,countryCode:a.countryCode??null,rankingPosition,rankingScore:scores.get(a.id)??null,resultRows:rows.length,seasons:[...new Set(rows.map(r=>editions.get(r.raceEditionId)?.year).filter(Boolean))].sort(),selectionPriority:priority }
    })
    const priority = { TOP100:0, OTHER_PRIORITY_A:1, OTHER:2 }
    const sorted = eligible.sort((a,b)=>priority[a.selectionPriority]-priority[b.selectionPriority] || (a.rankingPosition??Infinity)-(b.rankingPosition??Infinity) || b.resultRows-a.resultRows || a.nameEn.localeCompare(b.nameEn))
    const selected = ['M','W'].flatMap(g=>sorted.filter(a=>a.gender===g).slice(0,perGender))
    assert.equal(selected.length,perGender*2); assert.equal(new Set(selected.map(a=>a.athleteId)).size,perGender*2); assert.equal(new Set(selected.map(a=>a.nameEn)).size,perGender*2)
    assert.ok(selected.every(a=>a.selectionPriority!=='OTHER'),'Insufficient Priority A candidates; do not silently widen batch')
    return { schemaVersion:1,batchId,asOf:asOf.toISOString(),rankingSource:'src/utils/athleteRanking.ts: calculateAthleteRanking + sortAthletesByRanking; actual ranked members, 1-based within gender',selectionRule:`TOP100 without photo, then other Priority A (${priorityRankLimit>100?`TOP-${priorityRankLimit} or `:''}>=5 result rows); production rank ascending, result rows descending; ${perGender} per gender`,exclusions:[...exclusions],proof:{uniqueAthletes:perGender*2,runtimeCatalogProfiles:athletes.length,missingRuntimeOrProductionPhoto:true,excludedPilotIncluded:0,men:perGender,women:perGender,top100Men:selected.filter(a=>a.gender==='M'&&a.selectionPriority==='TOP100').length,top100Women:selected.filter(a=>a.gender==='W'&&a.selectionPriority==='TOP100').length,eligibleByGender:Object.fromEntries(['M','W'].map(g=>[g,sorted.filter(a=>a.gender===g&&a.selectionPriority!=='OTHER').length]))},athletes:selected }
  } finally { await server.close() }
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) console.log(JSON.stringify(await selectPhotoBatch2(),null,2))
