# DEVOPS-03A — Automated Preview Deployment Architecture & Security Audit

2026-10-26 · P1 / pre-release · **Audit Complete / Awaiting Owner Review**.

Recommendation: protected `preview` branch, secret-free CI, immutable release package, separately protected Preview deployment job. Production remains manual. This document proposes implementation; no workflow, branch, token, infrastructure or executable file was created or changed.

## 1. Evidence and current architecture

Repository inspected at `home-redesign-experiments`, HEAD `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`; index empty. Tracking reference is `f99c777`, ahead 2 / behind 0, not a fresh remote query in this task. Local branches also include `main`, `alt-series-card-tags`, `results-table-prototype`; no local/tracking `preview` branch. No tracked `.github` workflow. Existing Project Board edits, Home review, unfinished Athlete Profile and untracked artwork/audits remain local.

Sources inspected: [package scripts](../package.json), [lockfile](../package-lock.json), [Wrangler](../wrangler.jsonc), [Vite](../vite.config.ts), [deployment runbook](deployment-cloudflare.md), [maintenance guide](maintenance-developer.md), [release policy](../scripts/release-policy.mjs), [release runner](../scripts/check-release.mjs), [build metadata](../scripts/build-metadata.mjs), [consolidation inventory](git01-repository-consolidation-plan.md), [Rankings closure](official-rankings-ui-2026-10-22.md), [QA-04](qa04-showcase-network-investigation.md).

Current path: manual Wrangler CLI → custom `npm run build` → Vite `dist` and bundled Worker → Workers Static Assets; `/api/*` executes Worker. There is no current CI deployment implementation in the repository. Vite has only the React plugin, no explicit asset exclusion or custom chunk policy. npm lock pins Wrangler 4.142.0. Build runs TypeScript app/Worker checks and Vite; prebuild creates metadata. Application version remains 0.0.0.

| Setting | Preview | Production |
| --- | --- | --- |
| Worker | `tri-app-preview` | `tri-app` |
| Environment | `preview` | `production` |
| Entry | `worker/index.ts` | `worker/index.ts` |
| D1 UUID | `4dfe9210-0cc7-484f-8eea-fe5216f5c17a` | `2b5cd1b9-d9bf-483d-b710-23d00b6db7fd` |
| Origin | `https://preview.300w.app` | `https://300w.app` |
| Bot username | `tri_app_preview_bot` | `tri_app_bot` |
| Limiter namespace | `30001` | `40001` |
| Cron | `*/5 * * * *` | `*/5 * * * *` |
| Observability | Explicit config in Preview | No identical block assumed |

Turnstile site keys and ordinary vars differ. Both use ASSETS and DB, but distinct databases. Top-level `tri-app-local` uses `worker/local.ts` and a placeholder DB; bare Wrangler is not a Preview command. Domains are pre-existing remote configuration, not newly declared routes in this file.

Actual commands:

- `npm run deploy:preview:dry` → `wrangler deploy --env preview --dry-run` (builds, no publish).
- `npm run deploy:preview` → `wrangler deploy --env preview` (real publish).
- `npm run check:preview` → GET-only health and News check.
- `npm run preview` → local Vite server, not Cloudflare deployment.
- Production counterparts exist but must never be selected by Preview CI. No generic `deploy` or `check` npm script exists.

