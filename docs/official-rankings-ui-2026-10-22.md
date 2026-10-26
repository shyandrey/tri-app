# Official Rankings — local UI review, 2026-10-22

## Current closure — RANK-07, 2026-10-23

Owner approval recorded from the RANK-07 instruction; not inferred from test results.

| Scope | UI approval | Local implementation | Preview | Production |
|---|---|---|---|---|
| RANK-01 UI, RANK-02, RANK-03, RANK-04, NAV-03 | Owner approved | Present | Included in RANK-05C | Latest Rankings UI not deployed |
| RANK-05 interactive swipe | Owner approved on physical iPhone via Preview | Present | Deployed | Not deployed |
| RANK-05B portrait optimization | Owner approved | Present | Deployed | Not deployed |
| RANK-06 gender pictograms | Owner approved locally via Safari screenshots | Present | **Not deployed** | Not deployed |

Preview: https://preview.300w.app/#/rankings. RANK-05C deployment `e441f5f7-05d9-41dc-bbf9-594acb29fd82`, Worker version `84653431-5134-4216-813a-2b5bb4c573fc`; application 0.0.0. This records the completed deployment report, not a new live verification. Base Git SHA `c8f52e02a75e0b413dddbfee77f477232c5301d3` does not identify the uncommitted UI patch. No commit/push or deployment performed for RANK-07.

Approved UI contract:

- Eight portrait and eight landscape scenes, separate responsive WebP selection; sharp boundary without blur/fade. Native finger-following showcase track with Scroll Snap; circular series indicators unchanged.
- Left gender label, centered Home RaceCard gender pictograms, right season selector. Current series accent for active / neutral for inactive; controls stationary during table drag.
- Independent gender track with adjacent table visible, 12px gap, smooth snap and insufficient-swipe return, natural vertical scrolling and suppression of athlete link activation after drag.
- iOS-like season wheel, neutral selection band, glass-like Done, no bright accent outline; portrait/landscape, keyboard and focus restoration supported.
- NAV-03 floating navigation, RANK-02 stacking/hit-target fix, athlete profile links, standard Back and centered Feedback entry. Technical snapshot metadata is not shown in the current UI.

UI approval does not resolve data lifecycle work: registries remain top-10 snapshots (120 total rows), historical seasons retain pending-final status, LIVE does not mean automatic fetching. Full official standings/history/refresh coverage remains separate from the closed UI review. No data was modified here.

Performance: portrait assets reduced ~86.5% in RANK-05B. Existing sports chunk warning is PERF-01, a separate pre-production review, not an artwork optimization failure. RaceDetailPage useMemo warning remains. [Architecture audit](ds02-showcase-architecture-audit-2026-10-23.md) and [DS-02 draft](ds02-showcase-guidelines-draft.md) are not yet owner-approved.

Historical reports and their observations remain below. Earlier references to discrete swipe, snapshot labels, blurred backgrounds, pending visual review or local-only status describe their original checkpoints and are superseded by this closure for current UI status. No historical evidence was deleted.

## Historical implementation report — 2026-10-22 (superseded status)

RANK-01 remains IN PROGRESS pending owner review. Route: `#/rankings`. Local implementation only; no commit, push or deployment.

## Data and architecture

Both registries were already present locally before this task: [IRONMAN](../src/data/officialStandings/ironman/) and [T100](../src/data/officialStandings/t100/), six datasets / 60 confirmed rows each. T100 is not reconstructed from old candidates or /tmp. All 12 JSON datasets remain byte-for-byte unchanged. They currently contain TOP_10_ONLY, not full season standings.

[Presentation adapter](../src/data/officialStandings/index.ts) projects existing official rows without sorting, calculating points or changing identity. It lives inside the existing lazy sports boundary. Athlete photos/profile IDs come from the current catalog. Official source names, normalized flags and official points are rendered; internal athlete ranking is separate.

