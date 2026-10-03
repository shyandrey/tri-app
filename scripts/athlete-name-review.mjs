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
const russian = value => typeof value === 'string' && /[А-Яа-яЁё]/u.test(value)
export function reviewAthleteNames(registry, reviewed, raw, localized) {
  const issues = []
  const byName = new Map(), ids = new Set()
  for (const a of raw) {
    if (ids.has(a.id)) issues.push(`DUPLICATE_ID: ${a.id}`)
    ids.add(a.id)
    if (byName.has(a.nameEn)) issues.push(`AMBIGUOUS_IDENTITY: ${a.nameEn}`)
    byName.set(a.nameEn, a)
  }
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) issues.push('INVALID_REGISTRY')
  else for (const [key, entry] of Object.entries(registry)) {
    if (!byName.has(key)) issues.push(`ORPHAN_LOCALIZATION: ${key}`)
    const name = typeof entry === 'string' ? entry : entry?.nameRu
    if (typeof name !== 'string' || !name.trim() || name !== name.trim()) issues.push(`INVALID_NAME: ${key}`)
    else if (!russian(name)) issues.push(`NON_RUSSIAN_OVERRIDE: ${key}`)
    else if (/\p{Script=Latin}/u.test(name)) issues.push(`MIXED_SCRIPT: ${key}`)
  }
  const approved = new Set()
  if (!Array.isArray(reviewed)) issues.push('INVALID_REVIEW_LIST')
  else for (const key of reviewed) {
    if (typeof key !== 'string' || !key.trim() || key !== key.trim()) { issues.push('INVALID_REVIEW_KEY'); continue }
    if (approved.has(key)) issues.push(`DUPLICATE_REVIEW_KEY: ${key}`)
    approved.add(key)
    if (!byName.has(key)) issues.push(`ORPHAN_REVIEW_KEY: ${key}`)
  }
  if (raw.length !== localized.length) issues.push('CATALOG_LENGTH_CHANGED')
  localized.forEach((a, i) => {
    if (a.id !== raw[i]?.id || a.nameEn !== raw[i]?.nameEn) issues.push(`IDENTITY_CHANGED: ${a.id}`)
    if (approved.has(a.nameEn) && !russian(a.name)) issues.push(`APPROVED_WITHOUT_RUSSIAN_NAME: ${a.nameEn}`)
    const entry = registry?.[a.nameEn], override = typeof entry === 'string' ? entry : entry?.nameRu
    if (override !== undefined && a.name !== override) issues.push(`OVERRIDE_NOT_APPLIED: ${a.nameEn}`)
  })
  const rows = localized.map(a => ({ id: a.id, original: a.nameEn, russian: russian(a.name) ? a.name : '',
    status: !russian(a.name) ? 'MISSING' : approved.has(a.nameEn) ? 'APPROVED' : 'REVIEW' }))
    .sort((a, b) => a.original.localeCompare(b.original, 'en') || a.id - b.id)
  return { issues, rows }
}
export function formatReports(rows) {
  const header = ['ID', 'Original name', 'Current Russian name', 'Status']
  const values = rows.map(r => [r.id, r.original, r.russian, r.status])
  // BOM + CRLF for spreadsheet applications; neutralize formula-like cells.
  const csvCell = value => '"' + String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""') + '"'
  const mdCell = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('|', '&#124;').replace(/[\r\n]/g, ' ')
  return { csv: '\uFEFF' + [header, ...values].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n',
    md: '# Athlete names — manual review\n\nGenerated report, not an editable source.\n\n' +
      [header, header.map(() => '---'), ...values].map(row => '| ' + row.map(mdCell).join(' | ') + ' |').join('\n') + '\n' }
}
