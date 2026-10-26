# QA-04 — Showcase network request investigation

Date: 2026-10-26. **QA-04 and QA-04B — Owner Approved by DS-01C.2.** The initial QA-04 investigation below is historical; its diagnostics-only scope precedes the QA-04B implementation and approved local consolidation.

## Finding and release decision

No DS-01B image-loading regression was observed. The historical `4 !== 2` failure is **not reproduced by the original test in this investigation**; its exact cause remains unconfirmed because the failing run did not preserve request IDs/loader IDs. Do not retroactively label that failure a proven cache issue or runtime defect.

A concrete measurement-boundary weakness is established: the test resizes a still-mounted landscape page to portrait immediately before navigating and counts global request events without associating them with a document. Controlled diagnostics captured **four events / two distinct URLs / two loader IDs**: two portrait requests from the old document followed by the same two portrait requests from the new document. With cache disabled these were actual transfers, not just cache events. This happened identically in baseline, DS-01B and isolated DS-01B. It is a credible explanation for intermittent contamination of the counter, but not proof that those old-loader events arrived after `requests.length = 0` in the historical failure.

Recommendation: owner review of a narrowly scoped test-only measurement-boundary correction before resuming the blocked DS-01C commit. Do not change runtime image loading on this evidence. Fresh PASS results do not establish that the intermittent test weakness is resolved. No deployment or release approval is implied.

## Source and Git preservation

- Branch: `home-redesign-experiments`.
- HEAD: `f99c7775b92143eb847d470dd93ff4c3580c5224`; index empty.
- Start status and SHA-256 inventory: `/tmp/300w-qa04/status-before.txt`, `/tmp/300w-qa04/before.json`.
- Existing six DS-01 paths and unfinished Athlete Profile work were retained. No Git index operations.
- Only this report and the QA-04 entry in [Project Board](PROJECT_BOARD.md) are task edits.

Three independently built local copies were used:

| Copy | Source | Server |
| --- | --- | --- |
| baseline | Exact committed HEAD via `git archive` | localhost:5450 |
| current | HEAD overlaid with actual working-tree files, including existing unrelated work | localhost:5451 |
| isolated | HEAD plus the six DS-01 files only | localhost:5452 |

Copies and all diagnostic evidence are under `/tmp/300w-qa04/`; these temporary artifacts are not durable release evidence or repository dependencies. Existing evidence was not overwritten. All three production builds passed; the documented sports chunk warning remains (~1,295.21 kB minified / 266.29 kB gzip in current build). No full release gate was rerun because it is not needed to diagnose this request counter.

## Reproduction method and results

The original `scripts/test-rankings-swipe-browser.mjs` was executed unchanged. A separate CDP observer recorded requests on the same page without changing its assertions. Full runs use independent Chrome profiles for baseline/current, then reuse the current profile. Each full run covers seven viewports, both OS preferences, mouse/touch, both series/genders, season, athlete navigation, vertical scrolling and NAV stacking; its final network section explicitly disables cache even in the reused run.

The fixed-scene network matrix uses a separate browser profile and test-only `Math.random = () => 0.1` injection to compare the same swim artwork pair across builds. It is not a modification to application files. Matrix copies share that diagnostic browser, navigate through `about:blank` and clear cache between builds. These are fresh documents, not three independent browser profiles. Original full runs retain normal randomized scenes.

| Diagnostic | Bounded cases | Result |
| --- | --- | --- |
| Original full suite, baseline fresh browser | 1 run / 14 gesture scenarios + network checks | PASS |
| Original full suite, DS-01B fresh browser | 1 run / 14 gesture scenarios + network checks | PASS |
| Original full suite, DS-01B reused browser | 1 run / 14 gesture scenarios + network checks | PASS |
| Network matrix, baseline/current/isolated | 27 phases total | PASS: decoded neighboring artwork, correct orientation and T100 selection |
| Resize→navigation observation window | 12 transitions within matrix | 12/12 capture two old-loader + two new-loader requests |
| Exact counter-reset ordering probe | 12 additional transitions, 4 per build | 12/12 count only two new-loader events after reset; no failure |

The exact reset probe preserves the test's setup order (cache off, resize, emulated media, reset array, navigate, decode). The broader matrix deliberately records the entire resize/navigation interval and performs a state snapshot before navigation; this additional observation can change timing. Therefore its four-event result is **not** reported as a reproduction of the original failing assertion. No unbounded stress loop was used.

