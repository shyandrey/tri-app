# RANK-03C/D — Landscape integration and performance audit

Date: 2026-10-23. Status: LOCAL IMPLEMENTATION / OWNER VISUAL REVIEW REQUIRED. Performance: **PASS WITH NOTES**. Composition acceptance remains open; no deployment or final owner approval is implied.

## Architecture and integration

`OfficialRankingsPage.tsx` chooses one of four scene indices once per mount. Switching IRONMAN/T100 retains that index; gender and season do not select new artwork. `rankingsShowcase.ts` preserves all portrait paths, scene order, focal points and rotation logic, and adds the eight approved public WebP URLs and independent landscape focal positions.

A `<picture>` selects WebP for `(orientation: landscape)` and the existing PNG otherwise. Both URLs live in `<source>` elements. Keeping a fallback `img.src` initially caused React to request that PNG while constructing the detached image, before the picture source was selected; the network regression caught this and the extra fetch was removed. The unconditional PNG source also provides fallback for picture-capable clients without WebP support. Legacy browsers without `<picture>` support are not covered. One high-priority image is retained across React rerenders; no Base64, image imports, processing dependency or eager eight-image preload was added.

Portrait CSS and image bytes remain unchanged. Its original background uses the same PNG URL, coalesced by the browser. Landscape has no blur, side masks or contain layout. A full-frame CSS background retains the last loaded image beneath the new picture while its request is pending; it reuses the decoded URL without extra downloads in the measured Chromium run. This is not a blurred side backdrop. `cover` preserves proportions in a common 5.5:1 frame: 121.3 / 153.5 / 173.8 px at 667 / 844 / 956 px, plus existing safe-area offsets. Desktop landscape uses the same responsive source/frame. Back, table, season picker, Feedback and NAV-03 are unchanged.

Adjacent preloading was evaluated but not introduced: scene indices are random per mount, with no next-scene carousel destination; prefetching inactive scenes would download unused images. The next series is not guaranteed. Actual slow-WebView switching remains an owner/device check.

## Asset verification and sizes

Package: `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/`. Eight PNG originals and eight optimized WebP files are present, with unique names. Manifest sizes and decoded dimensions match; browser image comparison confirms corresponding PNG/WebP compositions. All 24 portrait/landscape image hashes are unchanged. The package also has `manifest.json`, `README.txt`, and an unnecessary `.DS_Store`; none were deleted. README's earlier provisional-export note is superseded by the owner's approval in this task. No original was regenerated, cropped or duplicated.

| Asset ID | Dimensions | PNG bytes | WebP bytes | PNG/WebP ratio | Runtime format |
|---|---|---:|---:|---:|---|
| t100_running_city | 1950×807 | 2,250,471 | 188,666 | 11.93:1 | WebP |
| t100_swimming | 1947×808 | 2,460,537 | 224,646 | 10.95:1 | WebP |
| t100_cycling | 1947×808 | 2,768,336 | 278,246 | 9.95:1 | WebP |
| t100_transition | 1947×808 | 2,655,331 | 269,846 | 9.84:1 | WebP |
| ironman_swimming | 1947×808 | 2,409,413 | 220,256 | 10.94:1 | WebP |
| ironman_cycling | 1947×808 | 2,728,932 | 244,476 | 11.16:1 | WebP |
| ironman_running | 1947×808 | 2,454,187 | 210,922 | 11.64:1 | WebP |
| ironman_transition | 1947×808 | 3,142,643 | 355,328 | 8.84:1 | WebP |

Totals: landscape PNG **20,869,850 bytes**, WebP **1,992,386 bytes** (90.45% smaller). Existing eight portrait PNGs: **18,213,627 bytes**. These are different compositions; the portrait comparison is a size inventory, not a quality-equivalence claim.

Originals are still inside `public/` and therefore copied to `dist` along with WebP and documentation. They are not requested by the landscape UI, but remain publicly deployable static files (~20.9 MB originals). Moving/excluding originals and `.DS_Store` from future deployment output is a separate housekeeping decision; this task preserves the supplied package. No configuration was changed.

