# DEVOPS-03B.2A — Preview CI integration preparation

2026-10-27 · **Prepared / Awaiting Owner Review**. Local configuration/documentation only; no branch, PR, settings, secrets or deployment changes.

## Baseline and scope

Primary branch `home-redesign-experiments`, HEAD `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`, empty index. Tracking shows ahead 2 / behind 0. Fresh read-only remote query confirms development at `f99c7775b92143eb847d470dd93ff4c3580c5224`, main at `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`, qualification at `53a1fafb604cb86cee740acc5b6899c677c34640`; `preview` is absent. GitHub repository metadata reports **public**, owner type **User**, default branch **main**. Account plan and available settings UI were not verified; no Cloudflare inspection was needed.

[Linux qualification](https://github.com/shyandrey/tri-app/actions/runs/40403415627) is owner-approved/closed: Ubuntu 24.04.5, Node 24.19.0, npm 11.17.0, Python 3.12.3, SQLite 3.45.1. That run validates its exact commit, not every current local change. See [qualification history](devops03b1-ci-portability.md) and [security audit](devops03-preview-cicd-audit.md).

Preserved uncommitted groups: QA-03B tests/fixture/release diagnostics; HOME-UI-01B slogan relocation; unfinished Athlete Profile CSS/component and local browser test; accumulated Board/reports; original artwork/manifests and four known local artifacts. Qualification excluded Home/Profile changes. Approval of qualification does not authorize wholesale merging that branch or all dirty files. No sport/data/artwork/runtime/test-runner changes in this task.

## Permanent CI candidate

[`.github/workflows/preview-ci.yml`](../.github/workflows/preview-ci.yml) now takes the **qualified** step sequence with only these event/guard changes:

```yaml
on:
  pull_request:
    branches: [preview]
  push:
    branches: [preview]
  workflow_dispatch:
```

Job guard: `github.event_name == 'pull_request' || github.ref == 'refs/heads/preview'`. Manual runs on other branches/tags are intentionally skipped, not accepted as preview qualification. No path filters that could omit the required check. Temporary qualification branch trigger/guard is removed. No concurrency cancellation or retries are added.

The previously stale primary candidate also receives the approved early report-directory initialization using `$RUNNER_TEMP`/`$GITHUB_ENV`; `runner.temp` remains only in the artifact step's valid context. All qualified steps are structurally identical: full-history exact-event-SHA checkout, no persisted Git credentials, Node 24.19.0, toolchain/Git-object check, `npm ci`, [portable runner](../scripts/check-ci-portable.mjs), unchanged build/lint/release gate, summaries and failure-only diagnostics with seven-day retention. Permissions remain `contents: read`, no secrets/environment/OIDC/deploy access. No Wrangler command is present.

PR checks use GitHub's event SHA (the proposed merge result), while push checks test the actual merged `preview` SHA. They are different evidence: after merge, require the push run for the exact resulting commit before any future publication. Manual dispatch needs the workflow on the default branch, which is still `main`; optional dispatch bootstrap needs separate authorization. PR/push integration does not require merging into main during this task. [GitHub event semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

**Modified workflow has not been executed on Linux.** Existing Linux PASS applies only to `53a1faf...`. Future DEVOPS-03B.2B must test PR and push events, merge SHA selection, manual guard and a deliberate controlled failure to qualify artifact uploads. No new Actions run was started here.

## Proposed protection settings — not applied

Target exact branch name `preview`; do not use a pattern matching main or development. Prefer one effective classic protection rule, avoiding overlapping rules; a ruleset is acceptable only after verifying equivalent support. GitHub documents protection for public Free repositories, but actor-specific push restrictions are organization features. This personal repository must not rely on that unavailable organization control. [Protected branch capabilities](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

| Setting | Exact proposed value / verification |
| --- | --- |
| Require a pull request before merging | ON |
| Required approvals | 1, with owner/code-owner approval for all promotions; see author limitation below |
| Dismiss stale approvals on new commits | ON |
| Require code-owner review | ON after owner-approved CODEOWNERS exists; proposed `* @shyandrey` in the base branch |
| Require approval of most recent reviewable push | ON; reviewer must be someone other than the pusher |
| Require conversation resolution | ON |
| Require status checks | ON; select actual **Portable verification** check from GitHub Actions, displayed under **Preview CI**; verify source app and unique job name before saving |
| Branch must be up to date before merging | ON; re-evaluate CI and approvals after base changes |
| Do not allow bypassing rules / enforce for admins | ON; no bypass actors/apps; no direct-push exception |
| Allow force pushes / allow deletions | OFF / OFF |
| Restrict who can push | Only if the actual repository/plan supports it; not assumed for this personal repo. PR + checks + admin enforcement remain required |
| Merge queue | OFF initially: no `merge_group` trigger in this candidate |
| Require deployments before merging | OFF: this phase is CI-only, otherwise bootstrap would deadlock |
| Require signed commits / linear history | No new requirement in this proposal; separate owner decision, not silently imposed |

Select the check after a run on the real integration PR; do not assume the concatenated workflow/job label is the REST context string. Inspect the emitted check name and bind its source to GitHub Actions where supported. No status-check name collision across workflows is allowed. Failed/missing checks must block merge; never accept a manually dispatched run on another SHA. Administrators can still edit protection settings, so no claim of tamper-proof policy against a repository owner is made.

**Owner approval blocker:** GitHub does not allow an author to approve their own PR. With owner-only CODEOWNERS, a PR authored by `shyandrey` cannot satisfy that approval requirement. The strict policy therefore needs a separate authorized collaborator/app to author promotion PRs and the owner to review/approve them. Do not solve this by bypassing checks. If solo-owner operation is required, owner must approve an explicit alternative reviewer/approval model before integration; an informal comment is not equivalent to enforced approving review. [Review rules](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/approving-a-pull-request-with-required-reviews).

Settings acceptance in DEVOPS-03B.2B: confirm exact available options/plan; verify a failed test, stale approval, missing check and direct/force push are rejected using a separately authorized safe test procedure. Do not create remote mutations to test this during preparation. If required enforcement cannot be achieved, retain BLOCKED status rather than weakening the proposal.

## Promotion and bootstrap

Intended steady-state path: **reviewed committed development state → PR into preview → merge-candidate CI + owner approval → merge → CI on actual preview SHA**. There is no deployment in this path yet.

1. Inventory approved commits and hunks against the selected preview baseline. Commit/push only explicitly authorized files in a future task. Uncommitted changes never enter a GitHub checkout, but committing a mixed file would include them: review full diff, exclude unfinished Athlete Profile code/CSS/test and local artwork originals. QA-03B fixture and portable test dependencies must arrive together with the runner/workflow. Qualification branch is evidence, not the source of all desired features.
2. Owner chooses initial preview baseline SHA and PR-author/reviewer arrangement. Under separate authorization, establish protection for the future name where supported and create the branch at that exact trusted baseline. Bootstrap without protection gaps must be reviewed against actual available controls; do not grant a permanent bypass merely to create the branch.
3. Bring the reviewed CI and application commits through a PR from `home-redesign-experiments` once that branch contains only approved promotable commits. If it contains unfinished **committed** work, do not merge the whole branch: prepare a separately authorized integration branch from the preview base with only approved commits, resolve/review dependencies, then PR it. No cherry-pick/branch creation is performed here.
4. Review the complete merge diff, not only task labels. PR CI tests the merge candidate; owner approves the current revision. Failed checks block promotion. A merge commit is the proposed default so development history remains explicit; any selected merge strategy still requires post-merge CI on the resulting SHA. No force push or history rewrite.
5. Keep preview publication disabled after CI integration. In DEVOPS-03B.2C, record eventual verified package's full Git SHA, workflow/run ID, manifest digest, owner approval, Worker version ID/deployment ID and both endpoint SHA checks. A PR-head SHA or old qualification SHA must not be mislabeled as deployed SHA.

## Browser CI qualification — Pending, separate gate

Portable CI is mandatory once integrated; browser qualification is not yet a mandatory check and is not included in its PASS. No browser assertions are changed. [Existing qualification plan](devops03b1-ci-portability.md#browser-reliability-qualification-for-devops-03b2) remains applicable.

Proposed separate secret-free Ubuntu qualification job, not added to this workflow:

- Inventory preinstalled Chromium/Chrome on the actual Ubuntu image; prefer a fixed reviewed Chrome for Testing version/download checksum if the preinstalled version floats. Pin/record browser binary, OS image and architecture. Determine shared-library dependencies from that binary; install only reviewed Ubuntu dependencies in the ephemeral runner after authorization. No assumption that Chrome availability equals tested WebKit/Safari coverage.
- Headless Chromium with loopback CDP, non-root/sandbox enabled; no X server for headless mode. Serve exact built `dist` via local Vite preview with strict port. Use bounded HTTP/CDP readiness, not a fixed startup sleep. Record source SHA, viewport, DPR, browser version and console/network errors.
- **Fresh browser process and user-data-dir for each suite**; only one target page. Existing scripts select the first CDP page, so another tab in a reused process is insufficient. Stop only the job's own processes. Explicitly retain cold/warm-cache distinctions inside network scenarios.
- First qualify Calendar/code-splitting and NAV-03/history/navigation, then official Rankings, controls/picker, interactive swipe and showcase/image delivery. Check 390×844, 440×956, 844×390, 956×440 plus 320px overflow where required. Preserve exact season/row assertions and deterministic clocks.
- Keep QA-04B document-scoped request accounting, transfer/cache distinction, no inactive-orientation downloads, no duplicate transfers and adjacent artwork availability. Touch/mouse drag suppression, rollback/snap and vertical scroll must remain tested.
- Save first-run logs, screenshot/trace and public network metadata to a dedicated artifact directory, exclude profiles/cookies/auth headers. Set explicit retention (proposal seven days for failure, summary/digests for successful run); qualify upload by a controlled negative scenario. No retry-until-green or relabeling a clean-context rerun as first-run PASS.

Known shared-browser Navigation instability remains a risk until fresh-process trials establish reliability. Only then propose a stable uniquely named browser check as mandatory. Physical iPhone Safari/Telegram remains separate owner QA. No browser installation/run is authorized by this document alone.

## Deployment architecture for DEVOPS-03B.2C — Planned

| Invariant | Preview | Production (must not change) |
| --- | --- | --- |
| Worker | `tri-app-preview` | `tri-app` |
| D1 | `4dfe9210-0cc7-484f-8eea-fe5216f5c17a` | `2b5cd1b9-d9bf-483d-b710-23d00b6db7fd` |
| Source policy | Verified resulting `preview` SHA only | No deployment path in this pipeline |

These are local config/owner-approved identifiers, not fresh assertions of live infrastructure state. Separate CI/build and deploy trust boundaries. Never deploy a PR artifact or arbitrary user-supplied ref/Worker/config. Build and test the actual merged SHA without credentials, produce a manifest for Worker bundle, static assets, fixed Preview config and toolchain/lockfile digests. Validate all referenced assets and reject unused originals/evidence/credential files. Bind package digest to successful run and exact SHA; verify it again after download in the separately protected deployment job. Recheck preview HEAD to avoid publishing an obsolete queued build.

Current Wrangler config has `build.command: npm run build`; blindly calling the existing deploy script would rebuild rather than necessarily publish the tested artifact. DEVOPS-03B.2C must prepare/review an artifact-only deployment invocation/config using the locked Wrangler version and prebundled Worker/static assets, with no build/install or mutable source execution in the credential-bearing job. This is future implementation, not an existing guarantee. Preserve all ordinary bindings/secrets/cron and do not run migration commands.

### Cloudflare permission decision

Owner must verify **Editor scoped only to existing `tri-app-preview`** for the future deployment token. Legacy **Workers Scripts Edit** is product-wide, not equivalent isolation. No Worker Admin, product-wide Editor, D1 direct access, KV/R2 writes, token-management or Production permissions by default. Binding a database does not require separate D1 API permissions. Route/domain modification needs Workers Routes Write and is out of scope; current per-Worker Custom Domain limitations require explicit compatibility verification. Do not broaden access to bypass a failed deployment. [Cloudflare Workers roles/scopes](https://developers.cloudflare.com/workers/authorization/workers/).

Verify the exact credential type supported by the account/locked Wrangler, account identity, existing Preview resource selection and static-assets upload/version/deployment operations. Account-owned token is the proposed granular mechanism; do not copy Wrangler OAuth or runtime secrets. If narrow permissions cannot deploy while preserving existing custom-domain association, STOP for owner decision (including a separately authorized isolated-account alternative), not a silent account-wide token.

No D1 API permission does **not** prevent deployed Worker code using its DB binding. Independently enforce the fixed Preview DB/config allowlist and review Worker code; reject any Production resource reference. Deploy credentials must never reach PR/build steps. A protected Preview deployment environment with branch restriction and owner approval is proposed for initial rollout, subject to plan support; no environment/secrets are configured now. Keep native Workers Builds disconnected to avoid duplicate deployment channels.

Before authorized publish, compare live Preview and Production versions/settings/bindings using separately approved read-only access; verify Preview queue state without giving the deployment token query permissions. After publish, compare exact SHA/version at both Preview health hostnames, public News/Feedback config, asset digests and unchanged Production baseline. Existing `check:preview` does **not** enforce an expected SHA argument; implement explicit equality checks before enabling automation. Never send production Telegram/Feedback messages as smoke tests.

Retain the previously successful package digest and Cloudflare version/deployment IDs. Rollback is owner-authorized Preview-only restoration, not an automatic retry and not a D1 data rollback. No migrations or Production D1 writes; compatibility checks must precede either deployment or rollback.

## Owner decisions and next stages

1. **DEVOPS-03B.2B — Branch & CI Integration / Planned:** approve exact workflow, initial preview baseline, reviewer/author model and available protection settings; authorize commit/push, branch/protection/PR setup separately. Requalify permanent PR/push events and diagnostics; decide optional default-branch dispatch bootstrap. No deployment.
2. **Browser CI qualification — Pending:** approve isolated browser/toolchain qualification and first-failure policy; only later make it mandatory.
3. **DEVOPS-03B.2C — Cloudflare Preview Auto Deploy / Planned:** approve immutable-package implementation, granular permission/custom-domain feasibility, protected deploy environment, preflight/read-only access, retention and supervised first Preview deployment. Production remains manual and outside scope.
4. DEVOPS-02 (mobile cloud development) and OPS-04 (post-release mobile data operations) remain independent tasks; no implied approval through this CI plan.

## Verification and files

Local YAML syntax, expression-context/trigger/guard checks, shell syntax, structural equality of every qualified job step, documentation links and `git diff --check` PASS. `actionlint` unavailable; no install. No build/full test rerun: runtime, runner, commands and dependencies are unchanged, and new event/guard behavior needs GitHub qualification rather than another macOS build. No new Linux PASS claimed.

Modified scope: `.github/workflows/preview-ci.yml`, `docs/devops03b1-ci-portability.md`, this new report, `docs/PROJECT_BOARD.md`. Existing modified/untracked files preserved; primary index remains empty. No remote write, branch/PR creation, deployment, settings/secrets/token/version/D1/runtime/data/artwork changes.

## DEVOPS-03B.2B.1 — Approved baseline and isolated qualification (2026-10-27)

This section supersedes the preparation-only execution status above. Owner authorized three local thematic commits and one isolated qualification push; no permanent `preview` branch, deployment or settings changes.

### Approved baseline and exact commit scope

Primary branch: `home-redesign-experiments`. Starting HEAD: `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`. Proposed clean Preview baseline: **`82a4a6b7293c901ab8d89c06948e9736e8777c46`**. Use the committed tree, not the dirty development directory. Shared Project Board updates were separated by task using reviewed index blobs; unrelated DEVOPS-02/OPS-04 backlog text remains unstaged.

**`ff2c980671577da8455c3939ee2ded4fd0b0f4e6` — style(home): relocate slogan to about section**

- `docs/PROJECT_BOARD.md`
- `docs/home-ui-01-slogan-review.md`
- `src/App.tsx`
- `src/pages/MorePage.tsx`

**`267fecbbb4c1ebf141a2a217c1de4070a3d3b430` — test(photos): modernize approved photo contracts**

- `docs/PROJECT_BOARD.md`
- `docs/qa03-historical-photo-tests.md`
- `scripts/fixtures/athlete-photo-catalog-approved.json`
- `scripts/release-policy.mjs`
- `scripts/test-athlete-photo-archive.mjs`
- `scripts/test-athlete-photos.mjs`

**`82a4a6b7293c901ab8d89c06948e9736e8777c46` — ci(preview): prepare protected-branch verification**

- `.github/workflows/preview-ci.yml`
- `docs/PROJECT_BOARD.md`
- `docs/devops03-preview-cicd-audit.md`
- `docs/devops03b1-ci-portability.md`
- `docs/devops03b2-preview-implementation-plan.md`
- `scripts/check-ci-portable.mjs`

Each exact staged candidate was exported to an isolated copy before testing. A: release gate 18/18 PASS (including production build/lint/navigation). B: photo contracts/native synthetic tests 38/38 PASS; release gate 18/18 PASS. C: portable runner PASS — metadata, portable photos 25/25, PTO 44/44, official standings 20/20, release gate 18/18 including production build/lint. Staged scope/whitespace checks and sanitized secret scan passed before each commit. The staging-dependent archive group was not rerun; no claim of full 41-test photo execution in this task.

### One isolated qualification push

- Branch: `ci/preview-integration-qualification`.
- Qualification SHA: `33f2acff88d6055b85df80b00670e0140ad1fd44`, parent is proposed baseline above.
- [GitHub Actions run 40483823503](https://github.com/shyandrey/tri-app/actions/runs/40483823503), attempt 1. No rerun or additional push.
- Only qualification additions: `.github/workflows/integration-qualification.yml` and `scripts/ci-qualification/browser.mjs`. These files are absent from the development baseline.
- Branch-only push trigger, `contents: read`, no deployment steps, Cloudflare credentials or repository secret references. Portable job step sequence matches the permanent candidate; target guard is restricted to the qualification branch.
- Browser harness uses preinstalled headless Chrome with sandbox enabled, loopback Vite/CDP, fresh process/profile per suite, bounded readiness and 300-second per-suite timeout. Existing assertions are unchanged; every suite runs once, independent failures are preserved. Browser profiles/cookies are not uploaded.
- YAML/shell/context checks and harness syntax/lint passed locally. `actionlint` was unavailable and was not installed.

Permanent PR-to-preview, push-to-preview and manual-preview triggers are statically checked, **not live-event qualified**. Creating the prohibited branch was not used as a workaround. Safe alternative executed here: identical portable steps behind the isolated branch-only trigger. Real-event acceptance remains necessary after separate authorization for permanent branch/protection setup; manual dispatch also requires default-branch workflow registration.

### Linux portable and controlled failure results

**Portable verification: PASS**, first run, Ubuntu 24.04.5 / runner image `20261012.334.1`, Node `v24.19.0`, npm `11.17.0`, Python `3.12.3`, Python SQLite `3.45.1`. Exact checkout and historical migration availability passed; `npm ci` passed. Runner log records metadata, portable photos, PTO identity/registry, official standings and unchanged release gate all PASS. Release gate executes production build and lint. Successful inner TAP logs are not uploaded by the failure-only policy; suite counts above are the separately retained local staged-candidate results.

**Controlled failure diagnostics: PASS.** Dedicated isolated job exited 1 intentionally, then the pinned upload step succeeded. Downloaded artifact `controlled-failure-40483823503` (ID `12724530510`, 360 bytes) contains exactly:

- `controlled.log`: explicit intentional failure message, SHA-256 `accd8f7b81a837e1fcfd1c3bf9cb2907cef238d422659315b1c4471404666d3f`.
- `summary.json`: `{"intentional":true,"expectedExit":1}`, SHA-256 `bd9afde7ebaca8bff1065b042c706f037ffb1deb550fba4669128182a9452d92`.

Content was inspected: no secrets, profiles, credentials or application data. API creation `2026-10-27T09:50:23Z`, expiration `2026-11-03T09:50:22Z` confirms configured seven-day retention, within one-second server timing. Future deletion was not observed. This deliberately failed job makes the overall run red by design; it must not be mistaken for a failed portable gate. Browser outcome is assessed independently below.

Warnings: known sports chunk size exception remains. GitHub additionally warns that pinned checkout/setup-node actions target deprecated Node 20 and are forced onto Node 24; steps succeeded. Review action-runtime migration separately, without silently changing pinned actions in this task.

### Browser first-run results and diagnosis

Chrome **155.0.8059.39**, Ubuntu headless, seven fresh processes/profiles, no retries. Browser build PASS; browser job **FAIL**. All seven suites executed.

| Suite | Result | Evidence |
| --- | --- | --- |
| Official Rankings | FAIL | Eight viewport/theme combinations passed; at 844px desktop `test-official-rankings-browser.mjs:90`, document scrollWidth 829, expected emulated width 844. |
| Rankings controls / Season Picker | PASS | All 14 viewport/theme combinations. |
| Rankings swipe / network | PASS | Negative network fixtures, all 14 gesture combinations, reduced motion/boundary/orientation, exactly two current-scene sources and no duplicates. |
| Rankings showcase | FAIL | 16 WebP byte/hash checks and all eight scenes across 14 mobile viewport/theme combinations passed; desktop snap timeout at `test-rankings-showcase-browser.mjs:191`: series T100, scrollLeft 1425, expected 1440. |
| Navigation | PASS | List/filter/year state, nested Back, browser history, Calendar/Home restoration, direct race/refresh, stale route and results sorting. |
| Calendar | PASS | 320/390/844/1440px: filters, archives, search/empty, deterministic order, Back/scroll and overflow. |
| More | FAIL | 320/390/430px passed; desktop 768px at `test-more-browser.mjs:36`: document scrollWidth 753, expected viewport 768. Later scenarios did not execute. |

Verified test-contract issue: the failing assertions compare layout width/track offset with the configured viewport width. Application `RankingsSwipeTrack.tsx:15` instead uses actual track `clientWidth + gap`, as appropriate for its layout. All three discrepancies are exactly **15px**, only after desktop emulation is selected; evidence strongly indicates Linux classic scrollbar space, unlike macOS overlay scrollbars. Successful T100 state transition is recorded in the timeout. This is not evidence of an incorrect ranking or failed series selection. The exact `clientWidth`/scrollbar measurements were not emitted by these failed assertions, so scrollbar attribution remains a well-supported diagnosis, not a separately measured runtime fact. No runtime fix or passing rerun is claimed.

Proposed minimal separately approved correction: in the three named browser test files, measure layout viewport `document.documentElement.clientWidth` for no-overflow assertions and actual track/panel width for snap and coverage assertions. Log `innerWidth`, root client/scroll widths, track width and scrollLeft. Preserve exact data/state/asset assertions and bounded waits; do not hide scrollbars, disable checks or add retries merely to pass. Qualify once again after owner authorization. No test/runtime changes were made here.

Browser artifact `browser-first-run-40483823503`, ID `12724891030`, 52,755,293 bytes, uploaded successfully with seven-day retention. Full download hit local 30s and 180s transfer timeouts; small diagnostic entries were successfully downloaded via HTTP byte ranges without rerunning CI. ZIP index, all seven test/browser logs, Chrome version and summary are retained under `/tmp/300w-devops03b2b1/browser-evidence/`; GitHub retains screenshots. Complete run logs downloaded as `/tmp/300w-devops03b2b1/run-logs.zip`. Do not mislabel the partial local archive extraction as a full offline screenshot backup. The harness copied named Calendar screenshots into the subsequent More directory too; those are Calendar evidence, not More screenshots. Narrow artifact copying in a future harness revision. No browser profiles or credentials were included.

### Final state, blockers and recommendation

- **Local consolidation complete; portable Linux gate and controlled failure diagnostics qualified. Browser gate not qualified (4/7 suites PASS).** Overall run is FAILURE for both the expected controlled error and three unexpected browser-suite failures. No second qualification push/run.
- Recommend the proposed baseline SHA for owner review, but defer permanent Preview branch setup until owner resolves browser test portability, PR author/reviewer model and protection policy. Portable verification should be mandatory. Do not enable the currently failing browser aggregate as a reliable mandatory check or silently mark it non-blocking; retain a promotion blocker pending explicit owner decision and corrected qualification. Physical iPhone/WebKit QA remains separate.
- Real Preview PR/push/manual event paths still require separately authorized acceptance checks; no permanent branch created. No deployment, Cloudflare/secret/D1/settings/version changes.
- Fresh remote query: development remains `f99c7775b92143eb847d470dd93ff4c3580c5224`, main remains `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`; no `preview` ref. Only isolated qualification branch was pushed. Primary branch is five commits ahead of its unchanged remote (two pre-existing plus three new).
- Primary index empty; qualification worktree clean. These final report/Board updates remain uncommitted. Existing Board DEVOPS-02/OPS-04 additions, `src/athlete-detail.css`, `src/pages/AthleteDetailPage.tsx`, Profile browser test, audit artifacts, original artwork/manifests and other untracked files are preserved. SHA-256 comparison against the 1,245-file starting inventory permits only the two requested final documentation updates; no original files deleted.
- Final local documentation file-link checks and `git diff --check`: PASS. No additional commits or pushes after qualification. **STOP for owner review.**

## QA-05 — Linux geometry investigation (2026-10-27)

[QA-05 report](qa05-linux-browser-geometry.md) supersedes the earlier provisional scrollbar diagnosis: measured Linux content widths `829/1425/753` expand to configured `844/1440/768` when the scrollbar is temporarily hidden and return on restoration. T100 track/snap follows `1425 → 1440 → 1425`; no root overflow. macOS reserves zero width and all three unchanged suites PASS.

Qualification commit `a4ae3681c81a10b2f6659a1cbb356de76eb2c5f0`, [run 40486902378](https://github.com/shyandrey/tri-app/actions/runs/40486902378): geometry/portable PASS; four original browser suites PASS, the same three FAIL. Assertions remain unchanged. First-run failure triggers the owner's STOP rule; test-only geometry correction is proposed, not applied. Browser qualification remains incomplete and permanent Preview creation remains deferred pending owner review. Primary baseline unchanged; diagnostic commit exists only on qualification branch (plus disclosed local qualification ref). No deployment.

## QA-05B — Geometry test correction / incomplete qualification

[QA-05B results](qa05-linux-browser-geometry.md#qa-05b-linux-first-run-outcome--incomplete-qualification): four test-only files in isolated commit `674007db6450e4c8c3999fbcd1cf8b1471a581b4`, [run 40496089575](https://github.com/shyandrey/tri-app/actions/runs/40496089575), one push/attempt. Local seven suites, build/lint/release gate and negative fixtures PASS. Linux portable PASS; browser **6/7 PASS**, Official Rankings FAIL at remaining `hero.width === innerWidth` assertion (line 190). Showcase and More now PASS. This missed second assumption requires a minimal follow-up, proposed but not applied after first-run failure. Browser qualification remains incomplete; permanent Preview creation deferred. No development push, runtime changes or deployment.

## DEVOPS-03B.2B.2 — Approved baseline consolidation

Owner authorized consolidation of QA-05B/QA-05B.1 and conditional development/Preview pushes. Starting development HEAD: `82a4a6b7293c901ab8d89c06948e9736e8777c46`, branch `home-redesign-experiments`, empty index. Five existing outgoing commits contain approved DS-01, QA-04B, HOME-UI-01B, QA-03B and CI preparation.

Exact new consolidation scope:

- `scripts/test-official-rankings-browser.mjs`
- `scripts/test-rankings-showcase-browser.mjs`
- `scripts/test-more-browser.mjs`
- `scripts/browser-geometry-contract.mjs`
- `docs/qa05-linux-browser-geometry.md`
- This implementation plan.
- QA-05/DEVOPS-03 status hunks in `docs/PROJECT_BOARD.md`; unrelated DEVOPS-02/OPS-04 backlog additions remain unstaged.

The four test files match the final qualified Linux candidate byte-for-byte. The permanent workflow is unchanged and CI-only; the qualification-only controlled-failure job and harness are absent. Its permanent job runs portable verification, not the seven-suite browser qualification harness. Live PR/manual Preview event paths and branch protection still require their separate acceptance/setup steps.

### Current verification and remote safety

Fresh read-only remote query: development `f99c7775b92143eb847d470dd93ff4c3580c5224`, main `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`, qualification `fdd7918268326d6eeacef407951c8f1f9d69610a`; no `preview` ref. GitHub API: hooks 0, environments 0, deployments 0; two known qualification workflow records, no newly observed deployment run.

Cloudflare read-only `GET /client/v4/accounts` with existing Wrangler OAuth returned **HTTP 403**. The response does not establish current Workers Builds connection state; no permission name is inferred from the HTTP status alone. No credentials were changed. Current Dashboard confirmation was requested from the owner. Until deployment safety is established, **remote writes and permanent Preview creation are BLOCKED** under section 7 of the task. Historical owner confirmation is retained as historical evidence, not relabeled as a fresh API verification.

Isolated current baseline: portable photos 25/25, PTO 44/44, standings 20/20, build/lint and release gate 18/18 PASS. Known sports chunk warning remains. Fresh-profile macOS Chrome 156.0.8078.48 browser reruns: Official Rankings, Rankings Showcase and More **3/3 PASS**, first attempts; seven negative geometry fixtures PASS in affected suites. Other four browser suites were not rerun locally in this task; their prior Linux 7/7 qualification remains separately recorded. Local documentation file links and whitespace checks PASS. Evidence: `/tmp/300w-devops03b2b2/`. No runtime, sports data, artwork, Cloudflare, D1, secrets, version or deployment changes.

### Local outcome and remaining actions

Approved corrections and relevant documentation are consolidated under `test(browser): correct cross-platform viewport geometry`. New commit contains exactly the seven paths listed above. Branch remains `home-redesign-experiments`; index is empty after the commit. Excluded files are checked against the starting 1,247-file SHA-256 inventory; only the three authorized report/Board files changed during this task. The four approved tests already present at entry were not rewritten. Unfinished Profile, original artwork, audit artifacts and DEVOPS-02/OPS-04 working-tree additions remain untouched and outside this commit.

**Remote phase BLOCKED:** no development push, no permanent `preview` creation/push, no new Actions run. Remote development remains the freshly queried `f99c7775b92143eb847d470dd93ff4c3580c5224`; proposed Preview baseline is the resulting local consolidation HEAD, not the qualification branch. No Cloudflare deployment was executed. Because live Cloudflare integration state could not be inspected, no claim of independently verified Cloudflare deployment-history invariance is made.

Next: obtain current owner Dashboard confirmation that both Workers have no connected Git repository (or restore read-only API visibility without this task changing credentials), repeat fresh remote/safety checks, then resume the already authorized conditional pushes. After creation verify Preview CI on its exact SHA. Branch protection/required-check and reviewer settings, live PR/manual-trigger acceptance, and future Auto Deploy require their separate authorized setup; no deployment steps or credentials are added here. **STOP for owner review.**

## DEVOPS-03B.2B.3 — Safe push and permanent Preview branch (2026-10-27)

This outcome supersedes the blocked remote phase recorded above. Owner explicitly confirmed on 27 October 2026 that both `tri-app-preview` and `tri-app` show Settings → Builds → Git repository: **Connect**. Neither Worker has a native Git repository connection. This owner-provided evidence satisfies the Workers Builds safety gate; no Cloudflare API authentication attempts were repeated.

### Git operations and scope

Preflight matched development branch `home-redesign-experiments`, local HEAD `3ab99c4805bc33c76a5aca67b94251e7488eacd3`, fresh remote HEAD `f99c7775b92143eb847d470dd93ff4c3580c5224`, six approved outgoing commits and an empty index. Exact scope was 25 approved paths across DS-01, QA-04B, HOME-UI-01B, QA-03B, CI preparation and QA-05B. Per-commit path/secret-pattern/size checks passed. No unfinished Profile files, artwork originals or unrelated working-tree documentation were included.

One normal development push succeeded, followed by fresh remote verification. Remote/local `preview` were absent; local `preview` was created from the exact approved development SHA without switching the working tree, then pushed normally. No force, merge, rebase or new commit.

- `origin/home-redesign-experiments`: **`3ab99c4805bc33c76a5aca67b94251e7488eacd3`**.
- `origin/preview`: **`3ab99c4805bc33c76a5aca67b94251e7488eacd3`**.
- Preview baseline is the approved development tree, not the qualification branch.
- Remote `main` remains `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`.
- Development ahead/behind: **0/0**; primary branch unchanged, index empty.

### CI and deployment status

[Preview CI run 40526401566](https://github.com/shyandrey/tri-app/actions/runs/40526401566) was triggered by the new Preview branch push at the exact baseline SHA. **SUCCESS**, first attempt. Portable verification, exact checkout/toolchain, `npm ci`, portable tests, production build, lint and unchanged release gate all PASS on GitHub-hosted Ubuntu. Failure-only artifact upload correctly skipped on success. No workflow rerun. No local test/build rerun was needed for this Git-only task; this result is the actual remote CI execution. Permanent workflow contains only Portable verification, `contents: read`, pinned checkout/Node, portable checks/build/lint/release gate and failure-only artifacts. No deployment commands or Cloudflare secrets. Qualification-only harness and intentional-failure job remain excluded.

Lightweight GitHub audit found only the two known workflow records, zero webhooks and zero deployment records; no unexpected deployment mechanism or activity observed. No Cloudflare deployment performed, Workers Builds not enabled, no credentials, D1, branch protection or infrastructure changed. No Cloudflare deployment-history API check is claimed; safety relies on the approved current Dashboard evidence plus GitHub checks.

Only this report and the relevant Project Board sections are updated locally after push. These outcome updates are intentionally uncommitted; the existing unrelated Board backlog additions are preserved. Working-tree file hashes are compared with the starting inventory. Evidence: `/tmp/300w-devops03b2b3/`.

### Remaining separately authorized work

1. Configure Preview branch protection/rules and required `Portable verification` check, PR/reviewer model and prevention of direct unreviewed pushes. No protection settings changed here.
2. Verify real PR-to-Preview and manual workflow paths; the push path is now exercised. Manual dispatch availability on the default branch remains separate from this push-triggered run.
3. Retain browser qualification evidence and physical-device QA requirements; the permanent portable job does not run the seven-suite browser harness.
4. Design and approve Auto Deploy credentials/least-privilege permissions, deployment gating and rollback separately. CI success does not authorize deployment; Auto Deploy remains disabled.

**STOP for owner review after CI and Git verification.**

## DEVOPS-03B.2C — Protection and Auto Deploy approval package (2026-10-27)

**Prepared / STOP at protection and credentials checkpoints.** This proposal supersedes the earlier one-independent-reviewer/CODEOWNERS proposal; historical audit text is retained. No protection, environment, secrets, workflow activation or deployment changes were made. Only this report and Project Board changed locally; earlier uncommitted updates remain intact.

### Live capability findings

Read-only GitHub API confirms public personal repository (`owner.type=User`), authenticated admin permission, default branch `main`, only collaborator `shyandrey` (admin). `GET branches/preview/protection` returns 404 **Branch not protected**; rulesets `[]`, environments count 0. Exact baseline check is **Portable verification**, app `github-actions`, app ID **15368**, successful at `3ab99c4805bc33c76a5aca67b94251e7488eacd3`. Prior successful Preview push run: [40526401566](https://github.com/shyandrey/tri-app/actions/runs/40526401566).

An initial read-only audit failed with `UND_ERR_CONNECT_TIMEOUT` before retaining results; one diagnostic retry with named operations and incremental evidence completed successfully. No API mutation or Cloudflare authentication attempt occurred. Evidence: `/tmp/300w-devops03b2c/github-capabilities.json`.

Public repositories support protected branches on GitHub Free; exact billing plan was not read and is not needed to infer public-repository eligibility. Admin permission is observed, but write capability is not tested by creating a rule. Personal repositories cannot rely on organization-only actor push restrictions. [GitHub protection capabilities](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

### Checkpoint A — exact protection proposal (NOT APPLIED)

One classic branch protection rule for exact `preview`. PR required, strict up-to-date successful CI required, admin enforcement ON, no bypass actors, force push/deletion OFF, conversation resolution ON. Independent approval count **0**; code-owner review and last-pusher-independent approval OFF. Only the owner currently has write/admin access. Record owner authorization on the PR for the exact candidate SHA and let the owner merge after CI. This is an operational owner-approval policy, not a falsely claimed independent-review enforcement. If collaborators are added, revisit reviewer policy before granting promotion access.

Do not require a nonexistent browser check now: it would deadlock all PRs. Once a permanent `Browser verification` job is implemented and qualified on PRs and Preview pushes, add its observed exact context/app to this same required-check set. Existing seven-suite Linux qualification is evidence, not a permanent emitted check. No `merge_group`, merge queue, deployment prerequisite, new signing or linear-history requirement.

Proposed REST body for `PUT /repos/shyandrey/tri-app/branches/preview/protection` (review only):

```json
{
  "required_status_checks": {
    "strict": true,
    "checks": [{"context": "Portable verification", "app_id": 15368}]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": false
}
```

Dashboard equivalents: Settings → Branches → exact `preview` → Require PR ON, Require approvals OFF, Require status checks ON (`Portable verification`, GitHub Actions), Require branches up to date ON, Require conversation resolution ON, Do not allow bypass ON; force push/deletion OFF. Null `restrictions` is intentional for this personal repository; PR/check requirements apply to direct pushes and admins. Verify effective rule by GET and a controlled rejected direct-push/failed-check PR test only after explicit configuration/test authorization. Do not actually attempt a prohibited push now.

Emergency path: expedited PR with the same mandatory checks and owner merge; no CI bypass. If GitHub CI is unavailable, promotion waits. A separately approved settings change is not a standing emergency bypass. Preview rollback below restores an already verified deployment without rewriting branch history. **Owner must approve this exact protection configuration before application.**

### Pipeline design — not an enabled workflow

Extend the existing Preview CI workflow after separate implementation/activation approval. Preserve its PR-to-Preview trigger and portable job unchanged. Add browser verification with fresh Chrome profiles, no retries and all seven existing suites; ensure required jobs always appear for applicable PRs, with no path filters. Deploy job guard is strictly `github.event_name == 'push' && github.ref == 'refs/heads/preview'`; never deploy PR, qualification, tag, feature or manual arbitrary-ref artifacts. Keep least-privilege `contents: read`; only the deploy job receives the `preview` Environment. No `pull_request_target` or privileged `workflow_run` consuming untrusted artifacts.

Proposed job graph:

```text
PR to preview: portable -> package (unprivileged) -> browser -> checks only
Push preview: portable -> package (unprivileged) -> browser -> publish artifact -> deploy (Environment preview) -> smoke
```

The package consumes the completed portable build from the same SHA; cross-job transfer must be explicit, not reliance on runner disk. Portable job publishes a candidate build artifact after its gate passes. Package pins Node 24.19.0 and locked Wrangler, copies that exact static output, bundles Worker source from the same SHA without rebuilding frontend, then exports the complete immutable package. Browser job tests the packaged static output; local Worker/API tests exercise the packaged Worker in an isolated local runtime with mocks/local DB, not remote D1. Publish final deployable artifact only when both mandatory portable and browser jobs succeed. Test result provenance binds SHA, run ID/attempt and package digest; a failed/missing browser job blocks deployment even before its status is added to branch protection.

Artifact contents: prebundled ESM Worker and required modules, exact `dist` static files, fixed Preview-only deployment JSON, manifest with each file SHA-256/size, Git SHA, workflow/run/attempt, build version, Node/Wrangler and lockfile hashes. Exclude source archives, `.git`, `.env`, local photo staging, screenshots, unused PNG originals, rollback-only originals and qualification harnesses. Use an explicit runtime asset allowlist and verify every reference exists; do not silently delete approved runtime assets. Preserve previous successful artifact for at least 30 days within repository retention limits and make a durable owner backup before expiration. Pin upload/download actions to reviewed full SHAs; artifact IDs and downloaded digests must match the successful same-run manifest. Reject path traversal/symlinks, extra files and foreign repo/ref/run artifacts. A digest alone does not prove trust: approved branch + successful run + reviewed workflow are required too.

Current `wrangler.jsonc` has a custom build command. `npm run deploy:preview` cannot yet guarantee artifact-only publication. Proposed credential-free bundling uses a generated Preview-only config with **no build hook**, reviewed `worker/index.ts` as input and `wrangler deploy --dry-run --outdir <package-worker> --config <bundle-config>`. Final package config points to emitted JS and static files, has no custom build or source entrypoint. Future credential-bearing invocation is locked `wrangler deploy --no-bundle --config <validated-package-config>` from a clean artifact directory. `--no-bundle` alone is not permission to retain the custom build hook. Do not call npm build/install scripts with deploy credentials; provision locked tooling before exposing credentials, and never execute scripts supplied inside the artifact. These invocations are a design requiring local artifact/dry-run qualification; they were not run or claimed deploy-ready here.

Config validation must reject Production names/UUIDs, routes changes and extra environments. Fixed target: `tri-app-preview`, `APP_ENV=preview`, D1 `4dfe9210-0cc7-484f-8eea-fe5216f5c17a`, assets binding `ASSETS`, limiter namespace `30001`, existing five-minute cron. Preserve all ordinary Preview vars, observability and eight runtime secret bindings; compare generated config with approved `env.preview` and live read-only snapshot. No migrations, seeds, runtime secret uploads or D1 queries. Existing custom-domain association is preserved, never reconfigured. Compare Production state with a separate authorized read-only baseline; deploy token must not need Production access.

Serialize the entire publish transaction (including smoke) with constant concurrency group `tri-app-preview-publish`, `cancel-in-progress: false`. GitHub does not guarantee FIFO; pending runs may be superseded. Under the lock, re-read `refs/heads/preview` immediately before publication and reject stale SHA; recheck digest/CI completion and prior deployed SHA. A new push during upload waits for the same lock; it cannot deploy and then be overwritten by the older job. Never cancel an in-progress deployment halfway. Rollback must use the same lock; all automated writers share it and native Builds stays disconnected. On timeout/uncertain publish result, STOP and inspect IDs/live health; no blind retry or automatic rollback.

### Checkpoint B — Preview credentials and environment (NOT CREATED)

Cloudflare currently documents **Editor scoped to selected existing Workers**, including API tokens. Prefer Editor only on `tri-app-preview`; legacy Workers Scripts Edit is product-wide, not equivalent isolation. Binding deployment does not require D1 API permissions. Existing domain connections should not be changed, but the same documentation lists a Custom Domains per-Worker limitation: compatibility with this existing domain/account/locked Wrangler must be qualified before enablement. Editor can change Preview settings and secrets as well as deploy; it is not deploy-only. [Cloudflare roles/scopes and limitations](https://developers.cloudflare.com/workers/authorization/workers/).

If selected-Worker scope is unavailable or cannot publish static assets while preserving the domain, STOP. Do not silently broaden to account-wide Editor. That would also authorize modifying Production in the same account and conflicts with the present no-Production-credentials boundary. Possible separately approved alternative: isolate Preview in its own account. Compensating controls (Environment branch restrictions/review, fixed Worker/config, artifact hashes, owner-reviewed workflow, short token lifetime) reduce exposure but do not make an account-wide token Worker-isolated.

Owner dashboard instructions, to execute only after the credential checkpoint is approved:

1. In Cloudflare account API Tokens, create an appropriately scoped token with Editor on existing `tri-app-preview` only. Review account/resource selection and expiration. No Worker Admin, global key, OAuth copy, Production Worker, zone routes/DNS, token management, D1, KV/R2 permissions. Do not grant extra permissions merely to pass an error. Save the value directly into GitHub, never chat or repository.
2. GitHub Settings → Environments → create `preview`. Selected deployment branches: exact branch `preview`, not tags or broad protected-branch selection. Add required reviewer `shyandrey` for supervised first deployments, **Prevent self-review OFF** for the sole owner, no administrator bypass where available. Public repositories support environment reviewers/secrets; confirm the actual UI before relying on the gate. [Environment availability](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments).
3. Add Environment secret `CLOUDFLARE_API_TOKEN`; store account ID as Environment variable `CLOUDFLARE_ACCOUNT_ID` (nonsecret), confirmed from Dashboard, not guessed. No repository-wide deployment secret and no application/runtime secrets. Only the deploy job references this environment and exposes the token solely to the upload step.
4. Verify scope and tool compatibility in the separately authorized first-deployment preflight. Never test isolation by attempting a Production mutation. Environment review remains required initially; removing it for unattended Auto Deploy is a later explicit owner decision.

No token requested or created here. GitHub Environment settings and workflow activation also remain unapplied. The current workflow remains CI-only.

### Smoke tests, first publish and rollback

Before first publish: approve settings and implemented workflow/config diff; integrate/qualify permanent browser job and its required check; prove same-artifact build/test/deploy locally; record clean committed SHA, all check results and artifact digest; verify exact Preview ref, target and bindings, previous successful artifact/version/deployment IDs, unchanged Production baseline and read-only Preview queue health. Obtain explicit first-Preview-deployment approval. No production credential is used.

After authorized publish, persist SHA, package digest, previous/current Worker version IDs and deployment ID from structured output/API; treat missing IDs as incomplete verification. Independently GET `/api/health` on `https://preview.300w.app` and the **verified existing** Preview workers.dev hostname; require `ok`, exact 40-character commit and unchanged application version (`0.0.0` currently). Do not fabricate a workers.dev subdomain. Existing `check:preview` verifies health shape and News but **does not enforce expected SHA**; add explicit equality validation in the future smoke runner.

| Area | Read-only smoke acceptance |
| --- | --- |
| Home | wordmark/showcase, swipe, race cards, no missing assets/errors |
| Calendar | filters/date grouping, race navigation; use known source editions |
| Rankings | both series/genders, season persistence, exact approved tables, links, swipe/snap, no duplicate responsive variants |
| Athlete | existing confirmed athlete link, photo/placeholder and results; no identity edits |
| Race Detail | known edition metadata/results, unavailable ID, Back/Forward/refresh |
| More | About slogan, scroll and existing external links; no external messages |
| Navigation | all five tabs, Back/history, overlay stacking and bottom clearance |
| Artwork | portrait 390×844/440×956, landscape 844×390/956×440, correct WebP/currentSrc, no overflow or blank swipe |
| APIs | GET News, read-only Feedback config protection; no submissions/Telegram calls/D1 writes |

Browser smoke uses fresh profiles and no hidden retries. Failure retains sanitized logs/screenshots and marks deployment unhealthy; it does not re-deploy or roll back automatically. Physical iPhone Safari/Telegram owner QA remains a separate acceptance checkpoint.

Rollback: owner selects previously successful **Preview** version/package recorded before publication, reviews binding/schema compatibility and explicitly authorizes rollback. Serialize with the same deployment lock and hold new promotions through the normal approval gate. Prefer locked Wrangler `rollback <previous-version-id>` with the same validated Preview-only config, after verifying command syntax/version and existing version availability; record the resulting deployment ID and restored SHA. If the previous version is unavailable, redeploy the retained verified package through the artifact-only path, never rebuild an old branch ad hoc. Repeat both health-SHA and route smoke checks. This is code/assets rollback only, not D1 data rollback. Do not force-push Git or touch Production. A rollback implementation must explicitly distinguish approved previous-version selection from the normal latest-head guard, rather than disabling that guard globally.

### Validation and remaining approval gates

Checked local workflow, package scripts, metadata generation, GET-only health checker and installed Wrangler flags. Protection JSON parsed and checked against observed check/app identity and safety invariants; local document links/whitespace and preservation hashes verified. No build/browser/release rerun: this task changes only documentation; the existing successful Linux run is cited, not rerun. Artifact-only pipeline, environment enforcement and granular token/domain compatibility are **not yet execution-qualified**. No YAML deployment file has been installed; the job graph is a design, not a runnable approved workflow.

**Checkpoint A:** approve exact protection JSON and zero-independent-reviewer policy before settings mutation. **Checkpoint B:** approve artifact pipeline implementation, selected-Worker permission feasibility and owner Environment/token setup before credential creation/activation. **First deployment:** separate explicit approval after those gates and artifact qualification. No live infrastructure change was performed.

## DEVOPS-03B.2C.1 — Protection application preflight (2026-10-27)

**Owner authorized the protection configuration; NOT APPLIED — network preflight incomplete.** The exact JSON was extracted from Checkpoint A and matched byte-equivalent parsed values with the prior proposal. It retains PR requirement, strict `Portable verification` from GitHub Actions app 15368, zero independent approvals, admin enforcement, no force/deletion, no actor restrictions or last-push/code-owner requirement. Conversation resolution and stale-review dismissal are unchanged from the approved proposal; no new restrictions were added. Browser/diagnostic jobs are not required.

Two bounded read-only attempts, no configuration write:

1. `GET /repos/shyandrey/tri-app`: `UND_ERR_CONNECT_TIMEOUT`, connection timeout after 10 seconds, before HTTP response.
2. One diagnostic retry: repository metadata HTTP 200, Preview branch HTTP 200 at **`3ab99c4805bc33c76a5aca67b94251e7488eacd3`**, protection HTTP 404 (`Branch not protected`), rulesets HTTP 200 (`[]`). Next `GET /repos/shyandrey/tri-app/collaborators?affiliation=all` failed with the same pre-response connection timeout. Subsequent current check-run/deployment queries did not execute.

Fresh repository metadata confirms admin capability; the previous task's successful actual CI check/app and sole-owner findings remain historical evidence, not a completed current preflight. No `PUT` request was sent and there is no applied configuration/readback to claim. No direct-push test was attempted. Stop without weakening policy, changing credentials or substituting settings.

Evidence: `/tmp/300w-devops03b2c1/` contains approved JSON, partial read-only API results and starting file hashes. Current local branch/HEAD remain `home-redesign-experiments` / `3ab99c4805bc33c76a5aca67b94251e7488eacd3`, index empty. No commit, code push, merge, deployment or Cloudflare/D1/secret/runtime change. Only this report and Project Board were updated; prior pending documentation and unfinished Athlete Profile/artifacts preserved.

Recommendation: resume read-only preflight when GitHub connectivity is stable, then apply the already authorized exact policy once and compare every returned setting and unchanged Preview HEAD. No new protection policy approval is requested. Owner promotion through PR remains the intended zero-independent-reviewer workflow, but enforcement has not been enabled by this task. Credentials and Auto Deploy stay at their separate approval checkpoints. Local JSON/links/preservation and `git diff --check` validation passed; no application test rerun for this documentation-only outcome.

## DEVOPS-03B.2C.1R — Bounded protection preflight resume (2026-10-27)

**BLOCKED — GitHub connection unavailable; protection NOT applied by this task.** Reused the exact approved Checkpoint A JSON and verified equality with the preceding checkpoint. Local branch/HEAD and empty index remain unchanged. No architecture audit was repeated.

Bounded retry policy: maximum three GET attempts per transient connection failure, unchanged 10-second connection timeout inside the 15-second request deadline, two-second delay between attempts. All three attempts at `GET /repos/shyandrey/tri-app` failed with `UND_ERR_CONNECT_TIMEOUT` before receiving an HTTP response. Retry budget exhausted; no further requests or alternate configuration were attempted. No PUT was sent. Current remote HEAD, admin access and actual check identity could not be freshly reverified in this resume; previous observations remain historical, not current successful preflight.

Evidence: `/tmp/300w-devops03b2c1r/events.json` (three GET failures), approved `protection.json`, starting file hashes. No credentials changed, no protection settings applied, no push/merge/deployment. Local HEAD remains `3ab99c4805bc33c76a5aca67b94251e7488eacd3`, branch `home-redesign-experiments`. Only this report and Project Board changed; all excluded files including Athlete Profile were hash-checked and preserved. JSON comparison, local documentation links and `git diff --check` PASS.

Resume the existing authorized configuration only after GitHub connectivity is restored and all preconditions pass. Do not infer applied protection from the owner's authorization or bypass mandatory checks. Cloudflare credentials and Auto Deploy remain separately gated. **STOP on confirmed network blocker.**

## DEVOPS-03B.2C.2 — Local Auto Deploy implementation (2026-10-28)

**Implemented locally / Awaiting owner review; deployment DISABLED.** Owner now reports Preview branch protection and GitHub Environment `preview` configured (Preview-only branch, reviewers disabled, admin bypass disabled), Environment token restricted to Individual Workers Editor for `tri-app-preview`, and account ID variable present. These are owner-provided facts, not a new remote API audit. Earlier network-blocker entries remain historical. No settings, credentials, remote branches or deployed Worker were changed here.

### Implemented file scope and execution graph

- [Preview workflow](../.github/workflows/preview-ci.yml): unchanged portable gate followed by safety tests and artifact packaging/upload; new blocking `Browser verification` job; guarded deploy/smoke job.
- [Artifact builder/verifier](../scripts/preview-artifact.mjs): SHA/lockfile/version/config/file-set validation, no-build-hook Wrangler dry-run bundling, SHA-256 manifest, prebundled Worker and exact tested frontend.
- [Browser runner](../scripts/check-preview-browser-ci.mjs): seven qualified suites, fresh profile/process per suite, no retries/build. Derived from successful qualification harness; diagnostic geometry/intentional-failure jobs excluded.
- [Preview deploy runner](../scripts/deploy-preview-artifact.mjs): fixed repo/ref/Worker, strict artifact verification, live bindings/secrets/cron checks, current Preview HEAD check immediately before one upload, deployment/version evidence, no automatic retry/rollback.
- [Smoke runner](../scripts/smoke-preview-ci.mjs): exact SHA/version/HTML digest, GET News, fresh-browser page/navigation/responsive artwork checks, screenshots and failure summary; no token in this step.
- [Safety tests](../scripts/test-preview-pipeline.mjs): 23 tests including tampered/extra/missing/symlink artifact, wrong SHA/digest, forbidden refs/events/activation, Production DB drift, missing secrets/vars/cron drift, permission denial and stale-head refusal.

`portable → package/upload → browser (same artifact) → deploy → smoke`. Original PR-to-Preview and manual CI guards are retained; deployment is **push-to-Preview only**. The deploy job additionally requires repository-level nonsecret variable **`PREVIEW_AUTO_DEPLOY_ENABLED == 'true'`**. This variable was not created/set by this task. Leave it absent/false until explicit activation approval. It is deliberately a repository-level gate because job-level `if` is evaluated before Environment-scoped variables are available. Setting it is an activation action, not part of local implementation. No PR/push was created.

Portable job output carries immutable artifact ID and manifest digest into dependent jobs. Package upload explicitly includes the tracked `dist/.assetsignore`; all other hidden package paths are rejected, so artifact transfer cannot silently drop a manifested file. Download is same-run, by ID, using pinned download-artifact v4.3.0 [commit](https://github.com/actions/download-artifact/commit/d3f86a106a0bac45b974a628896c90dbdf5c8093); existing upload action pin retained. Browser job copies packaged `dist` and runs the seven suites without rebuilding. Deploy verifies digest/file set/config/lockfile/version again, installs locked tooling with lifecycle scripts disabled before token exposure and uses `wrangler deploy --no-bundle` against the package config. No `build.command`, production environment, route/domain declaration or migration invocation exists in the generated config. Original `wrangler.jsonc` is unchanged. No application/artwork file was edited.

Packaging selects generated frontend assets plus Git-tracked public assets, excluding the current untracked original artwork/staging evidence. It refuses to overwrite a prior package and rejects symlinks/extra files on verification. Worker build metadata must match the exact commit; the generated frontend metadata is checked too. Build/deploy uses current version `0.0.0`; no version change.

### Credentials, concurrency and failure behavior

Only the deploy step receives Environment `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` and read-only GitHub token. Logs redact the two token values; API failures report operation, HTTP status and Cloudflare error codes. No credentials are read locally for deployment. The token remains restricted; any 403/schema/binding mismatch stops before upload rather than broadening permissions.

Live preflight compares compatibility date, all expected binding names/types, eight secret names, ordinary vars, Preview D1 UUID, asset binding, limiter and cron. Production is never an API target. Existing per-Worker Custom Domain compatibility remains a real first-deployment qualification item: no route/DNS/domain update is attempted. The implementation fails closed if the real API shape or scoped permissions differ from the local fixtures; no live token/permission success is claimed.

Constant deploy-job concurrency group `tri-app-preview-publish`, `cancel-in-progress: false`, covers upload and smoke. Fresh branch-head equality rejects stale queued artifacts; GitHub queue ordering is not assumed. A new commit during upload waits for the lock, preventing an older job from publishing after a newer one. No overlapping pipeline writer, no blind retry after ambiguous upload. Native Builds remains disconnected per owner evidence. Any future rollback writer must use the same serialization policy.

The runner records previous deployment, expected SHA and manifest digest before upload, then current version/deployment IDs. Smoke failures retain deployed IDs, failure JSON and screenshots, mark the job failed and stop; they do not undo a deployment automatically. The first permission/production-domain compatibility failure must be reviewed before another attempt. Environment reviewers remain disabled per the current owner policy; this implementation does not re-enable them.

### Smoke coverage and rollback

Smoke targets fixed `https://preview.300w.app`, requiring HTTP 200, exact 40-character health SHA, unchanged version and HTML matching the tested package. It checks Home, Calendar, athlete list/profile, Rankings, Race Detail, More, five-tab navigation, nested Back, no overflow, two decoded responsive showcase images at 390×844 and 844×390, no runtime/HTTP errors. No feedback submission, Telegram message or remote D1 write. Browser emulation is not physical iPhone/Safari/Telegram acceptance. Existing full suites remain pre-deploy blockers.

The automation currently verifies the Custom Domain, not a guessed workers.dev hostname; if two-host health acceptance is retained for first release, record the real Preview workers.dev URL and check it explicitly during supervised first-deployment QA. No hostname is invented.

Rollback remains an owner-authorized operation: select recorded previous Preview version or retained successful package, stop new promotions through the activation gate, serialize with the same lock, verify compatibility, restore only Preview, and repeat SHA/routes smoke. Retained package (30 days) supports artifact-only restoration if the old Worker version expires. Back up last-known-good evidence before retention expires. No automatic rollback, source rebuild, force push or D1 rollback. No rollback workflow was enabled.

### Validation executed

- Pipeline safety tests **23/23 PASS**, no live network deployment.
- Isolated approved runtime plus pipeline changes: portable photos **25/25**, PTO **44/44**, standings **20/20**, production build/full lint and release gate **18/18 PASS**. Node 24.19.0; evidence `/tmp/300w-devops03b2c2/isolated-portable/`.
- Initial primary-tree sandbox run recorded environment failures in athlete/results audits (`listen EPERM 0.0.0.0:24678`). That failed attempt is retained under `portable/`; the separately permitted isolated run passed. Unfinished Profile work was excluded from the validated isolated baseline.
- Actual credential-free Wrangler 4.142.0 package preparation PASS: 729 manifest entries, final manifest digest `16a3e51d76e95c9c2b7e37da016986d777ceb7bcbbcd6ffc12076ac6458c21b2`. Artifact-only `--no-bundle --dry-run` replay PASS; emitted Worker bytes identical, manifest re-verification PASS. No upload occurred. Temporary artifacts are outside the repository. During validation, GitHub hidden-file exclusion and Wrangler-generated `.wrangler/tmp` directories were detected: package upload now preserves the sole allowed hidden `dist/.assetsignore`, while bundling/upload operational configs live outside the immutable package. An intermediate strict-verifier failure was retained; final fresh packaging/replay/verification passed.
- YAML parsed with installed Ruby standard-library YAML; shell snippets checked with `bash -n`; JavaScript syntax and workflow dependency/secret/activation invariants checked. Python PyYAML/actionlint unavailable; no tooling installed. This is local validation, not a new GitHub Actions execution.
- Seven expensive browser suites were not rerun: assertions/runtime/artwork are unchanged; the previously qualified Linux [7/7 run](https://github.com/shyandrey/tri-app/actions/runs/40518640960) is preserved. The new permanent runner/artifact handoff and live smoke still need isolated Linux qualification before activation. No new browser/Linux/deployment PASS is claimed.
- Known sports chunk warning remains: 1,295.13 kB minified, 266.28 kB gzip. No bundle optimization/runtime change attempted.
- Documentation links, preservation inventory and `git diff --check` PASS. No stage/commit/push/deployment/settings/credentials/version/D1 changes.

### First-deployment procedure — requires separate authorization

1. Review exact local diff and consolidate only these pipeline files/docs, excluding Profile/unrelated artifacts. Keep activation variable absent/false. Authorize CI-only integration/qualification separately; confirm new permanent `Browser verification` completes on actual PR/push candidate and add it to protection only after observing its check identity.
2. Confirm both CI jobs pass for the exact resulting Preview commit, retain artifact ID/digest and current/previous deployment records. Verify scoped token/domain/config compatibility with approved read-only access; an unexpected response is a STOP, not a permission upgrade.
3. Owner explicitly approves first Preview publication and enabling repository `PREVIEW_AUTO_DEPLOY_ENABLED=true`. No manual arbitrary-ref deployment path exists; use the separately authorized reviewed Preview push. Re-check no other writer/native Builds is enabled.
4. Inspect version/deployment IDs, exact health SHA, smoke artifacts and unchanged bindings. First failure stops; no automatic retries/rollback. Owner performs physical-device QA.

**STOP FOR OWNER REVIEW BEFORE FIRST DEPLOYMENT.** Pipeline is prepared locally, not enabled, pushed or remotely qualified.


## DEVOPS-03B.2C.3 — Linux pipeline qualification (2026-10-28)

**BLOCKED / Awaiting Owner Review.** One isolated commit and one normal push; no rerun, repair push or deployment.

- Branch: `ci/preview-pipeline-qualification`; qualification SHA `027d6eedf14060720eff4476e941cf2bc993ceac`, based on approved `3ab99c4805bc33c76a5aca67b94251e7488eacd3`.
- [GitHub Actions run 40588070428](https://github.com/shyandrey/tri-app/actions/runs/40588070428): **FAIL**.
- Exact seven-path commit: `.github/workflows/preview-ci.yml`, qualification-only `.github/workflows/pipeline-qualification.yml`, and `scripts/{preview-artifact,deploy-preview-artifact,smoke-preview-ci,check-preview-browser-ci,test-preview-pipeline}.mjs`. The six implementation files were copied byte-for-byte from the approved local implementation. No runtime, Profile, data, artwork, package or lockfile changes.
- Qualification workflow copies portable/browser jobs, adds credential-free artifact-only replay and a non-deploying sentinel with the original deployment condition. It triggers only on the qualification branch, has `contents: read`, no Environment and no secret references. The original workflow remains unchanged and does not trigger on that branch. Repository activation variables read back empty before push; activation remains disabled.
- Ubuntu 24.04; Node 24.19.0; Python 3.12.3; SQLite 3.45.1. Locked dependency installation PASS. Portable photos, PTO identity/registry, official standings, production build/lint/release gate PASS. Pipeline safety tests **23/23 PASS** both locally and on Linux, including stale-SHA rejection before upload and static non-cancelling deployment concurrency checks. Real concurrent live deployment was deliberately not exercised.

| Required check | Actual result |
| --- | --- |
| Portable CI / build / lint / release gate | PASS |
| Package creation and source SHA verification | PASS; 729 files |
| Upload/download and downloaded ZIP SHA-256 | PASS |
| Downloaded manifest/file-set verification | FAIL before validation: `ENOENT` |
| Artifact-only Wrangler replay | NOT RUN, blocked by prior failure |
| Official Rankings browser | NOT RUN |
| Rankings controls / Season Picker browser | NOT RUN |
| Rankings swipe browser | NOT RUN |
| Rankings showcase browser | NOT RUN |
| Navigation browser | NOT RUN |
| Calendar browser | NOT RUN |
| More browser | NOT RUN |
| Live deployment gate | SKIPPED as required; no live deployment |

### Exact failure and proposed correction (not implemented)

Failing step: **Verify artifact and serve its exact static output**. `verifyArtifact` could not open `/home/runner/work/_temp/preview-package/manifest.json`.

The download log proves the directory mismatch: with `artifact-ids: 12772538968` and default `merge-multiple: false`, the pinned download action extracted into `/home/runner/work/_temp/preview-package/preview-package-027d6eedf14060720eff4476e941cf2bc993ceac-40588070428-1`. The verifier expects the manifest directly in `preview-package`. This is a workflow handoff defect, not evidence of corrupted sports data or a browser regression.

Minimal proposed correction: explicitly use `merge-multiple: true` for the single immutable artifact ID in both permanent browser/deploy download steps and the qualification copy. Preserve ID binding, trusted manifest digest, exact SHA, file inventory and config verification. Alternatively use the actual nested directory consistently. No fix applied in this task, no verification weakened. The same latent path error affects the prepared deploy job, which has not executed.

Package manifest digest: `f4824a6e24d74285154e5aaa3620c975173536bb28fcc09dc28f4cbb6d7d5954`.
Downloaded ZIP digest: `01a8576dfab5142fe5fd977f2ea999e668e0d2ccff128993dd774b94c9491705` (different object from manifest; matched upload digest).
[Retained package artifact](https://github.com/shyandrey/tri-app/actions/runs/40588070428/artifacts/12772538968): ID `12772538968`, 95,104,075 bytes, expires 2026-11-26. Browser diagnostics upload step completed with **no files found**, because the browser runner never started. Do not claim that a browser evidence artifact was uploaded.

Full run logs are preserved in `/tmp/300w-devops03b2c3/run-logs.zip` and `logs/`; API job/artifact records, exact staged diff, allowlist, original file hashes and local safety output are retained alongside them. Read-only API calls encountered transient `UND_ERR_CONNECT_TIMEOUT`; bounded retries recovered logs on the third attempt. No workflow rerun or additional push.

### Preservation and remaining activation blockers

Development remains on `home-redesign-experiments` at `3ab99c4805bc33c76a5aca67b94251e7488eacd3`, index empty. All original files except these two requested documentation updates match their pre-task SHA-256; unfinished Athlete Profile and all unrelated artifacts are untouched. Qualification clone has a clean Git working tree. Only the isolated qualification branch was pushed. No protection, secrets, credentials, activation, Cloudflare, D1 or version changes.

Local shell syntax, qualification JSON/YAML structure, explicit path/secret-pattern checks, safety tests and `git diff --check` PASS. Main working-tree build/browser suites were not rerun: Linux ran the approved isolated build and failed before browser execution. Runner warnings include pinned Actions' Node 20 deprecation/forced Node 24 and upstream `punycode`/Buffer deprecations; these did not cause the failure. Previously documented sports chunk warning remains unchanged.

Next: owner authorization for the narrow artifact-directory correction and another isolated qualification. Require all seven browser suites plus downloaded manifest integrity and artifact-only replay PASS before activation. Live scoped-token/domain compatibility, first Preview smoke and physical iPhone QA remain separate future acceptance steps. **Not ready for Auto Deploy activation. STOP FOR OWNER REVIEW.**


## DEVOPS-03B.2C.3R — Artifact download layout correction (2026-10-28)

**Linux qualification PASS / Awaiting Owner Review. Deployment remains disabled.** This supersedes the C.3 qualification blocker above without erasing its failed-run evidence.

One narrowly scoped commit `e6275c684b36076053bf60a11950dc03236d1e36` and one normal push to `ci/preview-pipeline-qualification`, based on `027d6eedf14060720eff4476e941cf2bc993ceac`. [Run 40662168379](https://github.com/shyandrey/tri-app/actions/runs/40662168379) completed successfully with no reruns.

### Exact correction and artifact isolation

Only two qualification-copy files changed: `.github/workflows/preview-ci.yml` (two added lines, browser/deploy download steps) and `.github/workflows/pipeline-qualification.yml` (one added line). All three additions are `merge-multiple: true`. No runtime, scripts, tests, dependencies, data or artwork changed. These changes have **not** been merged or copied into the development workflow.

Each download still selects exactly `${{ needs.portable.outputs.artifact_id }}`, the single ID emitted by the same run's package-upload step. There is no name/pattern/all-artifacts selection, external repository/run override or alternate token. The pinned action source filters artifact metadata by ID before choosing the extraction path; `merge-multiple` changes the latter only. Other artifacts cannot enter the candidate through this selector. Immutable ID, trusted manifest digest, exact event SHA, file-set/content/config/lockfile verification remain unchanged. Unexpected extra files still fail verification.

Local fixture checks evaluated the pinned action's actual extraction-path expression: the old setting produces an artifact-name subdirectory, the new setting produces the required root. A controlled ID fixture excluded an unrelated artifact. Workflow checks covered all three exact selectors, YAML parsing and shell syntax. Existing safety suite **23/23 PASS**, `git diff --check` PASS. No unrelated local audits/builds were repeated.

Linux download log confirms extraction directly to `/home/runner/work/_temp/preview-package`. The unchanged verifier successfully read `manifest.json` there and verified the downloaded package before any browser use. Artifact-only Wrangler `--no-bundle --dry-run` PASS, emitted Worker bytes matched with `cmp`, and manifest/file integrity re-verification PASS afterwards. No rebuild or live upload during replay.

### Actual Linux results

Ubuntu 24.04, Node 24.19.0, Python 3.12.3, SQLite 3.45.1. First run, fresh browser profiles, no retry-to-PASS.

| Check | Result |
| --- | --- |
| Portable CI, production build, lint, release gate | PASS |
| Pipeline safety tests | 23/23 PASS |
| Package creation/upload/download | PASS |
| Exact SHA, manifest digest, file integrity | PASS |
| Artifact-only Wrangler dry-run, byte comparison, integrity recheck | PASS |
| Official Rankings | PASS |
| Rankings controls / Season Picker | PASS |
| Rankings swipe | PASS |
| Rankings showcase | PASS |
| Navigation | PASS |
| Calendar | PASS |
| More | PASS |
| Live deployment gate | SKIPPED |

Browser suites **7/7 PASS**. Stale-SHA rejection and concurrency contract remain covered by the unchanged safety suite; no live deployment concurrency experiment was performed. Repository activation variables were empty at preflight; no activation or credential changes occurred. Qualification workflow has no Cloudflare secret access or live deployment command. No Preview/Production deployment.

### Evidence and Git preservation

- Qualification evidence: `/tmp/300w-devops03b2c3r/` contains source/layout fixture, safety output, before hashes, job/run/artifact API records and full downloaded `run-logs.zip` plus extracted logs.
- Package manifest digest: `cc2117ead0a48114e123c19f60a1ee848006f60552df7e88ba42b629b6a2c972`; 729 files.
- [Package artifact 12803908093](https://github.com/shyandrey/tri-app/actions/runs/40662168379/artifacts/12803908093): 95,104,080 bytes, expires 2026-11-27. ZIP digest `3ffa7f348f24ffe5c3d1f0d9bd4711da12f4cb85decc85d79a21218bedfec20a`.
- [Browser diagnostics 12805146254](https://github.com/shyandrey/tri-app/actions/runs/40662168379/artifacts/12805146254): 57,529,294 bytes, expires 2026-11-04. Artifact retained remotely; full run logs saved locally.
- Remote development and Preview remain at `3ab99c4805bc33c76a5aca67b94251e7488eacd3`. Development index empty; original files match pre-task hashes except the two requested documentation updates. Unfinished Athlete Profile and unrelated artifacts untouched. Qualification working tree clean.

Next: owner review and separately authorized integration of the qualified workflow correction into the development/Preview pipeline. The local development workflow intentionally still contains its pre-task download configuration. Do not activate that uncorrected copy. Keep activation disabled until integration and first-deployment authorization; live scoped-token/domain compatibility and post-deployment smoke remain untested. Physical iPhone acceptance is separate. No additional CI push, merge, settings, D1, version or infrastructure changes performed. **STOP FOR OWNER REVIEW.**


## DEVOPS-03B.2C.4 — Qualified pipeline consolidation (2026-10-28)

Owner authorized one thematic development commit, normal push and PR to `preview`; **no merge, activation or deployment**. The permanent workflow and five CI scripts are byte-identical to qualification commit `e6275c684b36076053bf60a11950dc03236d1e36`, validated by [Linux run 40662168379](https://github.com/shyandrey/tri-app/actions/runs/40662168379). Qualification-only workflow/triggers and sentinel jobs are excluded.

The approved commit scope is eight paths: `.github/workflows/preview-ci.yml`, `scripts/preview-artifact.mjs`, `scripts/deploy-preview-artifact.mjs`, `scripts/smoke-preview-ci.mjs`, `scripts/check-preview-browser-ci.mjs`, `scripts/test-preview-pipeline.mjs`, this report and the relevant DEVOPS sections of Project Board. Unrelated DEVOPS-02/OPS-04 backlog additions remain unstaged; unfinished Athlete Profile and all other artifacts remain untouched.

Deployment still requires push to `preview`, both portable/browser jobs successful, repository activation variable equal to `true` and Environment `preview`. Development push does not trigger this workflow; PR runs verification only and cannot enter deployment. Same-run artifact ID, `merge-multiple: true`, SHA/digest/file-set verification, fixed Preview Worker, binding checks, stale-SHA refusal and serialized deployment remain unchanged. No dependencies, settings or secrets need alteration for consolidation.

Targeted local safety tests, YAML/shell checks, qualification byte comparison, staged scope/secret-pattern scan and diff checks are required before commit. Prior Linux qualification is reused without rerunning it locally; PR CI must independently verify its merge candidate. Actual commit/PR and CI outcome will be recorded after publication.

### First controlled Preview deployment — separate approval required

1. Review the PR and its exact scope; require Portable verification and inspect the seven-suite Browser verification result. Add the permanent Browser check to protection only with separate authorization. No merge in this task.
2. Authorize and merge the pipeline with activation still disabled; verify CI for the resulting exact Preview SHA and retain its package/digest.
3. Separately authorize activation and first Preview deployment. Use the existing approved push-to-Preview path with a reviewed change; enabling the variable alone does not trigger a deployment. Record current Preview deployment/version and rollback package before publication.
4. Inspect live scoped-token/binding/domain compatibility, then deploy only the verified artifact once. Any failure stops; no token broadening, automatic retry or rollback.
5. Verify deployed SHA/version IDs, smoke checks and bindings. Owner performs physical iPhone QA. Rollback requires separate approval and the same serialization policy. Production remains untouched.

## DEVOPS-03B.2C.7A — Preview activation and mandatory preflight (2026-10-28)

**Implemented; awaiting PR Linux qualification and owner review. Activation remains disabled; no merge/deployment authorized in this change.**

Isolated branch `ci/preview-activation-preflight` starts from development `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`. Only three pipeline/test files plus these two documentation files are included. Uncommitted manual-mode files, Profile work and historical local artifacts are excluded and preserved in the primary tree.

- Deploy job retains successful Portable/Browser dependencies, push-to-preview guard, Environment `preview`, exact-artifact verification and serialized concurrency. Its first runner step evaluates the Environment activation variable; only exact `true` enables subsequent steps. Checkout, tools, artifact download, credential-bearing upload, smoke and evidence upload all require the enabled output. Disabled invocation finishes without exposing Cloudflare credentials to any step. No repository-wide activation variable was created.
- Deployment script additionally pins the nonsecret approved Preview account identity (fresh Environment readback), validates target `tri-app-preview`, requires a valid rollback deployment UUID and one version at 100% traffic, reads the filtered `preview.300w.app` Custom Domain and requires correct Worker/enabled state. Existing binding/eight secret-name/ordinary-var/D1 identity/cron assertions remain intact. Rollback baseline is rechecked before stale-SHA verification/upload; domain association is compared after upload. Read errors/drift/missing information stop before Wrangler; no permission broadening/retry.
- Custom Domain API schema reference: [Cloudflare List Worker Domains](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/list/). No live Cloudflare reads/writes were performed for fixture qualification. Token permission compatibility and real rollback IDs remain future mandatory preflight evidence; fixture success does not establish those facts.

Local validation: **45/45** pipeline tests PASS (existing integrity/activation/bindings/stale-SHA contracts plus negative rollback/domain/account/drift fixtures and exact activation shell tests). Absent, empty, false, uppercase and whitespace variants all disable; exact true enables in a credential-free fixture only. Structural tests require guards on every downstream deploy step. YAML syntax, targeted expression/context checks, JS syntax, 14 bash syntax checks and `git diff --check` PASS. `actionlint` unavailable; GitHub workflow acceptance remains part of PR qualification. No package/dependency/application changes; no unrelated local build/browser rerun requested.

Fresh GitHub readback: protected Preview remains `558b7ae11f593ce32310b673423d3ac61b87748d`; Environment branch policy only `preview`; activation absent in repository and Environment. Primary index remains empty. Evidence: `/tmp/300w-devops03b2c7a/`.

Qualification uses the ordinary PR pipeline on Ubuntu: Portable verification executes the exact gate shell fixtures and preflight negatives; Browser verification uses the verified artifact. Actual credential-bearing deployment job is skipped for PR events. This qualifies code/shell and workflow acceptance, not live Cloudflare permissions or actual publication. Do not enable activation or merge this PR automatically.

Next controlled-deployment prerequisites: review successful PR CI and exact diff, recheck activation off before any separately authorized merge; approve first publication separately; verify live scoped-token preflight and rollback evidence before upload. No manual-mode workflow or authorization ledger is introduced.


## DEVOPS-03B.2C.7D — Scoped-token domain preflight correction (2026-10-30)

Status: implemented; PR qualification pending. No merge or deployment authorized in this task.

Run [41043030960](https://github.com/shyandrey/tri-app/actions/runs/41043030960) stopped before Wrangler upload: account-level Workers Custom Domains GET returned HTTP 403 / code 10000. The automatic deployment script now omits that endpoint before and after publication. It does not catch or suppress unrelated Cloudflare errors. Settings, binding values and secret names, schedules, account/Worker identity, rollback deployment/version, artifact digest/inventory and stale Preview SHA checks remain mandatory.

**Owner-verified domain baseline:** on 30 October 2026 the owner confirmed in Cloudflare Dashboard → `tri-app-preview` → Settings → Domains & Routes that `preview.300w.app` is an existing Custom Domain of that Worker. This satisfies the requested owner check for the next controlled deployment; it is not an API verification or deployment authorization. Deployment evidence records this provenance and date. No permission expansion is required or proposed.

Artifact configuration rejects any `route` or `routes` declaration, including empty/null declarations and `custom_domain: true` route objects. No route/domain configuration, credential, Production target, D1 operation or application behavior is changed. Post-publication HTTPS smoke still verifies Preview availability, exact deployed SHA, navigation and responsive artwork. **HTTPS availability/content does not prove unchanged Cloudflare domain ownership or routing.** Domain invariance is not claimed from those checks; Dashboard evidence and the prohibition on route/domain configuration are separate safeguards.

Local validation: 54/54 pipeline safety tests PASS, including negative route/domain configuration fixtures, settings/schedules/deployments 403 failures, rollback drift, stale SHA, integrity and activation tests. Workflow content is unchanged. Qualification will run through a normal PR with activation disabled, without live Cloudflare calls.

First deployment procedure after separate owner authorization:
1. Review this PR and its Portable/Browser results; merge only when separately authorized, with activation still disabled.
2. Identify the resulting Preview SHA and its verified immutable CI artifact; do not reuse an older artifact with changed verification code.
3. Retain the owner Dashboard domain baseline above. Capture fresh live Preview rollback IDs, bindings/secret names and cron via scoped reads; stop on missing data or any unrelated 403.
4. Enable only the Preview Environment activation flag under separate approval and promote a controlled PR through required CI. Existing concurrency and stale-SHA checks remain enforced.
5. Verify deployment/version IDs, exact SHA and HTTPS smoke. On failure disable further Auto Deploy, preserve logs and determine whether publication occurred; no automatic retry/rollback.

Rollback reference from the failed first attempt (must be refreshed before future publication): deployment `e441f5f7-05d9-41dc-bbf9-594acb29fd82`, version `84653431-5134-4216-813a-2b5bb4c573fc`. Recovery requires separate owner authorization; Production is never a fallback. Permanent activation remains disabled pending owner review.
