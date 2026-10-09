# Cloudflare deployment

Feedback implementation extends this baseline; see [Feedback setup and privacy](feedback.md). Named deploy environments use the protected worker; the top-level target is now the loopback-only local mock entry.

Current deployment is manual via Wrangler: local checkout → Vite `dist/` + Worker bundle → Workers Static Assets → `/api/*` → D1. GitHub automatic builds are not connected.
React remains client-side. Hash routes (including direct `/#/athlete/…` links) are unchanged. Existing static files bypass Worker execution; `/api` and `/api/*` always reach the Worker, including HTML navigation requests. Other paths use the ASSETS binding / SPA fallback. Unknown API paths return JSON 404, never index.html.

Implemented: health, News ingestion/read API, Feedback handlers/UI, build metadata and local tooling. News reads and protected Feedback are active in production and preview. Production live News ingestion awaits a naturally occurring eligible post. Turnstile, the rate limiter and retry cron are configured; D1 save and Telegram delivery have been operator-verified (see [Feedback](feedback.md)). The health endpoint is process/build liveness, not a D1 connectivity check. Unsupported health methods return 405 with Allow: GET. API responses are JSON without permissive CORS; health/errors use no-store, while successful News reads use public max-age=900.

## Current environments (verified 2026-10-09)

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
| Historical initial seed | Posts 993, 992, 988; current API is 997 → 996 → 993 |
| Feedback | Active protected mode; Turnstile, rate limiter and retry cron configured; D1 → Telegram delivery verified |
| Production | Worker `tri-app` deployed; `300w.app` attached; HTTPS/API and iPhone Mini App verified; release remains CONDITIONAL GO |
| GitHub automatic builds | Not connected |
| Custom domain | `preview.300w.app`; Dashboard Type = `Production` for Worker `tri-app-preview` |
| Production public domain | https://300w.app → `tri-app` → `tri-app-production` |

Infrastructure provisioning, migration, webhook and permission status above is operator-confirmed. End-to-end Telegram → Worker → D1 → API was verified on the test channel before switching to the real channel. No test post was sent to the real channel during this documentation update.

Both preview URLs reach the same stable deployment:
`preview.300w.app` → stable deployment of Worker `tri-app-preview` → preview D1 `tri-app-preview`.
Cloudflare labels this Custom Domain **Type = Production** because it targets the
stable production deployment of that Worker. This is still our **preview environment**,
not the application-level 300W production environment.

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
Explicit production commands are documented below. Generic `deploy` and `release` shortcuts remain intentionally absent.

`check:preview` checks the canonical URL `https://preview.300w.app`:
`https://preview.300w.app/api/health` and `https://preview.300w.app/api/news`.
It verifies HTTP 200/JSON, health service/build fields, and a News items array (empty is valid).
It uses only GET requests, rejects redirects, times out after 15 seconds per request,
and exits nonzero on failure. It reports the deployed commit without assuming it matches
local HEAD. Health is not a D1 connectivity check; News may be cached for 900 seconds.
The check does not inspect secrets or perform migrations or writes.

## Live production and manual deployment

Verified snapshot, 2026-10-09 (not a guarantee of future state):

- Public entry: `@tri_app_bot` launches `https://300w.app` (owner-confirmed iPhone).
- Worker `tri-app`; technical URL `https://tri-app.shy-andrey.workers.dev`.
- Code SHA `a1e69f3740738ee7d29927c62178f5a09e559d88`.
- Active version `f90a0765-e7c6-40ad-8bd2-2b0fd8c42766`, deployment `4bdc8537-b846-4dd4-a0e8-8dc9deda7173` (2026-10-08 13:18:59 UTC, secret-triggered).
- Account `3fd801274d556b3ffc138463a0f20830`; DB `tri-app-production`, UUID `2b5cd1b9-d9bf-483d-b710-23d00b6db7fd`; migrations 0001–0004 applied.
- Six installed secret bindings: `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_HMAC_SECRET`, `TELEGRAM_BOT_TOKEN`, `FEEDBACK_TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `NEWS_TELEGRAM_CHANNEL_ID`. Names/presence verified; values never retrieved.
- `APP_ENV=production`, `ALLOWED_ORIGIN=https://300w.app`; managed Turnstile `tri-app-production`, hostname only `300w.app`, public key `0x4AAAAAAFPhEVzQXvHl5kR8`.
- `FEEDBACK_RATE_LIMITER`: namespace `40001`, 5/60; cron `*/5 * * * *`; ASSETS present. Account-wide namespace uniqueness was not certified because dispatch inventory was permission-limited.
- Production News/Feedback bot: `@tri_app_prod_bot`. Its configured News webhook is `https://tri-app.shy-andrey.workers.dev/api/telegram-webhook` (P7B operator-confirmed; current Telegram state not independently re-read).
- Production Feedback E2E passed on iPhone: one saved report, `sent`, attempts=1, no retry/lease; owner confirmed matching UI/Telegram UUID and 🟢 PRODUCTION.
- News bootstrap/API: 997 → 996 → 993; production live ingestion is still UNKNOWN. Do not confuse bootstrap watermark `update_id=-1` with a real webhook event.
- Preview remains on its own Worker, DB, domain and `@tri_app_bot` News webhook. Public Mini App launch settings are independent of that bot's preview webhook. Do not repoint it merely to launch production.

