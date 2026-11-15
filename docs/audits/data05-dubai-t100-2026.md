# DATA-05 — Dubai T100 2026 import proposal

## DATA-05C — publication candidate, 2026-11-15

Branch `data/dubai-t100-2026-results`, worktree `/private/tmp/300w-data05c-publication`, latest Preview base `9ff11ad8fff7a789379e356c873cf4e0bcb1f7e2`. Compared with DATA-05B base: upstream changed only Project Board and removed automatic push/PR workflow triggers. Retained current upstream Board and workflow; transferred DATA-05 source/tests byte-for-byte. No full catalog regeneration or rerun of already-qualified tests/build.

Targeted interactive Chrome/CDP smoke PASS at390×844 using the existing production build: Dubai detail opens; MEN21/19finishers/2DNF and WOMEN20/18finishers/2DNF; three Russian names/flags; clicked each row to correct profile20016/20017/20018, verified Dubai result and clicked it back to the race. No runtime exceptions. Initial temporary harness attempt failed on an overescaped numeric regex; corrected only the harness and completed the targeted smoke. Logs/screenshots outside Git: `/private/tmp/300w-data05-evidence/data05c-*`.

Exactly13 approved files. Existing46/46 test/build qualification reused because source/test bytes unchanged. `git diff --check` PASS. GitHub CI remains manual-only; none dispatched. Owner authorizes one commit/push/PR only; merge and deployment require separate authorization.

## DATA-05B — local integration, 2026-11-15

Status: **LOCALLY VERIFIED / GO for a separately authorized publication step**. No commit, push, PR or deployment. Worktree `/private/tmp/300w-data05-candidate`, branch `data/data05-dubai-2026`, base `87592c92b8eed878a58d21c1b5105a8d2e174b11`, version unchanged at 1.0.1.

Fresh official results parsed on 15 November are identical to the saved source (including splits, statuses, source athlete paths and SOF). Reused the existing 41-row proposal; no source rows recreated. MPRO21 =19 finishers +2DNF; WPRO20 =18 finishers +2DNF; no DNS/DSQ. Missing DNF splits remain absent.

| New ID | English / approved Russian | Country verified on exact PTO profile |
|---|---|---|
| 20016 | Brooke Gillies / Брук Гиллис | GB — https://stats.protriathletes.org/athlete/brooke-gillies |
| 20017 | Enzo Bourdon / Энцо Бурдон | FR — https://stats.protriathletes.org/athlete/enzo-bourdon |
| 20018 | Sara Sandrini / Сара Сандрини | IT — https://stats.protriathletes.org/athlete/sara-sandrini |

Official profiles identify the exact athletes and Great Britain, France and Italy respectively, matching the race source. URLs persisted in `ptoProfileMappings.json`. No inferred DOB, age, social accounts, photo or biography added; optional enrichment omitted. Approved Russian names persisted in the existing localization registry. Initials placeholders remain supported.

Used the established `node scripts/find-next-athletes.mjs --write --append`, after wiring Dubai results and approved names. It found exactly three missing identities and allocated max-existing-ID +1..3. No hand-editing generated profiles or full regeneration. Importer exited0 and appended exactly3; its unused Vite HMR listener logged sandbox EPERM on port24678. Subsequent independent integrity tests passed; no importer rerun required. Empty localization queue `[]` retained outside the candidate in `/private/tmp/300w-data05-evidence/data05b-localization-review.json`.

Runtime totals: **1170 athletes /4633 results**. All41 Dubai rows resolve to distinct athletes;38 previous mappings preserved. Existing race24 / `t100-dubai` / combined `t100-dubai-2026` and date unchanged. Results appended after Kona, allocating **4593–4633** through the existing global index. Historical4592 result objects and1167 athlete objects match their pre-change SHA256 hashes (fixture `dubai-baseline-2026.json`); all previous localizations/biographies remain intact. Source SOF applied only to Dubai: women92.11/men91.03. No race-status mutation needed. Ranking formula unchanged; new starts legitimately affect calculated rankings.

Validation: **46/46 PASS, exit0** (`test-dubai-2026-import.mjs`:8, existing importer:30, rankings:8). Tests cover exact source replay, all new links/IDs, historical object hashes, negative mutations, duplicate rejection, Russian names/countries/PTO URLs, and server-rendered Race Detail tables/profiles with flags and Dubai results. Previous importer fixture tests now explicitly project the byte-verified historical dataset; old hash assertions and negative contracts remain unchanged. **Build/typecheck PASS, exit0**; existing >500kB bundle warning remains. `git diff --check` PASS. No full browser gate or separate biography suite. Browser smoke not run: UI/navigation implementation unchanged; component rendering and linked-profile data tested, not a claim of interactive browser QA.

Exact candidate files (13):
- `docs/PROJECT_BOARD.md`
- `docs/audits/data05-dubai-t100-2026.md`
- `scripts/fixtures/result-imports/dubai-2026.html`
- `scripts/fixtures/result-imports/dubai-2026.json` (initial proposal evidence retained; its three unmatched records describe the historical dry-run)
- `scripts/fixtures/result-imports/dubai-baseline-2026.json`
- `scripts/test-dubai-2026-import.mjs`
- `scripts/test-race-result-import.mjs`
- `src/data/athletes/athleteLocalization.json`
- `src/data/athletes/ptoProfileMappings.json`
- `src/data/athletes/resultAthletes.generated.ts`
- `src/data/raceEditions.ts`
- `src/data/results/2026/t100/dubai.ts`
- `src/data/results/index.ts`

