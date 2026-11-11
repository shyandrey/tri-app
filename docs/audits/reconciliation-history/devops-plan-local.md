# Preserved local history: devops03b2-preview-implementation-plan.md

Historical snapshot captured during reconciliation on 2026-11-10. This is evidence, not current deployment instructions or authorization. Canonical document: [docs/devops03b2-preview-implementation-plan.md](../../devops03b2-preview-implementation-plan.md). All original substantive text is retained; relative Markdown links are rebased to their original repository destinations. Source SHA-256: `5736a8be5640bb18dd7b89ce85e32f655d725f6edb9e7d7e5bd5b7884dff05a8`.

---

# DEVOPS-03B.2A — Preview CI integration preparation

2026-10-27 · **Prepared / Awaiting Owner Review**. Local configuration/documentation only; no branch, PR, settings, secrets or deployment changes.

## Baseline and scope

Primary branch `home-redesign-experiments`, HEAD `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`, empty index. Tracking shows ahead 2 / behind 0. Fresh read-only remote query confirms development at `f99c7775b92143eb847d470dd93ff4c3580c5224`, main at `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`, qualification at `53a1fafb604cb86cee740acc5b6899c677c34640`; `preview` is absent. GitHub repository metadata reports **public**, owner type **User**, default branch **main**. Account plan and available settings UI were not verified; no Cloudflare inspection was needed.

