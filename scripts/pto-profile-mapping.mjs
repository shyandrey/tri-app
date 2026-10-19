import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {extract,normalizeName} from './pto-profile-core.mjs'
export const validProfileUrl=url=>typeof url==='string'&&/^https:\/\/stats\.protriathletes\.org\/athlete\/[a-z0-9-]+$/.test(url)
export function decisionsFromCsv(csv){
 const r=spawnSync('python3',['-c','import csv,json,sys; print(json.dumps(list(csv.DictReader(sys.stdin))))'],{input:csv,encoding:'utf8'})
 if(r.status!==0)throw Error('INVALID_DECISION_CSV')
 const rows=JSON.parse(r.stdout),seen=new Set()
 for(const r of rows){
  if(!/^\d+$/.test(r.id??'')||seen.has(Number(r.id)))throw Error('DUPLICATE_OR_INVALID_DECISION_ID')
  seen.add(Number(r.id));r.id=Number(r.id)
  if(!['','APPROVE','REPLACE','SKIP'].includes(r.decision)||typeof r.proposed_url!=='string'||typeof r.replacement_url!=='string')throw Error('INVALID_DECISION')
  if(r.decision!=='REPLACE'&&r.replacement_url)throw Error('UNEXPECTED_REPLACEMENT')
 }
 return rows
}
export function identityEvidence(athlete,url,html){
 const p=extract(html,true)
 const nameMatch=p.names.length===1&&normalizeName(p.names[0])===normalizeName(athlete.nameEn)
 const canonicalMatch=p.canonical.length===1&&p.canonical[0]===url
 const countryMatch=!!athlete.countryCode&&p.countries.length===1&&p.countries[0]===athlete.countryCode
 return {sourceName:p.names,sourceCountry:p.countries,localCountry:athlete.countryCode??null,nameMatch,canonicalMatch,countryMatch,
  sufficient:nameMatch&&canonicalMatch&&countryMatch,snapshotSha256:createHash('sha256').update(html).digest('hex')}
}
export function mappingPlan(cohort,athletes,decisions=[],registry=[]){
 if(new Set(cohort.map(p=>p.id)).size!==cohort.length)throw Error('DUPLICATE_ATHLETE_ID')
 if(decisions.some(d=>!cohort.some(p=>p.id===d.id)))throw Error('UNKNOWN_DECISION_ID')
 if(new Set(registry.map(p=>p.id)).size!==registry.length||new Set(registry.map(p=>p.url)).size!==registry.length||registry.some(p=>!validProfileUrl(p.url)||!p.approvedBy||!Number.isFinite(Date.parse(p.approvedAt))))throw Error('INVALID_APPROVED_REGISTRY')
 const rows=cohort.map(p=>{
  const a=athletes.find(a=>a.id===p.id),d=decisions.find(d=>d.id===p.id),previous=registry.find(r=>r.id===p.id)
  const row={id:p.id,name:p.name,proposedUrl:p.url??'',selectedUrl:d?.decision==='REPLACE'?d.replacement_url:p.url??'',decision:d?.decision??'',previousUrl:previous?.url??null,status:'PENDING_OWNER_REVIEW',conflicts:[],evidence:null}
  if(!a||normalizeName(a.nameEn)!==normalizeName(p.name)||a.gender!==p.gender||athletes.filter(x=>normalizeName(x.nameEn)===normalizeName(p.name)).length!==1)row.conflicts.push('LOCAL_IDENTITY_AMBIGUOUS')
  if(d&&d.proposed_url!==row.proposedUrl)row.conflicts.push('STALE_DECISION_PROPOSAL')
  if(d?.decision==='SKIP'){row.status='SKIPPED';return row}
  if(!row.selectedUrl)row.conflicts.push('MISSING_PROFILE_URL')
  else if(!validProfileUrl(row.selectedUrl))row.conflicts.push('INVALID_PROFILE_URL')
  if(previous&&previous.url!==row.selectedUrl)row.conflicts.push('PREVIOUSLY_APPROVED_MAPPING_CONFLICT')
  if(d?.decision==='APPROVE'||d?.decision==='REPLACE')row.status='AWAITING_LIVE_IDENTITY_CHECK'
  if(row.conflicts.length)row.status='REVIEW_REQUIRED'
  return row
 })
 for(const row of rows){
  if(row.status!=='SKIPPED'&&row.selectedUrl&&(rows.some(r=>r!==row&&r.status!=='SKIPPED'&&r.selectedUrl===row.selectedUrl)||registry.some(r=>r.id!==row.id&&r.url===row.selectedUrl))){row.conflicts.push('PROFILE_ASSIGNED_TO_MULTIPLE_IDS');row.status='REVIEW_REQUIRED'}
 }
 return rows
}
export async function fetchIdentity(url,fetcher=fetch){
 if(!validProfileUrl(url))throw Error('INVALID_PROFILE_URL')
 const response=await fetcher(url,{redirect:'manual',signal:AbortSignal.timeout(20000)})
 if(response.status!==200)throw Error(`PROFILE_HTTP_${response.status}`)
 if(!response.headers.get('content-type')?.includes('text/html'))throw Error('PROFILE_NOT_HTML')
 const reader=response.body.getReader(),parts=[];let size=0
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4000000)throw Error('PROFILE_TOO_LARGE');parts.push(Buffer.from(value))}}finally{await reader.cancel()}
 const html=Buffer.concat(parts).toString('utf8')
 if(/cf-chl-|captcha/i.test(html))throw Error('ACCESS_CHALLENGE')
 return html
}
export async function authorizeExtraction(row,athlete,fetcher){
 if(row.status!=='AWAITING_LIVE_IDENTITY_CHECK')return null
 try{
  const html=await fetchIdentity(row.selectedUrl,fetcher)
  row.evidence=identityEvidence(athlete,row.selectedUrl,html);row.checkedAt=new Date().toISOString()
  if(!row.evidence.sufficient){row.status='REVIEW_REQUIRED';row.conflicts.push('LIVE_IDENTITY_MISMATCH');return null}
  row.status='APPROVED_FOR_FIELD_DRY_RUN';return html
 }catch(error){
  row.status='REVIEW_REQUIRED';row.conflicts.push(/^PROFILE_|^ACCESS_CHALLENGE$/.test(error.message)?error.message:'PROFILE_UNAVAILABLE');return null
 }
}
