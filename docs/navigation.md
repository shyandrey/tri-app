# Navigation and Back

Previously App.tsx forced Race Back to Calendar. Athlete Back kept a single
mutable origin, and the list/profile components lost their local state on unmount.

App now uses a small History API adapter, without a router dependency. A browser
entry holds a version, unique key, parent key, route (page and ID), JSON UI values,
window scroll and named horizontal scroll positions. It stores no athlete/result
objects or DOM snapshots. No localStorage is used. Hash URLs work on static hosts:
`#/athletes`, `#/athlete/<athlete ID>`, `#/race/<edition ID>`.

Each real transition pushes once; UI state changes replace the current entry.
UI Back calls browser history.back; popstate restores the target without pushing.
Forward remains available; navigating after Back replaces the forward branch.
Repeated presses while Back is pending are ignored. Re-selecting the current
section retains the existing scroll-to-top behavior without another history entry.

Direct detail links with no valid history receive one fallback predecessor:
Race → Calendar, Athlete → Athletes. Reloading a valid entry does not seed again.
Missing IDs resolve to their catalog; malformed/unknown URLs resolve to Home.
For an entry without a parent, internal Back replaces it with its safe catalog
(or Home for sections), avoiding fallback loops. Browser Back at the boundary of
app-owned history retains native browser behavior and may leave the application.

## State and scroll

- Athletes: search, gender, country, list scroll and country-strip position.
- Athlete: expanded years, bio and achievements sections, scroll.
- Calendar: search, series/time filters, expanded archive years and scroll.
- Race: selected edition/year, gender, result sort and scroll.
- Home: window position, showcase index and horizontal scrollers.
- Ranking/More: their route and scroll (no existing editable filters).

usePageState binds small UI values to the current entry. React remounts the active
screen by entry key, initializing from saved values. Results reset their sort when
the selected data changes, but not merely because Back remounted the page.

The former athlete-only scroll variables and Calendar mount-time scroll effect
are removed. NavigationRoot owns scroll restoration with browser automatic
restoration disabled. It restores after layout and on the next animation frame,
after filters/accordions have recreated page height. It captures before app
navigation and during scrolling. Scroll-frame updates stay in memory; History API
writes are debounced until scrolling settles and flushed on navigation/pagehide.
No hidden screens or duplicated DOM are kept mounted.

## Verification (2026-09-25)

- `node --test scripts/test-navigation.mjs`: 8/8 passed.
- `node scripts/test-navigation-browser.mjs`: Chrome at 390×700 passed A–H,
  Ranking → Athlete → Back, and Race result sorting/scroll → Athlete → Back.
  Browser Back/Forward, direct link and refresh were exercised; no JS exceptions.
  These are automated real-browser checks, not a claim of manual human testing.
  The resulting race screen screenshot was also inspected.
- Targeted ESLint: no errors; one pre-existing useMemo dependency warning in
  RaceDetailPage (`activeYearEditionIds`).
- `npm run audit:athletes`: exit 0; 2 existing missing-country issues, 968 without photo.
- `npm run audit:results`: exit 0, 0 errors/warnings, 4367/4367 linked results.
  Vite emitted sandbox WebSocket EPERM for port 24678; the audit completed.
- `git diff --check`: passed.
- `npm run build`: blocked by existing errors in createAthlete.ts:28 (missing bio)
  and athletes/index.ts:11 (undefined index). These data files were not changed.
- Before/after filesystem hashes confirm data, ranking implementation, photos,
  photo scripts/evidence, athlete-detail.css and local audit/ranking/SOF files
  remained unchanged. Existing uncommitted profile markup was preserved.

To repeat browser checks, run Vite at 127.0.0.1:5190 and an isolated Chrome instance
with remote debugging on 9231. The script accepts TRI_APP_URL and TRI_CDP_URL;
it uses Node's built-in WebSocket, with no new dependencies. Screenshots/results
are written to /tmp. It is intended for an isolated test browser, not a personal tab.

## Navigation task files

- src/App.tsx
- src/navigation/history.ts
- src/navigation/Navigation.tsx
- src/navigation/usePageState.ts
- src/pages/AthletesPage.tsx
- src/pages/AthleteDetailPage.tsx (state hooks only; prior visual edits preserved)
- src/pages/CalendarPage.tsx
- src/pages/RaceDetailPage.tsx
- src/components/RaceResultsTable.tsx
- src/components/HomeShowcase.tsx
- src/components/HorizontalScroller.tsx
- scripts/test-navigation.mjs
- scripts/test-navigation-browser.mjs
- docs/navigation.md

Working branch: home-redesign-experiments. Changes are unstaged/uncommitted;
Photo Batch 2 and the prior UI edits remain in the working tree. No add/commit/push.
