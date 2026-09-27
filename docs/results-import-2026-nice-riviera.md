# Nice 70.3 Worlds / French Riviera T100 2026 — human review

Импорт 26.09.2026; без commit/push. Все данные — из Stats PTO HTML, без live-fetch frontend.

## Sources and editions

- [2026 Ironman 70.3 World Championship](https://stats.protriathletes.org/race/im-703-world-championship/2026/results). Snapshot SHA-256: `d19c4ae194f7ea106abbb17d068e06b70cc3d1d9e019948cc8c13771c8b6e32f`.
  - `ironman-70-3-world-championship-2026-women`, raceId `ironman-70-3-world-championship`, 2026-09-12, WPRO.
  - `ironman-70-3-world-championship-2026-men`, raceId `ironman-70-3-world-championship`, 2026-09-13, MPRO.
- [2026 EKOÏ French Riviera T100](https://stats.protriathletes.org/race/french-riviera-t100/2026/results). Snapshot SHA-256: `7a85ac8e596e3bb6628a05e062b6bc3abf60c76c77ce187c5747b131f09b684a`.
  - `t100-french-riviera-2026`, raceId `t100-french-riviera`, 2026-09-19, MPRO.

Обе гонки уже существовали: editions/race IDs/dates/дистанции не менялись. Nice — 70.3, women 12 сентября / men 13 сентября; source показывает общую дату события 12 сентября для обеих таблиц. French Riviera — 100 km, MPRO, 19 сентября. URLs уже были в statsPtoRaceUrls.ts, поэтому дублировать/менять registry не потребовалось.

## 2026 Ironman 70.3 World Championship — WOMEN

Rows 50; finishers 48; DNF 2; DNS 0; DSQ 0.

| Place | Athlete (source spelling) | Total |
|---|---|---|
| 1 | Taylor Knibb | 4:19:24 |
| 2 | Julie Derron | 4:23:30 |
| 3 | Alanis Siffert | 4:25:10 |
| 4 | Solveig Løvseth | 4:25:50 |
| 5 | Marjolaine Pierré | 4:26:38 |
| 6 | Laura Philipp | 4:27:28 |
| 7 | Imogen Simmonds | 4:28:01 |
| 8 | Audrey Merle | 4:29:08 |
| 9 | Paula Findlay | 4:30:33 |
| 10 | Caroline Pohle | 4:30:53 |

## 2026 Ironman 70.3 World Championship — MEN

Rows 56; finishers 50; DNF 6; DNS 0; DSQ 0.

| Place | Athlete (source spelling) | Total |
|---|---|---|
| 1 | Hayden Wilde | 3:50:51 |
| 2 | Kristian Blummenfelt | 3:51:09 |
| 3 | Jelle Geens | 3:52:40 |
| 4 | Gustav Iden | 3:53:16 |
| 5 | Lasse Nygaard Priester | 3:54:08 |
| 6 | Casper Stornes | 3:54:23 |
| 7 | Jamie Riddle | 3:54:44 |
| 8 | Jonas Schomburg | 3:55:23 |
| 9 | Samuel Dickinson | 3:55:40 |
| 10 | Michele Bortolamedi | 3:55:51 |

## 2026 EKOÏ French Riviera T100 — MEN

Rows 20; finishers 19; DNF 1; DNS 0; DSQ 0.

| Place | Athlete (source spelling) | Total |
|---|---|---|
| 1 | Hayden Wilde | 3:06:24 |
| 2 | Jelle Geens | 3:06:43 |
| 3 | Kyle Smith | 3:06:48 |
| 4 | Jake Birtwhistle | 3:08:22 |
| 5 | Lasse Nygaard Priester | 3:09:29 |
| 6 | Samuel Dickinson | 3:10:05 |
| 7 | Gregor Payet | 3:10:14 |
| 8 | Menno Koolhaas | 3:10:22 |
| 9 | Antonio Benito López | 3:10:36 |
| 10 | Wilhelm Hirsch | 3:11:25 |

French Riviera WOMEN: **0 / не представлена professional категория**; source содержит только MPRO. Женские результаты не выдумывались.

## Identity and anomalies

120 result rows matched existing profiles; 6 rows created 6 new profiles. Existing names are matched by production normalized exact identity (diacritics/punctuation), never fuzzy auto-merge.

| ID | New source name | Gender | Country |
|---|---|---|---|
| 20010 | Emmanuel Lejeune | M | BE |
| 20011 | Enzo Krauss | M | BR |
| 20012 | Giovanna Alves Opipari | W | BR |
| 20013 | Matheus Menezes | M | BR |
| 20014 | Yago Rodrigues Santos Alves | M | BR |
| 20015 | Yoann Colin | M | AU |

Новые профили созданы existing find-next-athletes pipeline в новом append mode; все прежние IDs и records сохранены. Без Russian localization, photo или фиктивного bio. Unmatched после генерации: 0; duplicate profiles/results: 0.

Source conflicts, без изменения прежних профилей:

- Nick Thompson: catalog US / new source AU.
- Jeremy Maclean: catalog AU / new source US.
- Jamie Riddle: catalog ZAF / source ZA — эквивалентный alias, UI canonicalization уже поддерживается.

Первые два — unresolved country discrepancies, не автоматически исправленные страны. Точные name/gender matches связываются существующим resolver; прежние profile country остаются прежними, новые rows сохраняют source flags. Фактические поля и source athlete URL для каждой строки сохранены в evidence.

Все 9 DNF сохраняют статус и доступные splits; отсутствующие splits/total отсутствуют в объекте. DNS/DSQ в этих источниках отсутствуют; parser regression tests проверяют их отдельно синтетическим изменением test HTML (не production data). Split sum >5 seconds mismatch: 0; источник даёт округление до секунд, значения не пересчитывались. Numeric finish positions contiguous.

## Ranking validation

Production formula не менялась. Один asOf для сравнения: `2026-09-26T12:00:00Z`. Новые гонки уже в прошлом; прибавилось 126 ranking starts, включая DNF; DNS не появилось. По умолчанию calculate/sort используют new Date(), поэтому эти строки автоматически участвуют в runtime ranking.

### TOP-20 MEN after, with before positions/scores

| Athlete | Before | After | Score before | Score after |
|---|---:|---:|---:|---:|
| Hayden Wilde | 1 | 1 | 111.2453 | 125.8851 |
| Kristian Blummenfelt | 2 | 2 | 92.4197 | 94.9674 |
| Jelle Geens | 3 | 3 | 85.6712 | 85.7247 |
| Marten Van Riel | 4 | 4 | 84.0950 | 78.4466 |
| Casper Stornes | 5 | 5 | 77.0474 | 74.0538 |
| Sam Laidlow | 6 | 6 | 65.9033 | 65.9033 |
| Lionel Sanders | 7 | 7 | 60.7295 | 60.7295 |
| Mika Noodt | 8 | 8 | 59.6407 | 59.6407 |
| Matthew Marquardt | 10 | 9 | 55.2303 | 55.2303 |
| Trevor Foley | 12 | 10 | 55.1159 | 55.1159 |
| Rico Bogen | 9 | 11 | 58.7629 | 54.0329 |
| Magnus Ditlev | 13 | 12 | 53.9482 | 53.9482 |
| Sam Long | 14 | 13 | 53.1015 | 53.1015 |
| Lasse Nygaard Priester | 15 | 14 | 49.6401 | 50.2309 |
| Jonas Schomburg | 16 | 15 | 48.6193 | 47.9298 |
| Harry Palmer | 17 | 16 | 45.8761 | 45.8761 |
| Samuel Dickinson | 18 | 17 | 45.8226 | 45.5652 |
| Morgan Pearson | 11 | 18 | 55.2235 | 44.7101 |
| Panagiotis Bitados | 19 | 19 | 41.8591 | 41.8591 |
| Patrick Lange | 20 | 20 | 41.2953 | 41.2953 |

Состав TOP-20 сохранён.

### TOP-20 WOMEN after, with before positions/scores

| Athlete | Before | After | Score before | Score after |
|---|---:|---:|---:|---:|
| Taylor Knibb | 1 | 1 | 108.3263 | 119.0682 |
| Kate Waugh | 2 | 2 | 100.6168 | 100.6168 |
| Julie Derron | 4 | 3 | 88.3037 | 91.5049 |
| Solveig Løvseth | 3 | 4 | 93.0647 | 90.8871 |
| Lucy Charles-Barclay | 6 | 5 | 86.1237 | 86.1237 |
| Laura Philipp | 5 | 6 | 88.0517 | 84.1951 |
| Kat Matthews | 7 | 7 | 80.9316 | 77.4430 |
| Ashleigh Gentle | 8 | 8 | 67.1976 | 67.1976 |
| Georgia Taylor-Brown | 9 | 9 | 62.7850 | 62.7850 |
| Paula Findlay | 10 | 10 | 60.1683 | 58.3469 |
| Alanis Siffert | 15 | 11 | 45.5644 | 50.9159 |
| Lisa Perterer | 11 | 12 | 48.5484 | 48.5484 |
| Imogen Simmonds | 13 | 13 | 46.8212 | 46.9466 |
| Jackie Hering | 12 | 14 | 46.9198 | 46.9198 |
| Hannah Berry | 14 | 15 | 46.4010 | 46.4010 |
| Marjolaine Pierré | 16 | 16 | 44.3370 | 45.2073 |
| Emma Pallant-Browne | 18 | 17 | 42.5427 | 42.5427 |
| Marta Sánchez | 17 | 18 | 43.8631 | 42.4045 |
| Caroline Pohle | 20 | 19 | 41.2390 | 40.7253 |
| Katrine Græsbøll Christensen | 22 | 20 | 40.5463 | 40.5463 |

Exited TOP-20: Ellie Salthouse (before #19, 42.5000).

Полные TOP-20 BEFORE и AFTER: `scripts/fixtures/result-imports/ranking-comparison-2026-09-26.json`.

## Integrity

4367 прежних result rows (включая internal IDs) и 1161 прежних runtime profiles сравнивались deep-equal: без изменений. Добавлено 126 rows и 6 profiles. Source evidence содержит полный HTML + hash + raw cells + athlete URLs + normalized proposal. Global result ID назначается старым механизмом results/index.ts после объединения сезонов.

## Validation and completion

- `node --test scripts/test-race-result-import.mjs scripts/test-ranking.mjs scripts/test-navigation.mjs scripts/test-athlete-search.mjs scripts/test-athlete-country-strength.mjs`: 42/42 passed, включая 9 import tests.
- `npm run audit:results`: 0 errors / 0 warnings.
- `npm run audit:athletes`: 2 прежних issues (missing country: Erik Olsson, Sebastian Schober); новых issues нет. Всего 1167 profiles, 0 без linked results.
- `npm run build`: passed; предупреждение о JS chunk >500 kB.
- `npm run lint`: 0 errors / 1 прежний warning в RaceDetailPage.tsx (useMemo dependencies).
- `git diff --check`: passed.
- Production browser, mobile width 390px: Calendar → Nice WOMEN (50 rows), Nice MEN (56), Riviera MEN (20); winner → Athlete Profile → Back. Новые гонки видны в profile; Back сохраняет results и scroll. Новый generated profile 20012 связан с результатом. Browser errors не обнаружены.
- Ranking formula, race/edition definitions, UI/navigation, localization и photo registry не изменялись.

Country-strength integration test теперь сверяет rendered chips с текущим production calculation вместо фиксированного порядка стран, зависящего от обновляемых результатов. Сама формула strength не менялась.

## Future workflow

Команды preview → explicit write → identity review/append → audits → human review описаны в [import-race-results.md](import-race-results.md). Importer работает только в CLI; frontend не запрашивает live results. Существующие результаты не перезаписываются.

## Git / review status

Работа подготовлена для human review в `home-redesign-experiments`. `git add`, commit и push не выполнялись.

Изменены: package.json; scripts/find-next-athletes.mjs; scripts/test-athlete-country-strength.mjs; src/data/athletes/resultAthletes.generated.ts; src/data/results/index.ts.

Добавлены: scripts/import-race-results.mjs; scripts/parse-stats-pto-results.py; scripts/test-race-result-import.mjs; scripts/fixtures/result-imports/ (два HTML, два JSON evidence, ranking comparison JSON); src/data/results/2026/ironman/nice-world-championship.ts; src/data/results/2026/t100/french-riviera.ts; docs/import-race-results.md; этот отчёт.

Прежние локальные artifacts не изменялись: athlete-audit.txt, ranking.txt, sof.json, docs/product-readiness-audit.md.

Импорт и технические проверки завершены. Два country discrepancies остаются явно нерешёнными; автоматического исправления стран профилей не было. Следующий шаг — human review, затем отдельно разрешённый commit/deploy.

## Final SOF / clock follow-up

[SOF and ranking clock review](results-sof-clock-review.md) confirms SOF was already present before this result import. Earlier ranking tables already include Nice MEN 96.35 / WOMEN 96.18 and Riviera MEN 96.12. The follow-up adds source SOF parsing/proposal/conflict checks and regression tests, compares hypothetical SOF removal and two clock models, and explains Morgan Pearson's two new starts. Production ranking formula/clock, edition data and countries remain unchanged.

## Approved final corrections

See [final corrections](results-final-corrections.md): production now uses the dataset clock; reviewed Nick Thompson AU and Jeremy Maclean US corrections are persisted. Previous unresolved-country statements describe the earlier review stage. Final tests: 50/50 passed. No commit/push.
