# CAL-04A — Release candidate qualification

2026-11-22 · LOCAL ONLY · `/private/tmp/300w-cal02-candidate`, branch `calendar/cal02-2027`, HEAD/base `b97aad29e0468b6ea4a98449ebb7d97e9de12239`. Version1.0.1. All prior CAL-02/CAL-03 changes preserved and uncommitted. No remote ref refresh, Git publication, Cloudflare/D1 operations, package/deploy command or image acquisition performed.

## Decision

**NO-GO for publishing this candidate unchanged.** Functional/build qualification PASS; one source-provenance blocker was found outside the existing test coverage. Artwork gaps alone do not block technical qualification. Publication plan/allowlist below is prepared but must wait for a narrowly scoped correction or verified source evidence and owner authorization.

### Blocker: synthesized 2027 Stats PTO URLs

`normalizeEdition` in `src/data/raceEditions.ts:45` falls back to `getStatsPtoUrl(raceId, year)`. That helper in `src/data/statsPtoRaceUrls.ts:51` interpolates historical slugs with any supplied year. **18 of25 normalized `raceEditions` records acquire2027 `statsPtoUrl` values without verification**, although master `sourceUrl` is null for all25 and `calendar2027.ts` explicitly says no guessed Stats PTO URL. Example: `t100-spain-2027` becomes `https://stats.protriathletes.org/race/spain-t100/2027/results` without source evidence.

This audit has not fetched or validated those endpoints and does not label them official available results. The separate `calendar2027Views`/`allRaceEditionViews` presentation path currently has no such URLs; no SOF/results were created and the current SOF collector reads those views. The defect is an inconsistent/unverified normalized data field, not proof of a live network request or incorrect displayed results.

Recommended next scoped correction: prevent fallback synthesis for unverified2027 editions, retain explicitly verified URLs only, preserve historical URL behavior. Add a regression covering both normalized records and presentation views and verify no2027 SOF/results appear. Do not fix by inventing URLs or accepting a status200 alone. No sports facts or runtime code changed during CAL-04A.

## Integrity results

| Gate | Result / evidence |
| --- | --- |
| Master identity | Byte-identical approved master blob `5a42e87cc1c6855c3c7d655e9a077769ee3c4b1b`, supplied commit `aabb2ea22c82d1711be50effcb92431e6973acc8` |
|25 events |16 IM Pro Series /8 T100 /1 Roth;25 unique2027 edition IDs |
| Race identity |19 reused competition identities /6 new; additional canonical IRONMAN Worlds entity groups existing host aliases without rewriting historical IDs |
| Historical integrity |87 pre2027 views: IDs/raceIds/editionIds/year/date/SOF deeply equal to HEAD baseline.2024–2026 remain selectable |
| Athletes/results |1170 profiles /4633 results; full athlete and linked-result objects deeply equal to HEAD, including stable IDs |
| Ranking |Full ranking object deeply equal to baseline; formula unchanged. Roth2024–2026 contributes Tier A1.10; empty2027 leaves scores unchanged |
| Roth |2024/2025/2026 counts79/85/56;2027 count0. Calendar/Card/Showcase/detail/history/profile links PASS |
| Standings |Official IRONMAN_PRO_SERIES/T100 only; no Challenge selector/data change |
| Future facts |No2027 results, SOF or split measurements; UNKNOWN gender preserved. URL synthesis exception above blocks provenance gate |
| Presentation |Qatar title regression PASS; Nice never inherited by Chattanooga; approved2027 geography overrides and historical grouping preserved |
| Version/infrastructure |package/lock/CHANGELOG, public release metadata, workflows and Wrangler config unchanged;1.0.1 |

Baseline comparison used read-only `git show HEAD:<changed source>` in an isolated Vite module-loader view; no checkout/reset/worktree edits. It evaluated the actual baseline data graph rather than trusting counts alone. Detailed machine-readable results: `/private/tmp/cal04a-data.json`.

## Master → runtime source matrix

Every row's name, series, distance, working date/range and gender mapping matches master exactly; dates not replaced. `MPRO+WPRO` maps to runtime `WPRO+MPRO`;TBD maps toUNKNOWN. Every master `sourceUrl` remains null. **No race-specific2027 official source was independently verified in this task.** Source links and earlier owner decisions in historical audits remain evidence of those limited decisions, not blanket season/date verification.

