import test from 'node:test'
import assert from 'node:assert/strict'
import {mappingPlan,decisionsFromCsv,identityEvidence,authorizeExtraction,fetchIdentity,validProfileUrl,normalizedPtoCountry} from './pto-profile-mapping.mjs'
import {extract} from './pto-profile-core.mjs'
const url='https://stats.protriathletes.org/athlete/test-athlete'
const athlete={id:1,nameEn:'Test Athlete',countryCode:'US',gender:'M'},pilot={id:1,name:'Test Athlete',gender:'M',url}
const html=(country='us',canonical=url)=>`<link rel="canonical" href="${canonical}"><meta property="og:title" content="Test Athlete - Pro Triathlon Results | PTO"><div class="country attribute"><div class="flag-icon flag-icon-${country}"></div></div><div class="attribute"><div class="name">Age</div><div class="value">32</div></div>`
const decision=(value='APPROVE',replacement_url='')=>({id:1,proposed_url:url,decision:value,replacement_url})
const response=(body=html(),status=200)=>new Response(body,{status,headers:{'content-type':'text/html'}})
test('no owner decision: pending and no request/extraction',async()=>{const [r]=mappingPlan([pilot],[athlete]);let calls=0;assert.equal(await authorizeExtraction(r,athlete,()=>{calls++}),null);assert.equal(calls,0);assert.equal(r.status,'PENDING_OWNER_REVIEW');assert.deepEqual(extract(html(),true).fields,{})})
test('name alone insufficient; country and canonical required',()=>{assert.equal(identityEvidence(athlete,url,html('au')).sufficient,false);assert.equal(identityEvidence(athlete,url,html('us',url+'-other')).sufficient,false);assert.equal(identityEvidence({...athlete,countryCode:null},url,html()).sufficient,false)})
test('APPROVE validates once, without following redirect',async()=>{let calls=0;const [r]=mappingPlan([pilot],[athlete],[decision()]);assert.equal(await authorizeExtraction(r,athlete,async(u,options)=>{calls++;assert.equal(u,url);assert.equal(options.redirect,'manual');return response()}),html());assert.equal(calls,1);assert.equal(r.status,'APPROVED_FOR_FIELD_DRY_RUN')})
test('REPLACE uses corrected URL and validates its canonical',async()=>{const replacement=url+'-corrected';const [r]=mappingPlan([pilot],[athlete],[decision('REPLACE',replacement)]);await authorizeExtraction(r,athlete,async u=>{assert.equal(u,replacement);return response(html('us',replacement))});assert.equal(r.status,'APPROVED_FOR_FIELD_DRY_RUN')})
test('SKIP never fetches even missing URL',async()=>{const [r]=mappingPlan([{...pilot,url:''}],[athlete],[{...decision('SKIP'),proposed_url:''}]);assert.equal(r.status,'SKIPPED');assert.equal(await authorizeExtraction(r,athlete,()=>{throw Error('must not fetch')}),null)})
test('approved mapping is never silently replaced',()=>{const previous=[{id:1,url,approvedAt:'2026-10-18',approvedBy:'owner'}];const [r]=mappingPlan([pilot],[athlete],[decision('REPLACE',url+'-new')],previous);assert.ok(r.conflicts.includes('PREVIOUSLY_APPROVED_MAPPING_CONFLICT'));assert.equal(previous[0].url,url)})
test('previous approved URL unavailable or changed identity returns review',async()=>{for(const fetcher of [async()=>response('',404),async()=>response(html('au')),async()=>{throw Error('offline')}]){const [r]=mappingPlan([pilot],[athlete],[decision()],[{id:1,url,approvedAt:'2026-10-18',approvedBy:'owner'}]);assert.equal(await authorizeExtraction(r,athlete,fetcher),null);assert.equal(r.status,'REVIEW_REQUIRED');assert.equal(r.selectedUrl,url)}})
test('strict URL syntax rejects credentials, spoofing, queries and other paths',()=>{for(const u of ['http://stats.protriathletes.org/athlete/test','https://stats.protriathletes.org.evil/athlete/test',url+'?x=1',url+'#test','https://user@stats.protriathletes.org/athlete/test','https://stats.protriathletes.org/race/test'])assert.equal(validProfileUrl(u),false)})
test('HTTP redirects and rate limits rejected without retry',async()=>{for(const code of [301,403,429]){let calls=0;await assert.rejects(()=>fetchIdentity(url,async()=>{calls++;return response('',code)}),new RegExp(String(code)));assert.equal(calls,1)}})
test('missing URL, duplicated IDs and stale decisions visible',()=>{assert.ok(mappingPlan([{...pilot,url:''}],[athlete])[0].conflicts.includes('MISSING_PROFILE_URL'));assert.throws(()=>mappingPlan([pilot,pilot],[athlete]),/DUPLICATE/);assert.ok(mappingPlan([pilot],[athlete],[{...decision(),proposed_url:url+'-old'}])[0].conflicts.includes('STALE_DECISION_PROPOSAL'))})
test('CSV supports explicit decisions, rejects duplicates/unknown enum',()=>{const head='id,name,proposed_url,decision,replacement_url\n';const row=`1,"Test, Athlete",${url},APPROVE,\n`;assert.equal(decisionsFromCsv(head+row)[0].decision,'APPROVE');assert.throws(()=>decisionsFromCsv(head+row+row),/DUPLICATE/);assert.throws(()=>decisionsFromCsv(head+row.replace('APPROVE','YES')),/INVALID/)})
test('duplicate profile URLs block both athletes',()=>{const rows=mappingPlan([pilot,{...pilot,id:2,name:'Other'}],[athlete,{...athlete,id:2,nameEn:'Other'}]);assert.ok(rows.every(r=>r.conflicts.includes('PROFILE_ASSIGNED_TO_MULTIPLE_IDS')))})

