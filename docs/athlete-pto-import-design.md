# ATH-01/02: PTO AGE, BORN и social URLs — design review

18.10.2026. Research/design с локальным dry-run implementation ниже; запись registry не разрешена. Исторические proposed sections ниже описывают первоначальный дизайн; текущая реализация и approved age policy имеют приоритет. Существующие readiness/board edits сохранены. Решение владельца этой задачи: автоматизировать extraction AGE/BORN/social из Stats PTO; biographies и achievements остаются editorial. Wikipedia разрешена здесь для biography research, не как автоматический fallback для AGE/BORN/social/country.

## Проверенные профили и HTML

Прочитаны только три representative pages (без массового scraping), исходный HTML сохранён вне repository в `/tmp/300w-pto-research/`. Значения ниже — наблюдения источника, не обновления каталога.

| Profile / local ID | AGE | BORN | Athlete social block |
|---|---:|---:|---|
| [Taylor Knibb](https://stats.protriathletes.org/athlete/taylor-knibb), 104 | 28 | 1998 | Instagram, Twitter |
| [Kristian Blummenfelt](https://stats.protriathletes.org/athlete/kristian-blummenfelt), 1 | 32 | 1994 | YouTube channel, Instagram, Twitter |
| [Franzi Hofmann](https://stats.protriathletes.org/athlete/franzi-reng), 172 | `-` | `-` | Empty |

Actual hrefs из athlete Social блока:

- Taylor: `https://www.instagram.com/taylorknibb/`, `https://twitter.com/taylorknibb`.
- Kristian: `https://www.youtube.com/channel/UC3FUifepO8vXHtool8S1Z1g`, `https://www.instagram.com/kristianblu/`, `https://twitter.com/kristianblu`.
- Franzi: нет athlete href; footer содержит T100 Facebook/Twitter/Instagram/YouTube. Их нельзя присваивать атлету.

Server HTML содержит `.attribute > .name` с `Age` / `Born` и sibling `.value`. BORN в этих samples — **год**, full DOB не найден; это не доказательство отсутствия DOB во всех backend APIs. Athlete links: `.equipments-and-socials .social.attribute a.social-link[href]`. Нужен DOM-scoped parser, не поиск любого social URL по всей странице. Вне блока есть footer, publisher metadata и YouTube video feed. Canonical link и og:title позволяют сверить identity; H1 в samples отсутствует. `franzi-reng` показывает Franzi Hofmann: slug не равен текущему имени.

Публичный документированный API для этих полей в этой проверке не установлен; HTML уже достаточно для extraction. Не изобретать API endpoint и не использовать приватные requests. Три GET успешны, без login; это не гарантия стабильной схемы или разрешение bulk access. robots.txt через исследовательский web tool недоступен; лимиты/условия автоматического доступа не подтверждены. До pilot fetch проверить условия доступа, bounded timeout, последовательные requests и паузы; 403/429/CAPTCHA/redirect/schema mismatch → STOP, без обхода/авторотации/агрессивных retries. Cached representations могут расходиться: хранить direct HTML hash и fetchedAt, не смешивать web extract и разные snapshots.

## Совместимость и normalized model (PROPOSED)

Сейчас [Athlete](../src/types/Athlete.ts) содержит `age?: number`, socialLinks instagram/youtube **handles**, optional bio/bioFacts и string[] achievements. [UI](../src/pages/AthleteDetailPage.tsx) строит URL из handles и показывает static age без даты. DOB/provenance общего типа нет. Новый payload нельзя просто подставить в existing socialLinks: получится неверный URL. Нужен отдельно reviewed TS schema/adapter и persistent registry keyed by existing athleteId; D1 migration не нужна, спортивные профили статические.

Предлагаемый shape (описание, не существующий TypeScript API):

```ts
type Evidence<T> = {
  value: T
  status: 'source-verified'
  sourceUrl: string
  observedAt: string // UTC extraction timestamp
  verifiedAt: string // UTC identity/field verification timestamp
  rawValue: string
  snapshotSha256: string
  selector: string
}
type Enrichment = {
  athleteId: number
  ptoProfileUrl: string
  identity: { expectedNameEn: string; sourceName: string; reviewedAlias?: string }
  age?: Evidence<number> // reported AGE, not an invented birth date
  birthYear?: Evidence<number> // only explicit BORN year
  estimatedBirthYear?: {
    earliest: number; latest: number
    status: 'estimated'; method: string; basedOnAgeObservedAt: string
  }
  socials: Array<{ platform: string; url: Evidence<string> }>
}
```

Missing states в extraction report: `ABSENT`, `PLACEHOLDER`, `INVALID`, `AMBIGUOUS`, `CONFLICT`. Не заменять отсутствующее на 0/null, стирающее existing verified field. Verification здесь означает «поле прочитано у правильного PTO profile», не независимую гарантию фактической даты рождения. Версию parser/схемы, input SHA, reviewer/approval хранить в manifest.

### AGE, BORN и stale policy — approved implementation

- Competition age = текущий календарный год (Europe/Moscow, как UI календарь) − verified BORN. Не birthday age и не DOB.
- Raw PTO AGE и BORN хранятся отдельно, с sourceUrl, verifiedAt, snapshotSha256 и raw.
- AGE-only показывается только в календарном году verification; после rollover скрывается, без автоматического increment. Предложенный ранее 30-дневный TTL не принят и не используется.
- При AGE ≠ verification year − BORN сохраняются оба raw значения и review flag. Age-field ADD proposals блокируются до review. Это не доказывает ошибку PTO: источник может показывать хронологический возраст.
- Отсутствие поля не удаляет старое. Точное DOB и estimated year не генерируются.
- Legacy age без verification timestamp остаётся в данных, но не отображается как verified current age. Это затрагивает краткую строку Kristian/Hayden до отдельно разрешённого применения проверенных полей; social links сохраняются.

### Social URLs

Сохранять реальный decoded href + normalized HTTPS URL, не реконструировать handle из имени. Parser только в athlete Social block. Нормализация минимальна: host case, known trailing slash; не менять case path/channel ID и не доказывать account equivalence строковой эвристикой.

- HTTPS, без credentials, control characters, нестандартных ports; HTTP → review, не автоматический переход. Точный allowlist host/platform и profile path patterns; поддомены вида instagram.com.evil.example запрещены.
- Initial confirmed platforms: instagram.com/www.instagram.com, twitter.com/www.twitter.com (x.com только явно поддержанный approved alias), youtube.com/www.youtube.com с `/channel/<id>` или `/@handle`. Facebook/TikTok и другие platforms добавлять по фактически найденным athlete links и отдельным validator fixtures; неизвестное → UNSUPPORTED, не потерять из отчёта и не публиковать.
- Исключить /watch, /shorts, /share, /intent, /reel, generic homepage и footer. Duplicate same canonical URL → один candidate; разные URLs одной платформы → conflict report. Один social URL для разных athlete IDs → review.
- Source identity подтверждается прежде extraction; наличие URL на PTO — evidence association, не доказательство текущего владения аккаунтом. Не логиниться в соцсети и не обходить ограничения.
- Existing Kristian YouTube handle `kristian.blummenfelt` и PTO `/channel/UC3FUifepO8vXHtool8S1Z1g` имеют разные representations. Их эквивалентность не проверена: **REVIEW_REQUIRED**, не overwrite. Instagram normalized URL можно сравнить; preserve existing approved links независимо от происхождения.
- UI: direct href, external-link rel/target, platform labels/icons и keyboard/mobile; никогда не вклеивать URL в существующий handle template.

## Identity и pilot

Использовать существующие [identity normalization/linkage](../src/data/athleteIdentity.ts), immutable numeric IDs и существующие country/photo discovery provenance URLs как candidates. Проверить uniqueness normalized name map: existing Map не является гарантией отсутствия коллизий. Нет универсального PTO-ID registry в Athlete type; не заявлять, что все 20 URL уже verified.

Priority mapping: сохранённый verified profile URL → canonical URL из ранее reviewed results/profile evidence → read-only discovery нужной PTO страницы. Slugification только кандидат, HTTP 200 недостаточно. Проверить canonical, og:title/source name, country, gender/race history где доступны. Names/aliases вроде Franzi требуют explicit reviewed mapping; конфликт/redirect/двойной match → STOP по атлету. Ни новых athlete IDs, ни fuzzy auto-merge, ни full regeneration.

Фиксированный pilot: SHA `e8a3dba1de13ab5e75964ce9c2ff9dd3e3a49745`, dataset clock `2026-10-10T12:00:00.000Z`; top 10 M/W из `rankedAthletes`, только rows с ranking. Scores и полный список сохранены в `/tmp/300w-ath-pilot.json`. Это **внутренний 300W ranking**, не PTO ranking и не live wall-clock сортировка. Все 20 existing IDs разрешены локально; внешний identity review выполнен только для двух pilot profiles (Taylor/Kristian), остальные ожидают discovery. Franzi — отдельный missing-field контроль, не 21-й pilot участник.

| Rank | Men (ID) | Women (ID) |
|---|---|---|
| 1 | Hayden Wilde (3) | Taylor Knibb (104) |
| 2 | Kristian Blummenfelt (1) | Kate Waugh (101) |
| 3 | Jelle Geens (6) | Julie Derron (102) |
| 4 | Casper Stornes (7) | Laura Philipp (109) |
| 5 | Marten Van Riel (2) | Solveig Løvseth (106) |
| 6 | Lionel Sanders (23) | Lucy Charles-Barclay (103) |
| 7 | Mika Noodt (4) | Kat Matthews (108) |
| 8 | Matthew Marquardt (20) | Ashleigh Gentle (147) |
| 9 | Vincent Luis (41) | Georgia Taylor-Brown (105) |
| 10 | Sam Laidlow (10521) | Paula Findlay (114) |

## Workflow и rollback

**IMPLEMENTED:** static catalog, stable identity linkage, ranking/cohort, country and photo-specific tools, results incremental import. **PROPOSED:** AGE/BORN/social parser, evidence registry, CLI dry-run/apply, conflict report и adapter. Готовых npm-команд для этого importer нет; не использовать country-enrichment `--write` как substitute.

1. Зафиксировать cohort SHA/clock/IDs и fingerprint текущего каталога/results/ranking. Read-only discovery только этих 20 после approval implementation/pilot; сохранить 20 bounded HTML snapshots вне production с URL/status/time/hash.
2. DOM extraction → normalized candidates, parser version. Независимые поля, не импортировать bio/achievements автоматически. Report per ID/field: ADD, SAME, MISSING, INVALID, CONFLICT, REVIEW_REQUIRED, UNSUPPORTED. Read-only/dry-run не пишет ни registry, ни source TS.
3. Owner review exact manifest/hash; approved subset не более pilot. Перед apply сверить HEAD, old-value hashes, IDs и source evidence. Изменившийся input → STOP, без force. Apply только отдельным разрешением, локально, в dedicated registry; no generated athlete replacement.
4. Проверить все старые athlete IDs, result IDs/rows и ranking order/scores; schema/URL/date/parser fixtures, missing/duplicate/redirect/wrong-athlete/footer cases, immutable dry-run, conflict no-overwrite, idempotence второго apply. Browser AGE stale/missing и URL/profile links на 320px/keyboard.
5. Существующие команды: `npm run audit:athletes`, `npm run audit:results`, `node --test scripts/test-current-athletes.mjs scripts/test-ranking.mjs scripts/test-ranking-dataset-clock.mjs`, `npm run check:release`; browser gate по runbook. Новые parser tests/command names согласовать после implementation, не считать существующими.
6. Review → commit/Preview/Production только отдельными approvals. Отмена локального apply — вернуть только поля/registry patch из сохранённого baseline при совпадении old/current hashes, без потери чужих изменений. После commit — reviewed revert конкретного import commit, tests и отдельный deploy approval. Worker rollback не заменяет dataset provenance и не выполняется автоматически. D1 не затрагивается.

## ATH-03/04 — отдельное editorial сопровождение

Это уточнение предыдущего readiness roadmap: exact DOB не требуется ATH-02; текущий scope — reported AGE и BORN year. Wikipedia разрешена владельцем именно для biography, не для автоматического спорт-data reconciliation.

**Biography:** PTO + Wikipedia (permalink/revision/date) + owner-selected sources. Собрать claim/source matrix, сверить identity и спорные утверждения с первичными ссылками, написать короткий оригинальный русский текст, owner-approved paragraphs. Не копировать целые чужие биографии и не менять approved Kristian text автоматически. Конфликт → review; доступная biography не означает, что все её claims актуальны.

**Achievements:** отдельные verified entries с exact athlete/gender/category, achievement kind, competition, season year и actual event date, finish/overall position, source URLs, review date и текстом. Olympic medals — только ручной review с дисциплиной (individual/relay), цветом и edition. Остальные категории: IRONMAN WC; IRONMAN 70.3 WC; standalone Challenge Roth victory; IRONMAN European Championship victory (не любая европейская гонка); IRONMAN Pro Series **overall** title; T100/TWT **overall** title. Race win не равен season overall. Historical championship season и дата фактического проведения могут различаться.

PTO results/standings — primary evidence; если нужная категория отсутствует, report limitation и подобрать точный источник для review по source policy/owner selection. Не выводить титул из биографии без подтверждения result/year. Legacy and manually approved claims сохраняются; icon mapping включая Olympic SVG laurel — отдельный reviewed UI adapter. Editorial workflow не привязан к каждому автоматическому refresh AGE/social.

## Оценка и решения до implementation

Ориентир: 3–5 developer days для parser/registry/dry-run/conflicts + AGE/social UI/tests, затем 1–2 дня на pilot source review при доступных страницах; editorial ATH-03/04 оценивается отдельно по объёму текстов/источников. Это диапазон, не обещание сроков: missing/ambiguous identities могут увеличить review.

Нужно согласовать stale-age policy, initial platform allowlist, explicit treatment of legacy values и registry schema. Yellow flags: reported AGE semantics unknown, BORN lacks month/day, platform links can change, footer contamination, channel-vs-handle conflict, no public stable API confirmed. Ничего из этого не исправлять догадками.

## Local implementation — review pending

- [Core](../scripts/pto-profile-core.mjs), [HTML parser](../scripts/parse-pto-profile.py), [offline CLI](../scripts/dry-run-pto-profiles.mjs). Python3 stdlib + Node24; новых dependencies нет. Нет --write или registry writer в CLI; default mode offline, owner-decision mode performs bounded live validation (см. approval gate ниже).
- [Types/age/social adapter](../src/utils/athleteProfileData.ts): optional Athlete.ptoProfile. Никакой каталог пока не подключён к новым данным; persistent registry и reviewed apply/rollback — следующий отдельно разрешаемый шаг.
- [Fixed cohort](../scripts/fixtures/pto-profile-pilot.json), [pilot findings](athlete-pto-pilot-2026-10-18.md). Все 20 canonical/name/country checks прошли; initial statement о двух verified profiles выше относится к предыдущему исследованию.
- `node scripts/dry-run-pto-profiles.mjs scripts/fixtures/pto-profile-pilot.json /tmp/300w-pto-pilot` → identity-only JSON stdout после добавления approval gate. Исторический field replay по сохранённым HTML/timestamp был byte-identical; live approved mode получает новый timestamp. HTML snapshots вне repository. Без них повторное чтение источника требует нового timestamp/hash и review.
- Read-only acquisition: 20 последовательных curl GET с 1s паузой, timeout25s, max4MB, без follow redirects/retries; robots.txt вернул404. Это не разрешение массового scraping. 403/429/challenge/redirect → STOP; не обходить ограничения.
- Strict URL policy: HTTPS, platform host/path; произвольные query/hash и нераспознанные формы — review. `_social_www` явно обозначает website; LinkedIn не становится website. Original href сохраняется в raw evidence. Website URL не fetched, поэтому редиректы и текущее владение не подтверждены.
- Проверки: `node --test scripts/test-pto-profiles.mjs`; local Vite + Chrome CDP: `node scripts/test-pto-profile-browser.mjs`; `npm run build`; `npm run lint`; `npm run check:release`. Script `npm run check` отсутствует. Browser test использует synthetic fields только в памяти, не registry.
- Editorial ATH-03/04 workflow остаётся отдельным: эта реализация не извлекает biographies/achievements.

## Profile URL approval gate — current workflow

This section supersedes the earlier direct field-extraction command. [Review table](athlete-pto-profile-url-review.md) and [owner decisions CSV](athlete-pto-profile-url-decisions.csv) cover all 20 pilot athletes. Blank decisions are pending, not approval. Existing pilot field results are historical research evidence only.

1. Run `node scripts/dry-run-pto-profiles.mjs scripts/fixtures/pto-profile-pilot.json /tmp/300w-pto-pilot` to produce an identity-only report. No network requests, no AGE/BORN/social extraction. Missing URL/snapshot and ambiguous mapping appear in `mappings[].conflicts`.
2. Owner reviews the canonical URL, source name, country and identity evidence; a name match alone is never sufficient. Cached evidence cannot establish current reachability. Name + country + exact canonical + unique local ID/name/gender allow a proposal, not automatic approval. When these are insufficient to distinguish an athlete, SKIP or request race-history corroboration; fuzzy matching and automatic aliases are not supported.
3. Owner fills CSV `decision`: APPROVE accepts `proposed_url`; REPLACE requires `replacement_url`; SKIP excludes that athlete. Keep ID and original proposed URL unchanged. Owner may instead return decisions in chat for transcription. No source-code editing is needed.
4. After explicit owner decisions, run `node scripts/dry-run-pto-profiles.mjs scripts/fixtures/pto-profile-pilot.json /tmp/300w-pto-pilot PATH_TO_OWNER_DECISIONS.csv`. Only APPROVE/REPLACE rows make live GET requests. HTTPS, exact host/path, HTTP200 HTML, exact canonical, name, country and local uniqueness must pass before extracting fields from that same response. No redirects/retries; 20s timeout, 4MB bound, 1s pause. Access/identity failure stops subsequent live requests; previously approved URL failure is REVIEW_REQUIRED, never a guessed replacement. Current-task execution used no completed decisions and made no live requests.
5. URL approval authorizes field **dry-run only**. AGE/BORN/social values and their conflicts require separate review. Live responses may change; saved HTML + timestamp/hash support deterministic offline parsing, but fresh network checks are not byte-deterministic.
6. Persistent mapping registry is **PROPOSED**, not created: `src/data/athletes/ptoProfileMappings.json`, shape `{ "mappings": [{ "id": 1, "url": "https://stats.protriathletes.org/athlete/kristian-blummenfelt", "approvedBy": "owner", "approvedAt": "ISO timestamp" }] }`. The ID/example is illustrative, not an approved record. Separate explicit owner approval is required before creating/updating/version-controlling this registry. No writer exists. If present, the CLI reads and validates it and blocks changed URLs or cross-athlete reuse even with REPLACE; a separately reviewed registry revision must resolve that conflict.
7. Tests: `node --test scripts/test-pto-profile-mapping.mjs scripts/test-pto-profiles.mjs`. Network cases are mocks, not live reachability claims.

Render review formats from the JSON report with `node scripts/review-pto-profile-urls.mjs --markdown` or `--csv` using stdin. Do not regenerate a CSV over an owner's filled decisions; keep completed decision files separately. Parser identity-only mode omits AGE/BORN/social fields entirely.

## URL registry approval — 18.10.2026

Owner approved all 20 proposed URL identity mappings, including the six profiles with field-level flags. [Decisions CSV](athlete-pto-profile-url-decisions.csv) records APPROVE, approved_at, approved_by, approval_scope and field_review_flags. Exact URLs/IDs are unchanged; replacement_url remains empty.

The previously proposed [mapping registry](../src/data/athletes/ptoProfileMappings.json) is now prepared locally in the repository for later version control, without staging/commit/push. It contains URL identity approvals and snapshot references, not AGE/BORN/social values. The existing importer reads it without modifying it. This supersedes earlier statements that the registry has not been created.

Approval of a profile URL does not approve extracted fields. Six field-level review items remain open; no athlete fields were applied. Before another field dry-run, live reachability/identity checks remain required; unavailable or changed profiles must return REVIEW_REQUIRED without automatic replacement. No new live requests were made while recording this owner approval.