Geography: `override` means explicit owner-approved edition venue (Spain/Marbella,70.3 Worlds/Chattanooga,IM Worlds/Kona); `fallback` means existing entity geography, **not fresh2027 host confirmation**; `unknown` is unfilled. No country was inferred from a race name. Designations derive from approved championship/final identities; unconfirmed Texas/Pennsylvania/Frankfurt2027 continental titles remain neutral regular.

| EditionId | Name | Working start → end / kind | City / country | Geography basis | Gender | Designation | Official source / normalized PTO URL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ironman-70-3-muscat-2027` | IRONMAN 70.3 Muscat | 2027-02-06 → 2027-02-06 / working_race_date | UNKNOWN / UNKNOWN | unknown | WPRO+MPRO | regular | null / absent |
| `ironman-new-zealand-2027` | IRONMAN New Zealand | 2027-03-06 → 2027-03-06 / working_race_date | Таупо / Новая Зеландия | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-70-3-geelong-2027` | IRONMAN 70.3 Geelong | 2027-03-21 → 2027-03-21 / working_race_date | Джилонг / Австралия | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-70-3-oceanside-2027` | IRONMAN 70.3 Oceanside | 2027-04-03 → 2027-04-03 / working_race_date | Оушенсайд / США | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-70-3-valencia-2027` | IRONMAN 70.3 Valencia | 2027-04-18 → 2027-04-18 / working_race_date | UNKNOWN / UNKNOWN | unknown | WPRO+MPRO | regular | null / absent |
| `ironman-texas-2027` | IRONMAN Texas | 2027-04-24 → 2027-04-24 / working_race_date | Вудлендс / США | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-lanzarote-2027` | IRONMAN Lanzarote | 2027-05-15 → 2027-05-15 / working_race_date | UNKNOWN / UNKNOWN | unknown | WPRO+MPRO | regular | null / absent |
| `ironman-70-3-pennsylvania-2027` | IRONMAN 70.3 Pennsylvania | 2027-05-23 → 2027-05-23 / working_race_date | Хэппи-Вэлли / США | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-70-3-tours-metropole-2027` | IRONMAN 70.3 Tours Métropole | 2027-06-07 → 2027-06-07 / working_race_date | UNKNOWN / UNKNOWN | unknown | WPRO+MPRO | regular | null / absent |
| `ironman-70-3-mont-tremblant-2027` | IRONMAN 70.3 Mont-Tremblant | 2027-06-21 → 2027-06-21 / working_race_date | Мон-Тремблан / Канада | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-frankfurt-2027` | IRONMAN Frankfurt | 2027-06-27 → 2027-06-27 / working_race_date | Франкфурт / Германия | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-70-3-jonkoping-2027` | IRONMAN 70.3 Jönköping | 2027-07-11 → 2027-07-11 / working_race_date | UNKNOWN / UNKNOWN | unknown | WPRO+MPRO | regular | null / absent |
| `ironman-lake-placid-2027` | IRONMAN Lake Placid | 2027-07-25 → 2027-07-25 / working_race_date | Лейк-Плэсид / США | fallback | WPRO+MPRO | regular | null / UNVERIFIED synthesized |
| `ironman-70-3-leipzig-2027` | IRONMAN 70.3 Leipzig | 2027-08-08 → 2027-08-08 / working_race_date | UNKNOWN / UNKNOWN | unknown | WPRO+MPRO | regular | null / absent |
| `ironman-70-3-world-championship-2027` | IRONMAN 70.3 World Championship, Chattanooga | 2027-08-28 → 2027-08-29 / event_weekend_start_placeholder | Чаттануга / США | override | WPRO+MPRO | world_championship_70_3 | null / UNVERIFIED synthesized |
| `ironman-world-championship-2027` | IRONMAN World Championship, Kona | 2027-10-09 → 2027-10-09 / working_race_date | Кона / США | override | WPRO+MPRO | world_championship_ironman | null / absent |
| `t100-gold-coast-2027` | Gold Coast T100 | 2027-03-20 → 2027-03-21 / event_weekend | Голд-Кост / Австралия | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-singapore-2027` | Singapore T100 | 2027-04-10 → 2027-04-11 / event_weekend | UNKNOWN / Сингапур | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-french-riviera-2027` | French Riviera T100 | 2027-05-15 → 2027-05-16 / event_weekend | Сен-Рафаэль / Франция | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-san-francisco-2027` | San Francisco T100 | 2027-06-05 → 2027-06-06 / event_weekend | Сан-Франциско / США | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-vancouver-2027` | Vancouver T100 | 2027-08-14 → 2027-08-15 / event_weekend | Ванкувер / Канада | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-spain-2027` | Marbella T100 | 2027-09-18 → 2027-09-19 / event_weekend | Марбелья / Испания | override | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-saudi-arabia-2027` | Saudi Arabia T100 | 2027-11-26 → 2027-11-27 / event_weekend | UNKNOWN / Саудовская Аравия | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |
| `t100-qatar-2027` | Qatar T100 World Championship Final | 2027-12-10 → 2027-12-11 / event_weekend | Лусаил / Катар | fallback | UNKNOWN | series_final | null / UNVERIFIED synthesized |
| `challenge-roth-2027` | DATEV Challenge Roth | 2027-07-04 → 2027-07-04 / working_race_date | Рот / Германия | fallback | UNKNOWN | regular | null / UNVERIFIED synthesized |

