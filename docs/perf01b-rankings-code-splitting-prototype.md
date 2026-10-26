# PERF-01B — Rankings code-splitting prototype

**PERF-01C owner decision — 2026-10-25: PROTOTYPE REJECTED BY OWNER FOR v1.0.0.** Retain the existing baseline loading architecture. No experimental code is approved for reuse or integration. The sports chunk warning is an accepted pre-release exception conditional on final physical-device QA, which remains pending. Future optimization is tracked separately as PERF-02 in [Project Board](PROJECT_BOARD.md).

The dated audit/experiment below is preserved as historical evidence. Its earlier pending-review/open/recommendation language is superseded by this owner decision, not erased.


2026-10-25 · **Prototype evaluated / awaiting owner decision** · Recommendation: **REVISE**.

Rankings becomes substantially faster on a cold load, but the first subsequent Athlete navigation pays for the deferred sports module. Do not adopt this prototype automatically. PERF-01 remains open. No application changes were applied to the primary working tree; no deployment, commit, dependency installation, data transformation or version change.

## Isolation and reproducibility

Baseline: `/tmp/300w-perf01b/baseline/`. Prototype: `/tmp/300w-perf01b/prototype/`. Both start from the complete current modified/untracked working tree on `home-redesign-experiments`, HEAD `c8f52e02a75e0b413dddbfee77f477232c5301d3`, **not HEAD alone**. Copies include independent Git metadata, exclude generated dist/.wrangler/node_modules, and symlink existing installed dependencies. Version remains 0.0.0.

All temporary harnesses, logs, build sizes, runtime JSON and invariant hashes are in `/tmp/300w-perf01b/`. This is temporary local evidence, not a durable archive. Preserve it if continuing the experiment. Original working files were SHA-256 compared before documentation changes: zero changes. Prototype differs from baseline in exactly five source files; data, artwork, scripts, shared and worker files are byte-identical.

Commands in each copy: `npm run build`, `npm run check:release`. Local Vite preview serves baseline on 5420 and prototype on 5421. Dedicated Chromium CDP endpoint: 9268. Runtime: `AUDIT_PORT=5420 node /tmp/300w-perf01b/runtime.mjs` (repeat with 5421); `deep.mjs` uses the same port selection. `compare.mjs` summarizes runtime JSON. `sizes.mjs` computes offline compression; `snapshot.mjs` loads each copy through Vite SSR for invariants. Inspect harness environment/constants before rerunning; do not overwrite prior artifacts unintentionally.

## Architecture and root cause

Baseline: App → SportsRoute → lazy sports entry → SportsArea. SportsArea imports OfficialRankingsPage and `sports/data.ts`; the latter eagerly links all results, calculates internal athlete ranking and sorts athletes on module evaluation. Consequently official Rankings loads data/calculations that its own standings rendering does not require. Vite config has no custom manualChunks strategy to separate this boundary.

- Immediately required: OfficialRankingsPage, full official standings, athlete identity/display/photo lookup, UI/swipe/season controls and shared React/navigation shell.
- After interaction: Athlete Profile and Race Results code/data, on navigation to those routes. Series/gender/season switching needs the already-loaded official tables.
- Not required by official Rankings: full race results, result linkage and internal ranking calculation.
- Shared: full athlete registry (including enrichment/provenance), React, navigation/icons, athlete image utilities. Home/Calendar remain in the existing shell; their eager catalog dependencies are not redesigned.

Prototype adds a separate dynamic Rankings entry, importing full `athletes` directly instead of `sports/data`. It leaves sports calculations behind the existing sports entry. No compact runtime projection or evidence stripping. Full official standings evidence and full athlete enrichment remain bundled. Artwork continues to use existing responsive file URLs, not JS embedding.

Exact prototype-only files:

1. `src/App.tsx` — dispatch Rankings to its own lazy route before sports routes.
2. `src/sports/loader.ts` — independent cached async Rankings resource.
3. `src/sports/SportsArea.tsx` — remove Rankings branch/import.
4. `src/sports/RankingsRoute.tsx` — loading/error/retry shell; ignore completion after route departure.
5. `src/sports/rankings-entry.tsx` — existing page and callbacks with full athlete registry.

Build dependency graph: index dynamically imports rankings-entry or sports-entry; both import the extracted athletes chunk. Rankings entry contains official standings; sports entry contains results and internal-ranking calculation. This duplicates a small route shell, not sports data. Page, gesture, navigation model and Vite configuration are unchanged.

