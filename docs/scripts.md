# Operational scripts

## 1. Quick reference

Запускать из корня repository на согласованной branch (`home-redesign-experiments`). Перед WRITE: `git branch --show-current`, `git status --short`; сохранить чужие изменения. После WRITE: обязательный `git diff` и профильные проверки. Команды ниже не являются разрешением на deploy или изменение remote data.

READ-ONLY означает отсутствие намеренной записи source/remote data; dev servers могут создавать ignored caches. DRY-RUN показывает предложение без применения. WRITE включает локальные generated artifacts, даже когда production data не меняется.

| Задача | Начальная команда | Режим |
| --- | --- | --- |
| Результаты | `npm run import:race-results -- --url '<verified Stats PTO URL>' --race '<editionId>'` | DRY-RUN, network GET |
| Новые атлеты | `npm run find:next-athletes` | READ-ONLY |
| Проверка каталога | `npm run audit:athletes` | READ-ONLY; читать ISSUES |
| Проверка результатов | `npm run audit:results` | READ-ONLY |
| Русские имена | `npm run audit:athlete-names` | WRITE review artifacts, не имена |
| Preview health/News | `npm run check:preview` | READ-ONLY, network GET |

Практические руководства (согласованы владельцем 13.10.2026): [developer](maintenance-developer.md) и [владелец](maintenance-owner.md). Этот файл остаётся canonical reference команд и workflows.

## Data Source Policy

**DOCUMENTED policy V2:** два доверенных источника с приоритетом на уровне конкретного поля. Это правило source review, не утверждение, что все исторические данные проверены по обоим источникам или что scripts автоматически реализуют эту политику.

