# DS-01B — Dark Theme, Contrast & Typography Polish

Implementation: 2026-10-26 · **Owner Approved / Closed** · local only.

Final visual approval is recorded by the DS-01C owner instruction; no separate approval date supplied. DS-01A and Design System v1.0 are owner-approved; DS-01B.1 verification is complete.

## Scope and implementation

Based on the owner-approved [DS-01A audit](ds01-design-system-audit.md). The existing system font stack, dark palette, series accents, artwork and gesture/navigation implementation are preserved.

- `src/pages/OfficialRankingsPage.css`: remove two OS-light overrides (page palette and Done glass); use existing primary text for all rank numerals, keeping top-three weight 800; inherit font family on Season.
- `src/refinements.css`: inherit font family on shared `.page-back-button` only. No font-size, weight, line-height, letter-spacing, material or radius edits.
- `scripts/test-official-rankings-browser.mjs`: require dark table surface for both OS preferences, include top-three ranks in contrast assertions, check root dark color-scheme and Back/Season font inheritance.
- [Design System v1.0](design/300w-design-system-v1.0.md): reference of implemented tokens, semantic roles and separately marked future recommendations.
- [Project Board](PROJECT_BOARD.md): DS-01B owner approval and closure status.

Global `color-scheme: dark` was already correct and remains unchanged. No Telegram color-scheme-driven palette mutation was found in application source. Telegram native chrome and a physical iPhone were not independently tested. Unused starter SVG theme styles are not application surface styles and were not modified.

## Evidence and measurements

Evidence root: `/tmp/300w-ds01b/`. Existing historical screenshots are untouched.

- `before/`: 72 PNGs (56 page states and 16 open pickers), plus computed styles.
- `verified-after/`: same 72 captures, with cache disabled and fresh preview server; `computed.json` records colors, fonts and geometry.
- `after/`: superseded diagnostic capture showing the stale baseline rendering (the exact historical cache layer was not preserved); **not acceptance evidence**. The unexpected old red ranks were identified during visual review; the valid after set is exclusively `verified-after/`.
- Screenshot harness initially retried after creating the missing `verified-after` output directory. This was an artifact setup error, not an application failure.

Viewports: 390×844, 440×956, 844×390, 956×440. OS preferences: dark and light. Routes: Home, Calendar, Rankings (both series), athlete/1, Texas 2026 Race Detail, More; picker for both series. All 28 dark/light page pairs have identical measured computed styles and geometry after correction. These checks cover sampled elements, not every possible application state.

| Measurement | Before | After |
| --- | --- | --- |
| IRONMAN top-three / dark surface | #ED174B on #1b1f24, 3.81:1 | #f4f4f2 on #1b1f24, **15.04:1** |
| T100 top-three / OS-light table | #43D7D0 on white, 1.77:1 | Same dark palette, **15.04:1** |
| Back font family | Arial | system-ui, Segoe UI, Roboto, sans-serif |
| Season font family | Arial | system-ui, Segoe UI, Roboto, sans-serif |
| Done family | inherited system stack | unchanged |

All captured Back/Season controls match the computed body system font. Intentional gender-symbol Arial/Helvetica remains. First-three rank emphasis is retained through weight 800; no new decoration. Brand identity remains in artwork and active indicators. Natural button width can change with the font; no explicit sizing or table geometry change was introduced.

Representative comparisons (same controls; showcase scenes may differ because scene selection already varies):

- Before: `/tmp/300w-ds01b/before/light-390-rankings.png`; after: `/tmp/300w-ds01b/verified-after/light-390-rankings.png`.
- Before picker: `/tmp/300w-ds01b/before/light-440-rankings-picker.png`; after: `/tmp/300w-ds01b/verified-after/light-440-rankings-picker.png`.
- T100 landscape: `/tmp/300w-ds01b/verified-after/light-956-rankings-t100-picker.png`.

Representative portrait rankings and portrait/landscape picker images were visually inspected. Full screenshot set is supplied for owner review; not every capture is individually visually certified.

## DS-01B.1 — Evidence reconciliation / Verification Complete

