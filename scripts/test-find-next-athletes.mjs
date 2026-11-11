import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
const script = path.resolve('scripts/find-next-athletes.mjs')
const realCatalog = path.resolve('src/data/athletes/resultAthletes.generated.ts')

test('CLI safety and generation use isolated synthetic catalog and temporary output only', async () => {
  const original = await fs.readFile(realCatalog)
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'tri-discovery-'))
  const existing = [{ id: 10041, nameEn: 'Existing Athlete', name: 'Existing Athlete', gender: 'M' }]
  const source = `export const resultAthletes = [\n${existing.map(a => JSON.stringify(a)).join(',\n')}\n]\n`
  const put = async (file, text) => { const p = path.join(root, file); await fs.mkdir(path.dirname(p), { recursive: true }); await fs.writeFile(p, text) }
  const invoke = args => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: 'utf8', timeout: 30000 })
  const ok = args => { const r = invoke(args); assert.equal(r.status, 0, r.stderr); return r.stdout }
  const output = path.join(root, 'output.ts')
  const result = { athleteName: 'New Athlete', gender: 'M', countryCode: 'US', raceEditionId: 'fixture' }
  try {
    await put('src/data/athletes/resultAthletes.generated.ts', source)
    await put('src/data/athletes/index.ts', `export const athletes = ${JSON.stringify(existing)}`)
    for (const [file, name] of [['men', 'maleAthletes'], ['women', 'femaleAthletes'], ['verifiedResultAthletes', 'verifiedResultAthletes']]) await put(`src/data/athletes/${file}.ts`, `export const ${name} = []`)
    for (const file of ['countryEnrichment', 'athleteLocalization']) await put(`src/data/athletes/${file}.json`, '{}')
    await put('src/data/results/index.ts', `export const raceResults = ${JSON.stringify([result])}`)
    assert.match(ok([]), /Uncatalogued normalized identities found in runtime results: 1/)
    await assert.rejects(fs.access(output))
    assert.equal(await fs.readFile(path.join(root, 'src/data/athletes/resultAthletes.generated.ts'), 'utf8'), source)
    for (const args of [['--write'], ['--write', '--append', '--full-regenerate'], ['--unknown'], ['--write', '--append', '--typo'], ['--append'], ['--full-regenerate'], ['--output'], ['--write', '--write', '--append']]) {
      const r = invoke(args)
      assert.notEqual(r.status, 0, args.join(' '))
      await assert.rejects(fs.access(output))
      assert.equal(await fs.readFile(path.join(root, 'src/data/athletes/resultAthletes.generated.ts'), 'utf8'), source)
    }
    assert.match(ok(['--write', '--append', '--output', output]), /Appended 1/)
    const appended = await fs.readFile(output, 'utf8')
    assert.ok(appended.startsWith(source.slice(0, -2)), 'all existing source records/IDs preserved verbatim')
    assert.match(appended, /"id":10042/)
    const review = JSON.parse(await fs.readFile(output + '.localization-review.json', 'utf8'))
    assert.equal(review.length, 1)
    assert.equal(review[0].nameEn, result.athleteName)
    assert.equal(review[0].status, 'LOCALIZATION_REVIEW_REQUIRED')
    assert.equal(review[0].blocking, false)
    assert.equal(review[0].athleteId, JSON.parse(appended.split('\n').filter(line=>line.includes('New Athlete'))[0].trim().replace(/,$/, '')).id)
    assert.match(ok(['--write', '--full-regenerate', '--output', output]), /Wrote 1/)
    assert.match(await fs.readFile(output, 'utf8'), /id: 10000/)
    await put('src/data/athletes/athleteLocalization.json', JSON.stringify({'New Athlete':'Новый Атлет'}))
    ok(['--write', '--append', '--output', output])
    assert.match(await fs.readFile(output, 'utf8'), /Новый Атлет/)
    assert.match(await fs.readFile(output, 'utf8'), /"nameEn":"New Athlete"/)
    assert.deepEqual(JSON.parse(await fs.readFile(output + '.localization-review.json', 'utf8')), [])
    for (const conflict of [{ ...result, gender: 'W' }, { ...result, countryCode: 'AU' }]) {
      await put('src/data/results/index.ts', `export const raceResults = ${JSON.stringify([result, conflict])}`)
      const before = await fs.readFile(output)
      const r = invoke(['--write', '--append', '--output', output])
      assert.notEqual(r.status, 0)
      assert.match(r.stderr, /Ambiguous new identity/)
      assert.deepEqual(await fs.readFile(output), before)
    }
    assert.deepEqual(await fs.readFile(realCatalog), original)
  } finally { await fs.rm(root, { recursive: true, force: true }) }
})
