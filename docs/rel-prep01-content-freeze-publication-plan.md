# REL-PREP-01 — Content freeze and Git publication preparation

Date: 2026-11-11. **Documentation-only preparation. STOP BEFORE GIT PUBLICATION.** No commit, push, PR creation/merge, deployment, version/infrastructure change or runtime/data edit is authorized in this task.

## Owner content freeze

TRI APP v1.0.0 content development is complete and frozen. Work now prioritizes consolidation, publication planning, verification, confirmed blocker resolution and release approval.

- All **57 owner-approved, locally integrated Russian biographies** are REQUIRED in the intended release candidate and in their respective Athlete Profiles. Reuse the existing integration, stable ID/name guard and paragraph renderer. Preserve both approved Høgenhaug title corrections. Do not recreate, summarize or rewrite these texts.
- Preserve approved athlete names, identities/mappings, results, official rankings, photos, artwork, race data, biographies and existing achievements.
- No new races, athletes, biographies, achievements or 2027 season data during preparation. A technical fix is not authorization to expand content.
- ATH-04 research and runtime integration are postponed until post-release. Existing **118 VERIFIED / 29 HOLD** are archived research, NOT an owner-approved runtime dataset. The research files, source evidence and historical decisions remain intact. Future ATH-04 editorial work uses a cutoff through **season 2023 inclusive**, subject to final editorial approval; this decision does not authorize filtering/editing the existing archive now.
- Preserve the four existing Kristian Blummenfelt runtime achievements unchanged.
- TECH-01 remains OPEN: **full catalog regeneration prohibited**. No generated output is imported. Version remains **0.0.0** until separately authorized release/version work.
- Inclusion in the intended RC does not mean published, physically reviewed or approved for Production. Preview publication and visual verification of all 57 bios belong to a separately authorized stage.

## Verified local baseline and preservation

The expected starting state was verified before edits:

- Worktree `/private/tmp/300w-reconciliation-20261110`.
- Branch `reconcile/performance-20261110`.
- HEAD `b3f7f49e24173da117a75bf96d656c5af41db10f`; initially clean, empty index.
- Original worktree `/Users/andrey.shubin/Projects/tri-app`: `home-redesign-experiments`, HEAD `6b0d7def3cb7d0397df36a0ec12da4957fab53c0`; **19 tracked modifications, 44 untracked files, empty index**. Do not use it as a publication checkout.
- A read-only snapshot of 1282 original tracked/untracked file hashes, status and index hash was recorded under `/private/tmp/300w-rel-prep01/`. Prior complete recovery copy remains `/Users/andrey.shubin/Projects/tri-app-reconciliation-20261110/original-repository`; do not publish this private backup or treat its existence as authorization to discard files.
- Main `23c5e52e8c0ccec1dea29cd94d6185568ec4543a` is an ancestor of the local RC (0/666 difference); it is not the current Production deployment pointer. No main integration is proposed here.

### RC implementation confirmed

- `91e31f78`: 57 biographies in curated `src/data/athletes/athleteBiographies.json`, applied by `biographies.ts` through canonical catalog; `AthleteDetailPage.tsx` preserves paragraph breaks for every athlete. No generated catalog rewrite.
- `b3f7f49`: exactly two owner-approved ID35 Høgenhaug European→World Triathlon world-title sentence corrections in editorial Markdown and runtime text, with corresponding integrity pins.
- `e38aab7`: approved Rankings lazy entry retained. Experimental Profile prefetch is absent.
- `4c69b73`: Rankings loading-shell width/CLS correction retained.
- `6fb4e74`: two compact transition image pairs (AVIF/WebP), existing wider/landscape assets and original source files preserved. Biography-loading split experiment is rejected and absent from runtime.
- Existing localized Athlete Profile/result polish, navigation, Rankings controls/gestures and dark-only design remain in the candidate. No name, result, standings, photo or ranking changes are introduced by this task.

[57-row preservation manifest](audits/rel-prep01-biography-preservation.tsv) pins every stable ID, canonical Latin name, approved Markdown SHA, exact integrated text SHA and paragraph count. The fixture digest is `cb6ea3ac2ba3513cc4a05f4161aa8476feb1df39470d51d640efb9767a0988af`. This manifest is an audit of existing content, not a new import source. Editorial #010 is not a second Menno assignment; #041 Caroline Pohle remains intentionally absent. Daniel's historical birth-date caveat remains unchanged.

