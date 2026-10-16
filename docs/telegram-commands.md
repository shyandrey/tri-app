# BOT-01 — Telegram commands

BOT-01 core functionality completed, 2026-10-17. Production SHA `9abd8c47a87b34cdaff9fb54f4f673058b5511af`; Preview SHA `f1a95114b29fe56b1a76596bb2da8ce8b895ff5e`. Owner confirmed successful public webhook migration and Production `/start`, `/app`, `/help`, Mini App button opening `https://300w.app`, and Feedback delivery to the shared Telegram group. Preview command/Feedback E2E was previously owner-confirmed. These device checks are separate from automated tests.

Read-only closeout verified both Worker deployments/bindings, separate D1 identities, News GET and protected Feedback config; Production queue: sent=4, pending/failed/retryable/active and expired leases=0. No bot credentials were read and getWebhookInfo was not repeated during closeout; the successful migration is owner-confirmed evidence.

POST `/api/telegram-public-webhook` is separate from News `/api/telegram-webhook`. GET returns 405. Disabled/missing/invalid config returns 503. Secret verification precedes JSON reads; wrong secret returns 401. JSON is bounded to 128 KiB; malformed input returns 400, oversized input 413. Authenticated unsupported events and non-private chats are acknowledged without sending or writing. No D1 dependency.

Commands: `/start`, `/app`, `/help`, optionally addressed to the explicitly configured username (case-insensitive). `/start` accepts an optional 1–64 character ASCII letters/digits/underscore/hyphen payload. Payload is ignored, never reflected or used as destination/URL. Other text is ignored. Buttons always use the explicit HTTPS Mini App URL. Replies are plain text, only to the validated private chat ID. Telegram response status, ok flag, message ID and returned chat ID are checked; redirects rejected; timeout 8 seconds. Provider/network failures return generic 503 without logging credentials or private content.

Retries can produce duplicate replies after an ambiguous send result. No exactly-once guarantee, persistent deduplication or Feedback queue reuse. Telegram may retry a failed webhook; blocked-user/provider failures are currently generic 503, not a specialized retry policy. Review this limitation before enabling broad public traffic.

## Bindings and isolation

| Binding | Preview | Production |
| --- | --- | --- |
| PUBLIC_TELEGRAM_COMMANDS_ENABLED | `true` | `true` |
| PUBLIC_TELEGRAM_BOT_USERNAME | tri_app_preview_bot | tri_app_bot |
| PUBLIC_TELEGRAM_MINI_APP_URL | https://preview.300w.app | https://300w.app |
| PUBLIC_TELEGRAM_BOT_TOKEN | Installed secret for @tri_app_preview_bot | Installed secret for @tri_app_bot |
| PUBLIC_TELEGRAM_WEBHOOK_SECRET | Separate Preview command secret | Separate production command secret |

Only exact string `true` enables commands, and all five fields are required. Local/default has no implicit values. No hostname inference, no News/Feedback credential fallback. Existing `TELEGRAM_BOT_TOKEN` remains the Feedback sender: Preview uses @tri_app_preview_bot; production retains @tri_app_prod_bot. Production News route, secret, subscription, channel selection, delivery/retry logic and cron are unchanged. The former public-bot Preview News subscription has been replaced by Production commands; legacy Preview receiver configuration awaits cleanup. Public group replies are never sent.

## Current routing

- Production public @tri_app_bot → `https://tri-app.shy-andrey.workers.dev/api/telegram-public-webhook`; command subscription `allowed_updates=["message"]`. Migration procedure uses the latest rotated Production public webhook secret and `drop_pending_updates=false`.
- Production @tri_app_prod_bot → existing `/api/telegram-webhook` for News; existing Feedback sender credentials remain separate from PUBLIC credentials.
- Preview @tri_app_preview_bot → `https://tri-app-preview.shy-andrey.workers.dev/api/telegram-public-webhook`; Preview URL and Feedback sender stay isolated from Production.

For later webhook work, require separate approval, exact bot identity, current webhook/subscription and pending-count checks. Use hidden local credential input; never retrieve Worker secret values or put tokens in command arguments. No automatic retries after an ambiguous mutation outcome: first verify state read-only. A Worker deployment alone does not migrate Telegram subscriptions.

## Operational follow-ups

Tracked separately in [Project Board](PROJECT_BOARD.md):