The displayed date is explicitly **«Снимок принят»**, using owner acceptance metadata. Unknown capture/source-update dates are not invented. Historical seasons retain pending-final status and display «Итоговый статус сезона уточняется». LIVE does not imply live fetching. Prior registry provenance fields describing the earlier local-only approval remain untouched; the new owner instruction authorizes this local UI integration.

## Interaction and design

- Home's existing shortcut is now «Рейтинги и очки». Navigation order: Home / Calendar / Athletes / Rankings / More. Existing PointsTableIcon; five equal slots and safe-area offset.
- Series selector preserves season/gender. Initial selection: IRONMAN / 2026 / Men.
- Native modal bottom sheet with three-year scroll-snap wheel, touch momentum, keyboard arrows/Home/End, confirmation, Escape and backdrop dismissal. Body scroll locked while open. Selection updates only after scroll settles; focus returns to trigger.
- Horizontal table swipe uses a distance/direction threshold; vertical scrolling does not switch gender. Dots and region arrow keys provide desktop alternatives. Athlete taps remain links; swipe suppresses accidental activation.
- Existing history state stores series/season/gender; returning from a profile restores them. No new global store or dependency.
- Scoped light/dark colors follow `prefers-color-scheme`; no global theme change. Reduced-motion removes transitions/smooth wheel scrolling. Other pages retain their existing theme.
- The existing race result component, styling and sorting logic were not modified.

## Rankings UI v2 — approved artwork

Owner confirmed all eight PNGs in `public/images/showcase/rankings/`, including the revised IRONMAN transition image. All eight original hashes match the supplied manifest; no images were regenerated, recompressed or edited. The directory already had the agreed structure.

`src/pages/rankingsShowcase.ts` defines path, series, scene, focal point and portrait/landscape position for each asset. A scene is selected once per page mount; series changes retain its index. No timer or automatic rotation. All text/logos are baked into the original images; the page adds no branding overlay.

Rankings alone expands the shell to viewport width. Content retains the existing maximum width and gutters. The Back button overlays the showcase; system/Telegram CSS inset variables reserve its safe position. Series dots and showcase swipe replace the segmented control. Season moves right; the native wheel becomes 144px tall in short landscape. Table swipe still changes gender independently. Headers are `# | ATHLETE | POINTS`; the redundant top-10 label is removed.

Exact approved tokens: IRONMAN `#ED174B`, T100 `#43D7D0`. Only podium rank numbers use the series accent. These fixed accents, especially cyan on white, do **not** meet 4.5:1 text contrast in every theme; no alternative shades were substituted. This remains a visual/accessibility review item. Names, points, headers and non-podium ranks retain contrast tests.

### Composition/crop review

The wide IRONMAN originals (~2.5:1) and the other five (~1.78:1) cannot all fill a compact landscape header with `cover` without losing baked-in branding or athletes. The implemented alternative keeps the foreground intact with `contain`; a subdued, blurred copy fills the viewport behind it. This is CSS-only, not a source-image edit. It avoids empty letterbox bands and distortion, at the cost of smaller artwork in wide landscape. Owner approval of this composition is still required.

| Asset | Source pixels | Foreground crop | Portrait position | Landscape position |
| --- | --- | --- | --- | --- |
| ironman_01_swim | 1983×793 | None | 50% 45% | 50% 50% |
| ironman_02_bike | 1983×793 | None | 50% 48% | 50% 50% |
| ironman_03_run_finish | 1983×793 | None | 50% 40% | 50% 50% |
| ironman_04_transition | 1671×941 | None | 50% 50% | 50% 50% |
| t100_01_swim | 1671×941 | None | 50% 44% | 50% 50% |
| t100_02_bike | 1672×941 | None | 50% 48% | 50% 50% |
| t100_03_run_city | 1672×941 | None | 50% 45% | 50% 50% |
| t100_04_transition | 1671×941 | None | 50% 50% | 50% 50% |

