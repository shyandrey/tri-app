# PERF-01B.2 — Route loading and swipe investigation

**PERF-01C owner decision — 2026-10-25: VARIANTS A/B REJECTED BY OWNER FOR v1.0.0.** Retain the existing baseline loading architecture. No experimental code is approved for reuse or integration. The sports chunk warning is an accepted pre-release exception conditional on final physical-device QA, which remains pending. Future optimization is tracked separately as PERF-02 in [Project Board](PROJECT_BOARD.md).

The dated audit/experiment below is preserved as historical evidence. Its earlier pending-review/open/recommendation language is superseded by this owner decision, not erased.


2026-10-25 · Local isolated experiment · Awaiting owner decision. PERF-01 remains open.

## Isolation

Original application is unchanged. Existing PERF-01B baseline and prototype remain in `/tmp/300w-perf01b/`. New independent copies `/tmp/300w-perf01b2/a/` and `/tmp/300w-perf01b2/b/` inherit the entire PERF-01B prototype, including the original modified/untracked Rankings/NAV implementation, not just Git HEAD. Installed dependencies are reused; nothing installed. Version 0.0.0, branch home-redesign-experiments, base HEAD c8f52e02a75e0b413dddbfee77f477232c5301d3.

Logs, scripts and JSON measurements reside in `/tmp/300w-perf01b2/`. These are temporary local artifacts, not a durable archive. No commit, merge, deployment, D1, Cloudflare, authoritative data or formula changes.

## Verified swipe cause

The original assertion at `scripts/test-official-rankings-browser.mjs:118` waits 750ms after a single large touchMove then expects selected series to change. Reproduced the complete 1440×900 dark scenario against **both baseline and PERF-01B**: both failed. Diagnostic hit testing confirms the touch starts on the showcase artwork; after 750ms, scrollLeft is 1440 but series is still IRONMAN_PRO_SERIES.

Native Scroll Snap is still completing at around 700ms; `RankingsSwipeTrack.onScroll` restarts a 120ms settle timer on each scroll event. Three controlled repetitions per variant show selected series switching by the 800ms sample and remaining T100 through 2500ms. This is a **premature fixed-delay assertion**, not a code-splitting functional regression. Reduced-motion media does not eliminate native touch inertia. The same broad scenario with bounded state-based waiting passes baseline and prototype, including all 12 tables, profile/history/Feedback and Home navigation.

No gesture implementation change. Temporary regression harness retains the original assertion, adds up to 2s bounded polling after the existing 750ms, and still fails if state never synchronizes. This is supported by event evidence, not a blanket timeout to conceal a bug. `timing.json` contains scroll/pointer/scrollend events and 100ms state samples. `swipe-baseline.log`, `swipe-prototype.log` preserve original failures; `settled-baseline.log` and `settled-prototype.log` preserve controlled PASS.

## Experiment A: deferred preload

Only additional source change relative to PERF-01B: `src/sports/RankingsRoute.tsx`. When the Rankings module is ready, a passive effect schedules the existing cached `sportsArea.load()` after 500ms. Cleanup cancels scheduled work when leaving. It does not await preload to render Rankings. Errors are caught to avoid unhandled rejections; the normal sports error/retry shell remains authoritative.

The resource deduplicates requests and reuses the module. Once an ES module import has started it cannot be aborted: leaving after 500ms can still incur network and evaluation work. No claim of guaranteed preload completion before a click. A 500ms delay is an experimental choice, not a recommended universal threshold.

## Experiment B: Athlete boundary

Additional files relative to PERF-01B:

- `src/App.tsx`: route Athlete separately.
- `src/sports/loader.ts`: cached Athlete resource.
- `src/sports/AthleteRoute.tsx`: dedicated pending/error/invalid-ID handling, using existing SportsRoute semantics.
- `src/sports/AthleteArea.tsx`: unchanged AthleteDetailPage and callbacks, direct full athlete data plus results.
- `src/sports/athlete-entry.ts`: module entry with the identity predicate, following existing sports-entry separation.
- `src/sports/results.ts`: existing full result import and linkage separated from ranking calculation.
- `src/sports/data.ts`: reuse linked results; keep existing calculation and dataset clock unchanged.
- `src/sports/SportsArea.tsx`: remove individual-profile rendering from sports entry.

No partial profile or false empty-results state. Athlete still waits for full linked results because the current page uses those results to initialize expanded seasons. Deferring results into an initially empty page would change behavior and is not implemented. B avoids catalog/Race UI and internal ranking evaluation for an individual profile, but cannot avoid the large results payload. It is separate from A, not an A+B combination. No runtime projection, API or evidence stripping.

## Measurement protocol

