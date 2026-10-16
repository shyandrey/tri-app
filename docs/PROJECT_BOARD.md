# 300W — Project Board

Обновлено: 2026-10-17. Краткая рабочая доска; код и evidence определяют фактическое состояние реализации. Это не разрешение выполнять перечисленные действия.

Приоритеты: **P0** — критический инцидент; **P1** — ближайший приоритет; **P2** — плановая работа; **P3** — улучшение без срочности. Приоритет не означает разрешения на выполнение.

## Current Focus

BOT-01 core завершён; review эксплуатационных follow-ups BOT-02–BOT-04. Новые remote mutations требуют отдельного approval.

## In Progress

### DATA-01 — Русские имена атлетов

- **Status:** IN PROGRESS — OWNER · **Priority:** P2.
- **Описание:** продолжающийся ручной проект владельца по проверке локализации. Не генерировать недостающие имена автоматически и не менять identity.
- **Next action:** владелец редактирует только `name_ru` в review CSV; затем dry-run, review и отдельно разрешённая запись. Не запускать audit/export поверх незавершённого ручного CSV: он перезаписывает файл.
- **Links:** [CSV workflow](athlete-name-review.md), [localization registry](../src/data/athletes/athleteLocalization.json).

## Needs Attention / Review

### BOT-02 — BotFather commands и Menu Button

- **Status:** NEEDS REVIEW · **Priority:** P2.
- **Описание:** работа `/start`, `/app`, `/help` и кнопки Mini App подтверждена владельцем; состояние BotFather command list и Menu Button отдельно не подтверждено.
- **Next action:** owner-assisted проверка списка команд и URL меню для Production/Preview; изменения только после отдельного approval.
- **Links:** [command operations](telegram-commands.md#operational-follow-ups).

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

### UX-01 — Calendar Empty State

- **Status:** TODO · **Priority:** P2.
- **Описание:** при некоторых сочетаниях фильтров Calendar может показывать пустой список, например Upcoming + IRONMAN Pro Series после окончания сезона. Нужен оформленный empty state вместо пустого пространства.
- **Acceptance criteria:** различать «Сезон завершён» и обычное «Нет гонок по выбранным фильтрам»; согласовать подходящий русский текст, рассмотреть компактную иллюстрацию календаря или иконку и добавить понятное действие сброса фильтров. Не выводить завершение сезона только из пустого результата: определить отдельное обоснованное условие. Сохранить текущие layout и поведение фильтрации; проверить mobile UI и добавить filter regression tests для обоих состояний и сброса фильтров.
- **Next action:** изучить текущую фильтрацию и данные сезона, предложить условия состояний, copy и макет; получить отдельное approval реализации.
- **Links:** [Calendar](../src/pages/CalendarPage.tsx), [season policy](season-transition-2026-2027.md), [developer handbook](maintenance-developer.md).

### REL-01 — Application Versioning

- **Status:** TODO · **Priority:** P1.
- **Описание:** подготовить версию 1.0.0 для первого публичного релиза и отображение «Версия 1.0.0» в More. Определить единый источник версии, предпочтительно package.json, и простую release versioning policy. Фактическую версию не менять до отдельного release approval.
- **Acceptance criteria:** UI и `/api/health` получают согласованную версию из единого источника; проверить существующую цепочку build metadata и добавить version consistency tests. Описать порядок изменения версии и её проверки при релизе, без независимых hardcoded значений в UI/Worker.
- **Next action:** проверить текущий version/build metadata flow, предложить минимальный план подготовки 1.0.0 и политику версионирования; отдельно согласовать изменение версии и релиз.
- **Links:** [package.json](../package.json), [More](../src/pages/MorePage.tsx), [health handler](../worker/index.ts), [deployment procedure](deployment-cloudflare.md).

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
