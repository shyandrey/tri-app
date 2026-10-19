// Deterministic proposal only; stdout, no registry writer or network.
import fs from 'node:fs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const csv=fs.readFileSync('docs/athlete-pto-field-review-2026-10-18.csv','utf8')
const p=spawnSync('python3',['-c','import csv,json,sys;print(json.dumps(list(csv.DictReader(sys.stdin))))'],{input:csv,encoding:'utf8'})
assert.equal(p.status,0)
const rows=JSON.parse(p.stdout),mappings=JSON.parse(fs.readFileSync('src/data/athletes/ptoProfileMappings.json')).mappings
assert.equal(rows.length,160);assert.equal(rows.filter(r=>r.classification==='AUTO-APPROVABLE').length,72)
const entries={},seen=new Set(),socialUrls=new Set();let count=0,exceptions=0
for(const r of rows){
 const key=r.id+':'+r.field;assert.ok(!seen.has(key));seen.add(key)
 const exception=['2','10521'].includes(r.id)&&['reportedAge','birthYear'].includes(r.field)
 if(r.classification!=='AUTO-APPROVABLE'&&!exception)continue
 assert.equal(r.existing,'');assert.equal(r.action,exception?'HOLD_ADD':'ADD')
 if(exception){assert.equal(r.classification,'REVIEW REQUIRED');assert.equal(Number(r.value),r.id==='2'?(r.field==='reportedAge'?33:1992):(r.field==='reportedAge'?27:1998));exceptions++}
 const mapping=mappings.find(m=>m.id===Number(r.id));assert.ok(mapping);assert.equal(mapping.name,r.name);assert.equal(mapping.url,r.sourceUrl)
 assert.match(r.snapshotSha256,/^[a-f0-9]{64}$/);assert.ok(Number.isFinite(Date.parse(r.observedAt)))
 const raw=JSON.parse(r.raw);assert.equal(raw.length,1)
 const value=r.field.startsWith('socials.')?r.value:Number(r.value)
 const field={value,raw:raw[0],sourceUrl:r.sourceUrl,observedAt:r.observedAt,verifiedAt:r.observedAt,snapshotSha256:r.snapshotSha256}
 const entry=entries[r.id]??={name:r.name,profile:{socials:{}}}
 if(r.field.startsWith('socials.')){assert.ok(!socialUrls.has(value));socialUrls.add(value);entry.profile.socials[r.field.slice(8)]=field}
 else entry.profile[r.field]=field
 if(exception)entry.reviewedAgeDiscrepancy={approvedAt:'2026-10-19',decision:'Preserve raw AGE/BORN; display calendar-year competition age from BORN.'}
 count++
}
assert.equal(count,76);assert.equal(exceptions,4)
console.log(JSON.stringify({schemaVersion:1,approvedAt:'2026-10-19',approvalScope:'72 reviewed additions + four Marten/Sam age fields; no social replacements',reviewCsvSha256:createHash('sha256').update(csv).digest('hex'),entries},null,2))
