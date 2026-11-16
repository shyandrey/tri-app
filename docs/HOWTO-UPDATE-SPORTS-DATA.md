# Как обновлять результаты и официальные standings 300W

Это инструкция, не разрешение на публикацию. Codex и владелец в Terminal используют одинаковые команды, проверки и границы одобрения. Git/Production разрешаются отдельно либо одним явным разрешением на всю ограниченную Iteration 2. При новом blocker — STOP, без автоматического исправления данных или повторного deployment.

## Подготовка рабочего места

Используйте отдельный checkout актуальной согласованной ветки `preview`, Node 24.19.0, Python 3 и locked dependencies (`npm ci`). Runtime и source-evidence файлы должны быть чистыми. Для новых bundle/candidate/package/evidence выбирайте **новые абсолютные внешние каталоги**; их родительские каталоги должны существовать. Не используйте test-only репозиторий из E2E для реальной работы.

## Iteration 1 — результаты и owner review

Stats PTO — источник профессиональных результатов. IRONMAN/70.3/Pro Series, T100, Challenge и другие серии поддерживаются только при совместимом формате Stats PTO и **уже существующей edition с точным source URL**. Скрипт не создаёт недостающую edition и не угадывает дату/slug.

```bash
npm run sports:prepare -- results \
  --url https://stats.protriathletes.org/race/<verified-slug>/<year>/results \
  --race <existing-edition-id> --out /absolute/new-results-review
```

Повторите `--race` для отдельных MPRO/WPRO editions одного source URL. `results:prepare` — эквивалентный alias. Полные поля и DNF/DNS/DSQ сохраняются; недостающие splits не рассчитываются. `review.json`/`review.md` показывают counts, matches, unresolved identities и anomalies. BLOCKED/exit 1 из-за новых спортсменов — ожидаемая остановка для проверки, а не успешный автоматический импорт.

Проверьте полноту официальной таблицы, точные English names, страны и profile URLs. Для действительно новых спортсменов согласуйте русские имена. Сопоставление по приблизительному сходству, выдуманные страны и полная регенерация каталога запрещены. Отсутствующая/конфликтующая страна требует отдельной проверки источника. Результаты не изменяют proprietary TRI Ranking formula.

## T100 — только сезонный TOP 10 M/W

```bash
npm run sports:prepare -- t100 --season <year> \
  --after-race https://stats.protriathletes.org/race/<verified-slug>/<year>/results \
  --out /absolute/new-standings-review
```

Команда читает официальные `/t100/standings/men` и `/women`, не PTO World Ranking. Первый проход без freshness выдаёт BLOCKED: fetch time не доказывает включение гонки. Проверьте сезон и post-race evidence, заполните копию `freshness-template.json` (`reviewedBy`, `reviewedAt`, `statement`, source evidence URL/explanation), сохранив hashes обоих HTML. Повторите команду в **новый** каталог с `--freshness /absolute/reviewed-freshness.json`. При изменении snapshots или истечении 24 часов требуется новая проверка; нельзя менять дату механически. Если официальные standings ещё не обновились — отложите их, не вычисляйте points самостоятельно.

Сохраняются официальные positions/order/points/ties, existing IDs, русские имена, flags и исторические сезоны. IRONMAN standings пока имеют только reviewed input interface; автоматический apply для них не реализован. По возможности включайте результаты и свежие T100 standings в один кандидат.

## Plan → approval → apply

