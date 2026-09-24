import { createServer } from 'vite'
import { createHash } from 'node:crypto'

export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
export async function loadPhotoRuntime(asOf = new Date()) {
  const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
  try {
    const catalog = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const { athletePhotosByName } = await server.ssrLoadModule('/src/data/athletes/athletePhotos.generated.ts')
    const { raceResults } = await server.ssrLoadModule('/src/data/results/index.ts')
    const { allRaceEditionViews } = await server.ssrLoadModule('/src/data/raceEditions.ts')
    const { linkResultsToAthletes } = await server.ssrLoadModule('/src/utils/raceResults.ts')
    const { calculateAthleteRanking, sortAthletesByRanking } = await server.ssrLoadModule('/src/utils/athleteRanking.ts')
    const types = new Map([
      ...[...catalog.maleAthletes, ...catalog.femaleAthletes].map(a => [a.id, 'curated']),
      ...catalog.resultAthletes.map(a => [a.id, 'generated']),
      ...catalog.verifiedResultAthletes.map(a => [a.id, 'verified generated']),
    ])
    const linked = linkResultsToAthletes(raceResults)
    return {
      athletes: catalog.athletes.map(a => ({ ...a, catalogType: types.get(a.id) })),
      registry: athletePhotosByName,
      invariants: {
        asOf: asOf.toISOString(),
        rankingOrder: digest(sortAthletesByRanking(catalog.athletes, linked, allRaceEditionViews, asOf).map(a => a.id)),
        rankingScores: digest(calculateAthleteRanking(catalog.athletes, linked, allRaceEditionViews, asOf)),
        resultLinkage: digest(linked), registry: digest(athletePhotosByName),
      },
    }
  } finally { await server.close() }
}
