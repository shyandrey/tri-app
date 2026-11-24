# CAL-03B2 — Artwork, Roth and Preview readiness

2026-11-22. Local candidate `calendar/cal02-2027`, base `b97aad29e0468b6ea4a98449ebb7d97e9de12239`. CAL-02/CAL-03A/B1 work retained. No publication, deployment, image generation/download or infrastructure operations.

## Artwork decisions and actual coverage

**15 USE APPROVED / 10 NEW / 0 owner-level pending.** Actual coverage: **4 mapped, 11 USE APPROVED / ASSET MISSING, 10 NEW neutral**. Classifications below supersede B1; earlier inventory remains historical evidence. Historical branding/finishers/times, including Kona, are owner-accepted. Saudi reuse does not confirm its 2027 city. Permission to reuse is not independent proof of licensing rights.

Paths in the asset column are existing source files under `src/assets/showcase/`. Each mapped basename has existing derivatives under `src/assets/optimized/showcase/<basename>-{640,1280,1672}.webp`, registered in `src/generated/showcaseImageVariants.ts`. All 10 originals and 30 derivatives decode successfully. Originals are PNG 1672×941; derivatives WebP 640×360, 1280×720, 1672×941. No image bytes changed.

| Race | Exact editionId | Owner decision / actual mapping | Existing asset(s) |
| --- | --- | --- | --- |
| IRONMAN 70.3 Muscat | `ironman-70-3-muscat-2027` | NEW / NEUTRAL | — |
| IRONMAN New Zealand | `ironman-new-zealand-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN 70.3 Geelong | `ironman-70-3-geelong-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN 70.3 Oceanside | `ironman-70-3-oceanside-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN 70.3 Valencia | `ironman-70-3-valencia-2027` | NEW / NEUTRAL | — |
| IRONMAN Texas | `ironman-texas-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN Lanzarote | `ironman-lanzarote-2027` | NEW / NEUTRAL | — |
| IRONMAN 70.3 Pennsylvania | `ironman-70-3-pennsylvania-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN 70.3 Tours Métropole | `ironman-70-3-tours-metropole-2027` | NEW / NEUTRAL | — |
| IRONMAN 70.3 Mont-Tremblant | `ironman-70-3-mont-tremblant-2027` | NEW / NEUTRAL | — |
| IRONMAN Frankfurt | `ironman-frankfurt-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN 70.3 Jönköping | `ironman-70-3-jonkoping-2027` | NEW / NEUTRAL | — |
| IRONMAN Lake Placid | `ironman-lake-placid-2027` | USE APPROVED / ASSET MISSING | — |
| IRONMAN 70.3 Leipzig | `ironman-70-3-leipzig-2027` | NEW / NEUTRAL | — |
| IRONMAN 70.3 World Championship, Chattanooga | `ironman-70-3-world-championship-2027` | NEW / NEUTRAL | — |
| IRONMAN World Championship, Kona | `ironman-world-championship-2027` | USE APPROVED / MAPPED | `kona/kona-bike-lava.png`, `kona/kona-swim-start.png`, `kona/kona-finish-alii.png` |
| Gold Coast T100 | `t100-gold-coast-2027` | USE APPROVED / ASSET MISSING | — |
| Singapore T100 | `t100-singapore-2027` | USE APPROVED / ASSET MISSING | — |
| French Riviera T100 | `t100-french-riviera-2027` | USE APPROVED / MAPPED | `french-riviera/french-riviera-run.png` |
| San Francisco T100 | `t100-san-francisco-2027` | USE APPROVED / ASSET MISSING | — |
| Vancouver T100 | `t100-vancouver-2027` | USE APPROVED / ASSET MISSING | — |
| Marbella T100 | `t100-spain-2027` | NEW / NEUTRAL | — |
| Saudi Arabia T100 | `t100-saudi-arabia-2027` | USE APPROVED / MAPPED | `saudi-arabia/saudi-arabia-seaview.png` |
| Qatar T100 World Championship Final | `t100-qatar-2027` | USE APPROVED / MAPPED | `qatar/qatar-lusail-sunset.png` |
| DATEV Challenge Roth | `challenge-roth-2027` | NEW / NEUTRAL | — |

All 25 pass Home eligibility in their chronological top-five window; normal end-of-event Moscow expiry remains. Four reuse sets load in mobile/desktop smoke; 21 retain the existing neutral gradient. Roth Card retains the neutral R mark until a real image is approved; optional edition resolver support is now connected to the Card's existing thumbnail slot. No new layout is introduced. Historic mappings remain unchanged; Nice cannot resolve for Chattanooga.