test('Unicode and percent-encoded PTO slugs, including Lena, are supported',()=>{
 for(const slug of ['lena-meißner','lena-mei%C3%9Fner','lena-mei%c3%9fner','josé-test','jose%CC%81-test'])assert.equal(validProfileUrl('https://stats.protriathletes.org/athlete/'+slug),true)
 const raw='https://stats.protriathletes.org/athlete/lena-meißner',encoded='https://stats.protriathletes.org/athlete/lena-mei%C3%9Fner'
 assert.equal(identityEvidence(athlete,raw,html('us',encoded)).canonicalMatch,true)
})
test('malformed encoding and encoded path/query substitution fail closed',()=>{
 for(const suffix of ['a\n','a%0A','a%0D','a%09','%','%GG','%C3','%C0%AF','%ED%A0%80','%252F','a%2Fb','a%5Cb','a%3Fb','a%23b','a%00b','a%20b','..','a/../b','a?identity=b','a#b','a/','\ud800'])assert.equal(validProfileUrl('https://stats.protriathletes.org/athlete/'+suffix),false,suffix)
 for(const u of ['https://stats.protriathletes.org:443/athlete/test','https://stats.protriathletes.org./athlete/test','https://stats.protriathletes.org@evil.example/athlete/test','https://evil.example/athlete/lena-mei%C3%9Fner'])assert.equal(validProfileUrl(u),false)
})
test('Unicode-equivalent duplicate URLs and duplicate registry IDs are rejected',()=>{
 const raw='https://stats.protriathletes.org/athlete/lena-meißner',encoded='https://stats.protriathletes.org/athlete/lena-mei%C3%9Fner'
 const rows=mappingPlan([{...pilot,url:raw},{...pilot,id:2,name:'Other',url:encoded}],[athlete,{...athlete,id:2,nameEn:'Other'}]);assert.ok(rows.every(r=>r.conflicts.includes('PROFILE_ASSIGNED_TO_MULTIPLE_IDS')))
 const entry={id:1,url:raw,approvedBy:'owner',approvedAt:'2026-10-19'}
 assert.throws(()=>mappingPlan([pilot],[athlete],[],[entry,{...entry,id:2,url:encoded}]),/INVALID_APPROVED_REGISTRY/)
 assert.throws(()=>mappingPlan([pilot],[athlete],[],[entry,{...entry,url}]),/INVALID_APPROVED_REGISTRY/)
})
test('Lena valid URL stays pending without owner approval; redirects never followed',async()=>{
 const lena={id:133,nameEn:'Lena Meißner',countryCode:'DE',gender:'W'},u='https://stats.protriathletes.org/athlete/lena-mei%C3%9Fner'
 const [r]=mappingPlan([{id:133,name:lena.nameEn,gender:'W',url:u}],[lena]);assert.equal(r.status,'PENDING_OWNER_REVIEW')
 assert.equal(await authorizeExtraction(r,lena,()=>{throw Error('must not fetch')}),null)
 let calls=0;await assert.rejects(()=>fetchIdentity(u,async(_,options)=>{calls++;assert.equal(options.redirect,'manual');return new Response(null,{status:302,headers:{location:'https://evil.example'}})}),/PROFILE_HTTP_302/);assert.equal(calls,1)
})
test('photo registry preserves all pilot approvals and adds only 201 approved identities',async()=>{
 const {readFile}=await import('node:fs/promises'),{createHash}=await import('node:crypto'),{spawnSync}=await import('node:child_process')
 const reg=JSON.parse(await readFile('src/data/athletes/ptoProfileMappings.json','utf8')).mappings
 assert.equal(reg.length,221);assert.equal(new Set(reg.map(r=>r.id)).size,221);assert.equal(new Set(reg.map(r=>r.url)).size,221)
 assert.equal(createHash('sha256').update(JSON.stringify(reg.slice(0,20))).digest('hex'),'523950edf5e1c98b56b87466a43fc9c548d127eee2174185e0d1e132b46e7167')
 const csv=await readFile('docs/athlete-pto-photo-mapping-review-2026-10-19.csv','utf8'),parsed=spawnSync('python3',['-c','import csv,json,sys;print(json.dumps(list(csv.DictReader(sys.stdin))))'],{input:csv,encoding:'utf8'});assert.equal(parsed.status,0);const rows=JSON.parse(parsed.stdout)
 assert.equal(rows.filter(r=>r.owner_decision==='APPROVE').length,201);assert.equal(rows.find(r=>r.id==='133').owner_decision,'APPROVE');assert.equal(reg.filter(r=>r.id===133).length,1)
 for(const r of reg.slice(20)) {const row=rows.find(x=>Number(x.id)===r.id);assert.equal(row.owner_decision,'APPROVE');assert.equal(r.url,row.proposed_pto_url);assert.equal(r.name,row.name);assert.equal(r.identitySnapshotSha256,row.snapshot_sha256);assert.match(r.identitySnapshotSha256,/^[a-f0-9]{64}$/);assert.equal(r.identityObservedAt,row.observed_at);assert.equal(r.approvalScope,'URL_IDENTITY_ONLY');assert.equal(r.fieldApproval,'NOT_GRANTED');assert.ok(r.identityEvidence.raceMatches.length);assert.ok(validProfileUrl(r.url))}
})

