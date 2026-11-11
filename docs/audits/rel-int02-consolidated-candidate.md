# REL-INT-02 — Consolidated pre-release candidate

## State and scope

Isolated shared-object clone `/private/tmp/300w-rel-int02-candidate`, branch `integration/rel-int02`, HEAD/base `8e4c303093669d325784e41f3760f81c515f0315`. Fresh branch, empty index; all changes uncommitted. Local origin points to the source clone, not GitHub. No commit, push, PR, merge, deployment, remote configuration change or regeneration performed. Other worktrees are not integration targets and were not edited.

Sources: `/private/tmp/300w-rel-int01-candidate` and `/private/tmp/300w-ath03b-candidate`, both on the exact same Preview base. All source files copied byte-for-byte except Project Board, whose additive task records were combined. Both source reports remain unchanged as historical evidence; their individual scope/exclusions describe their earlier tasks, not this combined candidate.

Qualified smoke files (`smoke-preview-ci.mjs`, `preview-browser-readiness.mjs`, `test-preview-browser-readiness.mjs`) byte-identical to `56f1086c4d5d42952c80a8d39daac822d3b8cfa4`. The qualification-only workflow is absent. Existing workflows, deploy safeguards, Wrangler configuration and package version `0.0.0` remain unchanged.

Home/Showcase change is exactly `dateISO > getMoscowTodayISO()` → `>=`, matching Calendar. Event remains on its Moscow date and is finished the next day. Existing render/navigation/reload behavior is preserved; no new midnight timer.

Kate Waugh ID101/nameEn guard unchanged. Seven exact paragraphs from owner source `dd71116293b314cf6762624fbfc79d59ccf28d22`; complete source document SHA256 `ff005ae7b94198016a44652cd8db718663ad10bd30e9919eba759e72bf211563`. No other content addition.

## Exact file inventory

- `docs/PROJECT_BOARD.md`
- `docs/athlete-bios/approved/060-kate-waugh.md`
- `docs/audits/ath03b-kate-waugh-integration.md`
- `docs/audits/rel-int01-integration-candidate.md`
- `docs/audits/rel-int02-consolidated-candidate.md`
- `scripts/approved-biography-contract.mjs`
- `scripts/fixtures/approved-kate-waugh-biography.json`
- `scripts/preview-browser-readiness.mjs`
- `scripts/release-policy.mjs`
- `scripts/smoke-preview-ci.mjs`
- `scripts/test-approved-biographies-browser.mjs`
- `scripts/test-approved-biographies.mjs`
- `scripts/test-preview-browser-readiness.mjs`
- `scripts/test-race-date-boundary.mjs`
- `src/App.tsx`
- `src/data/athletes/athleteBiographies.json`

## Before/after integrity

- Original 57 approved Markdown files byte-identical to baseline; original 57 registry values unchanged. Total approved biographies 58. Only Kate has a new bio.
- Canonical catalog loaded through Vite SSR and compared with the baseline snapshot: all 1167 complete JSON records identical after removing only Kate's new bio. IDs, English/Russian names, countries, photos, achievements and other metadata preserved.
- All results source files unchanged; 4592 unique result IDs, 4592/4592 links valid. Result ID sequence SHA256: `43e97adceb5ee7f0f9258e179adbaab76c8b3e513cc4e929c2a4f7c8b1911b99`.
- Entire tracked `src` diff contains only App date comparison and the biography registry. Ranking formula, results, official standings and image assets unchanged. No full catalog regeneration.
- Raw integrity evidence: `/private/tmp/rel-int02-integrity.json`, `/private/tmp/rel-int02-catalog-integrity.json`; provenance inventory `/private/tmp/rel-int02-inventory.json`.

## Validation

