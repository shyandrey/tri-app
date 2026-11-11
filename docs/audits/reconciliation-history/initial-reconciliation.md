> Historical checkpoint before the owner approved semantic resolution. Superseded by [current reconciliation](../safe-git-reconciliation.md).

# Safe Git reconciliation — 2026-11-10

**PARTIAL / BLOCKED on semantic uncommitted-file conflicts.** Original worktree is untouched. No push, PR, deployment or biography integration. Do not treat the isolated committed candidate as fully qualified.

## Preserved source state and recovery

- Original: `/Users/andrey.shubin/Projects/tri-app`, branch `home-redesign-experiments`.
- Actual original HEAD: `6b0d7def3cb7d0397df36a0ec12da4957fab53c0`. The task's `a94c8164` was superseded by the immediately preceding authorized documentation-only performance audit; it is preserved as the fourth local commit, not omitted.
- Fresh read-only remote query: `32eee71112a23589046ccf5a79a10ccf8932b675` (unchanged).
- Merge base: `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`; four local-only / 76 remote-only commits.
- Original index empty; 19 modified tracked paths and 44 individual untracked files. The prior nine-file list was the **non-identical incoming overlap**, not every local difference. Full inventory finds ten remote-identical paths, nine differing incoming overlaps, six additional local-only tracked deltas, and 38 paths absent from remote.
- Complete private backup: `/Users/andrey.shubin/Projects/tri-app-reconciliation-20261110/original-repository`. Includes `.git`, all tracked/untracked/ignored files, original artwork, photo staging, dependencies/build caches and symlinks. No exclusions.
- `manifest.json`: 9563 entries / 974611846 regular-file bytes; copy verified against source by SHA-256, file mode and symlink target before Git writes. `state.json` records original branch/HEAD, remote/base, index diff, binary working diff and full status. Parent directory mode 0700. Backup may contain credentials/configuration: keep it private; no values were printed or committed.
- Recovery should use a **new directory** copied from the backup, never a blanket overwrite/reset of the live worktree. Isolated Git operations add shared worktree/ref/object metadata, but do not change the original branch, index or working files.

## Isolated committed candidate

Worktree: `/private/tmp/300w-reconciliation-20261110`<br>
Branch: `reconcile/performance-20261110`<br>
HEAD: `4c632c63d21cc9c124b96e0fa11c47d134cf1b6c`

| Original local commit | Replayed commit | Scope |
|---|---|---|
| `2b5df28373a002b355b21a52df4d895dea32068d` | `4db85087a85b787bf5f8679210561ccf7a13804d` | Image/performance audit |
| `767ab44e726c821708343ed0a3b0e6a413ac0632` | `4c69b73cebc6d9977c533992c4c6bd478dc5aed9` | Rankings loading-shell CLS fix |
| `a94c816417d28d358b677d0d49aab222c1f9eaae` | `e38aab71471f4c2de0af499ff12e32f857f6d0ea` | Isolated lazy Rankings entry |
| `6b0d7def3cb7d0397df36a0ec12da4957fab53c0` | `4c632c63d21cc9c124b96e0fa11c47d134cf1b6c` | Rejected prefetch findings, documentation only |

All remote commits remain ancestors of the candidate; original local commits remain intact on the original branch. No unrelated branch was imported. Sixteen non-Board performance paths are byte-identical to original local HEAD. The candidate changes exactly the 17 performance paths relative to remote; all other committed remote content remains untouched.

### Exact committed Project Board reconciliation

Only the first cherry-pick conflicted, at the append point. Kept the **entire remote Board byte-for-byte**, then appended the exact five-line local image/performance section from the original commit. No remote task row/status was deleted or selected against the local side. The remaining three cherry-picks applied cleanly and appended their original sections. The four dated performance headings each occur exactly once; no duplicate performance entry needed removal. Existing remote historical task records were not reinterpreted. Uncommitted local Board history/status updates remain separate pending review; no blanket replacement was performed.

This report and a new reconciliation-status section are uncommitted worktree documentation, separate from the four replayed commits.


### Exact reconciled committed paths

- `docs/PROJECT_BOARD.md` — remote Board plus exact local additions.
- `docs/audits/pre-release-image-inventory.csv` — exact original local HEAD bytes.
- `docs/audits/pre-release-performance-audit.md` — exact original local HEAD bytes.
- `docs/audits/pre-release-performance-measurements.json` — exact original local HEAD bytes.
- `docs/audits/rankings-cold-load-measurements.json` — exact original local HEAD bytes.
- `docs/audits/rankings-cold-load-optimization.md` — exact original local HEAD bytes.
- `docs/audits/rankings-performance-layout-measurements.json` — exact original local HEAD bytes.
- `docs/audits/rankings-performance-layout-stability.md` — exact original local HEAD bytes.
- `docs/audits/rankings-profile-prefetch-measurements.json` — exact original local HEAD bytes.
- `docs/audits/rankings-profile-prefetch.md` — exact original local HEAD bytes.
- `scripts/test-rankings-route.mjs` — exact original local HEAD bytes.
- `scripts/test-rankings-startup-browser.mjs` — exact original local HEAD bytes.
- `src/sports/RankingsArea.tsx` — exact original local HEAD bytes.
- `src/sports/SportsRoute.tsx` — exact original local HEAD bytes.
- `src/sports/loader.ts` — exact original local HEAD bytes.
- `src/sports/rankings-entry.ts` — exact original local HEAD bytes.
- `src/sports/sports-loading.css` — exact original local HEAD bytes.

## File-by-file uncommitted review

[Complete 63-file inventory with status, decisions and both hashes](initial-files.csv). Ten incoming-overlap files already match remote exactly (including Profile UI, canonical display resolver, Rankings rendering and localization adapter); their content is already preserved in the candidate. No copy is necessary.

