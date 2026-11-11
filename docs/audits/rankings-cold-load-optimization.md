# Rankings cold-load optimization — 2026-11-10

Status: locally implemented / awaiting review. Rankings table and LCP improve, with a documented first-visit Profile loading cost. No push, PR, merge or deployment. No owner approval of this performance tradeoff is implied.

## Baseline and measurement contract

Read [image/performance audit](pre-release-performance-audit.md) and [layout stability investigation](rankings-performance-layout-stability.md). Starting HEAD: `767ab44e726c821708343ed0a3b0e6a413ac0632`, branch `home-redesign-experiments`. Measurements use the actual development working tree, including preserved pre-existing changes, not the published Preview. Baseline production artifact preserved at `/tmp/300w-rankcold-20261110/baseline-dist`; candidate built with the same dependencies/configuration. No dependency or infrastructure changes.

[Recorded measurements](rankings-cold-load-measurements.json) include five mobile and three desktop cold navigations per build, five separate mobile usability trials per build, dependency membership, a Profile navigation diagnostic and visual comparison. Logs and screenshots: `/tmp/300w-rankcold-20261110/`.

Same profile as previous audit: Chrome 157.0.8103.50; mobile 390×844/DPR3/CPU4×; desktop 1440×900/DPR1/CPU1×; 150 ms latency; 200,000 B/s download and 93,750 B/s upload. Local gzip static server, cold browser cache/storage per sample. Scene pinned to 3 in browser instrumentation only; no runtime randomization change. No image preload. Node 24.19.0/npm 11.17.0. Not Lighthouse, field INP or a physical iPhone measurement.

Table **visible**: first animation-frame observation with the first populated standings row inside the viewport. Table **usable**: a separate cold navigation, real CDP mouse click on Women, followed by selected control, non-inert populated Women's table and settled horizontal track (within the existing 1px snap contract). This includes interaction/animation completion and polling overhead; it is not a universal TTI. Separate cohorts prevent input from terminating the LCP measurement early. LCP runs continue seven seconds after the table selector appears, completing both artwork downloads.

## Root cause and implementation

Previously `SportsRoute → sports-entry → SportsArea + data` loaded all sports components, canonical athletes, all race results, result linking and internal ranking calculation/sorting before Rankings could mount. Official standings do not require the latter operations. Artwork discovery consequently waited for that graph. The shared catalog is still required for canonical names, photos and profile links; it is not replaced with a second identity dataset.

Retained implementation:

- `src/sports/rankings-entry.ts` and `RankingsArea.tsx`: separate lazy entry using **the existing OfficialRankingsPage and canonical athlete catalog**. Navigation and feedback callbacks match the existing sports wrapper.
- `src/sports/loader.ts`: independent shared in-flight/resolved async resource for Rankings; existing sports resource remains unchanged.
- `src/sports/SportsRoute.tsx`: choose the resource from the route. Keep loading/error/retry shell, invalid-route checks, cancellation on unmount and the previous full-width CLS correction.
- The original SportsArea still supports its existing routes and exports. No data module, formula, standings JSON, content, localization, photo/artwork, or page implementation changed. No eager import across the route boundary, no preloads, no manualChunks rule, no speculative idle fetch.

Production bundle membership confirms **78 result modules and the internal ranking module remain in sports-entry**, absent from the Rankings initial graph. Automatic Vite splitting puts the existing Rankings component and shared athlete dependencies in a common chunk. The tiny rankings-entry wrapper imports that chunk. When a profile is requested, the existing sports entry loads and initializes its original calculations unchanged.

A read-only build observer recorded module membership; no plugin or build configuration change is shipped. Module membership is authoritative for this artifact; hook-time `bytes` in the raw graph can precede final preload-path rewriting, so actual transfer/file sizes below are used for size comparisons.

## Before/after

Medians; individual observations remain in the JSON. Decimal KB = 1000 bytes. CDP encoded transfer includes overhead and is distinct from raw minified size.

| Metric | Baseline | Candidate | Change |
|---|---:|---:|---:|
| Mobile cold LCP, 5 runs | 6912 ms | 6032 ms | −880 ms / −12.7% |
| Table visible, 5 LCP runs | 2515 ms | 1631 ms | −884 ms / −35.1% |
| Table usable, 5 separate runs | 2865 ms | 1988 ms | −877 ms / −30.6% |
| Initial JS encoded transfer | 347143 B | 183791 B | −163352 B / −47.1% |
| Mobile CLS | 0 in 5/5 | 0 in 5/5 | preserved |
| Desktop CLS | 0 in 3/3 | 0 in 3/3 | preserved |
| Desktop LCP, 3 runs | 2424 ms | 1604 ms | −820 ms |
| Desktop table visible | 2397 ms | 1574 ms | −823 ms |

Mobile LCP samples: before `[6916, 6908, 6924, 6908, 6912]`; after `[6044, 6028, 6020, 6032, 6040]`. Table usability samples: before `[2849, 2869, 2886, 2865, 2860]`; after `[1988, 1991, 1982, 1984, 2001]` ms. These small lab cohorts establish a repeatable local difference, not population percentiles.

The current audit's 6912 ms baseline is consistent with the prior 6920 ms median. The improvement comes from earlier page/artwork discovery after fewer JS bytes, not faster image encoding. In the first mobile samples, the baseline sports request ran ~887–2401 ms; candidate shared Rankings/catalog ~879–1567 ms. Artwork discovery moved from ~2515 to ~1637 ms. Median CDP ScriptDuration fell from 140.5 to 92.1 ms; this aggregate does not separately attribute V8 parse, React rendering and ranking initialization. Both adjacent images remain available and unchanged. Desktop LCP is text; do not interpret it as completed artwork loading. Mobile LCP around six seconds is still slow under this profile.

