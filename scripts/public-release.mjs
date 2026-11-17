import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'

// The digest detects stale approval after an edit; it is not an owner signature.
export function publicReleaseDigest({version, description}) {
  return createHash('sha256').update(JSON.stringify({version, description})).digest('hex')
}
export function validatePublicRelease(record, version) {
  assert.ok(record && typeof record === 'object', 'Missing public release metadata')
  assert.deepEqual(Object.keys(record).sort(), ['approval', 'description', 'version'], 'Unexpected public release fields')
  assert.match(record.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
  assert.equal(record.version, version, 'Public release version must match package version; request owner approval')
  assert.ok(typeof record.description === 'string' && record.description.trim() === record.description && record.description.length > 0 && record.description.length <= 500, 'Invalid public description')
  assert.equal(record.approval?.status, 'approved', 'Explicit owner approval required')
  assert.ok(typeof record.approval.reference === 'string' && record.approval.reference.trim(), 'Owner approval evidence reference required')
  assert.equal(record.approval.sha256, publicReleaseDigest(record), 'Public text changed since approval; request owner approval')
  return {version: record.version, description: record.description}
}
