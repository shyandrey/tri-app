# PERF-RELEASE-01 — Final image and bundle performance audit

Status: AUDIT COMPLETE / OWNER REVIEW. Local read-only audit of `reconcile/performance-20261110`, application HEAD `91e31f78c7a068d0138447aee528601768112352`. No optimization, runtime/data/asset/test-contract edits, push, PR, merge or deployment.

## Scope and controlled comparison

Current production build is compared against an isolated `git archive` build of immediate pre-biography HEAD `00a0488aa9b7c5af0719fcf50a87d9d72f9b681c`. Both builds ran successfully with the existing dependencies and unchanged lockfile. The archive has no `.git`, so its build metadata embeds `commit: unknown`; the current build embeds the full SHA. This accounts for the 33-byte raw entry-size difference; all measured network byte totals retain it. Source provenance is established by the archived commit, not this metadata field. The original development worktree was not used as a build target or modified. The existing reconciliation and source biographies are not regenerated.

Chrome 157, Node 24.19.0, local HTTP production-static server with gzip for JS/CSS/HTML/SVG, normal image bytes. Mobile 390×844, DPR3, CPU4×; desktop 1440×900, DPR1, CPU1×. Both use 150 ms latency, 200000 B/s down, 93750 B/s up. Browser focus emulation enabled. Deterministic scene index 3 (`Math.random=()=>0.99`, browser instrumentation only). Cache and origin storage cleared before each cold sample, fresh Chrome process per cohort. No concurrent browser cohorts. This is a constrained lab profile, not physical iPhone, Cloudflare edge or field performance.

- Passive Rankings: five mobile and three desktop cold runs per build, 12-second observation window; no interaction to terminate LCP early.
- Table visible: first animation-frame observation of a table row intersecting the viewport. Table usable: separate five-run cohort clicks Women after populated rows appear and requires selected state, nonempty active Women table and completed snap alignment. This includes the existing animation, not just event-handler registration.
- Profile navigation: separate five immediate and five delayed trials per build. Real CDP click on the first active athlete link (ID 25), either at first populated table or after 12 seconds. Latency is click → profile DOM, not profile-photo LCP. Back must return to Rankings. Full pre-click request evidence is retained, unlike the historical prefetch investigation's earliest harness.
- Six-route network inventory: cold/warm desktop and mobile samples, 14-second observation windows. Home auto-rotation is preserved; its later legitimate images are included. Initial view only, not an exhaustive scroll through 1167 profiles or every season/scene.

Historical 6.92 s LCP / ~347 kB initial JS predate lazy entry and are **not** the immediate pre-biography baseline. The prior prefetch experiment used a different pre-reconciliation snapshot; its immediate-navigation figures are context, not pooled samples. No experimental prefetch was restored.

## Repository image inventory

See the supporting inventory for byte hashes, decoded dimensions/formats, source/derivative classification and production emission. Runtime asset directories contain 735 files / 119910880 bytes; another 12 design-documentation images bring the tracked image inventory to 747 files / 120584926 bytes. Repository storage does not equal browser transfer.

| Decoded format | Files | Bytes |
|---|---:|---:|
| WebP | 495 | 18304126 |
| PNG | 240 | 101815476 |
| JPEG | 2 | 416917 |
| SVG | 10 | 48407 |
| AVIF | 0 | 0 |

Extension counts differ from encoded formats: `public/athletes/jelle-geens.png`, `public/athletes/mika-noodt.png`, and `src/assets/athletes/blummenfelt.jpg` already contain WebP bytes. Do not convert them based on extension alone. The SVG symbol sprite `public/icons.svg` has no intrinsic raster dimensions; the metadata reader's “bad dimensions” result is not evidence of a broken image. Its hash and production copy are separately checked.

