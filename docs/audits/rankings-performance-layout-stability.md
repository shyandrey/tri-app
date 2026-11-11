# Rankings performance and layout stability — 2026-11-10

Status: targeted CLS correction implemented; LCP limitation remains open. Local commit only; no PR, push or deployment.

## Baseline and method

Read the [pre-release audit](pre-release-performance-audit.md) and its measurements first. Development HEAD before this task: `2b5df28373a002b355b21a52df4d895dea32068d`. Existing unrelated working-tree changes remain preserved. Runtime file hashes matched the previous isolated audit snapshot exactly before modification; the same baseline production artifact was served on localhost:5438. Candidate production build served on localhost:5440. No claim that either artifact is current Preview.

Reproduced three cold navigations each at mobile 390×844/DPR3/CPU4× and desktop 1440×900/DPR1/CPU1×. Both used Chrome 157.0.8103.50, 150 ms latency, 200,000 B/s download and 93,750 B/s upload, gzip server, cleared cache/storage and deterministic scene 3 (`Math.random=0.99` in browser only). Observations continued seven seconds beyond table readiness so both showcase requests completed. No synthetic interaction ended LCP observation early. These are lab samples, not field percentiles. Same system fonts, no remote font loading, same artwork and data.

Evidence: [before/final and discarded experiment measurements](rankings-performance-layout-measurements.json). Local scripts/logs under `/tmp/300w-rankperf-20261110/`; baseline source/build under `/tmp/300w-prerelease-20261110/working`. The existing audit's shorter observation window had one incomplete mobile artwork request; this measurement uses completed transfers.

## Confirmed causes

**CLS:** `src/index.css` gives `#root` a 1126px centered width. The asynchronous sports shell lacked the final Rankings full-width rule. On desktop at ~2.40 s, `OfficialRankingsPage.css`/page mounting changed root from x=157,width=1126 to x=0,width=1440. LayoutShift source identifies `#root`; all three baseline runs recorded CLS 0.1090278. This is a loading-shell geometry mismatch, not changing font metrics or missing image dimensions.

**Mobile LCP:** the actual candidate is `ironman_04_transition.webp`. Baseline sports JS request started ~0.89 s and completed ~2.40 s; both current and adjacent artwork requests started ~2.54 s. Active artwork completed ~6.93 s, neighboring T100 ~7.76 s in the first sample. Therefore a late image discovery waterfall plus image bandwidth contention dominates the observed 6.92 s LCP. Existing `fetchPriority` high/low does not remove shared-channel contention in this local HTTP/CDP profile. Adjacent availability is intentional for interactive swipe; removing it is not a safe invisible optimization.

**Sports module contribution:** direct Rankings loads the shared lazy `sports-entry`. `SportsArea.tsx` imports all sports pages and `data.ts`, which loads athletes/results, links results, calculates and sorts the internal athlete ranking at module evaluation. The 263 KB gzip transfer is material: about 1.51 s of the request waterfall before artwork discovery. This is not proof that every byte is unnecessary or that arbitrary chunk splitting would improve navigation. No data/business logic changed.

CDP ScriptDuration across baseline navigation: mobile 134–150 ms; desktop 53–58 ms. TaskDuration: mobile 281–330 ms; desktop 161–164 ms. These aggregates do not isolate V8 parsing, React render or ranking calculation individually. No downloaded fonts, runtime API requests or biographies were implicated in the Rankings waterfall. Browser `document.fonts` collection was empty; UI uses existing system stack. Reserved showcase dimensions remain intact.

## Retained correction

Only two runtime files changed:

- `src/sports/SportsRoute.tsx`: mark the Rankings loading shell with `data-rankings-pending`; other pending routes do not receive the marker.
- `src/sports/sports-loading.css`: eagerly available `#root:has([data-rankings-pending]) { width:100%; }` matches the already-approved final Rankings root width.

The final page markup, styles, artwork, loading messages, Back button, bottom navigation and data initialization are unchanged. The shell no longer expands horizontally when the lazy page arrives. No dependencies, image optimization, generated files or loading architecture changes.

## Experiment deliberately not retained

Tested early responsive preload of the selected artwork, sharing its random scene with the eventual page. It reduced mobile LCP to 4.244/4.284/4.292 s, but delayed table readiness to 3.838–3.856 s versus baseline ~2.53 s. A low-priority preload trial still delayed readiness to ~3.86 s. Desktop also showed delayed table readiness. This is an unacceptable unreviewed tradeoff for a minimal pre-release fix; all preload/context/page edits were removed. No experimental dependency or change to an unrelated dirty file is included in the commit.

Do not present the experiment's LCP improvement as a shipped result. Only the measured layout correction is retained. LCP still needs a separately scoped route-data loading experiment; it cannot honestly be declared resolved by this patch.

