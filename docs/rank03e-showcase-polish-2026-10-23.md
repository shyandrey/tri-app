# RANK-03E — Landscape showcase final polish

Date: 2026-10-23. Local review candidate, **not owner-approved**. No deployment or data integration. Six landscape compositions had preliminary owner approval; their focal points remain unchanged.

## Root cause and patch

The soft bottom edge came from `.standings-showcase::after`: an 18 px linear gradient over the image. Rankings also had a portrait-only blurred `::before` backdrop and a side mask on large portrait screens. Removed these effects within `OfficialRankingsPage.css`. No border, shadow, separator or rounding was added. The existing full-frame, unblurred landscape background that retains the previous loaded picture is preserved; it prevents an empty frame during switching and does not soften the boundary. Back and bottom-nav glass effects serve other controls and are unchanged.

The common 5.5:1 landscape frame, picture sources and selected-image loading are unchanged. Portrait PNGs, crop positions, heights and scene rotation remain unchanged; only their boundary effects are removed. Large portrait screens retain centered contain geometry at 320 px height, now without side masking or a blurred backdrop.

## Crop feasibility

Both source images are 1947×808. At 5.5:1 the visible source-height band is approximately 354 px (43.8% of the original). Changing vertical object-position moves that band; it cannot increase its height. Across 667×375, 844×390 and 956×440 the same source band is visible, scaled without distortion. Heights remain 121.3, 153.5 and 173.8 px before safe-area offsets.

| Scene | Previous | Candidate A | Candidate B | Local decision |
|---|---|---|---|---|
| IRONMAN Running | 50% 48% with bottom fade | 50% 52%, sharp edge | 50% 54%, sharp edge | Apply 52% as review candidate; both heads remain visible, smaller right-hand barrier lettering becomes more recognizable. |
| T100 Cycling | 50% 80% | 50% 60%, sharp edge | 50% 40%, sharp edge | Keep 80%; alternatives shown only in review screenshots. |

IRONMAN Running at 52% shows source y≈236–590. The main head starts around y≈250 (visual estimate), retaining a small margin. At 54% that margin becomes too small. Both runners and coastal walls remain recognizable, but the prominent large lower-left IRONMAN wordmark remains cropped. The improvement is limited; it is not full restoration of the original branding. If that complete wordmark is essential, a separately approved composition placing a readable mark nearer the upper-body band is needed.

T100 Cycling at 60% shows more river/bridge but crops much of the foreground rider. At 40% recognizable Parliament/London Eye elements increase, but the foreground rider disappears. At 80% the cyclists and T100 barriers are retained, with skyline still cropped. No CSS-only candidate satisfies both requirements at the fixed ratio. Recommended next option is an owner-approved dedicated 5.5:1 composition that places both cyclists and recognizable landmarks inside one vertical band. Do not generate or substitute it without approval. No separate or modified artwork was created.

All 24 source image hashes match the prior audit. Other six landscape focal positions remain identical. Source blur inside the photographic artwork itself is not a CSS boundary effect and was not altered.

## Floating navigation

No NAV-03 layout or event logic changes. The initial landscape viewport can place the fixed navigation over the first ranking row. Physical mouse/touch tests at all seven requested sizes, in both themes, confirm:

- The entire first row can be scrolled above the navigation and selected.
- Visible row links outside the navigation bounds receive input.
- The navigation interior wins hit testing over underlying rows; its active Rankings tab stays on Rankings.
- Last-row athlete links and Feedback remain visible and selectable above the panel after scrolling.
- Back returns to Rankings; no horizontal overflow; z-index remains 40.

This overlap is consistent with the existing floating panel, not a confirmed interaction defect. No repositioning or redesign was introduced.

## Verification and performance

Latest comparison baseline: completed RANK-03C/D build and network artifacts, copied into `/tmp/300w-rank03e/` before editing. This is a focused regression check, not a repeat of the complete performance audit.

| Emitted build metric | RANK-03C/D | RANK-03E |
|---|---:|---:|
| Total JS bytes | 1,570,493 | 1,570,493 |
| Largest sports JS chunk | 1,293,108 | 1,293,108 |
| Total CSS bytes | 78,677 | 78,136 |
| Artwork bytes | unchanged | unchanged |