**Earliest priorities:** Muscat NEW; New Zealand, Gold Coast, Geelong, Oceanside USE APPROVED / ASSET MISSING. Obtain the intended approved local assets for the latter four before creating replacements. Do not substitute standings illustrations or athlete portraits.

## Ten NEW artwork specifications

Mandatory design contract: [owner-approved Guidelines v1.0](../design/300w-showcase-artwork-guidelines-v1.0.md), [brief template](../design/showcase-artwork-brief-template.md), [technical templates](../design/showcase-templates/index.html) and [validation checklist](../design/showcase-templates/validation-checklist.md). See [10 individual briefs and crop feasibility](../design/2027-artwork-briefs/README.md). Existing Home uses a single source with resolution variants, not orientation art direction. **1672×941 is the existing integration source format, not a universal master requirement**; guideline overscan/master/DPR recommendations and owner final-crop approval take precedence. Existing derivatives are640×360 /1280×720 /1672×941 WebP; encoding settings are starting references, not a new design standard. Listed paths are proposed future destinations, NOT existing files or approved images. Use a verified local source or separately authorized creation/acquisition; none is supplied here.

Showcase uses centered `object-fit: cover`, minimum heights230mobile/245wide. At390px the source loses side content; at1024px it loses substantial top/bottom. A central intersection alone does not guarantee safe anatomy or bicycle geometry. Measure actual critical boxes and UI exclusions across the full guideline portrait/landscape/tablet matrix, both themes, DPR/insets and orientation changes;390/1024 checks alone are insufficient for artwork approval. No automatic art direction exists. Roth also needs a legible square thumbnail in the existing Race Card slot; one source may serve both after crop review.

| Exact editionId | Required verified location/subject | Future source path |
| --- | --- | --- |
| `ironman-70-3-muscat-2027` | Muscat coastal/triathlon landscape; verify actual venue before depicting a course | `src/assets/showcase/2027/ironman-70-3-muscat-2027.png` |
| `ironman-70-3-valencia-2027` | Valencia landscape or verified event scene | `src/assets/showcase/2027/ironman-70-3-valencia-2027.png` |
| `ironman-lanzarote-2027` | Lanzarote volcanic/coastal triathlon scene | `src/assets/showcase/2027/ironman-lanzarote-2027.png` |
| `ironman-70-3-tours-metropole-2027` | Tours Métropole; verify venue/course, not a generic French Riviera image | `src/assets/showcase/2027/ironman-70-3-tours-metropole-2027.png` |
| `ironman-70-3-mont-tremblant-2027` | Mont-Tremblant landscape or verified event scene | `src/assets/showcase/2027/ironman-70-3-mont-tremblant-2027.png` |
| `ironman-70-3-jonkoping-2027` | Jönköping lake/city or verified event scene | `src/assets/showcase/2027/ironman-70-3-jonkoping-2027.png` |
| `ironman-70-3-leipzig-2027` | Leipzig/verified event venue; do not imply an unverified course | `src/assets/showcase/2027/ironman-70-3-leipzig-2027.png` |
| `ironman-70-3-world-championship-2027` | Chattanooga World Championship; never Nice, distinguish regular Chattanooga | `src/assets/showcase/2027/ironman-70-3-world-championship-2027.png` |
| `t100-spain-2027` | Marbella, Spain T100 2027; not Oropesa/Pamplona | `src/assets/showcase/2027/t100-spain-2027.png` |
| `challenge-roth-2027` | Roth, Germany: verified triathlon/event scene suitable for both thumbnail and Showcase | `src/assets/showcase/2027/challenge-roth-2027.png` |

### Safe future import checklist (not executed)

1. Record exact editionId, source URL/local original, creator/license or permission evidence, source checksum, location verification and owner approval. Historical branding is accepted for approved reuse; do not strip it. No fabricated source links or licensing assertions.
2. Use versioned proposed filenames from the individual briefs (superseding the earlier unversioned planning paths below). Decode actual source; verify declared dimensions/metadata against the approved delivery, without imposing1672×941 as a universal master size. Review all final crops with measured UI overlays and Roth thumbnail under the existing checklist. Owner approval must bind final rendered crops and exact revision/hashes; master-only approval is insufficient. Keep rejected/unverified files out of runtime mappings.
3. Reuse the existing `scripts/generate-image-variants.mjs` algorithm/registry conventions. **The current command regenerates showcase, athletes and series assets together**: do not run it blindly in this dirty candidate. In a separate controlled import checkout, add only approved sources, run `node scripts/generate-image-variants.mjs`, compare all unrelated output hashes to the pre-import baseline and STOP on any difference. Review only approved derivatives and the necessary generated showcase registry/image inventory updates. Do not hand-edit generated mappings as a durable substitute. A scoped generator option can be separately implemented if regeneration would change unrelated assets.
4. Bind only exact approved2027 editionIds in `src/data/showcaseImages.ts`. Do not change entity-wide location-specific inheritance. One Roth mapping feeds both Card and Showcase. No fake placeholders.
5. Run image-integrity/edition mapping checks and the guideline portrait/landscape/tablet crop, loading, performance and physical-device acceptance matrix. Review exact diff; Git publication/deployment requires separate owner authorization.

