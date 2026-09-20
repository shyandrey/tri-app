import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT=process.cwd()
const FILE=path.join(ROOT,'src/data/athletes/resultAthletes.generated.ts')
const BASE='https://stats.protriathletes.org/athlete/'
const cli=process.argv.slice(2), WRITE=cli.includes('--write')
const limitAt=cli.indexOf('--limit'), LIMIT=limitAt>=0?Number(cli[limitAt+1]):Infinity
const delayAt=cli.indexOf('--delay'), DELAY=delayAt>=0?Number(cli[delayAt+1]):150
const ISO3={ARG:'AR',AUT:'AT',AUS:'AU',BEL:'BE',BMU:'BM',BRA:'BR',CAN:'CA',CHE:'CH',CHL:'CL',CHN:'CN',COL:'CO',CZE:'CZ',DEU:'DE',DNK:'DK',ESP:'ES',EST:'EE',FIN:'FI',FRA:'FR',GBR:'GB',HRV:'HR',HUN:'HU',IRL:'IE',ISR:'IL',ITA:'IT',JPN:'JP',LTU:'LT',LUX:'LU',LVA:'LV',MEX:'MX',NLD:'NL',NOR:'NO',NZL:'NZ',POL:'PL',PRT:'PT',ROU:'RO',SWE:'SE',SVN:'SI',SVK:'SK',USA:'US',ZAF:'ZA'}
const COUNTRY={
 argentina:'AR',australia:'AU',austria:'AT',belgium:'BE',bermuda:'BM',brazil:'BR',canada:'CA',chile:'CL',china:'CN',colombia:'CO',croatia:'HR',czechia:'CZ','czech republic':'CZ',denmark:'DK',estonia:'EE',finland:'FI',france:'FR',germany:'DE',hungary:'HU',ireland:'IE',israel:'IL',italy:'IT',japan:'JP',latvia:'LV',lithuania:'LT',luxembourg:'LU',mexico:'MX',netherlands:'NL','new zealand':'NZ',norway:'NO',poland:'PL',portugal:'PT',romania:'RO',slovakia:'SK',slovenia:'SI','south africa':'ZA',spain:'ES',sweden:'SE',switzerland:'CH','united kingdom':'GB','great britain':'GB','united states':'US','united states of america':'US',usa:'US'
}
function slugify(v){return v.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
function clean(v){return v.replace(/&amp;/gi,'&').replace(/&#39;/g,"'").replace(/&quot;/gi,'"').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
function norm(v){return clean(v).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function code(v){const x=clean(v).trim();if(/^[A-Z]{2}$/.test(x))return x;if(ISO3[x.toUpperCase()])return ISO3[x.toUpperCase()];return COUNTRY[norm(x)]}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function extractName(html){
 const patterns=[/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i,/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,/<h1[^>]*>([\s\S]*?)<\/h1>/i,/<title[^>]*>([\s\S]*?)<\/title>/i]
 for(const re of patterns){const m=html.match(re);if(m){const v=clean(m[1]).replace(/\s*[|–—-].*$/,'').trim();if(v)return v}}
}
function extractCountry(html){
 const patterns=[
  /(?:nationality|country)\s*["']?\s*[:=]\s*["']([^"']{2,40})["']/ig,
  /["'](?:nationality|country)(?:Code)?["']\s*:\s*["']([^"']{2,40})["']/ig,
  /(?:Nationality|Country)\s*<\/[^>]+>\s*<[^>]+>\s*([^<]{2,40})</ig,
  /(?:Nationality|Country)\s*:\s*([^<\n\r]{2,40})/ig
 ]
 for(const re of patterns)for(const m of html.matchAll(re)){const c=code(m[1]);if(c)return c}
}
function parseRows(src){
 const rows=[]
 const re=/\{[^\n]*?nameEn:\s*"([^"]+)"[^\n]*?\}/g
 for(const m of src.matchAll(re))if(!/countryCode:\s*"[A-Z]{2}"/.test(m[0]))rows.push({name:m[1],raw:m[0]})
 return rows
}
async function fetchProfile(name){
 const url=new URL(encodeURI(slugify(name)),BASE).href
 const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36',accept:'text/html,application/xhtml+xml'}})
 if(!r.ok)return {status:`HTTP_${r.status}`,url}
 const html=await r.text(), pageName=extractName(html)
 if(pageName && norm(pageName)!==norm(name) && !norm(pageName).includes(norm(name)) && !norm(name).includes(norm(pageName)))return {status:'NAME_MISMATCH',url,pageName}
 const country=extractCountry(html)
 return country?{status:'OK',url,country,pageName}:{status:'COUNTRY_NOT_FOUND',url,pageName}
}
let src=await fs.readFile(FILE,'utf8'), rows=parseRows(src).slice(0,LIMIT), ok=0
const unresolved=[]
console.log(`Stats PTO country enrichment: ${rows.length} generated athlete(s) without countryCode${WRITE?' (--write)':' (dry run)'}`)
for(const [i,a] of rows.entries()){
 let out
 try{out=await fetchProfile(a.name)}catch(e){out={status:'FETCH_FAILED',error:e instanceof Error?e.message:String(e)}}
 if(out.status==='OK'){
  ok++
  console.log(`[${i+1}/${rows.length}] ✓ ${a.name} → ${out.country}`)
  if(WRITE){
   const replacement=a.raw.replace("country: '', countryEn: '', flag: ''",`country: "${out.country}", countryEn: "${out.country}", countryCode: "${out.country}", flag: ''`)
   if(replacement===a.raw)unresolved.push({name:a.name,status:'ROW_FORMAT_UNEXPECTED',url:out.url})
   else src=src.replace(a.raw,replacement)
  }
 }else{unresolved.push({name:a.name,...out});console.log(`[${i+1}/${rows.length}] - ${a.name}: ${out.status}`)}
 if(DELAY)await sleep(DELAY)
}
if(WRITE){await fs.writeFile(FILE,src,'utf8');console.log(`\nUpdated ${path.relative(ROOT,FILE)}`)}
console.log(`\nResolved: ${ok}/${rows.length}; unresolved: ${unresolved.length}`)
if(unresolved.length){console.log('Unresolved:');for(const x of unresolved)console.log(`  - ${x.name}: ${x.status}${x.pageName?` (page: ${x.pageName})`:''}`)}
console.log(WRITE?'\nReview git diff, then run npm run audit:athletes.':'\nDry run only. Add --write after reviewing matches.')
