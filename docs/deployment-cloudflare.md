# Cloudflare deployment

Feedback implementation extends this baseline; see [Feedback setup and privacy](feedback.md). Named deploy environments use the protected worker; the top-level target is now the loopback-only local mock entry.

Current deployment is manual via Wrangler: local checkout → Vite `dist/` + Worker bundle → Workers Static Assets → `/api/*` → D1. GitHub automatic builds are not connected.
React remains client-side. Hash routes (including direct `/#/athlete/…` links) are unchanged. Existing static files bypass Worker execution; `/api` and `/api/*` always reach the Worker, including HTML navigation requests. Other paths use the ASSETS binding / SPA fallback. Unknown API paths return JSON 404, never index.html.

Implemented: health, News ingestion/read API, Feedback handlers/UI, build metadata and local tooling. News and protected Feedback are active in preview. Turnstile, the rate limiter and retry cron are configured; D1 save and Telegram delivery have been operator-verified (see [Feedback](feedback.md)). The health endpoint is process/build liveness, not a D1 connectivity check. Unsupported health methods return 405 with Allow: GET. API responses are JSON without permissive CORS; health/errors use no-store, while successful News reads use public max-age=900.

## Current live preview (2026-10-01)

| Setting | Current state |
| --- | --- |
| Branch | `home-redesign-experiments` |
| Worker | `tri-app-preview`; first deployment succeeded |
| Canonical public preview | https://preview.300w.app |
| Technical fallback | https://tri-app-preview.shy-andrey.workers.dev |
| D1 | `tri-app-preview`, binding `DB` |
| D1 UUID | `4dfe9210-0cc7-484f-8eea-fe5216f5c17a` |
| Remote schema | Migrations 0001–0004 applied |
| News channel | `@trista_watt`, exact channel ID `-1002054307603` |
| Bot | `@tri_app_bot`, passive; unnecessary admin permissions disabled; must not post to the channel |
| Webhook | https://tri-app-preview.shy-andrey.workers.dev/api/telegram-webhook |
| Allowed updates | `channel_post`, `edited_channel_post` |
| Runtime News config | `NEWS_TELEGRAM_CHANNEL_ID` configured; `TELEGRAM_WEBHOOK_SECRET` stored as a Cloudflare secret |
| Approved remote seed | Posts 993, 992, 988; source `manually-approved-telegram-seed` |
| Feedback | Active protected mode; Turnstile, rate limiter and retry cron configured; D1 → Telegram delivery verified |
| Production (P1/P2 update) | D1 `tri-app-production` exists; Worker not deployed, domain not bound; NOT live |
| GitHub automatic builds | Not connected |
| Custom domain | `preview.300w.app`; Dashboard Type = `Production` for Worker `tri-app-preview` |
| Reserved future production domain | `300w.app`; registered, reserved, not connected to production routing |

Infrastructure provisioning, migration, webhook and permission status above is operator-confirmed. End-to-end Telegram → Worker → D1 → API was verified on the test channel before switching to the real channel. No test post was sent to the real channel during this documentation update.

Both preview URLs reach the same stable deployment:
`preview.300w.app` → stable deployment of Worker `tri-app-preview` → preview D1 `tri-app-preview`.
Cloudflare labels this Custom Domain **Type = Production** because it targets the
stable production deployment of that Worker. This is still our **preview environment**,
not the future application-level 300W production environment.

Operator-confirmed through the custom domain: frontend, `/api/health`, `/api/news`,
preview D1 binding and real `@trista_watt` News posts work. Historical custom-domain verification health
commit: `09c8ea62a33be2d5a2d3293f833e7d1282bf8c67`.

The tested Telegram News webhook remains
`https://tri-app-preview.shy-andrey.workers.dev/api/telegram-webhook`.
Its technical endpoint is independent of the public frontend hostname; adding the
custom domain does not require a webhook migration. Keep the workers.dev URL as
the technical fallback for preview; no webhook change accompanies this update.

Read-only verification on 2026-09-28: `/api/health` returned `ok: true`, service `tri-app`, version `0.0.0`, commit `15ac56c225db636b01f27aec89fb8addccf2c478`. `/api/news` returned exactly `telegram-seed-993`, `telegram-seed-992`, `telegram-seed-988`, with canonical titles/excerpts/timestamps and `https://t.me/trista_watt/<message_id>` links. These HTTP checks do not independently inspect Cloudflare secrets, bot permissions or migration history.

## Local setup (no Cloudflare account)

