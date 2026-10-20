// Deterministic owner-approved proposal to stdout only. No network or registry writer.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {validSocialUrl} from '../src/utils/athleteProfileData.ts'
const readCsv=path=>{const p=spawnSync('python3',['-c','import csv,json,sys;print(json.dumps(list(csv.DictReader(open(sys.argv[1])))))',path],{encoding:'utf8',maxBuffer:4*1024*1024});assert.equal(p.status,0,p.stderr);return JSON.parse(p.stdout)}
const pilot=spawnSync(process.execPath,['scripts/prepare-pto-pilot-registry.mjs'],{encoding:'utf8'});assert.equal(pilot.status,0,pilot.stderr)
const registry=JSON.parse(pilot.stdout),original=structuredClone(registry.entries)
const source='docs/athlete-pto-photo-fields-2026-10-19.csv',batch='docs/athlete-pto-owner-field-review-2026-10-20-batch-651.csv',review='docs/athlete-pto-owner-field-review-2026-10-20-review-fields.csv'
const rows=readCsv(source),auto=readCsv(batch),reviewRows=readCsv(review),key=r=>`${r.id}:${r.field}`
assert.equal(new Set(rows.map(key)).size,rows.length)
const approvedReview=reviewRows.filter(r=>['COMPETITION_AGE_COMPATIBLE','PROFILE_WIDE_DUPLICATE_COLLATERAL'].includes(r.category))
assert.equal(auto.length,651);assert.equal(approvedReview.filter(r=>r.category==='COMPETITION_AGE_COMPATIBLE').length,60);assert.equal(approvedReview.filter(r=>r.category==='PROFILE_WIDE_DUPLICATE_COLLATERAL').length,9)
const approved=[...auto,...approvedReview];assert.equal(new Set(approved.map(key)).size,720)
const mappings=JSON.parse(fs.readFileSync('src/data/athletes/ptoProfileMappings.json')).mappings
const urls=new Set(Object.values(registry.entries).flatMap(e=>Object.values(e.profile.socials).map(f=>f.value)))
for(const r of approved){
 const sourceRow=rows.find(s=>key(s)===key(r));assert(sourceRow)
 for(const k of Object.keys(sourceRow))assert.equal(k==='pilot'?r[k].toLowerCase():r[k],sourceRow[k],`${key(r)} ${k}`)
 assert.equal(r.operation,'ADD');assert.equal(r.existing,'');assert.equal(r.pilot.toLowerCase(),'false');assert(!original[r.id],`pilot must not change ${r.id}`)
 const m=mappings.find(m=>m.id===Number(r.id));assert(m&&m.approvedBy==='owner');assert.equal(m.url,r.url);assert.equal(m.name,r.name)
 assert.match(r.snapshotSha256,/^[a-f0-9]{64}$/);assert(Number.isFinite(Date.parse(r.observedAt)))
 assert(!(['38','10825'].includes(r.id)&&r.field==='socials.youtube'));assert(!(r.id==='10825'&&['reportedAge','birthYear'].includes(r.field)))
 const isSocial=r.field.startsWith('socials.'),value=isSocial?r.value:Number(r.value)
 const field={value,raw:r.raw,sourceUrl:r.url,observedAt:r.observedAt,verifiedAt:r.observedAt,snapshotSha256:r.snapshotSha256}
 const entry=registry.entries[r.id]??={name:r.name,profile:{socials:{}}}
 if(isSocial){const platform=r.field.slice(8);assert.equal(validSocialUrl(platform,value),value);assert(!urls.has(value));urls.add(value);assert.equal(entry.profile.socials[platform],undefined);entry.profile.socials[platform]=field}
 else {assert(['reportedAge','birthYear'].includes(r.field));assert(Number.isInteger(value));assert.equal(String(value),r.raw);assert.equal(entry.profile[r.field],undefined);entry.profile[r.field]=field}
 if(r.category==='COMPETITION_AGE_COMPATIBLE')entry.reviewedAgeDiscrepancy={approvedAt:'2026-10-20',decision:'Preserve raw AGE/BORN; display calendar-year competition age from BORN.'}
}
for(const [id,entry]of Object.entries(original))assert.deepEqual(registry.entries[id],entry)
registry.photoCohortApproval={approvedAt:'2026-10-20',scope:'651 additions + 60 raw AGE/BORN + 9 non-shared Jackson/Lisa fields; 720 additions; no replacements',sources:Object.fromEntries([source,batch,review].map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]))}
console.log(JSON.stringify(registry,null,2))
