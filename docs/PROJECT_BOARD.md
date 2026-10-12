# 300W — Project Board

Обновлено: 2026-10-12. Краткая рабочая доска; код и evidence определяют фактическое состояние реализации. Это не разрешение выполнять перечисленные действия.

Приоритеты: **P0** — критический инцидент; **P1** — ближайший приоритет; **P2** — плановая работа; **P3** — улучшение без срочности. Приоритет не означает разрешения на выполнение.

## Current Focus

### DATA-03 — Kona 2026: импорт профессиональных результатов

- **Status:** APPROVED FOR COMMIT — PREVIEW NOT DEPLOYED · **Priority:** P1.
- **Описание:** Локальный incremental import выполнен 2026-10-12: 99 результатов (52 MPRO / 47 WPRO, 77 finishers / 22 DNF), все 99 linked; IDs 4494–4592. Source HTML/evidence сохранены. Прежние 4493 строки и 1167 профилей сохранены, regeneration не запускалась. Targeted tests 41 PASS; release gate 17/17 PASS (21,7 с), country conflicts 0. Изменение рейтинга от новой гонки и dataset clock 2026-10-10 ожидаемо; формула не изменялась. Country corrections прошли review, закоммичены и отправлены в `7738e43`; они больше не ожидают review. Конфликты Lara/Jeremy/Nick — 0. Owner approval для commit/push получен; deployment не выполнялся.
- **Next action:** После commit/push — отдельное approval для preview, browser/device review и затем production. Browser gate в этом шаге не запускался. Full regeneration не использовать (TECH-01).
- **Links:** [PTO Kona 2026](https://stats.protriathletes.org/race/im-hawaii/2026/results), [canonical workflow](scripts.md#canonical-workflow), [import CLI](import-race-results.md), DATA-04 ниже.

## In Progress

### DOC-01 — Developer and Owner Maintenance Handbooks

- **Status:** IN PROGRESS · **Priority:** P2.
- **Описание:** отдельные практические руководства для разработчика и владельца; существующие операционные документы — исходный материал, готовность отдельных handbooks не подтверждена.
- **Next action:** согласовать аудитории, структуру и границы руководств; ссылаться на canonical workflows вместо копирования команд в несколько мест.
- **Links:** [scripts](scripts.md), [deployment/recovery](deployment-cloudflare.md), [name review](athlete-name-review.md).

### DATA-01 — Русские имена атлетов

- **Status:** IN PROGRESS — OWNER · **Priority:** P2.
- **Описание:** продолжающийся ручной проект владельца по проверке локализации. Не генерировать недостающие имена автоматически и не менять identity.
- **Next action:** владелец редактирует только `name_ru` в review CSV; затем dry-run, review и отдельно разрешённая запись. Не запускать audit/export поверх незавершённого ручного CSV: он перезаписывает файл.
- **Links:** [CSV workflow](athlete-name-review.md), [localization registry](../src/data/athletes/athleteLocalization.json).

## Needs Attention / Review

### DOC-02 — Сверить устаревшие статусы в документации и release output

- **Status:** NEEDS REVIEW · **Priority:** P2.
- **Описание:** `scripts.md` ещё называет Jeremy/Nick unresolved country conflicts; это закрыто DATA-04. Последний release output также описывает full-regeneration FAIL как country conflict, хотя фактическая причина теперь ID drift. News/deployment docs содержат датированные snapshots с неподтверждённым live ingestion и старым active SHA; они не доказывают текущее live-состояние.
- **Next action:** отдельным review согласовать документы с commit evidence и свежими read-only operational checks. Сохранить исторические checkpoints с датами; не превращать UNKNOWN в PASS без evidence и не открывать заново исправленные country issues.
- **Links:** [scripts](scripts.md), [News operations](latest-news.md), [production runbook](deployment-cloudflare.md), [release policy](../scripts/release-policy.mjs).

## Backlog

### DATA-05 — Переход сезона 2026 → 2027

- **Status:** BACKLOG — POLICY DOCUMENTED, IMPLEMENTATION NOT STARTED · **Priority:** P2.
- **Описание:** approved scope IRONMAN / IRONMAN 70.3 / T100 под TWT; Roth — отдельная гонка без нового фильтра. T50, Challenger и WTCS исключены. Policy подготовлена 2026-10-12 для review; новые гонки/assets/код не добавлены, DATA-03 остаётся Current Focus.
- **Next action:** owner review policy; получить verified calendar и отдельный approved plan для archive 2026, 2027 editions, Roth visibility/aliases и showcase imagery. Не копировать даты и не мигрировать IDs автоматически.
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

## Recently Completed

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
