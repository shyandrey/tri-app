import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true, watch: null }, appType: 'custom', logLevel: 'silent' })
const [{ resolveRaceLocation }, { allRaceEditionViews, raceEditions }] = await Promise.all([
  server.ssrLoadModule('/src/utils/raceLocation.ts'),
  server.ssrLoadModule('/src/data/raceEditions.ts'),
])
await server.close()

test('Spain 2025/2026 retain shared identity and edition-specific venues', () => {
  for (const [year, city] of [[2025, 'Оропеса-дель-Мар'], [2026, 'Памплона']]) {
    const id = `t100-spain-${year}`
    const edition = raceEditions.find(r => r.id === id)
    const view = allRaceEditionViews.find(r => r.editionId === id)
    assert.equal(edition.raceId, 't100-spain')
    assert.equal(edition.city, city)
    assert.equal(view.city, city)
    assert.equal(view.country, 'Испания')
  }
})
test('approved 2027 Marbella venue overrides entity without mutating historical geography', () => {
  assert.equal(allRaceEditionViews.find(r => r.editionId === 't100-spain-2027').city, 'Марбелья')
  const entity = { city: 'Памплона', country: 'Испания' }
  const edition = { id: 't100-spain-2027', raceId: 't100-spain', city: 'Марбелья' }
  assert.deepEqual(resolveRaceLocation(edition, entity), { city: 'Марбелья', country: 'Испания' })
  assert.deepEqual(entity, { city: 'Памплона', country: 'Испания' })
})
test('legacy fallback and independent country override preserve other races', () => {
  const entity = { city: 'Лусаил', country: 'Катар' }
  assert.deepEqual(resolveRaceLocation({}, entity), entity)
  assert.deepEqual(resolveRaceLocation({ country: 'Испания' }, entity), { city: 'Лусаил', country: 'Испания' })
  for (const edition of raceEditions.filter(r => r.year < 2027 && r.raceId !== 't100-spain' && !r.raceId.includes('world-championship'))) {
    assert.equal(edition.city, undefined)
    assert.equal(edition.country, undefined)
  }
})