test('known ISO pairs compare normalized identities while preserving raw values',()=>{
 for(const [alpha3,alpha2] of [['ZAF','ZA'],['USA','US'],['CHE','CH'],['DEU','DE'],['LVA','LV']]){
  const e=identityEvidence({...athlete,countryCode:alpha3},url,html(alpha2.toLowerCase()))
  assert.equal(e.sufficient,true);assert.equal(e.localCountry,alpha3);assert.deepEqual(e.sourceCountry,[alpha2]);assert.equal(e.localCountryNormalized,alpha2)
 }
 for(const [local,source] of [['ZZZ','zz'],['ZZ','zz'],['ZAF','ch'],['US','za']])assert.equal(identityEvidence({...athlete,countryCode:local},url,html(source)).sufficient,false)
})
const race={localResultId:9,edition:'test-2026',sourceRaceUrl:'https://stats.protriathletes.org/race/test/2026/results',position:3,total:'03:40:00',swim:'00:25:00',bike:'02:00:00',run:'01:10:00'}
const localResult={id:9,athleteId:1,raceEditionId:race.edition,position:3,totalTime:race.total,swimTime:race.swim,bikeTime:race.bike,runTime:race.run}
const approved={id:1,name:athlete.nameEn,url,approvedBy:'owner',approvedAt:'2026-10-19',approvalScope:'URL_IDENTITY_ONLY',identityEvidence:{raceMatches:[race]}}
const historyRow=`<tr><td class="race"><a href="/race/test/2026/results">Test</a></td><td class="place">3</td><td class="overall">03:40:00</td><td class="swim">00:25:00</td><td class="bike">02:00:00</td><td class="run">01:10:00</td></tr>`
const historyHtml=html('ch')+`<table>${historyRow}</table>`
const noCountry={...athlete,countryCode:null}
test('missing country requires owner approval and independently rechecked full result tuple',async()=>{
 const [r]=mappingPlan([pilot],[noCountry],[decision()],[approved],[localResult])
 assert.equal(await authorizeExtraction(r,noCountry,async()=>response(historyHtml)),historyHtml)
 assert.equal(r.evidence.countryMatch,false);assert.equal(r.evidence.missingCountryVerified,true);assert.deepEqual(r.evidence.historicalMatches,[9]);assert.equal(r.evidence.localCountry,null)
 assert.deepEqual(extract(historyHtml,true).fields,{});assert.deepEqual(extract(historyHtml,true).links,[])
})
test('missing country fails closed without approval or sufficient current result evidence',()=>{
 const contexts=[{}, {results:[localResult]}, {approvedMapping:approved}, {approvedMapping:approved,results:[{...localResult,totalTime:'03:41:00'}]}, {approvedMapping:approved,results:[localResult,localResult]}]
 for(const change of [{approvedBy:'importer'},{approvalScope:'OTHER'},{name:'Someone Else'},{id:2},{url:url+'-other'},{identityEvidence:{matchedResultCount:99,raceMatches:[]}}])contexts.push({approvedMapping:{...approved,...change},results:[localResult]})
 for(const context of contexts)assert.equal(identityEvidence(noCountry,url,historyHtml,context).sufficient,false)
 const context={approvedMapping:approved,results:[localResult]}
 for(const body of [html('ch'),historyHtml.replace('03:40:00','03:41:00'),historyHtml+historyRow,historyHtml.replace('Test Athlete -','Someone Else -')])assert.equal(identityEvidence(noCountry,url,body,context).sufficient,false)
 for(const countryCode of ['ZZZ','US'])assert.equal(identityEvidence({...athlete,countryCode},url,historyHtml,context).sufficient,false)
})
test('historical fallback cannot bypass duplicate mapping conflicts',async()=>{
 const rows=mappingPlan([pilot,{...pilot,id:2,name:'Other'}],[noCountry,{...athlete,id:2,nameEn:'Other'}],[decision()],[approved],[localResult])
 assert.equal(rows[0].status,'REVIEW_REQUIRED');assert.equal(await authorizeExtraction(rows[0],noCountry,()=>{throw Error('no request')}),null)
 assert.throws(()=>mappingPlan([pilot],[noCountry],[decision()],[approved,{...approved,id:2}],[localResult]),/INVALID_APPROVED_REGISTRY/)
})

