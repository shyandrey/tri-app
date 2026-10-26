# DS-02A — Showcase Technical Templates

2026-10-25 · **DRAFT / AWAITING OWNER REVIEW** · documentation and audit only.

References: [DS-02 architecture audit](ds02-showcase-architecture-audit-2026-10-23.md), [guidelines draft](ds02-showcase-guidelines-draft.md), [Rankings closure](official-rankings-ui-2026-10-22.md), [Project Board](PROJECT_BOARD.md). Current source inspected: HomeShowcase.tsx/CSS, home-refinements.css, OfficialRankingsPage.tsx/CSS, rankingsShowcase.ts, generated showcase variants and image generator. No application, mapping or artwork modifications.

## 1. Evidence classes

**M = measured:** local built RANK-06, Chromium, CSS pixels, DPR 1, eight requested viewports, zero hardware insets, reduced-motion to suppress Home autoplay. 19 scenarios include three synthetic Telegram top-inset tests. Encoded WebP dimensions read from file headers. `naturalWidth` with srcset may be density-corrected; it is NOT treated as the encoded file width. [Raw DOM geometry](design/showcase-templates/geometry-measurements.json) includes image URLs, encoded pixels, every text overlay rectangle and source crop.

**C = CSS-derived:** source formulas, cover/contain math, media queries, loading policy. **P = proposed:** production dimensions, DPR assumptions, safe margins and byte budgets below. P values are review starting points, not approved limits. No physical iPhone safe-area measurement or new remote performance audit was performed.

## 2. Actual container geometry (M)

All measured containers have internal padding `0 / 0 / 0 / 0`. Home has a 1px border, making its image box 2px smaller on both axes; textual offsets are absolute-positioned overlays, not container padding. Rankings has no border or corner radius. Ratios include the complete outer container.

| Viewport | Home W×H | Ratio | Radius | Rankings W×H | Ratio | Radius |
|---|---:|---:|---:|---:|---:|---:|
| 320×700 | 296.00×230.00 | 1.287 | 20px | 320.00×136.16 | 2.350 | 0px |
| 375×812 | 351.00×230.00 | 1.526 | 20px | 375.00×159.56 | 2.350 | 0px |
| 390×844 | 366.00×230.00 | 1.591 | 20px | 390.00×165.95 | 2.350 | 0px |
| 440×956 | 416.00×230.00 | 1.809 | 20px | 440.00×187.22 | 2.350 | 0px |
| 667×375 | 627.00×245.00 | 2.559 | 22px | 667.00×121.27 | 5.500 | 0px |
| 844×390 | 804.00×245.00 | 3.282 | 22px | 844.00×153.45 | 5.500 | 0px |
| 956×440 | 916.00×245.00 | 3.739 | 22px | 956.00×173.81 | 5.500 | 0px |
| 1200×1600 | 1086.00×245.00 | 4.433 | 22px | 1200.00×320.00 | 3.750 | 0px |

## 3. Actual image boxes and crop (M + mechanical derivation)

Representative visible first image at capture; selected scenes can differ across rows. Exact source URL and second neighboring series image are retained in JSON. Home source is width-selected by srcset; there is no separate orientation image. Crop values below are percentages of encoded source. Top-left crop origin is `(x%, y%)`; retained width/height are not output dimensions. No images were cropped by this audit.

| Surface / viewport | Image box CSS W×H | Encoded source W×H | Fit / position | Crop origin % | Retained W×H % |
|---|---:|---:|---|---:|---:|
| home 320×700 | 294.00×228.00 | 640×360 | cover / 50% 50% | 13.7, 0.0 | 72.5×100.0 |
| rankings 320×700 | 320.00×136.16 | 1983×793 | cover / 50% 45% | 3.0, 0.0 | 94.0×100.0 |
| home 375×812 | 349.00×228.00 | 640×360 | cover / 50% 50% | 6.9, 0.0 | 86.1×100.0 |
| rankings 375×812 | 375.00×159.56 | 1983×793 | cover / 50% 48% | 3.0, 0.0 | 94.0×100.0 |
| home 390×844 | 364.00×228.00 | 640×360 | cover / 50% 50% | 5.1, 0.0 | 89.8×100.0 |
| rankings 390×844 | 390.00×165.95 | 1983×793 | cover / 50% 40% | 3.0, 0.0 | 94.0×100.0 |
| home 440×956 | 414.00×228.00 | 640×360 | cover / 50% 50% | 0.0, 1.0 | 100.0×97.9 |
| rankings 440×956 | 440.00×187.22 | 1983×793 | cover / 50% 48% | 3.0, 0.0 | 94.0×100.0 |
| home 667×375 | 625.00×243.00 | 640×360 | cover / 50% 50% | 0.0, 15.4 | 100.0×69.1 |
| rankings 667×375 | 667.00×121.27 | 1947×808 | cover / 50% 52% | 0.0, 29.2 | 100.0×43.8 |
| home 844×390 | 802.00×243.00 | 1280×720 | cover / 50% 50% | 0.0, 23.1 | 100.0×53.9 |
| rankings 844×390 | 844.00×153.45 | 1947×808 | cover / 50% 58% | 0.0, 32.6 | 100.0×43.8 |
| home 956×440 | 914.00×243.00 | 1280×720 | cover / 50% 50% | 0.0, 26.4 | 100.0×47.3 |
| rankings 956×440 | 956.00×173.81 | 1947×808 | cover / 50% 60% | 0.0, 33.7 | 100.0×43.8 |
| home 1200×1600 | 1084.00×243.00 | 1280×720 | cover / 50% 50% | 0.0, 30.1 | 100.0×39.9 |
| rankings 1200×1600 | 800.19×320.00 | 1983×793 | contain / 50% 50% | 0.0, 0.0 | 100.0×100.0 |

