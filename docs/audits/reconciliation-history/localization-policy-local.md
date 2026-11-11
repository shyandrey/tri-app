# Preserved local history: athlete-name-localization-policy.md

Historical snapshot captured during reconciliation on 2026-11-10. This is evidence, not current deployment instructions or authorization. Canonical document: [docs/athlete-name-localization-policy.md](../../athlete-name-localization-policy.md). All original substantive text is retained; relative Markdown links are rebased to their original repository destinations. Source SHA-256: `ac4129bc1d45506bdd5789397f3e4d1afaca265ccec22323f51d8187ddb72ce1`.

---

# DATA-ATH-02C — Athlete Name Localization & Import Policy

Owner approved: 2026-10-30. Policy approved; local implementation awaits review. Editorial batches, remote CI and Preview promotion are not complete. No deployment or data integration is authorized by this document.

## Display contract

300W is Russian-language. Use the approved Russian display name as primary throughout athlete-facing UI. Preserve original English/Latin and stable athlete ID. English fallback is an acceptable exception when Russian localization is missing, empty or unresolved; it must never prevent profile creation/rendering, result/standings inclusion or navigation.

`athleteLocalization.json` remains the exact-identity approved override registry. Existing embedded canonical names remain valid baseline values; their provenance is not rewritten. `localizeAthlete` applies the existing override/embedded priority, then the shared `athleteDisplayName` helper safely falls back to `nameEn` and finally an unlinked official source name. The helper receives localized catalog objects; it does not approve spellings, infer identity or transliterate.

Consumers: OfficialRankingsPage, AthletesPage, AthleteDetailPage, both RaceResultsTable views, and athlete feedback context in SportsArea. Calendar/Home currently render races rather than individual athlete names; any future athlete-facing component must use the same helper. Search continues to index both canonical `name` and original `nameEn`, including existing keyboard-layout support. Source `athleteName`, points, positions, countries, evidence and result records are never rewritten for display localization.

## Import and editorial workflow

Localization is an editorial completion requirement, not a runtime or identity gate.

- Race-result proposals retain unchanged source rows/identity matching and add `localizationReview` metadata for matched English-only profiles and unmatched candidates. Each record has `LOCALIZATION_REVIEW_REQUIRED`, `blocking: false`, original Latin name, and the existing ID where resolved; unresolved IDs stay null. Metadata is printed for dry-run and retained in import evidence on an independently authorized write.
- `find-next-athletes --write --append` preserves existing records/IDs, uses an exact approved Russian override when available, otherwise writes English fallback. It saves `<output>.localization-review.json` for missing names alongside the explicitly requested output. This task did not execute a real catalog append.
- Legacy full-regeneration also reports missing names, with null IDs because that mode has a documented renumbering hazard. Its ID allocation is unchanged and use against the authoritative catalog remains outside this task. The initial report proposal using calculated IDs was rejected by automatic safety review; the implemented metadata uses null instead.
- Standings preparation scripts do not create profiles. They preserve source names and confirmed IDs; unresolved identities remain subject to existing identity review. Do not add profile-creation side effects. Newly created profiles must go through the catalog creation/editorial workflow above.
- Other enrichment/manual catalog updates must run the read-only `audit-athlete-display-names.mjs <new-directory>` export and add missing names to the editorial backlog. The audit covers every catalog source, including generated and verified-generated profiles. Do not overwrite an owner's unfinished CSV.
- Missing names do not count as identity or photo errors. A missing photo remains an acceptable initials placeholder.

## Current reviewed-batch backlog

Exactly 230 English-only catalog profiles, partitioned by ascending stable ID without overlap:

- [Batch 001 — 115](../data-ath02c-batches/batch-001.csv).
- [Batch 002 — 115](../data-ath02c-batches/batch-002.csv).
- [Source hash and partition manifest](../data-ath02c-batches/manifest.json).

