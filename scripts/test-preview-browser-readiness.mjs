import test from 'node:test'
import assert from 'node:assert/strict'
import net from 'node:net'
import {EventEmitter} from 'node:events'
import {waitForBrowserTarget,assertBrowserPortFree,stopBrowser} from './preview-browser-readiness.mjs'

const target={type:'page',webSocketDebuggerUrl:'ws://127.0.0.1:9387/devtools/page/test'}
function fixture(override={}){
 let time=0,calls=0
 const startup={stderr:'diagnostic stderr',observations:[],exit:null,spawnError:null}
 const options={browser:{exitCode:null,signalCode:null},startup,now:()=>time,sleep:async ms=>{time+=ms},fetcher:async url=>{calls++;return Response.json(url.endsWith('/version')?{Browser:'Chrome/test',webSocketDebuggerUrl:'ws://127.0.0.1:9387/devtools/browser/test'}:[target])},...override}
 return {options,run:()=>waitForBrowserTarget(options),elapsed:()=>time,calls:()=>calls}
}
test('valid version and page target complete readiness',async()=>{const f=fixture();assert.deepEqual(await f.run(),target);assert.equal(f.calls(),2);assert.equal(f.options.startup.cdpVersion.Browser,'Chrome/test')})
test('connection refusal is bounded and diagnostic',async()=>{const f=fixture({fetcher:async()=>{throw Object.assign(Error('connection refused'),{cause:{code:'ECONNREFUSED'}})}});await assert.rejects(f.run(),/readiness timeout.*ECONNREFUSED/);assert.equal(f.elapsed(),5000)})
test('empty targets cannot pass',async()=>{const f=fixture();const original=f.options.fetcher;f.options.fetcher=url=>url.endsWith('/list')?Promise.resolve(Response.json([])):original(url);await assert.rejects(f.run(),/readiness timeout/);assert.equal(f.elapsed(),5000)})
test('delayed page succeeds within unchanged budget',async()=>{const f=fixture();const original=f.options.fetcher;f.options.fetcher=url=>url.endsWith('/list')&&f.elapsed()<300?Promise.resolve(Response.json([])):original(url);assert.deepEqual(await f.run(),target);assert.equal(f.elapsed(),300)})
test('process exit fails immediately',async()=>{const f=fixture();f.options.browser.exitCode=1;f.options.startup.exit={code:1,signal:null};await assert.rejects(f.run(),/Chrome exited.*diagnostic stderr/);assert.equal(f.calls(),0)})
test('spawn error fails immediately',async()=>{const f=fixture();f.options.startup.spawnError='ENOENT';await assert.rejects(f.run(),/spawn failed: ENOENT/)})
test('HTTP errors are not swallowed',async()=>{const f=fixture({fetcher:async()=>new Response('',{status:503})});await assert.rejects(f.run(),/HTTP 503/);assert.equal(f.elapsed(),0)})
test('invalid JSON is rejected',async()=>{const f=fixture({fetcher:async()=>new Response('not JSON')});await assert.rejects(f.run(),/invalid JSON/)})
test('invalid version schema is rejected',async()=>{const f=fixture({fetcher:async()=>Response.json({})});await assert.rejects(f.run(),/Invalid CDP version/)})
for(const [label,data,pattern] of [['object',{},/Invalid CDP target list/],['null entry',[null],/Invalid CDP target list/],['foreign websocket',[{...target,webSocketDebuggerUrl:'ws://example.com:9387/page'}],/Unexpected CDP/]]){
 test('reject '+label,async()=>{const f=fixture();const original=f.options.fetcher;f.options.fetcher=url=>url.endsWith('/list')?Promise.resolve(Response.json(data)):original(url);await assert.rejects(f.run(),pattern)})
}
test('process exit during polling is rejected',async()=>{const f=fixture();f.options.fetcher=async()=>{f.options.startup.exit={code:2};throw Error('refused')};await assert.rejects(f.run(),/Chrome exited/);assert.equal(f.elapsed(),0)})

test('null version JSON is rejected immediately',async()=>{const f=fixture({fetcher:async()=>Response.json(null)});await assert.rejects(f.run(),/Invalid CDP version/);assert.equal(f.elapsed(),0)})
test('occupied CDP port fails before Chrome launch',async()=>{const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await assert.rejects(assertBrowserPortFree(server.address().port),/EADDRINUSE/)}finally{await new Promise(r=>server.close(r))}})

function child(ignoresTerm=false){
 const browser=new EventEmitter();Object.assign(browser,{pid:123,exitCode:null,signalCode:null,signals:[]})
 browser.kill=signal=>{browser.signals.push(signal);if(signal==='SIGKILL'||!ignoresTerm){browser.signalCode=signal;browser.emit('exit',null,signal)}return true}
 return browser
}
test('cleanup waits for normal termination',async()=>{const b=child();await stopBrowser(b,5);assert.deepEqual(b.signals,['SIGTERM']);assert.equal(b.listenerCount('exit'),0)})
test('cleanup escalates only its unresponsive child',async()=>{const b=child(true);await stopBrowser(b,5);assert.deepEqual(b.signals,['SIGTERM','SIGKILL']);assert.equal(b.listenerCount('exit'),0)})
test('cleanup ignores exited or never spawned child',async()=>{const b=child();b.exitCode=1;await stopBrowser(b);assert.deepEqual(b.signals,[]);b.exitCode=null;b.pid=undefined;await stopBrowser(b);assert.deepEqual(b.signals,[])})
