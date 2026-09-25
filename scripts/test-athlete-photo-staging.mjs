import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {sha256,snapshotTree} from './athlete-photo-core.mjs'
import {makeDecoder,stageDownloads,selectAccepted,fetchImage,validateBytes,compareImages,STAGING,REGISTRY,EVIDENCE,safePath} from './athlete-photo-staging.mjs'
import {publishApproved} from './athlete-photo-publish.mjs'
let decoder,bytes,decoded
const discoveryBytes=await fs.readFile('scripts/fixtures/athlete-photo-pilot-discovery.json')
const discovery=JSON.parse(discoveryBytes),discoveryHash=sha256(discoveryBytes)
const accepted=JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-pilot-staging-accepted.json','utf8'))
before(async()=>{
  decoder=await makeDecoder()
  const file=path.resolve('public/athletes/'+(await fs.readdir('public/athletes'))[0])
  bytes=await fs.readFile(file);[decoded]=await decoder.inspect([file]);assert.ok(decoded.decoded)
})
after(async()=>{await decoder?.close()})
async function root(){const r=await fs.mkdtemp(path.join(os.tmpdir(),'tri-stage-tests-'));await fs.mkdir(path.join(r,'public/athletes'),{recursive:true});await fs.mkdir(path.join(r,'src/data/athletes'),{recursive:true});await fs.writeFile(path.join(r,REGISTRY),'original registry bytes\n');return r}
const single=()=>({...accepted,candidates:[accepted.candidates[0]]})
const mockFetch=async()=>new Response(bytes,{headers:{'content-type':'image/png'}})
async function staged(r){return stageDownloads({root:r,discovery,accepted:single(),discoveryHash,registry:{},decoder,fetchImpl:mockFetch})}
function approvals(manifest,status='APPROVED'){
  for(const e of manifest.entries)e.reviewStatus=status
  return {manifestSha256:sha256(Buffer.from(JSON.stringify(manifest))),entries:manifest.entries.map(e=>({athleteId:e.athlete.athleteId,reviewStatus:status,sourceImageUrl:e.sourceImageUrl,sha256:e.sha256,reviewer:'Synthetic test reviewer',reviewMethod:'manual-visual-review',athlete:e.athlete,verifiedProfileUrl:e.verifiedProfileUrl,reviewedAt:'2026-09-24T00:00:00Z'}))}
}
const athletes=manifest=>manifest.entries.map(e=>({id:e.athlete.athleteId,nameEn:e.athlete.nameEn,gender:e.athlete.gender}))

