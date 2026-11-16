import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {parseStartParameter, initialTelegramHash, raceTelegramLink, athleteTelegramLink, hasDirectHash} from '../src/navigation/telegramLinks.ts'
import {NavigationHistory} from '../src/navigation/history.ts'
const server=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'})
const {allRaceEditionViews}=await server.ssrLoadModule('/src/data/raceEditions.ts')
const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
const sdk=await server.ssrLoadModule('/src/navigation/telegramLaunch.ts')
const exists=async r=>r.page==='race'?allRaceEditionViews.some(e=>e.editionId===r.id):r.page==='athlete'&&athletes.some(a=>String(a.id)===r.id)
const tg=p=>({initDataUnsafe:{start_param:p}})
test('valid Dubai race resolves and Main Mini App URL has no assumed short name',async()=>{
 assert.equal(await raceTelegramLink('t100-dubai-2026',exists),'https://t.me/tri_app_bot?startapp=race_t100-dubai-2026')
 assert.equal(await initialTelegramHash(()=>'',tg('race_t100-dubai-2026'),exists),'#/race/t100-dubai-2026')
})
test('athlete101 resolves using stable existing ID',async()=>{
 assert.equal(athletes.find(a=>a.id===101).nameEn,'Kate Waugh')
 assert.equal(await athleteTelegramLink(101,exists),'https://t.me/tri_app_bot?startapp=athlete_101')
 assert.equal(await initialTelegramHash(()=>'',tg('athlete_101'),exists),'#/athlete/101')
})
test('malformed, arbitrary URL, unsafe number, whitespace and oversized payloads rejected',()=>{
 for(const p of [null,1,{},'', 'https://evil.test','race_../a','race_%2F','race_a?x=y','race_a/b','athlete_01','athlete_0','athlete_-1','athlete_1e3','athlete_9007199254740992','athlete_101 ','RACE_a','race_'+ 'a'.repeat(128)])assert.equal(parseStartParameter(p),null,String(p))
})
test('unknown IDs never navigate; link helper refuses them',async()=>{
 assert.equal(await initialTelegramHash(()=>'',tg('athlete_99999999'),exists),undefined)
 assert.equal(await initialTelegramHash(()=>'',tg('race_unknown-2026'),exists),undefined)
 await assert.rejects(raceTelegramLink('unknown-2026',exists));await assert.rejects(athleteTelegramLink(99999999,exists))
})
test('browser fallback and catalog errors leave normal navigation available',async()=>{
 assert.equal(await initialTelegramHash(()=>'',undefined,exists),undefined)
 assert.equal(await initialTelegramHash(()=>'',tg('athlete_101'),async()=>{throw Error('offline')}),undefined)
})
test('explicit hash route including Home wins over launch payload without loading catalog',async()=>{
 for(const h of ['#/home','#/calendar','#/rankings','#/athlete/101','#/race/t100-dubai-2026']){
  assert.ok(hasDirectHash(h));assert.equal(await initialTelegramHash(()=>h,tg('athlete_1'),async()=>{throw Error('must not run')}),undefined)
 }
 assert.equal(hasDirectHash('#tgWebAppData=abc'),false)
 let h='';assert.equal(await initialTelegramHash(()=>h,tg('athlete_101'),async()=>{h='#/more';return true}),undefined)
})
test('StrictMode initializer replay, Back, Forward, BottomNav and refresh do not duplicate launch',async()=>{
 const hash=await initialTelegramHash(()=>'',tg('race_t100-dubai-2026'),exists),entries=[{url:'',state:null}];let index=0,backs=0
 const port={get state(){return entries[index].state},replaceState(state,_,url){entries[index]={state,url}},pushState(state,_,url){entries.splice(++index);entries.push({state,url})},back(){backs++}}
 new NavigationHistory(port,hash)
 const nav=new NavigationHistory(port,hash) // React StrictMode double initializer reads persisted entry.
 assert.equal(entries.length,2);assert.equal(entries[0].url,'#/calendar');assert.equal(nav.current.route.id,'t100-dubai-2026')
 nav.back();assert.equal(backs,1);index--;nav.pop(port.state,entries[index].url);assert.equal(nav.current.route.page,'calendar')
 assert.equal(await initialTelegramHash(()=>entries[index].url,tg('race_t100-dubai-2026'),exists),undefined)
 index++;nav.pop(port.state,entries[index].url);assert.equal(nav.current.route.page,'race')
 nav.navigate({page:'rankings'});assert.equal(nav.current.route.page,'rankings');const n=entries.length;new NavigationHistory(port,entries[index].url);assert.equal(entries.length,n)
})
test('Telegram launch hints are not interpreted as routes and SDK is conditional',async()=>{
 assert.equal(sdk.isTelegramLaunch({hash:'#/race/t100-dubai-2026',search:''}),false)
 assert.equal(sdk.isTelegramLaunch({hash:'#tgWebAppData=abc',search:''}),true)
 assert.equal(sdk.isTelegramLaunch({hash:'',search:'?tgWebAppStartParam=athlete_101'}),true)
 const oldWindow=globalThis.window,oldDocument=globalThis.document
 try{
  globalThis.window={location:{hash:'',search:''}};globalThis.document={createElement(){throw Error('Browser must not load SDK')}}
  assert.equal(await sdk.loadTelegramSDK(),undefined)
  let ready=0;window.Telegram={WebApp:{...tg('race_t100-dubai-2026'),ready(){ready++}}}
  const launch=await sdk.prepareTelegramLaunch();assert.equal(launch.initialHash,'#/race/t100-dubai-2026');launch.ready();assert.equal(ready,1)
  delete window.Telegram;window.location.hash='#tgWebAppData=abc'
  globalThis.document={createElement(){return {}},head:{appendChild(s){assert.equal(s.src,'https://telegram.org/js/telegram-web-app.js');window.Telegram={WebApp:tg('race_t100-dubai-2026')};queueMicrotask(()=>s.onload())}}}
  assert.equal((await sdk.loadTelegramSDK()).initDataUnsafe.start_param,'race_t100-dubai-2026')
  delete window.Telegram;document.head.appendChild=s=>queueMicrotask(()=>s.onerror());assert.equal(await sdk.loadTelegramSDK(),undefined)
 }finally{globalThis.window=oldWindow;globalThis.document=oldDocument}
})
test.after(async()=>{await server.close()})
