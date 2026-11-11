# Rankings → Athlete Profile navigation latency

Date: 2026-11-10. Local baseline: `a94c816417d28d358b677d0d49aab222c1f9eaae`, `home-redesign-experiments`. Status: INVESTIGATION COMPLETE / PREFETCH NOT ADOPTED. Documentation-only local commit; no push, PR or deployment.

## Cause and candidate

The isolated Rankings entry avoids the full sports entry (results linkage, internal ranking initialization and other sports routes). First profile navigation consequently needs that deferred module. The baseline deferred sports script is ~623 KB minified / 164273 B gzip body, plus its stylesheet. The delayed baseline requests it on click; all five delayed candidate runs have it completed before the click and reuse it without another sports request. The previous 54 → 1084 ms observation compared an already-loaded module with an on-demand import; it was one diagnostic, not a five-run navigation baseline.

The candidate keeps that loading boundary. Once Rankings has mounted, it waits for document completion, both responsive showcase images and visible images, and a one-second quiet interval without input/scroll/resize or observed pending images, followed by a browser idle callback (readiness is checked every 250 ms). Conditions are checked again inside the callback. Only then does it call the existing cached sports resource. No preload is inserted into the critical rendering path. There are no new dependencies, content changes, CSS changes or route handlers.

Speculation is cancelled on unmount, disabled for Save-Data and omitted when requestIdleCallback is unavailable. A speculative rejection is contained; actual navigation retains the existing resource/error handling. A click while the same import is pending shares its promise. Failed showcase loading does not trigger speculation. Off-screen lazy avatars do not hold the page indefinitely. Image completion is a guard for this currently static Rankings route, not a general network-idle API.

Interaction-only prefetch was considered: pointerdown on a touch device offers almost no lead time; hover is unavailable on touch. Starting either before critical images finish would reintroduce the previously rejected bandwidth competition. The candidate instead postpones on interaction. It does not promise to accelerate immediate navigation.

## Measurement protocol

Same local gzip server, production builds of the actual working tree (pre-existing edits held constant), deterministic scene 3 (`Math.random=()=>0.99` in test only), cold browser cache and origin storage per navigation. Chrome 157; mobile 390×844/DPR3/CPU4×; desktop 1440×900/DPR1/CPU1×. Network: 150 ms latency, 200000 B/s download, 93750 B/s upload. No physical-device result is claimed.

Separate cohorts avoid ending LCP by interacting:

- Five mobile and three desktop passive cold loads, each observed for 12 seconds.
- Five mobile usability trials: real click on Women when rows appear; require selected state, populated active W table and completed scroll-snap alignment.
- Five immediate profile transitions per variant: click first active athlete row as soon as populated table appears.
- Five delayed transitions per variant: same click at 12 seconds after navigation, independent of prefetch completion. Measure click to `.athlete-detail-page`; verify Back returns to Rankings.

Initial JS means the entry, shared Rankings and Rankings-entry scripts required to render the table; all completed before visibility in these samples. Total JS by 12 seconds is reported separately: prefetch defers traffic, it does not eliminate it. Resource Timing encoded body sizes are compressed payload. CDP encodedDataLength is reported separately as browser-observed transfer including response overhead; neither is raw minified size or a TLS/wire capture. Navigation detection polls at 25 ms, so small timing differences are within measurement resolution.

An exploratory candidate measurement was interrupted because release gate rebuilt the served `dist` and one navigation received 404. That run is excluded and retained as `after-invalid.json/.log`. An additional incomplete series lost foreground visibility in headless Chrome; it is also retained and excluded. The final before/after series explicitly emulates foreground focus, rejects missing paint observations and runs after builds finish, with no further build or test suite running concurrently. This is harness interference, not evidence of an application regression.

## Results and decision

**Do not adopt this candidate.** The delayed transition improves substantially and passive Rankings metrics remain stable, but the earliest DOM-trigger navigation shows a repeatable regression in this cohort. A fixed-time control removes the difference; that does not establish the cause of the original discrepancy or justify silently discarding it. The runtime experiment is removed from the final working tree. The existing lazy-entry architecture remains unchanged.

All values below are medians. Five independent cold mobile navigations per variant per scenario; three desktop passive loads. [Per-run measurements and network evidence](rankings-profile-prefetch-measurements.json).

| Metric | Baseline | Experimental prefetch |
|---|---:|---:|
| Mobile cold LCP | 6032 ms | 6032 ms |
| Table visible | 1625 ms | 1626 ms |
| Table usable (Women click + snap) | 1979 ms | 1990 ms |
| Desktop LCP | 1588 ms | 1604 ms |
| Mobile CLS, all five | 0 | 0 |
| Desktop CLS, all three | 0 | 0 |
| Initial JS transferred (CDP encodedDataLength) | 183788 B | 184331 B |
| Total JS transferred by 12 s | 183788 B | 348862 B |
| Initial JS compressed body | 183040 B | 183583 B |
| Total JS compressed body by 12 s | 183040 B | 347864 B |
| Mobile ScriptDuration by 12 s | 86.4 ms | 130.9 ms |
| Profile: earliest populated DOM click | 3510 ms | **3919 ms** |
| Profile: fixed 2 s click control | 3743 ms | 3748 ms |
| Profile: delayed 12 s click | 1083 ms | **44.7 ms** |