test('staging accepted list is precisely the user-authorized 7 MEN and 9 WOMEN; URL/hash immutable',()=>{
  const selected=selectAccepted(discovery,accepted,discoveryHash)
  assert.deepEqual(selected.map(d=>d.athlete.nameEn),['Harry Palmer','Panagiotis Bitados','Justus Nieschlag','Pierre Le Corre','Alistair Brownlee','David McNamee','Nicolas Mann','Emma Pallant-Browne','Anne Reischmann','Nikki Bartlett','Laura Madsen','Anne Haug','Alice Alberts','Laura Jansen','Lisa Becharas','Nina Derron'])
  assert.throws(()=>selectAccepted(discovery,accepted,'wrong'),/hash/)
  assert.throws(()=>selectAccepted(discovery,{...accepted,candidates:[{...accepted.candidates[0],sourceImageUrl:'https://example.org/another.png'}]},discoveryHash),/mismatch/)
  for(const confidence of ['MEDIUM','LOW','NO_PHOTO','RETRY_UNRESOLVED']){
    const copy=structuredClone(discovery);copy.decisions[0].confidence=confidence
    assert.throws(()=>selectAccepted(copy,single(),discoveryHash),/HIGH/)
  }
})
test('download rejects HTML, spoofed image MIME, CRC corruption, empty, redirect, HTTP error and wrong final URL',async()=>{
  assert.throws(()=>validateBytes(Buffer.from('<html>error</html>'),'image/png'))
  assert.throws(()=>validateBytes(Buffer.alloc(0),'image/png'))
  const corrupt=Buffer.from(bytes);corrupt[40]^=1;assert.throws(()=>validateBytes(corrupt,'image/png'),/CRC|Truncated/)
  for(const response of [new Response('error',{status:404}),new Response('',{status:302,headers:{location:'https://example.org/other'}}),new Response('html',{headers:{'content-type':'text/html'}}),new Response('not image',{headers:{'content-type':'image/png'}})])await assert.rejects(fetchImage(accepted.candidates[0].sourceImageUrl,async()=>response))
  const redirected=new Response(bytes,{headers:{'content-type':'image/png'}});Object.defineProperty(redirected,'url',{value:'https://example.org/wrong.png'})
  await assert.rejects(fetchImage(accepted.candidates[0].sourceImageUrl,async()=>redirected),/URL/)
  const r=await root();try{const file=path.join(r,'bad.png');await fs.writeFile(file,'not an image');assert.ok((await decoder.inspect([file]))[0].error)}finally{await fs.rm(r,{recursive:true})}
})
test('staging downloads only the explicit 16 URLs; preserves production; repeat is idempotent without network',async()=>{
  const r=await root();try{
    const registryBefore=await fs.readFile(path.join(r,REGISTRY)),calls=[]
    const options={root:r,discovery,accepted,discoveryHash,registry:{},decoder,fetchImpl:async url=>{calls.push(url);return mockFetch()}}
    const m=await stageDownloads(options)
    assert.deepEqual(calls,accepted.candidates.map(c=>c.sourceImageUrl));assert.equal(m.entries.length,16)
    assert.ok(m.entries.every(e=>e.reviewStatus==='PENDING_MANUAL_REVIEW'))
    assert.ok(m.duplicates.some(d=>d.kind==='EXACT_BYTES'))
    assert.deepEqual(await fs.readFile(path.join(r,REGISTRY)),registryBefore);assert.deepEqual(await fs.readdir(path.join(r,'public/athletes')),[])
    const before=await snapshotTree(r),again=await stageDownloads({...options,fetchImpl:()=>{throw Error('Unexpected repeat download')}})
    assert.deepEqual(again,m);assert.deepEqual(await snapshotTree(r),before)
  }finally{await fs.rm(r,{recursive:true})}
})
test('duplicate bytes, decoded pixels, perceptual matches and existing-production collisions are flagged',async()=>{
  const a={...decoded,athlete:{athleteId:1,nameEn:'A'},sha256:sha256(bytes)},b={...a,athlete:{athleteId:2,nameEn:'B'}}
  assert.equal(compareImages([a],[b])[0].kind,'EXACT_BYTES')
  assert.equal(compareImages([a],[{...b,sha256:'different'}])[0].kind,'IDENTICAL_DECODED_PIXELS')
  assert.equal(compareImages([a],[{...b,sha256:'different',pixelSha256:'different'}])[0].kind,'POSSIBLE_VISUAL_MATCH')
  const r=await root();try{
    await fs.writeFile(path.join(r,'public/athletes/existing.png'),bytes)
    const m=await stageDownloads({root:r,discovery,accepted:single(),discoveryHash,registry:{Other:'/athletes/existing.png'},decoder,fetchImpl:mockFetch})
    assert.equal(m.entries[0].validationStatus,'REVIEW_REQUIRED');assert.equal(m.entries[0].reviewStatus,'PENDING_MANUAL_REVIEW')
    assert.equal(m.duplicates[0].scope,'production');assert.equal(m.duplicates[0].kind,'EXACT_BYTES')
  }finally{await fs.rm(r,{recursive:true})}
})
test('publish refuses every pending/rejected/review-required status without modifying files',async()=>{
  const r=await root();try{
    const m=await staged(r)
    for(const status of ['PENDING_MANUAL_REVIEW','REJECTED_WRONG_PERSON','REJECTED_NOT_PORTRAIT','REJECTED_LOW_QUALITY','REVIEW_REQUIRED']){
      const reviews=approvals(m,status),before=await snapshotTree(r)
      await assert.rejects(publishApproved({root:r,manifest:m,reviews,registry:{},athletes:athletes(m),decoder}),/APPROVED/)
      assert.deepEqual(await snapshotTree(r),before)
    }
  }finally{await fs.rm(r,{recursive:true})}
})
test('transactional publish only APPROVED: byte preflight, rollback after files and registry, successful audit',async()=>{
  const r=await root();try{
    const m=await staged(r),reviews=approvals(m),options={root:r,manifest:m,reviews,registry:{},athletes:athletes(m),decoder}
    const before=await snapshotTree(r)
    for(const failAt of ['after-files','after-registry']){
      await assert.rejects(publishApproved({...options,injectFailure:stage=>{if(stage===failAt)throw Error('Injected failure')}}),/Injected/)
      assert.deepEqual(await snapshotTree(r),before)
    }
    const file=path.join(r,m.entries[0].localStagingPath);await fs.appendFile(file,'tamper')
    await assert.rejects(publishApproved(options),/bytes changed/);await fs.writeFile(file,bytes)
    const result=await publishApproved(options);assert.equal(result.published,1);assert.deepEqual(result.audit.issues,[])
    assert.deepEqual(await fs.readFile(path.join(r,'public/athletes/harry-palmer.png')),bytes)
    assert.equal(JSON.parse(await fs.readFile(path.join(r,EVIDENCE),'utf8')).entries[m.entries[0].athlete.athleteId].review.reviewStatus,'APPROVED')
  }finally{await fs.rm(r,{recursive:true})}
})
test('staging path traversal/symlink forbidden',async()=>{
  const r=await root();try{await assert.rejects(safePath(r,'../outside'));await fs.symlink(os.tmpdir(),path.join(r,'link'));await assert.rejects(safePath(r,'link/image.png'),/Symlink/)}finally{await fs.rm(r,{recursive:true})}
})

