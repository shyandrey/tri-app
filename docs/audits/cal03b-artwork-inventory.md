# CAL-03B1 — 2027 artwork inventory & reuse plan

2026-11-22. Local read-only artwork audit in `/private/tmp/300w-cal02-candidate`; all CAL-02/CAL-03A implementation retained. No image download, generation, crop, encoding or mapping change. No build/browser tests. Visual inspection used existing originals/derivatives; dimensions read with sharp metadata only.

## Decision summary

Counts are **races**, not image files: **REUSE — SAFE 0; REUSE — REVIEW 4; NEW ARTWORK 21** (25 total). **NEUTRAL FALLBACK is the temporary plan for all 25**, overlapping those primary classifications, not 25 additional tasks. No new 2027 artwork is approved or mapped today. Four review races correspond to six source images: three Kona, one French Riviera, one Saudi, one Qatar; a final selection need only use one suitable image per race. Failure of venue/rights/crop review moves a reuse candidate to NEW, or keeps it neutral.

SAFE=ready for 2027 reuse with suitable crop/provenance/approval evidence. None meets all three based on this inventory alone. Existing usage/owner-approved design guidelines do not automatically grant 2027 per-image approval or establish copyright permission. REVIEW=possible reused content; NEW=no suitable verified local race image. NEUTRAL=current CSS fallback, technically usable and previously smoke-qualified; final visual acceptance remains with owner.

## Existing asset inventory

All ten `src/assets/showcase/` originals are **PNG 1672×941 (~16:9)**. Each has existing WebP derivatives **640×360, 1280×720, 1672×941** in `src/assets/optimized/showcase/`, 30 total. Exact dimensions checked against local files/registry; no changes. All are location-specific, not approved neutral entity artwork. No readable explicit year stamp was observed in visual inspection (small text not certified by OCR); event/sponsor branding still matters.

| Key | Original path under src/assets/showcase/ | Content / reuse and crop concern |
| --- | --- | --- |
| K1 | kona/kona-bike-lava.png | Coastal lava bicycle scene, subject on right/lower half. Best Kona candidate; wide center crop can cut wheels/body. Not a Lanzarote reference merely because both have volcanic terrain. |
| K2 | kona/kona-swim-start.png | Kona swim/buoy/shore; IRONMAN branding. Foreground swimmers low; wide crop risks anatomy loss. Verify reference/provenance and 2027 use. |
| K3 | kona/kona-finish-alii.png | Finish arch, sponsors, **embedded names/times/flags** on scoreboard. Do not present those as 2027 results. Prefer K1/K2; K3 requires explicit content approval, not silent cropping. |
| F1 | french-riviera/french-riviera-run.png | Runner lower-right, Mediterranean coastline, T100 French Riviera arch. Country/region resemblance does not establish exact course/venue. Brand/text and anatomy cropping require review. |
| Q1 | qatar/qatar-lusail-sunset.png | Named Lusail skyline/panorama, no readable year/race text. Promising landscape; verify geographic accuracy and 2027 venue. Skyline survives central band better than low foreground. |
| S1 | saudi-arabia/saudi-arabia-seaview.png | Specific coastal skyline, not geographically neutral. 2027 host city unresolved; cannot call it a verified depiction of the race. Keep neutral until matched. |
| N1 | nice/nice-bike-mountains.png | Nice/Col d’Èze directional signage and coast; not Chattanooga or Marbella. Retain historical mapping only. |
| N2 | nice/nice-run-promenade.png | Nice landmark and Nice 70.3 Worlds signage; not Chattanooga. |
| N3 | nice/nice-swim-start.png | Nice coastline / Worlds arch; not Chattanooga. |
| D1 | dubai/dubai-swim-skyline.png | Dubai skyline/T100 buoy; Dubai is not in approved 2027 master. Not a generic T100 replacement. |

Race/edition mapping: `src/data/showcaseImages.ts` explicitly lists historical editions; shared geographically-neutral approved map is empty. All 2027 editions fall back to CSS. No map may be inferred from canonical Worlds identity. CAL-03A's historical asset retention is not a new per-asset source/license certification.

Other inspected inventory:

- `public/images/showcase/rankings/optimized/`: eight logical Rankings scenes plus 1320 alternates (10 WebP + 2 AVIF files). IRONMAN first three 1983×793; transition 1671×941; T100 1671/1672×941; transition alternates 1320×743. These serve Rankings composition/branding, not verified race-specific Home imagery. No automatic cross-surface reuse proposed.
- `public/images/showcase/rankings_landscape/.../optimized/`: eight WebP; six 1947×808, run-city 1950×807, cycling-final 2078×378. Separate landscape treatment, not equivalent Home cover geometry. Excluded from per-race suitability counts; no claim of exhaustive visual/license approval for these assets.
- Series logos (`src/assets/series`, optimized PNG) are sufficient for compact Calendar cards, not landscape backgrounds. `src/assets/hero.png` is 343×361, unsuitable resolution/ratio; brand assets/SVGs are not race evidence. Athlete portraits under public/assets remain excluded from race-artwork reuse.
- No other race-specific 2027 asset identified in inspected `public/` / `src/assets/`. Historical audit screenshots/embedded web examples are evidence, not licensed image masters to import.

