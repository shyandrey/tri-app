# Photo pilot: manual approval and production publication

Проверено 2026-09-24T14:56:16.430Z. Пользователь явно одобрил все 16 просмотренных staging-файлов и их SHA-256. Повторных discovery/download не было.

## Результат

16/16 опубликованы. Registry 149 → 165; production files 149 → 165. Coverage 149/1161 (12,83%) → 165/1161 (14,21%). Без фото 1012 → 996. Все 16 runtime profiles получают новые image paths.

| Athlete | Production path | SHA-256 |
|---|---|---|
| Harry Palmer | /athletes/harry-palmer.png | `32bc7361c3496774d861c2b8446a2b42d7e448318016385993e375a41b577d8a` |
| Panagiotis Bitados | /athletes/panagiotis-bitados.png | `20b1a4b67df51c762a5d7860a4ba7c1ab463b1db3422113dd97bc07552ec21bc` |
| Justus Nieschlag | /athletes/justus-nieschlag.png | `36a7cc10fbc0ffdd253b1d299aa488c38c4c8e7beb59614e6efecd2f42ee0360` |
| Pierre Le Corre | /athletes/pierre-le-corre.png | `67f8e7e208603f4aa6d208cbd12a7d17431aa68a15dc0167d60b2c4a440aa8a7` |
| Alistair Brownlee | /athletes/alistair-brownlee.png | `da5aa5719baf9bde507d83d763025570aa7b4733efd7d185c3e990f1647e57a4` |
| David McNamee | /athletes/david-mcnamee.png | `7c9d48d15bf259e174cc7824ee0c5df9daf406a449910d473a22d69b0cf9b9e7` |
| Nicolas Mann | /athletes/nicolas-mann.png | `013a30a6307fe3bc773343b034a7ecaada7ad42765cd03a73fe3ce046807904b` |
| Emma Pallant-Browne | /athletes/emma-pallant-browne.png | `1480a61ed60cd2c62f803d003111262d93a5bd41dd229dd09a260bf0c151dc7e` |
| Anne Reischmann | /athletes/anne-reischmann.png | `d9717e69e0120823a5158120a89074f673a7206c92c255a7e6e131e433b27de5` |
| Nikki Bartlett | /athletes/nikki-bartlett.png | `6222909c5c86a88e58572fd98af78bbdf36b36daf3af4c12f854d6aa9b10ee55` |
| Laura Madsen | /athletes/laura-madsen.png | `80b74cff4861128337412649c799b520e9c0f1ac85030b9cbea176256d6715fb` |
| Anne Haug | /athletes/anne-haug.png | `2357b451a9aff4e6b179c3d5f85f8aac244c559b28e6c722dc0b185b6cb40ec2` |
| Alice Alberts | /athletes/alice-alberts.png | `159ce04fd9745ad39fd0a7e96ddf0ecad7004b4751dbb07f378c51d217bb7ac1` |
| Laura Jansen | /athletes/laura-jansen.png | `876e599237e667dc4ab0440ae6366a605eeda6a6cadbdcc3653accd3860e2d7e` |
| Lisa Becharas | /athletes/lisa-becharas.png | `8637343144e3205570ec85077db311d1bc2c9c0606a9b3c11ff362935765f9b4` |
| Nina Derron | /athletes/nina-derron.png | `abe0ac980a7df6709300175162f4513436f5685bf14c39fc0d6dd244cd469c5c` |

## Evidence и безопасность

Для каждого файла published bytes побайтово равны manually reviewed staging bytes. Evidence содержит identity, profile/image source URLs, checkedAt, reviewedAt, manual-visual-review, confidence, APPROVED, SHA-256 и production local path. ReviewedAt — время фиксации пользовательского approval; точное время просмотра не выдумывалось.

Слабые dHash findings сохранены вместе с явным byte-bound решением принять визуально одобренные пользователем фотографии. Точные дубликаты, одинаковые decoded pixels и новые нерассмотренные similarity findings по-прежнему блокируют publish. Исходным 149 фотографиям provenance не добавлялся.

Старые 149 production photos и bundled athlete assets побайтово неизменны, включая Mika Noodt, Jelle Geens и Kristian Blummenfelt. Проверены текущий pre-publish baseline и сохранённый pre-staging baseline.

Агрегатный SHA-256 карты хешей старых 149: before = after = b7e0d11a2e13249c86f0f8a142b6741dded3bb11295a09c68e99d4d84222ebcb.

## Проверки

Photo audit: 165 entries, 165 files, 0 issues: missing/orphans/duplicate paths/SHA/slug collisions не обнаружены. Blummenfelt dual-source остаётся прежним известным случаем.

node --test scripts/test-athlete-photos.mjs: 27/27. node --test scripts/test-athlete-photo-staging.mjs: 11/11. Rollback после записи files/registry проверен в изолированных каталогах. Runtime/coverage/hash assertions также выполнялись внутри реальной транзакции до завершения, с rollback при ошибке.

audit:athletes — прежние 2 missing-country issues (Erik Olsson, Sebastian Schober); audit:results — 0 errors / 0 warnings, 52 documented source notes. Ranking order/scores и result linkage совпали при фиксированном asOf. Countries, localization, race results и UI не изменены.

Staging сохранён, /.athlete-photo-staging/ добавлен в .gitignore. Git add/commit/push не выполнялись. Следующий batch не запускался; pilot готов к финальному review.

Связанные артефакты: [discovery](athlete-photo-pilot-discovery.json) → [staging](athlete-photo-staging-validation.json) → [manual approval](athlete-photo-pilot-manual-review.json) → [reviewed manifest](athlete-photo-pilot-reviewed-manifest.json) → [production validation](athlete-photo-pilot-publish-validation.json).