test('publish protects existing/manual photo; explicit replacement removes old extension',async()=>{
  const r=await root();try{
    const m=await staged(r),reviews=approvals(m)
    const old='/athletes/harry-palmer.jpg'
    await fs.copyFile('src/assets/athletes/blummenfelt.jpg',path.join(r,'public'+old))
    const options={root:r,manifest:m,reviews,registry:{'Harry Palmer':old},athletes:athletes(m).map(a=>({...a,image:old})),decoder}
    const before=await snapshotTree(r)
    await assert.rejects(publishApproved(options),/protected/);assert.deepEqual(await snapshotTree(r),before)
    reviews.entries[0].refresh=true;reviews.entries[0].replace=true
    const result=await publishApproved(options)
    assert.deepEqual(result.audit.issues,[])
    assert.deepEqual(await fs.readdir(path.join(r,'public/athletes')),['harry-palmer.png'])
  }finally{await fs.rm(r,{recursive:true})}
})

test('partial staging resumes only remaining accepted candidates after a network failure',async()=>{
  const r=await root();try{
    const pair={...accepted,candidates:accepted.candidates.slice(0,2)},options={root:r,discovery,accepted:pair,discoveryHash,registry:{},decoder};let calls=0
    await assert.rejects(stageDownloads({...options,fetchImpl:async()=>{if(++calls===2)throw Error('Synthetic network failure');return mockFetch()}}),/network failure/)
    const partial=JSON.parse(await fs.readFile(path.join(r,STAGING,'manifest.json'),'utf8'));assert.equal(partial.complete,false)
    assert.equal(partial.entries.length,1)
    const urls=[];const result=await stageDownloads({...options,fetchImpl:async u=>{urls.push(u);return mockFetch()}})
    assert.equal(result.complete,true);assert.deepEqual(urls,[pair.candidates[1].sourceImageUrl]);assert.equal(result.entries.length,2)
  }finally{await fs.rm(r,{recursive:true})}
})

