import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const MEN_FILE = path.join(ROOT, 'src/data/athletes/men.ts')
const WOMEN_FILE = path.join(ROOT, 'src/data/athletes/women.ts')
const OUTPUT_DIR = path.join(ROOT, 'public/athletes')
const REGISTRY_FILE = path.join(ROOT, 'src/data/athletes/athletePhotos.generated.ts')
const BASE_URL = 'https://stats.protriathletes.org/athlete/'

const SAMPLE_NAMES = [
  'Kristian Blummenfelt',
  'Hayden Wilde',
  'Marten Van Riel',
  'Lucy Charles-Barclay',
  'Laura Philipp',
]

const args = new Set(process.argv.slice(2))
const importAll = args.has('--all')
const refresh = args.has('--refresh')
const dryRun = args.has('--dry-run')

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function decodeHtml(value) {
  return value
    .replace(/\\u0026/g, '&')
    .replace(/\\u002F/g, '/')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function extractAttribute(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))
  return match?.[1]
}

function collectAthleteNames(source) {
  const names = new Set()

  for (const match of source.matchAll(/makeAthlete\(\s*\d+\s*,\s*'[^']*'\s*,\s*'([^']+)'/g)) {
    names.add(match[1])
  }

  for (const match of source.matchAll(/nameEn:\s*'([^']+)'/g)) {
    names.add(match[1])
  }

  return [...names]
}

function candidateScore(candidate, athleteName, slug) {
  const url = candidate.url.toLowerCase()
  const alt = (candidate.alt ?? '').toLowerCase()
  const athlete = athleteName.toLowerCase()
  const tokens = athlete.split(/\s+/).filter((token) => token.length > 2)

  let score = candidate.baseScore ?? 0

  if (/\.(?:jpe?g|png|webp|avif)(?:\?|$)/i.test(url)) score += 12
  if (/image|img|photo|portrait|profile|athlete/.test(url)) score += 8
  if (url.includes(slug)) score += 28
  if (alt.includes(athlete)) score += 35
  for (const token of tokens) {
    if (url.includes(slugify(token))) score += 5
    if (alt.includes(token)) score += 4
  }

  if (/logo|icon|flag|sponsor|pattern|ranking|t100-triathlon-world-tour|favicon/.test(url)) score -= 45
  if (/\.svg(?:\?|$)/.test(url)) score -= 30
  if (/googletagmanager|doubleclick|facebook|youtube/.test(url)) score -= 60

  return score
}

function findImageCandidates(html, athleteName, pageUrl) {
  const candidates = []
  const push = (rawUrl, baseScore = 0, alt = '') => {
    if (!rawUrl) return
    const cleaned = decodeHtml(rawUrl.trim())
    if (!cleaned || cleaned.startsWith('data:')) return

    let absolute
    try {
      absolute = new URL(cleaned, pageUrl).href
    } catch {
      return
    }

    candidates.push({ url: absolute, baseScore, alt })
  }

  for (const meta of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = meta[0]
    const key = (extractAttribute(tag, 'property') ?? extractAttribute(tag, 'name') ?? '').toLowerCase()
    if (key === 'og:image' || key === 'twitter:image') {
      push(extractAttribute(tag, 'content'), 25)
    }
  }

  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = img[0]
    const alt = extractAttribute(tag, 'alt') ?? ''
    push(extractAttribute(tag, 'src'), 18, alt)
    push(extractAttribute(tag, 'data-src'), 16, alt)

    const srcset = extractAttribute(tag, 'srcset')
    if (srcset) {
      for (const part of srcset.split(',')) {
        push(part.trim().split(/\s+/)[0], 20, alt)
      }
    }
  }

  for (const match of html.matchAll(/https?:\\?\/\\?\/[^"'<>\s]+/gi)) {
    push(match[0], 2)
  }

  const slug = slugify(athleteName)
  const deduped = [...new Map(candidates.map((item) => [item.url, item])).values()]

  return deduped
    .map((item) => ({ ...item, score: candidateScore(item, athleteName, slug) }))
    .sort((a, b) => b.score - a.score)
}

function extensionFromContentType(contentType, url) {
  if (contentType.includes('image/webp')) return 'webp'
  if (contentType.includes('image/png')) return 'png'
  if (contentType.includes('image/avif')) return 'avif'
  if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) return 'jpg'

  const pathExt = new URL(url).pathname.match(/\.(jpe?g|png|webp|avif)$/i)?.[1]?.toLowerCase()
  return pathExt === 'jpeg' ? 'jpg' : pathExt ?? 'jpg'
}

async function fetchPage(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36',
      accept: 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.text()
}

async function findDownloadableCandidate(candidates) {
  for (const candidate of candidates.slice(0, 12)) {
    try {
      const response = await fetch(candidate.url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36',
          referer: 'https://stats.protriathletes.org/',
        },
      })
      const contentType = response.headers.get('content-type') ?? ''
      if (!response.ok || !contentType.startsWith('image/')) continue

      const bytes = new Uint8Array(await response.arrayBuffer())
      if (bytes.byteLength < 8_000) continue
      return { candidate, bytes, contentType }
    } catch {
      // Try the next candidate.
    }
  }

  return null
}