```sh
# Local artifacts only; no deployment:
npm run deploy:production:dry
# REMOTE MUTATION: only after separate release approval and both release gates:
npm run deploy:production
# GET-only; explicitly use the approved deployed SHA, not a later documentation HEAD:
npm run check:production -- --expected-sha a1e69f3740738ee7d29927c62178f5a09e559d88
```

Deploy from a reviewed clean checkout. Record the current version/bindings and recovery point first. Production uses explicit `--env production`, no `--keep-vars`: ordinary vars come from repository config. Normal deploy preserves installed secrets; no migrations, seeding or secrets are chained. Abort unexpected Worker creation or target mismatch. Reverify bindings and application after deployment. Preview continues its separate `--keep-vars` procedure.

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
| Production | `home-redesign-experiments` (current manual release) | `tri-app` | `tri-app-production` | Deployed; `300w.app`; CONDITIONAL GO |

These branch mappings describe the intended workflow, not an active Git trigger. If GitHub builds are connected later, each Worker needs its own branch selection and explicit Wrangler environment (`--env preview` or `--env production`). Do not enable production as part of preview maintenance.

`wrangler.jsonc` contains the real preview UUID and production D1 UUID
`2b5cd1b9-d9bf-483d-b710-23d00b6db7fd`. Production database name is
`tri-app-production`, binding name `DB`; configuring this binding locally does not
attach it to a deployed Worker. The default/local UUID remains
`00000000-0000-0000-0000-000000000000`. Database IDs are configuration, not secrets.
Never substitute preview UUID `4dfe9210-0cc7-484f-8eea-fe5216f5c17a` for production.

Named environments inherit assets/build configuration, use `worker/index.ts` and explicitly declare separate DB bindings. The default target uses loopback-only `worker/local.ts`; do not deploy it remotely. `npm run cf:check` checks this default/local target with `--env "" --dry-run`; it does not validate live preview bindings. Preview is a separately deployed Worker with canonical URL `https://preview.300w.app` and a stable workers.dev fallback, not an automatic PR preview.

`300w.app` → `tri-app` → `tri-app-production` is live infrastructure. Preview remains separate. Further provisioning or configuration changes require explicit approval.

## Runtime configuration and secrets

News is already configured in preview. `NEWS_TELEGRAM_CHANNEL_ID` is ordinary server configuration (it can also be stored as a secret); `TELEGRAM_WEBHOOK_SECRET` must remain a secret. No secret values belong in documentation, Git, logs or VITE_*. `.dev.vars.example` is a local template, not proof of remote configuration.

News ingestion validates the exact channel ID and webhook secret. The first nonempty heading's Telegram bold entities control eligibility; ordinary posts do not create visible news. Edits update, hide or re-enable the same item. The bot is passive and the Worker makes no Telegram API call for ingestion/reads. See [Latest News](latest-news.md).

`TELEGRAM_BOT_TOKEN` is needed locally for Telegram webhook administration and in the Worker only for Feedback delivery. It is configured separately for production and preview Feedback. Preview has the bot destination, Turnstile keys, `ALLOWED_ORIGIN=https://preview.300w.app`, `RATE_LIMIT_HMAC_SECRET`, `FEEDBACK_RATE_LIMITER` (5/60) and retry cron (`*/5 * * * *`). Do not change these or News settings during unrelated maintenance. Production runtime values are recorded above.

