# REL-PREP-02A — Browser gate diagnosis and scoped test corrections

2026-11-11. Candidate `/private/tmp/300w-rel-prep02-candidate`, detached base Preview `4a5f7e313809ab6bcacb907b7e85fae97e5a87db`. Test-only work; no runtime/data/version/configuration changes, commit, push, PR, merge or deployment. Content Freeze and TECH-01 full-regeneration prohibition remain.

Pre-task candidate hashes are in `/private/tmp/300w-rel-prep02a/before.json`. REL-PREP-02 evidence remains unchanged. Exactly three test scripts were edited; approved texts, IDs, results, ranking formulas, images and four Preview safeguards must match this snapshot after work.

## A — Brand: obsolete assertion, corrected

`test-brand-browser.mjs` required `.home-header h2` with the slogan. Approved HOME-UI-01 Variant C removed that heading and placed the exact slogan in an ordinary About paragraph in More. Added assertions for absent Home heading/text, no reserved header slot (header height equals top row plus existing padding/borders), existing 8px showcase gap and five navigation buttons. More must contain the exact paragraph immediately after the unchanged description. All other brand assertions retained.

Affected suite: PASS on all seven original viewport combinations. [Exact diff](rel-prep02a/test-brand-browser.mjs.diff).

## B — Image delivery: original date-dependent fixture corrected

The original test's `[3,0,2,1]` traversal assumes at least four upcoming Home cards, while 2026-11-11 has three. No race data was changed. Reused the existing Calendar/code-splitting test Date injection at **2026-10-02T09:00:00Z (Moscow 12:00)** in the pre-navigation fixture. Explicitly assert Moscow date and at least four cards; traverse any additional cards too, retaining all responsive/image/network/carousel/photo/layout assertions. The fixture is removed in existing cleanup. This uses original catalog races, not synthetic production records. Node's actual clock still drives cache-busting URLs; browser Date is fixed for each navigation.

Adjacent Calendar and code-splitting suites already control the date. UI-cleanup and Brand also render date-dependent Home content, but neither has this fixed fourth-card access; no broad clock rewrite was made.

First affected-suite run: 390@3 PASS, then a new timeout waiting for card 2's image at 440px. The original missing-card exception is resolved, but the entire suite is NOT claimed PASS. A separate diagnostic-only copy preserved assertions and would capture DOM/image/scroll state on timeout. It passed all four sizes; no timeout diagnostics/screenshot were emitted because the failure did not recur. This was one evidence-gathering run, not a replacement PASS for the initial failure. Its exact cause remains unconfirmed; no further retry or speculative runtime/test synchronization patch was made. [Exact test diff](rel-prep02a/test-image-delivery-browser.mjs.diff).

## C — Navigation spacing: obsolete pre-NAV-03 geometry

Evidence: `docs/nav03-integration-2026-10-23.md` explicitly approves nav height **58px portrait / 48px short landscape**, 44px hit targets, 640px landscape cap, while retaining page content padding. `src/home-refinements.css` reserves **76+18+24 = 118px**. Thus the old exact 24px news-to-nav gap assumed a 76px nav that no longer exists. Current expected clearance is `118 − actualNavHeight − actualBottomInset`, about 42px portrait and 52px landscape. Fractional layout versus integer scroll height accounts for subpixel residuals; the existing <1px precision is retained.

Read-only geometry on seven sizes:

| Viewport | Nav height | News clearance | Bottom inset | Overflow / five button hit tests |
|---|---:|---:|---:|---|
| 320×800 | 58 | 42.15625 | 18 | none / PASS |
| 390×844 | 58 | 42.25 | 18 | none / PASS |
| 440×956 | 58 | 42.390625 | 18 | none / PASS |
| 768×1024 | 58 | 42.390625 | 18 | none / PASS |
| 1440×900 | 58 | 41.71875 | 18 | none / PASS |
| 844×390 | 48 | 52.390625 | 18 | none / PASS |
| 956×440 | 48 | 52.390625 | 18 | none / PASS |

[DOM measurements](rel-prep02a/geometry.json), [320 screenshot](rel-prep02a/320x800.png), [landscape screenshot](rel-prep02a/844x390.png). Screenshots were inspected; no clipping/overlap at the measured bottom state. Browser emulation does not replace physical iPhone/Telegram safe-area QA.

The test now preserves the three 24px inter-content gaps, checks documented nav height/retained padding, derived clearance (not a replacement magic 42px), minimum 24px readable clearance, bottom inset, five unobstructed ≥44px hit areas. Its nav alignment accommodates the documented landscape cap while preserving the content grid. [Exact diff](rel-prep02a/test-ui-cleanup-browser.mjs.diff).

The original nav assertion now passes. A subsequent unrelated Athlete Profile assertion fails at `row.gap`: **12 actual versus 8 expected**. `docs/ath-ui01-data-ath02-review.md:15,127` documents approved ATH-UI-01's centered 54px header, 12px gap and padding. This is another obsolete test expectation, not proof of a profile runtime defect. After confirming the approved ATH-UI-01 geometry in the existing report, this same-suite obsolete expectation was corrected narrowly to gap 12px and minimum height 54px (stronger than the previous 44px lower bound). The subsequent synthetic left-column stress assertion then failed. It injects unsupported text into a control whose approved ATH-UI-01 design explicitly replaced that column with a vertically centered, right-aligned year/chevron pair. Replaced that obsolete synthetic layout contract with exact vertical centering and right alignment (<1px) and no-overflow checks on every actual season header. Existing keyboard, pointer, collapse/expand, race navigation, other page geometry and rendering assertions remain. These are documented contract corrections, not replacement values chosen from current output alone. Both intermediate failures are retained.

