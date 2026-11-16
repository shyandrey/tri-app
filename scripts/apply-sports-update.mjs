import fs from 'node:fs/promises'
import {testContext} from './sports-test-context.mjs'
import path from 'node:path'
import os from 'node:os'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import ts from 'typescript'
import {createServer} from 'vite'
import {digest, json, safePath, readBundle, verifyBundle} from './sports-candidate.mjs'
import {parseStatsPtoResults, validateSourceURL, proposeResults} from './import-race-results.mjs'
import {selectEditions, prepareRace, matchStandings, verifyFreshness, validateStandingsReview} from './prepare-sports-update.mjs'
import {parseFreshTop10} from './prepare-t100-standings.mjs'

const indexPath = 'src/data/results/index.ts'
const localizationPath = 'src/data/athletes/athleteLocalization.json'
const mappingsPath = 'src/data/athletes/ptoProfileMappings.json'
const generatedPath = 'src/data/athletes/resultAthletes.generated.ts'
const git = (root, args) => execFileSync('git', args, {cwd:root, encoding:'utf8'}).trim()
const read = (root, file) => fs.readFile(path.join(root, safePath(file)), 'utf8')
const parse = (bundle, f) => JSON.parse(bundle.files[f])
const plain = x => JSON.parse(JSON.stringify(x))
async function write(root, file, text) { await fs.mkdir(path.dirname(path.join(root, file)), {recursive:true}); await fs.writeFile(path.join(root, file), text) }
async function snapshot(root) {
  const paths = git(root, ['ls-files', 'src', 'scripts/fixtures']).split('\n').filter(Boolean)
  return Object.fromEntries(await Promise.all(paths.map(async f => [f, digest(await read(root, f))])) )
}
export async function baseline(root, expected) {
  assert.equal(git(root, ['rev-parse', 'HEAD']), expected, 'Git baseline changed')
  assert.equal(git(root, ['status', '--porcelain', '--untracked-files=all', '--', 'src', 'scripts/fixtures']), '', 'Runtime/evidence checkout must be clean')
}
export async function loadRuntime(root) {
  const server = await createServer({root, configFile:false, server:{middlewareMode:true, hmr:false, watch:null}, appType:'custom', logLevel:'silent'})
  try {
    const [a,r,e,n] = await Promise.all(['athletes/index','results/index','raceEditions','athleteIdentity'].map(f => server.ssrLoadModule('/src/data/'+f+'.ts')))
    return {athletes:plain(a.athletes), results:plain(r.raceResults), editions:plain(e.allRaceEditionViews), normalize:n.normalizeAthleteIdentityName}
  } finally { await server.close() }
}
async function sandbox(root) {
  const stage = await fs.mkdtemp(path.join(os.tmpdir(), '300w-sports-stage-'))
  // Copy the reviewed local tooling as well as tracked source; never use the damaged store.
  const files = new Set(git(root, ['ls-files']).split('\n').filter(f=>f.startsWith('src/')||f.startsWith('scripts/')||/^package(?:-lock)?\.json$/.test(f)||/^tsconfig.*\.json$/.test(f)))
  for (const name of await fs.readdir(path.join(root,'scripts'))) if(name.endsWith('.mjs')) files.add('scripts/'+name)
  for (const f of files) { const stat=await fs.lstat(path.join(root,f)); assert.ok(stat.isFile(),'Unsupported tracked symlink'); await fs.mkdir(path.dirname(path.join(stage,f)),{recursive:true}); await fs.copyFile(path.join(root,f),path.join(stage,f)) }
  await fs.symlink(await fs.realpath(path.join(root,'node_modules')),path.join(stage,'node_modules'),'dir')
  return stage
}
export function appendIndex(source, module, symbol) {
  assert.match(module, /^src\/data\/results\/20\d{2}\/[a-z0-9-]+\/[a-z0-9-]+\.ts$/)
  assert.match(symbol, /^[A-Za-z][A-Za-z0-9]*Results$/)
  assert.ok(!source.includes(symbol),'Duplicate result export')
  const ast = ts.createSourceFile(indexPath,source,ts.ScriptTarget.Latest,true)
  const declarations=ast.statements.filter(ts.isVariableStatement).flatMap(s=>s.declarationList.declarations).filter(d=>d.name.getText(ast)==='allResults')
  assert.equal(declarations.length,1,'Unsupported results index')
  const array=declarations[0].initializer
  assert.ok(ts.isArrayLiteralExpression(array),'Unsupported allResults shape')
  assert.ok(array.elements.every(ts.isSpreadElement),'Unsupported allResults elements')
  const insertion=array.end-1
  assert.ok(source.slice(array.elements.at(-1).end,insertion).includes(','),'Expected trailing comma')
  return `import { ${symbol} } from '${module.replace('src/data/results/','./').slice(0,-3)}'\n`+source.slice(0,insertion)+`  ...${symbol},\n`+source.slice(insertion)
}
export function applySof(source, editions, proposals) {
  const ast=ts.createSourceFile('raceEditions.ts',source,ts.ScriptTarget.Latest,true)
  const decls=ast.statements.filter(ts.isVariableStatement).flatMap(s=>s.declarationList.declarations)
  const season=decls.find(d=>d.name.getText(ast)==='CURRENT_SEASON')?.initializer
  const object=decls.find(d=>d.name.getText(ast)==='currentSeasonSofByRaceId')?.initializer
  assert.ok(object&&ts.isObjectLiteralExpression(object),'Unsupported SOF registry')
  const additions=new Map()
  for(const e of editions){
    assert.equal(Number(e.dateISO.slice(0,4)),Number(season?.getText(ast)),'Historical SOF edit requires separate review')
    const sof=proposals.find(p=>p.editionId===e.editionId)?.sof
    if(!sof||!Object.keys(sof).length)continue
    const existing=object.properties.find(p=>ts.isPropertyAssignment(p)&&p.name.text===e.raceId)
    if(existing){ assert.deepEqual(JSON.parse(existing.initializer.getText(ast).replace(/(women|men)\s*:/g,'"$1":')), {...e.sof,...sof},'Existing SOF differs: explicit separate review required'); continue }
    additions.set(e.raceId,{...additions.get(e.raceId),...sof})
  }
  if(!additions.size)return source
  const text=[...additions].map(([id,sof])=>`  ${JSON.stringify(id)}: ${JSON.stringify(sof)},\n`).join('')
  return source.slice(0,object.getStart(ast)+1)+'\n'+text+source.slice(object.getStart(ast)+1)
}
export function assertHistory(before, after, newProfiles, newRows) {
  const ids=new Set(after.athletes.map(a=>a.id)); assert.equal(ids.size,after.athletes.length,'Duplicate athlete ID')
  for(const old of before.athletes)assert.deepEqual(after.athletes.find(a=>a.id===old.id),old,'Historical athlete changed')
  assert.deepEqual(after.results.slice(0,before.results.length),before.results,'Historical results changed')
  assert.equal(after.results.length,before.results.length+newRows)
  assert.equal(after.athletes.length,before.athletes.length+newProfiles)
  assert.equal(new Set(after.results.map(r=>r.id)).size,after.results.length,'Duplicate result IDs')
}
function checkBundle(bundle, base, hashes, context) {
  verifyBundle(bundle)
  const integrity=parse(bundle,'integrity.json')
  assert.equal(integrity.base,base,'Prepared bundle has stale Git base')
  for(const [f,h]of Object.entries(integrity.protectedFiles))assert.equal(hashes[f],h,'Prepared runtime baseline changed: '+f)
  const report=parse(bundle,'review.json');assert.deepEqual(report.testOnly??null,context,'Fixture bundle cannot leave its test repository');return report
}
// Deterministic staging: only existing importer and append-only generator write here.
export async function generate(root, inputs, {verifyBaseline=baseline, captureSnapshot=snapshot, createStage=sandbox} = {}) {
  const base=inputs.base; await verifyBaseline(root,base);const context=await testContext(root)
  const hashes=await captureSnapshot(root), before=await loadRuntime(root)
  const stage=await createStage(root), changed=new Set(), evidence='scripts/fixtures/sports-updates/'+digest(json(inputs)).slice(0,20)
  const put=async(f,text)=>{await write(stage,f,text);changed.add(f)}
  let newRows=0,newProfiles=0, raceSummary=null,standingsSummary=null
  try {
    if(inputs.race){
      const {bundle,decisions:d}=inputs.race,report=checkBundle(bundle,base,hashes,context), proposal=parse(bundle,'proposal.json')
      assert.equal(report.kind,'results');assert.ok(Number.isFinite(Date.parse(d.reviewedAt)),'Editorial review date required');const url=validateSourceURL(proposal.sourceUrl),html=bundle.files['source.html']
      assert.equal(digest(html),proposal.sourceSha256);assert.ok(html.includes(`rel="canonical" href="${url}"`),'Source canonical mismatch')
      const parsed=parseStatsPtoResults(html), editions=selectEditions(proposal.editions.map(e=>e.editionId),url,before.editions,parsed)
      const maps=JSON.parse(await read(root,mappingsPath)), loc=JSON.parse(await read(root,localizationPath))
      const p=prepareRace(parsed,editions,before.results,before.athletes,before.normalize,maps.mappings)
      assert.deepEqual(p.rows,proposal.rows,'Result proposal differs from source replay')
      assert.ok(p.blockers.every(b=>b.startsWith('Unmatched athletes require')),'Identity/country/time conflict')
      assert.ok(Array.isArray(d.newAthletes),'Explicit newAthletes list required')
      const unmatched=[...new Map(p.unmatched.map(a=>[a.athleteName,a])).values()]
      assert.equal(d.newAthletes.length,unmatched.length,'Unknown/unreviewed athlete')
      assert.equal(new Set(d.newAthletes.map(a=>a.nameEn)).size,d.newAthletes.length)
      for(const a of d.newAthletes){
        const source=unmatched.find(u=>u.athleteName===a.nameEn)
        assert.ok(source&&a.identityConfirmed===true,'Explicit identity review required')
        assert.equal(a.profileUrl,'https://stats.protriathletes.org'+source.athletePath)
        assert.match(a.countryCode,/^[A-Z]{2}$/);assert.equal(a.countryCode,source.countryCode,'Country absent/conflicting: separate source review required')
        assert.ok(typeof a.nameRu==='string'&&a.nameRu.trim()===a.nameRu&&/[А-Яа-яЁё]/.test(a.nameRu),'Reviewed Russian name required')
        assert.ok(!maps.mappings.some(m=>m.url===a.profileUrl),'Profile URL already mapped')
        assert.ok(!Object.hasOwn(loc,a.nameEn),'Existing localization must not be overwritten')
        loc[a.nameEn]={nameRu:a.nameRu,provenance:'manual-approved'}
      }
      assert.match(d.module,/^src\/data\/results\/20\d{2}\/[a-z0-9-]+\/[a-z0-9-]+\.ts$/)
      assert.equal(d.module.split('/')[3],String(report.year));assert.match(d.export,/^[A-Za-z][A-Za-z0-9]*Results$/)
      await put(evidence+'/source.html',html)
      const args=['scripts/import-race-results.mjs','--url',url,...editions.flatMap(e=>['--race',e.editionId]),'--html',path.join(stage,evidence,'source.html'),'--write','--out',d.module,'--export',d.export]
      execFileSync(process.execPath,args,{cwd:stage,stdio:'pipe',timeout:60000})
      changed.add(d.module)
      const stem=path.basename(d.module,'.ts')+'-'+report.year
      const ef='scripts/fixtures/result-imports/'+stem+'.json', hf='scripts/fixtures/result-imports/'+stem+'.html'
      const imported=JSON.parse(await read(stage,ef));imported.retrievedAt=proposal.observedAt
      await put(ef,json(imported));changed.add(hf)
      await put(indexPath,appendIndex(await read(root,indexPath),d.module,d.export))
      if(d.newAthletes.length){
        await put(localizationPath,json(loc))
        execFileSync(process.execPath,['scripts/find-next-athletes.mjs','--write','--append'],{cwd:stage,stdio:'pipe',timeout:60000})
        changed.add(generatedPath)
        const intermediate=await loadRuntime(stage), added=intermediate.athletes.filter(a=>!before.athletes.some(b=>b.id===a.id))
        assert.equal(added.length,d.newAthletes.length,'Append discovered unrelated identities')
        for(const a of d.newAthletes){const found=added.find(b=>b.nameEn===a.nameEn);assert.ok(found,'Append identity mismatch');assert.equal(found.countryCode,a.countryCode)
          maps.mappings.push({id:found.id,name:a.nameEn,url:a.profileUrl,approvedBy:'owner',approvedAt:d.reviewedAt,approvalScope:'URL_IDENTITY_ONLY',approvalSource:evidence+'/decisions.json',fieldApproval:'NOT_GRANTED',fieldReviewFlags:[]})}
        await put(mappingsPath,json(maps))
      }
      assert.equal(typeof d.applySof,'boolean','Explicit applySof decision required')
      if(d.applySof)await put('src/data/raceEditions.ts',applySof(await read(root,'src/data/raceEditions.ts'),editions,p.editionSof))
      await put(evidence+'/decisions.json',json(d))
      newRows=p.rows.length;newProfiles=d.newAthletes.length
      const after=await loadRuntime(stage)
      assert.deepEqual(after.results.slice(before.results.length),p.rows.map((r,i)=>({...r,id:before.results.length+i+1})),'Imported results differ from official source')
      const verified=proposeResults(parsed,editions,[],after.athletes,after.normalize)
      assert.equal(verified.unmatched.length,0);assert.equal(verified.matches.length,newRows)
      raceSummary={editions:editions.map(e=>e.editionId),counts:p.counts,newAthletes:after.athletes.filter(a=>!before.athletes.some(b=>b.id===a.id)).map(a=>({id:a.id,nameEn:a.nameEn,name:a.name,countryCode:a.countryCode})),matches:verified.matches,anomalies:p.anomalies}
    }
    if(inputs.standings){
      const {bundle}=inputs.standings, report=checkBundle(bundle,base,hashes,context)
      assert.equal(report.kind,'t100');assert.equal(report.status,context&&bundle.files['fixture-provenance.json']?'READY_FOR_TEST_REVIEW':'READY_FOR_OWNER_REVIEW','Standings freshness unresolved')
      const previous=parse(bundle,'standings-proposal.json'),runtime=await loadRuntime(stage),maps=JSON.parse(await read(stage,mappingsPath)),tables=[]
      assert.equal(previous.tables.length,2)
      for(const [gender,sex]of [['M','men'],['W','women']]){
        const old=previous.tables.find(t=>t.gender===gender);assert.ok(old)
        const html=bundle.files[sex+'.html'];assert.equal(digest(html),old.source.sha256)
        const t=matchStandings(parseFreshTop10(html,gender,report.year),runtime.athletes,maps.mappings,runtime.normalize)
        t.source=old.source;validateStandingsReview(t);assert.deepEqual(t.rows,old.rows,'Standings proposal/source mismatch');tables.push(t)
      }
      let freshness
      if(bundle.files['fixture-provenance.json']){
        assert.ok(context,'Offline standings require test repository');const fixture=parse(bundle,'fixture-provenance.json')
        for(const t of tables){const f=fixture.tables.find(r=>r.gender===t.gender);assert.ok(f&&f.sourceUrl===t.sourceUrl&&f.snapshotSha256===t.source.sha256);assert.equal(t.source.observedAt,fixture.observedAt);assert.deepEqual(t.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints,r.athleteName,r.nationalityNormalized]),f.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints,r.athleteName,r.nationalityNormalized]))}
        freshness={reviewedAt:fixture.observedAt,testOnly:context,freshness:'NOT_ASSERTED'}
      }else{freshness=parse(bundle,'freshness.json');assert.equal(Number(new URL(validateSourceURL(freshness.afterRace)).pathname.split('/')[3]),report.year,'Freshness season mismatch');verifyFreshness(freshness,tables,freshness.afterRace)}
      for(const t of tables){
        const sex=t.gender==='M'?'men':'women',target=`src/data/officialStandings/t100/${t.seasonYear}-${sex}.json`
        const old=JSON.parse(await read(root,target));assert.equal(old.seasonStatus,'LIVE','Historical/new season needs separate review')
        const snap=evidence+'/'+sex+'.html';await put(snap,bundle.files[sex+'.html'])
        const provenance={type:'OFFICIAL_HTML_SNAPSHOT',htmlVerified:true,snapshot:snap,snapshotSha256:t.source.sha256,localApplicationApproval:{date:freshness.reviewedAt.slice(0,10),scope:'OWNER_AUTHORIZED_TOP10_LOCAL_CANDIDATE_ONLY'}}
        await put(target,json({schemaVersion:1,...(context?{testOnly:context}:{}),series:'T100',coverage:'TOP_10_ONLY',seasonYear:t.seasonYear,gender:t.gender,seasonStatus:'LIVE',sourceUrl:t.sourceUrl,sourceObservedAt:t.source.observedAt,verifiedAt:freshness.reviewedAt.slice(0,10),sourceVerificationStatus:'OFFICIAL_HTML_VERIFIED',provenance,rows:t.rows.map(({displayNameRu: _displayNameRu,...r})=>({...r,sourceUrl:t.sourceUrl,sourceObservedAt:t.source.observedAt,verifiedAt:freshness.reviewedAt.slice(0,10),sourceVerificationStatus:'OFFICIAL_HTML_VERIFIED',provenance:{type:'OFFICIAL_HTML_SNAPSHOT',snapshot:snap,snapshotSha256:t.source.sha256}}))}))
      }
      await put(evidence+'/freshness.json',json(freshness));standingsSummary=tables.map(t=>({gender:t.gender,year:t.seasonYear,rows:t.rows}))
    }
    assert.ok(inputs.race||inputs.standings,'Empty candidate')
    const after=await loadRuntime(stage);assertHistory(before,after,newProfiles,newRows)
    const files=[]
    for(const f of [...changed].sort()){
      const text=await read(stage,f),old=await read(root,f).catch(e=>{if(e.code!=='ENOENT')throw e;return null})
      if(text!==old)files.push({path:f,before:old===null?null:digest(old),after:digest(text),text})
    }
    assert.ok(files.length,'No changes')
    assert.deepEqual(await captureSnapshot(root),hashes,'Runtime changed during planning')
    return {schemaVersion:1,...(context?{testOnly:context}:{}),base,baseline:hashes,inputs,files,summary:{athletesBefore:before.athletes.length,athletesAfter:after.athletes.length,resultsBefore:before.results.length,resultsAfter:after.results.length,race:raceSummary,standings:standingsSummary}}
  } finally { await fs.rm(stage,{recursive:true,force:true}) }
}

