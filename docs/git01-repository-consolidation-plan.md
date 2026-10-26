# GIT-01 — Repository consolidation plan / GIT-01B revision

**GIT-01 audit: OWNER APPROVED. GIT-01B preparation: awaiting owner review; no consolidation executed.** Owner approval source is the GIT-01B instruction; no separate approval date was supplied. Audit/rehearsal conducted locally 2026-10-25.

## Current Git state and approval reconciliation

Branch `home-redesign-experiments`, HEAD `c8f52e02a75e0b413dddbfee77f477232c5301d3`; index empty. 17 modified tracked files and 118 untracked individual files at GIT-01B entry (135 total; original GIT-01 counted133 before adding its two audit reports). No local tags. Local upstream ahead/behind0/0. Last independent remote read was GIT-01 `ls-remote`, same SHA/no tags; not a new remote/deployment verification in GIT-01B.

Other local branches remain `alt-series-card-tags`728571c, `main`23c5e52, `results-table-prototype`a3141a5 (behind its tracking ref3). Last observed remote prototype0e6c6cf; `_ignore`, `home-redesign-experiments2`, `noop2`, `temp-ignore`, `tmp-noop`9be0bd0. No branch/tag/history/config mutation.

Explicit owner approvals now resolve NAV-03, RANK-01–07, QA-02B, TECH-01-HOOKS, PERF-01C including swipe synchronization, DS-02, GIT-01 and DS-01A. Exact source diffs were checked: Rankings route/type/loading wiring, NAV styling/capsule/z-index and shared safe-area hunks match their approved tasks; no rejected split/preload architecture is present. Passing tests is not the approval source. Athlete results polish remains excluded.

Historical GIT-01 classification: A86/B24/C1/D22. Current proposed scope: **106 included paths;29 excluded paths**. Included = approved task content/dependencies plus the specifically authorized showcase test maintenance and status documentation, still subject to final GIT-01B review. This is not permission to stage/commit. The superseded DS-02 draft is retained solely as linked historical documentation supporting the approved DS-02 foundation, never as current design policy. Rejected PERF reports are evidence; rejected runtime prototypes remain excluded outside Git.

## Exact file classification and staging allowlist

A = proposed included approved-task scope; B = unfinished/excluded; D = excluded archival/local artifact. Previous classification is preserved for audit trace. Full-file paths below form the only proposed allowlist; no glob/directory staging. No partial runtime hunks are proposed. New maintenance changes themselves await this review.

