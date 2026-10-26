# RANK-03G — Final T100 Cycling integration and Rankings QA

Date: 2026-10-23. **LOCAL IMPLEMENTATION / AWAITING FINAL OWNER REVIEW.** The supplied artwork is owner-approved; this does not mark the rendered Rankings UI or branch approved.

## Asset verification and implementation

`public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_cycling_final.webp` is WebP VP8, **2078×378**, **211,262 bytes** (206.3 KiB), SHA-256 `c897c1b1275d20a21b520ec7f10ad33bc5915625c838c5af4c5df48a29bc53a2`. Properties match the supplied expectations. Used byte-for-byte; no generation, re-encoding, cropping or upscaling of the source file.

Only T100 Cycling's landscape URL changes to this file, with centered position. Scene-specific `object-fit: contain` displays the entire pre-cropped image in the existing 5.5:1 container. Its ratio is 5.49735:1; contain avoids even the half-source-pixel vertical clipping that cover would cause and preserves the complete image when safe-area offsets increase frame height. Normal horizontal inset from ratio rounding is less than 0.25 CSS px per side at the requested sizes. With simulated extra safe areas, vertical space may appear around the complete image; the frame height policy is unchanged. No distortion, mask, fade, border, shadow or artwork overlay added.

The unblurred retained-image fallback uses the same contain positioning for this scene. `<picture>` and loading logic are untouched. The other seven landscape focal positions (including IRONMAN Running 52%), all eight portrait assets, series/scene selection, sharp boundaries, table/data and navigation are unchanged.

The manifest retains the old Cycling record and adds an `activeReplacement` with filename, dimensions, bytes, hash and owner-supplied provenance. Old `t100_cycling.webp`, old PNG and intermediate `t100_cycling_1.png` are preserved. No claim is made that the final WebP was encoded locally from that intermediate PNG. Local rollback would revert this scene's URL/fit/position mapping; no rollback was performed.

## Actual rendered visual review

At **667×375, 844×390, 956×440**, both riders, both bicycles and wheels fit inside the banner; Tower Bridge, London skyline, Thames and T100 barriers remain recognizable. Back lies over the upper-right background rather than cyclists or central bridge towers. The image is fully visible, with the same frame dimensions as RANK-03E. At mobile scale the athletes are naturally smaller than in the rejected source crop; final visual acceptance remains the owner's decision.

Both themes, four requested portrait sizes and the three requested landscape sizes are covered, plus 1440×900 desktop. The eight-scene matrix checks responsive source selection, no wrong-orientation downloads, fit/dimensions, sharp boundary, safe areas, no horizontal overflow and unchanged nav stacking/capsule. Source image bytes have not changed.

## Focused performance comparison

Baseline is the completed RANK-03E local production build. Image file bytes are distinct from browser Resource Timing transfer sizes.

| Metric | Previous | Final |
|---|---:|---:|
| T100 Cycling active WebP | 278,246 B | 211,262 B |
| Eight active landscape WebPs | 1,992,386 B | 1,925,402 B |
| Total emitted JS | 1,570,493 B | 1,570,499 B |
| Largest sports JS chunk | 1,293,108 B | 1,293,114 B |
| Total emitted CSS | 78,136 B | 78,397 B |

Cycling decreases by **66,984 B (24.1%)**; the active landscape set decreases by 3.36%. JS +6 B is the public filename change; no image data is embedded in JS. CSS +261 B is the scene-specific no-clipping rule. The RANK-03E 541 B reduction remains historical; this patch adds 261 B back, still 280 B below the preceding RANK-03D CSS total. Old assets/originals remain in public and dist for preservation, so total emitted static directory bytes do not shrink with active payload. They are not eagerly downloaded by the page.

The prior 0.309 MB reference was IRONMAN Swimming scene 0 plus ten avatars, not T100 Cycling. The final focused network run deliberately selects scene 1 (Cycling); comparing its total directly to Swimming would be misleading. Results and source URLs are recorded in `/tmp/300w-rank03g-final/after-network.json`. Cache and transfer observations are local Chromium/Vite, not native Safari/Telegram measurements. No reliable real-device latency conclusion is inferred.