Hero heights without insets: 180 / 199 / 224px at 320 / 390 / 440px portrait; 160px in tested phone landscape; 320px desktop. The bottom 18px fade is theme-aware. Back is compact with a minimum 44px touch target. IRONMAN transition uses top-right Back placement to preserve its unusually high, left-aligned logo; the other scenes use top-left placement.

Native Safari/iPhone and Telegram WebView still require owner device review. Emulated CSS safe areas are tested; this task does not change Telegram integration or claim native-client E2E. Original PNGs are approximately 2–2.9MB each; optimization would require a separate reviewed asset preparation step.

## Changed files in this UI task

- `src/data/officialStandings/index.ts`
- `src/pages/OfficialRankingsPage.tsx`
- `src/pages/OfficialRankingsPage.css`
- `src/components/StandingsSeasonPicker.tsx`
- `src/components/BottomNav.tsx`
- `src/App.tsx`
- `src/types/Page.ts`
- `src/navigation/history.ts`
- `src/sports/SportsArea.tsx`
- `src/sports/SportsRoute.tsx`
- `src/theme-refinements.css`
- `scripts/test-official-rankings-browser.mjs`
- `scripts/test-navigation.mjs`
- `scripts/test-ui-cleanup-browser.mjs`
- `docs/PROJECT_BOARD.md` (existing changes preserved)
- `docs/official-rankings-ui-2026-10-22.md`

Previous uncommitted registry/preparation files are separate accumulated work and remain preserved. No package/version, athlete data, race results, ATH enrichment, internal ranking, News/Feedback, worker or infrastructure edits.

## Review artifacts

Screenshots and execution logs: `/tmp/300w-rankings-ui/`. Files `{ironman,t100}-{dark,light}-{390,1440}.png` show both series/themes at mobile and desktop widths. `season-wheel-390.png` captures the picker. Full-page screenshots retain the viewport-fixed bottom navigation at its original viewport position; scroll tests separately verify the final row/footer can move above it.

## Executed validation

- `node --test scripts/test-ironman-standings.mjs scripts/test-t100-standings.mjs scripts/test-navigation.mjs`: **30/30 PASS**.
- `node scripts/test-official-rankings-browser.mjs`: **PASS** on built local dist at 320/390/768/1440 px, both light/dark. Every run checks all 12 source tables, ten rows, exact points/names/IDs/links, no overflow, wheel touch scrolling/settling, body scroll lock, backdrop/Escape, focus restoration, keyboard category control, touch swipe starting over athlete links, vertical scroll isolation, profile/Back state, avatar fallback and table text contrast >=4.5:1. No runtime exceptions.
- Existing navigation browser suite: **PASS**, including Race Result sort/scroll and Back/Forward. Executed with only output paths redirected into this task directory to preserve prior /tmp artifacts.
- Updated existing `scripts/test-ui-cleanup-browser.mjs`: **PASS** at 320/390/430/768/1024/1440 and 844×390 landscape; Home layout/shortcut navigation, catalog, race surfaces and More preserved. One earlier run overlapped a build and failed to find More; sequential rerun against finished dist passed all seven sizes.
- `npm run build`, `npm run lint`, `npm run check:release`: **PASS**, release gate **18/18**. Existing RaceDetailPage hook warning and sports chunk >500 kB build warning remain. No new dependencies or npm scripts.
- Runtime comparison to pre-existing catalog baseline: **1167 athletes, 4592 results and internal ranking exactly unchanged**. Source hash comparison confirms both official registries, ATH enrichment, athlete/result data, News/Feedback, worker and package files unchanged.
- Documentation links and `git diff --check`: **PASS**.

Fast release gate does not itself execute browser or live infrastructure checks; the named browser suites above were executed separately. No remote infrastructure checks or mutations were performed. New Rankings browser suite is invoked explicitly, not added to the generic release-policy list in this task.

