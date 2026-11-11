# REL-PREP-02 — Isolated release-candidate consolidation

2026-11-11. LOCAL CANDIDATE ONLY. No commit, push, PR mutation, Git merge, deployment, version change or infrastructure mutation. Content freeze remains binding. Full public release is the owner strategy; completion later requires Production deployment, smoke/E2E, Git tag `v1.0.0` and public announcement. This task does not authorize those operations.

## Authoritative sources and isolation

- Isolated candidate: `/private/tmp/300w-rel-prep02-candidate` (separate shared-object clone; its own refs/index/working directory). Detached HEAD `4a5f7e313809ab6bcacb907b7e85fae97e5a87db`, the freshly verified remote Preview. No candidate commit exists.
- Reconciliation: `b3f7f49e24173da117a75bf96d656c5af41db10f`, branch `reconcile/performance-20261110`, `/private/tmp/300w-reconciliation-20261110`; six uncommitted REL-PREP-01 documentation paths explicitly included. This source tree is not modified.
- Fresh remote development: `c649ad4d08782e006831094e2f83cf7a446b0e9b`; main: `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`. Both match REL-PREP-01. Preview also unchanged.
- PR #11 remains OPEN, head `3aef8cde2db3b09f6b1088496952c0729ff79a22`, base Preview. Fresh read-only API inspection; no comment, closure or merge.
- Common ancestor Preview/reconciliation: `0d67d542cb8245826e1f0e7f5732f8582e7d419b`.
- Original development worktree remains at `6b0d7def3cb7d0397df36a0ec12da4957fab53c0`, with all unfinished local files retained. Initial snapshots: 1282 original and 1472 reconciliation file hashes, statuses, HEADs and indexes, in `/private/tmp/300w-rel-prep02-evidence/preservation.json`.

Initial sandbox `git ls-remote` failed DNS; the same read-only query succeeded with permitted network access. Necessary refs were fetched ONLY into the disposable clone under `refs/remotes/github/`, using the explicit GitHub HTTPS URL. No existing worktree refs/index/HEAD were updated. The clone's `origin` points at the original local repository: **do not use `git push origin` here**. Future publication must explicitly target GitHub after authorization. The clone uses an object alternate; preserve its source repository and avoid pruning/repack/destructive operations. This is a review environment, not an independent disaster-recovery backup.

## Consolidation method and conflicts

No history rewrite or Git merge was run. Per-file three-way inspection used common ancestor, Preview and reconciliation blobs. The reconciliation delta contains 255 paths; Preview changes seven. Only three documentation files overlap. All non-overlapping approved local changes were copied from their exact committed blobs, leaving Preview-only files untouched. No original dirty-tree patch was imported.

Three text conflicts were independently inspected: append-only documentary blocks, not application behavior/data. Both complete blocks were retained, Preview first:

| File | Retained Preview material | Retained reconciliation material |
|---|---|---|
| `docs/PROJECT_BOARD.md` | DEVOPS-04 and DEVOPS-04B implementation checkpoints | Performance/reconciliation/biography records |
| `docs/ath-ui01-data-ath02-review.md` | Original-artifact live smoke recovery | Link to preserved historical local evidence |
| `docs/devops03b2-preview-implementation-plan.md` | Readiness and actual-published-baseline implementation/evidence | Link to local historical evidence |

The six REL-PREP-01 freeze documentation files were then applied explicitly; Board edits merged without further conflict. Dated historical statuses remain historical, not activation instructions. No runtime/data conflict was found or resolved. No arbitrary ours/theirs selection. Exact intermediate conflict blocks and the deterministic incorporation script remain in the external evidence directory.

[File-level incorporation inventory](rel-prep02/incorporation.csv): 262 incorporated/retained paths with Preview blob, reconciliation blob, method and pre-report candidate hash. The final inventory separately includes these report/Board edits. This is not permission to stage every dirty file.

### Preview safeguards

All five Preview-specific commits are ancestors of candidate HEAD: `6532734`, `5673399`, `4ad30fc`, `c833ff6`, `4a5f7e3`. Four active files remain **byte-identical to current remote Preview**:

- `.github/workflows/preview-ci.yml`
- `scripts/deploy-preview-artifact.mjs`
- `scripts/smoke-preview-ci.mjs`
- `scripts/test-preview-pipeline.mjs`