## Fresh GitHub audit and publication blocker

Read-only GitHub API checks on 2026-11-11 returned:

| Ref | Remote SHA | Finding |
|---|---|---|
| development `home-redesign-experiments` | `c649ad4d08782e006831094e2f83cf7a446b0e9b` | Unprotected branch; do not force-push local divergent history |
| `preview` | `4a5f7e313809ab6bcacb907b7e85fae97e5a87db` | Protected; API reports required `Portable verification`, GitHub Actions app ID 15368 |
| `main` | `23c5e52e8c0ccec1dea29cd94d6185568ec4543a` | Unchanged release branch; no action proposed |
| PR #11 | `3aef8cde2db3b09f6b1088496952c0729ff79a22` | OPEN, `content/approved-athlete-bios-001` → `preview`; do not merge automatically |

Local remote-tracking refs are stale (`origin/home…` at `32eee711`, `origin/preview` at `3ab99c4`). No fetch/ref mutation was performed. Preview objects are not in the current local object database; local `git show/diff` against `4a5f7e3` therefore fails. GitHub compare supplied the read-only evidence instead. This is not evidence of Git corruption.

### Høgenhaug patch overlap: compatible, not a new content conflict

Remote `c649ad4d` is exactly one commit after `32eee71112a23589046ccf5a79a10ccf8932b675`, modifying only the 2021 paragraph in `docs/athlete-bios/approved/050-kristian-hogenhaug.md`. Its resulting sentence already exists in local RC. Local RC also corrects the introduction and integrated ID35 biography, as separately approved by the owner. Preserve both local corrections. Do not cherry-pick the same textual patch blindly, revert the introduction, or regenerate bios from the partially corrected remote file. Actual merge mechanics remain untested; conflict resolution is not authorized now.

### Important additional finding: Preview-only safeguards are absent locally

GitHub compare development→Preview is **diverged: 62 development-only / 5 Preview-only commits**, common ancestor `0d67d542cb8245826e1f0e7f5732f8582e7d419b`.

Preview-only commits:

1. `653273420e2aaff3c49725500a935701d4dfd286` — PR #8 merge.
2. `567339984811f93287cb93b4b072edef9b47e34d` — bounded exact-deployment readiness.
3. `4ad30fc96eeabe20c2d7e56310c10ba7dff36c78` — PR #9 merge.
4. `c833ff61df9e57d7259ae262e7536dacbcf01104` — capture actual published SHA before upload.
5. `4a5f7e313809ab6bcacb907b7e85fae97e5a87db` — PR #10 merge.

The local RC lacks `waitForPreviewHealth`, `capturePublishedBaseline`, `id: publication` and `steps.publication.outputs.previous_sha`. Its older deployment safeguards must not replace the newer published fixes. Prior reconciliation preserved the development snapshot, not all Preview-only implementation. Historical closeout documents do not prove those functions exist in current code.

Seven Preview-side changed paths requiring retention/review:

- `.github/workflows/preview-ci.yml`
- `scripts/deploy-preview-artifact.mjs`
- `scripts/smoke-preview-ci.mjs`
- `scripts/test-preview-pipeline.mjs`
- `docs/PROJECT_BOARD.md`
- `docs/ath-ui01-data-ath02-review.md`
- `docs/devops03b2-preview-implementation-plan.md`

**Publication preparation blocker:** consolidate these existing Preview safeguards into an isolated integration candidate before considering promotion. No runtime/data changes or conflict resolution were made here. Likely documentation overlaps require review; a conflict-free merge is not claimed. Passing the older local gate cannot qualify absent Preview-only readiness code.

### PR #11 disposition

