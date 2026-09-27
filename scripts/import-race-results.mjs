import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

export function parseStatsPtoResults(html) {
  const child = spawnSync('python3', [fileURLToPath(new URL('./parse-stats-pto-results.py', import.meta.url))], {input:html,encoding:'utf8',maxBuffer:8*1024*1024})
  if (child.error || child.status !== 0) throw new Error(child.error?.message ?? child.stderr)
  return JSON.parse(child.stdout)
}
export function validateSourceURL(value) {
  const url = new URL(value)
  if (url.origin !== 'https://stats.protriathletes.org' || !/^\/race\/[a-z0-9-]+\/\d{4}\/results$/.test(url.pathname) || url.search || url.hash) throw new Error('Use an explicit, clean Stats PTO race/year/results URL')
  return url.href
}
// Edition-scoped metadata proposal: human review applies it to the existing
// edition definition. Never silently replace an already stored source value.
export function proposeEditionSof(parsed, editions) {
  return editions.map(edition => {
    const sof = {}, missing = []
    for (const gender of edition.gender === 'WPRO' ? ['W'] : edition.gender === 'MPRO' ? ['M'] : ['M', 'W']) {
      const key = gender === 'M' ? 'men' : 'women'
      const value = parsed.groups.find(group => group.gender === gender)?.sof
      if (value === undefined) { missing.push(key); continue }
      if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid source SOF: ${edition.editionId}/${key}`)
      if (edition.sof?.[key] !== undefined && edition.sof[key] !== value) throw new Error(`SOF conflict: ${edition.editionId}/${key}: stored ${edition.sof[key]}, source ${value}`)
      sof[key] = value
    }
    return {editionId: edition.editionId, sof, missing}
  })
}
export function proposeResults(parsed, editions, existing, athletes, normalize) {
  const editionSof = proposeEditionSof(parsed, editions)
  const seen = new Set(), anomalies = [], unmatched = [], matches = []
  const byName = new Map()
  for (const athlete of athletes) {
    const key = normalize(athlete.nameEn ?? '')
    if (!key) continue
    if (byName.has(key)) throw new Error(`Ambiguous catalog identity: ${key}`)
    byName.set(key, athlete)
  }
  const rows = []
  for (const edition of editions) {
    if (existing.some(r=>r.raceEditionId===edition.editionId)) throw new Error(`Edition already has results: ${edition.editionId}`)
    const groups = parsed.groups.filter(g=>edition.gender==='WPRO'?g.gender==='W':edition.gender==='MPRO'?g.gender==='M':true)
    if (!groups.length) throw new Error(`No matching professional field: ${edition.editionId}`)
    for (const group of groups) for (const source of group.rows) {
      const row = {...source.result,raceEditionId:edition.editionId}
      const key = `${edition.editionId}:${row.gender}:${normalize(row.athleteName)}`
      if (seen.has(key)) throw new Error(`Duplicate result: ${key}`)
      seen.add(key)
      const athlete = byName.get(normalize(row.athleteName))
      if (athlete) {
        if (athlete.gender && athlete.gender!==row.gender) throw new Error(`Gender conflict: ${row.athleteName}`)
        matches.push({athleteName:row.athleteName,athleteId:athlete.id,athletePath:source.athletePath})
        const canonical = c=>({ZAF:'ZA',LVA:'LV'}[c]??c)
        if (athlete.countryCode && row.countryCode && canonical(athlete.countryCode)!==row.countryCode) anomalies.push({type:'country-conflict',athleteName:row.athleteName,catalog:athlete.countryCode,source:row.countryCode})
      } else unmatched.push({athleteName:row.athleteName,gender:row.gender,countryCode:row.countryCode,athletePath:source.athletePath})
      const fields=['swimTime','t1Time','bikeTime','t2Time','runTime']
      const missing=fields.filter(f=>!row[f])
      if (missing.length) anomalies.push({type:'missing-splits',athleteName:row.athleteName,status:row.position,fields:missing})
      const seconds=t=>t.split(':').reduce((s,p)=>s*60+Number(p),0)
      if (typeof row.position==='number' && row.totalTime && !missing.length) {
        const delta=fields.reduce((s,f)=>s+seconds(row[f]),0)-seconds(row.totalTime)
        if(Math.abs(delta)>5)anomalies.push({type:'split-total-mismatch',athleteName:row.athleteName,seconds:delta})
      }
      rows.push(row)
    }
  }
  return {rows,matches,unmatched,anomalies,editionSof}
}
async function main() {
  const args=process.argv.slice(2), options={}, races=[]
  for(let i=0;i<args.length;i++) {
    const arg=args[i]
    if(arg==='--write'){options.write=true;continue}
    if(!['--url','--race','--out','--export','--html'].includes(arg)||!args[i+1]||args[i+1].startsWith('--'))throw new Error(`Invalid argument ${arg}`)
    const value=args[++i];if(arg==='--race')races.push(value);else options[arg.slice(2)]=value
  }
  if(!races.length||new Set(races).size!==races.length)throw new Error('Provide unique --race edition IDs (repeat for separate gender editions)')
  const url=validateSourceURL(options.url)
  const html=options.html?await fs.readFile(options.html,'utf8'):await (async()=>{const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text()})()
  if(!html.includes(`<link rel="canonical" href="${url}"`))throw new Error('Canonical source URL mismatch')
  const parsed=parseStatsPtoResults(html)
  const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'silent'})
  let proposal,editions
  try {
    const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
    const {raceResults}=await server.ssrLoadModule('/src/data/results/index.ts')
    const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
    const {normalizeAthleteIdentityName}=await server.ssrLoadModule('/src/data/athleteIdentity.ts')
    editions=races.map(id=>{const e=allRaceEditionViews.find(e=>e.editionId===id);if(!e)throw new Error(`Unknown edition: ${id}`);if(e.statsPtoUrl!==url)throw new Error(`Edition/source mismatch: ${id}`);if(e.dateISO>new Date().toISOString().slice(0,10))throw new Error(`Future edition: ${id}`);return e})
    proposal=proposeResults(parsed,editions,raceResults,athletes,normalizeAthleteIdentityName)
  } finally {await server.close()}
  console.log(JSON.stringify({source:url,title:parsed.title,editions:races,editionSof:proposal.editionSof,counts:editions.map(e=>({edition:e.editionId,count:proposal.rows.filter(r=>r.raceEditionId===e.editionId).length})),unmatched:proposal.unmatched,anomalies:proposal.anomalies},null,2))
  if(!options.write){console.log('DRY RUN: no files written. Review identities/anomalies, then use --write --out <file.ts> --export <identifier>.');return}
  if(!/^[a-zA-Z_$][\w$]*$/.test(options.export??''))throw new Error('Provide a valid --export identifier')
  const output=path.resolve(options.out??'')
  const year=new URL(url).pathname.split('/')[3]
  if(!output.startsWith(path.resolve(`src/data/results/${year}`)+path.sep)||!output.endsWith('.ts'))throw new Error('--out must be a new TS file under the matching results season')
  const evidenceDir=path.resolve('scripts/fixtures/result-imports')
  const stem=path.basename(output,'.ts')+'-'+year
  const evidencePath=path.join(evidenceDir,stem+'.json'), snapshotPath=path.join(evidenceDir,stem+'.html')
  for(const p of [output,evidencePath,snapshotPath]){try{await fs.access(p)}catch(e){if(e.code==='ENOENT')continue;throw e}throw new Error(`Refusing overwrite: ${p}`)}
  const evidence={sourceUrl:url,retrievedAt:new Date().toISOString(),sourceSha256:createHash('sha256').update(html).digest('hex'),snapshot:path.relative(process.cwd(),snapshotPath),title:parsed.title,sourceDates:parsed.dates,editions:editions.map(e=>({editionId:e.editionId,raceId:e.raceId,dateISO:e.dateISO,gender:e.gender})),groups:parsed.groups,...proposal}
  const content=`import type { RaceResult } from '../../../../types/RaceResult'\n\n// Source: ${url}\n// Evidence: ${path.relative(process.cwd(),evidencePath)}\n// Local IDs are replaced by the global results index after all seasons are combined.\nexport const ${options.export}: RaceResult[] = ${JSON.stringify(proposal.rows.map((r,i)=>({id:i+1,...r})),null,2)}\n`
  await fs.mkdir(path.dirname(output),{recursive:true});await fs.mkdir(evidenceDir,{recursive:true})
  const written=[]
  try{for(const [p,data]of [[output,content],[evidencePath,JSON.stringify(evidence,null,2)+'\n'],[snapshotPath,html]]){await fs.writeFile(p,data,{flag:'wx'});written.push(p)}}catch(e){for(const p of written)await fs.unlink(p);throw e}
  console.log(`Wrote proposed result module and evidence (including editionSof). Next: review/apply source SOF to the explicitly selected existing editions without overwriting conflicts; explicitly wire ${options.export} into results/index.ts; run identity pipeline, audits and human review.`)
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(e=>{console.error(e.message);process.exitCode=1})
