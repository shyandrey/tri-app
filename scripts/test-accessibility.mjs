import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

test('cards have one named native action; desktop result actions require a linked profile', async () => {
  const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom', logLevel: 'silent' })
  try {
    const { default: RaceCard } = await server.ssrLoadModule('/src/components/RaceCard.tsx')
    const { default: Athletes } = await server.ssrLoadModule('/src/pages/AthletesPage.tsx')
    const { default: Results } = await server.ssrLoadModule('/src/components/RaceResultsTable.tsx')
    const render = (component, props) => renderToStaticMarkup(React.createElement(component, props))
    const noop = () => {}
    const race = { name: 'Fixture race', date: '5 октября', city: 'City', country: 'Country', distance: 'T100', series: 'Triathlon World Tour' }
    const card = render(RaceCard, { ...race, onClick: noop })
    assert.equal((card.match(/<button /g) ?? []).length, 1)
    assert.match(card, /type="button" class="card-navigation-target" aria-label="Открыть гонку: Fixture race, 5 октября"/)
    assert.ok(!render(RaceCard, race).includes('<button'))
    const athlete = { id: 1, name: 'Тестовое Имя', nameEn: 'Fixture Athlete', gender: 'M', country: 'Страна', countryCode: 'US' }
    const list = render(Athletes, { athletes: [athlete], ranking: [], onBack: noop, onNavigate: noop, onAthleteClick: noop })
    const article = list.match(/<article\b[\s\S]*?<\/article>/)[0]
    assert.equal((article.match(/<button /g) ?? []).length, 1)
    assert.match(article, /aria-label="Открыть профиль: Тестовое Имя \/ Fixture Athlete"/)
    const results = [
      { id: 1, athleteId: 1, athleteName: 'Raw linked', gender: 'M', position: 1, totalTime: '1:00:00' },
      { id: 2, athleteId: 999, athleteName: 'Unlinked', gender: 'M', position: 2, totalTime: '1:01:00' },
    ]
    const html = render(Results, { athletes: [athlete], results, onAthleteClick: noop })
    const body = html.match(/<tbody>([\s\S]*?)<\/tbody>/)[1]
    const rows = body.match(/<tr\b[\s\S]*?<\/tr>/g)
    assert.equal(rows.length, 2)
    assert.equal((body.match(/<button /g) ?? []).length, 1)
    assert.match(rows[0], /<button type="button" class="results-table__profile"><strong>Тестовое Имя/)
    assert.ok(!rows[1].includes('<button') && !rows[1].includes('is-clickable') && !rows[1].includes('tabindex'))
    assert.match(rows[1], /<strong>Unlinked<\/strong>/)
    assert.match(await fs.readFile('index.html', 'utf8'), /<html lang="ru">/)
  } finally { await server.close() }
})
