// Seven qualified acceptance suites; fresh process/profile, no retries or rebuild.
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import {spawn,spawnSync} from 'node:child_process'
const root=process.env.BROWSER_REPORT_DIR
if(!root)throw Error('BROWSER_REPORT_DIR required')
await fs.mkdir(root,{recursive:true})
const chrome=['google-chrome','google-chrome-stable','chromium','chromium-browser'].find(c=>spawnSync('which',[c]).status===0)
if(!chrome)throw Error('ENVIRONMENT: no preinstalled Chrome/Chromium; no silent substitute/install')
await fs.writeFile(path.join(root,'browser-version.txt'),spawnSync(chrome,['--version'],{encoding:'utf8'}).stdout)
const sleep=ms=>new Promise(r=>setTimeout(r,ms))
const ready=async(url,predicate=()=>true)=>{let last;for(let i=0;i<100;i++){try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});if(r.ok&&await predicate(r))return}catch(e){last=e.message}await sleep(200)}throw Error('ENVIRONMENT readiness timeout '+url+' '+(last??''))}
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5390','--strictPort'],{stdio:['ignore','pipe','pipe']})
let serverLog='';server.stdout.on('data',b=>serverLog+=b);server.stderr.on('data',b=>serverLog+=b)
const results=[]
try{
 await ready('http://127.0.0.1:5390')
 for(const suite of ['official-rankings','rankings-controls','rankings-swipe','rankings-showcase','navigation','calendar','more']){
  const dir=path.join(root,suite);await fs.mkdir(dir,{recursive:true});const profile=await fs.mkdtemp(path.join(os.tmpdir(),'tri-browser-'))
  const browser=spawn(chrome,['--headless=new','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9373','--user-data-dir='+profile,'--no-first-run','--no-default-browser-check','about:blank'],{stdio:['ignore','pipe','pipe']})
  let browserLog='';browser.stdout.on('data',b=>browserLog+=b);browser.stderr.on('data',b=>browserLog+=b)
  let status,output='',error
  try{
   await ready('http://127.0.0.1:9373/json/list',async r=>(await r.json()).filter(t=>t.type==='page').length===1)
   const child=spawn(process.execPath,[`scripts/test-${suite}-browser.mjs`],{env:{...process.env,TRI_APP_URL:'http://127.0.0.1:5390',TRI_CDP_URL:'http://127.0.0.1:9373',TRI_ARTIFACT_DIR:dir,TRI_SHOWCASE_OUTPUT:dir},stdio:['ignore','pipe','pipe']})
   child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b)
   status=await new Promise(resolve=>{const timer=setTimeout(()=>{error='suite timeout 300s';child.kill('SIGKILL')},300000);child.once('error',e=>{clearTimeout(timer);error=e.message;resolve(null)});child.once('close',code=>{clearTimeout(timer);resolve(code)})})
  }catch(e){error=e.message;status=null}
  finally{
   browser.kill('SIGTERM');await Promise.race([new Promise(r=>browser.once('close',r)),sleep(3000)]);if(browser.exitCode===null)browser.kill('SIGKILL')
   await fs.writeFile(path.join(dir,'browser.log'),browserLog);await fs.writeFile(path.join(dir,'test.log'),output)
  }
  const result={suite,status,error:error??null,result:status===0?'PASS':error?.startsWith('ENVIRONMENT')?'ENVIRONMENT ERROR':'FAIL'};results.push(result);console.log(JSON.stringify(result));if(status!==0)console.log(output)

 }
}finally{server.kill('SIGTERM');await fs.writeFile(path.join(root,'server.log'),serverLog);await fs.writeFile(path.join(root,'summary.json'),JSON.stringify(results,null,2));if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'## Browser first-run results\n\n'+results.map(r=>`- ${r.suite}: ${r.result}`).join('\n')+'\n')}
process.exitCode=results.length!==7||results.some(r=>r.result!=='PASS')?1:0
