# v1.0.0 readiness и athlete enrichment roadmap

Аудит 18.10.2026, HEAD `e8a3dba1de13ab5e75964ce9c2ff9dd3e3a49745`. Документ — план, не разрешение изменять данные или выпускать релиз. Версия остаётся **0.0.0**. Старый untracked `docs/product-readiness-audit.md` от 26.09.2026 сохранён без изменений.

## Решение и границы evidence

**CONDITIONAL GO для подготовки release candidate; публичный v1.0.0 ещё не готов к объявлению.** Подтверждённых текущих P0/crash/data-corruption blockers не найдено в выполненных проверках. Это не полная security certification и не глобальная проверка доступности.

- **Проверено сейчас:** `npm run check:release` PASS, 18 checks, 21,6 с; build/ESLint, versioning, Foundation, Calendar, catalog, athlete/results audits, ranking, navigation, News, Feedback mocks, accessibility. Errors/known audit issues: 0. Full-regeneration и historical photo suites этим gate не запускаются.
- **Проверено live сейчас:** Production и Preview health SHA = HEAD, version 0.0.0; по 8 secret names, ожидаемые vars/DB/limiter/cron/ASSETS; News по 3 записи, Feedback protected. Production deployment `0c4b63a7-7620-499e-9020-031a281cfcae`, version `07f4cdab-00dd-41e6-b90b-b2bdd2cb5a76`; Preview deployment `4080455f-e630-4fa0-a805-c95cb35b3a86`, version `6b51006d-3ef9-4e09-8ed9-ca6d588677df`. Окружения используют разные D1 UUID.
- **Предшествующая проверка той же сессии/того же SHA:** Production Feedback 4 sent, pending/failed/retryable/leases=0; опубликованный Calendar browser suite PASS на 320/390/844/1440 px. В этом аудите очередь повторно не опрашивалась. Full browser gate целиком сегодня не запускался.
- **Owner-reported:** iPhone Mini App core/Feedback E2E, public /start /app /help и Production button ранее PASS; seasonal Preview UI одобрен. Это не свежий полный device E2E будущего release SHA.
- **UNKNOWN:** реальный Android; свежий Telegram getWebhookInfo (токены не использовались); глобальная доступность custom domains; практический D1 restore drill. Secret presence не доказывает валидность значений.

## Блокеры, риски и scope

| Item | Классификация и решение перед v1.0.0 |
|---|---|
| REL-01, P1 | Release-process blocker: пока 0.0.0 и только Unreleased. Нужны approved notes/version, release SHA, Preview review, Production verification и annotated tag по [versioning](versioning.md). Не объявлять текущий deployment версией 1.0.0. |
| QA-01, P1 | Не подтверждён Android Telegram E2E. Для общего публичного запуска рекомендован обязательный device test; ограниченный запуск без Android — только явно принятое владельцем исключение. |
| OPS-02, P1 | Подтверждены исторические partial asset transfers на отдельных сетях; причина UNKNOWN. Рабочий iPhone и browser PASS не доказывают доступность аудитории. До launch проверить representative mobile networks и зафиксировать residual risk/решение владельца. |
| TECH-01, P1 | Подтверждённый maintenance defect: full regeneration сдвигает athlete IDs. Не блокирует использование текущего audited snapshot при запрете write regeneration; блокирует такой способ enrichment/import. |
| TECH-02, P1 | Подтверждённый риск photo pipeline: non-portrait кандидаты. Franzi исправлена; без массового enrichment и с visual review это ограничение, не требование заполнить все фото. |
| TECH-03, P2 | Runtime result IDs зависят от array order. Только incremental append с baseline comparison; не менять формулу ranking. |
| BOT-03/BOT-04, P2 | Legacy Preview News receiver и временная Observability требуют отдельного решения. Invocation logs/traces/issues выключены; не включать raw payload logging. Не считать отсутствие новых инцидентов устранением риска. |
| DOC-02, P2 | Gate содержит obsolete country-conflict wording/allowlist. Сейчас conflicts=0; не возвращать Jeremy/Nick в открытые data defects. `test-athlete-photo-review.mjs` и `test-telegram-commands.mjs` не входят в основной releaseChecks. Запускать отдельно до релиза. |
| Sparse athlete enrichment | Coverage, не блокер каталога: placeholders/пустые optional sections допустимы; нужна верификация существующих age/social fields, но нет evidence, что они неверны. |
| Accepted limitations | Неполная RU локализация/фото; native Telegram splash tint; «Таблицы и очки — Скоро»; не обещать эти функции в v1.0.0. Telegram sendMessage не exactly-once: ambiguous retry может дублировать уведомление, не D1 report. |

