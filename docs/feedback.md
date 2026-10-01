# V1 Feedback

Users submit in 300W⚡ APP; no Telegram account or attachment is needed. More, Athlete Profile and Race Detail open a dedicated `#/feedback` page. Existing History API entries retain the source screen, scroll, filters, expanded years, edition and result sort. Only the small source context is attached to the feedback history entry. Description/email live in component memory, never in URL, history or localStorage; leaving/reloading the form discards an unsent draft. Race context is captured at click time from active edition and either controlled or table-internal gender.

## API and storage

`GET /api/feedback/config` exposes only mode (`local`/`protected`) and the public Turnstile site key. `POST /api/feedback` takes the typed `FeedbackPayload` in `shared/feedback.ts`: random UUIDv4 requestId, category, description, optional email, allowlisted context, build, viewport, optional app-only clientInfo, Turnstile token and empty honeypot website. Same-origin JSON only, streamed body capped at 16 KiB. Text is stored and displayed as plain text; arbitrary HTML is never rendered. Unknown keys are discarded, never inserted into D1 or Telegram.

- 201 `{ "ok": true, "reportId": "…" }`: committed to D1, regardless of notification outcome.
- 409 with the same success body: exact replay of an accepted request. UI treats it as success.
- 409 `IDEMPOTENCY_CONFLICT`: same UUID, different canonical content; no overwrite.
- 400 validation/challenge, 403 origin, 413 body limit, 429 rate limit (`Retry-After: 60`), 503 unavailable/storage failure. UI uses Russian messages and retains form fields after errors.

The UUID is the existing table primary key. A SHA-256 fingerprint excludes challenge/honeypot, includes the allowlisted persisted content. Retry keeps the exact original UUID/context/viewport snapshot; refreshing a challenge token does not change identity. Editing category/text/email creates a new report. An ambiguous network failure followed by an unchanged retry cannot create a second row. On a replay, protection config, origin, rate limit and input are checked before acknowledging the stored UUID/hash; the already-used Turnstile token need not be reused.

Apply `0002_feedback_delivery.sql` after existing `0001` (unchanged). Adds request_hash, active_gender, delivery_lease and a delivery-claim index. Legacy reports remain retryable. No athlete/race data or News schema changed.

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

## Preview prerequisites (after separate approval)

No resources are created by this task. A future preview deploy needs:

1. Isolated preview D1, replace preview placeholder database_id, apply both migrations remotely.
2. Dedicated Telegram bot token (`TELEGRAM_BOT_TOKEN`) and private destination (`FEEDBACK_TELEGRAM_CHAT_ID`); bot must be allowed to send there. Set privately; do not put real values in Git.
3. Turnstile widget for the exact preview hostname, public `TURNSTILE_SITE_KEY` and secret `TURNSTILE_SECRET_KEY`.
4. `ALLOWED_ORIGIN` exact HTTPS origin (no trailing slash), random secret `RATE_LIMIT_HMAC_SECRET` and Workers rate-limiter binding `FEEDBACK_RATE_LIMITER`.
5. Configure a retry cron, e.g. every five minutes, in the selected environment. No scheduled trigger is provisioned until deployment.

Suggested per-environment Wrangler binding (replace namespace with an explicitly chosen unique namespace):

```jsonc
"ratelimits": [{
  "name": "FEEDBACK_RATE_LIMITER",
  "namespace_id": "<chosen-numeric-namespace>",
  "simple": { "limit": 5, "period": 60 }
}],
"triggers": { "crons": ["*/5 * * * *"] }
```

Production fails closed with 503 if any anti-spam config is missing. Origin must match. Turnstile is verified server-side including success, hostname and `feedback` action. No remoteip is sent to Siteverify. Rate-limit key is HMAC-SHA256 of transient CF-Connecting-IP; raw IP is neither stored nor logged. Native limiter is per-location best-effort abuse protection, not a global quota; no in-memory homemade global counter. User text/email/challenge/provider errors are not logged by application code. Turnstile loads only on the feedback page in protected mode. Contact email is optional; form explains storage and inability to reply personally without email.

References: [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/), [Workers rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).
