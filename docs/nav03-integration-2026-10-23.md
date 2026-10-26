# NAV-03 — Global floating navigation integration

**Current approval — GIT-01B instruction (no separate approval date supplied):** NAV-03 global integration is OWNER APPROVED by the GIT-01B owner instruction. The earlier pending-review statement below is retained as historical evidence.

Status: LOCAL IMPLEMENTATION — AWAITING OWNER VISUAL REVIEW. The owner approved NAV-02's design, not yet the global integration. No commit/push/deployment.

## Integration

`BottomNav` now always renders the approved compact navigation, without dev flags, URL checks, or alternative route logic. `?nav=02` and `?nav=baseline` no longer affect it. All existing icons, destinations, aria labels and currentPage ownership are retained.

The working prototype capsule was renamed to `NavActiveCapsule.tsx`, keeping its 210 ms transform animation and remount-position preservation. Rapid switches start from the rendered position; resize and reduced motion settle at the current destination. There is one capsule per mounted panel, no delayed routing.

Approved geometry/material is centralized in `src/components/BottomNav.css`: 58 px portrait, 48 px short landscape, 44 px targets, same radii, gutters, 640 px landscape cap, dark glass and yellow accent. The RANK-02 `z-index: 40` sits above content and below the settings overlay (100). Old nav backgrounds, active fills and dimensions were removed from App/theme/Home/Rankings CSS and the glass stylesheet. Shared Back glass and icon CSS remain intact. Unused `App.backup.css` is not loaded and was left untouched. Existing page content padding is retained.

## Files

- `src/components/BottomNav.tsx`: global path, removed query/dev switch.
- `src/components/NavActiveCapsule.tsx`: renamed from `NavPrototypeCapsule.tsx`, behavior unchanged.
- `src/components/BottomNav.css`: approved style consolidated from `nav-prototype.css` and baseline glass/layout rules.
- `src/App.css`, `src/theme-refinements.css`, `src/home-refinements.css`, `src/bottom-nav-glass.css`, `src/pages/OfficialRankingsPage.css`: obsolete navigation rules removed only.
- `scripts/test-global-nav-browser.mjs`: replaces prototype-only browser test with global integration coverage.
- `scripts/test-bottom-nav-browser.mjs`: targets button positions with `nth-of-type` instead of `nth-child`, accounting for the single decorative capsule without changing hit-testing assertions.
- `docs/PROJECT_BOARD.md`, `docs/nav02-prototype-2026-10-23.md`, this report.

Obsolete runtime/test paths removed: `NavPrototypeCapsule.tsx`, `nav-prototype.css`, `scripts/test-nav-prototype-browser.mjs`. Pre-integration copies are preserved under `/tmp/300w-nav03/before/`. Prior NAV-02 screenshots/video remain under `/tmp/300w-nav02/`.

## Local review

Use the ordinary local preview URL `http://127.0.0.1:5390/#/rankings` after a build (Vite preview on 5390), or the existing dev server at `http://127.0.0.1:5391/#/rankings`. No query parameter is needed.

Native Safari/iPhone and Telegram owner verification remains necessary: automated interaction testing uses Chromium emulation, including Telegram inset CSS variables. No changes were made to official standings, athlete identity/data/enrichment, results, internal ranking, artworks, typography, color tokens or remote configuration.

## Verification

The browser suites use the local production build at port 5390, not the old dev-only flag. Global suite: 14 viewport/theme combinations (320×700, 375×812, 390×844, 440×956, 667×375, 844×390, 956×440); all five active states; 50 mouse/touch destination pairs; repeated active selection; direct loading and refresh; Back/Forward; nested athlete/race routes; interrupted remount animations; Enter/Tab/Space; reduced motion. All PASS, no runtime exceptions. Legacy query values both leave the new global panel active. Race Results landscape clearance and simulated Telegram bottom insets PASS.

`node --test scripts/test-navigation.mjs scripts/test-t100-standings.mjs scripts/test-ironman-standings.mjs`: 30/30 PASS. `npm run check:release`: 18/18 PASS, including production build and lint. Final ESLint has no errors; existing RaceDetailPage hook warning remains. Existing sports chunk-size warning remains. Hash checks: all 130 protected data/artwork/configuration files unchanged; the capsule implementation differs from the approved prototype only in its exported name. `git diff --check` PASS.

Evidence:

- Before approved design: `/tmp/300w-nav02/nav02-390-dark-rankings.png`, `/tmp/300w-nav02/nav02-956-dark-rankings.png`.
- After global integration: `/tmp/300w-nav03/nav03-390-dark-rankings.png`, `/tmp/300w-nav03/nav03-956-dark-rankings.png`; equivalent screenshots for all viewports/themes/active tabs are in the same directory.
- `browser.log`, `measurements.json`, `unit.log`, `release.log`, `lint.log` document the checks.

All earlier local changes and artifacts are preserved. Dedicated RANK-02 rerun: 14/14 viewport/theme groups PASS, 196 first/repeated Rankings scenarios plus all-tab checks, full panel hit testing, row links, Back/Feedback and scroll clearance. Initial run selected the wrong button because the old test used `nth-child`; after adapting it to `nth-of-type`, all original assertions passed. Evidence: `/tmp/300w-nav03/rank02/interaction-trace.json` and `rank02.log`.

Final eight-second video: `/tmp/300w-nav03/navigation-demo.webm` (161 browser screencast frames, encoded locally). No query flags are used. Integration is ready for owner review; automated PASS is not owner approval.