Secrets are not stored in Wrangler config. The runbook records eight remote names: `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_HMAC_SECRET`, `TELEGRAM_BOT_TOKEN`, `FEEDBACK_TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `NEWS_TELEGRAM_CHANNEL_ID`, `PUBLIC_TELEGRAM_BOT_TOKEN`, `PUBLIC_TELEGRAM_WEBHOOK_SECRET`. These are expected names, not a fresh assertion of remote presence or equal values across environments. The maintenance guide still mentions “six secrets”; this stale text must not become CI policy. Preserve installed secret values, verify names/settings against an owner-approved current baseline.

### Remote evidence limits

Owner reports both Workers show no connected Git repository. Earlier GIT-01E read-only GitHub calls returned zero workflows, hooks, environments, deployments and runs. In that check Cloudflare `/accounts` returned HTTP 403 with Wrangler OAuth, preventing current Builds-trigger inspection. These historical findings are recorded in [Home/Git handoff](home-ui-01-slogan-review.md); they were not rerun or upgraded into current remote certification here. No token or credential was accessed in this audit. Before enablement, verify live integrations, token scope, GitHub plan/protection availability and both Worker settings. No auto-deploy isolation claim follows merely from absence of YAML.

## 2. Promotion and exact triggers

Proposed deployment trigger: **push to `refs/heads/preview` only**. Optional `workflow_dispatch` must also enforce that exact ref and its current approved HEAD; do not accept arbitrary source refs, Worker names, config paths or shell inputs. No deploy from `home-redesign-experiments`, `main`, tags, forks or PR events.

Promotion: approved development commits → PR into `preview` → required checks and owner approval → merge → CI on the actual resulting SHA → Preview. PR checks are secret-free and separate from deploy. Review the complete diff against Preview, including Worker/config/dependencies/data, not only the PR title. Do not copy a developer working tree or untracked files. The two current local DS/QA commits require their separate push gate; this audit grants no push permission.

Protect `preview`: PR-only changes, no force/delete/direct pushes, required named checks, dismiss stale approvals, owner review for workflow/Worker/config/lockfile/packaging changes. Verify rules also cover bypass actors. Solo-owner approval mechanics and available plan features need explicit agreement; do not promise self-review satisfies a required independent reviewer rule.

GitHub manual dispatch requires the workflow to exist on the default branch. With `main` currently separate, this is a bootstrap decision requiring its own approved change; initially omit dispatch if that change is unwanted. See [GitHub event rules](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).

DEVOPS-02 stays separate: Codex Cloud may later propose commits/PRs, but must not receive deployment credentials. Mac + VS Code remains the heavy-development environment.

## 3. Proposed pipeline and artifact boundary

1. Checkout the exact event SHA without persisted Git credentials. Assert trusted repository, `preview` ref and approved promotion. Record commit/PR/run identity.
2. Use an ephemeral runner, proposed `ubuntu-24.04`, **Node 24.19.0** (current audited local version) and explicit npm/browser versions after compatibility qualification. `npm ci` from the committed lockfile. Pin actions by full commit SHA. Cache npm downloads keyed by OS/Node/lockfile, not a writable shared `node_modules` or release artifact.
3. Run mandatory gates below without deployment credentials. Supply `BUILD_COMMIT` equal to the actual checkout SHA; fail on unknown or mismatch. Do not label an overlay of dirty files with the baseline SHA.
4. Produce a Preview-only release package: compiled Worker, exact tested static assets, effective Preview config, dependency/tool versions and per-file SHA-256 manifest. No credentials or originals. Test this package locally.
5. Transfer the package to a new protected deployment job. Validate digest, run/commit association and current Preview branch HEAD. Reject artifacts from untrusted PR runs. No application build/npm lifecycle code executes after the token is supplied.
6. Preflight remote Preview Worker, DB, ordinary bindings, secret names, cron and domain baseline. Check Production unchanged using separately authorized read-only evidence, never broader deploy-token permissions merely to inspect it. Missing evidence or unexplained drift blocks publish.
7. Publish once to the fixed existing Worker, then read-only smoke checks. Record version/deployment IDs, manifest digest, SHA, URLs and results in job summary.

**Build-once gap:** current `deploy:preview` executes Wrangler custom build again. Simply running it after artifact testing is not proof of publishing tested bytes. DEVOPS-03B must prototype an explicit packaged deployment config with no custom build hook, fixed Preview target and prebundled Worker/static assets. Verify installed Wrangler's bundling options and dry-run output before approving the exact CI command; `--no-bundle` alone must not be assumed to disable custom builds. Keep local scripts intact unless separately approved. No deploy command is executed in this audit.

Cancellation: secret-free CI can cancel superseded runs per ref. Deployment uses one `tri-app-preview` concurrency group with cancellation disabled once publishing begins; stale pending runs recheck branch HEAD and exit before mutation. Do not depend on FIFO queue ordering. Manual reruns retain immutable SHA and require a new preflight; already-deployed healthy identical digest is a recorded no-op. Failed/uncertain publish is not automatically retried. GitHub environments provide branch restrictions and secret gating; concurrency serializes the target. [Deployment controls](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments).

Proposed retention: sanitized failure logs/screenshots 30 days; successful package/manifests at least 30 days and last five successful deployments, subject to repository quota/plan. Retain the current known-good rollback package until replaced and verified. Expired CI artifacts are not a durable artwork archive. Summary/Actions failure reporting needs no Telegram integration.

## 4. Mandatory CI gate

Use explicit filenames, not wildcard execution of every operational script.

| Required gate | Existing command / design |
| --- | --- |
| Fast release | `npm run check:release`: all 18 checks, including build, lint, audits, ranking, Calendar, navigation, mocked News/Feedback, image graph and accessibility |
| Official data + PTO | `node --test --test-concurrency=1 scripts/test-t100-standings.mjs scripts/test-ironman-standings.mjs scripts/test-pto-profile-mapping.mjs scripts/test-pto-profiles.mjs scripts/test-pto-profile-registry.mjs` |
| Browser release | `npm run check:release:browser`, local server serving exactly this `dist`, controlled CDP browser |
| Current Rankings/NAV additions | Direct `node scripts/test-official-rankings-browser.mjs`, `test-rankings-swipe-browser.mjs`, `test-rankings-showcase-browser.mjs`, `test-rankings-controls-browser.mjs`, `test-rankings-polish-browser.mjs`, `test-global-nav-browser.mjs` (each under `scripts/`) |
| Network fixtures | `node scripts/test-rankings-swipe-browser.mjs --network-self-test` |
| Packaging/provenance | New DEVOPS-03B validator: exact target, SHA, asset inventory, no secrets/originals, package digest and local packaged smoke |

The existing browser gate covers 14 suites including Calendar, code splitting, navigation, More, image delivery and mocked Feedback; it does **not** include the newer official Rankings/swipe/NAV suites. Explicitly add them, not replace the gate. Build/lint already occur inside the fast gate; avoid redundant rebuilds of the final package.

CI harness needs qualification: launch a pinned CDP browser, set `TRI_APP_URL` and `TRI_CDP_URL`, allocate permitted local/HMR ports, bounded readiness, fresh browser profile per suite, sequential execution. The current runner creates fresh tabs, which alone may not resolve shared-context Navigation instability. Collect console/network/trace evidence on failure; fail the gate, no retry-until-green. Some outputs use fixed `/tmp` paths; isolate per job/run and archive them. Chrome launch on Linux and optional Safari coverage are not yet demonstrated in CI.

### Historical failures and QA-03

The release policy explicitly lists non-gating full athlete localization regeneration, legacy photo counts/staging tests and macOS/Swift-dependent staging. They must be reported as non-gating diagnostics with actual PASS/FAIL/NOT RUN, not hidden or represented as passing. DOC-02 already notes that historical country-conflict wording is stale and regeneration failures concern ID drift. QA-03 is referenced in this assignment but no dedicated QA-03 report/board entry was found; do not claim it is complete.

**Recommendation: resolve QA-03's test ownership/classification and CI portability before unattended auto-deploy is enabled.** This need not mean fabricating photos or changing data to make obsolete tests pass: owner-approved replacement assertions, documented baseline exceptions and a portable supported gate are acceptable. Keep auto-deploy disabled until the mandatory gate is stable in clean CI. Supervised dry-run rehearsal may proceed after architecture authorization. The sports chunk warning remains an explicitly accepted diagnostic conditional on physical-device QA. Navigation instability remains open and any actual required failure blocks deployment.

## 5. Cloudflare security model

Current Cloudflare documentation supports an **account-owned API token with Editor scoped to the individual existing `tri-app-preview` Worker**. Legacy `Workers Scripts Edit` corresponds to product-level access, not a Preview-only restriction. Editor also allows settings/schedules changes; it is not a code-upload-only permission. Custom Domains have a documented per-Worker limitation: preserve existing domain association and do not grant route-write permission to work around a failed deploy. These capabilities are documentation findings, not validation of this account or Wrangler 4.142.0. [Workers permissions](https://developers.cloudflare.com/workers/authorization/workers/).

Propose that narrow token, no Admin, no product-wide Editor, no D1, account settings, token management or zone route writes. Account-owned tokens are the documented granular Wrangler mechanism; OAuth login does not support granular authorization. Direct bound-resource access is separate from Worker deployment. [Authorization model](https://developers.cloudflare.com/workers/authorization/).

**Important security distinction:** no D1 API scope does not mean deployed code cannot write D1. The Worker already has a DB binding and runtime secrets; code deployed with Editor can exercise those capabilities. Static config guards and owner review must prohibit Production DB IDs or secret references in the Preview package. Do not assume per-Worker scope validates every possible resource-binding substitution. Test authorization boundaries on a disposable non-production fixture after approval; do not probe denial by attempting a real Production mutation.

If granular access is unavailable or the existing custom-domain deployment cannot work within it, **STOP enablement**. Do not silently substitute an account-wide token. Compensating controls (protected environment, owner approval, fixed-target config, workflow CODEOWNERS, package hashes, minimal trusted deploy job) reduce operational mistakes but do not cryptographically restrict a stolen broad token to Preview. A separate Preview account is a stronger alternative, but is infrastructure work requiring separate approval and migration design. Even a narrow token exposes Preview runtime capabilities; no absolute no-write guarantee is claimed for arbitrary malicious code.

## 6. Secrets and preflight policy

Store only the Preview deployment token as an environment secret in GitHub `preview`. Account ID, existing Worker identifier, DB UUID and URLs are non-secret environment variables/constants; validate against independent approved values. The account identifier copied in old prose must not be used without current verification. Never copy any of the eight runtime secrets, Production credentials, local `.env`/`.dev.vars`, Wrangler OAuth or browser profiles to CI artifacts.

Set default GitHub token permissions to `contents: read`; only add narrowly required deployment-status permission to the reporting job. Restrict Preview environment to `preview`, with owner approval during rollout. Do not run untrusted checkout under `pull_request_target` or expose secrets during build/test. Pin action revisions and protect workflow/dependency changes; log masking is not a complete secret boundary. [GitHub security guidance](https://docs.github.com/en/actions/reference/security/secure-use).

Rotation proposal: named owner, expiry/review schedule (initially 90 days), new least-privilege token after explicit approval, validate scope and supervised Preview operation, replace environment secret, revoke old token, record token ID/date only. On compromise: owner revokes token first, disables future deploy authorization, reviews executions/config and credentials reachable through Preview; preserve sanitized evidence and rotate exposed runtime credentials with separate authorization. No credential creation or changes in this task.

Remote baseline must include eight secret names, exact ordinary vars, DB, limiter, cron, observability and active version/deployment. Queue aggregate preflight should use an owner-approved read-only monitor; do not grant D1 write capability to the deploy token just to run a SELECT. Current API/preflight availability remains an enablement blocker. Existing cron/requests may independently mutate Preview data: “no D1 writes by CI” is not a promise to suspend normal application operations.

## 7. Asset packaging

Historical isolated workflow inspected: `/tmp/300w-rank04-preview/report.md` records a clean baseline plus reviewed overlay, Profile polish excluded, 16 active artwork assets and full input/output hashes. [GIT-01B](git01-repository-consolidation-plan.md) documents an exact 106-path overlay and 29 exclusions. These were useful local safeguards, but a base SHA alone did not identify the overlay and temporary paths are not CI dependencies.

CI should checkout committed approved Preview SHA; never overlay Mac files. Track source-to-package manifest. [Rankings mapping](../src/pages/rankingsShowcase.ts) references eight portrait WebP and eight landscape WebP, including `t100_cycling_final.webp`. The older Cycling WebP, original PNGs, manifests and README remain local/untracked; a clean checkout excludes them. Vite copies `public` content, so add a validation rule that fails if such originals later enter the release package. Do not blindly exclude every PNG: legitimate icons/photos/fallbacks may use other formats.

Preserve all runtime photos, logos, fonts and responsive variants referenced by source/build. Home optimized variants are imported via [generated mapping](../src/generated/showcaseImageVariants.ts); original Home files under `src/assets/showcase` are source evidence, not automatically public assets. Validate actual emitted paths rather than relying only on extensions. Require all 16 Rankings assets exactly once, all referenced URLs present with expected MIME/dimensions, responsive `<picture>` selection, no unused original directories, credential files, HTML evidence, caches or reports in `dist`. Hash duplicates may be reported without deleting legitimate distinct URLs automatically.

Use a clean staging directory and fail unexpected files instead of silently deleting source. Reproduce the package from the same commit/tools and compare digests; metadata must be deterministic. Preserve rollback originals/evidence outside deployment output; do not modify the existing archive. Tests dependent on historical manifests belong in the diagnostics lane, not a reason to ship originals.

## 8. Post-deployment smoke

Run GET-only `npm run check:preview`, then a new explicit expected-SHA check on both `https://preview.300w.app/api/health` and `https://tri-app-preview.shy-andrey.workers.dev/api/health`. Current [checker](../scripts/check-preview.mjs) does **not parse `--expected-sha`**; [shared checker](../scripts/check-deployment.mjs) only validates type/shape. Passing such an argument currently provides no SHA guarantee. Health also does not prove D1 connectivity; News may be cached.

