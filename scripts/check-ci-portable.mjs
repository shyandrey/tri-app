import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {runChecks} from './check-release.mjs'
import {gateExit} from './release-policy.mjs'

// Explicit allowlist: never discover/import operational scripts or native tooling.
const unit = (...names) => ['node', '--test', '--test-concurrency=1', ...names.map(n => `scripts/test-${n}.mjs`)]
const checks = [
  {name: 'metadata', command: ['npm', 'run', 'metadata']},
  {name: 'portable photos', command: unit('athlete-photos', 'athlete-photo-review')},
  {name: 'PTO identity and registry', command: unit('pto-profiles', 'pto-profile-mapping', 'pto-profile-registry')},
  {name: 'official standings', command: unit('t100-standings', 'ironman-standings')},
  // Retain the real release entrypoint, including build, lint, audits and all 18 checks.
  {name: 'release gate', command: ['npm', 'run', 'check:release']},
]
const directory = process.env.CI_REPORT_DIR ?? await fs.mkdtemp(path.join(os.tmpdir(), 'tri-ci-'))
await fs.mkdir(directory, {recursive: true})
const results = await runChecks(checks, {directory})
const exitCode = gateExit(results)
const heading = `Portable CI: ${exitCode === 0 ? 'PASS' : exitCode === 2 ? 'ENVIRONMENT ERROR' : 'FAIL'}`
const report = {platform: process.platform, arch: process.arch, node: process.version, results, exitCode}
await fs.writeFile(path.join(directory, 'summary.json'), JSON.stringify(report, null, 2) + '\n')
// Copy only the release runner's numbered logs/summary, never its parent temp directory.
const releaseLog = await fs.readFile(path.join(directory, '5.log'), 'utf8')
const releaseDirectory = releaseLog.match(/^Logs: (.+)$/m)?.[1]
if (releaseDirectory && path.dirname(releaseDirectory) === os.tmpdir() && path.basename(releaseDirectory).startsWith('tri-release-')) {
  await fs.mkdir(path.join(directory, 'release'), {recursive: true})
  for (const name of await fs.readdir(releaseDirectory)) {
    if (/^(?:\d+\.log|summary\.json)$/.test(name)) await fs.copyFile(path.join(releaseDirectory, name), path.join(directory, 'release', name))
  }
}
const markdown = `## ${heading}\n\n${process.platform}/${process.arch}; Node ${process.version}\n\n| Check | Result | Seconds |\n| --- | --- | --- |\n` + results.map(r => `| ${r.name} | ${r.status} | ${r.seconds.toFixed(1)} |`).join('\n') + '\n\nNo browser/native/archive suite or deployment was run. No automatic retries.\n'
await fs.writeFile(path.join(directory, 'summary.md'), markdown)
if (process.env.GITHUB_STEP_SUMMARY) await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, markdown)
console.log(`${heading}\nReports: ${directory}`)
process.exitCode = exitCode
