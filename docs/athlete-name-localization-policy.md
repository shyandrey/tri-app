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
