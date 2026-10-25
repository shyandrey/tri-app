import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizedPtoCountry} from './pto-profile-identity-values.mjs'

export const fixtureUrl = new URL('./fixtures/official-standings/ironman-approved-2026-10-21.json', import.meta.url)
export const serialize = v => JSON.stringify(v, null, 2) + '\n'
export const normalizeName = s => s.replaceAll('ø','o').replaceAll('Ø','O').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'')
// Existing project sports aliases: src/data/athletes/localization.ts. Scoped to this importer.
const sportsCodes = {GER:'DE', DEN:'DK', NED:'NL', RSA:'ZA'}
export const normalizeCountry = raw => normalizedPtoCountry(raw) ?? sportsCodes[raw] ?? null

export function classifyIdentity(row, evidence) {
  const country = normalizeCountry(row.countryISO3)
  if (!evidence?.athleteId) return {athleteId:null, proposedAthleteId:null, nationalityNormalized:country, identityStatus:'UNRESOLVED', identityFlags:['NO_RELIABLE_CATALOG_MATCH']}
  const e = evidence, reasons = []
  if (!country) reasons.push('UNKNOWN_COUNTRY_CODE')
  else if (country !== e.localCountry) reasons.push('COUNTRY_CONFLICT')
  if (normalizeName(row.athleteName) !== normalizeName(e.localName) || e.nameVariantRequiresReview) reasons.push('NAME_VARIANT_REQUIRES_REVIEW')
  if (e.gender !== {men:'M',women:'W'}[row.gender]) reasons.push('GENDER_CONFLICT')
  if (!e.approvedMapping || e.approvedMapping.id !== e.athleteId || e.approvedMapping.approvedBy !== 'owner') reasons.push('NO_APPROVED_PTO_MAPPING')
  const p = e.profileEvidence
  if (!p?.identity?.sufficient || !p.identity.nameMatch || !p.identity.canonicalMatch || p.identity.sourceCountryNormalized !== country || p.sourceUrl !== e.approvedMapping?.url) reasons.push('NO_VERIFIED_PROFILE_EVIDENCE')
  if (!e.historicalMatches.length) reasons.push('NO_INDEPENDENT_HISTORY_EVIDENCE')
  // Explicit row-bound owner decisions; never override country/gender conflicts.
  const a = e.ownerIdentityApproval
  const approved = a?.approvedBy === 'owner' && a.approvedAt === '2026-10-22'
    && a.scope === 'IRONMAN_RANKING_IDENTITY_ONLY' && /^[a-f0-9]{64}$/.test(a.evidenceReportSha256)
    && a.athleteId === e.athleteId && a.athleteName === row.athleteName
    && a.nationalityNormalized === country && a.gender === row.gender
    && a.rows.some(r => r.seasonYear === Number(row.seasonYear) && r.rank === Number(row.rank))
  if (approved) {
    const resolved = new Set(['NAME_VARIANT_REQUIRES_REVIEW','NO_APPROVED_PTO_MAPPING','NO_VERIFIED_PROFILE_EVIDENCE','NO_INDEPENDENT_HISTORY_EVIDENCE'])
    for (let i = reasons.length - 1; i >= 0; i--) if (resolved.has(reasons[i])) reasons.splice(i,1)
  }
  return {athleteId:reasons.length ? null : e.athleteId, proposedAthleteId:e.athleteId, nationalityNormalized:country, identityStatus:reasons.length ? 'REVIEW' : 'CONFIRMED', identityFlags:reasons, ...(approved && !reasons.length ? {identityApproval:a} : {})}
}

export function buildStandings(input) {
  if (input.schemaVersion !== 1 || input.rows.length !== 60 || !/^[a-f0-9]{64}$/.test(input.source.sha256)) throw Error('Invalid approved input')
  const tables = {}, names = new Map(), ids = new Map()
  for (const r of input.rows) {
    const year = Number(r.seasonYear), rank = Number(r.rank), points = Number(r.points), gender = {men:'M',women:'W'}[r.gender]
    if (r.series !== 'IRONMAN_PRO_SERIES' || ![2024,2025,2026].includes(year) || !gender || !Number.isInteger(rank) || !Number.isInteger(points) || points < 0 || r.sourceUrl !== `https://www.ironman.com/proseries/standings/${year}` || r.provenanceType !== 'OWNER_APPROVED_SCREENSHOT_TRANSCRIPTION' || r.ownerApprovedAt !== input.source.ownerApprovedAt) throw Error('Invalid source row')
    const key = `${year}-${r.gender}.json`
    tables[key] ??= {schemaVersion:1, series:r.series, coverage:'TOP_10_ONLY', seasonYear:year, gender, seasonStatus:year===2026?'LIVE':'HISTORICAL_FINAL_PENDING_CONFIRMATION', sourceUrl:r.sourceUrl, sourceObservedAt:null, provenanceType:r.provenanceType, sourceVerificationStatus:'OWNER_APPROVED_VALUES_NOT_INDEPENDENTLY_HTML_VERIFIED', approvalScope:'LOCAL_CANDIDATE_PREPARATION_ONLY', readyForApplication:false, provenance:{...input.source, identityEvidenceFile:'scripts/fixtures/official-standings/ironman-approved-2026-10-21.json'}, rows:[]}
    const t = tables[key], evidence = input.identityEvidence[r.athleteName], identity = classifyIdentity(r,evidence)
    if (rank !== t.rows.length+1 || rank > 10) throw Error('Invalid order/rank')
    if (t.rows.some(x => normalizeName(x.athleteName) === normalizeName(r.athleteName) || (identity.proposedAthleteId !== null && x.proposedAthleteId === identity.proposedAthleteId))) throw Error('Duplicate athlete')
    const name = normalizeName(r.athleteName), signature = JSON.stringify([name,identity.nationalityNormalized,gender])
    if (names.has(name) && names.get(name)!==identity.proposedAthleteId) throw Error('Cross-season mapping conflict')
    names.set(name,identity.proposedAthleteId)
    if (identity.proposedAthleteId !== null) {
      if (ids.has(identity.proposedAthleteId) && ids.get(identity.proposedAthleteId)!==signature) throw Error('Conflicting identity')
      ids.set(identity.proposedAthleteId,signature)
    }
    t.rows.push({officialRank:rank, athleteName:r.athleteName, nationality:r.countryISO3, officialPoints:points, ...identity, sourceUrl:r.sourceUrl, sourceObservedAt:null, provenance:{type:r.provenanceType, ownerApprovedAt:r.ownerApprovedAt, approvedCsvSha256:input.source.sha256, inputRow:input.rows.indexOf(r)+1, identityEvidenceKey:r.athleteName}})
  }
  if (Object.keys(tables).length !== 6 || Object.values(tables).some(t=>t.rows.length!==10)) throw Error('Incomplete six-table input')
  return tables
}

async function main() {
  const args=process.argv.slice(2)
  if(args.length && (args.length!==2 || args[0]!=='--out-dir'))throw Error('Usage: node scripts/prepare-ironman-standings.mjs [--out-dir directory]')
  const tables=buildStandings(JSON.parse(await fs.readFile(fixtureUrl,'utf8')))
  if(!args.length){process.stdout.write(serialize(tables));return}
  await fs.mkdir(args[1],{recursive:true})
  for(const [file,t] of Object.entries(tables))await fs.writeFile(path.join(args[1],file),serialize(t))
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main()