## Verification and limits

- Fast release gate: **18/18 PASS**, including build and full lint; existing chunk warning remains.
- Biography/catalog/localization integrity: **12/12 PASS**; exact 57 texts, paragraphs and mappings protected.
- Three affected browser suites, first run: Brand PASS; image-delivery FAIL at subsequent image readiness; UI-cleanup FAIL at subsequent Profile gap. Preserve these failures even if another context differs.
- First revised full browser gate: **13/14 PASS**, only stale Profile gap failed. Final full browser gate: **14/14 PASS**, 372.7s, zero environment errors. Executed `node scripts/check-release.mjs --browser`, the exact implementation of `npm run check:release:browser`; no gate checks skipped. [Final full output](rel-prep02a/final-browser-gate.txt), [final UI](rel-prep02a/final-ui.txt), [final image](rel-prep02a/final-image.txt).
- Diagnostic harness initially had a syntax error before browser startup; corrected the temporary harness, no repository/test assertion changed to address it.
- Fast-gate build ran while the first affected browser sequence was running; no runtime source changed, but those first-run results are retained with that environment limitation. No failure is attributed to it without evidence. Full gate starts after the completed build; it verifies exact served `dist/index.html`.

All runs use local production build, existing Chrome and bounded scripts. No browser installation/dependency change. No live Preview/Production tests or Cloudflare operations.

Implementation validation note: an intermediate newly added assertion incorrectly interpreted “centered” as horizontal centering and failed. Inspection of `src/athlete-detail.css:169–170` (`align-items: center; justify-content: flex-end`) and the existing approved `test-athlete-results-polish-browser.mjs` establishes vertical centering with right alignment. The test correction now checks that exact contract. This intermediate test-authoring error is retained; it is not an application defect or reason to change runtime.

Final geometry evidence: the corrected UI-cleanup suite passed every original size (320×800, 390×844, 430×932, 768×1024, 1024×768, 1440×900, 844×390) inside the complete gate. Final assertions preserve real Profile keyboard/pointer, collapse/expand, results navigation and other-route layout checks. The final vertical-centering correction was made before this gate spawned the UI-cleanup child; earlier gate children use unchanged scripts. No runtime/build change occurred during this final gate. Its preceding standalone UI attempt used the superseded synthetic-column contract and remains FAIL in the harness summary; it must not be presented as a final-version PASS.


## Final outcome and publication readiness

The three original failures are resolved as obsolete test contracts/fixtures, with no confirmed runtime defect. Approved content, design, navigation, image quality, source data and deployment safeguards are unchanged. All final full-gate assertions pass, including the modified Brand, Image and UI scripts. The intermediate wrapper summary still exits nonzero because it deliberately retains a preceding failed standalone UI attempt on the superseded assertion; the final full-gate child itself exits 0. Do not rewrite that history or label every attempt PASS.

**Technically ready for owner review of Git publication preparation on the final local checks, with an explicit residual test-stability risk:** the first image-readiness timeout was not reproduced in diagnostic or either subsequent mandatory full gate, but its exact cause is not established. No claim that intermittent timing is definitively fixed. Owner should consider this evidence before authorizing REL-PREP-03; remote CI and published Preview visual QA still remain mandatory. No Production/release approval is implied.

Other unchanged risks: known chunk-size warning, TECH-01 full-regeneration prohibition, physical iPhone/Telegram safe-area QA, and remote protection/activation verification from REL-PREP-02. Version stays 0.0.0. No live infrastructure was accessed in this task.

Exact implementation files: `scripts/test-brand-browser.mjs`, `scripts/test-image-delivery-browser.mjs`, `scripts/test-ui-cleanup-browser.mjs`. Documentation: Project Board, this report, screenshots/measurements, exact before/after diffs and retained test output under `docs/audits/rel-prep02a/`. The prior REL-PREP-02 inventory is historical, not silently rewritten. [This task's file delta and hashes](rel-prep02a/changed-files.tsv) provides the updated review scope.

Recommended next task: owner-approved REL-PREP-03 local Git consolidation/publication preparation, preserving both histories and checking the final committed candidate through CI. No commit, staging, push, PR, merge or deployment was performed here.

Final fast-gate rerun after browser completion: **18/18 PASS** (28.3s), final integrity rerun **12/12 PASS**. [Fast gate](rel-prep02a/final-release.txt), [integrity output](rel-prep02a/final-integrity.txt). `git diff --check`, JS syntax and local report links PASS. All pre-task candidate files other than the three named tests and Project Board match their original hashes, including all runtime/content/CI files. Original worktrees' HEAD/status/index and 1282 + 1472 source hashes remain unchanged. Candidate HEAD remains `4a5f7e3`; index empty; all changes uncommitted.
