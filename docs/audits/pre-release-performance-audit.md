# Pre-release image and performance audit — 2026-11-10

Status: audit complete / awaiting owner review. No runtime or asset changes recommended for immediate unreviewed application. No push, PR or deployment.

## Scope and provenance

Measured the actual dirty working-tree snapshot of `home-redesign-experiments`, based on HEAD `10e115b4249b3c9eef03dd95e4aaf3619b1a5386`, not a clean HEAD build or the deployed Preview. Existing Athlete Profile, localization, scripts and documentation changes were preserved. Snapshot copied tracked and non-ignored untracked files to `/tmp/300w-prerelease-20261110/working`; reused existing dependencies without installation. Results cannot certify that a different Preview artifact has identical performance.

Evidence: [753-file inventory](pre-release-image-inventory.csv), [28 route measurements including requests and rendered image selection](pre-release-performance-measurements.json). Local raw logs, screenshots, scripts and baseline file hashes: `/tmp/300w-prerelease-20261110/`. Temporary files are supplementary, not a durable release artifact.

Environment: Node 24.19.0, npm 11.17.0, macOS, Headless Chrome 157.0.8103.50. Built with `npm run build`. CDP equivalent measurements used because Lighthouse is not installed; no new dependencies. Local production static server used gzip, HTTP cache and deliberate `/api/*` 503 responses to exercise existing fallback data. This does **not** measure Cloudflare latency, API availability, production cache headers, TLS or backend processing.

Mobile: 390×844, DPR 3, CPU slowdown 4×. Desktop: 1440×900, DPR 1, CPU 1×. Both: 150 ms latency, 200,000 B/s download, 93,750 B/s upload. Each route had one cleared-cache navigation then one warm-cache reload. Deterministic Home scene selection and browser-only suppression of the four-second autoplay timer isolated initial delivery. These are descriptive samples, not percentiles or field Core Web Vitals. Observation ended 4.5 seconds after the route selector appeared; incomplete requests are explicitly lower bounds. Routes use the actual date; the separate historical browser regression used an October 2 clock fixture.

## Results

Decimal MB = 1,000,000 bytes. Encoded transfer below is CDP completed-request size (including protocol overhead where reported), not uncompressed source size.

| Route | Mobile cold LCP ms | Mobile warm LCP ms | Mobile cold total MB | Mobile cold images MB | Desktop cold LCP ms | Desktop cold total MB |
|---|---:|---:|---:|---:|---:|---:|
| Home | 3004 | 516 | 0.487 | 0.390 | 960 | 0.487 |
| Athletes | 2676 | 500 | 0.551 | 0.185 | 2428 | 0.507 |
| Athlete /1 | 2708 | 464 | 0.389 | 0.023 | 2404 | 0.374 |
| Calendar | 928 | 296 | 0.116 | 0.018 | 868 | 0.116 |
| Race /ironman-70-3-oceanside-2026 | 2532 | 412 | 0.551 | 0.185 | 2428 | 0.551 |
| Rankings | 6908 | 448 | ≥0.873 | ≥0.507 | 2424 | 1.173 |
| More | 944 | 304 | 0.098 | 0 | 848 | 0.098 |

Rankings mobile still had one unfinished request; its final total and final LCP may be higher. A text LCP on desktop does not prove adjacent artwork finished at that time. Warm-cache navigations reused completed images. Exception: mobile Rankings transferred another 490,371 encoded image bytes on the warm navigation; the cold window had not completed all neighboring artwork. Other warm samples recorded zero image transfer. This is not a fully warmed Rankings carousel. No uncaught runtime exceptions or horizontal overflow were recorded on the 28 navigations. This is not exhaustive interaction/asset coverage.

### Layout stability and responsiveness

Initial CLS was zero except desktop cold Rankings: **0.10903**. Two additional cold desktop captures reproduced exactly 0.10903 at approximately 2385/2399 ms, attributed by LayoutShift sources to `#root`. `src/index.css` gives root width 1126px; `OfficialRankingsPage.css` changes it to 100% only when `.app--official-rankings` exists. The asynchronous sports loading shell precedes that page. This supports a loading-shell/root-width transition, rather than an image lacking reserved space. Rect objects in the diagnostic serialized empty, so exact displacement was not captured. No layout correction made: changing the approved loading layout is outside this task's image-delivery-only fix scope.

Mobile observed long-task totals / excess over 50 ms: Home 137/87 ms; Athletes 236/136; Profile 121/21; Calendar 0/0; Race 52/2; Rankings 107/7; More 0/0. Desktop recorded no ≥50 ms tasks. These are observation-window aggregates, **not Lighthouse TBT**. JS parsing/evaluation was not separately traced; cannot attribute these totals entirely to JavaScript or ranking calculation.

