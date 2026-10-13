# 300W — руководство владельца по обслуживанию

Согласовано владельцем вместе с практическим walkthrough, 13.10.2026. Здесь описаны реальные файлы и команды проекта. Это инструкция для будущих согласованных изменений, а не разрешение сейчас выполнять deploy или менять данные. [Доска задач](PROJECT_BOARD.md) хранит статус работы; подробные технические ограничения — в [руководстве разработчика](maintenance-developer.md).

## Три разных места работы

- **Локально:** файлы на вашем Mac. `npm run dev` запускает Vite; откройте адрес, напечатанный Terminal. Сохранение в VS Code обновляет локальный интерфейс. Это не Cloudflare.
- **Cloudflare Preview:** `https://preview.300w.app`, Worker `tri-app-preview`, отдельная D1. Только preview deployment публикует локальную сборку сюда.
- **Production:** `https://300w.app`, Worker `tri-app`, отдельная D1. Это публичный Mini App через `@tri_app_bot`; production News/Feedback использует `@tri_app_prod_bot`.

`npm run preview` — локальный сервер готовой сборки, **не публикация на Cloudflare Preview**. Commit сохраняет историю Git, push отправляет её на GitHub; сами по себе они сейчас не выполняют deployment.

## Общий порядок ручной правки

Этот порядок — часть каждой операции ниже; разделы указывают дополнительные проверки и файлы для commit.

1. В Terminal из папки проекта выполните `git branch --show-current` и `git status --short`. Рабочая ветка — `home-redesign-experiments`. Не трогайте чужие modified/untracked файлы.
2. В VS Code откройте точный файл через Cmd+P; Cmd+F найдите указанный ниже ключ. Редактируйте только свойство нужной записи, сохраняя кавычки, запятые и скобки. Cmd+S сохраняет файл.
3. Запустите `npm run dev`, проверьте страницу локально. Для code/data patch выполните проверки из соответствующего раздела, `npm run build`, `npm run lint`, `git diff --check`. Release gate `npm run check:release` уже включает build/lint: после него без новых изменений повторять их не нужно.
4. Просмотрите `git diff -- <путь>` и Source Control. Если значения/ID за пределами задания изменились — остановитесь. Не обновляйте snapshot лишь ради PASS.
5. После review и отдельного разрешения на commit используйте точные пути, например для согласованной editorial-правки:

```sh
git add src/data/athletes/men.ts
git diff --cached
git diff --cached --check
git commit -m "Update reviewed athlete biography"
git push origin home-redesign-experiments
```

Для другой операции замените путь и сообщение на соответствующие **просмотренному diff**. Не используйте `git add .`. Не включайте `athlete-audit.txt`, `docs/product-readiness-audit.md`, `ranking.txt`, `sof.json` или личные CSV/backup.

6. После разрешения на Preview следуйте разделу «Публикация» в конце. Проверяйте именно изменённую страницу на телефоне и desktop, а не только health.
7. **Отмена неудачной локальной правки:** сначала Cmd+Z в VS Code и сохранение. Если нужно вернуть файл к HEAD, предварительно сохраните копию своих нужных изменений вне репозитория и проверьте `git diff -- <путь>`. В Source Control можно отменить только свой просмотренный участок. `git restore -- <путь>` уничтожает все незакоммиченные изменения этого файла — используйте только когда уверены, что они все ваши и больше не нужны. Если файл staged, сначала `git restore --staged -- <путь>` снимает staging, но не отменяет содержимое. Не используйте reset --hard/clean. Для уже опубликованного commit нужен отдельный reviewed revert; локальная отмена не откатывает Cloudflare.

## 1. Добавить гонку или ежегодную edition