1. **Priority 1 — [Stats PTO](https://stats.protriathletes.org/):** default primary для профессиональных результатов, мест, overall times, swim/bike/run/transition splits, явно доступных DNS/DNF/DSQ, historical results, athlete identity/profile linkage, имён, nationality/country, race history и result-derived statistics.
2. **Priority 2 — [World Triathlon](https://triathlon.org/):** trusted secondary для результатов и athlete information. Если соответствующее поле PTO отсутствует, World Triathlon может заполнить его без отдельного human approval выбора источника, после проверки точной race/athlete identity и самого значения. Доступное надёжное поле PTO имеет приоритет.

**Conflicts / missing:** отсутствие значения не является конфликтом. Если оба источника явно расходятся, STOP для human review, не выбирать значение молча и не считать приоритет разрешением перезаписать конфликт. При неоднозначной identity не объединять profiles. Если оба источника не дают пригодных данных, сообщить limitation и affected fields/athletes; не придумывать значения. Для каждого изменяемого поля записывать source URL, значение, дату проверки и основание linkage; отделять PTO-derived и World Triathlon-derived evidence. Сохранять stable athlete IDs и unrelated historical data.

Оба источника разрешены без отдельного approval выбора provider; обычные review/approval этапы записи и deployment ниже сохраняются. TRI Ranking остаётся собственной формулой приложения, не заменяется ranking источников; approved ручная русская локализация — presentation layer, не новый источник identity. Все прочие providers для results/athlete ingestion требуют scoped exception ниже; blanket fallback отсутствует.

**Другие назначения источников:** IRONMAN, T100/PTO, Challenge Family и другие организаторы допустимы для calendars, dates, schedules и изменений; официальные организаторы и атлеты — для news, announcements и supplementary information; официальные competition rules/ranking tables — для qualification points, slots и будущих competition-specific calculations. Это не разрешает переносить оттуда результаты или athlete data. Новые расчёты также не считаются реализованной возможностью приложения.

**Exceptions для всех providers кроме Stats PTO и World Triathlon:** требуется explicit owner approval для конкретной race, athlete, field или task. Записать source URL, причину, дату approval и scope в reviewed report/evidence; различать дату проверки источника и дату разрешения. Provenance каждого provider должно оставаться различимым, в том числе внутри одного профиля. Нет blanket fallback authorization; историческое разрешение на одну задачу не переносится на другие.

Существующие approved exceptions сохраняются, не переписываются под PTO provenance. В [countryEnrichment.json](../src/data/athletes/countryEnrichment.json) уже записаны:

| Exception | Scope / reason | Сохранённое evidence |
| --- | --- | --- |
| Erik Olsson, ID 10144 | Country SE; PTO profile redirect не подтверждал страну | `official-federation-verified`, Swedish federation source URL, проверка 2026-10-06, связь с Texas 2024 |
| Sebastian Schober, ID 10541 | Country DE; PTO country отсутствовал | `official-results-verified`, Austrian federation official-results URL, проверка 2026-10-06, PTO linkage Zell am See 2023 ↔ Roth 2024 |

Это ранее approved Wave C corrections, не разрешение на новые federation-based изменения. Даты выше — existing `checkedAt`, не выдуманные даты approval. Approved manual/photo provenance, включая исключения в [photo workflow](../scripts/athlete-photo-import.md), также сохраняется. `migrated-existing` не превращается автоматически ни в verified PTO, ни в approved external exception; нехватку provenance нужно явно отметить. Lara/Jeremy/Nick country conflicts разрешены reviewed corrections (DATA-04). Сохранять их field-level evidence; текущий full-regeneration риск — athlete ID drift (TECH-01), а не эти конфликты.

## 2. Import new race results

### Canonical workflow

**Stats PTO URL → Codex discovery → Owner review → Incremental import → Tests/audits → Preview → Owner approval → Production.** Это единый процесс для статических профессиональных результатов; инструкция сама по себе не разрешает запись, commit или deployment.

Статус возможностей:

| Статус | Что существует / требуется |
| --- | --- |
| IMPLEMENTED | [Stats PTO importer](../scripts/import-race-results.mjs) + [HTML parser](../scripts/parse-stats-pto-results.py): dry-run, новый module, source snapshot/evidence, guards; [athlete discovery/append](../scripts/find-next-athletes.mjs); tests/audits и отдельные deployment scripts. |
| DOCUMENTED | Data Source Policy выше и обязательные source/identity review и STOP points ниже; ручное подключение edition/module; сравнение до/после; отдельные разрешения на preview и production. Эти действия не автоматизированы одной командой. |
| PROPOSED — не реализовано | Автоматическое создание editions; общий immutable registry result IDs; автоматический per-import baseline/approval gate. Не считать их возможностями текущего CLI. Автоматический World Triathlon importer не реализован; разрешение использовать источник не означает наличия CLI adapter. Прочие providers требуют отдельного approval. |

### A. Source — READ-ONLY

Owner или ChatGPT обычно предоставляет Stats PTO race/edition URL. Если URL не указан, Codex может самостоятельно найти правильную страницу на Stats PTO и проверить race identity, год и категории до extraction. Codex проверяет фактические таблицы, а не только заголовок страницы: гонку, год, дату/edition, место и нужные professional categories MPRO/WPRO (Stats PTO называет женскую панель FPRO). Проверить все страницы/категории, финальность результатов и полноту поля, включая non-finishers; start list не равен result list.

При missing/incomplete/inaccessible PTO data записать limitation и проверить World Triathlon по [Data Source Policy V2](#data-source-policy). Проверять точную identity, год/categories и provenance каждого поля; явное противоречие двух источников требует STOP для human review. Если оба не дают пригодных данных, сообщить limitation; другие providers — только approved scoped exception. Другой год, edition или предварительный протокол нельзя подставлять молча.

**Ограничение CLI:** `import:race-results` принимает только `https://stats.protriathletes.org/race/<slug>/<year>/results` без query/hash, запрещает redirects и проверяет canonical URL в HTML. World Triathlon и официальные IRONMAN URL/API/export напрямую не поддержаны. `--html` — только snapshot того же Stats PTO формата, не универсальный адаптер. Если согласованные данные нельзя точно представить поддерживаемым путём, STOP: сообщить ограничение; отдельная реализация/ручной reviewed patch возможны только после explicit approval implementation scope; для иных providers также требуется source exception, не фабриковать Stats PTO HTML и не обходить guards.

### B. Discovery → owner review — до source writes

Проверить [race editions](../src/data/raceEditions.ts), [race identity](../src/data/raceIdentity.ts), [result model](../src/types/RaceResult.ts), [results index](../src/data/results/index.ts), [catalog](../src/data/athletes/index.ts) и [identity resolver](../src/data/athleteIdentity.ts). RaceEntity — постоянная гонка, RaceEdition — конкретное издание; новый год не означает новую постоянную race identity.

Сопоставить полный профессиональный протокол с текущими rows: имена/страны, места, total/splits, DNS/DNF/DSQ, дубликаты, существующие и unmatched profiles. Для каждого неоднозначного совпадения показать source profile URL/evidence и кандидатов. Нормализация удаляет диакритику, часть пунктуации и различия регистра; это не доказательство личности. Нельзя объединять похожие имена, подменять source spelling или создавать второй профиль лишь потому, что exact-normalized match отсутствует. Варианты/aliases из discovery — наблюдения, не автоматически проверенный alias registry.

До импорта записать baseline существующих athlete IDs/nameEn и result rows/IDs, список предполагаемых файлов, новые editions/profiles и ожидаемое влияние на ranking при одной и той же reference date. Новые результаты закономерно меняют scores/order; формула, clock semantics и unrelated data должны сохраниться. Автоматического универсального baseline snapshot для каждой новой гонки нет: существующие replay tests относятся к своим fixtures.

**STOP для owner review:** предоставить source/provenance, counts по gender/status, matches/unmatched, anomalies, proposed file/ID/linkage changes и ограничения. Если edition ещё нет или её source URL не настроен, dry-run не запустится: сначала согласовать её добавление, не создавать edition во время read-only discovery.

### C. Incremental import — LOCAL WRITE только после approval

```sh
npm run import:race-results -- --url '<verified Stats PTO URL>' --race '<editionId>'
# Только после review:
npm run import:race-results -- --url '<verified Stats PTO URL>' --race '<editionId>' --write --out 'src/data/results/<year>/<new-module>.ts' --export '<exportIdentifier>'
```

Первый запуск DRY-RUN: читает verified Stats PTO HTML, существующие editions/results/catalog. `--html <snapshot.html>` позволяет читать локальный HTML вместо network; canonical URL всё равно проверяется. `--race` можно повторить для отдельных gender editions. WRITE создаёт новый TS module и JSON/HTML evidence в `scripts/fixtures/result-imports/`; существующие файлы не перезаписывает.

Importer **не создаёт RaceEdition, не подключает module и не создаёт athlete profiles**. Edition и её verified source URL должны уже существовать. Review: edition/date/gender, identities, anomalies, SOF proposal и source evidence. SOF применять к нужной edition отдельно после проверки, не перезаписывать conflicts. Anomalies нельзя автоматически «исправлять» выдуманными результатами.

Затем вручную подключить export в results index, выполнить discovery из следующего раздела и `npm run audit:results` (читает общий runtime results/catalog/editions, не пишет; проверить весь report), `npm run audit:athletes`. Включение module влияет на global result IDs — см. §12.

Evidence JSON содержит source URL, retrieval time, SHA-256 HTML, title/source dates, editions, parsed groups и proposal; HTML сохраняет source snapshot. Для World Triathlon записать field-level source URL/evidence; для прочих approved exceptions также причину, дату и scope approval записать в reviewed import report: CLI автоматически сохраняет только свой Stats PTO source. Не включать credentials в URLs/snapshots.

Существующие результаты edition importer отказывается перезаписывать; это добавление нового поля результатов, не merge/update tool. Исправление уже импортированной edition требует отдельного плана. После подключения module выполнить §3 discovery, затем только approved `--write --append`, если действительно нужны новые profiles. Append обрабатывает **все** unmatched identities runtime results, а не только новую гонку; его полный набор должен совпадать с reviewed scope, иначе STOP.

**IDs и страны:** штатный последовательный append сохраняет старые generated records/athlete IDs и назначает новые выше max catalog ID. Full regeneration может перенумеровать IDs и отдельно разрешается, не является этапом этого workflow. Global result IDs назначаются `index + 1` в конце results index: добавлять новый batch в конец итогового списка, не вставлять в середину старых season arrays. Проверить старые rows целиком: country backfill в index способен менять historical rows при добавлении source countries в season arrays. Повторить baseline comparison; абсолютной гарантии стабильности всех IDs/linkages у цепочки importer + ручной wiring нет. Concurrent writes запрещены.

**Статусы и missing values:** сохранять source DNS/DNF/DSQ и имеющиеся splits; отсутствие в start/result list не превращать автоматически в DNS. Парсер пропускает отсутствующие времена (не zero и не выдуманное время), сохраняет поддержанные числовые места/points и отклоняет неизвестные статусы/форматы. Не рассчитывать отсутствующие splits из total. Country conflicts, missing splits и split/total mismatch попадают в anomalies; **anomalies сами по себе не запрещают `--write`**. Title/date соответствие и полнота обоих gender fields требуют review: наличие canonical URL и хотя бы подходящей таблицы не доказывает их. Не угадывать nationality/SOF/identity для прохождения audit.

### D. Validation — source data не менять проверками

После local diff review выполнить существующие команды из корня:

```sh
npm run audit:results
npm run audit:athletes
node --test --test-concurrency=1 scripts/test-race-result-import.mjs scripts/test-current-athletes.mjs scripts/test-find-next-athletes.mjs
node --test --test-concurrency=1 scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs
npm run check:release
git diff --check
# После local browser setup из §10:
npm run check:release:browser
```

`check:release` уже запускает `npm run build`, lint, ranking, results/identity и другие проверки; отдельный `npm run build` нужен при изменениях после gate или для отдельной build-проверки. Browser gate проверяет Calendar/results/navigation/athletes/ranking и другие текущие suites; дополнительно вручную проверить именно новую edition и athletes: старые fixtures не доказывают правильность нового протокола. Tests/build могут писать temporary/ignored artifacts, но не должны регенерировать source datasets или обращаться с записью к remote D1/Telegram. Не запускать full regeneration ради обычной валидации импорта.

Разделять новые regressions, source anomalies, historical failures и environment errors; не обновлять expectations ради зелёного gate. `audit:athletes` exit 0 не означает отсутствие issues. Jeremy Maclean (US), Nick Thompson (AU) и Lara Hernandez-Tome (ES) согласованы с проверенными историческими PTO rows; country conflicts устранены. Full-regeneration validation остаётся FAIL из-за переназначения athlete IDs (TECH-01); не запускать write-mode regeneration в настоящий каталог. Исторические missing-country Erik Olsson / Sebastian Schober уже закрыты SE / DE; их присутствие в release-policy allowlist не означает текущие issues. Подробности historical/non-gating checks — §10.

### E. Preview → owner approval

После успешной валидации и разрешения owner на commit/deploy зафиксировать только reviewed data/evidence/wiring/tests; сохранить SHA. Не включать unrelated changes и локальные artifacts. Из чистого reviewed checkout выполнить preview процедуру §9. До remote write проверить Worker/DB/environment; после — сравнить health SHA вручную с recorded commit (`check:preview` сам SHA-match не требует).

Проверить новую race detail, оба нужных professional fields/statuses/splits, athlete links/details/search, ranking и Back/navigation на mobile/desktop. Сохранить screenshots/results review. Results/catalog — статические TS данные в bundle, а не News/Feedback D1: этот импорт не требует migrations, SQL seed или копирования preview D1. Проверить, что preview использует свой Worker/DB, а production deployment/bindings не изменились. **STOP для owner visual/data approval.**

### F. Production — только тот же reviewed Git revision

После успешного preview review и отдельного explicit production approval проверить чистый checkout того же SHA, текущий production version и rollback candidate. Использовать [production deployment procedure](deployment-cloudflare.md#live-production-and-manual-deployment):

```sh
npm run deploy:production:dry
# Только после explicit production deployment approval:
npm run deploy:production
npm run check:production -- --expected-sha '<approved-40-character-sha>'
```

Это rebuild того же Git revision для production environment, не повторный импорт гонки и не копирование preview данных. Если revision изменился после preview approval, пройти review/validation заново. Не подменять scripts несуществующими `npm run deploy` / `npm run check`.

После deployment — GET/SELECT verification: SHA, полная загрузка JS/CSS, новая edition/athletes/results/ranking, News и protected Feedback config; сверить production DB, шесть secret binding names, Turnstile/limiter/cron и preview isolation по runbook. Health/News checker один не покрывает эти проверки. Не отправлять реальный Feedback/Telegram report без отдельного разрешения.

### Mandatory STOP и recovery

- Не подтверждены race/year/edition/categories, источник неполон/предварителен или формат не поддерживается.
- Есть unresolved identity/duplicate/gender/country конфликт: сначала evidence и решение owner; не превращать незнакомое имя в нового атлета автоматически. Source anomaly можно оставить только явно reviewed и документированной, не скрывать.
- Importer пытается заменить существующую edition/file; scope append шире approved; old IDs/rows меняются неожиданно; output/diff не соответствует плану.
- Новая regression, непроверенный environment failure, dirty release checkout/SHA mismatch, неправильный Worker/DB/bindings или нет разрешения на соответствующий write/deploy.

При production regression остановиться, записать version/SHA и evidence. [Rollback/recovery runbook](deployment-cloudflare.md#rollback) требует отдельного разрешения и повторной проверки known-good version с нужными bindings/secrets; не считать исторический version ID вечным safe target. Worker rollback возвращает bundle (включая статические результаты), но не D1/Telegram state. Для статического results incident не восстанавливать и не перезаписывать production D1; D1 recovery — отдельная операция только при доказанном data incident. Preview не использовать как источник замены production DB.

## 3. Add new athletes from results

```sh
npm run find:next-athletes
# После проверки unmatched identities:
npm run find:next-athletes -- --write --append
```

READ-ONLY discovery читает runtime catalog/results, curated/verified profiles, country enrichment и localization registry. Печатает unmatched identities, gender/country/aliases и unresolved cases. Проверить источник и неоднозначные совпадения; похожее имя не доказывает identity.

WRITE append читает существующий `src/data/athletes/resultAthletes.generated.ts`, сохраняет существующие records/IDs и добавляет unmatched profiles с ID выше текущего максимума всего runtime catalog. Неоднозначный gender/country останавливает запись. Новые русские имена не придумываются. После записи проверить `git diff`, linkage, `npm run audit:athletes`, `npm run audit:results`.

**Не запускать два athlete writes параллельно.** Нет file lock или transaction/concurrency guarantee. Сохранение IDs относится к последовательному штатному append.

```sh
# EXCEPTIONAL / FULL REGENERATION — IDs MAY CHANGE. Не обычный импорт!
npm run find:next-athletes -- --write --full-regenerate --output '<temporary-output.ts>'
```

Full regeneration перестраивает список из results минус curated/verified identities и назначает `10000 + index`. `--output` направляет запись в указанный файл; без него обе write-команды заменяют настоящий generated catalog. Сначала использовать temporary output, затем отдельно review ID/linkage diff; не переносить результат автоматически. Country conflicts устранены; full-regeneration validation теперь обнаруживает ID drift, например Emmanuel Lejeune 20010 → 10140. Это FAIL, не разрешение заменить каталог.

CLI: без flags — discovery; `--write --append` и `--write --full-regenerate` разрешены; plain `--write`, оба режима вместе, неизвестные/повторные flags, `--output` без пути отклоняются до загрузки данных/записи. `--append`, `--full-regenerate` и `--output` без `--write` отклоняются: отдельного incremental dry-run нет, использовать discovery.

## 4. Edit Russian athlete names

Подробности: [athlete-name-review.md](athlete-name-review.md).

1. `npm run audit:athlete-names` — WRITE только `.generated/athlete-names/{review.csv,review.md,baseline.json}`; читает catalog/localization и production ranking. **Перезаписывает незавершённый CSV: не запускать перед импортом ручных правок.**
2. Открыть `.generated/athlete-names/review.csv`: `athlete_id,ranking,name_en,name_ru`. Менять только `name_ru`: правильное оставить, ошибочное исправить, отсутствующее заполнить вручную. Ranking — metadata, не identity. Numbers UTF-8 comma/semicolon, BOM, LF/CRLF поддерживаются.
3. `npm run import:athlete-names` — DRY-RUN; читает CSV/baseline/current catalog/registry. Review каждой предлагаемой замены и ошибок identity/stale baseline; строки можно переставлять.
4. `npm run import:athlete-names -- --write` — WRITE только `src/data/athletes/athleteLocalization.json`; весь batch abort при invalid row, удаления пустым именем запрещены. Проверить diff и name tests.
5. Только после применения и сохранения правок — новый `npm run audit:athlete-names`.

Generated athletes вручную не редактировать. CSV/baseline ignored; registry хранится в Git. Полная регенерация для имён не нужна.

## 5. Athlete photos

`npm run import:athlete-photos -- --batch '<reviewed-batch.json>' --dry-run` — DRY-RUN discovery: читает explicit manifest, runtime profiles/photo registry/local files, Stats PTO pages; не скачивает images и не меняет source. Review identity/profile URL/confidence; missing photo — допустимая coverage metric. Без `--dry-run` текущий importer также discovery-only, но явный dry-run предпочтителен.

Staging/publish — отдельный reviewed workflow в [athlete-photo-import.md](../scripts/athlete-photo-import.md). `node scripts/publish-athlete-photos.mjs --manifest '<staging-manifest.json>' --reviews '<manual-reviews.json>' --publish` — WRITE: читает staging и manual approvals, публикует локальные photos и photo registry. Запускать только после identity + visual review; после записи проверить diff/photos и regenerate optimized variants. Не использовать historical batch manifests для нового bulk enrichment. Missing images не заполнять ради audit count.

## 6. Generate optimized images

`node scripts/generate-image-variants.mjs` — WRITE, без dry-run: читает showcase PNGs, `public/athletes/`, локальный Blummenfelt portrait и series JPEGs; пишет `src/assets/optimized/` и три manifests в `src/generated/` (`athleteImageVariants.ts`, `showcaseImageVariants.ts`, `image-variants.json`). Originals сохраняются. Запускать после approved image changes, не вручную менять generated manifests.

Использует установленный transitive `sharp` из toolchain; окружение влияет на binary reproducibility. Review count/size/diff, crops и browser requests. `node --test scripts/test-image-delivery.mjs` и `node --test scripts/test-initial-graph.mjs` проверяют manifests/production graph (нужен свежий build для graph). Browser image suite — дополнительная проверка UI на локальном server; не remote deployment.

## 7. News

Штатный ingestion автоматический: Telegram webhook → eligibility → D1 → API. Никакой importer для каждого нового поста запускать не нужно. `npm run check:preview` — READ-ONLY GET health/News; читает canonical preview, пишет только console. Проверить SHA/items, учитывать cache 900 секунд; отсутствие поста не основание для ручного INSERT.

`node --test scripts/test-news-eligibility.mjs scripts/test-news.mjs scripts/test-news-presentation.mjs scripts/test-news-seed.mjs` — INTERNAL TEST, локальные fixtures/test DB, без live webhook/D1 mutations. Запускать после News changes, review failures/eligibility/privacy. Seed/demo scripts не являются текущим operational ingestion workflow; не выполнять против remote D1 без отдельного review. См. [latest-news.md](latest-news.md), [news-eligibility.md](news-eligibility.md). Не менять webhook ради frontend custom domain.

## 8. Feedback

Production и Preview protected Feedback активны: Turnstile, native rate limiter, D1-first save, Telegram delivery, retry cron. `npm run test:feedback` — INTERNAL TEST; генерирует ignored build metadata, использует локальные tests/fixtures, не отправляет реальный report. `node scripts/test-feedback-browser.mjs` и `node scripts/test-feedback-submission-browser.mjs` — локальные browser tests; требуют setup из файлов, создают test artifacts, не доказательство real Turnstile happy path.

После Feedback changes review сохранности формы, single-submit, errors/retry и privacy. Реальный E2E создаёт D1 report и Telegram notification и требует отдельного разрешения; это не read-only health check. Secrets только server-side. Настройка описана в [feedback.md](feedback.md); не менять cron/keys/bindings в scripts maintenance.

## 9. Preview deploy

```sh
npm run deploy:preview:dry
npm run deploy:preview
npm run check:preview
```

Dry — DRY-RUN remote deployment, но WRITE локального build/metadata/Wrangler artifacts; читает checkout/config/assets и проверяет preview bundle. Review Worker `tri-app-preview`, DB `tri-app-preview`, diff/build identity. Вторая команда — **REAL REMOTE WRITE**, только после отдельного разрешения; публикует текущий checkout, а не гарантированно чистый commit. Оба package scripts не содержат `--keep-vars`: обычные vars задаёт repository config. Установленный Wrangler сохраняет secrets при обычном deploy. Флаг сохраняет dashboard-managed ordinary vars и допускается только как отдельно рассмотренное исключение, не обязательный preview шаг; migrations он не применяет.

Последняя команда READ-ONLY GET `https://preview.300w.app/api/health` и `/api/news`; review deployed SHA/status/items. Fallback `https://tri-app-preview.shy-andrey.workers.dev`. Production уже deployed: `deploy:production:dry`, `deploy:production`, `check:production` используют explicit production target. Real deploy — отдельная REMOTE WRITE операция без `--keep-vars`; generic `deploy`/`release` scripts отсутствуют. Public Mini App: `@tri_app_bot` → `300w.app`; production News/Feedback: `@tri_app_prod_bot`. [Deployment details](deployment-cloudflare.md).

Production rollback, D1 export/recovery, secret/binding verification и read-only monitoring: [operational runbook](deployment-cloudflare.md#rollback). Не выполнять recovery-команды как часть gate.

## 10. V1 release checks

`npm run check` отсутствует. Fast gate ниже не включает browser coverage; для RC нужны обе команды.

```sh
npm run check:release
npm run check:release:browser
```

**RC requires both gates PASS**, plus human visual review and separately authorized operational checks. A local PASS does not attest live deployment, secrets, webhook, delivery, DNS or external network health. Neither command deploys or calls remote infrastructure. No source datasets, localization, review CSV or generated athletes are written. Build writes ignored metadata/dist/compiler caches; tests write temporary synthetic fixtures and local screenshots. Logs and machine-readable `summary.json` go into the printed OS temporary directory. Run from repository root with Node 24, installed project dependencies, Python 3/SQLite, and the existing `sharp` image toolchain (currently transitive). A missing dependency is an environment error, never PASS. No automatic install or retry.

### Fast gate — `check:release`

Explicit ordered allowlist in `scripts/release-policy.mjs`, no wildcard script execution:

| Check | Exact scripts / command |
| --- | --- |
| TypeScript + production assets | `npm run build` (includes metadata, app and Worker typechecks) |
| ESLint | `npm run lint` |
| Whitespace/conflicts | `git diff --check`, `git diff --cached --check` |
| Foundation | `test-cloudflare-foundation.mjs` |
| Calendar | `test-calendar.mjs` |
| Catalog/search/localization | `test-athlete-catalog-presentation.mjs`, `test-athlete-country-strength.mjs`, `test-athlete-search.mjs`, `test-athlete-names.mjs`, `test-current-athletes.mjs` |
| Catalog issues/provenance | `audit-athletes.mjs --json`, explicit interpretation below |
| Ranking | `test-ranking.mjs`, `test-ranking-dataset-clock.mjs` |
| Navigation/lazy loading | `test-navigation.mjs`, `test-sports-loader.mjs` |
| News | `test-news.mjs`, `test-news-eligibility.mjs`, `test-news-presentation.mjs`, `test-news-seed.mjs` (SQLite temporary fixtures only) |
| Feedback | `test-feedback.mjs` (local mocked delivery; no real report or Telegram send) |
| Results/identity | `audit-results.mjs`, `test-race-result-import.mjs` |
| Graph/images/current photos | `test-initial-graph.mjs`, `test-image-delivery.mjs`; current photo mapping/evidence bytes also checked in `test-current-athletes.mjs` |
| Accessibility | `test-accessibility.mjs` |
| Runner policy | `test-release-runner.mjs` |

Unit groups use `node --test --test-concurrency=1`; independent groups run sequentially. A child FAIL blocks RC; exit **1**. Environment errors (including HMR `listen EPERM/EADDRINUSE` even if the child exits 0, unavailable executable/dependency) block verification; exit **2** if there is no ordinary failure. If both occur, exit 1 and both are listed. Unknown failures/timeouts fail closed. Exit **0** only on PASS. Per-check logs retain complete diagnostics. Existing >500 KB async sports warning is visible in build log, not disabled.

### Known data policy — exact allowlist, not a count exemption

Historical allowlist contains two different groups (four originally observed issues). These are resolved, not a claim of four current issues:

- Country provenance conflicts: Jeremy Maclean `10235`, source codes AU/US, registry US; Nick Thompson `10435`, source codes AU/US, registry AU. Resolved in DATA-04; current full-regeneration blocker is ID drift (TECH-01).
- Historical catalog audit issues (resolved SE / DE): missing country Erik Olsson `10144`, Sebastian Schober `10541`. Documented before Wave B in `results-import-2026-nice-riviera.md`. These are not Jeremy/Nick conflicts.

For this V1 gate these exact existing issues are non-blocking but **always printed when observed**. New IDs/issues, different countries, malformed/duplicate audit diagnostics fail the gate. If an issue disappears, it is no longer reported; the runner does not fabricate a fixed count. `audit:athletes` keeps its existing exit semantics (may exit 0 with ISSUES); the gate consumes `--json` schemaVersion 1 with `issues`, `info`, `countryConflicts`. Missing photos and untranslated names remain coverage INFO, not a reason to fabricate data. Country provenance diagnostics inspect current generated profiles/results/registry; they do not replace or weaken full-regeneration validation.

### RC verification snapshot — 2026-10-09

Source SHA `a1e69f3740738ee7d29927c62178f5a09e559d88`: `check:release` PASS, 17 checks / 153 unit tests, 21.2 s; `check:release:browser` PASS, 14 suites, 359.3 s. No failures or environment errors in these runs; no expectations changed. Chrome headless against local production build, with each suite's viewport matrix; not a real Android/iPhone Telegram test. News and Feedback browser responses are mocked; no real Turnstile, Telegram send or remote D1 write. Two known country conflicts were visible at that checkpoint; subsequently resolved in DATA-04. This dated evidence does not certify a later code change; documentation edits following these runs do not change application behavior. Live production News ingestion, Android coverage, intermittent direct asset delivery and a D1 restore drill remain unverified/unresolved.

### Kona release closure — 2026-10-12

Production SHA `3861531cac5570765e242e697fcb03dde271dde6`: release completed and iPhone Telegram Mini App manual check PASS, both confirmed by the owner. Preflight `check:release`: 17/17 PASS, 30.2 s, zero observed data issues. The prior dated RC snapshot remains historical evidence, not the current release status. No final browser gate/Android validation is claimed. See [production snapshot and recovery](deployment-cloudflare.md#live-production-and-manual-deployment) and [DATA-03](PROJECT_BOARD.md#recently-completed); TECH-01, TECH-02 and network risks remain open.

### RC browser gate — local production build only

Run `check:release` first. Start this checkout's build with:

```sh
npm run preview -- --host 127.0.0.1 --port 5390 --strictPort
# Separate terminal, macOS example; use an isolated test profile/unused CDP port:
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-first-run --remote-debugging-port=9373 --user-data-dir=/tmp/tri-rc-chrome about:blank
npm run check:release:browser
```

For other systems, launch the installed Chrome/Chromium binary with the same flags. Optional `TRI_APP_URL`/`TRI_CDP_URL` must be loopback HTTP origins; defaults above. Dedicated CDP browser required. Preflight compares served index.html with local dist; missing/stale build, unavailable server/CDP or remote origin stops with ENVIRONMENT ERROR. Each suite gets a fresh page; only pages created during the suite are closed. No retries. More suite uses a bounded readiness wait for lazy Athletes before interacting (the former fixed 700ms could click before the module mounted); all history/scroll assertions remain. Production build freshness relies on running the fast gate first, including for dirty working trees; build metadata is HEAD, not proof of a clean checkout.

Current suites: Calendar, athlete disclosure, athlete search, **updated ranking**, navigation/Results, brand, More, News (mocked), dark-theme text, UI cleanup, image delivery/showcase, code splitting, accessibility, Feedback submission (all config/POST requests mocked). Suites retain their existing viewport matrices, including 390/440/844 landscape/1440 where applicable. No real Feedback browser suite requiring a Worker/database is included. No real Telegram send or Turnstile validation. Browser PASS does not reassess known data; see fast-gate summary. Browser matrix takes several minutes and is separate from the fast gate.

### Historical and full-data checks — not renamed PASS

Run explicitly when investigating their workflows; they are not part of either release gate:

| Command | Classification / current evidence |
| --- | --- |
| `node scripts/test-athlete-localization.mjs` | KNOWN MAINTENANCE LIMITATION: temporary full regeneration fails existing-ID preservation (TECH-01). Jeremy/Nick country conflicts are resolved. No write-mode full regeneration into the real catalog. |
| `node --test scripts/test-athlete-photos.mjs` | HISTORICAL REPLAY + STALE EXPECTATION: 1161/939 versus current 1167/945; Batch 2/3 replay aborts with `Incomplete photo baseline`: saved catalog snapshots lack the six subsequently added athletes, before ranking comparison can complete. No historical fixture rewrite. |
| `node --test scripts/test-athlete-photo-staging.mjs` | Synthetic staging/publish into temp fixtures; passes in reviewed macOS environment. Swift/xcrun decoder is an environment dependency. Also imported by the historical photo suite. |

**Current narrow regression:** `node --test scripts/test-athlete-photo-review.mjs` verifies Franzi ID 172 uses FH and only the rejected association is blocked. Run it separately for photo/review changes; it is not currently listed in the release runner. This does not resolve the extraction risk TECH-02.

Historical photo publication checks require ignored `.athlete-photo-staging` bytes: they may work on an enriched developer checkout but fail ENOENT on a clean checkout. This is an environment/fixture dependency, not permission to redownload or publish anything. Current public photo files, identity mappings and reviewed published bytes are checked independently by the fast gate without ignored staging.

Historical result replay **is retained in the gate** after correcting its invariant. Pre-import catalog from Git `71523cf^` reproduces fixture `oldAthletesSha256` exactly. Its semantic projection `{id,nameEn,gender,countryCode}` is protected by a separate hash; only the same two historical reviewed country reversals are applied. Full old results hash (including IDs/content), source snapshots/proposals and linkage of every old result remain checked. Changes to Russian display names/photos do not invalidate identity. The historical fixture hash is neither replaced nor suppressed.

Sandbox socket/HMR errors are ENVIRONMENT FAILURE. Rerun explicitly in an environment permitting local sockets; do not silently retry with more permissions or report the failed environment as PASS. Live operations, full regeneration, historical photo replay and exploratory ranking/SOF scripts are outside the release allowlist.

## 11. Legacy / do not use

| Команда / файл | Статус и причина |
| --- | --- |
| `npm run import:athlete-photos:all` | LEGACY / incompatible / DO NOT USE: importer требует explicit batch и отклоняет `--all` |
| `npm run collect:sof` | LEGACY/helper; не canonical results importer; не заменяет verified source/SOF proposal review |
| `npm run experiment:ranking` | LEGACY research; не production ranking validation |

Не исправлять/обходить эти ограничения попутно.

## 12. Known caveats

- Athlete append не имеет lock: только последовательные writes, branch/status до и diff после. Full regeneration может перенумеровать generated IDs.
- **FUTURE ARCHITECTURE ISSUE:** result IDs присваиваются по порядку общего results index. Вставка module в середину может сдвинуть последующие IDs. Здесь архитектура не меняется.
- `audit:athletes` может вывести ISSUES с exit code 0. Читать report обязательно; missing photos — INFO, не требование bulk enrichment.
- Full-regeneration validation FAIL из-за ID drift (TECH-01); country conflicts Lara/Jeremy/Nick уже закрыты. Не подавлять FAIL и не расширять allowlists. Historical country labels в release-policy ещё требуют отдельного code maintenance (DOC-02).
- Export name audit перезаписывает рабочий CSV. Не запускать его, пока ручные правки не импортированы/сохранены отдельно.
- Не коммитить локальные `athlete-audit.txt`, `docs/product-readiness-audit.md`, `ranking.txt`, `sof.json` или ignored review artifacts.

## Athlete localization editorial completion

[DATA-ATH-02C policy](athlete-name-localization-policy.md) applies to every athlete creation/import workflow. Missing Russian names are non-blocking, but require editorial review and backlog tracking. Race-result proposal evidence includes `localizationReview`; generated-profile output has a `.localization-review.json` sidecar. Unresolved IDs remain null. After manual/enrichment catalog changes, export a fresh read-only inventory with `node scripts/audit-athlete-display-names.mjs <new-directory>`; never overwrite unfinished owner CSVs. Standings import must not create profiles implicitly or overwrite official source names.


## After-Race Standings Update

Канонический workflow официального T100 TOP 10 после гонки (DATA-07A.2, 2026-11-15). Для routine results/standings применяется облегчённый порядок ниже; исторические release checkpoints и расширенные gates выше сохранены, но не требуют повторного полного gate для каждого такого обновления.

### Разные наборы данных

| Набор | Что обновляем |
| --- | --- |
| Race Results | Полные официальные профессиональные результаты гонки, включая DNF/DNS/DSQ и отсутствующие splits |
| T100 Standings Page | Официальный сезонный TOP 10 MPRO и TOP 10 WPRO |
| TRI Ranking | Собственный рейтинг 300W; формулу не менять при импорте официальных standings |
| PTO World Ranking | Отдельный внешний рейтинг; не источник очков T100 Tour |

### Итерация 1 — данные и owner review

1. Получить свежие официальные [Men's Standings](https://stats.protriathletes.org/t100/standings/men) и [Women's Standings](https://stats.protriathletes.org/t100/standings/women). Проверить сезон и обновление после нужной гонки; сохранить дату проверки и source evidence. Заголовок сезона сам по себе не доказывает учёт последней гонки: при необходимости сверить официальный race-by-race Points breakdown. Не вычислять сезонную сумму самостоятельно.
2. Перенести **ровно первые 10 официальных строк каждого пола**, сохранив позиции, порядок и очки. Равные очки не означают автоматически одинаковые места: сохранить официальное разрешение ties, не пересортировывать.
3. Сопоставить все20 строк с существующими стабильными Athlete IDs, официальной идентичностью и country codes. Использовать существующие одобренные русские имена и флаги, сохраняя исходные имена в evidence. Отсутствующая/неоднозначная TOP10 identity или конфликт страны — STOP для owner review; не создавать профиль неявно. Спортсменов вне TOP10 не создавать только из-за их присутствия в полном источнике.
4. Изменить только таблицы соответствующего сезона в `src/data/officialStandings/t100/`, их source fixture и необходимые replay/tests. Исторические сезоны, IRONMAN, результаты, IDs, UI/navigation и TRI Ranking сохранить. Не запускать полную регенерацию каталога (TECH-01).
5. Сравнить все20 строк с источником, проверить профильные ссылки, русские имена/страны, ties и неизменность истории. Запустить целевые standings-тесты, **один build** и diff check:

```sh
node --test scripts/test-t100-standings.mjs
npm run build
git diff --check
```

`prepare-t100-standings.mjs` — offline replay сохранённых evidence, не live downloader. Без аргументов он печатает JSON; `--out-dir <new-directory>` записывает все шесть таблиц в указанную папку. Сначала обновить и проверить evidence; не направлять replay вслепую в runtime registry и не заменять исторические файлы. Текущий live override — `scripts/fixtures/official-standings/t100-post-dubai-2026.json`; следующий импорт требует нового проверенного snapshot и явного обновления replay, а не повторного использования старых значений.

6. Предоставить один краткий отчёт: сезон/гонка, источник/дата, TOP10 M/W,20 сопоставлений, diff, проверки и исключения. Owner утверждает точный кандидат и ограниченный scope Git/Production следующей итерации. Если официальные standings ещё не обновлены или очки неясны — отложить standings, не оценивать значения и не подставлять нули.

### Итерация 2 — Git и Production

После явного approval кандидата и всей ограниченной последовательности: проверить неизменность diff/base → scoped commit и push → PR/обычный merge согласно действующей branch protection → чистый checkout точного опубликованного SHA → одна Production-сборка и immutable artifact → минимальный preflight → один ручной deployment → короткий read-only live smoke → отчёт SHA/version/deployment IDs. Уже пройденные тесты неизменённых файлов не повторять; финальная сборка нужна для точного commit metadata. Новый конфликт, изменившийся scope или failed check означает STOP и новое решение владельца.

Обязательные safeguards: правильные account/Worker, SHA/version и artifact digest, совместимый rollback baseline, unchanged bindings/secrets/cron, Auto Deploy off и отсутствие конкурирующего publisher. Никаких D1 migrations/writes для статических standings, автоматических retries или rollback. Не запускать GitHub Actions без отдельного разрешения. Preview опционален для routine data-only update; нужен по риску при изменении importer/runtime/UI/infrastructure. Полный browser gate и unrelated suites для обычного TOP10 обновления не обязательны.

Короткий live smoke: нужные сезон/пол,10 строк, официальные очки/порядок, русские имена/флаги, ссылки на профили и отсутствие runtime errors. Deployment выполняется установленной artifact-based процедурой; этот раздел не создаёт нового CLI wrapper и не разрешает публикацию сам по себе.

Предпочтительно включать результаты гонки и standings в **один релиз**, если оба официальных набора доступны, проверены и входят в owner-approved diff. Если standings запаздывают, не задерживать согласованные результаты из-за попытки вычислить недостающие очки: отложенный standings update требует своего утверждённого scope.

## Manual release tooling

POST-DEVOPS-01 candidate: `release:prepare`, `release:preflight`, `release:deploy`, `release:smoke` share an explicit SHA/environment/package contract. See the [canonical manual release CLI](deployment-cloudflare.md#universal-manual-release-cli-post-devops-01) for prerequisites, exact Production/Preview commands, approval boundaries and recovery. `release:qualify` performs read-only validation of an already deployed SHA and cannot authorize a release. `npm run test:manual-release` runs mocked safety tests plus installed-Wrangler credential logging checks with synthetic credentials only. Existing direct deployment commands and historical runbooks remain preserved; do not mix their build-and-upload flow with an already qualified immutable package. Owner acceptance/Git publication of this tooling is pending.

## Unified Iteration 1 preparation (POST-DEVOPS-02A)

Preparation only, pending owner acceptance of the tooling. The following commands run directly in Terminal or under Codex with identical guards. They write a **new external review directory**, not runtime sources, Git commits or deployments. Locked dependencies, Node 24.19.0 and Python 3 (existing Stats PTO parser) are required. Output parent must already exist. No fallback to historical snapshots for live fetches.

```bash
npm run results:prepare -- --url https://stats.protriathletes.org/race/<slug>/<year>/results --race <existing-edition-id> --out /private/tmp/300w-results-review
# Repeat --race for separate M/W editions sharing the exact source URL.
npm run standings:prepare:t100 -- --season 2026 --after-race https://stats.protriathletes.org/race/<slug>/2026/results --out /private/tmp/300w-standings-review
npm run test:sports-prepare
```

Results use the existing `parseStatsPtoResults` / `proposeResults` importer: complete published professional fields, names, countries, times/transitions, source points and DNF/DNS/DSQ are preserved. Series-independent support covers IRONMAN/70.3/Pro Series, T100, Challenge and other races **only when the supported Stats PTO format and an existing, source-mapped edition are present**. Unsupported markup, missing edition, source/date/year/gender mismatch, duplicates or ambiguous identity stop preparation. Existing result editions cannot be overwritten. No automatic event creation or status/SOF changes. SOF proposals and anomalies remain in the review bundle.

`proposal.json` is a staged data proposal, not an already integrated runtime module. `review.md`/`review.json` list counts/statuses, matches, unmatched identities, country/localization proposals, source evidence and blockers. `integrity.json` records the base, all existing IDs, catalog/results hashes and protected source hashes; no IDs are allocated. An unmatched identity is **not** proof of a new athlete. Existing profile URL mappings are checked; conflicting country/profile evidence blocks publication. Missing Russian names remain null for editorial completion (English fallback remains valid). Optional `--review /absolute/proposed-names.json` supplies manually drafted rows `{nameEn, profileUrl, nameRu, countryCode}` for the report only; it neither approves nor applies them. No automatic transliteration.

Optional results `--html /absolute/source.html` is explicitly offline replay, validates canonical URL but does not claim current availability. No server snapshot is silently substituted after a failed live fetch. Review completeness of the official published results even if parsing passes; this tooling cannot prove the source itself omitted no entrants.

T100 fetches both canonical **standings** pages live, verifies the requested season, extracts first 10 source rows without sorting/recalculating ranks/points/ties, and requires existing IDs, gender/country agreement and approved PTO mappings. It emits both HTML snapshots, hashes, `standings-proposal.json` and before/after rank/point triples. It does not create athletes or write historical seasons/TRI Ranking.

**Freshness is a separate check.** A new HTTP response or the correct season heading alone does not prove that a specific race has been incorporated. First pass therefore returns BLOCKED without reviewed post-race evidence. Copy `freshness-template.json`, complete `reviewedBy`, UTC `reviewedAt`, `statement`, and each table's official `evidenceUrl`/`explanation` demonstrating the relevant race is included; retain the exact snapshot hashes and `afterRace` URL. Rerun into a new directory with `--freshness /absolute/reviewed-freshness.json`. The review expires after 24 hours and is invalid if either fetched snapshot changes. Do not mechanically accept an old statement; if official data has not updated, defer. Page markup-only changes also invalidate hashes and need re-review. This conservative restriction avoids reusing the previous race's standings. Freshness review is not release authorization.

IRONMAN Pro Series: only the common review contract `validateStandingsReview` is supplied, with `series`, `seasonYear`, `gender`, `source:{method,url,sha256,observedAt}` and ten `rows:{athleteId,athleteName,officialRank,officialPoints}`. Input methods are `OFFICIAL_WEBSITE`, `OWNER_OFFICIAL_SCREENSHOT`, `REVIEWED_TRANSCRIPTION`; preserve the original official source and screenshot/CSV/JSON hash. Schema validation is not fact verification or editorial approval. No website scraper, OCR, automatic ingestion or new IRONMAN runtime update is implemented; use existing reviewed `prepare-ironman-standings.mjs` workflow for historical replay.

After reviewing the proposal, explicitly integrate the new result module using the existing guarded `import:race-results --write` workflow (above), wire it at the end of the global results sequence, and inspect `find:next-athletes` **read-only**. Only verified genuinely new identities may use its existing `--write --append` path after editorial review. Never invoke `--full-regenerate` (TECH-01). Preserve old Athlete/Result IDs and whole records; apply approved registry names/countries and reviewed edition metadata. T100 proposal rows must be copied only into the selected season's existing schema after freshness/identity review; no automatic bulk overwrite. These integration steps remain manual, not falsely advertised as one-command automation.

Run the relevant importer/standings tests, `audit:athletes`/`audit:results` after runtime integration, stable-ID before/after checks and **one build of that final candidate**. The preparation report marks build NOT RUN; CLI parsing success does not imply tests/build success. Add the actual command results and exact final changed-file inventory to owner review. Prefer one combined results+standings release when both sources are complete/fresh; preserve both bundles and review together. Race Results = full professional fields; T100 Standings = seasonal TOP10 M/W; TRI Ranking = internal formula; PTO World Ranking = separate external dataset.

Iteration 2 starts only after explicit owner approval of exact data, new names/countries and publication scope: protected Git publication → clean exact merged SHA → `release:prepare/preflight/deploy/smoke` (POST-DEVOPS-01). This preparation CLI never calls release commands, Actions, D1 or Git mutations. Any new discrepancy requires STOP and owner decision.

## Approved local runtime integration (POST-DEVOPS-02C)

This extends, rather than replaces, [Iteration 1 preparation](#unified-iteration-1-preparation-post-devops-02a). The earlier paragraph describing manual runtime wiring is the historical 02A limitation; the commands below now provide reviewed automatic wiring for supported existing editions. Nothing here grants Git/deployment approval.

- `npm run sports:prepare -- results ...` is the unified alias of `results:prepare`; `npm run sports:prepare -- t100 ...` is the alias of `standings:prepare:t100`.
- Preparation now seals source snapshots, proposals, integrity and review files in `bundle.json`. Older unsealed bundles are not accepted by the apply workflow; prepare a fresh bundle. T100 bundles additionally retain the hash-bound freshness review, not just its empty template.
- `sports:plan` creates the complete **self-contained local candidate** without changing runtime: it copies the sealed bundles and editorial decisions into `candidate.json`, replays the existing parser/importer in a disposable staging directory, invokes the existing `find-next-athletes --write --append` only there, validates every historical profile/result and generates exact file bytes, before/after hashes, assigned IDs, counts and source warnings.
- `sports:apply` consumes a separately reviewed candidate and approval. It validates digests/scope, exact Git HEAD and a clean runtime/evidence tree, then repeats deterministic staging and compares the whole candidate. No arbitrary supplied TypeScript is executed or copied as an accepted plan. Only reproduced, approved output is installed.

### Plan the exact files for review

After the existing results preparation command, make an **external request JSON**, for example:

```json
{
  "race": {
    "bundle": "/absolute/path/results-review",
    "decisions": {
      "module": "src/data/results/2026/t100/reviewed-race.ts",
      "export": "reviewedRace2026Results",
      "reviewedAt": "2026-11-16",
      "applySof": false,
      "newAthletes": []
    }
  },
  "standings": {"bundle": "/absolute/path/fresh-standings-review"}
}
```

These are placeholders, not an instruction to import any particular race. Include `race`, `standings`, or both; omit absent sections. `module` must be a new result module in the source season and must not collide with existing importer evidence filenames. No new editions are created. Separate M/W editions must already have been included in the preparation bundle.

For each genuinely new source identity, `newAthletes` must include exactly `{nameEn, nameRu, countryCode, profileUrl, identityConfirmed:true}`. The English name/profile URL and explicit two-letter country must match the official snapshot. The owner supplies/reviews the Russian name; no generated transliteration, no approximate identity merge. Unknown, missing-country or conflicting records stop the plan for separate evidence review. Existing approved localization and mapping entries cannot be overwritten. ID allocation uses the existing append-only generator; **full regeneration is never invoked**. All preexisting complete runtime profiles and result records must compare equal, not merely have matching IDs.

`applySof:true` permits source-verified SOF only in the existing current-season SOF map. It does not change dates, gender, status or edition identity. Historical SOF, partial/conflicting existing entries or unsupported TypeScript shapes stop for separate review. New result rows are appended at the end of `allResults` to preserve all historical global Result IDs. No historical season is reordered.

```bash
npm run sports:plan -- --request /absolute/request.json --out /absolute/new-candidate-directory
```

Review `candidate.json` (source snapshots, exact planned bytes/hashes, stable-ID mappings, anomalies and counts), `review.json` and `approval-template.json`. Planning may proceed with explicitly reviewed new identities even when the original preparation report was BLOCKED solely for unmatched athletes; actual source/identity/country conflicts cannot be overridden. Missing source splits remain missing and remain visible as anomalies. Verify official field completeness yourself.

T100 plan re-parses both source HTML files, requires exact TOP 10 agreement, verifies existing IDs, countries and URLs, and accepts only the existing LIVE season. The freshness review must still match both source hashes and be within 24 hours at **apply** time. Stale data requires a new preparation/review, never silent reuse. Historical seasons and TRI Ranking stay unchanged. IRONMAN standings remain review-interface-only; no apply adapter is claimed.

### Owner approval and application

Copy the template to a separate approval file. Fill `approvedBy` and ISO `approvedAt` **only after owner approval of all exact changes**, retaining `action: "APPLY_LOCAL_ONLY"`, `candidateSha256`, and the exact ordered `files` list of paths/before/after hashes. A flag such as `--approved` is not accepted. The local JSON records owner approval; it is not a cryptographic identity signature or an access-control system. Protect both files from unauthorized editing.

```bash
npm run sports:apply -- --candidate /absolute/new-candidate-directory/candidate.json --approval /absolute/owner-approval.json
npm run test:sports-apply
# After actual runtime integration: relevant importer/standings tests,
# audit:athletes, audit:results, one final build and git diff --check.
```

Any change to the candidate, sources, approved file list, Git HEAD or historical runtime baseline invalidates application. Already-imported editions fail; rerunning apply after success fails the clean-tree/baseline guard. Unrelated local runtime/evidence edits are not silently merged. Tooling/documentation work may be uncommitted during qualification; production data work should start from the intended reviewed Git revision.

### Transaction and recovery boundary

All operations and generated records are validated before runtime replacement. An exclusive `.sports-apply.lock` prevents another instance. Files are staged beside their destinations and replaced with atomic per-file renames. A unique external `300w-sports-apply-*` journal holds originals, the exact plan and the outcome. On a caught failure, replaced files are restored and newly added files removed; concurrent unexpected edits are never overwritten during recovery. Empty newly created directories may remain.

Multi-file replacement is **not** an OS-level atomic transaction: termination/power loss can leave a partial set and the lock. Stop other edits, preserve the journal/lock, inspect each destination against the journal's before/after hashes, and obtain a recovery decision before restoring originals/removing newly added paths. Do not rerun apply or clear a stale lock blindly. No automatic recovery across process crashes, Git mutation, publication, D1, network fetch or deployment occurs in apply.

The same commands and review obligations apply with and without Codex. Iteration 1 ends with a locally applied, validated candidate and owner review report. `release:*` operates on an already approved **Git revision** in Iteration 2; `sports:apply` approval never authorizes commit, push, merge or deployment.
