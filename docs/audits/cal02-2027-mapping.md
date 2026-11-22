# CAL-02A/B — 2027 calendar integration and identity mapping

Status: locally implemented / owner review, 2026-11-21. No Git publication or deployment.

Base: `b97aad29e0468b6ea4a98449ebb7d97e9de12239`; isolated checkout `/private/tmp/300w-cal02-candidate`, branch `calendar/cal02-2027`.

Approved input: [master](../../data/calendar/2027-master.json), byte-identical to [aabb2ea](https://github.com/shyandrey/tri-app/blob/aabb2ea22c82d1711be50effcb92431e6973acc8/data/calendar/2027-master.json), Git blob `5a42e87cc1c6855c3c7d655e9a077769ee3c4b1b`. Working dates were not replaced by external research.

## Owner identity decisions

- Spain T100 continues across Oropesa 2025, Pamplona 2026 and Marbella 2027: `t100-spain`, new edition `t100-spain-2027`. No `t100-marbella` entity.
- IRONMAN 70.3 Worlds is one competition across Taupō, Marbella, Nice and Chattanooga. 2027 uses `ironman-70-3-world-championship-2027`; historical host-specific IDs remain unchanged and group through explicit presentation aliases. Ordinary Chattanooga 2024 remains separate.
- IRONMAN Worlds uses canonical `ironman-world-championship` for its new 2027 edition; existing Kona/Nice IDs stay intact as presentation aliases. This adds a canonical entity record, not a new competition.
- Edition classification: `regular`, `world_championship_70_3`, `world_championship_ironman`, `continental_championship`, `series_final`. Existing explicit continental championship titles supply the archival designation; no guessed 2027 continental titles. T100 finals are edition designations: Dubai 2024 remains a final and Dubai 2026 remains regular. Finals are not merged into a shared RaceEntity.
- Optional edition city/country overrides entity fallback. World Championship and Spain edition geography is explicit; no mass migration. Calendar and Race Detail use the same edition view.

Owner Spain sources: [PTO Pamplona announcement](https://t100triathlon.com/media-releases/professional-triathletes-organisation-announce-pamplona-new-home-t100-spain/), [Spain participation](https://t100triathlon.com/spain/participate/) (redirects to Marbella). These are identity evidence, not replacements for missing master per-race source URLs.

## Complete mapping

25 events: **16 IRONMAN Pro Series / 8 T100 / 1 Roth**. **19 existing competition identities / 6 new competitions**, plus the canonical IRONMAN Worlds entity record described above. No unresolved identity collisions.

| Race | raceId | 2027 editionId | Historical editions / presentation aliases | Working date/range | Gender | Designation | City / country | Master official URL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| IRONMAN 70.3 Muscat | ironman-70-3-muscat | ironman-70-3-muscat-2027 | Нет — новая identity | 2027-02-06 | WPRO+MPRO | regular | уточняется / уточняется | null — pending |
| IRONMAN New Zealand | ironman-new-zealand | ironman-new-zealand-2027 | ironman-new-zealand-2026 | 2027-03-06 | WPRO+MPRO | regular | Таупо / Новая Зеландия | null — pending |
| IRONMAN 70.3 Geelong | ironman-70-3-geelong | ironman-70-3-geelong-2027 | ironman-70-3-geelong-2025, ironman-70-3-geelong-2026 | 2027-03-21 | WPRO+MPRO | regular | Джилонг / Австралия | null — pending |
| IRONMAN 70.3 Oceanside | ironman-70-3-oceanside | ironman-70-3-oceanside-2027 | ironman-70-3-oceanside-2024, ironman-70-3-oceanside-2025, ironman-70-3-oceanside-2026 | 2027-04-03 | WPRO+MPRO | regular | Оушенсайд / США | null — pending |
| IRONMAN 70.3 Valencia | ironman-70-3-valencia | ironman-70-3-valencia-2027 | Нет — новая identity | 2027-04-18 | WPRO+MPRO | regular | уточняется / уточняется | null — pending |
| IRONMAN Texas | ironman-texas | ironman-texas-2027 | ironman-texas-2024, ironman-texas-2025, ironman-texas-2026 | 2027-04-24 | WPRO+MPRO | regular | Вудлендс / США | null — pending |
| IRONMAN Lanzarote | ironman-lanzarote | ironman-lanzarote-2027 | Нет — новая identity | 2027-05-15 | WPRO+MPRO | regular | уточняется / уточняется | null — pending |
| IRONMAN 70.3 Pennsylvania | ironman-70-3-pennsylvania | ironman-70-3-pennsylvania-2027 | ironman-70-3-pennsylvania-2026 | 2027-05-23 | WPRO+MPRO | regular | Хэппи-Вэлли / США | null — pending |
| IRONMAN 70.3 Tours Métropole | ironman-70-3-tours-metropole | ironman-70-3-tours-metropole-2027 | Нет — новая identity | 2027-06-07 | WPRO+MPRO | regular | уточняется / уточняется | null — pending |
| IRONMAN 70.3 Mont-Tremblant | ironman-70-3-mont-tremblant | ironman-70-3-mont-tremblant-2027 | ironman-70-3-mont-tremblant-2024 | 2027-06-21 | WPRO+MPRO | regular | Мон-Тремблан / Канада | null — pending |
| IRONMAN Frankfurt | ironman-frankfurt | ironman-frankfurt-2027 | ironman-frankfurt-2024, ironman-frankfurt-2025, ironman-frankfurt-2026 | 2027-06-27 | WPRO+MPRO | regular | Франкфурт / Германия | null — pending |
| IRONMAN 70.3 Jönköping | ironman-70-3-jonkoping | ironman-70-3-jonkoping-2027 | Нет — новая identity | 2027-07-11 | WPRO+MPRO | regular | уточняется / уточняется | null — pending |
| IRONMAN Lake Placid | ironman-lake-placid | ironman-lake-placid-2027 | ironman-lake-placid-2024, ironman-lake-placid-2025, ironman-lake-placid-2026 | 2027-07-25 | WPRO+MPRO | regular | Лейк-Плэсид / США | null — pending |
| IRONMAN 70.3 Leipzig | ironman-70-3-leipzig | ironman-70-3-leipzig-2027 | Нет — новая identity | 2027-08-08 | WPRO+MPRO | regular | уточняется / уточняется | null — pending |
| IRONMAN 70.3 World Championship, Chattanooga | ironman-70-3-world-championship | ironman-70-3-world-championship-2027 | ironman-70-3-world-championship-taupo-2024-women, ironman-70-3-world-championship-taupo-2024-men, ironman-70-3-world-championship-marbella-2025-women, ironman-70-3-world-championship-marbella-2025-men, ironman-70-3-world-championship-2026-women, ironman-70-3-world-championship-2026-men | 2027-08-28 … 2027-08-29 | WPRO+MPRO | world_championship_70_3 | Чаттануга / США | null — pending |
| IRONMAN World Championship, Kona | ironman-world-championship | ironman-world-championship-2027 | ironman-world-championship-nice-2024-women, ironman-world-championship-kona-2024-men, ironman-world-championship-nice-2025-men, ironman-world-championship-kona-2025-women, ironman-world-championship-kona-2026 | 2027-10-09 | WPRO+MPRO | world_championship_ironman | Кона / США | null — pending |
| Gold Coast T100 | t100-gold-coast | t100-gold-coast-2027 | t100-gold-coast-2026 | 2027-03-20 … 2027-03-21 | UNKNOWN | regular | Голд-Кост / Австралия | null — pending |
| Singapore T100 | t100-singapore | t100-singapore-2027 | t100-singapore-2024-women, t100-singapore-2024-men, t100-singapore-2025-women, t100-singapore-2025-men, t100-singapore-2026 | 2027-04-10 … 2027-04-11 | UNKNOWN | regular | уточняется / Сингапур | null — pending |
| French Riviera T100 | t100-french-riviera | t100-french-riviera-2027 | t100-french-riviera-2025, t100-french-riviera-2026 | 2027-05-15 … 2027-05-16 | UNKNOWN | regular | Сен-Рафаэль / Франция | null — pending |
| San Francisco T100 | t100-san-francisco | t100-san-francisco-2027 | t100-san-francisco-2024, t100-san-francisco-2025, t100-san-francisco-2026 | 2027-06-05 … 2027-06-06 | UNKNOWN | regular | Сан-Франциско / США | null — pending |
| Vancouver T100 | t100-vancouver | t100-vancouver-2027 | t100-vancouver-2025, t100-vancouver-2026 | 2027-08-14 … 2027-08-15 | UNKNOWN | regular | Ванкувер / Канада | null — pending |
| Marbella T100 | t100-spain | t100-spain-2027 | t100-spain-2025, t100-spain-2026 | 2027-09-18 … 2027-09-19 | UNKNOWN | regular | Марбелья / Испания | null — pending |
| Saudi Arabia T100 | t100-saudi-arabia | t100-saudi-arabia-2027 | t100-saudi-arabia-2026 | 2027-11-26 … 2027-11-27 | UNKNOWN | regular | уточняется / Саудовская Аравия | null — pending |
| Qatar T100 World Championship Final | t100-qatar | t100-qatar-2027 | t100-qatar-2025, t100-qatar-2026 | 2027-12-10 … 2027-12-11 | UNKNOWN | series_final | Лусаил / Катар | null — pending |
| DATEV Challenge Roth | challenge-roth | challenge-roth-2027 | challenge-roth-2024, challenge-roth-2025, challenge-roth-2026 | 2027-07-04 | UNKNOWN | regular | Рот / Германия | null — pending |

## Calendar and uncertainty handling

- Dedicated `calendar2027.ts`; master remains separate provenance with original notes and status fields. Six new competitions have no verified location fields in master: retain empty values and show “Место уточняется”. Existing entities supply location fallback; no inferred countries or new source links.
- Nine event ranges retain start/end and date kind. No gender-specific PRO date is asserted. Upcoming eligibility ends at midnight Moscow after the final event day; range countdown refers to the beginning of the event, not a confirmed PRO start.
- Nine unknown genders remain `UNKNOWN`, rendered as “Категории уточняются”, not ALL. The 16 IRONMAN editions use owner-approved M/W format. No new SOF, results, measurements or PTO URLs are invented.
- Season selector exposes 2024–2027; default remains the available current calendar year. Home combines upcoming 2026/2027, preserving chronological order and M/W pairing. Roth 2027 is visible; historical Roth visibility remains unchanged. No new artwork or pinning.
- All 25 master per-race official URLs are null. Tours June 6/7, Mont-Tremblant June 20/21 and Saudi alternative listing notes are retained for CAL-02D; working dates stay owner-approved.
- Other location labels differ across history: French Riviera “Сен-Рафаэль / Фрежюс” vs “Сен-Рафаэль”; Qatar “Доха / Лусаил” vs “Лусаил”. Not corrected; label differences alone do not verify a venue move.

## Validation

- CAL-02 targeted tests: 9/9; location: 3/3; historical Calendar: 7/7; Moscow boundary: 8/8; Telegram: 8/8; navigation: 10/10; UI regression: 7/7. Total 52 tests PASS.
- Historical Calendar suite now explicitly retains its 2024–2026 fixture scope; new 2027 assertions are separate and include Saudi 2027 without restoring Saudi 2026.
- Full before/after comparison: 87 historical views and editions retain IDs, dates, SOF and all other fields, except approved Spain 2025 display correction and added geography/designation metadata. Results, athlete files, identity mapping and ranking formula are byte-identical to base.
- Results audit: 4633 unique results, 1170 unique athletes, 4633/4633 links, zero errors/warnings; 52 existing documented source anomalies. Audit printed a sandbox HMR-port warning but completed exit 0; data checks completed.
- Build/typecheck PASS. Initial build passed; subsequent checks found the unknown-gender display condition and event-range countdown wording, then final scope review retained historical Home/Roth eligibility and used Moscow year for default season. The final build passed after those corrections. Existing >500 kB chunk warning remains.
- Targeted ESLint and git diff --check PASS.
- Local Chrome smoke PASS at 390/1024 px: 25 cards, range/unknown labels, four-year Worlds group, three-year Spain geography, ordinary Chattanooga isolation, new Telegram link, Calendar Back fallback, Home showcase and no runtime exceptions. Screenshots/logs: `/private/tmp/300w-cal02-browser/` (not tracked).
- Initial smoke found the UNKNOWN label gated on M/W symbol; fixed. Harness expectations were corrected for CSS uppercase and the existing Calendar Back fallback; navigation behavior was not changed.
- No browser gate, publication, deployment, version bump, result import or catalog regeneration.

## Historical checkpoint

Initial mapping stopped at 17 reused / 6 new / 2 unresolved (Spain and Chattanooga). Owner resolved Spain first, then championship identity/classification. Those STOP conditions are now resolved; pending source/date/gender review is retained above.

## Changed-file inventory (22 files)

- `data/calendar/2027-master.json`
- `docs/PROJECT_BOARD.md`
- `docs/audits/cal02-2027-mapping.md`
- `scripts/test-cal02-browser.mjs`
- `scripts/test-cal02.mjs`
- `scripts/test-calendar.mjs`
- `scripts/test-race-location.mjs`
- `src/App.tsx`
- `src/components/HomeShowcase.tsx`
- `src/components/RaceCard.tsx`
- `src/data/archiveIronmanProSeries.ts`
- `src/data/archiveT100.ts`
- `src/data/calendar2027.ts`
- `src/data/raceEditions.ts`
- `src/data/raceEntities.ts`
- `src/pages/CalendarPage.tsx`
- `src/pages/RaceDetailPage.tsx`
- `src/types/Race.ts`
- `src/utils/raceChampionshipGroup.ts`
- `src/utils/raceDate.ts`
- `src/utils/raceGender.ts`
- `src/utils/raceLocation.ts`