Five files: approved biographies `002-marten-van-riel.md`, `003-hayden-wilde.md`, `004-mika-noodt.md`, `005-rico-bogen.md`, plus `docs/athlete-bios/approved/README.md`. The four biography bodies already exist in development/reconciliation; the README is an editorial index, not runtime integration. Fresh Git blob hashes match all four PR files byte-for-byte. Recommend owner-authorized closure as superseded after recording preservation in the comprehensive RC PR; inspect and retain any unique README history rather than silently dropping it. Keep the branch/evidence; do not delete it. Do not merge this partial content PR merely to clear it: a Preview merge can trigger deployment. Closing/commenting is a separate remote mutation, not done now. No need to import its four texts again.

## Exact unpublished local history and path scope

Eleven local commits above the last fetched development baseline `32eee711`:

| Commit | Scope |
|---|---|
| `4db85087a85b787bf5f8679210561ccf7a13804d` | Performance/image audit |
| `4c69b73cebc6d9977c533992c4c6bd478dc5aed9` | Rankings CLS fix |
| `e38aab71471f4c2de0af499ff12e32f857f6d0ea` | Rankings lazy entry |
| `4c632c63d21cc9c124b96e0fa11c47d134cf1b6c` | Rejected prefetch investigation |
| `00a0488aa9b7c5af0719fcf50a87d9d72f9b681c` | Approved prior reconciliation |
| `91e31f78c7a068d0138447aee528601768112352` | 57 biography integration |
| `92ad43414adc1792fc6048ac4f8509f5eca17967` | Final image/bundle audit |
| `c6b6fee409030a7ec47cada336ca4684ca954758` | ATH-04A research |
| `6fb4e74f61348ee63e9b2fdb24996ce73649d696` | Accepted compact artwork |
| `1dbc6f3266027fdfc58f6d1801adc331d9a20f17` | ATH-04B research |
| `b3f7f49e24173da117a75bf96d656c5af41db10f` | ATH-04C archive + approved bio correction |

[Exact 199-path delta and file hashes](audits/rel-prep01-publication-files.tsv) describes `32eee711..b3f7f49`, not a misleading comparison to stale local Preview. Keep historical research/documentation in Git, with freeze banners; none is wired into runtime. The final integration diff must additionally account for remote `c649ad4d`, the seven Preview-side paths above and the six documentation files from this task. Do not equate this existing-commit inventory with permission to stage 199 dirty files.

**Only prospective new documentation commit paths from REL-PREP-01:**

1. `docs/PROJECT_BOARD.md`
2. `docs/rel-prep01-content-freeze-publication-plan.md`
3. `docs/audits/rel-prep01-publication-files.tsv`
4. `docs/audits/rel-prep01-biography-preservation.tsv`
5. `docs/audits/athlete-biographies-batch1-integration.md`
6. `docs/athlete-achievements/v1-matrix.md`

**Exclude:** all original dirty-tree changes and untracked files unless independently reviewed; obsolete `preview-manual.yml`/manual-mode helpers/tests; rejected biography/prefetch runtime patches; generated `dist`, `.generated`, `.wrangler`, caches and browser profiles; loose artwork originals/manifests outside existing accepted commits; `ranking.txt`, `sof.json`, `athlete-audit.txt`; credentials/private backups; any new athlete/season/achievement/content expansion. Preserve all excluded files on disk. Existing tracked research artifacts stay historical evidence, not deploy authorization.

## Proposed publication sequence — NOT EXECUTED

### Gate A: owner-authorized local integration, no publication

First approve this plan and the exact six-file documentation commit. Before writes reverify branch, HEAD, index, file hashes and remote refs. Use a NEW isolated publication worktree; do not switch/reset/stash the original tree or overwrite the reconciliation worktree.

Proposed commands, only after separate authorization (replace `<freeze-doc-commit>` with the actually reviewed commit SHA):

```sh
# Read remote refs first; STOP if they differ materially from this report.
git ls-remote origin refs/heads/home-redesign-experiments refs/heads/preview refs/heads/main
# Fetch is a local Git write and belongs to the next authorized stage.
git fetch origin home-redesign-experiments preview
# Run from the shared repository; choose a new, unused path and branch.
git worktree add -b release/v1.0.0-prep /private/tmp/300w-release-v1-prep origin/home-redesign-experiments
```

