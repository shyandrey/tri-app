import fs from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

export const fixtureUrl = new URL('./fixtures/official-standings/t100-approved-2026-10-21.json', import.meta.url)
export const liveFixtureUrl = new URL('./fixtures/official-standings/t100-post-dubai-2026.json', import.meta.url)
export const serialize = value => JSON.stringify(value, null, 2) + '\n'

// Offline replay only. The pinned input records owner-approved values, not live PTO data.
export function buildStandings(input, live = null) {
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
  if (live) {
    if (live.schemaVersion !== 1 || live.tables.length !== 2 || !Number.isFinite(Date.parse(live.observedAt))) throw Error('Invalid live evidence')
    const seen = new Set()
    for (const t of live.tables) {
      const gender = {M:'men', W:'women'}[t.gender]
      if (!gender || t.file !== `2026-${gender}.json` || seen.has(t.file) || t.rows.length !== 10 || t.sourceUrl !== `https://stats.protriathletes.org/t100/standings/${gender}` || !/^[a-f0-9]{64}$/.test(t.snapshotSha256)) throw Error('Invalid live table')
      seen.add(t.file)
      const ids = new Set()
      for (const [i,r] of t.rows.entries()) {
        if (r.officialRank !== i+1 || !Number.isInteger(r.officialPoints) || r.officialPoints<0 || !Number.isInteger(r.athleteId) || r.athleteId<=0 || ids.has(r.athleteId) || !r.athleteName || !/^[A-Z]{2}$/.test(r.nationalityNormalized) || !/^https:\/\/stats\.protriathletes\.org\/athlete\/[a-z0-9-]+$/.test(r.athleteSourceUrl)) throw Error('Invalid live row')
        ids.add(r.athleteId)
      }
      const provenance = {type:'OFFICIAL_HTML_SNAPSHOT', htmlVerified:true, snapshot:t.snapshot, snapshotSha256:t.snapshotSha256,
        localApplicationApproval:{date:live.observedAt.slice(0,10),scope:'OWNER_AUTHORIZED_TOP10_LOCAL_CANDIDATE_ONLY'}}
      output[t.file] = {schemaVersion:1,series:'T100',coverage:'TOP_10_ONLY',seasonYear:2026,gender:t.gender,seasonStatus:'LIVE',sourceUrl:t.sourceUrl,sourceObservedAt:live.observedAt,verifiedAt:live.observedAt.slice(0,10),sourceVerificationStatus:'OFFICIAL_HTML_VERIFIED',provenance,
        rows:t.rows.map(r=>({...r,identityStatus:'CONFIRMED',sourceUrl:t.sourceUrl,sourceObservedAt:live.observedAt,verifiedAt:live.observedAt.slice(0,10),sourceVerificationStatus:'OFFICIAL_HTML_VERIFIED',provenance:{type:'OFFICIAL_HTML_SNAPSHOT',snapshot:t.snapshot,snapshotSha256:t.snapshotSha256}}))}
    }
  }
  return output
}

async function main() {
  const args = process.argv.slice(2)
  if (args.length && (args.length !== 2 || args[0] !== '--out-dir')) throw Error('Usage: node scripts/prepare-t100-standings.mjs [--out-dir directory]')
  const result = buildStandings(JSON.parse(await fs.readFile(fixtureUrl, 'utf8')), JSON.parse(await fs.readFile(liveFixtureUrl, 'utf8')))
  if (!args.length) {process.stdout.write(serialize(result)); return}
  await fs.mkdir(args[1], {recursive: true})
  for (const [file, table] of Object.entries(result)) await fs.writeFile(path.join(args[1], file), serialize(table))
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()

// Fresh-source preparation is separate from historical approved snapshot replay.
// Fail closed on markup changes; never fall back to liveFixtureUrl.
export function parseFreshTop10(html, gender, seasonYear) {
  const sex={M:'men',W:'women'}[gender]
  if(!sex||!Number.isInteger(seasonYear))throw Error('Invalid season/gender')
  const sourceUrl=`https://stats.protriathletes.org/t100/standings/${sex}`
  if(!html.includes(`rel="canonical" href="${sourceUrl}"`)||!html.includes(`<h1>${seasonYear} Standings</h1>`))throw Error('Standings source/season mismatch')
  const cards=html.split('<div class="trow">').slice(1,11)
  if(cards.length!==10)throw Error('Incomplete TOP 10')
  const text=s=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;|\u00a0/g,' ').replace(/\s+/g,' ').trim()
  const rows=cards.map(card=>{
    const rank=card.match(/class="ranking-number">(\d+)</),points=card.match(/class="points">(\d+(?:\.\d+)?)</)
    const name=card.match(/<div class="name">([\s\S]*?)<\/a>/)?.[1]
    const url=name?.match(/href="(\/athlete\/[a-z0-9-]+)"/),country=name?.match(/flag-icon-([a-z]{2})/)
    if(!rank||!points||!name||!url||!country)throw Error('Unsupported/missing TOP10 fields')
    const athleteName=text(name.slice(name.indexOf('<a ')))
    if(!athleteName||/&(?:#\w+|\w+);/.test(athleteName))throw Error('Unsupported name entity')
    return {officialRank:Number(rank[1]),officialPoints:Number(points[1]),athleteName,nationality:country[1].toUpperCase(),nationalityNormalized:country[1].toUpperCase(),athleteSourceUrl:'https://stats.protriathletes.org'+url[1]}
  })
  if(new Set(rows.map(r=>r.athleteSourceUrl)).size!==10)throw Error('Duplicate TOP10 identity')
  for(const [i,r]of rows.entries())if(r.officialRank<1||r.officialRank>10||(i&&(r.officialRank<rows[i-1].officialRank||r.officialPoints>rows[i-1].officialPoints)))throw Error('Invalid official ordering')
  return {series:'T100',seasonYear,gender,sourceUrl,rows}
}