Pending external verification:25 per-race official URLs;9 event ranges without exact PRO days;9 UNKNOWN genders (8T100+Roth);8 absent cities and6 absent countries. Historic fallback hosts require review if2027 venue changes. Working dates are owner-approved for Preview, not falsely promoted to officially verified facts. No automatic sports-data correction was made.

## Final artwork matrix

USE15, NEW10, owner-level classification pending0. Four actual reuse mappings,11 approved uses with no local asset,10 NEW neutral. All25 eligible for their Home top-five chronological window; current empty/future dates do not change the configured primary season. Asset names below resolve existing `src/assets/showcase/<group>/<key>.png` and `src/assets/optimized/showcase/<key>-{640,1280,1672}.webp` through the existing generated registry. Groups: kona, french-riviera, saudi-arabia, qatar. No new asset files or bytes.

| Exact editionId | Decision | Actual mapped key(s) | Fallback / Showcase readiness |
| --- | --- | --- | --- |
| `ironman-70-3-muscat-2027` | NEW | — | Neutral; artwork input required |
| `ironman-new-zealand-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-70-3-geelong-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-70-3-oceanside-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-70-3-valencia-2027` | NEW | — | Neutral; artwork input required |
| `ironman-texas-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-lanzarote-2027` | NEW | — | Neutral; artwork input required |
| `ironman-70-3-pennsylvania-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-70-3-tours-metropole-2027` | NEW | — | Neutral; artwork input required |
| `ironman-70-3-mont-tremblant-2027` | NEW | — | Neutral; artwork input required |
| `ironman-frankfurt-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-70-3-jonkoping-2027` | NEW | — | Neutral; artwork input required |
| `ironman-lake-placid-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `ironman-70-3-leipzig-2027` | NEW | — | Neutral; artwork input required |
| `ironman-70-3-world-championship-2027` | NEW | — | Neutral; artwork input required |
| `ironman-world-championship-2027` | USE APPROVED | `kona-bike-lava`, `kona-swim-start`, `kona-finish-alii` | Mapped; loading/crop functional smoke PASS |
| `t100-gold-coast-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `t100-singapore-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `t100-french-riviera-2027` | USE APPROVED | `french-riviera-run` | Mapped; loading/crop functional smoke PASS |
| `t100-san-francisco-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `t100-vancouver-2027` | USE APPROVED | — | Neutral; ASSET MISSING |
| `t100-spain-2027` | NEW | — | Neutral; artwork input required |
| `t100-saudi-arabia-2027` | USE APPROVED | `saudi-arabia-seaview` | Mapped; loading/crop functional smoke PASS |
| `t100-qatar-2027` | USE APPROVED | `qatar-lusail-sunset` | Mapped; loading/crop functional smoke PASS |
| `challenge-roth-2027` | NEW | — | Neutral; artwork input required |