Use Node 24 LTS (minimum 22.18 for the TypeScript-stripping unit test), npm and Python 3 (schema test uses stdlib sqlite3).

```sh
npm ci
npm run dev                  # predev generates public build metadata, then Vite
npm run test:foundation      # no account, network, real secrets or D1 service
npm run cf:migrate:local     # versioned migrations to local SQLite/D1
npm run cf:dev               # Wrangler runs npm run build, then local assets + API + D1
```

Full stack is normally http://localhost:8787; use `/api/health` and `/#/more`. Wrangler's custom build watches src/ and worker/. Restart after package/config/migration changes; rerun local migrations when SQL changes. Plain Vite dev remains fast UI-only and does not provide `/api`; use the full-stack Wrangler server to test News and Feedback APIs. `npm run preview` remains a frontend-only Vite preview.

```sh
npm run build               # metadata + frontend/Worker typechecks + Vite production output
npm run cf:check            # Worker bundle/config dry-run, no deployment
npx wrangler d1 migrations list DB --local
```

`.wrangler/` stores local DB/state/build artifacts and is ignored. Migrations never execute on request or startup. Reapplying `cf:migrate:local` is safe: Wrangler tracks applied migration filenames in d1_migrations. Create subsequent migrations with `npx wrangler d1 migrations create DB <description>`; do not edit an applied migration.

## Manual preview workflow

```sh
npm run deploy:preview:dry -- --keep-vars   # build/config check only; no deployment
npm run deploy:preview -- --keep-vars       # REAL deployment to tri-app-preview
npm run check:preview        # read-only GET /api/health and /api/news after deployment
```

`--keep-vars` preserves dashboard-managed ordinary vars during manual deployment; still review the selected environment configuration.
Both deploy scripts use the project-local Wrangler with explicit `--env preview`.
Wrangler runs `npm run build`, including metadata generation from the current checkout
(see Build identity below), and selects Worker `tri-app-preview` with binding
`DB` → `tri-app-preview`. The dry command adds `--dry-run` and does not deploy.
Explicit production commands are prepared below for future use. Generic `deploy` and `release` shortcuts remain intentionally absent.

`check:preview` checks the canonical URL `https://preview.300w.app`:
`https://preview.300w.app/api/health` and `https://preview.300w.app/api/news`.
It verifies HTTP 200/JSON, health service/build fields, and a News items array (empty is valid).
It uses only GET requests, rejects redirects, times out after 15 seconds per request,
and exits nonzero on failure. It reports the deployed commit without assuming it matches
local HEAD. Health is not a D1 connectivity check; News may be cached for 900 seconds.
The check does not inspect secrets or perform migrations or writes.

## Prepared production commands — NOT live

P1 created only D1 `tri-app-production` in account
`3fd801274d556b3ffc138463a0f20830`, UUID
`2b5cd1b9-d9bf-483d-b710-23d00b6db7fd`. Migrations 0001–0004 are **NOT applied**.
Worker `tri-app` is **NOT deployed**, `300w.app` is **NOT bound**, and production
Turnstile/site key, allowed origin, rate limiter, cron and secrets are **NOT configured**.
News seed/webhook and Feedback destination setup are also pending. Production is **NOT live**.

```sh
npm run deploy:production:dry   # local build/bundle only; explicit --env production --dry-run
# FUTURE REAL DEPLOY — requires separate approval and completed prerequisites:
npm run deploy:production
npm run check:production       # GET only; expected SHA defaults to local git HEAD
npm run check:production -- --expected-sha <approved-40-character-sha>
```

Both production deploy scripts use explicit `--env production`. No migrations or
seed are chained to deployment. Do not run the real deploy while this configuration
is incomplete. Dry-run cannot establish production readiness: optional TypeScript
Env fields and Wrangler bundling do not validate required live Feedback/News secrets.

Production uses a declarative ordinary-vars policy: no `--keep-vars`; Wrangler's
default replaces ordinary remote vars with the selected config. Declare all required
production ordinary vars before the first real deploy; inspect any unexpected
Dashboard-managed vars before later deploys. Existing remote secrets are preserved
by normal deploy, but none are provisioned by these commands. Preview's existing
`--keep-vars` operational workflow is unchanged. Never pass secret values as npm arguments.

