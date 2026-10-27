# DEVOPS-03B.1 — CI Portability & Preview Pipeline Preparation

2026-10-27 · **Implemented / Awaiting Owner Review**. Latest qualification: **Owner Approved / Closed**, portable Linux gate PASS in DEVOPS-03B.1Q.1 below; earlier limitations/failures are retained as historical evidence.

## Scope and source state

Branch `home-redesign-experiments`, HEAD `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`; index empty. Existing QA-03B changes are now owner-approved. HOME-UI-01B and unfinished Athlete Profile changes are distinct. No remote mutation or deployment was performed.

Related decisions: [DEVOPS-03A](devops03-preview-cicd-audit.md), [QA-03B](qa03-historical-photo-tests.md#qa-03b--photo-test-contract-modernization), [Project Board](PROJECT_BOARD.md). The new [workflow](../.github/workflows/preview-ci.yml) and [runner](../scripts/check-ci-portable.mjs) are local candidates, not enabled Actions or a deployment pipeline.

## Isolated reproduction

Evidence root: `/tmp/300w-devops03b1/`. `before.json` records original file hashes; `overlay.json` records exact test-copy overlay bytes. A local clone with its own Git objects was checked out at the above SHA under `checkout/`. The primary branch/index were not changed.

Explicit overlay: QA-03B `scripts/release-policy.mjs`, `scripts/test-athlete-photos.mjs`, `scripts/test-athlete-photo-archive.mjs`, `scripts/fixtures/athlete-photo-catalog-approved.json`; HOME-UI-01B `src/App.tsx` and `src/pages/MorePage.tsx` (only the reviewed slogan relocation); this task's runner/workflow. Archive test is preserved but not invoked by portable CI. No other working-tree files were copied. Athlete Profile code/CSS stayed at committed HEAD. No staging directory, local credentials, untracked artwork originals or local node_modules were copied.

This is a reproducible SHA **plus recorded overlay**, not a claim that HEAD alone contains the changes. Future Actions must obtain reviewed files from the checked-out commit; temporary Mac artifacts must not become CI inputs. The workflow's full-history setting was corrected after identifying the migration test dependency; the isolated clone already contained full history.

Actual environment: Darwin arm64, Node **24.19.0**, npm **11.17.0**, Python **3.14.7**. A fresh `npm ci --no-audit --no-fund` installed 186 packages from unchanged `package-lock.json`. No dependency/version changes. Lockfile SHA-256: `2ec672abc7ccb70de9e987059be57544f968775a07d81c3297fd435a18267268`. npm reported pending install-script approvals for esbuild, fsevents and workerd; no approvals were added. The subsequent build/tests passed with the installed platform packages. Linux native-package resolution and this warning must still be assessed in Linux.

No `docker`, `podman`, `colima`, `lima` or `orb` executable was found in PATH. No accessible Linux runner was supplied. No VM/dependency installation, remote workflow dispatch or settings change was attempted. **macOS PASS does not establish Linux PASS.**

## Mandatory candidate command matrix

Run from checkout root. The wrapper executes serially, with bounded child execution (180 seconds each), no retries, and continues collecting independent results after a failure. Any failure/environment error yields a nonzero exit. It reuses existing release classification; nested release logs retain the exact failing operation and environment/assertion details.

| Command/group | Purpose | Dependencies and result in isolated macOS copy |
| --- | --- | --- |
| `npm ci --no-audit --no-fund` | Exact lockfile install | Network/package registry and platform-specific locked binaries; PASS |
| `npm run metadata` | Existing generated public version/SHA metadata | Git, Node; PASS |
| `node --test --test-concurrency=1 scripts/test-athlete-photos.mjs scripts/test-athlete-photo-review.mjs` | Exact 1167 identities, additional IDs, published bytes and Franzi rejection | Node/Vite, committed fixtures/assets; **25/25 PASS**, zero skips; no staging/history/Swift/browser |
| `node --test --test-concurrency=1 scripts/test-pto-profiles.mjs scripts/test-pto-profile-mapping.mjs scripts/test-pto-profile-registry.mjs` | PTO identity, normalization, approval/provenance/replay | Python 3 CSV parser, committed evidence; mocked HTTP; **44/44 PASS** |
| `node --test --test-concurrency=1 scripts/test-t100-standings.mjs scripts/test-ironman-standings.mjs` | Both official registries and identity links | Committed approved fixtures; **20/20 PASS** |
| `npm run check:release` | Existing mandatory gate, unmodified | **18/18 PASS**, no known audit issues or environment errors |
| `npm run build` | TypeScript app/Worker and production Vite | Executed by release gate: PASS |
| `npm run lint` | Full project lint | Executed by release gate: PASS |
| `git diff --check` / cached check | Whitespace integrity | Executed by release gate; final primary-tree check also PASS |

Single candidate entrypoint: `node scripts/check-ci-portable.mjs`. It adds the three explicit test groups to the real release entrypoint, not a reduced replacement. The release gate includes athlete catalog/search/localization/audit, Calendar, internal ranking and dataset clock, navigation/sports loader, foundation/versioning, News/Feedback mocks, results audits/replay, graph/images, accessibility and release-runner tests. Existing [release policy](../scripts/release-policy.mjs) defines the exact commands. This is not the full native/archive unit suite or browser release gate.

First-run result: all five wrapper checks PASS. Evidence `results/{1..5}.log`, `results/summary.json`, `results/summary.md`, `results/release/{1..18}.log`, `results/release/summary.json`, `npm-ci.log`. No failures were retried. Build's known sports JS chunk: **1,295.13 kB minified / 266.28 kB gzip**; existing >500 kB warning remains. Gzip is not the uncompressed bundle size.

## Portability boundaries

| Group | Requirements / disposition |
| --- | --- |
| Portable verification candidate | Node 24.19.0, npm bundled with that distribution (local 11.17.0), exact lockfile, Python 3 standard `sqlite3`/CSV, Git, bash, writable temp/output and local HMR ports. Ubuntu 24.04 proposed; actual runner image/Python/npm versions recorded during CI. No native macOS tools or external sports source requests. |
| Release Feedback integrity | **Full Git history**: `git show b511238210cba253bd4b90b6b9fdf8b2b2611a9d:migrations/0001_feedback_news.sql`. Checkout uses `fetch-depth: 0`; preflight explicitly checks the object. A shallow checkout would fail; no fallback weakens the assertion. SQLite tests use local temporary databases, not D1. |
| Photo archival test | Pinned historical source trees plus original ignored photo staging files; explicit local lane, not selected in this workflow. Missing evidence must fail, not silently skip. |
| Photo staging/native test | macOS `xcrun swiftc`, ImageIO/CoreGraphics; mock downloads and temporary publication roots. Explicit local lane. |
| Browser suites | Browser binary, local built-app HTTP server, CDP, isolated profile; not executed in this task/workflow. Existing scripts can select the first page in a reused browser, so creating another tab is not sufficient isolation. |
| Operational/import/live checks | Source network access or credentials/Cloudflare state; excluded. No Wrangler deploy/dry-run, D1 migration or live Telegram/Feedback call. Package downloads and action/toolchain checkout still need network. |

## Workflow and security contract

- PRs targeting future `preview`, plus `workflow_dispatch`; no push, `pull_request_target` or deploy trigger. PR run checks the immutable event SHA (GitHub merge candidate), not an arbitrarily moving branch. Manual run checks its selected event SHA. Dispatch requires the workflow on the default branch; bootstrap is separately authorized future work. See [official event semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
- Ubuntu `24.04`, exact Node `24.19.0`; runner OS image is updated by GitHub, not byte-pinned. No npm cache configured in this initial qualification. Checkout verifies actual HEAD against event SHA and does not persist credentials.
- `contents: read` only; no environment secrets, OIDC, deployment or PR write permission. No Cloudflare integration. Lockfile install still executes repository/dependency code: only ephemeral hosted runners, never a production-connected self-hosted runner.
- Official actions pinned to verified tag commit SHAs: checkout v4.2.2 `11bd71901bbe5b1630ceea73d27597364c9af683`; setup-node v4.4.0 `49933ea5288caeca8642d1e84afbd3f7d6820020`; upload-artifact v4.6.2 `ea165f8d65b6e75b540449e92b4886f43607fa02`. Resolved by fresh read-only `git ls-remote`; updates require review. [Checkout release](https://github.com/actions/checkout/releases/tag/v4.2.2), [setup-node release](https://github.com/actions/setup-node/releases/tag/v4.4.0), [artifact release](https://github.com/actions/upload-artifact/releases/tag/v4.6.2).
- Job timeout 20 minutes; no retry/continue-on-error. Summary always records job status/SHA; runner produces per-group results. A failed install leaves install diagnostics, not a fictitious test PASS.
- Failure artifacts: only dedicated report directory with install/test logs and summaries, 7-day retention; hidden files excluded. No whole workspace, environment dumps, npm credentials, browser profiles, `.wrangler`, raw HTML or `dist` upload. Current commands use mocks/public data and receive no production secrets. Artifacts are diagnostic and must never be consumed as deployment authorization/packages.

YAML parsed locally with Ruby Psych; trigger/permission shape and every `run` block's bash syntax checked; runner `node --check` PASS. GitHub server validation/action execution and actionlint were **not run**. This is a reviewed local prototype, not a certified GitHub run.

## Browser reliability qualification for DEVOPS-03B.2

Keep first failure and diagnostics. No automatic retry-until-green. Browser assertions and source scripts remain unchanged. Known navigation shared-context instability and physical Safari QA remain open.

Proposed Linux setup after runner access: use a pinned installed Chrome/Chromium build, record its exact version/path, run as non-root with its sandbox; use headless mode (no display/Xvfb needed). Never silently substitute a browser or disable its sandbox. The browser version/install source is still an explicit qualification decision, not an invented successful setup. For each individual suite, launch a new process/profile with one blank page:

```sh
# BROWSER_BIN must point to the separately qualified installed binary.
npm run preview -- --host 127.0.0.1 --port 5390 --strictPort
# In another process, new directory per suite; stop this process after the suite.
profile=$(mktemp -d)
"$BROWSER_BIN" --headless=new --remote-debugging-address=127.0.0.1 \
  --remote-debugging-port=9373 --user-data-dir="$profile" --no-first-run about:blank
# Verify HTTP / and CDP /json/version readiness with a bounded deadline first.
TRI_APP_URL=http://127.0.0.1:5390 TRI_CDP_URL=http://127.0.0.1:9373 \
  node scripts/test-navigation-browser.mjs
```

Repeat with fresh process/profile for Calendar, Rankings, swipe and showcase suites; retain failed run before any authorized diagnostic rerun. The existing `check:release:browser` suite requires further context-isolation qualification; it is not asserted portable or silently counted as covered here. No browser dependency was installed by this task.

## Future branch settings and implementation plan

Proposed required check: **Preview CI / Portable verification**, after first actual Ubuntu PASS. Protect future `preview` with PR-only merges, up-to-date checks, no force pushes/deletion, reviewed changes and stale-approval dismissal. Protect workflow, lockfile, Worker/config and data changes through owner review/CODEOWNERS. Confirm plan support and a valid reviewer arrangement (self-approval is not a substitute for a required independent review). Do not enable merge queue without adding/testing its event support. No settings were changed.

DEVOPS-03B.2 sequence:

1. Owner reviews this candidate and authorizes a real isolated Linux/Actions run; obtain Node 24.19.0 from official distribution, full history and `npm ci`; run this exact gate. Record OS image/toolchain and first-run outcomes; fix verified portability issues separately.
2. Qualify browser setup and fresh-process isolation. Keep native/archive checks as explicit local evidence, not invisible skipped CI tests.
3. Separately approve Git commit/push, future `preview` branch creation, workflow/default-branch bootstrap and required-check settings. This task performs none of them.
4. Implement and review package allowlist/hash checks, fixed Preview target guards and independent expected-SHA smoke from DEVOPS-03A. No deployment until separate credentials/security/setup authorization and a supervised Preview deployment decision.

Readiness: local candidate **READY FOR OWNER REVIEW**; Linux/GitHub qualification and automatic Preview enablement **BLOCKED pending actual Linux evidence and separate authorization**. QA-03B remains owner-approved, not reopened.

## Files and preservation

New `.github/workflows/preview-ci.yml`, `scripts/check-ci-portable.mjs`, this report; updated `docs/PROJECT_BOARD.md` only. No package/lockfile/runtime/assets/test assertions were changed. QA-03B, Home, Athlete Profile and all unrelated existing files remain preserved. Primary Git index empty; no commit, push, deployment, branch/settings/version/credentials/D1 changes.

## DEVOPS-03B.1Q — GitHub Actions qualification attempt

2026-10-27 · **Linux Qualification / Awaiting Owner Review** · **BLOCKED before runner execution**.

Owner authorized an isolated qualification branch and explicitly approved one branch-only push trigger after preflight established that manual dispatch cannot bootstrap without a default-branch workflow. Default `main` remained unchanged. GitHub Actions is enabled (`allowed_actions: all`); initial workflows, hooks, runs and deployments were empty. No Cloudflare API/credential access occurred.

- Isolated clone: `/tmp/300w-devops03b1q/checkout`, branch `ci/preview-qualification`.
- Base: `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`.
- Qualification commit: **`05b65af0bdb81b4657ca8f0e029c97d193951535`**, `ci: qualify portable verification on isolated Linux branch`.
- One normal push, one run, attempt 1: [GitHub Actions run 40401545326](https://github.com/shyandrey/tri-app/actions/runs/40401545326).
- Remote qualification SHA independently verified. Remote `home-redesign-experiments` stays `f99c7775b92143eb847d470dd93ff4c3580c5224`, `main` stays `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`; no `preview` branch exists.

Exactly six files in the qualification commit: `.github/workflows/preview-ci.yml`, `scripts/check-ci-portable.mjs`, `scripts/fixtures/athlete-photo-catalog-approved.json`, `scripts/release-policy.mjs`, `scripts/test-athlete-photo-archive.mjs`, `scripts/test-athlete-photos.mjs`. QA-03B changes are approved dependencies; archive suite is retained for continuity but not executed in CI. Workflow differs from the primary candidate only by replacing the PR trigger with `push.branches: [ci/preview-qualification]` and adding an exact branch job guard. No deploy steps, secret references, environment credentials or elevated permissions. Only `contents: read` is declared. HOME-UI-01B, Athlete Profile edits and unrelated local files were excluded.

### Actual results and evidence

| Verification | Result |
| --- | --- |
| Isolated macOS pre-push gate | Photo 25/25, PTO 44/44, standings 20/20, release 18/18 PASS; build/lint included |
| GitHub workflow run | **FAIL**, completed immediately before jobs were created |
| Jobs / check runs | **0 / 0**, verified through REST APIs |
| Ubuntu/Node/npm/Python/SQLite actual versions | **NOT OBSERVED**; runner did not start. Requested Ubuntu 24.04 / Node 24.19.0 are configuration, not measured environment |
| `npm ci`, Linux tests, build, lint, gate | **NOT RUN** |
| Failure artifact upload | **NOT EXECUTED**, zero artifacts; no job existed to run its failure handler |
| Runtime permissions | YAML declares read-only contents; effective runner token permissions were not observable without a job |
| Retry / additional push | **None** |

Evidence retained under `/tmp/300w-devops03b1q/`: `before.json`, `allowlist.json`, `trigger-proposal.diff`, local test logs/results, `github-preflight.json`, `run.json`, `jobs.json`, `check-errors.json`, suite/attempt/permissions API responses, `artifacts.json`, `context-fix-proposal.diff`. There are no runner logs to preserve because no runner job was created. REST returned no check annotations; the exact GitHub UI validation-message text was not retrieved. Do not invent an error quote or describe this as a failing application test.

### Verified workflow defect and minimal proposal

Qualification YAML line 18 (primary candidate line 17) uses `${{ runner.temp }}` under `jobs.portable.env`. The official [context availability table](https://docs.github.com/en/actions/reference/workflows-and-actions/contexts#context-availability) does not allow `runner` there; it does allow it in step-level contexts. This is a confirmed workflow expression-scope defect, consistent with the observed pre-job validation failure. Plain YAML parsing and bash syntax checks in DEVOPS-03B.1 did not validate Actions expression contexts and therefore missed it. Server-side error wording remains unavailable through the inspected APIs.

Proposed correction, **not applied**: remove job-level `CI_REPORT_DIR`; add an initial shell step:

```yaml
- name: Initialize diagnostic directory
  shell: bash
  run: |
    echo "CI_REPORT_DIR=$RUNNER_TEMP/portable-ci" >> "$GITHUB_ENV"
    mkdir -p "$RUNNER_TEMP/portable-ci"
```

The artifact step may retain its step-level `${{ runner.temp }}`. No runtime changes, test weakening, dependency changes or secret access are needed. Apply the same scope fix to the primary workflow candidate after approval. Add Actions-aware schema/context validation before the next authorized qualification push. A plain re-run of this unchanged SHA would repeat the defect and is not recommended.

**DEVOPS-03B.2 readiness: not ready.** Owner review is needed for the minimal YAML correction and one new qualification attempt. Linux execution and actual failure-artifact behavior remain unqualified. The first failure remains recorded, not replaced by local PASS. No automatic Preview deployment or settings change is enabled.

Primary working tree remains on `home-redesign-experiments` at `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`, index empty. This task updates only this report and Project Board in the primary tree; the qualification commit lives in the isolated clone/remote branch. No merge, tag, version bump, D1/Cloudflare operation, or alteration of original artifacts was performed.

## DEVOPS-03B.1Q.1 — Workflow context correction and Linux PASS

2026-10-27 (Europe/Moscow; run timestamps are 2026-10-26 UTC) · **Linux Qualification PASS / Awaiting Owner Review**.

One authorized correction, one commit, one normal push, one automatically triggered run; no re-runs or additional fixes. The previous failed run remains preserved above.

### Exact implementation and preflight

Changed only `.github/workflows/preview-ci.yml` in `/tmp/300w-devops03b1q/checkout`, branch `ci/preview-qualification`, based on `05b65af0bdb81b4657ca8f0e029c97d193951535`. Removed job-level `CI_REPORT_DIR` and inserted the authorized early initialization step:

```diff
-    env:
-      CI_REPORT_DIR: ${{ runner.temp }}/portable-ci
     steps:
+      - name: Initialize CI report directory
+        shell: bash
+        run: |
+          echo "CI_REPORT_DIR=$RUNNER_TEMP/portable-ci" >> "$GITHUB_ENV"
+          mkdir -p "$RUNNER_TEMP/portable-ci"
```

Initialization precedes checkout, toolchain and every report-writing command. Artifact `path: ${{ runner.temp }}/portable-ci/` remains in valid step-level context. Ruby YAML parsing, bash syntax checks, exact before/after structure comparison and `git diff --check` passed. The structural comparison verified all old steps, test commands, Node version, checkout policy and artifact handling remain identical. `actionlint` was not installed/available; no tooling was installed. Context placement was reviewed against the official context-availability table cited above and then accepted by GitHub's actual workflow processing.

Commit: **`53a1fafb604cb86cee740acc5b6899c677c34640`** — `fix(ci): initialize report directory at runner step` (one file, +5/−2). Remote qualification HEAD matches. No force push or other ref update.

### Actual Linux execution

[Actions run 40403415627](https://github.com/shyandrey/tri-app/actions/runs/40403415627), attempt 1, event `push`: **SUCCESS**. One `Portable verification` job was created and completed successfully.

| Measurement / step | Actual result |
| --- | --- |
| GitHub-hosted OS | Ubuntu **24.04.5** |
| Runner image | `ubuntu-24.04`, version **20261012.334.1** |
| Effective token permissions in setup log | Contents read, Metadata read |
| Initialize CI report directory | PASS; `/home/runner/work/_temp/portable-ci` |
| Checkout / full-history object check | PASS, exact event SHA verified |
| Node / npm | **v24.19.0 / 11.17.0** |
| Python / SQLite | **3.12.3 / 3.45.1** |
| `npm ci --no-audit --no-fund` | PASS, 185 packages, 5s |
| Metadata | PASS, 0.1s |
| Portable photo group | PASS, 5.3s |
| PTO identity / registry | PASS, 4.5s |
| Official standings | PASS, 2.4s |
| Unchanged `npm run check:release` | PASS, 57.5s; includes production build, full lint and existing 18-check gate |
| Job summary | PASS |
| Failure-artifact step | Correctly **SKIPPED** on success; 0 artifacts |
| Post-job cleanup | PASS |

The wrapper exposes group outcomes in Actions logs, not individual test counts. Do not mislabel the prior macOS 25/44/20 counts as independently exported Linux TAP totals. Gate success verifies the existing exit-code contract; detailed per-check logs/summary were generated on the runner but are uploaded only on failure. Successful-run log ZIP is retained locally. Failure upload execution itself remains untested: neither this successful run nor the previous pre-job failure exercised it. No artificial failure was introduced or extra run authorized.

npm retained `allow-scripts` warnings for esbuild 0.28.1 and workerd 1.20260926.1. No install-script approval/configuration change was made; build/gate still passed on Linux. This does not qualify Wrangler deployment or all dependency tooling. Known sports chunk warning remains documented; this change does not optimize bundles. Browser, native Swift and local photo archival suites were not run and are not silently included in this PASS.

### Evidence and Git preservation

Evidence: `/tmp/300w-devops03b1q1/` contains `workflow.diff`, development preflight hash manifest, `run.json`, `jobs.json`, `artifacts.json`, `run-logs.zip` and safely extracted `logs/`. Raw runner logs include actual OS/toolchain and step outcomes. No token values or signed artifact URLs were printed.

Qualification clone is clean at `53a1fafb604cb86cee740acc5b6899c677c34640`. Primary development branch remains `home-redesign-experiments` at `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`, index empty. Only this report and the related Project Board entry are updated in the primary tree; existing runtime, tests, QA-03B, Home/Profile work and primary workflow candidate are preserved. In particular, the primary uncommitted workflow still needs the approved context fix promoted in a separately authorized consolidation task; it was not silently changed here.

Remote `home-redesign-experiments` remains `f99c7775b92143eb847d470dd93ff4c3580c5224`, `main` remains `23c5e52e8c0ccec1dea29cd94d6185568ec4543a`; `preview` does not exist. No deployment, credential/configuration, D1, version, application/test/data/artwork change, merge or rebase.

### Readiness

**Portable Linux qualification is complete for this exact qualification commit.** Ready for owner review and the next DEVOPS-03B.2 preparation stage, not for automatic Preview deployment. Remaining work: promote the corrected workflow under separate Git authorization, qualify browser isolation and failure-artifact execution, implement/review packaging and Preview guards, and separately authorize branch/settings/credentials/deployment setup. No failure or application regression was observed in this run. Final documentation links and `git diff --check` PASS.


## DEVOPS-03B.2A — Permanent integration handoff

2026-10-27 · **DEVOPS-03B.1Q — Owner Approved / Closed** (includes successful Q.1 correction/run). Previous failed and successful evidence above remains historical, unmodified.

The primary workflow candidate now contains the qualified early report-directory initialization. It supports PRs targeting `preview`, pushes to `preview`, and optional manual dispatch guarded to `preview`; the qualification-only branch condition is gone. Job steps and tests are identical to qualification commit `53a1fafb604cb86cee740acc5b6899c677c34640`. This supersedes the earlier statement that the primary candidate still needs the context fix.

The modified permanent triggers/guard have **not** run on Linux; no new CI execution or remote change occurred. [DEVOPS-03B.2A plan](devops03b2-preview-implementation-plan.md) records exact protections, promotion/owner-review limitations for the public personal repository, browser qualification (Pending), artifact-only future deployment and Cloudflare permission gates. DEVOPS-03B.2A is Prepared / Awaiting Owner Review; DEVOPS-03B.2B Branch & CI Integration and DEVOPS-03B.2C Cloudflare Preview Auto Deploy are Planned. No deployment or GitHub settings approval is implied.
