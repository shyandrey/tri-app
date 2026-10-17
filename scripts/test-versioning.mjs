import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { parseChangelog } from './release-notes.mjs'
import { buildMetadata } from '../src/utils/buildMetadata.ts'
import { currentRelease } from '../.generated/current-release.ts'
import worker from '../worker/index.ts'
const pkg = JSON.parse(await fs.readFile('package.json','utf8'))
const lock = JSON.parse(await fs.readFile('package-lock.json','utf8'))
const text = await fs.readFile('CHANGELOG.md','utf8')
// Independent synthetic history: never concatenate fixtures with repository release history.
const unreleased = '# Fixture\n\n## [Unreleased]\nTitle: Pending fixture\n### Changed\n- Pending item.\n'
const entry = (version, date) => `\n## [${version}] — ${date}\nTitle: Fixture ${version}\nSHA: ${'a'.repeat(40)}\nTag: v${version}\n### Added\n- Item ${version}.\n`
const published = unreleased + entry('1.1.0','2027-03-01') + entry('1.0.1','2027-02-01') + entry('1.0.0','2027-01-01')
test('package, lockfile root and root package versions agree', () => {
  assert.equal(lock.version,pkg.version)
  assert.equal(lock.packages[''].version,pkg.version)
})
test('package, generated UI metadata, release notes and actual health agree', async () => {
  assert.equal(buildMetadata.version,pkg.version)
  assert.deepEqual(currentRelease,parseChangelog(text,pkg.version))
  const response = await worker.fetch(new Request('https://local.example/api/health'),{})
  assert.equal((await response.json()).version,currentRelease.version)
  const ui = await fs.readFile('src/pages/MorePage.tsx','utf8')
  assert.match(ui,/Версия \{buildMetadata.version\}/)
  assert.match(ui,/currentRelease.sections.map/)
})
test('0.0.0 selects Unreleased, even when published history exists', () => {
  for (const fixture of [unreleased,published]) {
    const result = parseChangelog(fixture,'0.0.0')
    assert.equal(result.unpublished,true)
    assert.equal(result.version,'0.0.0')
    assert.equal(result.title,'Pending fixture')
    assert.deepEqual(result.sections,[{heading:'Changed',items:['Pending item.']}])
  }
})
for (const version of ['1.0.0','1.0.1','1.1.0']) {
  test(`${version} selects only matching published release, including symbolic SHA`, () => {
    const release = parseChangelog(published,version)
    assert.equal(release.version,version)
    assert.equal(release.title,`Fixture ${version}`)
    assert.equal(release.unpublished,false)
    assert.deepEqual(release.sections,[{heading:'Added',items:[`Item ${version}.`]}])
    const symbolic = published.replace(`SHA: ${'a'.repeat(40)}\nTag: v${version}`,`SHA: tag:v${version}\nTag: v${version}`)
    assert.deepEqual(parseChangelog(symbolic,version),release)
  })
}
test('missing current release is rejected without fallback to Unreleased or another release', () => {
  assert.throws(()=>parseChangelog(unreleased,'1.0.0'),/No notes for package version/)
  assert.throws(()=>parseChangelog(published,'1.2.0'),/No notes for package version/)
})
test('duplicate releases and duplicate Unreleased are rejected', () => {
  assert.throws(()=>parseChangelog(published+entry('1.0.0','2027-01-01'),'1.0.0'),/duplicate release heading/)
  assert.throws(()=>parseChangelog(unreleased+unreleased.slice(unreleased.indexOf('## ')),'0.0.0'),/duplicate release heading/)
})
test('notes generation is deterministic and does not retain mutable state between calls', () => {
  for (const [fixture,version] of [[unreleased,'0.0.0'],[published,'1.1.0'],[text,pkg.version]]) {
    const first = parseChangelog(fixture,version)
    const bytes = JSON.stringify(first)
    first.sections[0].items.push('Local mutation')
    assert.equal(JSON.stringify(parseChangelog(fixture,version)),bytes)
    assert.equal(JSON.stringify(parseChangelog(fixture,version)),bytes)
  }
})
test('invalid provenance, dates, ordering and syntax are rejected', () => {
  for (const invalid of [published.replace('Tag: v1.1.0','Tag: v2.0.0'),published.replace(/SHA: a+\n/,''),published.replace('2027-03-01','2027-02-30'),published+entry('0.9.0','2027-04-01'),unreleased.replace('### Changed','### Unsupported'),unreleased.replace('Title:','<script>'),unreleased.replace('## [Unreleased]','## [0.0.0]'),unreleased+'\nSHA: '+'a'.repeat(40)]) {
    assert.throws(()=>parseChangelog(invalid,'0.0.0'))
  }
})