This retains actual published SHA capture before upload, exact SHA/version and artifact checks, two consecutive readiness observations, finite timeout, stale-HEAD protection, rollback/account/Worker/config checks, Preview Environment activation gate and non-cancelling deployment concurrency. Tests use local fixtures only; no Cloudflare request/deployment was performed. Live activation/protection settings were not modified or freshly requalified by these fixtures.

### Frozen content, duplicates and exclusions

- All 1015 protected tracked paths under source/public/Worker/approved biography sources and package/lock/Wrangler configuration match reconciliation exactly. This includes the four Kristian achievements, names, identity data, results, photos, artwork and ranking formula. Compared with Preview, the only `src/data` additions/changes are the already-approved biography registry, wrapper and its catalog hook. Results and ranking formula have no delta.
- Both approved Høgenhaug corrections remain in Markdown and runtime ID35. Remote `c649ad4d` changes only the 2021 sentence already included locally; no extra biography mutation/cherry-pick needed. Its Git ancestry must be retained during later authorized history integration.
- PR #11's four complete biography files match candidate Git blobs byte-for-byte; no duplicate import. Its unique README is preserved byte-for-byte as [historical editorial evidence](rel-prep02/pr11-editorial-readme.md), not as a new import instruction or replacement 57-row mapping. Recommend separately authorized PR closure as superseded after publication evidence is recorded; retain branch/history. No PR mutation now.
- 57 unique stable-ID/text/paragraph mappings remain pinned by the REL-PREP-01 manifest. Preserve Daniel's documented source-date ambiguity; no new editorial changes.
- ATH-04 118 VERIFIED / 29 HOLD remain archived research, no runtime integration; future cutoff through season 2023 inclusive awaits editorial approval.
- Exclude original uncommitted Athlete Profile/manual-mode experiments, loose staging/artwork/cache files, private backups, credentials, `ranking.txt`, `sof.json`, `athlete-audit.txt`, generated outputs and new content. No full catalog regeneration. Version remains `0.0.0`.

## Verification

Current executed checks:

| Check | Result |
|---|---|
| Fresh remote refs and PR #11 GET | PASS; unchanged from REL-PREP-01 |
| Git fsck | PASS, exit 0; historical dangling objects retained, no corruption |
| 1015 protected file bytes / four Preview safeguard files / five Preview ancestor commits | PASS |
| ID35 corrections, 57 approved Markdown hashes and unique IDs, PR #11 four blob comparisons | PASS |
| `npm run check:release` | **18/18 PASS**, includes production TypeScript/Vite build, full ESLint, identity/localization/results audits and regression checks; zero known data issues |
| `node --test --test-concurrency=1 scripts/test-preview-pipeline.mjs scripts/test-approved-biographies.mjs scripts/test-approved-athlete-names.mjs scripts/test-athlete-display-policy.mjs scripts/test-current-athletes.mjs` | **88/88 PASS** (76 pipeline/readiness + 12 content/catalog); no skipped tests |
| `node --test --test-concurrency=1 scripts/test-rankings-route.mjs scripts/test-athlete-photos.mjs scripts/test-athlete-photo-review.mjs` | **26/26 PASS** (1 isolated Rankings canonical-rendering test + 25 portable photo tests) |
| YAML, workflow shell syntax, deploy/smoke JS syntax | PASS; installed Ruby parser, all 14 shell steps and Bash/Node only, no tooling installation |
| Seven Preview browser acceptance suites | **7/7 PASS**, first attempt, fresh Chrome process/profile per suite: official-rankings, rankings-controls, rankings-swipe, rankings-showcase, navigation, calendar, more |
| Additional Rankings startup and Athlete Results polish suites | **2/2 PASS**, fresh profiles, existing assertions |
| Approved biography browser suite | **57/57 mobile (390×844), 6/6 desktop (1440×900)**, exact paragraphs and no horizontal overflow |
| Full browser release gate (`node scripts/check-release.mjs --browser`, exact package-script implementation) | **11/14 PASS, 3 FAIL**, zero environment errors, 306.6s; failures: brand, ui-cleanup, image-delivery |

Local Node 24.19.0; existing dependency tree copied into candidate without installation or lockfile change. Builds run against uncommitted candidate bytes: generated metadata identifies base HEAD, NOT a committed release candidate. No artifact from this rehearsal is eligible for deployment. Later CI must build the actual approved committed SHA.

## Remaining risks and limits

