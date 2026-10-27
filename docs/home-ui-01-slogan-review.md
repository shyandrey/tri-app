# HOME-UI-01A — Home Slogan Review

Date: 2026-10-26. **Variant C Implemented / Awaiting Final Owner Review.** Owner authorized Variant C in HOME-UI-01B; implementation/QA closeout below supersedes the earlier proposal. Prototype evidence and Git push findings remain historical.

## Source and isolation

Baseline: `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`, branch `home-redesign-experiments`. Three isolated Git archives under `/tmp/300w-git01e-home01a/variants/`; no primary Home/More runtime edits. Unfinished Athlete Profile work is excluded from these copies and preserved in the primary tree. No dependency installation, deployment, version or data changes.

## Existing implementation

[App.tsx](../src/App.tsx) renders `ТРИАТЛОН — ЭТО МОЩНО!` as an h2 immediately after the wordmark/settings row, before Home showcase. The exclamation mark is part of the existing text. [home-refinements.css](../src/home-refinements.css) supplies the system font, 21px desktop heading, responsive mobile size, yellow emphasis on `МОЩНО!`, and 8–9px heading top margin. Header/content spacing is intrinsic; removing the h2 leaves no reserved slogan slot.

The slogan expresses brand personality, not race information or an action. It competes with showcase titles and repeats a prominent text layer above already branded artwork. Landscape makes this vertical cost more noticeable. The wordmark, lightning, artwork and navigation already identify the product without it.

## Variants

| Variant | Home | More | Isolated source changes |
| --- | --- | --- | --- |
| A — Current | Unchanged slogan and composition | Unchanged | None |
| B — Minimal | Remove only slogan h2 | Unchanged | `src/App.tsx` |
| C — Minimal + More | Same as B | Ordinary paragraph after About description, before release details | `src/App.tsx`, `src/pages/MorePage.tsx` |

C reuses the existing muted 13px paragraph style inside the existing About panel. No new card, CSS, accent or heading is introduced. All showcase, navigation, sports data and artwork files are byte-identical across the prototypes.

## Visual evidence and responsive results

Self-contained gallery: `/tmp/300w-git01e-home01a/gallery/comparison.html`.

Archive: `/tmp/300w-git01e-home01a/home-ui-01a-comparison.zip`.

The gallery contains 24 original viewport captures: Home and More for A/B/C at 390×844, 440×956, 844×390 and 956×440, with side-by-side comparisons and links to full-resolution PNGs. JSON measurements and exact B/C patches are included. These are local prototype screenshots, not Preview/Production captures.

Capture environment: Chrome 155.0.8059.85, DPR 1, dark preference, desktop browser viewport emulation. Reduced motion prevents Home autoplay during comparison; test-only date is fixed to 2026-10-26T12:00:00Z and random artwork selection is identical. This is not physical iPhone or Safari validation. Local News backend is not served by Vite preview; live News delivery is outside this comparison.

| Viewport | A showcase top | B/C showcase top | Height recovered |
| --- | ---: | ---: | ---: |
| 390×844 | 105.47px | 76px | 29.47px |
| 440×956 | 107.75px | 76px | 31.75px |
| 844×390 | 121.67px | 90px | 31.67px |
| 956×440 | 121.67px | 90px | 31.67px |

Automated comparison confirms identical showcase width/height and selected image paths, identical Home text after removing the slogan, five navigation destinations, expected slogan placement and no horizontal overflow. All captures retain the dark palette. B/C have the same Home composition. C adds one compact line to About; it does not become a competing title.

Representative portrait Home A/B and More C, plus landscape Home B and More C, were visually inspected. The reduced header does not leave an empty slot. Landscape still requires vertical scrolling, as in A; the floating navigation overlays the viewport while scrolling by design. No showcase container or image crop was changed. All pages were scrolled to the bottom; exhaustive physical safe-area and touch testing is deferred to a selected variant.

## Verification

- Production builds: A, B, C **PASS**. Existing sports chunk >500kB warning remains; no optimization attempted.
- Capture/DOM checks: **24/24 PASS**, four viewport sizes, both pages, all variants.
- Home → settings/More → Home: **12/12 PASS**.
- All five Bottom Navigation destinations in each variant: **15/15 PASS**.
- Capture runtime exceptions: **0**.
- Primary runtime/data/artwork and existing local artifacts: unchanged against the pre-task SHA-256 inventory; only this report and Project Board are task edits.
- `git diff --check`: **PASS**.
- Full release gate and comprehensive gesture suites were not rerun: no primary runtime change is proposed by this review task.

Temporary navigation diagnostic initially had a syntax error before execution; corrected locally, then all 15 checks passed. This did not affect application source.

## Recommendation and open decision

Recommend **C**, subject to owner approval. B and C improve the same functional hierarchy and recover approximately 30px; A preserves the strongest immediate slogan emphasis but offers no extra navigation or race information. C retains the brand phrase where users seek product context, with little visual or implementation cost. B is preferable if the owner wants to retire the phrase entirely. Neither is applied to the primary application.

