# Athlete Name Localization Policy

Owner-approved DATA-ATH-02C policy; DATA-ATH-02D registry-only integration authorized 2026-10-30.

## Display and identity contract

Use the approved canonical Russian `name` throughout the Russian UI. Preserve original Latin `nameEn` and stable athlete IDs. `athleteDisplayName` resolves localized `name`, then `nameEn`, then an unresolved source name. Missing localization never blocks rendering, results, standings, profile creation or navigation. No automatic transliteration.

Consumers: Rankings, athlete search/list, Athlete Profile, Race Results desktop/mobile and athlete feedback context. Home and Calendar display race/event names, not individual athlete rows. Search retains Russian/Latin names and wrong-keyboard-layout support. Official source names and standings evidence stay unchanged.

New athletes with no approved Russian name require editorial review; English fallback remains valid while review is pending. Future imports must preserve Latin identity and report missing localization. Editorial batches require owner approval before integration.

## Safe import boundary

Use the existing `import-athlete-names.mjs` registry-only importer with a fresh full-catalog snapshot. Merge reviewed subset values into that snapshot by exact ID plus Latin name. Reject unknown/duplicate IDs, changed Latin names, stale snapshots and overwrites of already approved Russian names for these batches. Preserve registry metadata.

**Full catalog regeneration is prohibited until TECH-01 is resolved.** Known example: Emmett Gross `10140 → 10141`. This is an existing separate full-regeneration defect, explicitly accepted by the owner as non-blocking for registry-only localization imports. Do not execute full regeneration, weaken its tests or replace the generated catalog.

## Batch 001 — 115 approved names

Source: `300W_DATA_ATH_02B_batch_001_approved.csv`, owner-approved; byte-identical source preserved in [fixture](../scripts/fixtures/approved-athlete-names/batch-001.csv).
SHA-256: `32aa4a10d839a1b53537191d572eaedbba340976ef6ea3b2bbe400d74a5e4a64`.

Only 115 previously missing Russian names are added. Target coverage: 1052/1167; 115 remain for separately promoted Batch 002. All existing 937 Russian display names are preserved. Batch 001 also integrates the previously prepared shared display resolver; no Athlete Profile layout/polish or importer/generator changes are included.

Validation and Preview publication results are recorded below after execution. Batch 002 must not be imported until Batch 001 CI, deployment and smoke succeed. Physical owner review remains separate from browser automation.

## Batch 001 validation outcome

Registry-only import: 115 ADDED, zero existing names changed; actual coverage 1052/1167. Complete before/after non-display profile, result, standings and ranking snapshots match. Portable photos/PTO/standings/localization checks PASS; build/lint PASS. Release gate 17/18 PASS, Kona historical replay FAIL at `scripts/test-race-result-import.mjs:266`: full catalog hash includes mutable display names. Restoring only the 115 prior display strings in memory exactly matches the expected historical hash. No identity/result drift. Stop before commit/PR; Batch 002 not started. No deployments. See `/tmp/300w-data-ath02d/kona-hash-diagnosis.json` and `batch001-portable/`.

Final local browser result: Official Rankings **14/14 viewport/theme scenarios PASS**, all 12 season/series/gender tables with exact names/values/links, wheel/touch/keyboard/history/layout checks, Home/bottom navigation, zero runtime exceptions. Evidence: `/tmp/300w-data-ath02d/batch001-browser.log` and `batch001-browser/`. `git diff --check` passed in both the primary tree and isolated candidate. This does not override the failed Kona source-replay release check or authorize publication.

## DATA-ATH-02D.1 — Approved test-contract correction

Owner authorized a test-only correction to the Kona replay guard. The historical `athletesSha256` is unchanged. The byte-pinned Batch 001 CSV supplies exactly 115 allowed display-name changes; each current ID, Latin name and Russian spelling must match before only its `name` is projected back to the historical Latin fallback. All other profile fields and unapproved display names remain in the full-profile hash. Historical result records and all result-to-athlete mappings are checked independently.

Ten negative fixtures reject changes to athlete ID, Latin name, country, biography, photo, unapproved Russian name, approved CSV spelling, historical/new Kona result mappings and result time. No fixture/hash replacement, identity-field exclusions or full regeneration. Batch 002 requires its own reviewed extension and is not included in this release.

Local verification: targeted tests 56/56 PASS; Portable CI PASS; release gate 18/18 PASS including build/lint/audits/source replay. Baseline/candidate snapshots of all non-display profile data, 4592 results, standings and ranking match. Rankings browser results and remote promotion are recorded on completion. The earlier blocker section is retained as history, superseded by this correction.

DATA-ATH-02D.1 final local check: Official Rankings browser 14/14 viewport/theme scenarios PASS, all 12 tables and navigation, zero runtime exceptions; `git diff --check` PASS. Remote PR/CI/deployment pending at this commit.

## Batch 002 — Final approved registry import

Owner clarification: **Kacper Stepniak (ID 71) stays «Каспер Степаньяк»**. Preserve the existing registry entry; do not substitute «Каспер Стемпняк». The prior task assertion was incorrect, not a data-integrity defect. Menno Koolhaas (ID 10) stays «Менно Куулхас». Neither belongs to the 230 newly localized athletes.

Baseline: Batch 001 PR #6, deployed Preview SHA `c5b9bb8766572374964e313e0150836ae1853a0f`, coverage 1052/1167, successful CI and Auto Deploy. Source Batch 002 CSV remains byte-identical to owner input, SHA-256 `66a87f21e92984e9037448052257ec881bd7d68b692b148407d6a83e1ddb72a6`; preserved as [approved fixture](../scripts/fixtures/approved-athlete-names/batch-002.csv).

The existing registry-only importer added exactly 115 missing Russian names, with zero overwrites. Final candidate coverage is **1167/1167**, including all 230 editorially approved names across both batches. All existing registry entries and metadata were retained. Tests explicitly preserve Menno/Kacper and the corrections Nick Thijs 10434 «Ний Тийс», Read Ziegler 10486 «Рид Циглер», Alice Fritzsche 10647 «Элис Фритцше».

The Kona historical hash is unchanged. The existing approved-display projection is extended to the second exact, byte-pinned 115-row CSV, with duplicate-ID rejection across both batches. All other profile fields, all unapproved display names and result integrity remain protected; negative tests are retained. The separate fixture test verifies both runtime display and registry spelling against every approved CSV row. English fallback remains tested for future missing localization.

Before/after snapshots confirm unchanged 1167 IDs, Latin names, countries, photos, biographies, achievements, all 4592 results/linkages, official standings and ranking scores/order. Full catalog regeneration remains prohibited until TECH-01 is resolved (Emmett Gross `10140 → 10141`). No runtime component, importer architecture, artwork, official results or Athlete Profile polish changes.

Targeted tests: 56/56 PASS. Release/CI/deployment outcomes are recorded on completion; no duplicate local full browser run is required because mandatory GitHub CI executes all seven suites. Physical-device review is not implied.

Batch 002 local verification completed: targeted tests 56/56, Portable CI and release gate 18/18 (build/lint included) PASS; diff checks PASS. All previous registry entries compare exactly with the deployed baseline. GitHub PR/CI/Preview verification pending at this commit.