Four variants: original baseline 5420, PERF-01B 5421, A 5422, B 5423. Existing baseline servers were already running; attempts to start duplicate servers returned port-in-use and made no changes. Dedicated local Chrome CDP 9269. Each copy uses a production build served by Vite preview.

Three repetitions per variant, Chrome 155.0.8059.85, 390×844/DPR3, CPU4×, network 150ms latency/200000B/s down/93750B/s up, matching conditions across variants. Reduced-motion remains enabled for all variants following controlled swipe setup. Each journey clears HTTP cache and enters a fresh document. Artwork selection fixed using Math.random=0.

Sequence: cold Home → Rankings → click actual first displayed athlete link (Gustav Iden 25) → Calendar → Race Results. Separate immediate and 5s-delay journeys, then independent cold direct Athlete 25. Immediate clicks occur as soon as the DOM readiness probe completes, with no 400ms post-readiness pause used in PERF-01B. Thus these measurements must be compared against the freshly rerun baseline, not directly subtracted from old 44/4018ms values.

Readiness is DOM availability, not LCP/image decoding. ScriptDuration is a CDP script-work proxy, not isolated parse time; task/long-task metrics are measured too. Long-task excess is not Lighthouse TBT. JS network totals use unique CDP request IDs, including preload requests started during the delayed interval; they are not the sum of per-route files, which could omit an in-flight preload. Wire bytes include headers. Compression sizes are offline gzip/Brotli, not wire transfer. No physical iPhone/Safari performance claim.

## Results and validation

Measurements are reported below; final regression outcomes are recorded separately.

Related: [PERF-01B](perf01b-rankings-code-splitting-prototype.md), [PERF-01A](perf01-sports-chunk-audit.md), [Project Board](PROJECT_BOARD.md).

## Runtime comparison

Final build readiness ms: median [min–max], n=3 in every cell. Final B was remeasured after the lint correction; pre-fix B data/logs remain under `runtime-5423-pre-lint.*`.

| Scenario | Baseline | PERF-01B | A | B |
|---|---:|---:|---:|---:|
| Home immediate-home | 907 [905–1034] | 907 [903–913] | 905 [904–906] | 909 [900–910] |
| Rankings immediate-rankings | 3596 [3584–3596] | 1852 [1848–1856] | 1856 [1856–1858] | 1854 [1847–1861] |
| Athlete immediate-athlete | 41 [41–46] | 4570 [4569–4570] | 4565 [4564–4566] | 4496 [4495–4504] |
| Athlete delayed-athlete | 44 [44–55] | 1107 [1105–1108] | 49 [41–91] | 1056 [1055–1057] |
| Athlete direct-athlete | 2532 [2531–2543] | 2465 [2461–2467] | 2469 [2465–2472] | 2420 [2419–2423] |
| Calendar immediate-calendar | 20 [20–26] | 23 [21–26] | 22 [21–25] | 22 [22–23] |
| Race immediate-race | 46 [45–46] | 45 [43–45] | 44 [44–45] | 384 [380–384] |
| Home delayed-home | 909 [899–911] | 901 [894–906] | 903 [899–907] | 906 [904–907] |
| Rankings delayed-rankings | 3593 [3591–3594] | 1855 [1848–1859] | 1850 [1845–1877] | 1859 [1856–1859] |
| Calendar delayed-calendar | 24 [23–25] | 22 [22–23] | 23 [22–26] | 21 [20–21] |
| Race delayed-race | 45 [44–45] | 43 [42–44] | 47 [44–52] | 318 [316–324] |

| JS wire bytes (median) | Baseline | PERF-01B | A | B |
|---|---:|---:|---:|---:|
| Home immediate-home | 83751 | 83874 | 83917 | 83992 |
| Rankings immediate-rankings | 263800 | 100124 | 100124 | 100171 |
| Athlete immediate-athlete | 0 | 164719 | 164719 | 158774 |
| Athlete direct-athlete | 347551 | 338025 | 338068 | 332245 |
| TOTAL immediate | 347551 | 348717 | 348760 | 350183 |
| TOTAL delayed | 347551 | 348717 | 348760 | 350183 |

No duplicate JS URLs within any measured journey. Preload bytes are included in A total even if completed before Athlete click. The five-second delay is excluded from route readiness. No full-journey CPU total is inferred from route deltas: preload evaluation during waiting is outside those deltas.

