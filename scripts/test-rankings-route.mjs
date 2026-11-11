import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('isolated Rankings entry preserves canonical identities and exact existing markup for every selection', async () => {
  const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
  const random = Math.random
  try {
    const isolated = await server.ssrLoadModule('/src/sports/rankings-entry.ts')
    const existing = await server.ssrLoadModule('/src/sports/sports-entry.ts')
    const { athletes } = await server.ssrLoadModule('/src/data/athletes/index.ts')
    const { NavigationContext } = await server.ssrLoadModule('/src/navigation/usePageState.ts')
    const before = JSON.stringify(athletes)
    for (const id of [...athletes.map(a => String(a.id)), undefined, 'unknown-athlete']) {
      assert.equal(isolated.hasAthlete(id), existing.hasAthlete(id), String(id))
    }
    const props = { route: { page: 'rankings' }, navigate() {}, back() {} }
    for (const series of ['IRONMAN_PRO_SERIES', 'T100']) for (const season of [2024, 2025, 2026]) for (const gender of ['M', 'W']) for (let scene = 0; scene < 4; scene++) {
      Math.random = () => scene / 4
      const value = { current: { ui: { officialStandings: { series, season, gender } } } }
      const render = component => renderToStaticMarkup(createElement(NavigationContext.Provider, { value }, createElement(component, props)))
      assert.equal(render(isolated.default), render(existing.default), `${series}/${season}/${gender}/scene ${scene}`)
    }
    assert.equal(JSON.stringify(athletes), before, 'rendering must not mutate the canonical catalog')
  } finally { Math.random = random; await server.close() }
})