| Path | Git | Previous → current | Scope/evidence | Role/action and dependencies |
|---|---|---|---|---|
| `athlete-audit.txt` | `??` | D → D | local audit: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `docs/PROJECT_BOARD.md` | ` M` | B → A | shared board: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/300w-showcase-artwork-guidelines-v1.0.md` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-artwork-brief-template.md` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-codex-handoff-template.md` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/asset-delivery-template.json` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/geometry-measurements.json` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/home-landscape.png` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/home-landscape.svg` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/home-portrait.png` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/home-portrait.svg` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/index.html` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/rankings-landscape.png` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/rankings-landscape.svg` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/rankings-portrait.png` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/rankings-portrait.svg` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/responsive-crops.png` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/responsive-crops.svg` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/safe-area-stress.png` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/safe-area-stress.svg` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/design/showcase-templates/validation-checklist.md` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/ds01-design-system-audit.md` | `??` | new audit → A | GIT-01 / DS-01A approved audits: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/ds02-showcase-architecture-audit-2026-10-23.md` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/ds02-showcase-guidelines-draft.md` | `??` | C → A | DS-02 draft: Linked DS-02 historical foundation only; superseded, not current specification | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/ds02-showcase-technical-templates.md` | `??` | A → A | DS-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/git01-repository-consolidation-plan.md` | `??` | new audit → A | GIT-01 / DS-01A approved audits: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/ironman-standings-identity-review-2026-10-21.csv` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/ironman-standings-preparation-2026-10-21.md` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/nav02-prototype-2026-10-23.md` | `??` | A → A | NAV-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/nav03-integration-2026-10-23.md` | `??` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/official-rankings-ui-2026-10-22.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/perf01-sports-chunk-audit.md` | `??` | A → A | PERF-01C: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/perf01b-rankings-code-splitting-prototype.md` | `??` | A → A | PERF-01C: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/perf01b2-route-loading-experiment.md` | `??` | A → A | PERF-01C: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/product-readiness-audit.md` | `??` | D → D | local audit: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `docs/qa02-calendar-card-count-investigation.md` | `??` | B → A | QA-02B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/rank03-landscape-performance-2026-10-23.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/rank03e-showcase-polish-2026-10-23.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/rank03g-final-qa-2026-10-23.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/rank04-controls-picker-2026-10-23.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/rank05-interactive-swipe-2026-10-23.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/rank05b-portrait-optimization-2026-10-23.md` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/t100-registry-application-2026-10-21.md` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `docs/tech01-race-detail-hooks-warning.md` | `??` | B → A | TECH-01-HOOKS: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/ironman_01_swim.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/ironman_02_bike.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/ironman_03_run_finish.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/ironman_04_transition.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/manifest.csv` | `??` | B → D | asset evidence: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/optimized/ironman_01_swim.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/ironman_02_bike.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/ironman_03_run_finish.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/ironman_04_transition.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/manifest.json` | `??` | B → D | asset evidence: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/optimized/t100_01_swim.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/t100_02_bike.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/t100_03_run_city.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/optimized/t100_04_transition.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings/t100_01_swim.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/t100_02_bike.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/t100_03_run_city.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings/t100_04_transition.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/README.txt` | `??` | B → D | asset evidence: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/manifest.json` | `??` | B → D | asset evidence: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_cycling.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_running.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_swimming.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/ironman_transition.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_cycling.webp` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_cycling_final.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_running_city.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_swimming.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_transition.webp` | `??` | A → A | RANK-03/05B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_cycling.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_running.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_swimming.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_transition.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_cycling.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_cycling_1.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_running_city.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_swimming.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_transition.png` | `??` | D → D | RANK-03/05B: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `ranking.txt` | `??` | D → D | local audit: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `scripts/audit-rankings-showcase-browser.mjs` | `??` | A → A | RANK-01–07: GIT-01B authorized runtime-test maintenance; final review pending | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/fixtures/official-standings/ironman-approved-2026-10-21.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/fixtures/official-standings/t100-approved-2026-10-21.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/prepare-ironman-standings.mjs` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/prepare-t100-standings.mjs` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-athlete-results-polish-browser.mjs` | `??` | B → B | Athlete polish: Unfinished Athlete task | Exclude; preserve original location, no deletion/relocation |
| `scripts/test-bottom-nav-browser.mjs` | `??` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-code-splitting-browser.mjs` | ` M` | B → A | QA-02B: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-global-nav-browser.mjs` | `??` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-ironman-standings.mjs` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-navigation.mjs` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-official-rankings-browser.mjs` | `??` | B → A | RANK-01 + PERF-01C: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-rankings-controls-browser.mjs` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-rankings-polish-browser.mjs` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-rankings-showcase-browser.mjs` | `??` | B → A | RANK-03 historical QA: GIT-01B authorized runtime-test maintenance; final review pending | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-rankings-swipe-browser.mjs` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-t100-standings.mjs` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `scripts/test-ui-cleanup-browser.mjs` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `sof.json` | `??` | D → D | local audit: Non-runtime evidence/original/local artifact; preserve unchanged | Exclude; preserve original location, no deletion/relocation |
| `src/App.css` | ` M` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/App.tsx` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/athlete-detail.css` | ` M` | B → B | Athlete polish: Unfinished Athlete task | Exclude local delta; retain HEAD version in rehearsal |
| `src/bottom-nav-glass.css` | ` M` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/components/BottomNav.css` | `??` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/components/BottomNav.tsx` | ` M` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/components/NavActiveCapsule.tsx` | `??` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/components/RankingsSwipeTrack.tsx` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/components/StandingsSeasonPicker.tsx` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/index.ts` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/ironman/2024-men.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/ironman/2024-women.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/ironman/2025-men.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/ironman/2025-women.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/ironman/2026-men.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/ironman/2026-women.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/t100/2024-men.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/t100/2024-women.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/t100/2025-men.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/t100/2025-women.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/t100/2026-men.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/data/officialStandings/t100/2026-women.json` | `??` | A → A | RANK-01 registry: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/home-refinements.css` | ` M` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/navigation/history.ts` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/pages/AthleteDetailPage.tsx` | ` M` | B → B | Athlete polish: Unfinished Athlete task | Exclude local delta; retain HEAD version in rehearsal |
| `src/pages/OfficialRankingsPage.css` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/pages/OfficialRankingsPage.tsx` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/pages/RaceDetailPage.tsx` | ` M` | B → A | TECH-01-HOOKS: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/pages/rankingsShowcase.ts` | `??` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/sports/SportsArea.tsx` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/sports/SportsRoute.tsx` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/theme-refinements.css` | ` M` | B → A | NAV-03 / RANK-02: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |
| `src/types/Page.ts` | ` M` | A → A | RANK-01–07: GIT-01B explicit task approval; exact task diff reviewed | Include full file in thematic group below; shared runtime in atomic group2 |