The checkers share GET/JSON/status validation and 15-second request timeouts.
Production is fixed to `https://300w.app/api/health` and `/api/news`, rejects redirects
and never falls back to preview/workers.dev. It verifies a full health commit SHA
against the explicit expected SHA (or local HEAD); an unavailable domain, invalid
response or SHA mismatch exits nonzero with `PRODUCTION check failed`.
Preview retains its existing health/News validation without requiring a SHA match;
output labels distinguish PREVIEW/PRODUCTION. Empty News is accepted by this basic
checker, so a PASS is not proof of seeded News, D1 schema, ingestion or Feedback E2E.
No checker sends Feedback/Telegram requests. A dirty working build can still report
HEAD; release checks require the separately reviewed clean source state.

## Build identity

`scripts/build-metadata.mjs` generates ignored `.generated/build-metadata.ts` before dev/build/tests. Both worker/index.ts and src/utils/buildMetadata.ts use it. The More screen displays the version; health also exposes the commit.

Version comes from package.json (currently 0.0.0). Commit uses a validated 40-character SHA from BUILD_COMMIT, CF_WORKERS_BUILD_COMMIT, CF_PAGES_COMMIT_SHA or GITHUB_SHA; otherwise git rev-parse HEAD; otherwise `unknown`. No arbitrary environment dump, secrets, timestamp or machine path enters the module. An uncommitted local build reports HEAD, not a claim of a clean release. CI should build a clean checkout; publish static assets and Worker together. Wrangler's custom build ensures metadata and dist are regenerated together. Use npm scripts rather than calling tsc directly before generated metadata exists.

The pre-existing package.json had incorrect react-hooks/react-refresh plugin ranges. They were aligned with the existing lockfile; installed plugin versions were not upgraded. Cloudflare dev dependencies are the only new tooling. No frontend runtime dependency was added.

## Database schema

`migrations/0001_feedback_news.sql` creates STRICT tables:

- feedback: report ID, creation timestamp, category, 10–4000 character description, optional contact/context, build identity, optional viewport JSON/client info; pending/sent/failed delivery status, attempts, last/next attempt timestamps. Retry and creation indexes. ID supports future idempotent submission. No raw IP.
- news: stable ID, channel/message identity (UNIQUE), publication/edit/create timestamps, title/excerpt, Telegram URL, hidden flag. Visible publication-date index. No image fields.

Migrations 0002–0004 add Feedback delivery fields, News ingestion watermarks/media groups and News source provenance. The webhook performs UPSERT by channel/message and ignores stale updates using event time and update ID. UNIQUE prevents duplicate rows, but authentication, ordering and idempotent side effects still belong to the handler. SQL constraints complement, not replace, API validation. There are no foreign keys to athlete/race tables: that catalog remains versioned frontend data, not duplicated in D1.

## Environment boundaries

| Environment | Branch | Worker | D1 | Status |
| --- | --- | --- | --- | --- |
| Preview | `home-redesign-experiments` | `tri-app-preview` | `tri-app-preview` | Live; manual deployment |
| Future production | `main` (intended) | `tri-app` (not deployed) | `tri-app-production` (created, not migrated) | NOT live; domain not bound |

These branch mappings describe the intended workflow, not an active Git trigger. If GitHub builds are connected later, each Worker needs its own branch selection and explicit Wrangler environment (`--env preview` or `--env production`). Do not enable production as part of preview maintenance.

`wrangler.jsonc` contains the real preview UUID and production D1 UUID
`2b5cd1b9-d9bf-483d-b710-23d00b6db7fd`. Production database name is
`tri-app-production`, binding name `DB`; configuring this binding locally does not
attach it to a deployed Worker. The default/local UUID remains
`00000000-0000-0000-0000-000000000000`. Database IDs are configuration, not secrets.
Never substitute preview UUID `4dfe9210-0cc7-484f-8eea-fe5216f5c17a` for production.

Named environments inherit assets/build configuration, use `worker/index.ts` and explicitly declare separate DB bindings. The default target uses loopback-only `worker/local.ts`; do not deploy it remotely. `npm run cf:check` checks this default/local target with `--env "" --dry-run`; it does not validate live preview bindings. Preview is a separately deployed Worker with canonical URL `https://preview.300w.app` and a stable workers.dev fallback, not an automatic PR preview.

`300w.app` is registered and reserved for future production. Intended architecture:
`300w.app` → production Worker `tri-app` → production D1 `tri-app-production`.
This is separate from the preview Worker's Dashboard domain type. P1 subsequently
created the production D1 only; production routing and Worker deployment remain pending.

Further production provisioning requires separate approval: migrations, Worker deployment, domain binding and runtime protection/delivery configuration are still pending.

