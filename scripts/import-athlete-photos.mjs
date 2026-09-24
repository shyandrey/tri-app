import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import { loadPhotoRuntime, digest } from './athlete-photo-runtime.mjs'
import { selectBatch, discoverBatch, snapshotTree, auditPhotoFiles } from './athlete-photo-core.mjs'

export function parseOptions(argv) {
  const options = { dryRun: false, recheck: false, auditWeak: false, refresh: false, replace: false }
  const flags = { '--dry-run': 'dryRun', '--recheck': 'recheck', '--audit-weak': 'auditWeak', '--refresh': 'refresh', '--replace': 'replace', '--clean-no-photo': 'clean', '--stage': 'stage', '--publish': 'publish' }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--batch') {
      if (options.batch || !argv[i + 1] || argv[i + 1].startsWith('--')) throw new Error('Exactly one --batch manifest is required')
      options.batch = argv[++i]
    } else if (flags[arg]) options[flags[arg]] = true
    else throw new Error(`Unsupported option ${arg}; use an explicit --batch (unbounded --all and implicit sample mode removed)`)
  }
  if (!options.batch) throw new Error('Explicit --batch is mandatory')
  if (!options.dryRun && (options.clean || options.stage || options.publish)) throw new Error('Cleanup/download/publish disabled in discovery-only phase; no files changed')
  return options
}

export async function runImporter(argv, dependencies = {}) {
  const root = dependencies.root ?? process.cwd()
  // Also covers invalid/conflicting flag combinations, error paths and empty staging directories.
  const before = await snapshotTree(root)
  let report
  try {
    const options = parseOptions(argv)
    const manifest = JSON.parse(await fs.readFile(path.resolve(root, options.batch), 'utf8'))
    const runtime = dependencies.runtime ?? await loadPhotoRuntime()
    const targets = selectBatch(runtime.athletes, manifest)
    const fileAudit = await auditPhotoFiles(root, runtime.registry)
    if (fileAudit.issues.length) throw new Error(`Photo filesystem inconsistent: ${fileAudit.issues.join('; ')}`)
    const decisions = await discoverBatch(targets, runtime.registry, {
      ...options, fetchPage: dependencies.fetchPage, delayMs: dependencies.delayMs ?? 300,
    })
    report = {
      schemaVersion: 1, batchId: manifest.batchId, mode: options.dryRun ? 'dry-run' : 'discovery',
      targetCount: targets.length, scope: 'Only explicit batch profiles; no image requests',
      disabledActions: ['image-download', 'staging-write', 'publish', 'cleanup'],
      ignoredMutationFlags: ['clean', 'stage', 'publish'].filter(k => options[k]),
      fileAudit, runtimeInvariants: runtime.invariants,
      summary: Object.fromEntries(['HIGH', 'MEDIUM', 'LOW', 'NO_PHOTO', 'RETRY_UNRESOLVED'].map(c => [c, decisions.filter(d => d.confidence === c).length])),
      decisions,
    }
  } finally {
    const after = await snapshotTree(root)
    assert.deepEqual(after, before, 'Discovery/dry-run mutated repository files, staging or directory structure')
    if (report) report.immutability = { passed: true, before: digest(before), after: digest(after), checkedEntries: Object.keys(before).length, excludes: ['.git', 'node_modules'] }
  }
  return report
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await runImporter(process.argv.slice(2)), null, 2)) }
  catch (e) { console.error(e.message); process.exitCode = 1 }
}