## Asset manifest and archival assessment

All manifests checked read-only in primary tree. The initial archival-check invocation in the reduced copy correctly failed because excluded manifests were absent; it was rerun against primary evidence, not added back to make runtime tests pass.

| Manifest | Actual contents / verification | Commit decision |
|---|---|---|
| `public/images/showcase/rankings/manifest.csv` |8 original PNG names/dimensions/SHA256; all8 hashes match. Historical review wording retained. |Archive with originals; exclude reduced Git/deployment scope.|
| `public/images/showcase/rankings/optimized/manifest.json` |8 active WebP hashes/sizes plus8 original PNG hashes/sizes and encoding provenance. All16 hash/size checks pass. Mixed runtime/source record. |Preserve in archive with paired originals. Runtime test pins only active bytes/dimensions; no runtime manifest dependency.|
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/manifest.json` |8 original/old-WebP size pairs match; final Cycling replacement hash/size matches2078×378/211262bytes. Other entries have dimensions/sizes but no hashes. `source` values are historical delivery names, not current relative file paths. |Archive unchanged, exclude reduced scope; old optimized Cycling is not active.|
| `public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/README.txt` |Original package/delivery context. |Archive with package, not runtime dependency.|

The16 runtime assets are exactly eight portrait WebP plus eight landscape WebP including `t100_cycling_final.webp`. Byte-preservation pins and dimensions now live in the runtime test, with mapping order asserted against the actual imported mapping. No art/mapping/manifest changed. Original equivalence checks belong in a future independent archival test with explicit archive-root input; they should validate original hashes, old/new versions and encoding comparisons without requiring archive delivery by the application.

**Durable archival proposal, not executed:** owner should select a dedicated directory under the existing project archive root previously used for PTO/T100 evidence, then approve the exact new destination. Do not assume that root authorizes a new Rankings directory. Copy originals, previous Cycling WebP and unchanged manifests/README; create a manifest of original relative paths, hashes, sizes and timestamp, verify every byte, then obtain backup acceptance. Keep current originals in place until separately authorized. No invented archive path, relocation, deletion or off-device upload. `/tmp` rehearsal is disposable, not a durable archive. Existing PTO HTML archive untouched.

Vite copies all public files regardless of runtime use; primary-tree deployment remains unsafe for unused originals. The reduced rehearsal proves an allowlisted output can omit them, without introducing a new deployment pipeline or changing Vite.

## Rehearsal construction and isolation

Location: `/tmp/300w-git01b/rehearsal/`.

Reproducible construction: `git archive HEAD` into a new directory, then overlay exactly the106 paths in the inventory. Excluded tracked Athlete files remain at HEAD; untracked polish test absent. All16 WebP retained (4,386,018 bytes total); no originals, package manifests, caches, screenshots, `.wrangler`, credential files or experimental copies overlaid. Existing dependencies reused by a `node_modules` symlink; no install. Baseline tracked source/config and example env files remain, actual secrets are not copied.

There is no `.git` directory or new commit. For release-runner read-only Git checks use `GIT_DIR=/Users/andrey.shubin/Projects/tri-app/.git` and `GIT_WORK_TREE=/tmp/300w-git01b/rehearsal`; index remains primary and is never written. Dependency cache is shared; built output/generated metadata are isolated. This is not a claim of a clean dependency install or hermetic CI.

Construction recipe and exact machine-readable lists: `/tmp/300w-git01b/rehearse.py`, `allowlist.txt`, `excluded.txt`. Recipe uses a new destination and refuses to overwrite an existing copy. Refresh only modified allowed documentation/test paths after review; compare overlay hashes at closeout. The runnable state includes current RANK/NAV, not HEAD alone; application data and original assets match approved local bytes.

## Runtime test correction

`scripts/test-rankings-showcase-browser.mjs` now imports the existing TypeScript mapping using the installed Node24 type-stripping support. It validates16 unique ordered paths, pinned SHA256/size, WebP signature, successful actual decode, expected dimensions and currentSrc. Cold-cache resource entries must contain exactly two active-orientation image requests; no inactive variant/duplicate preload. Both decoded panels cover the viewport during pointer movement with no geometric gap, then snap and series state are checked. Geometry, compact Back, safe-area simulation, NAV z-index/capsule, no fade/filter/mask and no horizontal overflow remain asserted. All eight scenes are checked at320/375/390/440/667/844/956/1440 in dark/light OS preference; current light behavior is documented, not approved for release policy.

Early harness runs: a45% drag did not establish forward snap; subsequent60% drag matched existing swipe regression distance. Immediate successive indicator switching raced the track's120ms settle callback; the final helper requires target state/alignment to remain stable200ms within a bounded timeout. It does not alter runtime gestures or hide a failing assertion. Final actual results below supersede these harness-development attempts; physical-device frame-perfect behavior is not certified by DOM geometry samples.

## Proposed thematic sequence

1. **Official registry foundation:** all13 `src/data/officialStandings/` paths listed (index +12datasets), two pinned fixture JSON, both prepare scripts and registry tests, IRONMAN report/identity CSV and T100 application report. Offline replay; no UI integration yet. All dataset values/mappings unchanged.
2. **Atomic Rankings + NAV-03:** all included runtime UI/navigation source paths except `RaceDetailPage.tsx` (registry paths already belong to group1), all16 WebP, navigation unit/UI tests and all new Rankings/NAV browser tests plus RANK/NAV reports. Includes App route, Page type, history, SportsArea/Route, BottomNav/CSS/capsule, shared CSS removals/safe areas, Rankings swipe/picker/page/mapping. No artificial NAV-only intermediate where fourth tab has no page. Complete updated showcase test and PERF state-wait test belong here; no duplicate later staging. Dependencies group1 mandatory.
3. **QA-02B + TECH-01-HOOKS:** `scripts/test-code-splitting-browser.mjs`, `src/pages/RaceDetailPage.tsx`, their two reports. Can precede group2 only with tests of that actual intermediate state. Same filtering and data preserved.
4. **DS-02:** every included `docs/design/` file and the three `docs/ds02-*` reports, including linked obsolete draft as explicit historical evidence. Templates are documentation assets, not active showcase content. Preserve recommended, non-universal numerical starting points.
5. **PERF decision records:** the three `docs/perf01*` reports; no prototype implementation. Test synchronization already in group2.
6. **Shared Board + audits:** `docs/PROJECT_BOARD.md`, this plan, `docs/ds01-design-system-audit.md`. Include whole reconciled board after all linked docs exist; retain pending Athlete/Home/DS-01B items. Review final list and hunks before separate commit authorization.

Group2 must include all hunks of shared `src/theme-refinements.css` (Back safe areas + old nav removal), `App.css`, `home-refinements.css`, `bottom-nav-glass.css`, `test-ui-cleanup-browser.mjs`. Whole-file approach avoids invalid partial styling/routing. Do not stage any excluded Athlete hunk. Current combined rehearsal passes do not prove every future intermediate commit; each boundary must be validated before committing.

## Verification results

Commands run from the isolated checkout, with `TRI_APP_URL=http://127.0.0.1:5425`, dedicated `TRI_CDP_URL=http://127.0.0.1:9269` and a fresh tab per suite. Other existing browser suites were copied to `/tmp/300w-git01b/browser/` with output paths relocated only, preserving old review artifacts; assertions unchanged. The updated showcase script ran directly from the isolated checkout.

