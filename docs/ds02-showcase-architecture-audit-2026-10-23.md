# DS-02 — Showcase architecture audit · 2026-10-23

Status: AUDIT COMPLETE / specifications DRAFT, awaiting owner review. Read-only inspection of current local implementation; no component or artwork changes. [Draft requirements](ds02-showcase-guidelines-draft.md).

## Implementation inventory (verified source facts)

| Type | Component / source | Portrait geometry | Landscape geometry | Overlays / safe zones | Delivery |
|---|---|---|---|---|---|
| Home race carousel | [HomeShowcase.tsx](../src/components/HomeShowcase.tsx), [HomeShowcase.css](../src/components/HomeShowcase.css), [home-refinements.css](../src/home-refinements.css) | Card spans content width; min-height 230px at ≤640px, otherwise 245px. No fixed container ratio. Radius 20/22px. | Same width-based rules; no orientation-specific artwork selector. Do NOT adopt Rankings ratio. | Two dark gradient layers; bottom-left title/tags/date/location; bottom-right circular open button. | `<img srcSet>` 640/1280/1672 WebP, `sizes`, center/cover. |
| Official Rankings | [OfficialRankingsPage.tsx](../src/pages/OfficialRankingsPage.tsx), [CSS](../src/pages/OfficialRankingsPage.css), [mapping](../src/pages/rankingsShowcase.ts) | Full viewport width; h = width / 2.35 + top insets. Portrait ≥1024px: h=320px, centered contain artwork. | h = width / 5.5 + top insets. Cover/focal points, except approved T100 Cycling 2078×378 uses contain to preserve entire pre-cropped composition. | Standard Back at upper right; embedded branding/athletes in art. No blur/fade, no runtime text overlay except Back. Indicators and controls below art. | `<picture>` landscape source selected by `(orientation: landscape)`; portrait source fallback; both WebP. Two neighboring series images for one selected scene. |
| Race catalog / Home compact cards | [RaceCard.tsx](../src/components/RaceCard.tsx) | Content card with series logo; not a photographic showcase. | Same content component. | Text metadata and gender symbols. | Local optimized series PNG; not a dual-orientation hero. |
| Race results/detail | [RaceDetailPage.tsx](../src/pages/RaceDetailPage.tsx) | No independent photographic showcase in current component. | No separate showcase. | Standard Back and race metadata/results. | No additional showcase pipeline to standardize. |
| Shared gesture track | [RankingsSwipeTrack.tsx](../src/components/RankingsSwipeTrack.tsx) | Layout supplied by parent. | Same. | No image or branding logic. | Reusable native scroll/snap/pointer track, not a general artwork component. Home has separate native scroll implementation. |

No other photographic showcase component found in current runtime source. Athlete portraits and Home brand/logo header are separate image roles, not governed by a generic hero ratio.

## Browser measurements (observed, NOT proposed specifications)

Local built RANK-06 on Chromium, DPR 1, zero emulated safe-area insets, reduced motion. Actual DOM bounding boxes; 2026 content at time of audit. Home content is variable and these heights are not a guarantee for future longer text. Raw evidence: `/tmp/300w-rank07/measurements.json`.

| Viewport | Home card W×H (px) | Home ratio | Rankings W×H (px) | Rankings ratio |
|---|---:|---:|---:|---:|
| 320×700 | 296.00×230.00 | 1.287 | 320.00×136.16 | 2.350 |
| 375×812 | 351.00×230.00 | 1.526 | 375.00×159.56 | 2.350 |
| 390×844 | 366.00×230.00 | 1.591 | 390.00×165.95 | 2.350 |
| 440×956 | 416.00×230.00 | 1.809 | 440.00×187.22 | 2.350 |
| 667×375 | 627.00×245.00 | 2.559 | 667.00×121.27 | 5.500 |
| 844×390 | 804.00×245.00 | 3.282 | 844.00×153.45 | 5.500 |
| 956×440 | 916.00×245.00 | 3.739 | 956.00×173.81 | 5.500 |
| 1200×1600 | 1086.00×245.00 | 4.433 | 1200.00×320.00 | 3.750 |

