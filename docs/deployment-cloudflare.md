# Cloudflare foundation

Feedback implementation extends this baseline; see [Feedback setup and privacy](feedback.md). Named deploy environments use the protected worker; the top-level target is now the loopback-only local mock entry.

GitHub → `npm ci` → Vite `dist/` + Worker bundle → Workers Static Assets → `/api/*` → D1.
React remains client-side. Hash routes (including direct `/#/athlete/…` links) are unchanged. Existing static files bypass Worker execution; `/api` and `/api/*` always reach the Worker, including HTML navigation requests. Other paths use the ASSETS binding / SPA fallback. Unknown API paths return JSON 404, never index.html.

Implemented: GET /api/health, schema/migrations, build metadata and local tooling. Feedback/news handlers, Telegram webhook/delivery, Turnstile, rate limiting, scheduled jobs and UI are intentionally absent. The health endpoint is process/build liveness, not a D1 connectivity check. Unsupported health methods return 405 with Allow: GET. API responses are no-store JSON, with no permissive CORS headers; production callers use the same origin. Future write endpoints must validate Origin and inputs, not rely on CORS alone.

## Local setup (no Cloudflare account)

Use Node 24 LTS (minimum 22.18 for the TypeScript-stripping unit test), npm and Python 3 (schema test uses stdlib sqlite3).

```sh
npm ci
npm run dev                  # predev generates public build metadata, then Vite
npm run test:foundation      # no account, network, real secrets or D1 service
npm run cf:migrate:local     # versioned migrations to local SQLite/D1
npm run cf:dev               # Wrangler runs npm run build, then local assets + API + D1
```

Full stack is normally http://localhost:8787; use `/api/health` and `/#/more`. Wrangler's custom build watches src/ and worker/. Restart after package/config/migration changes; rerun local migrations when SQL changes. Plain Vite dev remains fast UI-only and does not provide `/api`; no proxy is necessary until frontend API features are implemented. `npm run preview` remains a frontend-only Vite preview.

```sh
npm run build               # metadata + frontend/Worker typechecks + Vite production output
npm run cf:check            # Worker bundle/config dry-run, no deployment
npx wrangler d1 migrations list DB --local
```

`.wrangler/` stores local DB/state/build artifacts and is ignored. Migrations never execute on request or startup. Reapplying `cf:migrate:local` is safe: Wrangler tracks applied migration filenames in d1_migrations. Create subsequent migrations with `npx wrangler d1 migrations create DB <description>`; do not edit an applied migration.

## Build identity

`scripts/build-metadata.mjs` generates ignored `.generated/build-metadata.ts` before dev/build/tests. Both worker/index.ts and src/utils/buildMetadata.ts use it. No build metadata is displayed yet.

Version comes from package.json (currently 0.0.0). Commit uses a validated 40-character SHA from BUILD_COMMIT, CF_WORKERS_BUILD_COMMIT, CF_PAGES_COMMIT_SHA or GITHUB_SHA; otherwise git rev-parse HEAD; otherwise `unknown`. No arbitrary environment dump, secrets, timestamp or machine path enters the module. An uncommitted local build reports HEAD, not a claim of a clean release. CI should build a clean checkout; publish static assets and Worker together. Wrangler's custom build ensures metadata and dist are regenerated together. Use npm scripts rather than calling tsc directly before generated metadata exists.

The pre-existing package.json had incorrect react-hooks/react-refresh plugin ranges. They were aligned with the existing lockfile; installed plugin versions were not upgraded. Cloudflare dev dependencies are the only new tooling. No frontend runtime dependency was added.

## Database schema

`migrations/0001_feedback_news.sql` creates STRICT tables:

- feedback: report ID, creation timestamp, category, 10–4000 character description, optional contact/context, build identity, optional viewport JSON/client info; pending/sent/failed delivery status, attempts, last/next attempt timestamps. Retry and creation indexes. ID supports future idempotent submission. No raw IP.
- news: stable ID, channel/message identity (UNIQUE), publication/edit/create timestamps, title/excerpt, Telegram URL, hidden flag. Visible publication-date index. No image fields.

A future webhook performs UPSERT by channel/message and ignores stale edited timestamps. UNIQUE prevents duplicate rows, but authentication, ordering and idempotent side effects still belong to the handler. SQL constraints complement, not replace, API validation. There are no foreign keys to athlete/race tables: that catalog remains versioned frontend data, not duplicated in D1.

