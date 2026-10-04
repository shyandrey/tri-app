import { createHash } from 'node:crypto'
import ts from 'typescript'

// Inspect decoded property names before JSON.parse can discard duplicate keys.
export function parseUniqueJSON(text, label = 'JSON') {
  const ast = ts.parseJsonText(label, text)
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const keys = new Set()
      for (const property of node.properties) {
        const key = property.name?.text
        if (keys.has(key)) throw Error(`${label}: DUPLICATE_JSON_KEY ${key}`)
        keys.add(key)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return JSON.parse(text)
}
export const hash = value => createHash('sha256').update(value).digest('hex')
const russian = value => typeof value === 'string' && /[А-Яа-яЁё]/u.test(value)
export function validateRussianName(value, label) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) throw Error(`INVALID_NAME: ${label}: требуется непустое имя без пробелов по краям`)
  if (!russian(value)) throw Error(`NON_RUSSIAN_OVERRIDE: ${label}`)
  if (/\p{Script=Latin}/u.test(value)) throw Error(`MIXED_SCRIPT: ${label}`)
  if (!/^[\p{Script=Cyrillic}\p{M} .’'\-–—]+$/u.test(value)) throw Error(`INVALID_NAME_CHARACTERS: ${label}`)
}
export function catalogRows(registry, raw, localized) {
  const byName = new Map(), ids = new Set()
  for (const a of raw) {
    if (!Number.isSafeInteger(a.id) || a.id <= 0 || ids.has(a.id)) throw Error(`INVALID_OR_DUPLICATE_ID: ${a.id}`)
    ids.add(a.id)
    if (typeof a.nameEn !== 'string' || !a.nameEn.trim() || byName.has(a.nameEn)) throw Error(`AMBIGUOUS_IDENTITY: ${a.nameEn}`)
    byName.set(a.nameEn, a)
  }
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) throw Error('INVALID_REGISTRY')
  for (const [key, entry] of Object.entries(registry)) {
    if (!byName.has(key)) throw Error(`ORPHAN_LOCALIZATION: ${key}`)
    validateRussianName(typeof entry === 'string' ? entry : entry?.nameRu, key)
  }
  if (raw.length !== localized.length) throw Error('CATALOG_LENGTH_CHANGED')
  localized.forEach((a, i) => {
    if (a.id !== raw[i]?.id || a.nameEn !== raw[i]?.nameEn) throw Error(`IDENTITY_CHANGED: ${a.id}`)
    const entry = registry[a.nameEn], override = typeof entry === 'string' ? entry : entry?.nameRu
    if (override !== undefined && a.name !== override) throw Error(`OVERRIDE_NOT_APPLIED: ${a.nameEn}`)
  })
  return localized.map(a => ({ athlete_id: a.id, name_en: a.nameEn, name_ru: russian(a.name) ? a.name : '' }))
    .sort((a, b) => a.name_en.localeCompare(b.name_en, 'en') || a.athlete_id - b.athlete_id)
}
const columns = ['athlete_id', 'name_en', 'name_ru']
export function formatReports(rows) {
  const csvCell = value => {
    if (/^[=+@\-\t\r]/.test(String(value))) throw Error('Unsafe spreadsheet cell prefix; export aborted')
    return '"' + String(value).replaceAll('"', '""') + '"'
  }
  const mdCell = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('|', '&#124;').replace(/[\r\n]/g, ' ')
  const values = rows.map(r => columns.map(c => r[c]))
  return { csv: '\uFEFF' + [columns, ...values].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n',
    md: `# Athlete names\n\nTotal: ${rows.length}; Russian name present: ${rows.filter(r => r.name_ru).length}; missing: ${rows.filter(r => !r.name_ru).length}.\n\nEdit only name_ru in review.csv.\n\n` +
      [columns, columns.map(() => '---'), ...values].map(row => '| ' + row.map(mdCell).join(' | ') + ' |').join('\n') + '\n' }
}
// Strict CSV: comma separator, escaped quotes, CRLF/LF and quoted newlines.
// Structural errors are fatal; no heuristic delimiter or column repair.
export function parseCSV(source) {
  const text = source.replace(/^\uFEFF/, ''), rows = []
  let row = [], cell = '', quoted = false, closed = false
  const field = () => { row.push(cell); cell = ''; closed = false }
  const record = () => { field(); rows.push(row); row = [] }
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else { quoted = false; closed = true } }
      else cell += c
    } else if (c === ',') field()
    else if (c === '\r' || c === '\n') { if (c === '\r' && text[i + 1] === '\n') i++; record() }
    else if (c === '"' && cell === '' && !closed) quoted = true
    else {
      if (closed || c === '"') throw Error(`Malformed CSV near record ${rows.length + 1}`)
      cell += c
    }
  }
  if (quoted) throw Error('Unterminated CSV quote')
  if (cell || row.length || closed) record()
  if (JSON.stringify(rows.shift()) !== JSON.stringify(columns)) throw Error('CSV columns must be exactly athlete_id,name_en,name_ru (comma-separated UTF-8)')
  return rows
}
export function makeBaseline(rows, catalog, registryText) {
  return { version: 1, catalog_sha256: hash(JSON.stringify(catalog)), localization_sha256: hash(registryText), rows }
}
export function assertFresh(baseline, current) {
  if (JSON.stringify(baseline) !== JSON.stringify(current)) throw Error('STALE_BASELINE: каталог, локализация или baseline изменились. Сохраните правки отдельно, заново выполните npm run audit:athlete-names и перенесите правки в новый CSV. Автоматического merge нет.')
}
export function planImport(csv, baseline, current, registry) {
  assertFresh(baseline, current)
  const input = parseCSV(csv)
  if (input.length !== baseline.rows.length) throw Error('ROW_COUNT_CHANGED: нельзя добавлять или удалять строки')
  const byId = new Map(baseline.rows.map(r => [String(r.athlete_id), r])), seen = new Set(), changes = []
  for (const [i, cells] of input.entries()) {
    const label = `CSV record ${i + 2}`
    if (cells.length !== 3) throw Error(`${label}: expected exactly 3 cells`)
    const [id, name, value] = cells, before = byId.get(id)
    if (!before || seen.has(id)) throw Error(`${label}: UNKNOWN_OR_DUPLICATE_ID ${id}`)
    seen.add(id)
    if (name !== before.name_en) throw Error(`${label}: IDENTITY_CHANGED: ${id}; name_en must exactly match baseline`)
    if (value === before.name_ru) continue
    if (!value.trim()) throw Error(`${label}: DELETION_FORBIDDEN: ${name}`)
    validateRussianName(value, `${label}: ${name}`)
    changes.push({ ...before, before: before.name_ru, after: value, kind: before.name_ru ? 'CHANGED' : 'ADDED' })
  }
  const next = structuredClone(registry)
  // Only changed entries are replaced; object metadata on existing entries survives.
  for (const change of changes) {
    const entry = next[change.name_en]
    Object.defineProperty(next, change.name_en, { value: entry && typeof entry === 'object' ? { ...entry, nameRu: change.after } : change.after, enumerable: true, writable: true, configurable: true })
  }
  return { total: input.length, unchanged: input.length - changes.length, changes, next }
}
