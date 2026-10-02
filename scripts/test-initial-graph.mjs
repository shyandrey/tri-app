import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'vite'
import { gzipSync } from 'node:zlib'

const heavy = /\/src\/(?:data\/(?:athletes\/|athleteIdentity\.|results\/)|utils\/(?:athleteRanking|rankingDatasetClock)|pages\/(?:AthletesPage|AthleteDetailPage|RaceDetailPage)|sports\/(?:data|SportsArea|sports-entry)\.)/
function initialGraph(chunks) {
  const required = new Map()
  function visit(chunk) {
    if (!chunk || required.has(chunk.fileName)) return
    required.set(chunk.fileName, chunk)
    for (const name of chunk.imports) visit(chunks.find(c => c.fileName === name))
  }
  chunks.filter(c => c.isEntry).forEach(visit)
  return [...required.values()]
}
function checkGraph(chunks) {
  const initial = initialGraph(chunks)
  const leaked = initial.flatMap(c => Object.keys(c.modules)).filter(id => heavy.test(id.replaceAll('\\', '/')))
  assert.deepEqual(leaked, [], 'Sports modules must never be in the initial static dependency closure')
  return initial
}
test('production Home graph excludes sports data/UI/ranking and stays below 300 KB total JS', async () => {
  const built = await build({ logLevel: 'silent', build: { write: false } })
  const outputs = (Array.isArray(built) ? built : [built]).flatMap(b => b.output)
  const chunks = outputs.filter(o => o.type === 'chunk')
  const initial = checkGraph(chunks)
  // This guard must examine real module identities, not just small entry filenames.
  assert.throws(() => checkGraph([{ fileName: 'index.js', isEntry: true, imports: ['hidden.js'], modules: {} },
    { fileName: 'hidden.js', imports: [], modules: { '/src/data/athletes/resultAthletes.generated.ts': {} } }]))
  assert.ok(chunks.some(c => !initial.includes(c) && Object.keys(c.modules).some(id => id.includes('/data/results/'))))
  const total = initial.reduce((n, c) => n + Buffer.byteLength(c.code), 0)
  assert.ok(total <= 300_000, `initial required JS is ${total} bytes`)
  console.log(JSON.stringify({ totalInitialRaw: total, totalInitialGzip: initial.reduce((n,c)=>n+gzipSync(c.code).length,0), initialRequests: initial.length,
    chunks: chunks.map(c => ({ name: c.fileName, initial: initial.includes(c), raw: Buffer.byteLength(c.code), gzip: gzipSync(c.code).length, imports: c.imports, dynamic: c.dynamicImports })),
    css: outputs.filter(o => o.type === 'asset' && o.fileName.endsWith('.css')).map(c=>({ name:c.fileName,raw:Buffer.byteLength(c.source),gzip:gzipSync(c.source).length })) },null,2))
})