The pre-existing >500 kB sports chunk and RaceDetailPage hook warnings remain. No thresholds or audit rules were weakened. Performance assessment: **PASS WITH NOTES**, confirmed by the focused network results below.

## Validation and evidence

- `npm run check:release`: **18/18 PASS**, including production build, lint, ranking, navigation, data and integration checks.
- `npm run lint`: zero errors; existing RaceDetailPage warning only.
- Navigation/T100/IRONMAN unit tests: **30/30 PASS**.
- Showcase matrix: **128 combinations PASS**, plus manifest/hash/dimensions, eight legacy PNG/WebP pairs and safe-area checks. Final pre-cropped asset is validated independently rather than compared against the obsolete PNG composition.
- Physical mouse/touch first/last row, Back, Feedback, scrolling and z-index 40 tests: **14 viewport/theme groups PASS**.
- Broad functional suite: all twelve season/gender/series tables, selectors and persistence, swipe/keyboard/wheel, profile links, Back/Feedback and navigation. Logs below record final outcome.
- Protected data inventory: 129 of 130 prior protected hashes unchanged; only the intentional showcase mapping differs. All source artwork hashes, including the final supplied WebP, unchanged. Only package manifest metadata changed. Rankings datasets, identity mappings, athlete registry, results and internal ranking remain byte-identical.

Evidence root: `/tmp/300w-rank03g-final/`.

- Three requested screenshots: `screenshots/crop-t100-2-dark-667x375.png`, `crop-t100-2-dark-844x390.png`, `crop-t100-2-dark-956x440.png`; light equivalents also present.
- All eight scenes: `comparison.png` / `comparison.html` built from actual app screenshots.
- Representative portrait: `screenshots/crop-t100-2-dark-390x844.png` (unchanged portrait artwork).
- `navigation/` shows first/last rows and Feedback access.
- `release.log`, `lint.log`, `unit.log`, `showcase.log`, `navigation.log`, `interactions.log`, `performance.log`, `history.log` contain verification output.
- Earlier blocked experiments remain separately preserved under `/tmp/300w-rank03g/`; prior RANK-03D/E artifacts were not overwritten.

## Task-specific files

- `src/pages/rankingsShowcase.ts` — only Cycling landscape URL/position.
- `src/pages/OfficialRankingsPage.css` — contain for final pre-cropped scene and retained fallback.
- `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/manifest.json` — active replacement metadata; original entries retained.
- `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_cycling_final.webp` — supplied by owner, referenced unchanged.
- `scripts/test-rankings-showcase-browser.mjs` — new asset/hash/dimension/fit assertions.
- `docs/PROJECT_BOARD.md`, `docs/official-rankings-ui-2026-10-22.md`, this report.

All prior uncommitted work and artifacts are preserved. No staging, commit/push/deployment, version bump, D1, secrets, Telegram or Cloudflare changes. Stop for final owner review. Remaining limitations: existing large sports chunk, native-device verification, and final rendered composition approval.

### Final execution results

Broad functional suite: **14/14 viewport/theme groups PASS** plus home/bottom-navigation check, zero runtime exceptions. Dedicated browser Back/Forward and selection restoration check PASS; moving capsule animation and settled active alignment PASS. `git diff --check` and relative documentation links PASS.

Cycling network run: IRONMAN Cycling cold **333,094 B / 11 images**; switch to T100 Cycling **297,334 B / 11 images**, including exactly one final WebP (**211,562 B Resource Timing transfer**, 211,262 B body) and ten avatars. No old Cycling WebP or unused portrait artwork fetched in landscape. First rotation to portrait loads its PNG; rotation back has **0 requests / 0 B**; gender rerender fetches only avatars. All measured CLS values **0**. Warm reload reports 3,300 B across eleven revalidated resources, not full image retransmission. No duplicate showcase downloads observed.

Control rerun with the original Swimming scene: cold landscape **308,874 B / 11 images**, identical to RANK-03D/E baseline. Raw reference results: `reference-network.json` and `reference-performance.log`.
