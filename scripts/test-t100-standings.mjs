import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {spawnSync} from 'node:child_process'
import {createServer} from 'vite'
import {buildStandings, fixtureUrl, liveFixtureUrl, serialize} from './prepare-t100-standings.mjs'

const approved = JSON.parse(await fs.readFile(fixtureUrl, 'utf8'))
const registry = Object.fromEntries(await Promise.all(approved.tables.map(async t => [t.file, JSON.parse(await fs.readFile(`src/data/officialStandings/t100/${t.file}`, 'utf8'))])))
const live = JSON.parse(await fs.readFile(liveFixtureUrl, 'utf8'))
const norm = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '')

test('six tables, sixty exact approved rows, ranks/order/ties and provenance preserved', () => {
  assert.equal(Object.keys(registry).length, 6)
  assert.equal(Object.values(registry).flatMap(t => t.rows).length, 60)
  for (const t of approved.tables) {
    const got = t.seasonYear===2026 ? buildStandings(approved)[t.file] : registry[t.file]
    assert.deepEqual(got.rows.map(r => [r.officialRank, r.athleteName, r.nationality, r.nationalityNormalized, r.officialPoints, r.athleteId]), t.rows)
    assert.equal(new Set(got.rows.map(r => r.athleteId)).size, 10)
    assert.deepEqual(got.rows.map(r => r.officialRank), [1,2,3,4,5,6,7,8,9,10])
    assert.equal(got.seasonStatus, t.seasonYear === 2026 ? 'LIVE' : 'HISTORICAL_FINAL_PENDING_CONFIRMATION')
    assert.equal(got.provenance.candidateSha256, t.candidateSha256)
    assert.equal(got.coverage, 'TOP_10_ONLY')
    for (const r of got.rows) {
      assert.equal(r.sourceUrl, t.sourceUrl)
      assert.equal(r.sourceObservedAt, null)
      assert.equal(r.verifiedAt, t.verifiedAt)
      assert.equal(r.provenance.screenshotSha256, t.sourceScreenshot.sha256)
      assert.equal(r.provenance.screenshotPath, t.sourceScreenshot.file)
      assert.deepEqual(r.provenance.ownerApprovedCorrection, t.corrections[String(r.officialRank)])
    }
  }
})

test('offline deterministic replay exactly reproduces checked-in registry without input mutation', async () => {
  const original = serialize(approved)
  const first = buildStandings(approved,live), second = buildStandings(approved,live)
  assert.deepEqual(first, second)
  assert.equal(serialize(approved), original)
  for (const [file, value] of Object.entries(first)) assert.equal(serialize(value), await fs.readFile(`src/data/officialStandings/t100/${file}`, 'utf8'))
})

test('sixty identities match current catalog, approved PTO URLs, nationality and gender', async () => {
  const mappings = JSON.parse(await fs.readFile('src/data/athletes/ptoProfileMappings.json', 'utf8')).mappings
  const server = await createServer({server: {middlewareMode: true, hmr: false, watch: null}, appType: 'custom', logLevel: 'silent'})
  try {
    const d = await server.ssrLoadModule('/src/sports/data.ts')
    assert.equal(new Set(d.athletes.map(a => a.id)).size, 1170)
    assert.equal(d.linkedRaceResults.length, 4633)
    const seenNames = new Map()
    for (const t of Object.values(registry)) for (const r of t.rows) {
      const athlete = d.athletes.find(a => a.id === r.athleteId)
      const mapping = mappings.find(m => m.id === r.athleteId)
      assert.ok(athlete && mapping)
      assert.equal(norm(athlete.nameEn), norm(r.athleteName))
      assert.equal(norm(mapping.name), norm(r.athleteName))
      assert.equal(mapping.approvedBy, 'owner')
      assert.equal(athlete.countryCode, r.nationalityNormalized)
      assert.equal(athlete.gender, t.gender)
      assert.ok(d.linkedRaceResults.some(x => x.athleteId === r.athleteId))
      if (seenNames.has(r.athleteName)) assert.equal(seenNames.get(r.athleteName), r.athleteId)
      seenNames.set(r.athleteName, r.athleteId)
    }
  } finally {await server.close()}
})

