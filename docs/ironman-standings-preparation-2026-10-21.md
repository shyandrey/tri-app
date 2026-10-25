# IRONMAN Pro Series — local candidate preparation, 21.10.2026

**Identity closeout approved by owner on 2026-10-22 and applied locally: 60 CONFIRMED / 0 REVIEW / 0 UNRESOLVED.** Values are owner-approved; no independent HTML/screenshot verification is claimed. No application integration is performed.

## Source and exact comparison

Input: `~/Downloads/ironman-pro-series-standings-2024-2026-approved.csv`, UTF-8 with BOM, 9524 bytes. Its exact SHA-256 and all original CSV field strings are retained in the [approved fixture](../scripts/fixtures/official-standings/ironman-approved-2026-10-21.json). Original CSV was not edited. An independent Python csv read of the original file matched all fixture records, and every rank/name/raw country/points/source URL matched all six output tables. There were **zero value replacements**. Original row order is preserved within each table; no points calculations or tie reordering.

Provenance is `OWNER_APPROVED_SCREENSHOT_TRANSCRIPTION`, owner approval 2026-10-21. Source URLs remain exactly those in CSV. Capture/update date is unknown (`sourceObservedAt: null`); no HTML hashes or profile URLs are invented. Profile hashes and URLs in identity evidence refer to existing verified PTO snapshots/mappings, not to the IRONMAN standings source.

## Registry and identity

[Candidate directory](../src/data/officialStandings/ironman/): six files, 2024/2025/2026 Men/Women, 10 rows each. `coverage: TOP_10_ONLY`; these are not full season standings archives. Historical status is `HISTORICAL_FINAL_PENDING_CONFIRMATION`; 2026 is `LIVE`, not a promise of live refresh. `readyForApplication: false` pending review/integration approval.

60 rows / 42 distinct source names. **60 CONFIRMED**, **0 REVIEW**, **0 UNRESOLVED**. The original 56 confirmed mappings are unchanged. Four row-bound owner decisions were applied on 2026-10-22:

| Season / gender / rank | Source athlete | Confirmed ID | Evidence / resolution |
|---|---|---:|---|
| 2024 Men #8 | Mathias Lyngsø Petersen | 100 | Archived approved PTO profile biography explicitly names Mathias Lyngsoe Petersen; DK, approved URL and nine historical result matches connect it to local Mathias Petersen. |
| 2024 Women #5; 2025 Women #10 | Maja Stage Nielsen | 10840 | Official PTO profile: Denmark and three exact result tuples (2767, 2704, 2505), including splits. Earlier photo REVIEW concerned shared imagery, not conflicting athlete identity. |
| 2025 Men #4 | Nick Thompson | 10435 | Existing verified country/profile evidence plus two archived official HTML results (4428, 4551) link the same profile to AU. Existing historical country records were not changed. |

Original evidence report: `/tmp/300w-ironman-identity-review-2026-10-22/review.md`. Its complete text and SHA-256 are now preserved in `identityReviewCloseout` in the approved fixture, so replay does not depend on `/tmp`. The report records the proposal state before approval; this closeout supersedes its pending-approval recommendation. No evidence archive was modified. Maja's web-tool observation has no invented raw HTML hash.

Each approved row retains separate `identityApproval`: exact name, athlete ID, normalized country, gender, season/rank scope, owner approval date and evidence-report hash. This is approval of four IRONMAN ranking identities only, not new PTO enrichment URL approvals. Country/gender conflicts still fail; decisions cannot apply to different names, IDs, ranks or seasons. Original evidence and prior review flags in the fixture remain available as audit history.

[All 60 identity rows](ironman-standings-identity-review-2026-10-21.csv) now show CONFIRMED, with the four decisions dated 2026-10-22. Existing profile names, countries, social links and result linkage remain unchanged. Official standings names, rank, points, country, source provenance and row order are unchanged.

## Country normalization

Preserve `countryISO3` as raw `nationality` even where the label is a sports code rather than ISO. Use complete pinned ISO 3166-1 table first; scoped sports aliases GER→DE, DEN→DK, NED→NL, RSA→ZA reuse existing `src/data/athletes/localization.ts` rules. Tests compare these results with existing project localization. Global PTO validator is unchanged. Unknown/conflicting codes cannot produce CONFIRMED identity.

## Replay and tests

