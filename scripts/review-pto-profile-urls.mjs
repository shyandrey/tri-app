// Render the identity-only JSON report. No network/registry access.
import fs from 'node:fs'
const report=JSON.parse(fs.readFileSync(0,'utf8')),format=process.argv[2]
const csv=s=>'"'+String(s??'').replaceAll('"','""')+'"'
const cell=s=>String(s??'').replaceAll('|','/').replace(/[\r\n]/g,' ')
if(format==='--csv'){
 console.log('id,name,proposed_url,decision,replacement_url')
 for(const r of report.mappings)console.log([r.id,r.name,r.proposedUrl,'',''].map(csv).join(','))
}else if(format==='--markdown'){
 console.log('# PTO profile URL review — pilot 20\n\nNo URL decisions or registry writes have been made. Cached HTML is used for identity evidence only; AGE/BORN/social extraction is blocked. Name alone is insufficient. Country + canonical + unique local ID/name/gender are checked; confidence is a review aid, not owner approval. Race-history corroboration is not automated.\n\nFill `decision` in the companion CSV with APPROVE, REPLACE or SKIP. For REPLACE fill `replacement_url`; keep id/proposed_url unchanged. Blank decision = pending. Return the CSV or decisions in chat; no code editing needed. URL approval permits only field dry-run, not field approval or registry persistence.\n\n| ID | Athlete | Proposed PTO URL | Matching evidence | Confidence / status |\n|---|---|---|---|---|')
 for(const r of report.mappings){const e=r.evidence;console.log('| '+[r.id,r.name,r.proposedUrl,e?`source name ${e.sourceName.join('; ')}; country ${e.sourceCountry.join('; ')} / local ${e.localCountry}; canonical=${e.canonicalMatch}; SHA256 ${e.snapshotSha256}`:'No usable snapshot',`${r.confidence??'UNRESOLVED'} / ${r.status}; ${r.conflicts.join(', ')||'no detected mismatch'}; live reachability not checked`].map(cell).join(' | ')+' |')}
}else throw Error('Use --csv or --markdown')
