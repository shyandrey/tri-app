import assert from 'node:assert/strict'
import seasons from '../season.config.json' with { type: 'json' }

// Explicit release environment selects a fixed reviewed profile, never the date/hostname.
export function releaseSeason(environment, requested) {
  assert.ok(['preview', 'production'].includes(environment), 'Explicit release environment required')
  const profile = environment === 'preview' ? 'preview2027' : 'production'
  assert.equal(requested ?? profile, profile, 'Season profile/environment mismatch')
  const primarySeason = seasons[profile]
  assert.ok(Number.isInteger(primarySeason) && [2026, 2027].includes(primarySeason), 'Unsupported configured season')
  return { profile, primarySeason }
}
export function releaseBuildArgs(environment, requested) {
  const { profile } = releaseSeason(environment, requested)
  return profile === 'preview2027' ? ['run', 'build', '--', '--mode', 'season2027-preview'] : ['run', 'build']
}
export function assertReleaseSeason(marker, environment, requested) {
  assert.deepEqual(marker, releaseSeason(environment, requested), 'Built season profile mismatch')
  return marker
}
