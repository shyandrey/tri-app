# BOT-01 — Telegram commands

Local implementation, pending owner review. No remote configuration or migration has been performed.

POST `/api/telegram-public-webhook` is separate from News `/api/telegram-webhook`. GET returns 405. Disabled/missing/invalid config returns 503. Secret verification precedes JSON reads; wrong secret returns 401. JSON is bounded to 128 KiB; malformed input returns 400, oversized input 413. Authenticated unsupported events and non-private chats are acknowledged without sending or writing. No D1 dependency.

Commands: `/start`, `/app`, `/help`, optionally addressed to the explicitly configured username (case-insensitive). `/start` accepts an optional 1–64 character ASCII letters/digits/underscore/hyphen payload. Payload is ignored, never reflected or used as destination/URL. Other text is ignored. Buttons always use the explicit HTTPS Mini App URL. Replies are plain text, only to the validated private chat ID. Telegram response status, ok flag, message ID and returned chat ID are checked; redirects rejected; timeout 8 seconds. Provider/network failures return generic 503 without logging credentials or private content.

Retries can produce duplicate replies after an ambiguous send result. No exactly-once guarantee, persistent deduplication or Feedback queue reuse. Telegram may retry a failed webhook; blocked-user/provider failures are currently generic 503, not a specialized retry policy. Review this limitation before enabling broad public traffic.

## Bindings and isolation

| Binding | Preview | Production |
| --- | --- | --- |
| PUBLIC_TELEGRAM_COMMANDS_ENABLED | `false` in reviewed preparation config | `false` in preparation config |
| PUBLIC_TELEGRAM_BOT_USERNAME | tri_app_preview_bot | tri_app_bot |
| PUBLIC_TELEGRAM_MINI_APP_URL | https://preview.300w.app | https://300w.app |
| PUBLIC_TELEGRAM_BOT_TOKEN | Secret for Preview bot, not configured by this patch | Secret for public production bot, not configured by this patch |
| PUBLIC_TELEGRAM_WEBHOOK_SECRET | Separate Preview command secret | Separate production command secret |

Only exact string `true` enables commands, and all five fields are required. Local/default has no implicit values. No hostname inference, no News/Feedback credential fallback. Existing `TELEGRAM_BOT_TOKEN` remains the Feedback sender: eventually Preview installs the test-bot token there too; production retains @tri_app_prod_bot. Existing News route, secret, subscription, channel selection, delivery/retry logic and cron are unchanged. Public group replies are never sent.

## Future setup — separate owner approvals required

1. Review/commit code, run command tests and existing gates. Confirm Preview DB/Worker and production baseline. Inspect Preview pending Feedback retries before changing sender credentials.
2. Owner adds @tri_app_preview_bot to the approved Feedback group with send permission. Install Preview public token/webhook secret through secure interactive Wrangler secret input. Replace Preview Feedback `TELEGRAM_BOT_TOKEN` with the same test-bot token; retain the destination. Secret puts are remote mutations and may update Worker versions; existing Feedback/cron sender changes immediately. No credentials in repository, logs or VITE variables.
3. Separately approve enabling Preview commands in repository config (`true`), dry-run and deploy using [deployment procedure](deployment-cloudflare.md). Production remains disabled until separately approved. Command tests currently assert disabled preparation defaults; review those assertions alongside an intentional enablement change.
4. Only after the handler is deployed, register the NEW Preview bot webhook at `https://tri-app-preview.shy-andrey.workers.dev/api/telegram-public-webhook`, with its own secret and explicit allowed_updates `["message"]`. Do not alter @tri_app_bot or @tri_app_prod_bot subscriptions in this step; do not drop pending updates.
5. Configure the Preview bot command list/Menu Button to the Preview URL. Separately authorize real /start, /app, /help and one Preview Feedback test. Confirm test-bot sender, PREVIEW marker, D1 report and clean delivery state. Verify existing Preview News GET and production News/Feedback isolation.
6. Later, separately approve production credentials/enablement/deploy and move ONLY @tri_app_bot webhook to `https://tri-app.shy-andrey.workers.dev/api/telegram-public-webhook`. Production News/Feedback @tri_app_prod_bot endpoint remains unchanged. Queued channel events reaching the public handler are ignored without ingestion.
7. After public migration, disable old Preview News receiver by separately approved removal of Preview TELEGRAM_WEBHOOK_SECRET. Keep NEWS_TELEGRAM_CHANNEL_ID and existing D1 rows so GET /api/news still works. Preview News live ingestion is not disabled by this patch. Ensure Preview no longer contains public-production bot credentials.

