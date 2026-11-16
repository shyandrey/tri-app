import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {digest,json,verifyBundle,readBundle,sealBundle} from './sports-candidate.mjs'
import {generate,baseline,loadRuntime,verifyApproval,transaction,appendIndex,assertHistory} from './apply-sports-update.mjs'
import {parseStatsPtoResults,proposeResults} from './import-race-results.mjs'
import {parseFreshTop10} from './prepare-t100-standings.mjs'
import {matchStandings} from './prepare-sports-update.mjs'
const root=process.cwd(),base='1'.repeat(40)
const write=async(root,f,text)=>{await fs.mkdir(path.dirname(path.join(root,f)),{recursive:true});await fs.writeFile(path.join(root,f),text)}
const read=(root,f)=>fs.readFile(path.join(root,f),'utf8')
async function snap(root){
 const files={};async function visit(dir){for(const d of await fs.readdir(path.join(root,dir),{withFileTypes:true})){const f=dir+'/'+d.name;if(d.isDirectory())await visit(f);else files[f]=digest(await fs.readFile(path.join(root,f)))}}
 await visit('src');return files
}
async function stage(root){const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sports-test-stage-'));for(const f of ['src','scripts','package.json'])await fs.cp(path.join(root,f),path.join(dir,f),{recursive:true});await fs.symlink(await fs.realpath(path.join(root,'node_modules')),path.join(dir,'node_modules'),'dir');return dir}
const hooks={verifyBaseline:async(_root,b)=>assert.equal(b,base),captureSnapshot:snap,createStage:stage}
const bundle=files=>({manifest:{schemaVersion:1,files:Object.fromEntries(Object.entries(files).map(([f,v])=>[f,digest(v)]))},files})
const fixture=await stage(root)
const index='src/data/results/index.ts',gen='src/data/athletes/resultAthletes.generated.ts',loc='src/data/athletes/athleteLocalization.json',maps='src/data/athletes/ptoProfileMappings.json'
await write(fixture,index,(await read(fixture,index)).replace("import { dubai2026Results } from './2026/t100/dubai'\n",'').replace('  ...dubai2026Results,\n',''))
await write(fixture,gen,(await read(fixture,gen)).split('\n').filter(l=>!/["']?id["']?\s*:\s*2001[678]\b/.test(l)).join('\n'))
const newAthletes=[{nameEn:'Brooke Gillies',nameRu:'Брук Гиллис',countryCode:'GB',profileUrl:'https://stats.protriathletes.org/athlete/brooke-gillies',identityConfirmed:true},{nameEn:'Enzo Bourdon',nameRu:'Энцо Бурдон',countryCode:'FR',profileUrl:'https://stats.protriathletes.org/athlete/enzo-bourdon',identityConfirmed:true},{nameEn:'Sara Sandrini',nameRu:'Сара Сандрини',countryCode:'IT',profileUrl:'https://stats.protriathletes.org/athlete/sara-sandrini',identityConfirmed:true}]
const names=JSON.parse(await read(fixture,loc));for(const a of newAthletes)delete names[a.nameEn];await write(fixture,loc,json(names))
const mappings=JSON.parse(await read(fixture,maps));mappings.mappings=mappings.mappings.filter(m=>![20016,20017,20018].includes(m.id));await write(fixture,maps,json(mappings))
const before=await loadRuntime(fixture),hashes=await snap(fixture),html=await read(root,'scripts/fixtures/result-imports/dubai-2026.html'),parsed=parseStatsPtoResults(html),url='https://stats.protriathletes.org/race/dubai-t100/2026/results'
const editions=before.editions.filter(e=>e.statsPtoUrl===url),proposal=proposeResults(parsed,editions,before.results,before.athletes,before.normalize)
const raceBundle=bundle({'source.html':html,'proposal.json':json({...proposal,sourceUrl:url,sourceSha256:digest(html),editions,observedAt:'2026-11-15T00:00:00Z'}),'review.json':json({kind:'results',year:2026}),'integrity.json':json({base,protectedFiles:hashes})})
const inputs={base,race:{bundle:raceBundle,decisions:{module:'src/data/results/2026/t100/dubai-reviewed.ts',export:'dubaiReviewed2026Results',newAthletes,applySof:true,reviewedAt:'2026-11-16'}}}
let candidate

test('approved import uses real importer/append generator, preserves 1167 profiles/4592 results, adds 3/41',async()=>{
 assert.equal(before.athletes.length,1167);assert.equal(before.results.length,4592)
 candidate=await generate(fixture,inputs,hooks)
 assert.equal(candidate.summary.athletesAfter,1170);assert.equal(candidate.summary.resultsAfter,4633)
 assert.equal(candidate.summary.race.matches.length,41)
 const approval={schemaVersion:1,action:'APPLY_LOCAL_ONLY',approvedBy:'fixture-owner',approvedAt:'2026-11-16',candidateSha256:digest(json(candidate)),files:candidate.files.map(({path,before,after})=>({path,before,after}))}
 verifyApproval(candidate,json(candidate),approval)
 assert.deepEqual(await snap(fixture),hashes,'plan writes no runtime')
 const destination=await stage(fixture),journal=path.join(os.tmpdir(),'sports-test-journal-'+crypto.randomUUID())
 try{await transaction(destination,candidate.files,journal);const after=await loadRuntime(destination);assertHistory(before,after,3,41)
  for(const a of newAthletes){const found=after.athletes.find(x=>x.nameEn===a.nameEn);assert.equal(found.name,a.nameRu);assert.equal(found.countryCode,a.countryCode)}
 }finally{await fs.rm(destination,{recursive:true,force:true});await fs.rm(journal,{recursive:true,force:true})}
})
test('deterministic source replay produces byte-identical plan',async()=>{assert.deepEqual(await generate(fixture,inputs,hooks),candidate)})
test('source digest mismatch rejects before runtime writes',async()=>{const x=structuredClone(inputs);x.race.bundle.files['source.html']+='bad';await assert.rejects(generate(fixture,x,hooks),/digest mismatch/);assert.deepEqual(await snap(fixture),hashes)})
test('approval required, digest mismatch and exact file scope enforced',()=>{
 const c={files:[{path:'x',before:null,after:'a'}]},text=json(c),a={schemaVersion:1,action:'APPLY_LOCAL_ONLY',approvedBy:'owner',approvedAt:'2026-11-16',candidateSha256:digest(text),files:c.files}
 verifyApproval(c,text,a)
 for(const bad of [{}, {...a,candidateSha256:'0'.repeat(64)},{...a,files:[]},{...a,action:'DEPLOY'},{...a,approvedBy:null}])assert.throws(()=>verifyApproval(c,text,bad))
})
test('unknown or unreviewed athlete and country mismatch block',async()=>{
 for(const edit of [d=>d.newAthletes.pop(),d=>d.newAthletes[0].identityConfirmed=false,d=>d.newAthletes[0].countryCode='US']){const x=structuredClone(inputs);edit(x.race.decisions);await assert.rejects(generate(fixture,x,hooks))}
 assert.deepEqual(await snap(fixture),hashes)
})
test('ambiguous normalized identity and duplicate existing edition rejected by reused importer',()=>{
 assert.throws(()=>proposeResults(parsed,editions,[{raceEditionId:editions[0].editionId}],before.athletes,before.normalize),/already has results/)
 assert.throws(()=>proposeResults(parsed,editions,[],[...before.athletes,before.athletes[0]],before.normalize),/Ambiguous/)
})
test('stable-ID and historical record mutation fails independent integrity assertion',()=>{
 const a=JSON.parse(JSON.stringify(before));a.athletes[0].id=-1;assert.throws(()=>assertHistory(before,a,0,0))
 const b=JSON.parse(JSON.stringify(before));b.results[0].id=-1;assert.throws(()=>assertHistory(before,b,0,0))
})
test('append index preserves order; duplicate symbol/path injection fails',()=>{
 const s='const allResults = [\n  ...oldResults,\n]\n';const n=appendIndex(s,'src/data/results/2026/t100/test.ts','newResults');assert.ok(n.indexOf('...oldResults')<n.indexOf('...newResults'))
 assert.throws(()=>appendIndex(n,'src/data/results/2026/t100/test.ts','newResults'));assert.throws(()=>appendIndex(s,'../../bad.ts','newResults'))
})
test('T100 TOP10 M/W integrate exactly; historical seasons and TRI formula preserved',async()=>{
 const now=new Date().toISOString(),files={},tables=[]
 for(const [gender,sex]of [['M','men'],['W','women']]){
  const h=await read(root,`scripts/fixtures/official-standings/t100-2026-post-dubai-${sex}.html`);files[sex+'.html']=h
  const t=matchStandings(parseFreshTop10(h,gender,2026),before.athletes,mappings.mappings,before.normalize)
  t.source={method:'OFFICIAL_HTML',url:t.sourceUrl,sha256:digest(h),observedAt:now};tables.push(t)
 }
 files['standings-proposal.json']=json({tables});files['review.json']=json({kind:'t100',year:2026,status:'READY_FOR_OWNER_REVIEW'});files['integrity.json']=json({base,protectedFiles:hashes})
 files['freshness.json']=json({afterRace:url,reviewedBy:'fixture-owner',reviewedAt:now,statement:'Synthetic test only',tables:tables.map(t=>({sourceUrl:t.sourceUrl,sha256:t.source.sha256,evidenceUrl:url,explanation:'Fixture only'}))})
 const c=await generate(fixture,{base,standings:{bundle:bundle(files)}},hooks)
 for(const t of tables){const out=JSON.parse(c.files.find(f=>f.path===`src/data/officialStandings/t100/2026-${t.gender==='M'?'men':'women'}.json`).text);assert.deepEqual(out.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints]),t.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints]))}
 assert.ok(c.files.every(f=>!f.path.includes('2025')&&!f.path.includes('2024')&&!f.path.includes('athleteRanking')))
 const stale=structuredClone(files);stale['freshness.json']=json({...JSON.parse(stale['freshness.json']),reviewedAt:'2020-01-01'});await assert.rejects(generate(fixture,{base,standings:{bundle:bundle(stale)}},hooks),/Stale/)
})
test('partial-write failure restores original bytes and removes new file',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sports-atomic-')),journal=dir+'-journal';await write(dir,'a','old')
 const files=[{path:'a',before:digest('old'),after:digest('new'),text:'new'},{path:'b',before:null,after:digest('b'),text:'b'},{path:'c',before:null,after:digest('c'),text:'c'}]
 try{await assert.rejects(transaction(dir,files,journal,{beforeReplace:async i=>{if(i===2)throw Error('injected failure')}}),/original file contents restored/);assert.equal(await read(dir,'a'),'old');await assert.rejects(read(dir,'b'),{code:'ENOENT'});assert.ok((await read(journal,'failure.json')).includes('injected failure'))}finally{await fs.rm(dir,{recursive:true,force:true});await fs.rm(journal,{recursive:true,force:true})}
})
test('dirty destination blocked without overwriting files',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sports-dirty-'));await write(dir,'a','unrelated');const f={path:'a',before:digest('old'),after:digest('new'),text:'new'}
 const j=dir+'-journal';try{await assert.rejects(transaction(dir,[f],j),/Destination changed/);assert.equal(await read(dir,'a'),'unrelated')}finally{await fs.rm(dir,{recursive:true,force:true});await fs.rm(j,{recursive:true,force:true})}
})
test('sealed preparation validates stored snapshots and rejects traversal/tampering',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sports-bundle-'));try{await write(dir,'source.html','source');await sealBundle(dir,['source.html']);verifyBundle(await readBundle(dir));await write(dir,'source.html','changed');await assert.rejects(readBundle(dir),/digest mismatch/);assert.throws(()=>verifyBundle({manifest:{schemaVersion:1,files:{'../x':digest('x')}},files:{'../x':'x'}}),/Unsafe/)}finally{await fs.rm(dir,{recursive:true,force:true})}
})
test('actual Git baseline mismatch stops application',async()=>{await assert.rejects(baseline(root,'0'.repeat(40)),/Git baseline changed/)})
test('destination symlinks never redirect writes',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sports-symlink-')),j=dir+'-journal'
 try{await write(dir,'original','old');await fs.symlink(path.join(dir,'original'),path.join(dir,'a'));await assert.rejects(transaction(dir,[{path:'a',before:digest('old'),after:digest('new'),text:'new'}],j),/symlink/);assert.equal(await read(dir,'original'),'old')}finally{await fs.rm(dir,{recursive:true,force:true});await fs.rm(j,{recursive:true,force:true})}
})
test('changed preparation baseline blocks source replay',async()=>{const x=structuredClone(inputs),i=JSON.parse(x.race.bundle.files['integrity.json']);i.protectedFiles['src/data/results/index.ts']='0'.repeat(64);x.race.bundle.files['integrity.json']=json(i);x.race.bundle.manifest.files['integrity.json']=digest(json(i));await assert.rejects(generate(fixture,x,hooks),/baseline changed/)})
test.after(async()=>{await fs.rm(fixture,{recursive:true,force:true})})
