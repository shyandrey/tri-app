# 300W Showcase & Artwork Guidelines v1.0

2026-10-25 · **OWNER APPROVED — DS-02C, 2026-10-25.** Primary consolidated reference for future artwork, especially the 2027 season. DS-02A methodology and principles are owner-approved; numeric values are recommended starting points, not universal limits. This document does not authorize integration or deployment.

## 1. Purpose, scope and responsibilities

Applies to Home Race Showcase and Rankings Showcase. Athlete portraits, compact race cards and result-page metadata are different roles. This is a component-specific foundation for the future 300W Design System, not a new generic hero component.

The owner approves references, factual uncertainties and final rendered compositions. Artwork preparation supplies verified references, separate compositions, finished crops, optimized files and manifests. Codex verifies delivery metadata, integrates only within separately authorized scope and runs regression/performance checks. Codex must not regenerate, artistically recrop or substitute approved artwork without separate authorization.

Existing approved artwork, focal positions, mappings and behavior remain unchanged. These guidelines authorize no retroactive redesign or renaming.

### Evidence and document precedence

- [Architecture audit](../ds02-showcase-architecture-audit-2026-10-23.md): historical implementation inventory.
- [Earlier requirements draft](../ds02-showcase-guidelines-draft.md): historical proposal.
- [DS-02A technical specification](../ds02-showcase-technical-templates.md): source of truth for the measured geometry and recommended numeric tables, with [raw measurements](showcase-templates/geometry-measurements.json).
- [Rankings implementation history](../official-rankings-ui-2026-10-22.md): chronological decisions; later closure supersedes earlier rejected landscape/blur proposals.
- [Project Board](../PROJECT_BOARD.md): current approval and deployment status.

Historical reports and the [template gallery](showcase-templates/index.html) retain their original DRAFT labels as audit evidence. The owner has now approved DS-02A as a foundation; those labels do not revoke that decision. DS-02B and this consolidated v1.0 are owner-approved under DS-02C (2026-10-25). Earlier suggestions to approve universal numeric limits are superseded by the owner's explicit starting-value policy. No previous measurement or diagram is rewritten.

**Measured** means observed DOM geometry at a recorded viewport. **CSS-derived** means implementation formulas. **Recommended** means a production starting point requiring scene/device validation. Source image ratio is not necessarily rendered container ratio. Nothing here claims new physical-device or live performance measurements.

## 2. Visual identity

**Modern Sports Minimalism + Cinematic Photorealism.** Use realistic sporting scenes, natural discipline/time-appropriate lighting, recognizable locations, clear focal subjects and controlled complexity. Avoid unnecessary graphic decoration and artificial blur used to hide incorrect proportions. Maintain comparable quality across series without forcing identical composition, weather or lighting onto every race.

Generated scenes are illustrative, not documentary photographs, proof of participation or results evidence. Unverified geographic, equipment or athlete-specific claims remain unresolved. Existing Home readability gradients are UI overlays and remain intentional; Rankings has a sharp boundary without the rejected blurred backdrop.

## 3. Showcase types and current geometry

Home is a rounded, variable-ratio card with localized title, tags/series, date, location and an open button. Its current single-source WebP `srcset` selects resolution, not independent orientation composition. Rankings is edge-to-edge with embedded branding and upper-right Back, separate portrait/landscape `<picture>` sources and sharp corners. Do not reuse Rankings geometry for Home.

Measured CSS pixels, DPR 1, zero hardware insets, from DS-02A:

| Viewport | Home outer card | Rankings container |
|---|---:|---:|
| 320×700 | 296×230 | 320×136.16 |
| 375×812 | 351×230 | 375×159.56 |
| 390×844 | 366×230 | 390×165.95 |
| 440×956 | 416×230 | 440×187.22 |
| 667×375 | 627×245 | 667×121.27 |
| 844×390 | 804×245 | 844×153.45 |
| 956×440 | 916×245 | 956×173.81 |
| 1200×1600 | 1086×245 | 1200×320 |