test('manual visual approval resolves only recorded weak similarities bound to exact bytes; exact duplicates remain blocked',async()=>{
  const r=await root();try{
    const m=await staged(r),e=m.entries[0]
    // A recorded weak screen finding is retained, never erased to pass the gate.
    e.duplicateFindings=[{kind:'POSSIBLE_VISUAL_MATCH',scope:'production',otherAthlete:{nameEn:'Synthetic other athlete'}}]
    e.validationStatus='VALIDATED_AFTER_MANUAL_REVIEW'
    const reviews=approvals(m),options={root:r,manifest:m,reviews,registry:{},athletes:athletes(m),decoder}
    const before=await snapshotTree(r)
    await assert.rejects(publishApproved(options),/unresolved similarity/)
    assert.deepEqual(await snapshotTree(r),before)
    reviews.entries[0].similarityReview={decision:'ACCEPT_WEAK_SIMILARITY',reviewedSha256:e.sha256,findingsSha256:sha256(Buffer.from(JSON.stringify(e.duplicateFindings))),reason:'Synthetic manual visual approval'}
    const goodHash=reviews.entries[0].similarityReview.reviewedSha256
    reviews.entries[0].similarityReview.reviewedSha256='wrong'
    await assert.rejects(publishApproved(options),/unresolved similarity/)
    reviews.entries[0].similarityReview.reviewedSha256=goodHash
    e.duplicateFindings[0].kind='EXACT_BYTES'
    reviews.manifestSha256=sha256(Buffer.from(JSON.stringify(m)));reviews.entries[0].similarityReview.findingsSha256=sha256(Buffer.from(JSON.stringify(e.duplicateFindings)))
    await assert.rejects(publishApproved(options),/unresolved similarity/)
    e.duplicateFindings[0].kind='POSSIBLE_VISUAL_MATCH'
    reviews.manifestSha256=sha256(Buffer.from(JSON.stringify(m)));reviews.entries[0].similarityReview.findingsSha256=sha256(Buffer.from(JSON.stringify(e.duplicateFindings)))
    assert.equal((await publishApproved(options)).published,1)
  }finally{await fs.rm(r,{recursive:true})}
})

test('fresh weak collision is accepted only when the same finding was explicitly reviewed',async()=>{
  const r=await root();try{
    // Force a weak-screen collision between two different real images; real decode/pixel/SHA checks stay active.
    const weakDecoder={inspect:async files=>(await decoder.inspect(files)).map(d=>({...d,dHash:'0000000000000000'}))}
    await fs.copyFile('src/assets/athletes/blummenfelt.jpg',path.join(r,'public/athletes/other.jpg'))
    const registry={Other:'/athletes/other.jpg'}
    const m=await stageDownloads({root:r,discovery,accepted:single(),discoveryHash,registry,decoder:weakDecoder,fetchImpl:mockFetch})
    const e=m.entries[0];assert.equal(e.duplicateFindings[0].kind,'POSSIBLE_VISUAL_MATCH');e.validationStatus='VALIDATED_AFTER_MANUAL_REVIEW'
    const reviews=approvals(m);reviews.entries[0].similarityReview={decision:'ACCEPT_WEAK_SIMILARITY',reviewedSha256:e.sha256,findingsSha256:sha256(Buffer.from(JSON.stringify(e.duplicateFindings))),reason:'Synthetic user visual approval'}
    const options={root:r,manifest:m,reviews,registry,athletes:athletes(m),decoder:weakDecoder}
    const recorded=e.duplicateFindings;e.duplicateFindings=[];reviews.manifestSha256=sha256(Buffer.from(JSON.stringify(m)));reviews.entries[0].similarityReview.findingsSha256=sha256(Buffer.from('[]'))
    await assert.rejects(publishApproved(options),/new similar image/)
    e.duplicateFindings=recorded;reviews.manifestSha256=sha256(Buffer.from(JSON.stringify(m)));reviews.entries[0].similarityReview.findingsSha256=sha256(Buffer.from(JSON.stringify(recorded)))
    assert.equal((await publishApproved(options)).published,1)
  }finally{await fs.rm(r,{recursive:true})}
})

