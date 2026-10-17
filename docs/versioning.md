# Версии и история релизов 300W

## Источники истины

- [package.json](../package.json): единственное редактируемое значение текущей версии. Сейчас `0.0.0`; повышение до `1.0.0` требует отдельного approval.
- [CHANGELOG.md](../CHANGELOG.md): полная история подтверждённых **нумерованных релизов**, newest first, и pending changes в `Unreleased`. Существовавшие deployment SHA не превращаются задним числом в придуманные версии. В проверенном локальном Git release tags отсутствуют; подтверждённой истории нумерованных публикаций не предоставлено.
- [build-metadata.mjs](../scripts/build-metadata.mjs) читает package и changelog при `npm run metadata`, автоматически перед dev/build. `.generated/build-metadata.ts` используется UI и Worker `/api/health`; `.generated/current-release.ts` содержит только текущие notes. Generated-файлы не редактировать и не коммитить.
- [MorePage.tsx](../src/pages/MorePage.tsx) показывает версию, заголовок и native details/summary, закрытый по умолчанию. История в приложение не включается; Markdown не исполняется как HTML.
- `0.0.0` использует `Unreleased` с явной пометкой предварительной версии. Любая другая версия требует соответствующего раздела changelog; при его отсутствии metadata/build завершается ошибкой.

## Политика SemVer

Используем стабильные `MAJOR.MINOR.PATCH` без ведущих нулей. Первый публичный релиз — `1.0.0` только после согласования. PATCH — совместимые исправления; MINOR — совместимые пользовательские возможности; MAJOR — несовместимые изменения публичного поведения/API или контрактов данных. Pre-release/build suffix пока не поддерживается валидатором; введение требует отдельного изменения и тестов. Внутренний commit или deployment не обязывает повышать версию. Hotfix опубликованной версии получает новый PATCH, существующий tag не перемещается.

Commit — снимок исходников. Deployment — установленный Worker/build, имеет собственные version/deployment IDs. Release — согласованная публикация продукта с SemVer, notes, immutable Git tag и проверенным SHA. Одна версия может иметь несколько deployment IDs, например из-за secrets; это не новые продуктовые релизы.

## Формат changelog и подготовка notes

Сначала `## [Unreleased]`, затем `## [X.Y.Z] — YYYY-MM-DD` в обратном порядке дат. Каждый раздел содержит ровно один `Title: ...` (короткая русская аннотация), затем нужные `### Added`, `### Changed`, `### Fixed`, `### Technical` и plain-text строки `- ...`. Не использовать вложенные списки, Markdown/HTML в notes или произвольные подразделы. Не дублировать тексты notes в UI. Для опубликованных разделов обязательны `SHA: <40 lowercase hex>` и `Tag: vX.Y.Z`; при подготовке release commit разрешена символическая ссылка `SHA: tag:vX.Y.Z` (разрешается через Git tag, не случайный/предыдущий SHA); в Unreleased этих полей нет. Названия секций переводятся UI, текст пунктов выводится буквально.

Вносить только проверенные изменения, не секреты и не личные данные. Текущий Unreleased описывает подготовку первой публичной версии; он не свидетельство её публикации. При выпуске переносить согласованные notes в раздел версии, а Unreleased оставлять для дальнейшей подготовки (например Technical: «Новые изменения пока не запланированы»). Исторические разделы сохранять; исправления ошибочных notes проводить отдельным документированным commit.

## Release checklist и SHA/tag traceability