Current Git state: local modified/untracked work, nothing staged or committed. All pre-existing untracked artifacts and evidence archives retained. Local Vite preview is available at `http://127.0.0.1:5390/#/rankings` while the preview process is running.

## v2 execution and review artifacts

This follow-up changes only `src/pages/OfficialRankingsPage.tsx`, `src/pages/OfficialRankingsPage.css`, `scripts/test-official-rankings-browser.mjs` and this report; adds `src/pages/rankingsShowcase.ts` and `scripts/test-rankings-showcase-browser.mjs`. The owner-provided eight PNGs plus manifest remain byte-identical, untracked local assets. All previous v1 files/registry artifacts remain present.

Final screenshots/logs: `/tmp/300w-rankings-v2/`. `crop-{ironman,t100}-{1,2,3,4}-{dark,light}-{width}x{height}.png` captures each original scene at all seven sizes. Existing v1 screenshots under `/tmp/300w-rankings-ui/` remain preserved.

The v1 validation section above records that earlier implementation. For v2, use `node scripts/test-official-rankings-browser.mjs` and `node scripts/test-rankings-showcase-browser.mjs`: both target the built local page. Requested sizes: 320×700, 390×844, 440×956, 667×375, 844×390, 956×440 and 1440×900, both themes.

### v2 final results

- Registry/navigation unit tests: **30/30 PASS** (`unit.log`).
- Rankings interaction suite: **14/14 viewport/theme runs PASS**, all 12 tables in every run, exact values and profile links, both independent swipes, season wheel/touch/keyboard, profile Back, scroll clearance above navigation, no runtime exceptions (`browser-final.log`).
- Final artwork suite: **112/112 scene/viewport/theme combinations PASS**, eight images × seven sizes × two themes; decoded originals, intact foreground, viewport width, compact Back and simulated Telegram top insets (`crop-final.log`). Contact sheets `contact-dark.png` and `contact-light.png` visually reviewed for all eight scenes, with IRONMAN Transition Back on the right. Every source logo/athlete remains present; wide landscape intentionally reduces foreground size.
- Existing UI layout regression suite: **7/7 PASS**, Home, catalog, athlete profiles, race surfaces and More (`layout.log`).
- `npm run check:release`: **18/18 PASS**, including build, ESLint and existing ranking/data integrity checks (`release-final.log`). Existing sports chunk size and RaceDetailPage hook warnings remain.
- `git diff --check` and documentation links: **PASS**.
- 141 protected source/asset files checked against task-start SHA-256: **unchanged**, including official standings, athlete/result data, internal ranking, ATH enrichment, worker and eight PNGs/manifest. No source evidence archive modifications.

Status: **ready for owner visual review**, not deployment approval. Remaining decisions: landscape composition, low contrast of exact podium accent colors on light backgrounds, physical iPhone/Android Telegram E2E, and potential future PNG delivery optimization. No commit/push/deployment or version change.

## v2.1 visual corrections (supersedes v2 composition above)

Cause: the previous foreground used `contain` inside one frame; differing source aspect ratios produced different painted rectangles. An 8px top inset and scene-specific Back placement reinforced that inconsistency.

Portrait now uses one 2.35:1 full-width `cover` frame with no foreground inset, border or corner rounding. This produces approximately 136 / 166 / 187px at 320 / 390 / 440px, excluding safe insets. This shallower frame preserves the wide IRONMAN branding; it deliberately replaces the taller v2 frame. Source PNGs remain unchanged. Per-image portrait positions remain explicit; transition IRONMAN uses 30% vertical position, T100 bike/run 25% to preserve heads and logos. The first three IRONMAN scenes lose only narrow side edges; the five taller originals crop vertical surroundings and some lower body/wheels. This is not a full-body preservation claim; owner visual review remains required.

