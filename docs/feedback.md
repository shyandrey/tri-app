# V1 Feedback

Users submit in 300W⚡ APP; no Telegram account or attachment is needed. More, Athlete Profile and Race Detail open a dedicated `#/feedback` page. Existing History API entries retain the source screen, scroll, filters, expanded years, edition and result sort. Only the small source context is attached to the feedback history entry. Description/email live in component memory, never in URL, history or localStorage; leaving/reloading the form discards an unsent draft. Race context is captured at click time from active edition and either controlled or table-internal gender.

## API and storage

`GET /api/feedback/config` exposes only mode (`local`/`protected`) and the public Turnstile site key. `POST /api/feedback` takes the typed `FeedbackPayload` in `shared/feedback.ts`: random UUIDv4 requestId, category, description, optional email, allowlisted context, build, viewport, optional app-only clientInfo, Turnstile token and empty honeypot website. Same-origin JSON only, streamed body capped at 16 KiB. Text is stored and displayed as plain text; arbitrary HTML is never rendered. Unknown keys are discarded, never inserted into D1 or Telegram.

- 201 `{ "ok": true, "reportId": "…" }`: committed to D1, regardless of notification outcome.
- 409 with the same success body: exact replay of an accepted request. UI treats it as success.
- 409 `IDEMPOTENCY_CONFLICT`: same UUID, different canonical content; no overwrite.
- 400 validation/challenge, 403 origin, 413 body limit, 429 rate limit (`Retry-After: 60`), 503 unavailable/storage failure. UI uses Russian messages and retains form fields after errors.

The UUID is the existing table primary key. A SHA-256 fingerprint excludes challenge/honeypot, includes the allowlisted persisted content. Retry keeps the exact original UUID/context/viewport snapshot; refreshing a challenge token does not change identity. Editing category/text/email creates a new report. An ambiguous network failure followed by an unchanged retry cannot create a second row. On a replay, protection config, origin, rate limit and input are checked before acknowledging the stored UUID/hash; the already-used Turnstile token need not be reused.

Feedback requires migrations `0001_feedback_news.sql` and `0002_feedback_delivery.sql`. The latter adds request_hash, active_gender, delivery_lease and a delivery-claim index. Preview migrations 0001–0004 are already applied, with no pending migrations; the expected Feedback schema and an empty queue were operator-confirmed before this configuration update. No new migration is required. Legacy reports remain retryable.

## Delivery and retry

INSERT commits before Telegram. Delivery failures do not change user success. Telegram uses plain text without parse_mode, link previews disabled, 8-second timeout; long descriptions are shortened in the notification, with full text retained in D1. Email/context are included only as needed; browser/viewport are not forwarded. Missing credentials leave reports failed/retryable.

The existing `sent` status means delivered; migration 0001's enum is preserved. Atomic UPDATE…RETURNING claims a row for 60 seconds, increments attempts and sets last_delivery_at; lease token protects completion from stale workers. Success → sent; failure → failed with exponential delay, maximum five attempts. Retry processes up to ten due pending/failed rows, never sent rows. Exhausted rows remain stored for manual investigation/requeue. Scheduled handler calls this function. Telegram has no sendMessage idempotency: a process crash after Telegram accepts but before D1 records sent can produce a duplicate notification; it cannot duplicate the report row. There is no claim of exactly-once external delivery.

## Local demo (no credentials)

```sh
npm run cf:migrate:local
npm run cf:dev -- --port 8787 --test-scheduled
# Open http://localhost:8787/#/more, submit reports from all three entry points.
npx wrangler d1 execute DB --local --command "SELECT id,screen,race_edition_id,active_gender,delivery_status,delivery_attempts FROM feedback ORDER BY created_at DESC LIMIT 10"
# Trigger local mock retry handler (development only):
curl 'http://localhost:8787/__scheduled?cron=*/5+*+*+*+*'
```

The top-level Wrangler target uses `worker/local.ts`: loopback hosts only, explicit token `local-feedback`, mock delivery, no rate-limit counter. Named preview/production targets explicitly use `worker/index.ts`, which has no bypass env flag. A remote hostname hitting the local entry returns 503. Do not deploy the top-level local target. Plain `npm run dev` remains frontend-only; use cf:dev for this flow. Mock `sent` statuses describe test delivery only.

Tests: `npm run test:foundation`, `npm run test:feedback` (Python sqlite3 executes real SQL). Browser flow: start an isolated Chrome CDP instance on port 9232 and local Worker on 8787, then `node scripts/test-feedback-browser.mjs`. Optional `TRI_CDP_URL` and `TRI_APP_URL` override those defaults. Browser tests create three actual local D1 rows and save their IDs to `/tmp/tri-feedback-demo.json`, plus `/tmp/tri-feedback-mobile.png`; no runtime artifacts should be committed.

