# Showcase final-crop-first acceptance checklist — DRAFT

Use with the [technical specification](../../ds02-showcase-technical-templates.md). Passing mechanical checks is not owner visual approval. No integration or deployment authorization is implied.

## Mechanical checks (automatable; proposed harness, not implemented here)

- [ ] Explicit surface, race/series ID, season, orientation/composition revision and approved viewport set.
- [ ] Absolute source and optimized paths exist; no unresolved `~`, relative-only handoff or guessed filenames.
- [ ] Decode actual files; validate format, encoded dimensions, aspect ratio, byte count and SHA-256 against delivery manifest. Do not substitute density-corrected browser naturalWidth for encoded pixels.
- [ ] Preserve original bytes and previous revisions; no unnoticed encoder resize/crop or stretching.
- [ ] For fixed zero-inset container, compare final ratio within rounding tolerance (proposed≤0.5%); for adaptive Home/inset profiles, validate each approved viewport crop instead of requiring one ratio everywhere.
- [ ] Compute cover/contain and focal-position source rectangles, rounded clip and expanded overlay exclusions. Owner-supplied critical bounding boxes lie inside every approved visible region outside UI; fail unresolved boxes rather than auto-detect/guess identity or anatomy.
- [ ] Render 320×700,375×812,390×844,440×956,667×375,844×390,956×440,1200×1600; both themes, agreed DPR and real/synthetic inset profiles. Include longest localized title/tags/date/location and larger text settings.
- [ ] Back/open buttons retain actual positions and targets. Portrait≥1024 behavior and landscape gutters tested separately.
- [ ] Capture cold-cache and warm-cache network events; selected source only, adjacent decode availability, no duplicate full-body downloads. Report 304/cache revalidation separately.
- [ ] Measure initial, neighboring and active-window payload versus agreed per-surface budget; record justified exceptions, browser/network/DPR.
- [ ] No image-induced layout shift or distortion; no embedded images/new heavy JS dependencies; preserve existing loading strategy and inspect build warnings.
- [ ] Check orientation changes, interrupted/rapid drags, short return, vertical scroll, links, indicators, picker and Bottom Navigation.

## Owner visual checks (cannot be certified by file metadata)

- [ ] Entire required anatomy and bicycle wheels remain visible at every intended crop; no false sense of safety from a single yellow marker in the schematic.
- [ ] Series/race logos are readable; no crop through lettering; no conflict with Back or open button.
- [ ] Landmarks/geography survive cropping and are consistent with references.
- [ ] Equipment, posture, race discipline, non-drafting spacing where applicable, transitions and time-of-day lighting look plausible.
- [ ] Home text is readable over gradients; important subjects avoid longest localized overlay blocks and rounded corners.
- [ ] Optimized WebP retains acceptable texture, lettering, skin/equipment detail and gradients at intended DPR.
- [ ] No unexpected crop, blank adjacent frame or unacceptable softness on orientation/series change.
- [ ] Physical iPhone Safari and Telegram Mini App review recorded, including device/insets and result. Emulation is not equivalent.

## Approval and STOP rules

- [ ] Owner approves FINAL rendered crop previews and exact source/optimized hashes, not just master composition.
- [ ] Delivery form complete; rights/reference provenance recorded; generated artwork identified as illustrative.
- [ ] If ratio/crop/identity/reference/artwork differs, STOP and report; no silent artistic cropping, regeneration, substitution or UI changes.
- [ ] Integration, Preview and Production authorized separately. Preserve rollback originals and archive; raw evidence not uploaded without authorization.
