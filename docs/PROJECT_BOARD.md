# 300W — Project Board

Обновлено: 2026-10-25. Краткая рабочая доска; код и evidence определяют фактическое состояние реализации. Это не разрешение выполнять перечисленные действия.

Приоритеты: **P0** — критический инцидент; **P1** — ближайший приоритет; **P2** — плановая работа; **P3** — улучшение без срочности. Приоритет не означает разрешения на выполнение.

## Current Focus

Подготовка v1.0.0 — **CONDITIONAL GO / release candidate preparation**, не объявленный релиз. [Readiness audit и athlete roadmap](pre-release-readiness-2026-10-18.md): gate PASS, но версия остаётся 0.0.0; нужны release approval/notes/tag, Android E2E и решение по сетевому риску. Production и Preview работают на `c8f52e02a75e0b413dddbfee77f477232c5301d3` (live verified 20.10.2026). REL-01 и UX-01 не закрываются автоматически по tests/deployment PASS. BOT-01/BOT-02/BOT-05 DONE; BOT-03/BOT-04 и все technical/data tasks сохраняются. ATH-01/02 DONE — production closeout 20.10.2026; нерешённые вопросы сохранены в ATH-05; ATH-03/04 — proposed editorial enrichment, не разрешение на импорт.

## GIT-01 / DS-01A — Audit closeout · 2026-10-25

- **GIT-01 — Owner Approved / Audit Complete (GIT-01B instruction).** [Consolidation plan](git01-repository-consolidation-plan.md): complete incoming file inventory, conservative approval classification, atomic Rankings/NAV dependency boundary and archive exclusions. At the GIT-01B checkpoint no commits existed; superseded by GIT-01C.3 below. NAV-03, QA-02B, TECH-01-HOOKS and PERF-01C approvals reconciled by GIT-01B; Athlete Profile remains pending.
- **DS-01A — Owner Approved / Closed (DS-01C instruction).** [Design System audit](ds01-design-system-audit.md): palette, typography, component inventory, representative dark/light portrait/landscape evidence and prioritized proposals. Dark-only release policy confirmed; DS-01B implements the approved contrast/control-font corrections and is now closed; no UI changes were made in the historical GIT-01B audit.
- Existing RANK, DS-02, PERF, TECH and Athlete task statuses remain unchanged. Historical audit work made no commit/push/deployment, data or infrastructure changes.

### GIT-01B — Consolidation preparation

- **Status:** REHEARSAL PASS / AWAITING OWNER REVIEW. Explicit task approvals reconciled;106 included paths,29 excluded;50 unit tests,7 browser suites, build/release gate and link checks PASS. Test maintenance and isolated rehearsal only. No staging, commits or deployment. [Exact allowlist, exclusions and rehearsal results](git01-repository-consolidation-plan.md).

### GIT-01C.3 — Local consolidation · 2026-10-26

- **Status: LOCAL CONSOLIDATION COMPLETE / OWNER REVIEW BEFORE PUSH.** Six thematic local commits cover exactly106 approved paths (22 registry,52 Rankings/NAV,4 technical fixes,22 DS-02,3 PERF reports,3 project documents). Commit1 `150a0f6`; Commit2 `72b2906`; Commit3 `3bedfc3`; Commit4 `344b28e`; Commit5 `5c9e1e1`; this section belongs to the final project-documentation commit.
- GIT-01C.2 deterministic season-test bytes explicitly approved by GIT-01C.3 and included in Commit2. Exact staged build/registry/navigation tests and Rankings/NAV browser suites PASS; technical boundary release gate18/18 and Calendar/code-splitting/navigation browser suites PASS. The original intermittent failure cause remains unconfirmed.
- All29 excluded files remain unchanged, including unfinished Athlete Profile, protected audit artifacts and unused artwork originals/manifests. Excluded files remain local; no deletion, archive relocation or prototype-runtime integration.
- Final post-commit tests, exact per-commit file lists and Git state are recorded in `/tmp/300w-git01c3/`. Consolidation does not imply all legacy tests pass or authorize release/push. Sports chunk exception remains conditional on physical-device QA; known historical full-regeneration/photo-test failures remain separately documented by the release gate.
- No push, deployment, version bump, D1, secrets or Cloudflare changes. DS-01B, HOME-UI-01 and Athlete Profile remain separate pending work. Current primary tree intentionally retains excluded changes; use the committed tree for release verification.

### DS-01B — Targeted UI Fixes

- **Status: Owner Approved / Closed** · implementation 2026-10-26; approval recorded by DS-01C instruction (no separate approval date supplied) · **Priority:** P1 · target v1.0.0. Rankings follows the existing dark-only palette under either OS preference. Primary-text rank numerals retain top-three bold emphasis; Back/Season inherit the system font. No artwork, gestures, data or unfinished Athlete Profile changes.
- [Implementation and QA](ds01b-dark-theme-polish.md); [Design System v1.0 reference](design/300w-design-system-v1.0.md). **Design System v1.0 — Owner Approved.** **DS-01B.1 — Verification Complete / Closed:** stale screenshot packaging explained the discrepancy; fresh runtime verification passed and no additional CSS correction was required. Physical iPhone/Telegram QA remains pending where applicable.
- **Light Theme:** separate POST-RELEASE design/development task, not part of v1.0.0. Legacy race-card accent reconciliation remains separate; no silent brand changes.

### HOME-UI-01 — Home Slogan Review

- **Status:** SEPARATE PRE-RELEASE REVIEW · owner decision pending. Preserve as independent task; no slogan edits or approval inferred from consolidation.

## Rankings UI closure — RANK-07 · 2026-10-23

**Owner-approved UI:** RANK-01 UI, RANK-02, RANK-03 artwork, RANK-04, RANK-05, RANK-05B, RANK-06. RANK-05 approved on physical iPhone via Preview; RANK-06 approved locally using Safari screenshots. This closes UI review, not Production rollout or all rankings data backlog.

**Local:** all approved UI present. **Preview:** RANK-01–05/B + NAV-03; deployment `e441f5f7-05d9-41dc-bbf9-594acb29fd82`, version `84653431-5134-4216-813a-2b5bb4c573fc`. **RANK-06: NOT Preview-deployed. Production: NOT updated with latest Rankings UI.** Version remains 0.0.0. No deployment in this documentation task.