- 235 source images have generated delivery variants; 478 derivatives exist (476 WebP, two PNG series badges). The generation manifest covers 223×180px, 222×396px, one 274px portrait, two 216px series badges and ten each of Home 640/1280/1672px variants.
- All 16 approved Rankings WebP scenes remain present. Portrait scenes have no width variants; landscape is selected by `<picture>` orientation. The largest is `t100_04_transition.webp`, 490150 bytes; the paired IRONMAN transition is 325420 bytes. Active-plus-adjacent portrait payload is 815570 bytes before headers. All 16 scenes total 4386018 bytes; browsers should not fetch all 16 initially.
- 223 original sources, 76345059 bytes, are still emitted into `dist` (mostly copied `public/athletes`, plus the imported original Blummenfelt URL used as a mapping key). Their presence is a packaging/storage cost, not proof of network transfer. Removing them needs archival/generator/mapping verification and is not an initial-render optimization by itself.
- Ten Home original PNGs and the two original series JPEGs are retained as derivative sources, not emitted by the current import graph. These are not useless assets.
- `src/assets/300w_5.png`, `hero.png`, `react.svg`, `vite.svg` have no current runtime source references and are absent from the production image graph. Historical photo fixtures still reference them. They are unused at runtime, not authorized for deletion.
- No byte-identical duplicate image groups found. This does not prove the absence of visually similar artwork, which can be intentional variants. No assets were removed.

## Delivery implementation and bundle cause

Home uses existing responsive WebP `srcset`/`sizes`, an eager high-priority active image and lazy low-priority neighbors with carousel availability tracking. Athlete lists use lazy images and 56/60px sizes; Rankings avatars use lazy 36px sizes; results use lazy 34px images. Athlete Profile eagerly loads its visible hero with responsive 104/112/132px sizes. These small rendered sizes must be evaluated against DPR, not CSS width alone. Lazy-loading the above-fold profile portrait would not be a safe default.

Rankings renders the active and adjacent series artwork deliberately for interactive swiping, with high/low fetch priority respectively. Orientation sources avoid downloading both responsive alternatives. It currently has no width-based image source selection, and priority does not eliminate bandwidth competition. Do not remove adjacent availability merely to improve a synthetic LCP score.

Biography import chain: `rankings-entry.ts` → `RankingsArea.tsx` → canonical `data/athletes/index.ts` → `biographies.ts` → full `athleteBiographies.json`. All 57 approved biography prefixes occur in the emitted `OfficialRankingsPage` shared chunk, before Rankings needs any biography. The eager `.map(withApprovedBiography)` materializes those fields for every canonical catalog consumer; tree shaking cannot remove that call just because the Rankings UI does not render `bio`. A `manualChunks` rename alone would retain the eager dependency and would not establish a lighter route. The JSON is 225469 bytes on disk. Both Rankings and sports entries import this shared chunk; its filename is not an accurate boundary for page-only code.

The lazy boundary still works: `loader.ts` separately imports `rankings-entry` and `sports-entry`. Rankings does not eagerly import result linkage/internal ranking initialization in `sports/data.ts`. Profile navigation still requires the deferred sports entry. No extra image bytes or new picture-selection logic were introduced by biography integration.

Bundle and measurement tables are appended after completion below.

## Recommendations and acceptance criteria

1. **P1, measured content-delivery regression:** prototype excluding full biography text from the Rankings identity/photo path. Preserve canonical IDs, Russian-name resolver, tools/audits and exact approved text. Co-load required profile content with the existing profile navigation request; avoid a second serial request after sports initialization. Do not move or rewrite generated athlete records. A separate, measured implementation task is needed.
2. **P1, remaining dominant LCP payload:** evaluate responsive width derivatives for approved Rankings artwork, preserving quality, composition, crop and immediate neighbor availability. Test DPR1/2/3, portrait/landscape and all scenes. Do not introduce the previously rejected speculative preload or delay the table to favor the artwork.
3. **P2, first-profile latency trade-off:** any biography split must measure immediate and delayed first navigation, cold and warm cache. Existing idle-prefetch experiment was rejected because earliest navigation worsened; neither hover-only prefetch nor `requestIdleCallback` alone guarantees safe bandwidth scheduling. No automatic adoption without evidence.
4. **P2, packaging:** review retained public originals and runtime-unused scaffold assets for durable archive versus deployment inclusion. Do not delete files pinned by historical photo fixtures or required by derivative generation. Expected benefit is artifact/storage reduction, not automatically LCP.
5. **Post-release:** consider additional formats or smaller avatar derivatives only after route-level byte savings and visual QA justify them. The small optimized PNG badges and already-WebP portraits do not justify blanket JPEG/PNG conversion.

For the next performance candidate, repeat this exact baseline and at least five cold runs: table-visible and table-usable medians must not regress, mobile/desktop CLS must remain zero, initial JS must decrease, and immediate/delayed profile latency must not materially worsen beyond measured run variability. Preserve meaningful navigation, source-text and data-integrity tests. Report unfavorable samples; do not hide them behind averages or a different network profile.

## Limitations

