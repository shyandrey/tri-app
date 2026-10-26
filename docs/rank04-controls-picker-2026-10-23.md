# RANK-04 — Rankings controls and season picker

Date: 2026-10-23. Status: **LOCAL IMPLEMENTATION / AWAITING OWNER VISUAL REVIEW**. RANK-03 artwork approval is preserved; this does not imply approval of the new controls.

## Implementation

The series indicators previously reserved 110 px on the right for the overlapping season button, so they were not centered in the page. The season wrapper used a negative 44 px margin; gender controls occupied a separate row with right-aligned dots and an elongated active marker.

Now:

1. Series indicators occupy a standalone 44 px row immediately below the image, centered in the symmetric content shell (and therefore the viewport).
2. A three-column grid below uses `minmax(0,1fr) 88px minmax(0,1fr)`. Gender label is left, gender indicators exactly centered, season button right. Equal outer columns keep the center independent of label/button widths.
3. Both indicator groups share the same styles: 7 px circles, 44 px center spacing, neutral inactive color and current series accent when active. All buttons retain 44×44 px targets. No elongated marker or decorative dot transition.
4. Season button retains calendar/year/chevron and existing handlers. Compact padding/icon spacing and a 16 px gender label only at widths ≤350 px prevent overlap at 320 px. Table styles are unchanged.

The bright wheel rectangle was the generic Rankings `:focus-visible` outline applied to the automatically focused listbox. A scoped, sufficiently specific override removes only that wheel outline. A neutral translucent 48 px selection band replaces the bordered selection strip; keyboard focus remains visible as a subtle neutral inset cue on that band. Focus is not globally disabled. Header remains “Сезон” / “Готово”. Done gets locally scoped glass-like styling, coherent inherited font and a 44 px minimum target, without borrowing Back's absolute positioning or changing global typography.

The dialog uses border-box so its border stays inside its full-width sizing. A rotation regression exposed the prior content-box overflow on narrow portrait widths; this targeted geometry fix prevents it. Existing safe-area bottom padding, native modal stacking/backdrop, scroll locking, focus restoration and dismissal handlers are preserved.

No gesture handlers, year values, scrolling/snap/selection semantics, routes, table data, identity mappings or artwork are changed. `StandingsSeasonPicker.tsx` adds only a class to Done; the behavior code remains identical.

## Verification scope

Local production build served by Vite, Chromium CDP. Both themes at 320×700, 375×812, 390×844, 440×956, 667×375, 844×390 and 956×440. Native Safari/Telegram remain an owner-device check.

New controls/picker regression checks:

- Both indicator groups centered to within 1 CSS px of viewport center.
- Label, gender indicators and season button vertically aligned; no overlap.
- Identical dots/spacing/colors and ≥44 px touch targets.
- No horizontal overflow.
- No outer wheel accent outline; neutral selected band remains 48 px high.
- Keyboard year selection, Shift+Tab to Done, Enter dismissal and focus return.
- Selected year preserved through orientation changes while sheet remains open; sheet fits viewport.
- Body scroll lock restored on dismissal; nav z-index 40 preserved.

Broader existing suites cover all twelve rankings tables, series/gender switching and swipes, wheel touch/keyboard behavior, season persistence, profile links, Back/Feedback, real mouse/touch navigation, first/last row access and responsive artwork/safe areas.

During development the tests caught an insufficiently specific focus override and content-box dialog overflow. Both were fixed; a CDP keyboard test was also corrected to dispatch proper Tab key metadata and explicit Shift+Tab. No test assertion was removed to mask an application defect.

## Before/after evidence

Root: `/tmp/300w-rank04/`.

- `before/controls-{width}-{theme}.png`, `after/controls-{width}-{theme}.png`.
- `before/picker-{width}-{theme}.png`, `after/picker-{width}-{theme}.png`.
- Representative portrait: width 390, dark; landscape: width 844, light.
- `comparison.png` / `comparison.html`: compact actual-rendered before/after sheet.
- `controls.log`, `interactions.log`, `navigation.log`, `showcase.log`, `release.log`, `unit.log`: validation evidence.
- Previous task artifacts remain separate and were not overwritten.

152 data/artwork file hashes captured before this task remain unchanged. This includes official standings, athlete data and approved showcase images. Existing uncommitted changes are retained.

## Task-specific changed files

- `src/pages/OfficialRankingsPage.tsx` — reorder controls only.
- `src/pages/OfficialRankingsPage.css` — centered grid, shared dots, picker styling and border-box.
- `src/components/StandingsSeasonPicker.tsx` — Done styling class only.
- `scripts/test-rankings-controls-browser.mjs` — geometry, picker appearance, keyboard and orientation regression.
- `docs/PROJECT_BOARD.md` — RANK-04 in progress, awaiting review.
- `docs/official-rankings-ui-2026-10-22.md` — append RANK-04 status.
- This report.

No commit, push, deployment, version bump, D1/Cloudflare or other remote changes. Remaining decision: owner visual approval of controls and picker, including native Safari/Telegram. Existing sports chunk and RaceDetailPage hook warnings are outside this UI patch.

## Executed checks

- `npm run check:release`: 18/18 PASS, including production build and ESLint. Existing sports chunk size warning remains.
- `npm run lint`: 0 errors, existing RaceDetailPage hook warning only.
- `node --test scripts/test-navigation.mjs scripts/test-t100-standings.mjs scripts/test-ironman-standings.mjs`: 30/30 PASS.
- Broad Rankings browser suite: 14 viewport/theme groups PASS, all twelve tables and interactions; zero runtime exceptions. Executed from a temporary copy with only screenshot output redirected to preserve earlier evidence.
- Physical mouse/touch navigation regression: 14 viewport/theme groups PASS; first/last row, Back/Feedback, no click interception and z-index 40.
- Relative documentation links and `git diff --check`: PASS.

All tests are local. No native-device or remote-infrastructure success is claimed.

Final controls/picker suite: **14/14 viewport/theme groups PASS**, including actual dot-center coordinates, keyboard dismissal/focus return and open-sheet rotation. Existing showcase suite: **128/128 scene/viewport/theme combinations PASS**, plus source asset and safe-area checks. Comparison sheet generated and visually inspected: `/tmp/300w-rank04/comparison.png`. No remaining confirmed functional defects from this task; owner visual approval and native Safari/Telegram review remain pending.