| ScriptDuration ms, median [min–max] | Baseline | PERF-01B | A | B |
|---|---:|---:|---:|---:|
| Home immediate-home | 66.2 [65.0–112.1] | 65.6 [64.7–66.5] | 65.1 [64.2–65.8] | 64.9 [64.1–65.3] |
| Rankings immediate-rankings | 82.2 [80.2–95.4] | 32.8 [32.4–42.3] | 34.4 [33.2–37.0] | 33.1 [32.6–33.5] |
| Athlete immediate-athlete | 14.9 [14.1–14.9] | 63.7 [63.3–65.6] | 64.5 [64.5–65.5] | 39.0 [39.0–39.2] |
| Athlete delayed-athlete | 15.3 [13.7–16.2] | 62.4 [61.1–63.7] | 24.5 [13.4–74.0] | 38.5 [37.6–39.5] |
| Athlete direct-athlete | 126.6 [126.3–127.6] | 127.8 [122.7–128.9] | 129.3 [128.8–129.3] | 101.9 [101.1–102.8] |
| Race immediate-race | 19.8 [19.6–22.4] | 19.6 [18.7–20.7] | 19.6 [18.1–19.7] | 45.8 [43.7–46.5] |

| Long-task excess ms, median [min–max] | Baseline | PERF-01B | A | B |
|---|---:|---:|---:|---:|
| Home immediate-home | 28 [24–105] | 26 [24–35] | 26 [24–26] | 26 [23–29] |
| Rankings immediate-rankings | 7 [3–9] | 0 [0–0] | 0 [0–0] | 0 [0–0] |
| Athlete immediate-athlete | 0 [0–0] | 0 [0–0] | 0 [0–0] | 0 [0–0] |
| Athlete direct-athlete | 3 [3–4] | 3 [1–4] | 4 [4–5] | 0 [0–0] |

Initial baseline Home outlier is retained, not discarded. Full TaskDuration, heap and variability are in `summary.json`.

## Build comparison

Offline bytes, gzip/Brotli measured after build; not wire transfer.

| Variant / JS chunk | Raw | gzip | Brotli |
|---|---:|---:|---:|
| A / athletes-DTHYTYrm.js | 577497 | 88996 | 62683 |
| A / index-D06_zCGU.js | 278822 | 83487 | 71094 |
| A / rankings-entry-wBKDg66O.js | 94499 | 10320 | 8136 |
| A / sports-entry-BJvW89s6.js | 623241 | 164223 | 114683 |
| B / athlete-entry-BG9OvIBh.js | 9377 | 3314 | 2878 |
| B / athletes-mC-pxRMq.js | 577497 | 89044 | 62757 |
| B / index-DOCbrSpy.js | 280444 | 83562 | 71238 |
| B / rankings-entry-llzxRbU5.js | 94499 | 10320 | 8180 |
| B / results-DLQ_cu1i.js | 593300 | 154608 | 106366 |
| B / sports-entry-pP03YNay.js | 20482 | 6874 | 6066 |

A total JS: 1574059 B; total CSS: 80082 B.

B total JS: 1575599 B; total CSS: 80083 B.

Both production builds PASS; large-chunk warnings remain (A athletes/sports; B athletes/results). No warning suppression or new dependencies. An initial offline size scan overlapped a gate rebuilding dist and returned ENOENT; it was repeated after rebuild completion. Benchmarks ran separately from gates/builds.

## Source and computed invariants

