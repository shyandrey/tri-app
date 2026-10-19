# ATH-01/02 — owner review: 14 + 6

Подготовлено 18.10.2026. **Обновление 18.10.2026: владелец одобрил все 20 URL identity mappings**, включая шесть flagged profiles. Решения и дата записаны в [CSV](athlete-pto-profile-url-decisions.csv); подготовлен локальный [mapping registry](../src/data/athletes/ptoProfileMappings.json). AGE/BORN/social не одобрены и не применены. Шесть field-level review flags остаются открытыми. Таблицы и рекомендации ниже сохранены как исходный review; прежние указания PENDING/пустой CSV описывают состояние до этого approval.

Основание: [исторический field dry-run](athlete-pto-pilot-2026-10-18.md), [identity review с hash evidence](athlete-pto-profile-url-review.md), `/tmp/300w-pto-pilot/report.json`. Для всех 20 сверены совпадение hash field/identity reports и исходного HTML, source name, country и canonical. Предыдущий identity stage также проверил уникальное соответствие local ID/name/gender. Сейчас заново прочитаны существующие local age/social поля шести flagged profiles. Новых запросов к PTO/social platforms и field extraction не выполнялось.

**Вывод:** шесть flags — field-level review, а не выявленные identity conflicts. Confidence: согласующиеся cached evidence, достаточно для предложения URL владельцу; не независимое доказательство account ownership. Race-history corroboration не автоматизирована. Текущая доступность URL не проверялась; live identity check обязателен после решения и перед новым field dry-run.

## 14 кандидатов на пакетное URL approval

Для каждой строки: source name + страна + exact canonical совпадают, unresolved identity conflict не найден. Предлагаемое решение — **APPROVE URL only**. Это не blanket approval полей. Отсутствие поля не является конфликтом и ничего не удаляет.

