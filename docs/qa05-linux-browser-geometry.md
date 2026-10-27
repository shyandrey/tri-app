# QA-05 — Linux Browser Scrollbar & Viewport Geometry

Status: **Linux Browser Geometry / Awaiting Owner Review**. Diagnostics-first, 2026-10-27. No runtime, artwork, data or original browser assertions modified.

## Baselines and evidence

Development HEAD `82a4a6b7293c901ab8d89c06948e9736e8777c46`; existing dirty Profile work and two prior documentation updates preserved. Historical qualification SHA `33f2acff88d6055b85df80b00670e0140ad1fd44`, [run 40483823503](https://github.com/shyandrey/tri-app/actions/runs/40483823503). Historical logs/artifact index remain under `/tmp/300w-devops03b2b1/`; SHA-256 preservation manifest recorded under `/tmp/300w-qa05/historical-evidence-hashes.json`. No historical artifacts overwritten.

New evidence root: `/tmp/300w-qa05/`. Isolated diagnostic commit `a4ae3681c81a10b2f6659a1cbb356de76eb2c5f0`, [run 40486902378](https://github.com/shyandrey/tri-app/actions/runs/40486902378), branch `ci/preview-integration-qualification`. Exactly one GitHub push; no rerun. Only two qualification files changed: `scripts/ci-qualification/geometry.mjs` and `scripts/ci-qualification/browser.mjs`. They are not in the development branch. Existing workflow, portable checks, seven original suites and their assertions are unchanged.

## Exact historical failures

| Suite / assertion | Scenario | Actual / expected |
| --- | --- | --- |
| `scripts/test-official-rankings-browser.mjs:90`: root scrollWidth equals configured width | 844×390, desktop, dark; first eight viewport/theme combinations passed | 829 / 844 |
| `scripts/test-rankings-showcase-browser.mjs:191`: T100 selected and track scrollLeft equals configured width | 1440×900 desktop, dark; all mobile geometry/scene combinations passed | T100 selected, 1425 / 1440; bounded wait expired |
| `scripts/test-more-browser.mjs:36`: root scrollWidth equals configured width | 768×900 desktop; 320/390/430 passed | 753 / 768 |

Historical Linux browser: Chrome 155.0.8059.39, `--headless=new`, sandbox enabled, DPR 1. Official Rankings/More select mobile emulation below 768px; Showcase below 1000px. These thresholds explain why large landscape scenarios in one test use mobile emulation while another treats them as desktop. No assertion mismatch alone proves a layout defect.

## Diagnostic procedure and contract distinction

Measured inner/outer viewport, root/body client widths and bounding boxes, DPR, visual viewport, vertical scroll dimensions, reserved scrollbar width, computed overflow/gutter/scrollbar styles, hero/track/panel/table geometry, selected series/season and PNG IHDR dimensions. Source: qualification `geometry.mjs`; outputs `geometry.json` and four screenshots per platform. New measurements are comparable scenario probes, not retroactive exact DOM snapshots of the original failures.

Each scenario records baseline, temporarily sets only the test document's root `scrollbar-width:none`, measures again, then restores the exact original inline style and remeasures. This reversible browser intervention is diagnostic only: no production CSS files or canonical tests change. Layout uses two animation frames to settle; series/season readiness has a bounded state-based wait. The geometry process exits before original suites; each suite gets its own clean browser/profile.

`outerWidth` describes the headless browser window, not the CDP-emulated CSS viewport. Screenshot width at DPR 1 matches configured viewport, including any scrollbar strip. Root client width is available layout width; `scrollWidth` is content extent. Track snapping intentionally uses its own `clientWidth + gap` (`src/components/RankingsSwipeTrack.tsx:15`). Showcase height intentionally uses `100vw` in CSS; do not replace height/breakpoint/crop expectations with content width indiscriminately.

## Proposed test-only correction and negative checks

If measured scrollbar attribution is confirmed, replace only inappropriate content-width/snap assumptions in the three failing scripts. Assert root `scrollWidth <= clientWidth`, hero left edge and width against actual available root width, track/panel coverage and settled offset against actual track width. Keep configured viewport for device setup, responsive breakpoints, screenshot pixels and CSS `vw`-based height. Preserve image paths, hashes, dimensions, crop/focal constraints, data, season, navigation and all behavioral assertions. Add geometry diagnostics on failure; do not add a 15px tolerance or hide scrollbars in acceptance runs.

A standalone diagnostic proposal `/tmp/300w-qa05/contract-negative.mjs` passed normal reserved-scrollbar and measured macOS geometry, and rejected four synthetic faults: **1px horizontal overflow, 1px undersized hero, 1px inset and 1px wrong snap**. These are proposal fixtures, not an applied correction or full regression test; canonical tests remain unchanged.

## macOS measured geometry

Chrome 156.0.8078.48, headless, DPR 1; exact isolated approved application build. Browser version differs from historical Linux Chrome, so cross-platform comparison alone is not a controlled browser-version experiment. Within-document scrollbar intervention is the causal check.

| Scenario | innerWidth | outerWidth | root / body clientWidth | visualViewport.width | reserved scrollbar | scrollHeight / clientHeight | screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| rankings-desktop | 844 | 756 | 844 / 844 | 844 | 0 | 1165 / 390 | 844×390 |
| showcase-desktop | 1440 | 756 | 1440 / 1440 | 1440 | 0 | 1278 / 900 | 1440×900 |
| more-desktop | 768 | 756 | 768 / 768 | 768 | 0 | 1003 / 900 | 768×900 |
| rankings-mobile | 390 | 390 | 390 / 390 | 390 | 0 | 1097 / 844 | 390×844 |

All four documents are vertically scrollable, but macOS reserves no horizontal space. Root/body computed `overflow-x/y: visible`, `scrollbar-gutter: auto`, `scrollbar-width: auto`. Hiding then restoring root scrollbar does not change content width; T100 track and its snapped offset are both 1440px. Full element rectangles and computed styles remain in the JSON.

## Linux measurements and confirmed conclusion

Chrome 155.0.8059.39, Ubuntu headless, DPR 1. Geometry probe PASS. Root/body `overflow-x/y: visible`, `scrollbar-gutter: auto`, `scrollbar-width: auto`; each document vertically scrollable.

| Scenario | inner / outer width | root/body/visual width before → hidden → restored | reserved scrollbar | scrollHeight / clientHeight | screenshot |
| --- | --- | --- | --- | --- | --- |
| rankings-desktop | 844 / 780 | 829 → 844 → 829 | 15 | 1165 / 390 | 844×390 |
| showcase-desktop | 1440 / 780 | 1425 → 1440 → 1425 | 15 | 1278 / 900 | 1440×900 |
| more-desktop | 768 / 780 | 753 → 768 → 753 | 15 | 1024 / 900 | 768×900 |
| rankings-mobile | 390 / 390 | 390 → 390 → 390 | 0 | 1097 / 844 | 390×844 |

**Root cause confirmed:** classic Linux desktop vertical scrollbar reserves exactly 15 CSS pixels. Reversible removal/restoration changes the available content width by exactly 15px while inner viewport, screenshot dimensions and scroll height stay unchanged. Root/body/visual widths agree. Mobile emulation reserves zero pixels on both platforms. This is legitimate rendering behavior; the failing tests incorrectly equate content/track width with configured viewport width.

For T100 desktop, track width and actual snapped offset move together `1425 → 1440 → 1425`. Root `scrollWidth == clientWidth`, hero width equals available root width, and panels cover the track. This confirms correct layout and snap for the investigated failures, not a runtime regression. It does not certify every user-facing behavior or Safari support. Screenshot capture is correct: PNG dimensions retain the configured viewport and DPR 1. No evidence of stale screenshots or browser state caused these three failures.

Full Linux measurement JSON is both extracted from job stdout (`/tmp/300w-qa05/linux-geometry.json`) and retained in the run artifact. Four new screenshots/JSON are downloaded to `/tmp/300w-qa05/linux-artifact/geometry/`; macOS counterparts are under `/tmp/300w-qa05/mac/`. Geometry probes set reduced motion and use a series button to reach T100; the unchanged Showcase suite independently repeats the original pointer-drag failure. Thus the causal probe and original failed interaction remain distinguishable.

## Results and stop condition

- macOS first runs: Official Rankings PASS, Rankings Showcase PASS, More PASS. Fresh process/profile per suite, no retries. Logs/screenshots: `/tmp/300w-qa05/mac-suites/`.
- Linux: geometry probe PASS; Controls/Season Picker, Swipe/Network, Navigation, Calendar PASS. Official Rankings, Showcase and More FAIL again at the exact historical assertions/values. All seven original suites executed once; scenarios after each failed assertion did not execute.
- Linux portable verification PASS, including build/lint/release gate. The inherited controlled-failure job intentionally fails and uploads its artifact; it is independent of the browser failures. Build still emits the known sports chunk warning; pinned Actions also emit Node 20 deprecation/forced-Node-24 notices.
- Local isolated production build PASS; diagnostic scripts Node syntax/ESLint PASS; staged whitespace/sanitized secret scan PASS. Four negative proposal fixtures PASS; recorded Linux geometry also satisfies the proposed width/overflow/snap contract. No tolerance widening.
- **No correction applied to the three existing tests.** Conclusive Linux evidence became available from this first qualification run, which failed. Section 7 explicitly requires STOP after its first failure before further changes. Therefore no subsequent test edit, commit, push or rerun was performed. This restriction takes precedence over continuing the conditional fix now.
- Browser CI remains **not qualified**. Recommend a separately authorized minimal test-only correction to the three scripts as described above, preserving strict sizing/overflow, crop and interaction checks, then one fresh Linux qualification. Do not create permanent `preview` yet.

## Git and preservation

Primary branch/HEAD remain `home-redesign-experiments` / `82a4a6b7293c901ab8d89c06948e9736e8777c46`; primary index empty. No development commit or push. Primary changes for QA-05 are only this report plus updates to `docs/devops03b2-preview-implementation-plan.md` and `docs/PROJECT_BOARD.md`, all uncommitted. Existing Profile, prior documentation changes, photo staging, artwork, data and all unrelated artifacts are preserved by before/after hashes.

Qualification commit contains only the two diagnostic harness files named above. Qualification worktree is clean. One normal GitHub push updated only the existing qualification branch to `a4ae3681c81a10b2f6659a1cbb356de76eb2c5f0`; no force push or workflow rerun. Operational anomaly: the clone's `origin` points to the primary local repository. An initial `git push origin` therefore created a local `ci/preview-integration-qualification` ref there, without contacting GitHub or moving development HEAD. The authorized GitHub push then used its explicit URL. The extra local ref is preserved and disclosed; no remote configuration or history rewritten.

Documentation local-link validation and `git diff --check`: PASS. No permanent Preview branch, deployment, credentials, infrastructure, data, runtime, artwork or version changes. **QA-05 — Linux Browser Geometry / Awaiting Owner Review.**

## QA-05B — Approved test correction (2026-10-27)

This follow-up supersedes QA-05's diagnostic-only STOP for the specifically authorized test corrections. Runtime and design remain unchanged.

Exact test scope:

- `scripts/test-official-rankings-browser.mjs`: compare document scrollWidth with measured root clientWidth; retain exact standings/identity, table fit, season and interaction checks.
- `scripts/test-more-browser.mjs`: same content-width assertion; retain content visibility, spacing, navigation and bottom navigation checks.
- `scripts/test-rankings-showcase-browser.mjs`: drag coordinates/coverage use hero bounds; snap uses actual track clientWidth. Edge-to-edge width uses root clientWidth. Configured viewport still controls responsive artwork, CSS-vw height and screenshot dimensions.
- `scripts/browser-geometry-contract.mjs`: shared test-only assertions and seven negative fixtures, invoked by all three affected suites including Linux. No runtime import.

Before: equality with configured viewport falsely failed for classic scrollbars, e.g. 829 versus 844. After: strict content equality, explicit edge sizing and the existing subpixel (<1px) snap/height threshold; no arbitrary 15px allowance and no scrollbar hiding in corrected suites. Root width must be positive. Fixtures reject 1px horizontal overflow, 1px hero undersizing, 1px inset, 1px wrong snap, viewport-based wrong snap, content-width-based wrong responsive height, and landscape height used for portrait. Valid classic/overlay/mobile geometry remains accepted.

Local verification: targeted ESLint and syntax through suite execution; seven negative fixtures PASS; standings unit tests 20/20 PASS; unchanged release gate 18/18 PASS, including production build/full lint. Browser and Linux qualification results are recorded below after first-run completion. Evidence root `/tmp/300w-qa05b/`; previous QA-05 evidence preserved.

### QA-05B local completion and qualification scope

macOS Chrome 156.0.8078.48: all seven original browser suites PASS on their first run, each in a fresh profile (Official Rankings, Controls, Swipe/Network, Showcase, Navigation, Calendar, More). No retries. The seven negative fixtures run inside each affected suite; screenshots and logs are in `/tmp/300w-qa05b/mac-suites/`. Build/full lint/release gate 18/18 and standings unit tests 20/20 also PASS. Known sports chunk warning retained.

Isolated qualification commit **`674007db6450e4c8c3999fbcd1cf8b1471a581b4`**, message `test(browser): use measured content and carousel geometry`, parent `a4ae3681c81a10b2f6659a1cbb356de76eb2c5f0`. Exactly the four test/helper files listed above; no workflow, diagnostic harness, runtime or documentation files in the commit. Explicit-path staging, full diff/secret/whitespace review completed before commit. One normal push used the explicit GitHub repository URL (the isolated clone's origin is local).

[Qualification run 40496089575](https://github.com/shyandrey/tri-app/actions/runs/40496089575), attempt 1. Existing controlled failure artifact job remains intentionally failing, distinct from the required portable and browser jobs. Its configuration was not changed merely to produce a green overall run.

### QA-05B Linux first-run outcome — incomplete qualification

**Portable verification PASS; browser suites 6/7 PASS.** [Run 40496089575](https://github.com/shyandrey/tri-app/actions/runs/40496089575), attempt 1, qualification SHA `674007db6450e4c8c3999fbcd1cf8b1471a581b4`. No rerun/additional push.

| Required browser suite | Linux first-run result |
| --- | --- |
| Rankings Controls / Season Picker | PASS |
| Rankings Swipe / Network | PASS |
| Navigation | PASS |
| Calendar | PASS |
| Official Rankings | **FAIL** — remaining viewport equality at line 190 |
| Rankings Showcase | PASS |
| More | PASS |

The inherited geometry probe also PASS; the separate inherited controlled-failure job FAIL intentionally and uploaded diagnostics. Overall run is FAILURE, including the genuine remaining browser test failure; it must not be labeled successful qualification. Portable job includes build, lint and unchanged release gate. Local build/lint/18-check gate and seven macOS suites passed; that does not replace Linux acceptance.

**Remaining exact assertion:** `scripts/test-official-rankings-browser.mjs:190` evaluates hero `r.left===0 && r.width===innerWidth && r.top===0`, actual boolean false, expected true, at 844×390 desktop dark after eight complete smaller viewport/theme combinations. The corrected document-width assertion and subsequent table/season checks reached this later assertion. This second instance of the already confirmed content-versus-viewport assumption was missed during implementation. The failure log does not emit a fresh numeric rectangle; QA-05's measured 829px content/844px viewport and unchanged runtime explain the same contract problem. No new runtime defect is established. Later scenarios in this suite did not execute.

Minimal follow-up proposal (NOT implemented after failure): import/use the existing `assertEdgeToEdge` helper in Official Rankings for hero left/width against measured root clientWidth, retain a separate strict top===0 assertion, then qualify again under new authorization. Do not remove the edge-to-edge check or use a 15px tolerance. Review other width uses by meaning: screenshot width, CSS-vw height and viewport-bound checks must not be indiscriminately replaced.

The seven negative fixtures are part of each affected suite and remain passing; failure evidence explicitly logs their PASS before Official Rankings fails. Showcase/More now complete on Linux with their unchanged artwork/navigation assertions. No failing suite has been made non-blocking. Following the task's first-failure STOP, no test edits, new commits, pushes or retries were performed after observing this failure.

Evidence: `/tmp/300w-qa05b/run-logs.zip` and extracted `run-logs/`; browser artifact `browser-first-run-40496089575` (ID `12731420850`, 66,250,761 bytes) retained by GitHub. Small test/browser logs and summary downloaded separately under `/tmp/300w-qa05b/browser-evidence/`; screenshots remain in that GitHub artifact and local macOS evidence directory. Prior evidence was not overwritten. A usage-limit interruption affected only polling, then owner reset usage; the workflow continued independently, with no additional attempt.

Primary branch/HEAD remain `home-redesign-experiments` / `82a4a6b7293c901ab8d89c06948e9736e8777c46`; index empty. Three test edits, the new helper and three report/Board updates remain uncommitted in the primary tree. Qualification copy is clean at the four-file commit. Unfinished Profile changes and all unrelated original files preserved. No deployment/permanent Preview/Cloudflare/D1/runtime/data/artwork/version changes.

**QA-05B — Implemented / Awaiting Owner Review; correction incomplete, Browser CI NOT qualified.** Defer permanent Preview creation until this remaining test assumption is fixed and all seven Linux suites pass, then separately approve baseline promotion, reviewer model/protection and live PR/push/manual-trigger checks. Do not promote the qualification-only diagnostic harness as the permanent application baseline. Final documentation links and `git diff --check` PASS.

## QA-05B.1 — Final Official Rankings assertion correction

Owner authorized this follow-up after the QA-05B STOP. Only `scripts/test-official-rankings-browser.mjs` changes relative to qualification SHA `674007db6450e4c8c3999fbcd1cf8b1471a581b4`: import existing `assertEdgeToEdge`, measure hero left/width/top and root clientWidth together, assert edge-to-edge via the helper and retain strict top===0 separately. Immediate flag/points-column, table-heading, Back-button and surrounding responsive assertions remain unchanged. No hardcoded scrollbar offset/tolerance; helper/dependencies/runtime unchanged.

Local rerun: affected Official Rankings suite PASS with a fresh macOS profile; existing seven negative fixtures PASS; standings unit tests 20/20 PASS; targeted ESLint and `git diff --check` PASS. Full seven-suite macOS browser run, build, full lint and release gate were **not rerun locally**; QA-05B results (7/7, build/lint, gate18/18) are reused as authorized because application/dependencies did not change. Linux still executes the existing complete workflow.

Qualification commit **`fdd7918268326d6eeacef407951c8f1f9d69610a`**, `test(rankings): validate showcase against content width`, one file / 4 additions / 2 deletions. One explicit-URL normal push to existing `ci/preview-integration-qualification`; no development push or workflow modification. [Run 40518640960](https://github.com/shyandrey/tri-app/actions/runs/40518640960), attempt 1. Evidence root `/tmp/300w-qa05b1/`; prior evidence preserved. Final Linux outcome follows below.

### QA-05B.1 final Linux qualification — PASS

[Run 40518640960](https://github.com/shyandrey/tri-app/actions/runs/40518640960), attempt 1, SHA `fdd7918268326d6eeacef407951c8f1f9d69610a`: **required browser suites 7/7 PASS; Portable verification PASS**. No retries or additional push.

| Required suite | Linux result |
| --- | --- |
| Rankings Controls / Season Picker | PASS |
| Rankings Swipe / Network | PASS |
| Navigation | PASS |
| Calendar | PASS |
| Official Rankings | PASS — all 14 viewport/theme combinations, all 12 tables, Home/bottom navigation, zero runtime exceptions |
| Rankings Showcase | PASS |
| More | PASS |

The inherited geometry probe also PASS. Seven negative geometry fixtures passed inside the affected suites. Ubuntu Chrome is **156.0.8078.47** in this run (preinstalled browser floats; historical QA-05 ran Chrome 155). Node 24.19.0, npm 11.17.0, Python 3.12.3, SQLite 3.45.1. Portable logs confirm metadata, portable photos, PTO identity/registry, official standings and unchanged release gate PASS; build and lint execute within the Linux gate. Browser build separately PASS. No new runtime/data/design changes.

**Overall workflow conclusion remains FAILURE only because the inherited controlled-failure artifact job intentionally exits 1.** Its upload succeeded. This is distinct from the now-successful required browser and portable jobs; do not represent the overall workflow as green. No failing acceptance suite was made non-blocking, and no workflow changes were made in QA-05B.1.

Logs preserved in `/tmp/300w-qa05b1/run-logs.zip` and `run-logs/`. Browser artifact `browser-first-run-40518640960`, ID `12740473890`, 71,577,578 bytes: summary, test/browser logs and version downloaded via ZIP ranges to `browser-evidence/`; full screenshots remain in GitHub artifact. Prior logs/screenshots preserved. No claim of full offline artifact backup.

Exact primary files changed in this task: `scripts/test-official-rankings-browser.mjs`, `docs/qa05-linux-browser-geometry.md`, `docs/PROJECT_BOARD.md`. The primary test change and documentation remain uncommitted; only the single test file is committed/pushed on qualification branch. Primary `home-redesign-experiments` remains at `82a4a6b7293c901ab8d89c06948e9736e8777c46`, index empty; qualification copy clean at `fdd7918`. Existing QA-05B changes, unfinished Athlete Profile, data/artwork and all unrelated artifacts preserved. Final local documentation-link checks and `git diff --check` PASS.

**Recommendation:** QA-05 browser geometry blocker is resolved; this candidate's Linux browser qualification is complete, awaiting owner review. Before permanent Preview creation, separately approve a clean baseline containing reviewed test fixes (`674007d` and `fdd7918`) without qualification-only harness/intentional-failure workflow, approve PR author/reviewer/protection model and authorize branch/settings setup. Then verify actual Preview PR/push/manual triggers. The current development baseline alone does not yet commit these fixes. Known sports chunk and pinned Actions Node-runtime warnings remain; floating Chromium and physical Safari/Telegram QA are separate limitations. No permanent Preview branch, protection changes, deployment or development push performed.

## DEVOPS-03B.2B.2 — Owner-approved consolidation

Owner approved the qualified QA-05B/QA-05B.1 test corrections for the development baseline. The four test/helper files are byte-identical to qualification commit `fdd7918268326d6eeacef407951c8f1f9d69610a`. Qualification-only workflows, controlled failure jobs and browser harnesses are excluded. Runtime, official standings, artwork and unfinished Athlete Profile changes are not part of this consolidation.

The approved baseline is tested in `/tmp/300w-devops03b2b2/candidate`, exported from development HEAD `82a4a6b7293c901ab8d89c06948e9736e8777c46` plus the four approved test files. Portable tests PASS (photos 25, PTO 44, standings 20); production build, full lint and release gate 18/18 PASS. Current browser rerun results and remote-operation outcome are recorded in the [implementation plan](devops03b2-preview-implementation-plan.md#devops-03b2b2--approved-baseline-consolidation). Historical Linux 7/7 evidence above remains distinct from the current macOS run.