## 25-race plan

All rows are eligible for Home under explicit 2027 profile until event end, selected chronologically into the first five; eligibility does not guarantee simultaneous visibility. Existing local files below are candidates only. **H** is the common Home export/crop contract below. Each NEW row requires an owner-supplied/licensed reference or a separately approved illustrative-artwork brief; no invented URLs. Missing geography must be verified before a location-specific scene. All actions require separate artwork/integration authorization.

| Race | editionId | Existing asset | Classification | Proposed subject/action (H) | Showcase readiness | Owner approval required |
| --- | --- | --- | --- | --- | --- | --- |
| IRONMAN 70.3 Muscat | `ironman-70-3-muscat-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Muscat: подтвердить venue; затем береговой swim/bike scene; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN New Zealand | `ironman-new-zealand-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Taupō: swim/lakeside scene после проверки venue 2027; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Geelong | `ironman-70-3-geelong-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Geelong: waterfront swim/run; проверить трассу и берег; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Oceanside | `ironman-70-3-oceanside-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Oceanside: coastal bike/swim; проверить доступный участок маршрута; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Valencia | `ironman-70-3-valencia-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Valencia: подтвердить venue; city/coastal triathlon reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN Texas | `ironman-texas-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Texas: Woodlands water/bike scene; без неподтверждённого championship-титула; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN Lanzarote | `ironman-lanzarote-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Lanzarote: подтвердить venue; volcanic/coastal bike reference; Kona не заменяет Lanzarote; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Pennsylvania | `ironman-70-3-pennsylvania-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Pennsylvania: Happy Valley bike/run; без continental signage; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Tours Métropole | `ironman-70-3-tours-metropole-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Tours Métropole: подтвердить venue; river/cycling reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Mont-Tremblant | `ironman-70-3-mont-tremblant-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Mont-Tremblant: lake/mountain bike reference после проверки venue; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN Frankfurt | `ironman-frankfurt-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Frankfurt: city/river run reference; без неподтверждённого championship-титула; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Jönköping | `ironman-70-3-jonkoping-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Jönköping: подтвердить venue; lake/swim reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN Lake Placid | `ironman-lake-placid-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Lake Placid: lake/mountain triathlon reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 Leipzig | `ironman-70-3-leipzig-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Leipzig: подтвердить venue; lake/cycle reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN 70.3 World Championship, Chattanooga | `ironman-70-3-world-championship-2027` | None suitable; Nice N1–N3 rejected | NEW ARTWORK | Chattanooga Worlds: подтверждённый новый host; river/bike reference, не Nice; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| IRONMAN World Championship, Kona | `ironman-world-championship-2027` | Kona K1–K3 | REUSE — REVIEW | Kona: bike-lava или swim; finish только после отдельного review табло/брендов; review existing original; no new source yet | Neutral now; reuse conditional | Yes: content, rights/provenance, crop, edition mapping |
| Gold Coast T100 | `t100-gold-coast-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Gold Coast: coastal city swim/run reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| Singapore T100 | `t100-singapore-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Singapore: подтвердить конкретный venue; city/waterfront reference; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| French Riviera T100 | `t100-french-riviera-2027` | French Riviera F1 | REUSE — REVIEW | French Riviera: проверить изображённую локацию, T100 signage и crop; review existing original; no new source yet | Neutral now; reuse conditional | Yes: content, rights/provenance, crop, edition mapping |
| San Francisco T100 | `t100-san-francisco-2027` | None suitable; no race-specific local asset | NEW ARTWORK | San Francisco: city/bay triathlon reference, только подтверждённые landmarks; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| Vancouver T100 | `t100-vancouver-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Vancouver: waterfront/mountain reference после venue verification; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| Marbella T100 | `t100-spain-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Marbella: sea/run reference; не Nice, не Oropesa/Pamplona; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |
| Saudi Arabia T100 | `t100-saudi-arabia-2027` | Saudi S1 | REUSE — REVIEW | Saudi: сначала подтвердить город; существующий seaview не считать verified venue; review existing original; no new source yet | Neutral now; reuse conditional | Yes: content, rights/provenance, crop, edition mapping |
| Qatar T100 World Championship Final | `t100-qatar-2027` | Qatar Q1 | REUSE — REVIEW | Qatar: проверить Lusail correspondence и crop существующей панорамы; review existing original; no new source yet | Neutral now; reuse conditional | Yes: content, rights/provenance, crop, edition mapping |
| DATEV Challenge Roth | `challenge-roth-2027` | None suitable; no race-specific local asset | NEW ARTWORK | Roth: подтверждённая трасса swim/bike/run, отдельная Challenge identity; landscape photo or approved cinematic illustration from verified reference | Neutral now; new image pending | Yes: content, rights/provenance, crop, edition mapping |