test('regressions: corrected athletes, points, closed rows and ties', () => {
  const a = registry['2024-men.json'].rows, b = registry['2025-men.json'].rows
  assert.deepEqual([a[5].athleteId,a[5].officialPoints], [22,90])
  assert.deepEqual([b[6].athleteId,b[7].athleteId,b[7].officialPoints,b[8].athleteId,b[9].athleteId,b[9].officialPoints], [13,9,106,12,16,90])
  assert.deepEqual(b.slice(0,2).map(r => [r.athleteId,r.officialPoints]), [[3,195],[4,150]])
  assert.deepEqual(a.slice(7,9).map(r => [r.officialRank,r.officialPoints]), [[8,83],[9,83]])
  assert.equal(registry['2026-men.json'].rows[5].athleteId, 4)
})

for (const [label, mutate] of [
  ['duplicate table', x => {x.tables[1] = structuredClone(x.tables[0])}],
  ['duplicate athlete', x => {x.tables[0].rows[1][5] = x.tables[0].rows[0][5]}],
  ['invalid rank', x => {x.tables[0].rows[0][0] = 2}],
  ['invented FINAL', x => {x.tables[0].seasonStatus = 'FINAL'}],
  ['cross-season conflict', x => {x.tables[2].rows[5][1] = 'Wrong Name'}],
]) test(`rejects ${label}`, () => {const x = structuredClone(approved); mutate(x); assert.throws(() => buildStandings(x))})

test('live TOP10 exactly matches official HTML ranks, names, points, flags and profile links',async()=>{
 for(const t of live.tables){
  const html=await fs.readFile(t.snapshot,'utf8')
  assert.equal(createHash('sha256').update(html).digest('hex'),t.snapshotSha256)
  assert.ok(html.includes('<h1>2026 Standings</h1>'))
  const cards=html.split('<div class="trow">').slice(1,11)
  assert.equal(cards.length,10)
  for(const [i,card] of cards.entries()){
   const r=t.rows[i]
   assert.equal(Number(card.match(/class="ranking-number">(\d+)</)[1]),r.officialRank)
   assert.equal(Number(card.match(/class="points">(\d+)</)[1]),r.officialPoints)
   const name=card.match(/<div class="name">([\s\S]*?)<\/a>/)[1]
   assert.ok(name.includes('flag-icon-'+r.nationalityNormalized.toLowerCase()))
   assert.ok(name.includes('href="'+r.athleteSourceUrl.replace('https://stats.protriathletes.org','')+'"'))
   const text=name.slice(name.indexOf('<a ')).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()
   assert.equal(text,r.athleteName)
  }
  assert.deepEqual(registry[t.file].rows.map(({officialRank,athleteName,nationality,nationalityNormalized,officialPoints,athleteSourceUrl,athleteId})=>({officialRank,athleteName,nationality,nationalityNormalized,officialPoints,athleteSourceUrl,athleteId})),t.rows)
 }
 assert.deepEqual(registry['2026-women.json'].rows.slice(7,9).map(r=>[r.officialRank,r.officialPoints]),[[8,41],[9,41]])
})
test('historical seasons, athlete catalog, results and TRI formula unchanged',()=>{
 const paths=['src/data/officialStandings/t100/2024-men.json','src/data/officialStandings/t100/2024-women.json','src/data/officialStandings/t100/2025-men.json','src/data/officialStandings/t100/2025-women.json','src/data/officialStandings/ironman','src/data/athletes','src/data/results','src/utils/athleteRanking.ts']
 const r=spawnSync('git',['diff','--exit-code','c329af8f15fb14c40f393d3652f700cf9868a904','--',...paths],{encoding:'utf8'});assert.equal(r.status,0,r.stdout)
})
for(const [label,mutate] of [['duplicate',x=>{x.tables[0].rows[1].athleteId=x.tables[0].rows[0].athleteId}],['missing points',x=>{x.tables[0].rows[0].officialPoints=null}],['wrong order',x=>{x.tables[0].rows[0].officialRank=2}]])test('live rejects '+label,()=>{const x=structuredClone(live);mutate(x);assert.throws(()=>buildStandings(approved,x))})
