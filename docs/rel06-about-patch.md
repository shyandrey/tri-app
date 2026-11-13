# REL-06 — About patch 1.0.1

## Scope and provenance

Isolated branch `release/rel06-v1.0.1`, base/tag v1.0.0 commit `c926e93aa6bdfa1a4dd387c2a3d0c1d31b19d42e`. REL-06B authorizes one commit, release-branch publication and PR into preview; merge, deployment and tag remain separately gated. Owner approves skipping Preview only for this narrow patch, after full local qualification and separate Production approval.

About retains the existing general description, slogan, card, version typography and short-title styling. Native details/summary and detailed release sections are replaced with a static version/title block. Version1.0.1 comes from generated metadata; exact title «Первый релиз 300W» comes from the matching changelog entry. Generated files are not edited or committed. Full v1.0.0 CHANGELOG section remains byte-identical.

Tests replace obsolete expand/collapse expectations with exact static version/title and absence-of-details assertions. Existing keyboard navigation, focus, history, scroll, responsive geometry, privacy and source-link assertions remain.

## Qualification

Evidence: `/private/tmp/300w-rel06-evidence/`. Node24.19.0, locked Wrangler4.142.0; locked install completed. Initial fast gate encountered sandbox EPERM on Vite WebSocket port24678 in athlete/result audits; original log retained. Final fast gate18/18 PASS exit0 with allowed local sockets; full browser gate14/14 PASS exit0 (375.4s); separate About browser PASS across320/390/430/768/1024/1440px including focus/history/navigation; targeted version/biography20/20 PASS. Build/typecheck and ESLint PASS within fast gate. Athlete audit0issues;result audit0errors/0warnings with existing source anomalies retained as documented.1167uniqueAthleteIDs,4592uniqueResultIDs;58exactapprovedbiographies verified. No runtime assertions failed. Initial environment failure was not suppressed. Existing TECH-01 full catalog regeneration is prohibited and not invoked.

Protected paths unchanged: athlete/race/results/localization/biography data, ranking calculation, approved biography Markdown, photos/artwork, Worker/shared code, Cloudflare config and GitHub workflows. No dependency changes. Existing v1.0.0 tag remains pointed at the approved base.

## Exact changed-file inventory

- `package.json`, `package-lock.json`: version fields1.0.1 only; dependencies unchanged.
- `CHANGELOG.md`: new1.0.1 section/title and current status introduction; historical1.0.0 section unchanged.
- `src/pages/MorePage.tsx`: static version/title only, no expandable notes.
- `src/pages/MorePage.css`: remove only obsolete details/summary/list rules.
- `scripts/test-versioning.mjs`: metadata/title and absence-of-detailed-notes contract.
- `scripts/test-more-browser.mjs`: exactstaticreleaseblock; preserve navigation/accessibility/geometry assertions.
- `docs/versioning.md`: current About presentation/test description.
- `docs/PROJECT_BOARD.md`: local qualification checkpoint.
- `docs/rel06-about-patch.md`: scope, evidence and separatelyauthorized publication procedure.

REL-06 qualification completed on the uncommitted ten-file candidate with empty index. REL-06B subsequently authorizes the focused commit and PR; it does not authorize deployment. Qualification build metadata carried the base SHA, so that output is not a deployable patch identity. A future artifact must be rebuilt from the separately approved committed SHA R. Local screenshots under `/private/tmp/300w-rel06-evidence/screenshots/`; mobile screenshot visually inspected. Physical device QA not newly performed. Existing bundle-size and npm install-script warnings retained; no dependency approval/config changes made.

## Proposed next operations — require separate authorization

1. Review the exact ten-file diff and qualification evidence. Suggested single commit: `fix(about): simplify release summary for v1.0.1`. Include only the ten listed source/test/version/documentation paths; exclude generated metadata, dist, node_modules and external evidence.
2. With separate Git authorization, commit/publish only the reviewed patch branch and follow the owner-approved branch integration policy. Pin the resulting exact release SHA R. Do not assume the uncommitted base SHA identifies this patch.
3. Prepare a NEW Production artifact from clean R with version1.0.1, locked dependencies and qualified build. Record manifest/digest and artifact-only dry-run. Do not reuse or relabel the v1.0.0 immutable artifact.
4. Qualify readiness for previous c926e93aa6bdfa1a4dd387c2a3d0c1d31b19d42e/1.0.0 -> R/1.0.1. Existing first-release tooling pins older pairs and MUST NOT be invoked unchanged for this patch. Preserve exact-pair rejection, bounded timeout, two consecutive targets, artifact verification and full read-only smoke. If Preview remains on1.0.0, use an explicitly reviewed exact-release reference guard for R rather than falsely requiring Preview to equal R.
5. Before separately approved ONE Production upload: re-read account/Workertri-app,bindings,vars,eightsecret names,cron,health,activeversion/100%traffic,rollbackcompatibility and fresh D1bookmark; AutoDeployfalse and no competing publishers. Current REL-04B rollback baseline b0b1e3a6-bd19-469c-ada3-f2df5260001d must be freshly verified, not assumed.
6. Post-publication verify exactSHA/version,About1.0.1/title/no details,fullsmoke,unchangedconfig and Preview isolation. STOP on error; no automaticretry/rollback. Tagv1.0.1 requires later owner authorization; never movev1.0.0.

OPS-02 network risk, OPS-03 deferred restore drill, device coverage limits and stuck Actions run remain. Local browser evidence does not constitute new physical-device QA or publication.
