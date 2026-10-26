# DS-01A — Design System & Typography Audit

**Current approval — GIT-01B instruction (no separate approval date supplied):** DS-01A audit is OWNER APPROVED by the GIT-01B owner instruction. Release 1.0.0 policy is dark-only; Rankings must not follow OS light preference. Implementation is deferred to DS-01B; Light Theme is post-release. Earlier findings and open questions below describe the audited state, not the current policy decision.

2026-10-25 · **AUDIT COMPLETE / AWAITING OWNER REVIEW** · local documentation only. No UI, artwork, data, dependencies or build configuration changed. Recommendations are proposals, not implementation approval. DS-02 remains owner-approved; Home multi-variant migration and PERF-02 remain separate future work.

## Scope and evidence

Inspected current dirty source tree, CSS import order, components and existing approved [showcase guidelines](design/300w-showcase-artwork-guidelines-v1.0.md). Observed the existing local production build on port 5424 from TECH-01 verification, without rebuilding. Browser: dedicated Chromium, 390×844 portrait and 844×390 landscape, OS color preference dark/light. Captured 24 page states (Home, Rankings, Calendar, More, athlete/1, Texas Race Detail) plus four picker states. This is representative evidence, not new physical-device, Safari, contrast-compliance or full functional certification.

Evidence directory: `/tmp/300w-git01-ds01/`; `computed.json` records actual font/color values and routes. Original evidence is untouched. Temporary screenshots need durable archival if later used as a release record.

| Comparison | Portrait evidence | Landscape evidence |
| --- | --- | --- |
| Rankings dark | `/tmp/300w-git01-ds01/dark-390-rankings.png` | `/tmp/300w-git01-ds01/dark-844-rankings.png` |
| Rankings light | `/tmp/300w-git01-ds01/light-390-rankings.png` | `/tmp/300w-git01-ds01/light-844-rankings.png` |
| Picker dark/light | `dark-390-rankings-picker.png`, `light-390-rankings-picker.png` in evidence directory | `dark-844-rankings-picker.png`, `light-844-rankings-picker.png` |
| Equivalent Back/nav controls | `{dark,light}-390-{calendar,more,athlete-1,race-ironman-texas-2026}.png` | Same filenames with `844` |
| Home reference | `dark-390-home.png`, `light-390-home.png` | `dark-844-home.png`, `light-844-home.png` |

Visually inspected representative Rankings dark/light portrait, light landscape picker and dark landscape Home images. Remaining captures support comparison but were not all individually visually reviewed. Screenshot capture does not prove every UI state is correct. No redesign inferred from differences.

## Existing color palette and cascade

| Role | Current value / exact source |
| --- | --- |
| Global background/surface/raised | `#0f1115`, `#1b1f24`, `#20252b`; [theme-refinements.css](../src/theme-refinements.css), `:root`, lines 7–9 |
| Borders | `#2d3239`, `#3a414a`; same file lines 10–11 |
| Text / muted / soft-muted | `#f4f4f2`, `#aeb2b7`, `#7f858d`; lines 13–17 |
| Yellow navigation/action accent | `--tri-accent:#f3b72b`; soft `rgba(243,183,43,.12)`, lines 18–19 |
| Official series brands | `--series-ironman-accent:#ED174B`, `--series-t100-accent:#43D7D0`; [OfficialRankingsPage.css](../src/pages/OfficialRankingsPage.css), line 2 |
| Rankings dark aliases | `--rank-bg/#0f1115`, card `#1b1f24`, text `#f4f4f2`, muted `#aeb2b7`, border `#303740`; same file line 1 |
| Rankings light aliases | Background `#f5f6f8`, card `#fff`, text `#20232a`, muted `#606773`, border `#e2e5eb`; `@media(prefers-color-scheme:light)` |
| Legacy card series colors | [refinements.css](../src/refinements.css) lines 239–247: IRONMAN `#ff3b3f`, T100 `#48a7ff`, Roth `#ff4b55`; [series-colors.css](../src/series-colors.css) line 2 overrides T100 to `#22d3e6` |
| Nav inactive | `#b8bdc5`, distinct from global muted; [BottomNav.css](../src/components/BottomNav.css), `.bottom-nav button` |
| Results legacy grays | `#999`, `#858585`, `#d7d7d7`, `#777`, `#b8b8b8`; [RaceResultsTable.css](../src/components/RaceResultsTable.css) lines 8,15,19,28,31,34,93 |

`src/main.tsx` loads index.css; App imports base App.css then refinements, series colors, Home/history/calendar/theme/athletes refinements and Back glass. Sports pages introduce component styles later. Inspect effective computed declarations before treating every hardcoded base rule as a visible defect. Old nav declarations have already been removed in the pending NAV-03 diff; do not reintroduce them.