Старый audit не переписывается: его P0 build сейчас не воспроизводится (build PASS); фиктивный Top ranking screen отсутствует в актуальной архитектуре — `src/sports/data.ts` использует реальный ranking. Основные карточки получили native button targets и accessibility tests. Не переносить старые P1 автоматически; окончательный device/browser review всё равно нужен. More и Calendar empty flows также изменены после этого audit.

## Архитектура и фактическое покрытие атлетов

Источники: [Athlete type](../src/types/Athlete.ts), [runtime catalog](../src/data/athletes/index.ts), [profile UI](../src/pages/AthleteDetailPage.tsx), [sports data](../src/sports/data.ts).

| Поле | Сейчас | Заполнено / 1167 | Отсутствует |
|---|---|---:|---:|
| socialLinks.instagram | handle, не полный URL; UI строит instagram.com URL | 2 | 1165 |
| socialLinks.youtube | handle; UI строит youtube.com/@ URL | 1 | 1166 |
| age | optional фиксированное число, не вычисляется | 2 | 1165 |
| birthDate | поля в схеме нет | 0 | 1167 |
| bio | optional string | 1 | 1166 |
| bioFacts | optional string[]; при наличии приоритет над bio | 0 | 1167 |
| achievements | обязательный string[], пустой допустим | 1 профиль / 4 пункта | 1166 профилей |
| image | effective runtime mapping после photoReview | 221 | 946 |

Числа получены read-only Vite SSR загрузкой runtime catalog, без записи data. Заполненность не равна независимой проверке источника. age/socialLinks есть у Kristian (ID 1) и Hayden (ID 3); bio/4 achievements — только у Kristian. Их значения сейчас не менялись и внешне заново не проверялись.

Каталог: 200 curated + 967 generated/verified profiles. Audit: 230 generated English-only names, 6 code-like country labels, 1 missing countryCode, 0 profiles without result links, 0 country conflicts. Эти coverage INFO не превращать в выдуманные значения. Results audit PASS; documented source time/split anomalies остаются, не исправлять арифметически.

- `men.ts`/`women.ts` — curated/editorial данные; `createAthlete.ts` создаёт пустые achievements. `resultAthletes.generated.ts` и `verifiedResultAthletes.ts` участвуют в общем runtime catalog.
- `index.ts` объединяет данные, применяет photo registry + `photoReview.ts`, затем localization. `athleteLocalization.json` keyed by exact English name; country normalization в `localization.ts`; country provenance хранится отдельно в `countryEnrichment.json`.
- Результаты — статические TS modules, importer/discovery связывает identity; результаты не содержат verified DOB/social/bio. Автоматического поддерживаемого importer для новых editorial полей нет. Discovery может создавать пустые bio/achievements; ручные правки generated output нельзя считать устойчивыми к regeneration.
- Profile UI скрывает отсутствующие social/bio/achievements. Возраст — статическое поле с RU pluralization. Bio paragraphs специально разделяются для ID 1; общий paragraph renderer пока не реализован. Achievement icons определяются текстовыми эвристиками и отдельной веткой ID 1.
- Athlete/results data не в D1: для предложенного статического enrichment D1 migration не нужна. ATH-02 и structured editorial metadata потребуют отдельного TS schema/loader/test review, не DB migration.

## Общий proposed workflow (не реализован этой задачей)

