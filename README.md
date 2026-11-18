# 300W

300W — Telegram Mini App и веб-приложение с результатами профессионального триатлона, календарём, профилями спортсменов и рейтингами. Официальные T100/IRONMAN standings и внутренний TRI Ranking — разные наборы данных.

Стек: React 19, TypeScript, Vite; Cloudflare Worker и Static Assets; D1 для серверных функций News/Feedback. Спортивные результаты и профили хранятся в репозитории.

## Локальная разработка

Работайте в чистом изолированном checkout от актуального `preview`; сохраняйте чужие локальные изменения. Проверенный toolchain: Node 24.19.0, Wrangler 4.142.0 из locked dependencies.

```sh
npm ci
npm run dev
# Проверки по scope задачи:
npm run build
npm run lint
```

`npm run preview` запускает локальный просмотр сборки, а не Cloudflare deployment. Metadata генерируются перед dev/build; `.generated/` не редактируется вручную. Секреты не хранить в Git. Правила работы: [AGENTS.md](AGENTS.md).

## Структура

- `src/` — UI, навигация, sports data и ranking logic.
- `public/` — локальные фотографии и artwork; `src/assets/` — исходные и оптимизированные assets.
- `worker/`, `migrations/` — серверные функции и история D1 migrations.
- `scripts/`, `scripts/fixtures/` — import/release tooling, тесты и source evidence.
- `release/public-release.json` — согласованное публичное описание версии; [CHANGELOG.md](CHANGELOG.md) — отдельная техническая история.
- `docs/` — инструкции, решения и исторические audits.

## Спортивные данные

`sports:prepare → sports:plan → owner approval → sports:apply` подготавливает и применяет точный локальный кандидат. Approval привязан к digest и scope. Сохраняйте Athlete/Result IDs, проверяйте официальный источник, страны и русские имена. Полная регенерация athlete catalog запрещена. Затем — целевые проверки, одна сборка и review; разрешение на local apply не разрешает Git publication/deployment.

[Практический HOW-TO](docs/HOWTO-UPDATE-SPORTS-DATA.md) · [Команды и source policy](docs/scripts.md) · [Инструкция владельца](docs/maintenance-owner.md).

## Ручной release

После явного разрешения на точный Git SHA и окружение: `release:prepare → release:preflight → release:deploy → release:smoke`. Один immutable artifact, одна загрузка, без автоматического retry/rollback. `release:qualify` — read-only проверка уже опубликованного SHA, не deployment authorization.

Production: `https://300w.app`, Worker `tri-app`; Preview: `https://preview.300w.app`, Worker `tri-app-preview`. GitHub CI запускается только вручную; Auto Deploy отключён. Git merge сам по себе не публикует приложение.

[Deployment runbook](docs/deployment-cloudflare.md) · [Версии и обязательное согласование публичного текста](docs/versioning.md) · [Recovery](docs/recovery-storage.md) · [Текущий статус проекта](docs/PROJECT_BOARD.md).
