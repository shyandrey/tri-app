# ATH-UI-01 + DATA-ATH-02A — Profile polish and localization audit

Historical audit below is preserved. The finalization section supersedes its earlier authorization and localization status. Historical CSV inventories remain local audit artifacts; their paths below are evidence references, not runtime dependencies.

Date: 2026-10-30. Status: local QA/audit complete; awaiting owner review. No commit, push, deployment, mass translation or runtime localization change.

## Scope and baseline

Primary working tree: `home-redesign-experiments`, HEAD `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`, index empty. Preview fetched read-only at `68f32ee2871084b237d2b627ed43f4a0fae956b6`. A separate candidate at `/tmp/300w-athui01/candidate` uses this Preview baseline plus only the two existing profile UI modifications. All `src/data` bytes match between the primary tree and this Preview baseline. Unrelated CI/manual-mode changes, original artwork and other local artifacts were excluded.

## ATH-UI-01: review and retained implementation

Existing unfinished changes:

- `src/athlete-detail.css`: season row min-height 44→54 px, grid→flex, vertical centering, 12 px gap and symmetric 12 px padding; scoped result-row padding 12×8 px, 9 px radius, neutral raised-surface hover on fine hover devices only; 150 ms background transition, visible focus and reduced-motion override.
- `src/pages/AthleteDetailPage.tsx`: result articles gain link semantics, keyboard focus and Enter activation using the same existing race navigation callback.
- `scripts/test-athlete-results-polish-browser.mjs`: existing untracked diagnostic covering season geometry, hover/focus and result navigation. It is not included in the runtime or silently committed.

These changes implement the prior owner-approved results-polish decisions. No experimental runtime hunks were found in these two files. Header identity, photos, bio/achievements, result grouping/order, disclosure state, race links, Rankings and navigation architecture are untouched. The existing implementation was reproduced and validated in isolation; **no additional runtime correction was necessary**, and the primary profile edits remain byte-for-byte as they were at task start.

Live Preview comparison at 390×844, 440×956, 844×390 and 956×440 confirmed baseline 44 px/grid/8 px gap versus candidate 54 px/flex/12 px gap, without horizontal overflow. The intentional extra row padding can wrap long race titles earlier; no text, times or medals were changed. Representative portrait/landscape screenshots were visually inspected.

Evidence: `/tmp/300w-athui01/comparison/` (before/after, header, results and placeholder); `/tmp/300w-athui01/screenshots/` (collapsed/expanded/focus/hover). Browser tests are Chromium emulation, not physical iPhone/Safari certification. Dark-only policy remains; both OS preferences were tested, not a new light theme.

## DATA-ATH-02A: exact inventory

Reproduce into a **new** directory (existing directories are rejected to protect owner work):

```sh
node scripts/audit-athlete-display-names.mjs /tmp/new-athlete-display-inventory
```

This read-only audit does not call importers, transliterate, access external providers, or overwrite `.generated/athlete-names/review.csv`.

| Classification | Athletes |
| --- | ---: |
| Catalog / unique IDs | 1167 |
| Russian display present | 937 |
| English-only placeholder in display field (`name === nameEn`) | 230 |
| Empty or mixed-script display detected | 0 |
| Explicit `generated-reviewed` registry provenance | 647 |
| Legacy registry strings without per-row provenance | 95 |
| Embedded Russian names without per-row provenance | 195 |

**Presence is not independent linguistic verification.** 647 names carry explicit reviewed metadata. The remaining 290 Russian names are existing baseline names without equivalent row-level metadata; this audit does not certify all 937 spellings or assert that the 290 are unapproved. There was no new external source verification. The registry has 742 entries; generated-profile audit reports 737 because five overrides belong to curated athletes.

All 230 missing Russian display names occur in `resultAthletes.generated.ts`. They are legitimate catalog identities with intentional English fallback, not missing athletes or photo defects.

Exact deliverables:

- All 1167 athletes (`docs/audits/data-ath02-2026-10-30/athlete-name-inventory.csv`, historical local evidence): ID, original English, embedded name, current Russian/display, source/provenance class, 2026 and all-season Rankings references. Sorted with current 2026 Rankings first, then historical Rankings, then ID.
- All 230 missing/placeholder Russian names (`docs/audits/data-ath02-2026-10-30/missing-russian-names.csv`, historical local evidence).
- All 120 official Rankings rows (`docs/audits/data-ath02-2026-10-30/rankings-name-comparison.csv`, historical local evidence): source English, canonical English, profile display, current Rankings display and ID.
- Machine-readable summary (`docs/audits/data-ath02-2026-10-30/summary.json`, historical local evidence).

Official IRONMAN/T100 registries: 12 tables / 120 rows, 79 unique athletes; 39 unique athletes in the 2026 tables. All 120 IDs resolve to the catalog with matching gender. **0 missing Russian names among all 79 athletes.** All 120 current Rankings display strings differ from the Russian profile display because Rankings renders official source names directly.