## Challenge Roth and ranking contract

`raceId=challenge-roth`; editions2024–2027 and historical IDs retained. 2027 working date **2027-07-04**, genderUNKNOWN; no fabricated results/splits/SOF. Calendar visibility now includes historic Roth as explicitly approved. Race Detail year navigation, athlete result links and Home eligibility work. Historical result modules and athletes unchanged.

Results by edition: **2024: 79**, **2025: 85**, **2026: 56**, **2027: 0**. All historical rows resolve to existing athletes. Catalog remains1170 athletes /4633 unique Result IDs.

Proprietary TRI Ranking already treats Roth as **Tier A /1.10**; no formula edits. Tests exercise actual2024/2025/2026 finishers with the published place/SOF formula and verify identical full ranking with/without empty2027 editions. Browser checks athlete111 → Roth result → Race Detail. Official Standings remains IRONMAN_PRO_SERIES/T100, with no Challenge selector/data/tab. Future Roth2027 results use the guarded `sports:prepare → sports:plan → approved sports:apply` workflow after official results exist.

## Release profiles and scope boundary

`release:prepare --env preview --season-profile preview2027` now invokes the existing build with `--mode season2027-preview`; Production uses default build/profileproduction2026. Omitted profile is deterministically selected from explicit environment; conflicting profile fails. No clock/hostname/CI decision. Record evidence/season.json, dist/season.json and manifest.season; verify environment/profile/primarySeason every artifact verification. Source-SHA, clean-tree, digests, authorization, rollback and one-upload guards remain.

Two actual local builds used the same `releaseBuildArgs` function as release preparation: production2026 then preview2027, both exit0. A synthetic Preview package verifies successfully; a self-consistent digest with Production season is rejected. No real release package or Wrangler command was run in this dirty uncommitted candidate. **CAL-04 still requires an approved clean Git revision and immutable package qualification.** Old recovery packages without season evidence are intentionally rejected by the new verifier; preserve their original qualified tooling and packages, never retrofit manifests to bypass the guard.

Production remains2026 by default. A separate exact-SHA Deployment Request and explicit Owner Approval are mandatory for any Production2027 switch. Preview QA, dates, Qatar completion, merge or CI never authorize it. Primary-season pinning does not hide2027 from deliberate calendar selection/deep links; any Production catalog exposure belongs in the approved release scope.

## Local validation and limits

- CAL-03B2:11 focused tests PASS (artwork/counts, Roth data/ranking, Calendar/Standings isolation, profile guards, artifact mismatch, all25 Home eligibility).
- Existing CAL-02/CAL-03A/Calendar/manual-release suites:54 tests PASS. Initial combined run also had a failed new test module caused by a wrong import path; fixed and11 new tests passed separately. No full gate.
- Production and Preview builds/typecheck exit0; markersproduction2026/preview2027 recorded. Existing large-chunk warning retained.
- Targeted ESLint and `git diff --check` PASS.
- Chrome390/1024: four image mappings/load/crops, Roth fallback,25 cards, historic Roth results/year tabs and athlete link PASS; no runtime exceptions or console errors. Initial harness incorrectly expected year tabs to mutate hash; corrected to assert existing selected-tab behavior. No application change for this test issue.
- Original assets, athlete/result registries, official standings and ranking formula have no diff. Source master unchanged. No live-device or deployed-environment claim.

Evidence (local, not committed): `/private/tmp/cal03b2-{tests,focused,builds,lint,browser}.log (final lint/browser evidence additionally in `cal03b2-lint-final.log` and `cal03b2-browser-crops.log`)`, `/private/tmp/cal03b2-inventory.json`, `/private/tmp/cal03b2-{production,preview}-season.json`, `/private/tmp/300w-cal03b2-browser/` screenshots/result/Chrome diagnostics.

## Decision

