# REL-01A — 300W v1.0.0 local release candidate

## Status and provenance

LOCAL CANDIDATE / QUALIFICATION PASS / AWAITING OWNER REVIEW / NOT PUBLISHED. Owner authorizes versioning/documentation and local validation only. No commit, push, PR, merge, deployment, tag or public announcement.

Worktree: `/private/tmp/300w-rel01a-candidate`; branch `release/rel-01a-v1.0.0`; exact base `dc2beb424aeaf62831e56da6c849f7ce66ba216b`. Node24.19.0. Existing locked dependencies reused via node_modules symlink from the qualified environment; no dependency installation or lock dependency change. Original worktrees preserved.

Version1.0.0 is prepared locally in package.json and both root lockfile fields. CHANGELOG date2026-11-12 is provisional, subject to owner approval, not a claimed release date. `SHA: tag:v1.0.0` is the documented future provenance reference; no tag exists as a result of this task. Generated metadata is produced by the existing script only. Because no commit is authorized, build commit metadata still identifies base SHA; this dirty candidate build must not be deployed as a committed release. After authorized commit, qualify the actual new SHA R and artifact.

## Draft release summary

300W provides a professional race calendar and results, athlete profiles, IRONMAN/T100 standings and the internal 300W athlete ranking. Search, Russian-first athlete names with original-name fallback, mobile navigation, dark-only design, responsive artwork, News and Feedback are included. The catalog contains1167 stable athlete identities and4592 result rows, with58 approved Russian biographies including Kate Waugh ID101. Existing results/source anomalies, photos, achievements and localization are preserved; no new content is added by REL-01A.

Rankings lazy loading and layout stability improvements remain intact. Home/Showcase retain races throughout their Moscow event date; Calendar uses the same today/upcoming policy. Current version and release notes are shown in More. Draft user-facing wording is in [CHANGELOG](../CHANGELOG.md); owner review remains required.

## Acceptance evidence and limits

DEVOPS-05D published baseSHA to Preview: deployment9746cf1d-6977-4005-b143-2adcab005dc2, version7e7fb434-be26-4178-963d-c63973889a92. Readiness, exact artifact/HTML/JS, full browser smoke and58 mobile/7 desktop biography checks passed. This is historical evidence for version0.0.0, not a deployment of1.0.0. Production remains c8f52e02a75e0b413dddbfee77f477232c5301d3/version0.0.0 according to REL-GATE-01 live health. Cloudflare ID reinspection in REL-GATE-01 was unavailable (API401, Wrangler fetch failure); fresh infrastructure preflight is mandatory before later publication.

Owner-reported Safari/iPhone:43/44 PASS,0 FAIL, one unverified no-VPN availability item. No inferred device/OS/network/VPN details. Firefox/iPhone unreported; Android E2E explicitly deferred post-release. Desktop/headless responsive tests do not substitute for physical devices. No new owner/device acceptance is asserted for this local1.0.0 candidate.

## Known limitations and deferred work

- OPS-02: access from Russia without VPN remains unreliable/unverified; no claim of global availability. Explicit owner release-risk decision remains required.
- OPS-03: D1 restore drill pending; no successful restore claimed. Confirm backup/recovery readiness and either perform separately approved isolated drill or explicitly accept the residual risk before Production.
- GitHub run43095376835 remains unresolved QUEUED/zero jobs at REL-GATE-01; Auto Deploy suspended, Environment flag false. Do not re-enable or silently rerun. No GitHub operations in REL-01A.
- TECH-01: full catalog regeneration prohibited; known stable-ID reassignment is not fixed. TECH-03 result-array ordering risks remain; no reorder/data changes.
- ATH-04 enrichment deferred post-release:118 VERIFIED/29 HOLD remain research, not runtime data. Preserve four existing Kristian achievements. Future research cutoff season2023 inclusive remains subject to editorial approval.
- Missing photos are supported via placeholders, not identity defects. Existing source-result anomalies are preserved. Photo discovery requires review; no bulk enrichment.
- Existing sports-bundle warning and historical browser/network stability evidence remain; no performance changes in this candidate.
- Cloud integration, further data enrichment and2027 content are post-release. Content freeze includes the separately approved58th biography; do not expand scope.

## Deployment and release procedure (not authorized here)

Manual deployment is the approved operating model, with existing automatic pipeline retained but disabled. Freshly verify activationfalse, competing publishers, exact approved SHA, account/Worker, binding/secret-name/cron snapshots and compatible rollback target before each publication. Do not spoof GitHub environment variables. Package and verify an immutable artifact from clean release SHA R; use a separately reviewed operational config outside that package and artifact-only Wrangler invocation, without independent rebuild at upload.

Preview and Production differ in Worker, DB UUID, limiter, origin, bot and site-key values. The existing Preview-only artifact verifier is not a qualified Production packager; qualify the Production procedure/configuration separately, rather than relabeling the Preview package. No migrations, secret changes or D1 writes for a version bump. Existing generic npm deploy scripts can invoke build through Wrangler; do not treat them as interchangeable with the qualified artifact-only procedure.