Three official source/canonical English spelling differences remain intentionally preserved: ID 100 `Mathias Lyngsø Petersen` / `Mathias Petersen`; ID 26 `Rudy Von Berg` / `Rudy von Berg`; ID 130 `Marta Sanchez` / `Marta Sánchez`. These are not new identity corrections and do not authorize rewriting source evidence.

## Storage, fallback and exact UI consumers

| File / consumer | Current contract | Proposed action |
| --- | --- | --- |
| `src/data/athletes/{men,women,resultAthletes.generated,verifiedResultAthletes}.ts` | Stable ID, `nameEn`, embedded `name` | Preserve identities and original English; do not manually edit generated catalog |
| `src/data/athletes/athleteLocalization.json` | Exact English identity → Russian string or `{nameRu, provenance}` | Keep authoritative reviewed override registry; owner-reviewed batches only |
| `src/data/athletes/localization.ts`, `index.ts` | Override → embedded `name` → English fallback; enrichment applied at catalog boundary | Reuse this data flow, do not add a competing registry |
| `scripts/find-next-athletes.mjs` | Generator uses registry `nameRu ?? name`, not automatic transliteration | Do not full-regenerate to apply translations; known ID drift remains separate |
| `src/pages/AthletesPage.tsx` | Russian/current `a.name`, then original `nameEn`; initials from English | Adopt common resolver later; keep bilingual search/header |
| `src/pages/AthleteDetailPage.tsx` | `athlete.name` header and original `nameEn` subtitle/photo alt | Same resolver later; no name changes in this polish |
| `src/pages/OfficialRankingsPage.tsx` | Text and initials from `row.athleteName`; photo/link resolve by `athleteId` | First presentation-only migration: canonical display by confirmed ID, source fallback |
| `src/components/RaceResultsTable.tsx` | Both desktop/mobile use `athlete?.name ?? result.athleteName` | Replace duplicated fallback with resolver without changing IDs/results |
| `src/pages/RaceDetailPage.tsx` | Passes linked results and canonical catalog to results table | No independent naming logic to rewrite |
| `src/pages/CalendarPage.tsx`, `src/components/RaceCard.tsx` | Race names, no athlete-name rendering | No localization change required |
| `src/utils/athleteSearch.ts` | Searches `name` and `nameEn`, case/ё normalization and wrong-keyboard layout; preserves input order | Preserve bilingual matching and ordering |
| `src/sports/SportsArea.tsx`, `src/navigation/history.ts` | Profile navigation uses athlete ID; feedback combines display and English | Preserve route identity; optionally reuse resolver for feedback text |
| `src/data/officialStandings/index.ts` | CONFIRMED mapping projection; source name, rank, points retained | No changes to registry or evidence |

The same athlete already displays consistently between catalog/profile/linked Race Results; Rankings is the confirmed presentation divergence. Unlinked result rows intentionally fall back to source English. Search has no separate name store. Calendar does not contain an athlete-name list to translate.

## Proposed canonical resolver and minimal next implementation

Proposal only; not introduced into runtime in this task:

```ts
// Receives an already localized canonical catalog athlete, never a raw source row.
function resolveAthleteDisplayName(
  athlete: Pick<Athlete, 'name' | 'nameEn'> | undefined,
  sourceName = '',
): string {
  return athlete?.name?.trim() || athlete?.nameEn?.trim() || sourceName
}
```

Keep approval/provenance decisions at the existing catalog/localization boundary. The resolver must not infer approval from Cyrillic characters, transliterate, mutate data or fuzzy-match identities. Preserve embedded baseline names while their provenance is reviewed; do not silently downgrade them to English. Unknown/unmatched IDs use the unchanged source name, and cannot acquire fabricated profiles.

1. Owner review this UI candidate and inventory; retain DATA-01 owner CSV workflow and unfinished CSV edits.
2. Add/test a small presentation resolver, then change Rankings name text by existing confirmed athlete ID. Preserve official `athleteName`, positions, points, flags, links and swipe state. Verify long Russian names at 320 px and update relevant exact-row browser expectations deliberately.
3. Reuse resolver in both RaceResultsTable views, catalog/profile and optionally feedback, without altering search behavior or English subtitle.
4. Test approved override, embedded Russian, English fallback, unknown ID, source alias and bilingual search; compare ID/results/ranking invariants.
5. Current/historical Rankings need **no translation batch**. Review the 230 remaining English-only names in small owner-approved CSV batches; no automatic mass transliteration. Source verification follows the repository Data Source Policy where identity evidence is needed.

## Validation and limitations

