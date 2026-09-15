import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const MEN_FILE = path.join(ROOT, 'src/data/athletes/men.ts')
const WOMEN_FILE = path.join(ROOT, 'src/data/athletes/women.ts')
const OUTPUT_DIR = path.join(ROOT, 'public/athletes')
const REGISTRY_FILE = path.join(ROOT, 'src/data/athletes/athletePhotos.generated.ts')
const BASE_URL = 'https://stats.protriathletes.org/athlete/'

const SAMPLE_NAMES = ['Mika Noodt']

const PROFILE_SLUG_OVERRIDES = {
  'Magnus Ditlev': 'magnus-elbaek-ditlev',
  'Daniel Bækkegård': 'daniel-baekkegard',
  'Kristian Høgenhaug': 'kristian-hogenhaug',
  'Guillem Montiel': 'montiel-moreno-guillem',
  'Solveig Løvseth': 'solveig-loevseth',
  'Hannah Berry': 'hannah-wells',
  'Caroline Pohle': 'carolin-pohle',
  'Katrine Græsbøll Christensen': 'katrine-graesboell-christensen',
  'Lena Meißner': 'lena-meißner',
}

const args = new Set(process.argv.slice(2))
const importAll = args.has('--all')
const refresh = args.has('--refresh')
const dryRun = args.has('--dry-run')
const audit = args.has('--audit')