## Live environments (2026-10-09)

Canonical preview is `https://preview.300w.app`; the existing technical fallback is `https://tri-app-preview.shy-andrey.workers.dev`. Both target Worker `tri-app-preview`, using the existing `DB` binding to D1 `tri-app-preview`. Do not create another preview database or reapply initial migrations.

The operator has configured secrets separately on the preview Worker: `TELEGRAM_BOT_TOKEN`, `FEEDBACK_TELEGRAM_CHAT_ID`, `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_HMAC_SECRET`, plus the existing News secrets `NEWS_TELEGRAM_CHANNEL_ID` and `TELEGRAM_WEBHOOK_SECRET`. Secret values and the private Telegram chat ID never belong in Git or `VITE_*`. The Feedback destination is a private Telegram supergroup; the bot must have permission to send messages there. Notifications start with `300W⚡ · Новый report · 🧪 PREVIEW` or `300W⚡ · Новый report · 🟢 PRODUCTION`, selected only by the explicit ordinary Worker var `APP_ENV=preview|production`.

The preview Turnstile widget has been created for hostname `preview.300w.app`. Only its public `TURNSTILE_SITE_KEY` is ordinary configuration. `ALLOWED_ORIGIN` is exactly `https://preview.300w.app`, without a trailing slash. Feedback submission from the workers.dev origin is not allowed by this single-origin policy; its News/webhook role is unchanged.

`env.preview` declares the public vars, native rate limiter (5 requests per 60 seconds) and five-minute retry cron. Snapshot 2026-10-09: the older live preview deployment lacks APP_ENV; the headings described here are the current code/config behavior, not proof that the preview label has been deployed:

```jsonc
"ratelimits": [{
  "name": "FEEDBACK_RATE_LIMITER",
  "namespace_id": "30001",
  "simple": { "limit": 5, "period": 60 }
}],
"triggers": { "crons": ["*/5 * * * *"] }
```

Namespace `30001` was supplied by the operator after read-only inspection found no native rate-limit bindings in the accessible Worker settings/environments or all 12 available versions. Dispatch namespace inventory was unavailable (403); account-wide uniqueness was not independently certified by that inspection.

Preview is deployed and operator-verified; production E2E is also confirmed below. Repository configuration alone is never E2E evidence. The cron invokes the existing `scheduled()` handler; no retry endpoint is added. Validate with `npm run deploy:preview:dry -- --keep-vars`. A real preview deploy requires separate approval; preserve existing remote vars with `--keep-vars` and review bindings/triggers/domain settings. This update does not alter secrets, D1, DNS, the Custom Domain or Telegram webhook. The webhook remains `https://tri-app-preview.shy-andrey.workers.dev/api/telegram-webhook`.

Production is deployed at `300w.app`, Worker `tri-app`, DB `tri-app-production`. On 2026-10-08 the owner completed iPhone Telegram Mini App Feedback E2E; D1 read-only verification found exactly one report, `sent`, attempts=1, next_delivery_at and delivery_lease NULL. The owner confirmed matching UI/Telegram UUID and 🟢 PRODUCTION. Preview retained its two older reports. See [current runtime and recovery runbook](deployment-cloudflare.md#live-production-and-manual-deployment).

Protected environments fail closed with 503 if any anti-spam config is missing. Origin must match. Turnstile is verified server-side including success, hostname and `feedback` action. No remoteip is sent to Siteverify. Rate-limit key is HMAC-SHA256 of transient CF-Connecting-IP; raw IP is neither stored nor logged. Native limiter is per-location best-effort abuse protection, not a global quota; no in-memory homemade global counter. User text/email/challenge/provider errors are not logged by application code. Turnstile loads only on the feedback page in protected mode. Contact email is optional; form explains storage and inability to reply personally without email.

References: [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Workers rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).


Preview (`@tri_app_bot`) and Production (`@tri_app_prod_bot`) intentionally share
one existing private Feedback group; both may use the same
`FEEDBACK_TELEGRAM_CHAT_ID`. No second group is needed. The production bot has
already been added to that group; six production Worker secret bindings are installed; values remain server-only. News webhooks remain separate: each Telegram bot has only one
active webhook.

`APP_ENV` affects only the Feedback Telegram heading, including scheduled retries.
Missing or unrecognized values produce `⚠️ ENV UNKNOWN`, never `PRODUCTION`;
no raw unknown value is echoed. Default/local config deliberately omits `APP_ENV`
and therefore uses this explicit fallback if real delivery is configured; normal
local Worker delivery remains its existing no-send stub. Only `preview` and
`production` are supported configured values. No hostname/build inference is used.
