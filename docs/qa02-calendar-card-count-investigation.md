# QA-02 — Calendar card-count investigation

**Current approval — GIT-01B instruction (no separate approval date supplied):** QA-02B deterministic Calendar test is OWNER APPROVED by the GIT-01B owner instruction. Earlier awaiting-review checkpoints below are historical.

2026-10-25 · **Investigation complete. QA-02B test-only fix implemented locally / awaiting owner review.** Original investigation below is historical; see QA-02B closure at the end. No application or dataset changes.

## Conclusion and release impact

**Outdated, date-dependent test expectation; no Calendar regression demonstrated.** The code-splitting browser test was introduced on2026-10-02, when four current-season races were upcoming. It asserts4 without fixing the browser clock. Since Moscow2026-10-11, Kona2026 correctly belongs to Past, leaving three upcoming T100 races. The race is not missing from data or All.

This is an intentional existing time filter, not a newly introduced filtering change, failed lazy import or observed render race. Current local and Preview behavior match. The test failure is reproducible and remains unfixed in the repository. It blocks a clean claim that the unmodified browser suite passes, but it does not establish a P0 user-facing Calendar defect. Resolve test determinism before final release validation; no production-data correction is warranted.

## Exact assertion and history

[Code-splitting test](../scripts/test-code-splitting-browser.mjs):

- Line27, after opening `#/calendar`: `assert.equal(await js('document.querySelectorAll(".race-card").length'),4)`.
- Line63, unknown race fallback: waits for Calendar with `.race-card` count exactly4. This is a second date-dependent expectation, previously unreachable after line27 failed.
- `start()` navigates with a unique query and waits for Bottom Navigation; it does not set the clock. The test also intentionally holds sports JS to prove shell/Calendar independence.

Introduced in `cf0d55ab4b8ea1abb2ad31e6194bc4d06ee8e4c5`, 2026-10-02 21:23:57+03, “Reduce initial bundle with sports code splitting”. No subsequent committed changes to that script and no local diff. `src/data/races.ts` has no diff from that commit to current HEAD; Kona's2026-10-10 date was already present. Its last committed change is `e56a421` on2026-09-13. RaceDate's Moscow comparison dates to `a33afbe` (2026-08-20); `e8a3dba` only exports the existing date helper for seasonal messaging.

Current accumulated App/navigation/UI work was inspected. CalendarPage, raceDate, races/raceEditions and the failing test have no local diffs. Returning the browser clock to the original test date restores the original four IDs without changing code/data.

## Expected versus actual IDs

These are repository dates, not a fresh external schedule audit. Original expected IDs are explicitly enumerated by the date-frozen [Calendar unit test](../scripts/test-calendar.mjs) for2026-10-02, and confirmed by browser card clicks.

| Race | Legacy ID | Stable raceId | Edition/navigation ID | dateISO | Upcoming Oct2 | Upcoming Oct25 |
|---|---:|---|---|---|---|---|
| IRONMAN World Championship, Kona | 17 | `ironman-world-championship-kona` | `ironman-world-championship-kona-2026` | 2026-10-10 | Yes | No — Past |
| Dubai T100 | 24 | `t100-dubai` | `t100-dubai-2026` | 2026-11-14 | Yes | Yes |
| Saudi Arabia T100 | 25 | `t100-saudi-arabia` | `t100-saudi-arabia-2026` | 2026-11-27 | Yes | Yes |
| Qatar T100 Final | 26 | `t100-qatar` | `t100-qatar-2026` | 2026-12-11 | Yes | Yes |

Actual local and Preview order onOct25: Dubai → Saudi Arabia → Qatar. Browser clicking each card yields the corresponding `#/race/<editionId>` above, not just matching names. The fixed-Oct2 local browser additionally returns Kona as the first card.

## Data flow, intended behavior and timing