- `node --test scripts/test-ironman-standings.mjs scripts/test-t100-standings.mjs scripts/test-calendar.mjs scripts/test-navigation.mjs scripts/test-race-result-import.mjs`: **50/50 PASS** (20 official registry +30 Calendar/navigation/result-import tests).
- `npm run check:release`: **18/18 PASS**, includes actual `npm run build`, full lint, data/ranking/results audits and other local mocked checks. Known data issues0. Fresh build: sports JS1,295.13kB minified /266.28kB gzip; entry277.38kB /84.11kB gzip; sports CSS20.65kB /4.63kB gzip; entry CSS58.92kB /11.64kB gzip. Existing >500kB chunk warning persists. Slight reduction versus the full dirty tree reflects excluded Profile polish, not a new performance architecture.
- `npm run lint` after final test edits: PASS; targeted showcase ESLint and `node --check` PASS.
- `node scripts/test-rankings-showcase-browser.mjs`: **PASS**,16 active file pins,128 scene/viewport/theme combinations, adjacent image/pointer/crop/resource assertions. 128 PNG screenshots under `/tmp/300w-git01b/showcase/`; representative final Cycling956×440 screenshot inspected. No archival-original dependency.
- `scripts/test-official-rankings-browser.mjs`: **PASS**,14 viewport/theme cases,12 exact tables per case plus Home/Bottom Navigation.
- `scripts/test-global-nav-browser.mjs`: **PASS**,14 viewport/theme cases,50 mouse/touch destination pairs, direct loading, refresh, nested history, keyboard/reduced motion and Race Results clearance.
- `scripts/test-rankings-swipe-browser.mjs`: **PASS**,14 viewport/theme cases; pointer/touch tracking, snap/return, vertical arbitration, links/season, reduced motion, orientation and no duplicate current-scene requests.
- `scripts/test-calendar-browser.mjs`: **PASS**,4 viewports, search/filters/archive/empty states/order/Back and overflow.
- `scripts/test-code-splitting-browser.mjs`: **PASS**,4 viewports, deterministic exact Edition IDs, delayed loading, leave while loading, history/refresh/deep links/unknown IDs and failure/retry; no skipped scenarios.
- `scripts/test-navigation-browser.mjs`: **PASS**,A–H, Home/Calendar→Race, nested Athlete links, sorting/scroll, direct race/refresh, browser Back/Forward and obsolete route fallback.
- All6 downstream browser-suite process exit codes0; updated showcase suite separately exit0. No remaining functional rehearsal failure.