No unresolved identities or data conflicts. TECH-01 remains open: full regeneration prohibited. Build output/dependencies/logs are excluded. Original worktree untouched. Next step requires owner authorization for Git publication; deployment remains separate.

## Historical DATA-05 checkpoint — 2026-11-14

The following initial proposal findings are retained as history. They are superseded by the DATA-05B integration above. Initial status: PREPARED / IDENTITY REVIEW REQUIRED; not wired into runtime.

## Scope and source

Isolated candidate `/private/tmp/300w-data05-candidate`, branch `data/data05-dubai-2026`, base `87592c92b8eed878a58d21c1b5105a8d2e174b11`, version 1.0.1. Original working tree untouched. No commit, push, PR or deployment.

Official source: https://stats.protriathletes.org/race/dubai-t100/2026/results

Both professional tables contain terminal results, not placeholders. Snapshot and parsed source evidence are preserved in `scripts/fixtures/result-imports/dubai-2026.{html,json}`. Snapshot SHA256: `974dbfb9695d830b6c0b5404526234505f4f961b88e736a2afdcbd7e75cbe0e8`. The evidence JSON records retrieval time, raw cells, athlete source paths, nationality codes and full importer decisions.

| Field | Rows | Finishers | DNF | DNS | DSQ |
|---|---:|---:|---:|---:|---:|
| MPRO | 21 | 19 | 2 | 0 | 0 |
| WPRO (source panel FPRO) | 20 | 18 | 2 | 0 | 0 |

All finishers have overall time and all five splits/transitions. Source-missing DNF splits remain missing: Lisa-Maria Dornauer (run), Brooke Gillies (bike/T2/run), Jannik Schaufler (run), Jeremy Maclean (bike/T2/run). PTO points shown as `-` remain absent. Source T100 points are preserved. No unofficial results/times calculated.

## Mapping and identity review

Reuse legacy race 24 / canonical race `t100-dubai` and the existing combined edition `t100-dubai-2026`, dated 2026-11-14, `WPRO+MPRO`. The model has one combined edition, not two separate gender edition IDs.

38 source athletes match canonical English names with stable catalog IDs; no gender or nationality conflicts. All 38 IDs and source athlete URLs are listed in evidence JSON `matches`. Three names do not resolve to catalog records and surname searches found no candidates:

| Athlete | Gender | Source country | Source profile |
|---|---|---|---|
| Sara Sandrini | W | IT | https://stats.protriathletes.org/athlete/sara-sandrini |
| Brooke Gillies | W | GB | https://stats.protriathletes.org/athlete/brooke-gillies |
| Enzo Bourdon | M | FR | https://stats.protriathletes.org/athlete/enzo-bourdon |

These are unresolved catalog identities, not verified newly created profiles. No IDs assigned or localization invented. The importer records localization review separately; missing Russian names alone are not a rendering blocker.

## Prepared files and integration boundary

- `src/data/results/2026/t100/dubai.ts`: all 41 rows emitted by the existing guarded importer, local proposal IDs 1–41; deliberately not imported by the results index.
- `scripts/fixtures/result-imports/dubai-2026.html`: exact source snapshot.
- `scripts/fixtures/result-imports/dubai-2026.json`: parsed evidence and matching/anomaly/SOF proposals.
- `scripts/test-dubai-2026-import.mjs`: exact replay, terminal counts, source preservation, duplicate/ambiguity rejection, stable data boundary.
- This report and `docs/PROJECT_BOARD.md`: review status.

No importer redesign, full catalog regeneration or runtime edits. All 1167 athlete IDs and all 4592 existing result IDs/records remain unchanged: tracked `src` files are byte-identical to the base, and the only new source file is the unconnected proposal. Rankings implementation and biographies are untouched.

After identity review, append Dubai after the existing Kona results in `src/data/results/index.ts`, not inside the earlier season array: inserting there would renumber historical IDs. Proposed new global IDs would be 4593–4633 if the baseline remains unchanged. Apply verified SOF men 91.03 / women 92.11 only to the Dubai edition after review; currently it remains evidence only. No explicit race-status field needs changing: Race Detail derives result availability from rows, while date classifications retain Moscow calendar policy. Adding results legitimately affects ranking outputs; the formula must remain unchanged.

## Validation actually run

Node 24.19.0, existing locked dependencies reused via local symlink.

- Guarded importer dry-run and proposal write: exit 0, 41 source rows.
- `node --test scripts/test-dubai-2026-import.mjs scripts/test-race-result-import.mjs scripts/test-ranking.mjs`: 34 assertions PASS (4 Dubai, 30 importer); rankings module initially failed to load missing `.generated/build-metadata.ts` before assertions. Initial process exit 1 retained, not suppressed.
- `npm run build`: exit 0, normal prebuild metadata generation; existing >500 kB chunk warning, largest OfficialRankingsPage chunk about 910.71 kB raw / 160.03 kB gzip.
- `node --test scripts/test-ranking.mjs` after build: 8/8 PASS, exit 0.
- `git diff --check`: PASS.

No full release/browser gate or separate biography tests run. Existing importer suite includes historical profile integrity guards. Test logs: `/private/tmp/300w-data05-evidence/` (`targeted-tests.log`, `ranking-after-build.log`, `build.log`, `dry-run.log`, `import-write.log`). Build success validates the proposal compiles; it does not mean Dubai results are visible in runtime.

## Publication decision

NO-GO pending review of the three unmatched identities and completion of explicit runtime wiring/SOF with targeted validation. Complete official source is available; no rows were discarded to hide the identity gap. Next action: verify those source profiles and decide approved stable catalog integration, or explicitly approve unlinked source rows. Preserve original results and all missing DNF values; no catalog regeneration.
