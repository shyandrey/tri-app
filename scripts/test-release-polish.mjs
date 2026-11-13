import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
const [{default:SportsRoute},{default:Calendar},{currentRaceEditions}]=await Promise.all([server.ssrLoadModule('/src/sports/SportsRoute.tsx'),server.ssrLoadModule('/src/pages/CalendarPage.tsx'),server.ssrLoadModule('/src/data/raceEditions.ts')])
await server.close()
for(const page of ['rankings','athletes','athlete','race'])test(`polish: ${page} loading body has one exact status; navigation remains`,()=>{
 const html=renderToStaticMarkup(createElement(SportsRoute,{route:{page,id:page==='athlete'?'101':'ironman-70-3-oceanside-2026'},navigate(){},back(){}}))
 const body=html.match(/<section class="sports-loading"[^>]*>(.*?)<\/section>/)[1]
 assert.equal(body.replace(/<[^>]+>/g,''),'Загрузка...')
 assert.match(body,/role="status"/);assert.match(html,/bottom-nav/);assert.match(html,/page-back-button/)
})
test('polish: Calendar inline status standardized; ordinary title and errors retained',()=>{
 const props={races:currentRaceEditions,onBack(){},onRaceClick(){},onNavigate(){},onViewStateChange(){},viewState:{search:'',filter:'Все',timeFilter:'upcoming',openArchiveYears:[]}}
 const loading=renderToStaticMarkup(createElement(Calendar,{...props,dataStatus:'loading'}))
 assert.match(loading,/<p role="status">Загрузка\.\.\.<\/p>/)
 assert.match(loading,/<h1>Календарь и результаты<\/h1>/)
 const error=renderToStaticMarkup(createElement(Calendar,{...props,dataStatus:'error'}))
 assert.match(error,/Не удалось загрузить гонки/);assert.doesNotMatch(error,/Загрузка\.\.\./)
})
