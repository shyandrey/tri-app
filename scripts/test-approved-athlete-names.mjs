import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {loadNameSnapshot} from './audit-athlete-names.mjs'
import {parseCSV,validateRussianName} from './athlete-name-review.mjs'

test('Owner-approved localization batches exactly match stable catalog identities and Russian spellings',async()=>{
 const hashes={'batch-001.csv':'32aa4a10d839a1b53537191d572eaedbba340976ef6ea3b2bbe400d74a5e4a64','batch-002.csv':'66a87f21e92984e9037448052257ec881bd7d68b692b148407d6a83e1ddb72a6'}
 const {baseline,registry}=await loadNameSnapshot(), ids=new Set()
 const files=(await fs.readdir('scripts/fixtures/approved-athlete-names')).sort()
 assert.deepEqual(files,['batch-001.csv','batch-002.csv'])
 assert.equal(baseline.rows.length,1167)
 for(const file of files){
  assert.ok(hashes[file]);const bytes=await fs.readFile('scripts/fixtures/approved-athlete-names/'+file)
  assert.equal(createHash('sha256').update(bytes).digest('hex'),hashes[file],'Owner input must remain byte-identical')
  const csv=bytes.toString('utf8').replace(/^\uFEFF/,'');assert.equal(csv.split(/\r?\n/)[0],'athlete_id,name_en,name_ru,approval')
  const rows=parseCSV(csv.replace(/^athlete_id,name_en,name_ru,approval/,'athlete_id,ranking,name_en,name_ru'));assert.equal(rows.length,115)
  for(const [id,en,ru,status] of rows){assert.equal(status,'owner_approved');assert.ok(!ids.has(id));ids.add(id);validateRussianName(ru,id);const a=baseline.rows.find(r=>String(r.athlete_id)===id);assert.ok(a);assert.equal(a.name_en,en);assert.equal(a.name_ru,ru);const entry=registry[en];assert.equal(typeof entry==='string'?entry:entry?.nameRu,ru)}
 }
 assert.equal(ids.size,230)
 assert.equal(baseline.rows.filter(r=>r.name_ru).length,1167)
 // Owner clarification: keep the existing canonical Stepniak spelling unchanged.
 for(const [id,en,ru] of [
  [10,'Menno Koolhaas','Менно Куулхас'],
  [71,'Kacper Stepniak','Каспер Степаньяк'],
  [10434,'Nick Thijs','Ний Тийс'],
  [10486,'Read Ziegler','Рид Циглер'],
  [10647,'Alice Fritzsche','Элис Фритцше'],
 ]){const row=baseline.rows.find(r=>r.athlete_id===id);assert.equal(row?.name_en,en);assert.equal(row.name_ru,ru)}
 for(const id of [10,71])assert.ok(!ids.has(String(id)),'Previously localized athlete must not be counted as new')
})