Evidence: `/tmp/300w-git01b/{release.log,units.log,lint-final.log,showcase-settled.log,browser/results.json}`. Early harness attempts retained in `showcase.log` and `showcase-final.log` for transparency. Full release gate is the fast local gate, not physical-device QA or all historical/non-gating suites. No live infrastructure tests or deploy.

Initial full rehearsal documentation file-target scan:411/411 PASS. `git diff --check` PASS in primary and isolated context. Additional `git diff --no-index --check /dev/null <file>` on84 included text files: no whitespace diagnostics (exit1 alone means different file contents in no-index mode). Final overlay hashes and protected-state check recorded at closeout.

## Exact excluded paths

These are excluded from overlay/commit proposal, not deleted. No ignored-directory or `/tmp` content is a staging candidate.

```text
athlete-audit.txt
docs/product-readiness-audit.md
public/images/showcase/rankings/ironman_01_swim.png
public/images/showcase/rankings/ironman_02_bike.png
public/images/showcase/rankings/ironman_03_run_finish.png
public/images/showcase/rankings/ironman_04_transition.png
public/images/showcase/rankings/manifest.csv
public/images/showcase/rankings/optimized/manifest.json
public/images/showcase/rankings/t100_01_swim.png
public/images/showcase/rankings/t100_02_bike.png
public/images/showcase/rankings/t100_03_run_city.png
public/images/showcase/rankings/t100_04_transition.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/README.txt
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/manifest.json
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/optimized/t100_cycling.webp
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_cycling.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_running.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_swimming.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/ironman_transition.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_cycling.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_cycling_1.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_running_city.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_swimming.png
public/images/showcase/rankings_landscape/300w_rank03_landscape_assets/originals/t100_transition.png
ranking.txt
scripts/test-athlete-results-polish-browser.mjs
sof.json
src/athlete-detail.css
src/pages/AthleteDetailPage.tsx
```

Ignored exclusions remain `.wrangler/`, `.generated/`, `dist/`, dependency/cache directories, photo staging, `.DS_Store`, actual environment/credential files. Shared dependency symlink is rehearsal tooling only. The four protected artifacts stay untouched. Rejected PERF variants remain outside Git; do not import any files from their copies.