Glass is a family, not one interchangeable surface: BottomNav uses 30px blur / 165% saturation and dark 72% surface; Back uses 24px / 160%, 52% dark layer and `!important` overrides; picker Done uses 12px / 160%, with a distinct light-theme gradient. All use white translucent borders/inset highlights. Nav has a non-blur fallback; Back has one too. These can share semantic tokens while retaining intentionally different opacity/blur and radii. Background gradients on artwork and Home improve contrast and identity; not obsolete by default.

## Typography inventory

No `@font-face` definitions or local WOFF/TTF/OTF assets found in current source/public search. System fonts are loaded by the browser/OS, no new external font dependency needed. [index.css](../src/index.css) lines 2–4 declares system-ui/Segoe UI/Roboto sans, same heading family, and ui-monospace/Consolas. Base is 18px/145%, switching to 16px at ≤1024px. CSS requests weights 400–900 including 650/750; available actual weights depend on the installed system font and browser matching, not a bundled font guarantee.

| Role | Current treatment | Assessment |
| --- | --- | --- |
| Generic h1/h2 | index.css: h1 56→36px, weight500; h2 24→20px, 118% | Base defaults, mostly overridden by page styles; h1 inherits base line-height unless overridden, review before reuse for multiline headings |
| Home brand / showcase | Home title and artwork overlay have their own scale; observed brand 20px/20px weight800 | Intentional compact brand/hero hierarchy, not generic page heading |
| Athlete name | athlete-detail.css line44: clamp(26px,5vw,36px); narrow breakpoint clamp(22px,6vw,27px); metadata13px, facts14px | Appropriate distinct profile hierarchy; unfinished results polish excluded from implementation recommendations |
| More | MorePage.css: page28px; section14/600; panel15/600/1.4; body13/1.55; version12 | Purposeful information density |
| Calendar | CalendarPage.css: empty heading20; description14/1.5; search16px from App.css | Preserve readable form text and empty-state hierarchy |
| Rankings | name13/650/1.3, 12px at≤350,15px at≥768; points14/750; header11/500; gender18/700→16px narrow | Dense table intentional; numeric tabular-nums already present for ranks/points |
| Race Results | name12px, secondary10px; header10–11 uppercase; toolbar22px | Denser than Rankings; evaluate legibility rather than enforce equal sizes |
| Back / forms / buttons | Back15px→14px, weight650 effective; observed Arial. Season button16/700 Arial; page text system-ui | Missing font inheritance on native controls creates actual family mismatch |
| Picker | h2 20px system-ui; Done15/650 inherit; wheel24px, selected750,48px line box | Native-wheel-like intent preserved; landscape viewport144px versus240px portrait |
| Navigation | icon-only buttons24px Arial; SVG artwork determines icon shape | No visible navigation label typography; aria labels remain required |
| Gender pictograms | refinements.css `.race-card__gender-symbol`: Arial/Helvetica,900,1.25em,line-height1,0.35px stroke | Intentional symbol family reused by Rankings; don't replace as accidental Arial |

No proposal to convert all data text to monospace. Retain tabular numerals where useful; race names and prose should remain proportional.

## Component inventory and reuse

| Component | Existing pattern | Recommendation boundary |
| --- | --- | --- |
| Home showcase | independent carousel, overlays, responsive images | Retain approved DS-02 composition; future multi-variant migration separate |
| Race cards | series tags, gender symbols, shared arrow and metadata | Preserve symbols; reconcile legacy brand tokens only with owner-approved scope |
| Rankings controls/table | grid-centered gender controls, circular series indicators, gender pictograms; table links/photos | Preserve two distinct gestures, approved artwork and official data |
| Season picker | native dialog top layer, scroll snap, neutral selection band | Reuse semantic picker roles, don't redesign or alter gesture logic |
| Bottom Navigation | fixed glass, shared capsule, five44px targets, z-index40; landscape48px container | Preserve RANK-02 stacking, safe areas and NAV-03 motion/reduced-motion behavior |
| Back | common class, top-right safe areas, glass | Share typography/material tokens with compact Done only where equivalent |
| Athlete Profile | hero/name/socials, expandable years, results, feedback | Pending local polish remains B in Git plan; no automatic inclusion |
| Race Detail | year controls, series metadata, results, Back/feedback | Dense sports information intentionally differs from showcase/table pages |
| Calendar | composable filters/search, year archives, empty states | Preserve behavior; same form/focus tokens where proven safe |
| More | semantic panels, actions and release disclosure | Useful reference for body/caption hierarchy and action typography |

## Findings, priority and release impact