Changes to live secrets/configuration can publish a Worker version even without a code deploy. Dashboard-only plain vars may be overwritten by a later Wrangler deployment unless explicitly preserved or represented in the selected environment configuration. Review runtime settings before any future deploy; never infer them from this file or overwrite the active News configuration blindly.

## Rollback

These procedures are instructions for a separately authorized incident response, not commands executed by RC checks. Worker rollback changes live code/config/assets; it does not roll back D1 or Telegram settings.

### Known-good version and Worker rollback

The current version `f90a0765-e7c6-40ad-8bd2-2b0fd8c42766` is the recorded **future rollback candidate** for code SHA `a1e69f3740738ee7d29927c62178f5a09e559d88`. On 2026-10-09 its version metadata was read via GET and contained all six expected secret_text bindings plus the production D1 UUID. Its live deployment passed Feedback E2E. It is currently active, so rolling back to it now would not fix an existing fault. No older version is certified here as a safe alternative. Secret names cannot establish secret values; any later credential rotation requires renewed candidate review.

Before the next deployment, record version ID, SHA, binding metadata, schemas and successful smoke evidence in a private incident/release record. Recheck candidate availability and compatibility each time. Never blindly select the previous version: initial production versions predate complete secrets. If no compatible version with all six secrets is available, STOP and prepare an explicitly reviewed forward recovery deployment; do not fall back to preview.

Read-only discovery:

```sh
npx --no-install wrangler whoami
npx --no-install wrangler deployments list --env production
npx --no-install wrangler versions view f90a0765-e7c6-40ad-8bd2-2b0fd8c42766 --env production
npx --no-install wrangler secret list --env production
```

Compare candidate and active metadata with the runtime snapshot above. If secrets have changed since the candidate, confirm compatibility with the owner without revealing values. Verify D1 schema compatibility; do not undo migrations to make old code run. After explicit approval, and ONLY to recover from a later faulty version:

```sh
# REMOTE MUTATION — not a check; use this candidate only after the checks above.
npx --no-install wrangler rollback f90a0765-e7c6-40ad-8bd2-2b0fd8c42766 --env production
```

Afterward re-read deployment/version, secret names and Worker settings; verify DB UUID, APP_ENV, origin/site key, limiter, ASSETS, schedules and domain separately. Use health with the candidate's expected SHA, full JS download, News/config GET and read-only queue/count checks below. Do not send Feedback automatically. Compare preview snapshot independently. If verification fails, stop and assess; no automatic repeated rollback. Resource data is not restored by code rollback. Cloudflare documents a last-100-versions rollback limit and resource compatibility restrictions: [Worker rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/).

### Production D1 backup and recovery

Target guard for EVERY command: account `3fd801274d556b3ffc138463a0f20830`; DB name `tri-app-production`; UUID `2b5cd1b9-d9bf-483d-b710-23d00b6db7fd`. Abort any mismatch. Preview UUID `4dfe9210-0cc7-484f-8eea-fe5216f5c17a` must never be used as a restore target or production seed source during recovery.

```sh
# Read-only metadata; confirm exact UUID before proceeding:
npx --no-install wrangler d1 info tri-app-production --env production
npx --no-install wrangler d1 time-travel info tri-app-production --env production
# Database export reads remote data and writes a LOCAL sensitive file.
# Substitute an existing private directory outside the repository and a NEW filename.
# Do not overwrite an older backup; do not commit/upload it to public storage.
(umask 077; npx --no-install wrangler d1 export tri-app-production --env production --remote --output /PRIVATE/BACKUP/DIR/tri-app-production-UNIQUE-UTC.sql)
shasum -a 256 /PRIVATE/BACKUP/DIR/tri-app-production-UNIQUE-UTC.sql
```

Backups contain Feedback text/contact data: restrict access, encrypt retained copies and record account/UUID, UTC time, schema version, counts and checksum separately. No export was executed in this RC task. A file/checksum is not a restore drill. Validate a copy in an isolated recovery database under separate approval; never test import against live production or preview.

For a data incident:

