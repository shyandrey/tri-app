# CAL-02C — Dataset completeness and CAL-03 readiness

Read-only implementation audit, 2026-11-21; documentation changes only. Checkout `/private/tmp/300w-cal02-candidate`, branch `calendar/cal02-2027`, base `b97aad29e0468b6ea4a98449ebb7d97e9de12239`. Existing uncommitted CAL-02 changes retained. No live source refresh, build, test suite, browser gate or remote operation in this audit. Prior 52-test/build/browser qualification is historical evidence, not rerun here.

## Summary and matrix legend

25/25 identities/edition IDs resolve and cards/detail use existing renderers. 19 existing competition identities, six new competitions; canonical IRONMAN Worlds entity record is an additional technical record, not a seventh new competition. [Full identity mapping](cal02-2027-mapping.md).

**17/25 have both city and country; 8/25 have incomplete geography** (six missing both, Singapore and Saudi missing city). Singapore country-only presentation is usable but is not a verified city field. Thus 25 cards are technically renderable, 17 geography-complete / 8 geography-incomplete; **0/25 are fully source-verified publication-ready**. These counts do not claim imagery or title approval.

16 genders are owner-approved series-format M/W, not independently per-race verified here. Nine remain UNKNOWN. Nine date ranges retain unknown PRO day. All 25 official per-event URL fields are absent. Approved working dates unchanged. Empty course splits in all 25 are not guessed; current Detail does not display these fields. Results/SOF appropriately absent for future events.

Matrix: IM=IRONMAN Pro Series; T100=Triathlon World Tour; Roth=Challenge. M/W=owner series-format approval; ?=explicit UNKNOWN. C/D=Calendar/Detail renderable. H=eligible by date, subject to chronological top-five limit (not guaranteed display). Every row has URL missing/pending. `reuse?` imagery means existing files, not renewed 2027 venue/license approval. Historical grouping is retained (including Worlds aliases); new races show only their 2027 edition.