Home has zero internal container padding, 1px border (image box is 2px smaller on each axis), radius20px at width≤640 and22px above; heights are minimums, not guarantees for longer future text. Cover/center cropping spans outer ratios1.287–4.433 across this matrix. Reserve actual text/button rectangles, not an assumed bottom strip.

Rankings zero-inset phone portrait is approximately2.35:1; landscape approximately5.5:1. Height adds `max(env(safe-area-inset-top), --tg-safe-area-inset-top)` and Telegram content-top inset. Portrait≥1024 overrides height to320px and centers contain artwork of width `min(100%, 320×asset.aspectRatio)`. The1200px container is3.75:1, not a full-width2.35:1 image. In the sampled old1983×793 asset the image is800.19×320. Current approved Cycling landscape uses contain; other scenes retain cover/focal positions. These are preserved exceptions, not instructions to convert existing assets.

Landscape controls use safe-area gutters; the artwork remains full-width. Back and logo clearance must be tested independently. DS-02A synthetic top24+content32 made phone height grow56px and moved Back; tablet height stayed320px. Those values are stress inputs, not Apple hardware specifications.

## 4. Production dimensions and DPR

**Recommended dimensions are starting values, not rigid requirements.** Smaller files may pass actual rendered quality/performance checks; larger files need a rendering/DPR justification. The following reproduces DS-02A recommendations, not a new measurement:

| Surface/group | Editable master starting size | Production export starting size | DPR assumption |
|---|---|---|---|
| Home mobile portrait | ≥1600×1200 with overscan | 888×690 /1053×690 /1098×690 /1248×690 for the four measured phone widths | 3× outer card |
| Home phone landscape | ≥3000×1200 | 1254×490 /1608×490 /1832×490 | 2× outer card |
| Home tablet/wide | ≥3200×1000 | 2172×490 | 2× measured1086×245 |
| Rankings portrait/tablet contain | ≥3760×1600 | 1880×800,2.35:1 | Phone3×; tablet2× starting point |
| Rankings landscape | ≥5280×960 | 2640×480,5.5:1 | 2×; optional3960×720 for3× after benchmarking |

Home exports illustrate target cuts, not a requirement to create seven distinct artworks or ordinary width-resize variants. Confirm the actual image box inside its border when preparing final previews. Rankings exports include headroom for the DS-02A synthetic stress case, but resolution headroom does not guarantee safe cropping. A future2.35 source changes tablet image width to about752px; current asset metadata stays unchanged. Compare2× landscape on the actual3× owner device before acceptance.

Retain a lossless original/editable master. Deliver optimized WebP with encoder/version/settings, actual encoded dimensions, bytes and hashes. Existing Home quality88 and Rankings portrait92 are encoder starting references, not mandatory values or cross-encoder quality equivalence.

## 5. Responsive composition strategy

Prepare mobile portrait and phone landscape compositions; add tablet/wide when the component's crop envelope requires it. Use the smallest composition set that passes every target viewport. Separate compositions are art direction, not one unique image per device.

For future Home, plan three groups: mobile portrait, phone landscape, tablet/wide. A fixed16:9 source loses sides on narrow cards and much of its top/bottom on wide cards; an entire bicycle cannot be guaranteed by one universal safe rectangle. **Current Home does not support independent orientation artwork. Home multi-variant migration requires a separate authorized development task.** Until then, its640/1280/1672 width derivatives and current mapping remain the integration contract. If a new scene fails that envelope, stop approval and plan the migration; do not silently change Home.

Rankings already selects orientation with `<picture>`; tablet contain and safe-area cases must still be approved. No geometry, fallback or crop-rule change is authorized by a new file delivery alone.

## 6. Safe zones and cropping

Start with **12 CSS px** breathing room inside the visible crop and **8 CSS px** extra clearance around measured UI rectangles. These are provisional composition margins, not hardware-safe-area guarantees. Project margins through the actual scale into source coordinates; do not treat them as12/8 source pixels.

