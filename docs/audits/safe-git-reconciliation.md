# Safe Git reconciliation — completed candidate

Date: 2026-11-10. **COMPLETE / READY FOR SEPARATE BIOGRAPHY INTEGRATION.** Owner semantic decisions applied and all required checks passed. No biography integration, push, PR or deployment. Original worktree untouched.

## Git and preservation

- Original branch `home-redesign-experiments`, HEAD `6b0d7def3cb7d0397df36a0ec12da4957fab53c0` (includes the latest report after the task's older `a94c8164` baseline).
- Remote baseline `32eee71112a23589046ccf5a79a10ccf8932b675`; merge base `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`.
- Worktree `/private/tmp/300w-reconciliation-20261110`, branch `reconcile/performance-20261110`. Pre-closeout HEAD `4c632c63d21cc9c124b96e0fa11c47d134cf1b6c`; the final local closeout commit is its direct child (see the branch HEAD / delivery SHA).
- Verified full private backup `/Users/andrey.shubin/Projects/tri-app-reconciliation-20261110/original-repository`: 9563 file/symlink entries, 974611846 regular-file bytes, including `.git`, ignored/untracked files, artwork and staging. SHA-256/modes/link targets matched before any Git writes. Original state, manifest and recovery instructions remain beside it. Do not publish this private backup.
- Original 19 modified tracked / 44 untracked files are preserved. [All 63 source paths, exact dispositions and hashes](safe-git-reconciliation-files.csv). Ten already match remote; nine incoming overlaps required review; six additional tracked deltas were local-only; 38 paths were absent from remote.

All four local commits remain preserved in order through these replay commits, which remain ancestors of the final candidate:

| Original | Replayed | Scope |
|---|---|---|
| `2b5df283` | `4db85087a85b787bf5f8679210561ccf7a13804d` | Image/performance audit |
| `767ab44e` | `4c69b73cebc6d9977c533992c4c6bd478dc5aed9` | CLS loading-shell fix |
| `a94c8164` | `e38aab71471f4c2de0af499ff12e32f857f6d0ea` | Rankings lazy entry |
| `6b0d7def` | `4c632c63d21cc9c124b96e0fa11c47d134cf1b6c` | Prefetch investigation: not adopted |

Remote commits remain ancestors, and original local commits remain on the untouched original branch. All sixteen non-Board performance files are exact original-local-HEAD bytes. Experimental Profile prefetch is absent.

## Applied code resolution

Only four scripts change in the closeout commit:

1. `scripts/import-race-results.mjs`: add nonblocking `localizationReview` metadata for matched/unmatched identities and include it in CLI reporting. Existing result rows, matches, IDs, statuses, SOF and write routing remain unchanged. The existing remote `athlete-localization-review.mjs` helper is reused without alteration.
2. `scripts/find-next-athletes.mjs`: only `--append` uses an existing approved localization when available and writes an editorial sidecar. New ID allocation remains `max(existing IDs)+1`; existing generated source remains the exact prefix. No extra generator invocation is introduced. The local changes to `writeGeneratedProfiles()` are intentionally excluded; the legacy full-regeneration function and its dispatch remain byte-identical to remote.
3. `scripts/test-race-result-import.mjs`: preserve every remote byte as a prefix, including approved CSV digests, identity/results projection and ten negative mutation fixtures. Append only `Missing localization is reported without blocking verified source rows or IDs`. It compares exact result rows and identity matches with localized versus English-fallback catalog input.
4. `scripts/test-find-next-athletes.mjs`: retain remote tests and add append ID/sidecar/approved-name assertions. Omit the local assertion requiring a new full-regeneration sidecar, since that implementation is excluded. The existing one-athlete synthetic full-regenerate fixture remains; it runs under a temporary test root, not against the real catalog.

These deltas were absent from remote before application. No canonical athlete/result data was regenerated or edited. All `src/data/`, `public/` and 57 approved biography Markdown files match remote exactly.

## Retained safeguards and exclusions

The following remain byte-identical to remote:

- `scripts/deploy-preview-artifact.mjs`, `scripts/preview-artifact.mjs`, `.github/workflows/preview-ci.yml`, `wrangler.jsonc`: account/Worker checks, rollback validation/recheck, activation/artifact/branch safeguards unchanged. No live Cloudflare verification or mutation was performed.
- `scripts/check-ci-portable.mjs`: retains approved-athlete-names coverage.
- `scripts/test-athlete-display-policy.mjs`: retains batch-aware expected missing-name coverage; no obsolete hardcoded 230 count.
- `scripts/test-athlete-results-polish-browser.mjs`: retains seven viewport pairs and configurable artifact directory.
- `scripts/test-approved-athlete-names.mjs`: retained unchanged.

No manual deployment mode or its local workflow/helper/test is imported. Its historical design, limitations and qualification results remain documentary evidence; source files remain in the original tree/private backup. Unused artwork originals, `ranking.txt`, `sof.json`, `athlete-audit.txt`, the unrelated product-readiness draft and standalone local display-audit tool remain preserved but intentionally outside this commit. No unresolved semantic choice is hidden by those exclusions.

## Documentation reconciliation

Remote canonical records are preserved rather than replaced. All substantive local text of the four overlapping documents is retained as clearly labeled historical snapshots, with source SHA-256 and only relative links rebased:

- [Local Project Board history](reconciliation-history/project-board-local.md).
- [Athlete UI audit/publication/recovery history](reconciliation-history/athlete-ui-local.md).
- [Localization policy and batch closeout history](reconciliation-history/localization-policy-local.md).
- [DEVOPS/manual-mode/deployment/readiness/Cloud suspension history](reconciliation-history/devops-plan-local.md).

Canonical documents link to those histories; Project Board includes a concise task-history index. The four performance sections each occur once in the canonical Board. Historical statuses and manual-mode proposals are not current activation instructions. This avoids deleting remote records, losing local decisions, or duplicating contradictory statuses as fresh current tasks.

Compatible additions to `docs/athlete-name-review.md`, `docs/scripts.md` and `docs/perf01-sports-chunk-audit.md` are preserved exactly. Seven referenced localization audit CSV/JSON files retain all records as historical evidence. Five are copied byte-for-byte; the two draft batch CSVs use LF instead of CRLF to satisfy repository whitespace checks, with parsed-row equality verified. Original raw bytes remain in the private backup. Reconciliation inventory CSVs also use LF; the archived initial report normalizes two Markdown hard-breaks to `<br>`. The old biography-reconciliation blocker report is preserved with a superseding-checkpoint banner. The [initial reconciliation report](reconciliation-history/initial-reconciliation.md) and [initial inventory](reconciliation-history/initial-files.csv) retain the original STOP findings and not-run test status; those are superseded by this owner-approved closeout.

[Complete closeout file list](safe-git-reconciliation-changes.csv) records the scope of the new commit; the earlier performance files are preserved through the four replay commits.

## Verification

- Additional localization test independently: **1/1 PASS**.
- Importer/localization/catalog/search/Rankings resource/navigation unit suites: **69/69 PASS**. Existing ID/results guards and new editorial checks run together.
- Deployment/artifact safety fixtures: **54/54 PASS**; mocked/local only, no upload.
- Production build and full lint: **PASS**.
- Release gate: **18/18 PASS**; known sports/shared >500 KB warning remains.
- Browser suites: **6/6 PASS**, each first run on a fresh profile: Rankings startup **2/2**, official Rankings **14/14**, swipe **14/14** plus reduced-motion/orientation/network checks, code-splitting **4/4**, Navigation **all scenarios**, Athlete Profile **14/14** viewport/theme combinations.
- Data/artwork/57-biography hash checks, deployment/modern-test exact preservation and four-commit ancestry: **PASS**.
- New/modified documentation path links and `git diff --check`: **PASS**. Full original working-tree/mode/symlink verification (including ignored files), original index-byte comparison and original HEAD/branch/status comparison: **PASS**.

Node 24.19.0 and the existing dependency tree were copied privately after verifying identical lockfiles; no new dependencies or package changes. Browser suites use a fresh local Chrome profile per suite, the exact built checkout and no retries after failure. Builds precede browser tests. Logs: `/private/tmp/300w-reconcile-complete-20261110/`.

## Readiness and remaining limits

No unresolved semantic conflicts remain. This isolated worktree is ready as the starting point for the separate biography integration task; **0/57 biographies have been imported** in this task. All 57 approved source Markdown files remain byte-identical to remote. TECH-01 remains open: full real-catalog regeneration is prohibited. Physical-device QA, published state and performance medians were not requalified by this Git reconciliation. No original-tree merge, remote operation, PR or deployment is authorized by this report.