## Per-scene framing and review risks

Horizontal position is 50% for every scene (the complete source width is retained). Vertical positions:

| Scene | Y | Decision / remaining limitation |
|---|---:|---|
| IRONMAN Swimming | 60% | Swimming action and buoy wordmark; Prague skyline loses height. Large right buoy is near Back: owner check at 667 px. |
| IRONMAN Cycling | 60% | Helmet/upper body and barrier branding; wheels and mountain peaks are partly cropped. |
| IRONMAN Running | 48% | Keeps face and torso away from top edge. **Lower IRONMAN wordmarks on the barrier are clipped/faded; visual acceptance is not confirmed.** |
| IRONMAN Transition | 58% | Transition field, branded tent and upper bodies; foreground legs cropped. |
| T100 Swimming | 48% | Buoys, swimmers and coastal city remain recognizable. |
| T100 Cycling | 80% | Athletes and clear T100 barriers. **London skyline/landmarks largely fall outside the narrow crop.** |
| T100 Running / City | 30% | Runner, jersey T100 and finish arch; Burj Khalifa tip and legs cropped. |
| T100 Transition | 62% | Athlete, bridge span and barrier marks; tower tops/legs cropped. |

The supplied ratio (~2.41:1) means only ~43.8% of its vertical extent fits a 5.5:1 cover. This is a real composition constraint, not a distortion. In particular, IRONMAN Running cannot retain the full head and the large low barrier wordmark together with comfortable margins at the target ratio. Recommended correction for that scene is an owner-approved wide composition/export that places a clear mark closer to the athlete's upper-body band. T100 Cycling needs a revised composition if London landmarks are essential; moving its focal point upward hides the main cyclist instead. No logo overlays, stretching or artwork edits were introduced. These issues prevent declaring every composition visually accepted; the implementation is a review candidate.

## Reproducible performance comparison

Production builds via `npm run build` before integration and `npm run check:release` after. Browser: local Chromium CDP, DPR 1, mobile emulation, no network/CPU throttling, fixed scene 0, same local Vite preview port 5390. Cache explicitly cleared before each cold load (final audit first leaves the previous document via about:blank to avoid retaining its live decoded image); warm measurement reloads with normal cache/revalidation. Source script: `scripts/audit-rankings-showcase-browser.mjs`. Raw results: `/tmp/300w-rank03/before-network.json` and `after-network.json`; build manifests/logs in the same directory. Single-run timings are diagnostic, not statistically stable benchmarks or Telegram WebView measurements.

| Metric | Before | After |
|---|---:|---:|
| Total emitted JS | 1,569,706 B | 1,570,493 B |
| Largest JS chunk (sports) | 1,292,321 B | 1,293,108 B |
| Total emitted CSS | 78,630 B | 78,677 B |
| Portrait cold images / transferSize | 11 / 2,269,421 B | 11 / 2,269,421 B |
| Landscape cold images / transferSize | 11 / 2,269,421 B | 11 / 308,874 B |
| Warm reload (either orientation) | 11 / 3,300 B | 11 / 3,300 B |
| Landscape series switch | 11 / 2,262,590 B | 11 / 310,718 B |
| Rotate to portrait after T100 switch | 0 / 0 B | 1 / 2,176,818 B (correct portrait variant, first use) |
| Rotate back to landscape | 0 / 0 B | 0 / 0 B (reuse) |
| Gender rerender | 10 / 103,596 B | 10 / 103,596 B (new athlete photos; zero showcase fetches) |

Initial 11 images are one selected showcase and ten athlete photos. No inactive landscape/portrait source or other six landscape scenes were fetched. Selecting the other series requests its single selected showcase plus its athlete photos. On orientation change, one additional first-use variant is expected; returning reuses the existing image.

`transferSize` is Resource Timing's browser-reported transfer size (including standardized overhead), not total emitted build bytes or a packet capture. Local Vite revalidates warm requests; 300 B entries do not mean full image downloads. Selected landscape initial transfer fell ~86.4%. JS grew only **787 B** (+0.050% total); CSS grew **47 B**. Images remain public URLs, not JS payloads. The existing >500 kB sports chunk warning persists; no threshold was raised and no unrelated bundle/data architecture refactor was attempted.

