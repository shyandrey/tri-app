import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {validatePublicRelease,publicReleaseDigest} from './public-release.mjs'
import {publicRelease} from '../.generated/public-release.ts'
const record=JSON.parse(await fs.readFile('release/public-release.json','utf8'))
const pkg=JSON.parse(await fs.readFile('package.json','utf8'))
test('reviewed current public metadata matches version and generated payload',()=>{assert.deepEqual(validatePublicRelease(record,pkg.version),publicRelease);assert.deepEqual(Object.keys(publicRelease),['version','description']);assert.equal(publicRelease.description,'Первый релиз 300W')})
test('version bump without matching reviewed public metadata fails closed',()=>assert.throws(()=>validatePublicRelease(record,'1.0.2'),/version/))
test('missing and pending approvals rejected',()=>{for(const approval of [undefined,{...record.approval,status:'pending'},{...record.approval,reference:''}])assert.throws(()=>validatePublicRelease({...record,approval},pkg.version))})
test('modified text or version cannot reuse previous approval digest',()=>{assert.throws(()=>validatePublicRelease({...record,description:'Changed'},pkg.version),/changed since approval/);assert.throws(()=>validatePublicRelease({...record,version:'1.0.2'},'1.0.2'),/changed since approval/)})
test('internal sections rejected from public metadata; no automatic changelog fallback',()=>{assert.throws(()=>validatePublicRelease({...record,sections:[]},pkg.version));assert.throws(()=>validatePublicRelease(null,pkg.version));assert.equal(publicReleaseDigest(record),record.approval.sha256)})
test('frontend has no technical release data imports',async()=>{const walk=async dir=>{for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await walk(p);else if(/\.(tsx?|json)$/.test(p))assert.doesNotMatch(await fs.readFile(p,'utf8'),/current-release|currentRelease|CHANGELOG\.md/,p)}};await walk('src')})