test('batch staging is isolated from pilot, paths/HTML stay local, identity and rank metadata retained',async()=>{
  const r=await root();try{
    await staged(r)
    await fs.writeFile(path.join(r,STAGING,'review.html'),'unchanged pilot page')
    const before=await snapshotTree(r),batchId='photo-batch-2'
    const selection={rankingPosition:27,resultRows:4}
    const namedAccepted={...single(),batchId,candidates:[{...single().candidates[0],selection}]}
    const opts={root:r,discovery:{...discovery,batchId},accepted:namedAccepted,discoveryHash,registry:{},decoder,fetchImpl:mockFetch,batchId}
    const m=await stageDownloads(opts)
    assert.equal(m.batchId,batchId);assert.ok(m.entries[0].localStagingPath.startsWith(STAGING+'/'+batchId+'/'))
    assert.deepEqual(m.entries[0].selection,selection);assert.equal(m.entries[0].reviewStatus,'PENDING_MANUAL_REVIEW')
    const {writeReviewPage,stagingBase}=await import('./athlete-photo-staging.mjs')
    await writeReviewPage(r,m)
    const after=await snapshotTree(r)
    for(const [p,h]of Object.entries(before))assert.equal(after[p],h,p)
    const html=await fs.readFile(path.join(r,STAGING,batchId,'review.html'),'utf8')
    assert.match(html,/TRI Ranking: 27/);assert.match(html,/Result rows: 4/);assert.ok(html.includes(m.entries[0].sha256));assert.ok(!html.includes('data:image'))
    for(const match of html.matchAll(/<img[^>]+src="([^"]+)"/g))await fs.access(path.resolve(r,STAGING,batchId,match[1]))
    assert.throws(()=>stagingBase('../pilot'),/Invalid/)
    await assert.rejects(stageDownloads({...opts,accepted:{...namedAccepted,batchId:'other'}}),/batch identity mismatch/)
    await stageDownloads({...opts,fetchImpl:()=>{throw Error('No repeated downloads')}})
  }finally{await fs.rm(r,{recursive:true})}
})

test('named batch publish binds review namespace, preserves pilot, and rolls back transaction',async()=>{
  const r=await root();try{
    await staged(r)
    const batchId='photo-batch-2'
    const m=await stageDownloads({root:r,discovery:{...discovery,batchId},accepted:{...single(),batchId},discoveryHash,registry:{},decoder,fetchImpl:mockFetch,batchId})
    const reviews={...approvals(m),batchId},options={root:r,manifest:m,reviews,registry:{},athletes:athletes(m),decoder}
    const before=await snapshotTree(r)
    await assert.rejects(publishApproved({...options,reviews:{...reviews,batchId:'other'}}),/batch identity mismatch/)
    const wrong=structuredClone(m);wrong.entries[0].localStagingPath=wrong.entries[0].localStagingPath.replace('/photo-batch-2/','/')
    await assert.rejects(publishApproved({...options,manifest:wrong,reviews:{...reviews,manifestSha256:sha256(Buffer.from(JSON.stringify(wrong)))}}),/staging path/)
    await assert.rejects(publishApproved({...options,injectFailure:()=>{throw Error('Injected failure')}}),/Injected/)
    assert.deepEqual(await snapshotTree(r),before)
    assert.equal((await publishApproved(options)).published,1)
    const evidence=JSON.parse(await fs.readFile(path.join(r,EVIDENCE),'utf8')).entries[m.entries[0].athlete.athleteId]
    assert.equal(evidence.batchId,batchId);assert.equal(evidence.reviewedSha256,m.entries[0].sha256);assert.equal(evidence.publishedSha256,evidence.reviewedSha256)
    const after=await snapshotTree(r)
    for(const [p,h]of Object.entries(before).filter(([p])=>p.startsWith(STAGING+'/')))assert.equal(after[p],h,p)
  }finally{await fs.rm(r,{recursive:true})}
})
