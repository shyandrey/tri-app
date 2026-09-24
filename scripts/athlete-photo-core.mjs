import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { MANUAL_PHOTO_NAMES, VERIFIED_NO_PHOTO_NAMES, PROFILE_SLUG_OVERRIDES, PROFILE_NAME_ALIASES, DUAL_SOURCE_PHOTOS } from './athlete-photo-policy.mjs'

export const ORIGIN = 'https://stats.protriathletes.org'
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')
export const slugify = v => v.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const normalizeName = s => s.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('en')
export const expectedProfileUrl = a => `${ORIGIN}/athlete/${encodeURI(PROFILE_SLUG_OVERRIDES[a.nameEn] ?? slugify(a.nameEn))}`
export function selectBatch(athletes, manifest) {
  if (manifest?.schemaVersion !== 1 || !manifest.batchId || !Array.isArray(manifest.athletes) || !manifest.athletes.length) throw new Error('Explicit nonempty v1 batch manifest required')
  const ids = new Set(), names = new Set()
  return manifest.athletes.map(row => {
    const matches = athletes.filter(a => a.id === row.athleteId && a.nameEn === row.nameEn && a.gender === row.gender)
    if (matches.length !== 1 || athletes.filter(a => a.nameEn === row.nameEn).length !== 1) throw new Error(`Exact identity mismatch: ${row.nameEn}`)
    if (ids.has(row.athleteId) || names.has(row.nameEn)) throw new Error('Duplicate batch identity')
    ids.add(row.athleteId); names.add(row.nameEn)
    return matches[0]
  })
}
export function decodeHtml(s) {
  return s.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => {
    const code = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)
    return code <= 0x10ffff ? String.fromCodePoint(code) : '\uFFFD'
  }).replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
}
const plain = s => decodeHtml(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
function attrs(tag) {
  const out = {}
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) out[m[1].toLowerCase()] = decodeHtml(m[2] ?? m[3] ?? m[4])
  return out
}
function profileKey(raw) {
  const u = new URL(raw)
  if (u.origin !== ORIGIN || u.username || u.password || u.search || u.hash || !/^\/athlete\/[^/]+\/?$/.test(u.pathname)) throw new Error('Not an exact Stats PTO athlete URL')
  return decodeURI(u.pathname).replace(/\/$/, '')
}
export function verifyProfile(athlete, response, aliases = PROFILE_NAME_ALIASES) {
  const evidence = [], expected = expectedProfileUrl(athlete)
  const reject = reason => ({ status: 'RETRY_UNRESOLVED', verifiedProfileUrl: null, evidence: [...evidence, reason] })
  if (response.error) return reject(response.error)
  if (response.status !== 200) return reject(`HTTP ${response.status}; not identity evidence`)
  try {
    if (profileKey(response.requestedUrl) !== profileKey(expected) || profileKey(response.finalUrl) !== profileKey(expected)) return reject('Unexpected profile path / redirect')
  } catch { return reject('Invalid final/requested profile URL') }
  const html = response.html
  const allowed = new Set([normalizeName(athlete.nameEn)])
  for (const alias of aliases[athlete.nameEn] ?? []) {
    if (!alias.name || !alias.sourceUrl?.startsWith('https://') || !alias.reason) return reject('Alias lacks documentation')
    allowed.add(normalizeName(alias.name))
  }
  const headings = [...html.matchAll(/<h[12]\b([^>]*)>([\s\S]*?)<\/h[12]>/gi)]
    .filter(m => /\bheadline\b/.test(attrs(m[1]).class ?? ''))
    .map(m => plain(m[2]))
  if (!headings.length || headings.some(n => !allowed.has(normalizeName(n)))) return reject('Missing, ambiguous or mismatched athlete headline')
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]))
  const titles = metas.filter(m => m.property === 'og:title').map(m => m.content ?? '')
  if (titles.length !== 1 || !titles[0].endsWith(' - Pro Triathlon Results | PTO') || !allowed.has(normalizeName(titles[0].replace(/ - Pro Triathlon Results \| PTO$/, '')))) return reject('Missing or conflicting profile title')
  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(m => m.rel === 'canonical')
  try { if (canonical.length !== 1 || profileKey(canonical[0].href) !== profileKey(expected)) return reject('Canonical profile URL mismatch') } catch { return reject('Invalid canonical URL') }
  evidence.push(`Exact final/canonical path: ${expected}`, `Profile headline: ${headings[0]}`, 'Profile title corroborates headline')
  if (response.redirectChain?.length) evidence.push('Only same-profile trailing-slash redirect allowed')
  if (PROFILE_SLUG_OVERRIDES[athlete.nameEn]) evidence.push(`Existing slug override: ${PROFILE_SLUG_OVERRIDES[athlete.nameEn]}`)
  if (normalizeName(headings[0]) !== normalizeName(athlete.nameEn)) evidence.push(`Documented alias: ${headings[0]}`)
  return { status: 'VERIFIED', verifiedProfileUrl: response.finalUrl, evidence }
}
// Discovery fetches HTML only. Redirects to another profile/origin are not followed.
export async function fetchProfile(url, { fetchImpl = fetch, timeoutMs = 15000, retries = 1 } = {}) {
  const requestedUrl = url
  const redirectChain = []
  for (let hop = 0; hop < 3; hop++) {
    let response
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        response = await fetchImpl(url, { redirect: 'manual', signal: AbortSignal.timeout(timeoutMs), headers: { accept: 'text/html', 'user-agent': 'TRI-App-photo-discovery/1.0' } })
        if ((response.status === 429 || response.status >= 500) && attempt < retries) {
          await response.body?.cancel(); await new Promise(resolve => setTimeout(resolve, 750)); continue
        }
        break
      } catch (e) {
        if (attempt === retries) return { requestedUrl, finalUrl: url, redirectChain, error: `Network: ${e.message}` }
      }
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) return { requestedUrl, finalUrl: url, redirectChain, error: 'Redirect missing Location' }
      const next = new URL(location, url).href
      redirectChain.push({ from: url, to: next, status: response.status })
      try { if (profileKey(next) !== profileKey(requestedUrl)) throw new Error('path changed') } catch { return { requestedUrl, finalUrl: next, redirectChain, error: 'Unexpected redirect; not followed' } }
      url = next; continue
    }
    if (response.status !== 200 || !(response.headers.get('content-type') ?? '').includes('text/html')) {
      await response.body?.cancel()
      return { requestedUrl, finalUrl: url, redirectChain, status: response.status, error: `HTTP ${response.status}; non-200 or non-HTML profile response (${response.headers.get('content-type') ?? 'missing content type'})` }
    }
    const reader = response.body.getReader(); const chunks = []; let length = 0
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break
        length += value.length
        if (length > 4_000_000) { await reader.cancel(); throw new Error('HTML size limit') }
        chunks.push(value)
      }
      return { requestedUrl, finalUrl: response.url || url, redirectChain, status: response.status, html: Buffer.concat(chunks).toString('utf8') }
    } catch (e) { return { requestedUrl, finalUrl: url, redirectChain, error: `HTML read: ${e.message}` } }
  }
  return { requestedUrl, finalUrl: url, redirectChain, error: 'Redirect limit' }
}
export function assetKey(raw) {
  const u = new URL(raw); u.hash = ''; u.search = ''
  // Group PTO responsive derivatives of the same UUID, not unrelated filenames.
  u.pathname = u.pathname.replace(/([0-9a-f]{8}-[0-9a-f-]{27,})(?:-w\d+|-o)?\.(png|jpe?g|webp|avif)$/i, '$1')
  return u.href
}
const generic = /(?:logo|icon|flag|placeholder|no[-_]?photo|default|avatar|silhouette|sponsor|background|banner|all-race-results|all-upcoming-races|world-rankings|t100-triathlon|ytimg)/i
export function discoverImages(html, profileUrl) {
  const found = new Map(), associations = new Map()
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const a = attrs(m[1]); if (!/\bathlete-pic-group\b/.test(a.class ?? '') || !a.href) continue
    let owner
    try { owner = new URL(a.href, profileUrl).href } catch { continue }
    for (const im of m[2].matchAll(/<img\b[^>]*>/gi)) {
      const data = attrs(im[0]); if (!data.src) continue
      try {
        const key = assetKey(new URL(data.src, profileUrl).href)
        associations.set(key, new Set([...(associations.get(key) ?? []), owner]))
      } catch { /* Unusable image URL is not a candidate. */ }
    }
  }
  function add(raw, kind, alt = '') {
    if (!raw) return
    try {
      const u = new URL(raw, profileUrl)
      if (u.protocol !== 'https:' || u.username || u.password) return
      const key = assetKey(u.href), owners = [...(associations.get(key) ?? [])]
      const selfPortrait = owners.some(o => { try { return profileKey(o) === profileKey(profileUrl) } catch { return false } })
      const otherPortrait = owners.some(o => { try { return profileKey(o) !== profileKey(profileUrl) } catch { return true } })
      const rejection = generic.test(u.href + ' ' + alt) ? 'generic/site/sponsor asset' : otherPortrait ? 'portrait linked to another athlete/head-to-head' : null
      const row = found.get(key) ?? { url: u.href, assetKey: key, score: 0, kinds: [], selfPortrait, otherPortrait, rejection, evidence: [] }
      row.kinds = [...new Set([...row.kinds, kind])]
      row.score = (selfPortrait ? 100 : 0) + (row.kinds.includes('og:image') ? 30 : 0) + (alt ? 5 : 0)
      row.rejection ||= rejection
      row.evidence = [selfPortrait ? 'Image inside athlete-pic-group linking to verified profile' : 'No explicit self-profile portrait link', ...row.kinds]
      found.set(key, row)
    } catch { /* Do not turn malformed metadata into an identity assertion. */ }
  }
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) { const a = attrs(m[0]); if (a.property === 'og:image') add(a.content, 'og:image') }
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) { const a = attrs(m[0]); add(a.src, 'img', a.alt); add(a['data-src'], 'lazy-img', a.alt) }
  return [...found.values()].sort((a, b) => b.score - a.score || a.url.localeCompare(b.url))
}
export function sharedAssets(records) {
  const owners = new Map()
  for (const r of records) for (const c of r.candidates) {
    owners.set(c.assetKey, new Set([...(owners.get(c.assetKey) ?? []), r.athlete.athleteId]))
  }
  return new Set([...owners].filter(([, ids]) => ids.size > 1).map(([key]) => key))
}
export function classify(candidates, shared) {
  const filtered = candidates.map(c => ({ ...c, rejection: c.rejection ?? (shared.has(c.assetKey) ? 'asset repeated on multiple batch profiles' : null) }))
  const usable = filtered.filter(c => !c.rejection)
  const associated = usable.filter(c => c.selfPortrait)
  const best = associated[0] ?? usable[0] ?? null
  // Conflicting self portraits never become HIGH, regardless of numeric score.
  const high = associated.length === 1 && best.kinds.includes('og:image') && usable.filter(c => c.kinds.includes('og:image')).length === 1
  const confidence = high ? 'HIGH' : associated.length || usable.some(c => c.kinds.includes('og:image')) ? 'MEDIUM' : usable.length ? 'LOW' : filtered.some(c => c.selfPortrait && c.rejection?.includes('repeated')) ? 'LOW' : 'NO_PHOTO'
  return { candidates: filtered, bestCandidateUrl: best?.url ?? null, confidence,
    proposedAction: confidence === 'HIGH' ? 'ACCEPT_FOR_MANUAL_REVIEW' : ['MEDIUM', 'LOW'].includes(confidence) ? 'REVIEW' : 'NO_PHOTO',
    evidence: [high ? 'Unique self-profile portrait agrees with og:image; HTML evidence only, not visual verification' : confidence === 'NO_PHOTO' ? 'Verified profile has no suitable image in supported HTML metadata' : 'Image association is incomplete/conflicting; numeric score is not identity proof', 'Shared filter covers only this explicit batch; no images downloaded'] }
}
export function photoProtection(a, registry, { refresh = false, replace = false } = {}) {
  const existing = a.image ?? registry[a.nameEn]
  const manual = MANUAL_PHOTO_NAMES.has(a.nameEn) || DUAL_SOURCE_PHOTOS.some(d => d.nameEn === a.nameEn)
  return { existing: existing ?? null, manual, publishAllowed: !existing || (refresh && replace), reason: existing ? (refresh && replace ? 'Replacement still requires explicit reviewed publish plan' : 'Existing/manual photo protected; refresh AND replace required') : 'No existing photo' }
}
export async function discoverBatch(targets, registry, options = {}) {
  const records = []
  for (const a of targets) {
    const athlete = { athleteId: a.id, nameEn: a.nameEn, gender: a.gender, countryCode: a.countryCode ?? null, catalogType: a.catalogType }
    const record = { athlete, checkedAt: new Date().toISOString(), requestedProfileUrl: expectedProfileUrl(a), verifiedProfileUrl: null, identityStatus: 'NOT_CHECKED', candidates: [], protection: photoProtection(a, registry, options) }
    if (VERIFIED_NO_PHOTO_NAMES.has(a.nameEn) && !options.recheck && !options.auditWeak) {
      records.push({ ...record, confidence: 'RETRY_UNRESOLVED', proposedAction: 'UNRESOLVED', bestCandidateUrl: null, evidence: ['Legacy no-photo skip; undated, not new evidence. Use explicit --recheck or --audit-weak.'] }); continue
    }
    let response
    try { response = await (options.fetchPage ?? fetchProfile)(record.requestedProfileUrl) } catch (e) { response = { error: e.message } }
    const identity = verifyProfile(a, response)
    record.identityStatus = identity.status; record.verifiedProfileUrl = identity.verifiedProfileUrl
    record.evidence = identity.evidence; record.redirectChain = response.redirectChain ?? []
    if (identity.status === 'VERIFIED') record.candidates = discoverImages(response.html, identity.verifiedProfileUrl)
    else Object.assign(record, { confidence: 'RETRY_UNRESOLVED', proposedAction: 'UNRESOLVED', bestCandidateUrl: null })
    records.push(record)
    if (options.delayMs) await new Promise(resolve => setTimeout(resolve, options.delayMs))
  }
  const shared = sharedAssets(records)
  return records.map(r => {
    if (r.identityStatus !== 'VERIFIED') return { ...r, imageCandidateCount: 0 }
    const decision = classify(r.candidates, shared)
    return { ...r, ...decision, imageCandidateCount: decision.candidates.filter(c => !c.rejection).length, evidence: [...r.evidence, ...decision.evidence] }
  })
}
export async function snapshotTree(root) {
  const entries = {}
  async function walk(relative) {
    const dir = path.join(root, relative)
    for (const e of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (['.git', 'node_modules'].includes(e.name)) continue
      const p = path.join(relative, e.name), full = path.join(root, p)
      if (e.isSymbolicLink()) entries[p] = `symlink:${await fs.readlink(full)}`
      else if (e.isDirectory()) { entries[p + '/'] = 'directory'; await walk(p) }
      else entries[p] = sha256(await fs.readFile(full))
    }
  }
  await walk(''); return entries
}
export async function auditPhotoFiles(root, registry) {
  const issues = [], entries = Object.entries(registry), byPath = new Map(), hashes = new Map(), slugs = new Map()
  const files = await fs.readdir(path.join(root, 'public/athletes')).catch(e => { if (e.code === 'ENOENT') return []; throw e })
  for (const [name, publicPath] of entries) {
    if (!/^\/athletes\/[a-z0-9-]+\.(png|jpg|jpeg|webp|avif)$/i.test(publicPath)) { issues.push(`INVALID_PATH: ${name}`); continue }
    if (byPath.has(publicPath)) issues.push(`DUPLICATE_PATH: ${byPath.get(publicPath)} / ${name}`)
    byPath.set(publicPath, name)
    if (!files.includes(path.basename(publicPath))) issues.push(`MISSING_FILE: ${name}`)
  }
  for (const file of files) {
    const full = path.join(root, 'public/athletes', file), stat = await fs.lstat(full)
    if (!stat.isFile()) { issues.push(`NON_REGULAR_FILE: ${file}`); continue }
    if (!byPath.has('/athletes/' + file)) issues.push(`ORPHAN_FILE: ${file}`)
    const slug = path.parse(file).name
    if (slugs.has(slug)) issues.push(`MULTIPLE_SLUG_FILES: ${slug}`)
    slugs.set(slug, file)
    const hash = sha256(await fs.readFile(full))
    if (hashes.has(hash)) issues.push(`DUPLICATE_HASH: ${hashes.get(hash)} / ${file}`)
    hashes.set(hash, file)
  }
  return { entries: entries.length, files: files.length, issues, dualSourceCases: DUAL_SOURCE_PHOTOS }
}
// Metadata contracts for a future writer. They perform no filesystem/network writes.
export function stagingPlan(decision, stagingRoot = '.athlete-photo-staging') {
  if (decision.identityStatus !== 'VERIFIED' || !['HIGH', 'MEDIUM'].includes(decision.confidence)) throw new Error('Decision is not eligible for staging')
  if (decision.proposedAction !== 'ACCEPT_FOR_MANUAL_REVIEW' && decision.proposedAction !== 'REVIEW') throw new Error('Review decision required')
  const image = new URL(decision.bestCandidateUrl)
  if (image.protocol !== 'https:' || !decision.verifiedProfileUrl) throw new Error('Verified source evidence required')
  if (!Number.isSafeInteger(decision.athlete.athleteId)) throw new Error('Invalid athlete ID')
  if (stagingRoot !== '.athlete-photo-staging') throw new Error('Dedicated staging root required')
  return { athlete: decision.athlete, sourceUrl: image.href, profileUrl: decision.verifiedProfileUrl, checkedAt: decision.checkedAt, confidence: decision.confidence, stagingDirectory: `${stagingRoot}/${decision.athlete.athleteId}`, publishRequires: 'manual acceptance of downloaded checksum plus consistency validation' }
}
export function validatePublishPlan({ decision, acceptance, staged, existing, projectedAudit }) {
  if (!['HIGH', 'MEDIUM'].includes(decision.confidence) || decision.identityStatus !== 'VERIFIED') throw new Error('Unresolved image cannot be published')
  if (!acceptance?.reviewer || !acceptance?.reviewedAt || acceptance.athleteId !== decision.athlete.athleteId || acceptance.sourceUrl !== decision.bestCandidateUrl) throw new Error('Explicit matching manual acceptance required')
  if (!staged?.decoded || !/^[a-f0-9]{64}$/.test(staged.checksum ?? '') || acceptance.checksum !== staged.checksum) throw new Error('Validated staged bytes and accepted checksum required')
  if (staged.sourceUrl !== decision.bestCandidateUrl || staged.athleteId !== decision.athlete.athleteId || !staged.stagingPath?.startsWith(`.athlete-photo-staging/${decision.athlete.athleteId}/`) || staged.stagingPath.includes('..')) throw new Error('Staged identity/path mismatch')
  if (existing && !(acceptance.refresh && acceptance.replace)) throw new Error('Existing/manual photo is protected')
  if (!projectedAudit || projectedAudit.issues.length) throw new Error('Projected registry/files must pass audit, including extension replacement')
  return { eligible: true, writerEnabled: false, reason: 'Discovery contract never writes; use separate staging and approved transactional publish steps' }
}