## Build output

Bytes; gzip/Brotli are **offline compressed sizes**, not observed wire transfer. Node built-in compression settings were identical for both builds.

| Chunk | Minified | gzip | Brotli |
|---|---:|---:|---:|
| Baseline index-ENMDu9SZ.js | 277385 | 83321 | 71038 |
| Baseline sports-entry-BmJxP9qc.js | 1295176 | 263224 | 177527 |
| Prototype index-CKcbZpon.js | 278690 | 83444 | 71119 |
| Prototype athletes-DTHYTYrm.js | 577497 | 88996 | 62683 |
| Prototype rankings-entry-CFRtL1bV.js | 94499 | 10320 | 8178 |
| Prototype sports-entry-CDQY1xaC.js | 623241 | 164223 | 114645 |

Total JS: 1,572,561 → 1,573,927 B (+1,366 B); total gzip 346,545 → 346,983 B (+438 B). Total CSS: 80,081 → 80,082 B. Entry gzip increases 123 B. Rankings incremental gzip 263,224 → 99,316 B (−62.3%); Brotli 177,527 → 70,861 B. This is route deferral, not an overall payload reduction.

Prototype CSS: index 58,925 B; Rankings 9,579 B; sports 11,578 B. Baseline CSS: index 58,925 B; sports 21,156 B. Build warnings persist: prototype athletes and sports exceed 500 kB. Existing RaceDetailPage hook dependency lint warning remains. Neither warning was suppressed.

## Runtime method

Chrome 155.0.8059.85, macOS arm64, 390×844, DPR3; CPU4×; 150ms latency, 200,000 B/s download (1.6 Mbps), 93,750 B/s upload. Three runs per variant, same sequences and deterministic artwork selection. Cold runs clear browser cache; warm SPA routes reuse modules; warm reload revalidates HTTP cache. No concurrent build during measurements.

Route readiness is polling for rendered route content (50ms polling), **not LCP, all-images-decoded or INP**. ScriptDuration/TaskDuration deltas include 400ms after readiness. ScriptDuration is an evaluation/work proxy; isolated parse time was not measured. Long-task blocking is sum of time exceeding 50ms per long task, **not Lighthouse TBT**. Heap is observed V8 used heap, not retained-memory analysis. Network JS bytes are actual CDP encoded transfer including response headers/revalidation; local Vite served gzip. No claim about actual iPhone Safari/Telegram performance.

## Runtime comparison

Readiness in ms: median [min–max], three runs each.

| Scenario | Baseline | Prototype |
|---|---:|---:|
| Home cold | 910 [901–975] | 905 [904–905] |
| Home → Rankings first | 3197 [3192–3198] | 1647 [1644–1648] |
| Rankings → Calendar first | 25 [21–26] | 23 [23–25] |
| First Athlete after those routes | 44 [43–51] | **4018 [4000–4032]** |
| Race after Athlete | 46 [43–48] | 44 [44–46] |
| Home warm | 19 [18–20] | 18 [17–19] |
| Rankings warm | 19 [19–20] | 20 [20–21] |
| Calendar warm | 15 [14–15] | 15 [15–15] |
| Athlete warm | 15 [15–19] | 15 [15–16] |
| Race warm | 32 [28–33] | 29 [28–30] |
| Rankings warm HTTP-cache reload | 721 [717–721] | 661 [658–666] |
| Rankings direct cold | 2517 [2499–2519] | 1635 [1630–1642] |
| Calendar direct cold | 897 [894–899] | 897 [893–897] |
| Athlete direct cold | 2534 [2530–2536] | 2470 [2470–2471] |
| Race direct cold | 2529 [2528–2529] | 2466 [2466–2475] |

Incremental JS wire bytes: first Rankings 263,800 → 100,124 (−62.0%); Home 83,751 → 83,874; first Athlete 0 → 164,719. Direct cold Rankings including entry 347,551 → 183,998. Warm SPA transitions transfer zero new JS; warm Rankings reload transfers 358 → 537 B of revalidation responses, not complete JS bodies.