Phone landscape retains a common 160px frame, desktop 320px. `contain` is confined to these wider modes. A narrow edge mask blends the composition into its existing blurred background. The foreground box uses the original PNG aspect ratio so the mask applies to actual image edges, rather than unused space in a full-width contain box. The common frame and indicator coordinates are identical for all eight assets; foreground size still varies in landscape due to source aspect ratio, an explicitly retained adaptive compromise.

Back is the same top-right 44px arrow button for all scenes, with accessible name «Назад» and existing safe insets. Series dots and the season button share one 44px row; gender follows directly with its existing touch targets. No new controls or navigation state.

Athlete rows now use the Race Results presentation pattern: photo, left-aligned name with inline flag, points in their separate column. The visual ISO line is removed; ISO remains only the accessible flag label. Long names/flags wrap inside the name cell. Official names, ranks, points, IDs, photos, profile links and podium accent tokens are unchanged.

v2.1 files: `src/pages/OfficialRankingsPage.tsx`, `src/pages/OfficialRankingsPage.css`, `src/pages/rankingsShowcase.ts`, `scripts/test-official-rankings-browser.mjs`, `scripts/test-rankings-showcase-browser.mjs`, this report. Athlete profile polish is separate preserved work.

Evidence: `/tmp/300w-rankings-v21/`; previous v2 screenshots/logs are preserved. Exact artwork hashes and all 141 previously protected data/worker files remain unchanged. Known light-theme podium accent contrast and original PNG download size limitations remain; this task does not change approved colors or recompress artwork.

v2.1 validation: registry/navigation tests **30/30 PASS**; all 14 viewport/theme interaction runs **PASS** (all 12 tables, values/links, series/gender swipes, wheel, inline flags within the name column, no ISO subline, profile navigation, scroll clearance); final artwork suite **112/112 PASS** across eight scenes, seven sizes, both themes. Final `npm run check:release` **18/18 PASS** including build and ESLint; `git diff --check` **PASS**. Existing hook/chunk warnings remain. Logs: `unit.log`, `browser-final.log`, `crop-final.log`, `release-final.log` in the v2.1 evidence directory. Contact sheets: `contact-dark.png` (portrait) and `contact-light.png` (landscape). Landscape still intentionally has smaller foreground artwork and ambient space; it is not claimed to be an edge-to-edge crop. No commit/push/deployment or data changes.

## v2.2A — independent Back and Feedback fixes, owner decision 2026-10-22

The v2.2 landscape cover proposal remains blocked/rejected; no experimental crop is applied. Owner approved preparation of **eight separate landscape artworks, approximately 5:1–6:1**. Existing portrait artwork and v2.1 rendering are unchanged. No height increase, temporary crop, generated image or replacement PNG in this task.

Rankings now uses the same `page-back-button` markup/text («← Назад») and styles as Athlete Profile/Race Results, without `standings-back` overrides. Its focus uses the common style too. The shared Back positioning rule accounts for CSS safe-area/Telegram inset variables on all these pages; zero-inset top/right positions, dimensions and appearance remain unchanged. No new button variant.

The visible snapshot/season-status paragraph is removed. A centered «Сообщить об ошибке» button uses the existing `feedback-entry` style and existing generic Feedback form/navigation. Generic context is intentionally unchanged (`screen: more`, `route: #/more`), because the current backend only accepts existing more/athlete/race contexts. No new schema, endpoint or context is invented. Returning from Feedback restores series/season/gender. Tests open the form but never submit it. Source metadata remains in the datasets; it is no longer exposed as a Rankings footer.

This task changes OfficialRankingsPage TSX/CSS, SportsArea wiring, shared Back safe positioning in theme-refinements.css, the two Rankings browser tests, this report and the RANK-01 decision note. Previous Athlete Profile polish and all accumulated artifacts remain preserved. Evidence/logs: `/tmp/300w-rankings-v22a/`.

### v2.2A final validation

