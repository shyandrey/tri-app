# 300W maintenance — developer handbook

Status: owner-approved, 2026-10-13. This handbook maps maintenance work to the current repository; it does not authorize writes, commits or deployment. Read [AGENTS](../AGENTS.md) and the [Project Board](PROJECT_BOARD.md) first. DOC-01 is complete following owner review of both handbooks and the practical walkthrough.

## Architecture and authority

React/TypeScript/Vite builds static sports data into assets. Hash navigation is implemented in [Navigation](../src/navigation/Navigation.tsx) and [history](../src/navigation/history.ts). [App](../src/App.tsx) owns the shell; [sports-entry](../src/sports/sports-entry.ts), [loader](../src/sports/loader.ts) and [sports data](../src/sports/data.ts) load sports data asynchronously. Home must not acquire a static dependency on the full athlete/results graph.

The Cloudflare Worker serves assets and APIs. D1 stores News and Feedback, **not the static race/athlete catalog**. Updating race results does not require a D1 migration. Generated build metadata identifies the Git revision, not the cleanliness of an uncommitted checkout.

| Domain | Editable authority | Derived/generated dependencies |
| --- | --- | --- |
| Current races | [races.ts](../src/data/races.ts), [raceIdentity.ts](../src/data/raceIdentity.ts) | [raceEntities.ts](../src/data/raceEntities.ts), [raceEditions.ts](../src/data/raceEditions.ts) derive identities/views; raceEditions also contains explicit SOF metadata |
| Historical editions | [archiveIronmanProSeries.ts](../src/data/archiveIronmanProSeries.ts), [archiveT100.ts](../src/data/archiveT100.ts), [archiveChallengeRoth.ts](../src/data/archiveChallengeRoth.ts) | All-edition views, Calendar, results linkage |
| Results | Reviewed per-race modules under `src/data/results/`, [results index](../src/data/results/index.ts), verified source fixtures | Runtime result IDs, athlete linkage, ranking/dataset clock |
| Athletes | [men.ts](../src/data/athletes/men.ts), [women.ts](../src/data/athletes/women.ts), [verifiedResultAthletes.ts](../src/data/athletes/verifiedResultAthletes.ts); reviewed incremental generator for generated profiles | [catalog assembly](../src/data/athletes/index.ts), `resultAthletes.generated.ts`; never hand-edit generated profiles as an ordinary workflow |
| Names/countries | [localization registry](../src/data/athletes/athleteLocalization.json), [country enrichment](../src/data/athletes/countryEnrichment.json), source profile/result country fields | [localization](../src/data/athletes/localization.ts), normalization and identity matching; enrichment is generator evidence, not a universal runtime override |
| Portraits | Approved local images in `public/athletes/`, reviewed publisher inputs; [photoReview.ts](../src/data/athletes/photoReview.ts) for narrow rejected associations | `athletePhotos.generated.ts`, optimized variants, runtime image delivery |
| Showcase | [showcaseImages.ts](../src/data/showcaseImages.ts), originals in `src/assets/showcase/` | `src/assets/optimized/`, `src/generated/*ImageVariants.ts`, `image-variants.json` |
| Ranking | [athleteRanking.ts](../src/utils/athleteRanking.ts), [rankingDatasetClock.ts](../src/utils/rankingDatasetClock.ts) | Shared sports state; no editable ranking output file |
| Operations | [Wrangler config](../wrangler.jsonc), [package scripts](../package.json) | Worker versions, assets, environment bindings; remote secrets are not source files |

## Operation contracts

Use the validation matrix below for every operation. Record source evidence and before/after invariants, not just a green test count.

### Races, editions, dates, venues and status

Edit the existing record in `races.ts` for the current season; historical edition definitions live in the archive modules. Inspect `RaceEntity` versus `RaceEdition` in [Race.ts](../src/types/Race.ts). A permanent race retains its `raceId`; a year/gender-specific edition has its own edition ID. Inspect `raceIdentity.ts` before allocating a numeric legacy ID: the fallback identity is not approval for a new permanent race. Search existing editions and result references before adding anything.

Dates use `dateISO` plus a human-readable `date`; change both consistently after verification. City/country are event venue fields, not athlete nationality. [raceDate.ts](../src/utils/raceDate.ts) uses the Moscow date; Home, Calendar and Detail make their own date comparisons. There is no general cancellation/postponement status field: do not encode cancellation as a guessed date, deletion or new field without design review.