The exported archive contained the superseded `after/` directory, while the gallery referenced `verified-after/`, which was absent from that archive. Hash comparison proved the archived T100 after screenshot was identical to its before image. This was a stale-evidence packaging discrepancy, not a confirmed runtime defect. The precise historical cache/server mechanism remains unproven.

Fresh verification built the actual working-tree source and checked 16 Rankings states (both series, dark/light preferences, four viewports, fixed 2026/Men), producing 32 screenshots. Computed backgrounds, ancestor surfaces, typography and served CSS hashes matched the new build; all eight preference pairs matched. Current dark-only runtime was correct; **no additional CSS fix was required**. Evidence and reconciled package: `/tmp/300w-ds01b1-dxpfumga/report.md` and `/tmp/300w-ds01b1-dxpfumga/ds01b1-verified-review.zip`. Historical evidence remains untouched.

## Historical DS-01B validation

- Production build, full lint and release gate: **18/18 PASS**, `/tmp/300w-ds01b/release.log`.
- Official standings registry unit tests: **20/20 PASS**, `/tmp/300w-ds01b/registry-tests.log`.
- Browser regression: **all six suites PASS** — official Rankings (14 viewport/theme cases, all 12 authoritative tables, wheel/keyboard/focus/history), global NAV (14 cases), interactive swipes (14 cases plus reduced-motion/orientation/image-request checks), Calendar (4 viewports), code splitting (4 viewports), navigation scenarios A–H. Logs and results: `/tmp/300w-ds01b/browser/`.
- Open-picker computed typography, dark native-control scheme and horizontal overflow: **8/8 PASS**, `/tmp/300w-ds01b/picker-typography.json`.
- `git diff --check`: PASS. Local documentation file targets: 114/114 resolve.
- Before/after comparison gallery: `/tmp/300w-ds01b/comparison.html` (72 pairs). Typography details: `/tmp/300w-ds01b/typography-comparison.json`.
- Historical photo tests remain separately documented non-gating failures; they were not rerun or repaired here. This is not a claim that the full unit suite passes.
- Known sports chunk-size warning remains; no loading architecture or bundle partition changes.

## Safety and remaining verification

Existing unfinished Athlete Profile CSS/TSX and all pre-existing untracked artifacts are preserved byte-for-byte relative to task start. No sports data, identity mappings, artwork, version, infrastructure or navigation logic changes. DS-01B and DS-01B.1 made no staging, commit, push or deployment. DS-01C separately authorizes one local commit of the six DS-01 files only.

Owner visual review is complete. Real-device Safari/Telegram rendering and glass backgrounds remain physical-device QA limitations. Screenshot artifacts are temporary local evidence, not durable archived release records. Broader token reconciliation and Light Theme remain separate future tasks.


## DS-01C — Local commit verification (not committed)

Owner approval above remains valid. Commit is pending because the required full swipe browser suite did not finish successfully.

Checks ran against an isolated HEAD plus exactly the six approved DS-01 paths, excluding unfinished Athlete Profile changes. Evidence: `/tmp/300w-ds01c/`.

- Production build, full lint and release gate: 18/18 PASS.
- Official standings registry unit tests: 20/20 PASS.
- Rankings/Season Picker browser suite: all 14 viewport/theme cases PASS, including exact authoritative table contents, dark-only, contrast and font assertions.
- Global navigation browser suite: PASS. Separate navigation/history suite: PASS.
- Interactive swipe suite: all 14 gesture viewport/theme cases PASS, then **FAIL** at `scripts/test-rankings-swipe-browser.mjs:49`: expected two showcase image requests, observed four. This is a network-count assertion, not a failed drag/snap assertion.
- One isolated diagnostic rerun of the final 956px/orientation/network scenario passed. It does not replace the failed full suite; the original cause remains unconfirmed. Runtime code and repository test assertions were not changed to make it pass.
- Documentation file links: 114/114 resolve. `git diff --check`: PASS. No staging or commit performed.

Next step: investigate request attribution/timing around viewport change and navigation with loader/request IDs during the full failed scenario. Do not assume this is a runtime regression or weaken the request-count assertion. A separate resolution is needed before resuming the all-checks-PASS commit gate. Historical DS-01B results above are unchanged.