1. Согласовать scope, версию и release notes; прочитать [Project Board](PROJECT_BOARD.md), зафиксировать Production baseline. Выбрать плановую дату публикации; до Production acceptance это план, не утверждение о состоявшемся релизе.
2. Обновить `package.json.version`, `package-lock.json.version` и `package-lock.json.packages[""].version` одинаково, без изменения зависимостей. Сейчас все три значения остаются `0.0.0`; повышение требует отдельного approval.
3. Подготовить окончательные пользовательские notes в `CHANGELOG.md`, раздел версии с плановой датой, `Tag: vX.Y.Z` и `SHA: tag:vX.Y.Z`. Оставить Unreleased для следующих изменений. Символическая ссылка решает невозможность записать SHA commit внутрь самого себя; она не означает, что tag уже существует или релиз опубликован.
4. Выполнить metadata generation, versioning/Foundation tests, build, release gate и browser checks. Сверить версии package/lock/UI/API, notes и diff. Все тестовые будущие релизы — независимые fixtures; реальная история не дополняется синтетическими записями.
5. После review и отдельного разрешения commit/push зафиксировать release changes. Полученный SHA назвать **R** и записать в deployment approval. Никаких новых code/config commits поверх R между Preview и Production.
6. После Preview approval подтвердить `git rev-parse HEAD` = R, чистый tracked tree и правильные bindings. Выполнить `npm run deploy:preview`, затем `npm run check:preview -- --expected-sha <R>`. Проверить, что build не получает чужой SHA через BUILD_COMMIT/CF_WORKERS_BUILD_COMMIT/CF_PAGES_COMMIT_SHA/GITHUB_SHA; production identity берётся из фактического build metadata, а не из символической ссылки changelog.
7. Выполнить Preview UI/device review и получить отдельное owner approval Production deployment именно R. Исправления требуют нового reviewed SHA, повторных checks и Preview review.
8. Непосредственно перед Production повторно подтвердить HEAD = R, чистый tracked tree, согласованную ветку/remote, Production baseline, secrets/bindings и изоляцию Preview. Если checkout уже другой — STOP; не выполнять deployment из нового HEAD и не отбрасывать локальные изменения ради R.
9. Выполнить один отдельно разрешённый `npm run deploy:production` из R. Не создавать документационный commit до этой операции. Не выполнять миграции, seed или secret changes ради версии.
10. Выполнить `npm run check:production -- --expected-sha <R>`, проверить UI/API version, assets, News/Feedback и owner E2E. Записать фактическую дату, Worker version/deployment IDs. При ошибке STOP; без автоматического повторного deploy или rollback.
11. Только после успешных Production checks и owner acceptance, с отдельным разрешением tag/push, создать annotated tag `vX.Y.Z` на **явно указанном R**, затем отправить именно этот tag. Проверить `git rev-parse vX.Y.Z^{commit}` = deployed SHA R. Не использовать неявный HEAD, не заменять и не force-push существующий tag. Tag message должен содержать фактическую дату выпуска. Существующий несовпадающий tag — STOP.
12. После публикации отдельным documentation-only commit записать completion evidence и заменить `SHA: tag:vX.Y.Z` на точный R в changelog. Если фактическая дата отличается от плановой, уточнить дату и сохранить порядок newest first; аннотацию и пользовательские notes не менять незаметно. Этот commit **D не является deployment target**: Production остаётся на R, tag остаётся на R. D не требует второго production deployment; дальнейший выпуск выбирает новый target отдельным approval.

До завершения шага 11 запись версии — release candidate, не evidence публикации. Build parser проверяет формат, но не существование tag, истинность даты или согласование публикации. После шага 12 репозиторий содержит точный исторический SHA и фактическую дату. Изменение только SHA/date metadata не меняет сгенерированные пользовательские notes; build commit identity при сборке D всё равно стал бы D, поэтому D не развёртывается под видом R. Rollback ограничения ниже остаются обязательными.

## Команды и проверка

Из корня репозитория:

```sh
npm run metadata
node --test scripts/test-versioning.mjs
npm run test:foundation
npm run check:release
npm run check:release:browser
```

Release gate включает build, ESLint и versioning tests. Browser gate требует заранее запущенные локальный build preview и Chrome CDP; процедура в [scripts.md](scripts.md). More browser suite проверяет default collapsed, keyboard Enter, click toggle и адаптивные размеры. В репозитории нет `npm run check`; не подменять отсутствующую команду молча.

После отдельного deployment approval используются существующие команды:

```sh
npm run deploy:preview
npm run check:preview -- --expected-sha <R>
npm run deploy:production
npm run check:production -- --expected-sha <R>
```

Это не разрешение выполнить deployment. Следовать [production runbook](deployment-cloudflare.md): окружения изолированы, не менять News/Feedback secrets, D1 или webhook ради версии. Сверить More и GET `/api/health` с package.json в R; проверить полный asset download. Проверить `git rev-parse vX.Y.Z^{commit}` = R и окончательный SHA в changelog. Проверить обе темы/мобильные устройства отдельно; Desktop browser PASS не означает Telegram device PASS.

## Rollback и hotfix

Worker rollback — отдельная одобренная операция по [runbook](deployment-cloudflare.md), с проверкой известных-good bindings/secrets. Возвращается весь согласованный build, включая старую версию UI/API; не исправлять одну строку версии поверх чужих assets. Не переписывать tags и не удалять прошлые release notes. Откат Worker не откатывает D1: recovery данных требует отдельного плана/approval. После отката записать инцидент в Unreleased, подготовить новый PATCH с новыми SHA/tag и пройти Preview/Production checks. При несовпадении версии, notes, health SHA, tag или bindings — STOP до выяснения.