21 neutral presentations are a visible Preview limitation, **not by themselves a technical blocker**. First-five priority remains MuscatNEW, then missing reuse assets for NZ/Gold Coast/Geelong/Oceanside. Roth requires Home and thumbnail crop approval. Saudi photo does not establish its2027 host city. [Ten briefs](../design/2027-artwork-briefs/README.md) use the existing approved design contract; final-crop/rights/device approval remains outstanding. No new art standard or orientation architecture introduced.

## Consolidated final QA

| Executed check | Result |
| --- | --- |
| `node --test scripts/test-cal02.mjs scripts/test-cal03a.mjs scripts/test-cal03b2.mjs scripts/test-calendar.mjs scripts/test-race-location.mjs scripts/test-manual-release.mjs` | **68/68 PASS**, exit0 |
| Independent master/runtime and HEAD baseline comparison | PASS, exit0; discovered synthesized URLs separately reported, not silently treated as verified |
| `npm run build -- --mode season2027-preview` | PASS build/typecheck, exit0; `{profile:preview2027,primarySeason:2027}` |
| `npm run build` | PASS build/typecheck, exit0; `{profile:production,primarySeason:2026}` |
| Targeted ESLint over32 changed/new TS/TSX/MJS files | PASS, exit0 |
| Consolidated short Chrome smoke390/1024 | PASS, exit0; shared season defaults,25 cards,4 mapped image loads, Roth fallback/history/profile links, Qatar and Worlds text bounds/unchanged heights, navigation, zero runtime/console errors |
| Scope, Markdown link targets and `git diff --check` | PASS |

Smoke combined the existing B2 and C assertions in `/private/tmp/cal04a-browser.mjs` without changing application or historical harnesses; no full browser gate. Historical image bytes/registries unchanged; current image resolver checks are in CAL-03A/B2 tests. Prior full image-metadata audit was not repeated. Browser evidence is local Chrome emulation, not owner Telegram/iPhone acceptance or new artwork final-crop approval. Existing bundle-size warning remains; no new performance claim.

Evidence: `/private/tmp/cal04a-tests.log`, `cal04a-data.log`, `cal04a-data.json`, `cal04a-builds.log`, `cal04a-preview-season.json`, `cal04a-production-season.json`, `cal04a-lint.log`, `cal04a-browser.log`, `cal04a-scope.json`, and `/private/tmp/300w-cal04a-browser/` result/title measurements/screenshots/Chrome diagnostics. No raw evidence or browser profiles included in publication.

## Explicit season / immutable packaging boundary

`releaseSeason` selects Preview2027 only for explicit `--env preview` (optional confirming `--season-profile preview2027`); Production profile is2026. Wrong/missing environment, cross-profile selection and mismatched package season fail closed. `dist/season.json`, evidence/season.json and manifest.season are bound by verification; synthetic artifact mismatch tests PASS, including self-consistent file hashes for the wrong season. Original clean-checkout/exact-SHA/metadata-override/authorization guards preserved.

Builds here are **local qualification only**: generated metadata still embeds base HEAD `b97aad…` while files are dirty. They are not immutable release artifacts and must not be deployed. No package digest/file-count claim for a release package. Never bypass `assertSource` or edit build metadata. After separately authorized publication, use a clean exact merged SHA, pinned Node24.19.0/Wrangler4.142.0, locked dependencies, no overrides, and prepare a fresh immutable package once. `release:prepare` includes an artifact-only Wrangler dry-run; it was NOT invoked here.

Production2026 default pins Home/Calendar default selection, not total catalog invisibility: explicit2027 selection/search/deep links remain available in that build. Production remains untouched and any future catalog exposure needs its own approval. Old recovery packages without season markers remain untouched and require their original qualified recovery tooling. New tooling must not retrofit old digests.

## Exact proposed publication allowlist

**55 files:24 modified +31 new**, including this report. Candidate diff contains no deletions/renames, new binary/artwork files, generated registries, credentials or operational packages. Pattern-based credential review found no private key/token-value matches; names/synthetic token strings in security tests are intentional. Runtime source contains no local filesystem paths. Absolute paths in docs/test harnesses are documented local evidence/defaults, not runtime dependencies. Largest candidate file is the pre-existing Project Board (~135KB); no unintended large asset.