// ISO aliases are separate from sporting-federation abbreviations.
test('complete pinned ISO table has 249 unique pairs and normalizes all 498 codes',async()=>{
 const {readFile}=await import('node:fs/promises')
 const {pairs}=JSON.parse(await readFile('scripts/data/iso-3166-1.json','utf8'))
 assert.equal(Object.keys(pairs).length,249);assert.equal(new Set(Object.values(pairs)).size,249)
 for(const [a2,a3] of Object.entries(pairs)){
  assert.match(a2,/^[A-Z]{2}$/);assert.match(a3,/^[A-Z]{3}$/)
  assert.equal(normalizedPtoCountry(a2),a2);assert.equal(normalizedPtoCountry(a3),a2)
 }
 for(const [a2,a3] of [['GR','GRC'],['ZA','ZAF'],['DE','DEU'],['GB','GBR']]){
  assert.equal(normalizedPtoCountry(a3),a2)
  for(const local of [a2,a3])assert.equal(identityEvidence({...athlete,countryCode:local},url,html(a2.toLowerCase())).sufficient,true)
 }
})
test('unknown, reserved, historical and unverified sports aliases remain unresolved',()=>{
 for(const c of ['ZZ','ZZZ','UK','XK','GER','GRE','RSA','SUI','ROC','URS','NED','FRAUD','__proto__','constructor','',null,17])assert.equal(normalizedPtoCountry(c),null,String(c))
 for(const [local,source]of [['GR','de'],['GRC','za'],['GBR','us'],['GRE','gr']])assert.equal(identityEvidence({...athlete,countryCode:local},url,html(source)).sufficient,false)
 assert.equal(identityEvidence({...athlete,countryCode:''},url,html('gr')).countryMatch,false)
 assert.equal(identityEvidence({...athlete,countryCode:''},url,html('gr')).sufficient,false)
})