1. **P0 accessibility finding requiring resolution or explicit release decision:** small official rank text uses exact brand accents. Static contrast calculations on solid table surfaces: IRONMAN #ED174B on white **4.35:1**, on #1b1f24 **3.81:1**; T100 #43D7D0 on white **1.77:1**, dark **9.36:1**. These fall below a 4.5:1 normal-text review threshold for the noted combinations. Exact rules: `.official-standings tr:nth-child(-n+3) td:first-child` and `.official-standings td:first-child` in OfficialRankingsPage.css (13px rank). Calculated from source colors, not a full-page accessibility certification. Preserve brand tokens; ask owner about neutral readable rank numerals plus brand decoration, rather than silently recoloring brands. Light active icons/focus contrast also needs focused review.
2. **P1 theme-policy inconsistency, confirmed visually/computed:** index.css explicitly declares one controlled dark theme, but Rankings alone changes surfaces under OS light preference. Home, Calendar, More, Athlete and Race stay dark. Shared nav/Back remain dark glass in light Rankings. Owner must choose intentional per-page light support versus global dark policy. Do not globally redesign pre-release.
3. **P1 typography inconsistency:** computed season and Back text use Arial while headers/body and picker Done use system-ui. There is no global button font inheritance. Exact Back declaration in refinements.css lines78–92 sets size/weight without family; season rule in OfficialRankingsPage.css similarly omits family. Propose narrowly scoped font-family inheritance after visual approval; preserve intentional symbol-font rules.
4. **P1 brand-token drift, confirmed source declarations:** Race card series colors differ from official Rankings tokens. Some values are overwritten by later CSS. Owner should approve semantic alias reconciliation after measuring effective card styles; no immediate blanket substitution.
5. **P2 duplication/cascade maintenance:** rank dark tokens duplicate tri tokens except border; base search/cards retain hardcoded grays overridden by theme layers. Consolidate only verified equivalent roles, after release if no visual defect. `@keyframes standings-enter` appears without a matching animation assignment in current Rankings stylesheet: candidate obsolete declaration, not removed here.
6. **P2 table typography/spacing:** 10–15px dense data text and many local weights are intentional in part; document a small set of roles before normalizing. Shared 44px touch targets are not interchangeable with visual icon diameter. Glass contrast depends on background artwork; no universal blur/opacity value recommended.

No new confirmed functional navigation defect was established in this audit. Existing swipe/NAV tests were not rerun. Physical-device performance exception remains conditional; design audit does not close it.

## Proposed Design System v1.0 (not implemented)

- Retain primitive palette `--tri-bg`, surface/raised, text/muted/disabled, border/strong, yellow accent. Promote existing exact IRONMAN #ED174B and T100 #43D7D0 brand tokens to documented shared roles; distinguish brand decoration from accessible small-text foreground.
- Alias page surface roles only where their effective values/intent match. Define explicit theme policy before adding any global light palette.
- Typography roles: page title28–36px/1.15–1.25; section20–24px/1.2; body14–16px/1.4–1.55; compact data12–14px/1.3; caption11–13px; action14–16px. These are recommended starting ranges, not mandatory universal limits or retroactive redesign requirements. Keep Home hero and athlete identity exceptions.
- Weight roles400 body,500 metadata,600/650 actions/names,700 emphasis,750/800 numeric emphasis. Review actual OS rendering before collapsing intermediate weights. System stack stays; inherit only where appropriate.
- Spacing reference4/8/12/16/20/24px with current12/20px page gutters; preserve safe-area max/calc expressions. Radius roles8–12 controls,16 panels,22 nav,24 sheet,999 pill. Do not force different components to one radius.
- Separate glass roles navigation/back/compact-action; document blur fallback, backdrop-dependent contrast, border and shadow. Preserve existing approved appearance.
- States: default/hover (pointer-aware)/pressed/selected/disabled/focus-visible/loading/error, with semantic meaning and reduced-motion handling. Keep stationary controls while tables drag. Keep series dots distinct from gender pictograms.
- Responsive contracts: portrait and short landscape independently; showcase assets follow DS-02, 44px interactive targets preserved, keyboard focus and scroll clearance tested at320/390/440 and667/844/956 before any implementation.

## Owner decisions and next steps

1. Resolve small brand-colored rank text contrast without changing official ranking data or brand identity.
2. Confirm dark-only product policy versus intentional Rankings-only light mode.
3. Approve a small typography-inheritance patch if desired; no global reset in this audit.
4. Decide whether legacy race-card accents are intentional or should alias official brand tokens.
5. Keep broader token/cascade cleanup post-release; require component screenshots and targeted tests for each future patch. Do not gate v1.0.0 on an unsolicited full redesign.

## Verification

Documentation file-target checks: 114/114 PASS across both reports and Project Board; `git diff --check` PASS. SHA-256 comparison against audit start confirms all existing code/data/artwork/tests unchanged; only the board changed among existing files, plus two new audit reports. No production build required or run; no implementation tests claimed. Git consolidation plan is separate: [GIT-01](git01-repository-consolidation-plan.md).