All files below are proposed for an explicitly authorized future commit; do not use `git add .`. The source blocker must first be resolved and this allowlist rechecked if scope changes.

| Status | File | Purpose |
| --- | --- | --- |
| new | `data/calendar/2027-master.json` | Exact owner-approved input/provenance |
| modified | `docs/PROJECT_BOARD.md` | Board / operational and ranking guidance |
| new | `docs/audits/cal02-2027-mapping.md` | Historical/local CAL evidence, mapping or current qualification |
| new | `docs/audits/cal02c-dataset-readiness.md` | Historical/local CAL evidence, mapping or current qualification |
| new | `docs/audits/cal03a-season-card-integrity.md` | Historical/local CAL evidence, mapping or current qualification |
| new | `docs/audits/cal03b-artwork-inventory.md` | Historical/local CAL evidence, mapping or current qualification |
| new | `docs/audits/cal03b2-preview-readiness.md` | Historical/local CAL evidence, mapping or current qualification |
| new | `docs/audits/cal04a-release-candidate-qualification.md` | Historical/local CAL evidence, mapping or current qualification |
| modified | `docs/deployment-cloudflare.md` | Board / operational and ranking guidance |
| new | `docs/design/2027-artwork-briefs/README.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/challenge-roth-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-jonkoping-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-leipzig-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-mont-tremblant-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-muscat-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-tours-metropole-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-valencia-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-70-3-world-championship-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/ironman-lanzarote-2027.md` | Approved-template NEW artwork brief/index; no assets |
| new | `docs/design/2027-artwork-briefs/t100-spain-2027.md` | Approved-template NEW artwork brief/index; no assets |
| modified | `docs/scripts.md` | Board / operational and ranking guidance |
| modified | `scripts/manual-release-artifact.mjs` | Explicit release profile and artifact guards |
| modified | `scripts/manual-release.mjs` | Explicit release profile and artifact guards |
| new | `scripts/release-season.mjs` | Explicit release profile and artifact guards |
| new | `scripts/test-cal02-browser.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-cal02.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-cal03a-browser.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-cal03a.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-cal03b2-browser.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-cal03b2.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-cal03c-browser.mjs` | Focused regression/browser harness; no saved output |
| modified | `scripts/test-calendar.mjs` | Focused regression/browser harness; no saved output |
| modified | `scripts/test-image-delivery.mjs` | Focused regression/browser harness; no saved output |
| modified | `scripts/test-manual-release.mjs` | Focused regression/browser harness; no saved output |
| new | `scripts/test-race-location.mjs` | Focused regression/browser harness; no saved output |
| new | `season.config.json` | Reviewed build-time season control/marker |
| modified | `src/App.tsx` | Calendar/Home/detail presentation, Roth support or title wrapping |
| modified | `src/components/HomeShowcase.css` | Calendar/Home/detail presentation, Roth support or title wrapping |
| modified | `src/components/HomeShowcase.tsx` | Calendar/Home/detail presentation, Roth support or title wrapping |
| modified | `src/components/RaceCard.tsx` | Calendar/Home/detail presentation, Roth support or title wrapping |
| new | `src/config/season.ts` | Reviewed build-time season control/marker |
| modified | `src/data/archiveIronmanProSeries.ts` | 2027 editions/entities, safe artwork or historical geography projection |
| modified | `src/data/archiveT100.ts` | 2027 editions/entities, safe artwork or historical geography projection |
| new | `src/data/calendar2027.ts` | 2027 editions/entities, safe artwork or historical geography projection |
| modified | `src/data/raceEditions.ts` | 2027 editions/entities, safe artwork or historical geography projection |
| modified | `src/data/raceEntities.ts` | 2027 editions/entities, safe artwork or historical geography projection |
| modified | `src/data/showcaseImages.ts` | 2027 editions/entities, safe artwork or historical geography projection |
| modified | `src/pages/CalendarPage.tsx` | Calendar/Home/detail presentation, Roth support or title wrapping |
| modified | `src/pages/RaceDetailPage.tsx` | Calendar/Home/detail presentation, Roth support or title wrapping |
| modified | `src/types/Race.ts` | Edition geography/classification/date/unknown-gender contract |
| modified | `src/utils/raceChampionshipGroup.ts` | Edition geography/classification/date/unknown-gender contract |
| modified | `src/utils/raceDate.ts` | Edition geography/classification/date/unknown-gender contract |
| modified | `src/utils/raceGender.ts` | Edition geography/classification/date/unknown-gender contract |
| new | `src/utils/raceLocation.ts` | Edition geography/classification/date/unknown-gender contract |
| modified | `vite.config.ts` | Reviewed build-time season control/marker |

