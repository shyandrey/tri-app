// Iteration 1 only: write a new external review bundle, never runtime registries.
import {sealBundle} from './sports-candidate.mjs'
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {createServer} from 'vite'
import {parseStatsPtoResults,validateSourceURL,proposeResults} from './import-race-results.mjs'
import {parseFreshTop10,serialize} from './prepare-t100-standings.mjs'
export const hash=x=>createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex')
export function parseArgs(args){
 const o={mode:args[0],race:[]};assert.ok(['results','t100'].includes(o.mode),'Mode results or t100 required')
 for(let i=1;i<args.length;i+=2){const k=args[i]?.slice(2),v=args[i+1];assert.ok(args[i]?.startsWith('--')&&['url','race','out','season','after-race','freshness','review','html'].includes(k)&&v&&!v.startsWith('--'),'Invalid argument');if(k==='race')o.race.push(v);else{assert.ok(!Object.hasOwn(o,k),'Duplicate option');o[k]=v}}
 assert.ok(o.out&&path.isAbsolute(o.out),'New absolute external --out directory required')
 if(o.mode==='results'){o.url=validateSourceURL(o.url);assert.ok(o.race.length&&new Set(o.race).size===o.race.length,'Unique edition IDs required')}
 else{assert.match(o.season??'',/^20\d{2}$/);o.season=Number(o.season);o['after-race']=validateSourceURL(o['after-race']);assert.equal(Number(new URL(o['after-race']).pathname.split('/')[3]),o.season)}
 return o
}
export async function fetchSource(url,fetcher=fetch){
 const r=await fetcher(url,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(30000),headers:{Accept:'text/html','Cache-Control':'no-cache'}})
 assert.equal(r.status,200,'Official source HTTP failure');assert.ok(r.headers.get('content-type')?.includes('text/html'),'Expected official HTML')
 const html=await r.text();assert.ok(html.length<8*1024*1024,'Oversized source');return html
}
export function selectEditions(ids,url,all,parsed,today=new Date().toISOString().slice(0,10)){
 const year=Number(new URL(url).pathname.split('/')[3])
 const editions=ids.map(id=>{const e=all.find(x=>x.editionId===id);assert.ok(e,'Missing edition: explicit review required '+id);assert.equal(e.statsPtoUrl,url,'Edition/source mismatch');assert.equal(Number(e.dateISO.slice(0,4)),year);assert.ok(e.dateISO<=today,'Future edition');
  assert.ok(parsed.dates.some(d=>{const n=Date.parse(d+' UTC');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===e.dateISO}),'Source date/edition mismatch');return e})
 assert.equal(new Set(editions.map(e=>e.raceId)).size,1,'Mixed race identities')
 const genders=new Set(editions.flatMap(e=>e.gender==='MPRO'?['M']:e.gender==='WPRO'?['W']:e.gender==='WPRO+MPRO'?['M','W']:[]))
 assert.deepEqual([...genders].sort(),parsed.groups.map(g=>g.gender).sort(),'Full professional field coverage required')
 assert.ok(parsed.title.includes(String(year)),'Source title/year mismatch');return editions
}
export function prepareRace(parsed,editions,existing,athletes,normalize,mappings,review=[]){
 const p=proposeResults(parsed,editions,existing,athletes,normalize),blockers=[]
 for(const m of p.matches){const known=mappings.find(x=>x.id===m.athleteId);if(known&&known.url!=='https://stats.protriathletes.org'+m.athletePath)blockers.push('Profile URL conflict: '+m.athleteName)}
 for(const a of p.anomalies)if(a.type==='country-conflict')blockers.push('Country conflict: '+a.athleteName)
 for(const row of p.rows)if(typeof row.position==='number'&&!row.totalTime)blockers.push('Incomplete finisher time: '+row.athleteName)
 const proposals=p.unmatched.map(a=>{const r=review.find(x=>x.nameEn===a.athleteName&&x.profileUrl==='https://stats.protriathletes.org'+a.athletePath);return {athleteId:null,nameEn:a.athleteName,gender:a.gender,sourceCountry:a.countryCode??null,profileUrl:'https://stats.protriathletes.org'+a.athletePath,proposedNameRu:r?.nameRu??null,proposedCountry:r?.countryCode??a.countryCode??null,editorialStatus:'OWNER_REVIEW_REQUIRED',identityStatus:'UNMATCHED_NOT_PROVEN_NEW'}})
 if(proposals.length)blockers.push('Unmatched athletes require identity/country/name review; no automatic profile creation')
 const counts=Object.fromEntries(parsed.groups.map(g=>[g.gender==='M'?'MPRO':'WPRO',{total:g.rows.length,finishers:g.rows.filter(x=>typeof x.result.position==='number').length,...Object.fromEntries(['DNF','DNS','DSQ'].map(s=>[s,g.rows.filter(x=>x.result.position===s).length]))}]))
 return {...p,proposals,counts,blockers,existingAthleteMatches:new Set(p.matches.map(x=>x.athleteId)).size}
}
// Common review interface only. IRONMAN adapters/scraping/OCR intentionally absent.
export function validateStandingsReview(t){
 assert.ok(['T100','IRONMAN_PRO_SERIES'].includes(t.series));assert.ok(Number.isInteger(t.seasonYear)&&['M','W'].includes(t.gender));assert.equal(t.rows.length,10)
 assert.ok(t.source&&['OFFICIAL_HTML','OFFICIAL_WEBSITE','OWNER_OFFICIAL_SCREENSHOT','REVIEWED_TRANSCRIPTION'].includes(t.source.method));assert.match(t.source.sha256,/^[a-f0-9]{64}$/);assert.ok(t.source.url&&t.source.observedAt)
 const sourceURL=new URL(t.source.url);assert.equal(sourceURL.protocol,'https:');assert.ok(t.series==='T100'?sourceURL.hostname==='stats.protriathletes.org':['ironman.com','www.ironman.com','proseries.ironman.com'].includes(sourceURL.hostname),'Wrong official standings source')
 const ids=new Set();for(const [i,r]of t.rows.entries()){
  assert.ok(Number.isInteger(r.athleteId)&&r.athleteId>0&&!ids.has(r.athleteId),'Missing/duplicate stable ID');ids.add(r.athleteId)
  assert.ok(Number.isInteger(r.officialRank)&&r.officialRank>0&&r.officialRank<=10&&Number.isFinite(r.officialPoints)&&r.officialPoints>=0&&r.athleteName)
  if(i)assert.ok(r.officialRank>=t.rows[i-1].officialRank&&r.officialPoints<=t.rows[i-1].officialPoints,'Invalid source order')
 }return t
}
export function matchStandings(t,athletes,mappings,normalize){
 const rows=t.rows.map(r=>{const matches=athletes.filter(a=>normalize(a.nameEn)===normalize(r.athleteName));assert.equal(matches.length,1,'Unmatched/ambiguous TOP10 athlete: '+r.athleteName);const a=matches[0];assert.equal(a.gender,t.gender);assert.equal(a.countryCode,r.nationalityNormalized,'Country conflict');const mapping=mappings.find(m=>m.id===a.id);assert.ok(mapping?.approvedBy==='owner'&&mapping.url===r.athleteSourceUrl,'Missing/conflicting approved profile mapping');return {...r,athleteId:a.id,displayNameRu:a.nameRu??a.name??null,identityStatus:'CONFIRMED'}})
 return {...t,rows}
}
export function verifyFreshness(evidence,tables,afterRace,now=Date.now()){
 assert.ok(evidence?.afterRace===afterRace&&evidence.reviewedBy&&evidence.statement,'Freshness requires explicit source-bound review')
 const date=Date.parse(evidence.reviewedAt);assert.ok(Number.isFinite(date)&&date<=now&&now-date<=86400000,'Stale freshness review')
 assert.equal(evidence.tables?.length,2)
 for(const t of tables){const e=evidence.tables.find(x=>x.sourceUrl===t.sourceUrl);assert.ok(e&&e.sha256===t.source.sha256,'Changed source since freshness review');assert.ok(e.evidenceUrl&&e.explanation,'Missing post-race freshness evidence');const url=new URL(e.evidenceUrl);assert.ok(url.protocol==='https:'&&['stats.protriathletes.org','t100triathlon.com','protriathletes.org','www.protriathletes.org'].includes(url.hostname),'Freshness evidence must be official')}
}
async function runtime(){const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'});try{
 const a=await server.ssrLoadModule('/src/data/athletes/index.ts'),r=await server.ssrLoadModule('/src/data/results/index.ts'),e=await server.ssrLoadModule('/src/data/raceEditions.ts'),n=await server.ssrLoadModule('/src/data/athleteIdentity.ts');return {athletes:a.athletes,results:r.raceResults,editions:e.allRaceEditionViews,normalize:n.normalizeAthleteIdentityName}
 }finally{await server.close()}}