No field INP, physical-device battery/memory/scrolling study, Lighthouse score or Cloudflare compression/cache claim. CDP `ScriptDuration` is an aggregate scripting metric, not isolated parse cost; long-task excess is not Lighthouse TBT. Local `/api/*` requests return an explicit 503 stub; this audit does not validate deployed APIs or use credentials. Any observed API requests/failures are reported with route evidence rather than attributed to production. Browser images include only the sampled paths and selected scene; unvisited seasons, arbitrary long-tail profiles and alternate carousel scenes need separate coverage. Local build gzip/Brotli sizes are compression measurements; only CDP/resource timing describes these browser transfers. No image optimization or code splitting is implemented here.

## Before/after measurements

Medians; ranges in parentheses. Five mobile samples per metric/cohort, three passive desktop samples. Time in milliseconds, bytes decimal. Cold cache.

| Metric | Before biographies | With 57 biographies |
|---|---:|---:|
| Mobile LCP | 6052.0 (6040.0–6076.0) | 6328.0 (6328.0–6332.0) |
| Mobile table visible | 1658.2 (1644.8–1661.2) | 1929.8 (1925.9–1936.2) |
| Mobile table usable | 2024.9 (2015.5–2045.5) | 2286.1 (2279.7–2291.8) |
| Initial JS transferred, headers included | 188405.0 (188405.0–188405.0) | 243205.0 (243205.0–243205.0) |
| Initial JS gzip body | 187713.0 (187713.0–187713.0) | 242513.0 (242513.0–242513.0) |
| Mobile CLS | 0.0 (0.0–0.0) | 0.0 (0.0–0.0) |
| Desktop CLS | 0.0 (0.0–0.0) | 0.0 (0.0–0.0) |
| Desktop LCP (same slow network) | 5880.0 (5872.0–5880.0) | 6168.0 (6156.0–6180.0) |
| Immediate first profile click → DOM | 3919.5 (3910.9–3926.6) | 3912.8 (3911.1–3918.7) |
| Delayed first profile click → DOM | 1085.9 (1083.2–1109.1) | 1087.3 (1084.6–1094.7) |
| Mobile ScriptDuration | 88.3 (85.9–89.7) | 87.5 (85.6–90.8) |
| Mobile long-task excess over 50 ms | 0.0 (0.0–0.0) | 0.0 (0.0–0.0) |

**Confirmed cause:** shared JS bytes delay table initialization and discovery of both images. In the first current mobile sample, the shared chunk starts at 877 ms and completes at 1866 ms; images start at 1925 ms. The active IRONMAN artwork completes at 6321 ms and is LCP at 6328 ms; neighboring T100 completes at 7146 ms. The active image is 325420 body bytes, neighboring image 490150; initial priorities High/Low. Twenty low-priority 180px WebP avatars also load through native lazy-load heuristics. These are different active/neighbor content requests, not a duplicate of the same URL.

The +54772 gzip biography/shared-chunk bytes correspond to about 274 ms of idealized serialization at 200000 B/s, consistent with the measured ~272 ms table-visible and 276 ms LCP changes. This is a measured byte/timing association supported by an unchanged image tree and direct import graph; it is not a claim of a field causal estimate. ScriptDuration did not grow materially and no >50 ms main-thread task occurred in the passive samples: transfer/discovery is the confirmed bottleneck here, not a proven parsing bottleneck.

Immediate navigation remains roughly 3.9 s and starts while critical artwork is in flight; delayed navigation remains roughly 1.1 s. This is consistent with bandwidth contention with deferred sports loading; no scheduler trace isolates its exact causal share. The request records retain the deferred sports request and all earlier image requests. The shared biography data is already loaded before the click, so it adds no new biography request during the current transition. Moving it out can save Rankings bytes but put them on the Profile path. Any future split must request biography content in parallel with sports navigation rather than introduce a serial post-mount waterfall. A latency guarantee cannot be inferred from gzip savings alone.

## Production bundle sizes

Computed with Node zlib gzip defaults and Brotli defaults; raw/minified bytes are not transferred as raw in this test. Brotli was measured offline, **not** served by the lab server.

