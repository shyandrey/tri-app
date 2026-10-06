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

## 10. V1 release checks

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

Two different groups are observed, **four issues total**, not one interchangeable pair:

- Country provenance conflicts: Jeremy Maclean `10235`, source codes AU/US, registry US; Nick Thompson `10435`, source codes AU/US, registry AU. These still block full regeneration.
- Existing catalog audit issues: missing country Erik Olsson `10144`, Sebastian Schober `10541`. Documented before Wave B in `results-import-2026-nice-riviera.md`. These are not Jeremy/Nick conflicts.

For this V1 gate these exact existing issues are non-blocking but **always printed when observed**. New IDs/issues, different countries, malformed/duplicate audit diagnostics fail the gate. If an issue disappears, it is no longer reported; the runner does not fabricate a fixed count. `audit:athletes` keeps its existing exit semantics (may exit 0 with ISSUES); the gate consumes `--json` schemaVersion 1 with `issues`, `info`, `countryConflicts`. Missing photos and untranslated names remain coverage INFO, not a reason to fabricate data. Country provenance diagnostics inspect current generated profiles/results/registry; they do not replace or weaken full-regeneration validation.

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
| `node scripts/test-athlete-localization.mjs` | KNOWN DATA ISSUE: full regeneration to a temporary file aborts for Jeremy/Nick conflicts. Validation remains unchanged; no production regeneration. |
| `node --test scripts/test-athlete-photos.mjs` | HISTORICAL REPLAY + STALE EXPECTATION: 1161/939 versus current 1167/945; Batch 2/3 replay aborts with `Incomplete photo baseline`: saved catalog snapshots lack the six subsequently added athletes, before ranking comparison can complete. No historical fixture rewrite. |
| `node --test scripts/test-athlete-photo-staging.mjs` | Synthetic staging/publish into temp fixtures; passes in reviewed macOS environment. Swift/xcrun decoder is an environment dependency. Also imported by the historical photo suite. |

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
- Jeremy Maclean AU/US и Nick Thompson US/AU блокируют full regeneration validation. Не исправлять данными «по догадке», не подавлять и не считать PASS.
- Export name audit перезаписывает рабочий CSV. Не запускать его, пока ручные правки не импортированы/сохранены отдельно.
- Не коммитить локальные `athlete-audit.txt`, `docs/product-readiness-audit.md`, `ranking.txt`, `sof.json` или ignored review artifacts.