Excluded: ignored `.generated/`, `dist/`, shared `node_modules` symlink; all `/private/tmp` QA logs/scripts/profiles/screenshots/measurements/packages. The master is intentional source data, not a regenerated catalog. No existing candidates/recovery artifacts removed. Index remains unstaged. Workflow/Cloudflare/package version/public release notes unchanged.

## Proposed next sequence — NOT executed

1. Resolve the18 synthesized URL blocker in a separate scoped local correction; add targeted provenance regression and update this qualification. Retain owner-approved dates and all historical behavior. Review inherited2027 geography and neutral artwork limitations explicitly.
2. Obtain owner authorization for the exact final publication scope. Refresh authoritative `preview` refs; current remote drift has not been checked in this local task. Compare against candidate base; STOP on conflict/unexpected changes. Preserve this original uncommitted candidate, transfer reviewed changes to a clean independent release checkout if needed.
3. Use a dedicated branch, e.g. `release/cal04-2027-preview`; explicitly stage only final allowlisted files, inspect staged diff and digests, create one scoped commit such as `feat: prepare explicit 2027 preview season`. Push only that branch; create one PR into `preview`. Manual-only workflows and branch protection remain unchanged. Do not dispatch Actions or bypass required checks; merge only within explicit owner authorization and record exact merge SHA.
4. With separately authorized clean-revision package qualification, run once:

```sh
npm run release:prepare -- --sha <MERGED_FULL_SHA> --env preview --season-profile preview2027 --package <NEW_ABSOLUTE_PACKAGE> --evidence <NEW_ABSOLUTE_EVIDENCE>
```

Verify exactSHA/version1.0.1, preview2027 marker in artifact/evidence/manifest, complete inventory/digest, packaged Worker/assets and artifact-only dry-run; operational config stays outside immutable package. Record digest after preparation. Reject dirty checkout or artifact drift. Do not reuse these dirty-tree build outputs.
5. A separate Preview deployment authorization must identify exactSHA/digest and scope. Only then fresh `release:preflight` against tri-app-preview, account/bindings/vars/secret names/cron/compatible rollback, disabled Auto Deploy/no competing publisher and environment isolation; use the prepared artifact with exact digest. Read-only `release:qualify` does not authorize deployment.
6. After fresh checks PASS, one authorized `release:deploy` with `--authorize preview:<MERGED_FULL_SHA>`; then `release:smoke` and season-specific read-only live browser/owner Telegram QA. No automatic retry/rollback or Production deployment. Preserve evidence on failure and STOP. Build occurs once at package preparation, never during upload.

Production switch requires2026 final-season completion evidence, approved2027 Preview QA, a separate exact-SHA Deployment Request and explicit Owner Approval. Dates, merge or successful tests do not authorize it. No version bump or public release-text change is part of this candidate.

## CAL-04B correction — 2026-11-22

**Revised decision: GO for owner review and separately authorized Git publication.** The original CAL-04A NO-GO and55-file snapshot above are retained as historical findings; the URL blocker is now resolved locally. This is not Git or deployment authorization.

### Root cause, consumers and guard

`normalizeEdition` used an explicit string or the historical-slug resolver. `getStatsPtoUrl` interpolated2027 even without page evidence. Explicit strings and generated strings had no verification distinction. No2027 verified source exists in the current candidate.

