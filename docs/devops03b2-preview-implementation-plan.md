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
