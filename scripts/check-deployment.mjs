import assert from 'node:assert/strict'

// Shared GET-only transport and response checks; callers own fixed origins.
export async function checkDeployment(origin, fetcher = fetch) {
  const read = async path => {
    const response = await fetcher(origin + path, {
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