Создайте внешний request по [точной схеме](scripts.md#plan-the-exact-files-for-review). Он содержит `race: {bundle, decisions}` и/или `standings: {bundle}`. Race decisions: новый module path/export, `reviewedAt`, явный `applySof`, полный `newAthletes` список. Для каждого нового спортсмена: `{nameEn, nameRu, countryCode, profileUrl, identityConfirmed:true}`. Существующие approved имена не перезаписываются.

```bash
npm run sports:plan -- --request /absolute/request.json --out /absolute/new-candidate
```

Plan не пишет в runtime: existing importer и append-only generator работают в staging. Просмотрите `candidate.json` (sources, exact files/hashes, assigned IDs), `review.json`, anomalies и approval template. `applySof:true` поддерживает только verified SOF существующей current-season map; конфликтующие/исторические metadata требуют отдельного решения.

После явного owner approval скопируйте `approval-template.json` в отдельный файл, заполните `approvedBy` и ISO `approvedAt`, не меняя digest, ordered file scope и `APPLY_LOCAL_ONLY`:

```bash
npm run sports:apply -- --candidate /absolute/new-candidate/candidate.json \
  --approval /absolute/owner-approval.json
```

Apply требует тот же Git HEAD и неизменную чистую runtime-базу, перепроверяет источники и воспроизводит exact plan. После apply выполните релевантные importer/standings tests, `npm run audit:athletes`, `npm run audit:results`, stable-ID/source comparison, одну сборку и `git diff --check`. Полный browser gate для обычного data update не нужен; UI smoke должен проверить затронутые страницы. В owner report укажите race/year/source, counts/statuses, новые IDs/имена/страны, standings changes, все файлы и реальные результаты проверок.

## Iteration 2 — только после разрешения на Git и Production

1. Повторно проверьте актуальный `preview`, exact diff и отсутствие конфликтов. При смене runtime-базы не переносите старое approval автоматически.
2. Создайте scoped feature branch, stage только reviewed файлы, commit, push этой ветки и PR в `preview`. Используйте установленный GitHub client/UI и обычные правила защиты; не force-push и не bypass. Merge только если входит в разрешение. Запишите точный merge SHA. Эти действия не выполняются sports CLI.
3. Из чистого checkout **точного одобренного merge SHA** с Node 24.19.0 и Wrangler 4.142.0 подготовьте Production package. Не используйте bundle из `sports:plan` как deployment artifact.

```bash
RELEASE_SHA='<approved full 40-character merge SHA>'
PACKAGE='/absolute/new-production-package'
EVIDENCE='/absolute/new-production-evidence'
npm run release:prepare -- --sha "$RELEASE_SHA" --env production --package "$PACKAGE" --evidence "$EVIDENCE"
DIGEST='<recorded manifest SHA256>'
npm run release:preflight -- --sha "$RELEASE_SHA" --env production --package "$PACKAGE" --digest "$DIGEST" --evidence "$EVIDENCE"
# Только с явным разрешением на этот SHA и Production:
npm run release:deploy -- --sha "$RELEASE_SHA" --env production --package "$PACKAGE" --digest "$DIGEST" --evidence "$EVIDENCE" --authorize "production:$RELEASE_SHA"
npm run release:smoke -- --sha "$RELEASE_SHA" --env production --package "$PACKAGE" --digest "$DIGEST" --evidence "$EVIDENCE"
```

`release:prepare` строит exact Git revision один раз; deploy не перестраивает. Полные prerequisites и security/recovery boundaries: [canonical manual release runbook](deployment-cloudflare.md#universal-manual-release-cli-post-devops-01). Требуются существующая Wrangler authentication и read-only `GH_READ_TOKEN`; секреты не копировать в команды/документы. Обязательны account/Worker identity, bindings/vars/secret names/cron, rollback readiness, D1 Time Travel bookmark, Auto Deploy false и отсутствие конкурирующего publisher. Недоступный preflight — STOP, не обход.

Стандартный `release:smoke` проверяет health/SHA/version, News GET и artifact assets, **не browser navigation**. Выполните короткий read-only browser/owner smoke результатов, новых профилей, flags, standings points/links, исторических сезонов и TRI Ranking; либо используйте отдельно reviewed tracked `--task-smoke` script. Не отправлять Feedback и не писать в D1. Запишите SHA, deployment/version IDs, manifest digest и smoke outcomes. Preview для routine data optional по риску/owner scope; runtime/infrastructure изменения требуют более широких проверок.

## STOP и recovery

- Source placeholder/incomplete, identity/country conflict, missing edition, duplicate import, digest/scope/SHA mismatch — никаких runtime/publication обходов.
- Approval JSON фиксирует решение владельца, но не является цифровой подписью. Берегите candidate/approval от изменений.
- При обычной ошибке apply восстанавливает заменённые файлы. Сохраните внешний `300w-sports-apply-*` journal. При crash/power loss или concurrent edit сохраните также `.sports-apply.lock`; сопоставьте before/after hashes и согласуйте восстановление. Не удаляйте lock и не повторяйте apply вслепую.
- При deployment/smoke failure — сохранить evidence, установить фактический live SHA и STOP. Никаких автоматических retries/rollback; Worker rollback и D1 restore требуют отдельного разрешения.
- Codex выполняет ровно этот workflow; без Codex владелец выполняет те же CLI и проверки. Ручная проверка official sources и owner editorial approval не заменяются автоматизацией.

## Только для тестирования tooling

`node scripts/test-sports-e2e.mjs --out /absolute/new-test-evidence` создаёт отдельный локальный Git repository без remotes, один TEST ONLY commit, test-bound approval и выполняет CLI replay + build. Это **не инструкция для Production**. Fixture outputs, baseline commit и approval нельзя публиковать. Подробности: [offline E2E](scripts.md#test-only-offline-e2e-post-devops-02f).
