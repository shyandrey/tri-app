// Delivery derivatives only. Uses Sharp already present in the existing toolchain.
// Do not substitute loose historical PNGs: their artwork differs from current delivery.
import fs from 'node:fs/promises'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import sharp from 'sharp'

const sources = {
  ironman: 'e5ea491fc704f476952a1fd2566b126aec5a3a8d5c665bf3657c0d54b8f5cc8a',
  t100: 'd7085b43b19b4ee8b9865a1dbe1e8621d09e79ec2948485e91bd1dceba947cbc',
}
const directory = 'public/images/showcase/rankings/optimized'
// Verify every source before writing any derivative. Original bytes are never overwritten.
for (const [series, sha] of Object.entries(sources)) {
  const bytes = await fs.readFile(`${directory}/${series}_04_transition.webp`)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), sha, `Unexpected ${series} source`)
}
for (const series of Object.keys(sources)) {
  for (const format of ['webp', 'avif']) {
    await sharp(`${directory}/${series}_04_transition.webp`)
      .resize({ width: 1320, withoutEnlargement: true })
      [format]({ quality: format === 'webp' ? 85 : 65, effort: 6 })
      .toFile(`${directory}/${series}_04_transition-1320.${format}`)
  }
}
console.log('Generated four compact derivatives; verify against scripts/fixtures/rankings-compact-artwork.json')