Следовать [Data Source Policy V2](scripts.md#data-source-policy): P1 Stats PTO, P2 World Triathlon для отсутствующих полей, STOP при явном конфликте/неоднозначной identity. Не считать отсутствие поля конфликтом. Другие athlete-data providers, включая личный сайт/соцсеть, требуют scoped owner approval; разрешение использовать announcements не является blanket разрешением импортировать profile data. Сохранять существующие approved editorial exceptions.

Предложение: отдельный persistent registry по **существующему athlete ID**, применяемый loader после assembly, с exact name/profile identifiers для проверки linkage. Это новый механизм, сейчас его нет. На уровне поля хранить value, source URLs, checkedAt, reviewer, verification status, а для exception — approval date/reason/scope. Отсутствующее значение не стирает существующее; противоречие → review. Не записывать private/unpublished данные. Источники/даты не дублировать в свободном тексте UI.

Последовательность: select cohort → source discovery/read-only report → owner field/text review → отдельно approved small patch → invariant tests/audits → Preview → owner approval → same SHA Production. Без full regeneration; baseline всех athlete IDs, result IDs/rows и ranking order/score обязателен. План registry не разрешает implementation.

### Воспроизводимый top cohort

Первый batch: **top 10 M + top 10 W** по существующему `rankedAthletes` из `src/sports/data.ts`, только ID с row в `athleteRanking` (starts > 0). Порядок сортировки/tie-breakers не менять. Clock — `getRankingDatasetClock`, не сегодняшняя дата. Сохранить в reviewed manifest input SHA, dataset clock, gender, rank, athlete ID/name, score и правило N=10. Дополнительный финальный tie при полном равенстве — исходный порядок runtime catalog (фиксирован SHA). Unknown gender не угадывать; вынести в review. Не использовать country/search filters или вручную заменять «менее известных» атлетов. Следующие batches — следующие 10 каждого пола, по новому явно зафиксированному snapshot; старый approved batch не дрейфует молча.

### ATH-01 — Verified social media links

- **Model (PROPOSED):** сохранить поддерживаемые instagram/youtube handles; добавить field-level evidence registry и strict platform/handle validation. Новые платформы — отдельный scope, не generic unvalidated URL.
- **Sources:** точные PTO/World Triathlon athlete pages с явными external links; при отсутствии — approved exception для официального сайта/аккаунта. Имя аккаунта/значок verification сами по себе не достаточны.
- **Workflow/verification:** сверить athlete identity, reciprocal official links, platform destination/redirect; записать дату. Missing/ambiguous → оставить пустым. Периодический recheck перед batch publication.
- **UI/tests:** существующие иконки; tests отсутствующих/валидных/опасных handles, target/rel, mobile accessible labels, без broken empty links; identity/ranking invariants.
- **Complexity/dependencies:** S–M code, source review отдельно; общий provenance registry и approved cohort. Нет D1 migration.

### ATH-02 — Birth date and calculated age

- **Model (PROPOSED):** optional full `birthDate: YYYY-MM-DD` + evidence; не выводить точный возраст из одного года рождения. Перевести verified records со static age на вычисление, не угадывать DOB из age. Existing age не удалять без review.
- **Sources:** PTO, затем World Triathlon с exact identity; конфликт STOP. Только публичные подтверждённые DOB.
- **Workflow:** read-only comparison → approved per-ID updates → calculated-age renderer. Определить единую календарную зону (предлагается Europe/Moscow как в Calendar), leap-day policy и refresh при переходе суток до implementation approval.
- **UI/tests:** RU склонения, день до/в/после birthday, leap years/29 февраля, invalid/future dates, missing/partial dates, timezone boundary и фиксация clock. Unknown DOB → не показывать fabricated age.
- **Complexity/dependencies:** M; новый TS field/helper, provenance, review двух existing static ages. Не влияет на ranking/formula; D1 не требуется.

### ATH-03 — Editorial biographies for top athletes

- **Model (PROPOSED):** verified Russian paragraph list в editorial registry с claim-level evidence и owner-approved text; adapter к текущему bio/bioFacts либо отдельный approved schema change. Сохранить утверждённый Kristian text без переписывания.
- **Sources:** sports facts PTO/World Triathlon; supplementary official athlete/organizer material только в допустимом purpose или scoped exception. Не копировать большие чужие тексты; каждое factual claim проверять отдельно.
- **Workflow:** top cohort, факт-лист → краткий русский draft → owner editorial approval → small batch. Никакой массовой автогенерации биографий.
- **UI/tests:** обобщить paragraphs без ID-specific ветки после отдельного review; collapsed disclosure, keyboard/aria, пустой профиль, длинные тексты/320px. Нет изменения names/IDs/countries/results.
- **Complexity/dependencies:** M code, значительная editorial work; shared evidence и identity approval. Детализирует DATA-02, не закрывает её.

### ATH-04 — Verified key achievements

- **Model (PROPOSED):** structured entries с stable entry key, текстом, competition/year/edition (если применимо), kind/icon и evidence. Adapter должен сохранить существующие четыре achievements Kristian и SVG laurel. Не менять ranking ради достижений.
- **Sources:** PTO/World Triathlon results для индивидуальных финишей. Series titles/олимпийские/исторические claims вне доступного dataset требуют прямого подтверждения источником; organizer standings для profile ingestion — scoped exception. Не выводить world title из позиции в произвольной гонке.
- **Workflow:** сверить пол, дистанцию, actual race date и season label, затем owner review текста/иконки; не путать IRONMAN season 2021 с датой St George 2022.
- **UI/tests:** порядок/уникальность, иконки по явному kind вместо text heuristics, mobile и доступные labels; защита existing approved items. Missing achievement не равно «нет достижений».
- **Complexity/dependencies:** M; provenance + editorial renderer review, DATA-02; никакой миграции результатов/D1.

## Порядок и финальный checklist

1. До v1.0.0: закрыть release decision по QA-01/OPS-02; проверить текущий Telegram iPhone/Android flow на representative networks; review existing public profile facts без обязательного массового enrichment. Получить owner acceptance UX-01 Production; не закрывать по одному test PASS.
2. Проверить backup/recovery readiness и доступ к правильным bot credentials владельцем; restore drill в отдельной DB — отдельный approval, не часть текущего аудита. Согласовать BOT-03/BOT-04 operational risk, не отключать инфраструктуру автоматически.
3. Подготовить version/notes по [canonical release procedure](versioning.md). Scope v1: Calendar/results/athlete profiles/internal ranking, News, protected Feedback, Telegram commands, current-version More. ATH-01–04, 2027 transition, CI automation и tables/points — post-release, если владелец не меняет scope.
4. На reviewed release SHA: `npm run check:release`; отдельно `node --test scripts/test-telegram-commands.mjs` (workerd) и `node --test scripts/test-athlete-photo-review.mjs`; `npm run check:release:browser` с локальными серверами по [scripts](scripts.md). Tests с Feedback submission — локальные mocks, не live production POST. Не запускать full regeneration в write mode.
5. Preview только после отдельного approval: deploy reviewed SHA; health на обоих hosts, полный JS/CSS/sports delivery, Calendar seasonal/generic/search/Past, race results/athlete links/ranking, More disclosure/version, News/config, command GET 405; secret names/vars/DB/queue aggregate, production baseline unchanged. `check:preview` не проверяет expected-sha — сравнить health явно.
6. Owner device review → отдельное Production approval того же SHA → `check:production -- --expected-sha <SHA>` и оба health endpoints, UI/assets/bindings/queue/Preview isolation. Owner Feedback/Telegram messages — только отдельное разрешение, не автоматические smoke mutations.
7. Только после Production acceptance — annotated v1.0.0 tag на deployed SHA, factual date/evidence, documentation closeout без обязательного второго deployment. При ошибке STOP; rollback отдельным approval с сохранением восьми secrets и public route.
8. После запуска: owner monitoring News natural post/watermark, Feedback failed/retryable/leases, sanitized command errors, asset availability по сети/устройству; периодический review открытых рисков. Тексты/данные не логировать. ATH implementation order: общий provenance/cohort → ATH-01 → ATH-02 → ATH-03/04 малыми reviewed batches.

Notes v1.0.0 должны описывать проверенные пользовательские возможности, включая оба Calendar empty states; не обещать полное покрытие DOB/social/bio/photos, глобальную доступность или ещё не реализованные очки/2027. Исторические deployment не превращать в выдуманные numbered releases.
