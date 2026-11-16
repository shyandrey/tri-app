// Shared digest contract for preparation and local application. No publication.
import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
export const digest = value => createHash('sha256').update(value).digest('hex')
export const json = value => JSON.stringify(value, null, 2) + '\n'
export function safePath(value) {
  assert.ok(typeof value === 'string' && value && !path.isAbsolute(value) && !value.includes('\\') && value.split('/').every(x => x && x !== '.' && x !== '..'), 'Unsafe relative path')
  return value
}
export async function readBundle(directory) {
  const manifest = JSON.parse(await fs.readFile(path.join(directory, 'bundle.json'), 'utf8'))
  assert.equal(manifest.schemaVersion, 1)
  const files = {}
  for (const [file, sha] of Object.entries(manifest.files)) {
    safePath(file)
    assert.ok((await fs.lstat(path.join(directory, file))).isFile(), 'Bundle symlink/non-file')
    const text = await fs.readFile(path.join(directory, file), 'utf8')
    assert.equal(digest(text), sha, 'Source/candidate digest mismatch: ' + file)
    files[file] = text
  }
  return {manifest, files}
}
export function verifyBundle(bundle) {
  assert.equal(bundle.manifest.schemaVersion, 1)
  assert.deepEqual(Object.keys(bundle.files).sort(), Object.keys(bundle.manifest.files).sort())
  for (const [f, sha] of Object.entries(bundle.manifest.files)) assert.equal(digest(bundle.files[safePath(f)]), sha, 'Source digest mismatch: ' + f)
}
export async function sealBundle(directory, files) {
  const hashes = {}
  for (const f of [...new Set(files)].sort()) hashes[safePath(f)] = digest(await fs.readFile(path.join(directory, f)))
  await fs.writeFile(path.join(directory, 'bundle.json'), json({schemaVersion:1, files:hashes}), {flag:'wx'})
}
