import { createServer } from 'vite'
import fs from 'node:fs/promises'
import { auditAthleteLocalization } from './athlete-localization-audit.mjs'

const server = await createServer({ server:{middlewareMode:true}, appType:'custom', logLevel:'error' })

const norm = value => (value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’`.-]/g,' ').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()
const loose = value => norm(value).replace(/\s/g,'')
const isoLike = value => /^[A-Z]{2,3}$/.test((value ?? '').trim())
const VERBOSE = process.argv.includes('--verbose')

try {
  const [{ maleAthletes, femaleAthletes, resultAthletes, verifiedResultAthletes, athletes }, { raceResults }] = await Promise.all([
    server.ssrLoadModule('/src/data/athletes/index.ts'),
    server.ssrLoadModule('/src/data/results/index.ts'),
  ])
  const curated=[...maleAthletes,...femaleAthletes], generated=[...resultAthletes,...verifiedResultAthletes]
  const issues=[]
  const info=[]
  const localizationRegistry = JSON.parse(await fs.readFile(new URL('../src/data/athletes/athleteLocalization.json', import.meta.url), 'utf8'))
  const localizationIssues = auditAthleteLocalization(localizationRegistry, [...curated, ...generated], athletes)
  issues.push(...localizationIssues)
  info.push(`Localization registry: ${Object.keys(localizationRegistry).length} entries; consistency errors: ${localizationIssues.length}`)
  const byId=new Map(), byIdentity=new Map()
  for(const a of athletes){
    if(byId.has(a.id)) issues.push(`DUPLICATE ID: ${a.id} — ${byId.get(a.id)} / ${a.nameEn}`)
    byId.set(a.id,a.nameEn)
    const key=norm(a.nameEn||a.name)
    if(byIdentity.has(key)) issues.push(`DUPLICATE IDENTITY: ${byIdentity.get(key).nameEn} [${byIdentity.get(key).id}] / ${a.nameEn} [${a.id}]`)
    else byIdentity.set(key,a)
  }

  const curatedKeys=new Map(curated.map(a=>[norm(a.nameEn||a.name),a]))
  for(const a of generated){
    const key=norm(a.nameEn||a.name)
    if(curatedKeys.has(key)) issues.push(`CURATED/GENERATED DUPLICATE: ${curatedKeys.get(key).nameEn} [${curatedKeys.get(key).id}] / ${a.nameEn} [${a.id}]`)
    if(!a.gender) issues.push(`GENERATED MISSING GENDER: ${a.nameEn} [${a.id}]`)
    if(!a.countryCode) issues.push(`GENERATED MISSING COUNTRY: ${a.nameEn} [${a.id}]`)
  }

  const looseGroups=new Map()
  for(const a of athletes){
    const key=loose(a.nameEn||a.name); if(!key) continue
    const list=looseGroups.get(key)??[]; list.push(a); looseGroups.set(key,list)
  }
  for(const list of looseGroups.values()) if(list.length>1 && new Set(list.map(a=>norm(a.nameEn||a.name))).size>1)
    issues.push(`POSSIBLE NAME VARIANT: ${list.map(a=>`${a.nameEn} [${a.id}]`).join(' / ')}`)

  const resultCounts=new Map()
  for(const r of raceResults){
    const id=r.athleteId ?? byIdentity.get(norm(r.athleteName))?.id
    if(id!==undefined) resultCounts.set(id,(resultCounts.get(id)??0)+1)
  }

  const noResults=athletes.filter(a=>!resultCounts.has(a.id))
  const generatedIds=new Set(generated.map(a=>a.id))
  const localizedGenerated=athletes.filter(a=>generatedIds.has(a.id))
  const sameDisplay=localizedGenerated.filter(a=>a.name===a.nameEn)
  // The registry stores nameRu directly as the value of each exact English key.
  // Missing translations are coverage TODOs, never consistency errors.
  const hasRegistryNameRu = a => {
    const key = a.nameEn ?? a.name
    const value = localizationRegistry[key]
    return Object.hasOwn(localizationRegistry, key) && typeof value === 'string' &&
      value === value.trim() && /[А-Яа-яЁё]/.test(value)
  }
  const localizationTodo = localizedGenerated.filter(a => !/[А-Яа-яЁё]/.test(a.name))
  const coverage = profiles => {
    const ids = new Set(profiles.map(a => a.id))
    return `total ${profiles.length}; registry nameRu ${profiles.filter(hasRegistryNameRu).length}; without registry nameRu ${profiles.filter(a => !hasRegistryNameRu(a)).length}; without Russian display name (TODO) ${localizationTodo.filter(a => ids.has(a.id)).length}`
  }
  const rawCountryLabels=athletes.filter(a=>isoLike(a.country)||isoLike(a.countryEn))
  const noPhoto=athletes.filter(a=>!a.image)

  info.push(`Profiles: ${athletes.length} (curated ${curated.length}, generated ${generated.length})`)
  info.push(`Generated localization coverage: ${coverage(generated)}`)
  info.push(`  resultAthletes: ${coverage(resultAthletes)}`)
  info.push(`  verifiedResultAthletes: ${coverage(verifiedResultAthletes)}`)
  info.push(`Generated with English-only display name: ${sameDisplay.length}`)
  info.push(`Profiles still showing code-like country labels: ${rawCountryLabels.length}`)
  info.push(`Profiles without countryCode: ${athletes.filter(a=>!a.countryCode).length}`)
  info.push(`Profiles without photo: ${noPhoto.length}`)
  info.push(`Profiles without linked result rows: ${noResults.length}`)

  console.log('\nTRI APP — ATHLETE CATALOG AUDIT')
  console.log('================================')
  info.forEach(x=>console.log(`INFO  ${x}`))
  console.log(`\nISSUES (${issues.length})`)
  if(!issues.length) console.log('  none')
  else if(VERBOSE) issues.forEach(x=>console.log(`  - ${x}`))
  else console.log('  Run npm run audit:athletes -- --verbose to list all issues.')
  if(VERBOSE){
    console.log(`\nLOCALIZATION TODO (${localizationTodo.length})`)
    localizationTodo.forEach(a=>console.log(`  - ${a.nameEn} [${a.id}] — ${a.countryCode||'?'}`))
    console.log(`\nMISSING COUNTRY (${generated.filter(a=>!a.countryCode).length})`)
    generated.filter(a=>!a.countryCode).forEach(a=>console.log(`  - ${a.nameEn} [${a.id}]`))
    console.log(`\nNO LINKED RESULTS (${noResults.length})`)
    noResults.forEach(a=>console.log(`  - ${a.nameEn} [${a.id}]`))
  }
} finally { await server.close() }
