import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'
import { parseUniqueJSON, planImport, assertFresh } from './athlete-name-review.mjs'
import { loadNameSnapshot, registryPath, reviewDirectory } from './audit-athlete-names.mjs'

// Dependencies are injectable for isolated filesystem tests; CLI paths are fixed.
export async function importNames({ write = false, directory = reviewDirectory, target = registryPath, load = loadNameSnapshot } = {}) {
  const csv = await fs.readFile(path.join(directory, 'review.csv'), 'utf8')
  const baseline = parseUniqueJSON(await fs.readFile(path.join(directory, 'baseline.json'), 'utf8'), 'baseline')
  const current = await load()
  const plan = planImport(csv, baseline, current.baseline, current.registry)
  if (write && plan.changes.length) {
    // Validate the entire batch before any source write; replace one file atomically.
    // Serialize manual imports/edits: no automatic merge with concurrent changes.
    const temporary = target + '.' + randomUUID() + '.tmp'
    try {
      await fs.writeFile(temporary, JSON.stringify(plan.next, null, 2) + '\n', { flag: 'wx' })
      assertFresh(baseline, (await load()).baseline)
      if (await fs.readFile(target, 'utf8') !== current.registryText) throw Error('Localization changed during import; aborted')
      await fs.rename(temporary, target)
    } finally { await fs.rm(temporary, { force: true }) }
  }
  return plan
}
export function describePlan(plan, write) {
  return [`Athletes in snapshot: ${plan.total}`, `Unchanged: ${plan.unchanged}`,
    `Changed Russian names: ${plan.changes.filter(c => c.kind === 'CHANGED').length}`,
    `Added Russian names: ${plan.changes.filter(c => c.kind === 'ADDED').length}`,
    ...plan.changes.map(c => `${c.kind}: ${c.name_en} [${c.athlete_id}]\n  before: ${c.before || '—'}\n  after:  ${c.after}`),
    write && plan.changes.length ? `Updated only ${registryPath}. Re-export before the next batch.` : 'No source files changed.'].join('\n')
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const args = process.argv.slice(2)
    if (args.length && (args.length !== 1 || args[0] !== '--write')) throw Error('Usage: npm run import:athlete-names [-- --write]')
    console.log(describePlan(await importNames({ write: args.includes('--write') }), args.includes('--write')))
  } catch (e) { console.error(e.message); process.exitCode = 1 }
}
