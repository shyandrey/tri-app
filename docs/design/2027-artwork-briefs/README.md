# CAL-03B2 — 2027 NEW artwork briefs

2026-11-22 · Documentation only. **10 briefs prepared; 0 image deliveries or final crops approved.** Owner's NEW classification authorizes planning, not creation or use of an unspecified image.

## Mandatory contract, unchanged

Use [owner-approved Guidelines v1.0](../300w-showcase-artwork-guidelines-v1.0.md), [owner-approved brief template](../showcase-artwork-brief-template.md), [technical gallery](../showcase-templates/index.html) and [validation checklist](../showcase-templates/validation-checklist.md). Their original DRAFT labels are preserved historical labels, with precedence explained in Guidelines. These briefs instantiate that contract; they do not define a new artwork standard.

Cinematic photorealism, verified race-specific geography, plausible sporting anatomy/equipment/bicycle geometry, measured subject-safe regions, actual UI overlays and **final-crop-first owner approval** are mandatory. Artistic choices are proposals, not documentary facts. No reference photos, permissions, artwork, critical subject boxes, delivery hashes or approval dates have been invented.

## Current Home constraint

Home uses **one source composition with640/1280/1672 width WebP variants**, centered cover and existing UI overlays. Resolution selection is not art direction. No `<picture>` orientation sources, focal-point overrides or alternate mobile scene are introduced. Rankings has a different implementation and its ratios must not be applied to Home.

1672×941 is the existing source/pipeline format, **not a universal quality target or mandatory master resolution**. Guidelines §4 starting masters are ≥1600×1200 portrait, ≥3000×1200 landscape, ≥3200×1000 wide; these are composition planning recommendations, not three supported Home runtime inputs. Preserve a suitable overscan/editable master. Integrate at most one approved source and its existing derivatives until separately authorized otherwise. 1672px maximum may be insufficient for guideline wide2× target2172px: actual DPR/quality/performance acceptance or separate delivery/tooling decision is required, not silent upscaling or a new variant.

### Crop feasibility, not an approval rectangle

Using DS-02A zero-inset measured minimum boxes (minus1px borders), a1672×941 center-cover source retains roughly x229–1443 on320portrait and y283–658 on1200wide. Their intersection is only about73% of source width ×40% of height **before** UI exclusions, rounded corners and provisional12CSSpx/8CSSpx clearances. This calculation is illustrative, not a new safe-zone standard: actual text expansion, hardware insets and subject boxes must be measured per render. An athlete or complete bicycle larger than that common region cannot be certified by one universal rectangle.

Each brief lists risky compositions and an environmental one-source alternative. **No actual composition can yet be conclusively marked PASS/FAIL:** sources and critical boxes are absent. A brief marked high-risk is not proof that separate artwork is required. If a real subject/landmark box cannot remain visible outside overlays in every crop, reject that composition; try a different single-source composition or raise the separate decision below. Never silently clip anatomy, move UI, fabricate geography or approve only the original.

## Briefs and feasibility review

| Race / exact edition | Brief | Single-source review risk / status |
| --- | --- | --- |
| IRONMAN 70.3 Muscat / `ironman-70-3-muscat-2027` | [Brief](ironman-70-3-muscat-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| IRONMAN 70.3 Valencia / `ironman-70-3-valencia-2027` | [Brief](ironman-70-3-valencia-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| IRONMAN Lanzarote / `ironman-lanzarote-2027` | [Brief](ironman-lanzarote-2027.md) | HIGH — complete bicycle; crop decision pending actual source |
| IRONMAN 70.3 Tours Métropole / `ironman-70-3-tours-metropole-2027` | [Brief](ironman-70-3-tours-metropole-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| IRONMAN 70.3 Mont-Tremblant / `ironman-70-3-mont-tremblant-2027` | [Brief](ironman-70-3-mont-tremblant-2027.md) | HIGH — complete bicycle; crop decision pending actual source |
| IRONMAN 70.3 Jönköping / `ironman-70-3-jonkoping-2027` | [Brief](ironman-70-3-jonkoping-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| IRONMAN 70.3 Leipzig / `ironman-70-3-leipzig-2027` | [Brief](ironman-70-3-leipzig-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| IRONMAN 70.3 World Championship — Chattanooga / `ironman-70-3-world-championship-2027` | [Brief](ironman-70-3-world-championship-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| Spain T100 — Marbella / `t100-spain-2027` | [Brief](t100-spain-2027.md) | REVIEW — subject + geography; crop decision pending actual source |
| Challenge Roth / `challenge-roth-2027` | [Brief](challenge-roth-2027.md) | HIGH — full bicycle + Card; crop decision pending actual source |

## Separate decision if one source cannot pass

Report the failing race/revision, source and final crop paths, critical boxes, viewport/DPR/insets, measured overlay collision and unsuccessful single-source alternative. Request authorization for a minimal **Home art-direction extension**: edition mapping with explicit portrait/landscape/(optional wide) compositions, a supported orientation-aware selector, agreed tablet/fallback/focal rules, and preservation of current single-source editions. Scope must include responsive source delivery, lazy/current-neighbor loading, no duplicate inactive-image downloads, orientation/swipe/no-blank-frame regression and crop/device/performance qualification. This is a proposal only; no schema, markup, CSS, mapping or loading changes are authorized or implemented now.

## Final-crop-first acceptance

For all10 NEW and any future Showcase preparation, follow the original checklist in full. Approval binds exact source/optimized files, revision/hashes and **final rendered previews with UI**, not the master. Record portrait/landscape/tablet, both themes, actual insets/DPR, longest text and physical iPhone Safari/Telegram results. The earlier B2 smoke at390/1024 was functional qualification of existing artwork/fallbacks, **not acceptance of NEW artwork or the full design matrix**. Challenge Roth includes both Home and Card crops. Unknown rights, references, anatomy or failed crops block artwork acceptance; no fictitious PASS.

No image generation/download, new artwork standard, runtime architecture change, build, Git publication or deployment in this addendum. Neutral fallback remains until approved delivery/integration.