- Registry/navigation tests: **30/30 PASS** (`unit.log`).
- Rankings interactions: **14/14 viewport/theme runs PASS** (`browser.log`), including Back style parity with Athlete Profile, existing generic Feedback form open/Back without submission, selection preservation, both swipes, wheel, profile links and footer scrolling above navigation.
- Artwork/Back/safe-area suite: **112/112 combinations PASS** (`safe-area.log`), eight unchanged scenes × seven sizes × two themes; simulated Telegram top/right insets verified. One initial run lost its local CDP connection; the completed rerun exited successfully. Native Telegram/iPhone device E2E is not claimed.
- Release gate: **18/18 PASS** (`release.log`), build and lint included. Final lint **PASS** with the pre-existing RaceDetailPage hook warning (`lint.log`).
- `git diff --check`: **PASS**. Protected hashes verify unchanged data, original PNGs and showcase configuration.

Current task file scope (8): `src/pages/OfficialRankingsPage.tsx`, `src/pages/OfficialRankingsPage.css`, `src/sports/SportsArea.tsx`, `src/theme-refinements.css`, `scripts/test-official-rankings-browser.mjs`, `scripts/test-rankings-showcase-browser.mjs`, `docs/PROJECT_BOARD.md`, `docs/official-rankings-ui-2026-10-22.md`.

Status: **v2.2A complete locally, awaiting owner review**. Separate landscape-artwork preparation remains future work; existing composition intentionally remains unchanged. All earlier modified/untracked files preserved. Nothing staged, committed, pushed or deployed. No Feedback sent; no D1, Telegram or secret mutations.

## RANK-02 — Navigation hit testing and glass stacking (2026-10-23)

Root cause reproduced with real coordinate input at 440 × 956: after scrolling the athlete catalog by 300 px, the fourth navigation button was covered by `.card-navigation-target` (`z-index: 1`). The first click opened `#/athlete/108`; the second opened `#/rankings`. The fixed glass navigation had `z-index: auto`, so its own button stacking could not place it above positioned page content. Route mapping was correct.

The same stacking defect let `.standings-avatar img` (`z-index: 1`) paint above the glass and intercept hit testing. Before the fix, `elementsFromPoint` returned the athlete image before the navigation icon. This is distinct from the intentional subtle, blurred content visible through translucent glass.

The targeted fix sets `.bottom-nav { z-index: 40 }`, above content and the existing Back layer (30), below the existing overlay layer (100). Native modal dialogs remain in the browser top layer. Glass backgrounds, blur, dimensions, artwork, crop rules, routes and datasets are unchanged. Existing Rankings bottom clearance of `120px + env(safe-area-inset-bottom)` is retained; there is no extra spacer.

Regression coverage is in `scripts/test-bottom-nav-browser.mjs`. It uses physical mouse/touch input and `elementFromPoint`, because programmatic DOM `.click()` bypasses occlusion. It checks all five destinations, first and repeated fourth-tab navigation from seven routes (including the athlete catalog), pushState counts, the navigation interior at multiple scroll positions, all ten table rows, profile links, Back and Feedback. Screenshots and a machine-readable interaction trace are stored under `/tmp/300w-rank02/`.

This task does not implement NAV-02, modify landscape artwork, or change ranking/athlete data. Safari/iOS still requires owner confirmation; the automated browser is Chromium with mobile/touch emulation, not native Safari.

Validation completed:

- New coordinate-input suite: 14/14 viewport/theme combinations (320×700, 375×812, 390×844, 440×956, 667×375, 844×390, 956×440; light/dark). 196 first/repeated Rankings scenarios plus 140 five-tab destination checks; no extra history pushes.
- Existing Rankings interaction suite: 14/14, all 12 tables, series/gender swipes, season wheel, keyboard, Back and Feedback; zero runtime exceptions.
- Existing showcase suite: 112/112 asset/viewport/theme checks, including simulated Telegram safe-area offsets. Original artwork/cropping preserved.
- Navigation and official standings unit tests: 30/30.
- `npm run check:release`: 18/18 PASS, including build and ESLint. First sandboxed attempt reported environment errors in athlete/results audits; authorized local rerun passed. Separate final ESLint: no errors, existing RaceDetailPage hook warning only. Existing sports chunk size warning remains.
- `git diff --check`: PASS. SHA-256 comparison against the v2.2A baseline: 130 protected data/artwork/configuration files unchanged.