Selected artwork load event from navigation start: portrait 128.8→108.5 ms; landscape 71.8→81.8 ms; warm landscape 64.5→48.2 ms. These single local runs must not be interpreted as a reliable speedup. `decode()` was awaited after `complete` and usually resolved from an already-decoded image (0–0.2 ms after; landscape cold await was 10.8 ms); this does not measure full decode CPU cost. Raw route-ready observation times are recorded, but include polling latency. Recorded CLS was 0 in both audit runs. Actual Telegram/Safari latency, GPU and low-memory behavior remain unmeasured.

**Assessment: PASS WITH NOTES.** No material loading/bundle regression; landscape image transfer is substantially lower. Existing heavy sports chunk, public originals and native-device measurements remain separate risks. Visual composition approval is independent of this performance result.

## Validation and deliverables

- Eight PNG/WebP pairs: format, sizes, decoded dimensions and composition comparison.
- Showcase browser matrix: 128 scene/viewport/theme checks (the seven requested sizes plus desktop), exact responsive sources, no inactive-orientation image requests, edge-to-edge geometry, safe-area positioning, NAV-03 capsule and `z-index: 40`.
- Required 24 landscape screenshots: `/tmp/300w-rank03/screenshots/crop-{series}-{scene}-dark-{667x375|844x390|956x440}.png`; additional light-theme and portrait screenshots in that directory.
- Comparison sheet: `/tmp/300w-rank03/comparison.png` (HTML source alongside it); full-page landscape: `/tmp/300w-rank03/full-landscape.png`. Neither modifies source artwork.

Changed application files: `src/pages/rankingsShowcase.ts`, `src/pages/OfficialRankingsPage.tsx`, `src/pages/OfficialRankingsPage.css`. Test/audit files: `scripts/test-rankings-showcase-browser.mjs`, new `scripts/audit-rankings-showcase-browser.mjs`. Documentation: this report, `docs/official-rankings-ui-2026-10-22.md`, `docs/PROJECT_BOARD.md`.

No ranking rows/points, athlete identities/enrichment/results, navigation logic, typography, color tokens, version, Cloudflare/D1 or secrets changed. Existing artifacts and source archives are preserved. Stop for owner review; do not mark RANK-03 DONE or owner-approved based on tests.

### Final validation notes

- `npm run check:release`: 18/18 PASS, including production build, lint, ranking and navigation checks. The first sandboxed attempt reported a local Vite socket EPERM; rerun with local socket access passed. Existing RaceDetailPage hook warning and sports chunk size warning remain.
- `node --test scripts/test-navigation.mjs scripts/test-t100-standings.mjs scripts/test-ironman-standings.mjs`: 30/30 PASS.
- Delayed local image request: `/tmp/300w-rank03/switch-test.mjs` pauses the T100 WebP request, checks the retained IRONMAN bitmap and stable frame height, then resumes. PASS; screenshot `/tmp/300w-rank03/switch-inflight.png`. No remote requests or artificial artwork involved.
- Protected inventory: 129/130 prior protected hashes unchanged; the sole intentional difference is `src/pages/rankingsShowcase.ts`. All 24 artwork hashes unchanged. Rankings data, athlete data, results and ranking formula remain byte-identical.
- Functional regression: 14 viewport/theme groups covering all 12 standings tables, series/gender gestures, season wheel, profile links, Back, Feedback and bottom navigation. Full browser matrix and functional regression logs are in `/tmp/300w-rank03/showcase.log` and `interactions.log`; validation uses local Chromium, not native Safari or Telegram.

Task-specific runtime diff (against the pre-integration local state, not Git HEAD): `/tmp/300w-rank03/runtime.diff`. Existing earlier uncommitted UI/data preparation is outside this task’s diff. Documentation relative links checked; `git diff --check` passed. Large portrait desktop retains the original centered 320 px frame independently of the new landscape focal values.