| Output | Before raw / gzip / Brotli | Current raw / gzip / Brotli |
|---|---:|---:|
| index-*.js | 277600 / 83382 / 71070 | 277633 / 83412 / 71012 |
| OfficialRankingsPage-*.js | 682451 / 104059 / 72883 | 905812 / 158831 / 114763 |
| rankings-entry-*.js | 393 / 272 / 229 | 393 / 270 / 229 |
| sports-entry-*.js | 623413 / 164274 / 114698 | 623396 / 164263 / 114685 |
| Total .js | 1583857 / 351987 / 258880 | 1807234 / 406776 / 300689 |
| Total .css | 79797 / 16760 / 14486 | 79797 / 16760 / 14486 |

Entry index dynamically imports Rankings or sports entry. Each entry statically imports the shared `OfficialRankingsPage` chunk and the main index; the shared chunk imports the main index. Rankings initial navigation requests entry + tiny rankings-entry + shared chunk, **not** sports-entry. The sports entry contains other sports views, results and ranking initialization, and appears only when navigating to Profile in these cohorts. The biography increase is not an embedded-image regression. The historical “sports chunk ~1.295 MB” is not the current emitted graph: now the two large shared/deferred scripts total ~1.53 MB raw, while their loading paths differ. The build still warns about chunks over 500 kB; that warning alone is not a runtime diagnosis.

## Evidence and reproducibility

- [Full image inventory](perf-release-01/image-inventory.csv), [bundle sizes and imports](perf-release-01/bundles.json), [environment](perf-release-01/environment.json).
- [Before passive](perf-release-01/before-measure.json), [current passive](perf-release-01/after-measure.json), [summary statistics](perf-release-01/summary.json).
- [Before table usability](perf-release-01/before-usability.json), [current table usability](perf-release-01/after-usability.json).
- [Before first navigation](perf-release-01/before-profile-profile.json), [current first navigation](perf-release-01/after-profile-profile.json).
- [Raw route network/rendered-image evidence](perf-release-01/browser.json), [route summary](perf-release-01/network-summary.json).
- [Harness and reproduction notes](perf-release-01/README.md), [current build log](perf-release-01/current-build.txt), [baseline build log](perf-release-01/baseline-build.txt).

Image source trees are byte-identical between the two application commits (`git diff 00a0488 91e31f7 -- src/assets public` is empty). The current task changes only this report and supporting text/measurement artifacts. It does not implement any recommendation or modify the Project Board outside the requested report-only commit scope.

## Six-route browser network results

One cold and one warm observation per route/device, 14 seconds each; **not** five-run route medians. Counts are image request events including cache-served favicon events. Byte totals are CDP response transfer including headers; complete requests only (none unfinished at cutoff). Warm image transfer was **0 bytes for all 12 warm observations**.

| Device / route | Cold image events | Cold image transfer B | Total cold transfer B | Cold JS transfer B | Formats received |
|---|---:|---:|---:|---:|---|
| mobile / home | 5 | 604653 | 700869 | 83643 | png, svg, webp |
| mobile / athletes | 21 | 186291 | 611442 | 407201 | svg, webp |
| mobile / athlete/1 | 4 | 24512 | 449663 | 407201 | svg, webp |
| mobile / calendar | 2 | 20056 | 116080 | 83643 | png, svg |
| mobile / race/ironman-70-3-oceanside-2026 | 24 | 186517 | 611668 | 407201 | svg, webp |
| mobile / rankings | 23 | 998485 | 1256802 | 243205 | svg, webp |
| desktop / home | 5 | 604653 | 700869 | 83643 | png, svg, webp |
| desktop / athletes | 16 | 142561 | 567712 | 407201 | svg, webp |
| desktop / athlete/1 | 3 | 9417 | 434568 | 407201 | svg, webp |
| desktop / calendar | 2 | 20056 | 116080 | 83643 | png, svg |
| desktop / race/ironman-70-3-oceanside-2026 | 23 | 186517 | 611668 | 407201 | svg, webp |
| desktop / rankings | 23 | 808089 | 1066406 | 243205 | svg, webp |

| Mobile route | Largest actual image request (wire bytes) | Initial CDP priority | Ready / LCP ms |
|---|---|---|---:|
| home | `qatar-lusail-sunset-1280-12UZcnYt.webp` (213359) | Low | 920 / 2940 |
| athletes | `kate-waugh-180-C8pKLLNS.webp` (11588) | Low | 2876 / 2884 |
| athlete/1 | `blummenfelt-396-bY4AHRcR.webp` (22794) | Low | 2820 / 2832 |
| calendar | `t100-worldtour-216-CrYqB7Y1.png` (18338) | Low | 871 / 916 |
| race/ironman-70-3-oceanside-2026 | `cameron-wurf-180-BEkZFM0y.webp` (10648) | Low | 2820 / 2832 |
| rankings | `t100_04_transition.webp` (490353) | Low | 1929 / 6328 |

