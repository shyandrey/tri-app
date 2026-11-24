import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {readFileSync} from 'node:fs'
const master=JSON.parse(readFileSync('data/calendar/2027-master.json'))
async function load(mode){
 const s=await createServer({mode,server:{middlewareMode:true,watch:null,hmr:false},appType:'custom',logLevel:'silent'})
 const modules=await Promise.all(['/src/config/season.ts','/src/data/raceEditions.ts','/src/data/showcaseImages.ts','/src/pages/CalendarPage.tsx','/src/utils/raceChampionshipGroup.ts'].map(p=>s.ssrLoadModule(p)))
 await s.close();return modules
}
const [prod,data,images,calendar,classification]=await load('production')
const [preview]=await load('season2027-preview')
const [ordinaryPreview]=await load('preview')
test('explicit profiles; ordinary build/preview never opts into 2027',()=>{
 assert.equal(prod.primarySeason,2026);assert.equal(preview.primarySeason,2027);assert.equal(ordinaryPreview.primarySeason,2026)
})
test('date, final completion and year rollover cannot promote configured season',t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-21T12:00:00Z')})
 for(const day of ['2026-12-12','2027-01-01','2028-01-01']){
  t.mock.timers.setTime(Date.parse(day+'T12:00:00Z'))
  assert.ok(prod.selectPrimarySeason(data.calendarRaceEditions).every(r=>r.year===2026))
  assert.equal(preview.selectPrimarySeason(data.calendarRaceEditions).length,25)
 }
})
test('Calendar defaults to same primary as Home; explicit historical selection remains available',()=>{
 const root=calendar.default({races:data.calendarRaceEditions,searchRaces:data.allRaceEditionViews,viewState:{search:'',filter:'Все',timeFilter:'all',openArchiveYears:[]},onViewStateChange(){},onBack(){},onRaceClick(){},onNavigate(){}})
 const selected=[];function walk(n){if(Array.isArray(n))return n.forEach(walk);if(!n||typeof n!=='object')return;if(n.props?.['aria-pressed']===true&&typeof n.props.children==='number')selected.push(n.props.children);walk(n.props?.children)}walk(root)
 assert.deepEqual(selected,[2026]);assert.equal(prod.selectPrimarySeason(data.calendarRaceEditions)[0].year,selected[0])
 assert.deepEqual([...new Set(data.allRaceEditionViews.map(r=>r.year))].sort(),[2024,2025,2026,2027])
})
test('all 25 edition titles, dates, series, distances and gender match approved master',()=>{
 data.calendar2027Views.forEach((r,i)=>{const m=master.races[i];assert.equal(r.name,m.name);assert.equal(r.series,m.series);assert.equal(r.distance,m.distance);assert.equal(r.dateISO,m.dateStart);assert.equal(r.dateEndISO,m.dateEnd);assert.equal(r.gender,m.gender==='TBD'?'UNKNOWN':'WPRO+MPRO')})
})
test('neutral 2027 continental names, historical titles unchanged',()=>{
 for(const [id,name] of [['ironman-texas','IRONMAN Texas'],['ironman-70-3-pennsylvania','IRONMAN 70.3 Pennsylvania'],['ironman-frankfurt','IRONMAN Frankfurt']]){
  const r=data.calendar2027Views.find(r=>r.raceId===id);assert.equal(r.name,name);assert.equal(r.designation,'regular')
  assert.match(data.allRaceEditionViews.find(r=>r.raceId===id&&r.year===2026).name,/Championship/)
 }
 assert.equal(classification.getRaceDesignation(data.calendar2027Views.find(r=>r.raceId==='t100-qatar')),'series_final')
})
test('edition artwork never leaks Nice into Chattanooga or unapproved 2027; neutral fallback',()=>{
 const nice=data.allRaceEditionViews.find(r=>r.editionId==='ironman-70-3-world-championship-2026-men')
 assert.ok(images.showcaseImageKeys(nice).every(k=>k.startsWith('nice-')));assert.ok(images.pickShowcaseImage(nice))
 for(const r of data.calendar2027Views.filter(r=>!['ironman-world-championship','t100-french-riviera','t100-saudi-arabia','t100-qatar'].includes(r.raceId))){assert.deepEqual(images.showcaseImageKeys(r),[]);assert.equal(images.pickShowcaseImage(r),undefined)}
 assert.deepEqual(images.showcaseImageKeys({raceId:nice.raceId,editionId:'unknown'}),[])
})
