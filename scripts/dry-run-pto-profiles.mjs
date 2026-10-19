// No registry writer. Without owner decisions only profile identity is examined.
import fs from 'node:fs/promises'
import path from 'node:path'
import {createServer} from 'vite'
import {analyze,report} from './pto-profile-core.mjs'
import {mappingPlan,decisionsFromCsv,identityEvidence,authorizeExtraction} from './pto-profile-mapping.mjs'
const args=process.argv.slice(2)
if(![2,3].includes(args.length)||args.some(a=>a.startsWith('--')))throw Error('Usage: node scripts/dry-run-pto-profiles.mjs MANIFEST.json SNAPSHOT_DIRECTORY [OWNER_DECISIONS.csv]')
const manifest=JSON.parse(await fs.readFile(args[0],'utf8'))
const decisions=args[2]?decisionsFromCsv(await fs.readFile(args[2],'utf8')):[]
// Future approved registry is read-only. This patch does not create it.
let registry=[]
try{registry=JSON.parse(await fs.readFile('src/data/athletes/ptoProfileMappings.json','utf8')).mappings;if(!Array.isArray(registry))throw Error('INVALID_REGISTRY')}catch(e){if(e.code!=='ENOENT')throw e}
const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
try{
 const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
 const mappings=mappingPlan(manifest.cohort,athletes,decisions,registry),rows=[]
 let stopped=false
 for(const row of mappings){
  const athlete=athletes.find(a=>a.id===row.id)
  if(row.status==='SKIPPED'||row.conflicts.length)continue
  if(!args[2]){
   try{
    const html=await fs.readFile(path.join(args[1],`${row.id}.html`),'utf8')
    row.evidence=identityEvidence(athlete,row.selectedUrl,html)
    row.confidence=row.evidence.sufficient?'NAME_COUNTRY_CANONICAL_MATCH_REVIEW_REQUIRED':'INSUFFICIENT'
    row.reachability='CACHED_SNAPSHOT_ONLY_NOT_LIVE_CHECKED'
    if(!row.evidence.sufficient){row.conflicts.push('SNAPSHOT_IDENTITY_MISMATCH');row.status='REVIEW_REQUIRED'}
   }catch(e){if(e.code!=='ENOENT')throw e;row.conflicts.push('MISSING_IDENTITY_SNAPSHOT');row.status='REVIEW_REQUIRED'}
   continue
  }
  if(stopped){row.status='NOT_RUN_AFTER_STOP';continue}
  const html=await authorizeExtraction(row,athlete)
  if(html){rows.push(analyze({athlete,url:row.selectedUrl,html,verifiedAt:row.checkedAt}));await new Promise(r=>setTimeout(r,1000))}
  else if(row.status==='REVIEW_REQUIRED')stopped=true
 }
 console.log(JSON.stringify({snapshot:manifest.sha,rankingClock:manifest.clock,mappings,fieldApproval:'NOT_GRANTED_BY_URL_APPROVAL',...report(rows)},null,2))
}finally{await server.close()}