| Race / raceId | editionId | Series / distance | Approved start → end | City / country | Gender | URL | C/D readiness | Showcase image | Home |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IRONMAN 70.3 Muscat / `ironman-70-3-muscat` | `ironman-70-3-muscat-2027` | IM / 70.3 | 2027-02-06 → 2027-02-06 | — / — | M/W | — | render; география неполная | нет mapping | H |
| IRONMAN New Zealand / `ironman-new-zealand` | `ironman-new-zealand-2027` | IM / IRONMAN | 2027-03-06 → 2027-03-06 | Таупо / Новая Зеландия | M/W | — | render; география полная | нет mapping | H |
| IRONMAN 70.3 Geelong / `ironman-70-3-geelong` | `ironman-70-3-geelong-2027` | IM / 70.3 | 2027-03-21 → 2027-03-21 | Джилонг / Австралия | M/W | — | render; география полная | нет mapping | H |
| IRONMAN 70.3 Oceanside / `ironman-70-3-oceanside` | `ironman-70-3-oceanside-2027` | IM / 70.3 | 2027-04-03 → 2027-04-03 | Оушенсайд / США | M/W | — | render; география полная | нет mapping | H |
| IRONMAN 70.3 Valencia / `ironman-70-3-valencia` | `ironman-70-3-valencia-2027` | IM / 70.3 | 2027-04-18 → 2027-04-18 | — / — | M/W | — | render; география неполная | нет mapping | H |
| IRONMAN Texas / `ironman-texas` | `ironman-texas-2027` | IM / IRONMAN | 2027-04-24 → 2027-04-24 | Вудлендс / США | M/W | — | render; география полная; title/designation conflict | нет mapping | H |
| IRONMAN Lanzarote / `ironman-lanzarote` | `ironman-lanzarote-2027` | IM / IRONMAN | 2027-05-15 → 2027-05-15 | — / — | M/W | — | render; география неполная | нет mapping | H |
| IRONMAN 70.3 Pennsylvania / `ironman-70-3-pennsylvania` | `ironman-70-3-pennsylvania-2027` | IM / 70.3 | 2027-05-23 → 2027-05-23 | Хэппи-Вэлли / США | M/W | — | render; география полная; title/designation conflict | нет mapping | H |
| IRONMAN 70.3 Tours Métropole / `ironman-70-3-tours-metropole` | `ironman-70-3-tours-metropole-2027` | IM / 70.3 | 2027-06-07 → 2027-06-07 | — / — | M/W | — | render; география неполная | нет mapping | H |
| IRONMAN 70.3 Mont-Tremblant / `ironman-70-3-mont-tremblant` | `ironman-70-3-mont-tremblant-2027` | IM / 70.3 | 2027-06-21 → 2027-06-21 | Мон-Тремблан / Канада | M/W | — | render; география полная | нет mapping | H |
| IRONMAN Frankfurt / `ironman-frankfurt` | `ironman-frankfurt-2027` | IM / IRONMAN | 2027-06-27 → 2027-06-27 | Франкфурт / Германия | M/W | — | render; география полная; title/designation conflict | нет mapping | H |
| IRONMAN 70.3 Jönköping / `ironman-70-3-jonkoping` | `ironman-70-3-jonkoping-2027` | IM / 70.3 | 2027-07-11 → 2027-07-11 | — / — | M/W | — | render; география неполная | нет mapping | H |
| IRONMAN Lake Placid / `ironman-lake-placid` | `ironman-lake-placid-2027` | IM / IRONMAN | 2027-07-25 → 2027-07-25 | Лейк-Плэсид / США | M/W | — | render; география полная | нет mapping | H |
| IRONMAN 70.3 Leipzig / `ironman-70-3-leipzig` | `ironman-70-3-leipzig-2027` | IM / 70.3 | 2027-08-08 → 2027-08-08 | — / — | M/W | — | render; география неполная | нет mapping | H |
| IRONMAN 70.3 World Championship, Chattanooga / `ironman-70-3-world-championship` | `ironman-70-3-world-championship-2027` | IM / 70.3 | 2027-08-28 → 2027-08-29 | Чаттануга / США | M/W | — | render; география полная | WRONG: Nice для Chattanooga | H |
| IRONMAN World Championship, Kona / `ironman-world-championship` | `ironman-world-championship-2027` | IM / IRONMAN | 2027-10-09 → 2027-10-09 | Кона / США | M/W | — | render; география полная | Kona assets есть; mapping отсутствует | H |
| Gold Coast T100 / `t100-gold-coast` | `t100-gold-coast-2027` | T100 / T100 | 2027-03-20 → 2027-03-21 | Голд-Кост / Австралия | ? | — | render; география полная | нет mapping | H |
| Singapore T100 / `t100-singapore` | `t100-singapore-2027` | T100 / T100 | 2027-04-10 → 2027-04-11 | — / Сингапур | ? | — | render; география неполная | нет mapping | H |
| French Riviera T100 / `t100-french-riviera` | `t100-french-riviera-2027` | T100 / T100 | 2027-05-15 → 2027-05-16 | Сен-Рафаэль / Франция | ? | — | render; география полная | reuse? French Riviera | H |
| San Francisco T100 / `t100-san-francisco` | `t100-san-francisco-2027` | T100 / T100 | 2027-06-05 → 2027-06-06 | Сан-Франциско / США | ? | — | render; география полная | нет mapping | H |
| Vancouver T100 / `t100-vancouver` | `t100-vancouver-2027` | T100 / T100 | 2027-08-14 → 2027-08-15 | Ванкувер / Канада | ? | — | render; география полная | нет mapping | H |
| Marbella T100 / `t100-spain` | `t100-spain-2027` | T100 / T100 | 2027-09-18 → 2027-09-19 | Марбелья / Испания | ? | — | render; география полная | нет mapping | H |
| Saudi Arabia T100 / `t100-saudi-arabia` | `t100-saudi-arabia-2027` | T100 / T100 | 2027-11-26 → 2027-11-27 | — / Саудовская Аравия | ? | — | render; география неполная | reuse? Saudi (venue unverified) | H |
| Qatar T100 World Championship Final / `t100-qatar` | `t100-qatar-2027` | T100 / T100 | 2027-12-10 → 2027-12-11 | Лусаил / Катар | ? | — | render; география полная | reuse? Lusail | H |
| DATEV Challenge Roth / `challenge-roth` | `challenge-roth-2027` | Roth / Challenge Roth | 2027-07-04 → 2027-07-04 | Рот / Германия | ? | — | render; география полная | нет mapping | H |

## Race Cards, Detail and imagery

- Calendar cards use shared series logos, not event photos: 16 IM and eight T100 logos available; Roth uses existing “R” fallback. Do not count missing Showcase photos as broken Calendar image requests. Race Detail has no event-photo block.
- Showcase mapping: **21/25 have no mapping; 1/25 maps to a wrong venue; 3/25 have potentially reusable mappings** (French Riviera, Saudi, Qatar). Thus 22 require mapping/content remediation. This is an event count, not a physical-file count. Kona is one of the 21: approved historical local Kona originals/variants exist but canonical `ironman-world-championship` has no mapping. Nice assets must not represent Chattanooga.
- Existing responsive variants use 640/1280/1672 widths. Reuse existing generator; never edit generated registry manually. Preserve old imagery for historic editions. French Riviera/Qatar are plausible reuse candidates; verify 2027 venue and rights/provenance. Saudi venue is unresolved. Do not certify any image solely because its path exists. Six new events, other unpictured T100/IM events and Roth need owner-approved image or deliberate neutral fallback.
- Edition geography resolves correctly for Spain and Worlds; other reuse is fallback to entity, not fresh 2027 location verification. No mass migration needed.
- Classification drives grouping and championship controls; there is no dedicated designation badge in Calendar or Detail. **Texas, Pennsylvania and Frankfurt inherit continental-championship titles while 2027 designation is regular.** Do not infer a 2027 title from old entity name. CAL-03 should support reviewed edition display titles or neutral permanent titles without rewriting historical labels. Sponsor names inherited from historical entities also need editorial review.
- Date ranges display as event dates; Detail warns PRO day is unknown, countdown says event beginning; Showcase says “Даты мероприятия”. UNKNOWN renders “Категории уточняются”. No M/W inference.
- Historical navigation/deep links use existing IDs and explicit Worlds aliases. No edition/result rewrites are required for CAL-03.