[Replay script](../scripts/prepare-ironman-standings.mjs) reads only the pinned fixture; no Downloads, `/tmp`, network or external evidence dependencies are required for ordinary replay/tests. Default prints JSON without writes:

```sh
node scripts/prepare-ironman-standings.mjs
node scripts/prepare-ironman-standings.mjs --out-dir src/data/officialStandings/ironman
node --test scripts/test-ironman-standings.mjs scripts/test-t100-standings.mjs
node --test scripts/test-pto-profiles.mjs scripts/test-pto-profile-mapping.mjs scripts/test-pto-profile-registry.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs
npm run check:release
git diff --check
```

`npm run check` does not exist. The existing `check:release` gate is used instead. New registry tests run separately; no release-policy or package changes.

## Proposed integration (not implemented)

Use a separate IRONMAN series directory with the same seasonYear/gender/rows/officialRank/officialPoints/athleteId shape as T100. Future UI may share a table renderer and series/season/gender selection after separate approval. Link only confirmed athleteId; REVIEW names remain visible without navigation. Do not drop unresolved official top-ten rows or replace them with another athlete. Preserve official row order and distinguish official standings from internal 300W ranking. Keep pending historical finality visible. No module currently imports these candidates into application runtime.

## Scope

Six IRONMAN JSON files; approved input/evidence fixture; replay script; registry tests; this report; identity CSV; RANK-01 board progress. All prior T100 work and previous board changes are preserved. No deployment, D1 writes, version change, commit/push, UI, News/Feedback or infrastructure changes.

## Executed validation — 2026-10-21

- IRONMAN/T100 registry tests: **19/19 PASS** (10 IRONMAN, 9 T100).
- PTO/ranking regression tests: **57/57 PASS**.
- Existing `npm run check:release`: **18/18 PASS**; this gate does not include live infrastructure or browser checks.
- Original CSV versus fixture and all candidate values: **PASS**, 60 rows, no replacements. Deterministic replay: **PASS**.
- Pre/post runtime catalog comparison: **PASS**, all 1167 athletes, 4592 results and internal ranking unchanged.
- Hash comparison: T100 datasets/fixture, ATH enrichment/mappings, original CSV and four longstanding artifacts unchanged.
- Report links and `git diff --check`: **PASS**.

### Exact task file scope (12 files)

```text
src/data/officialStandings/ironman/2024-men.json
src/data/officialStandings/ironman/2024-women.json
src/data/officialStandings/ironman/2025-men.json
src/data/officialStandings/ironman/2025-women.json
src/data/officialStandings/ironman/2026-men.json
src/data/officialStandings/ironman/2026-women.json
scripts/fixtures/official-standings/ironman-approved-2026-10-21.json
scripts/prepare-ironman-standings.mjs
scripts/test-ironman-standings.mjs
docs/ironman-standings-preparation-2026-10-21.md
docs/ironman-standings-identity-review-2026-10-21.csv
docs/PROJECT_BOARD.md
```

Identity closeout is complete locally. Runtime integration still requires separate approval.

## Closeout validation — 2026-10-22

- Exactly four row changes, limited to athleteId, identityStatus, identityFlags and identityApproval. All other row fields and dataset metadata match the pre-closeout snapshot exactly.
- Approved original CSV hash and all 60 raw records match the fixture. All six tables retain ten unique confirmed athlete IDs and stable cross-season mappings.
- Official standings tests: **20/20 PASS** (11 IRONMAN / 9 T100), including deterministic replay and scoped approval regression tests.
- PTO/ranking tests: **57/57 PASS**.
- Existing `npm run check:release`: **18/18 PASS**. `npm run check` is not defined; no scripts were added or renamed. Browser/live checks are outside this gate.
- Pre/post hashes: every other src file, including athlete registry, ATH enrichment, results, internal ranking implementation and T100 datasets, unchanged. 1167 profiles / 4592 results remain validated by registry tests and release gate.
- `git diff --check`: PASS.

Historical statuses remain HISTORICAL_FINAL_PENDING_CONFIRMATION; 2026 remains LIVE. UI/runtime integration remains disabled. Project Board and all earlier artifacts preserved unchanged in this closeout.

Task scope: four affected IRONMAN JSON files (2024-men, 2024-women, 2025-men, 2025-women), approved fixture, deterministic preparation script, registry tests, this report and identity review CSV — **9 files**. The two 2026 JSON files were regenerated identically. No commit/push/deployment.
