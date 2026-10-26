# NAV-02 — local floating navigation prototype

Historical NAV-02 report. Owner subsequently approved the prototype design; NAV-03 integrates it locally as the default. See [NAV-03 report](nav03-integration-2026-10-23.md). The query switch and prototype filenames below describe the prior implementation and are no longer active. Global integration still awaits separate owner review.

## Local comparison

Run `npm run dev -- --host 127.0.0.1 --port 5391`.

- Baseline: `http://127.0.0.1:5391/?nav=baseline#/rankings`
- NAV-02: `http://127.0.0.1:5391/?nav=02#/rankings`

The URL switch is guarded by `import.meta.env.DEV` and a browser-environment check. There is no production switch or duplicated routing. Existing icons, handlers, page ownership and RANK-02 stacking fix are retained. All five buttons expose their current state through `aria-current`.

## Geometry and motion

Measured baseline height: 76 px in portrait and landscape. Prototype: 58 px portrait, 48 px landscape; all button hit targets at least 44 × 44 px. Portrait gutters remain unchanged. Landscape panel is capped at 640 px with safe-area-aware side margins. Radius: 22/18 px. Existing content padding remains sufficient; viewport and scroll containers are unchanged.

One non-interactive capsule sits behind the buttons. CSS controls its responsive geometry; Web Animations animates only `transform`, with 210 ms ease-out. Pages remount their BottomNav, so the capsule preserves its last rendered fractional position on cleanup and starts the next animation there. CurrentPage is still the only selected-route source; there is no delayed navigation. Resize and reduced-motion changes cancel motion and use the responsive final position immediately.

Active icons use #F3B72B. The capsule is neutral. The prototype keeps dark translucent glass in both themes, preserving yellow icon contrast on light Rankings. Baseline per-button active fills are disabled only in the prototype. Fine-pointer hover changes contrast; press changes opacity without scaling. Focus remains visible inside the clipped panel.

Bottom inset combines browser safe-area and the existing Telegram CSS variables. Landscape side insets respect browser and Telegram safe-area values. Native-device safe areas and actual Telegram viewport behavior still require owner verification; browser tests emulate viewport sizes and Telegram variables.

The referenced owner video was not attached to this task in the available environment. This implementation follows the written specification and does not claim visual comparison with that recording.

## Files

- `src/components/BottomNav.tsx`
- `src/components/NavPrototypeCapsule.tsx`
- `src/components/nav-prototype.css`
- `scripts/test-nav-prototype-browser.mjs`
- this report

No data, artworks, rankings, athlete enrichment or remote configuration changed. Existing uncommitted work is preserved.

## Validation and review artifacts

- `node scripts/test-nav-prototype-browser.mjs`: PASS, 12 viewport/theme combinations, all five active states, mouse/touch hit testing, 44 px targets, one capsule with transparent button backgrounds, exact yellow, no overflow, Telegram bottom inset simulation and Rankings footer clearance. Nested athlete/race routes, browser Back/Forward, rapid animation interruption, Enter activation and reduced motion PASS. Race Results bottom clearance PASS at all three landscape sizes. No runtime exceptions.
- Production-build check on local Vite preview: `?nav=02` keeps baseline (76 px), no capsule.
- `npm run check:release`: 18/18 PASS, including build, ESLint, navigation and accessibility tests. Initial server-render failures due to browser-only location access were fixed with an environment guard and the complete gate rerun. Existing RaceDetailPage hook lint warning and sports chunk-size warning remain.
- `git diff --check`: PASS. 130 protected source/data/artwork/configuration hashes unchanged against the prior baseline.

Evidence directory: `/tmp/300w-nav02/`.

- `baseline-{width}-{theme}.png`: baseline portrait/landscape.
- `nav02-{width}-{theme}-{route}.png`: all five active states, both themes, all six viewports.
- `bottom-{width}-{theme}.png`, `race-bottom-{width}.png`: content clearance.
- `navigation-demo.webm`: eight-second demonstration of real local navigation, captured from browser screencast and encoded locally; no external upload.
- `measurements.json`, `browser.log`, `extra.log`, `release.log`: measured sizes and validation.

Remaining owner checks: appearance and motion on native Safari/iPhone and inside Telegram; browser tests use Chromium emulation. Landscape artwork remains unchanged and outside NAV-02. Do not adopt the prototype in Production before owner approval.