Crop calculation (C): scale `s=max(boxW/sourceW, boxH/sourceH)` for cover, min for contain. Offsets `(boxW-s×sourceW)×positionX`, analogous for Y. Inverse-project the box into the source and clamp to source bounds. Border rounding is separate. This verifies crop mathematically; it does not recognize bodies, wheels or logos.

## 4. Breakpoints, overlays and safe areas (C/M)

Home: ≤640px card min-height 230px/radius20; >640px min-height245/radius22. Content width is viewport minus gutters (24px mobile / 40px larger), capped by the shell (1086px in the tablet measurement). There is no CSS fixed ratio or orientation-specific asset mapping. Content left/right/bottom =16/68/16px compact, 18/74/18px otherwise. Text includes eyebrow, tags/series/gender, localized race title, date and location. Open button is 42px at right14/bottom16 compact, otherwise46px at right16/bottom18. Text height varies; measure the actual longest supported labels. Two existing dark gradient layers remain part of Home; Rankings' no-fade approval does not apply to Home.

Rankings: portrait width/2.35 plus `max(env(safe-area-inset-top), --tg-safe-area-inset-top)` plus `--tg-content-safe-area-inset-top`; landscape width/5.5 plus the same additions. Portrait ≥1024px overrides height to320px and centers contain art at width `min(100%, 320×asset.aspectRatio)`. This is not a 2.35:1 full-width tablet image; side space is intentional. Current T100 Cycling landscape uses contain, others cover/focal positions. Back top is12px at width≤640,20px above, plus insets; its width/font can vary. Portrait/landscape image positions come from rankingsShowcase.ts; do not replace them with a generic focal point.

Landscape content gutters (controls/table) use max(page gutter, left/right env safe area). They do not inset the full-width image or automatically guarantee a logo safe zone. The current upper-right Back button must stay where it is. Branding is embedded in artwork; no universal logo rectangle exists. Mark each logo's bounding box in the delivery, then validate it against crop and Back overlays.

### Synthetic inset stress (M, not a specific iPhone profile)

Injected only into the local browser DOM: top24px + content-top32px. Original source files untouched.

| Viewport | Zero-inset h | Stress h | Back y: zero → stress |
|---|---:|---:|---:|
| 390×844 | 165.95 | 221.95 | 12 → 68 |
| 956×440 | 173.81 | 229.81 | 20 → 68 |
| 1200×1600 | 320.00 | 320.00 | 20 → 68 |

Tablet height remains320px while Back moves downward. On phones the taller frame changes cover crop; adding a top 'safe strip' to the artwork alone cannot guarantee safety. Actual notch/Telegram left/right/bottom insets, DPR and text scaling require physical-device review. Never label the synthetic values as Apple's device specifications.

## 5. Visual safe-zone templates

[Gallery](design/showcase-templates/index.html). Each diagram has SVG and matching PNG, generated as technical vectors, not artwork:

- [Home portrait](design/showcase-templates/home-portrait.svg) / [PNG](design/showcase-templates/home-portrait.png)
- [Home landscape](design/showcase-templates/home-landscape.svg) / [PNG](design/showcase-templates/home-landscape.png)
- [Rankings portrait](design/showcase-templates/rankings-portrait.svg) / [PNG](design/showcase-templates/rankings-portrait.png)
- [Rankings landscape](design/showcase-templates/rankings-landscape.svg) / [PNG](design/showcase-templates/rankings-landscape.png)
- [Responsive crop envelopes](design/showcase-templates/responsive-crops.svg) / [PNG](design/showcase-templates/responsive-crops.png)
- [Safe-area stress](design/showcase-templates/safe-area-stress.svg) / [PNG](design/showcase-templates/safe-area-stress.png)