Require exact full SHA, application version, expected Worker API behavior, asset hashes/MIME, no console exceptions, and unchanged binding/secret-name baseline. Compare Production identity/config to preflight using an authorized read-only source; absence of access is UNKNOWN, not PASS. Do not submit Feedback or send Telegram/webhook messages.

Browser smoke on built/deployed assets: Home, Calendar, Rankings, a fixture-confirmed athlete route, a fixture-confirmed race edition route and More. Derive IDs from approved fixtures, not hardcoded invented examples. Test all five tabs, direct routes, Back/Forward, refresh, series/gender swipe, season persistence, links, Feedback opening/dismissal only, scroll accessibility. At 390×844, 440×956, 844×390 and 956×440 verify dark UI, correct responsive images decoded, no missing assets/overflow or duplicate transfers, NAV layering. Use bounded state waits and fresh browser contexts. Existing write-mocking local suites must not be pointed at remote Preview wholesale.

Provide owner exact URL, SHA, version/deployment IDs, package digest, gate/smoke status and limitations. Physical iPhone Safari and Telegram Mini App remain separate owner QA; emulation does not approve a release.

## 9. Failure, rollback and evidence

| Event | Required behavior |
| --- | --- |
| Build/test/packaging failure or missing environment | No credential job, no publish; retain failing logs/artifacts; fail required status |
| Preflight target/config/permission mismatch | STOP before mutation, report named sanitized operation/status/duration |
| Deployment error or timeout | Do not retry automatically; read active version and asset/health state to determine whether publish happened |
| Suspected partial deployment or smoke mismatch | Mark failed/unknown; stop subsequent deploys pending owner review; compare both hosts, assets and active version |
| Preview rollback needed | Owner chooses recorded known-good version/package; verify bindings/data compatibility, authorize Preview-only rollback, then rerun smoke |
| Unexpected Production mutation | Halt pipeline, alert owner through GitHub summary/failure notification, preserve evidence; no automatic Production rollback or secret changes |
| Credential compromise | Follow owner revocation procedure above; no destructive remediation by CI |