## Runtime configuration and secrets

News is already configured in preview. `NEWS_TELEGRAM_CHANNEL_ID` is ordinary server configuration (it can also be stored as a secret); `TELEGRAM_WEBHOOK_SECRET` must remain a secret. No secret values belong in documentation, Git, logs or VITE_*. `.dev.vars.example` is a local template, not proof of remote configuration.

News ingestion validates the exact channel ID and webhook secret. The first nonempty heading's Telegram bold entities control eligibility; ordinary posts do not create visible news. Edits update, hide or re-enable the same item. The bot is passive and the Worker makes no Telegram API call for ingestion/reads. See [Latest News](latest-news.md).

`TELEGRAM_BOT_TOKEN` is needed locally for Telegram webhook administration and in the Worker only for Feedback delivery. It is configured remotely for preview Feedback. Preview has the bot destination, Turnstile keys, `ALLOWED_ORIGIN=https://preview.300w.app`, `RATE_LIMIT_HMAC_SECRET`, `FEEDBACK_RATE_LIMITER` (5/60) and retry cron (`*/5 * * * *`). Do not change these or News settings during unrelated maintenance. Future production is not ready.

Changes to live secrets/configuration can publish a Worker version even without a code deploy. Dashboard-only plain vars may be overwritten by a later Wrangler deployment unless explicitly preserved or represented in the selected environment configuration. Review runtime settings before any future deploy; never infer them from this file or overwrite the active News configuration blindly.

## Rollback

Inspect `npx wrangler deployments list --env production`, then use `npx wrangler rollback <version-id> --env production` only with release approval. This rolls back Worker/assets, NOT D1 migrations. Prefer additive backward-compatible migrations and forward SQL fixes; take a remote D1 export before destructive changes. Never automatically drop tables/down-migrate to roll back code. Restore/migrate database data as a separately reviewed action.

## Release checks

Run `npm run check:release` and the separately prepared local `npm run check:release:browser` before RC. Both must pass; see [V1 release checks](scripts.md#10-v1-release-checks) for the exact allowlist, known-data policy, historical checks and environment requirements. These gates do not deploy or verify live infrastructure. Local Wrangler smoke-test must verify static vs API routing and local migration replay. Health returns only ok/service/version/commit; no secrets and no D1 query. Do not enable future write endpoints until validation, abuse protection and delivery behavior are implemented.

Official references: [Static Assets](https://developers.cloudflare.com/workers/static-assets/), [asset routing](https://developers.cloudflare.com/workers/static-assets/binding/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).

## Preview documentation checks (2026-09-28)

- `npm run build`: passed frontend/Worker typechecks and Vite build; existing chunk-size warning above 500 kB remains.
- `npm run cf:check`: passed default/local Worker dry-run; no upload or deployment.
- `node --test scripts/test-news-eligibility.mjs scripts/test-news.mjs scripts/test-news-seed.mjs scripts/test-news-presentation.mjs`: 29/29 passed.
- `npm run test:foundation`: 5/5 passed.
- `git diff --check`: passed.
- Live read-only health/News checks are recorded above. No D1 writes, webhook/secret changes, bot messages or resource creation were performed.

## Historical foundation verification (2026-09-27, before live setup)

- Foundation tests: 5/5 passed (health, routing/methods, metadata fallback/no secrets, real SQLite migration constraints).
- Existing ranking/dataset clock/country strength/navigation/search/result-import tests: 50/50 passed.
- Local workerd: health 200, unknown API JSON 404 even with navigation headers, method 405, index/hash URL/JS assets and SPA fallback verified. D1 migration applied successfully; second application reports no pending migrations.
- Wrangler deploy --dry-run bundled successfully without uploading. npm ci --dry-run --ignore-scripts --offline passed; existing dependency package versions did not change.
- Vite + Worker typecheck/build passed; previous >500 kB bundle warning remains. ESLint: 0 errors, one existing RaceDetailPage warning. Results audit: 0 errors/0 warnings. Athlete audit: two existing issues. git diff --check passed.
- Extra photo suites: 42/46 pass. The same four failures reproduce against the accepted HEAD with the existing local photo staging available: obsolete 1161/939 catalog/coverage counts and incomplete Batch 2/3 historical catalog baselines after six new athletes were imported. No photo code/data was changed or audit weakened. These existing test-fixture issues are outside foundation scope.

That foundation implementation task performed no remote deployment, database creation or Telegram setup. The subsequent live preview state is recorded above.