## Safe areas and composition

Verified CSS, not an artwork-safe-zone specification:

- Home content offsets: left 16px / right 68px / bottom 16px at ≤640px; otherwise 18 / 74 / 18px. Open button: 42px at right 14 / bottom 16px, or 46px at right 16 / bottom 18px. Border contributes to measured offsets. Text height depends on name, localization and tags. Reserve the actual text rectangle, not only a fixed bottom strip.
- Rankings height includes `max(env(safe-area-inset-top), --tg-safe-area-inset-top)` plus `--tg-content-safe-area-inset-top`. The common Back rules add top/right offsets; zero-inset measurement places it at y=12px for widths ≤640px and y=20px above that breakpoint. Insets can change effective image ratio. Landscape content gutters account for left/right safe areas. The 1024px portrait override is a distinct case, not a 2.35:1 container.
- Current art/focal positions are in rankingsShowcase.ts. Final cropping was already owner-approved. Audit does not authorize new crops or moving the Back button.
- DS-02 must verify logos, athletes, bicycles/wheels and key geography against real overlay rectangles, dynamic text and Telegram/iOS insets. Numeric safe-zone margins remain a proposal pending owner review; existing offsets are observations only.

## Assets, naming and loading

Home: [showcaseImages.ts](../src/data/showcaseImages.ts) maps raceId to scene keys. Source PNGs under `src/assets/showcase/<race>/`; derivatives under `src/assets/optimized/showcase/<scene>-{640,1280,1672}.webp`. [Generated variants](../src/generated/showcaseImageVariants.ts) use `?no-inline`, generated by [generate-image-variants.mjs](../scripts/generate-image-variants.mjs). Width/height hints are 1672×941 but do not set container ratio. Images for current/next cards are initially eligible; IntersectionObserver with ±100% horizontal margin adds neighbors. Browser lazy loading and responsive srcset determine actual requests. Active image high priority, others low. 4s autoplay pauses 7s on manual input; reduced motion disables autoplay. Image choice is randomized once per race per component memo.

Rankings: originals `public/images/showcase/rankings/*.png`; current portrait derivatives `public/images/showcase/rankings/optimized/*.webp` plus manifest. Source dimensions 1983×793 (first three IRONMAN), otherwise 1671/1672×941; source ratios differ from rendered 2.35:1. Landscape package `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/{originals,optimized}/`; mapping identifies the eight active files, including `t100_cycling_final.webp`. Other package files are retained rollback/evidence, not active assets. No auto-rotation. Two series panels share a scene index; active high priority, neighboring low priority. No img.src fallback that would fetch both orientations. No separate preload link. Each table track is independent (12px gap); showcase gap is zero.

Rankings `::before` fallback declarations are historical CSS; the later `display:none` rule disables that layer. Do not describe it as an active blurred backdrop.

Caching is browser/server controlled, not guaranteed by component code. Home Vite imports yield hashed asset names; Rankings public URLs are un-hashed stable paths. Preview RANK-05C measurements: initial pair 488,362–816,170 B; series switching adds zero requests; warm reload may revalidate (~600 B/pair). Orientation return occasionally revalidates without full image-body transfer. These are prior measurements, not new infrastructure verification. No new remote requests in this audit.

## Performance and unresolved design questions

RANK-05B: 18,213,627 → 2,460,616 B total portrait payload (−86.5%); original PNG retained. No image bytes embedded into JS. Existing ~1.295 MB minified sports chunk warning remains; do not attribute it to artwork without bundle analysis. PERF-01 owns pre-production investigation.

Home `sizes` still includes `max(410px, ...)` at ≤640px although measured cards can be narrower; flag as a future responsive-image sizing audit candidate, not an implemented fix or proven over-fetch defect. Home has no separately approved landscape source set; extending dual-format guidance to it requires a separately scoped migration. Future source pixel dimensions depend on target container, DPR and measured quality; no universal file-size cap is finalized here.

Existing RaceDetailPage `activeYearEditionIds` / useMemo dependency warning is present in the latest RANK-06 lint log; no refactor in this task.
