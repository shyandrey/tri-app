// Explicitly invoked local rehearsal. Creates ONE local-only fixture commit, no remotes.
import fs from 'node:fs/promises'
import {writeFileSync} from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {execFileSync,spawnSync} from 'node:child_process'
import {randomUUID} from 'node:crypto'
import {loadRuntime,assertHistory} from './apply-sports-update.mjs'
import {digest,json} from './sports-candidate.mjs'
const source=process.cwd(),args=process.argv.slice(2)
assert.ok(args.length===2&&args[0]==='--out'&&path.isAbsolute(args[1]),'Usage: node scripts/test-sports-e2e.mjs --out /new/external/directory')
const out=args[1],parent=await fs.realpath(path.dirname(out)),realSource=await fs.realpath(source)
assert.ok(parent!==realSource&&!parent.startsWith(realSource+path.sep),'External evidence required')
await fs.mkdir(out);const repo=path.join(out,'fixture-repository');await fs.mkdir(repo)
const git=(cwd,...a)=>execFileSync('git',a,{cwd,encoding:'utf8'}).trim()
assert.equal(git(source,'status','--porcelain','--','src','scripts/fixtures'),'','Real sports sources must be clean')
const sourceSHA=git(source,'rev-parse','HEAD')
const archive=execFileSync('git',['archive','HEAD'],{cwd:source,maxBuffer:256*1024*1024})
execFileSync('tar',['-xf','-','-C',repo],{input:archive})
// Include uncommitted tooling under review, never real data edits.
for(const f of await fs.readdir(path.join(source,'scripts')))if(f.endsWith('.mjs'))await fs.copyFile(path.join(source,'scripts',f),path.join(repo,'scripts',f))
await fs.copyFile(path.join(source,'package.json'),path.join(repo,'package.json'))
await fs.symlink(await fs.realpath(path.join(source,'node_modules')),path.join(repo,'node_modules'),'dir')
const read=f=>fs.readFile(path.join(repo,f),'utf8'),write=(f,t)=>fs.writeFile(path.join(repo,f),t)
const original=await loadRuntime(repo)
await fs.writeFile(path.join(out,'original-runtime.json'),json(original))
const index='src/data/results/index.ts',generated='src/data/athletes/resultAthletes.generated.ts',localization='src/data/athletes/athleteLocalization.json',mappings='src/data/athletes/ptoProfileMappings.json'
const idx=await read(index);assert.equal(idx.split('  ...dubai2026Results,\n').length,2)
await write(index,idx.replace("import { dubai2026Results } from './2026/t100/dubai'\n",'').replace('  ...dubai2026Results,\n',''))
const lines=(await read(generated)).split('\n'),removed=lines.filter(l=>/"id"\s*:\s*2001[678]\b/.test(l));assert.equal(removed.length,3)
await write(generated,lines.filter(l=>!removed.includes(l)).join('\n'))
const names=JSON.parse(await read(localization)),map=JSON.parse(await read(mappings)),newAthletes=[]
for(const [id,slug]of [[20016,'brooke-gillies'],[20017,'enzo-bourdon'],[20018,'sara-sandrini']]){const a=original.athletes.find(a=>a.id===id);assert.ok(a);delete names[a.nameEn];newAthletes.push({nameEn:a.nameEn,nameRu:a.name,countryCode:a.countryCode,profileUrl:'https://stats.protriathletes.org/athlete/'+slug,identityConfirmed:true})}
await write(localization,json(names));map.mappings=map.mappings.filter(m=>![20016,20017,20018].includes(m.id));await write(mappings,json(map))
const editionsFile='src/data/raceEditions.ts',editionText=await read(editionsFile),sofLine="  't100-dubai': { women: 92.11, men: 91.03 },\n";assert.ok(editionText.includes(sofLine));await write(editionsFile,editionText.replace(sofLine,''))
const context={purpose:'SPORTS_E2E_ONLY',root:await fs.realpath(repo),id:randomUUID(),sourceSHA}
await write('.sports-test-only.json',json(context))
git(repo,'init','--initial-branch=test-only/sports-e2e')
git(repo,'add','--all');git(repo,'-c','user.name=300W Fixture Test','-c','user.email=fixture@invalid.local','commit','-m','TEST ONLY: verified Dubai pre-import fixture baseline; NEVER PUBLISH')
const baseline=git(repo,'rev-parse','HEAD');assert.equal(git(repo,'status','--porcelain'),'');assert.equal(git(repo,'remote'),'')
await fs.writeFile(path.join(repo,'.git/hooks/pre-push'),'#!/bin/sh\necho "TEST ONLY repository: push forbidden" >&2\nexit 1\n',{mode:0o755})
const before=await loadRuntime(repo);assert.equal(before.athletes.length,1167);assert.equal(before.results.length,4592)
async function protectedSnapshot(){const files=git(repo,'ls-files','src','scripts/fixtures').split('\n');return Object.fromEntries(await Promise.all(files.map(async f=>[f,digest(await read(f))])))}
const initial=await protectedSnapshot(),results=[]
function run(name,a,expected=0,match){const r=spawnSync(process.execPath,a,{cwd:repo,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});writeFileSync(path.join(out,name+'.log'),(r.stdout??'')+(r.stderr??''));assert.equal(r.status,expected,name+': '+(r.stderr??'')+(r.stdout??''));if(match)assert.match((r.stderr??'')+(r.stdout??''),match);results.push({name,exit:r.status});return r}
const url='https://stats.protriathletes.org/race/dubai-t100/2026/results',race=path.join(out,'race'),standings=path.join(out,'standings'),candidateDir=path.join(out,'candidate')
run('prepare-results',['scripts/prepare-sports-update.mjs','results','--url',url,'--race','t100-dubai-2026','--html','scripts/fixtures/result-imports/dubai-2026.html','--out',race],1)
const report=JSON.parse(await fs.readFile(path.join(race,'review.json'),'utf8'));assert.equal(report.existingAthleteMatches,38);assert.equal(report.proposals.length,3);assert.equal(report.blockers.length,1)
const offline=['t100','--season','2026','--after-race',url,'--men-html','scripts/fixtures/official-standings/t100-2026-post-dubai-men.html','--women-html','scripts/fixtures/official-standings/t100-2026-post-dubai-women.html','--fixture-provenance','scripts/fixtures/official-standings/t100-post-dubai-2026.json']
run('offline-without-flag',['scripts/prepare-sports-update.mjs',...offline,'--out',path.join(out,'invalid-offline')],1,/explicit --test-only/)
run('prepare-t100',['scripts/prepare-sports-update.mjs',...offline,'--test-only','true','--out',standings])
const request={race:{bundle:race,decisions:{module:'src/data/results/2026/t100/dubai-e2e.ts',export:'dubaiE2e2026Results',reviewedAt:'2026-11-16',applySof:true,newAthletes}},standings:{bundle:standings}}
const requestFile=path.join(out,'request.json');await fs.writeFile(requestFile,json(request))
run('plan',['scripts/apply-sports-update.mjs','plan','--request',requestFile,'--out',candidateDir])
const candidateFile=path.join(candidateDir,'candidate.json'),candidateText=await fs.readFile(candidateFile,'utf8'),candidate=JSON.parse(candidateText),approval=JSON.parse(await fs.readFile(path.join(candidateDir,'approval-template.json'),'utf8'))
assert.equal(approval.action,'APPLY_TEST_FIXTURE_ONLY');approval.approvedBy='AUTOMATED TEST ONLY — NOT PUBLICATION APPROVAL';approval.approvedAt=new Date().toISOString()
const approvalFile=path.join(out,'test-only-approval.json');await fs.writeFile(approvalFile,json(approval));assert.deepEqual(await protectedSnapshot(),initial)
const apply=(c,a)=>['scripts/apply-sports-update.mjs','apply','--candidate',c,'--approval',a]
async function negative(name,text,a,match){const cf=path.join(out,name+'-candidate.json'),af=path.join(out,name+'-approval.json');await fs.writeFile(cf,text);await fs.writeFile(af,json(a));run(name,apply(cf,af),1,match);assert.deepEqual(await protectedSnapshot(),initial)}
await negative('changed-digest',candidateText+' ',approval,/digest mismatch/)
await negative('approval-scope',candidateText,{...approval,files:[]},/scope mismatch/)
const badBase=json({...candidate,base:'0'.repeat(40)});await negative('changed-baseline',badBase,{...approval,candidateSha256:digest(badBase)},/Git baseline changed/)
await negative('wrong-fixture-approval',candidateText,{...approval,testOnly:{...approval.testOnly,root:'/different/repository'}},/fixture scope mismatch/)
const originalGenerated=await read(generated),first=original.athletes.find(a=>a.id===10000);assert.ok(first)
await write(generated,originalGenerated.slice(0,-2)+'  '+JSON.stringify({...first,id:999999})+',\n]\n')
const ambiguousBefore=await protectedSnapshot()
run('ambiguous-identity',['scripts/prepare-sports-update.mjs','results','--url',url,'--race','t100-dubai-2026','--html','scripts/fixtures/result-imports/dubai-2026.html','--out',path.join(out,'ambiguous')],1)
assert.ok(JSON.parse(await fs.readFile(path.join(out,'ambiguous/review.json'))).blockers.some(b=>b.includes('Ambiguous')));assert.deepEqual(await protectedSnapshot(),ambiguousBefore);await write(generated,originalGenerated)
run('release-forbidden',['scripts/manual-release.mjs','prepare','--sha',baseline,'--env','production','--package',path.join(out,'forbidden-package'),'--evidence',path.join(out,'forbidden-evidence')],1,/TEST-ONLY fixture/)
assert.deepEqual(await protectedSnapshot(),initial)
run('apply',apply(candidateFile,approvalFile))
const after=await loadRuntime(repo);assertHistory(before,after,3,41)
assert.deepEqual(after.results,original.results,'Official rows/IDs differ from original verified Dubai import')
for(const a of newAthletes){const x=after.athletes.find(x=>x.nameEn===a.nameEn),old=original.athletes.find(x=>x.nameEn===a.nameEn);assert.equal(x.id,old.id);assert.equal(x.name,a.nameRu);assert.equal(x.countryCode,a.countryCode)}
const dubai=after.results.filter(r=>r.raceEditionId==='t100-dubai-2026');assert.equal(dubai.length,41);assert.equal(dubai.filter(r=>r.gender==='M').length,21);assert.equal(dubai.filter(r=>r.gender==='W').length,20);assert.equal(dubai.filter(r=>r.position==='DNF').length,4)
assert.deepEqual(after.editions.find(e=>e.editionId==='t100-dubai-2026').sof,{women:92.11,men:91.03})
for(const sex of ['men','women']){const f=`src/data/officialStandings/t100/2026-${sex}.json`,a=JSON.parse(await read(f)),b=JSON.parse(await fs.readFile(path.join(source,f),'utf8'));assert.deepEqual(a.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints]),b.rows.map(r=>[r.athleteId,r.officialRank,r.officialPoints]));assert.equal(a.sourceObservedAt,b.sourceObservedAt)}
const integrated=await protectedSnapshot();for(const f of Object.keys(initial).filter(f=>/officialStandings\/t100\/202[45]-/.test(f)||f==='src/utils/athleteRanking.ts'))assert.equal(integrated[f],initial[f])
run('reapply',apply(candidateFile,approvalFile),1,/checkout must be clean/);assert.deepEqual(await protectedSnapshot(),integrated)
run('build-metadata',['scripts/build-metadata.mjs']);const build=spawnSync('npm',['run','build'],{cwd:repo,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024});await fs.writeFile(path.join(out,'build.log'),build.stdout+build.stderr);assert.equal(build.status,0,'build failed');results.push({name:'build',exit:build.status})
await fs.writeFile(path.join(out,'report.json'),json({status:'PASS',sourceSHA,fixtureBaseline:baseline,context,results,counts:{beforeAthletes:1167,afterAthletes:1170,beforeResults:4592,afterResults:4633,MPRO:21,WPRO:20,DNF:4},candidateDigest:digest(candidateText),testOnly:true}))
console.log(json({status:'PASS',out,baseline,results}))
