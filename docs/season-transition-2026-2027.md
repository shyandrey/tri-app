# Season transition 2026 → 2027

Согласованная product policy, 2026-10-12. **DOCUMENTED**, не реализация сезона и не разрешение на запись данных/deploy. Источники спортивных данных регулирует [Data Source Policy V2](scripts.md#data-source-policy); последовательность approvals — [canonical workflow](scripts.md#canonical-workflow).

## Scope — DOCUMENTED

В 2027 поддерживаются три основные категории: **IRONMAN**, **IRONMAN 70.3**, **T100** под umbrella branding **Triathlon World Tour (TWT)**. T50, T100 Challenger и WTCS сейчас исключены по product scope, а не потому, что в них якобы не участвуют профессионалы. Их включение требует отдельного owner approval. Challenge Family нельзя автоматически классифицировать как T100 Challenger.

Challenge Roth утверждён как отдельная гонка, не новая серия/кнопка фильтра. Создание edition 2027 требует отдельного approval. Она должна отображаться в общем календаре, поиске по `Roth`, `Challenge Roth`, `DATEV Challenge Roth`, стандартной detail page и Home showcase с собственными изображениями. Не добавлять Roth/Challenge Family filter и не относить Roth к IRONMAN или T100. Видимость старых Roth editions не расширять автоматически без согласованного scope.

## Архитектура — IMPLEMENTED

| Область | Source of truth и текущее поведение |
| --- | --- |
| Модель | [Race.ts](../src/types/Race.ts): RaceEntity — постоянная identity; RaceEdition — год/date и raceId; RaceEditionView — UI projection. `RaceSeries`: IRONMAN Pro Series / Triathlon World Tour / Challenge. `RaceDistance`: IRONMAN / 70.3 / T100 / Challenge Roth. Product categories не равны enum series. |
| Текущий сезон | [races.ts](../src/data/races.ts), [raceIdentity.ts](../src/data/raceIdentity.ts), [raceEditions.ts](../src/data/raceEditions.ts). `CURRENT_SEASON = 2026`, legacy numeric IDs переводятся в stable raceId и editionId; отдельные championship gender editions уже поддерживаются. Автоматического переключения на 2027 нет. |
| Архив | [archiveIronmanProSeries.ts](../src/data/archiveIronmanProSeries.ts), [archiveT100.ts](../src/data/archiveT100.ts), [archiveChallengeRoth.ts](../src/data/archiveChallengeRoth.ts). Roth имеет `raceId = challenge-roth`, editions 2024–2026, series Challenge и отдельную distance. Общая standalone-модель без обязательного series не реализована, но Roth уже представим без ложной классификации. |
| Calendar / search | [CalendarPage.tsx](../src/pages/CalendarPage.tsx): три кнопки **Все / IRONMAN Pro Series / Triathlon World Tour**; IM объединяет IRONMAN и 70.3. Архивные годы зафиксированы `[2025, 2024]`. Поиск использует all-edition input, name/city/country/series и tags; при поиске series/time filters не ограничивают matches. Challenge исключается до поиска и отдельно из archive. Roth alias DATEV отсутствует. |
| Cards / detail | [RaceCard.tsx](../src/components/RaceCard.tsx) имеет Roth style, distance label ROTH и не подставляет IM/T100 image для Challenge. [RaceDetailPage.tsx](../src/pages/RaceDetailPage.tsx) поддерживает Roth style. [SportsArea.tsx](../src/sports/SportsArea.tsx) находит detail по editionId среди allRaceEditionViews; отдельная Roth page не нужна. |
| Home | [App.tsx](../src/App.tsx) берёт currentRaceEditions, группирует события через [homeRacePresentation.ts](../src/utils/homeRacePresentation.ts), фильтрует будущие даты по Москве, сортирует; showcase — первые 5, Upcoming — первые 3. Это не редакционный pinning: даже добавление Roth не гарантирует присутствие в первых пяти в любую дату. |
| Showcase / assets | [HomeShowcase.tsx](../src/components/HomeShowcase.tsx), [showcaseImages.ts](../src/data/showcaseImages.ts): подбор изображений по raceId; Roth mapping сейчас отсутствует. Responsive WebP 640/1280/1672, current+next initial images, progressive mounting, swipe/navigation и reduced motion уже реализованы. [generator](../scripts/generate-image-variants.mjs) создаёт optimized assets/manifests. |
| T100 branding | Enum/series label уже `Triathlon World Tour`; category/distance, race IDs `t100-*`, CSS `--t100` и prefix handling `T100` сохраняются. [series asset](../src/assets/series/t100-worldtour.jpeg) используется через optimized variant; текущее имя файла не является подтверждением утверждённого 2027 artwork. |
| Results / ranking | [results index](../src/data/results/index.ts) назначает global `index + 1`; новый batch добавляется в конец, вне historical country backfill. [dataset clock](../src/utils/rankingDatasetClock.ts) зависит от представленных результатов, не от переключения календаря. Calendar-only additions не должны менять ranking. |

## T100 → TWT — DOCUMENTED / PROPOSED

Переход 2027 к umbrella brand Triathlon World Tour не означает замену T100 другой дисциплиной. T100 остаётся поддержанной категорией. Исторические 2024–2026 labels, race/edition IDs, ссылки и результаты должны оставаться валидными; не переименовывать ключи и не переклассифицировать старые гонки автоматически. Миграция ID возможна только по отдельному утверждённому плану.

**PROPOSED minimal change:** отдельно согласовать 2027 display labels/artwork, сохранив текущий `Triathlon World Tour` series key, `T100` distance и существующие race IDs. При необходимости presentation metadata по edition/year вместо глобальной замены исторического текста. Не добавлять T50/Challenger filters. Визуальные изменения пока не выполнены.

«Три категории» в scope не означает три sport filter buttons: текущие три кнопки включают «Все». Проверять именно существующие Все/IM/TWT; разделение IM и 70.3 на кнопки не входит в эту policy и требует отдельного UI решения.

## Calendar / identity — DOCUMENTED

- Добавлять только owner-approved 2027 races. ChatGPT/owner предоставляет проверенные calendar data и точные source URLs; Codex реализует согласованный набор, не придумывает и не подменяет даты.
- Проверять race identity, год/edition, venue, дату, дистанции, MPRO/WPRO fields. Organizer websites допустимы для календарей, schedules, announcements и правил по source policy; это не blanket permission для импорта результатов оттуда.
- Не копировать даты/start times 2026 в 2027. Неизвестное остаётся неизвестным. `dateISO` и distance strings сейчас обязательны; безопасного общего undated-event UX нет. До отдельного решения не вставлять фиктивную дату: неполную запись держать в reviewed планировании вне опубликованного календаря.
- Исторические editions/results не перезаписывать. Новая edition ссылается на существующую race identity при подтверждённом соответствии; новый год сам по себе не создаёт новый RaceEntity.
- Не ограничиваться заменой `CURRENT_SEASON`: сначала сохранить 2026 views/IDs/metadata в архиве и проверить legacy mapping, новые уникальные numeric view IDs, championship grouping, route/back state. У старых ссылок не должна смениться гонка.
- **PROPOSED:** согласованный 2027 dataset + перенос 2026 в archive без изменения старых records; расширение Calendar archive/year selection с тестами. Универсального season-import/rollover script нет.

## Roth — минимальные будущие изменения, PROPOSED

1. Использовать существующую identity `challenge-roth` и отдельную approved edition `challenge-roth-2027`; не создавать серию или дубликат identity.
2. Вместо глобального раскрытия всех Challenge добавить ограниченную product visibility для approved Roth 2027 в general calendar/search. Она входит в «Все», не в IM/TWT. Проверить archive отдельно, чтобы не расширить историческую видимость без approval.
3. Добавить scoped search aliases Roth / Challenge Roth / DATEV Challenge Roth; существующий substring search сам по себе не гарантирует последний alias.
4. Повторно использовать standard card/detail/navigation, нейтральное/Roth оформление. Никакой фальшивой series classification; новый generic standalone schema не требуется только ради этой гонки.
5. Добавить approved dedicated imagery mapping. Согласовать, означает ли Home inclusion обычное попадание в ближайшие 5 или отдельное редакционное размещение: pinning сейчас отсутствует, не менять алгоритм молча.

## Showcase и права на изображения — DOCUMENTED

Отдельно утвердить 2027 content/image plan, включая dedicated Roth imagery, crops, лицензии/разрешения и source provenance. Не использовать нелицензированную стороннюю фотографию. Переиспользовать существующий generator и responsive размеры; manifests не редактировать руками. Сохранить layout, navigation, lazy/progressive loading и reduced-motion behavior. Не удалять 2026 originals/optimized assets автоматически до approval нового сезона и проверки зависимостей.

## План реализации и проверки — PROPOSED

**Verified calendar → Owner approval → Local implementation → Tests → Preview → Owner review → Production.**

1. Discovery/review: approved races, identity/edition linkage, даты/fields, неизвестные значения, TWT artwork, Roth visibility/aliases/showcase plan. STOP при source conflicts, ambiguous identity, неподтверждённых датах или неожиданном ID drift.
2. Отдельно разрешённая local implementation: 2027 data + archive 2026, минимальная visibility/search/presentation корректировка; без импорта новых результатов или изменения ranking formula.
3. Baseline comparison: все существующие race/edition/athlete/result IDs, historical results и ranking. Проверить year/time filters и три существующие кнопки, Roth в общем calendar/search, aliases, detail → athlete → Back, direct links, T100 history и отсутствие T50/Challenger filters.
4. Mobile/desktop showcase review: 320/390/430, 844 landscape, 768/1024/1440; imagery/crops/labels/swipe/links, reduced motion и отсутствие overflow. Поведение и годовой rollout требуют новых assertions — текущие suites сами по себе не доказывают 2027 correctness.
5. Только после checks и approval: commit reviewed revision, preview deployment и smoke; затем отдельное production approval для той же revision. Не переимпортировать сезон в production и не запускать D1 migrations ради статического календаря.

Существующие команды проверены в package.json / scripts (здесь **не запускались**):

```sh
node --test scripts/test-calendar.mjs scripts/test-navigation.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs scripts/test-race-result-import.mjs
npm run audit:results
npm run audit:athletes
npm run check:release
npm run check:release:browser
```

Fast gate уже включает build/lint и relevant unit checks; отдельно доступны `npm run build`, `npm run lint`. Browser gate требует локальный server текущего dist и Chrome CDP — см. [scripts](scripts.md). Существуют Calendar/navigation/brand/image browser suites; добавить assertions для нового сезона и Roth, не ослаблять старые проверки. После approved image generation: `node scripts/generate-image-variants.mjs` (WRITE) и `node --test scripts/test-image-delivery.mjs scripts/test-initial-graph.mjs` на свежем build.

Deployment commands только после отдельных approvals: `npm run deploy:preview:dry`, `npm run deploy:preview`, `npm run check:preview`; production: `npm run deploy:production:dry`, `npm run deploy:production`, `npm run check:production`. Проверять SHA, assets, News/Feedback и isolation по [runbook](deployment-cloudflare.md). Запись этого списка не разрешает исполнение.

Full regeneration не является этапом rollover: известный ID drift остаётся TECH-01. Не ослаблять validation ради сезона. Текущий локальный Kona 2026 import — отдельная задача DATA-03; эту policy не использовать для изменения его результатов или статуса approval.