`proposed_name_ru` is intentionally empty; `approval_status` is `PENDING_OWNER_REVIEW`. No names were invented or automatically transliterated. Existing approved Russian names are not included for modification.

These are editorial subset worksheets, **not direct importer inputs**: the existing importer intentionally requires the complete exact catalog ID set. After owner approval, create a fresh complete review snapshot without overwriting unfinished work, merge only approved batch `name_ru` edits by exact ID plus unchanged `name_en`, run the existing importer dry-run, review exact diff, and obtain/retain explicit write authorization before integration. Keep existing approved names unchanged unless separately corrected. Never bypass full-catalog, stale-snapshot or identity checks to import a subset.

Future missing names form subsequent batches; do not silently add them to approved Batch 001/002 or reuse old approvals. Source/identity evidence follows [Data Source Policy](../../scripts.md#data-source-policy).

## Acceptance before v1.0.0

1. Owner editorial review and integration of all current 230 names; preserve all existing approved names.
2. Shared Russian-first display on all athlete-facing UI, with tested non-blocking English fallback.
3. Original Latin identities, IDs, results, ranking and official evidence unchanged.
4. Relevant tests, CI and authorized Preview QA pass; physical owner review remains separate.

Current state: 937 Russian display names and 230 English-only names remain unchanged. All 79 official Rankings athletes already had Russian display names; presentation now resolves them by their confirmed ID. The release acceptance is **pending**, even if the existing technical release gate passes. It is not appropriate to block ordinary Preview rendering or normal imports while the editorial backlog is processed.

## Local implementation / verification

Runtime files: `src/utils/athleteDisplayName.ts`, `src/data/athletes/localization.ts`, `src/pages/OfficialRankingsPage.tsx`, `src/pages/AthletesPage.tsx`, `src/pages/AthleteDetailPage.tsx`, `src/components/RaceResultsTable.tsx`, `src/sports/SportsArea.tsx`.

Tooling/tests: `scripts/athlete-localization-review.mjs`, `scripts/import-race-results.mjs`, `scripts/find-next-athletes.mjs`, `scripts/audit-athlete-display-names.mjs`, `scripts/test-athlete-display-policy.mjs`, `scripts/test-race-result-import.mjs`, `scripts/test-find-next-athletes.mjs`, `scripts/test-official-rankings-browser.mjs`, `scripts/check-ci-portable.mjs`. The portable test allowlist includes the new policy checks; workflow triggers and infrastructure are unchanged.

Existing Athlete Profile polish is preserved. Isolated QA uses Preview baseline `68f32ee2871084b237d2b627ed43f4a0fae956b6` plus the scoped local changes. Evidence: `/tmp/300w-data-ath02c/`. No commit, push, remote CI run, Preview/Production deployment, registry import or authoritative data modification was performed.


### Recorded local results

- Initial name/search/generator/import/policy invocation: 38/38 PASS; extended import/policy invocation: 17/17 PASS (overlapping suites, not additive totals).
- Synthetic generator contract with actual sidecar inspection: PASS; append report references its created fixture ID, approved override clears the queue, legacy full-regeneration report uses null IDs. No real athlete created.
- Local portable CI PASS: portable photos, PTO identity/registry, official standings plus new policy tests (22/22 in this group), build, lint and release gate. Remote GitHub CI not run.
- Isolated Official Rankings browser suite PASS: 14 viewport/OS-preference cases, all 12 tables, exact approved ranks/points/IDs and catalog display names, wheel, links, touch/keyboard and history. Zero runtime exceptions. Settled screenshots at `/tmp/300w-data-ath02c/settled-screenshots/` were captured separately after transitions; 320 px Russian-name rendering visually inspected.
- Entire 1167-row ID/English/display/provenance inventory is byte-equivalent at row level before/after; post-policy audit shows zero Rankings-versus-profile display differences. All 937 existing Russian displays and the 230 English fallbacks remain unchanged in the catalog.
- Build and lint PASS; existing sports chunk warning retained. Known legacy full-regeneration invariant failure from DATA-ATH-02A remains unresolved and was not rerun as a production import.
- Documentation links, batch partition (115+115 unique IDs) and `git diff --check` PASS. No authoritative results, standings, localization registry, athlete IDs or artwork modified. Existing Profile polish and unrelated files preserved.

Next: owner code/UI review and editorial completion of Batch 001/002. No claim of v1.0.0 acceptance, remote CI or Preview QA completion.

## DATA-ATH-02D — Integration preflight (2026-10-30)

**Status: STOP before import / awaiting owner decision on the confirmed TECH-01 risk.**
The owner has approved all 230 spellings and authorized two sequential Preview releases. This supersedes the earlier pending editorial-review status above; the blank historical worksheets remain unchanged. Neither batch has been imported or deployed in this task. Current coverage remains 937 Russian displays / 230 English fallbacks out of 1167 profiles.

### Approved inputs and current-catalog verification

Owner files in `~/Downloads/`:

| File | Rows | SHA-256 |
| --- | ---: | --- |
| `300W_DATA_ATH_02B_batch_001_approved.csv` | 115 | `32aa4a10d839a1b53537191d572eaedbba340976ef6ea3b2bbe400d74a5e4a64` |
| `300W_DATA_ATH_02B_batch_002_approved.csv` | 115 | `66a87f21e92984e9037448052257ec881bd7d68b692b148407d6a83e1ddb72a6` |

All 230 IDs are unique across both inputs, exist in the current runtime catalog, and have exact matching original Latin names. Every approval field is `owner_approved`. All Russian values pass the existing Russian-name validator; none of these records already has a Russian display value. Inputs were read without modification. Snapshot loading also checks existing result linkage and detects catalog/localization changes during the read.

The current local DATA-ATH-02C resolver uses canonical localized `name`, then `nameEn`, then unresolved source name. No transliteration is performed. Existing page integration remains uncommitted; unfinished Athlete Profile polish is not approved by this task and must be excluded from any future release candidate.

### Regeneration finding and scope distinction

`node --test scripts/test-athlete-localization.mjs` reproduced the assertion failure **`Regeneration must preserve all non-display data`**. Temporary full-regeneration output assigns Emmanuel Lejeune ID 10140 and moves existing Emmett Gross from 10140 to 10141. This is the already documented TECH-01 stable-ID defect, not a mismatch in the owner CSVs and not evidence of a new localization regression. The test writes a temporary output and removes it; the authoritative catalog was not regenerated.

The ordinary `import-athlete-names.mjs` path is separate: it validates a complete fresh catalog snapshot, exact IDs and Latin names, and stale registry checks, then atomically replaces only `athleteLocalization.json`. It does not call full regeneration. Therefore the reproduced failure does **not** demonstrate that a registry-only import would change IDs. Existing isolated filesystem tests verify that importer boundary.

Nevertheless, DATA-ATH-02D explicitly says to stop before import if regeneration presents a real data-integrity risk. That risk is confirmed for full regeneration, so no import or remote mutation was attempted. Next owner decision: authorize continuation specifically through the guarded registry-only importer while retaining the prohibition on authoritative full regeneration, or resolve TECH-01 in a separate scoped task first. Do not weaken the failing test or treat a release-gate PASS as regeneration PASS.

### Executed verification and release state

- Fresh runtime catalog/CSV validation: **PASS**, 1167 profiles, 230 approved unique input IDs, zero errors.
- `node --test scripts/test-athlete-names.mjs scripts/test-athlete-display-policy.mjs`: **14/14 PASS**, including registry-only filesystem round trips, fallback behavior, and synthetic identity/ranking preservation.
- Full-regeneration test: **1 FAIL**, exact assertion above; known TECH-01.
- Build, release gate, browser CI and deployments: **not run**, stopped at preflight.
- Local branch/HEAD: `home-redesign-experiments` / `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`; index empty.
- Fresh read-only remote query: development `3ce7c4764ae18429f9992c2d572bf28d51238beb`; Preview `68f32ee2871084b237d2b627ed43f4a0fae956b6`.
- No commits, PRs, merges, activation changes or deployments. No sports data, registry entries, artwork or Athlete Profile code changed in this task.

Local diagnostic evidence: `/tmp/300w-data-ath02d/` (`csv-preflight.json`, `runtime-preflight.json`, `regeneration.log`, `name-tests.log`, `before.json`). These temporary files are evidence, not authoritative import inputs or durable release records.

## DATA-ATH-02D — Authorized registry-only resume and Batch 001 blocker

The owner explicitly approved continuation through the existing registry-only importer; the earlier TECH-01 stop is superseded by that decision. **Full catalog regeneration is prohibited until TECH-01 is resolved.** Confirmed example remains Emmett Gross `10140 → 10141`. No full regeneration was run during the resumed task.

An isolated clone at `/tmp/300w-data-ath02d/release`, branch `data/athlete-ru-batch-001`, was created from the freshly verified Preview SHA `68f32ee2871084b237d2b627ed43f4a0fae956b6`. The primary working tree was not switched or staged. Batch 001 was merged into a fresh complete review snapshot by exact ID and Latin name; importer dry-run confirmed 115 ADDED and zero CHANGED entries, then the existing importer wrote only the localization registry. All existing registry entries were preserved exactly. The byte-identical owner CSV is retained in the candidate as `scripts/fixtures/approved-athlete-names/batch-001.csv`, with its approved SHA-256 pinned by a dedicated test.

Candidate coverage is **1052/1167 Russian names**, 115 English fallbacks remaining. All 1167 IDs and non-display profile fields, including Latin names, countries, photos, biographies and achievements, match baseline. All 4592 results, linked results, official standings and fixed-date ranking scores/order match baseline hashes. The candidate contains only localization registry changes, the prepared canonical display resolver and its consumer/test dependencies, plus task documentation. Unfinished Athlete Profile CSS and result-row keyboard polish, generator/import-proposal changes, manual deployment workflow and unrelated artifacts were excluded.

### Confirmed release-test blocker

`npm run check:release` via the portable runner: **17/18 PASS, 1 FAIL** (`results source replay/identity`). Exact failing assertion: `scripts/test-race-result-import.mjs:266`, `assert.equal(hash(athletes), baseline.athletesSha256)` in “Kona incremental import preserves every prior row/profile and exact source statuses”.

- Historical fixture hash: `51a92c6af38fb775999aaaaf35ea91be15b32a46b7599e59e9c018102fdaa0e5`.
- Batch 001 current hash: `19dc99929422c91b7e25742b0053f501f2591e1494a0fa0e3e46f7cc2b9c92f1`.
- Diagnostic reconstruction changed **only** the 115 new display names back to their prior English values, in memory. Its full hash equals the historical fixture exactly.

Thus the fixture pins mutable localization as well as identity; the failure is not evidence of changed identities/results. Nevertheless, release verification is failing and the owner's STOP condition applies. No fixture/test bypass, commit, push, PR, merge or deployment occurred. Batch 002 has not been imported. Primary catalog and live Preview remain at their prior localization coverage (937/1167).

Proposed minimal follow-up: update the Kona replay test to validate the pinned historical catalog using an explicit reviewed display-name projection or a verified identity/non-display snapshot, while preserving exact count, ID/Latin identity, results, edition, status and source replay assertions. Keep the byte-pinned approved-name tests separate. Do not simply replace the expected full hash or omit identity fields.

### Actual local checks

- Initial targeted run: 58 PASS, one environment/setup failure because the clean clone had no `.generated/build-metadata.ts`. After the standard `npm run metadata`, the affected ranking suite passed 8/8; no application/test changes were used to obtain that result.
- Approved name/import/display/catalog/search/current-athlete/standings checks passed; candidate/base invariant snapshots are byte-identical.
- Portable photos, PTO identity/registry and official standings plus localization tests: PASS.
- Production build, lint, catalog audit (zero issues), ranking, Calendar, navigation and results integrity: PASS inside release gate. Release source replay test: FAIL as above.
- Full regeneration and real CI/Preview deployment: not run during resume.
- Local evidence: `/tmp/300w-data-ath02d/batch001-portable/`, `batch001-tests.log`, `batch001-ranking.log`, `baseline-invariants.json`, `batch001-invariants.json`, `import-001/`, `kona-hash-diagnosis.json`.

**Status: blocked before commit/PR; awaiting owner review of the Kona test-contract correction.**

Final local browser result: Official Rankings **14/14 viewport/theme scenarios PASS**, all 12 season/series/gender tables with exact names/values/links, wheel/touch/keyboard/history/layout checks, Home/bottom navigation, zero runtime exceptions. Evidence: `/tmp/300w-data-ath02d/batch001-browser.log` and `batch001-browser/`. `git diff --check` passed in both the primary tree and isolated candidate. This does not override the failed Kona source-replay release check or authorize publication.

## DATA-ATH-02D.1 — Batch 001 Preview closeout

**Complete / Awaiting Owner Review (2026-10-30).** This supersedes the earlier release-test blocker; Batch 002 remains unstarted in this task.

### Test correction

The original Kona historical full-profile hash remains `51a92c6af38fb775999aaaaf35ea91be15b32a46b7599e59e9c018102fdaa0e5`. Exactly 115 allowed display-name changes are loaded from the byte-pinned owner CSV. The test checks each stable ID, Latin name and approved Russian spelling before projecting only `name` to its prior Latin fallback for the historical full-profile comparison. All other fields and every unapproved display name remain hashed. Original source replay/status/edition assertions remain; all result mappings are checked against the canonical catalog.

Ten negative fixtures reject changed ID, Latin name, country, biography, photo, unapproved Russian name, approved Russian spelling, historical result mapping, new Kona result mapping and result time. No full regeneration, historical hash replacement or ignored assertion.

### Commits, CI and publication

- Isolated source branch: `data/athlete-ru-batch-001`.
- Focused commit: `0f974ff03c667b401b127934745c328790754c3f` — `feat(athletes): integrate approved Russian names batch 001` (17 explicit files).
- [PR #6](https://github.com/shyandrey/tri-app/pull/6), normal protected merge into `preview`.
- Merge and deployed SHA: `c5b9bb8766572374964e313e0150836ae1853a0f`.
- [PR CI 41084702433](https://github.com/shyandrey/tri-app/actions/runs/41084702433): Portable PASS; Browser 7/7 PASS; deployment skipped for PR.
- [Post-merge CI 41086692797](https://github.com/shyandrey/tri-app/actions/runs/41086692797): Portable PASS; Browser 7/7 PASS; Deploy verified Preview PASS. No reruns.
- Worker: `tri-app-preview`; [Preview Rankings](https://preview.300w.app/#/rankings).
- Cloudflare deployment: `5626d248-3ed7-4329-bc81-5bb9741c891a`.
- Cloudflare version: `db62d4cf-14b0-4af7-8d3e-3ed122919322`.
- Rollback baseline retained: deployment `515b0f9a-9d4d-4a02-8b08-bd3ab4d6f278`, version `0daabd70-1e91-4479-9e33-4d763ab0cc2c`. No rollback performed.

Deployment reused the SHA/integrity-verified CI artifact and passed the existing account/Worker, rollback, bindings/secret-name, cron and stale-SHA safeguards. Post-publication configuration assertions passed. The Custom Domain baseline remains owner-confirmed on 2026-10-30; HTTPS reachability is not independent proof of Cloudflare domain ownership/routing. No account-level Domains API or permission expansion. Environment activation remains `true`, unchanged by this task.

### Verification and coverage

- Local targeted tests: **56/56 PASS**, including all ten negative cases.
- Local Portable CI and release gate: **18/18 PASS**, including build, lint, audits and corrected source replay. `git diff --check` PASS.
- Local Official Rankings: **14/14 viewport/theme scenarios PASS**, all 12 tables, navigation and zero runtime exceptions.
- Linux PR and post-merge suites: Official Rankings, Rankings Controls, Rankings Swipe, Rankings Showcase, Navigation, Calendar, More — **7/7 PASS in each run**.
- Published smoke: Home, Calendar, Rankings, Athlete Profile, Race Detail, More at 390×844 and 844×390 — PASS; browser errors empty.
- Additional live localization smoke: [Aaronn Gu / Аарон Гу profile](https://preview.300w.app/#/athlete/10003), visible mobile row in Mont-Tremblant 2024 Race Detail, Russian Rankings names and Calendar navigation — PASS; zero runtime exceptions. Calendar displays race/event names rather than athlete rows. Physical-device QA is not claimed.
- Published coverage: **1052/1167 Russian names**, 115 English fallbacks remaining. All 115 Batch 001 spellings match the approved CSV exactly; existing 937 Russian names preserved.
- Baseline comparison confirms all 1167 IDs and other profile fields, all 4592 results, result linkage, official standings and fixed-date ranking scores/order unchanged.
- Production public health remains `c8f52e02a75e0b413dddbfee77f477232c5301d3`; version remains `0.0.0` in both environments. No Production deployment or D1 operations.
- Known sports chunk warning remains. TECH-01 stays open: **Full catalog regeneration is prohibited until TECH-01 is resolved** (Emmett Gross `10140 → 10141`).

### Exact committed scope

- `docs/PROJECT_BOARD.md`
- `docs/athlete-name-localization-policy.md`
- `scripts/check-ci-portable.mjs`
- `scripts/test-official-rankings-browser.mjs`
- `scripts/test-race-result-import.mjs`
- `scripts/athlete-localization-review.mjs`
- `scripts/fixtures/approved-athlete-names/batch-001.csv`
- `scripts/test-approved-athlete-names.mjs`
- `scripts/test-athlete-display-policy.mjs`
- `src/components/RaceResultsTable.tsx`
- `src/data/athletes/athleteLocalization.json`
- `src/data/athletes/localization.ts`
- `src/pages/AthleteDetailPage.tsx`
- `src/pages/AthletesPage.tsx`
- `src/pages/OfficialRankingsPage.tsx`
- `src/sports/SportsArea.tsx`
- `src/utils/athleteDisplayName.ts`

Primary development working tree was not switched, staged, committed or pushed. Unfinished Athlete Profile polish and all unrelated local files were preserved. The isolated candidate contains only name-related Athlete Profile changes; CSS and result-row keyboard polish were excluded. These final report/Board updates are local and uncommitted to avoid an additional deployment solely for closeout metadata.

Evidence: `/tmp/300w-data-ath02d/d1-tests.log`, `d1-portable/`, `d1-browser.log`, `pr-browser-job.log`, `postmerge-browser-job.log`, `deployed-evidence/`, `live-localization/`, `final-remote.json`, and before/after invariant snapshots. Batch 002 has not been imported, committed or deployed; no claim of 1167/1167 coverage.

## Batch 002 — Preflight stop on existing-name mismatch

**Historical checkpoint — resolved by owner clarification.** Approved name for ID 71 is «Каспер Степаньяк»; preserve the existing entry. The prior «Каспер Стемпняк» expectation was an incorrect task assertion, not a data-integrity defect. The stopped preflight below is retained as history; registry-only Batch 002 has resumed.

The clean isolated candidate was moved to a new local branch `data/athlete-ru-batch-002` from freshly fetched Preview HEAD `c5b9bb8766572374964e313e0150836ae1853a0f`. No source files, index entries or commits were changed in that candidate. The primary development branch and unfinished work were preserved.

Owner input: `~/Downloads/300W_DATA_ATH_02B_batch_002_approved.csv`, SHA-256 `66a87f21e92984e9037448052257ec881bd7d68b692b148407d6a83e1ddb72a6`. All 115 rows have unique canonical IDs, exact Latin-name matches, valid owner-approved Russian spellings and currently empty Russian display values. No input row conflicts with existing approved localization. No importer write or full regeneration was invoked.

The separately required existing-name assertions revealed a baseline mismatch:

| Athlete | ID | Current canonical display | Requested value | Result |
| --- | ---: | --- | --- | --- |
| Menno Koolhaas | 10 | Менно Куулхас | Менно Куулхас | Matches; not in Batch 002 |
| Kacper Stepniak | 71 | Каспер Степаньяк | Каспер Стемпняк | **Mismatch; not in Batch 002** |
| Nick Thijs | 10434 | Ний Тийс | Ний Тийс | Matches Batch 001 correction |
| Read Ziegler | 10486 | English fallback | Рид Циглер | Exact approved Batch 002 input; not yet imported |
| Alice Fritzsche | 10647 | English fallback | Элис Фритцше | Exact approved Batch 002 input; not yet imported |

For ID 71, the checked-in localization registry at `src/data/athletes/athleteLocalization.json:2608` contains `"Kacper Stepniak": "Каспер Степаньяк"`. Its override takes precedence over the curated `men.ts` value «Кацпер Стемпняк». Neither value equals the requested «Каспер Стемпняк». This is an existing-name discrepancy, **not** a bad Batch 002 CSV row or an identity mismatch. Batch 001 did not change this record.

Proceeding without clarification would either fail the mandatory preservation assertion or change an existing Russian name outside the 115-row import. The task explicitly forbids silently overwriting existing approved names. Owner decision is required for ID 71: authorize the exact separate correction to «Каспер Стемпняк», or correct the preservation expectation. If a spelling correction is authorized, its historical display projection must be explicit; do not replace the historical full-profile hash or weaken protected-field/result assertions. Menno and Kacper must remain outside the newly localized count.

No catalog/localization/test changes, commits, PRs, merges or deployments were made. Russian-name coverage remains **1052/1167**, with 115 English fallbacks. Build, release gate and browser suites were not rerun because execution stopped at preflight. `git diff --check` was run after documentation updates. TECH-01 remains open; **full catalog regeneration is prohibited until TECH-01 is resolved**.

Diagnostic evidence: `/tmp/300w-data-ath02d-batch002/preflight.json`. Only the primary policy and Project Board documents were updated; the isolated candidate remains clean at the deployed baseline.


## Batch 002 — Final Preview closeout

**Complete (2026-10-30).** Supersedes the historical checkpoints above. Both owner-approved batches are integrated: **230/230 names; final Russian-name coverage 1167/1167**. No current catalog English-only exceptions remain; safe English fallback is retained for future missing localization.

Owner clarification preserves ID 71 Kacper Stepniak as **Каспер Степаньяк**, without changing its existing registry entry. Menno Koolhaas (10) remains **Менно Куулхас**. Neither athlete is counted among the newly localized 115. Explicit regression checks and live profiles also confirm Nick Thijs (10434) — **Ний Тийс**, Read Ziegler (10486) — **Рид Циглер**, Alice Fritzsche (10647) — **Элис Фритцше**.

### Import and protected data

- Used only the existing localization registry importer; exactly 115 previously missing entries added, no prior entries overwritten. CSV SHA-256: `66a87f21e92984e9037448052257ec881bd7d68b692b148407d6a83e1ddb72a6`.
- Before/after invariant snapshots are identical: 1167 Athlete IDs, Latin names and protected profile fields (countries, photos, biographies, achievements), 4592 results and mappings, official standings, internal ranking order/scores unchanged.
- Reused the historical profile-hash contract, extending only the byte-pinned approved display-name projection to Batch 002. Exact CSV name/identity assertions precede projection. Negative guards continue rejecting ID, Latin name, result mapping, unapproved-name and approved-name mutations.
- **TECH-01 remains OPEN. Full catalog regeneration is prohibited until TECH-01 is resolved.** Confirmed existing defect: Emmett Gross `10140 → 10141`. No full regeneration ran for this import.

### Git, CI and deployment

- Source commit: `e95e2b14e2fb7903d8a73f062797b080b9ac2214`, branch `data/athlete-ru-batch-002`.
- [PR #7](https://github.com/shyandrey/tri-app/pull/7), protected merge / published Preview SHA: `c43182ca3927b4264f9fd560ca02c39776021242`.
- [PR CI](https://github.com/shyandrey/tri-app/actions/runs/41120790258): Portable and Browser PASS.
- [Post-merge CI and Auto Deploy](https://github.com/shyandrey/tri-app/actions/runs/41122492828): Portable, Browser and Deploy verified Preview PASS.
- Cloudflare target: `tri-app-preview`; deployment ID `b8fc948c-ab8e-4045-9838-0da300e167c6`; version ID `0201d54f-7b9f-4b2e-8c2c-15de7717ce73`.
- Rollback baseline (Batch 001): deployment `5626d248-3ed7-4329-bc81-5bb9741c891a`, version `db62d4cf-14b0-4af7-8d3e-3ed122919322`, SHA `c5b9bb8766572374964e313e0150836ae1853a0f`.
- Existing Preview Environment activation remains `true`; no activation or credential changes made. Built-in artifact/integrity, stale-SHA, Worker identity, bindings/secret-name and cron checks passed. Custom Domain baseline is owner-confirmed (2026-10-30); HTTPS checks alone do not prove unchanged domain ownership/routing.
- Production health remains SHA `c8f52e02a75e0b413dddbfee77f477232c5301d3`, version `0.0.0`; no Production deployment, D1 operations or version bump.

Exact six committed files:

- `src/data/athletes/athleteLocalization.json`
- `scripts/fixtures/approved-athlete-names/batch-002.csv`
- `scripts/test-approved-athlete-names.mjs`
- `scripts/test-race-result-import.mjs`
- `docs/athlete-name-localization-policy.md`
- `docs/PROJECT_BOARD.md`

### Verification and limitations

- Targeted localization/catalog/import tests: **56/56 PASS**, including 10 negative cases.
- Local portable checks, production build, lint, athlete audit and release gate: **PASS (18/18 release checks)**. Existing sports chunk warning remains.
- GitHub Linux browser suites: **7/7 PASS** on both PR and post-merge builds (Official Rankings, controls/Season Picker, swipe/network, showcase, navigation, Calendar, More). Local full browser suites were not unnecessarily repeated.
- Published HTTPS health SHA matches the merge. Pipeline smoke: Home, Calendar, Rankings, Athlete, Race, More at 390×844 and 844×390 **PASS**, no browser errors. Additional live checks: five control-name profiles, Race Detail with Рид Циглер, Russian Rankings names, Calendar **PASS**. This is browser automation, not physical iPhone QA.
- Evidence: `/tmp/300w-data-ath02d-batch002/` — before/after invariants, test and portable logs, PR/post-merge browser logs, deployment evidence, live-localization screenshots/summary, health snapshots and final remote verification.
- Primary development worktree and unfinished Athlete Profile work were preserved. Release changes live in the isolated release branch and Preview; the old primary working catalog was deliberately not overwritten. Final outcome updates in this document and Project Board remain local/uncommitted, avoiding an additional deployment solely for reporting.