In that new tree, first propose `git merge --no-ff --no-commit origin/preview`. Inspect the staged candidate; preserve the existing Preview workflow/readiness/deploy tests exactly. Review/document every conflict; do not choose ours/theirs wholesale. Only after authorized resolution/checks create the merge commit. Then propose `git merge --no-ff --no-commit <freeze-doc-commit>`; repeat full review and checks, preserving frozen app content and both Høgenhaug corrections. Any new semantic conflict: STOP for a specific owner decision. No catalog regeneration.

Expected history additions: the existing 11 RC commits, the six-file documentation commit, existing Preview ancestors, and reviewed integration merge commit(s). Do not squash/replay all content unnecessarily or create 57 new biography imports. The four original performance commits remain preserved in their replay history.

Acceptance of the merged tree: all 57 Markdown/body hashes and paragraph counts match this manifest; same 1167 IDs/names/localizations and 4592 results; ranking, photos and four Kristian strings unchanged; accepted lazy entry/CLS/artwork retained; newer Preview readiness/baseline and artifact checks preserved. Re-run build/lint/release gate, safe integrity/localization tests, relevant browser suites and the Preview pipeline safety/readiness tests on the actual merged tree. Tests from `b3f7f49` are not a substitute.

### Gate B: development publication, separately authorized

The first permanent branch to receive the consolidated RC should be **`home-redesign-experiments`**, via `release/v1.0.0-prep` and a normal reviewed PR; not main, not a qualification branch, not a direct Preview push.

```sh
# Only after owner publication approval and exact diff review:
git push -u origin release/v1.0.0-prep
```

Create PR with base `home-redesign-experiments`, head `release/v1.0.0-prep`; no auto-merge. Existing workflow only triggers PRs targeting Preview, so do NOT promise automatic Portable/Browser checks on this development PR. Require the actual local merged-candidate results, review workflow triggers afresh, and use the separately authorized Preview PR for mandatory remote qualification. Owner must explicitly approve development PR merge.

### Gate C: Preview PR/CI, no merge/deployment without approval

After development integration, create a separately authorized PR targeting protected `preview`. Review the base-to-head diff: complete frozen RC, no manual-mode/qualification triggers, no unrelated content. Required acceptance: **Portable verification PASS + Browser verification PASS (seven suites)** on the exact current PR candidate; preserve build artifact SHA/integrity and identity checks. API currently lists Portable alone as branch-required; deployment's `needs: [portable, browser]` is stronger than that branch rule. Do not bypass either check or silently alter protection.

PR CI cannot deploy under the current event guard; deployment requires push to `refs/heads/preview`, Environment `preview`, both CI jobs, and Environment activation true. **Merging that PR is a deployment-triggering operation when activation is true**, including a docs-only merge. No manual-mode workflow, temporary failure or activation workaround.

Recheck workflow triggers and activation before every future merge. If publication is authorized but deployment is not, STOP before Preview merge. Alternatively, disabling Environment activation requires its OWN explicit authorization and read-back verification; do not change it as part of Git preparation. Never rely on an old 'disabled' checkpoint. No repository-wide activation variable.

### Gate D: future Preview release/visual QA

Requires explicit owner merge + Preview deployment authorization. Use only the qualified pipeline/artifact and scoped Preview credentials. Record published SHA/deployment/version, full live smoke and before/after settings evidence. Verify all 57 profiles on published Preview, paragraphs and ID mapping, including ID35's two corrected sentences. Owner physical-device visual QA is separate from local browser emulation. Production/version/tag require later independent approval.

## Recovery and rollback

Before any Git publication, retain source refs, reviewed commit IDs, this manifest and original backup. If a local integration conflicts or checks fail, stop in the disposable integration worktree and retain evidence; leave original/reconciliation trees untouched. No hard reset, clean, forced push, history rewriting or arbitrary conflict resolution. Do not delete preserved worktrees without approval.

Before Preview merge there is no deployment to roll back. After a development publication, a correction/revert must be a separately reviewed normal commit/PR; do not rewind remote history. After a future Preview failure, record whether publication occurred, stop further promotions and request an authorized activation pause/recovery. Do not automatically retry or roll back. A known historical Preview baseline is SHA `4a5f7e3`, deployment `aa05f549-0789-4ba4-85b7-549be9708ce8`, version `9a8a950f-a7e7-4f78-97c9-d2f57ce38edf`; refresh live rollback availability before using it. Worker rollback is not a D1 rollback. Production and D1 are never fallback targets.