[Current approval/deployment matrix and UI decisions](official-rankings-ui-2026-10-22.md#current-closure--rank-07-2026-10-23). Previous task notes below are retained historical checkpoints; pending UI-review language there is superseded by this explicit owner approval.

### TECH-01-HOOKS — RaceDetailPage React Hooks Warning

- **Status:** OWNER APPROVED (GIT-01B instruction) · **Priority:** P1 · **Target:** v1.0.0 · implementation checkpoint 2026-10-25; approval date not separately supplied.
- Owner task TECH-01; board suffix distinguishes this task from the existing OPEN stable-athlete-ID regeneration risk TECH-01 below. That data-integrity risk remains open; this hooks fix is explicitly owner-approved in GIT-01B.
- Stabilized active-year editions and moved edition-ID Set construction inside the results memo. Selection, filtering, order, URL/navigation and authoritative data preserved; no lint suppression.
- Component/full lint PASS (original hook warning removed); unit tests 30/30, Calendar browser 4 viewports, code-splitting browser 4 viewports, navigation scenarios and 27 before/after year/gender states PASS. Build and release gate 18/18 PASS; sports chunk warning remains under PERF-01 conditional exception.
- [Exact warning, fix, regression evidence and limitations](tech01-race-detail-hooks-warning.md). Local only; no commit/push/deployment or version bump.

### PERF-01 — Sports Chunk Size Optimization

- **Status:** PRE-RELEASE DECISION CLOSED / CONDITIONAL PERFORMANCE EXCEPTION · **Priority:** P1 · owner decision 2026-10-25 (PERF-01C).
- PERF-01A audit ACCEPTED. PERF-01B prototype and PERF-01B.2 A/B REJECTED for v1.0.0. Retain the existing shared sports loading architecture; no experimental code adopted.
- Accept the existing ~1.295 MB minified sports chunk warning as a pre-release exception **conditional on final physical-device QA**. This is not a release approval, warning suppression, or claim that cold loading is fast. Local Chromium CPU4×/1.6Mbps: cold Rankings ~3.2–3.6s across documented workloads; warm ~19ms. The workloads differ and must not be pooled as one benchmark.
- Rationale: route splitting halves Rankings cold readiness but shifts ~4–4.6s to immediate Athlete navigation; delayed preload cannot guarantee fast immediate clicks. Preserve baseline behavior for v1.0.0.
- **Outstanding acceptance:** physical iPhone Safari / Telegram WebView where available, plus required Android QA; cold/warm Rankings, immediate Profile, Calendar/Race, Back and swipe responsiveness on realistic networks. Record device/network and owner acceptance. If unacceptable, reopen this exception before release. No physical-device acceptance performed in PERF-01C.
- Follow-up implementation is separate **PERF-02**, below. RaceDetailPage hook dependency warning resolved and owner-approved under TECH-01-HOOKS (GIT-01B instruction); it is separate from this performance exception.
- [Accepted audit and PERF-01C closeout](perf01-sports-chunk-audit.md#perf-01c--owner-decision-and-pre-release-exception).

### PERF-01C — Pre-release Performance Decision & Closure

- **Status:** OWNER APPROVED (GIT-01B instruction) · implementation checkpoint 2026-10-25; approval date not separately supplied.
- Rankings browser test now waits for the selected T100 state and aligned slide with a bounded failure timeout; no fixed post-swipe sleep or gesture behavior change. Exact standings/identity and other assertions retained.
- Production build PASS; release gate 18/18 PASS; Rankings browser 14 viewport/theme cases plus Home/Bottom Navigation PASS, including 1440px dark/light; git diff --check and 117 local documentation links PASS. No commit/push/deployment; final physical-device QA remains pending.

### PERF-02 — Sports Data / Runtime Payload Optimization

- **Status:** TODO · **Priority:** P2 · **Target:** POST-RELEASE.
- Independently design payload and route-boundary optimization using the accepted audit. Preserve authoritative datasets, provenance, identity mappings, formulas and complete profile/results behavior.
- Compare full cold/warm user journeys, including immediate and delayed Rankings→Athlete and Race transitions; measure total transfer, script work and main-thread impact. Avoid preload that only improves delayed clicks or hides first-profile cost.
- Any data projection/partitioning architecture requires separate owner approval. Reuse measurements and lessons, not rejected prototype code by default. Require regression tests and physical-device evidence before adoption.

### PERF-01B.2 — Route Loading Optimization & Swipe Investigation

- **Status:** REJECTED BY OWNER FOR v1.0.0 · **Priority:** P1 · 2026-10-25.
- Swipe failure reproduced in baseline and prototype: native snap + 120ms debounce can complete after the test's fixed 750ms. Six controlled runs settled by 800ms; bounded state-wait preserves the assertion. No swipe/UI code change.
- Separate A/B copies in `/tmp/300w-perf01b2/`: A deferred cached sports preload; B independent Athlete/results boundary. No application changes adopted.
- Three-run immediate-click medians: baseline Rankings 3596ms / Athlete 41ms; A 1856 / 4565ms; B 1854 / 4496ms. A delayed-click Athlete 49ms, but immediate navigation still regresses; B adds Race loading latency.
- Final A/B builds and release gates18/18, unit tests38/38, Calendar/code-splitting browser4 cases each, Rankings14 viewport/theme cases and navigation/NAV-03 PASS. Initial B lint fixed only in isolation; reused-tab navigation failure also reproduced on baseline, fresh-tab runs PASS (harness isolation limitation retained).
- Recommendation **REJECT current A/B for adoption**. [Experiment, exact scope, performance and validation](perf01b2-route-loading-experiment.md). PERF-01C records the conditional baseline exception; future optimization is PERF-02. No commit/push/deployment or data changes.

### PERF-01B — Rankings Code-Splitting Prototype

- **Status:** REJECTED BY OWNER FOR v1.0.0 · **Priority:** P1 · 2026-10-25.
- Isolated current-working-tree prototype in `/tmp/300w-perf01b/prototype/`; no application changes adopted into the main tree. Full data/provenance retained; five route-boundary files changed only in the copy.
- Three-run Chromium CPU4× / 1.6Mbps comparison: cold Home→Rankings median 3197→1647ms; incremental JS transfer 263800→100124 B. First subsequent Athlete navigation 44→4018ms due to deferred sports loading; warm transitions essentially unchanged.
- Builds and release gates 18/18 each PASS; unit tests38/38 and code-splitting browser4/4 PASS. Rankings browser stopped on touch-series swipe at 1440px dark after12 viewport/theme cases passed; cause subsequently resolved as test synchronization in PERF-01B.2; this line retains the original validation checkpoint.
- Historical recommendation REVISE; owner decision under PERF-01C: **REJECTED**. [Architecture, metrics, validation and reproduction](perf01b-rankings-code-splitting-prototype.md). Baseline retained under PERF-01C; final physical-device QA still required. No commit/push/deployment.

### QA-02B — Deterministic Calendar Code-Splitting Test

- **Status:** OWNER APPROVED (GIT-01B instruction) · **Priority:** P1 · implementation checkpoint 2026-10-25; approval date not separately supplied.
- QA-02 confirmed no missing race: Kona moves from Upcoming to Past afterOct10 Moscow; test's unfrozen count4 was stale. Browser test now fixesOct2 and verifies all four exact edition IDs via card navigation, both initial Calendar and invalid-race fallback.
- Full code-splitting browser4/4, Calendar unit6/6 and browser3/3, build, release gate18/18 and diff check PASS. Original reload/history/error/retry assertions preserved. Initial overlapping-build run had a timeout; stable sequential final run passed.
- [Investigation and QA-02B implementation/validation](qa02-calendar-card-count-investigation.md). Separate follow-up: unfrozen Home carousel/navigation/layout test fixtures; no unrelated test edits.
- No production code/data changes. This resolves the historical Calendar expectation only; PERF-01C separately records the performance decision. No commit/push/deployment.

### PERF-01A — Sports Chunk Performance Audit

- **Status:** ACCEPTED BY OWNER · **Priority:** P1 · 2026-10-25.
- Current sports chunk: 1,295,176 B minified / 263,224 B gzip (offline Node measurement). Main contributors: full results, athlete/enrichment and standings evidence; shared lazy boundary also calculates internal ranking for Rankings navigation.
- Local Chromium CPU4× / 1.6Mbps: median first Home→Rankings3,195ms, warm19ms. Not physical iPhone or Production measurement. No universal release latency threshold established.
- [Audit, reproducible metrics, alternatives and risks](perf01-sports-chunk-audit.md). Original prototype recommendation was evaluated in PERF-01B/B.2 and rejected by owner for v1.0.0; no implementation adopted.
- Release gate18/18 and official standings tests20/20 PASS. Existing code-splitting browser suite FAIL on Calendar fixed count (expected4, actual3); subsequent scenarios not run. Historical audit checkpoint: QA-02/QA-02B below resolves this expectation; full release-wide browser validation remains separate.
- PERF-01C closes the pre-release architecture decision with a conditional performance exception; physical-device acceptance is still pending. No code/data/configuration changes or deployment.

### DS-02A — Showcase Technical Templates

- **Status:** OWNER APPROVED · **Priority:** P1 · approval recorded 2026-10-25 (DS-02B owner instruction).
- Fresh DOM audit at all eight requested sizes, plus three synthetic top-inset scenarios. Six SVG templates + PNG previews, crop/overlay evidence, draft production dimensions/DPR and per-surface performance budgets.
- Home requires a separately authorized art-direction migration for new multi-variant compositions; current runtime remains unchanged. Owner accepted methodology, safe-zone approach and production recommendations as starting values, not universal mandatory limits.
- [Technical specification](ds02-showcase-technical-templates.md) · [Visual gallery](design/showcase-templates/index.html) · [Validation checklist](design/showcase-templates/validation-checklist.md).
- No application/artwork/mapping changes, commit/push or deployment. DS-02 v1.0 subsequently owner-approved under DS-02C (2026-10-25).

### DS-02B — Showcase & Artwork Guidelines v1.0 Finalization

- **Status:** OWNER APPROVED · **Priority:** P1 · 2026-10-25, explicit DS-02C owner approval.
- [Consolidated Guidelines v1.0](design/300w-showcase-artwork-guidelines-v1.0.md) · [Artwork Brief](design/showcase-artwork-brief-template.md) · [Codex Handoff](design/showcase-codex-handoff-template.md).
- Reference-first cinematic photorealism, component-specific geometry, separate compositions, final-crop-first approval and production-ready delivery consolidated. Historical audits/templates retained unchanged.
- **Future development task:** Home multi-variant migration — TODO / separately scoped and authorized; three composition groups proposed, no runtime implementation in DS-02B.
- PERF-01 remains separate and open. No application/artwork/mapping changes or deployment; DS-02B explicitly owner-approved under DS-02C (2026-10-25).

### DS-02 — Showcase & Artwork Guidelines v1.0

- **Status:** Guidelines v1.0 — OWNER APPROVED (DS-02C, 2026-10-25). DS-02A foundation is owner-approved; numerical dimensions, DPR, margins and budgets are accepted recommended starting values, not rigid limits.
- [Measured architecture audit](ds02-showcase-architecture-audit-2026-10-23.md) · [Requirements draft](ds02-showcase-guidelines-draft.md).
- Home and Rankings geometry differ. Prepare dual-format, final-crop-first artwork handoffs for 2027; no component/artwork changes in this task.

## In Progress

### RANK-05B — Portrait Showcase Optimization

**Current UI status: OWNER APPROVED (RANK-07).** Below: historical implementation checkpoint; deployment status is in the closure matrix.

- **Priority:** P1. **Status:** IN PROGRESS — local WebP optimization, awaiting owner review.
- Eight full-resolution portrait WebP derivatives; PNG originals and landscape artwork preserved. Payload 18.21 → 2.46 MB; existing two-neighbor swipe track unchanged.
- **Report:** [Asset audit and QA](rank05b-portrait-optimization-2026-10-23.md). No commit/push/deployment.

### RANK-05 — Interactive Swipe & Snap

**Current UI status: OWNER APPROVED (RANK-07).** Below: historical implementation checkpoint; deployment status is in the closure matrix.

- **Priority:** P1. **Status:** IN PROGRESS — local prototype, awaiting owner review.
- Native Scroll Snap tracks for series artwork and gender tables; pointer-driven mouse support, click suppression, stationary controls. Home behavior and approved artwork/data preserved.
- No deployment/commit/push. Physical iPhone Safari/Telegram validation remains pending.
- **Report:** [Architecture, prototype and QA](rank05-interactive-swipe-2026-10-23.md).

### RANK-04 — Rankings Controls & Season Picker Polish

**Current UI status: OWNER APPROVED (RANK-07).** Below: historical implementation checkpoint; deployment status is in the closure matrix.

- **Status:** IN PROGRESS — LOCAL UI PATCH / AWAITING OWNER REVIEW · **Priority:** P1.
- **Scope:** separate centered series indicator row; gender label / centered circular indicators / season selector grid; neutral wheel selection band with visible keyboard cue and compact glass-like Done button.
- **Preserved:** owner-approved RANK-03 artwork, rankings/identity data, gestures, wheel semantics, NAV-03 and RANK-02. No commit/push/deploy.
- **Next action:** owner visual review of portrait/landscape controls and picker in both themes.
- **Links:** [RANK-04 review and validation](rank04-controls-picker-2026-10-23.md).

### RANK-03G — Final T100 Cycling Integration & Rankings QA

**Current UI status: OWNER APPROVED (RANK-07).** Below: historical implementation checkpoint; deployment status is in the closure matrix.

- **Status:** IN PROGRESS — LOCAL IMPLEMENTATION / AWAITING FINAL OWNER REVIEW · **Priority:** P1.
- **Scope:** owner-supplied `t100_cycling_final.webp` (2078×378, 211,262 B), entire image preserved via scene-specific contain in the unchanged 5.5:1 frame. Previous cycling assets retained; all other landscape/portrait artwork and data unchanged.
- **Next action:** final owner review of rendered UI and QA report. Approval of source artwork does not mark the overall Rankings UI approved. No commit/push/deploy.
- **Links:** [final integration and QA](rank03g-final-qa-2026-10-23.md).

### RANK-03E — Landscape Showcase Final Polish

**Current UI status: OWNER APPROVED (RANK-07).** Below: historical implementation checkpoint; deployment status is in the closure matrix.

- **Status:** IN PROGRESS — LOCAL PATCH / AWAITING OWNER VISUAL REVIEW · **Priority:** P1.
- **Scope:** sharp Rankings boundary in both orientations; IRONMAN Running focal point 52% proposed; T100 Cycling 60%/40% alternatives prepared, existing 80% retained because skyline and cyclists do not fit together at 5.5:1. Six other compositions and all artwork bytes preserved.
- **Verification:** first/last row, Feedback and physical mouse/touch nav hit tests pass at all seven sizes in both themes; NAV-03 geometry and RANK-02 z-index 40 unchanged. No final crop approval implied.
- **Next action:** owner review of IRONMAN crop and T100 dedicated-composition option. No automatic artwork replacement or generation.
- **Links:** [polish, crop comparison and verification report](rank03e-showcase-polish-2026-10-23.md).

### RANK-03C/D — Landscape Showcase Integration & Performance Audit

**Current UI status: OWNER APPROVED (RANK-07).** Below: historical implementation checkpoint; deployment status is in the closure matrix.

- **Status:** IN PROGRESS — LOCAL IMPLEMENTATION / AWAITING OWNER VISUAL REVIEW · **Priority:** P1.
- **Scope:** восемь approved landscape WebP, responsive picture sources, общий cover 5.5:1 и индивидуальные focal points; portrait bytes/framing сохранены. Performance audit: PASS WITH NOTES; прежний sports chunk warning остаётся.
- **Next action:** review 24 landscape screenshots; отдельно решить композиционные ограничения IRONMAN Running (нижний branding) и T100 Cycling (skyline). Не считать финальные crops owner-approved; artwork не изменялся. Без commit/push/deploy.
- **Links:** [integration/performance/asset report](rank03-landscape-performance-2026-10-23.md).

### NAV-03 — Global Floating Navigation Integration

- **Status:** OWNER APPROVED (GIT-01B instruction) · **Priority:** P1.
- **Scope:** утверждённый NAV-02 интегрирован как default Bottom Navigation на всех применимых страницах. Query-переключатели удалены; 58/48 px, targets ≥44 px, capsule 210 ms, reduced motion и RANK-02 `z-index: 40` сохранены.
- **Next action:** подготовить отдельное разрешение на Git consolidation; owner approval получено явно в GIT-01B, а не выведено из тестов. Commit/push/deploy не выполнялись. DS-01 и landscape artwork вне scope.
- **Links:** [integration report](nav03-integration-2026-10-23.md), [approved prototype history](nav02-prototype-2026-10-23.md).

### UX-01 — Calendar Empty State

- **Status:** IN PROGRESS · **Priority:** P2.
- **Описание:** при некоторых сочетаниях фильтров Calendar может показывать пустой список, например Upcoming + IRONMAN Pro Series после окончания сезона. Нужен оформленный empty state вместо пустого пространства.
- **Acceptance criteria:** различать «Сезон завершён» и обычное «Нет гонок по выбранным фильтрам»; согласовать подходящий русский текст, рассмотреть компактную иллюстрацию календаря или иконку и добавить понятное действие сброса фильтров. Не выводить завершение сезона только из пустого результата: определить отдельное обоснованное условие. Сохранить текущие layout и поведение фильтрации; проверить mobile UI и добавить filter regression tests для обоих состояний и сброса фильтров.
- **Next action:** owner Production closeout review; Preview UI owner-approved, deployed Preview/Production browser tests PASS на target e8a3dba1. Сезонный UI уже deployed; статус остаётся IN PROGRESS до отдельного закрытия.  [Метаданные завершения](../src/data/calendarSeasons.ts): IRONMAN Pro Series 2026 завершён 10.10.2026 в Kona, подтверждено владельцем 18.10.2026. Только Upcoming без поиска показывает «Сезон завершён!» после этой даты в 2026 году; «Результаты сезона» переключает на Past, сохраняя серию и archives. Без подтверждения сезона, при поиске и в будущем году — generic reset. Loading/error не считаются пустым результатом.
- **Links:** [Calendar](../src/pages/CalendarPage.tsx), [season policy](season-transition-2026-2027.md), [developer handbook](maintenance-developer.md).

### REL-01 — Application Versioning

- **Status:** IN PROGRESS · **Priority:** P1.
- **Описание:** подготовить версию 1.0.0 для первого публичного релиза и отображение «Версия 1.0.0» в More. Определить единый источник версии, предпочтительно package.json, и простую release versioning policy. Фактическую версию не менять до отдельного release approval.
- **Acceptance criteria:** UI и `/api/health` получают согласованную версию из единого источника; проверить существующую цепочку build metadata и добавить version consistency tests. Описать порядок изменения версии и её проверки при релизе, без независимых hardcoded значений в UI/Worker.
- **Next action:** подготовить отдельно approved v1.0.0 release notes/version/tag; implementation уже deployed в Preview/Production e8a3dba1, package version остаётся 0.0.0; CHANGELOG.md хранит историю, build генерирует только current notes, More использует collapsed disclosure. Проверить тесты и согласовать notes/процедуру выпуска; не публиковать 1.0.0 без отдельного approval.
- **Links:** [version policy](versioning.md), [changelog](../CHANGELOG.md), [package.json](../package.json), [More](../src/pages/MorePage.tsx), [health handler](../worker/index.ts), [deployment procedure](deployment-cloudflare.md).

### DATA-01 — Русские имена атлетов

- **Status:** IN PROGRESS — OWNER · **Priority:** P2.
- **Описание:** продолжающийся ручной проект владельца по проверке локализации. Не генерировать недостающие имена автоматически и не менять identity.
- **Next action:** владелец редактирует только `name_ru` в review CSV; затем dry-run, review и отдельно разрешённая запись. Не запускать audit/export поверх незавершённого ручного CSV: он перезаписывает файл.
- **Links:** [CSV workflow](athlete-name-review.md), [localization registry](../src/data/athletes/athleteLocalization.json).

## Needs Attention / Review

### BOT-03 — Retire unused Preview News receiver

- **Status:** NEEDS REVIEW · **Priority:** P2.
- **Описание:** public @tri_app_bot перенесён в Production; старый Preview News endpoint/config ещё не отключён. Preview News GET и существующие D1 records должны сохраниться.
- **Next action:** отдельно согласовать отключение legacy receiver; сохранить NEWS_TELEGRAM_CHANNEL_ID, test-bot commands/Feedback и Production News/Feedback. Не выполнять автоматический возврат public webhook на Preview.
- **Links:** [cleanup safeguards](telegram-commands.md#operational-follow-ups).

### BOT-04 — Permanent Preview Observability policy

- **Status:** NEEDS REVIEW · **Priority:** P2.
- **Описание:** временная Preview Observability остаётся включённой после устранения command incident; invocation logs, traces и issues отключены.
- **Next action:** выбрать permanent settings либо отключение после review хранения, sampling и privacy; никаких unfiltered Telegram payload logs.
- **Links:** [safe diagnostics](telegram-commands.md#safe-503-diagnostics).

### DOC-02 — Сверить устаревшие статусы в документации и release output

- **Status:** NEEDS REVIEW · **Priority:** P2.
- **Описание:** Текущие documentation claims исправлены в DOC-01; historical snapshots сохранены с датами. Release policy/output всё ещё содержит country-conflict wording/старый allowlist, хотя фактический full-regeneration FAIL теперь ID drift. Photo-review regression запускается отдельно и не входит в release runner. Изменения scripts/tests не входят в DOC-01.
- **Next action:** отдельным code maintenance review согласовать release diagnostics и состав gate с текущими evidence. Сохранить исторические checkpoints с датами; не превращать UNKNOWN в PASS без evidence и не открывать заново исправленные country issues.
- **Links:** [scripts](scripts.md), [News operations](latest-news.md), [production runbook](deployment-cloudflare.md), [release policy](../scripts/release-policy.mjs).

## Backlog

### RANK-01 — Official Series Rankings Integration

- **Status:** UI OWNER APPROVED; remaining data lifecycle / Production rollout IN PROGRESS · **Priority:** P1 · **Target:** Before v1.0.0.
- **Описание:** интегрировать официальные standings IRONMAN Pro Series и T100 / Triathlon World Tour, отдельно для мужчин и женщин, за сезоны 2024, 2025 и 2026 там, где применимо.
- **Acceptance criteria:** официальные места и очки без выдуманных расчётов; сохранить форматы соревнований каждого сезона. Записывать source provenance и даты snapshots; обеспечить stable mapping к 300W athlete IDs и переходы в профили. Нужны import validation, conflict reporting и regression tests. Официальные standings не подменяют внутреннюю ranking formula 300W.
- **Historical next action (superseded by RANK-07 approval):** owner review локальной страницы Rankings: IRONMAN/T100 × 2024–2026 × Men/Women, официальный top-10, переходы в профили, wheel picker и swipe. [Отчёт UI](official-rankings-ui-2026-10-22.md). Не отмечать DONE до owner E2E; финальные showcase artwork и полнота standings сверх top-10 остаются отдельными задачами.
- **Local registries:** T100 — 6 таблиц / 60 verified rows ([отчёт](t100-registry-application-2026-10-21.md)); IRONMAN — 6 таблиц / 60 owner-approved CSV rows, все identity CONFIRMED после owner approval 22.10.2026 ([отчёт](ironman-standings-preparation-2026-10-21.md)). Значения registries при UI integration не изменялись. Исторические 2024/2025 остаются HISTORICAL_FINAL_PENDING_CONFIRMATION; 2026 — LIVE, без обещания автоматического обновления.
- **Links:** [Data Source Policy](scripts.md#data-source-policy), [season policy](season-transition-2026-2027.md), [внутренний ranking](../src/utils/athleteRanking.ts).

- **Owner decision — 22.10.2026:** отдельный комплект из восьми landscape showcase, ориентировочно 5:1–6:1. Portrait PNG сохраняются; до нового утверждённого комплекта не менять кадрирование, не повышать высоту showcase и не генерировать artwork самостоятельно. Back/Feedback выполняются отдельно в UI v2.2A.

### FAV-01 — Favorite Athletes

- **Status:** TODO · **Priority:** P2 · **Target:** Post-release.
- **Описание:** добавление и удаление атлетов из избранного, отдельный список избранных.
- **Acceptance criteria:** user-specific persistent storage; синхронизация между устройствами там, где поддерживается. Сохранять stable athlete IDs и изоляцию пользовательских списков.
- **Next action:** спроектировать идентификацию пользователя, хранение, доступность cross-device sync и UI; согласовать проверки сохранения, удаления и изоляции до реализации.
- **Links:** [developer handbook](maintenance-developer.md), [Telegram integration](telegram-commands.md).

### FAV-02 — Athlete Finish Notifications

- **Status:** TODO · **Priority:** P2 · **Target:** Post-release · **Dependency:** FAV-01.
- **Описание:** уведомлять пользователя, когда у избранного атлета появляется проверенный результат гонки; Telegram bot integration.
- **Acceptance criteria:** указывать атлета, гонку, место и finish time, когда доступны; не придумывать отсутствующие значения. Исключить duplicate notifications; обеспечить opt-in и настройки уведомлений.
- **Next action:** после [FAV-01](#fav-01--favorite-athletes) согласовать событие verified result, deduplication, preferences и изолированную Telegram delivery; предусмотреть regression tests повторной обработки и opt-out.
- **Links:** [results workflow](import-race-results.md), [Telegram operations](telegram-commands.md).

### FAV-03 — Ranking Movement Notifications

- **Status:** TODO · **Priority:** P2 · **Target:** Post-release · **Dependencies:** FAV-01, RANK-01.
- **Описание:** определять подтверждённые изменения в официальных standings серий и уведомлять о значимых перемещениях избранных атлетов.
- **Acceptance criteria:** указывать серию, предыдущее и новое место; исключить дубликаты и шумные уведомления, учитывать пользовательские preferences. Сравнивать подтверждённые snapshots соответствующих серии, сезона и пола.
- **Next action:** после [FAV-01](#fav-01--favorite-athletes) и [RANK-01](#rank-01--official-series-rankings-integration) согласовать критерий значимости, snapshot comparison, deduplication и tests настроек пользователя.
- **Links:** [Telegram operations](telegram-commands.md), [Data Source Policy](scripts.md#data-source-policy).

### ATH-05 — PTO enrichment follow-up и evidence maintenance

- **Status:** TODO · **Priority:** P2.
- **Описание:** незакрытые вопросы после ATH-01/02; завершение основного scope не означает approval этих полей или исправление tooling/performance limitations.
- **Field review:** shared YouTube Jackson Laundry / Lisa Becharas и AGE/BORN Lisa остаются HOLD; 57 rejected/unsupported social URLs исключены. Нужна отдельная проверка identity/эквивалентности URL и owner approval перед импортом.
- **Tooling:** piped Python parser stdin может зависать; успешный workaround — file stdin. Ограничение документировано, parser behavior не исправлялся.
- **Performance:** build предупреждает о sports chunk ~1,2 MB; доставка полных JS/CSS в Production проверена по SHA-256. Оценить performance отдельно; не закрывать сетевой риск OPS-02.
- **Evidence:** локальный HTML archive `/Users/andrey.shubin/Projects/tri-app-archives/pto-photo-cohort-2026-10-20/` содержит 221 verified snapshots; integrity PASS. Off-device backup пока не выполнен; копирование/загрузка требуют отдельного approval.
- **Next action:** отдельно согласовать field review, диагностику parser, измерения chunk performance и защищённый off-device backup; не менять HOLD/SKIP автоматически.
- **Links:** [field review](athlete-pto-owner-field-review-2026-10-20.md), [archive recovery и parser limitation](athlete-pto-photo-application-2026-10-20.md).

### ATH-03 — Editorial biographies for top athletes

- **Status:** TODO — PROPOSED · **Priority:** P3.
- **Описание:** reviewed Russian biographies top cohort, claim-level evidence; сейчас 1/1167. Детализация DATA-02, не замена/закрытие задачи.
- **Next action:** факт-лист и owner-approved текст, затем persistent editorial registry и общий paragraph rendering review. Scope M + editorial work; mobile/accessibility/invariant tests.
- **Links:** [model, sources, workflow](pre-release-readiness-2026-10-18.md#ath-03--editorial-biographies-for-top-athletes), DATA-02.

### ATH-04 — Verified key achievements

- **Status:** TODO — PROPOSED · **Priority:** P3.
- **Описание:** verified structured achievements с competition/season/evidence; сейчас 1 профиль, 4 пункта. Сохранить approved Kristian text/icons.
- **Next action:** source/identity/season review и owner approval до schema/icon adapter changes; scope M, зависимости provenance и DATA-02, tests порядка/уникальности/иконок/ID/ranking.
- **Links:** [model, sources, workflow](pre-release-readiness-2026-10-18.md#ath-04--verified-key-achievements), DATA-02.

### DATA-05 — Переход сезона 2026 → 2027

- **Status:** BACKLOG — POLICY DOCUMENTED, IMPLEMENTATION NOT STARTED · **Priority:** P2.
- **Описание:** approved scope IRONMAN / IRONMAN 70.3 / T100 под TWT; Roth — отдельная гонка без нового фильтра. T50, Challenger и WTCS исключены. Policy approved и committed 243d9a565d937a41c0131ed189aae24b33ae3301; новые гонки/assets/код не добавлены. DATA-03 завершена; реализация сезона 2027 не начата.
- **Next action:** получить verified calendar и отдельный approved plan для archive 2026, 2027 editions, Roth visibility/aliases и showcase imagery. Не копировать даты и не мигрировать IDs автоматически.
- **Links:** [season policy и implementation gaps](season-transition-2026-2027.md), [source policy](scripts.md#data-source-policy), TECH-01.


### OPS-01 — GitHub Actions: automatic preview, manual production approval

- **Status:** BACKLOG · **Priority:** P2.
- **Описание:** запланированная автоматизация; текущая deployment procedure остаётся ручной.
- **Next action:** предложить workflow, approval gate и изоляцию credentials/environments; согласовать до создания CI или изменения deployment.
- **Links:** [deployment procedure](deployment-cloudflare.md).

### QA-01 — Android Telegram Mini App validation

- **Status:** BACKLOG — UNVERIFIED · **Priority:** P1.
- **Описание:** реальные iPhone проверки сообщены владельцем; Android нельзя считать проверенным по desktop/browser suites.
- **Next action:** выполнить согласованный сценарий на реальном Android в Telegram, записать устройство/версию/сеть и результаты навигации, results/search/News/Feedback. Отправка Feedback требует отдельного разрешения.
- **Links:** [operational checks](deployment-cloudflare.md), [navigation](navigation.md), [Feedback](feedback.md).

### OPS-03 — D1 backup/restore drill

- **Status:** BACKLOG · **Priority:** P2.
- **Описание:** recovery procedure документирована, практический restore drill не подтверждён. Данные Feedback могут содержать персональную информацию.
- **Next action:** согласовать безопасный backup и проверку восстановления в отдельной recovery DB с ограниченным доступом; не использовать production или preview как тестовую цель.
- **Links:** [D1 recovery runbook](deployment-cloudflare.md).

### DATA-02 — Проверенные биографии и достижения атлетов

- **Status:** BACKLOG · **Priority:** P3.
- **Описание:** постепенное расширение editorial content; не заполнять отсутствующие факты догадками.
- **Next action:** выбрать атлетов, собрать source evidence и получить approval текста/иконок перед изменением профилей.
- **Links:** [Data Source Policy](scripts.md#data-source-policy), [curated men](../src/data/athletes/men.ts), [curated women](../src/data/athletes/women.ts).

## Known Issues / Technical Debt

### TECH-01 — Full regeneration переназначает stable athlete IDs

- **Status:** OPEN — KNOWN LIMITATION · **Priority:** P1.
- **Описание:** после устранения country conflicts full-regeneration validation доходит до проверки сохранности данных и FAIL: сортировка с `10000 + index` меняет IDs, например Emmanuel Lejeune 20010 → 10140. Реальный каталог не заменялся; проверялся только временный output. Release gate PASS не означает full-regeneration PASS.
- **Next action:** отдельно спроектировать сохранение существующих IDs и тесты migration/regeneration. До approval не менять generator, не ослаблять проверки/allowlists и не переносить full-regenerated output в каталог. Для обычного импорта использовать reviewed incremental workflow.
- **Links:** [generator](../scripts/find-next-athletes.mjs), [full-regeneration validation](../scripts/test-athlete-localization.mjs), [ID safeguards](scripts.md).

### OPS-02 — Intermittent JS/assets delivery без VPN

- **Status:** OPEN — DIAGNOSIS INCOMPLETE · **Priority:** P1.
- **Описание:** на отдельных Mac/Windows сетях наблюдались partial transfers, resets/timeouts custom domains; VPN менял доступность. Работающий iPhone Mini App не доказывает глобальную доступность. Конкретная причина и виновная сторона не установлены.
- **Next action:** согласовать минимальную повторную диагностику с полными byte counts, устройством/сетью/VPN и сравнением custom domain/workers.dev; любые изменения сети/Cloudflare — только после отдельного approval.
- **Links:** [asset smoke / network caveats](deployment-cloudflare.md).

### TECH-02 — Photo extraction can nominate non-portrait assets

- **Status:** OPEN — SYSTEMIC RISK · **Priority:** P1.
- **Описание:** Franzi Hofmann (ID 172) displayed a Sailfish sponsor logo. On 2026-10-12 the PTO profile has `no-pic` without `src`; sponsor image is separate. The targeted fix is included in the owner-confirmed DATA-03 production release; runtime rejection removes this specific association; original/optimized files and generated registry are retained. Historical extraction cause is not proven.
- **Next action:** separately approve pipeline safeguards. Current discovery scans all page images, generic filtering relies on URL/alt keywords, and opaque sponsor URLs can remain candidates. Require explicit portrait-region evidence and reject sponsor ancestry before nomination; keep visual approval. No bulk regeneration authorized; systemic risk remains OPEN.
- **Links:** [PTO profile](https://stats.protriathletes.org/athlete/franzi-reng), [manual rejection](../src/data/athletes/photoReview.ts), [extractor](../scripts/athlete-photo-core.mjs), [regression](../scripts/test-athlete-photo-review.mjs).

### TECH-03 — Runtime result IDs зависят от порядка общего массива

- **Status:** OPEN — MAINTENANCE LIMITATION · **Priority:** P2.
- **Описание:** `results/index.ts` назначает IDs через `index + 1`. Вставка или перестановка batch в середине может сдвинуть существующие IDs; importer сам по себе не гарантирует сохранность после ручного wiring. Это отдельный риск от athlete ID drift TECH-01.
- **Next action:** сохранять полный baseline старых rows/IDs и проверять append integration. Любое изменение ID architecture требует отдельного design review; текущий DOC-01 не меняет реализацию.
- **Links:** [results index](../src/data/results/index.ts), [import safeguards](import-race-results.md), [developer handbook](maintenance-developer.md).

## Recently Completed

### ATH-01 — Verified social media links

- **Status:** DONE · **Priority:** P2 · **Date:** 20.10.2026.
- **Описание:** 221 approved PTO profile mappings; 210 enriched athlete profiles. Verified social links и monochrome SVG Facebook/X/Website опубликованы в Production. Full-cohort expansion добавил 720 полей (651 + 60 + 9), без пересечений и замен; исходный 20-athlete pilot и provenance сохранены. YouTube Kristian сохранён; HOLD/SKIP исключены.
- **Production evidence:** SHA `c8f52e02a75e0b413dddbfee77f477232c5301d3`; Version ID `33a50c35-9dda-4234-afdc-2d05c918d846`; Deployment ID `80ddc247-1881-4a55-a7a3-08a38415d588`. `check:production` и независимая проверка SHA обоих hostnames PASS; версия остаётся 0.0.0.
- **Validation:** автоматизированные Production E2E/browser checks на 320/390/768 px PASS (профили, возраст, ссылки, SVG); это не новая owner-confirmed проверка iPhone/Android. Registry tests 4/4 PASS; 1167 athlete IDs, 4592 результата и ranking неизменны. News/Feedback operational, очередь без pending/failed/retryable/leases; Preview deployment и D1 не изменились.
- **Next action:** завершено в согласованном scope; оставшиеся поля и эксплуатационные ограничения — ATH-05. Новые импорты требуют отдельного approval.
- **Links:** [application report](athlete-pto-photo-application-2026-10-20.md), [field review](athlete-pto-owner-field-review-2026-10-20.md), [model/workflow](pre-release-readiness-2026-10-18.md#ath-01--verified-social-media-links).

### ATH-02 — PTO BORN and competition age

- **Status:** DONE · **Priority:** P2 · **Date:** 20.10.2026.
- **Описание:** 197 AGE/BORN profiles из 221 photo-cohort athlete. PTO reported AGE и verified BORN хранятся раздельно с raw values, source timestamps и snapshot hashes. Competition age = calendar year − BORN; AGE-only скрывается после года наблюдения. Точный DOB не выводится.
- **Production evidence:** опубликовано вместе с ATH-01 на SHA `c8f52e02a75e0b413dddbfee77f477232c5301d3`; version/deployment IDs указаны в ATH-01. Production browser checks PASS: Marten Van Riel — 34, Sam Laidlow — 28, Taylor Knibb — 28 в 2026 году. Исходный pilot, athlete IDs, результаты и ranking сохранены.
- **Next action:** завершено; AGE/BORN Lisa Becharas остаются HOLD в ATH-05. Не обновлять raw AGE или DOB догадками.
- **Links:** [application report](athlete-pto-photo-application-2026-10-20.md), [age policy](pre-release-readiness-2026-10-18.md#ath-02--birth-date-and-calculated-age).

### BOT-05 — Branded Mini App Splash Screen

- **Status:** DONE · **Priority:** P1 · **Date:** 17.10.2026.
- **Описание:** владелец принял текущий native Telegram Splash Screen public @tri_app_bot для v1.0.0. SVG 512×512, один заполненный path молнии; Main Mini App URL `https://300w.app/` и Fullsize mode сохраняются.
- **Approved design:** Splash background и Header `#0F1115`, brand yellow `#F3B72B`, одинаковый визуальный стиль light/dark Telegram themes. Оригинальная геометрия Home LightningIcon; прозрачный canvas. Для v1.0.0 не добавлять отдельный animated loading screen в приложение; встроенная анимация Telegram не контролируется этой задачей.
- **Owner acceptance:** текущий Splash Screen принят владельцем 17.10.2026. Telegram применяет platform-specific icon tint; brand yellow `#F3B72B` не гарантирован. Низкий контраст в Telegram Desktop Preview — принятое ограничение v1.0.0. Это решение владельца, не подтверждение новых device tests; QA-01 остаётся отдельной задачей.
- **Asset validation (17.10.2026):** владелец подтвердил требования BotFather: SVG canvas 512×512 и ровно один path (WEBP/TGS — альтернативы). `/tmp/300w-bot05/300w-splash-final.svg`: 229 bytes, XML/512×512/one-path/transparency PASS, исходные path и stroke сохранены; viewBox 0 0 24 24 масштабируется в canvas 512×512. PNG preview `/tmp/300w-bot05/300w-splash-final-preview.png` на `#0F1115` визуально проверен локально. Production assets не изменены.
- **Owner rendering evidence (17.10.2026):** после перехода к single filled path в координатах 512×512 геометрия и масштаб PASS; Desktop Splash Preview на `#0F1115` показывает почти чёрную молнию. Предыдущая Asset validation выше относится к первоначальному локальному SVG, не подтверждает клиентский цвет.
- **Verified color investigation:** [iOS source](https://github.com/TelegramMessenger/Telegram-iOS/blob/master/submodules/WebUI/Sources/WebAppController.swift) использует template mask: для тёмного заданного фона основной tint — фон + 5% белого, отдельно shimmer. [Android source](https://github.com/DrKLO/Telegram/blob/master/TMessagesProj/src/main/java/org/telegram/ui/web/BotWebViewContainer.java) применяет собственный tint: для тёмного фона HSV saturation +0.025 (условно), value +0.15, отдельно gradient. SVG fill не сохраняется этими ветками. В опубликованном botAppSettings нет icon-color или цветного WEBP/TGS media field; смена формата не подтверждена как способ сохранить жёлтый. Точная реализация Desktop Preview и соответствие исходников установленным версиям клиентов остаются UNKNOWN.
- **Local experiment:** `/tmp/300w-bot05/tint-comparison.png` — приближение основного tint без shimmer, не screenshot Telegram. Для фонов `#0F1115`, `#14171C`, `#1C2026`, `#242A32` расчётный контраст iOS 1.12–1.16:1, Android 1.41–1.58:1; осветление графита не даёт убедительного решения. Жёлтый `#F3B72B` остаётся brand intent, не гарантией splash rendering.
- **Next action:** дополнительных Splash Screen работ до релиза не требуется. Сохранить background/header `#0F1115`, текущий SVG, URL и Fullsize. Не добавлять отдельный animated loading screen для v1.0.0. Возможные будущие улучшения требуют отдельного scope/approval.
- **Links:** [Telegram operations](telegram-commands.md), [loading screen settings](https://core.telegram.org/bots/features#customizable-loading-screens), [app settings schema](https://core.telegram.org/constructor/botAppSettings), [Home lightning](../src/components/AppIcons.tsx), QA-01.

### BOT-02 — BotFather commands и Menu Button

- **Status:** DONE · **Priority:** P2 · **Date:** 17.10.2026.
- **Evidence:** owner-confirmed Telegram command menu показывает `/start`, `/app`, `/help`. Владелец ранее подтвердил Main Mini App enabled и default Menu Button `300W⚡️` → `https://300w.app/`; это owner-confirmed evidence, не новая Bot API проверка.
- **Next action:** сохранять текущие команды, Menu Button и Main Mini App URL; Splash Screen отслеживается отдельно в BOT-05.
- **Links:** [command operations](telegram-commands.md).

### BOT-01 — Dedicated Telegram command webhook

- **Status:** DONE — CORE FUNCTIONALITY · **Priority:** P1 · **Date:** 2026-10-17.
- **Описание:** public @tri_app_bot webhook успешно перенесён с Preview News endpoint на `https://tri-app.shy-andrey.workers.dev/api/telegram-public-webhook` по подтверждению владельца. Production News/Feedback остаются у @tri_app_prod_bot; Preview commands/Feedback — у @tri_app_preview_bot.
- **Owner-confirmed E2E:** Production `/start`, `/app`, `/help`, кнопка открытия `https://300w.app` и доставка тестового Feedback в Telegram-группу — PASS. Ранее Preview `/start`, `/app`, `/help` и Feedback с PREVIEW marker также подтверждены владельцем. Это реальные owner checks, не результаты mocks.
- **Automated read-only evidence (2026-10-17):** Production SHA `9abd8c47a87b34cdaff9fb54f4f673058b5511af`, version `431a164d-b2a0-44e6-9651-8e98bfebf5f7`, deployment `4c65e3da-9a9c-4e64-96f4-2fe5733cc819`; восемь secret bindings и ordinary vars подтверждены без чтения значений secrets. Feedback sent=4; pending/failed/retryable/active и expired leases=0. News GET 999 → 997 → 996; Feedback protected. Preview SHA `f1a95114b29fe56b1a76596bb2da8ce8b895ff5e`, deployment/bindings/D1 identity и News/Feedback responses совпадают с baseline. Полное содержимое D1 не сравнивалось; Telegram getWebhookInfo при closeout не вызывался.
- **Next action:** BOT-02/BOT-03/BOT-04 остаются открытыми. Persistent command deduplication отсутствует: неоднозначные send failures/retries могут дать повторные ответы. Не откатывать автоматически на версию без public route. Исторические command/workerd tests и release gate PASS не запускались повторно в documentation closeout.
- **Links:** [command operations](telegram-commands.md), [handler](../worker/telegram/commands.ts), [tests](../scripts/test-telegram-commands.mjs), [production runbook](deployment-cloudflare.md).

### DOC-01 — Developer and Owner Maintenance Handbooks

- **Status:** DONE · **Priority:** P2 · **Date:** 13.10.2026.
- **Описание:** созданы два практических руководства для разработчика и владельца, source-of-truth map, validation/STOP boundaries и ссылки на canonical workflows. Уточнены country status, keep-vars и ограничения photo tests.
- **Evidence:** владелец согласовал оба handbook и финальный walkthrough. Сценарии изменения даты гонки и русского имени успешно проверены по текущему коду: файлы, поля, примеры, команды, Git, Preview и отмена. Проверка была read-only относительно application/data; реальные даты/имена не менялись. Локальные ссылки, пути, npm-команды и diff checks проверены.
- **Next action:** поддерживать руководства при изменении реализации. DOC-02, TECH-01, TECH-02, TECH-03 и OPS-02 остаются открытыми; закрытие DOC-01 не разрешает deploy или исправление этих задач.
- **Links:** [developer handbook](maintenance-developer.md), [owner handbook](maintenance-owner.md), [scripts](scripts.md), [deployment/recovery](deployment-cloudflare.md), [name review](athlete-name-review.md).

### DATA-03 — Kona 2026: production release

- **Status:** DONE · **Priority:** P1 · **Date:** 12.10.2026.
- **Описание:** Релиз завершён по подтверждению владельца. Production SHA `3861531cac5570765e242e697fcb03dde271dde6`; version `c3f601c7-592a-4e4c-973c-6898c62fdc68`. Kona: 99 результатов (52 MPRO / 47 WPRO, 77 finishers / 22 DNF), 99 links, IDs 4494–4592, SOF men 92.79 / women 96.82. В релиз входят approved country corrections, Policy V2/More и placeholder FH для Franzi. Ranking formula и stable IDs сохранены; рейтинг учитывает новую гонку.
- **Evidence:** preflight release gate 17/17 PASS (30,2 с), targeted snapshot/photo/identity tests 24/24 PASS; preview assets проверены полностью. Владелец подтвердил успешный production release и ручную проверку Telegram Mini App на iPhone — PASS. Production SHA/version в этой записи сообщены владельцем; live-проверки при закрытии документации не выполнялись. Browser gate на финальном target не повторялся; Android не подтверждён.
- **Next action:** обычный monitoring по runbook; TECH-01, TECH-02 и OPS-02 остаются открытыми. Повторный импорт или deploy не требуется этой задачей.
- **Links:** [PTO Kona 2026](https://stats.protriathletes.org/race/im-hawaii/2026/results), [production snapshot](deployment-cloudflare.md#live-production-and-manual-deployment), [canonical workflow](scripts.md#canonical-workflow).

### DATA-04 — Data Source Policy V2 и country corrections

- **Status:** COMPLETED · **Priority:** P1 · **Date:** 2026-10-11.
- **Описание:** PTO → World Triathlon policy и ссылки More; Lara ES, Jeremy US, Nick AU с историческими PTO row evidence. Country conflicts — 0; athlete IDs, 4493 result IDs и рейтинг сохранены. Kona не импортирована; deployment не выполнялся.
- **Evidence:** commit `7738e43fbfdf209a736f244b6e519efe9fbd699c`, pushed в `home-redesign-experiments`; reviewed patch: 39 targeted tests PASS, release gate 17/17 PASS (20,7 с). Full regeneration отдельно FAIL — TECH-01.
- **Next action:** никаких дополнительных country corrections; дальнейший импорт отслеживается в DATA-03.
- **Links:** [provenance](../src/data/athletes/countryEnrichment.json), [policy](scripts.md#data-source-policy), [identity regression tests](../scripts/test-current-athletes.mjs).

## Maintenance rules

1. Читать эту доску перед существенной development/maintenance задачей.
2. Обновлять соответствующую запись при старте работы, блокировке, передаче на review или завершении; указывать конкретный next action и evidence/дату для проверок.
3. Добавлять значимые unresolved issues, найденные аудитами. Различать подтверждённый дефект, гипотезу и UNKNOWN; уже закрытые проблемы не считать открытыми.
4. Держать одну основную задачу в Current Focus отдельно от side tasks. Backlog не означает начало работы.
5. Не удалять открытые записи молча. Закрытую/отменённую задачу переносить в Recently Completed с датой, причиной и evidence; отмена не означает выполненную реализацию.
6. ID стабилен навсегда: префиксы DOC/DATA/TECH/OPS/QA, новый номер после максимального ранее использованного в категории. Не перенумеровывать и не переиспользовать ID после закрытия.
7. У каждой записи сохранять title, status, P0–P3, короткое описание, next action и доступные ссылки. Board entry не разрешает source writes, deploy, remote mutations, сообщения, destructive operations, commit/push: действует отдельный scope/approval владельца.
8. Держать доску краткой; подробные команды, протоколы, credentials и raw personal data сюда не переносить. Ссылаться на canonical docs, не дублировать их. При росте истории согласовать архивирование с сохранением ID и ссылок.