Evidence at `/tmp/300w-rank02/`: `before-athletes.png`, `before-rankings-overlap.png`, `before-rankings.png` (bottom), `after-overlap-440-dark.png`, `after-bottom-440-dark.png`, all responsive after screenshots, `interaction-trace.json`, `browser.log`, `unit.log`, `release.log`, `rankings-regression.log`, `showcase-regression.log`. No evidence from earlier tasks was overwritten; existing browser suites were run from temporary copies with only their output directory redirected.

Task-specific changes: `src/bottom-nav-glass.css`, new `scripts/test-bottom-nav-browser.mjs`, and this report. Existing accumulated uncommitted work is preserved. Local PASS; awaiting owner visual review in Safari. No commit, push, deployment or remote mutation performed.


## RANK-03C/D — landscape integration candidate (2026-10-23)

Owner-approved landscape artwork is now selected through `<picture>`; portrait artwork/cropping remains intact. Landscape uses uniform 5.5:1 cover and per-scene focal points, with no blurred side backgrounds or HTML logo overlays. See [asset mapping, full performance audit and visual limitations](rank03-landscape-performance-2026-10-23.md). Current source compositions do not preserve every low logo/high landmark in the narrow crop; final owner visual approval remains pending. No ranking data or navigation changes, commit/push/deploy.


## RANK-03E — sharp boundary and crop review (2026-10-23)

The owner preliminarily accepted six landscape compositions. This local follow-up removes the Rankings-only 18 px bottom fade, portrait blurred backdrop and large-portrait side mask. Source files and picture loading stay unchanged. IRONMAN Running moves from 48% to proposed 52%; T100 Cycling remains 80% after 60%/40% comparisons fail to preserve both cyclists and skyline together. No new artwork is generated. Floating-nav overlap is scroll-recoverable; real coordinate mouse/touch checks verify first/last athlete links, Feedback and nav hit areas with z-index 40 intact. See [RANK-03E evidence and remaining owner decisions](rank03e-showcase-polish-2026-10-23.md). Status remains awaiting owner review.


## RANK-03G — final pre-cropped Cycling integration (2026-10-23)

Owner supplied and approved `t100_cycling_final.webp`, 2078×378. It replaces only the T100 Cycling landscape reference; old originals/WebP remain available for rollback. Scene-specific contain preserves the complete pre-cropped artwork without changing the 5.5:1 container, picture selection or the other scenes. Both cyclists/wheels and recognizable London/Tower Bridge are visible at 667×375, 844×390 and 956×440. Previous RANK-03E crop limitations for this scene are superseded by the supplied composition, not by generated application edits. See [final QA/performance and screenshots](rank03g-final-qa-2026-10-23.md). Overall status: awaiting final owner review, local only.


## RANK-04 — controls and season picker polish (2026-10-23)

The owner approved RANK-03 artwork. This follow-up leaves images and standings untouched. Series indicators now occupy their own centered row. A symmetric three-column grid aligns the gender label, centered circular gender indicators and season button below. Indicator appearance and 44 px targets are unified. The automatically focused wheel no longer receives the bright series-accent rectangle; a neutral selected band carries a visible keyboard cue. Done uses scoped glass-like styling without changing shared Back controls. Wheel selection/scroll/keyboard/dismissal semantics are preserved. See [before/after and QA report](rank04-controls-picker-2026-10-23.md). Local only, awaiting owner review.