[Linux qualification](https://github.com/shyandrey/tri-app/actions/runs/40403415627) is owner-approved/closed: Ubuntu 24.04.5, Node 24.19.0, npm 11.17.0, Python 3.12.3, SQLite 3.45.1. That run validates its exact commit, not every current local change. See [qualification history](../../devops03b1-ci-portability.md) and [security audit](../../devops03-preview-cicd-audit.md).

Preserved uncommitted groups: QA-03B tests/fixture/release diagnostics; HOME-UI-01B slogan relocation; unfinished Athlete Profile CSS/component and local browser test; accumulated Board/reports; original artwork/manifests and four known local artifacts. Qualification excluded Home/Profile changes. Approval of qualification does not authorize wholesale merging that branch or all dirty files. No sport/data/artwork/runtime/test-runner changes in this task.

## Permanent CI candidate

[`.github/workflows/preview-ci.yml`](../../../.github/workflows/preview-ci.yml) now takes the **qualified** step sequence with only these event/guard changes:

```yaml
on:
  pull_request:
    branches: [preview]
  push:
    branches: [preview]
  workflow_dispatch:
```

Job guard: `github.event_name == 'pull_request' || github.ref == 'refs/heads/preview'`. Manual runs on other branches/tags are intentionally skipped, not accepted as preview qualification. No path filters that could omit the required check. Temporary qualification branch trigger/guard is removed. No concurrency cancellation or retries are added.

The previously stale primary candidate also receives the approved early report-directory initialization using `$RUNNER_TEMP`/`$GITHUB_ENV`; `runner.temp` remains only in the artifact step's valid context. All qualified steps are structurally identical: full-history exact-event-SHA checkout, no persisted Git credentials, Node 24.19.0, toolchain/Git-object check, `npm ci`, [portable runner](../../../scripts/check-ci-portable.mjs), unchanged build/lint/release gate, summaries and failure-only diagnostics with seven-day retention. Permissions remain `contents: read`, no secrets/environment/OIDC/deploy access. No Wrangler command is present.

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

Portable CI is mandatory once integrated; browser qualification is not yet a mandatory check and is not included in its PASS. No browser assertions are changed. [Existing qualification plan](../../devops03b1-ci-portability.md#browser-reliability-qualification-for-devops-03b2) remains applicable.

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

[QA-05 report](../../qa05-linux-browser-geometry.md) supersedes the earlier provisional scrollbar diagnosis: measured Linux content widths `829/1425/753` expand to configured `844/1440/768` when the scrollbar is temporarily hidden and return on restoration. T100 track/snap follows `1425 → 1440 → 1425`; no root overflow. macOS reserves zero width and all three unchanged suites PASS.

Qualification commit `a4ae3681c81a10b2f6659a1cbb356de76eb2c5f0`, [run 40486902378](https://github.com/shyandrey/tri-app/actions/runs/40486902378): geometry/portable PASS; four original browser suites PASS, the same three FAIL. Assertions remain unchanged. First-run failure triggers the owner's STOP rule; test-only geometry correction is proposed, not applied. Browser qualification remains incomplete and permanent Preview creation remains deferred pending owner review. Primary baseline unchanged; diagnostic commit exists only on qualification branch (plus disclosed local qualification ref). No deployment.

## QA-05B — Geometry test correction / incomplete qualification

[QA-05B results](../../qa05-linux-browser-geometry.md#qa-05b-linux-first-run-outcome--incomplete-qualification): four test-only files in isolated commit `674007db6450e4c8c3999fbcd1cf8b1471a581b4`, [run 40496089575](https://github.com/shyandrey/tri-app/actions/runs/40496089575), one push/attempt. Local seven suites, build/lint/release gate and negative fixtures PASS. Linux portable PASS; browser **6/7 PASS**, Official Rankings FAIL at remaining `hero.width === innerWidth` assertion (line 190). Showcase and More now PASS. This missed second assumption requires a minimal follow-up, proposed but not applied after first-run failure. Browser qualification remains incomplete; permanent Preview creation deferred. No development push, runtime changes or deployment.

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

- [Preview workflow](../../../.github/workflows/preview-ci.yml): unchanged portable gate followed by safety tests and artifact packaging/upload; new blocking `Browser verification` job; guarded deploy/smoke job.
- [Artifact builder/verifier](../../../scripts/preview-artifact.mjs): SHA/lockfile/version/config/file-set validation, no-build-hook Wrangler dry-run bundling, SHA-256 manifest, prebundled Worker and exact tested frontend.
- [Browser runner](../../../scripts/check-preview-browser-ci.mjs): seven qualified suites, fresh profile/process per suite, no retries/build. Derived from successful qualification harness; diagnostic geometry/intentional-failure jobs excluded.
- [Preview deploy runner](../../../scripts/deploy-preview-artifact.mjs): fixed repo/ref/Worker, strict artifact verification, live bindings/secrets/cron checks, current Preview HEAD check immediately before one upload, deployment/version evidence, no automatic retry/rollback.
- [Smoke runner](../../../scripts/smoke-preview-ci.mjs): exact SHA/version/HTML digest, GET News, fresh-browser page/navigation/responsive artwork checks, screenshots and failure summary; no token in this step.
- [Safety tests](../../../scripts/test-preview-pipeline.mjs): 23 tests including tampered/extra/missing/symlink artifact, wrong SHA/digest, forbidden refs/events/activation, Production DB drift, missing secrets/vars/cron drift, permission denial and stale-head refusal.

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


### C.4 publication outcome

Commit and remote development HEAD: `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`, message `ci(preview): integrate qualified artifact-based deployment pipeline`. One commit, one normal development push. Remote comparison before PR creation: ahead 1 / behind 0, exactly eight approved paths, 789 additions / 3 deletions (including accumulated related DEVOPS audit documentation). No qualification-only workflow, unrelated backlog, runtime or Profile hunks.

[PR #1](https://github.com/shyandrey/tri-app/pull/1): `home-redesign-experiments` → `preview`, title `ci(preview): integrate qualified deployment pipeline`. **OPEN, not merged.** [PR CI run 40665184488](https://github.com/shyandrey/tri-app/actions/runs/40665184488): required **Portable verification SUCCESS**, including portable/build/lint/release, safety tests, packaging and upload. Browser verification is **IN PROGRESS at handoff**, with artifact download/integrity already PASS; no claim of PR browser-suite completion. Prior identical-code Linux qualification 7/7 remains valid evidence, but the owner should inspect final PR Browser result before any merge.

Fresh protection readback: PR required, independent approvals 0, strict `Portable verification` bound to GitHub Actions app 15368, admins enforced, force pushes/deletion blocked. No policy changes; Browser check not added to branch protection by this task. Repository activation variables empty; webhook list empty; only known qualification/permanent workflow records found. GitHub deployment list remained empty. No Cloudflare API/deployment operation performed. PR event cannot satisfy the deploy job's push-only condition.

Remote `preview` remains `3ab99c4805bc33c76a5aca67b94251e7488eacd3`; development is synchronized at the new commit. Local targeted safety 23/23, layout/YAML/shell checks, exact qualified-file comparison and `git diff --check` PASS. Full local build/Linux qualification were not repeated unnecessarily. Original unrelated file hashes preserved and index empty. These post-publication results are local uncommitted documentation updates, alongside preserved DEVOPS-02/OPS-04 backlog and unfinished Profile changes; no second commit/push.

Evidence `/tmp/300w-devops03b2c4/` includes initial hashes, staging allowlist/diff, protection/activation/workflow/hook records, remote compare, PR and CI jobs. **STOP before merge, activation or first deployment.**


## DEVOPS-03B.2C.6A — One-time authorization security checkpoint (2026-10-28)

**BLOCKED before implementation / Owner decision required.** The task explicitly requires STOP if a reliable single-use guarantee requires broader infrastructure changes. No deployable manual workflow, feature branch, authorization claim, commit, push or Actions run was created. Only this report and Project Board were updated. Do not interpret this as completed implementation or qualification.

### Verified artifact identity

Fresh GitHub read of artifact `12808930340`: present, `expired: false`, 95,104,075 bytes, expiration `2026-11-27T10:19:49Z`. Its workflow metadata identifies run `40671035849`, branch `preview`, application SHA `558b7ae11f593ce32310b673423d3ac61b87748d`. Original run logs were downloaded and retained locally.

- Archive SHA-256 from artifact API: `b0c987cc3d16c7ffc35b3cd39bb5c63973f4e5dc45d33f346fc1ebf550ca4474`.
- Trusted manifest SHA-256 from the original successful packaging log: `7e2ce8ccf572c997e13c614c35342dc061ac63ea39c7430218dd9ba3dc7c448e` (729 files).
- These hashes describe different objects and must not be substituted for each other. Artifact bytes were not downloaded/reverified in this task; fresh API availability and original trusted manifest evidence are verified. Future qualification/deployment must download the exact ID and re-run all existing integrity checks; expiration is still a hard STOP.

### Single-use assessment and explicit trust boundary

Existing workflow declares `contents: read`; repository default workflow permission is also `read`. Fresh repository rulesets response is `[]`. Preview branch protection does not protect a separate consumed-authorization tag namespace.

An atomic create of `refs/tags/preview-deploy-consumed/<authorization-id>` can reject concurrent/repeated creation while that ref exists. It is not enough for the requested durable consumed-state invariant by itself: GitHub's Contents-write permission supports both creating and deleting refs. A writer could delete the claim and make the ID reusable. A plain workflow input, concurrency lock, expiring Actions artifact, mutable issue or deployment-history lookup is not an equivalent enforced consumption record. See [GitHub Git references API](https://docs.github.com/en/rest/git/refs).

The concern is normal repository/token write capabilities, not protection against an omnipotent administrator. Even protected ledger guarantees must explicitly trust the owner not to remove the protection. Administrative configuration changes remain auditable but cannot be cryptographically prevented by this repository alone. An unprotected-ref design could offer at-most-once behavior under an additional trusted-writers assumption; that weaker assumption has not been approved and is not silently substituted here.

### Proposed minimal protected-ledger design — NOT applied

Use existing GitHub storage rather than new Cloudflare/D1 infrastructure. Separately approve a repository tag ruleset for `refs/tags/preview-deploy-consumed/*`, enforcement active, update and deletion restricted, no bypass actors; allow creation. Verify actual plan/API enforcement and a disposable test namespace before relying on it. No release tags are proposed; these are operational authorization records. Creation permissions and namespace ownership must be reviewed before granting a narrowly scoped claim job `contents: write`.

Keep an owner-controlled approved authorization record binding:

- unique authorization ID and expiration;
- application SHA, successful source run ID/attempt, exact artifact ID, archive digest and trusted manifest digest;
- reviewed workflow implementation SHA and expected current Preview HEAD;
- repository, Worker `tri-app-preview`, Environment `preview`, and maximum one upload attempt.

Inputs only select an existing approved record; they cannot authorize arbitrary SHA/digest values. The approval record must be protected against modification and created through a separately authorized owner process. A changed workflow implementation needs a new reviewed authorization. Application SHA must remain the original approved artifact SHA, never substituted by `GITHUB_SHA` of newer deployment tooling.

Manual `workflow_dispatch` only, actual dispatch ref `preview`, fail closed on PR/push, absent/mismatched/expired authorization, wrong run/artifact/source SHA, missing protection or permanent activation. The manual workflow must also be available through GitHub's dispatch/default-branch registration rules; no default-branch changes are authorized here. Do not spoof a push event or turn the permanent activation variable on to reuse the existing guard.

Inside the existing `tri-app-preview-publish` serialization boundary: verify source CI/check identities and immutable artifact, validate expected Preview HEAD and reviewed implementation, perform read-only Cloudflare preflight, then atomically claim the authorization **before** invoking upload. Claim metadata records application/workflow SHAs, CI/artifact identity, run ID and attempt. Only confirmed creation and matching readback permit one upload invocation. Existing claim, write conflict, ambiguous response, timeout or rerun must stop; never delete/reset claims or automatically retry. Consume conservatively even if upload fails: a new attempt requires a new owner authorization. This guarantees at most one attempted publication per authorization, not exactly-once success across two independent services.

Stale-SHA protection must compare the current Preview branch with the explicitly approved workflow/branch HEAD, while artifact verification compares the manifest with the separately approved application SHA. Merely testing ancestry is insufficient. No different application build, implicit HEAD replacement or independent rebuild is allowed.

### Cloudflare preflight and rollback requirements

Before consuming a future authorization, require successful read-only retrieval and durable recording of current Preview deployment ID, active version IDs/traffic split, expected ordinary bindings/values, D1 UUID, eight secret names only, cron and exact Custom Domain association. Validate domain routes to `tri-app-preview`; insufficient scoped-token access is a hard STOP, never permission broadening or Production fallback. Record previous known-good version/package and compare settings/domain after upload. Do not proceed when rollback baseline is absent. Existing deployment script needs explicit Custom Domain and non-null rollback-baseline enforcement for this path; its current behavior is not claimed to satisfy the new contract.

Future first deployment: approve infrastructure/ledger trust boundary → implement and qualify with disposable authorization IDs and fake upload → integrate via reviewed PR without activation → owner issues one exact approved record → manual dispatch on Preview → preflight/claim/one upload/smoke → owner physical-device review. Any uncertain upload stops for inspection; no automatic rollback or retry.

### Validation actually performed and next qualification

Existing pipeline safety suite **23/23 PASS** (including existing artifact tampering and stale-SHA fixtures); `git diff --check` and new documentation link checks PASS. No new authorization code exists, so negative authorization, duplicate/concurrent claims, record-deletion denial, crash/timeout, wrong SHA/run/artifact/digest, expired record and run-attempt tests are **NOT RUN**. No new YAML/shell workflow to validate and no isolated GitHub Actions qualification executed. Do not treat existing tests as proof of single-use enforcement.

After separate ruleset/claim-permission approval, qualify against a disposable protected namespace with fake Cloudflare/upload; prove exactly one of competing claims succeeds, consumed record cannot be updated/deleted by the job token, reruns cannot upload, and every invalid authorization fails closed. Never consume a real deployment authorization in tests. A successful ledger test still does not authorize live deployment.

Evidence: `/tmp/300w-devops03b2c6a/` holds artifact/run metadata, rulesets/permission responses, original run log archive, extracted manifest digest evidence and existing safety output. Runtime/data/artwork, existing unfinished Profile work, Git index/HEAD, credentials, activation and infrastructure are unchanged. **STOP for owner decision on protected ledger and bounded GitHub write permissions.**


## DEVOPS-03B.2C.6B — Simplified manual first deployment (2026-10-28)

**Local candidate implemented / Awaiting Owner Review. No live deployment.** Owner rejected the protected authorization ledger proposed in C.6A. No authorization registry, consumed-ID journal, GitHub App, write claim permission or external store is introduced. Historical C.6A assessment remains evidence, not the selected architecture.

### Exact minimal implementation scope

- New `.github/workflows/preview-manual.yml` (JSON-form YAML): explicit `workflow_dispatch` only; six required string inputs; Preview-only job guard and Environment; read-only Contents/Actions permissions; existing non-cancelling `tri-app-preview-publish` concurrency group; existing pinned tooling; exact source artifact download, existing deploy script, existing smoke and evidence upload. No build, push/PR trigger or permanent activation.
- New `scripts/preview-manual-preflight.mjs`: manual-context validation; source CI/current ref/artifact metadata verification; rollback/domain validation; conservative same-commit refusal.
- `scripts/deploy-preview-artifact.mjs`: retain automatic mode and its activation guard; add explicit manual mode with the independent manual checks. Manual preflight additionally requires a non-null reviewed rollback deployment/version, Custom Domain and public health check; records sanitized baseline; rechecks live deployment and Preview Git SHA before upload; compares domain after upload. Existing artifact verifier, CLI upload, post-binding/cron verification and smoke are reused.
- New `scripts/test-preview-manual.mjs`: negative/context/CI/artifact/domain/rollback/rerun fixtures and integrated fail-before-CLI checks.
- This plan and Project Board only. Permanent `.github/workflows/preview-ci.yml` is unchanged. No runtime, data, artwork, dependencies, version, infrastructure or unfinished Athlete Profile changes.

Review patch: `/tmp/300w-devops03b2c6b/proposed.diff` (code/workflow/tests only); local evidence and preservation inventory in the same directory. All changes remain uncommitted and unpushed.

### Manual launch procedure — future, separately authorized

1. Review/qualify this candidate and separately authorize Git integration. GitHub manual workflow registration normally requires the file on the default branch; that registration/default-branch change is **not performed or authorized here**. See [GitHub manual workflow requirements](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). Do not work around this by adding a deployment push trigger or enabling permanent activation.
2. After integration, choose the **current exact Preview SHA**, obtain its completed successful push-to-preview `Preview CI` run and both `Portable verification`/`Browser verification` successes. Obtain the immutable package artifact ID and trusted manifest digest from that run's packaging log. Confirm the artifact is unexpired. Owner approves this exact candidate before publication.
3. Record the current Cloudflare Preview deployment ID and active version as the reviewed rollback baseline via read-only access. If inaccessible with the existing scoped token, STOP; do not broaden permissions. Keep permanent activation absent/false.
4. Actions → Manual first Preview deployment → Run workflow → branch `preview`. Inputs: `expected_sha`, `ci_run_id`, `artifact_id`, `manifest_digest`, `rollback_deployment_id`, `confirmation=deploy-preview`. No tokens entered in workflow inputs/chat; use existing Environment secret/variable only.
5. Inspect source verification and preflight before upload; exactly one Wrangler invocation per passing job, no automatic retry. After upload inspect recorded deployment/version IDs, SHA/routes/artwork smoke and unchanged bindings/cron/domain. Owner performs physical iPhone QA separately.

**SHA policy:** `expected_sha == dispatch GITHUB_SHA == current preview HEAD == source CI SHA == artifact manifest SHA`. Application and workflow SHA are recorded separately, but this minimal mode deliberately requires equality. Integrating the manual code creates a new Preview SHA, so artifact `12808930340` for old SHA `558b7ae1` will be rejected as stale. That old authorization is not silently upgraded. A newly reviewed Preview commit and its CI artifact will be required. Deployment itself never rebuilds; the ordinary prerequisite CI produces the approved package. Supporting an older application artifact with a newer workflow would require a separate, broader design and is not implemented.

### Source/artifact verification

Read-only GitHub verification requires the exact source run ID, repository, push event, Preview branch, permanent workflow path, completed success and both successful checks from the same run attempt. Reject incomplete/ambiguous jobs metadata. Exact artifact ID must belong to that run and SHA, match the run-attempt package name, have valid archive digest metadata and unexpired status. Download selects only that ID from that run/repository with `merge-multiple: true`; no wildcard selection. Existing trusted manifest digest, exact file inventory/hashes, Worker/config, lockfile and version verification remains unchanged. Owner must obtain the manifest digest from the reviewed CI evidence, not substitute the archive digest. Public health requests receive no Cloudflare token.

### Rerun safeguards and limitations

This is **not strict single-use authorization**. Workflow dispatch is technically rerunnable by authorized repository writers. Safety comes from exact candidate binding, common concurrency, fresh Preview HEAD checks, source CI verification, required reviewed rollback deployment ID and conservative same-SHA refusal.

If the current deployment ID differs from the supplied reviewed baseline, stop before upload. If health already reports the target SHA, record `STOP_ALREADY_PRESENT_NO_UPLOAD` and fail closed; inspect the retained version/artifact/smoke evidence separately. This is not claimed to prove all deployed bytes equal the package and does not mark smoke PASS. Re-running after a successful upload or failed post-upload smoke cannot silently overwrite a different commit with the old inputs. Ambiguous timeout/failure must be inspected manually; if the baseline truly remained unchanged, a separately approved rerun can still publish the same reviewed candidate. No automatic retries, claim journal, permanent activation or automatic rollback.

The shared lock serializes these workflows, not an owner's external CLI/Dashboard writer. Avoid simultaneous external deployments. A small race after the last live-state read is not represented as cross-system transactional protection.

### Cloudflare preflight and recovery

Manual mode preserves exact compatibility date, ordinary binding values, eight secret names, D1 UUID, rate limiter and cron checks. It requires the reviewed current deployment ID and one active version with 100% traffic; split traffic or missing rollback information is a STOP. GET the filtered [Worker Custom Domain endpoint](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/list/) for hostname `preview.300w.app` and service `tri-app-preview`; require one enabled matching association and record it. After upload compare the domain response and existing binding/cron invariants. No domain/DNS/routes mutation, D1 operation or Production API target is introduced.

A scoped token may reject the domain-list or deployment/settings read; actual permission compatibility is unverified. HTTP failure stops before upload and requires owner review, never broader permissions. Baseline evidence contains deployment/version, expected vars/bindings/secret names, cron and domain, but no secret values. It is retained through the existing failure-artifact mechanism.

On failed/uncertain upload, inspect sanitized Wrangler log and current version/deployment IDs read-only before any new invocation. On smoke failure, publication may already be active; report it. Rollback is a separate owner-authorized Preview-only action to the recorded previous version/package under the same serialization policy, followed by health/route verification. No automatic rollback and no Production fallback.

### Verification actually performed

- `node --test scripts/test-preview-pipeline.mjs scripts/test-preview-manual.mjs`: **53/53 PASS** (existing 23 + new 30). Existing artifact-integrity and automatic-mode guards remain covered.
- Integrated manual tests use mocked read-only GitHub/Cloudflare responses and fixture packages; wrong/changed baseline, missing domain, domain HTTP 403 and already-present SHA all stop before Wrangler. No live Wrangler invocation or Cloudflare credentials used.
- YAML/JSON parsing, all workflow shell snippets (`bash -n`), Node syntax and `git diff --check`: PASS. No new dependencies installed. This is local validation, not GitHub Actions/manual-dispatch/Cloudflare qualification.
- No production build/full browser rerun: runtime and browser assertions unchanged. Linux qualification, actual dispatch registration, scoped-token/domain access, upload and smoke are **NOT RUN** in this task.

Recommendation: review the local candidate, then separately authorize no-deploy CI qualification and minimal workflow registration/integration. Only after current Preview SHA/artifact and rollback baseline are reviewed should first live manual publication be authorized. Permanent Auto Deploy remains disabled until subsequent explicit approval. **STOP BEFORE MERGE OR DEPLOYMENT.**


## DEVOPS-03B.2C.6C — Manual mode Linux qualification (2026-10-28)

**Fixture-based Linux qualification PASS / Awaiting Owner Review. No live deployment or merge.**

- Isolated clone `/tmp/300w-devops03b2c6c/qualification`, branch `ci/manual-preview-qualification`.
- Qualification SHA `46fb894c88878f2f33ba0077df29812975dc272f`, parent approved development `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`. One commit and one normal qualification push.
- [GitHub Actions run 40699144441](https://github.com/shyandrey/tri-app/actions/runs/40699144441): Manual safety qualification **SUCCESS**, Deployment disabled in qualification **SKIPPED**.
- GitHub-hosted Ubuntu 24.04, pinned Node 24.19.0; workflow accepted, runner/toolchain/checkout/shell validation/evidence upload PASS.
- Local and Linux tests **58/58 PASS**, 0 failures. Existing pipeline 23 + manual candidate 30 + five supplemental negative cases. No test retries.

### Exact qualification and future integration scope

Six files in the isolated commit: the four manual candidate files (`.github/workflows/preview-manual.yml`, `scripts/preview-manual-preflight.mjs`, `scripts/deploy-preview-artifact.mjs`, `scripts/test-preview-manual.mjs`) plus qualification-only `.github/workflows/manual-qualification.yml` and `scripts/qualification-no-network.mjs`.

The workflow/helper/deploy implementation is byte-identical to the reviewed local C.6B candidate; only the isolated test file adds five qualification tests. The supplemental tests remain in the qualification copy pending integration review, not silently applied to the primary working tree. Qualification workflow runs only on `ci/manual-preview-qualification`, has Contents-read only, no Environment and no Cloudflare secrets. Deploy sentinel is unconditionally false. Global live `fetch` is disabled for the test process; controlled fetch fixtures are passed explicitly. No production runtime, data, artwork or dependency changes.

Exact proposed four-file integration diff: `/tmp/300w-devops03b2c6c/integration.diff`. It excludes both qualification-only files. Future documentation scope is only relevant DEVOPS plan/Board sections; unrelated backlog and unfinished Profile remain excluded. Do not merge/cherry-pick the complete qualification commit blindly.

### Negative checks and evidence boundaries

| Case | Actual verification |
| --- | --- |
| Wrong application SHA / workflow GITHUB_SHA | Rejected by manual-context fixtures |
| Wrong numeric artifact ID / source run / attempt / source SHA | Rejected by controlled GitHub responses |
| Wrong manifest digest / modified or missing files | Existing package-verifier fixture tests reject |
| Stale Preview HEAD | Source-ref rejection; existing deployment stale-SHA fixture |
| Changed rollback deployment ID | Integrated manual preflight stops before CLI |
| Already-published target SHA | Integrated fixture stops before CLI; not strict single-use |
| Missing Environment or branch restriction in workflow | Mutation rejected by static qualification contract |
| Missing Actions/Contents permissions in workflow | Mutation rejected by static qualification contract |
| Missing credentials / GitHub 403 / Cloudflare domain 403 | Local controlled checks fail closed before upload |
| Deployment job | SKIPPED; no Environment/Cloudflare credentials exposed |

The Environment tests validate workflow configuration, **not** live GitHub Environment branch-policy enforcement; no remote policy was removed or changed. Artifact-ID/manifest checks used controlled metadata and local fixture packages, **not** a fresh download of historical artifact `12808930340`. Source artifact existence/metadata evidence remains from C.6A and must be refreshed before use. No claim of new live Cloudflare read/write verification or full manual dispatch execution is made. All mocked Cloudflare calls are asserted GET-only, and failure cases stop before Wrangler; no live Wrangler upload was executed.

Run logs saved in `/tmp/300w-devops03b2c6c/run-logs.zip` and `logs/`. [Test evidence artifact 12819948786](https://github.com/shyandrey/tri-app/actions/runs/40699144441/artifacts/12819948786) retained until 2026-11-04, archive SHA-256 `5ac8ceffc446ea09263880b35fe1c03847a247917cec69cae7acd098659fce4d`. Initial local setup command used the clone as source by mistake and failed before tests could load; source path was corrected, then 58/58 passed. This setup failure is not concealed as a successful test attempt. GitHub first run passed without rerun.

No full build/browser qualification repeated: application and browser code unchanged, tests use Node built-ins and do not require dependency installation. Manual/qualification workflow parsing and shell syntax, documentation links and `git diff --check` PASS.

### Safe PR and merge procedure — not executed

1. Owner approves the exact four-file diff (including supplemental tests), relevant documentation, and explicit handling of manual-workflow registration on GitHub. Default-branch registration is a separate reviewed change if necessary; no default-branch or settings change in this task.
2. Prepare a clean integration branch from the then-current Preview baseline. Apply only approved files; exclude the qualification push trigger/no-network harness and unrelated local work. Do not create a PR from this qualification branch wholesale.
3. Open reviewed PR to `preview` with permanent activation absent/false. New manual workflow has only workflow_dispatch and Preview-ref guard, so PR/push cannot invoke manual publication. Verify unchanged permanent pipeline gate; Portable and Browser must pass before separately authorized merge.
4. After merge, record the **new exact Preview HEAD** and successful push CI run, run attempt, immutable artifact ID and trusted manifest digest from that same run. Explicitly reject reuse of historical `558b7ae1`/run `40671035849`/artifact `12808930340` when HEAD differs. No application/workflow SHA substitution or deployment-time rebuild.
5. Owner reviews and authorizes that exact current SHA/artifact plus current Cloudflare rollback deployment/version. Re-read Environment branch restrictions, disabled permanent gate and live scoped-token/domain/bindings/secret-name/cron checks. Any unavailable permission/baseline is a STOP.
6. Only after separate first-deployment authorization, dispatch on `preview` with exact reviewed inputs. Inspect upload IDs and post-deployment smoke; no retry/rollback automatically. Physical iPhone review remains owner work.

Remaining live checks: Environment branch restriction/read-only token capabilities; scoped Cloudflare settings/deployments/domain GET access; current deployment/version and 100% traffic rollback baseline; ordinary bindings/eight secret names/cron; domain association; fresh artifact download/integrity; actual manual dispatch and post-publication smoke. None is replaced by fixture PASS.

### Preservation

Remote development remains `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`, Preview remains `558b7ae11f593ce32310b673423d3ac61b87748d`. Primary branch/index unchanged; all original file hashes preserved except the two requested documentation updates. Existing uncommitted manual candidate and unfinished Athlete Profile are untouched. No activation, PR, merge, Cloudflare settings/credentials, D1, version or runtime changes. **STOP FOR OWNER REVIEW.**


## DEVOPS-03B.2C.7 — First Auto Deploy preflight (2026-10-28)

**BLOCKED before activation/publication. No first version was published.** Owner requested Environment-only activation and explicitly excluded repository-wide activation and manual-mode files.

### Fresh read-only findings

- Protected Preview HEAD `558b7ae11f593ce32310b673423d3ac61b87748d`.
- [CI run 40671035849](https://github.com/shyandrey/tri-app/actions/runs/40671035849): Portable verification SUCCESS, Browser verification SUCCESS, Deploy verified Preview SKIPPED.
- Protection enforces admins, strict required Portable verification; Environment selected branch policy contains only branch `preview`.
- Environment secret metadata contains `CLOUDFLARE_API_TOKEN`; nonempty Environment variable `CLOUDFLARE_ACCOUNT_ID` exists. No secret values retrieved/printed. Presence is not proof of Cloudflare permission compatibility.
- `PREVIEW_AUTO_DEPLOY_ENABLED` absent at both Environment and repository scope. Neither was changed.
- Exact remote workflow was fetched from Preview and matches the committed implementation inspected locally. Local uncommitted manual-mode implementation was not used.

### Verified workflow incompatibility

Current `jobs.deploy.if` is:

```yaml
if: github.event_name == 'push' && github.ref == 'refs/heads/preview' && vars.PREVIEW_AUTO_DEPLOY_ENABLED == 'true'
```

This job-level condition is evaluated before Environment variables become available on the runner. Setting only Environment `preview` activation cannot satisfy the existing job gate. The original design explicitly used a repository-level variable (C.2 above), which the current owner instruction prohibits. Do not substitute that scope or silently enable both. [GitHub variable availability](https://docs.github.com/en/actions/reference/workflows-and-actions/variables) and [contexts](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts) document this boundary.

A trigger-only commit under current settings would run CI and skip publication again. No empty/technical commit or PR was created merely to produce a known skip.

### Mandatory live preflight remains unresolved

No fresh Cloudflare settings/deployments/domain request was made with the scoped Environment token: GitHub secret metadata does not disclose the token, and no approved read-only Environment preflight job currently exists. Current rollback deployment/version IDs, live binding/secret-name/cron invariants and Custom Domain have therefore **not been verified**. No Cloudflare 403 or permission success is claimed.

Inspection of the committed automatic deploy script also shows two gaps relative to this task: it permits a null `previousDeployment`, and it does not read/compare Custom Domain association. The uncommitted manual-mode additions are not copied in as a workaround. Existing live binding/secret-name/cron checks do not replace the missing requirements.

### Smallest proposed correction and safe sequence — not implemented

1. Keep job-level restriction to push on `preview` and successful Portable/Browser dependencies. Move the activation evaluation to a runner step after binding Environment `preview`; derive an explicit enabled output from its Environment variable. Gate every credential-bearing/deployment/smoke step on that output. Keep the deploy script's independent activation assertion. Absent/false must never invoke Wrangler or expose Cloudflare credentials to unnecessary steps. Preserve concurrency, exact artifact and stale-SHA checks; no repository-wide flag.
2. Add a Preview-Environment **read-only preflight phase**, independent of activation, which reads settings, eight secret names, cron, current deployment/version traffic and filtered Custom Domain. Require a non-null rollback baseline; retain sanitized evidence. No upload, DNS/route/binding change or D1 operation. Reuse these checks immediately before upload and compare domain/bindings afterwards.
3. Qualify the scope correction and missing-preflight checks with disabled flag and controlled fixtures. Separately approve the technical workflow/script change and PR while activation stays off; collect actual scoped-token read-only preflight evidence. If any API permission/schema check fails, STOP without broadening permissions.
4. Only after that evidence passes, set **Environment-only** activation under owner authorization and use a reviewed technical Preview promotion. Verify new CI/artifact/SHA and exactly one first publication; on failure disable only that Environment flag, preserve IDs/logs and propose recovery without automatic rollback.

This sequence needs an explicit reviewed pipeline correction before first publication; current qualification evidence does not cover the changed activation scope or new live preflight. No manual deployment workflow, claim ledger or external store is needed.

### Actual outcome and preservation

No activation, commit/push, PR, merge, CI trigger, Wrangler upload, smoke, Cloudflare/Production/D1/credentials changes or rollback occurred. First deployed SHA, version/deployment IDs and rollback baseline remain **not available for this attempted task**. Do not populate them from historical guesses.

Only this report and Project Board updated. Evidence `/tmp/300w-devops03b2c7/` contains fresh GitHub API readbacks and original file hashes. No tests/build/browser suites rerun for this read-only preflight; documentation links and `git diff --check` PASS. Development HEAD/index and all pre-existing code/artwork/Profile changes preserved. **STOP FOR OWNER REVIEW: Environment-scoped activation and mandatory live-preflight gaps must be corrected before deployment.**

## DEVOPS-03B.2C.7A — Preview activation and mandatory preflight (2026-10-28)

**Implemented / Linux qualification PASS / Awaiting Owner Review. Activation remains disabled; no merge/deployment authorized in this change.**

Isolated branch `ci/preview-activation-preflight` starts from development `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`. Only three pipeline/test files plus these two documentation files are included. Uncommitted manual-mode files, Profile work and historical local artifacts are excluded and preserved in the primary tree.

- Deploy job retains successful Portable/Browser dependencies, push-to-preview guard, Environment `preview`, exact-artifact verification and serialized concurrency. Its first runner step evaluates the Environment activation variable; only exact `true` enables subsequent steps. Checkout, tools, artifact download, credential-bearing upload, smoke and evidence upload all require the enabled output. Disabled invocation finishes without exposing Cloudflare credentials to any step. No repository-wide activation variable was created.
- Deployment script additionally pins the nonsecret approved Preview account identity (fresh Environment readback), validates target `tri-app-preview`, requires a valid rollback deployment UUID and one version at 100% traffic, reads the filtered `preview.300w.app` Custom Domain and requires correct Worker/enabled state. Existing binding/eight secret-name/ordinary-var/D1 identity/cron assertions remain intact. Rollback baseline is rechecked before stale-SHA verification/upload; domain association is compared after upload. Read errors/drift/missing information stop before Wrangler; no permission broadening/retry.
- Custom Domain API schema reference: [Cloudflare List Worker Domains](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/list/). No live Cloudflare reads/writes were performed for fixture qualification. Token permission compatibility and real rollback IDs remain future mandatory preflight evidence; fixture success does not establish those facts.

Local validation: **45/45** pipeline tests PASS (existing integrity/activation/bindings/stale-SHA contracts plus negative rollback/domain/account/drift fixtures and exact activation shell tests). Absent, empty, false, uppercase and whitespace variants all disable; exact true enables in a credential-free fixture only. Structural tests require guards on every downstream deploy step. YAML syntax, targeted expression/context checks, JS syntax, 14 bash syntax checks and `git diff --check` PASS. `actionlint` unavailable; GitHub workflow acceptance remains part of PR qualification. No package/dependency/application changes; no unrelated local build/browser rerun requested.

Fresh GitHub readback: protected Preview remains `558b7ae11f593ce32310b673423d3ac61b87748d`; Environment branch policy only `preview`; activation absent in repository and Environment. Primary index remains empty. Evidence: `/tmp/300w-devops03b2c7a/`.

Qualification uses the ordinary PR pipeline on Ubuntu: Portable verification executes the exact gate shell fixtures and preflight negatives; Browser verification uses the verified artifact. Actual credential-bearing deployment job is skipped for PR events. This qualifies code/shell and workflow acceptance, not live Cloudflare permissions or actual publication. Do not enable activation or merge this PR automatically.

Next controlled-deployment prerequisites: review successful PR CI and exact diff, recheck activation off before any separately authorized merge; approve first publication separately; verify live scoped-token preflight and rollback evidence before upload. No manual-mode workflow or authorization ledger is introduced.

### C.7A actual PR qualification outcome

- One commit: `1a90f11e94453a327f0140d6b6270123e788dbcc` — `fix(ci): gate Preview activation and require live preflight`.
- [PR #2](https://github.com/shyandrey/tri-app/pull/2), head `ci/preview-activation-preflight`, base `preview`; **open, not merged**. Exactly five files listed above; one normal feature-branch push, no development/Preview push.
- [Ubuntu run 40702573629](https://github.com/shyandrey/tri-app/actions/runs/40702573629): **SUCCESS**. Portable verification PASS (portable photo, PTO identity/registry, official standings, release gate including build/lint); pipeline tests **45/45 PASS** including exact activation shell and negative Cloudflare fixtures. Browser verification **7/7 PASS**: official-rankings, rankings-controls, rankings-swipe, rankings-showcase, navigation, calendar, more. First run only; no retries.
- `Deploy verified Preview`: **SKIPPED** by PR event guard. No Cloudflare API requests/live deployment occurred. Tests run with controlled fixtures, not Environment credentials. Actual Environment runner activation on a Preview push and live scoped-token permissions remain untested until separately authorized integration/preflight.
- Final GitHub readback: activation still disabled in repository and Environment; Preview remains `558b7ae11f593ce32310b673423d3ac61b87748d`, development remains `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`. Primary index empty; all original files except these two requested reports hash-identical. Candidate clone clean at the PR commit. Post-run documentation results are local/uncommitted; no second commit/push.
- Evidence: `/tmp/300w-devops03b2c7a/run-logs.zip`, `final-jobs.json`, `final-check.json`, `tests.log`, snapshots and isolated candidate. YAML, 14 shell syntax checks, documentation targets/anchors and final `git diff --check` PASS. No dependency installation or runtime/data/artwork changes locally.

**Ready for owner PR review; not authorization to merge, activate or deploy.** Before any future merge, recheck activation remains off. Then obtain separate first-deployment approval and mandatory live preflight; permission/identity/rollback/domain mismatch must stop before publication. No automatic permission expansion or rollback.


## DEVOPS-03B.2C.7D — Scoped-token domain preflight correction (2026-10-30)

Status: implemented; PR Linux qualification PASS; awaiting owner review. No merge or deployment authorized in this task.

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

Final result: [PR #4](https://github.com/shyandrey/tri-app/pull/4), commit `4d30342d4d1c0b21c3b078ad693394fe95014f44`; [Linux run 41046856568](https://github.com/shyandrey/tri-app/actions/runs/41046856568) PASS. Portable/build/lint/release gate PASS, safety 54/54 PASS, browser suites 7/7 PASS (official-rankings, rankings-controls, rankings-swipe, rankings-showcase, navigation, calendar, more). Deploy SKIPPED. Preview HEAD remains `b3f802f4ce8cca53da1f4dc623df7c7b9499afb1`; Environment activation false, repository activation absent; PR open/unmerged. No live Cloudflare calls or deployment in this task. Final outcome is recorded locally after the single approved commit; no second commit/push.


## DEVOPS-03B.2C.7E — Merge completed; pre-activation scoped preflight blocked (2026-10-30)

PR #4 exact head `4d30342d4d1c0b21c3b078ad693394fe95014f44`, five file/blob identities, protection and successful Portable/Browser checks were verified. Environment activation was false; repository activation absent. Normal protected merge succeeded: Preview HEAD `157ea045c7da56710d9bbf4598fe49d34825872f`.

[Post-merge run 41050029666](https://github.com/shyandrey/tri-app/actions/runs/41050029666): Portable PASS; Browser PASS (seven qualified suites). Artifact integrity/SHA checks ran in Browser CI. Deployment job completed successfully only because its activation check ran: checkout, tools, artifact download, Wrangler deployment, published smoke and deployment evidence steps were all SKIPPED. No Cloudflare credentials were consumed by this run.

Confirmed blocker before task step 3: the scoped Individual Workers Editor token exists only as GitHub Environment `preview` secret. Local `CLOUDFLARE_API_TOKEN` is absent. The existing workflow has no standalone read-only preflight: credential-bearing steps require activation true, and its deployment script continues from successful scoped preflight directly into Wrangler. It therefore cannot establish the specifically requested fresh scoped preflight *before activation* in its current form. No broader local OAuth token was substituted, no token was extracted/requested, and no permission failure is claimed: scoped reads were not attempted. Local OAuth was expired, but refreshing it would not establish scoped-token access.

Environment branch policy remains `preview` only; account ID matches the pinned identity; secret name is present. Owner Dashboard domain baseline of 2026-10-30 remains accepted; no account-level Domains GET was attempted. Fresh Cloudflare bindings, secret names, cron and rollback IDs were NOT independently verified this turn. Historical rollback IDs must not be presented as fresh evidence.

Status: BLOCKED before activation / owner review. Trigger PR not created; no new technical commit/push, no deployment/version ID or post-publication smoke exists for this attempt. Activation remains false, repository activation absent. Production and D1 were not accessed or mutated. All pre-existing local files/index were unchanged before these append-only task report updates.

Minimal next decision: separately authorize mandatory scoped preflight at the start of the activated deployment job, strictly before Wrangler (existing fail-closed implementation), or authorize a separate read-only Environment preflight mode before activation. Neither alternative was implemented or run here. No automatic retry or rollback.

Evidence: `/tmp/300w-devops03b2c7e/` contains preflight/merge/readback JSON, complete Actions logs and local preservation hashes.


## DEVOPS-03B.2C.7F — First successful Preview Auto Deploy (2026-10-30)

Status: deployment and automated smoke PASS / awaiting owner physical-device review.

Owner explicitly authorized mandatory scoped Cloudflare preflight inside the existing deployment job immediately before Wrangler. The accepted Dashboard Custom Domain baseline remains `preview.300w.app` → `tri-app-preview` (2026-10-30); no account-level Domains GET or additional workflow was used.

- Starting Preview SHA: `157ea045c7da56710d9bbf4598fe49d34825872f`; protection, prior CI, Environment branch restriction, secret name/account ID and absence of other open PRs verified.
- Development was fast-forward synchronized in an isolated copy to the approved Preview baseline. Sole new commit: `3ce7c4764ae18429f9992c2d572bf28d51238beb`, documentation-only `docs/preview-first-deployment-checklist.md`.
- [Trigger PR #5](https://github.com/shyandrey/tri-app/pull/5), normal protected merge: `68f32ee2871084b237d2b627ed43f4a0fae956b6`.
- [PR CI 41052436846](https://github.com/shyandrey/tri-app/actions/runs/41052436846): Portable and Browser PASS; deploy SKIPPED on PR.
- [Publication run 41053899741](https://github.com/shyandrey/tri-app/actions/runs/41053899741): Portable/build/lint/release gate PASS, safety 54/54 PASS, Browser 7/7 PASS, deployment PASS, smoke PASS. No workflow rerun or second upload attempt.
- Verified artifact manifest digest: `c6ba68e56f2e4fa7c45750a5dcd2c126afbae93e1412435fff7950380f180d86`. Exact CI artifact reused, no independent deployment build.
- Scoped preflight passed: pinned account/Worker, artifact SHA/integrity, bindings and eight secret names, cron `*/5 * * * *`, fresh rollback deployment/version, rollback recheck and current Preview Git SHA. Post-publication settings/secret names/cron assertions also passed.
- New Preview deployment ID: `515b0f9a-9d4d-4a02-8b08-bd3ab4d6f278`; version ID: `0daabd70-1e91-4479-9e33-4d763ab0cc2c`.
- Fresh rollback baseline captured by job: deployment `e441f5f7-05d9-41dc-bbf9-594acb29fd82`, version `84653431-5134-4216-813a-2b5bb4c573fc` at 100%. No rollback executed.
- Published `https://preview.300w.app/api/health`: HTTP 200, commit `68f32ee2871084b237d2b627ed43f4a0fae956b6`, unchanged version `0.0.0`.
- Smoke: Home, Calendar, Rankings, Athlete, Race, More; navigation and responsive artwork at 390×844 and 844×390 PASS; browser errors empty. `deployment.json` ends at `deployed-awaiting-smoke` because smoke writes its separate authoritative `smoke.json` with PASS.
- Production isolation: only `tri-app-preview` was a deployment target, scoped token unchanged. Public Production health remained HTTP 200 with SHA `c8f52e02a75e0b413dddbfee77f477232c5301d3` before/after. No Production management API operations, D1 migrations/direct writes or permission expansion were performed. No fresh Production configuration snapshot is claimed.
- Final activation: Environment `preview` variable `PREVIEW_AUTO_DEPLOY_ENABLED=true`; repository activation variable absent. Protected future Preview promotions can now auto-deploy. No further merge or publication performed after this success.

Evidence and screenshots: `/tmp/300w-devops03b2c7f/`; deployment artifact `12975414278`. GitHub polling encountered transient read-only connection timeouts; only status reads were resumed, never workflow runs or deployments. Main working-tree HEAD/index and all pre-existing dirty/untracked files were preserved; only this report and Project Board received append-only local outcome updates. No extra report commit/push.

Remaining review: physical iPhone/Telegram QA is still required. HTTPS success proves reachability/content, not unchanged Cloudflare domain ownership/routing. Existing sports chunk warning remains the accepted performance limitation. Stop for owner review; no further automatic agent actions planned.

## DEVOPS-04 — ATH-UI-01 smoke recovery and bounded readiness

Date: **2026-10-31 Europe/Moscow**. Status: **existing published version recovered by full read-only smoke; readiness correction prepared for owner review. Auto Deploy remains disabled.** No redeployment or rollback.

### Verified published identity and artifact

- GitHub `preview` HEAD and repeatedly observed HTTPS `/api/health`: `653273420e2aaff3c49725500a935701d4dfd286`, version `0.0.0`.
- Original [deployment run 41127262740](https://github.com/shyandrey/tri-app/actions/runs/41127262740), immutable package artifact **13011965445**, name `preview-package-653273420e2aaff3c49725500a935701d4dfd286-41127262740-1` (95,108,831 bytes).
- ZIP SHA-256 verified against GitHub artifact digest: `c14fd01a35fa26f478aa5bf054ed2e0fe53739ef741e001b592c642ede24f069`.
- Manifest SHA-256 verified against the original deployment log: `19a667e0f0d4d94642cc8e09336cccc47f128df695dd9a8d3e2b2b19270af6a4`.
- Existing `preview-artifact.mjs verify` passed exact manifest SHA, source SHA, complete file inventory, lockfile and Preview configuration checks. **No rebuild substituted for this artifact.** First download timed out at 60 seconds; one bounded read-only retry of the same artifact completed with a 180-second download limit.
- Existing unmodified smoke script from the deployed source passed published HTML SHA-256 equality against `manifest.files['dist/index.html']`, health/version, news API, Home/Calendar/Rankings/Athlete/Race/More, five-tab navigation, athlete/result/Back links, no overflow, responsive WebP artwork and zero browser errors at 390×844 and 844×390.
- **ATH-UI-01 is ready for Owner Visual QA.** Physical iPhone/Safari QA remains separate. The historical GitHub run remains failed; this is a separately recorded recovery PASS, not a rewritten CI result.

### Observed race and limits of diagnosis

Wrangler publication and Cloudflare post-publication version/configuration checks succeeded. At **2026-10-30 21:09:24.990 UTC (31 October 00:09:24.990 Moscow)**, the immediate first smoke request returned the previous Preview SHA `c43182ca3927b4264f9fd560ca02c39776021242` instead of the expected SHA. Later health checks returned the expected new SHA. Three additional samples at 21:13:47.987, 21:13:50.133 and 21:13:52.231 UTC consistently returned the new SHA/version, with `Cache-Control: no-store`, no `Age`, no `CF-Cache-Status` and AMS Cloudflare ray IDs. Full smoke and a final health check also passed.

This establishes a **transient visibility mismatch between successful publication and the first public health response**, sufficient to justify narrowly bounded waiting for the known previous version. It does **not** prove a precise global propagation time or distinguish Worker edge rollout from another stale-response mechanism: original response headers/POP and intervening health samples were not captured. No evidence establishes a persistent runtime, identity or localization defect. Do not claim that later health alone proved the full smoke; the unchanged complete suite was actually run.

### Minimal correction (review candidate)

- `scripts/smoke-preview-ci.mjs`: before full smoke in GitHub Actions, wait at most **60 seconds** using a monotonic clock, **2-second interval**, at most **5 seconds per HTTP request** within the remaining deadline. Require **two consecutive** exact SHA/version observations; log observed SHA/version and elapsed time to stdout and `readiness.json`.
- Permit only the exact previous Preview SHA from the push event while waiting. Missing identity, unknown SHA, version/service drift, regression to the old SHA after seeing the target, HTTP/network failure, deadline expiry or a changed GitHub Preview HEAD fail closed. Do not interpret arbitrary deployments as propagation.
- Recheck GitHub Preview HEAD before and after each health observation and after full smoke. Preserve the existing non-cancelling `tri-app-preview-publish` concurrency lock across deployment and smoke. These guards detect overlapping branch promotion; they do not claim to prevent out-of-band Cloudflare writes. Unknown published SHA fails rather than waits.
- `.github/workflows/preview-ci.yml`: add only step-scoped read-only `GH_READ_TOKEN: github.token` and `PREVIOUS_PREVIEW_SHA: github.event.before` to the existing smoke step. No Cloudflare credential in smoke, no permission expansion, trigger/activation/environment/concurrency changes.
- `scripts/test-preview-pipeline.mjs`: deterministic injected-clock tests cover convergence, already-ready stability, never-ready timeout, unknown SHA, wrong version, mixed rollout, changed HEAD before/during requests, network failure, missing identity/token/context and preserved workflow protections.
- Existing artifact verification, exact HTML comparison, API/browser/navigation/artwork assertions remain unchanged. Local read-only recovery remains possible without GitHub Actions credentials; CI cannot silently omit the required context.

Validation: **65/65 pipeline/readiness tests PASS**, full lint PASS, JS syntax PASS, YAML parsed with installed Ruby Psych, shell syntax PASS for all 14 workflow run steps, `git diff --check` PASS. Actionlint/Python PyYAML/Node js-yaml were unavailable; no tools/dependencies installed. Build and release gate 18/18 from the deployed run remain valid for the recovered application; not rerun locally because no application/build/lockfile change occurred. The focused PR's ordinary Portable CI will run build/lint/release gate, while the existing Browser CI remains unchanged.

### Safety, evidence and next action

Preview Environment `PREVIEW_AUTO_DEPLOY_ENABLED=false` before and after recovery. No activation, merge, deployment, rollback, token/permission/configuration change or D1 operation. Production health remains SHA `c8f52e02a75e0b413dddbfee77f477232c5301d3`, version `0.0.0`. All runtime, data, localization and artwork files are untouched. TECH-01 remains OPEN; full catalog regeneration remains prohibited.

Evidence: `/tmp/300w-devops04/` — original ZIP/package, GitHub artifact metadata, health observations/headers, unchanged full smoke log/screenshots, final health/config readback and targeted test logs. Existing publication IDs remain deployment `e8224ef5-58c8-4a0b-be20-2913162725eb`, version `4d016450-829f-4133-b9fb-14e74f27a709`.

Next: owner review of focused readiness PR and CI results; normal merge only when separately authorized, with activation still disabled. Reactivation requires explicit owner approval after correction validation. No new Preview publication solely to test this fix. Complete physical-device ATH-UI-01 visual QA on the already published version.

DEVOPS-04 review PR: [#9](https://github.com/shyandrey/tri-app/pull/9), isolated branch `ci/preview-smoke-readiness`, commit `567339984811f93287cb93b4b072edef9b47e34d`. Exactly six paths: workflow, smoke script, pipeline tests, Project Board, this plan and ATH-UI-01 report. PR CI triggered; no remote PASS claim yet. No merge or reactivation performed. Final local documentation updates remain uncommitted in the preserved primary worktree.


## DEVOPS-04 — Owner closeout and reactivation (2026-10-31)

This outcome supersedes the review/disabled checkpoints above without changing their evidence.

- PR #9 verified unchanged at `567339984811f93287cb93b4b072edef9b47e34d`, exactly six approved files; PR run 41130021838 Portable/Browser PASS. Normal protected merge produced Preview HEAD **`4ad30fc96eeabe20c2d7e56310c10ba7dff36c78`**.
- [Post-merge run 41237608658](https://github.com/shyandrey/tri-app/actions/runs/41237608658): Portable verification PASS (including build/lint/release gate); Browser verification PASS, all seven suites. Deployment job completed its disabled-gate path: credential/tool setup, Wrangler publication, live smoke and deployment-evidence steps SKIPPED. Job success does not mean publication occurred.
- After successful post-merge CI, set and read back **`PREVIEW_AUTO_DEPLOY_ENABLED=true` only in GitHub Environment `preview`**. No repository-wide activation change. No new push, publication, rollback, Cloudflare or D1 operation.
- Published Preview remains **`653273420e2aaff3c49725500a935701d4dfd286`**, version `0.0.0`; Production health remains **`c8f52e02a75e0b413dddbfee77f477232c5301d3`**, version `0.0.0`. Git Preview HEAD and the deployed application SHA intentionally differ after a deployment-disabled merge.
- DEVOPS-04 CLOSED; ATH-UI-01 CLOSED / OWNER APPROVED; DATA-ATH-02 CLOSED. TECH-01 remains OPEN and full catalog regeneration prohibited. No new physical-device test claimed.
- Evidence: `/tmp/300w-devops04-closeout/` includes premerge scope/protection, disabled-run job/step metadata, browser log, activation readback and before/after health identities. Local closeout documentation is uncommitted; development branch/index and unrelated files preserved.

Operational limitation: readiness currently permits only `github.event.before` as the previous published SHA. After deployment-disabled merges that Git SHA can differ from the actual published SHA. A future immediate response containing the older published SHA may therefore fail closed rather than wait. No new deployment was performed to validate that case; this closeout does not claim it is covered. Review that mismatch before the next publication rather than interpreting an unknown SHA as safe propagation.

## DEVOPS-02 — Read-only Cloud setup assessment

Status: **NEXT / Codex Cloud Integration**. No environment creation/publication, account settings, GitHub integration settings or test PR performed.

Current official documentation describes published Cloud environments with isolated task workspaces, selectable on mobile; creation and setup review happen on web/desktop. The legacy environment guide serves different integration workflows and is not the setup reference here. See [current Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments) and [Cloud overview](https://learn.chatgpt.com/docs/cloud).

Verified repository facts: `shyandrey/tri-app` is public, default branch `main`; current GitHub connection reports admin access. This does **not** establish the Codex Cloud account's entitlement, installed GitHub connection, allowed repositories or existing published environments. Those remain unverified. Do not let the default `main` selection silently substitute for the approved Preview baseline.

Proposed setup for owner review:

- Select only this repository; start task work from approved Preview HEAD `4ad30fc96eeabe20c2d7e56310c10ba7dff36c78`, verifying the current remote SHA before future work. Use isolated feature branches and PRs targeting protected `preview`; no automatic merge. Preview promotion now triggers deployment and needs task-specific owner authorization.
- Match qualified CI: Node **24.19.0**, npm lockfile and `npm ci --no-audit --no-fund`, Python 3 with standard-library SQLite. Repository `AGENTS.md` applies. Do not copy the dirty Mac worktree, photo staging, manual workflow experiments or credentials into the environment.
- Portable gate: `node scripts/check-ci-portable.mjs`; this explicitly selects portable photo, identity/registry, standings/localization checks and release gate. Local archival/Swift/photo-tooling/full-regeneration commands are not substitutes. Full regeneration remains prohibited under TECH-01.
- Browser gate: existing `scripts/check-preview-browser-ci.mjs` needs a built `dist`, an installed Chrome/Chromium binary, `BROWSER_REPORT_DIR`, local Vite/CDP ports and a fresh profile per suite. Verify availability in Cloud before claiming parity. Existing Ubuntu Actions PASS proves repository CI portability, not that an uncreated Codex environment already passes.
- No Cloudflare/Production/D1 credentials in the Cloud development environment. Deployment credentials remain confined to GitHub Environment `preview`. Start with package-manager network access and only additional verified destinations needed by the task. Keep heavy development on Mac + VS Code.

Next authorized assessment boundary: inspect the owner's actual Cloud environment list and GitHub repository access when available, then propose exact installation/startup configuration for approval. Creating/publishing an environment, changing account permissions, or creating a test PR is not authorized in this closeout.


## DEVOPS-04B — Actual published baseline (2026-10-31)

Focused candidate based on Preview `4ad30fc96eeabe20c2d7e56310c10ba7dff36c78`. No merge/publication or activation change.

- `deploy-preview-artifact.mjs` captures `/api/health` twice before Wrangler with finite request timeouts, redirect rejection and no-store. Requires matching valid previous SHA, expected application version/service, and GitHub compare confirmation that the published commit is a known ancestor of the target. Missing/unknown/divergent/already-published identities fail closed.
- Rechecks Cloudflare rollback deployment/version and Git Preview HEAD around capture. Saves `publishedBaseline` with SHA/version/time and rollback IDs in deployment evidence. On successful publication exports the captured SHA via the deployment step's GitHub output.
- Workflow adds publication step ID and supplies that output as `PREVIOUS_PREVIEW_SHA`; no `github.event.before` fallback. No changes to activation, credentials, routes, artifact integrity, full smoke or readiness's two observations/60-second timeout/branch protection.
- 76/76 pipeline tests PASS, including Git HEAD ahead of live SHA, missing identity, wrong version, unknown ancestry, conflicting health, changed rollback/HEAD, and existing readiness negatives. Targeted ESLint PASS; YAML parsed and 14 shell steps syntax checked; `git diff --check` PASS. No local rebuild or full browser rerun: runtime/dependencies unchanged; ordinary PR CI remains authoritative for those checks.
- Limits: HTTPS observations establish the public application's identity, not domain ownership. Double observations and stable Cloudflare deployment metadata detect conflicts but cannot prevent a privileged out-of-band Cloudflare write after the last check; existing concurrency and post-publication verification remain. A version-changing release needs a separately reviewed old-version contract; this patch intentionally fails on unexpected versions.

### DEVOPS-02 — Concise Cloud setup proposal (read-only)

Use current [Codex Cloud environments documentation](https://learn.chatgpt.com/docs/environments/cloud-environments), not Legacy integration setup. A published environment can be selected on mobile; create/review it on web or desktop, connect the intended GitHub repository if prompted, review setup results, then publish only with separate authorization. Existing GitHub connector access does not prove this account has a configured Cloud environment. Account entitlement, environment inventory and allowed repository connection remain unverified.

Repository-specific proposed configuration:

1. Connect only `shyandrey/tri-app`; verify selected source branch and SHA explicitly (repository default is `main`, not Preview). Start feature branches from the owner-approved Preview baseline. Never import uncommitted Mac files automatically.
2. Match Linux CI: Node 24.19.0, npm lockfile, Python 3/stdlib SQLite. Install with `npm ci --no-audit --no-fund`; run `node scripts/check-ci-portable.mjs` (includes build/lint/release gate). Use temporary `CI_REPORT_DIR` when retaining reports.
3. Browser CI uses installed Chrome/Chromium, built `dist`, fresh profiles and local ports; command `BROWSER_REPORT_DIR=/tmp/tri-browser node scripts/check-preview-browser-ci.mjs`. Actual Cloud compatibility is untested. Official documentation lists computer/browser-use limitations; do not equate built-in interactive browser use with guaranteed availability of this repository's command-line browser harness. Keep GitHub's qualified seven-suite gate mandatory.
4. No project secrets needed for portable tests/build. Do not add Cloudflare tokens, Production/D1 access or activation variables to Codex Cloud. Keep deployment credentials solely in GitHub Environment `preview`. Permit package downloads and necessary GitHub access, not unrestricted service access by default.
5. iPhone workflow: select a published Cloud environment, describe a bounded task, inspect diff/test output, then authorize a feature-branch PR to protected Preview. No direct Preview pushes or autonomous merges; Auto Deploy is enabled, so PR merge is a publication decision. Heavy development remains Mac + VS Code.

No environment/account configuration or test PR was performed. This task's real CI correction PR is separate from Cloud assessment. Full catalog regeneration remains prohibited under TECH-01.

DEVOPS-04B review candidate: [PR #10](https://github.com/shyandrey/tri-app/pull/10), commit `c833ff61df9e57d7259ae262e7536dacbcf01104`, five scoped files. No merge/deployment; PR CI pending at handoff.


## DEVOPS-04B — Successful publication closeout (2026-11-01 Moscow)

- Approved PR #10 head remained `c833ff61df9e57d7259ae262e7536dacbcf01104`, exactly five scoped files. PR run 41239980452 Portable/Browser PASS; protected normal merge produced **`4a5f7e313809ab6bcacb907b7e85fae97e5a87db`**.
- [Post-merge run 41240931936](https://github.com/shyandrey/tri-app/actions/runs/41240931936): Portable verification (build/lint/release gate), Browser verification (seven suites) and Deploy verified Preview all PASS. No rerun or rollback.
- Verified package artifact **13057038915**; manifest digest `97d045aff10be2d098f2c8b217cef43854b73a69320f7fbbac73679b48ffa013`. Publication reused this verified package.
- Pre-Wrangler captured public baseline SHA **`653273420e2aaff3c49725500a935701d4dfd286`**, version `0.0.0`, at 2026-10-31T21:04:49.018Z. This correctly differs from Git event-before `4ad30fc96eeabe20c2d7e56310c10ba7dff36c78`. Rollback deployment `e8224ef5-58c8-4a0b-be20-2913162725eb`, version `4d016450-829f-4133-b9fb-14e74f27a709` retained in evidence.
- New Cloudflare deployment **`aa05f549-0789-4ba4-85b7-549be9708ce8`**, version **`9a8a950f-a7e7-4f78-97c9-d2f57ce38edf`**, Worker `tri-app-preview`. Pre/post bindings, secret names and cron assertions passed. No domain mutation; HTTPS is available (domain ownership remains owner-Dashboard evidence).
- Corrected readiness observed target SHA/version twice at approximately 359 ms and 2758 ms. This run was ready immediately; it validates baseline capture and consecutive readiness but does not claim a delayed propagation event occurred.
- Full smoke step PASS: exact tested HTML, health/version, API, six routes, navigation and responsive artwork. Pipeline log: `Preview SHA/API/routes/navigation/responsive artwork smoke PASS; physical iPhone QA separate`. Deployment record's intermediate `deployed-awaiting-smoke` status is supplemented by the subsequent successful smoke step, not mistaken for the final result.
- Independent final HTTPS health: Preview HTTP 200, exact merged SHA, version `0.0.0`; Production HTTP 200, unchanged `c8f52e02a75e0b413dddbfee77f477232c5301d3`, version `0.0.0`. Preview Git HEAD equals published SHA. Environment-only activation remains `true`.
- DEVOPS-04B **CLOSED**. No Production operations, D1 mutations or catalog regeneration. Primary development branch/index and unrelated files preserved. Local closeout documentation remains uncommitted; no extra publication for documentation.

Evidence: `/tmp/300w-devops04b-closeout/` — before-file hashes, run/jobs metadata, deployment log, deployment artifact **13057797060**, extracted deployment/readiness reports and screenshots, final health JSON. Browser artifact **13058021215** remains on GitHub.

### DEVOPS-02 — Owner setup guidance after closeout (not executed)

1. On web/desktop, inspect **Settings → Codex Cloud → Environments**, or **Work in → Cloud → Select environment**. Review existing environments first. Creation/publishing requires separate owner authorization; no changes made here. See [official Cloud environment guide](https://learn.chatgpt.com/docs/environments/cloud-environments).
2. Select/connect only `shyandrey/tri-app` if prompted; verify actual account/repository access. Start from approved Preview SHA `4a5f7e313809ab6bcacb907b7e85fae97e5a87db`, not default `main`. Pin source deliberately and recheck before each task.
3. Setup proposal: Node 24.19.0, npm lockfile, Python 3/SQLite; `npm ci --no-audit --no-fund`, then `node scripts/check-ci-portable.mjs`. Browser prerequisites/commands are documented above; their execution in a future Cloud environment is not yet qualified.
4. No Cloudflare, Production or D1 secrets; no activation variables in Cloud. Keep existing deployment secrets in GitHub Environment `preview`. Review network access and dependencies before publishing the environment.
5. Once separately approved/published, select that environment in Codex on iPhone, submit a scoped task, review changed files and tests. Use an isolated feature branch and protected PR. Explicit owner approval before merging is essential because Preview Auto Deploy is active. No test PR or account configuration performed.

Account entitlement, current Cloud environment inventory and repository connection remain unverified. Guidance is not a claim that setup is complete. Heavy development remains on Mac + VS Code; TECH-01 full regeneration remains prohibited.


## DEVOPS-02 — Owner suspension (2026-11-01)

**SUSPENDED / Post-release · P2 · Not a v1.0.0 release blocker.** This decision supersedes the earlier NEXT/setup guidance; historical assessments remain unchanged.

Owner reports the Cloud environment is configured, but GitHub connectivity is blocked by the internal proxy (`proxy:8080`). Local Mac + VS Code + Codex development and GitHub Preview CI/CD are fully operational. This is owner-provided status; no new connectivity testing was performed.

Resume only after 300W v1.0.0 is released, a practical mobile development/repository-update need arises, and Cloud GitHub connectivity is restored or a supported alternative becomes available. Until release: no further Cloud connectivity experiments, proxy workarounds, credential changes or additional infrastructure development.