## Home Showcase and manual season switch

Current code: `calendarRaceEditions` combines 2026+2027; App filters by end date (or date), Moscow day, sorts by start date, chooses five Showcase/three upcoming cards. It does not check owner approval or season-completion metadata. At 00:00 Moscow after each final event day, the race expires; focus/visibility refresh and midnight timer update Home.

Read-only selection simulation for **2026-11-21**: Qatar 2026 + Muscat, New Zealand, Gold Coast, Geelong 2027. After **2026-12-11**, the first five are Muscat, New Zealand, Gold Coast, Geelong, Oceanside 2027. Thus publishing this candidate before approved switch would expose 2027 immediately, even before Qatar completion. Primary Calendar season defaults to current Moscow year among available seasons: it changes to 2027 on January 1 without a code change. Manual selector also exposes 2027. These are current local code behavior, not changes to deployed Production.

**Explicit season control requires a CAL-03 implementation change.** Recommended minimal reviewed active-season/visible-season policy: Preview may exercise 2027; Production stays pinned to approved 2026 visibility until a separately approved SHA activates 2027. Guard Home and default Calendar together; explicitly review direct-link/search discoverability. Preserve ordinary race-day expiry. Do not use a timer, race completion, CI result, merge or remote auto-toggle as the activation authority. Exact policy and scope require owner review; no implementation in this audit.

## Verification backlog

CAL-02C: obtain official per-race URLs and verification date for all 25; verify city/country for six new races and missing-city cases; review all inherited geography, sponsor/title wording; verify nine UNKNOWN genders and nine PRO-day ranges. Keep approved working dates until an explicit correction. Resolve retained Tours June6/7, Mont-Tremblant June20/21 and Saudi schedule notes through source review. World/Spain owner identity decisions remain authoritative; no need to reopen them merely due missing URL fields.

Official web verification was not performed in this focused local completeness audit. Missing URLs are reported, not invented; no fresh official-calendar claims are made.

## Risks by gate

**BLOCKER for Preview qualification/publication (CAL-04):** wrong Nice→Chattanooga imagery; unresolved CAL-03 card/title/artwork scope and explicit season-control behavior; owner approval of the exact Git candidate and Preview deployment outstanding. Neutral image fallbacks/working dates/UNKNOWN can be reviewed in Preview if explicitly accepted; missing factual data alone need not block local development or an authorized review Preview. Existing local render smoke is not owner Telegram QA.

**BLOCKER for Production:** every applicable Preview issue; explicit Production season gate not implemented; 2026 Qatar results/standings and closure not completed in this task; approved 2027 Preview/Telegram QA not completed; unresolved sources/locations/titles must be verified or explicitly accepted as unknown; separate Deployment Request and explicit Owner Approval absent. No inference of release authorization from existing CAL-02 approval.

**EDITORIAL FOLLOW-UP:** exact PRO days/genders, source links, date conflicts and inherited sponsor/location labels; image provenance/crops/alt presentation; no invented data. OPS-BACKUP-01 stays deferred until completion of the pipeline, not silently marked fixed.

## Recommended CAL-03 scope and acceptance

1. Implement explicit season visibility/activation policy first; test Production-pinned 2026 before/after Qatar and January 1, Preview 2027, and no date-driven promotion.
2. Separate edition-specific imagery from permanent identity; fix Chattanooga, remap Kona, choose reviewed images or neutral fallbacks for missing events. Preserve historical imagery and generated asset workflow.
3. Review 25 edition titles/geography/classification; resolve three title/designation contradictions without inventing titles, add badges only if approved. Keep unknown/date-range disclosure.
4. Targeted tests for selection, aliases, classification, media lookup/fallback and 2026 history; one build and short mobile/desktop smoke, then owner visual review. Existing 2027 season selector is implemented: refine rather than replace.
5. CAL-04 separately authorized Git + one Preview deploy and Telegram QA; T100-2026-FINAL official import/standings; CAL-05 separate request, approval, fresh preflight and one Production deploy. No automatic retry/rollback.

Canonical mandatory request/approval policy: [release runbook](../deployment-cloudflare.md#season-2027--mandatory-manual-production-release-gate). Pipeline: [Project Board](../PROJECT_BOARD.md#season-2027--preparation--release-pipeline).

## Audit validation

Read-only Vite module inspection (no build/server listener): 25 unique editions, series 16/8/1, 8 missing cities / 6 missing countries / 9 UNKNOWN / 9 ranges / 25 missing URLs; mapping and Home selection checks completed. Non-document file hash comparison before/after confirms existing CAL-02 implementation preserved. Local Markdown file-target checks and `git diff --check` PASS. No full tests/browser, rebuild, download, Git publication or deployment.