1. Record incident time and affected tables. Inspect current state read-only. Identify a last-known-good UTC time/bookmark within actual retention; verify plan in Dashboard (Time Travel normally 7 days Free / 30 days Paid). Retention and restore permissions have not been certified by this task.
2. Before restoration, obtain separate approval for a maintenance plan that stops production Feedback writes, News ingestion AND scheduled retries. No maintenance switch is implemented here; arrange and verify the exact intervention separately. Pausing only the frontend does not stop webhook/cron writes. Preserve incoming-update/reconciliation plans; do not drop Telegram pending updates.
3. Export the current incident state and record its current bookmark before restoring. Identify legitimate reports/events after the chosen recovery point and plan reconciliation; Time Travel rewinds the whole database, including migration bookkeeping, not just the damaged table.
4. Resolve the intended bookmark read-only, then review exact target and data-loss window with the owner:

```sh
# Replace placeholder with a reviewed RFC3339 time, not a guess.
npx --no-install wrangler d1 time-travel info tri-app-production --env production --timestamp '<RECOVERY_UTC>'
# REMOTE WRITE — only after incident approval and maintenance preconditions:
npx --no-install wrangler d1 time-travel restore tri-app-production --env production --bookmark '<REVIEWED_BOOKMARK>'
```

5. Preserve the returned previous bookmark for a possible separately approved undo. Verify schema/migrations, News/state consistency, counts and Feedback statuses before resuming writes. Restoring pending/failed Feedback can resend already delivered Telegram notifications; reconcile against incident snapshot and Telegram evidence before cron resumes. Missing News watermarks can permit replay; Telegram is not a historical archive/recovery source. Reconcile legitimate newer data only through separately reviewed changes; no blind SQL import or automatic requeue.
6. If Time Travel cannot recover the desired state, restore a validated export into a NEW isolated recovery D1 under separate approval, verify it, then approve cutover explicitly. Never import a dump over nonempty production or substitute preview. No schema DOWN migrations are provided. Production now contains real reports: recreating an empty DB is not a safe default recovery.