The passive candidate starts its sports import at 7.638–7.889 s on mobile, 793–1046 ms after the last showcase transfer. It adds 164281 compressed JS bytes plus 2615 compressed stylesheet bytes; the new scheduling code adds 543 compressed initial JS bytes. No post-import long task over 50 ms or CLS event was observed in these passive samples. Aggregate ScriptDuration is not a separate parse-time measurement or an INP guarantee.

The original 1084 ms diagnostic is reproduced by the **delayed baseline**, not the earliest cold click. Earliest navigation begins while showcase/avatar transfers are still pending. Fixed-2s traces show both variants request the same 20 lazy avatar images and two artworks before navigating, followed by one high-priority sports module request and its stylesheet. There are no duplicate sports imports; profile and Back resolve correctly. The five fixed-time control results differ by only ~5 ms, within polling resolution.

**Unresolved:** the earliest DOM-trigger five-run cohort differs by ~409 ms despite prefetch not yet starting. The original harness cleared its request map at the click, so it cannot establish the full pre-click image-request ordering/cancellation mechanism. The fixed-time follow-up preserves that evidence, but cannot retroactively prove the earlier cause. Request scheduling near first render is a hypothesis, not a confirmed application defect. Both cohorts remain in the evidence; the slower cohort is not replaced with the more favorable control. No claim that every immediate navigation is unaffected is made.

Profile time measures the appearance of the existing `.athlete-detail-page` DOM after a real CDP mouse click, not profile-image LCP. The same first athlete (`#/athlete/25`) and successful Back route were used in both versions. Delayed candidate navigation requests no additional sports JS because the resource is already initialized.

## Verification

Candidate checks actually run:

- `npm run build`, `npm run lint`: PASS. Existing >500 KB sports/shared chunk warnings remain; no new dependency.
- `node --test scripts/test-profile-prefetch.mjs scripts/test-rankings-route.mjs scripts/test-sports-loader.mjs`: 4/4 PASS. Covers delayed scheduling, input/visibility/unmount cancellation, Save-Data/missing idle API, swallowed speculative error, shared/retry resource, exact canonical identities and Rankings markup.
- `npm run check:release`: 18/18 PASS.
- New prefetch browser test: 2/2 (390 and 1440), explicitly holds both artwork responses; no speculative sports request until release, one import reused by Profile/Back.
- Existing startup browser: 2/2; main Rankings: 14/14; swipe: 14/14 plus reduced-motion/orientation/network assertions; code-splitting: 4/4; navigation: all scenarios PASS. Each suite uses a fresh Chrome profile. No blind retries of application assertions.

Retained baseline checks after removing the experiment: release gate **18/18 PASS**, including production build and full lint; `node --test scripts/test-rankings-route.mjs scripts/test-sports-loader.mjs` **3/3 PASS**; startup/Profile/Back browser **2/2 PASS**; navigation browser **all scenarios PASS** on fresh profiles. `git diff --check` and new documentation links PASS. Hash comparison confirms every pre-existing file except the intentional Project Board addition is unchanged. The new helper and its tests are archived outside the repository, not committed. No full catalog regeneration, data edit or deployment was performed.

## Limitations and promotion

The optimization speculatively downloads and initializes the sports module even when a visitor stays on Rankings. It must not be described as a total bandwidth saving. Once import starts it cannot be cancelled; later navigation or new image requests can overlap it. Idle scheduling determines start, not an execution-time guarantee for eventual module evaluation. Mobile Safari/Telegram physical QA remains necessary; browsers without the idle API retain on-demand navigation.

Next step: instrument first-render image requests, cancellations and input/paint timing in a paired baseline/candidate trace before considering adoption. If improving immediate navigation is required, evaluate a narrower Profile data/module boundary separately; do not reintroduce eager full-sports loading or an early artwork preload. Physical mobile Safari/Telegram QA must include immediate tapping during artwork loading.

Evidence/experiment archive: `/tmp/300w-profile-prefetch/`; candidate patch and tests are local diagnostic artifacts, not shipped implementation. Two initial harness problems (build overwrite and hidden/disconnected CDP session) were corrected; the navigation harness also needed a boolean DOM predicate instead of serializing a React DOM node. These failed/incomplete runs are not performance samples. Final passive/usability/navigation cohorts use fresh Chrome processes per cohort, cleared cache/storage per run, foreground emulation, bounded CDP commands and no simultaneous builds or browser suites.

Current local/remote history divergence and the separate blocked biography integration remain untouched. This local performance commit is not authorization to reconcile branches or publish unfinished local work.
