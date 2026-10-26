# DS-02 — Showcase & Artwork Guidelines v1.0 · DRAFT

**NOT OWNER-APPROVED.** Requirements proposal prepared 2026-10-23 after the [architecture audit](ds02-showcase-architecture-audit-2026-10-23.md). No application/artwork changes authorized by this document. Intended for new showcases, especially 2027. Existing approved artwork stays unchanged.

## Component-specific specification

Before creating artwork, select the actual component and record container formulas, breakpoints, orientation behavior, DPR targets, text/Back overlays, system/Telegram safe areas, cropping and responsive delivery. Home and Rankings are different surfaces. Audit measurements are baselines, not universal specifications. Owner must approve exact pixel dimensions, aspect tolerances, safe-zone diagrams and performance budgets per surface before production.

## Dual-format and final-crop-first workflow

For new surfaces supporting both orientations, deliver separate owner-approved portrait and landscape assets. Do not force a portrait composition into a thin landscape banner. Final artwork must fit the actual container before visual approval. Codex receives production-ready crops; integration must not silently recrop, stretch, regenerate or alter visual content. If subjects/logo cannot survive the specified container/insets, stop for review with comparative previews. Home's existing single-source behavior is a documented legacy exception, not permission for an unscoped migration.

## References and sporting accuracy

Owner-provided photographs, web-sourced references and creative generation may be used where appropriate. Record source URL/file, attribution/usage permission where relevant, reference role and approval. References guide actual geography, course landmarks, lighting and composition. Separate verified race facts from visual inspiration. Generated artwork must not be labelled or used as documentary race photography, results evidence or proof of participation.

Review equipment appropriate to discipline, plausible athlete anatomy and posture, realistic wheels/contact points, transitions and bike placement, plausible local/time-of-day lighting, and non-drafting spacing/rules where applicable to the depicted race. Do not fabricate identifiable athletes, event branding or geographic claims to fill missing evidence; raise uncertainty for owner review.

## Delivery contract (proposed)

- Stable scene key plus series/race, season where season-specific, orientation and revision; example naming template `<series>-<race-or-scene>-<season>-<portrait|landscape>-vNN`. This is a future convention, not a rename request for current assets.
- Originals and optimized output in separate directories, with archived previous revisions. Prefer repository-relative active mapping paths and a durable evidence archive. Do not ship unused originals/rollback packages in deployment copies.
- Handoff must include **full absolute filesystem paths** for every source and optimized file, not only filenames/zip names. Expand `~`; state expected format, pixel dimensions, aspect ratio, byte size, SHA-256 and owner approval/version.
- Manifest: scene ID, orientation, source/optimized hashes, source provenance, approval record, encoder/version/settings, measured dimensions/bytes and active mapping. Do not invent capture dates or source hashes.
- Optimize to WebP without composition changes; validate actual format and dimensions and visually compare at rendered sizes/DPR. Lossy optimization is not pixel-identical. Preserve original bytes. New dependencies/tools require separate authorization where applicable.
- Use the existing responsive mechanism appropriate to the surface: orientation `<picture>` for dual artwork, width srcset/sizes for resolution variants. Avoid simultaneous inactive orientation fetches, embedding image bytes in JS and eager loading all scenes. Keep adjacent artwork available for interactive dragging.
- Verify cold and warm requests, decoded dimensions, transfer sizes, duplicate bodies versus cache revalidation, orientation changes, series switches, initial/neighbor appearance, layout shifts and JS/CSS bundle changes. Set per-surface byte budgets only after baseline/quality measurements and owner agreement; do not use the previous 0.309 MB single-image reference as a universal limit.

## Required approval sequence

1. UI/container specification, including measured overlays and safe-area test matrix.
2. Race reference selection and provenance review.
3. Portrait artwork preparation.
4. Landscape artwork preparation.
5. Final cropping against actual containers; no final artwork approval before this step.
6. Owner visual approval of both final crops and naming/version manifest.
7. Optimization and rendered quality comparison; material differences return to owner review.
8. Codex integration using exact approved files and existing mappings/components.
9. Browser/mobile QA: all target sizes/themes, touch/mouse, gestures, overlays, keyboard/reduced motion, orientation, network and physical iPhone Safari/Telegram where supported.

Implementation, Preview deployment and Production deployment each require their own scope authorization. Passing tests is not owner approval.

## Decisions still required from owner

- Approve DS-02 requirements and component-specific numeric geometry/safe-zone templates.
- Decide whether/when to migrate Home to separate orientation assets; no automatic reuse of Rankings 2.35:1 / 5.5:1 ratios.
- Approve DPR/quality/byte budgets and whether stable public filenames need a versioned naming strategy.
- Agree durable archive/backup and rights/provenance conventions for 2027 references.

Status remains DRAFT / AWAITING OWNER REVIEW.
