// Explicit commands only: no wildcard discovery of operational scripts.
const unit = (...files) => ['node', '--test', '--test-concurrency=1', ...files.map(f => `scripts/test-${f}.mjs`)]
export const releaseChecks = [
  {name:'build', command:['npm','run','build']},
  {name:'lint', command:['npm','run','lint']},
  {name:'diff', command:['git','diff','--check']},
  {name:'staged diff', command:['git','diff','--cached','--check']},
  {name:'foundation', command:unit('cloudflare-foundation')},
  {name:'Calendar', command:unit('calendar')},
  {name:'athlete catalog/search/localization', command:unit('athlete-catalog-presentation','athlete-country-strength','athlete-search','athlete-names','current-athletes')},
  {name:'athlete audit', command:['node','scripts/audit-athletes.mjs','--json'], audit:true},
  {name:'ranking', command:unit('ranking','ranking-dataset-clock')},
  {name:'navigation', command:unit('navigation','sports-loader')},
  {name:'News', command:unit('news','news-eligibility','news-presentation','news-seed')},
  {name:'Feedback (local mocks)', command:unit('feedback')},
  {name:'results integrity', command:['node','scripts/audit-results.mjs']},
  {name:'results source replay/identity', command:unit('race-result-import')},
  {name:'performance graph/images', command:unit('initial-graph','image-delivery')},
  {name:'accessibility', command:unit('accessibility')},
  {name:'release runner', command:unit('release-runner')},
]
export const browserSuites = ['calendar','athlete-disclosure','athlete-search','ranking','navigation','brand','more','news','dark-theme-text','ui-cleanup','image-delivery','code-splitting','accessibility','feedback-submission']
export const browserChecks = browserSuites.map(name => ({name, command:['node',`scripts/test-${name}-browser.mjs`]}))
export const historicalChecks = [
  'node scripts/test-athlete-localization.mjs — full regeneration into temporary output; known country conflicts FAIL',
  'node --test scripts/test-athlete-photos.mjs — historical batch counts/ranking/staging snapshots; known FAIL',
  'node --test scripts/test-athlete-photo-staging.mjs — isolated synthetic staging/publish; Swift/macOS environment dependency',
]
const knownMissing = new Set([
  'GENERATED MISSING COUNTRY: Erik Olsson [10144]',
  'GENERATED MISSING COUNTRY: Sebastian Schober [10541]',
])
const knownConflicts = [
  {id:10235,nameEn:'Jeremy Maclean',codes:['AU','US'],registry:'US'},
  {id:10435,nameEn:'Nick Thompson',codes:['AU','US'],registry:'AU'},
]
export function interpretAthleteAudit(report) {
  if (report?.schemaVersion !== 1 || !Array.isArray(report.issues) || !Array.isArray(report.countryConflicts)) throw Error('Invalid structured athlete audit')
  const known=[], failures=[]
  for(const issue of report.issues) (knownMissing.has(issue)?known:failures).push(issue)
  for(const issue of report.countryConflicts){
    const match=knownConflicts.some(k=>k.id===issue.id&&k.nameEn===issue.nameEn&&k.registry===issue.registry&&JSON.stringify(k.codes)===JSON.stringify(issue.codes))
    ;(match?known:failures).push(`COUNTRY PROVENANCE: ${JSON.stringify(issue)}`)
  }
  if(new Set(report.issues).size!==report.issues.length || new Set(report.countryConflicts.map(i=>i.id)).size!==report.countryConflicts.length) failures.push('Duplicate audit diagnostics')
  return {known,failures}
}
export function classifyChild(result) {
  const text=(result.stdout??'')+'\n'+(result.stderr??'')
  const environment=Boolean(result.error)||/listen (?:EPERM|EACCES|EADDRINUSE)|ECONNREFUSED|Cannot find package|spawn \S+ ENOENT/.test(text)
  const assertion=/AssertionError|ERR_ASSERTION|✖|not ok \d/.test(text)
  const failed=Boolean(result.signal)||((result.status!==0||result.error)&&(!environment||assertion))
  return {status:failed?'FAIL':environment?'ENVIRONMENT ERROR':'PASS',environment}
}
export function gateExit(results) {
  return results.some(r=>r.status==='FAIL')?1:results.some(r=>r.status!=='PASS')?2:0
}
export function localURL(value) {
  const u=new URL(value)
  if(u.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(u.hostname)||u.username||u.password||u.pathname!=='/'||u.search||u.hash) throw Error('Only a loopback HTTP origin is allowed')
  return u.origin
}
