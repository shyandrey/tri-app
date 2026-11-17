import test from 'node:test'
import assert from 'node:assert/strict'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {createServer} from 'vite'
const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'silent'})
const [{getRaceDayLabel,getMoscowDateISO},{default:More},{default:Feedback}]=await Promise.all([server.ssrLoadModule('/src/utils/raceDate.ts'),server.ssrLoadModule('/src/pages/MorePage.tsx'),server.ssrLoadModule('/src/pages/FeedbackPage.tsx')]);await server.close()
for(const [instant,label] of [['2026-11-12T21:00:00Z','Завтра'],['2026-11-13T20:59:59.999Z','Завтра'],['2026-11-13T21:00:00Z','Сегодня!'],['2026-11-14T20:59:59.999Z','Сегодня!']])test('Moscow label '+instant,t=>{t.mock.timers.enable({apis:['Date'],now:new Date(instant)});assert.equal(getRaceDayLabel('2026-11-14'),label);assert.equal(getRaceDayLabel('2026-12-01'),'Скоро');assert.ok('2026-11-14'>=getMoscowDateISO())})
test('tomorrow crosses month/year and leap day',()=>{for(const [today,tomorrow] of [['2026-12-31','2027-01-01'],['2028-02-28','2028-02-29'],['2028-02-29','2028-03-01']])assert.equal(getRaceDayLabel(tomorrow,today),'Завтра')})
test('About native disclosure defaults closed, summary retains version/title',()=>{const html=renderToStaticMarkup(createElement(More,{onNavigate(){},onFeedback(){},onBack(){}}));assert.match(html,/<details class="more-release"><summary>/);assert.doesNotMatch(html,/<details[^>]*\bopen/);assert.match(html,/<summary>[\s\S]*Версия 1\.0\.1[\s\S]*Первый релиз 300W[\s\S]*<\/summary>/);assert.match(html,/При выпуске версии 1\.0\.1:/);assert.match(html,/<ul><li>/)})
test('Feedback heading precedes Back in shared header; context retained',()=>{const html=renderToStaticMarkup(createElement(Feedback,{context:{screen:'race',raceName:'Dubai T100',gender:'M'},onBack(){}}));assert.match(html,/<header class="feedback-header"><h1[^>]*>Сообщить об ошибке<\/h1><button class="page-back-button"/);assert.match(html,/Отчёт о гонке: Dubai T100/);assert.match(html,/feedback-description/)})