- `getStatsPtoUrl(raceId,2027)` now returns `undefined`, including direct callers with an existing slug. Historical behavior is unchanged; this narrowly scoped change does not redesign URL policy for other years.
- `resolveEditionStatsPtoUrl` preserves the historical explicit-string/fallback behavior for2024–2026. For2027 it accepts only an explicit `statsPtoUrl` plus optional new `RaceEdition.statsPtoVerification = {url, evidenceRef}` with exact matching URL and nonblank evidence reference. It also rejects malformed/non-HTTPS/foreign-host/wrong-year URLs, credentials, query/hash and unexpected ports. Syntax does **not** establish verification.
- The evidence reference must identify independently reviewed race/year/source evidence (source snapshot/report and review), checked by the owner/import reviewer before adding it to an edition. Code checks the binding/reference presence, not the truth of external evidence. No real verification record was invented; positive tests use a clearly synthetic fixture only.
- Both normalizer and direct2027 presentation projection use this resolver. Missing values stay `undefined` under the existing optional URL contract. Calendar master untouched.
- `RaceDetailPage` and `RaceCard` currently do not render Stats PTO links at all; no UI/link rendering code changed. Historical URL references remain data/tooling inputs, not newly introduced clickable UI.
- Consumers: `collect-race-sof.mjs` reads edition views and reports `NO_STATS_PTO_URL` without fetching when absent; `import-race-results.mjs` and `prepare-sports-update.mjs` require exact edition/source equality and reject missing/mismatched URLs. Existing2026 builders still call the historical resolver. No importer/SOF/network operation was executed. Future2027 results ingestion requires verified source evidence first; it must not bypass the guard.

### Before/after and regression evidence

| Check | Result |
| --- | --- |
|2027 normalized URLs | **18 →0**;18 is this audit's baseline, not a business-rule constant |
|2027 presentation URLs |0 →0 across all25 views; no unverified URL remains |
|Historical2024–2026 |All87 edition URL values unchanged, including Roth2024/2025/2026 |
|Non-URL data |Deep comparison against pre-task local snapshot: all presentation views unchanged; all normalized fields except removed2027 URLs unchanged |
|Master |Blob remains `5a42e87cc1c6855c3c7d655e9a077769ee3c4b1b` |
|`node --test scripts/test-cal04b-pto-urls.mjs` |**7/7 PASS**, exit0; includes all25 Race Card/Detail SSR renders, no PTO/undefined/null hrefs, explicit-review positive/negative cases, historical committed-baseline URL comparison |
|`npm run build -- --mode season2027-preview` |One build/typecheck PASS, exit0; existing chunk-size warning unchanged |
|Targeted ESLint (three source files + test), `git diff --check` |PASS |
|Browser |NOT RUN: rendering behavior and all presentation views unchanged; focused SSR checks performed, prior CAL-04A browser qualification retained |

Evidence: `/private/tmp/cal04b-before.json`, `/private/tmp/cal04b-integrity.log`, `/private/tmp/cal04b-tests.log`, `/private/tmp/cal04b-build.log`, `/private/tmp/cal04b-lint.log`. Local evidence is not publication content. No repeated CAL-04A/full suite.

### Updated publication scope and remaining conditions

This correction changes six files: `src/data/statsPtoRaceUrls.ts`, `src/data/raceEditions.ts`, `src/types/Race.ts`, new `scripts/test-cal04b-pto-urls.mjs`, `docs/PROJECT_BOARD.md`, this audit.

The current exact proposed allowlist is the55 paths in the historical CAL-04A table **plus**:

- `src/data/statsPtoRaceUrls.ts` — modified existing resolver with2027 guard.
- `scripts/test-cal04b-pto-urls.mjs` — new focused regression tests.

**57 total:25 modified +32 new.** Other correction files were already allowlisted. Recheck scope and upstream compatibility before any separately authorized publication. No generated/build/evidence files belong in the commit.

Remaining gaps are unchanged:25 official calendar source URLs,9 event ranges awaiting exact PRO days,9 unknown genders,8 missing cities/6 countries and inherited geography review;11 missing approved-reuse assets +10 NEW artwork. These are explicit owner-approved working-calendar/Preview limitations, not falsely verified facts. Future source review must not infer URLs solely from syntax or historical slugs. A clean committed exact revision and immutable package qualification are still required after publication approval. No results/SOF/dates/gender/IDs/ranking/version/master/artwork changes; no Git publication, deployment or infrastructure operations.
