# RANK-05 — Interactive Swipe & Snap prototype

Status: LOCAL PROTOTYPE / owner review pending. No deployment authorization inferred.

## Architecture

HomeShowcase uses native horizontal scrolling plus CSS Scroll Snap. The browser supplies touch inertia, threshold/velocity and snap; Home synchronizes its indicator by nearest card on scroll. It pauses its 4-second autoplay for 7 seconds after manual interaction and limits image mounting to nearby cards. No animation dependency or reusable carousel component exists. Home source/behavior remains unchanged.

Previous Rankings handlers recorded pointer-down coordinates and replaced series/gender on pointer-up after 55 px and a horizontal/vertical ratio of 1.5. There was no moving track or incoming panel.

The prototype adds `RankingsSwipeTrack`, applying Home's native scrolling/snap model to two panels. Showcase has zero gap; tables have a 12 px gap. Touch scrolling and inertia remain browser-managed, with horizontal overscroll containment and natural vertical document scrolling. Desktop mouse drag uses pointer capture after an 8 px axis threshold (horizontal > vertical × 1.25); release advances after min(80 px, 20% width), or >24 px at average speed >0.45 px/ms. Otherwise it returns. Cancel returns to the committed selection; resize resets the track to that selection. Smooth programmatic scrolling becomes instant under reduced motion. Idle scroll settlement synchronizes persisted selection/indicators.

Dragging suppresses clicks for 500 ms; normal athlete links remain. Inactive tables are inert/aria-hidden. Their captions have a local positioning context to prevent page overflow. Controls, gender label, Back and Bottom Navigation stay outside tracks.

## Images and performance

Only two pictures for the randomly selected scene are mounted (one per series), with the same portrait/landscape source media rules. The neighbor is intentionally loaded at low priority so it can appear during drag; no all-16 preload. Existing image files and composition are preserved, including T100 Cycling contain behavior scoped to its panel. Native scroll is compositor-managed; no React state update per pointer-move frame, no new dependency.

Cold slow-network image decode can still delay initial artwork availability. Native momentum/boundary elasticity differs by browser; physical iPhone Safari/Telegram review remains necessary. Boundary movement is clamped on Chromium, with platform-native containment on touch. No simulated rubber-band animation is added.

## Review artifacts and validation

Artifacts: `/tmp/300w-rank05/`. Gesture/browser results, build/release logs, before/after captures and three WebM demonstrations are recorded there. Videos are sampled browser screenshot sequences encoded locally with MediaRecorder; they illustrate interaction and are not device-FPS benchmarks.

Do not mark this prototype approved until owner review. Existing official standings, athlete identities, results, internal ranking, enrichment and all artwork must remain unchanged.

## Validation results and measured trade-offs

- Production build and release gate: 18/18 PASS. Existing sports chunk (>500 KB) and RaceDetailPage hook-dependency warning remain; no new dependency.
- Standings and navigation unit tests: 30/30 PASS.
- New swipe browser suite: 14/14 viewport/theme configurations PASS; continuous motion checked before release, touch/mouse snap/return, vertical arbitration, link protection, season persistence, Bottom Navigation stacking. Reduced motion/boundary/orientation checks PASS.
- Additional pointer-cancel, rapid selection interruption and resize-during-drag checks PASS.
- Protected data/artwork hash comparison and Home source diff: unchanged.
- Compared with the isolated RANK-04 Preview build: total JS 1,572,433 vs 1,570,407 bytes (+2,026); CSS 79,947 vs 78,539 (+1,408). The baseline excludes unrelated Athlete Profile polish, so these are conservative combined-build deltas, not an exact single-feature attribution.
- Cache-disabled browser requests: exactly two selected-scene PNGs in portrait; switching orientation adds two selected-scene WebPs. No duplicate or all-16 artwork requests.
- **Intentional network trade-off:** adjacent artwork is requested before dragging to avoid an empty incoming panel. Two approved portrait PNGs total 4.24–5.18 MB depending on scene; two landscape WebPs total 0.40–0.63 MB. This increases initial image traffic compared with the old single-image display. The neighbor has low fetch priority. Approval should include this trade-off; no recompression or asset changes were made.

## Deliverables

Changed for RANK-05 only:

- `src/components/RankingsSwipeTrack.tsx` (new).
- `src/pages/OfficialRankingsPage.tsx`.
- `src/pages/OfficialRankingsPage.css`.
- `scripts/test-rankings-swipe-browser.mjs` (new).
- `scripts/test-official-rankings-browser.mjs` (active-panel selectors and native-snap settling).
- `docs/PROJECT_BOARD.md`.
- This report.

Videos: `/tmp/300w-rank05/home-reference.webm`, `rankings-showcase.webm`, `rankings-gender.webm`.

Before/after: `/tmp/300w-rank05/compare-{before,after}-{390,956}-{dark,light}.png` (same series/gender/season/scene). Original artifacts are preserved.

The prototype is local only. Preview/Production still run the previously deployed code. Physical-device QA, native momentum differences, initial neighbor traffic and owner approval remain open.

## Final QA closeout

Existing all-table regression PASS at 390×844 and 956×440 in both themes (4 configurations, all 12 standings each), including exact values/profile IDs, Back/Feedback, wheel, Home/Bottom Navigation and zero runtime exceptions. Tests now address the active panel and its background; a substantial native swipe replaces the old discrete-toggle threshold. Fast flings use bounded settlement waiting rather than an arbitrary 750 ms delay. No application timing was changed to make the test pass.

Vertical-biased and horizontal-biased diagonal gestures PASS. An insufficient diagonal swipe returns; the sufficient horizontal-biased gesture advances. Native inertia/selection settlement can take longer than 750 ms on a wide viewport. Selection commits after settling, unlike Home's nearest-card indicator updates during scrolling; this is an explicit prototype review point.

Final lint: zero errors, one existing RaceDetailPage warning. Final `git diff --check`: PASS. Accumulated Git status: 15 modified / 79 untracked; existing unrelated files remain present. No staging/commit/push/deployment.

Review gallery: `/tmp/300w-rank05/review.html` (all three videos and eight comparison images).