Use the existing [SVG/PNG gallery](showcase-templates/index.html) and [acceptance checklist](showcase-templates/validation-checklist.md). Gray is source/crop loss, cyan visible crop, green candidate interior, red UI exclusions, yellow illustrative critical subject area, purple decorative bleed. Yellow is not a guarantee that a whole athlete fits. Mark actual athlete/equipment/logo/landmark bounding boxes for each scene.

Validate those boxes inside every intended visible crop minus expanded UI overlays. Include Home rounded corners, longest localized titles/tags/date/location, larger text, gradients and circular action; include Rankings Back, branding and tablet exception. Include Telegram/iOS top/right/left insets and orientation changes. Preserve required anatomy, complete bicycle wheels, logos and important geography. If they cannot fit, seek a different composition before approval rather than stretching, silently clipping or moving UI.

## 7. Race identity and references

Reference-first inputs may be owner-provided photos, web-sourced race photos or creative generation based on verified race characteristics. Record source URL or absolute file path, photographer/rights holder where known, permission status where relevant, reference purpose, represented race/location and owner decision. Unknown rights or facts remain explicitly unknown until resolved; do not invent permission.

References establish geography, landmarks, architecture, course, atmosphere and lighting. Do not mechanically copy third-party photographs. Distinguish verified race characteristics from visual inspiration and plausible artistic choices. Generated artwork must remain identified as illustrative in the manifest.

## 8. Sporting accuracy checklist

| Discipline | Required visual review |
|---|---|
| Swimming | Plausible freestyle anatomy; head/shoulder/arm relationships; water interaction; appropriate caps/wetsuits where applicable. |
| Cycling | Plausible aero posture, bike geometry, complete wheels/contact points and equipment. Verify the depicted race format; non-drafting races must not show an invented peloton or inappropriate spacing. |
| Running | Plausible mechanics/equipment/course; lighting consistent with the intended race timing. |
| Transition | Plausible racks, bikes suspended by saddle where appropriate, realistic movement and equipment for the depicted stage; no unnecessary gear boxes. |

Plausibility is not evidence that a specific race had that weather, equipment rule, transition layout or athlete. Verify race-specific facts from references or flag them for owner resolution.

## 9. Mandatory final-crop-first workflow

1. Select showcase component.
2. Confirm actual UI geometry, overlays, viewport/DPR/inset matrix.
3. Select and document race references.
4. Complete the [artwork brief](showcase-artwork-brief-template.md).
5. Prepare/generate portrait composition within the authorized artwork scope.
6. Prepare/generate separate landscape composition; add wide composition if needed.
7. Prepare final viewport crops using the intended render rules.
8. Validate safe zones, anatomy/equipment, geography and branding.
9. Obtain owner approval of actual final rendered crops and revision.
10. Optimize approved images without artistic changes; retain originals.
11. Compare optimized and approved renders at intended sizes/DPR. Material loss returns to review.
12. Prepare asset manifest, checksums and full absolute paths.
13. Hand off production-ready files to Codex using the [handoff form](showcase-codex-handoff-template.md).
14. With separate implementation authorization, integrate and run browser QA.
15. Conduct physical-device review where required; Preview/Production each require explicit authorization.

**Master approval does not approve its crop.** Do not hand off unresolved artistic cropping decisions. Asset approval is tied to files/revision and rendered previews; optimized-file approval must also be recorded after comparison.

## 10. Performance and optimization

Recommended review triggers from DS-02A, decimal MB; exceedance requires investigation and a documented quality/performance decision, not automatic rejection:

| Surface | Initial visible | Each adjacent | Active window |
|---|---:|---:|---:|
| Home phone portrait | 0.40MB | 0.40MB | First pair0.80MB; three neighbors1.20MB |
| Home wide/tablet proposed2× | 0.50MB | 0.50MB | Pair1.00MB; three1.50MB |
| Rankings portrait | 0.50MB | 0.50MB | Two panels1.00MB |
| Rankings landscape | 0.40MB | 0.40MB | Two panels0.80MB |

Higher-resolution exports need sample encoding and quality review before adopting these as scene-specific budgets. The old0.309MB reference is not a universal limit. Historical Rankings Preview cold-pair488,362–816,170B, series switch0 additional requests and warm~600B revalidation are baseline evidence, not measurements from this documentation task.