Dependencies: [CalendarPage](../src/pages/CalendarPage.tsx), [RaceCard](../src/components/RaceCard.tsx), [RaceDetailPage](../src/pages/RaceDetailPage.tsx), result edition links and ranking clock. Preserve historical IDs, genders, distances and source URLs. STOP on unclear edition identity, unsupported status, conflicting dates or result ID movement. A season transition is a separate coordinated change: follow the approved [2027 policy](season-transition-2026-2027.md), not a single constant edit.

### Calendar, cards and Home showcase

Card labels mostly come from race data; change those fields before considering a component edit. RaceCard's single native action, keyboard focus, responsive geometry and Back behavior are invariants. Home selects future races in App and groups them through [homeRacePresentation.ts](../src/utils/homeRacePresentation.ts); adding an image mapping does not pin an event to Home.

Use stable race IDs in `showcaseImages.ts`. Add reviewed originals under `src/assets/showcase/`; keys correspond to unique file basenames. Run `node scripts/generate-image-variants.mjs` only after approval of the image scope. It writes the full optimized asset set and manifests, has no targeted single-image or dry-run mode, and does not delete originals. Review unexpected regenerated bytes. Generated manifests are outputs, not hand-editable registries. Preserve responsive WebP delivery, current/next slide availability, progressive mounting, crops, reduced-motion behavior and the initial sports split. STOP if image rights/identity or a duplicate basename is unresolved.

### Athlete identity, names and country

Use [name review](athlete-name-review.md) for Russian display names. `audit:athlete-names` overwrites the review CSV: never run it over unfinished owner edits. Import defaults to dry-run; `--write` updates only the localization registry after complete validation. Display names do not define identity. Keep athlete ID, `nameEn`, aliases and raw result names stable.