## Request-level evidence

Artifacts:

- `baseline-fresh/`, `current-fresh/`, `current-reused/`: unchanged test stdout, screenshots and `events.jsonl`.
- `full-results.json`: original suite exit results.
- `matrix-events.jsonl`, `matrix-states.json`: phase boundaries, currentSrc/decoded states and Resource Timing sizes.
- `reset-events.jsonl`, `reset-results.json`: counter-reset probes with old/new loader IDs.
- `requests.json`: normalized request records, including URL, document/loader/frame IDs, initiator, resource type, timestamps, status, response timing, cache flags, transferred body bytes, completion bytes and failure state.
- `network-summary.json`: per-phase measurements; `cdp.mjs`, `matrix.mjs`, `reset-probe.mjs`, `full-runs.mjs`, `summarize.py`: diagnostic harnesses outside repository.

Representative first baseline transition (UTC 15:04:29):

| Request ID | Document loader | Asset | HTTP | Transferred body bytes | Completion bytes |
| --- | --- | --- | --- | ---: | ---: |
| 40686.399 | old `043FA70B…` | ironman_01_swim.webp | 200 | 296,142 | 296,412 |
| 40686.400 | old `043FA70B…` | t100_01_swim.webp | 200 | 278,206 | 278,476 |
| 40686.408 | new `A32AA538…` | ironman_01_swim.webp | 200 | 296,142 | 296,412 |
| 40686.409 | new `A32AA538…` | t100_01_swim.webp | 200 | 278,206 | 278,476 |

All four are portrait `/images/showcase/rankings/optimized/` images, resource type `Image`, initiator `other`, disk/service-worker/prefetch cache flags false; no failure/cancellation. The pair is transferred twice across **two different documents** with caching disabled: 1,148,696 body bytes total. No duplicated image transfer within either document is demonstrated. The same pattern occurred in all 12 broad-window transitions. Native CDP initiator `other` does not supply a JavaScript stack; none is invented.

Identical measurements for all three builds, fixed swim scene:

| Phase | Request events | Distinct URLs | Body transferred | CDP completion bytes | Interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| Fresh cold portrait | 2 | 2 | 574,348 | 574,888 | Both neighboring series, portrait only |
| Series switch to T100 | 0 | 0 | 0 | 0 | Already available adjacent picture |
| Warm portrait reload | 2 | 2 | 0 | 254 | HTTP 304 revalidation; cached bodies reused |
| Cold landscape resize | 2 | 2 | 444,902 | 445,442 | Landscape variants only |
| Warm landscape reload | 2 | 2 | 0 | 254 | HTTP 304 revalidation; cached bodies reused |

Completion bytes include protocol overhead as exposed by CDP; body bytes come from `Network.dataReceived.encodedDataLength`. Resource Timing encoded/decoded body sizes are separately preserved in matrix states. HTTP 304 reuse is not mislabeled as a `fromDiskCache=true` event. These are local Vite preview measurements, not production CDN/iPhone transfer benchmarks. No inactive-orientation simultaneous transfers, cancellation/retry explanation or DS-01B-specific extra transfer was found in these controlled phases.

## Contract review and proposed correction (not implemented)

Relevant source:

- [Original browser test](../scripts/test-rankings-swipe-browser.mjs): lines 45–49 enable Network, disable cache, resize the existing page, clear a URL-only global array, then navigate; line 49 asserts exactly two events without loader attribution. Later orientation assertions accumulate that same array.
- [Rankings page](../src/pages/OfficialRankingsPage.tsx): scene selected randomly at mount; two neighboring series pictures render together, each with orientation-specific WebP sources. A new document may choose a different scene. Thus four events across navigation can also involve four distinct URLs; that was not established for the historical failed run.
- DS-01B changes affect CSS theme/contrast/fonts and the separate official-rankings browser test; the swipe test and image-selection implementation are unchanged.

Exactly two correctly selected neighboring images is a valid **cold-load, single-document** contract. Exactly two global request events across resize and navigation is not a safely isolated performance contract. Warm-cache events need not equal actual image body transfers.

Proposed minimal test-only change for separate authorization:

