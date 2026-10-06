import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {releaseChecks,browserChecks,historicalChecks,classifyChild,gateExit,interpretAthleteAudit,localURL} from './release-policy.mjs'

export async function runChecks(checks,{run=command=>spawnSync(command[0]==='node'?process.execPath:command[0],command.slice(1),{encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024}),before=async()=>{},after=async()=>{},log=console.log,directory}={}) {
  const results=[]
  for(const check of checks){
    const started=Date.now()
    let result
    try {await before(check);result=await run(check.command)}
    catch(error){result={status:null,error,stderr:String(error)}}
    finally {try{await after(check)}catch(error){result={...result,error,stderr:(result?.stderr??'')+String(error)}}}
    const classification=classifyChild(result)
    const row={name:check.name,...classification,seconds:(Date.now()-started)/1000,audit:!!check.audit,auditRead:false,known:[],failures:[]}
    if(check.audit){
      try{Object.assign(row,interpretAthleteAudit(JSON.parse(result.stdout)));row.auditRead=true;if(row.failures.length)row.status='FAIL'}
      catch(error){if(!row.environment)row.status='FAIL';row.failures=[String(error)]}
    }
    if(directory)await fs.writeFile(path.join(directory,`${results.length+1}.log`),(result.stdout??'')+(result.stderr??'')+(result.error?String(result.error):''))
    results.push(row);log(`${row.status} ${check.name} (${row.seconds.toFixed(1)}s)`)
    for(const failure of row.failures)log(`  ${failure}`)
  }
  return results
}
export function summary(results,label='V1 RELEASE GATE') {
  const exitCode=gateExit(results), known=results.flatMap(r=>r.known??[])
  return [`${label}: ${exitCode===0?'PASS':exitCode===1?'FAIL':'ENVIRONMENT ERROR'}`,
    label==='V1 RELEASE GATE'?`KNOWN DATA ISSUES: ${results.some(r=>r.audit&&!r.auditRead)?'UNAVAILABLE (audit incomplete)':known.length}`:'Known data issues: see check:release (not reassessed by browser gate)',...known.map(k=>`- ${k}`),
    'Failures: '+(results.filter(r=>r.status==='FAIL').map(r=>r.name).join(', ')||'none'),
    'Environment errors: '+(results.filter(r=>r.environment).map(r=>r.name).join(', ')||'none')].join('\n')
}
async function main(){
  const args=process.argv.slice(2)
  if(args.length>1||(args.length&&args[0]!=='--browser'))throw Error('Usage: check-release.mjs [--browser]')
  const browser=args[0]==='--browser',started=Date.now()
  const directory=await fs.mkdtemp(path.join(os.tmpdir(),'tri-release-'))
  let hooks={},env=process.env
  if(browser){
    try{
      const base=localURL(process.env.TRI_APP_URL??'http://127.0.0.1:5390')
      const cdp=localURL(process.env.TRI_CDP_URL??'http://127.0.0.1:9373')
      const get=async(url,method='GET')=>{
        const r=await fetch(url,{method,redirect:'error',signal:AbortSignal.timeout(5000)})
        if(!r.ok)throw Error(`Local preflight HTTP ${r.status}`)
        return r
      }
      const html=await(await get(base)).text()
      if(html!==await fs.readFile('dist/index.html','utf8'))throw Error('Server must serve this checkout dist/index.html (vite preview); run check:release first')
      await get(cdp+'/json/version')
      let beforeIds
      hooks={before:async()=>{
        beforeIds=new Set((await(await get(cdp+'/json/list')).json()).map(p=>p.id))
        await get(cdp+'/json/new?about:blank','PUT')
      },after:async()=>{
        if(!beforeIds)return
        for(const p of await(await get(cdp+'/json/list')).json())if(!beforeIds.has(p.id))await get(cdp+'/json/close/'+p.id)
      }}
      env={...process.env,TRI_APP_URL:base,TRI_CDP_URL:cdp}
    }catch(error){console.error(`V1 RC BROWSER GATE: ENVIRONMENT ERROR\n${error}`);process.exitCode=2;return}
  }
  console.log(`Logs: ${directory}`)
  const results=await runChecks(browser?browserChecks:releaseChecks,{...hooks,directory,run:command=>spawnSync(command[0]==='node'?process.execPath:command[0],command.slice(1),{env,encoding:'utf8',timeout:180000,maxBuffer:16*1024*1024})})
  console.log(summary(results,browser?'V1 RC BROWSER GATE':'V1 RELEASE GATE'))
  if(!browser){console.log('Non-gating / not run:\n'+historicalChecks.map(c=>'- '+c).join('\n'));console.log('RC also requires check:release:browser; the fast gate does not include browser or live infrastructure verification.')}
  console.log(`Runtime: ${((Date.now()-started)/1000).toFixed(1)}s`)
  await fs.writeFile(path.join(directory,'summary.json'),JSON.stringify(results,null,2)+'\n')
  process.exitCode=gateExit(results)
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await main()
