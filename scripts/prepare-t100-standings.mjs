import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

export const fixtureUrl = new URL('./fixtures/official-standings/t100-approved-2026-10-21.json', import.meta.url)
export const serialize = value => JSON.stringify(value, null, 2) + '\n'

// Offline replay only. The pinned input records owner-approved values, not live PTO data.
export function buildStandings(input) {
  if (input.schemaVersion !== 1 || input.tables.length !== 6) throw Error('Expected six approved tables')
  const output = {}, identities = new Map()
  for (const t of input.tables) {
    const gender = {M: 'men', W: 'women'}[t.gender]
    const file = `${t.seasonYear}-${gender}.json`
    if (![2024, 2025, 2026].includes(t.seasonYear) || !gender || t.file !== file || output[file]) throw Error('Invalid/duplicate season or gender')
    const status = t.seasonYear === 2026 ? 'LIVE' : 'HISTORICAL_FINAL_PENDING_CONFIRMATION'
    if (t.seasonStatus !== status || t.rows.length !== 10) throw Error('Invalid status or row count')
    if (t.sourceUrl !== `https://stats.protriathletes.org/t100/standings/${gender}` || !/^[a-f0-9]{64}$/.test(t.sourceScreenshot.sha256)) throw Error('Invalid provenance')
    const ids = new Set(), names = new Set()
    const rows = t.rows.map(([rank, name, rawCountry, country, points, id], i) => {
      if (rank !== i + 1 || !Number.isInteger(points) || points < 0 || !Number.isInteger(id) || id <= 0 || !name || !/^[A-Z]{3}$/.test(rawCountry) || !/^[A-Z]{2}$/.test(country)) throw Error('Invalid approved row')
      if (ids.has(id) || names.has(name)) throw Error('Duplicate athlete in table')
      ids.add(id); names.add(name)
      const identity = JSON.stringify([name, country, t.gender])
      if (identities.has(id) && identities.get(id) !== identity) throw Error('Cross-season identity conflict')
      identities.set(id, identity)
      return {
        officialRank: rank, athleteName: name, nationality: rawCountry,
        nationalityNormalized: country, officialPoints: points, athleteId: id,
        identityStatus: 'CONFIRMED', sourceUrl: t.sourceUrl, sourceObservedAt: null,
        verifiedAt: t.verifiedAt, sourceVerificationStatus: 'SCREENSHOT_VERIFIED',
        provenance: {
          type: t.provenanceType, screenshotPath: t.sourceScreenshot.file,
          screenshotSha256: t.sourceScreenshot.sha256, verificationMethod: 'VISUAL_NO_OCR',
          countryRepresentation: 'FLAG',
          ...(t.corrections[String(rank)] ? {ownerApprovedCorrection: t.corrections[String(rank)]} : {}),
        },
      }
    })
    output[file] = {
      schemaVersion: 1, series: 'T100', coverage: 'TOP_10_ONLY',
      seasonYear: t.seasonYear, gender: t.gender, seasonStatus: status,
      sourceUrl: t.sourceUrl, sourceSeasonId: t.sourceSeasonId,
      sourceSeasonIdBasis: 'OWNER_SUPPLIED_NOT_HTML_VERIFIED', sourceObservedAt: null,
      verifiedAt: t.verifiedAt, sourceVerificationStatus: t.sourceVerificationStatus,
      provenance: {type: t.provenanceType, candidateSha256: t.candidateSha256,
        localApplicationApproval: input.approval, screenshot: t.sourceScreenshot,
        htmlVerified: false, limitations: t.reviewLimitations},
      rows,
    }
  }
  return output
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length && (args.length !== 2 || args[0] !== '--out-dir')) throw Error('Usage: node scripts/prepare-t100-standings.mjs [--out-dir directory]')
  const result = buildStandings(JSON.parse(await fs.readFile(fixtureUrl, 'utf8')))
  if (!args.length) {process.stdout.write(serialize(result)); return}
  await fs.mkdir(args[1], {recursive: true})
  for (const [file, table] of Object.entries(result)) await fs.writeFile(path.join(args[1], file), serialize(table))
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
