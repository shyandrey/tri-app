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

## 2. Import new race results

```sh
npm run import:race-results -- --url '<verified Stats PTO URL>' --race '<editionId>'
# Только после review:
npm run import:race-results -- --url '<verified Stats PTO URL>' --race '<editionId>' --write --out 'src/data/results/<year>/<new-module>.ts' --export '<exportIdentifier>'
```

Первый запуск DRY-RUN: читает verified Stats PTO HTML, существующие editions/results/catalog. `--html <snapshot.html>` позволяет читать локальный HTML вместо network; canonical URL всё равно проверяется. `--race` можно повторить для отдельных gender editions. WRITE создаёт новый TS module и JSON/HTML evidence в `scripts/fixtures/result-imports/`; существующие файлы не перезаписывает.

Importer **не создаёт RaceEdition, не подключает module и не создаёт athlete profiles**. Edition и её verified source URL должны уже существовать. Review: edition/date/gender, identities, anomalies, SOF proposal и source evidence. SOF применять к нужной edition отдельно после проверки, не перезаписывать conflicts. Anomalies нельзя автоматически «исправлять» выдуманными результатами.

Затем вручную подключить export в results index, выполнить discovery из следующего раздела и `npm run audit:results` (читает общий runtime results/catalog/editions, не пишет; проверить весь report), `npm run audit:athletes`. Включение module влияет на global result IDs — см. §12.

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

Full regeneration перестраивает список из results минус curated/verified identities и назначает `10000 + index`. `--output` направляет запись в указанный файл; без него обе write-команды заменяют настоящий generated catalog. Сначала использовать temporary output, затем отдельно review ID/linkage diff; не переносить результат автоматически. Известные country conflicts Jeremy Maclean AU/US и Nick Thompson US/AU остаются блокирующими проверками full regeneration, не PASS.

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

Preview protected Feedback активен: Turnstile, native rate limiter, D1-first save, Telegram delivery, retry cron. `npm run test:feedback` — INTERNAL TEST; генерирует ignored build metadata, использует локальные tests/fixtures, не отправляет реальный report. `node scripts/test-feedback-browser.mjs` и `node scripts/test-feedback-submission-browser.mjs` — локальные browser tests; требуют setup из файлов, создают test artifacts, не доказательство real Turnstile happy path.

После Feedback changes review сохранности формы, single-submit, errors/retry и privacy. Реальный E2E создаёт D1 report и Telegram notification и требует отдельного разрешения; это не read-only health check. Secrets только server-side. Настройка описана в [feedback.md](feedback.md); не менять cron/keys/bindings в scripts maintenance.

## 9. Preview deploy

```sh
npm run deploy:preview:dry -- --keep-vars
npm run deploy:preview -- --keep-vars
npm run check:preview
```

Dry — DRY-RUN remote deployment, но WRITE локального build/metadata/Wrangler artifacts; читает checkout/config/assets и проверяет preview bundle. Review Worker `tri-app-preview`, DB `tri-app-preview`, diff/build identity. Вторая команда — **REAL REMOTE WRITE**, только после отдельного разрешения; публикует текущий checkout, а не гарантированно чистый commit. `--keep-vars` сохраняет dashboard-managed vars; не заменяет review config и не применяет migrations.

Последняя команда READ-ONLY GET `https://preview.300w.app/api/health` и `/api/news`; review deployed SHA/status/items. Fallback `https://tri-app-preview.shy-andrey.workers.dev`. Production shortcut намеренно отсутствует; future `300w.app` environment не готов. [Deployment details](deployment-cloudflare.md).

## 10. Release checks

Команды ниже проверяют checkout; не deploy. Сначала выбрать relevant suites, не запускать все scripts wildcard: среди них есть writers.

| Команда | Читает / пишет / review |
| --- | --- |
| `node --test scripts/test-find-next-athletes.mjs scripts/test-race-result-import.mjs` | INTERNAL TEST, синтетические/temp fixtures; source не меняет; review CLI/identity/import failures |
| `node --test scripts/test-athlete-names.mjs scripts/test-athlete-search.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs scripts/test-navigation.mjs` | INTERNAL TEST, source/runtime и временные fixtures; проверить failures и unchanged ranking/linkage |
| `npm run audit:athletes` / `npm run audit:results` | READ-ONLY runtime audit; прочитать весь report, не только exit code |
| `npm run test:foundation` / `npm run test:feedback` | INTERNAL TEST; ignored metadata и local fixtures; review API/schema/security failures |
| `npm run build` | WRITE metadata/dist и compiler artifacts; читает app/Worker/assets; review type errors, chunk graph/warnings |
| `node --test scripts/test-initial-graph.mjs` | READ-ONLY production graph после build; review cold Home dependency closure |
| `npm run lint` / `git diff --check` | READ-ONLY; review ошибки и warnings, не скрывать failures |
| `npm run cf:check` | DRY-RUN, local bundle/build artifacts; default/local target, **не проверка live preview** |

Relevant browser tests запускать по setup в соответствующем файле на local dev/preview server; они могут писать screenshots/.generated artifacts. Review visual/navigation/Back/deep links. Metadata сообщает HEAD даже для dirty build. Known failures указывать отдельно, не выдавать за PASS.

## 11. Legacy / do not use

| Команда / файл | Статус и причина |
| --- | --- |
| `npm run import:athlete-photos:all` | LEGACY / incompatible / DO NOT USE: importer требует explicit batch и отклоняет `--all` |
| `npm run collect:sof` | LEGACY/helper; не canonical results importer; не заменяет verified source/SOF proposal review |
| `npm run experiment:ranking` | LEGACY research; не production ranking validation |
| `scripts/test-ranking-browser.mjs` | INTERNAL TEST со stale expectations; не release gate до отдельного fix |

Не исправлять/обходить эти ограничения попутно.

## 12. Known caveats

- Athlete append не имеет lock: только последовательные writes, branch/status до и diff после. Full regeneration может перенумеровать generated IDs.
- **FUTURE ARCHITECTURE ISSUE:** result IDs присваиваются по порядку общего results index. Вставка module в середину может сдвинуть последующие IDs. Здесь архитектура не меняется.
- `audit:athletes` может вывести ISSUES с exit code 0. Читать report обязательно; missing photos — INFO, не требование bulk enrichment.
- Jeremy Maclean AU/US и Nick Thompson US/AU блокируют full regeneration validation. Не исправлять данными «по догадке», не подавлять и не считать PASS.
- Export name audit перезаписывает рабочий CSV. Не запускать его, пока ручные правки не импортированы/сохранены отдельно.
- Не коммитить локальные `athlete-audit.txt`, `docs/product-readiness-audit.md`, `ranking.txt`, `sof.json` или ignored review artifacts.

Текущая дополнительная тестовая оговорка: `test-race-result-import.mjs` сравнивает полные athlete objects с историческим `oldAthletesSha256`; этот assertion сейчас падает. Проверка сохранности старых results rows/IDs перед ним проходит. Fixture здесь не обновляется и failure не подавляется.