A separate five-navigation mouse interaction sample under mobile CPU throttling observed a maximum EventTiming duration of 104 ms. This is only a lab responsiveness sample, **not field INP**. The desktop interaction collector retained prior buffered events/duplicate observations, so its output is excluded from conclusions. Physical iPhone, touch latency, representative interaction percentiles and INP remain unmeasured.

## Image inventory and actual use

Scanned 753 image files, 161,843,841 bytes across `public` and `src/assets`. No byte-identical duplicate among successfully hashed entries. SVG symbol sprite `public/icons.svg` has no standalone raster dimensions; sharp's metadata error is not evidence of a broken sprite. Visual duplicates and every possible indirect reference were not proven absent.

| Group | Files | Bytes | Interpretation |
|---|---:|---:|---|
| `public/athletes/` | 222 | 76,312,373 | Original sources retained for review/generation; runtime optimized mappings exist |
| Rankings portrait directory | 16 | 20,674,243 | Approved originals plus WebP delivery |
| Rankings landscape directory | 18 | 25,644,736 | Approved assets, prior versions and originals |
| `src/assets/optimized/` | 478 | 13,882,342 | Responsive delivery derivatives |
| `src/assets/showcase/` | 10 | 23,801,914 | Home source artwork |

17 public showcase PNG originals total **41,654,715 bytes**, copied into static build output although not requested in the measured routes. This increases packaging/storage, not automatically initial transfer. No deletions: rollback/source provenance and untested references must be reviewed before archiving outside public. Files absent from this limited network sample are not universally unused.

Largest source examples: landscape original `ironman_transition.png` 3,142,643 B (1947×808); portrait `t100_04_transition.png` 2,877,011 B (1671×941); former landscape `t100_cycling.png` 2,768,336 B (1947×808). These are source-size concerns, not evidence they were fetched by current UI.

Large active optimized examples: portrait `t100_04_transition.webp` 490,150 B; Home `nice-run-city-1672.webp` 363,542 B; landscape `ironman_transition.webp` 355,328 B. Further lossy conversion or resizing needs visual approval, especially embedded logos and cyclists. No recompression performed.

| UI | Delivery / sizing | Finding |
|---|---|---|
| Home | 640/1280/1672 WebP srcset, active priority, adjacent preload, reserved showcase geometry | Two initial images intentional for swipe; no all-scene eager loading in existing test |
| Athletes | 180/396 WebP via `athleteImageDelivery`, lazy/async with dimensions | Below-fold requests bounded; delayed photos do not move cards |
| Athlete Detail | Shared mapping, eager/async portrait and placeholder | Only 22,812 image bytes in mobile /1 sample; other profiles not all individually opened |
| Calendar | Small optimized series marks, fixed logo boxes | 18,356 image bytes; no CLS sample |
| Race Detail | Shared athlete thumbnails and results imagery | Same 0.185 MB image cohort as sampled mobile list; no original-photo bulk transfer observed |
| Rankings | Responsive orientation `<picture>`, neighboring panels, fixed avatars/showcase geometry | Larger image budget; desktop landscape and mobile portrait variants observed, no simultaneous opposite-orientation pair in initial snapshots |
| More | No image payload in sample | No image issue established |

Generator/source contract: `scripts/generate-image-variants.mjs`, curated artwork and original photos feed `src/generated/image-variants.json`. Existing `src/utils/athleteImageDelivery.ts` provides sizes/srcset/intrinsics and unknown-source fallback. Generated files were not edited. Fixed CSS logo boxes make missing HTML width/height on those specific elements insufficient evidence of CLS; no speculative attributes added.

## Comparison to Phase 2

`git diff 6839332 -- src/assets/optimized src/generated/image-variants.json` is empty: Phase 2 assets and generated manifest remain unchanged. Existing derivative tests validate dimensions, alpha/aspect handling and mappings.

| Images | Historical user-reported before | Historical Phase 2 after | Current mobile sample |
|---|---:|---:|---:|
| Home | 9.59 MB | 0.43 MB | 0.390 MB |
| Athletes | 16.20 MB | 0.18 MB | 0.185 MB |

Historical initial cohorts/settings were not reproduced. Do not call the difference from 0.43 to 0.390 a newly achieved improvement. Evidence supports retained optimization, not a new byte saving from this task. Scroll, other scenes and different athletes can produce different totals.

## JavaScript and loading path