Rollback needs approval: do not restore a Worker version without the command route while the bot points to it; do not route public traffic back to Preview as an automatic fallback. Record compatible versions and bindings before migration; Worker rollback does not undo webhook configuration. See [recovery runbook](deployment-cloudflare.md).

## Validation

```sh
node --test scripts/test-telegram-commands.mjs
npm run test:foundation
npm run test:feedback
node --test scripts/test-news.mjs
npm run check:release
```

The command suite uses synthetic requests and injected senders; no actual Telegram messages or remote D1 access. It is a separate suite, not yet part of the release runner. Tests cover config/auth, parsing, private chats, payload safety, fixed URLs, provider failures/timeout configuration, and forbidden access to DB/legacy credentials. Real Telegram device E2E remains a deployment prerequisite, not proven by mocks.

## Safe 503 diagnostics

Every handled 503 emits one JSON warning with event `telegram_command_failure` and one fixed reason. Responses remain 503 / `{"ok":false}`; authentication failures (401), malformed requests (400/413), ignored updates and successful commands do not emit these events. No extra Telegram requests or retries are introduced.

- Configuration: `CONFIG_DISABLED`, `CONFIG_TOKEN_EMPTY`, `CONFIG_SECRET_EMPTY`, `CONFIG_USERNAME_INVALID`, `CONFIG_URL_INVALID`. These precede authentication; binding presence alone does not establish non-empty values.
- Upstream: `UPSTREAM_HTTP_ERROR`, `UPSTREAM_API_ERROR`, `UPSTREAM_INVALID_JSON`, `UPSTREAM_INVALID_RESULT`, `UPSTREAM_CHAT_MISMATCH`.
- Exceptions: `SEND_TIMEOUT` (recognized TimeoutError), `SEND_NETWORK_OR_RUNTIME_ERROR`. Other abort/network/runtime exceptions remain grouped; this is not a definitive network diagnosis.

Optional fields are numeric `http_status` and numeric `error_code` only. Non-2xx HTTP takes precedence over malformed/non-JSON error bodies. A timeout while reading a successful HTTP response is classified as SEND_TIMEOUT. No provider descriptions, raw responses, headers, message text, chat/user IDs, token-bearing URLs, exception messages/stacks or secrets are logged.

Example (synthetic): `{"event":"telegram_command_failure","reason":"UPSTREAM_HTTP_ERROR","http_status":401,"error_code":401}`.

A future Preview deployment and narrow log inspection require separate approval. Observe existing Telegram retries without sending more commands; retries can still deliver replies or duplicates. Numeric errors narrow the failure stage but do not prove a specific secret value is incorrect. The current live incident is not resolved by this local patch.

### Workers redirect compatibility fix (local patch; pending review)

The owner observed `SEND_NETWORK_OR_RUNTIME_ERROR` on Preview version `d9c03a1d-a0df-47ee-9796-8d12a9797128`. Local workerd reproduces rejection of `redirect: 'error'` with TypeError before outbound delivery. The local fix uses `redirect: 'manual'`: redirects are not followed and non-2xx responses still return HTTP 503 through existing error handling. Live recovery requires separately approved deployment and verification; no credential change is implied.

`node --test scripts/test-telegram-commands.mjs` includes the actual handler running in installed Miniflare/workerd with a fully local outbound stub. It checks successful sending, redirect rejection without a second request, and upstream HTTP failures. It uses synthetic credentials only, makes no Telegram requests, and requires permission to open local runtime sockets. Node emits an experimental warning for `stripTypeScriptTypes`; Miniflare is supplied by the existing Wrangler installation.
