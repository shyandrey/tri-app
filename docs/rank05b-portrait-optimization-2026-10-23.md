# RANK-05B — Portrait WebP optimization · 2026-10-23

Status: local implementation; owner visual/device review pending. No deployment.

## Implementation

Eight full-resolution WebP derivatives encoded using existing Chrome Canvas `image/webp`, quality 0.92. No resize, crop, composition edits or new dependencies. PNG originals retained byte-for-byte. Encoding is lossy, not pixel-identical; rendered side-by-side comparison at 440 px shows no material visual degradation.

Portrait mapping now selects `rankings/optimized/*.webp`; `<picture>` source MIME updated. Landscape sources, CSS geometry, focal points, Home and RANK-05 gesture logic unchanged. Both adjacent series panels remain available. No image bytes embedded in JavaScript.

## Asset audit

| Asset | Dimensions | PNG bytes | WebP bytes |
|---|---:|---:|---:|
| ironman_01_swim.png | 1983×793 | 2,180,803 | 296,142 |
| ironman_02_bike.png | 1983×793 | 2,184,026 | 297,866 |
| ironman_03_run_finish.png | 1983×793 | 2,016,915 | 225,230 |
| ironman_04_transition.png | 1671×941 | 2,304,389 | 325,420 |
| t100_01_swim.png | 1671×941 | 2,176,518 | 278,206 |
| t100_02_bike.png | 1672×941 | 2,250,376 | 285,070 |
| t100_03_run_city.png | 1672×941 | 2,223,589 | 262,532 |
| t100_04_transition.png | 1671×941 | 2,877,011 | 490,150 |

Total: 18,213,627 → 2,460,616 bytes (86.49% reduction). Both neighbors are retained: cold portrait payload depends on the randomly selected scene. All 8 files remain full resolution for high-DPR mobile screens.

Bundle comparison against preserved immediately preceding RANK-05 build: JS 1,572,433 → 1,572,445 bytes (+12); CSS 79,947 → 79,947 bytes. Existing sports chunk (~1.295 MB minified) warning persists; not introduced by image optimization.

## Evidence

Local artifacts: `/tmp/300w-rank05b/`. `quality-440.png` and `quality.html` compare all eight PNG/WebP pairs. `assets.json`, `bundles.json`, `protected.json` record audit/baseline. Encoding provenance and SHA-256 recorded in `public/images/showcase/rankings/optimized/manifest.json`. Before-build preserved in `before-dist/`.

Browser captures are emulated desktop Chrome, not physical-device Safari/Telegram testing. Interaction videos use sampled browser frames; they are visual evidence, not FPS benchmarks. Owner review on physical iPhone remains required.

## Measured local network transfer

Chrome Resource Timing, cold cache, both neighboring slides at 390×844. Transfer sizes include browser-reported response overhead; timings are localhost, not CDN/mobile-network benchmarks.

| Scene | Before PNG transfer | After WebP transfer | Landscape transfer (unchanged) |
|---|---:|---:|---:|
| Swim | 4,357,921 B | 574,948 B | 445,502 B |
| Bike | 4,435,002 B | 583,536 B | 456,338 B |
| Run | 4,241,104 B | 488,362 B | 400,188 B |
| Transition | 5,182,000 B | 816,170 B | 625,774 B |

Each cold portrait navigation requests exactly two WebP sources. Switching series creates zero further image requests. Orientation change fetches only two landscape variants; returning to portrait creates zero additional requests. Warm reload revalidates locally: 600 B transfer per pair, zero encoded response-body bytes. No simultaneous PNG/portrait/landscape downloads, no eager fetch of all 16 images. Cache behavior on deployed CDN is not measured.

## Task-specific changed files

- `src/pages/rankingsShowcase.ts`: portrait URL mapping only.
- `src/pages/OfficialRankingsPage.tsx`: portrait source MIME only.
- `scripts/test-rankings-swipe-browser.mjs`: WebP/orientation request assertions and configurable evidence output directory.
- `public/images/showcase/rankings/optimized/`: eight WebP files listed above plus `manifest.json`.
- `docs/PROJECT_BOARD.md` and this report.

14 task-specific files; accumulated unrelated work remains untouched. To roll back portrait selection, restore the PNG path and portrait source MIME; original artwork is retained. No rollback/deployment performed.

## Validation results

- Production build: PASS. Existing sports chunk >500 kB warning retained.
- `npm run check:release`: 18/18 PASS with local socket access. First sandbox run was blocked by Vite `listen EPERM` in athlete audit; no validation was weakened.
- Swipe browser suite: 14/14 viewport/theme combinations PASS (320/375/390/440 portrait; 667/844/956 landscape). Touch/mouse tracking, short return, vertical scroll, series/gender, season persistence, athlete navigation, NAV stacking, reduced motion and orientation source requests PASS.
- Existing Rankings browser regression, 390×844 and 956×440 in both themes: all 12 datasets, values, links, wheel, keyboard/touch, history, Back/Feedback and Home/bottom navigation PASS; zero runtime exceptions.
- Official standings/navigation unit tests: 30 PASS.
- SHA-256 comparison of 155 existing artwork/data/swipe files: unchanged. Original PNG and all landscape files preserved.
- `git diff --check`: PASS. Version remains 0.0.0. No commit/push/deployment or remote changes.

Browser suite was rerun after build completion: an earlier concurrent build/navigation run failed to find the page. Final runs were sequential against the completed build.

Evidence logs: `build.log`, `release-local.log`, `gestures-final.log`, `regression.log`, `unit.log`, `network.json`, `network-before.json`.

Review gallery: `/tmp/300w-rank05b/review.html`. Videos: `home-reference.webm`, `rankings-showcase.webm`, `rankings-gender.webm`. All generated and readable. No blank adjacent frames observed in local interaction captures; initial decoding still depends on network/device and is not a physical-iPhone performance guarantee.