1. Move to `about:blank` before final viewport/cache setup, so resizing cannot trigger old Rankings pictures.
2. Capture `loaderId` from `Page.navigate` and attribute image requests to that document; retain request IDs, completion, response and failure metadata for diagnostic output.
3. Wait boundedly for both expected currentSrc images to decode; assert two distinct expected responsive URLs, correct active artwork and adjacent availability. Do not pass merely because two arbitrary URLs appeared.
4. Assert no inactive-orientation body transfers and no repeated body transfer for an identical asset in that document. Keep series-switch no-extra-artwork checks and expected landscape variant checks after intentional resize.
5. On failure print request/loader IDs, URLs, orientation, cache/status/completion and decoded states. Do not replace expected 2 with 4 or suppress the check.

## Validation and remaining limits

Fresh builds: 3/3 PASS. Network phases: 27/27 completed. Reset probes: 12/12 two-event result. No runtime/test fix was applied. Original full suites: **3/3 PASS**, totaling **42/42 gesture scenarios**, plus all three final reduced-motion/boundary/orientation/network checks; no runtime exceptions reported. `git diff --check`: PASS. Index remains empty, HEAD/branch unchanged. SHA-256 comparison against the start inventory confirms every existing file is unchanged except the authorized Project Board update; this report is the only new repository file.

The historical failure's exact four URLs, document attribution and transfer sizes remain unavailable. Physical iPhone and production cache behavior are outside this local diagnostic result. A confirmed image-loading performance regression is not established; the measurement-boundary risk merits test maintenance, not a runtime workaround. DS-01C staging/commit remains for a separately authorized continuation after owner review.

## QA-04B — Document-scoped test correction · 2026-10-26

**Implemented / Owner Approved by DS-01C.2.** Owner authorized the test-only correction and subsequent local consolidation. Historical QA-04 findings above are retained. The original failure's exact cause remains unproven.

Only `scripts/test-rankings-swipe-browser.mjs` changes executable behavior, exclusively in the test:

- CDP Network observation starts before measured navigation. The existing page is navigated to `about:blank` before changing orientation. Measurement state resets explicitly, then `Page.navigate.loaderId` selects the active document.
- A single existing WebSocket listener feeds a request/hop ledger; no extra scenario listeners accumulate. Socket closure remains in `finally`.
- Requests are attributed by request `loaderId`; if absent, `Network.responseReceived.loaderId` is the independently supplied fallback. Missing attribution fails with recorded request details rather than dropping the request or guessing from URL/frame. Navigation without a loader ID also fails explicitly.
- Redirect hops sharing a request ID and retries using new IDs remain recorded. All hops of a showcase request are retained, including redirects outside the showcase URL path. Unexpected redirect destinations fail the URL contract rather than silently disappearing.
- Old documents are excluded; the active document retains portrait and subsequent landscape requests across the intentional orientation change. Independent navigation resets clear the previous ledger.
- A bounded five-second state wait replaces the measured-navigation 700 ms sleep, checking two loaded neighboring images and completed request events. Network evidence is still mandatory: exact responsive URL sets are compared with currentSrc, and unexpected URLs, failed/incomplete requests and duplicate body transfers fail.
- Cache-served responses and HTTP 304 are distinguished from body transfers using CDP response/cache/data/completion fields. A repeated cached lookup does not masquerade as a duplicate body download. Current-document failed/retried attempts are retained for diagnostics, not silently ignored.
- Successful runs write `network-measurement.json` with active loader and request/hop metadata. Assertion diagnostics include expected URLs, loader, status/cache information, transferred bytes and failures.

### Deterministic negative fixtures

Run directly without a browser: `node scripts/test-rankings-swipe-browser.mjs --network-self-test`. These fixtures also execute before every full browser run.

| Controlled event case | Required result |
| --- | --- |
| Old and active documents request the same image | Only active document counted |
| Two active-document body transfers of identical URL | Assertion rejects duplicate transfer |
| Body transfer followed by disk-cache response and 304 | All events retained, only one body transfer |
| Reset/reload with stale landscape event | Stale event excluded from new portrait scenario |
| Missing request loader | Fails attribution until response supplies verified loader |
| Redirect to URL outside showcase path, same request ID | Both hops retained; unexpected URL rejected |
| Active-document canceled request | Retained and rejected as failed, not silently omitted |

Fixtures PASS. These are synthetic CDP events validating instrumentation, not a reproduction of the historical intermittent browser failure. No runtime, artwork, mappings or data changes.

### QA-04B final verification

