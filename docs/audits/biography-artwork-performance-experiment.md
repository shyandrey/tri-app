# Biography loading and Rankings artwork experiment

Date: 2026-11-10. Application baseline: `92ad43414adc1792fc6048ac4f8509f5eca17967`. Working branch: `reconcile/performance-20261110`. The later `c6b6fee` achievement research commit changes documentation only; `git diff 92ad434 HEAD -- src public scripts package.json package-lock.json` was empty before this experiment.

## Isolation and causes

Three `git archive` copies in `/private/tmp/300w-bio-art-experiment-20261110`: `baseline`, `bio`, `art`. All reuse existing dependencies without installation. Their generated build metadata says `commit: unknown` because the copies have no `.git`; all three use the same source/export policy. This differs from the historical report's committed-current build by a few metadata bytes; do not interpret those bytes as optimization. The original development worktree is not a build or edit target. Local PNG sources were read but never changed.

The canonical athlete index maps every athlete through `withApprovedBiography`, importing the entire 57-entry JSON. Rankings only needs identity/name/photo metadata, but importing that index pulls the full prose into its initial shared chunk. Renaming chunks does not remove this dependency.

**Biography candidate B:** move the existing identity/photo/localization/PTO assembly unchanged to `identities.ts`; keep the canonical full `index.ts` as the same identity list mapped through the existing biography overlay. Only `RankingsArea` and `rankings-entry` use the light identity list. Profile continues receiving the full catalog through the existing lazy sports entry, without partial biography rendering or a serial fetch after profile appearance. No biography registry, result, mapping, achievement or profile design changes. This moves bytes to first sports navigation; it does not magically eliminate them. It also does not yet make every non-Profile sports route biography-free.

**Artwork candidate A:** two additional 1320px derivatives of the *currently served* transition WebP images. Existing Sharp (already available through the toolchain), WebP quality 85 / AVIF quality 65, effort 6. No new dependency. `<picture>` chooses AVIF with a WebP fallback only in portrait at <=440 CSS px; unchanged original sources remain for landscape, wider portrait and other scenes. 1320px provides 3 physical pixels per CSS pixel at 440px and >3 at 390px. This does not establish quality for >3 DPR devices; such devices remain a manual review limitation.

The loose PNG files in the original worktree are **not equivalent visual sources** to current WebP delivery. Comparison showed different athlete/branding details. Their derivatives were excluded before browser qualification. They were not copied into runtime. Final variants were encoded from the approved current WebP bytes, explicitly a lossy-to-lossy experiment; preserved sources permit rollback.

## Measurement protocol

Reuse the previous audit's CDP harness: Chrome 157, mobile 390×844 DPR3 CPU4×; desktop 1440×900 DPR1 CPU1×; 150ms latency, 200000 B/s download, 93750 B/s upload. Local production static server gzips JS/CSS/HTML, serves actual image bytes, returns 503 for local API stubs. Scene fixed to transition by browser-only `Math.random` override. Fresh browser/profile per cohort, cold cache/origin storage per trial, no concurrent browser cohorts or builds during timing measurements. Five cold mobile passive, five table-usability, five immediate and five delayed navigation trials per candidate; three desktop passive trials. Retain every sample, including the slower first baseline trial.

LCP: passive 12-second window. Table visible: first viewport-intersecting row. Usable: completed actual Women switch with populated rows and settled snap, a separate cohort. Immediate profile click: first populated table; delayed click: after 12 seconds. Profile endpoint: profile DOM including synchronously available biography data, then Back must return to Rankings. This is not profile-photo LCP. CLS excludes recent-input shifts as in the prior audit; not a physical-device or field INP claim.

Before candidate results, a >=50ms median increase in either profile navigation cohort was designated material. Table timestamps must show no repeatable regression; sub-frame scatter is reported rather than hidden. Zero measured CLS, exact biography/data preservation and passing regression checks remain mandatory. An LCP-only win cannot override these checks.

## Results and decision