| ID | Атлет / proposed PTO URL | Country PTO = 300W | Field-review оговорка |
|---|---|---|---|
| 3 | [Hayden Wilde](https://stats.protriathletes.org/athlete/hayden-wilde) | NZ | Socials отсутствуют — без удаления existing links; Сохранить существующий Instagram |
| 6 | [Jelle Geens](https://stats.protriathletes.org/athlete/jelle-geens) | BE | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 23 | [Lionel Sanders](https://stats.protriathletes.org/athlete/lionel-sanders) | CA | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 4 | [Mika Noodt](https://stats.protriathletes.org/athlete/mika-noodt) | DE | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 41 | [Vincent Luis](https://stats.protriathletes.org/athlete/vincent-luis) | FR | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 104 | [Taylor Knibb](https://stats.protriathletes.org/athlete/taylor-knibb) | US | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 101 | [Kate Waugh](https://stats.protriathletes.org/athlete/kate-waugh) | GB | Socials отсутствуют — без удаления existing links |
| 102 | [Julie Derron](https://stats.protriathletes.org/athlete/julie-derron) | CH | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 106 | [Solveig Løvseth](https://stats.protriathletes.org/athlete/solveig-loevseth) | NO | AGE/BORN отсутствуют — без заполнения; Socials отсутствуют — без удаления existing links |
| 103 | [Lucy Charles-Barclay](https://stats.protriathletes.org/athlete/lucy-charles-barclay) | GB | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 108 | [Kat Matthews](https://stats.protriathletes.org/athlete/kat-matthews) | GB | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 147 | [Ashleigh Gentle](https://stats.protriathletes.org/athlete/ashleigh-gentle) | AU | Field flags не обнаружены; отдельное согласование полей всё равно нужно |
| 105 | [Georgia Taylor-Brown](https://stats.protriathletes.org/athlete/georgia-taylor-brown) | GB | Socials отсутствуют — без удаления existing links |
| 114 | [Paula Findlay](https://stats.protriathletes.org/athlete/paula-findlay) | CA | Field flags не обнаружены; отдельное согласование полей всё равно нужно |

## Шесть индивидуальных review

| ID | Атлет | Тип вопроса | Рекомендация по URL |
|---|---|---|---|
| 1 | Kristian Blummenfelt | Existing YouTube handle ≠ PTO channel URL; эквивалентность не проверена. | Индивидуальный APPROVE URL; field решения отдельно |
| 7 | Casper Stornes | Instagram href ведёт на пост, не профиль. | Индивидуальный APPROVE URL; field решения отдельно |
| 2 | Marten Van Riel | PTO AGE 33 ≠ competition age 34 по BORN 1992. | Индивидуальный APPROVE URL; field решения отдельно |
| 20 | Matthew Marquardt | LinkedIn вне allowlist; AGE/BORN отсутствуют. | Индивидуальный APPROVE URL; field решения отдельно |
| 10521 | Sam Laidlow | PTO AGE 27 ≠ competition age 28; query/mobile social URL не проходят текущий validator. | Индивидуальный APPROVE URL; field решения отдельно |
| 109 | Laura Philipp | Website использует HTTP, требуется HTTPS. | Индивидуальный APPROVE URL; field решения отдельно |

### 1 — Kristian Blummenfelt

- **Proposed PTO URL:** https://stats.protriathletes.org/athlete/kristian-blummenfelt
- **Identity evidence:** source name `Kristian Blummenfelt`; PTO/local country `NO`; exact canonical match; unique local ID/name/gender checked. No detected identity mismatch in snapshots.
- **PTO AGE / BORN:** `32` / `1994`. Snapshot verification timestamp: `2026-10-18T16:32:35.985327+00:00`.
- **Причина review:** Existing YouTube handle ≠ PTO channel URL; эквивалентность не проверена. Codes: `EXISTING_YOUTUBE_CONFLICT`.
- **Существующие данные / конфликт:** В 300W age=32; Instagram handle `kristianblu`; YouTube handle `kristian.blummenfelt` → `https://www.youtube.com/@kristian.blummenfelt`. Instagram согласуется с PTO; age32 совпадает с расчётом, но legacy age не имеет verification timestamp. PTO YouTube channel и existing handle могут вести на один канал, однако это не проверено; различие URL не доказывает разные аккаунты.
- **Все social hrefs как в PTO (включая отклонённые):**
  - `_social_yt`: https://www.youtube.com/channel/UC3FUifepO8vXHtool8S1Z1g
  - `_social_ig`: https://www.instagram.com/kristianblu/
  - `_social_twitter`: https://twitter.com/kristianblu
- **Рекомендация владельцу:** URL: рекомендован APPROVE. Поля: сохранить existing YouTube; отложить замену до отдельной проверки эквивалентности. AGE32/BORN1994 и Twitter — кандидаты на отдельное field approval; Instagram без изменения.

### 7 — Casper Stornes

- **Proposed PTO URL:** https://stats.protriathletes.org/athlete/casper-stornes
- **Identity evidence:** source name `Casper Stornes`; PTO/local country `NO`; exact canonical match; unique local ID/name/gender checked. No detected identity mismatch in snapshots.
- **PTO AGE / BORN:** `29` / `1997`. Snapshot verification timestamp: `2026-10-18T16:32:35.985327+00:00`.
- **Причина review:** Instagram href ведёт на пост, не профиль. Codes: `INVALID_OR_UNCLASSIFIED_SOCIAL_URL`.
- **Существующие данные / конфликт:** AGE/BORN/socials в local profile отсутствуют; конфликта с existing verified links нет. Это неподходящий тип source URL, не конфликт identity.
- **Все social hrefs как в PTO (включая отклонённые):**
  - `_social_ig`: https://www.instagram.com/p/CTt74xIsIsl/
  - `_social_twitter`: https://twitter.com/CasperStornes
- **Рекомендация владельцу:** URL: рекомендован APPROVE. Поля: исключить Instagram post; не угадывать handle по посту. AGE29/BORN1997 и Twitter — кандидаты на отдельное field approval.

### 2 — Marten Van Riel

- **Proposed PTO URL:** https://stats.protriathletes.org/athlete/marten-van-riel
- **Identity evidence:** source name `Marten Van Riel`; PTO/local country `BE`; exact canonical match; unique local ID/name/gender checked. No detected identity mismatch in snapshots.
- **PTO AGE / BORN:** `33` / `1992`. Snapshot verification timestamp: `2026-10-18T16:32:35.985327+00:00`.
- **Причина review:** PTO AGE 33 ≠ competition age 34 по BORN 1992. Codes: `AGE_BORN_CONFLICT`.
- **Существующие данные / конфликт:** Local age/BORN/socials отсутствуют. Расхождение внутри PTO AGE/BORN относительно принятой формулы, не конфликт с existing 300W value.
- **Все social hrefs как в PTO (включая отклонённые):**
  - `_social_ig`: https://www.instagram.com/martenvanriel/
  - `_social_fb`: https://www.facebook.com/MartenVanRiel
- **Competition-age policy:** `2026 − 1992 = 34`, тогда как raw PTO AGE = `33` (на 1 меньше). Принятая владельцем формула World Triathlon использует календарный год, не день рождения. Разница совместима с иной семантикой/устаревшим AGE, но ни одна причина здесь не доказана. Точную DOB, день/месяц и факт наступления дня рождения не выводим; raw AGE не заменяем вычисленным числом.
- **Рекомендация владельцу:** URL: рекомендован APPROVE. Поля: отдельно согласовать сохранение raw AGE33 и BORN1992 и отображение competition age34. До этого age-field conflict остаётся на review; Instagram/Facebook можно рассматривать отдельно.

### 20 — Matthew Marquardt

- **Proposed PTO URL:** https://stats.protriathletes.org/athlete/matthew-marquardt
- **Identity evidence:** source name `Matthew Marquardt`; PTO/local country `US`; exact canonical match; unique local ID/name/gender checked. No detected identity mismatch in snapshots.
- **PTO AGE / BORN:** `-` / `-`. Snapshot verification timestamp: `2026-10-18T16:32:35.985327+00:00`.
- **Причина review:** LinkedIn вне allowlist; AGE/BORN отсутствуют. Codes: `INVALID_OR_UNCLASSIFIED_SOCIAL_URL`.
- **Существующие данные / конфликт:** Local age/BORN/socials отсутствуют. LinkedIn нельзя автоматически записать как official website только из-за `_social_www`; missing AGE/BORN не являются конфликтом.
- **Все social hrefs как в PTO (включая отклонённые):**
  - `_social_ig`: https://www.instagram.com/matthewdmarquardt/
  - `_social_twitter`: https://twitter.com/MD_Marquardt1
  - `_social_www`: https://www.linkedin.com/in/matthew-d-marquardt/
- **Рекомендация владельцу:** URL: рекомендован APPROVE. Поля: исключить LinkedIn; AGE/BORN оставить missing. Instagram/Twitter — кандидаты на отдельное field approval. Расширение allowlist не предлагается автоматически.

### 10521 — Sam Laidlow

- **Proposed PTO URL:** https://stats.protriathletes.org/athlete/sam-laidlow
- **Identity evidence:** source name `Sam Laidlow`; PTO/local country `FR`; exact canonical match; unique local ID/name/gender checked. No detected identity mismatch in snapshots.
- **PTO AGE / BORN:** `27` / `1998`. Snapshot verification timestamp: `2026-10-18T16:32:35.985327+00:00`.
- **Причина review:** PTO AGE 27 ≠ competition age 28; query/mobile social URL не проходят текущий validator. Codes: `AGE_BORN_CONFLICT`, `INVALID_OR_UNCLASSIFIED_SOCIAL_URL`, `INVALID_OR_UNCLASSIFIED_SOCIAL_URL`.
- **Существующие данные / конфликт:** Local age/BORN/socials отсутствуют. AGE/BORN расходятся относительно формулы. Twitter query `?lang=en` и host `m.facebook.com` отклонены консервативным текущим validator; это не доказательство неверной принадлежности ссылок.
- **Все social hrefs как в PTO (включая отклонённые):**
  - `_social_yt`: https://youtube.com/channel/UCP6EsU9T2RykT1quNR5moeg
  - `_social_ig`: https://www.instagram.com/samlaidlow/
  - `_social_twitter`: https://twitter.com/laidlowsam1?lang=en
  - `_social_fb`: https://m.facebook.com/laidlowsam
  - `_social_www`: https://samlaidlow.com/
- **Competition-age policy:** `2026 − 1998 = 28`, тогда как raw PTO AGE = `27` (на 1 меньше). Принятая владельцем формула World Triathlon использует календарный год, не день рождения. Разница совместима с иной семантикой/устаревшим AGE, но ни одна причина здесь не доказана. Точную DOB, день/месяц и факт наступления дня рождения не выводим; raw AGE не заменяем вычисленным числом.
- **Рекомендация владельцу:** URL: рекомендован APPROVE. Поля: отдельно согласовать raw AGE27/BORN1998 и competition age28. YouTube/Instagram/website — кандидаты; Twitter/Facebook отложить, не переписывать query/host без отдельно согласованной валидации.

### 109 — Laura Philipp

- **Proposed PTO URL:** https://stats.protriathletes.org/athlete/laura-philipp
- **Identity evidence:** source name `Laura Philipp`; PTO/local country `DE`; exact canonical match; unique local ID/name/gender checked. No detected identity mismatch in snapshots.
- **PTO AGE / BORN:** `39` / `1987`. Snapshot verification timestamp: `2026-10-18T16:32:35.985327+00:00`.
- **Причина review:** Website использует HTTP, требуется HTTPS. Codes: `INVALID_OR_UNCLASSIFIED_SOCIAL_URL`.
- **Существующие данные / конфликт:** Local age/BORN/socials отсутствуют. HTTP website нарушает HTTPS-only policy; это не identity conflict.
- **Все social hrefs как в PTO (включая отклонённые):**
  - `_social_yt`: https://www.youtube.com/channel/UCkJ1Sgtqj909kXj_kApY3rA
  - `_social_ig`: https://www.instagram.com/laura_philipp_tri/
  - `_social_www`: http://www.lauraphilipp.de/
- **Рекомендация владельцу:** URL: рекомендован APPROVE. Поля: исключить HTTP website; не заменять протокол на HTTPS без проверки. AGE39/BORN1987 и YouTube/Instagram — кандидаты на отдельное field approval.

## Три независимых решения

1. **URL approval:** можно ответить «APPROVE URL для 14 из batch-таблицы» и отдельно указать APPROVE / REPLACE + URL / SKIP для каждого из шести. Либо заполнить [существующий CSV](athlete-pto-profile-url-decisions.csv). Никакие ячейки не заполнены автоматически.
2. **Field approval:** только после URL review и успешной актуальной identity-проверки — отдельно согласовать AGE/BORN/social proposals, exclusions и unresolved fields. Рекомендации выше не означают разрешения записи. При SKIP атлет исключается из данного импорта; текущие данные сохраняются.
3. **Registry write approval:** отдельное явное разрешение на сохранение URL mappings и/или reviewed field registry. В этой задаче registry не создаётся и не изменяется.

Вариант ответа (шаблон, не решение): `Batch URL: …; 1: …; 7: …; 2: …; 20: …; 10521: …; 109: …; Field approval: …; Registry writes: …`.

## Проверки подготовки

- 20 уникальных IDs; разбиение14+6 полное и без пересечений.
- 20/20 hash match между identity report, field report и cached HTML; identity evidence sufficient, mapping conflicts отсутствуют в snapshot.
- CSV decisions/replacement_url остаются пустыми.
- Приложение, registry, исходные данные и прежние artifacts не изменены. Новых live проверок и тестов application behavior не выполнялось: подготовлен только документ review.
