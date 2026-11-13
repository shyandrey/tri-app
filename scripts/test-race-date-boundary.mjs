import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'

// Test-only export of the real screen; no application export or component mocking.
const server=await createServer({plugins:[{name:'test-app-screen',enforce:'pre',transform(source,id){if(id.endsWith('/src/App.tsx'))return source.replace('function AppScreen(', 'export function AppScreen(')}}],server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'silent'})
const [{AppScreen},{default:Calendar},{currentRaceEditions,allRaceEditionViews}]=await Promise.all([
 server.ssrLoadModule('/src/App.tsx'),server.ssrLoadModule('/src/pages/CalendarPage.tsx'),server.ssrLoadModule('/src/data/raceEditions.ts'),
])
await server.close()
const race=currentRaceEditions.find(r=>r.editionId==='ironman-world-championship-kona-2026')
assert.equal(race.dateISO,'2026-10-10')
const before=JSON.stringify(allRaceEditionViews)
for(const [instant,present] of [
 ['2026-10-09T20:59:59.999Z',true],
 ['2026-10-09T21:00:00.000Z',true],
 ['2026-10-10T09:00:00.000Z',true],
 ['2026-10-10T20:59:59.999Z',true],
 ['2026-10-10T21:00:00.000Z',false],
])test(`Home, Showcase and Calendar Moscow boundary ${instant}`,t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(instant)})
 const home=renderToStaticMarkup(createElement(AppScreen,{route:{page:'home'},navigate(){},back(){}}))
 assert.equal(home.includes(`aria-label="Открыть ${race.name}"`),present,'Showcase event-day visibility')
 assert.equal(home.includes(`aria-label="Открыть гонку: ${race.name},`),present,'Home event-day visibility')
 for(const timeFilter of ['upcoming','finished']){
  const html=renderToStaticMarkup(createElement(Calendar,{races:currentRaceEditions,searchRaces:allRaceEditionViews,onBack(){},onRaceClick(){},onNavigate(){},onViewStateChange(){},viewState:{search:'',filter:'Все',timeFilter,openArchiveYears:[]}}))
  assert.equal(html.includes(`aria-label="Открыть гонку: ${race.name},`),timeFilter==='upcoming'?present:!present,`Calendar ${timeFilter}`)
 }
 assert.equal(JSON.stringify(allRaceEditionViews),before,'No race data mutation')
})


for(const [instant,present] of [['2026-11-13T21:00:00.000Z',true],['2026-11-14T20:59:59.999Z',true],['2026-11-14T21:00:00.000Z',false]])test(`CAL-01 Dubai both genders / Saudi hidden at ${instant}`,t=>{
 t.mock.timers.enable({apis:['Date'],now:new Date(instant)})
 const home=renderToStaticMarkup(createElement(AppScreen,{route:{page:'home'},navigate(){},back(){}}))
 assert.equal(home.includes('aria-label="Открыть Dubai T100"'),present)
 assert.equal(home.includes('aria-label="Открыть гонку: Dubai T100,'),present)
 assert.equal(home.includes('Saudi Arabia T100'),false)
 for(const timeFilter of ['upcoming','finished']){
  const html=renderToStaticMarkup(createElement(Calendar,{races:currentRaceEditions,searchRaces:allRaceEditionViews,onBack(){},onRaceClick(){},onNavigate(){},onViewStateChange(){},viewState:{search:'',filter:'Все',timeFilter,openArchiveYears:[]}}))
  assert.equal(html.includes('aria-label="Открыть гонку: Dubai T100,'),timeFilter==='upcoming'?present:!present)
  assert.equal(html.includes('Saudi Arabia T100'),false)
 }
})