function slugify(value) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
function profileSlugForName(name) { return PROFILE_SLUG_OVERRIDES[name] ?? slugify(name) }
function decodeHtml(value) { return value.replace(/\\u0026/g, '&').replace(/\\u002F/g, '/').replace(/\\\//g, '/').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") }
function extractAttribute(tag, name) { return tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1] }
function collectAthleteNames(source) {
  const names = new Set()
  for (const match of source.matchAll(/makeAthlete\(\s*\d+\s*,\s*'[^']*'\s*,\s*'([^']+)'/g)) names.add(match[1])
  for (const match of source.matchAll(/nameEn:\s*'([^']+)'/g)) names.add(match[1])
  return [...names]
}
function normalizeIdentity(value) { return decodeHtml(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ') }
function isExactAthleteAlt(alt, athleteName) { return Boolean(alt) && normalizeIdentity(alt) === normalizeIdentity(athleteName) }
function isImageLikeUrl(url) { return /\.(?:jpe?g|png|webp|avif)(?:[?#]|$)/i.test(url) || /(?:image|img|photo|portrait|profile|athlete)[=/\-_]/i.test(url) }
function normalizedText(value) { return decodeHtml(value).replace(/<[^>]*>/g, ' ').replace(/\\[nrt]/g, ' ').replace(/\s+/g, ' ').toLowerCase() }
function contextScore(html, position, athleteName) {
  const before = html.slice(Math.max(0, position - 500), position)
  const after = html.slice(position, Math.min(html.length, position + 250))
  const context = normalizedText(`${before} ${after}`)
  const athlete = athleteName.toLowerCase()
  let score = context.includes(athlete) ? 40 : 0
  if (/biography|overview|world rank|national|weight|height|born/.test(context)) score += 8
  if (/rivals|results|youtube|upcoming races|background|sponsor/.test(context)) score -= 35
  return score
}
function candidateScore(candidate, athleteName, slug) {
  const url = candidate.url.toLowerCase()
  let score = (candidate.baseScore ?? 0) + (candidate.contextScore ?? 0)
  if (candidate.exactAthleteAlt) score += 500
  if (isImageLikeUrl(url)) score += 16
  if (/\.(?:jpe?g|png|webp|avif)(?:[?#]|$)/i.test(url)) score += 12
  if (url.includes(slug)) score += 28
  if (/content\.protriathletes\.org\/content\/images\//.test(url)) score += 8
  if (/logo|icon|flag|sponsor|pattern|ranking|t100-triathlon-world-tour|favicon|background|all-race-results|all-upcoming-races|pto-triathlon-stats/.test(url)) score -= 100
  if (/ytimg|youtube/.test(url)) score -= 100
  return score
}
function findImageCandidates(html, athleteName, pageUrl) {
  const candidates = []
  let sequence = 0
  const push = (rawUrl, baseScore = 0, alt = '', position = -1, source = 'page') => {
    if (!rawUrl) return
    const cleaned = decodeHtml(rawUrl.trim())
    if (!cleaned || cleaned.startsWith('data:')) return
    let absolute
    try { absolute = new URL(cleaned, pageUrl).href } catch { return }
    if (!isImageLikeUrl(absolute)) return
    candidates.push({ url: absolute, baseScore, alt, exactAthleteAlt: isExactAthleteAlt(alt, athleteName), source, sequence: sequence++, contextScore: position >= 0 ? contextScore(html, position, athleteName) : 0 })
  }
  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = img[0]
    const alt = extractAttribute(tag, 'alt') ?? ''
    const position = img.index ?? -1
    push(extractAttribute(tag, 'src'), 18, alt, position, 'img:src')
    push(extractAttribute(tag, 'data-src'), 16, alt, position, 'img:data-src')
    push(extractAttribute(tag, 'data-lazy-src'), 16, alt, position, 'img:data-lazy-src')
    const srcset = extractAttribute(tag, 'srcset') ?? extractAttribute(tag, 'data-srcset')
    if (srcset) for (const part of srcset.split(',')) push(part.trim().split(/\s+/)[0], 22, alt, position, 'img:srcset')
  }
  for (const match of html.matchAll(/(?:https?:\\?\/\\?\/|\/)[^"'<>\s]+?\.(?:jpe?g|png|webp|avif)(?:\?[^"'<>\s]*)?/gi)) push(match[0], 4, '', match.index ?? -1, 'raw-url')
  const slug = slugify(athleteName)
  const deduped = new Map()
  for (const item of candidates) {
    const existing = deduped.get(item.url)
    if (!existing || item.exactAthleteAlt || (item.baseScore + item.contextScore) > (existing.baseScore + existing.contextScore)) deduped.set(item.url, item)
  }
  return [...deduped.values()].map((item) => ({ ...item, score: candidateScore(item, athleteName, slug) })).sort((a, b) => Number(b.exactAthleteAlt) - Number(a.exactAthleteAlt) || b.score - a.score || a.sequence - b.sequence)
}
function extensionFromContentType(contentType, url) {
  if (contentType.includes('image/webp')) return 'webp'
  if (contentType.includes('image/png')) return 'png'
  if (contentType.includes('image/avif')) return 'avif'
  if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) return 'jpg'
  const ext = new URL(url).pathname.match(/\.(jpe?g|png|webp|avif)$/i)?.[1]?.toLowerCase()
  return ext === 'jpeg' ? 'jpg' : ext ?? 'jpg'
}
async function fetchPage(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36', accept: 'text/html,application/xhtml+xml' } })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.text()
}
async function findDownloadableCandidate(candidates) {
  for (const candidate of candidates.slice(0, 20)) {
    try {
      const response = await fetch(candidate.url, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36', referer: 'https://stats.protriathletes.org/' } })
      const contentType = response.headers.get('content-type') ?? ''
      if (!response.ok || !contentType.startsWith('image/')) continue
      const bytes = new Uint8Array(await response.arrayBuffer())
      if (bytes.byteLength < 8_000) continue
      return { candidate, bytes, contentType }
    } catch {}
  }
  return null
}
async function existingPhotoForSlug(slug) {
  try { return (await fs.readdir(OUTPUT_DIR)).find((entry) => entry.startsWith(`${slug}.`)) ?? null } catch { return null }
}
async function writeRegistry(records) {
  const lines = ['// Generated by scripts/import-athlete-photos.mjs.', '// Keep this file in git so the app has a stable photo registry after imports.', 'export const athletePhotosByName: Record<string, string> = {', ...records.sort((a,b)=>a.name.localeCompare(b.name)).map(({name,publicPath})=>`  ${JSON.stringify(name)}: ${JSON.stringify(publicPath)},`), '}', '']
  await fs.writeFile(REGISTRY_FILE, lines.join('\n'), 'utf8')
}
async function readExistingRegistry() {
  try {
    const source = await fs.readFile(REGISTRY_FILE, 'utf8'); const records=[]
    for (const match of source.matchAll(/^\s*"([^"]+)":\s*"([^"]+)",?$/gm)) records.push({name:match[1],publicPath:match[2]})
    return records
  } catch { return [] }
}
function printCandidates(candidates) {
  for (const candidate of candidates.slice(0, 5)) console.log(`  ${candidate.exactAthleteAlt ? 'EXACT PROFILE' : 'candidate'} | score ${candidate.score} | alt ${JSON.stringify(candidate.alt)}\n    ${candidate.url}`)
}
async function main() {
  const [menSource,womenSource]=await Promise.all([fs.readFile(MEN_FILE,'utf8'),fs.readFile(WOMEN_FILE,'utf8')])
  const allNames=[...new Set([...collectAthleteNames(menSource),...collectAthleteNames(womenSource)])]
  const selectedNames=(importAll||audit)?allNames:SAMPLE_NAMES.filter((name)=>allNames.includes(name))
  const registry=new Map((await readExistingRegistry()).map((record)=>[record.name,record.publicPath]))
  await fs.mkdir(OUTPUT_DIR,{recursive:true})
  console.log(`Stats PTO athlete photo import: ${selectedNames.length} athlete(s)${audit?' (--audit)':importAll?' (--all)':' (Mika test)'}`)
  for (const [index,athleteName] of selectedNames.entries()) {
    const fileSlug=slugify(athleteName), profileSlug=profileSlugForName(athleteName), profileUrl=new URL(encodeURI(profileSlug),BASE_URL).href
    const existing=await existingPhotoForSlug(fileSlug)
    if (existing&&!refresh&&!audit&&!dryRun) { registry.set(athleteName,`/athletes/${existing}`); console.log(`[${index+1}/${selectedNames.length}] ${athleteName}: already exists`); continue }
    console.log(`[${index+1}/${selectedNames.length}] ${athleteName}: ${profileUrl}`)
    try {
      const html=await fetchPage(profileUrl), candidates=findImageCandidates(html,athleteName,profileUrl), exact=candidates.filter((c)=>c.exactAthleteAlt)
      if (audit) { console.log(exact.length ? `  ✓ exact profile candidate (${exact[0].url})` : '  ! REVIEW: no exact-name profile image'); continue }
      if (dryRun) { printCandidates(candidates); continue }
      if (!exact.length) { console.warn('  ! No exact-name profile image found; refusing to overwrite.'); continue }
      const resolved=await findDownloadableCandidate(exact)
      if (!resolved) { console.warn('  ! Exact profile image is not downloadable.'); continue }
      const extension=extensionFromContentType(resolved.contentType,resolved.candidate.url), fileName=`${fileSlug}.${extension}`, publicPath=`/athletes/${fileName}`
      await fs.writeFile(path.join(OUTPUT_DIR,fileName),resolved.bytes); registry.set(athleteName,publicPath)
      console.log(`  ✓ ${publicPath} (${Math.round(resolved.bytes.byteLength/1024)} KB, exact alt ${JSON.stringify(resolved.candidate.alt)})`)
    } catch(error) { console.warn(`  ! ${error instanceof Error?error.message:String(error)}`) }
  }
  if (!dryRun&&!audit) { await writeRegistry([...registry].map(([name,publicPath])=>({name,publicPath}))); console.log(`Updated ${path.relative(ROOT,REGISTRY_FILE)}`) }
}
await main()