Production build and release gate pass. The existing sports >500 kB warning and RaceDetailPage hook warning remain; neither was suppressed. No image loading implementation or dependency changes. Native Safari/Telegram performance is not measured by the local Chromium tests.

Focused network regression matches the RANK-03C/D baseline exactly: portrait cold 11 images / 2,269,421 B, landscape cold 11 / 308,874 B (one selected showcase plus ten athlete photos); warm reload 3,300 B of Resource Timing overhead/revalidation, not full image bodies. Series switch 310,718 B; rotating to portrait requests its first-use PNG, rotating back reuses cache (zero requests). Gender changes request only new athlete photos. No inactive showcase variants or duplicate showcase downloads observed. CLS was 0 in these local Chromium runs. Performance: **PASS WITH NOTES** (pre-existing large sports chunk and native-device verification remain).

Executed validation:

- `npm run check:release`: **18/18 PASS**, including build, lint, ranking and navigation.
- `npm run lint`: zero errors; existing RaceDetailPage hook warning only.
- `node --test scripts/test-navigation.mjs scripts/test-t100-standings.mjs scripts/test-ironman-standings.mjs`: **30/30 PASS**.
- `node scripts/test-rankings-polish-browser.mjs`: **14 viewport/theme groups PASS**, both physical mouse and touch input.
- `TRI_SHOWCASE_OUTPUT=/tmp/300w-rank03e/screenshots node scripts/test-rankings-showcase-browser.mjs`: **128 combinations PASS**, plus safe-area checks and eight PNG/WebP correspondence checks.
- Existing `test-official-rankings-browser.mjs` run from a temporary copy with only its output path redirected: **14 viewport/theme groups PASS**, all twelve tables, series/gender swipes, wheel/keyboard, profile links, history, Back/Feedback, navigation and zero runtime exceptions.
- `git diff --check`: PASS. Local documentation links resolve.

Protected baseline: 129 of 130 existing protected hashes unchanged; the intentional exception is the showcase mapping module. Official standings, athlete data, results, enrichment and internal ranking remain byte-identical. All previous modified/untracked artifacts and archives are preserved.

## Review artifacts

Root: `/tmp/300w-rank03e/`.

- `crops/{ironman|t100}-{before|sharp-current|candidate-a|candidate-b}-{667x375|844x390|956x440}.png`: 24 actual rendered comparisons, with candidates applied only via temporary page CSS during capture.
- `screenshots/`: final local implementation across all eight scenes, portrait/landscape, both themes. Includes all required 24 dark landscape screenshots and their light equivalents.
- `navigation/initial-overlap-*`, `first-row-*`, `last-row-feedback-*`: real layout and accessible scroll positions.
- `comparison.png` and `comparison.html`: compact labeled review sheet using rendered screenshots, not reconstructed artwork.
- Portrait before evidence remains in `/tmp/300w-rank03/screenshots/`; after evidence is in the new directory. Earlier artifacts were not overwritten.
- `release.log`, `unit.log`, `navigation.log`, `showcase.log`, `interactions.log`, `performance.log`: execution evidence.

## Task-specific changed files

1. `src/pages/OfficialRankingsPage.css` — remove Rankings fade/blur/mask.
2. `src/pages/rankingsShowcase.ts` — IRONMAN Running Y 48% → 52%; all other focal values unchanged.
3. `scripts/test-rankings-showcase-browser.mjs` — assert sharp boundary, no blur/mask/border/shadow in the responsive matrix.
4. `scripts/test-rankings-polish-browser.mjs` — new first/last row and navigation coordinate-input regression checks.
5. `docs/PROJECT_BOARD.md` — add RANK-03E pending owner review.
6. `docs/official-rankings-ui-2026-10-22.md` — append follow-up status.
7. This report.

Existing accumulated work is not newly attributed to RANK-03E. No commit, push, deployment, version bump or remote mutation. Stop for owner visual review: approve/revise the limited IRONMAN improvement and decide whether to retain the existing T100 crop or authorize a dedicated composition.