### Actual JavaScript output

Local Node gzip measurements (not a promise of CDN compression):

| Chunk | Raw bytes | gzip bytes | Loaded for initial Rankings? |
|---|---:|---:|---|
| Baseline entry | 277398 | 83324 | yes |
| Baseline sports-entry | 1295309 | 263319 | yes |
| Candidate entry | 277633 | 83414 | yes |
| Candidate shared OfficialRankingsPage/catalog | 671891 | 99357 | yes |
| Candidate rankings-entry | 393 | 272 | yes |
| Candidate sports-entry | 623413 | 164274 | **no; deferred until another sports route** |

Whole-app gzip JS is approximately unchanged/slightly larger (346643 → 347317 B across all chunks), while the critical Rankings graph is substantially smaller. This is code splitting, not data deletion or compression work.

## Navigation cost — explicit limitation

First Profile navigation after Rankings now needs the deferred sports entry. In one controlled slow-network comparison after both showcase images completed, the same athlete `/athlete/1` appeared **53.6 ms baseline versus 1083.5 ms candidate** after click. This is a measured one-time lazy-loading cost, not a claimed median. The existing loading/error/Back UI remains available; returning to Rankings reuses its resource and preserves selection.

This patch preserves navigation **functionality**, not identical first-visit navigation latency. Do not describe navigation as unconditionally faster or the cost as zero. The initial Rankings priorities improve simultaneously, but an owner who requires instant first Profile navigation after Rankings should reject this tradeoff before promotion. No background sports prefetch is added to hide the cost: that would increase initial transfer or compete with critical imagery. A full artifact download has not been made smaller to the same extent as initial Rankings transfer; deferred bytes are still needed on other sports routes.

## Visual and data preservation

SSR test compares exact old-wrapper/new-wrapper markup for all **12 series/season/gender selections × four scenes = 48 cases**, checks every canonical ID and unknown-ID behavior, and verifies the catalog is not mutated. Existing sports tests preserve 1167 athletes, 4592 linked results and exact ranking order/scores.

Computed geometry, typography, colors and backgrounds matched for showcase, gender controls, season/Back controls, navigation, table, names and avatars at 390×844 and 1440×900. Desktop screenshots are pixel-identical. Mobile screenshot differences are confined to the rightmost two pixel columns (native scrollbar strip); rendered content outside that strip is identical. No CSS design changes made; CSS files are only separated automatically by the build graph.

## Remaining work and acceptance limits

- Physical iPhone/Safari: cold entry, swipe before all artwork completes, initial Profile visit, Back/Forward, stored T100/season/gender and failed network retry.
- LCP still ~6.03s on this slow profile; no ≤2.5s claim. Other random scenes, real CDN protocol/compression, real mobile CPU and API conditions may differ.
- Existing sports and shared Rankings chunks remain above Vite's raw 500kB warning threshold. Chunk count/warning disappearance is not the success metric.
- Shared Rankings chunk still includes full canonical catalog/enrichment data. A projected display catalog or further route-data separation would require separate integrity/design review; not introduced here.
- All full-catalog regeneration restrictions remain in force. No changes to athlete identity, biographies, official standings/results or internal calculations.

## Executed verification

- Production build PASS; full lint PASS; release gate **18/18 PASS**. Known raw-size warning remains for sports and shared catalog chunks.
- `node --test scripts/test-rankings-route.mjs scripts/test-sports-loader.mjs`: **3/3 PASS**, including 48 exact markup comparisons and unchanged sports identity/ranking checks.
- Expanded `test-rankings-startup-browser.mjs`: **2/2 PASS**, 390×844 and 1440×900. Holds Rankings JS, checks stable geometry and two responsive images, verifies no sports-entry request until Profile, state-preserving Back, injected module failure and actual Retry.
- First attempt at the new reload/failure scenario timed out because it could proceed against the previous document after `Page.reload`. The test now waits for changed `performance.timeOrigin` and confirms a module request was actually rejected. Corrected run PASS. No runtime error handling was weakened or changed.
- Computed-style/pixel comparison completed. Initial comparison helper used an incorrect explicit sharp path; it was rerun using the existing project's package resolution. No package installed and no image altered.

- Existing Official Rankings browser suite: **14/14** viewport/theme cases PASS, all 12 tables, exact points/links, wheel, keyboard/touch, history and no runtime exceptions.
- Existing swipe suite: **14/14** cases PASS plus network fixtures, reduced motion, orientation and no duplicate artwork requests.
- Existing code-splitting browser suite: **4/4** viewports PASS, including leave during loading, delayed reload/scroll, deep links, unknown ID and actual failed-import retry. Its existing October 2 Calendar clock fixture remains unchanged.
- Existing navigation browser suite: PASS for all logged scenarios (list/filter/scroll, Profile/Race nested Back, browser history, Calendar, Home, direct/unknown routes and results sort).
- These four suites used separate fresh browser profiles; **all first runs PASS**, no automatic retry. Earlier shared-profile navigation instability was not silently retried.
- Documentation links and `git diff --check`: PASS.

## Exact local commit scope

`src/sports/SportsRoute.tsx`, `src/sports/loader.ts`, new `src/sports/RankingsArea.tsx` and `src/sports/rankings-entry.ts`; `scripts/test-rankings-startup-browser.mjs` and new `scripts/test-rankings-route.mjs`; this report, `rankings-cold-load-measurements.json` and only the new task section in `docs/PROJECT_BOARD.md`. All pre-existing unrelated source/data/artwork/documentation changes are preserved and excluded. This commit is a local candidate, not authorization to promote or deploy it.
