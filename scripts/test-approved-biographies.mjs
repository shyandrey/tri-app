import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createServer } from 'vite'
import { approvedBiographies, projectHistoricalBiographies } from './approved-biography-contract.mjs'
const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
const {athletes} = await server.ssrLoadModule('/src/data/athletes/index.ts')
const {withApprovedBiography} = await server.ssrLoadModule('/src/data/athletes/biographies.ts')
await server.close()

test('58 exact approved texts, unique identities and unchanged non-biography properties', () => {
  const registry = JSON.parse(fs.readFileSync('src/data/athletes/athleteBiographies.json'))
  assert.deepEqual(Object.keys(registry).map(Number).sort((a,b)=>a-b), approvedBiographies.map(r=>r.id).sort((a,b)=>a-b))
  const before = projectHistoricalBiographies(athletes)
  for (const [index, original] of before.entries()) {
    assert.deepEqual(withApprovedBiography(original), athletes[index])
    const {bio: oldBio, ...oldFields} = original
    const {bio: newBio, ...newFields} = athletes[index]
    assert.deepEqual(newFields, oldFields)
    if (!registry[original.id]) assert.equal(newBio, oldBio)
  }
})
test('unmapped or mismatched identities cannot receive a biography', () => {
  const original = {id: 10, nameEn: 'Different athlete', bio: 'Keep', achievements: []}
  assert.strictEqual(withApprovedBiography(original), original)
  const absent = {...original,id:-1}
  assert.strictEqual(withApprovedBiography(absent), absent)
})
for (const mutation of ['id','nameEn','bio']) test(`approved biography guard rejects changed ${mutation}`, () => {
  const altered = structuredClone(athletes)
  altered.find(a=>a.id===10)[mutation] = mutation === 'id' ? -1 : 'Unexpected'
  assert.throws(()=>projectHistoricalBiographies(altered), assert.AssertionError)
})
test('paragraphs are preserved, including generated profiles and owner whitespace', () => {
  for (const row of approvedBiographies) {
    assert.deepEqual(athletes.find(a=>a.id===row.id).bio.split('\n\n'), row.bio.split('\n\n'))
  }
  assert.ok(athletes.find(a=>a.id===10).bio.includes('остаётся  футбольным'))
})

for (const mutation of ['id','nameEn','bio']) test(`Kate biography guard rejects changed ${mutation}`, () => {
  const altered = structuredClone(athletes)
  altered.find(a=>a.id===101)[mutation] = mutation === 'id' ? -1 : 'Unexpected'
  assert.throws(()=>projectHistoricalBiographies(altered), assert.AssertionError)
})
test('Kate identity mismatch preserves original profile', () => {
 const original = {id:101,nameEn:'Different athlete',bio:'Keep',achievements:[]}
 assert.strictEqual(withApprovedBiography(original),original)
})
