import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {execFileSync} from 'node:child_process'
import {releaseSeason,releaseBuildArgs,assertReleaseSeason} from './release-season.mjs'
import {options} from './manual-release.mjs'
const s=await createServer({server:{middlewareMode:true,watch:null,hmr:false},appType:'custom',logLevel:'silent'})
const [data,images,sports,ranking,standings,{default:Calendar}]=await Promise.all(['/src/data/raceEditions.ts','/src/data/showcaseImages.ts','/src/sports/data.ts','/src/utils/athleteRanking.ts','/src/data/officialStandings/index.ts','/src/pages/CalendarPage.tsx'].map(p=>s.ssrLoadModule(p)))
const {groupRacesForHome}=await s.ssrLoadModule('/src/utils/homeRacePresentation.ts')
const {selectPrimarySeason}=await s.ssrLoadModule('/src/config/season.ts')
await s.close()
const all=data.allRaceEditionViews, roth=all.filter(r=>r.raceId==='challenge-roth')
const reuse=['ironman-new-zealand','ironman-70-3-geelong','ironman-70-3-oceanside','ironman-texas','ironman-70-3-pennsylvania','ironman-frankfurt','ironman-lake-placid','ironman-world-championship','t100-gold-coast','t100-singapore','t100-french-riviera','t100-san-francisco','t100-vancouver','t100-saudi-arabia','t100-qatar']
test('25 events:15 approved reuse(4 mapped/11 gaps),10 new neutral; no Nice inheritance',()=>{
 const future=data.calendar2027Views;assert.equal(future.length,25)
 const approved=future.filter(r=>reuse.includes(r.raceId));assert.equal(approved.length,15)
 assert.equal(approved.filter(r=>images.pickShowcaseImage(r)).length,4)
 for(const r of future.filter(r=>!reuse.includes(r.raceId)))assert.equal(images.pickShowcaseImage(r),undefined)
 assert.equal(images.pickShowcaseImage(future.find(r=>r.raceId==='ironman-70-3-world-championship')),undefined)
 assert.ok(images.showcaseImageKeys(future.find(r=>r.raceId==='ironman-world-championship')).every(k=>k.startsWith('kona-')))
})
test('Roth editions/results/profile linkage; no invented2027 results',()=>{
 assert.deepEqual(roth.map(r=>r.year).sort(),[2024,2025,2026,2027])
 assert.equal(roth.find(r=>r.year===2027).dateISO,'2027-07-04')
 for(const e of roth){const rows=sports.linkedRaceResults.filter(r=>r.raceEditionId===e.editionId);assert.equal(rows.length>0,e.year<2027);for(const r of rows)assert.ok(sports.athletes.some(a=>a.id===r.athleteId))}
})
for(const year of [2024,2025,2026])test(`Roth ${year} contributes real finishes with Tier A weight 1.10`,()=>{
 const e=roth.find(r=>r.year===year),r=sports.linkedRaceResults.find(r=>r.raceEditionId===e.editionId&&typeof r.position==='number'),a=sports.athletes.find(a=>a.id===r.athleteId)
 const [score]=ranking.calculateAthleteRanking([a],[r],[e],new Date(e.dateISO+'T12:00:00Z'))
 const sof=(r.gender??a.gender)==='W'?e.sof?.women:e.sof?.men
 const factor=typeof sof==='number'?Math.max(.7,Math.min(1.15,1+(sof-90)/100)):1
 assert.ok(Math.abs(score.performance-(100/Math.pow(r.position,.65))*1.10*factor)<1e-9)
 assert.equal(score.starts,1);assert.ok(score.score>0);assert.equal(score.sWins,0)
})
test('empty2027 editions leave complete ranking and historical data unchanged',()=>{
 assert.deepEqual(ranking.calculateAthleteRanking(sports.athletes,sports.linkedRaceResults,all),ranking.calculateAthleteRanking(sports.athletes,sports.linkedRaceResults,all.filter(r=>r.year<2027)))
 assert.equal(execFileSync('git',['diff','HEAD','--','src/utils/athleteRanking.ts','src/data/results','src/data/athletes','src/data/officialStandings'],{encoding:'utf8'}),'')
 assert.equal(new Set(sports.linkedRaceResults.map(r=>r.id)).size,4633)
})
test('Roth appears in every calendar year; official Standings remain IM/T100 only',()=>{
 for(const season of [2024,2025,2026,2027]){const root=Calendar({races:data.calendarRaceEditions,searchRaces:all,viewState:{season,search:'',filter:'Все',timeFilter:'all',openArchiveYears:[]},onViewStateChange(){},onBack(){},onNavigate(){},onRaceClick(){}});const cards=[];function walk(n){if(Array.isArray(n))return n.forEach(walk);if(!n||typeof n!=='object')return;if(n.type?.name==='RaceCard')cards.push(n);walk(n.props?.children)}walk(root);assert.ok(cards.some(c=>/Challenge Roth/.test(c.props.name)))}
 assert.deepEqual([...new Set(standings.officialStandings.map(r=>r.series))].sort(),['IRONMAN_PRO_SERIES','T100'])
})
test('release prepare explicitly selects Preview2027, Production2026; wrong cross-env profiles rejected',()=>{
 assert.deepEqual(releaseBuildArgs('preview'),['run','build','--','--mode','season2027-preview'])
 assert.deepEqual(releaseBuildArgs('production'),['run','build'])
 assert.deepEqual(releaseSeason('preview'),{profile:'preview2027',primarySeason:2027})
 assert.deepEqual(releaseSeason('production'),{profile:'production',primarySeason:2026})
 for(const [env,p] of [['production','preview2027'],['preview','production'],['preview','unknown']])assert.throws(()=>releaseSeason(env,p))
 const a=['prepare','--sha','a'.repeat(40),'--env','preview','--package','/tmp/pkg','--evidence','/tmp/ev']
 assert.equal(options(a)['season-profile'],'preview2027');assert.throws(()=>options([...a,'--season-profile','production']))
})
test('missing,mismatched,malformed or stale season evidence fails closed',()=>{
 for(const value of [null,{}, {profile:'preview2027',primarySeason:2026},{profile:'production',primarySeason:2027},{profile:'production',primarySeason:2026}])assert.throws(()=>assertReleaseSeason(value,'preview'))
 assert.throws(()=>assertReleaseSeason({profile:'preview2027',primarySeason:2027},'production'))
 assertReleaseSeason({profile:'production',primarySeason:2026},'production')
})
test('Preview artifact verification rejects wrong season even with recomputed file hashes',async()=>{
 const fs=await import('node:fs/promises'),{inventory,sha256,releaseConfig,verifyArtifact}=await import('./manual-release-artifact.mjs')
 const root=await fs.mkdtemp('/private/tmp/cal03b2-artifact-'),sha='a'.repeat(40),source=JSON.parse(await fs.readFile('wrangler.jsonc'))
 try{
  await fs.mkdir(root+'/worker');await fs.mkdir(root+'/dist')
  await fs.writeFile(root+'/worker/index.js','fixture');await fs.writeFile(root+'/dist/index.html','fixture')
  await fs.writeFile(root+'/wrangler.json',JSON.stringify(releaseConfig(source,'preview')))
  for(const season of [releaseSeason('preview'),releaseSeason('production')]){
   await fs.writeFile(root+'/dist/season.json',JSON.stringify(season))
   const manifest={season,sha,worker:'tri-app-preview',environment:'preview',version:JSON.parse(await fs.readFile('package.json')).version,lockHash:sha256(await fs.readFile('package-lock.json')),files:await inventory(root)}
   const bytes=JSON.stringify(manifest);await fs.writeFile(root+'/manifest.json',bytes)
   const check=verifyArtifact(root,sha,sha256(bytes),source,'preview')
   if(season.primarySeason===2027)await check;else await assert.rejects(check)
  }
 }finally{await fs.rm(root,{recursive:true,force:true})}
})

test('all25 editions become eligible for the same ordered Home top5 window',()=>{
 const primary=groupRacesForHome(selectPrimarySeason(data.calendarRaceEditions,2027).filter(data.isRaceInCalendar))
 for(const race of data.calendar2027Views){const window=primary.filter(r=>(r.dateEndISO??r.dateISO)>=race.dateISO).sort((a,b)=>a.dateISO.localeCompare(b.dateISO)).slice(0,5);assert.ok(window.some(r=>r.editionId===race.editionId),race.editionId)}
})