Use responsive WebP selection and retain adjacent decoded artwork for finger-following swipes. Avoid downloading inactive orientation variants simultaneously, loading all16 Rankings assets eagerly, or embedding image bytes in JS. Home current/next eligibility and observer±100% can load more than two images; total session transfer grows as scenes are visited. Do not assert a universal two-request cap.

Measure cold/warm network transfer, decoded dimensions, selected sources, body downloads versus304/cache reuse, orientation returns and interrupted/rapid swipes under recorded browser/DPR/network conditions. Home hashed imports and Rankings stable public URLs have different caching behavior; do not assume immutable caching for stable names. Check blank frames and decode latency, not just file sizes.

Starting layout tolerance: ≤1 CSS px unintended image-induced rectangle change after decode/rotation settles, no unexpected image-attributable shifts. Intended orientation geometry changes are separate. No new runtime dependencies/image bytes in JS; +1KB uncompressed JS for an asset-only mapping change is a proposed investigation trigger. Measure JS/CSS separately from image payload. **PERF-01 sports chunk warning stays open and separate**; image compression does not resolve or explain it without bundle analysis.

## 11. Future asset naming and storage

Use `<series>-<race-or-scene>-<season>-<orientation>-vNN.webp`. Illustrative2027 filename: `ironman-kona-2027-landscape-v01.webp`; it is not proof of schedule or an existing file. Use `portrait`, `landscape`, and a documented `wide` composition when needed. Resolution variants may live in size subdirectories while retaining the composition filename.

Keep originals, optimized active outputs, manifests and archived previous revisions separate. Select and approve concrete directories per delivery: current Home originals/derivatives use `src/assets/showcase/` and `src/assets/optimized/showcase/`; current Rankings files use `public/images/showcase/`. Future masters and rollback revisions should be retained in an approved durable project archive outside deployment output. Do not create arbitrary archive locations or ship unused originals as public assets. Do not rename existing approved artwork.

The manifest records logical scene, revision, source/optimized SHA-256, reference and approval evidence, encoder settings, dimensions/bytes and active mapping key/path. Home mapping/generated variants and Rankings mapping remain the runtime source of truth; handoff does not authorize editing them. Previous revisions remain available for separately approved rollback.

Always hand off full absolute filenames for source, optimized output and evidence. `~`, a zip name or a relative path alone is insufficient. Repository-relative URLs may additionally describe runtime mapping, but do not replace filesystem paths.

## 12. Asset delivery contract

Use the [Codex handoff template](showcase-codex-handoff-template.md) and existing [machine-readable delivery skeleton](showcase-templates/asset-delivery-template.json). Required fields: raceId, series, season, surface, orientation, revision, source/optimized absolute paths and filenames, actual dimensions/aspect/format/bytes/SHA-256, reference provenance/rights, approval status/evidence, render contract and integration notes. Unknown fields stay placeholders; they block claims of complete production delivery. Never fabricate a checksum, file size, source permission or approval date.

## 13. QA, acceptance and remaining decisions

Use the linked [detailed checklist](showcase-templates/validation-checklist.md): decode/hash/metadata checks; crop/overlay math; independent visual composition review; touch/mouse/keyboard, navigation/swipe/season regression; loading and performance. Render both themes at320×700,375×812,390×844,440×956,667×375,844×390,956×440 and1200×1600. Include orientation changes, dynamic text, safe-area stress, actual device insets, Back/open/Feedback/Bottom Navigation and all required adjacent images.

Mechanical checks cannot certify anatomy, rights, geography or visual quality. Safari and Telegram physical-device review must record device/result separately from emulation. Passing tests never substitutes for owner visual approval.

Open per-delivery decisions: actual references/rights, critical subject boxes, DPR/quality tradeoff, export sizes, budget exceptions, archive/backup location and device matrix. Home multi-composition implementation remains a separate future development task. This consolidated document and both handoff/brief templates are owner-approved under DS-02C (2026-10-25); individual future artwork still requires its own approval. No code, mapping, artwork or infrastructure change is part of DS-02B.