**Где:** [src/data/races.ts](../src/data/races.ts), [raceIdentity.ts](../src/data/raceIdentity.ts), [raceEditions.ts](../src/data/raceEditions.ts); архивы перечислены в developer guide. Найдите существующую гонку по названию и стабильному raceId, затем год/edition. Данные организатора допустимы для календаря; результаты и спортсмены подчиняются [политике источников](scripts.md#data-source-policy).

Реальный фрагмент текущей записи, используйте как образец структуры, а не как данные новой гонки:

```ts
id: 1,
name: 'ANZCO Foods IRONMAN New Zealand',
series: 'IRONMAN Pro Series',
distance: 'IRONMAN',
date: '7 марта',
dateISO: '2026-03-07',
country: 'Новая Зеландия',
city: 'Таупо',
```

Можно подготовить новую запись с проверенными названием, датой, местом, дистанциями, gender и sourceUrl. Нельзя копировать ID или выдумывать дату. Сначала согласуйте новый свободный numeric ID и mapping; новая ежегодная edition обычно использует прежний permanent raceId. Текущие editions выводятся из текущих races, а архивные имеют другую интеграцию: универсального «добавить год одной строкой» нет.

**STOP:** нет однозначного соответствия race/edition, источник противоречит другому, требуется смена сезона. Для 2027 используйте [утверждённую policy](season-transition-2026-2027.md); её реализация ещё не выполнена. T50/Challenger/WTCS не добавлять, отдельный фильтр Roth не создавать.

**Проверка/публикация:** `node --test scripts/test-calendar.mjs`, `npm run audit:results`, общий порядок выше. В Preview проверить фильтры года/серии/пола, карточку, deep link, Back. Commit включает только reviewed race/mapping/integration files; результатам и атлетам эта операция не должна менять ID.

## 2. Дата, место и карточка гонки

Найдите название в `src/data/races.ts` (для старого года — соответствующий archive). Редактируйте одновременно `date` и `dateISO`; для места — `city`, `country`. Пример выше показывает точные поля. Не меняйте `id`, series, gender, distance, splits или результаты для исправления опечатки города.

Карточка получает эти значения из данных. [src/components/RaceCard.tsx](../src/components/RaceCard.tsx) — оформление, а не отдельная копия календаря. В VS Code ищите имя отображаемого prop, если задача действительно про текст компонента. Не заменяйте native button на div и не добавляйте вложенную вторую кнопку.

Отдельного универсального поля cancelled/postponed сейчас нет: отмена гонки требует review модели; не удаляйте edition с результатами. Дата влияет на upcoming/finished и может влиять на ranking clock.

### Walkthrough: изменить дату текущей гонки

1. До правки запишите URL и подтверждённую новую дату; проверьте год и категорию. Пример поиска: Cmd+P → `src/data/races.ts`, Cmd+F → `ANZCO Foods IRONMAN New Zealand`. В этой записи сейчас `id: 1`, `date: '7 марта'`, `dateISO: '2026-03-07'`. Это существующие данные для ориентира, не предложение перенести эту гонку.
2. Замените только значения `date` (русская подпись) и `dateISO` (`YYYY-MM-DD`) на одну и ту же проверенную дату. Сохраните Cmd+S. Для текущей записи `raceEditions.ts` получает оба поля из `races.ts`: вторую копию редактировать не нужно. Год за пределами текущего сезона, архивная или специальная Roth edition требуют отдельного разбора по developer guide — не переносите этот пример на них автоматически.
3. В Terminal VS Code (`Terminal → New Terminal`) запустите `npm run dev`; оставьте сервер работающим, а проверки выполняйте во втором Terminal. Откройте напечатанный локальный URL → Календарь → нужную гонку. Проверьте подпись даты, фильтр года, Detail и Back. Home может скрыть прошедшую гонку — её отсутствие там не доказывает ошибку. Смена даты уже завершённой гонки может законно изменить ranking clock: такой эффект требует review.
4. Выполните:

```sh
node --test scripts/test-calendar.mjs
npm run audit:results
node --test scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs
npm run build
npm run lint
git diff -- src/data/races.ts
git diff --check
```

Для простой даты diff должен содержать только два согласованных значения. Не менять ID, порядок записей, результаты и ожидания tests ради PASS. При неожиданном FAIL остановиться и сохранить вывод.

5. После review и разрешения на commit (сначала убедитесь через `git diff --cached`, что чужие файлы не staged):

```sh
git add src/data/races.ts
git diff --cached
git diff --cached --check
git commit -m "Correct verified race date"
git push origin home-redesign-experiments
```

6. После отдельного разрешения выполните Preview-последовательность из раздела 9. На `preview.300w.app` повторите Calendar → Detail → Back и проверьте health SHA; изменения в localhost не означают, что Preview обновлён.
7. До commit отмените только эти два значения через Cmd+Z/Cmd+S или просмотренный участок Source Control. Если **все** незакоммиченные правки `races.ts` ваши и не нужны, после сохранения нужной копии допустим `git restore -- src/data/races.ts`; если staged — предварительно `git restore --staged -- src/data/races.ts`. Это не отменяет уже опубликованный deployment.

## 3. Home showcase и его изображения

**Где:** [src/data/showcaseImages.ts](../src/data/showcaseImages.ts), `src/assets/showcase/`; поведение — [HomeShowcase.tsx](../src/components/HomeShowcase.tsx), оформление — [HomeShowcase.css](../src/components/HomeShowcase.css). Cmd+F: `ironman-world-championship-kona`.

Реальное соответствие ключей:

```ts
'ironman-world-championship-kona': ['kona-bike-lava', 'kona-swim-start', 'kona-finish-alii'],
```

Для согласованной замены добавьте проверенный PNG в нужную подпапку showcase, используйте уникальное имя без расширения в mapping. Не меняйте raceId. Список доступных Home гонок выбирает App по датам: mapping не закрепляет карточку на главной. Не редактируйте generated manifests вручную.

После review исходника команда `node scripts/generate-image-variants.mjs` **записывает весь набор** optimized images и manifests, не только новый файл. Dry-run у неё нет. Проверьте весь diff; неожиданные массовые изменения — STOP, не коммитьте их автоматически. Оригиналы не удалять.

**Проверка:** `node --test scripts/test-image-delivery.mjs`, build, затем `node --test scripts/test-initial-graph.mjs`. В Preview — 390 px и desktop, текущий/следующий слайд, crop/градиент, ручные стрелки и reduced motion. Commit только reviewed mapping/originals/generated outputs; общий порядок отмены применяется к каждому вашему файлу, не удаляет старые assets.

## 4. Русские имена и страны

**Русское имя:** не меняйте `nameEn` или ID. Используйте [CSV-инструкцию](athlete-name-review.md). Authoritative файл — [athleteLocalization.json](../src/data/athletes/athleteLocalization.json); удобнее безопасный CSV importer, чем массовая ручная правка JSON.

### Walkthrough: исправить одно русское имя

1. Проверьте Source Control и сохраните нужные локальные правки отдельно. Если `.generated/athlete-names/review.csv` уже редактируется владельцем, **не экспортируйте заново**: используйте существующий CSV и его baseline. Для нового batch без незавершённых CSV-правок выполните только:

```sh
npm run audit:athlete-names
```

Команда перезаписывает `review.csv`, `review.md` и `baseline.json`, но не имена. Не запускайте export одновременно с import или ручным редактированием registry.

2. Cmd+P → `.generated/athlete-names/review.csv`; Cmd+F → точное английское имя, например `Justus Nieschlag`. Сверьте `athlete_id` и `name_en` с нужным профилем, особенно при похожих именах. Заголовок: `athlete_id,ranking,name_en,name_ru`. Исправьте только содержимое `name_ru` в этой строке, сохраните Cmd+S. Сохраните существующие CSV-кавычки и разделители; не редактируйте `baseline.json`, ID, ranking, name_en, заголовок или набор строк. Пустую ячейку можно заполнить проверенным именем; очистить существующее имя нельзя.
3. Выполните dry-run **после** ручного редактирования:

```sh
npm run import:athlete-names
```

Он не записывает source. Для одной исправленной непустой ячейки ожидайте `Changed Russian names: 1`, `Added Russian names: 0`, нужные ID/name_en и before/after; для заполнения отсутствующего имени — наоборот. Если изменений больше, identity неверна или baseline устарел — STOP. Не исправляйте baseline вручную: сохраните CSV отдельно и следуйте [baseline procedure](athlete-name-review.md#baseline-и-защита-импорта).
4. Только после проверки полного плана примените:

```sh
npm run import:athlete-names -- --write
git diff -- src/data/athletes/athleteLocalization.json
```

Меняется только registry; CSV сам по себе не влияет на UI. Для одного имени diff должен соответствовать одной reviewed записи, без изменения English key или чужой metadata. Comma/semicolon, BOM и CRLF поддерживаются; Numbers export описан в canonical guide.
5. Запустите `npm run dev`, найдите атлета по русскому и английскому имени, откройте Detail и связанные Results. Затем во втором Terminal:

```sh
node --test scripts/test-athlete-names.mjs scripts/test-current-athletes.mjs
npm run audit:athletes
npm run audit:results
npm run build
npm run lint
git diff --check
```

Не запускайте audit/export только ради проверки уже отредактированного CSV: это перезапишет его. Перед **следующим** batch, после принятия текущего import и сохранения нужного CSV отдельно, сделайте новый export/baseline.

6. После review и разрешения на commit проверьте отсутствие чужого staging и выполните:

```sh
git add src/data/athletes/athleteLocalization.json
git diff --cached
git diff --cached --check
git commit -m "Correct reviewed Russian athlete name"
git push origin home-redesign-experiments
```

`.generated` не stage. После отдельного Preview approval используйте раздел 9; на Preview повторите поиск, Detail и связанное имя в Results с проверкой deployed SHA.
7. **Отмена до `--write`:** Cmd+Z/Cmd+S в CSV; source ещё не менялся. **После `--write`, до commit:** сначала сохраните нужный CSV отдельно, затем отмените только свою запись registry через Source Control. Если весь diff registry ваш и не нужен, допустим `git restore -- src/data/athletes/athleteLocalization.json` (сначала `git restore --staged -- src/data/athletes/athleteLocalization.json`, если staged). Не полагайтесь на Undo CSV для отмены уже применённого JSON. Не запускайте повторный import старого CSV после отмены: он может заново применить ту же правку. Новый batch начинайте с export только после решения судьбы всех незавершённых CSV-изменений.

Пример существующей записи registry (ключ не редактировать):

```json
"Justus Nieschlag": "Юстус Нишлаг"
```

**Страна:** curated запись находится в `src/data/athletes/men.ts` или `women.ts`; ищите точное `nameEn`. Для generated атлета STOP: нельзя вручную исправлять `resultAthletes.generated.ts`. [countryEnrichment.json](../src/data/athletes/countryEnrichment.json) хранит evidence, но сам по себе не является override для всех runtime профилей. Нужен согласованный patch source/projection. Исторические countryCode результатов не менять автоматически вслед за профилем.

Реальные поля curated Kristian (фрагмент объекта в men.ts):

```ts
country: 'Норвегия', countryEn: 'Norway', countryCode: 'NOR', flag: '🇳🇴',
```

При approved country correction согласуйте эти связанные поля; runtime нормализует legacy `NOR` в `NO`. Не заменяйте страну только флагом. Некоторые curated записи используют positional `makeAthlete(...)`: сверяйте аргументы с `src/data/athletes/createAthlete.ts`, не сдвигайте их. Для нового неподдержанного кода страны требуется review normalization, не догадка.

**Проверка:** `node --test scripts/test-athlete-names.mjs scripts/test-current-athletes.mjs`, `npm run audit:athletes`, `npm run audit:results`. Preview: поиск по русскому/английскому имени, список, Detail, связанное имя в Results. Commit только реально изменённый source registry/approved country files; `.generated` не stage. Отмена — общий порядок, сохраните owner CSV отдельно.

## 5. Фото атлета

Найдите атлета по ID/nameEn в catalog, затем mapping в `src/data/athletes/athletePhotos.generated.ts`. **Это generated файл, не место ручной замены URL.** Фото должны быть локальными в `public/athletes/`, подтверждёнными по личности и визуально просмотренными. Отсутствующее фото допустимо.

Реальный адрес отклонённой привязки: `/athletes/franzi-hofmann.png`; [photoReview.ts](../src/data/athletes/photoReview.ts) отклоняет её только для ID 172. Результат — FH. Это пример точечного reviewed исключения, не шаблон удаления всех фото. Точная существующая проверка:

```ts
if (athleteId === 172 && source === '/athletes/franzi-hofmann.png') return undefined
```

Обычная замена фото выполняется через reviewed publisher, а не расширение этой проверки.

Ручная часть: подготовить проверенный исходник и evidence URL, проверить лицо, имя и ID; не подставлять logo/случайную картинку. Staging/publish выполняйте по [photo workflow](../scripts/athlete-photo-import.md) с новым согласованным manifest. Не запускайте старые batch manifests и full photo import. После публикации требуются optimized variants; их generator пишет весь набор.

**Проверка:** `node --test scripts/test-athlete-photo-review.mjs scripts/test-image-delivery.mjs`, `npm run audit:athletes`; Preview список/Detail/Results и placeholder. Старые photo tests со старым размером каталога не доказывают текущую корректность. Commit только reviewed image/registry/review/manifest outputs; не удалять исходники при отклонении без отдельного решения. Отмена — общий порядок.

## 6. Биография и достижения

**Где:** `src/data/athletes/men.ts` или `women.ts`. Cmd+F `Kristian Blummenfelt` показывает пример approved curated профиля. Редактируйте только `bio`, `bioFacts` (если используется), `achievements`. Реальные четыре строки Kristian:

```ts
'Олимпийский чемпион — Токио-2020.',
'🥇 Чемпион мира IRONMAN — сезон 2021 (Сент-Джордж, май 2022 года).',
'🥇 Чемпион мира IRONMAN 70.3 — 2022.',
'🏆 Победитель IRONMAN Pro Series — 2025.'
```

В строке bio абзацы записаны как `\n\n`. Сейчас отдельное разбиение этих абзацев и medal-prefix rendering реализованы для Kristian ID 1; для другого профиля проверьте фактический renderer. `bioFacts` имеет приоритет над bio. Олимпийский пункт получает существующий SVG laurel, не emoji. Не меняйте ID, имя, фото, страну и спортивные результаты ради текста. Для generated профиля остановитесь: постоянного editorial override слоя пока нет.

**Проверка:** `node --test scripts/test-current-athletes.mjs scripts/test-accessibility.mjs`, build/lint; локально и Preview — все абзацы, число пунктов, иконки, 390 px/desktop. Commit curated file; renderer — только если отдельно согласован. Save/revert/commit/push — общий порядок.

## 7. Импорт и точечная коррекция результатов

Это операция с высоким риском для ID. Полная процедура — [канонический workflow](scripts.md#canonical-workflow) и [import guide](import-race-results.md). Начинайте с проверенного PTO edition URL, discovery и owner review. Не используйте новый год вместо недоступного старого.

Реальный пример существующего source — `src/data/results/2026/ironman/kona.ts`. Найдите `Taylor Knibb`; source содержит `"countryCode": "US"` и `"totalTime": "8:36:29"`. Kona уже импортирована: повторный импорт не нужен. Реальные поля строки:

```ts
"athleteName": "Taylor Knibb",
"gender": "W",
"position": 1,
"countryCode": "US",
```

Пример показывает синтаксис; не меняйте эти значения без отдельного source evidence.

Поддерживаемая форма discovery (значения в угловых скобках заменить проверенными; не запускать буквально):

```sh
npm run import:race-results -- --url '<verified-PTO-results-URL>' --race '<existing-edition-id>'
```

Без `--write` это dry-run. После review writer создаёт новый source/evidence, но wiring в results index и SOF требуют отдельной проверки по import guide. Новых атлетов добавляют только reviewed `npm run find:next-athletes -- --write --append`. Не запускать full regeneration: TECH-01 может перенумеровать существующих атлетов.

Для коррекции откройте точный per-race module, найдите athleteName, сверяйте edition/позицию/времена. Меняйте только подтверждённое поле. Source ID не равен стабильному runtime ID; последний зависит от общего порядка. Не сортируйте массивы, не вставляйте новую гонку в середину старого списка. DNF сохраняет отсутствующие splits, их нельзя вычислять догадкой.

**Проверка:** `node --test scripts/test-race-result-import.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs`, оба audit, `npm run check:release`; сравнение всех прежних IDs/rows, число finishers/DNF, links, ranking с одинаковым clock. Preview: полные M/W таблицы, SOF, Detail→Athlete→Back, ranking. Commit только reviewed source/wiring/evidence/test files, не D1. Если IDs двигаются — STOP. Отмена только локального reviewed diff по общему порядку.

## 8. Тексты интерфейса

Cmd+Shift+F ищет текущую фразу. Например `Основные источники спортивных данных` находится в [src/pages/MorePage.tsx](../src/pages/MorePage.tsx):

```tsx
<h3>Основные источники спортивных данных</h3>
```

Можно изменить согласованный видимый текст. Не трогайте href, route/hash, event handler, API code/schema и aria-связи ради копирайтинга. Не меняйте перевод имени через случайный JSX: используйте registry. News/Feedback тексты и реальные сообщения проверяются по их отдельным docs, без отправки тестовых сообщений по умолчанию.

**Проверка:** accessibility test, build/lint, локально и Preview desktop/mobile, клавиатура, dark headings, длинные строки. Commit только нужный page/component. Save/отмена/push — общий порядок.

## 9. Публикация, проверка и восстановление

Полный [production/preview runbook](deployment-cloudflare.md) — authority для targets, bindings, secrets, rollback и D1 recovery. Ниже только последовательность владельца после отдельного approval.

```sh
git status --short
git rev-parse HEAD
npm run check:release
npm run deploy:preview:dry
# Только после разрешения на preview deployment:
npm run deploy:preview
npm run check:preview
```

Dry-run собирает локальные assets, не публикует. Scripts не добавляют `--keep-vars`: обычные vars берутся из config, secrets обычный deploy сохраняет. Не добавляйте флаг автоматически. Проверьте ожидаемый SHA и отдельный preview DB; неправильный target — STOP. Browser RC: `npm run check:release:browser` требует browser prerequisites из [scripts](scripts.md), не заменяет реальный iPhone/Android.

После успешного Preview review и отдельного production approval публикуется **та же чистая Git revision**:

```sh
npm run deploy:production:dry
npm run deploy:production
npm run check:production -- --expected-sha '<approved-40-character-SHA>'
```

Перед запуском подставьте approved SHA. Не запускать обе среды без их отдельных разрешений. Не импортировать гонку повторно «в production»: static results уже внутри сборки. Не запускать migration/seed вместе с обычным релизом. Сравните bindings/secrets names и preview isolation по runbook, полные JS/CSS downloads, News и protected Feedback config. Секреты никогда не копировать в Git/скриншоты.

Ошибка проверки — остановка и report, не повторный deploy и не автоматический rollback. Worker rollback не восстанавливает D1. Известную хорошую версию с шестью secrets нужно проверить перед каждым rollback; восстановление D1 — отдельная согласованная операция, сначала безопасная recovery DB. Restore drill ещё не подтверждён (OPS-03). Сетевые partial downloads (OPS-02) и Android validation (QA-01) остаются открытыми; успешный localhost не закрывает их.
