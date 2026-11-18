# Recovery storage — POST-03A/B

Проверено 2026-11-17. Это запись локального backup/cleanup, не разрешение на deployment, rollback, D1 restore или дальнейшее удаление.

## Проверенные пакеты

Приватный локальный корень: `~/300W-Recovery/`. Структура: `<environment>/<full-source-SHA>/package/`, рядом `evidence/`, `manifest.sha256`, `backup-inventory.json`.

| Назначение | Environment / source SHA | Файлов в manifest | Результат |
| --- | --- | --- | --- |
| Текущий Production | production / `a0dc39d09abcfa817df6b2887f21ad13f7d2b09a` | 739 | PASS |
| Предыдущий Production | production / `7b642c56b7c65ff97f862a3b52282cd657b2b003` | 739 | PASS |
| Текущий Preview | preview / `60344fc996ab1153cc6326a07227facccae41d14` | 739 | PASS |
| Предыдущий Preview | preview / `c329af8f15fb14c40f393d3652f700cf9868a904` | 736 | PASS |

Все версии — 1.0.1. Source/destination file hashes и manifests совпали; Worker/environment проверены. У legacy Preview manifest нет поля environment: окружение подтверждено его сохранённым Wrangler config, не добавлено в оригинал. Копии повторно проверены после cleanup. Права каталогов `0700`, файлов `0600`.

Сохранены operational Wrangler configs, deployment/version IDs, доступные D1 bookmark metadata, readiness/smoke JSON и screenshots. JSON evidence очищены от credential fields; raw credential stores, browser profiles и raw logs в backup не включались. Оригинальные packages/evidence не изменялись. Private inventory и cleanup report находятся в backup root, не в Git.

## Ограничения и восстановление

Backup находится **на том же компьютере**: это защита от временной очистки, не от потери диска/устройства. Следующий шаг — отдельно согласованная независимая **зашифрованная** копия с проверкой hashes и чтения после восстановления. Не считать её существующей до проверки.

D1 bookmark — metadata для Time Travel, не бессрочный backup и не подтверждение restore drill. Worker package не содержит backup D1. Перед recovery заново проверить live baseline, доступность rollback version, совместимость bindings/vars/secret names/cron и срок доступности Time Travel. Новые секреты в Git или пакет не добавлять. См. [deployment/recovery runbook](deployment-cloudflare.md).

Копированные operational configs сохраняют исходные абсолютные package paths. Перед будущим восстановлением подготовить отдельный config с путями к проверенной копии, сверить target и digest; не запускать старый config вслепую и не редактировать immutable package.

## Cleanup и оставшиеся риски

POST-03B удалил только шесть approved ignored `dist` directories. Удалённые allocated blocks: 571.56 MiB; observed free-space delta: 573.33 MiB (возможны фоновые изменения filesystem). Три Chrome profiles пропущены из-за symlink. Repository files, исходные packages, Git stores, worktree registrations, shared dependencies, screenshots/logs вне profiles сохранены.

POST-03A выявил missing blobs в старом `300w-data05-candidate` shared store с зависимостью через alternates от неполного исторического checkout. Актуальный `300w-post-devops02e` store прошёл connectivity check. Dirty candidates и старые локальные ветки требуют отдельного preservation review; ancestry опубликованных commits не доказывает сохранность uncommitted edits.

Многие worktrees используют общий `node_modules` через symlink. Нельзя удалять parent checkout/object store/dependency directory без карты зависимостей и verified backup. Не выполнять `git prune/gc/reset/clean` как часть обычной очистки. Следующая фаза требует отдельного scope/approval; массовое удаление пока не квалифицировано.