The nine differing incoming overlaps:

| Path | Classification and finding |
|---|---|
| `docs/PROJECT_BOARD.md` | **overlapping documentation**. Committed remote Board retained verbatim plus four unique local performance sections; uncommitted historical status changes/additions not applied after STOP. |
| `docs/ath-ui01-data-ath02-review.md` | **overlapping documentation**. Local adds publication/smoke blocker and DEVOPS-04 recovery evidence; header and historical link changes overlap remote. Preserve both histories in a later explicit documentary union. |
| `docs/athlete-name-localization-policy.md` | **overlapping documentation**. Local long chronology overlaps shorter remote canonical policy and approved batch/test-contract sections. Do not replace either entire file. |
| `docs/devops03b2-preview-implementation-plan.md` | **overlapping documentation**. Local adds 414 lines and removes 2: qualification/manual/deploy/readiness/Cloud suspension chronology. Preserve as dated evidence; not authorization to restore manual deployment. |
| `scripts/check-ci-portable.mjs` | **conflicting test contract**. Local omits approved-athlete-names from mandatory official standings checks. Remote check must not be silently removed. |
| `scripts/deploy-preview-artifact.mjs` | **conflicting deployment logic**. Local manual mode changes the same context/preflight/upload path; replaces pinned account check with shape validation, removes unconditional rollback validation/recheck and explicit config.name guard. Cannot merge automatically. |
| `scripts/test-athlete-display-policy.mjs` | **conflicting test contract**. Local hardcodes 230 missing names; remote subtracts approved 115-row batches (currently zero). Same assertion, incompatible catalog-era contracts. |
| `scripts/test-athlete-results-polish-browser.mjs` | **conflicting test coverage**. Local uses four widths at height 900 and hardcoded artifact directory; remote seven viewport pairs plus TRI_ARTIFACT_DIR. Same harness and loop, not a union-safe replacement. |
| `scripts/test-race-result-import.mjs` | **conflicting test contract plus compatible addition**. Local removes approved-CSV projection and ten negative guards, restores full catalog hash, and adds a missing-localization nonblocking test. Preserve remote guards; propose adding only the final new test with matching importer support after approval. |

Six additional local-only tracked changes are compatible at the textual/history boundary because remote equals the original committed local version: `docs/athlete-name-review.md`, `docs/perf01-sports-chunk-audit.md`, `docs/scripts.md`, `scripts/find-next-athletes.mjs`, `scripts/import-race-results.mjs`, `scripts/test-find-next-athletes.mjs`. The import/editorial queue changes and their tests must be integrated together. They were **not applied after the semantic STOP**, nor executed. All local-only documents, CSVs, manual-mode files, original images and audit outputs are preserved in the original tree and full backup.

### Why automatic reconciliation stops

The deployment conflict concerns security/activation behavior, not whitespace: choosing local would reintroduce manual-mode branches and replace/remove newer account/Worker/rollback safeguards. Choosing remote would omit that local experiment. Both remain recoverable; neither was silently selected as a resolution.

The localization test conflicts concern the same assertions: local expects 230 missing names and the old full-profile hash; remote carries both approved batches, exact CSV checks and mutation-negative fixtures. Local also adds a useful independent nonblocking-review test, which should not be lost. Whole-file copying in either direction is inappropriate. The profile browser conflict would reduce seven viewport pairs to four width-only cases and lose configurable artifact output.

## Specific owner decision requested

Recommended next scope, **not implemented**:

1. Keep the remote deployment/CI security logic active. Preserve the local manual-mode workflow/helper/test only in the original tree/private archive, without wiring it into the candidate.
2. Keep remote approved-name CI coverage, batch-aware missing-name assertion, protected identity/results hash projection and ten negative fixtures, and the seven-viewport Profile browser harness. Add **only** the local final test named `Missing localization is reported without blocking verified source rows or IDs` to `test-race-result-import.mjs`, alongside compatible localizationReview importer/helper changes. Do not restore the obsolete 230-count/full-profile-hash assertions.
3. Carry the six compatible deltas and required local audit documents forward, then reconcile the four documentary overlaps as dated historical evidence. Preserve the remote canonical policies and all substantive local closure/audit records; do not reinstate old task statuses as current facts or activate manual deployment.

Items 1–2 require an explicit semantic choice. Item 3 is already within the compatible-reconciliation authorization and resumes after that STOP is cleared. Owner confirmation of the conflicting choices is required by the task's semantic-conflict STOP rule. Until then the uncommitted overlay remains unapplied, even where individual hunks are compatible.

## Verification and limits

- Complete backup verification: PASS before Git writes. Final full working-file/mode/symlink comparison (including ignored files), index-byte comparison, original HEAD/branch/status comparison: PASS; original worktree unchanged.
- Fresh remote HEAD and original local state recorded: PASS.
- 57/57 approved biography Markdown files remain byte-identical to remote; this is **source preservation**, not biography integration or editorial/content approval.
- All local performance changes preserved; no rejected prefetch runtime introduced: PASS.
- No other committed remote paths changed: PASS.
- `git diff --check` (candidate working diff and full remote→candidate committed diff): PASS.
- Build, lint, release gate and browser/unit regression tests: **NOT RUN**. Full reconciliation was stopped at a confirmed semantic conflict, as instructed. Earlier audit PASS results are not reused as qualification of this new worktree. No claim of readiness for biography integration.
- TECH-01 remains open; no full catalog regeneration, source/data edits, D1 writes or infrastructure operations.

Read-only comparison evidence: `/private/tmp/300w-reconciliation-evidence-20261110/` (complete diffs for each differing file, inventory and integrity checks). Original and candidate source snapshots are recoverable; do not use tests passing as authorization to drop either conflict side.