- `npm run check:release`: 18/18 PASS, including build and lint.
- `node --test --test-concurrency=1 scripts/test-approved-biographies.mjs scripts/test-race-date-boundary.mjs scripts/test-preview-browser-readiness.mjs scripts/test-preview-pipeline.mjs`: 115/115 PASS. Includes 10 biography and five real-render date boundary cases, plus 100 harness/pipeline checks.
- `npm run audit:athletes`: 0 issues; missing photos remain INFO, not defects.
- `npm run audit:results`: 0 errors, 0 warnings, 52 existing verified source notes retained.
- Browser release gate: all 14/14 suites PASS in the gate's own machine-readable summary and final output, runtime 371.5s. Important orchestration limitation: the external temporary launcher had a 300s timeout and terminated the parent npm process (exit code null); its child gate continued, completed all 14 checks and wrote PASS. Thus the launcher result is FAIL while the complete underlying test result is PASS; no rerun or assertion change was used to hide this. For future launches use an outer budget sufficient for 14 suites; do not alter individual suite limits.
- Additional biography browser suite exit 0: 58 mobile biographies at 390×844 and 7 representative desktop profiles at 1440×900, exact paragraphs/no horizontal overflow.
- Gate summary: `/private/var/folders/tv/017vd_xs5ddgs1dr8342qw2r0000gn/T/tri-release-fXfOov/summary.json`. Outer summary and full logs retained under the browser evidence directory.
- `git diff --check` PASS; index empty. No application-test failures remain, but the outer browser launcher timeout is explicitly retained as an execution limitation.
- Initial sandbox attempts encountered loopback `listen EPERM` in audit/test infrastructure. Same commands rerun in permitted local environment without code/assertion changes. Initial logs preserved; no application retry was concealed.
- Logs: `/private/tmp/rel-int02-release.log`, `rel-int02-release-permitted.log`, `rel-int02-targeted.log`, `rel-int02-targeted-permitted.log`, `rel-int02-athletes-permitted.log`, `rel-int02-results-permitted.log`; browser evidence under `/private/tmp/300w-rel-int02-evidence/browser/`.

## Proposed publication (not executed)

1. Owner approves exact candidate scope and separate publication authorization. Freshly verify remote Preview still at the base; stop/reconcile if advanced.
2. Create a dedicated release integration branch from this candidate; stage only the inventory above. Review staged diff, secrets and integrity; commit only after authorization. Push explicitly to GitHub on that new branch (local clone origin is not GitHub).
3. Open one PR into `preview`, proposed title `REL-INT-02: integrate qualified smoke, Moscow date boundary and Kate Waugh biography`. Require Portable and Browser checks for exact head. Exclude qualification workflow and all local evidence/browser profiles/build outputs.
4. Separate owner approval before ordinary protected merge. Merge into Preview can trigger live Auto Deploy; neither merge nor deployment is authorized by this local task. Do not change activation or safeguards to bypass CI.

## Proposed Preview deployment and recovery (not executed)

Before authorized merge, verify live Preview HEAD/health, Environment restriction and activation, scoped token availability, Worker identity, bindings/secret names/cron, and current deployment/version rollback baseline. Reuse owner-confirmed domain evidence only if still applicable. No stale historical rollback IDs should be assumed current.

Allow existing pipeline to build/verify the exact merge SHA, transfer immutable artifact, run both CI jobs and deployment preflight, then publish only `tri-app-preview`. Capture deployment/version IDs, exact health SHA/version and full smoke. Verify all 58 biographies, date behavior, navigation/artwork; no real Feedback submission or D1 writes. Production must remain unchanged.

On failure preserve logs/artifact and determine whether publication occurred; do not retry or roll back automatically. Recommend restoring the freshly recorded pre-deploy Preview version only after explicit owner authorization and compatibility verification (bindings, secrets, cron and D1). Recheck exact-SHA health and smoke after an authorized rollback. Physical-device QA and Production release remain separate approvals.

## Remaining limitations

Known bundle-size warning; TECH-01 full-regeneration restriction remains. Local tests do not establish fresh Linux/remote CI or infrastructure state. Previously qualified Linux harness evidence is reused because its three files are identical. No fresh live deployment/smoke is performed in this task. Owner device QA and release approval are not implied by test PASS.