**Actual formats:** WebP artwork and portraits, PNG series badges, SVG favicon. No JPEG/AVIF body transferred on the sampled paths. Optimized WebP variants are actually requested, not merely present in source. Profile ID 1 selects the 396px WebP on DPR3 mobile (22794 wire bytes) and the 180px WebP on DPR1 desktop (7699 wire bytes). No original multi-megabyte photo or Home PNG was downloaded. The image optimization remains effective; no direct numerical comparison to the old “9.59 → 0.43 MB” Home snapshot is valid with different scenes, DPR and auto-rotation window. Current Home's three 1280px WebP scenes account for 584597 wire bytes during the 14-second auto-rotation window; its largest is Qatar (213359 bytes).

**Requests versus transfers:** no repeated network transfer of the same image URL within any sampled document. Profile/Race cold documents recorded two or three favicon request events, with only the first transferring bytes; cache hits are not counted as duplicate payload. No failed image request, incomplete request at cutoff, uncaught browser error or horizontal overflow. The sole non-2xx request is `/api/news` in each Home cold/warm observation (4 × intentional local 503); `LatestNews` starts with verified seed text and catches the failed refresh. It does not request remote news images. This does not validate real API latency, refreshed-news layout or infrastructure availability.

**Responsive/priority checks:** cold mobile Rankings downloads exactly the two portrait artwork URLs; desktop downloads exactly their landscape counterparts. No simultaneous portrait/landscape image transfers occur. Active artwork starts High priority, adjacent artwork Low; native lazy avatars start Low. Home's active Dubai image starts High and later/adjacent scenes Low. Profile hero uses eager default loading and initially Low CDP priority; browser final reprioritization is not recorded, so initial priority is not claimed as its final scheduling state. Existing responsive sources reserve dimensions; all 24 route observations have CLS 0.

**Remaining source-size opportunities:** 180px is the smallest athlete derivative. At mobile DPR3 it fits 56px list slots closely, but exceeds 34–36px result/Rankings slots; at desktop DPR1 it is 3× a 60px list slot and approximately 5× a 34–36px table slot. A smaller thumbnail tier could reduce bytes, with savings unmeasured until generated and visually checked. The 216px T100 badge is displayed at 58px in desktop cards but costs only one shared 18338-byte request despite repeated cards. No blanket conversion is warranted. The largest actual image issue remains paired Rankings artwork (~816 kB portrait, ~626 kB landscape including headers), already WebP but lacking width-based alternatives. New derivatives must preserve approved crop/composition and adjacent-slide readiness, using retained approved sources where available; no destructive re-encoding is proposed.

## Verification and release decision

- Current and archived baseline production builds: PASS; known >500 kB chunk warning, no new build error.
- Existing `node --test scripts/test-image-delivery.mjs scripts/test-sports-loader.mjs scripts/test-rankings-route.mjs`: **5/5 PASS** after browser collection. All derivative dimensions/alpha/aspect validated, canonical photo resolution retained, lazy resources share initialization, all catalog/results/ranking outputs preserved, Rankings markup unchanged. [Actual test log](perf-release-01/tests.txt).
- 16 passive, 10 usability, 20 first-navigation and 24 route network observations completed with no measurement retry or failed cohort. No application assertions were removed or weakened. No full regeneration test, full release gate or full lint rerun was needed for report-only changes; earlier integration results are not presented as newly executed checks.
- `git diff --check`, documentation relative-link checks and measurement sample-count/response consistency checks: PASS. No application, image, athlete data or test-contract changes.

**Release finding:** a measurable ~0.27 s Rankings cold-start regression from eager biographies is confirmed, with slow-network artwork LCP still ~6.33 s. There is no confirmed broken image, new CLS regression or first-profile latency regression in these samples. These are performance risks requiring owner prioritization/acceptance, not an invented functional release blocker. Recommended next task: a narrow biography-delivery experiment with paired first-profile measurements, followed by responsive artwork/thumbnail evaluation. Do not resurrect the rejected preload/prefetch approach or ship a split merely because its chunk warning is smaller.

Audit is local only. No push, PR, merge, Preview/Production deployment, credentials, D1 operation, full catalog regeneration or original-worktree modification. Stop for owner review.