First Rankings ScriptDuration: 75.50 [74.69–78.28] → 29.50 [29.33–31.03] ms. TaskDuration median 140.70 → 91.26ms. Long-task blocking 2 → 0ms. V8 used heap 6.68 → 3.69MB. Direct Rankings script 131.35 → 84.65ms; blocking 6 [3–8] →0ms. Home script 72.06 → 71.87ms; blocking 30 [26–76] →31 [30–35]ms: no convincing Home improvement. Warm Rankings script 10.12 → 9.99ms; blocking 0 in both. Full metrics/variability: `comparison.json` and `comparison.log`.

The first Athlete tradeoff is material. Baseline already loaded sports during Rankings; prototype defers it until Athlete, while other page assets may still compete on the throttled connection. The 4s observation is an actual same-sequence user-flow result, not an isolated module download benchmark. Separate cold deep-link measurements show Athlete/Race initial loading itself is not materially worse. Warm behavior is essentially unchanged.

## Invariants

Exact SSR output equality baseline/prototype:

- Athletes: 1167, SHA-256 `51a92c6af38fb775999aaaaf35ea91be15b32a46b7599e59e9c018102fdaa0e5`.
- Linked results: 4592, `82244747a1e405afbd6c01e3b79b99c2369d7bec225d25b570be5316b963c8de`.
- Internal ranking: 1167, `704809404834a66842688a7baae2ac208034967e0ab8ffe866408b08cfb96e40`.
- Sorted athletes: 1167, `7368e2e491b97c1d6527aa8fe4e02d1673ff021acc288bb86e420b24c6c03cbd`.
- Official standings: 12 datasets, `14efd3d837cbe02f32c5e49f410390490f046213adb2a83c7bd7831ee40cad33`.

Authoritative src/data, ATH enrichment/provenance, artwork and internal ranking source remain byte-identical. No inferred data or transformations.

## Validation

Builds and release gate: baseline and prototype PASS, 18/18 each. Prototype combined official standings, Calendar, navigation and sports-loader unit suite: 38/38 PASS. Existing test assertions are not weakened; temporary harness copies only redirect output artifacts to this task directory.

- Code-splitting browser: **4/4 PASS**, 390/440/844/1440; cold shell/Calendar, delayed loading, leave during load, history/scroll, deep links, invalid ID, failed import/retry and shared loading. QA-02B fixed clock retained.
- Official Rankings browser: **FAIL** at `test-official-rankings-browser.mjs:118`. All 12 viewport/theme combinations through 956px light passed, exercising all 12 tables each. At the next case (1440×900 dark), touch swipe did not switch series: expected different from `IRONMAN_PRO_SERIES`, actual `IRONMAN_PRO_SERIES`.
- Failure is in the existing touch gesture assertion, not keyboard selection. Prototype leaves gesture/page code byte-identical; this alone does not establish whether the failure is pre-existing, environment/timing-related or a prototype regression. No same-scenario baseline browser run was performed after this failure; cause remains unresolved.
- Per task stop condition, stopped the sequential validation chain at the failure. Separate swipe, navigation-browser, NAV-03 browser and new Rankings-specific loader error/retry harness **NOT RUN**. Unit navigation/loader tests passed, but do not substitute for these browser checks. Existing sports loader browser passed; new Rankings resource failure path remains unverified.
- `git diff --check`: PASS in primary and prototype copies. Documentation local links checked.

**Functional acceptance BLOCKED.** No full browser PASS claim. No test expectation was changed or failure retried away. Before adoption, independently reproduce this case against baseline and prototype under the same conditions, then resolve any confirmed regression under separate authorization.

## Decision and release impact

**REVISE; adoption BLOCKED** before owner review. Resolve the touch-swipe failure and complete the skipped browser checks as well as the performance tradeoff. Rankings cold readiness improves 48.5%, but a formerly warm first Athlete transition becomes 4s in the tested flow. Total JS barely changes; warnings remain. Route splitting is promising, but next work should separately assess user-intent preloading or a narrower Athlete/Results boundary and network contention, with the same full flow benchmark. Do not add eager preloading blindly: it could undo the Rankings benefit.

This experiment does not establish that the current build is unfit for 1.0.0 solely because of the Vite warning. Pre-release performance acceptance is still needed on target devices/networks. Do not make adoption a release requirement without owner latency criteria and acceptance of the first-profile tradeoff. No recommendation to transform authoritative evidence in this phase. Main application remains unchanged pending ADOPT/REVISE/REJECT owner decision.

Related: [PERF-01A](perf01-sports-chunk-audit.md), [QA-02B](qa02-calendar-card-count-investigation.md), [Project Board](PROJECT_BOARD.md).