- **BOT-02:** verify/configure BotFather command list and Menu Button with owner approval. Production menu URL must be `https://300w.app`; Preview uses `https://preview.300w.app`. Working command reply buttons do not prove Menu Button settings.
- **BOT-03:** retire unused Preview News receiver under separate approval. Review removal of Preview `TELEGRAM_WEBHOOK_SECRET`; preserve `NEWS_TELEGRAM_CHANNEL_ID` and D1 rows for News GET, PUBLIC credentials for commands, and `TELEGRAM_BOT_TOKEN` for test-bot Feedback. Verify no public-production credentials remain in Preview through owner-managed provenance, not secret extraction. The old receiver is not disabled by this documentation update.
- **BOT-04:** decide whether to retain or disable temporary Preview Observability. Current settings retain sampled console logs at rate 1 with invocation logs, traces and issues disabled; keep sanitized diagnostic categories only. Any settings change requires separate approval.

Rollback needs approval: do not restore a Worker version without the command route while the bot points to it; do not route public traffic back to Preview as an automatic fallback. Record compatible versions and bindings before migration; Worker rollback does not undo webhook configuration. See [recovery runbook](deployment-cloudflare.md).

## Validation

```sh
node --test scripts/test-telegram-commands.mjs
npm run test:foundation
npm run test:feedback
node --test scripts/test-news.mjs
npm run check:release
```

The command suite uses synthetic requests and injected senders; no actual Telegram messages or remote D1 access. It is a separate suite, not yet part of the release runner. Tests cover config/auth, parsing, private chats, payload safety, fixed URLs, provider failures/timeout configuration, and forbidden access to DB/legacy credentials. Real Telegram E2E is owner-confirmed above, not proven by mocks. This documentation closeout did not rerun the command suite or release gate.

## Safe 503 diagnostics

Every handled 503 emits one JSON warning with event `telegram_command_failure` and one fixed reason. Responses remain 503 / `{"ok":false}`; authentication failures (401), malformed requests (400/413), ignored updates and successful commands do not emit these events. No extra Telegram requests or retries are introduced.

- Configuration: `CONFIG_DISABLED`, `CONFIG_TOKEN_EMPTY`, `CONFIG_SECRET_EMPTY`, `CONFIG_USERNAME_INVALID`, `CONFIG_URL_INVALID`. These precede authentication; binding presence alone does not establish non-empty values.
- Upstream: `UPSTREAM_HTTP_ERROR`, `UPSTREAM_API_ERROR`, `UPSTREAM_INVALID_JSON`, `UPSTREAM_INVALID_RESULT`, `UPSTREAM_CHAT_MISMATCH`.
- Exceptions: `SEND_TIMEOUT` (recognized TimeoutError), `SEND_NETWORK_OR_RUNTIME_ERROR`. Other abort/network/runtime exceptions remain grouped; this is not a definitive network diagnosis.

Optional fields are numeric `http_status` and numeric `error_code` only. Non-2xx HTTP takes precedence over malformed/non-JSON error bodies. A timeout while reading a successful HTTP response is classified as SEND_TIMEOUT. No provider descriptions, raw responses, headers, message text, chat/user IDs, token-bearing URLs, exception messages/stacks or secrets are logged.

Example (synthetic): `{"event":"telegram_command_failure","reason":"UPSTREAM_HTTP_ERROR","http_status":401,"error_code":401}`.

Any further deployment or narrow log inspection requires separate approval. Observe existing Telegram retries without sending more commands; retries can still deliver replies or duplicates. Numeric errors narrow the failure stage but do not prove a specific secret value is incorrect. The original redirect incident is closed by the deployed fix and owner-confirmed E2E; new events require fresh diagnosis.

### Workers redirect compatibility fix (deployed)

The owner observed `SEND_NETWORK_OR_RUNTIME_ERROR` on Preview version `d9c03a1d-a0df-47ee-9796-8d12a9797128`. Local workerd reproduces rejection of `redirect: 'error'` with TypeError before outbound delivery. The deployed fix uses `redirect: 'manual'`: redirects are not followed and non-2xx responses still return HTTP 503 through existing error handling. The fix is included in the Production and Preview SHAs above; owner-confirmed command E2E passed. No further deployment is required by this closeout.

`node --test scripts/test-telegram-commands.mjs` includes the actual handler running in installed Miniflare/workerd with a fully local outbound stub. It checks successful sending, redirect rejection without a second request, and upstream HTTP failures. It uses synthetic credentials only, makes no Telegram requests, and requires permission to open local runtime sockets. Node emits an experimental warning for `stripTypeScriptTypes`; Miniflare is supplied by the existing Wrangler installation.