For A and B, all files under src/data, public, shared and worker are byte-identical to the baseline; internal ranking source also matches exactly. Vite SSR snapshots compare equal for all 1167 athletes, 4592 linked results, 1167 ranking records, sorted athletes and 12 official standings datasets. SHA-256 values are identical to [PERF-01B invariants](perf01b-rankings-code-splitting-prototype.md#invariants); local evidence `data-a.json` / `data-b.json`. ATH provenance, social links and approved artwork were not transformed.

## Exact source scope

Relative to original baseline, A changes five files: App.tsx; sports/RankingsRoute.tsx; sports/SportsArea.tsx; sports/loader.ts; sports/rankings-entry.tsx (all under src). B changes those same five plus sports/AthleteRoute.tsx, sports/AthleteArea.tsx, sports/athlete-entry.ts, sports/data.ts and sports/results.ts: ten files total. `files-a.json` / `files-b.json` preserve exact paths. No shared UI component is edited.

The temporary test harnesses are outside application copies. `rankings-test.mjs` adds the evidence-based bounded settling wait; `split-test.mjs` also intercepts the new athlete-entry chunk so delayed-profile checks exercise the new boundary while preserving assertions on sports cache reuse. All other changes to copied tests only redirect artifacts; no data/expected-value assertions removed.

## Recommendation and risks

**REJECT these A/B variants for adoption.** They improve cold Rankings by about 48%, but immediate Profile remains 4.5s instead of 41ms. A succeeds only when there is time to preload (delayed median 49ms, range 41–91ms); that is insufficient under the explicit immediate-click criterion. B reduces Profile script work but only saves around 6KB incremental wire JS, and adds a Race route request (384ms instead of 46ms after Profile). Total journey JS slightly increases; Home and Calendar are broadly unchanged.

This does not reject all future route splitting. Further work would need a separately approved approach to the dominant results payload or different loading priorities, with no false empty profile state. No speculative data projection or preload-all strategy is recommended here. Native swipe behavior needs no fix from this evidence; the reproducible test synchronization improvement can be proposed separately for the main test suite.

No inference that a chunk warning alone blocks 1.0.0. Physical-device acceptance, target latency criteria and wider workload sampling remain open. Three runs are a controlled local comparison, not population statistics. A cannot cancel a module download once started and may waste work if the user leaves after preload starts. B adds a route loading shell to maintain. No further automatic experiment or primary-tree adoption.

## Validation notes

An initial B release gate returned 17/18: fast-refresh lint rejected a TSX file exporting both component and identity helper. The isolated entry was split into AthleteArea.tsx + athlete-entry.ts, following existing sports-entry conventions. No lint rule disabled. This changed build hashes; final B benchmark was repeated on the corrected build. Pre-fix build/measurement evidence is retained separately.

Initial A navigation suite passed list scroll but failed nested Back (actual Rankings, expected Athletes) in the reused tab. The same failure occurred on baseline. The unchanged baseline test passes in a fresh tab, as does A. Exact cross-suite history/instrumentation contamination was not isolated; this remains a test-harness limitation, not proof of a new routing defect. Remaining suites use fresh tabs. No navigation assertion or application handler was changed to obtain PASS.

## Reproduction

Keep the existing baseline/prototype copies and this task's A/B directories. In each isolated copy run `npm run build` and `npm run check:release`; serve dist using the existing Vite preview CLI on ports5420–5423 respectively. Start a dedicated headless Chrome with remote debugging9269 and a temporary profile; do not reuse an owner browser session.

From the relevant copy, set `TRI_APP_URL=http://127.0.0.1:PORT`, `TRI_CDP_URL=http://127.0.0.1:9269`, `VARIANT=a` or `b`. Temporary test scripts are in `/tmp/300w-perf01b2/`: `split-test.mjs`, `calendar-test.mjs`, `rankings-test.mjs`, `navigation-test.mjs`, `global-nav-test.mjs`. Run `fresh-tab.mjs` before each independent suite; it only replaces tabs in that dedicated test Chrome. Initial `run-regression.sh` preserves the reused-tab failure; `finish-regression.sh` runs final isolated browser checks. The full official standings, Calendar, navigation and resource unit command is in `run-regression.sh`.

Runtime: `AUDIT_PORT=5420 node /tmp/300w-perf01b2/runtime.mjs`, repeat5421–5423, sequentially with no builds/tests running. Before the final B rerun, original B output is retained with a pre-lint suffix. Set reduced-motion consistently when starting a fresh browser. `summarize.mjs` reads samples and produces medians/ranges plus offline build compression. Copy existing output before repeating to preserve prior evidence. `snapshot.mjs` in PERF-01B takes isolated root and JSON destination arguments for computed invariants.

## Final functional validation

| Check | A | B |
|---|---|---|
| Production build | PASS | PASS |
| Release gate | 18/18 PASS | 18/18 PASS after entry/lint correction |
| Standings + Calendar + navigation + sports resource unit tests | 38/38 PASS | 38/38 PASS |
| Code-splitting browser | 4 viewport cases PASS | 4 viewport cases PASS |
| Calendar browser | 4 viewport cases PASS | 4 viewport cases PASS |
| Official Rankings browser | 14 viewport/theme cases + Home PASS | 14 viewport/theme cases + Home PASS |
| Athlete/Profile/Race navigation | PASS in fresh tab | PASS in fresh tab |
| NAV-03 | 14 viewport/theme cases + 50 destination pairs and nested/history/keyboard checks PASS | Same checks PASS |
| Data and calculation invariants | Exact equality | Exact equality |
| git diff --check | PASS | PASS |

The Rankings suite verifies all 12 official tables in each viewport/theme case, exact points/IDs/profile links, season selection, both swipes, history, Back, Feedback opening (no submission), and no overflow. New B Athlete-resource probe additionally PASS: held import, leave during load, no stale redirect, no sports-entry request, failed import and actual reload retry. No functional regression reproduced in final isolated checks. Original failures remain in logs and are not erased by final PASS.

Existing non-gating localization regeneration and historical photo/staging tests are not run, as listed by the release runner. Existing RaceDetailPage lint warning remains. This is not physical-device acceptance or a full production E2E certification.

Primary working tree changes in this task: this report and Project Board only. All earlier modified/untracked application files and four protected local artifacts remain untouched. No application implementation is approved for integration by this report. **STOP for owner decision.**
