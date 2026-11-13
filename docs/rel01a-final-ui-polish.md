# REL-01A — Final UI & Content Polish

Local candidate release/rel-01a-v1.0.0, base dc2beb424aeaf62831e56da6c849f7ce66ba216b. Preserve all REL-01A/CAL-01 uncommitted work. No commit, push, PR, merge, tag or deployment.

## Changes

- CHANGELOG Added entry is exactly «Рейтинги IRONMAN и T100.» Internal300W ranking is no longer advertised in generated user-facing notes. Ranking implementation and actual Rankings page are unchanged. CAL-01 note retained.
- Home main-content calendar tile uses explicit br after «Календарь» and narrowly scoped nowrap to prevent the second line splitting. No tile size, typography, icon, navigation target, bottom-nav component or click behavior change.
- Shared SportsRoute loading body (Rankings, Athletes, Athlete Profile, Race Detail) has one exact status «Загрузка...», without page-specific loading headings. Back and bottom navigation remain usable controls; error heading, error message and retry are preserved. Calendar inline loading uses the same exact text; normal title/errors/empty states retained.

## Loading-state inventory

| Surface | Finding/action |
|---|---|
| Rankings lazy entry | Standardized shared fallback; blocked-module browser verification |
| Athlete catalog/detail | Same fallback; both tested before module completion |
| Race Detail | Same fallback; tested before module completion |
| Calendar | Inline dataStatus=loading label standardized; normal header/error states independently tested |
| Home | Synchronous shell; no full-page loading message; image loading attributes unchanged |
| News | Seed content shown while background refresh proceeds; no loading screen/text to replace |
| Feedback | Config/challenge loading has no page loading label. Verification/send/save statuses and action instructions preserved as meaningful transaction context; error strings untouched |
| React Suspense | No Suspense fallback in current src; route loading uses existing loader/resource mechanism |

No artificial delays, fetch/routing changes or new dependencies. Request interception exists only in browser test to inspect actual pending states. Two exact text sites are small enough that a new shared runtime component/constant is unnecessary.

## Before/after Home evidence

Fresh-profile local browser, production builds before/after, same viewports and dimensions:

| Viewport | Before lines | After lines | Tile size unchanged |
|---|---|---|---|
|320x740|Календарь / и / результаты|Календарь / и результаты|93x116|
|390x844|Календарь и / результаты|Календарь / и результаты|117x116|
|440x956|Календарь и / результаты|Календарь / и результаты|133x116|

No title/page horizontal overflow; calendar click verified. 440x956 represents iPhone Pro Max CSS dimensions, not physical-device QA. Evidence `/private/tmp/300w-final-polish-evidence/before-browser/before/` and `targeted-browser/release-polish/` includes per-character line geometry and screenshots. At narrow height the tile is below the initial fold; screenshot alone is not proof of all geometry, hence measured assertions. Visual inspection of440px Home and Rankings loading screenshot passed.

## Verification

LOCAL QUALIFICATION PASS / AWAITING OWNER REVIEW. Targeted40/40 (new loading tests, versioning, Calendar, Moscow date boundary, biographies) PASS exit0. Focused browser Home320/390/440 and held-module Rankings/Athletes/Profile/Race PASS exit0, with completion after release. Fast gate18/18 PASS exit0,26.6s including build, lint, athlete/result audits, source replay/identity and ranking checks. Existing bundle warning remains.

Evidence root `/private/tmp/300w-final-polish-evidence`; before-task copies preserve the entire17-file candidate diff. No runtime data/biographies/artwork/config/workflow changes. Content correction and loading/label presentation are the only new functional scope; version remains1.0.0. Previous gate results are historical, not substituted for new final checks.


Final full browser gate14/14 PASS,372.7s, genuine npm exit0. Additional58 mobile/7 desktop biography browser suite PASS exit0. No retries or failing suites in this polish qualification. Error/retry routing remains covered by code-splitting suite. Final git diff --check, documentation links, empty index and generated version/notes checks PASS. No old user-visible loading labels remain in loading branches; page titles remain in normal/error branches intentionally.

Exact polish-only files (10): CHANGELOG.md; src/App.tsx; src/home-refinements.css; src/pages/CalendarPage.tsx; src/sports/SportsRoute.tsx; scripts/test-release-polish.mjs (new); scripts/test-release-polish-browser.mjs (new); docs/PROJECT_BOARD.md; docs/rel-01a-v1-release-candidate.md; this report (new). Full combined candidate22 modified/new files. No unrelated edits; before-task snapshots retained. Generated metadata/dist, node_modules and browser evidence are not commit scope.

Protected biography/athlete/result/ranking/identity/config/workflow paths remain byte-identical to base. CAL-01 data/policy/importer safeguards are byte-identical to before-task copies, including Dubai both genders and Saudi exclusion. Fast gate revalidated1167 athlete IDs,4592 results, identity/linkage and historical hashes. Version1.0.0 unchanged. No catalog regeneration or D1/remote operations.

Recommendation: combined candidate ready for owner review and separately authorized commit/PR. Remaining OPS-02 network risk, OPS-03 restore drill, Firefox/iPhone and deferred Android coverage, suspended Auto Deploy/stuck run and TECH-01 prohibition remain. Physical-device QA of this new polish and later committed-artifact qualification are separate; no release/tag/deployment approval implied.
