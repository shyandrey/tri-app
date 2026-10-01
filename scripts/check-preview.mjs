import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'

const preview = 'https://preview.300w.app'

export async function checkPreview(fetcher = fetch) {
  const read = async path => {
    const response = await fetcher(preview + path, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Accept: 'application/json' },
    })
    assert.equal(response.status, 200, `${path}: HTTP ${response.status}`)
    assert.ok(response.headers.get('content-type')?.includes('application/json'), `${path}: expected JSON`)
    return response.json()
  }
  const [health, news] = await Promise.all([read('/api/health'), read('/api/news')])
  assert.equal(health.ok, true, 'health.ok')
  assert.equal(health.service, 'tri-app', 'health.service')
  assert.equal(typeof health.version, 'string', 'health.version')
  assert.equal(typeof health.commit, 'string', 'health.commit')
  assert.ok(Array.isArray(news.items), 'news.items must be an array (empty is valid)')
  return { health, newsCount: news.items.length }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { health, newsCount } = await checkPreview()
    console.log(`PASS ${preview}/api/health: version=${health.version} commit=${health.commit}`)
    console.log(`PASS ${preview}/api/news: ${newsCount} items`)
  } catch (error) {
    console.error(`Preview check failed: ${error.message}`)
    process.exitCode = 1
  }
}