Gray = full source and potential crop loss; cyan = visible crop boundary; green = proposed interior candidate region minus overlays; red = measured UI exclusions; yellow = illustrative critical-subject candidate, not a safe guarantee; purple = optional decorative bleed. Home includes rounded clipping. Reference diagrams use 390×844 /956×440 and the actual sampled source canvas, not proposed export pixel sizes. Crop-envelope diagrams are normalized schematic comparisons (Home16:9, Rankings2.35/5.5), not screenshots or source verification.

P: begin with 12 CSS px breathing room inside visible crop (projects to source via 12/s); expand measured UI rectangles by8 CSS px before approval. These are proposed composition margins informed by existing 12px spacing/compact UI, not hardware-safe-area measurements. Keep logo/athlete/wheel boxes in the intersection of visible, inset crop regions minus expanded UI across every intended viewport/profile. If the intersection is too small, use a different composition/variant and seek approval. Never shrink anatomy merely to satisfy a diagram.

Home's long localized text can start ~50px from the top at320px. Consequently a universal clear region large enough for an entire athlete/bicycle cannot be promised. The yellow marker only illustrates a possible focal-detail placement in the reference, not permission to crop a full-body subject. Date/location/tag blocks and circular button must all be included; do not approve solely against a short title.

## 6. Proposed production dimensions and DPR (P — owner decisions)

DPR is an explicit quality assumption, not measured hardware. Start with 3× for phone portrait, 2× for wide landscape/tablet to balance detail and transfer; compare actual 3× landscape on owner device before accepting a 2× delivery. Master dimensions below include working room; they are not mandatory generation-model sizes. Final exports/crops are approved before integration.

| Surface/group | Suggested editable source/master | Suggested final production / variants | Rationale and caveat |
|---|---|---|---|
| Home mobile portrait | ≥1600×1200, with overscan | At 3×: 888×690 (320 viewport),1053×690 (375),1098×690 (390),1248×690 (440) | Actual card W×230; source compositions must support1.287–1.809 ratios. These are per-container art-directed exports, not ordinary width resizes. |
| Home phone landscape | ≥3000×1200, separate wide composition | At2×:1254×490,1608×490,1832×490 | Measured 627/804/916×245; ratios2.559–3.739. Must retain anatomy and UI clear zones in each approved cut. |
| Home tablet/wide | ≥3200×1000, separately reviewed wide cut | 2172×490 at2× | Measured1086×245,4.433:1. Do not reuse mobile composition without render approval. |
| Rankings phone portrait + tablet contain | ≥3760×1600 working master | 1880×800 (2.35:1) proposed future canvas | Covers440px at3× and the measured +56px stress height at3×; also supports ~752×320 at2× if future aspect metadata is2.35. Current old aspect metadata/art unchanged. |
| Rankings landscape | ≥5280×960 separate working master | 2640×480 (5.5:1) | Covers956×173.82 at2× and +56px stress height at2×. 3× may require3960×720; benchmark before adoption. Insets still change crop despite correct zero-inset ratio. |

Home multi-variant art direction is a **future architecture proposal**, not supported by its present width-only srcset mapping. Until separately implemented/approved, deliver current16:9-family WebP variants640/1280/1672 and review the complete crop envelope. If they fail visual criteria, STOP artwork approval rather than silently force a crop. Do not connect new orientation files or rename current mappings in this task. The final-crop-first condition for adaptive layouts means every approved viewport cut/composition, not one magic ratio.

For Rankings, future aspect metadata must truthfully describe the approved source. Integration is separately authorized; current portrait source ratios include ~2.5 and1.78, and existing landscape sources can be taller than5.5:1. No existing image is replaced by these proposals.

Format: retain lossless original source (PNG/editable master); deliver optimized WebP. Preserve existing width-variant generation and no-inline behavior for Home, picture selection for Rankings. Start with existing quality settings (Home generator88; portrait Rankings92), compare at actual render sizes and DPR, then tune only with owner-reviewed visual equivalence. Do not install an encoder dependency without authorization. Produce source and optimized hashes, encoder/version/settings, dimensions and byte sizes.

## 7. Performance baselines and proposed review budgets

Existing Home WebP inventory (10 scenes):640w55,110–74,882 B;1280w175,294–243,498 B;1672w250,796–363,542 B. Current/next image elements are initially eligible; IntersectionObserver ±100% root margin adds neighboring cards and lazy loading can fetch further adjacent elements. Do not promise exactly two total Home requests. `sizes` has a410px floor on compact screens although cards may be296px wide; this is an audit question, not an implemented fix. Home images are Vite hashed imports with `?no-inline`.