async function protectedFiles(){const names=execFileSync('git',['ls-files','src/data','src/utils/athleteRanking.ts'],{encoding:'utf8'}).trim().split('\n');return Object.fromEntries(await Promise.all(names.map(async f=>[f,hash(await fs.readFile(f,'utf8'))])))}
export function reviewMarkdown(r){return `# Sports update — Iteration 1\n\nStatus: ${r.status}. Owner approval required before Git/publication/deployment.\n\nSource: ${r.source}\nYear: ${r.year}\nBase: ${r.base}\n\nCounts: ${JSON.stringify(r.counts??{})}\nMatched athletes: ${r.existingAthleteMatches??0}\nNew confirmed profiles: 0 (no automatic creation).\n\nProposed profiles/localizations:\n\n${JSON.stringify(r.proposals??[],null,2)}\n\nStandings changes:\n\n${JSON.stringify(r.changes??[],null,2)}\n\nValidation: ${JSON.stringify(r.validation)}\nWarnings: ${JSON.stringify(r.warnings)}\nBlockers: ${JSON.stringify(r.blockers)}\n\nBundle files: ${r.files.join(', ')}\nRuntime files changed: none. Candidate runtime targets: ${JSON.stringify(r.runtimeTargets)}\n\nManual review: completeness of published fields, identities/countries, editorial Russian names, edition/SOF/status, append-only wiring and stable-ID audit. Build/browser validation not implied by this report.\n`}
async function main(){
 const o=parseArgs(process.argv.slice(2));const root=await fs.realpath('.'),out=path.resolve(o.out);const parent=await fs.realpath(path.dirname(out));assert.ok(parent!==root&&!parent.startsWith(root+path.sep),'Review output must be outside repository');await fs.mkdir(out) // refuse overwrite
 const base=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),before=await protectedFiles(),data=await runtime(),mappings=JSON.parse(await fs.readFile('src/data/athletes/ptoProfileMappings.json')).mappings
 const report={schemaVersion:1,kind:o.mode,base,source:o.url??'https://stats.protriathletes.org/t100/standings/{men,women}',year:o.season??Number(new URL(o.url).pathname.split('/')[3]),status:'BLOCKED',blockers:[],warnings:[],validation:{build:'NOT RUN',source:'PENDING',stableIDs:'PENDING'},files:[],runtimeTargets:[]}
 const save=async(name,value)=>{await fs.writeFile(path.join(out,name),typeof value==='string'?value:serialize(value),{flag:'wx'});report.files.push(name)}
 try{
 if(o.mode==='results'){
  const html=o.html?await fs.readFile(o.html,'utf8'):await fetchSource(o.url);await save('source.html',html);assert.ok(html.includes(`rel="canonical" href="${o.url}"`),'Canonical mismatch')
  const parsed=parseStatsPtoResults(html),editions=selectEditions(o.race,o.url,data.editions,parsed)
  const review=o.review?JSON.parse(await fs.readFile(o.review,'utf8')):[]
  const p=prepareRace(parsed,editions,data.results,data.athletes,data.normalize,mappings,review)
  Object.assign(report,{counts:p.counts,existingAthleteMatches:p.existingAthleteMatches,proposals:p.proposals,blockers:p.blockers,warnings:p.anomalies,runtimeTargets:['new results module under src/data/results/'+report.year,'src/data/results/index.ts (explicit append-only integration)','existing edition metadata if reviewed']})
  await save('proposal.json',{sourceUrl:o.url,sourceSha256:hash(html),observedAt:new Date().toISOString(),sourceMode:o.html?'OFFLINE_SNAPSHOT':'LIVE_GET',title:parsed.title,dates:parsed.dates,editions,groups:parsed.groups,...p})
  if(o.html)report.warnings.push('Offline snapshot: current official availability not verified')
 }else{
  const tables=[]
  for(const [gender,sex]of [['M','men'],['W','women']]){const url=`https://stats.protriathletes.org/t100/standings/${sex}`,html=await fetchSource(url);await save(sex+'.html',html);let t=matchStandings(parseFreshTop10(html,gender,o.season),data.athletes,mappings,data.normalize);t.source={method:'OFFICIAL_HTML',url,sha256:hash(html),observedAt:new Date().toISOString()};validateStandingsReview(t);tables.push(t)}
  await save('standings-proposal.json',{schemaVersion:1,approval:'PENDING',tables})
  await save('freshness-template.json',{afterRace:o['after-race'],reviewedBy:null,reviewedAt:null,statement:null,tables:tables.map(t=>({sourceUrl:t.sourceUrl,sha256:t.source.sha256,evidenceUrl:null,explanation:null}))})
  report.counts={MPRO:{top10:10},WPRO:{top10:10}};report.existingAthleteMatches=20;report.runtimeTargets=tables.map(t=>`src/data/officialStandings/t100/${t.seasonYear}-${t.gender==='M'?'men':'women'}.json`)
  report.changes=await Promise.all(tables.map(async(t,i)=>{let previous=null;try{previous=JSON.parse(await fs.readFile(report.runtimeTargets[i]))}catch(e){if(e.code!=='ENOENT')throw e}return {gender:t.gender,before:previous?.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints])??null,after:t.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints])}}))
  if(!o.freshness)report.blockers.push('Post-race freshness not proven: review both snapshot hashes against official post-race evidence and rerun with --freshness; no fallback to old snapshots')
  else { const freshness=JSON.parse(await fs.readFile(o.freshness)); verifyFreshness(freshness,tables,o['after-race']); await save('freshness.json',freshness) }
 }
 report.validation.source='PASS (strict parsing; identity/freshness blockers remain explicit)'
 }catch(e){report.blockers.push(e.message)}
 assert.deepEqual(await protectedFiles(),before,'Protected source files changed')
 report.validation.stableIDs='PASS: runtime sources unchanged';await save('integrity.json',{base,athletes:data.athletes.length,results:data.results.length,athleteIDs:data.athletes.map(a=>a.id),resultIDs:data.results.map(r=>r.id),athletesHash:hash(data.athletes),resultsHash:hash(data.results),protectedFiles:before})
 report.status=report.blockers.length?'BLOCKED':'READY_FOR_OWNER_REVIEW';report.files.push('review.json','review.md');await fs.writeFile(path.join(out,'review.json'),serialize(report),{flag:'wx'});await fs.writeFile(path.join(out,'review.md'),reviewMarkdown(report),{flag:'wx'});await sealBundle(out,report.files);console.log(report.status,out);if(report.blockers.length)process.exitCode=1
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error('STOP:',e.message);process.exitCode=1})
