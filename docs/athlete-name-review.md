# Ручная правка русских имён через CSV

Рабочий файл — `.generated/athlete-names/review.csv`. Меняйте только `name_ru`. Если имя правильное, ничего не делайте. Если имя отсутствует, впишите его после ручной проверки. Автоматической транслитерации нет.

## Порядок работы

1. Выполните `npm run audit:athlete-names`.
2. Откройте `.generated/athlete-names/review.csv` в Numbers.
3. Не меняйте `athlete_id`, `ranking` и `name_en`, заголовки и набор строк. Сортировать строки можно.
4. Правильные русские имена оставьте как есть.
5. Неправильные исправьте в `name_ru`.
6. В пустые `name_ru` впишите проверенные русские имена; остальные оставьте пустыми.
7. Экспортируйте из Numbers обратно в **CSV, UTF-8, разделитель запятая или точка с запятой**, заменив рабочий `review.csv`. Не сохраняйте файл `.numbers` под расширением `.csv`.
8. Выполните `npm run import:athlete-names` — это dry-run, без записи source data.
9. Просмотрите весь список before/after. Убедитесь, что нет случайных правок.
10. Выполните `npm run import:athlete-names -- --write`.
11. Выполните `npm run audit:athlete-names` для нового CSV/baseline с применёнными именами.
12. При необходимости выполните tests/build, проверьте diff и отдельно создайте commit. Для name batches коммитится только `src/data/athletes/athleteLocalization.json`.

**Export перезаписывает рабочие CSV/MD/baseline.** Перед повторным export сохраните незавершённые правки отдельно. Не запускайте export, import и ручное редактирование registry одновременно.

## Формат

CSV имеет ровно четыре столбца:

```csv
athlete_id,ranking,name_en,name_ru
3,1,Hayden Wilde,Хайден Уайлд
104,2,Taylor Knibb,Тейлор Книбб
101,3,Kate Waugh,Кейт Во
```

`ranking` — справочная позиция в общем production TRI Ranking (ALL, мужчины и женщины вместе), а не score и не отдельная позиция по полу. Экспорт использует существующие `rankedAthletes` / `athleteRanking` и production dataset clock. Сначала идут участники ranking по позиции 1, 2, 3…; затем атлеты без ranking — по name_en A–Z и ID. У unranked поле ranking пустое. Нулевой score сам по себе не означает отсутствие ranking.

Пользователь редактирует только name_ru. Importer игнорирует ranking в CSV: он не использует его для identity, обнаружения правок или записи overrides. Обновление ranking после export не требует повторного export при неизменных каталоге и локализации. Перестановка строк безопасна.

Экспорт использует UTF-8 BOM, CRLF и quoted cells; importer принимает также UTF-8 без BOM и LF, поддерживает CSV escaped quotes. Разделитель (`,` или `;`) определяется по точному header и используется для всего файла. Смешанные разделители, дополнительные столбцы, пустые дополнительные строки и некорректные quotes отклоняются. Буквальные запятые и точки с запятой внутри значений должны быть в quoted fields; экспорт остаётся comma-separated. Числовой ID должен оставаться точным десятичным значением, без форматирования вроде `10,000` или `10000.0`.

`review.md` — только companion report с теми же именами и total/present/missing. Редактировать его для импорта бессмысленно. Все файлы в `.generated/` игнорируются Git.

## Baseline и защита импорта

`baseline.json` содержит version 2, исходные строки `athlete_id/ranking/name_en/name_ru`, SHA-256 raw catalog и SHA-256 точных байтов localization registry. Это snapshot, а не editable source. Не редактируйте baseline. Старый трёхколоночный CSV/baseline v1 нужно переэкспортировать; незавершённые правки предварительно сохраните отдельно.

Importer проверяет baseline против текущего runtime snapshot и registry. Поэтому изменения каталога или registry после export требуют нового export. Изменение только результатов/ranking не блокирует импорт: ranking и порядок строк исключены из сравнения snapshot. Сохраните старый исправленный CSV отдельно и вручную перенесите изменения в новый snapshot. Автоматического merge identity changes нет.

Сравнение `name_ru` с baseline:

- одинаковые значения, включая две пустые ячейки: ничего не записывать;
- непустое имя изменено: исправить explicit override;
- вместо пустого введено имя: добавить explicit override;
- существующее имя очищено: **abort**, удаления через CSV нет.

Проверяются точный набор ID, отсутствие duplicate rows, точное соответствие ID ↔ English name, количество строк, структура CSV/JSON, duplicate JSON keys до JSON.parse, orphan/ambiguous localization mappings, непустые новые значения, русские буквы, mixed Latin/Cyrillic и недопустимые символы. Допустимы дефисы, апострофы, пробелы и точки; пробелы по краям не исправляются автоматически. Один invalid row останавливает весь batch.

Dry-run ничего не пишет. `--write` сначала валидирует весь batch, затем повторно проверяет snapshot и registry перед atomic rename одного файла. Временный файл рядом с registry удаляется при ошибке. Незатронутые registry entries и metadata существующих object entries сохраняются. При отсутствии изменений файл не перезаписывается. Atomic replacement предотвращает частичную запись JSON, но не предназначен для параллельного редактирования несколькими процессами.

## Источник имён и UI

После import единственный authoritative источник explicit overrides — `src/data/athletes/athleteLocalization.json`.

Приоритет: explicit override → существующее имя профиля → существующий English fallback. Runtime применяет override без регенерации athlete profiles.

Athlete Profiles, Athlete Detail и search получают имя из общего локализованного каталога. Race Results показывает имя связанного профиля; несвязанные строки используют исходное `result.athleteName`. Russian display name никогда не становится identity key.

Не редактируйте в этом workflow:

- `name_en`, athlete IDs, aliases, страны, ranking;
- `resultAthletes.generated.ts`;
- generated image manifests;
- race result datasets.

Полный athlete generator не нужен для CSV import. Его известные конфликты стран Jeremy Maclean AU/US и Nick Thompson US/AU остаются отдельной задачей; ошибки полной регенерации нельзя считать PASS.

Проверки workflow:

```sh
node --test scripts/test-athlete-names.mjs
npm run audit:athlete-names
npm run import:athlete-names
npm run build
```

Первый тест проверяет synthetic writes только в изолированной temporary directory; реальные athlete names не меняет.
