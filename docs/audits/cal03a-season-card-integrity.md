# CAL-03A — Explicit season control and race card integrity

2026-11-21; local candidate `/private/tmp/300w-cal02-candidate`, base `b97aad29e0468b6ea4a98449ebb7d97e9de12239`. CAL-02 implementation and prior audit evidence retained. Version remains 1.0.1; no publication/deployment.

## Implemented

- Reviewed `season.config.json`: Production primary 2026; explicit Vite mode `season2027-preview` primary 2027. Unknown/ordinary modes default to Production. No environment/clock inference. Home only selects the configured primary season; no next-year substitution when it runs out of upcoming races. Calendar defaults to the same season and retains explicit 2024–2027 browsing/search/deep links.
- This pins the primary season, not the entire discoverability of the 2027 dataset. An eventual Production release including future data still needs explicit owner approval. The deployed application is unchanged.
- `RaceEdition.displayName` overrides permanent entity name; all 25 2027 names match approved master exactly. Texas, Pennsylvania and Frankfurt use neutral names with designation `regular` as unconfirmed default. Their 2027 continental championship status remains **pending verification**, not asserted absent. Historical titles unchanged. Future title corrections belong to edition metadata.
- Geography, distances, series, date ranges and UNKNOWN behavior from CAL-02 retained. Eight missing city fields/six missing countries, nine unknown genders, nine ranges and 25 missing official URL fields are not filled with guesses. [25-row audit](cal02c-dataset-readiness.md) remains historical evidence of the pre-fix findings.
- Artwork resolution: explicit edition mapping → geographically neutral owner-approved entity mapping → existing CSS neutral fallback. Shared approved-neutral map is empty. Location-specific existing images retained for explicitly listed historical editions. Image selection cache keyed by editionId. No Nice image reaches Chattanooga 2027; no arbitrary championship alias grants image reuse.
- All 25 2027 editions currently use neutral fallback; none has new artwork approval. No downloads/generation. No championship badge redesign; existing grouping/controls still use designation/identity.

## Qualification

- 33 targeted tests PASS: CAL-03A 6, CAL-02 9, Calendar 7, geography 3, Telegram 8. Includes date-independent pinning through 2028, ordinary Preview mode staying 2026, all master names/values, historical titles, Worlds/finals, exact image fallback and deep links.
- Image-resolution regression PASS (existing test selected by name; unrelated image encoding test not run).
- Build/typecheck PASS with `npm run build -- --mode season2027-preview`; emitted `dist/season.json` = `{ "profile": "preview2027", "primarySeason": 2027 }`. First attempt stopped at TypeScript JSON-import-attribute error; fixed import attribute, then successful build. Existing >500 kB chunk warning remains. No Production artifact prepared.
- Targeted ESLint and `git diff --check` PASS.
- Short Chrome smoke PASS at 390/1024: ordinary profile still defaults to 2026 at January 2027, empty Home rather than implicit next-season promotion; opt-in profile defaults to 2027, 25 cards, Worlds/Spain history, regular Chattanooga separation, Telegram link/Back, neutral image fallback, no runtime exceptions. Evidence `/private/tmp/300w-cal03a-browser/` is local, not committed. Chrome simulation is not Telegram device acceptance.

## Incremental changed-file scope

- `season.config.json`, `vite.config.ts`, `src/config/season.ts`: explicit build profiles and emitted season evidence.
- `src/App.tsx`, `src/pages/CalendarPage.tsx`: consistent Home/default Calendar season.
- `src/types/Race.ts`, `src/data/calendar2027.ts`, `src/data/raceEditions.ts`: edition displayName, approved 2027 names without historical title changes.
- `src/data/showcaseImages.ts`, `src/components/HomeShowcase.tsx`: edition-aware safe image lookup/cache.
- `scripts/test-cal03a.mjs`, `scripts/test-cal03a-browser.mjs`, `scripts/test-image-delivery.mjs`: focused qualification and adapted existing resolver regression.
- `docs/PROJECT_BOARD.md`, `docs/deployment-cloudflare.md`, this report: status, controls and limitations.

All earlier CAL-02 changes remain uncommitted alongside these changes; no edits to results, athletes, ranking formula, Cloudflare config, Actions, version or public release metadata.

## CAL-03B / CAL-04 follow-up

GO for CAL-03B owner artwork review: 25 neutral fallbacks to review, select explicit edition imagery (existing Kona/French Riviera/Qatar etc. are candidates, not automatically approved); Chattanooga must not use Nice. Review rights/provenance and mobile/desktop crops, then use existing image generator. No new architecture needed.

Before CAL-04 deployment qualification, add/qualify an explicit Preview profile route in current package preparation: `release:prepare --env preview` currently still invokes ordinary `npm run build` (season 2026). Do not claim this path supports 2027 already. Preserve digest/SHA, one-build and target checks and inspect packaged season.json. [Exact local commands and manual release policy](../deployment-cloudflare.md#explicit-build-time-season-profiles--cal-03a).

No GO for Production deployment: unresolved editorial data, artwork acceptance, Preview owner QA, T100-2026 closure and separate Deployment Request/Owner Approval remain. No automatic retries/rollback/switch.

## CAL-03B2 superseding local checkpoint — 2026-11-22

Earlier findings above are preserved as history. Owner now approves15 USE /10 NEW /0 pending. Four existing reuse sets are mapped by exact2027 editionId;11 approved assets are missing,10 require new artwork,21 remain neutral. Roth historical calendar visibility and Card/Showcase support are first-class; ranking Tier A1.10 and official IM/T100-only Standings are preserved. Preview release preparation now selects and verifies2027 profile; Production defaults2026. See [consolidated implementation, exact paths and import requirements](cal03b2-preview-readiness.md). No publication/deployment or image generation/download.