Time Travel is remote even without `--remote`; restoring cancels in-flight queries. These procedures have not been exercised as a restore drill. See [D1 recovery](https://developers.cloudflare.com/d1/reference/time-travel/) and [Wrangler D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/).

## Operational checks

Use expected deployed SHA explicitly after documentation commits; HEAD may differ. Routine monitoring is GET/SELECT only:

```sh
npm run check:production -- --expected-sha a1e69f3740738ee7d29927c62178f5a09e559d88
npm run check:preview
curl --fail --show-error --max-time 15 https://300w.app/api/feedback/config
npx --no-install wrangler d1 execute DB --env production --remote --command "SELECT name FROM d1_migrations ORDER BY id; SELECT delivery_status,COUNT(*) AS count FROM feedback GROUP BY delivery_status; SELECT id,created_at,delivery_status,delivery_attempts,last_delivery_at,next_delivery_at,delivery_lease IS NULL AS lease_clear FROM feedback WHERE delivery_status!='sent' OR delivery_lease IS NOT NULL OR next_delivery_at IS NOT NULL;"
# Substitute a validated numeric public message ID before running:
npx --no-install wrangler d1 execute DB --env production --remote --command "SELECT message_id,title,excerpt,published_at,updated_at,source,hidden,media_group_id,telegram_url FROM news WHERE message_id=<MESSAGE_ID>; SELECT message_id,event_at,update_id,media_group_id FROM news_post_state WHERE message_id=<MESSAGE_ID>; SELECT channel_id,message_id,COUNT(*) FROM news GROUP BY channel_id,message_id HAVING COUNT(*)>1;"
```

Repeat the message-specific SELECT with explicit `--env preview` only for comparison. Expected current API baseline: 997/996/993. After a natural eligible post, verify source=telegram, one row, watermark ordering and latest-three presentation; album grouping and 900-second cache apply. See [News operations](latest-news.md). A state-only row may be an intentional rejection; review safe structured reason logs, not raw bodies.

Feedback alert conditions: repeated failed attempts, attempts>=5 (manual investigation needed), leases/due retries remaining overdue across cron cycles, unexpected growth or duplicates. Do not log descriptions/emails. Cron is five minutes; lease is 60 seconds; D1 remains authoritative if Telegram fails. Restores/crashes can duplicate notifications, not imply duplicate report rows.

Webhook: only getWebhookInfo, using the correct bot credential from the owner's secure store without printing token-bearing URLs. Verify production workers.dev URL, allowed_updates channel_post/edited_channel_post, pending_update_count and error date/message. Do not call setWebhook/deleteWebhook/getUpdates as a diagnostic. If credential is unavailable, mark UNKNOWN; Worker secret values are not retrievable. Public bot Mini App launch settings are separately checked in BotFather/on-device; do not change its preview News webhook.

Read-only Cloudflare Dashboard/API checks: production Worker settings/secret names, Turnstile widget hostname=300w.app and managed mode, limiter 40001/5/60, schedules */5, domain attached to tri-app. Secret presence does not prove correct pairing; owner-confirmed E2E supplies that runtime evidence. Preview uses a different DB/widget/limiter. Snapshot 2026-10-09 preview lacks live APP_ENV (older deployment), despite current repository config; do not silently deploy it during production work.

Asset smoke: GET the current index.html, obtain its actual JS/CSS paths and download each with a bounded timeout. Compare complete byte counts/checksums with that approved release build, not HTTP 200 alone. Compare workers.dev if necessary. Record device/network/VPN state; do not disable TLS verification. Current example JS /assets/index-BmpoD4_d.js is 272194 bytes raw. Intermittent direct Mac/Windows failures remain unresolved; a successful run is not global availability. Owner iPhone Mini App checks passed; Android remains unverified.

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


Feedback environment labels use the ordinary Worker var `APP_ENV`: `preview` in
`env.preview`, `production` in `env.production`. This repository configuration is
not a deployment. Preview (`@tri_app_bot`) and Production (`@tri_app_prod_bot`)
intentionally share one private Feedback group; the explicit headings end in
`🧪 PREVIEW` and `🟢 PRODUCTION`. Missing/unknown `APP_ENV` (including the default
local config) yields `⚠️ ENV UNKNOWN`, never an inferred production label.
News webhooks stay separate because each bot supports only one active webhook.
No Telegram token or chat ID is stored in repository config.


### Historical first-deploy sequence — completed, do not rerun

The following describes the completed first-deploy procedure, not current missing setup. Never reinstall secrets from this historical checklist without explicit approval.

Only after separate approval: deploy the reviewed config to workers.dev without
custom-domain routes or Telegram webhook. Before secrets, health and static assets
should work; News GET returns an empty feed without the channel binding. Feedback
config exposes protected mode/site key, but POST Feedback and News webhook return
503 without server secrets. The workers.dev hostname is not authorized by the
production Turnstile widget or `ALLOWED_ORIGIN`; do not expect Feedback E2E there.
The empty Feedback queue makes cron read-only with no Telegram call. Install
credentials before accepting reports, otherwise retries can consume attempts.

After confirming Worker `tri-app` exists and the intended version is deployed,
the owner can run these commands **only with separate secret-install approval**:

```sh
npx --no-install wrangler secret put TELEGRAM_BOT_TOKEN --env production
npx --no-install wrangler secret put TURNSTILE_SECRET_KEY --env production
npx --no-install wrangler secret put FEEDBACK_TELEGRAM_CHAT_ID --env production
npx --no-install wrangler secret put NEWS_TELEGRAM_CHANNEL_ID --env production
npx --no-install wrangler secret put TELEGRAM_WEBHOOK_SECRET --env production
npx --no-install wrangler secret put RATE_LIMIT_HMAC_SECRET --env production
```

Each ordinary `secret put` creates and immediately deploys a new Worker version;
it is not a read-only or staging operation. Wrangler 4.142.0 can offer to create a
missing Worker (and defaults to yes in non-interactive mode). Do not use these
commands to create the first Worker; abort any unexpected creation prompt.

Use the production BotFather token and production Turnstile Dashboard secret;
paste only into hidden prompts. For the two ID prompts use the owner-confirmed
identifiers from the private owner runbook. Independently generate the webhook and HMAC secrets, one at a time,
with `openssl rand -hex 32 | pbcopy`; store each in a password manager, paste into
its prompt, then clear clipboard with `pbcopy < /dev/null`. Avoid clipboard
history/sync. Do not put values into command arguments, repository files or chat.
No secrets are generated or installed by build/dry-run. Keep webhook secret for
later separately approved webhook setup; do not switch preview's webhook.

### Finder metadata upload exclusion

Vite copies `public/` into `dist/`, including local Finder `.DS_Store` files.
`public/.assetsignore` is copied to `dist/.assetsignore`; its `**/.DS_Store` rule
excludes root and nested Finder metadata from Wrangler uploads. It does not delete
local files and does not change normal assets. See
[Cloudflare asset ignore rules](https://developers.cloudflare.com/workers/static-assets/binding/).
