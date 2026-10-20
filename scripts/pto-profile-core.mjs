import {normalizedPtoCountry,validProfileUrl} from './pto-profile-identity-values.mjs'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {competitionAge, validSocialUrl, profileSocials} from '../src/utils/athleteProfileData.ts'
export const platforms=['instagram','twitter','youtube','facebook','tiktok','website']
export const normalizeName=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ø/g,'o').toLowerCase().replace(/[^a-z0-9]/g,'')
export function extract(html,identityOnly=false){
  const r=spawnSync('python3',[new URL('./parse-pto-profile.py',import.meta.url).pathname,...(identityOnly?['--identity-only']:[])],{input:html,encoding:'utf8',maxBuffer:4*1024*1024})
  if(r.status!==0)throw Error('PARSER_FAILED')
  return JSON.parse(r.stdout)
}
export function validateCohort(cohort,athletes){
  const ids=new Set(),urls=new Set()
  for(const p of cohort){
    if(ids.has(p.id)||urls.has(p.url))throw Error('DUPLICATE_ID_OR_PROFILE')
    ids.add(p.id);urls.add(p.url)
    const matches=athletes.filter(a=>normalizeName(a.nameEn)===normalizeName(p.name))
    if(matches.length!==1||matches[0].id!==p.id||matches[0].gender!==p.gender)throw Error('IDENTITY_MISMATCH')
    if(!validProfileUrl(p.url))throw Error('INVALID_PROFILE_URL')
  }
}
export function analyze({athlete,url,html,verifiedAt}){
  if(!/^\d{4}-\d\d-\d\dT/.test(verifiedAt)||!Number.isFinite(Date.parse(verifiedAt)))throw Error('TIMESTAMP_REQUIRED')
  const parsed=extract(html),hash=createHash('sha256').update(html).digest('hex'), conflicts=[],missing=[],normalized={socials:{}},proposed=[]
  const result={id:athlete.id,name:athlete.nameEn,url,verifiedAt,snapshotSha256:hash,raw:parsed,normalized,missing,conflicts,proposed}
  if(parsed.names.length!==1||normalizeName(parsed.names[0])!==normalizeName(athlete.nameEn)||parsed.canonical.length!==1||parsed.canonical[0]!==url){conflicts.push('IDENTITY_OR_CANONICAL_MISMATCH');return result}
  if(athlete.countryCode && (parsed.countries.length!==1 || !normalizedPtoCountry(athlete.countryCode) || normalizedPtoCountry(parsed.countries[0])!==normalizedPtoCountry(athlete.countryCode))){conflicts.push('COUNTRY_IDENTITY_REVIEW');return result}
  const evidence=(value,raw)=>({value,raw,sourceUrl:url,verifiedAt,snapshotSha256:hash})
  const year=Number(new Intl.DateTimeFormat('en',{timeZone:'Europe/Moscow',year:'numeric'}).format(new Date(verifiedAt)))
  for(const [label,key,min,max] of [['Age','reportedAge',0,120],['Born','birthYear',1900,year]]){
    const values=parsed.fields[label]??[]
    if(!values.length||values.every(v=>['','-','–','—'].includes(v))){missing.push(label);continue}
    if(values.length!==1||!(label==='Born'?/^\d{4}$/:/^\d+$/).test(values[0])||Number(values[0])<min||Number(values[0])>max){conflicts.push(`INVALID_${label.toUpperCase()}`);continue}
    normalized[key]=evidence(Number(values[0]),values[0])
  }
  if(normalized.reportedAge&&normalized.birthYear&&year-normalized.birthYear.value!==normalized.reportedAge.value)conflicts.push('AGE_BORN_CONFLICT')
  for(const link of parsed.links){
    let platform=platforms.filter(p=>p!=='website').find(p=>validSocialUrl(p,link.href))
    const expected={_social_ig:'instagram',_social_twitter:'twitter',_social_yt:'youtube',_social_fb:'facebook',_social_tiktok:'tiktok',_social_www:'website'}[link.target]
    if(!platform&&expected==='website')platform='website'
    if(expected&&platform&&platform!==expected){conflicts.push('SOCIAL_PLATFORM_MISMATCH');continue}
    const clean=platform&&validSocialUrl(platform,link.href)
    if(!clean){conflicts.push('INVALID_OR_UNCLASSIFIED_SOCIAL_URL');continue}
    if(normalized.socials[platform]&&normalized.socials[platform].value!==clean){conflicts.push(`MULTIPLE_${platform.toUpperCase()}_URLS`);continue}
    normalized.socials[platform]=evidence(clean,link.href)
  }
  for(const p of platforms)if(!normalized.socials[p])missing.push(p)
  result.calculatedAge=competitionAge(normalized,new Date(verifiedAt))??null
  const existing=Object.fromEntries(profileSocials(athlete))
  for(const [platform,field] of Object.entries(athlete.ptoProfile?.socials??{}))if(!existing[platform]&&field)existing[platform]=field.value
  for(const key of ['reportedAge','birthYear']){
    const next=normalized[key],old=athlete.ptoProfile?.[key]
    if(!next)continue
    if(old&&old.value!==next.value)conflicts.push(`EXISTING_${key.toUpperCase()}_CONFLICT`)
    else if(!old&&!conflicts.includes('AGE_BORN_CONFLICT'))proposed.push({field:key,operation:'ADD',evidence:next})
  }
  for(const [platform,next]of Object.entries(normalized.socials)){
    if(existing[platform]&&existing[platform]!==next.value)conflicts.push(`EXISTING_${platform.toUpperCase()}_CONFLICT`)
    else if(!existing[platform]&&!conflicts.includes(`MULTIPLE_${platform.toUpperCase()}_URLS`))proposed.push({field:`socials.${platform}`,operation:'ADD',evidence:next})
  }
  if(conflicts.length)result.reviewRequired=true
  return result
}
export function report(rows){
  const owners=new Map()
  for(const row of rows)for(const field of Object.values(row.normalized?.socials??{})){
    const previous=owners.get(field.value)
    if(previous&&previous.id!==row.id){for(const r of [previous,row]){r.conflicts.push('CROSS_ATHLETE_SOCIAL_DUPLICATE');r.reviewRequired=true;r.proposed=[]}}
    owners.set(field.value,row)
  }
  return {mode:'DRY_RUN_ONLY',rows,summary:{athletes:rows.length,reportedAge:rows.filter(r=>r.normalized?.reportedAge).length,birthYear:rows.filter(r=>r.normalized?.birthYear).length,withSocials:rows.filter(r=>Object.keys(r.normalized?.socials??{}).length).length,conflicted:rows.filter(r=>r.conflicts.length).length}}
}