export function verifyApproval(candidate,text,approval) {
  assert.equal(approval.schemaVersion,1)
  assert.deepEqual(approval.testOnly??null,candidate.testOnly??null,'Approval fixture scope mismatch')
  assert.equal(approval.action,candidate.testOnly?'APPLY_TEST_FIXTURE_ONLY':'APPLY_LOCAL_ONLY','Approval is not local integration approval')
  assert.ok(typeof approval.approvedBy==='string'&&approval.approvedBy.trim(),'Owner identity required')
  assert.ok(Number.isFinite(Date.parse(approval.approvedAt)),'Approval date required')
  assert.equal(approval.candidateSha256,digest(text),'Approval/candidate digest mismatch')
  assert.deepEqual(approval.files,candidate.files.map(({path,before,after})=>({path,before,after})),'Approval scope mismatch')
}
// Per-file atomic replacement with rollback on caught failures; durable external journal
// remains for manual recovery after process termination/power loss. Never auto-resume.
export async function transaction(root,files,journal,{beforeReplace=async()=>{}}={}) {
  const backups=[],done=[],temps=[]
  assert.equal(new Set(files.map(f=>f.path)).size,files.length,'Duplicate destination')
  await fs.mkdir(journal,{recursive:false})
  const check=async(f)=>{
    const relative=safePath(f.path);let current=root
    for(const part of relative.split('/')){current=path.join(current,part);const s=await fs.lstat(current).catch(e=>{if(e.code==='ENOENT')return null;throw e});assert.ok(!s?.isSymbolicLink(),'Refusing symlink destination')}
    const old=await read(root,relative).catch(e=>{if(e.code!=='ENOENT')throw e;return null})
    assert.equal(old===null?null:digest(old),f.before,'Destination changed: '+relative);assert.equal(digest(f.text),f.after);return old
  }
  for(const f of files)backups.push({path:f.path,text:await check(f)})
  await fs.writeFile(path.join(journal,'originals.json'),json(backups),{flag:'wx'})
  await fs.writeFile(path.join(journal,'plan.json'),json(files),{flag:'wx'})
  try{
    for(const f of files){await fs.mkdir(path.dirname(path.join(root,f.path)),{recursive:true});const tmp=path.join(root,f.path)+'.sports-'+randomUUID();await fs.writeFile(tmp,f.text,{flag:'wx'});temps.push(tmp)}
    for(const [i,f]of files.entries()){await beforeReplace(i);await check(f);await fs.rename(temps[i],path.join(root,f.path));done.push(i)}
    await fs.writeFile(path.join(journal,'result.json'),json({status:'APPLIED',files:files.map(f=>f.path)}),{flag:'wx'})
  }catch(error){
    const recovery=[]
    for(const i of done.reverse())try{
      const f=files[i],b=backups[i];assert.equal(digest(await read(root,f.path)),f.after,'Concurrent edit: manual recovery required')
      if(b.text===null)await fs.unlink(path.join(root,f.path));else{const tmp=path.join(root,f.path)+'.restore-'+randomUUID();await fs.writeFile(tmp,b.text,{flag:'wx'});await fs.rename(tmp,path.join(root,f.path))}
    }catch(e){recovery.push(e.message)}
    await fs.writeFile(path.join(journal,'failure.json'),json({error:error.message,recovery}),{flag:'wx'})
    throw Error(`${error.message}; ${recovery.length?'MANUAL RECOVERY REQUIRED':'original file contents restored'}; journal: ${journal}`)
  }finally{for(const tmp of temps)await fs.rm(tmp,{force:true})}
}
function args(values) {const result={};for(let i=0;i<values.length;i+=2){const key=values[i];assert.ok(['--request','--out','--candidate','--approval'].includes(key)&&values[i+1]&&!Object.hasOwn(result,key),'Invalid/duplicate option');result[key]=path.resolve(values[i+1])}return result}
async function main(){
  const mode=process.argv[2],o=args(process.argv.slice(3)),root=process.cwd()
  if(mode==='plan'){
    assert.deepEqual(Object.keys(o).sort(),['--out','--request'])
    const out=o['--out'],realRoot=await fs.realpath(root),realParent=await fs.realpath(path.dirname(out))
    assert.ok(realParent!==realRoot&&!realParent.startsWith(realRoot+path.sep),'External output parent required')
    assert.equal(await fs.lstat(out).then(()=>true,e=>{if(e.code==='ENOENT')return false;throw e}),false,'Output already exists')
    const request=JSON.parse(await fs.readFile(o['--request'],'utf8')),inputs={base:git(root,['rev-parse','HEAD'])}
    if(request.race)inputs.race={bundle:await readBundle(request.race.bundle),decisions:request.race.decisions}
    if(request.standings)inputs.standings={bundle:await readBundle(request.standings.bundle)}
    const candidate=await generate(root,inputs),text=json(candidate)
    assert.ok(!out.startsWith(root+path.sep)&&out!==root,'External output required');await fs.mkdir(out)
    await fs.writeFile(path.join(out,'candidate.json'),text,{flag:'wx'})
    await fs.writeFile(path.join(out,'approval-template.json'),json({schemaVersion:1,...(candidate.testOnly?{testOnly:candidate.testOnly}:{}),action:candidate.testOnly?'APPLY_TEST_FIXTURE_ONLY':'APPLY_LOCAL_ONLY',candidateSha256:digest(text),approvedBy:null,approvedAt:null,files:candidate.files.map(({path,before,after})=>({path,before,after}))}),{flag:'wx'})
    await fs.writeFile(path.join(out,'review.json'),json(candidate.summary),{flag:'wx'})
    console.log(json({status:'AWAITING_OWNER_REVIEW',candidateSha256:digest(text),files:candidate.files.map(f=>f.path),summary:candidate.summary}))
  }else if(mode==='apply'){
    assert.deepEqual(Object.keys(o).sort(),['--approval','--candidate'])
    const text=await fs.readFile(o['--candidate'],'utf8'),candidate=JSON.parse(text),approval=JSON.parse(await fs.readFile(o['--approval'],'utf8'))
    assert.deepEqual(candidate.testOnly??null,await testContext(root),'Fixture approval cannot authorize another repository');verifyApproval(candidate,text,approval);await baseline(root,candidate.base)
    assert.deepEqual(await snapshot(root),candidate.baseline,'Historical baseline changed')
    const lock=path.join(root,'.sports-apply.lock');const handle=await fs.open(lock,'wx')
    try{
      const replay=await generate(root,candidate.inputs);assert.deepEqual(replay,candidate,'Candidate differs from deterministic source replay')
      await baseline(root,candidate.base);assert.deepEqual(await snapshot(root),candidate.baseline)
      const journal=path.join(os.tmpdir(),'300w-sports-apply-'+randomUUID())
      await transaction(root,candidate.files,journal)
      console.log(json({status:'APPLIED_LOCAL_ONLY',candidateSha256:digest(text),journal,files:candidate.files.map(({path,before,after})=>({path,before,after})),summary:candidate.summary}))
    }finally{await handle.close();await fs.unlink(lock)}
  }else throw Error('Use plan or apply')
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error('STOP:',e.message);process.exitCode=1})