A curated profile country and an explicit historical result country are separate evidence. `countryEnrichment.json` preserves verified generator provenance; editing it alone is not a universal UI update. Generated profile corrections require a reviewed projection/generator plan, not an unexplained hand edit. Follow [Data Source Policy](scripts.md#data-source-policy): PTO first, World Triathlon for missing verified fields; explicit disagreement or ambiguous identity means STOP. Lara/Jeremy/Nick country corrections are resolved; do not resurrect or silently reinterpret those conflicts.

New athletes use reviewed incremental append, documented in [scripts](scripts.md) and [import procedure](import-race-results.md). Preserve all existing IDs and fields; full regeneration remains unsafe because of TECH-01 ID drift even though country conflicts are resolved.

### Photos and editorial profiles

Follow the [photo workflow](../scripts/athlete-photo-import.md) for discovery, staging, visual identity approval and publication. Discovery can nominate sponsor/generic images; confidence is not visual proof. Local photos feed the generated photo registry and responsive variants. No third-party runtime hotlinks and no bulk coverage campaign.

`photoReview.ts` rejects only Franzi ID 172 with `/athletes/franzi-hofmann.png`; the generated registry and original asset remain, while UI shows FH. Do not broaden that rejection to all photos or remove evidence files casually. Run the separate `node --test scripts/test-athlete-photo-review.mjs`; the current release gate does not substitute for this explicit test. Historical photo suites retain old catalog/batch expectations and may fail without a new photo regression; never update them blindly. TECH-02 remains open.

Curated biographies/achievements are in men/women. Preserve exact approved text and delimit paragraphs with `\n\n` where supported. [AthleteDetailPage](../src/pages/AthleteDetailPage.tsx) prefers `bioFacts` when present. Current paragraph splitting and medal-prefix rendering are specialized for Kristian ID 1; other profiles do not automatically gain the same behavior. Olympic text selects the existing SVG laurel. No general persistent editorial override exists for generated profiles: STOP and design that separately rather than editing generated biographies.

### Results imports, corrections and ranking

The canonical workflow and supported flags live in [scripts](scripts.md#canonical-workflow) and [import-race-results](import-race-results.md). Discovery precedes owner approval and writes. The importer implements PTO parsing; the trusted World Triathlon policy does not imply a World Triathlon parser exists.

For corrections, identify a row by edition, athlete identity and existing position/times/splits, not a runtime ID alone. Change only evidenced fields, record URLs/reason/scope, compare all unaffected rows and ranking at the same clock. Missing splits remain missing; DNF/DNS/DSQ must be explicit source statuses.

Runtime result IDs are assigned by final array order (`index + 1`); append new batches after existing data and inspect legacy country backfill effects. The importer alone does not guarantee stable IDs after manual wiring. Capture and compare the complete existing runtime result/profile baseline. Never reimport an already populated edition to fix one field.

Ranking depends on results, SOF/edition metadata and the dataset clock. New results legitimately move rankings; unrelated metadata edits must not change formula or order. DNF/DSQ participate as zero-score starts; DNS does not. Do not replace ranking logic with an external table or regenerate athlete IDs to satisfy a check.

### UI text, News and Feedback

Copy lives in pages/components, not a CMS. Preserve associated accessible names, native button behavior, focus, dark-theme colors and responsive layout. Editing visible copy does not authorize changing routes or payload/error codes. Check mobile and desktop, keyboard and reduced motion.

News and Feedback have separate operational procedures: [News](latest-news.md), [eligibility](news-eligibility.md), [Feedback](feedback.md). Do not edit D1 through a static-data maintenance recipe or send real reports/posts as an implicit test. Public Mini App entry is `@tri_app_bot`; production News/Feedback bot is `@tri_app_prod_bot`. Shared Feedback group messages use explicit APP_ENV markers; News webhooks remain separate.

## Validation matrix

Commands below are real package scripts or direct test files. Run only the checks relevant to the change, then the approved release gate. Tests/build may create local ignored artifacts; they are not all filesystem-read-only.

| Change | Required checks |
| --- | --- |
| Edition/date/cards | `node --test scripts/test-calendar.mjs`; `npm run audit:results`; Calendar/detail/Back visual checks; ranking checks when represented dates change |
| Athlete name/country/linkage | `node --test scripts/test-athlete-names.mjs scripts/test-current-athletes.mjs`; `npm run audit:athletes`; `npm run audit:results`; search/results display review |
| Portrait/rejection | `node --test scripts/test-athlete-photo-review.mjs scripts/test-image-delivery.mjs`; athlete audit; list/detail/results visual review |
| Showcase/images | `node --test scripts/test-image-delivery.mjs`; build then `node --test scripts/test-initial-graph.mjs`; mobile/desktop slide and reduced-motion review |
| Results/ranking | `node --test scripts/test-race-result-import.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs`; both audits; before/after IDs and rankings |
| Editorial/UI | `node --test scripts/test-accessibility.mjs`; relevant browser suite/manual profile check; build/lint |
| Release candidate | `npm run check:release`; `npm run check:release:browser` with browser prerequisites from [scripts](scripts.md); targeted new data/UI review |
| Any local patch | `git diff --check`, inspect exact changed files; `npm run build` and `npm run lint` for code/data changes |

`check:release` includes build/lint and current checks; do not rerun them without reason after a successful unchanged gate. A browser infrastructure failure is not a product PASS. Historical/non-gating failures must retain their actual status. The release policy still contains historical country wording/allowlists; this handbook does not change its code. TECH-01 full-regeneration FAIL is independent of release-gate PASS.

## Publication and recovery

Follow [deployment runbook](deployment-cloudflare.md) for exact targets, binding/secret-name inspection, full asset checks, rollback and D1 recovery. Preview and production need separate authorization. Use the same reviewed clean revision for both. Documentation-only later HEADs do not prove production runs that HEAD.

Existing scripts are `deploy:preview:dry`, `deploy:preview`, `check:preview`, and production equivalents. No generic deploy shortcut exists. Plain scripts take ordinary vars from config; `--keep-vars` is not built into either script and is not needed to preserve secrets. Do not append it automatically. A dry-run builds locally but does not deploy; `npm run preview` serves a local build only.

STOP on wrong SHA, dirty application data, wrong Worker/D1, unexpected secret-name/binding changes, incomplete assets, ambiguous rollback target or failed required checks. Rollback is a separate remote mutation; a Worker rollback does not undo D1 data. Use a verified version preserving all six secrets, and the runbook's isolated recovery procedure for D1. Never restore production backups into preview for a drill. OPS-03 remains untested until an authorized drill supplies evidence.