Existing Rankings portrait total2,460,616 B for eight assets (−86.5% vs PNG); two current-scene panels mounted. Previous Preview cold pair488,362–816,170 B; switching series0 extra requests; warm reload~600 B revalidation. Landscape pair~0.400–0.626 MB. These are prior RANK-05C measurements, not newly measured remote traffic. Stable public names rely on server revalidation; never assume immutable cache. No artwork is embedded in JS. Sports chunk warning is separate PERF-01.

P budgets below are **review triggers**, not pass/fail retroactively applied to existing art. MB is decimal. Higher-resolution proposed exports must be encoded and visually measured before these targets can become acceptance limits.

| Surface | Initial visible target | Adjacent target | Active-window target | Measurement |
|---|---:|---:|---:|---|
| Home phone portrait | ≤0.40MB | ≤0.40MB each | ≤0.80MB first pair; ≤1.20MB three-image neighborhood | Rounded upward from current1672w max0.364MB; long/complex scenes may require exception. |
| Home wide/tablet new2× exports | ≤0.50MB | ≤0.50MB each | ≤1.00MB first pair; ≤1.50MB three | Provisional headroom for wider2172px exports; unvalidated until sample encoding. |
| Rankings portrait | ≤0.50MB | ≤0.50MB | ≤1.00MB two-panel pair | Existing per-file max~0.490MB, observed worst pair~0.816MB. |
| Rankings landscape | ≤0.40MB | ≤0.40MB | ≤0.80MB two-panel pair | Observed pair max~0.626MB; higher-resolution delivery needs validation. |

Requests: one selected responsive rendition per mounted image, no simultaneous inactive orientations, no full-body repeat on same-scene series switches; report cache revalidation separately. Home neighborhood grows as user visits cards; total session payload is not bounded to three assets. Rankings only current scene's two series per orientation, not all16. Measure initial/adjacent decode completion and slow-network drag; blank-frame risk cannot be dismissed by byte size alone.

Layout: no image-induced change to container/controls rectangles after decode or rotation settles (measurement tolerance≤1 CSS px); zero unexpected image-attributable layout-shift entries in supported browser harness. Rotation intentionally changes geometry. JS/CSS: zero embedded image bytes/new runtime dependencies; asset-only mapping change should add no material JS payload (proposed trigger +1KB uncompressed versus same isolated baseline). Existing sports chunk warning does not waive other regressions. Record browser version, DPR, cache mode and network conditions.

## 8. Final-crop-first workflow and handoff

1. Select surface/viewport/DPR/inset profiles and approve UI geometry; no layout changes as an artwork workaround.
2. Select race references (source/rights/owner provenance); generated scenes must not be represented as documentary race photographs.
3. Prepare separate compositions, then all final viewport cuts. Verify equipment, anatomy, discipline, appropriate drafting/transition spacing, geography and lighting.
4. Render the FINAL crop with actual overlays, longest localized text, safe insets and both orientations. Owner reviews rendered previews, not only the master.
5. Owner approves exact crop/hash and all critical subject boxes; if any fail, revise with owner approval before integration.
6. Optimize, compare original/optimized render, checksum and validate mechanical metadata. Material loss returns to owner.
7. Supply the absolute-path contract below. Integration requires its own authorization; Codex must not artistically recrop, regenerate or substitute.
8. Browser QA and physical iPhone Safari/Telegram QA; Preview and Production require separate permissions.

[Validation checklist](design/showcase-templates/validation-checklist.md) separates mechanical checks from owner visual judgment. [Delivery form](design/showcase-templates/asset-delivery-template.json) uses null placeholders, not invented provenance/checksums.

## 9. Open owner decisions

Approve or amend: Home art-direction migration/three composition groups; source/export dimensions and DPR quality tradeoff; 12px crop inset +8px UI-clearance proposal; device inset/text-scale profiles; byte-budget exceptions; versioned naming/caching strategy; durable archive location and reference rights. Validate that sufficient clear subject area exists—especially Home320px—before accepting a scene. DS-02A and DS-02 v1.0 remain DRAFT, not approved.

## 10. Audit outcome

19 fresh DOM scenarios recorded; SVG XML and PNG signatures/dimensions validated; local links checked; protected application/artwork hashes unchanged; git diff --check run. Documentation-only task: build/release gate not rerun; prior RANK-06 results are historical evidence, not new test claims. No commit/push/deployment, dependency installation, version/data/configuration changes.
