# TECH-01 — RaceDetailPage React Hooks Warning

**Current approval — GIT-01B instruction (no separate approval date supplied):** TECH-01-HOOKS correction is OWNER APPROVED by the GIT-01B owner instruction. Earlier awaiting-review checkpoints below are historical; the unrelated stable-ID TECH-01 remains open.

Date: 2026-10-25. Status: **LOCAL COMPLETE / AWAITING OWNER REVIEW**. Target: v1.0.0; application version remains 0.0.0.

The board uses **TECH-01-HOOKS** to distinguish this owner task from the existing **TECH-01** stable athlete-ID regeneration risk, which remains open. No commit, push, deployment, infrastructure or dependency change.

## Original finding

Command: `./node_modules/.bin/eslint src/pages/RaceDetailPage.tsx`.
Result: exit 0, 0 errors, 1 warning:

```text
106:9  warning  The 'activeYearEditionIds' object construction makes the dependencies of useMemo Hook (at line 110) change on every render. Move it inside the useMemo callback. Alternatively, wrap the initialization of 'activeYearEditionIds' in its own useMemo() Hook  react-hooks/exhaustive-deps
```

`new Set(activeYearEditions.map(...))` created a fresh reference on every render. Because that Set was a dependency of `rawResults`, the memo recomputed on every render. This is an unstable dependency reference, not a missing dependency or a demonstrated user-facing result-selection defect.

## Minimal correction

Changed only [RaceDetailPage.tsx](../src/pages/RaceDetailPage.tsx) in application code:

1. Memoize `activeYearEditions` from `editionsByYear`, `currentYear`, and `activeRace`. This preserves the existing lookup and `[activeRace]` fallback while stabilizing the fallback array as well.
2. Construct the edition-ID Set inside the `rawResults` memo; depend on `allResults` and `activeYearEditions`.

The same edition IDs feed the same filter predicate, preserving input result order. The existing sibling-edition grouping, year selection, championship gender behavior, results gender fallback, sorting, URL handling and navigation remain unchanged. No state, effect, dependency package or suppression was added.

`editionsByYear` remains derived from memoized sibling editions; the year and active race are explicit dependencies, so changing edition/year or replacing source objects still invalidates the memo correctly. No measured runtime speedup is claimed.

## Validation

| Check | Actual result |
| --- | --- |
| Component ESLint before | 0 errors, 1 warning above |
| Component ESLint after | PASS, 0 errors/warnings |
| `npm run lint` | PASS, 0 errors/warnings |
| `node --test scripts/test-calendar.mjs scripts/test-navigation.mjs scripts/test-race-result-import.mjs` | 30/30 PASS |
| `scripts/test-calendar-browser.mjs` | PASS at 320×740, 390×844, 844×390, 1440×900 |
| `scripts/test-code-splitting-browser.mjs` | PASS at widths 390, 440, 844, 1440; all scenarios executed |
| `scripts/test-navigation-browser.mjs` | PASS, A–H plus stale route fallback and result sorting/scroll restoration |
| Targeted before/after Race Detail comparison | PASS, 27 year/gender states with identical rendered metadata/results text |
| `npm run build` | PASS; existing sports chunk size warning retained |
| `npm run check:release` | 18/18 PASS; known data issues 0 |
| `git diff --check` | PASS |

Browser suites used the local production build on port 5424 and a dedicated Chromium browser on CDP port 9269, with a fresh tab per suite. Temporary copies of the three existing browser scripts changed only artifact output paths to preserve older evidence; assertions were unchanged. No repository test changes were necessary.

Coverage includes direct race opening, Calendar and Home entry, result-to-athlete navigation, nested and browser Back/Forward, refresh, unknown race fallback to Calendar, sorting and scroll restoration, delayed sports loading, import failure/retry, Calendar search/filters/archives and empty states.

The additional comparison exercised Texas, Oceanside and Kona 2026 entry routes, every available year selector and available gender tabs. It compared the baseline production build at port 5420 against the corrected build at port 5424. The baseline RaceDetailPage source was verified byte-identical to the saved pre-task component. All 27 rendered states matched. This comparison supplements the code diff and existing tests; it is not a physical-device or Safari test.

## Data integrity and preserved work

Pre-task SHA-256 manifest compared existing files under `src`, `public`, `scripts`, `shared`, `worker` and `docs`. Before documentation edits, the only changed file was `src/pages/RaceDetailPage.tsx`. Thus race edition IDs/dates/results, athlete registry and mappings, internal ranking, official standings, enrichment, artwork, worker and existing test files are byte-identical to the starting local state. Release-gate data and ranking checks also passed.

Task scope is exactly three files: the component, this report and [Project Board](PROJECT_BOARD.md). Existing dirty/untracked work is preserved. The old TECH-01 data-integrity risk remains open. No evidence archives were modified.

## Evidence and limitations

Local diagnostic directory: `/tmp/300w-tech01/` (temporary, not committed):

- `RaceDetailPage-before.tsx`, `before.json`: component baseline and file hash manifest.
- `lint-before.log`, `lint-component.log`, `lint-full.log`, `unit.log`.
- `calendar-browser.log`, `code-splitting-browser.log`, `navigation-browser.log` and screenshots/results from those suites.
- `race-compare.mjs`, `race-compare.log`, `race-before-after.json`: 27-state comparison.
- `build.log`, `release.log`.

Build output: sports JavaScript 1,295.21 kB minified / 266.29 kB gzip; entry JavaScript 277.38 kB / 84.11 kB gzip. Vite still warns about chunks exceeding 500 kB. That existing warning is covered by the separate conditional [PERF-01 decision](perf01-sports-chunk-audit.md), not suppressed or addressed here.

The fast release gate explicitly excludes historical localization-regeneration, photo snapshot/staging suites and live infrastructure verification. Their pre-existing limitations remain; no claim of their execution is made. Physical-device/Safari/Telegram QA was not performed in this task. Owner review of this local correction is pending.