- [App](../src/App.tsx), lines89–100: default Calendar state is empty search, All series, `upcoming`, closed archives. Passes current race editions plus all-edition search source.
- [raceEditions](../src/data/raceEditions.ts): current season2026; derives canonical edition views from [races](../src/data/races.ts) with stable identity mapping. Static local data, not a Calendar network fetch.
- [CalendarPage](../src/pages/CalendarPage.tsx), lines145–185: excludes Challenge intentionally, composes search/series/time filters, groups eligible adjacent gender editions and sorts. Search bypasses time/series filters intentionally. All/current-season card count25 includes a grouped Nice pair; it is not necessarily raw edition count.
- [raceDate](../src/utils/raceDate.ts): today is `Intl.DateTimeFormat` in `Europe/Moscow`; `finished = race.dateISO < today`, `upcoming = !finished`. Race day stays Upcoming, next Moscow calendar day becomes Past. Browser local timezone does not determine this boundary.
- [Project Board UX-01](PROJECT_BOARD.md#ux-01--calendar-empty-state) explicitly records Kona completion10.10.2026 and owner-approved seasonal empty-state behavior after that date. This supports the intended Upcoming exclusion, but the underlying date filter works independently of seasonal-message metadata.

Rendered component diagnostic, no data mutation:

| Browser Date input | Moscow boundary | Upcoming | Past | All | Kona location |
|---|---|---:|---:|---:|---|
| 2026-10-02T09:00:00Z | Oct2 | 4 | 21 | 25 | Upcoming / All |
| 2026-10-10T20:59:59Z | Oct10 23:59:59 | 4 | 21 | 25 | Upcoming / All |
| 2026-10-10T21:00:00Z | Oct11 00:00:00 | 3 | 22 | 25 | Past / All |
| 2026-10-11T09:00:00Z | Oct11 | 3 | 22 | 25 | Past / All |
| 2026-10-25T09:00:00Z | Oct25 | 3 | 22 | 25 | Past / All |

Browser sampling immediately after Calendar controls appear, then500ms and another2000ms later remains3/3/3 on local and Preview; fixed-Oct2 is4/4/4. No delayed fourth card appears. The original test fails while sports loading is held, whereas Calendar's static data has already rendered. The controlled date changes explain the exact lost ID and count with constant code/data, providing stronger evidence than increasing timeouts.

## Preview verification

Read-only GET `https://preview.300w.app/api/health`: ok, version0.0.0, commit`c8f52e02a75e0b413dddbfee77f477232c5301d3`. HTML selects `assets/index-CUMJkvzZ.js`; the local PERF-01A build uses `index-ENMDu9SZ.js`, so bundle equality is **not** assumed from the shared commit metadata.

A fresh browser tab opened Preview Calendar on2026-10-25 (recorded browser time09:09:18.961Z). Upcoming3, Past22 with Kona present, All25. All three clicked Upcoming routes match the exact IDs above. This confirms Preview has the same correct date-filter behavior. The failure is in the test expectation, not a local-only missing-card defect. No Preview test file was deployed; no Production inspection or mutations were performed. This is desktop Chromium mobile emulation, not physical Safari/Telegram certification.

## Executed checks and every failure

Evidence directory: `/tmp/300w-qa02/`. Existing screenshot artifacts preserved by redirecting only output prefixes in temporary script copies. Application served from the unchanged PERF-01A production build at `http://127.0.0.1:5408`; CDP`http://127.0.0.1:9268`.

1. `node --test scripts/test-calendar.mjs` — **6/6 PASS** (`calendar-unit.log`). Exact frozen-date IDs, filters/archive/search, empty/load/error, season completion and future-season behavior included.
2. `TRI_APP_URL=http://127.0.0.1:5408 TRI_CDP_URL=http://127.0.0.1:9268 node /tmp/300w-qa02/code-splitting-current.mjs` — **FAIL**, unchanged assertions: `3 !== 4`, line27 at390×844. This is the reproduced original failure; later scenarios do not execute in this run. Only screenshot path differs from repository test.
3. Same environment, `node /tmp/300w-qa02/code-splitting-frozen.mjs` — **4/4 viewport runs PASS**,390×844,440×844,844×390,1440×900. Diagnostic copy injects Oct2 browser Date before navigation and removes it afterward; all original assertions, including both count4 expectations, unchanged. This is diagnostic evidence, not a claim that the repository test has been fixed.
4. Same environment, `node /tmp/300w-qa02/code-splitting-current-date-diagnostic.mjs` — **4/4 viewport runs PASS**. A second temporary diagnostic fixes Date toOct25 and changes only the two known Calendar count expectations to3, independently supported by the ID/date audit. No other assertion removed or weakened. Not the proposed permanent fix.
5. Same environment, `node /tmp/300w-qa02/calendar-browser.mjs` — **3/3 viewport runs PASS**,320×740,390×844,844×390. Existing Calendar browser suite already freezes Oct2, and uses Oct18 for seasonal cases. Only screenshots redirected; repository test unchanged. Includes filters, archives, search/clear/empty, keyboard reset, history/scroll, seasonal action and no overflow.
6. `node /tmp/300w-qa02/date-matrix.mjs` —15 component scenarios recorded, including Moscow midnight boundary and exact clicked-prop IDs (`date-matrix.json`). `node /tmp/300w-qa02/browser-ids.mjs` — local actual/frozen and Preview actual IDs, stable counts and Past/All checked (`browser-ids.json`).
7. `git diff --check` and documentation links — PASS.

Previously skipped code-splitting scenarios now exercised in both diagnostic controls: delayed sports loader; leave while loading; shared-load reuse; expanded athlete list; athlete navigation and Back/Forward; scroll/state restoration; delayed reload; failed reload preserving history; direct athlete/race links; invalid athlete and race fallback (second Calendar count assertion); failed import and retry; no horizontal overflow. No further assertion failures in either diagnostic run.

Full release gate was not rerun for documentation-only investigation; PERF-01A's18/18 is historical evidence, not a new QA-02 gate claim.

## Proposed minimal correction — NOT applied

Fix browser-clock determinism in `scripts/test-code-splitting-browser.mjs`, using the same Oct2 Date strategy already used by Calendar browser tests. Install before every new-document navigation and remove in finally. Keep count4 tied to that explicit fixture date and strengthen with the four exact expected edition IDs. Check both initial Calendar and invalid-race fallback. Retain separate date-boundary coverage for Oct10→Oct11 and later dates so the test does not hide time behavior.

Do not permanently replace4 with3: it would become stale after subsequent dates. Do not loosen the test to “at least one”, derive the oracle from the same filtering implementation alone, change race dates, pin Kona to Upcoming, or add network delay to mask the mismatch.

No application or dataset correction is indicated by this investigation. Repository-test correction awaits owner authorization; this task applied only documentation and temporary diagnostics. Existing modified/untracked files preserved; no commit/push/deployment, version, D1 or infrastructure change. **STOP for owner review.**

## QA-02B — Deterministic test implementation (2026-10-25)

This section supersedes the earlier “NOT applied” test-fix status. Root cause remains the unfrozen wall clock, not Calendar/data behavior.

Changed `scripts/test-code-splitting-browser.mjs` only within test scope:

- Reuse Calendar browser suite's CDP `Page.addScriptToEvaluateOnNewDocument` Date subclass pattern. Fixture is `2026-10-02T09:00:00Z` (12:00 Moscow); no production clock abstraction.
- Explicit Date arguments and inherited parsing remain supported; no-argument Date and Date.now are fixed for every new document, including reload/retry. Verify the browser's `Europe/Moscow` formatted date is exactly2026-10-02.
- Assert all four exact edition IDs and order by clicking each Calendar card and reading its public `#/race/<editionId>` destination, then returning through history. No React internals, production data attributes or imported filtering oracle.
- Run the identity helper for both initial Calendar and invalid-race fallback. Card count follows the explicit four-ID fixture, not an unrelated numeric constant.
- Preserve the initial zero-sports-request assertion before clicking any card. Enable normal requests only for the added link checks, then begin the original delayed sports scenario in a fresh document with hold mode restored. All original code-splitting/error/history checks remain.
- Remove the clock injection in finally before Fetch cleanup/socket close so subsequent documents in the shared browser are not frozen.

### Validation and before/after

Before: QA-02 reproduced original `3 !== 4` on actualOct25 and stopped before remaining cases (`/tmp/300w-qa02/current.log`). After: the actual changed repository test, copied only to redirect screenshots into a fresh directory, **4/4 viewport runs PASS** at390×844,440×844,844×390,1440×900. Final log `/tmp/300w-qa02b/after-final.log`. No Calendar assertion override or diagnostic count substitution in this run.

Commands actually executed:

- `npm run build` — PASS (`/tmp/300w-qa02b/build.log`). Existing sports chunk warning retained.
- `node --test scripts/test-calendar.mjs` —6/6 PASS (`calendar-unit.log`).
- `npm run check:release` —18/18 PASS (`release.log`), includes fresh build/lint/data/ranking checks. Existing RaceDetailPage hook warning retained.
- `TRI_APP_URL=http://127.0.0.1:5410 TRI_CDP_URL=http://127.0.0.1:9268 node /tmp/300w-qa02b/after.mjs` — final complete browser code-splitting4/4 PASS. Temporary copy differs only in screenshot filename prefix; source test is the modified repository script.
- Same environment, `node /tmp/300w-qa02b/calendar-browser.mjs` — Calendar browser3/3 PASS,320×740,390×844,844×390. Screenshot prefix only differs from repository script.
- Isolated Node VM evaluation of the exact injected Date source with simulated underlying clocks2025-01-01,2026-10-25 and2031-12-31 —3/3 PASS: Date()/Date.now alwaysOct2 fixture, explicit Kona date parsing remainsOct10. The machine clock was not changed. Full browser suite ran on actualOct25, not itsOct2 fixture date.
- `git diff --check` and documentation link checks — PASS. Checksums confirm983 existing production source/artwork/worker/shared/package/config files unchanged relative to the preserved baseline.

Initial after-run failed at delayed reload waiting for `[data-route-pending]`, after390px passed. Release gate was concurrently rebuilding the same served dist, making this an unsuitable stable-build run. Its exact root cause was not independently isolated; the log is retained at `/tmp/300w-qa02b/after.log`. After builds completed, the identical test against unchanged final dist passed all four sizes sequentially. No assertion was removed to obtain PASS.

All previously skipped scenarios executed: loading placeholder; leave while sports loads; shared import reuse;150-card athlete expansion; profile navigation; Back/Forward scroll/state; delayed and failed reload; direct links; invalid athlete/race fallback with exact Calendar IDs; failed import + retry; overflow checks.

### Remaining date-sensitive tests found in focused review

- `scripts/test-image-delivery-browser.mjs`: mocks random/autoplay but not Date; accesses carousel indices `[3,0,2,1]`. With only three future Home races after Kona, index3 is unavailable. This is a source-inspected fixture risk; suite was not executed or changed in QA-02B.
- `scripts/test-navigation-browser.mjs`: clicks a future Home race without a frozen Date; can fail once none remain.
- `scripts/test-ui-cleanup-browser.mjs`: assumes Home showcase/future-card elements exist, also without fixed Date. Similar end-of-season risk. No current failure is claimed without executing it.
- Calendar unit/browser already freeze dates and explicitly cover time/season behavior. Node-side Date.now in navigation query strings is cache-busting, not the application's clock oracle.

Recommend a separately scoped deterministic-fixture review for those Home suites. QA-02B does not change Home or extend the production season data to satisfy tests.

Task files: `scripts/test-code-splitting-browser.mjs`, this QA-02 report and `docs/PROJECT_BOARD.md`. Prior modified/untracked files preserved. No commit/push/deployment, version, infrastructure or dataset changes. **Local fix ready for owner review.**