- TECH-01 remains OPEN: known full-regeneration ID reassignment (Emmett Gross `10140 → 10141`). Full catalog regeneration was deliberately NOT run; a passing fast gate does not resolve it. The gate still prints historical country-conflict wording for the omitted test. No generated output was applied.
- Vite reports existing >500 kB minified chunks: sports entry 623.39 kB raw / 167.81 kB gzip; OfficialRankingsPage 906.29 kB raw / 159.00 kB gzip. These are build sizes, not measured network transfers or new LCP benchmarks. Prior accepted performance trade-offs and physical-device QA remain applicable.
- Athlete audit: 1167 profiles, zero issues/conflicts; 4592/4592 result rows linked. Missing-photo coverage is not an identity defect. No enrichment was attempted.
- Local macOS validation is not fresh GitHub/Linux CI, live Preview smoke, Production verification or owner visual approval. No Cloudflare availability/configuration claim follows from fixture tests. Fresh branch-protection GET returned HTTP 403 `Resource not accessible by integration`; remote SHAs/PR metadata were readable, but the complete current protection policy was not. No credential workaround or settings change was attempted. Revalidate policy and activation with authorized access before publication/promotion; this does not block local consolidation tests.
- Existing Preview/readiness code intentionally rejects unexpected application versions. A future 0.0.0→1.0.0 version change needs a separately reviewed readiness/version transition contract, not a hidden change during this task.
- Candidate is an uncommitted, reviewed tree. Commit lineage and immutable artifact identity must be established in the next authorized task; do not deploy this rehearsal build or infer release approval from test success.

## Confirmed verification blocker — no test changes made

The full browser gate failed `scripts/test-brand-browser.mjs:33`: `document.querySelector(".home-header h2").textContent` throws because the element does not exist. The assertion expects «ТРИАТЛОН — ЭТО МОЩНО!» in Home, contradicting approved HOME-UI-01 relocation to the regular About paragraph in More.

This test file is byte-identical to current Preview. Preview `src/App.tsx` already has no slogan heading; Preview `src/pages/MorePage.tsx:25` contains the approved paragraph and is byte-identical to candidate. Thus the confirmed assertion is incompatible with the existing approved baseline, not introduced by this consolidation. No separate historical browser rerun is claimed. Do not restore the Home slogan, suppress the check or treat this as PASS. All remaining scenarios ran once; no retries. Complete gate results: calendar, athlete-disclosure, athlete-search, ranking, navigation, more, news, dark-theme-text, code-splitting, accessibility and feedback-submission PASS; brand, ui-cleanup and image-delivery FAIL.

Additional confirmed failures:

- `scripts/test-ui-cleanup-browser.mjs:35`: viewport 320, `newsToNavigation = 42.15625`, expected 24±<1 px. The test, Home rendering and relevant layout sources are unchanged from Preview. Exact cause (test assumption, content/timing or real layout issue) is **not established**; do not call this obsolete or a harmless environment failure. Requires targeted baseline/candidate geometry investigation without changing design.
- `scripts/test-image-delivery-browser.mjs:28`: hardcoded carousel index 3 is absent. Read-only evaluation of the unchanged Home race-selection function on Moscow date **2026-11-11** yields only three showcase editions: `t100-dubai-2026`, `t100-saudi-arabia-2026`, `t100-qatar-2026`. The test fixes randomness but not the date and iterates `[3,0,2,1]`; this is a confirmed date-sensitive test assumption. Test and HomeShowcase component match Preview. Do not add races or change filtering to satisfy it. Later photo/geometry assertions in this failed suite were not executed; separate portable photo checks do not replace them.

[Complete full-gate output](rel-prep02/browser-gate.txt), [first-run suite results](rel-prep02/browser-first-runs.json), and exact [brand](rel-prep02/brand-failure.txt), [spacing](rel-prep02/ui-cleanup-failure.txt), [image](rel-prep02/image-delivery-failure.txt) failures are preserved. No failing assertions were edited or suppressed. Browser emulation used local production build with Chrome; the full gate has its existing per-suite tab setup within a fresh process, while the ten standalone suites each used a new process/profile. Shared-context effects cannot be excluded for the unresolved spacing failure without additional investigation.

Minimal proposed follow-up (requires separate approval): investigate spacing first; make image-delivery fixtures deterministic without losing image/geometry checks; correct only the stale brand test contract to verify Home wordmark/no replacement gap and slogan absence there, exact slogan paragraph in existing More About panel, preserving all unrelated brand/navigation/layout assertions; rerun the affected suite and full browser gate. Additional failures must be diagnosed before broadening any patch. No runtime/content change is proposed.

## REL-PREP-03 proposal — requires separate authorization and green verification

