import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import { sha256, auditPhotoFiles, snapshotTree } from './athlete-photo-core.mjs'
const exec = promisify(execFile)
export const STAGING = '.athlete-photo-staging'
export const REGISTRY = 'src/data/athletes/athletePhotos.generated.ts'
export const EVIDENCE = 'src/data/athletes/athletePhotoEvidence.json'
export const REVIEW_STATUSES = ['PENDING_MANUAL_REVIEW', 'APPROVED', 'REJECTED_WRONG_PERSON', 'REJECTED_NOT_PORTRAIT', 'REJECTED_LOW_QUALITY', 'REVIEW_REQUIRED']

export async function safePath(root, relative) {
  if (!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).some(p => p === '..' || p === '.')) throw new Error('Unsafe relative path')
  let current = await fs.realpath(root)
  for (const part of relative.split('/')) {
    current = path.join(current, part)
    try { if ((await fs.lstat(current)).isSymbolicLink()) throw new Error('Symlink path forbidden') } catch (e) { if (e.code !== 'ENOENT') throw e }
  }
  return current
}
export async function atomicJson(file, value) {
  const tmp = `${file}.${process.pid}.tmp`
  try { await fs.writeFile(tmp, JSON.stringify(value, null, 2)+'\n', { flag: 'wx' }); await fs.rename(tmp, file) }
  finally { await fs.rm(tmp, { force: true }) }
}
export async function makeDecoder() {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'tri-photo-decoder-'))
  const binary = path.join(tmp, 'decode')
  try { await exec('xcrun', ['swiftc', fileURLToPath(new URL('./lib/decode-athlete-image.swift', import.meta.url)), '-module-cache-path', path.join(os.tmpdir(), 'tri-photo-swift-cache'), '-o', binary], { timeout: 120000 }) }
  catch (e) { await fs.rm(tmp, { recursive: true, force: true }); throw e }
  return {
    async inspect(files) {
      if (!files.length) return []
      const { stdout } = await exec(binary, files, { timeout: 120000, maxBuffer: 8*1024*1024 })
      const results = JSON.parse(stdout)
      if (results.length !== files.length) throw new Error('Decoder incomplete output')
      return results
    },
    close: () => fs.rm(tmp, { recursive: true, force: true }),
  }
}
export function validateBytes(bytes, type) {
  if (!bytes.length || bytes.length > 15*1024*1024) throw new Error('Invalid byte size')
  const png = bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
  if (png && type === 'image/png') {
    // Require complete PNG chunk framing, IEND, and CRCs: decoders may tolerate corruption.
    let pos=8, ended=false
    for (; pos+12<=bytes.length;) {
      const size=bytes.readUInt32BE(pos), end=pos+12+size
      if (end>bytes.length) throw new Error('Truncated PNG')
      let crc=0xffffffff
      for (const v of bytes.subarray(pos+4,pos+8+size)) { crc ^= v; for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0) }
      if (((crc^0xffffffff)>>>0)!==bytes.readUInt32BE(pos+8+size)) throw new Error('PNG CRC mismatch')
      const name=bytes.toString('ascii',pos+4,pos+8)
      pos=end
      if(name==='IEND'){ended=true;break}
    }
    if(!ended || pos!==bytes.length)throw new Error('Incomplete PNG or trailing payload')
    return 'png'
  }
  if(jpeg && type==='image/jpeg' && bytes.at(-2)===255 && bytes.at(-1)===217)return 'jpg'
  throw new Error('Unsupported image, MIME mismatch or HTML/error payload')
}
export function selectAccepted(discovery, accepted, discoveryHash) {
  if (accepted.schemaVersion!==1 || accepted.discoverySha256!==discoveryHash || !Array.isArray(accepted.candidates) || !accepted.candidates.length) throw new Error('Accepted discovery hash/list mismatch')
  const ids=new Set()
  return accepted.candidates.map(a=>{
    if(ids.has(a.athleteId))throw new Error('Duplicate accepted athlete');ids.add(a.athleteId)
    const matches=discovery.decisions.filter(d=>d.athlete.athleteId===a.athleteId && d.athlete.nameEn===a.nameEn && d.bestCandidateUrl===a.sourceImageUrl)
    if(matches.length!==1)throw new Error('Candidate identity/URL mismatch')
    const d=matches[0], best=d.candidates.find(c=>c.url===a.sourceImageUrl)
    if(d.identityStatus!=='VERIFIED'||d.confidence!=='HIGH'||d.proposedAction!=='ACCEPT_FOR_MANUAL_REVIEW'||!best||best.rejection||!best.selfPortrait)throw new Error('Only accepted HIGH discovery candidates may download')
    const u=new URL(a.sourceImageUrl)
    if(u.origin!=='https://content.protriathletes.org'||u.username||u.password||u.search||u.hash)throw new Error('Unapproved image host/URL')
    return d
  })
}
export async function fetchImage(url, fetchImpl=fetch) {
  const response=await fetchImpl(url,{redirect:'manual',signal:AbortSignal.timeout(30000),headers:{accept:'image/png,image/jpeg'}})
  if(response.status!==200 || (response.url && response.url!==url)){await response.body?.cancel();throw new Error(`HTTP/final image URL rejected: ${response.status}`)}
  const type=(response.headers.get('content-type')??'').split(';')[0].trim().toLowerCase()
  if(!['image/png','image/jpeg'].includes(type)){await response.body?.cancel();throw new Error('Invalid Content-Type')}
  if(Number(response.headers.get('content-length'))>15*1024*1024){await response.body?.cancel();throw new Error('Image too large')}
  const chunks=[];let size=0;const reader=response.body.getReader()
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>15*1024*1024){await reader.cancel();throw new Error('Image too large')}chunks.push(value)}
  const bytes=Buffer.concat(chunks), extension=validateBytes(bytes,type)
  return {bytes,extension,contentType:type,httpStatus:response.status,finalDownloadedUrl:response.url||url}
}
export function compareImages(staged, production) {
  const matches=[]
  function compare(a,b,scope){
    const exact=a.sha256===b.sha256
    const pixels=a.width===b.width && a.height===b.height && a.pixelSha256===b.pixelSha256
    let h=BigInt('0x'+a.dHash)^BigInt('0x'+b.dHash), distance=0;while(h){distance+=Number(h&1n);h>>=1n}
    if(exact||pixels||distance<=6)matches.push({athleteId:a.athlete.athleteId,otherAthlete:b.athlete,scope,kind:exact?'EXACT_BYTES':pixels?'IDENTICAL_DECODED_PIXELS':'POSSIBLE_VISUAL_MATCH',hammingDistance:distance,otherPath:b.localStagingPath??b.path})
  }
  for(let i=0;i<staged.length;i++){for(let j=i+1;j<staged.length;j++)compare(staged[i],staged[j],'staging');for(const p of production)compare(staged[i],p,'production')}
  return matches
}
export async function inspectProduction(root,registry,decoder) {
  const paths=await Promise.all(Object.values(registry).map(p=>safePath(root,'public'+p)))
  const decoded=await decoder.inspect(paths)
  return Promise.all(Object.entries(registry).map(async([name,p],i)=>{
    if(decoded[i].error)throw new Error(`Production decode failed: ${name}: ${decoded[i].error}`)
    return {...decoded[i],path:p,athlete:{nameEn:name},sha256:sha256(await fs.readFile(paths[i]))}
  }))
}
export async function stageDownloads({root,discovery,accepted,discoveryHash,registry,decoder,fetchImpl=fetch}) {
  const decisions=selectAccepted(discovery,accepted,discoveryHash)
  const audit=await auditPhotoFiles(root,registry);if(audit.issues.length)throw new Error('Production preflight failed')
  const before=await snapshotTree(root)
  const base=await safePath(root,STAGING);await fs.mkdir(base,{recursive:true})
  const lock=await fs.open(path.join(base,'.download.lock'),'wx')
  try {
    const manifestFile=path.join(base,'manifest.json')
    const previous=await fs.readFile(manifestFile,'utf8').then(JSON.parse).catch(e=>{if(e.code==='ENOENT')return null;throw e})
    if(previous && previous.acceptedSha256!==sha256(Buffer.from(JSON.stringify(accepted))))throw new Error('Different staging batch already exists')
    const production=await inspectProduction(root,registry,decoder), entries=[]
    for(const d of decisions){
      const old=previous?.entries.find(e=>e.athlete.athleteId===d.athlete.athleteId)
      if(old){
        if(JSON.stringify(old.athlete)!==JSON.stringify(d.athlete)||old.verifiedProfileUrl!==d.verifiedProfileUrl||old.discoveryConfidence!=='HIGH'||!old.localStagingPath.startsWith(`${STAGING}/${d.athlete.athleteId}/`)||old.sourceImageUrl!==d.bestCandidateUrl||old.reviewStatus!=='PENDING_MANUAL_REVIEW')throw new Error('Existing staging decision changed')
        const file=await safePath(root,old.localStagingPath)
        if(sha256(await fs.readFile(file))!==old.sha256)throw new Error('Staging checksum changed')
        const [decoded]=await decoder.inspect([file]);if(decoded.error||decoded.pixelSha256!==old.pixelSha256||decoded.dHash!==old.dHash||decoded.width!==old.width||decoded.height!==old.height)throw new Error('Staging decode changed')
        entries.push(old);continue
      }
      const result=await fetchImage(d.bestCandidateUrl,fetchImpl)
      const relative=`${STAGING}/${d.athlete.athleteId}/${sha256(result.bytes)}.${result.extension}`
      const file=await safePath(root,relative);await fs.mkdir(path.dirname(file),{recursive:true})
      // Failed decodes are removed; never leave invalid bytes as an accepted staged file.
      await fs.writeFile(file,result.bytes,{flag:'wx'})
      const [decoded]=await decoder.inspect([file])
      if(decoded.error){await fs.unlink(file);throw new Error(`Invalid decoded image: ${decoded.error}`)}
      const {path:unused,...image}=decoded
      entries.push({athlete:d.athlete,verifiedProfileUrl:d.verifiedProfileUrl,sourceImageUrl:d.bestCandidateUrl,finalDownloadedUrl:result.finalDownloadedUrl,checkedAt:new Date().toISOString(),discoveryCheckedAt:d.checkedAt,discoveryConfidence:d.confidence,localStagingPath:relative,httpStatus:result.httpStatus,contentType:result.contentType,byteSize:result.bytes.length,extension:result.extension,...image,sha256:sha256(result.bytes),validationStatus:'VALIDATED',reviewStatus:'PENDING_MANUAL_REVIEW'})
      await atomicJson(manifestFile,{schemaVersion:1,complete:false,discoverySha256:discoveryHash,acceptedSha256:sha256(Buffer.from(JSON.stringify(accepted))),productionPhotosCompared:production.length,entries,duplicates:[]})
    }
    const duplicates=compareImages(entries,production)
    for(const match of duplicates.filter(d=>d.kind==='EXACT_BYTES')){
      const first=entries.find(e=>e.athlete.athleteId===match.athleteId)
      const other=match.scope==='production'?'public'+match.otherPath:match.otherPath
      match.byteEqualityConfirmed=(await fs.readFile(await safePath(root,first.localStagingPath))).equals(await fs.readFile(await safePath(root,other)))
      if(!match.byteEqualityConfirmed)throw new Error('SHA-256 collision; manual investigation required')
    }
    for(const e of entries){e.duplicateFindings=duplicates.filter(m=>m.athleteId===e.athlete.athleteId || (m.scope==='staging'&&m.otherAthlete.athleteId===e.athlete.athleteId));e.validationStatus=e.duplicateFindings.length?'REVIEW_REQUIRED':'VALIDATED'}
    const manifest={schemaVersion:1,complete:true,discoverySha256:discoveryHash,acceptedSha256:sha256(Buffer.from(JSON.stringify(accepted))),productionPhotosCompared:production.length,entries,duplicates}
    if(!previous || JSON.stringify(previous)!==JSON.stringify(manifest))await atomicJson(manifestFile,manifest)
    return manifest
  } finally {
    await lock.close();await fs.unlink(path.join(base,'.download.lock'))
    const after=await snapshotTree(root)
    const exclude=s=>Object.fromEntries(Object.entries(s).filter(([p])=>!p.startsWith(STAGING+'/')))
    assert.deepEqual(exclude(after),exclude(before),'Staging changed files outside its dedicated directory')
  }
}
export async function writeReviewPage(root,manifest) {
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
  const cards=manifest.entries.map(e=>`<article><img src="${esc(e.localStagingPath.slice(STAGING.length+1))}" alt="Candidate for ${esc(e.athlete.nameEn)}"><h2>${esc(e.athlete.nameEn)}</h2><p>${esc(e.athlete.gender)} / ${esc(e.athlete.countryCode)} · ${e.width} × ${e.height} · ${e.byteSize} bytes</p><p>Discovery: ${esc(e.discoveryConfidence)} · ${esc(e.validationStatus)}</p><p><a href="${esc(e.verifiedProfileUrl)}">Stats PTO profile</a> · <a href="${esc(e.sourceImageUrl)}">Source image</a></p><p class="status">${esc(e.reviewStatus)}</p><label><input type="checkbox"> Визуально проверено (только пометка на странице)</label><p>${esc(e.duplicateFindings.map(d=>d.kind+' / '+d.otherAthlete.nameEn).join('; '))}</p></article>`).join('\n')
  const comparisons=manifest.duplicates.map(d=>{const e=manifest.entries.find(e=>e.athlete.athleteId===d.athleteId);const other=d.scope==='production'?'../public'+d.otherPath:d.otherPath.slice(STAGING.length+1);return `<details><summary>${esc(e.athlete.nameEn)} / ${esc(d.otherAthlete.nameEn)} — ${esc(d.kind)} (dHash ${d.hammingDistance})</summary><img loading="lazy" src="${esc(e.localStagingPath.slice(STAGING.length+1))}" alt="${esc(e.athlete.nameEn)}"><img loading="lazy" src="${esc(other)}" alt="${esc(d.otherAthlete.nameEn)}"></details>`}).join('\n')
  await fs.writeFile(await safePath(root,STAGING+'/review.html'),`<!doctype html><html lang="ru"><meta charset="utf-8"><title>Athlete photo pilot — manual review</title><style>body{font:16px system-ui;margin:28px;background:#eee;color:#18202a}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:20px}article{background:white;padding:18px;border-radius:12px}img{width:100%;height:320px;object-fit:contain;background:#e6e6e6}h2{font-size:21px}.status{font-weight:bold}a{color:#165eb4}</style><h1>16 photo candidates: manual identity review</h1><p>Проверяйте: действительно ли это указанный спортсмен? Успешное скачивание не подтверждает личность. Статусы взяты из staging manifest. Checkbox не сохраняет approval и не разрешает publish.</p><main>${cards}</main><h2>Возможное сходство: пары для сравнения</h2><p>dHash — слабый сигнал сходства композиции, не доказательство одинакового изображения или личности.</p>${comparisons}</html>\n`)
}
