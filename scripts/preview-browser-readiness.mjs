import assert from 'node:assert/strict'
import net from 'node:net'

export async function assertBrowserPortFree(port=9387){
 const server=net.createServer()
 await new Promise((resolve,reject)=>{
  server.once('error',error=>reject(Error(`Chrome CDP port ${port} unavailable: ${error.code}`)))
  server.listen(port,'127.0.0.1',()=>server.close(resolve))
 })
}

// REL-QA-02B: Chrome was alive and announced DevTools near the old 5s deadline.
// Allow a bounded 15s startup window; return immediately when ready.
// Per-request timeout remains <=1s and polling remains 100ms.
export async function waitForBrowserTarget({browser,startup,fetcher=fetch,now=()=>performance.now(),sleep=ms=>new Promise(r=>setTimeout(r,ms)),timeoutMs=15000}) {
 assert.ok(timeoutMs>0&&timeoutMs<=15000)
 const start=now(),origin='http://127.0.0.1:9387'
 const alive=()=>{
  assert.ok(!startup.spawnError,`Chrome spawn failed: ${startup.spawnError}`)
  assert.ok(!startup.exit&&browser.exitCode==null&&browser.signalCode==null,`Chrome exited before CDP readiness: ${JSON.stringify(startup.exit)}; ${startup.stderr}`)
 }
 const read=async endpoint=>{
  let response
  try {response=await fetcher(origin+endpoint,{redirect:'error',signal:AbortSignal.timeout(Math.max(1,Math.ceil(Math.min(1000,timeoutMs-(now()-start)))))})}
  catch(error){startup.observations.push({elapsedMs:now()-start,endpoint,error:error.message,cause:error.cause?.code});return undefined}
  assert.equal(response.status,200,`CDP ${endpoint}: HTTP ${response.status}`)
  let data
  try {data=await response.json()}catch{throw Error(`CDP ${endpoint}: invalid JSON`)}
  return data
 }
 while(now()-start<timeoutMs){
  alive()
  const version=await read('/json/version')
  if(version!==undefined){
   assert.ok(version&&typeof version.Browser==='string'&&typeof version.webSocketDebuggerUrl==='string','Invalid CDP version response')
   startup.cdpVersion=version
   if(now()-start>=timeoutMs)break
   const targets=await read('/json/list')
   if(targets!==undefined){
    assert.ok(Array.isArray(targets)&&targets.every(t=>t&&typeof t==='object'&&typeof t.type==='string'),'Invalid CDP target list')
    startup.observations.push({elapsedMs:now()-start,targetCount:targets.length,pageCount:targets.filter(t=>t.type==='page').length})
    const target=targets.find(t=>t.type==='page')
    if(target){
     const url=new URL(target.webSocketDebuggerUrl)
     assert.ok(url.protocol==='ws:'&&url.hostname==='127.0.0.1'&&url.port==='9387','Unexpected CDP page WebSocket endpoint')
     alive();assert.ok(now()-start<timeoutMs,'CDP readiness budget exhausted')
     return target
    }
   }
  }
  alive()
  await sleep(Math.max(0,Math.min(100,timeoutMs-(now()-start))))
 }
 alive()
 throw Error(`Chrome CDP readiness timeout after ${Math.round(now()-start)}ms; ${JSON.stringify(startup.observations.slice(-5))}; stderr: ${startup.stderr}`)
}

// Stop only the child launched by this smoke; never kill by port or process name.
export async function stopBrowser(browser,graceMs=2000){
 if(!browser.pid||browser.exitCode!==null||browser.signalCode!==null)return
 const terminate=signal=>new Promise(resolve=>{
  const done=()=>{clearTimeout(timer);browser.removeListener('exit',done);resolve()}
  const timer=setTimeout(done,graceMs)
  browser.once('exit',done)
  browser.kill(signal)
 })
 await terminate('SIGTERM')
 if(browser.exitCode===null&&browser.signalCode===null)await terminate('SIGKILL')
 assert.ok(browser.exitCode!==null||browser.signalCode!==null,'Chrome did not exit within bounded cleanup')
}