Rollback restores a Worker version, not D1 contents or external Telegram state. Resource compatibility must be checked; retain version/deployment IDs and package evidence. [Cloudflare rollback semantics](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/). Reverting a Git PR and redeploying is another explicitly approved Preview route, not history rewriting. Prefer owner-controlled rollback initially; unattended rollback is not part of this proposal.

## 10. Complexity, decisions and DEVOPS-03B plan

Moderate implementation effort, with security qualification and browser portability as the main uncertainty—not YAML size. Suggested sequence:

1. Approve trigger/promotion policy, QA-03 disposition, permission model and owner review mechanics.
2. Qualify clean Linux CI with pinned tools and fresh browser contexts, no secrets/deploy. Resolve mandatory failures; document historical diagnostics accurately.
3. Implement deterministic packaging, fixed-target guards and expected-SHA smoke; add negative tests for wrong Worker/DB/branch, extra assets, missing hash and stale artifact.
4. Separately authorize protected `preview` branch/environment/settings and narrowly scoped token. Confirm granular Wrangler/custom-domain compatibility; otherwise stop for architecture review.
5. Review full workflow/config diff. Rehearse package/dry-run, then authorize one supervised Preview deployment; prove Production unchanged and run owner iPhone QA.
6. Only then enable automatic deploy on approved Preview merges. Keep Production manual and no parallel native Workers Builds integration.

Open owner decisions: whether to keep a manual environment approval after PR approval; availability of required reviews on the current GitHub plan; dispatch bootstrap on `main`; token-scope acceptance and binding threat model; QA-03 owner/scope; retention/quota; Linux baseline and Safari coverage; read-only preflight monitoring credentials; separate-account fallback; explicit rollback authority. No auto-enablement is authorized by completing this audit.

## 11. Validation and task boundary

Documentation local links and anchor references checked; `git diff --check` PASS. Existing file SHA-256 inventory confirms only Project Board changed among pre-existing files; this report is new. No build/tests were run: executable files are unchanged and this task explicitly requires documentation-only validation. Referenced earlier test/deploy results remain historical evidence, not new PASS claims. No Git writes, API mutations, credential access, dependency installs, branch/settings/workflow creation or deployment occurred.
