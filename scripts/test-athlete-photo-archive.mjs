// Explicit LOCAL archival group: requires full Git history and original staging bytes.
// Never downloads missing evidence, rewrites snapshots, or silently skips failures.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {sha256} from './athlete-photo-core.mjs'
const contract=JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-catalog-approved.json','utf8'))
const read=async name=>JSON.parse(await fs.readFile(`scripts/fixtures/athlete-photo-${name}.json`,'utf8'))

for(const batch of ['batch2','batch3'])test(`${batch} exact historical selector replay uses pinned catalog/results/code, not current sports data`,async()=>{
  const commit=contract.provenance.historicalReplayCommits[batch]
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'tri-photo-archive-replay-'))
  try{
    let archive
    try{archive=execFileSync('git',['archive',commit],{maxBuffer:128*1024*1024})}
    catch{assert.fail(`Historical Git object ${commit} unavailable; archival group requires full history (no network fallback)`)}
    execFileSync('tar',['-x','-C',root],{input:archive})
    await fs.symlink(path.resolve('node_modules'),path.join(root,'node_modules'))
    const fixture=await read(batch+'-batch')
    // Refuse to replay against silently rewritten historical cohort evidence.
    assert.deepEqual(JSON.parse(await fs.readFile(path.join(root,`scripts/fixtures/athlete-photo-${batch}-batch.json`),'utf8')),fixture)
    const program=`
      import fs from 'node:fs/promises';
      import * as selector from './scripts/select-athlete-photo-batch.mjs';
      import {loadPhotoRuntime} from './scripts/athlete-photo-runtime.mjs';
      const read=async n=>JSON.parse(await fs.readFile('scripts/fixtures/athlete-photo-'+n+'.json','utf8'));
      const batch=await read('${batch}-batch'),baseline=await read('${batch}-production-baseline');
      let replay;
      if('${batch}'==='batch2')replay=await selector.selectPhotoBatch2(new Date(batch.asOf),baseline);
      else {const previous=await read('batch2-discovery'),published=await read('batch2-reviewed-manifest');replay=await selector.selectPhotoBatch({photoBaseline:baseline,asOf:new Date(batch.asOf),batchId:'photo-batch-3',perGender:50,priorityRankLimit:200,additionalExclusions:[...previous.decisions.filter(d=>d.confidence!=='HIGH').map(d=>d.athlete.nameEn),...published.entries.map(e=>e.athlete.nameEn)]})}
      const runtime=await loadPhotoRuntime(new Date(batch.asOf));
      await fs.writeFile('replay.json',JSON.stringify({replay,names:runtime.athletes.map(a=>({id:a.id,name:a.name}))}));
    `
    execFileSync(process.execPath,['--input-type=module','-e',program],{cwd:root,timeout:60000,stdio:'pipe'})
    const {replay,names}=JSON.parse(await fs.readFile(path.join(root,'replay.json'),'utf8'))
    const expected=batch==='batch3'?{...fixture,athletes:fixture.athletes.map(({nameRu,...row})=>{void nameRu;return row})}:fixture
    assert.deepEqual(replay,expected)
    if(batch==='batch3')for(const row of fixture.athletes){const name=names.find(a=>a.id===row.athleteId).name;assert.equal(row.nameRu,/[А-Яа-яЁё]/.test(name)?name:null)}
  }finally{await fs.rm(root,{recursive:true,force:true})} // Only this test's newly created temp root.
})

test('historical local staging archive retains every reviewed/staged byte; missing evidence is an explicit failure',async()=>{
  for(const batch of ['pilot','batch2','batch3']){
    const manifest=await read(batch+'-reviewed-manifest')
    for(const row of manifest.entries){
      let bytes
      try{bytes=await fs.readFile(row.localStagingPath)}catch{assert.fail(`Local archival evidence unavailable: ${row.localStagingPath}; run this group only with the preserved staging archive`)}
      assert.equal(sha256(bytes),row.sha256,row.localStagingPath)
    }
  }
  const staging=await read('batch3-staging-manifest')
  for(const row of staging.entries)assert.equal(sha256(await fs.readFile(row.localStagingPath)),row.sha256,row.localStagingPath)
})