async function existingPhotoForSlug(slug) {
  try {
    const entries = await fs.readdir(OUTPUT_DIR)
    return entries.find((entry) => entry.startsWith(`${slug}.`)) ?? null
  } catch {
    return null
  }
}

async function writeRegistry(records) {
  const lines = [
    '// Generated by scripts/import-athlete-photos.mjs.',
    '// Keep this file in git so the app has a stable photo registry after imports.',
    'export const athletePhotosByName: Record<string, string> = {',
    ...records
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ name, publicPath }) => `  ${JSON.stringify(name)}: ${JSON.stringify(publicPath)},`),
    '}',
    '',
  ]
  await fs.writeFile(REGISTRY_FILE, lines.join('\n'), 'utf8')
}

async function readExistingRegistry() {
  try {
    const source = await fs.readFile(REGISTRY_FILE, 'utf8')
    const records = []
    for (const match of source.matchAll(/^\s*"([^"]+)":\s*"([^"]+)",?$/gm)) {
      records.push({ name: match[1], publicPath: match[2] })
    }
    return records
  } catch {
    return []
  }
}

async function main() {
  const [menSource, womenSource] = await Promise.all([
    fs.readFile(MEN_FILE, 'utf8'),
    fs.readFile(WOMEN_FILE, 'utf8'),
  ])

  const allNames = [...new Set([...collectAthleteNames(menSource), ...collectAthleteNames(womenSource)])]
  const selectedNames = importAll ? allNames : SAMPLE_NAMES.filter((name) => allNames.includes(name))
  const registry = new Map((await readExistingRegistry()).map((record) => [record.name, record.publicPath]))

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  console.log(`Stats PTO athlete photo import: ${selectedNames.length} athlete(s)${importAll ? ' (--all)' : ' (sample)'}`)
  if (dryRun) console.log('Dry run: no files will be written.')

  for (const [index, athleteName] of selectedNames.entries()) {
    const slug = slugify(athleteName)
    const profileUrl = `${BASE_URL}${slug}`
    const existing = await existingPhotoForSlug(slug)

    if (existing && !refresh) {
      const publicPath = `/athletes/${existing}`
      registry.set(athleteName, publicPath)
      console.log(`[${index + 1}/${selectedNames.length}] ${athleteName}: already exists -> ${publicPath}`)
      continue
    }

    console.log(`[${index + 1}/${selectedNames.length}] ${athleteName}: ${profileUrl}`)

    try {
      const html = await fetchPage(profileUrl)
      const candidates = findImageCandidates(html, athleteName, profileUrl)

      if (dryRun) {
        console.log(candidates.slice(0, 5).map((candidate) => `  score ${candidate.score}: ${candidate.url}`).join('\n') || '  no candidates')
        continue
      }

      const resolved = await findDownloadableCandidate(candidates)
      if (!resolved) {
        console.warn(`  ! No downloadable athlete image found. Top candidates:`)
        for (const candidate of candidates.slice(0, 5)) console.warn(`    ${candidate.score}: ${candidate.url}`)
        continue
      }

      const extension = extensionFromContentType(resolved.contentType, resolved.candidate.url)
      const fileName = `${slug}.${extension}`
      const filePath = path.join(OUTPUT_DIR, fileName)
      const publicPath = `/athletes/${fileName}`

      await fs.writeFile(filePath, resolved.bytes)
      registry.set(athleteName, publicPath)
      console.log(`  ✓ ${publicPath} (${Math.round(resolved.bytes.byteLength / 1024)} KB)`)
    } catch (error) {
      console.warn(`  ! ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  if (!dryRun) {
    await writeRegistry([...registry].map(([name, publicPath]) => ({ name, publicPath })))
    console.log(`Updated ${path.relative(ROOT, REGISTRY_FILE)}`)
  }
}

await main()