**GO for CAL-04 Preview preparation with declared neutral imagery; not publication/deployment approval.** Artwork complete presentation remains blocked by11 missing reuse assets +10 new sources (including Roth); no owner classification pending. Mobile visual follow-up: the long Qatar Final Showcase title clips at the right edge at390px; image crop/loading passes, but polished UI acceptance requires a scoped text-layout correction. No unrelated title/layout change was made here. Source URL/date-window/gender/geography verification gaps recorded in CAL-02C remain, not resolved by photographs. Independent licensing provenance remains a follow-up. Production promotion additionally requires2026 final data, approved2027 QA and separate manual deployment approval. Prioritize the first five races and Roth; never replace unknown venues or genders based on artwork.

## Changed-file scope for this task (prior CAL-02/CAL-03 work retained)

- Runtime: `src/App.tsx`, `src/components/RaceCard.tsx`, `src/pages/CalendarPage.tsx`, `src/data/showcaseImages.ts`.
- Release tooling: `scripts/release-season.mjs` (new), `scripts/manual-release.mjs`, `scripts/manual-release-artifact.mjs`.
- Targeted tests: `scripts/test-cal03b2.mjs` and `scripts/test-cal03b2-browser.mjs` (new); `scripts/test-manual-release.mjs`, `scripts/test-calendar.mjs`, `scripts/test-cal02.mjs`, `scripts/test-cal03a.mjs` updated for the approved contract.
- Documentation: `docs/PROJECT_BOARD.md`, `docs/deployment-cloudflare.md`, `docs/scripts.md`, `docs/audits/cal03a-season-card-integrity.md`, `docs/audits/cal03b-artwork-inventory.md`, this new report.

All other existing candidate changes belong to the preserved CAL-02/CAL-03 foundation; build/evidence artifacts are ignored or outside the checkout. No Git publication.

## Owner artwork contract addendum — 2026-11-22

[Ten template-based NEW briefs](../design/2027-artwork-briefs/README.md) prepared, including Roth Home/thumbnail. No NEW image/crop approvals claimed. The existing contract governs cinematic photorealism, geography, sporting anatomy/bicycle geometry, safe zones and final-crop-first approval. Composition feasibility remains pending actual sources/critical boxes; high-risk cases and a separate Home art-direction decision are documented. No runtime architecture changes. Earlier functional smoke does not certify NEW artwork or full guideline acceptance.

## CAL-03C — Qatar title follow-up, 2026-11-22

Supersedes the Qatar mobile clipping concern above; earlier evidence retained. Root cause: `.showcase-card__title` was a wrapping flex container but each title part had `white-space: nowrap`. The Qatar part measured357px in280px available at390viewport (335/210 at320,343/265 at375,406/330 at440); the card's intentional `overflow:hidden` cut it off. No line-clamp issue. Worlds also overflowed219/210 at320.

Minimal fix in `src/components/HomeShowcase.css`: normal block heading with inline spans, normal word wrapping and a separating CSS space. Keep existing balanced text, font size, overlays, action placement, card geometry, source text, artwork and season configuration. Merely wrapping separate flex items created excess vertical height at375; the final inline flow fixes both axes. No abbreviations, truncation or renaming. CSS-generated separator carries no factual text; both title parts remain in the DOM.

Validation: `node scripts/test-cal03c-browser.mjs` PASS, exit0, Qatar and IRONMAN70.3 Worlds at320/375/390/440/1024 (10 cases). Asserts complete title text, rendered text bounds, horizontal/vertical containment, no action collision, unchanged230/245px card height, working Race Detail navigation, Qatar image decoded and no browser exceptions/console errors. Existing Production default2026 check retained. Screenshots reviewed with current Qatar artwork; no card geometry or rendering-source changes. Local emulation is not owner device approval.

`npm run build -- --mode season2027-preview` final build/typecheck PASS, exit0; marker remains preview2027/2027. An earlier intermediate wrapping version also built successfully but failed the375px browser layout assertion; final build repeated only because CSS changed. Existing chunk-size warning remains. `npx eslint scripts/test-cal03c-browser.mjs` and `git diff --check` PASS. No full gate or unrelated suites.

Evidence: `/private/tmp/300w-cal03c-before/measurements.json` and screenshots; final `/private/tmp/300w-cal03c-browser/measurements.json`, `result.json`, screenshots and Chrome diagnostics; `/private/tmp/cal03c-after-final.log`, `/private/tmp/cal03c-build-final.log`. Diagnostic first attempt used the wrong Worlds clock; corrected to approved2027-08-28 before baseline completion. No source date edits.

Task changed files: `src/components/HomeShowcase.css`, new `scripts/test-cal03c-browser.mjs`, `docs/PROJECT_BOARD.md`, this report. Existing CAL-02/CAL-03 local changes retained. **GO for CAL-04 preparation**; artwork/source-verification gaps and separate publication/deployment approval requirements remain. No Git publication, deployment, infrastructure or artwork operations.