The biography candidate is **REJECT**: both first-navigation timings materially regress. The artwork candidate is **ACCEPT for local integration**: timing/CLS, visual checks and regression qualification pass. Physical-device owner review remains outstanding. No biography-loading runtime changes are adopted.

All times below are milliseconds; medians of five cold samples. Desktop CLS has three samples per build. Complete samples/ranges are retained in [summary.json](biography-artwork-experiment/summary.json), not replaced by rounded display values.

| Metric | Fresh baseline | Biography B | Artwork A |
|---|---:|---:|---:|
| Mobile LCP | 6328.0 | 6048.0 | 4136.0 |
| Table visible | 1930.1 | 1647.7 | 1932.8 |
| Table usable | 2285.9 | 2041.9 | 2291.0 |
| Initial JS transfer, B | 243175.0 | 188408.0 | 243289.0 |
| Immediate Profile navigation | 3922.7 | 4753.1 | 3305.1 |
| Delayed Profile navigation | 1088.7 | 1371.2 | 1094.3 |
| Mobile CLS | 0.0 | 0.0 | 0.0 |
| Desktop CLS | 0.0 | 0.0 | 0.0 |

The historical baseline supplied in the task (6328 / 1930 / 2286 ms, 243205 JS bytes, 3913 / 1087 ms navigation) is reproduced closely. The fresh baseline includes one slower first passive sample (6772 ms LCP / 2368.8 ms table visible); it is retained. All other passive mobile baseline LCP samples were 6324–6332 ms. No failed timing cohort was retried.

B removes **54767 transferred JS bytes** from initial Rankings but adds **830.4 ms** to immediate Profile navigation and **282.5 ms** to delayed navigation. Its 280 ms LCP improvement and 244 ms usability improvement do not satisfy the acceptance policy. The deferred sports bundle now carries the registry, delaying profile arrival and competing with in-flight artwork on an immediate click. No idle prefetch or speculative preload is adopted.

A improves LCP by **2192 ms (34.6%)** and immediate Profile navigation by **617.6 ms (15.7%)**. Delayed navigation differs by +5.6 ms (ranges 1090.1–1110.3 versus 1087.1–1091.8), below the predeclared 50ms material threshold. Initial JS increases by **114 bytes (0.047%)** for the conditional picture sources; this is disclosed, not described as a JS reduction.

The initial A table-visible/usability medians differ by +2.7/+5.1 ms, less than a display frame, with overlapping usability ranges (A 2269.2–2311.9; baseline 2283.6–2311.4). Because table usability has priority, a separate bounded **five-per-build interleaved** cold check was run rather than silently ignoring the difference. Alternating AB/BA pairs reset cache/storage each time. Its results:

| Paired check | Baseline median | Artwork median |
|---|---:|---:|
| Table visible | 1935.1 | 1927.5 |
| Table usable | 2299.9 | 2291.1 |

The sign of the tiny difference reverses; no repeatable table regression is resolved by these samples. This is not a claim of mathematically identical execution time or a high-powered field study. Primary and additional cohorts remain separate; unfavorable primary values are not removed. Every passive mobile and desktop sample has CLS 0.

## Artwork bytes and quality

| Portrait transition | Existing WebP | 1320px WebP q85 | 1320px AVIF q65 |
|---|---:|---:|---:|
| IRONMAN | 325420 B | 155524 B | 105152 B |
| T100 | 490150 B | 207858 B | 146600 B |
| Pair | 815570 B | 363382 B | 251752 B |

AVIF saves **563818 bytes / 69.1%** for the pair; WebP fallback saves **452188 bytes / 55.4%**. These are file/body bytes, not response headers. The measured Chrome candidate actually requests AVIF. WebP was evaluated as its fallback/encoding alternative, not as a separate five-run performance cohort; do not claim the AVIF timings for WebP-only browsers.

[Visual comparison gallery](biography-artwork-experiment/gallery.html): current source, compact WebP and compact AVIF at the same cover crop. Source dimensions 1671×941; derivatives 1320×743, proportional integer rounding, no new crop or composition. Lettering, silhouettes and focal positioning remain visually acceptable at normal 390/440 CSS-pixel mobile sizes. Fine texture differs at pixel magnification due to lossy recompression; no pixel-identical-quality claim. Wider/landscape delivery stays byte-identical.