| Output | Raw bytes | gzip bytes | Brotli bytes |
|---|---:|---:|---:|
| `index-DJ1HgUS8.js` | 277313 | 83277 | 70978 |
| `sports-entry-DgpuiaQh.js` | 1295309 | 263319 | 177432 |
| `index-BxD3s5JX.css` | 58945 | 11611 | 10037 |
| `sports-entry-mE9t-upk.css` | 20805 | 4604 | 4035 |

Totals: JS 1,572,622 raw bytes; CSS 79,750 raw bytes. Compression above measured with Node zlib defaults; not asserted as Cloudflare wire sizes. Build retains the documented >500kB sports warning. Images are separate assets, not the cause of the sports JS size.

`src/sports/loader.ts` dynamically imports `sports-entry`; `SportsArea.tsx` statically imports all four sports page components plus `data.ts`. That data module imports the athlete catalog and result registry, links results and calculates/sorts internal rankings at module evaluation. Therefore Rankings and a single Profile both require the common sports graph. Home/Calendar/More avoid that graph on direct entry. The ~0.263 MB gzip extra chunk and its work explain a significant route dependency; exact per-module cost and parse/evaluation allocation remain unmeasured. No manualChunks speculation or reuse of previously rejected PERF-01B/B.2 prototypes.

## Priorities and proposed next steps

1. **Pre-release performance review:** Rankings mobile cold LCP ≥6.908 s under the stated slow-network simulation; desktop CLS 0.109 reproduced three times. These are measured risks, not proof of a functional release blocker. Owner should review real iPhone cold/warm loading and decide acceptance before release.
2. **High-impact targeted follow-up:** reserve the final Rankings root width in its loading shell. Needs separately approved layout correction with desktop regression checks; no change here. Target CLS ≤0.1, preferably zero, across repeated cold starts.
3. **High-impact image experiment:** evaluate smaller responsive Rankings WebP derivatives and active/adjacent priority scheduling without sacrificing immediate neighboring-slide availability. Preserve current art and crop; generate via reviewed tooling, compare every scene visually. Budget and quality must be validated, not inferred from file extension. Suggested acceptance: ≥20% measured image-transfer reduction, no blank frames or opposite-orientation downloads, no quality regression, LCP no worse; aspirational mobile LCP ≤2.5 s under a fixed reproducible profile.
4. **Sports optimization, separate approved task:** collect module attribution/CPU trace, then isolate route data and avoid unnecessary global ranking work for Official Rankings/Profile where behavior permits. Architecture changes are not low-risk image fixes. Preserve exact identity/results/ranking output; compare at least five cold/warm runs and navigation, rather than accepting only a smaller chunk warning.
5. **Optional post-release packaging:** durably archive unused originals outside deployment output after a complete reference/provenance audit. Up to 41.65 MB public showcase PNG payload is a packaging candidate, **not a measured initial-load saving**. Never remove source/rollback images solely because absent from one network log.
6. Add repeatable image/network budgets and real-device field monitoring. Suggested thresholds: no original PNG regression in optimized slots, no duplicate orientation transfer, image-induced CLS zero, p75 INP ≤200 ms once sufficient real interactions exist. None of these suggestions are newly enforced tests or measured field results.

## Verification and changes

- Production build: PASS in primary tree and isolated snapshot; existing sports chunk warning only observed build warning.
- `node --test scripts/test-image-delivery.mjs scripts/test-athlete-photos.mjs scripts/test-athlete-photo-review.mjs`: **27/27 PASS**.
- Existing `scripts/test-image-delivery-browser.mjs`: **4/4 viewport scenarios PASS** (390/440/844/1440, DPR 3/3/2/2). Covered two-image initial Home selection, autoplay/rapid carousel, delayed-photo geometry, lazy below-fold loading, rapid scroll and +50 expansion. Browser-only date fixed to Oct 2, 2026 because its four-card historical fixture is date-sensitive; no test file changed.
- `npm run check:release` in real repository: **18/18 PASS**, including lint/build and its included checks. A preliminary snapshot-only run was 15/18: two Git diff checks lacked `.git`, and Feedback's historical `git show` assertion could not read migration history. Re-running in the actual repository resolved these environment failures; no assertions weakened.
- Full unit suite outside release gate was not additionally run; field INP, production API/CDN performance, Safari and exhaustive all-photo manual inspection not run.
- `git diff --check`: PASS before commit.
- Documentation only: report, inventory, measurements and a scoped Project Board addition. **No runtime/image safe fix had sufficient evidence to justify changing approved delivery.** Consequently no invented before/after implementation gain. No dependencies installed, full catalog regeneration, data/localization edits, asset deletions or infrastructure operations.

Existing unrelated working-tree changes remain uncommitted. Audit commit does not consolidate or approve them. Next step is owner review of these measured risks, then a narrowly authorized experiment; no PR or deployment from this task.
