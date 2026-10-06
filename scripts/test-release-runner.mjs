import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {runChecks,summary} from './check-release.mjs'
import {releaseChecks,browserChecks,classifyChild,gateExit,interpretAthleteAudit,localURL} from './release-policy.mjs'

test('real child PASS/FAIL and exit semantics; no retry or swallowed failure',async()=>{
  const checks=[{name:'ok',command:[process.execPath,'-e','process.exit(0)']},{name:'bad',command:[process.execPath,'-e','process.exit(7)']}]
  let calls=0
  const rows=await runChecks(checks,{run:c=>{calls++;return spawnSync(c[0],c.slice(1),{encoding:'utf8'})},log:()=>{}})
  assert.deepEqual(rows.map(r=>r.status),['PASS','FAIL']);assert.equal(calls,2)
  assert.equal(gateExit(rows),1);assert.equal(gateExit(rows.slice(0,1)),0)
  assert.match(summary(rows),/V1 RELEASE GATE: FAIL/)
})
test('EPERM/HMR is environmental even with exit 0; assertion and environment remain visible together',()=>{
  const env=classifyChild({status:0,stderr:'Error: listen EPERM: operation not permitted'})
  assert.equal(env.status,'ENVIRONMENT ERROR');assert.equal(gateExit([env]),2)
  const both=classifyChild({status:1,stderr:'listen EPERM\nAssertionError: incorrect order'})
  assert.equal(both.status,'FAIL');assert.equal(both.environment,true);assert.equal(gateExit([both]),1)
  assert.equal(classifyChild({status:1,stderr:'Cannot find package sharp'}).status,'ENVIRONMENT ERROR')
  assert.equal(classifyChild({status:1,stderr:'ERR_MODULE_NOT_FOUND: Cannot find module /project/src/broken.ts'}).status,'FAIL')
  assert.equal(classifyChild({status:null,signal:'SIGTERM'}).status,'FAIL')
})
test('known issues matched exactly, unknown/changed/duplicate issues block; absent issues are not invented',async()=>{
  const report={schemaVersion:1,issues:['GENERATED MISSING COUNTRY: Erik Olsson [10144]'],countryConflicts:[{id:10235,nameEn:'Jeremy Maclean',codes:['AU','US'],registry:'US'}]}
  const interpreted=interpretAthleteAudit(report)
  assert.equal(interpreted.known.length,2);assert.deepEqual(interpreted.failures,[])
  assert.equal(interpretAthleteAudit({...report,issues:['GENERATED MISSING COUNTRY: New Athlete [99999]']}).failures.length,1)
  assert.equal(interpretAthleteAudit({...report,countryConflicts:[{...report.countryConflicts[0],codes:['AU','GB','US']}]}).failures.length,1)
  assert.equal(interpretAthleteAudit({...report,issues:[...report.issues,...report.issues]}).failures.length,1)
  assert.throws(()=>interpretAthleteAudit({issues:[]}))
  const rows=await runChecks([{name:'audit',command:[],audit:true}],{run:()=>({status:0,stdout:JSON.stringify(report)}),log:()=>{}})
  assert.equal(gateExit(rows),0);assert.match(summary(rows),/KNOWN DATA ISSUES: 2/)
  const bad=await runChecks([{name:'audit',command:[],audit:true}],{run:()=>({status:0,stdout:'not JSON'}),log:()=>{}})
  assert.equal(gateExit(bad),1)
  assert.match(summary(bad),/UNAVAILABLE/)
  const unknown=await runChecks([{name:'audit',command:[],audit:true}],{run:()=>({status:0,stdout:JSON.stringify({...report,issues:['NEW ISSUE']})}),log:()=>{}})
  assert.equal(gateExit(unknown),1)
  const envKnown=await runChecks([{name:'audit',command:[],audit:true}],{run:()=>({status:0,stdout:JSON.stringify(report),stderr:'listen EPERM'}),log:()=>{}})
  assert.equal(gateExit(envKnown),2);assert.match(summary(envKnown),/KNOWN DATA ISSUES: 2/)

})
test('gate command allowlist contains no operational mutation or full regeneration; browser origins fail closed',()=>{
  for(const {command}of [...releaseChecks,...browserChecks]){
    assert.ok(['node','npm','git'].includes(command[0]))
    assert.doesNotMatch(command.join(' '),/deploy|wrangler|--write|--remote|seed-news\.mjs|import-race-results\.mjs|find-next-athletes\.mjs|test-athlete-localization\.mjs|test-athlete-photos\.mjs/)
    if(command[0]==='npm')assert.ok(['build','lint'].includes(command[2]))
    if(command[0]==='git')assert.equal(command[1],'diff')
  }
  assert.ok(browserChecks.some(c=>c.name==='ranking'))
  assert.ok(!browserChecks.some(c=>c.name==='feedback')) // requires a local Worker; submission suite mocks every POST instead
  for(const u of ['https://preview.300w.app','https://127.0.0.1','http://127.0.0.1.evil','http://user@localhost','http://localhost/x'])assert.throws(()=>localURL(u))
  assert.equal(localURL('http://127.0.0.1:5390'),'http://127.0.0.1:5390')
})