- Isolated production build PASS; existing sports chunk warning ~1295.21 kB remains.
- Lint PASS; additional new audit script syntax/ESLint PASS.
- Release gate PASS; it explicitly excludes the known full-regeneration failure.
- Existing profile browser test: 8 viewport/preference combinations PASS.
- Extended isolated profile test: 14 combinations PASS (320×700, 390×844, 440×956, 667×375, 844×390, 956×440, 1440×900; both OS preferences). Tests check collapse/expand geometry, touch hover suppression, desktop hover, no hover shift, keyboard focus, Enter/click race links, Back, loaded photo and horizontal overflow.
- Supplemental last-result clearance and all five bottom-navigation destinations: 5 viewports PASS. First diagnostic attempt used `button:nth-child`, which incorrectly selected the decorative capsule; saved failure log, corrected only the temporary diagnostic to `nth-of-type`, then passed. No runtime fix or assertion weakening.
- Live Preview/local comparison: four viewport pairs PASS; photo ID 1 and intentional no-photo placeholder ID 51 checked; no runtime exceptions.
- Name/localization/search/current-athlete test invocation: **24 PASS / 1 FAIL**. Failure is `scripts/test-athlete-localization.mjs`: `Regeneration must preserve all non-display data`; full regeneration adds e.g. Emmanuel Lejeune and shifts generated IDs. This matches the already documented TECH-01 full-regeneration concern; runtime catalogs were not modified. Not fixed or suppressed. Other name/search/current-catalog checks passed.
- Official standings/internal ranking tests: **28/28 PASS**.
- `npm run audit:athletes`: **0 issues**; coverage INFO includes 230 English-only generated names, 946 missing photos, six code-like country labels and one missing country code. These are not silently reclassified or repaired.
- All source data bytes match the Preview baseline; profile source files remain identical to the original unfinished patch; no official evidence, ID, result, internal ranking, enrichment or social-link edits. `git diff --check` PASS.

Evidence/logs and temporary diagnostic scripts: `/tmp/300w-athui01/`. Full regression/lint/build ran on the isolated Preview-based candidate, not on unrelated dirty CI changes. No Safari/physical-device claim. Screenshots require owner visual review; no PR merge is authorized.


## ATH-UI-01 — Finalization on localized Preview baseline

Status: implementation verified locally; authorized PR → CI → Preview promotion in progress. Final owner visual QA follows publication.

Baseline: `c43182ca3927b4264f9fd560ca02c39776021242` (Batch 002, 1167/1167 Russian names). Remote development `3ce7c4764ae18429f9992c2d572bf28d51238beb` is an ancestor; isolated development copy starts from Preview so the ordinary development push preserves the completed localization. Primary working tree remains untouched except task documentation.

Exact scope:

- `src/athlete-detail.css`: reuse existing 54 px centered season headers, 12 px gap/symmetric padding; 9 px result corners, neutral fine-pointer hover, visible focus and reduced-motion support.
- `src/pages/AthleteDetailPage.tsx`: reuse only existing link role, tab stop and Enter handler for result rows. The current shared Russian-first resolver stays unchanged.
- `scripts/test-athlete-results-polish-browser.mjs`: retain existing assertions, add configurable artifact output and portrait/landscape geometry coverage.
- This report and `docs/PROJECT_BOARD.md`: current task status and DATA-ATH-02 closure.

No other runtime files, sports data, localization registry, photo mappings or artwork changed. No redesign or compatibility correction needed. Full regeneration remains prohibited under TECH-01. DATA-ATH-02 is CLOSED / OWNER APPROVED by the finalization instruction; historical audit evidence remains historical.

Local verification: 32/32 athlete display/name/profile tests; portable checks and production build/lint/release gate 18/18 PASS. Existing sports chunk warning remains. The first browser attempt used port 5398, already occupied by a different server, and failed the 12 px gap assertion; the server collision is recorded in `server.log` and `profile-browser.log`. The candidate is served separately on 5478; assertions were not weakened. Correct-candidate profile test: 14/14 viewport/preference combinations PASS (320×700, 390×844, 440×956, 667×375, 844×390, 956×440, 1440×900). Navigation suite PASS (10 scenarios); supplemental last-row clearance and all five destinations PASS on five viewports. Publication IDs will be recorded after deployment.

Evidence directory: `/tmp/300w-athui01-final/`. Owner visual QA should check centered year/chevron, collapsed/expanded spacing, neutral hover/focus, result navigation, photo/placeholder and last-row clearance on physical iPhone in portrait and landscape. Browser automation is not physical-device QA.


## DEVOPS-04 — Read-only recovery closeout

2026-10-31 Moscow: **ATH-UI-01 ready for Owner Visual QA.** Original deployment-run artifact 13011965445 was verified by ZIP/manifest SHA and complete inventory; the unchanged full live smoke passed exact HTML, SHA/version, API, routes, navigation and responsive artwork at 390×844/844×390, with no browser errors. Published SHA remains `653273420e2aaff3c49725500a935701d4dfd286`, version 0.0.0. Historical run failure is preserved. No new deployment, rollback or Production/D1 changes; Auto Deploy remains disabled pending readiness-fix review and explicit reactivation approval. [Recovery evidence and limitations](devops03b2-preview-implementation-plan.md#devops-04--ath-ui-01-smoke-recovery-and-bounded-readiness).