Evidence root: `/tmp/300w-qa04b/`. Production build served locally on port 5460; separate Chrome profiles used for concurrent suites. Final swipe revision ran in a fresh profile and two reused-profile executions. Each full swipe run still forces a cold measured navigation; earlier gesture portions may reuse cache.

| Check | Actual result |
| --- | --- |
| `node scripts/test-rankings-swipe-browser.mjs --network-self-test` | PASS; negative fixtures reject invalid cases as intended |
| Final swipe revision (`swipe-2`, `swipe-3`, `swipe-4`) | **3/3 PASS**, 42 gesture scenarios plus three network/orientation/reduced-motion checks |
| Initial implementation run (`swipe-1`, before redirect-chain fixture hardening) | PASS, additional 14 gesture scenarios; not counted as final-revision repetition |
| `test-official-rankings-browser.mjs` | PASS, 14 viewport/theme combinations, exact season tables/links and controls |
| `test-rankings-showcase-browser.mjs` | PASS, eight mapped scenes across portrait/landscape/desktop and both preferences, approved asset hashes and responsive selection |
| `test-global-nav-browser.mjs` | PASS, viewport/theme matrix, 50 mouse/touch destination pairs, nested routes, history and clearance |
| `test-navigation-browser.mjs` | First shared-context run FAIL at line 25: `rankings` instead of `athletes`; separate fresh-profile run **PASS** including all subsequent scenarios |
| `node --test scripts/test-navigation.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs` | **23/23 PASS** |
| `npm run build` | PASS; existing sports chunk warning remains |
| `npm run lint` | PASS |
| `npm run check:release` | **18/18 PASS**; fast gate, not live infrastructure verification |
| `git diff --check` | PASS |

No intermittent showcase-network failure occurred. Every completed swipe measurement retained four expected body transfers in one active document: two portrait followed by two landscape, each URL transferred once. Byte totals vary with the existing randomized scene selection; no artwork was modified.

The navigation failure occurred after other suites in a shared browser and disappeared in an isolated profile. This demonstrates an environment-dependent result, **not a proven diagnosis of its precise cause**. The unchanged navigation test was rerun once in isolation; no assertion was weakened and no navigation code changed. Keep this limitation visible rather than declaring every invocation successful. Logs: `navigation.log`, `navigation-isolated.log`, `other-results.json`. The legacy NAV-03 suite writes generated screenshots to its fixed `/tmp/300w-nav03` location; the navigation suite's existing fixed-path outputs were backed up and restored, with new results copied into this task's evidence directory.

Release gate retains its previously documented non-gating localization/photo-test limitations. No new build/lint warning was introduced. Physical-device and production-cache testing were not performed.

### Preservation and recommendation

HEAD remains `f99c7775b92143eb847d470dd93ff4c3580c5224` on `home-redesign-experiments`; index empty. SHA-256 inventory comparison against `/tmp/300w-qa04b/before.json` allows exactly three changed existing paths: the target swipe test, this report and Project Board. All other inventoried repository files, including the six prior DS-01 files apart from the authorized Board addition and unfinished Athlete Profile work, retain their starting bytes. No staging, commit, push, deployment, version/data/artwork/infrastructure change.

**QA-04B is ready for owner review.** The document-scoped network correction is supported by deterministic negative fixtures and repeated browser PASS results. Recommend resuming DS-01C only after owner acceptance of this correction and the separately recorded navigation-test limitation; use isolated browser profiles for the commit gate. This task does not mark DS-01C complete or independently authorize a commit.


## DS-01C.2 — Approval and local consolidation

Owner-approved QA-04 investigation and QA-04B correction are included in a dedicated test/documentation commit after the DS-01 design-system commit. No runtime code belongs to this QA commit. Shared Project Board hunks are separated; unrelated HOME-UI-01 text and Athlete Profile work remain local. No push or deployment is authorized.

The historical recommendations to wait for QA-04B approval above are superseded by DS-01C.2. The original request-count failure cause remains unproven. **Navigation shared-context instability remains OPEN for final UI-QA**: an isolated-profile PASS does not establish its cause or dismiss the earlier failure. Sports chunk warning and historical photo-test limitations remain documented.

Exact staged-candidate and post-commit verification logs, commit path manifests and preservation hashes are recorded under `/tmp/300w-ds01c2/`. Final post-commit results are reported to the owner; the temporary directory is not a runtime dependency or durable evidence archive.