## Before/after retained fix

Three cold samples per device/profile; medians shown, ranges in parentheses. Ready time is the first polling observation of `.standings-name` (~100 ms resolution), not a full interactivity metric.

| Measure | Baseline | Retained fix |
|---|---:|---:|
| Mobile LCP | 6920 ms (6916–6936) | 6920 ms (6904–6952) |
| Desktop LCP | 2432 ms (2432–2432) | 2428 ms (2416–2448) |
| Mobile CLS | 0 in 3/3 | 0 in 3/3 |
| Desktop CLS | 0.109028 in 3/3 | 0 in 3/3 |
| Mobile table ready | 2526 ms (2525–2573) | 2526 ms (2511–2559) |
| Desktop table ready | 2407 ms (2404–2409) | 2404 ms (2392–2503) |
| Initial JS encoded transfer | 347096 B | 347143 B (+47 B) |
| Mobile completed total transfer | 1363251 B | 1363322 B (+71 B) |
| Desktop completed total transfer | 1172855 B | 1172926 B (+71 B) |

No material LCP improvement is claimed. Desktop's LCP candidate is text, so its low LCP must not be interpreted as completed artwork loading. Initial JS transfer includes request/response overhead as reported by CDP. Build sizes measured separately using Node gzip: entry JS 277313→277398 raw / 83277→83324 gzip bytes; sports JS unchanged 1295309 raw / 263319 gzip bytes. Entry CSS 58945→58991 raw / 11611→11637 gzip bytes. Shared sports CSS unchanged. Hash references can change without a corresponding logic change.

## Validation scope and next steps

A deterministic browser regression holds the actual sports JS response, measures the pending root, releases it and compares final width. It also checks two artwork requests without duplication, overflow, and restored T100/W/2024 state. This directly tests the cause instead of accepting only a lower aggregate CLS score.

Required manual follow-up: physical iPhone/Safari slow-network cold load, tablet/desktop loading and Back/Forward, saved series/season, interrupted sports loading/error state, and normal network/CDN behavior. No physical-device or field INP result is claimed.

Next performance task: profile/module-attribute the shared sports graph, then evaluate a narrowly isolated Rankings data boundary without altering canonical identities, standings, internal ranking output or approved visuals. Compare table-ready time as well as LCP and total transfer; do not accept faster imagery that hides a slower interactive table. Do not resurrect rejected prototypes without new evidence/review.

## Executed checks

- Production build PASS; existing sports chunk warning retained. No additional dependency installed.
- Full lint PASS through `npm run check:release`; release gate **18/18 PASS**. No full catalog regeneration.
- `node --test scripts/test-sports-loader.mjs`: **2/2 PASS**, preserving 1167 athletes, 4592 linked results and exact internal ranking order/scores.
- `test-rankings-startup-browser.mjs`: **2/2 PASS** at 390×844 and 1440×900. Negative baseline run deliberately fails the desktop shell-width assertion with `1126 !== 1440` after passing mobile. This establishes regression-test sensitivity.
- Browser performance: **6 baseline + 6 final cold runs**; all completed, desktop/mobile CLS final 0. Discarded high-priority experiment: six runs; low-priority experiment: two runs.
- Documentation links and `git diff --check`: PASS.

- Existing Official Rankings browser suite: **14/14 viewport/theme cases PASS**, all 12 standings tables, wheel/keyboard/touch, history, contrast and navigation; no runtime exceptions.
- Existing swipe suite: **14/14 gesture cases PASS**, plus network isolation fixtures, reduced motion, orientation and duplicate-request checks.
- Existing showcase suite: **16/16 viewport/theme combinations PASS**, all eight mapped scenes, 16 approved WebP hashes, sizing/cropping and safe areas.
- Navigation suite: first shared-context run **FAIL** at line 25 (`rankings` vs expected `athletes` after Back). After that failure, one controlled run on a fresh candidate browser profile and one on a separate fresh baseline profile both **PASS** (all logged scenarios). Exact shared-context cause remains unconfirmed; no test assertion changed and no silent retry-until-pass. Keep this as an open test-isolation concern rather than claiming an unconditional all-green first run.

## Commit scope and preservation

Six paths: `src/sports/SportsRoute.tsx`, `src/sports/sports-loading.css`, `scripts/test-rankings-startup-browser.mjs`, this report, its measurement JSON and only the new task section of `docs/PROJECT_BOARD.md`. Original audit evidence remains unchanged. Pre-task hashes confirm all unrelated existing files, including unfinished Athlete Profile, localization and standings data, unchanged. Runtime change is one conditional attribute and one CSS rule. No speculative preload retained.