Future implementation scope: B needs only `src/App.tsx`; C additionally needs `src/pages/MorePage.tsx`. Existing CSS is sufficient. Regression risks are limited to header geometry, About height and screenshot expectations; confirm real-device landscape, scrolling, Home carousel, Back and navigation after selection. No final owner approval is inferred from this recommendation.

## GIT-01E — push safety result

**BLOCKED before push.** Branch/HEAD match the authorized state; index empty; fresh `git ls-remote` returned `f99c7775b92143eb847d470dd93ff4c3580c5224`. The outgoing set remains exactly `f6021c7` and `8afd925` (eight unique approved DS-01/QA-04B paths). No Git write was performed.

Current GitHub read-only API returned HTTP 200 and zero workflows, repository hooks, environments, deployments and Actions runs. Python urllib initially failed before HTTP with `URLError`; its transport cause was not established. A Node request using the same existing authentication successfully verified GitHub, but Cloudflare `GET /client/v4/accounts` returned **HTTP 403** using the configured Wrangler OAuth token. No credential values were logged and no credentials changed.

The Cloudflare inventory failure prevented current verification of Workers Builds triggers for `tri-app` and `tri-app-preview`; HTTP 403 alone does not establish which permission is missing. Previous Dashboard observations were not treated as proof of current state. Therefore no push, deployment or alternate authentication was attempted. Owner action: provide current read-only access or current explicit verification of both Workers' build integrations before resuming the conditional push. Sanitized audit output is preserved in `/tmp/300w-git01e-home01a/remote-node-audit.json`.

The local gallery lives in temporary storage; copy the ZIP to a durable owner-controlled location if it must outlive cleanup. Existing evidence archives were not modified.

## HOME-UI-01B — Approved Variant C implementation

2026-10-26 · **Variant C Implemented / Awaiting Final Owner Review**.

Owner explicitly approved Variant C. Applied the exact archived `variant-c.patch`: removed the single Home h2 in `src/App.tsx`; added `<p>ТРИАТЛОН — ЭТО МОЩНО!</p>` immediately after the description in `src/pages/MorePage.tsx`. The two files match the reviewed prototype byte-for-byte. No CSS or additional spacing, replacement content, card, accent or heading was added.

QA uses the actual primary working-tree production build, including preserved unrelated local Profile work; it is not a deployment candidate. Screenshots: `/tmp/300w-home01b/gallery/images/`; measurements: `/tmp/300w-home01b/gallery/metrics.json`. Eight captures cover Home/More at 390×844, 440×956, 844×390 and 956×440. Same Chrome/DPR/dark preference and controlled date/artwork selection as the prototype. Automated comparison to approved C confirms exact header/showcase rectangles, content and font family. No horizontal overflow; no reserved slogan gap. Representative portrait Home and landscape More images were visually inspected. Carousel image geometry/cropping, wordmark and More hierarchy are preserved. Physical iPhone/Safari/Telegram QA is not claimed.

Executed checks:

- `npm run check:release`: first run **ENVIRONMENT ERROR**, 16 PASS and two audit environment errors (`listen EPERM 0.0.0.0:24678`). A preliminary commentary incorrectly summarized this run as 18/18; corrected after inspecting logs. No assertions were changed.
- Authorized local rerun `npm run check:release`: **18/18 PASS**, includes production build, full lint, Calendar/ranking/navigation units, athlete/results audits. Known data issues: 0. Evidence: `/tmp/300w-home01b/release-authorized.log`.
- `node scripts/test-more-browser.mjs`: **PASS**, responsive More, Home/athlete entry, Feedback/Back and browser history.
- `node scripts/test-navigation-browser.mjs`: **PASS**, existing navigation scenarios.
- `node scripts/test-global-nav-browser.mjs`: **PASS**, seven viewport sizes under both OS preferences, all five destinations, 50 mouse/touch destination pairs, safe areas, direct loading/refresh, nested Back/Forward, keyboard and reduced motion. No runtime exceptions.
- Temporary targeted CDP checks: **4/4 PASS** touch swipe to neighboring Home card, active-dot synchronization, decoded neighboring artwork, More scroll and Back; all four requested viewports. Evidence: `/tmp/300w-home01b/swipe.json`.
- Eight captures / four Home→More→Home checks: **PASS**. The approved C screenshots remain unchanged.
- `git diff --check` and local report links: **PASS**.

Existing sports chunk >500kB warning remains. Historical non-gating photo/regeneration checks were not run; full browser release gate was not run, only the relevant suites listed above. Local News backend is not served by Vite preview. Existing navigation instability remains a historical open concern despite this successful run.

Changed in this task only: `src/App.tsx`, `src/pages/MorePage.tsx`, `docs/home-ui-01-slogan-review.md`, `docs/PROJECT_BOARD.md`. SHA-256 comparison of all pre-existing tracked/untracked repository files confirms no other changes: race cards, sports data, results/ranking, artwork, unfinished Athlete Profile and prior artifacts preserved. Index remains empty; no commits, push, deployment, version or infrastructure changes. Existing `/tmp/300w-nav03` artifacts were backed up before that suite and restored afterward; fresh suite output is retained separately under `/tmp/300w-home01b/nav03-results`.
