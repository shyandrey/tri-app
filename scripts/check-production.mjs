import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { checkDeployment } from './check-deployment.mjs'

const production = 'https://300w.app'
const sha = /^[a-f0-9]{40}$/i
const currentCommit = () => execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()

export function productionCheckArgs(args) {
  if (!args.length) return currentCommit()
  assert.ok(args.length === 2 && args[0] === '--expected-sha' && sha.test(args[1]),
    'Usage: npm run check:production -- --expected-sha <40-character SHA> (default: local HEAD)')
  return args[1]
}

export async function checkProduction(fetcher = fetch, expectedCommit = currentCommit()) {
  assert.match(expectedCommit, sha, 'Expected production SHA must be a full Git SHA')
  const result = await checkDeployment(production, fetcher)
  assert.match(result.health.commit, sha, 'Production health must report a full Git SHA')
  assert.equal(result.health.commit.toLowerCase(), expectedCommit.toLowerCase(), 'Production build SHA mismatch')
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { health, newsCount } = await checkProduction(fetch, productionCheckArgs(process.argv.slice(2)))
    console.log(`PRODUCTION PASS ${production}/api/health: version=${health.version} commit=${health.commit}`)
    console.log(`PRODUCTION PASS ${production}/api/news: ${newsCount} items`)
  } catch (error) {
    console.error(`PRODUCTION check failed (${production}): ${error.message}`)
    process.exitCode = 1
  }
}
