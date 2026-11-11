import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createHash } from 'node:crypto'

// Baseline 00a0488: previous bio values and owner-approved source identities.
// Pin both the mapping and each source; no factual text is generated here.
const fixture = fs.readFileSync('scripts/fixtures/approved-athlete-biographies.json')
assert.equal(createHash('sha256').update(fixture).digest('hex'), 'cb6ea3ac2ba3513cc4a05f4161aa8476feb1df39470d51d640efb9767a0988af')
const kateFixture = fs.readFileSync('scripts/fixtures/approved-kate-waugh-biography.json')
assert.equal(createHash('sha256').update(kateFixture).digest('hex'), '1e7382a3a733cea2b1eedb964137593176e031a39980d96b1931e49029b89d1e')
const originalRows = JSON.parse(fixture)
assert.equal(originalRows.length, 57)
const kate = JSON.parse(kateFixture)
assert.equal(kate.id, 101)
assert.equal(kate.nameEn, 'Kate Waugh')
export const approvedBiographies = [...originalRows, kate].map(row => {
  const source = fs.readFileSync(`docs/athlete-bios/approved/${row.file}`)
  assert.equal(createHash('sha256').update(source).digest('hex'), row.sha256, row.file)
  const sections = source.toString('utf8').split('## Биография\n\n')
  assert.equal(sections.length, 2, row.file)
  const bio = sections[1].split('\n\n## ')[0]
  assert.ok(bio.length > 0)
  if (row.id === 101) assert.equal(bio.split('\n\n').length, 7)
  return { ...row, bio }
})
assert.equal(approvedBiographies.length, 58)
assert.equal(new Set(approvedBiographies.map(row => row.id)).size, 58)
const byId = new Map(approvedBiographies.map(row => [row.id, row]))

// First validate the exact approved replacement, then project ONLY its bio field
// for the unchanged historical full-profile hash. All other fields stay protected.
export function projectHistoricalBiographies(catalog) {
  for (const row of approvedBiographies) {
    const matches = catalog.filter(a => a.id === row.id)
    assert.equal(matches.length, 1, `Biography identity ${row.id}`)
    assert.equal(matches[0].nameEn, row.nameEn, `Biography Latin identity ${row.id}`)
    assert.equal(matches[0].bio, row.bio, `Exact approved biography ${row.id}`)
  }
  return catalog.map(athlete => {
    const row = byId.get(athlete.id)
    if (!row) return athlete
    const projected = { ...athlete }
    if (row.previousBio === null) delete projected.bio
    else projected.bio = row.previousBio
    return projected
  })
}