After an authorized commit/PR, qualify metadata and artifact for the actual R. Promote to Preview only after separate approval, exact-SHA/version readiness and full smoke; obtain owner acceptance. Production publication needs explicit approval of R, current infrastructure/backup/rollback preflight and no competing writer. On failure STOP, no automatic retry/rollback. Production smoke/E2E, final owner acceptance, separately authorized annotated tagv1.0.0 on deployed R and public announcement are still required for full public release. Feedback submissions require explicit approval. See [version policy](versioning.md) and [recovery runbook](deployment-cloudflare.md).

## Local verification

Final local results: External logs: `/private/tmp/300w-rel01a-evidence/`. First sandbox attempts are retained: targeted tests hit localhost EPERM; fast gate reported environment errors for athlete/results audits. These are not PASS and were rerun with authorized localhost access, without code/test changes. No full regeneration, remote data operations or dependency changes.


| Check | Actual result |
|---|---|
| Node | 24.19.0 |
| Metadata/version consistency | PASS: package, both lock roots, generated metadata/current notes1.0.0; build SHA remains base until commit |
| Targeted versioning, biography, Moscow date, portable photo/rejection and Telegram-command tests | 59/59 PASS, exit0 |
| Build and ESLint | PASS in final fast gate |
| Fast release gate | 18/18 PASS, exit0,34.0s; no failures/environment errors in unrestricted run |
| Full browser release gate | 14/14 PASS, genuine npm exit0,373.1s |
| Biography browser | 58 mobile390x844 +7 desktop1440x900 PASS, exit0, exact paragraphs/no overflow |
| Athlete audit | 0 issues;1167 identities; localization consistency preserved |
| Results audit | 4592 unique result IDs,4592/4592 athlete links,0errors/0warnings;52 verified source anomalies retained |
| Scope/integrity | 1207 tracked source/data/assets/scripts/workflows/approved-source files byte-identical to base;58 biography entries unchanged; ranking and Cloudflare config unchanged |
| Lockfile | Only top-level and root-package versions changed; dependencies identical |
| Documentation links / git diff --check | PASS; index empty |

The initial sandbox targeted command exited1 (EPERM localhost), and initial fast gate reported athlete/results environment errors. Both original logs are retained; successful reruns changed only execution permissions. The final gate's static historical footer still lists photo tests as non-gating/not run: they were explicitly executed in the59-test targeted command here. Its historical country-conflict wording is obsolete; TECH-01 ID reassignment remains the actual full-regeneration restriction. Archival/staging photo tools and full regeneration were not run; no claim they passed. Existing >500kB bundle warning remains, not suppressed.

Changed-file allowlist (six): package.json, package-lock.json, CHANGELOG.md, docs/versioning.md, docs/PROJECT_BOARD.md, this report. No source/test/workflow/config/data edits. Ignored generated outputs and node_modules symlink are local qualification artifacts, not publication scope. No staging/commit/push occurred. Original source checkout remains clean.

Recommendation: ready for separately authorized focused commit and PR after owner approval of notes/planned date. Not yet a deployable committed artifact or final Production approval. Retain current evidence outside the repo at /private/tmp/300w-rel01a-evidence; do not include browser profiles/private artifacts in publication. After commit record exact newR and refresh build provenance; qualify target-specific packages and repeat required release checks on committedR before separate Preview/Production approval.


## CAL-01 follow-up

The qualification above describes the version-only checkpoint. Owner subsequently authorized the [verified T100 calendar correction](cal01-t100-calendar.md): Dubai both PRO genders and presentation exclusion of postponed Saudi2026, with stable records retained and no2027 creation. This explicitly expands the candidate beyond version/docs; its new qualification and file inventory supersede the earlier six-file-only scope. Original evidence and draft notes preserved; no content enrichment or other feature change.


CAL-01 qualification completed locally: fast18/18; browser14/14 with exit0;35 targeted calendar/date/biography/version tests;30 importer tests;58 mobile/7 desktop biographies. Full1167 profile objects,4592 results and calculated ranking unchanged versus base; only two Dubai edition fields changed plus Saudi presentation exclusion. Final candidate scope17 files; exact CAL-01 inventory and initial failure evidence retained in linked report. Owner review and separate commit/PR authorization remain required.


## Final owner review package

Verified T100 calendar correction added to CHANGELOG.md under Fixed after CAL-01 qualification. Scope remains17 modified/new files, no staged content. Only metadata/versioning tests are repeated for this notes-only follow-up; prior full-gate evidence is not relabeled as a fresh run. Generated .generated/, dist/ and node_modules are excluded from any proposed commit, as are external browser profiles/logs/evidence directories. Date2026-11-12 and final release notes still require owner approval; no tag or publication is implied. Candidate ready for review, not automatic deployment authorization.

Final review checks: npm run metadata PASS; versioning10/10 PASS (including generated UI notes and health handler consistency); git diff --check PASS. No full gate/build/browser rerun for notes-only follow-up.


## Final UI/content polish follow-up

Owner authorized the three scoped corrections in [final polish report](rel01a-final-ui-polish.md): user-facing notes omit the internal ranking, Home calendar label has an explicit line break, loading text is standardized. Previous CAL-01 and versioning work preserved. Earlier17-file inventory and gate evidence are historical checkpoints; current qualification is recorded in the linked report. No content/data enrichment or deployment authorization.

Final polish qualification PASS: fast18/18, full browser14/14 genuine exit0, targeted40/40, Home/loading browser and58 mobile/7 desktop biographies. Combined scope22 files; no commit/publication. See linked polish report for exact incremental inventory and remaining risks.