## H — Current Home requirements (applies to every row)

Canonical [owner-approved guidelines](../design/300w-showcase-artwork-guidelines-v1.0.md), especially geometry, source/provenance and crop rules. Current source/derivative contract: approximately **16:9**, source at least **1672×941** for no-upscale current largest derivative, lossless master retained; WebP widths 640/1280/1672 via existing generator. These are current integration dimensions, not a guarantee of HiDPI/crop suitability.

Recommended new-master starting sizes in the guidelines: mobile ≥1600×1200 with overscan, phone landscape ≥3000×1200, tablet/wide ≥3200×1000. They describe composition planning, **not existing independent-orientation support**. Use a larger landscape master with safe overscan if it survives the current single-source cover contract. Do not implement art direction or create multiple runtime orientations in CAL-03B2 without separate scope approval.

Current CSS: cover/center, mobile min-height230 and wide min-height245; source ratio is not rendered ratio. Recorded existing geometry: 296×230 at320 viewport, 366×230 at390, 1086×245 wide. A 16:9 source loses ~28% of its width at320, and ~60% of its height on the wide card (CSS-derived, approximate, not new browser measurements). Keep focal subject/whole bike and essential location inside safe central region plus UI overlays; existing right/lower athletes need careful review. No blanket mobile/desktop crop PASS is claimed.

Recommend landscape race atmosphere (swim/bike/run or verified location), not fabricated athlete/result attribution. Avoid embedded dates, results, unverified sponsor/championship text. For every requested source record creator/rights holder, origin, permission evidence, represented venue, illustrative/documentary status and owner decision; unknown rights remain unresolved. Files/hashes prove integrity, not rights. Asset-specific generation/reference/license records were not found in the inspected active mappings/generator; earlier UI approval is not a substitute.

`generate-image-variants.mjs` currently touches **all Showcase derivatives, athlete derivatives and series logos/manifests**. Do not casually run it during narrow artwork work. CAL-03B2 must use an explicitly reviewed scoped generation approach or isolate and inspect the entire generator diff, preserving unrelated assets byte-for-byte. No generator was executed here.

## Showcase coverage and fallback

- Explicit Preview 2027 profile makes all25 date-eligible during their upcoming window; earliest five are Muscat, New Zealand, Gold Coast, Geelong, Oceanside. None currently has mapped artwork. Prioritize those five for CAL-03B2, then chronological batches.
- Four races have plausible local landscape candidates (six originals); 21 need new suitable race imagery if a complete illustrated season is desired. Zero have approved 2027 landscape mapping. Four review candidates do not equal four publication-ready images.
- Current fallback is an intentionally neutral dark CSS composition with readable text/navigation. Existing CAL-03A screenshot `/private/tmp/300w-cal03a-browser/home-390.png` shows it; prior mobile/desktop smoke passed. This audit did not rerun it. Temporarily acceptable technical plan for all25, subject to owner visual approval; it avoids falsely depicting a venue. No fabricated geographic or athlete claim.
- Production primary remains2026; this plan does not change selection logic, activate season2027 or authorize deployment. Compact Calendar cards already use series logos/Roth fallback and do not require25 landscape photos. Race Detail currently has no photo block.

## CAL-03B2 recommended scope

1. Owner approves the four review decisions (prefer Kona bike/swim, review French Riviera/Qatar, defer Saudi until venue known) and the neutral fallback policy.
2. Obtain/approve references and briefs for first five Showcase races; preserve unresolved geography. Then handle remaining NEW rows in date order, especially Chattanooga and Marbella without Nice substitutes.
3. Prepare only explicitly authorized artwork, provenance/rights manifests and safe crops; retain historical originals. No year/result text invented. Scope generator changes before running it.
4. Integrate approved exact edition mappings only, inspect rendered mobile/desktop compositions and performance with targeted checks in that future task. No global entity fallback unless neutral reuse is separately documented and approved.
5. CAL-04 release-profile tooling and separate deployment permissions remain prerequisites; no Production approval inferred from this plan.

## Validation and change scope

Read-only path/metadata inventory, visual inspection of ten existing race scenes (Nice/Dubai via existing640 derivatives), guidelines/mapping/generator/CSS review. Asset/source/script hashes checked unchanged. `git diff --check` PASS. Only this report and a concise Project Board checkpoint added; previous CAL-02/CAL-03A evidence retained. No build, browser test, image operations, Git publication or deployment.

## CAL-03B2 superseding local checkpoint — 2026-11-22

Earlier findings above are preserved as history. Owner now approves15 USE /10 NEW /0 pending. Four existing reuse sets are mapped by exact2027 editionId;11 approved assets are missing,10 require new artwork,21 remain neutral. Roth historical calendar visibility and Card/Showcase support are first-class; ranking Tier A1.10 and official IM/T100-only Standings are preserved. Preview release preparation now selects and verifies2027 profile; Production defaults2026. See [consolidated implementation, exact paths and import requirements](cal03b2-preview-readiness.md). No publication/deployment or image generation/download.
