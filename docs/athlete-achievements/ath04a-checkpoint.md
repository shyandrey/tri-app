# ATH-04A — Batch 1 achievement verification checkpoint

Date: 2026-11-10. Source worktree: `reconcile/performance-20261110`; catalog commit `92ad43414adc1792fc6048ac4f8509f5eca17967`.

**PARTIAL / BLOCKED — source verification, owner review required. No application integration.**

57/57 athletes received a local cohort review (canonical identity, approved biography provenance, linked 2024–2026 results and existing achievement fields). This is **not** a completed external career review. The collection stopped under the requested insufficient-evidence condition. It must not be presented as an exhaustive list of achievements or imported into profiles.

## Checkpoint outcome

- 24 individually sourced official achievements/observations, including one optional PTO ranking observation requiring separate category approval.
- 44 local result candidates await direct official corroboration. The initial local screen found 45 qualifying-looking finishes; Ditlev’s Roth 2024 win was independently verified and is recorded once in the verified list.
- 57 unique canonical athletes; no editorial filename number used as an Athlete ID.
- All 57 approved biography files and all tracked `src/`, `public/` files preserved. No build, regeneration, runtime import or deployment.

## Files and evidence semantics

- [Structured dataset](batch1-achievements.json): verified rows and pending candidates in separate arrays. Every row has a stable key, athlete identity, category, event/season, position or title and proposed Russian wording.
- [Coverage](batch1-coverage.json): full 57-athlete ledger, source biography hash, candidate keys and paragraph references for unfinished historical review.
- [Unresolved cases](unresolved-cases.json): exact exclusions, ambiguities and next verification requirements.
- [Protected baseline](protected-baseline.json): file hashes and the unchanged four Kristian strings. These hashes establish preservation, not the truth of sports claims.
- [Validator](validate.py): reproducible identity/key/source/status/biography/preservation checks; run from this worktree with `python3 docs/athlete-achievements/validate.py`.

`VERIFIED_OFFICIAL` means the linked organizer/federation source explicitly supports the specific claim. It does not mean owner approval of the proposed UI text. Sources were inspected through public web results/pages; full external HTML is not archived. Pages may change. `LOCAL_RESULT_MATCH_OFFICIAL_CORROBORATION_PENDING` means a canonical local result exists, but a generic schedule URL or an uninspected result link was not promoted to official finish evidence. Null/empty official-source fields on pending records are deliberate.

## Confirmed blockers and distinctions

