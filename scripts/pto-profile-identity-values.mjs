import iso3166 from './data/iso-3166-1.json' with {type:'json'}
// Validate before URL parsing: parsers may silently normalize slashes/dot segments.
export function profileUrlKey(url) {
 if(typeof url!=='string'||!url.startsWith('https://stats.protriathletes.org/athlete/'))return null
 try {
  const slug=decodeURIComponent(url.slice('https://stats.protriathletes.org/athlete/'.length)).normalize('NFC')
  if(!/^[\p{L}\p{N}]/u.test(slug)||/[^\p{L}\p{M}\p{N}-]/u.test(slug))return null
  return 'https://stats.protriathletes.org/athlete/'+encodeURIComponent(slug)
 }catch{return null} // Malformed percent escapes, UTF-8 or lone surrogates.
}
export const validProfileUrl=url=>profileUrlKey(url)!==null

// Pinned complete ISO table; deliberately no unverified sports-specific aliases.
const countryIdentities=new Map(Object.entries(iso3166.pairs).flatMap(([alpha2,alpha3])=>[[alpha2,alpha2],[alpha3,alpha2]]))
export function normalizedPtoCountry(raw){
 const code=typeof raw==='string'?raw.trim().toUpperCase():''
 return countryIdentities.get(code)??null
}
