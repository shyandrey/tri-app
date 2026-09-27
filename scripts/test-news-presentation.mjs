import test from 'node:test'
import assert from 'node:assert/strict'
import { newsPresentation } from '../src/utils/newsPresentation.ts'
import { extractEligibleNews } from '../worker/news/eligibility.ts'
test('leading markers take priority, are removed only for display',()=>{
 for(const [markers,type] of [[['📺','🎥','▶️'],'video'],[['🏆','🥇'],'results'],[['👀'],'preview'],[['🎙','🎙️','🎤'],'interview']])for(const marker of markers){
  const title=marker+' результаты';assert.deepEqual(newsPresentation(title),{type,title:'результаты'});assert.equal(title,marker+' результаты')
 }
})
test('small case-insensitive keyword rules and generic fallback',()=>{
 for(const [title,type] of [['результаты','results'],['ИТОГИ','results'],['Видео','video'],['HIGHLIGHTS','video'],['Трансляция','video'],['анонс','preview'],['ПРЕВЬЮ','preview'],['Неизвестный заголовок','news']])assert.deepEqual(newsPresentation(title),{type,title})
 assert.equal(newsPresentation('IRONMAN 70.3 World Championship — красавец и чудовище').type,'news')
})
test('visual type does not confer eligibility; qualifying bold remains necessary',()=>{
 for(const title of ['📺 Видео','🏆 результаты','анонс','Обычный заголовок']){
  newsPresentation(title)
  assert.equal(extractEligibleNews({text:title}),null)
  assert.equal(extractEligibleNews({text:title,entities:[{type:'bold',offset:0,length:title.length}]}).title,title)
 }
})