## Owner decisions / release limitations

- Final GIT-01B test/documentation review and separate commit authorization are still required. No staging performed.
- Dark-only release policy is approved but not implemented here; DS-01B remains planned. Existing OS-light behavior still appears in QA captures. Contrast, system-font alignment and legacy accents are separate UI decisions; HOME-UI-01 stays separate.
- Owner must choose archival destination/backup procedure before any later removal or relocation of originals. The archive is not needed for runtime/reduced QA but is needed for independent provenance recovery.
- No live infrastructure/authentication/deployment checks; no production readiness claim from local rehearsal alone.

## GIT-01B closeout and changed files

Rehearsal is **PASS / READY FOR OWNER REVIEW**, not commit authorization. No required pending runtime dependency was included. All106 overlay paths match primary current approved-task content; unfinished tracked Profile files in the rehearsal match HEAD instead. Primary runtime/data/artwork/excluded files remain unchanged by SHA-256 comparison. Index empty; HEAD/branch unchanged. Shared dependencies/cache were reused, not installed.

Changed by this task only:

- `scripts/test-rankings-showcase-browser.mjs`
- `docs/git01-repository-consolidation-plan.md`
- `docs/PROJECT_BOARD.md`
- `docs/nav03-integration-2026-10-23.md`
- `docs/qa02-calendar-card-count-investigation.md`
- `docs/tech01-race-detail-hooks-warning.md`
- `docs/perf01-sports-chunk-audit.md`
- `docs/ds01-design-system-audit.md`

Remaining decisions: final review of this preparation and separate authorization before staging/commits; approved archival destination/backup before future relocation; DS-01B dark-only/contrast/font work and HOME-UI-01 remain separate pre-release tasks. No primary artwork, application code, datasets or configuration changed. No deployment, D1, secrets, Telegram, version or Git index changes.

### Final verification checkpoint

Final `npm run check:release` after all browser suites: **18/18 PASS**,22.4s, known data issues0, no failures/environment errors; log `/tmp/300w-git01b/release-final.log`. Rehearsal documentation targets **411/411 PASS**. Primary full-doc scan found10 missing historical `/tmp` evidence links, all in excluded/protected `docs/product-readiness-audit.md`; that artifact is unchanged. Do not report the entire primary historical evidence archive as link-clean. No missing links in the consolidation rehearsal.

All106 selected files byte-match primary; only the8 permitted task files differ from pre-task hashes. Existing excluded files, application code, artwork and datasets are preserved. Final `git diff --check` PASS; index empty. Git still has accumulated uncommitted work; no commits or tags created. Final evidence manifest: `/tmp/300w-git01b/final-integrity.json`.

## GIT-01C.2 — Deterministic season assertion · 2026-10-26

Owner authorized a local test-only correction after GIT-01C.1 could not reproduce the original failure. The original cause remains unconfirmed; no user-facing Season Picker defect or runtime correction is claimed.

Only `scripts/test-official-rankings-browser.mjs` changes executable code. The failing year-click path no longer relies on100+260ms sleeps. A bounded5s wait checks the requested series, captured current gender, year control, visible table season, open picker, selected/active wheel option and its center alignment, and all10 exact approved rows (official rank/name/points, athleteId, profile link and normalized country). All conditions must hold for100ms across50ms polls. Existing exact-row assertions after gender switching remain intact. There is no retry of the user action or alternative expected data.

Timeout emits requested/actual selection, URL, picker/scroll state, actual rows, last mismatch, console/runtime errors and CDP diagnostics; JSON and screenshot go to the test artifact directory. CDP requests have5s deadlines and socket close/error rejects pending calls, so transport loss cannot leave the season wait pending indefinitely. Diagnostic capture has its own bounded CDP call; total failure reporting can exceed the5s state-poll budget. Existing independent keyboard/touch tests and their assertions remain unchanged.

Negative validation invokes the actual helper: exact fixture rows PASS; an intentionally corrupted observed athleteId or wrong observed table season FAIL even with year label2024. These are synthetic observation faults, not changes to expected standings or registry. Timeout JSON includes all requested diagnostic fields. Evidence under `/tmp/300w-git01c2/` includes negative validation logs and timeout examples.

