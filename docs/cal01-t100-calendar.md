# CAL-01 — verified T100 calendar correction

Local candidate on release/rel-01a-v1.0.0, base dc2beb424aeaf62831e56da6c849f7ce66ba216b. Existing uncommitted REL-01A version/docs preserved. No publication or deployment.

## Official evidence reviewed 12 November 2026

- [T100 PRO calendar](https://t100triathlon.com/pro-racing/#calendar): Dubai14November2026 lists both men's and women's PRO events; Saudi is absent from the current2026 PRO event list.
- [Dubai PRO race timings](https://t100triathlon.com/dubai/pro/): both races Saturday14November; Dubai local men's start10:03, women's10:08. Only calendar gender is changed; start times are not introduced into the application.
- [T100/PTO rescheduling announcement](https://t100triathlon.com/media-releases/new-dates-for-saudi-arabia-t100-and-world-triathlon-cup-in-jeddah/): explicitly moves the Saudi/Jeddah event weekend from27–28November2026 to16–17April2027.
- [World Triathlon announcement,3November](https://triathlon.org/news/new-dates-for-saudi-arabia-t100-and-world-triathlon-cup-in-jeddah): confirms the same replacement dates.
- [Saudi participation page](https://t100triathlon.com/saudi-arabia/participate/): now displays16–17April2027.

The [old Saudi PRO page](https://t100triathlon.com/saudi-arabia/pro/) still displays27November2026, and generic season copy still describes the earlier gender split. These are stale relative to the explicit official rescheduling announcement and updated PRO calendar/timings, not independent evidence of an additional2026 event. The new date is a two-day event window; an exact2027 men's PRO start day/time is not inferred. No2027 event is created: outside current authorized scope.

## Minimal implementation

Dubai retains legacy ID24, raceId t100-dubai, editionId t100-dubai-2026, date2026-11-14. Only gender WPRO→WPRO+MPRO and the gender-specific description change. Historical Dubai2024/2025 records are untouched.

Saudi retains legacy ID25, raceId t100-saudi-arabia, editionId t100-saudi-arabia-2026 and the original record in canonical arrays for stable lookup/integrity. One explicit edition-scoped calendar predicate excludes that obsolete schedule from Home/Showcase, Calendar filters and Calendar search. It does not delete historical records, fabricate a replacement date/status, or change results/ranking inputs. A direct legacy detail URL can still resolve the preserved old record; it is not advertised as an upcoming event. This is the deliberate minimal scope, not a new postponement-status UI.

Moscow day-boundary logic and grouped-card algorithms remain unchanged. Dubai uses the existing combined-gender representation; no duplicate men's edition or invented ID. Grouping before Home display limits is preserved.

## Regression contracts

Calendar expected upcoming/all/search sets decrease by the one excluded Saudi card; historical finished counts and archive counts remain unchanged. New checks pin Dubai IDs/date/both genders, Saudi ID retention/exclusion across filters/search, historical Dubai editions and absence of2027 creation. Dubai boundary fixtures cover start/end of Moscow event day and next day, Home/Showcase and Calendar.

Initial fast gate17/18: historical Kona edition hash correctly detected the two Dubai field changes. Test-only projection now first asserts their exact approved replacements, then restores only those fields for the original unchanged historical hash. Five negative fixtures reject unexpected ID/raceId/date/gender/description. No historical identity/results hash replaced or loosened; original failure log retained.

## Verification

LOCAL QUALIFICATION PASS / AWAITING OWNER REVIEW. Local evidence: /private/tmp/300w-cal01-evidence. Before-task copies of all six REL-01A modified/new files are retained there. Version remains1.0.0; no catalog regeneration. Final report will distinguish successful checks from initial failures.


## Changed-file inventory relative to REL-01A

Runtime/data: src/data/races.ts, src/data/raceEditions.ts, src/App.tsx, src/pages/CalendarPage.tsx.

Tests: scripts/test-calendar.mjs, scripts/test-calendar-browser.mjs, scripts/test-race-date-boundary.mjs, scripts/test-race-result-import.mjs, scripts/test-code-splitting-browser.mjs, scripts/test-image-delivery-browser.mjs.

Documentation: docs/cal01-t100-calendar.md (new), docs/PROJECT_BOARD.md, docs/rel-01a-v1-release-candidate.md.

The preceding REL-01A package.json, package-lock.json, CHANGELOG.md and docs/versioning.md are byte-identical to the saved before-task copies; board/report additions preserve their previous evidence. Full candidate includes17 modified/new files relative to Git HEAD. No staged files, commit, PR or deployment.

Release-note recommendation for owner review: add a concise statement that the2026 T100 calendar now includes both Dubai PRO genders and excludes the postponed Saudi event. Existing draft CHANGELOG wording was preserved in this task; the calendar correction is documented here and must be included in the next approved notes revision if desired.

Original arrays keep87 edition views including preserved Saudi; presentation counts differ from catalog counts by design. Runtime snapshot comparison verifies all1167 full profile objects,4592 full result objects and calculated ranking unchanged, all edition IDs/order unchanged; only Dubai gender/description differ. Protected402 source/data/artwork/config/workflow files byte-identical, including all58 approved biographies. No country/source anomalies changed.


Browser first run12/14 (exit1): image-delivery expected at least4 cards at2October, code-splitting expected the obsolete Saudi edition. Diagnosis confirmed both fixtures depended on removed upcoming presentation. Exact code-splitting edition list now excludes Saudi. Image fixture moves to18September2026 (French Riviera, Kona, Dubai, Qatar available), keeping the at-least4-card, lazy-load, transfer/geometry and navigation assertions unchanged. No runtime clock changes. Initial gate logs preserved; final run reported separately.

Fast final release gate18/18 PASS, exit0,28.2s, including build/lint, catalog/localization/ranking and result audits. Targeted35/35 (calendar/date/biography/version), importer30/30 including5 new negative edition fixtures. Standalone athlete audit0issues, result audit0errors/0warnings with52 preserved source anomalies. Node24.19.0; no dependencies changed.


Final full browser gate14/14 PASS,372.5s, genuine npm exit0;58 mobile/7 desktop exact-biography checks PASS, exit0. Initial12/14 failure remains in browser/; successful run in browser-final/. Final version/metadata1.0.0, documentation links, git diff --check and empty index PASS. No application code changed after the tested build. Existing sports chunk-size warning remains; physical-device Preview QA is not performed locally.

Candidate ready for owner review and a separately authorized commit/PR, subject to the existing REL-01A release risks (OPS-02, OPS-03, device coverage, suspended Auto Deploy/stuck run). No publication in this task. Legacy Saudi detail route still exposes the retained record if directly addressed; upcoming/calendar/search presentation excludes it. A dedicated postponed-detail UI would be separate work.


Final review package follow-up: owner authorized adding the verified T100 correction to CHANGELOG.md; the line is now included under Fixed. The earlier unchanged-changelog statement describes the CAL-01 qualification checkpoint. Only release-note content/documentation changed afterward; metadata/versioning validation is repeated, full gates retained as prior evidence. New artifact/build qualification is still required on the eventual committed release SHA.

Final review checks: npm run metadata PASS; versioning10/10 PASS (including generated UI notes and health handler consistency); git diff --check PASS. No full gate/build/browser rerun for notes-only follow-up.