## Environments / later remote setup

wrangler.jsonc includes distinct local, preview and production names/bindings. All three UUIDs are deliberate placeholders, not real database IDs. Local D1 works with the placeholder. Before any remote command, create databases and replace the corresponding preview/production UUID; database IDs are configuration, not secrets. Never use production D1 for preview. Do not deploy the top-level local target.

After separate deployment approval:

```sh
npx wrangler login
npx wrangler d1 create tri-app-preview
npx wrangler d1 create tri-app-production
# Copy returned UUIDs to the appropriate wrangler.jsonc env binding, review the diff.
npx wrangler d1 migrations list DB --env preview --remote
npx wrangler d1 migrations apply DB --env preview --remote
npx wrangler deploy --env preview
# Smoke-test preview /, hash deep link, real CSS/JS, health, JSON 404 and 405.
npx wrangler d1 migrations list DB --env production --remote
npx wrangler d1 migrations apply DB --env production --remote
npx wrangler deploy --env production
```

Named environments inherit the Worker/assets/build configuration but explicitly declare separate DB bindings. Future per-environment vars/secrets must be configured separately. Preview here is an explicitly deployed isolated Worker, not an automatic PR preview. workers.dev can be used initially; configure a custom domain afterward. Account, domain, CI integration and remote resources have not been created in this task.

## Future secrets / config

Foundation requires no real secret. `.dev.vars.example` is comments only; copy it to ignored `.dev.vars` when implementing the features. Never put real values in the example, Git, logs or VITE_*.

Secrets (later): TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, TURNSTILE_SECRET_KEY, RATE_LIMIT_HMAC_SECRET. For each environment set them interactively, e.g. `npx wrangler secret put TELEGRAM_BOT_TOKEN --env preview`, and separately for production. Do not paste tokens into command arguments or docs.

Server config (later): FEEDBACK_TELEGRAM_CHAT_ID, NEWS_TELEGRAM_CHANNEL_ID, ALLOWED_ORIGIN, set in the selected environment vars/dashboard. Keep preview bot/chat separate. Only the public Turnstile site key may eventually be frontend public config; it is not needed now. Env types mark all future fields optional; health/static serving must work without them. D1 access is through the DB binding, not SQL credentials.

## Rollback

Inspect `npx wrangler deployments list --env production`, then use `npx wrangler rollback <version-id> --env production` only with release approval. This rolls back Worker/assets, NOT D1 migrations. Prefer additive backward-compatible migrations and forward SQL fixes; take a remote D1 export before destructive changes. Never automatically drop tables/down-migrate to roll back code. Restore/migrate database data as a separately reviewed action.

## Release checks

Run foundation and existing ranking/dataset-clock/country-strength/navigation/search/import tests, audits, build, lint and git diff --check. Local Wrangler smoke-test must verify static vs API routing and local migration replay. Health returns only ok/service/version/commit; no secrets and no D1 query. Do not enable future write endpoints until validation, abuse protection and delivery behavior are implemented.

Official references: [Static Assets](https://developers.cloudflare.com/workers/static-assets/), [asset routing](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).

## Foundation verification (2026-09-27)

- Foundation tests: 5/5 passed (health, routing/methods, metadata fallback/no secrets, real SQLite migration constraints).
- Existing ranking/dataset clock/country strength/navigation/search/result-import tests: 50/50 passed.
- Local workerd: health 200, unknown API JSON 404 even with navigation headers, method 405, index/hash URL/JS assets and SPA fallback verified. D1 migration applied successfully; second application reports no pending migrations.
- Wrangler deploy --dry-run bundled successfully without uploading. npm ci --dry-run --ignore-scripts --offline passed; existing dependency package versions did not change.
- Vite + Worker typecheck/build passed; previous >500 kB bundle warning remains. ESLint: 0 errors, one existing RaceDetailPage warning. Results audit: 0 errors/0 warnings. Athlete audit: two existing issues. git diff --check passed.
- Extra photo suites: 42/46 pass. The same four failures reproduce against the accepted HEAD with the existing local photo staging available: obsolete 1161/939 catalog/coverage counts and incomplete Batch 2/3 historical catalog baselines after six new athletes were imported. No photo code/data was changed or audit weakened. These existing test-fixture issues are outside foundation scope.

No remote deployment, database creation, Telegram setup, git add/commit/push was performed.