1. **T100 year metadata conflict.** [Organizer page](https://t100triathlon.com/media-releases/wilde-wins-big-in-qatar-securing-the-t100-triathlon-world-title-by-winning-the-qatar-championship-final/) has a 2026 heading/image, while its body describes 2025. [World Triathlon](https://triathlon.org/es/news/dominant-hayden-wilde-scores-first-world-title-with-t100-win-in-qatar) explicitly confirms the 2025 overall title. The dataset includes 2025 from the latter; it does not claim a 2026 title.
2. **Frankfurt 2026 format.** [PTO result](https://stats.protriathletes.org/race/im-germany/2026/results) matches Casper Stornes’s 4:50:23 but labels the event Iron 140.6. The actual shortened format and championship designation still need a direct organizer statement. No distance record is inferred.
3. **Records need more than a winning time.** Roth 2026 media references do not establish a universal ratified record. Laidlow’s overall and Bogen’s bike-record claims are held pending direct evidence. The verified Ditlev 2024 item is explicitly a historical organizer-reported world best, not a claim of a currently standing or universally ratified record.
4. **Career and season coverage is incomplete.** Local 2024–2026 results cannot establish all earlier world podiums. Historical standings finality flags and LIVE 2026 standings cannot establish a season champion. Current rank, final-event place and season championship remain separate.
5. **Optional categories remain separate.** PTO #1 requires a dated observation and ranking system; no inferred duration or year-end claim. Other world/European championships must retain discipline, age class and relay distinction. U23, junior, aquathlon/duathlon and non-triathlon achievements need explicit owner scope review.

The blocker is missing or conflicting evidence, not an athlete identity defect. Existing approved biographies are not rewritten or disputed by this checkpoint. Daniel Bækkegård’s known birth-date discrepancy remains out of scope and unchanged. #010 has no separate biography (Menno is file 045, stable ID 10); Caroline Pohle #041 remains intentionally excluded.

## Counts by category

| Category | Officially verified | Local pending |
|---|---:|---:|
| 1. Olympic medal | 15 | 0 |
| 2. IRONMAN World Championship podium | 0 | 17 |
| 3. IRONMAN 70.3 World Championship podium | 0 | 17 |
| 4. Challenge Roth victory | 3 | 4 |
| 5. IRONMAN European Championship victory | 0 | 6 |
| 6. IRONMAN Pro Series overall champion | 1 | 0 |
| 7. T100/TWT overall champion | 3 | 0 |
| 8. Officially reported record | 1 | 0 |
| 9. Historical PTO World #1 — owner review | 1 | 0 |
| 10. Other World Championship podium — owner review | 0 | 0 |
| 11. Other European Championship victory — owner review | 0 | 0 |

Zero means no verified item in this checkpoint, not no qualifying achievements in the athlete’s career. Categories 10/11 have not completed external verification.

## Complete 57-athlete coverage table

Every row: local review complete; external career review incomplete. “Verified” includes the optional historical ranking observation; “pending” counts local result candidates only, not all biography leads.

| Athlete ID | Canonical English name | Approved Russian name | Verified | Local pending | Biography source |
|---:|---|---|---:|---:|---|
| 104 | Taylor Knibb | Тейлор Книбб | 3 | 4 | [001-taylor-knibb.md](../athlete-bios/approved/001-taylor-knibb.md) |
| 2 | Marten Van Riel | Мартен ван Рил | 1 | 0 | [002-marten-van-riel.md](../athlete-bios/approved/002-marten-van-riel.md) |
| 3 | Hayden Wilde | Хайден Уайлд | 4 | 2 | [003-hayden-wilde.md](../athlete-bios/approved/003-hayden-wilde.md) |
| 4 | Mika Noodt | Мика Нудт | 0 | 0 | [004-mika-noodt.md](../athlete-bios/approved/004-mika-noodt.md) |
| 5 | Rico Bogen | Рико Боген | 0 | 0 | [005-rico-bogen.md](../athlete-bios/approved/005-rico-bogen.md) |
| 6 | Jelle Geens | Йелле Гинс | 0 | 3 | [006-jelle-geens.md](../athlete-bios/approved/006-jelle-geens.md) |
| 7 | Casper Stornes | Каспер Сторнс | 0 | 3 | [007-casper-stornes.md](../athlete-bios/approved/007-casper-stornes.md) |
| 8 | Jonas Schomburg | Йонас Шомбург | 0 | 0 | [008-jonas-schomburg.md](../athlete-bios/approved/008-jonas-schomburg.md) |
| 9 | Samuel Dickinson | Сэмуэль Дикинсон | 1 | 0 | [009-samuel-dickinson.md](../athlete-bios/approved/009-samuel-dickinson.md) |
| 11 | Lasse Nygaard Priester | Лассе Пристер | 0 | 0 | [011-lasse-nygaard-priester.md](../athlete-bios/approved/011-lasse-nygaard-priester.md) |
| 102 | Julie Derron | Жюли Деррон | 1 | 2 | [012-julie-derron.md](../athlete-bios/approved/012-julie-derron.md) |
| 1 | Kristian Blummenfelt | Кристиан Блюмменфельт | 1 | 5 | [013-kristian-blummenfelt.md](../athlete-bios/approved/013-kristian-blummenfelt.md) |
| 109 | Laura Philipp | Лаура Филипп | 0 | 5 | [014-laura-philipp.md](../athlete-bios/approved/014-laura-philipp.md) |
| 106 | Solveig Løvseth | Сольвейг Ловсет | 0 | 2 | [015-solveig-lovseth.md](../athlete-bios/approved/015-solveig-lovseth.md) |
| 103 | Lucy Charles-Barclay | Люси Чарльз | 0 | 1 | [016-lucy-charles-barclay.md](../athlete-bios/approved/016-lucy-charles-barclay.md) |
| 108 | Kat Matthews | Кэт Мэтьюс | 1 | 3 | [017-kat-matthews.md](../athlete-bios/approved/017-kat-matthews.md) |
| 147 | Ashleigh Gentle | Эшли Джентл | 0 | 1 | [018-ashleigh-gentle.md](../athlete-bios/approved/018-ashleigh-gentle.md) |
| 105 | Georgia Taylor-Brown | Джорджия Тейлор-Браун | 3 | 0 | [019-georgia-taylor-brown.md](../athlete-bios/approved/019-georgia-taylor-brown.md) |
| 23 | Lionel Sanders | Лайонел Сандерс | 0 | 0 | [020-lionel-sanders.md](../athlete-bios/approved/020-lionel-sanders.md) |
| 20 | Matthew Marquardt | Мэттью Марквардт | 0 | 1 | [021-matthew-marquardt.md](../athlete-bios/approved/021-matthew-marquardt.md) |
| 41 | Vincent Luis | Венсан Луис | 1 | 1 | [022-vincent-luis.md](../athlete-bios/approved/022-vincent-luis.md) |
| 10521 | Sam Laidlow | Сэм Лэйдлоу | 0 | 2 | [023-sam-laidlow.md](../athlete-bios/approved/023-sam-laidlow.md) |
| 114 | Paula Findlay | Пола Финдли | 0 | 0 | [024-paula-findlay.md](../athlete-bios/approved/024-paula-findlay.md) |
| 22 | Sam Long | Сэм Лонг | 0 | 0 | [025-sam-long.md](../athlete-bios/approved/025-sam-long.md) |
| 111 | Alanis Siffert | Аланис Сифферт | 0 | 2 | [026-alanis-siffert.md](../athlete-bios/approved/026-alanis-siffert.md) |
| 39 | Trevor Foley | Тревор Фоули | 0 | 0 | [027-trevor-foley.md](../athlete-bios/approved/027-trevor-foley.md) |
| 119 | Lisa Perterer | Лиза Пертерер | 0 | 0 | [028-lisa-perterer.md](../athlete-bios/approved/028-lisa-perterer.md) |
| 25 | Gustav Iden | Густав Иден | 0 | 2 | [029-gustav-iden.md](../athlete-bios/approved/029-gustav-iden.md) |
| 21 | Magnus Ditlev | Магнус Дитлев | 4 | 1 | [030-magnus-ditlev.md](../athlete-bios/approved/030-magnus-ditlev.md) |
| 112 | Imogen Simmonds | Имоджен Симмондс | 0 | 0 | [031-imogen-simmonds.md](../athlete-bios/approved/031-imogen-simmonds.md) |
| 113 | Hannah Berry | Ханна Берри | 0 | 0 | [032-hannah-berry.md](../athlete-bios/approved/032-hannah-berry.md) |
| 10185 | Harry Palmer | Гарри Палмер | 0 | 0 | [033-harry-palmer.md](../athlete-bios/approved/033-harry-palmer.md) |
| 138 | Jackie Hering | Джеки Херинг | 0 | 1 | [034-jackie-hering.md](../athlete-bios/approved/034-jackie-hering.md) |
| 15 | Morgan Pearson | Морган Пирсон | 2 | 0 | [035-morgan-pearson.md](../athlete-bios/approved/035-morgan-pearson.md) |
| 10736 | Emma Pallant-Browne | Эмма Паллант-Браун | 0 | 0 | [036-emma-pallant-browne.md](../athlete-bios/approved/036-emma-pallant-browne.md) |
| 16 | Gregory Barnaby | Грегори Барнаби | 0 | 0 | [037-gregory-barnaby.md](../athlete-bios/approved/037-gregory-barnaby.md) |
| 10458 | Panagiotis Bitados | Панайотис Битадос | 0 | 0 | [038-panagiotis-bitados.md](../athlete-bios/approved/038-panagiotis-bitados.md) |
| 130 | Marta Sánchez | Марта Санчес | 0 | 0 | [039-marta-sanchez.md](../athlete-bios/approved/039-marta-sanchez.md) |
| 120 | Marjolaine Pierré | Маржолейн Пьер | 0 | 0 | [040-marjolaine-pierre.md](../athlete-bios/approved/040-marjolaine-pierre.md) |
| 13 | Mathis Margirier | Матисс Маржирье | 0 | 0 | [042-mathis-margirier.md](../athlete-bios/approved/042-mathis-margirier.md) |
| 107 | Jessica Learmonth | Джессика Лермонт | 1 | 0 | [043-jessica-learmonth.md](../athlete-bios/approved/043-jessica-learmonth.md) |
| 129 | Grace Thek | Грейс Тек | 0 | 0 | [044-grace-thek.md](../athlete-bios/approved/044-grace-thek.md) |
| 10 | Menno Koolhaas | Менно Куулхас | 0 | 0 | [045-menno-koolhaas.md](../athlete-bios/approved/045-menno-koolhaas.md) |
| 42 | Léo Bergère | Лео Берже | 1 | 1 | [046-leo-bergere.md](../athlete-bios/approved/046-leo-bergere.md) |
| 24 | Patrick Lange | Патрик Ланге | 0 | 1 | [047-patrick-lange.md](../athlete-bios/approved/047-patrick-lange.md) |
| 122 | Lotte Wilms | Лотте Вилмс | 0 | 0 | [048-lotte-wilms.md](../athlete-bios/approved/048-lotte-wilms.md) |
| 131 | India Lee | Индия Ли | 0 | 0 | [049-india-lee.md](../athlete-bios/approved/049-india-lee.md) |
| 35 | Kristian Høgenhaug | Кристиан Хогенхауг | 0 | 0 | [050-kristian-hogenhaug.md](../athlete-bios/approved/050-kristian-hogenhaug.md) |
| 14 | Jason West | Джейсон Уэст | 0 | 0 | [051-jason-west.md](../athlete-bios/approved/051-jason-west.md) |
| 44 | Antonio Benito López | Антонио Бенито Лопес | 0 | 0 | [052-antonio-benito-lopez.md](../athlete-bios/approved/052-antonio-benito-lopez.md) |
| 49 | Matt Hanson | Мэтт Хансон | 0 | 0 | [053-matt-hanson.md](../athlete-bios/approved/053-matt-hanson.md) |
| 146 | Els Visser | Элс Виссер | 0 | 0 | [054-els-visser.md](../athlete-bios/approved/054-els-visser.md) |
| 34 | Frederic Funk | Фредерик Функ | 0 | 0 | [055-frederic-funk.md](../athlete-bios/approved/055-frederic-funk.md) |
| 116 | Sara Pérez Sala | Сара Перес | 0 | 0 | [056-sara-perez.md](../athlete-bios/approved/056-sara-perez.md) |
| 37 | Cameron Wurf | Кэмерон Вурф | 0 | 0 | [057-cameron-wurf.md](../athlete-bios/approved/057-cameron-wurf.md) |
| 10701 | Chelsea Sodaro | Челси Содаро | 0 | 1 | [058-chelsea-sodaro.md](../athlete-bios/approved/058-chelsea-sodaro.md) |
| 28 | Daniel Bækkegård | Даниэль Беккегард | 0 | 0 | [059-daniel-baekkegaard.md](../athlete-bios/approved/059-daniel-baekkegaard.md) |

## Existing Kristian UI reference

The following existing values are preserved, not replaced by generated strings:

```json
[
  "Олимпийский чемпион — Токио-2020.",
  "🥇 Чемпион мира IRONMAN — сезон 2021 (Сент-Джордж, май 2022 года).",
  "🥇 Чемпион мира IRONMAN 70.3 — 2022.",
  "🏆 Победитель IRONMAN Pro Series — 2025."
]
```

Olympic event year and branded edition year are separate fields: Tokyo-2020 actually took place in 2021. A future St George IRONMAN entry must use eventYear 2022 and season 2021, unlike the separate 2022 70.3 championship.

## Validation and delivery

See [validation results](validation-results.txt) for commands actually run. The task is documentation/data collection only. Build, full unit suite and release gate were not rerun; no runtime/test contracts or generated athlete files changed. No claim of build/gate PASS is made for this task.

No integration is authorized by this dataset. To resume, obtain direct official championship/record evidence for the blocked cases, complete the historical review per athlete, resolve remaining source disagreements and review the optional categories/Russian strings. Do not replace unknown evidence with biography assertions, current standings or inferred records.

The local checkpoint commit contains only this documentation/data and the scoped Project Board status update. No push, PR, merge or deployment.