1. Resolve the recorded browser-test blocker under separate test-maintenance authorization, then review this candidate and all test results. Re-read remote heads/protection/activation and STOP on movement. Preserve original/reconciliation snapshots and this candidate.
2. Authorize creation of a named isolated integration branch from current Preview and **local history integration/commits**. The current candidate has no merge parents and must not be described as already containing the 11 reconciliation commits in its ancestry. Preserve those commits through an authorized non-fast-forward merge of `b3f7f49`, plus remote development `c649ad4d`; do not squash their provenance or overwrite remote history. Use the reviewed candidate bytes for the three documentary overlap resolutions; inspect any new conflict and stop. Include the six freeze documents and this report/evidence as an explicitly reviewed documentation change. Keep four Preview safeguard files exact. No source worktree switch/reset/stash.
3. Verify the final committed tree against this candidate, with any commit-metadata-only difference explained, and rerun affected checks. Confirm all three source histories are ancestors and no excluded files staged. Exact staging paths come from the final inventory; no `git add .`, `git add -A` or `git commit -a`.
4. Separately authorize normal publication of an isolated feature branch to GitHub and PR into `home-redesign-experiments` first. Do not push the original dirty checkout. Development-target PR does not automatically receive the current Preview-target CI; do not claim it does. Development merge needs explicit approval.
5. Separately authorize a Preview-target PR; require current **Portable verification and Browser verification PASS** on the exact head and inspect the complete diff. Do not automatically close #11 or merge Preview. Preview PR CI is non-deploying; **merge produces a push and may deploy when Environment activation is true**, including docs-only changes. No change to activation is implicit in publication approval.
6. Only explicit subsequent Preview promotion/deployment authorization permits merge. Use immutable CI artifact, existing safeguards/full smoke and all 57 profile text/paragraph/ID checks, plus owner physical-device visual QA. Production/version/tag/announcement are separate release operations; no automatic permission inferred from green tests.

The immediate next approval is for the **targeted investigation of the three browser-gate failures and justified test-only corrections, followed by verification**. Local integration branch/history commits are conditional on all required checks passing afterwards; neither publication nor deployment is authorized. No `git merge`/commit command was executed in REL-PREP-02. If a future integration conflicts or fails, preserve the disposable candidate and stop; no hard reset, force push, automatic rollback or source-data regeneration. Any remote recovery uses a separately reviewed normal corrective commit/PR, not rewritten history.


Proposed first REL-PREP-03 operations (NOT EXECUTED; revalidate SHAs first, run from isolated clone):

```sh
git worktree add -b release/v1.0.0-rc-reviewed /private/tmp/300w-rel-prep03-integration 4a5f7e313809ab6bcacb907b7e85fae97e5a87db
git -C /private/tmp/300w-rel-prep03-integration merge --no-ff --no-commit b3f7f49e24173da117a75bf96d656c5af41db10f
```

This new clean integration checkout avoids trying to merge into this dirty review candidate. The three expected documentation conflicts must be resolved to reviewed bytes; no automated conflict strategy. The later local commit, development ancestry merge and documentation inclusion require the owner's explicit REL-PREP-03 scope. Do not execute these commands merely because they appear in this report.


## Final disposition

**CONSOLIDATION CANDIDATE PREPARED / NOT READY FOR GIT PUBLICATION.** No unresolved application/data merge conflict; three independent historical documentation append conflicts resolved losslessly. Technical verification is blocked by the three full browser-gate failures above. Neither a fully verified candidate nor release approval is claimed.

Both source worktrees remain unchanged (HEAD/status/index and 1282 + 1472 file hashes). Candidate index is empty, detached HEAD still Preview `4a5f7e3`; all consolidation/report changes remain unstaged/uncommitted. No commit, push, PR mutation, merge, deployment, settings/credential/D1 operation, version change or regeneration occurred. PR #11 remains open. Current active Preview/Production were not changed or newly smoke-tested.

[Final file-level differences and hashes](rel-prep02/final-files.tsv) records all changed/added files plus the four explicitly retained safeguard files. The manifest excludes its own hash to avoid self-reference; `incorporation.csv` remains the pre-report provenance snapshot. External raw test/evidence directory: `/private/tmp/300w-rel-prep02-evidence/`. Generated build/cache/browser files are ignored and excluded from publication scope.

Recommended next task: **REL-PREP-02A — investigate and correct the three full browser-gate failures**, preserving runtime/content and all assertions unrelated to verified stale contracts. Do not proceed to REL-PREP-03 commits/publication until the owner reviews that result and authorizes the corresponding Git operations.