Final Rankings test:14/14 viewport/theme cases PASS; all12 tables per case, controls/keyboard/touch/history/links/navigation and zero runtime exceptions. CPU8x targeted season regression:24/24 PASS across both series, genders, themes and all three years. Relevant registry/Calendar/navigation/result unit tests:50/50 PASS. Final release and Calendar/code-splitting results are recorded below after completion.

Implementation trials are retained, not concealed: an exploratory extension of the new helper into the keyboard regression assumed stable gender and reported requestedW / actualM after Home. That extra assertion was not in the original test and is outside the specific failed year-click path; the final patch preserves original keyboard checks instead of changing runtime behavior. Its cause was not diagnosed here and no physical-device conclusion is drawn. Negative-helper development also needed same-realm VM objects before strict-equality validation. An initial gate launch in the primary directory was interrupted; authoritative validation uses the isolated106-path approved rehearsal, excluding unfinished Athlete Profile work.

Git protection: HEAD remains `150a0f633637e7f73579700b72e5332cd5a5e697`, branch `home-redesign-experiments`. Existing52 staged paths and binary staged-diff SHA256 `9d4f2c4071afb5ad2682738e5c26ec69cdaee3dad3de09b48b8b0c1640768bdb` must remain unchanged. New test changes are **working-tree only**; this report is also unstaged. No staging/unstaging, commit, push, deployment, version, application/data/artwork or infrastructure changes. GIT-01C is not completed by this task. Owner review must precede authorization to include the new test bytes and resume consolidation.

GIT-01C.2 final validation: Calendar browser4 viewports PASS; code-splitting browser4 viewports PASS including delayed/failed import retry, unknown IDs, history and reload scenarios. Final `npm run check:release`:18/18 PASS,21.8s, includes production build and full lint; no environment failures. Existing sports chunk warning remains; no performance architecture changes. Working and cached `git diff --check` PASS. Final source-hash comparison shows changes only to this report and the authorized test; all other nonignored files preserved. Index checksum and52 paths unchanged. Full browser/negative/CPU/unit logs under `/tmp/300w-git01c2/`; release step logs under the directory identified in `release-final.log`.

Recommendation: test patch is ready for owner review and explicit inclusion in resumed GIT-01C staging. Do not treat the old GIT-01B test hash as current approval of these new bytes; keep the amended scope explicit. No automatic resume or commit in GIT-01C.2.


## GIT-01C.3 — Authorized local consolidation · 2026-10-26

Owner authorized continuation from HEAD150a0f633637e7f73579700b72e5332cd5a5e697,52 staged paths and staged-diff SHA2569d4f2c4071afb5ad2682738e5c26ec69cdaee3dad3de09b48b8b0c1640768bdb. Preconditions matched; all29 exclusions unchanged. The only executable amendment versus GIT-01B is the explicitly approved GIT-01C.2 browser-test correction. Prior stop/approval-pending entries above are historical evidence, not the current Git state.

The six approved groups remain disjoint and cover106 paths:22/52/4/22/3/3. Commit1 `150a0f6`; Commit2 `72b2906`; Commit3 `3bedfc3`; Commit4 `344b28e`; Commit5 `5c9e1e1`; final project-documentation commit contains this closeout and Board update. Exact path membership remains the106-path inventory and thematic sequence above; full Git-generated per-commit lists and final results are preserved under `/tmp/300w-git01c3/`.

Every boundary uses explicit paths, cached whitespace checks, staged credential-pattern screening, exact staged-byte exports and exclusion checks. Commit2: production build,30 registry/navigation unit tests, Rankings14-case suite and NAV-03 browser suite PASS;16 active WebP SHA256s match approved evidence. Commit3: production build/full lint/release gate18/18,30 targeted unit tests, Calendar/code-splitting4 viewports each and navigation browser PASS. Commit4:22 approved document/template hashes and JSON/SVG/PNG validation,54 local links PASS. Commit5:3 reports only,18 local links PASS. Rejected performance implementation is absent; its reports remain historical evidence.

Local consolidation is complete when this final documentation commit is created. Full post-commit unit/browser/build/release/lint/link verification is reported separately from boundary checks; historical non-gating test failures must not be presented as passes. No permission for push or deployment is inferred. Preserve29 local exclusions, all evidence archives and version0.0.0. Final physical-device performance QA, the original intermittent season failure's unconfirmed cause, and existing pending product tasks remain limitations.
