# T100 official standings: local registry application — 21.10.2026

Owner approved local application of the six datasets from `/tmp/300w-t100-closeout-2026-10-21/`. No UI or deployment approval is implied. RANK-01 remains IN PROGRESS.

## Applied data

[Registry](../src/data/officialStandings/t100/) contains 2024/2025/2026 Men and Women: 60 rows, 60 confirmed identity links. Coverage is explicitly `TOP_10_ONLY`, not a full series standings archive. Rank, row order, ties, points, names, raw nationality codes and IDs exactly match the approved closeout. ISO alpha-2 nationality is stored separately; no global sports-code alias rules were introduced.

2024/2025 remain `HISTORICAL_FINAL_PENDING_CONFIRMATION`; 2026 is `LIVE`. `LIVE` describes the season category, not real-time refresh. Source capture time is unknown (`sourceObservedAt: null`); verification date must not be presented as the source's publication/update time.

Sam Long (2024 Men #6) is ID 22; Samuel Dickinson (2025 Men #8) is ID 9 with 106 points; Gregory Barnaby (2025 Men #10) is ID 16 with 90 points. Gregor Payet (2026 Men #6) remains ID 19. All approved corrections and their provenance are preserved.

## Source and replay

The compact [approved snapshot](../scripts/fixtures/official-standings/t100-approved-2026-10-21.json) pins all 60 values, table metadata, correction provenance and SHA-256 of each original closeout candidate. It is the reviewed input for deterministic local replay, not an independently scraped source. The generated registry discards stale candidate workflow flags; it retains current screenshot verification and local-only owner application approval.

Each registry row retains source URL, verification date, screenshot path/hash and visual verification method. Owner-approved corrections additionally retain their original correction metadata. Screenshot paths are audit references, never runtime fetch dependencies. Original screenshots remain outside Git in `/Users/andrey.shubin/Projects/tri-app-archives/t100-standings-2024-2026/`. No raw images or HTML are committed/copied into the repository.

The seven-image archive and prior `/tmp` audit trail remain unchanged. The new unoccluded `t100-2025-men-final.png` has SHA-256 `e113e91f896b2ed457e7dca4bd15b843450c87fa464e9e70ac5fbd04d02d87a9`. Full historical evidence and intermediate corrections remain in previous artifacts; this fixture preserves the final approved values and source hashes. Known limitation: the explicit gender label was not visible in the old 2024 Men screenshot; the owner file/category and roster were used. This limitation remains recorded.

Replay (prints JSON; does not write files):

```sh
node scripts/prepare-t100-standings.mjs
```

Explicit local regeneration from the pinned approved snapshot:

```sh
node scripts/prepare-t100-standings.mjs --out-dir src/data/officialStandings/t100
```

No network, scraping, D1, athlete registry writes or dependency on `/tmp` is required by replay/tests. Future updates require new verified evidence, owner-reviewed snapshot changes and tests; replay is not a live importer.

## Validation

Run the new [registry tests](../scripts/test-t100-standings.mjs):

```sh
node --test scripts/test-t100-standings.mjs
node --test scripts/test-pto-profiles.mjs scripts/test-pto-profile-mapping.mjs scripts/test-pto-profile-registry.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs
npm run check:release
git diff --check
```

Tests check all approved fields, source provenance, 6/60 coverage, ranks/order/ties, catalog/PTO identity, countries/genders, duplicate IDs, cross-season consistency, exact deterministic file replay, preserved historical pending status and rejection of malformed inputs. Existing PTO/ranking suites cover ATH enrichment, social links, results and internal ranking invariants. The new tests run separately from the existing release gate; the gate is not silently expanded.

## Proposed UI integration — not implemented

Add a distinct official T100 standings section with season and gender selection after owner approval. Read only these six registry files; show official ranks/points unchanged and link confirmed IDs to existing profiles. Keep internal 300W ranking separate. Display verification date accurately, keep historical finality pending visible, and do not claim live refresh or full-standings coverage. Do not change navigation/layout until separately approved. No file currently imports the registry into the app or Worker.

## Scope and remaining work

New files: six registry JSON, one approved snapshot, replay script, registry test and this report. Existing Project Board receives only the RANK-01 status update; previous ATH closeout changes are preserved. No athlete/result/ranking/enrichment/application/News/Feedback/configuration/version changes. No deployment, D1 writes, commit or push.

Owner review is next. IRONMAN integration, full official standings beyond top-10, historical FINAL confirmation, future snapshot cadence and UI remain separate work.

## Executed results

- Registry tests: 9/9 PASS.
- Existing PTO/ranking tests: 57/57 PASS (44 PTO + 13 ranking).
- `npm run check:release`: 18/18 PASS, including build, ESLint and invariant audits. The initial run detected a syntax error in the new test; it was fixed before the successful repeat. No source values were changed to satisfy tests.
- Direct comparison of all 60 registry rows against original closeout JSON: PASS; screenshot hashes and prior evidence unchanged.
- `git diff --check`: PASS. No application import of the new registry exists. Browser/live infrastructure checks were not run because UI/infrastructure were not changed.

Exact task scope (11 files):

- `src/data/officialStandings/t100/2024-men.json`
- `src/data/officialStandings/t100/2024-women.json`
- `src/data/officialStandings/t100/2025-men.json`
- `src/data/officialStandings/t100/2025-women.json`
- `src/data/officialStandings/t100/2026-men.json`
- `src/data/officialStandings/t100/2026-women.json`
- `scripts/fixtures/official-standings/t100-approved-2026-10-21.json`
- `scripts/prepare-t100-standings.mjs`
- `scripts/test-t100-standings.mjs`
- `docs/t100-registry-application-2026-10-21.md`
- `docs/PROJECT_BOARD.md` (RANK-01 lines only; earlier ATH changes preserved).

The four existing untracked artifacts remain untouched. Nothing staged or committed.