The reviewed loose PNG hashes/sizes are in [excluded-source provenance](biography-artwork-experiment/image-variants.json); final served-WebP provenance is in [current-source derivatives](biography-artwork-experiment/image-variants-current.json). The generator guards the two existing source SHA-256 values and never overwrites them. New derivative bytes/dimensions are pinned separately, preserving all 16 existing artwork hash assertions.

## Qualification

- Baseline, B and A production builds: PASS; known sports chunk warning remains.
- A isolated release gate: **18/18 PASS**, including build and lint; zero audit issues reported. No full catalog regeneration invoked.
- Targeted approved-biography, Rankings-route, sports-loader and image-delivery tests: **11/11 PASS on B; 11/11 PASS on A**. B lint also PASS.
- Full canonical catalog comparison: **1167/1167 byte-equivalent serialized athlete records** in baseline/B/A, including biography text, metadata and achievements. All 57 approved Markdown source files and all existing data/source artwork remain byte-identical.
- Official Rankings: **14 viewport/theme scenarios PASS**; season selection, rendered standings and navigation preserved.
- Rankings swipe: **14 viewport/theme scenarios PASS**, including touch/mouse, rollback, vertical scrolling, athlete links, season controls and document-scoped network assertions.
- Showcase: **16 viewport/theme combinations × 8 mapped scenes PASS**, with all 16 original asset hashes retained and four derivative hashes added.
- Navigation: **10 scenarios PASS**. Approved-biography browser suite: **57 mobile profiles + 6 desktop profiles PASS**, exact paragraph checks and no overflow.
- Additional comparison harness: **24 captures PASS**, including 390/440 DPR3, two landscape sizes, desktop and wider portrait. Disabling AVIF in Chrome selects exactly two compact WebP requests; original wider/landscape selection verified. [Captured network state](biography-artwork-experiment/visual.json).
- The first supplemental screenshot harness failed because it used an incorrect T100 aria-label selector. That failed log is retained; only the helper selector was corrected. Its clean-profile rerun passed. This was not a runtime failure or a retry of a failing performance sample/regression suite.
- Derivative regeneration using the checked-in generator reproduced all four pinned hashes. No dependency installation, catalog regeneration, speculative preload or data edits.
- Final `git diff --check`: PASS. Local report/gallery links verified. Full release gate was run against an isolated Git worktree containing the exact accepted candidate; it is not claimed as an additional run in the delivery worktree.

## Delivered changes and evidence

Only two runtime files change: `src/pages/OfficialRankingsPage.tsx` and `src/pages/rankingsShowcase.ts`. Four compact images are added, alongside the source-hash-guarded generator, derivative fixture and two adapted browser tests. Original assets remain unchanged. Project Board and this report record the decision. [Exact candidate paths and hashes](biography-artwork-experiment/candidate-files.json) include the rejected B candidate separately; B is retained only as an audit patch, never active runtime.

[Evidence README](biography-artwork-experiment/README.md) describes commands, logs, raw samples, patch reproduction and screenshots. Committed screenshots are CSS-resolution WebP review copies; full-resolution originals remain in the isolated evidence directory. No commit/push/deployment of the rejected candidate.

## Remaining limits and next action

No physical iPhone/Safari/Telegram QA, field INP, battery cost or production/CDN measurement. Retina review covers DPR3 at <=440px; >3 DPR quality remains unqualified. Browser screenshots/format fallback do not replace owner device review. Small n and local CDP throttling limit absolute timing claims. Existing large sports chunk remains unchanged; this task does not solve all first-profile loading costs.

For biographies, the next distinct experiment should evaluate per-athlete delivery derived from the unchanged curated registry, coordinated with profile navigation, rather than shifting the full registry into another eager chunk. It must measure the same immediate/delayed paths and preserve exact text. No such architecture is included here.
