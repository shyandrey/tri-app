import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'silent' })
const { athletes } = await server.ssrLoadModule('/src/data/athletes/index.ts')
const { reviewedAthletePhoto } = await server.ssrLoadModule('/src/data/athletes/photoReview.ts')
const { default: Detail } = await server.ssrLoadModule('/src/pages/AthleteDetailPage.tsx')
await server.close()

test('Franzi 172 rejects the known Sailfish association, including after registry regeneration', () => {
  const athlete = athletes.find(a => a.id === 172)
  assert.equal(athlete.nameEn, 'Franzi Hofmann')
  assert.equal(athlete.countryCode, 'DE')
  assert.equal(athlete.image, undefined)
  assert.equal(reviewedAthletePhoto(172, '/athletes/franzi-hofmann.png'), undefined)
  assert.equal(reviewedAthletePhoto(172, '/athletes/future-verified-portrait.webp'), '/athletes/future-verified-portrait.webp')
  assert.equal(reviewedAthletePhoto(1, '/athletes/other.png'), '/athletes/other.png')
})

test('Franzi renders existing initials placeholder instead of an image', () => {
  const html = renderToStaticMarkup(createElement(Detail, {
    athlete: athletes.find(a => a.id === 172), results: [], races: [],
    onBack() {}, onNavigate() {}, onRaceClick() {},
  }))
  assert.match(html, /athlete-detail__image--placeholder/)
  assert.match(html, /No photo for Franzi Hofmann/)
  assert.match(html, /<span>FH<\/span>/)
  assert.doesNotMatch(html, /franzi-hofmann|<img/)
})