## Technical baseline results

Executed on unchanged application/data at `b3f7f49`, 2026-11-11. Logs remain `/private/tmp/300w-rel-prep01/`; generated build/browser outputs are excluded from publication.

| Check actually run | Result |
|---|---|
| `git fsck --full --no-reflogs` | PASS (exit 0); dangling historical objects reported, no corruption; nothing pruned |
| `npm run check:release`, first sandbox attempt | 16/18 PASS; two environment errors: Vite HMR could not bind `0.0.0.0:24678` (`EPERM`), not assertion failures |
| Same unchanged release gate with permitted local port binding | **18/18 PASS**, exit 0; includes production TypeScript/Vite build, full ESLint, catalog/search/localization, athlete/results audits, rankings/navigation and remaining gate checks |
| Explicit `node --test --test-concurrency=1 scripts/test-approved-biographies.mjs scripts/test-approved-athlete-names.mjs scripts/test-athlete-display-policy.mjs scripts/test-current-athletes.mjs` | **12/12 PASS**, no failures |
| `scripts/test-rankings-startup-browser.mjs` | PASS, mobile/desktop lazy-entry shell, profile/Back and failed-import recovery |
| `scripts/test-official-rankings-browser.mjs` | PASS, exact standings/links, season selection, history, layout |
| `scripts/test-rankings-swipe-browser.mjs` | PASS, gestures, orientation, current-document image requests |
| `scripts/test-navigation-browser.mjs` | PASS, destinations/history/scroll, direct race refresh |
| `scripts/test-athlete-results-polish-browser.mjs` | PASS, 390/440/667/844/956/1440, both preference emulations, results interactions |
| `scripts/test-approved-biographies-browser.mjs` | **57/57 mobile (390×844), 6/6 representative desktop (1440×900)**; exact rendered paragraphs, no horizontal overflow |
| Preservation manifests | 57 unique IDs, approved text/paragraph hashes; 199 committed-file hashes pinned to `b3f7f49`, not modified documentation bytes |
| Original worktree preservation | All 1282 tracked/untracked hashes, complete short status and index SHA unchanged |
| `git diff --check` | PASS |

Browser suites ran once each against the production build on local Vite Preview, with a separate fresh Chrome profile/process per suite. All six exited 0; no silent retries. This is local browser emulation, not fresh Linux CI, live Preview or physical-device QA. Full `check:release:browser` and unrelated browser suites were not repeated. Full photo archival/tooling suites were not rerun. No full catalog regeneration command was run.

**Known limitations remain:** TECH-01 is OPEN; previously verified temporary-regeneration ID drift includes Emmett Gross `10140 → 10141` (and earlier Emmanuel Lejeune drift). The gate's historical non-gating text still refers to country conflicts; it must not be interpreted as a fresh regeneration result. A passing 18/18 fast gate does not resolve TECH-01 or authorize regeneration. Vite still reports large-chunk warnings; no new performance claim or benchmark is made here. Research validation/content was not rerun or edited beyond the archive banner.

## Outcome and next authorization

**Preparation complete / awaiting owner review; Git publication remains blocked on preserving the Preview-only readiness safeguards in a new isolated candidate.** No semantic resolution, Git publication or deployment was attempted. No new local test assertion failure was observed. HEAD remains `b3f7f49`, index empty; only the six listed documentation files are modified/untracked. Runtime, curated/generated data, tests, artwork, version, original worktree and all 57 source biographies are unchanged by REL-PREP-01.

Recommended next task: **REL-PREP-02 — isolated release-candidate Git consolidation, initially local-only**. Authorize the reviewed documentation commit and isolated combination of remote development, remote Preview safeguards and these 11 local commits. Stop on semantic conflicts; require the exact merged-tree identity/biography/performance-contract and CI-safety checks. Only after that result is reviewed should separate development publication, PR #11 closure, Preview promotion/deployment and owner visual QA be authorized. No release approval, Production promotion or new content is implied.

