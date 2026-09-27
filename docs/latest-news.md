# V1 Latest News

Pipeline: authenticated Telegram channel update → existing bold-heading eligibility → transactional D1 batch → cached GET /api/news → Home. No bot token is needed to receive updates; no Telegram requests are made on reads. Media is discarded; text/entities and caption/caption_entities are supported. Eligibility is unchanged; see [editorial rule](news-eligibility.md).

## Endpoints and security

POST `/api/telegram-webhook` requires server-only `TELEGRAM_WEBHOOK_SECRET` and exact numeric `NEWS_TELEGRAM_CHANNEL_ID`. The `X-Telegram-Bot-Api-Secret-Token` is compared using fixed-length SHA-256 digests. Missing/wrong secret → 401; unconfigured → 503; wrong channel → 403; invalid shape → 400; JSON body over 128 KiB → 413. Only channel_post / edited_channel_post are accepted. The receiver allowlists message fields; no raw payload/media/secret logging. Database failures return generic 503, enabling Telegram retry. Ordinary noneligible posts return 200 normally.

Username is a server-controlled constant `trista_watt`, never derived from incoming username/URL. Links are always `https://t.me/trista_watt/<message_id>`. API IDs are opaque hashes or public seed message identities, never private channel IDs. No secrets go into VITE_* or frontend data. React renders plain text with no dangerouslySetInnerHTML. Text normalization (NFC, whitespace/control normalization, title limit 200 code points, excerpt limit 1000) happens only AFTER eligibility so original UTF-16 entity offsets remain valid.

GET `/api/news` returns `{items, updatedAt, source:"telegram"}`; items contain only id, publishedAt, title, excerpt, telegramUrl. Maximum three, active only, ordered by published_at DESC then message_id DESC then id DESC. Header `Cache-Control: public, max-age=900`; changes may take 15 minutes to appear to cached readers. Errors use no-store. Without configured channel it returns an empty feed, updatedAt epoch. Otherwise updatedAt is the latest processed source event timestamp, including hiding/ignored events.

## Storage and ordering

Apply migrations 0003 and 0004 after 0001/0002; old migrations remain unchanged. Existing `news` table gains media_group_id/index. New `news_post_state` retains only identity, source event timestamp, update_id and media-group ID, including tombstones for never-eligible posts. Original raw message is not stored.

Atomic D1 batch first advances the per-message watermark, then conditionally updates the news row only for that version. Ordering is `(edit_date or date, update_id)`; the timestamp takes precedence because Telegram can randomize update_id after inactivity. Replays are idempotent. Stale messages cannot resurrect hidden/ignored posts. Eligible edits upsert/unhide the same channel/message identity, retaining published_at and created_at. Ineligible edits set hidden=1, keeping the last qualifying title/excerpt for audit.

Media-group policy: keep member identities separately; expose only the lowest message_id among CURRENTLY eligible members of each group. This is deterministic regardless of arrival order, does not concatenate captions and needs no timer. If the canonical member becomes ineligible, the next eligible member represents the album. During arrival the representative may change; never more than one card per group. No media binary, file_id or image URL is stored.

## Reviewed initial seed

Canonical source: `scripts/fixtures/news-seed/approved-v1.json` (format version 2). It contains the explicitly user-approved public posts [993](https://t.me/trista_watt/993), [992](https://t.me/trista_watt/992), and [988](https://t.me/trista_watt/988), exact published text/time, literal heading and first-sentence excerpt. Adjacent sanitized public embed HTML and SHA-256 hashes allow extraction replay with `scripts/extract-approved-news.py`. Session/view metadata is omitted. Post 993 displays an edited indicator, but no exact edit timestamp is exposed; none is invented.

These rows have `source = manually-approved-telegram-seed` (migration 0004). Explicit editorial approval applies only to this offline initial seed. It does not manufacture Telegram entities or bypass webhook eligibility. Future new/edited messages always use the original bold-heading rule; edits update/hide the same channel/message row and change its source to telegram.

```sh
# Generate both outputs from the same canonical source. Supply the actual channel ID locally.
node scripts/seed-news.mjs --input scripts/fixtures/news-seed/approved-v1.json --channel-id '<server channel ID>' --out /tmp/reviewed-news.sql --frontend-out src/data/newsSeed.ts
node scripts/seed-news.mjs --input scripts/fixtures/news-seed/approved-v1.json --check-frontend src/data/newsSeed.ts
# Inspect SQL, then apply only to the intended local database after migrations:
npx wrangler d1 execute DB --local --file /tmp/reviewed-news.sql
```

The generator validates all entries, makes no network/database requests and refuses overwriting SQL output. Keep channel configuration/SQL outside Git. A manual seed uses internal revision -1, below every real Telegram update ID. Reapplying is idempotent; once a live event arrives, re-seeding cannot overwrite or resurrect it. Initial created/updated timestamps use the known publication time as the baseline, not an inferred edit time. Legacy version-1 Bot API seeds remain supported and still pass eligibility.

`src/data/newsSeed.ts` is generated, never maintained separately. It bundles only public NewsItem fields, not full source text, evidence, channel IDs or credentials. Tests verify canonical/evidence agreement, generated fallback freshness, repeat application and live-edit precedence.

## Frontend

Home requests News asynchronously with a 5-second timeout; no blocking or endless skeleton. Valid API items win; empty/error uses verified bundled seed; absent seed shows “Последние новости — в Telegram” with @trista_watt link. Up to three compact text cards, Russian date using ru-RU and Europe/Moscow, 3-line excerpt preview, per-post Telegram link and channel link. Real anchors, visible keyboard focus, target=_blank with noopener noreferrer. Untrusted API URLs outside the exact channel are rejected.

## Local tests/demo

```sh
npm run cf:migrate:local
npm run cf:dev -- --port 8787 --var TELEGRAM_WEBHOOK_SECRET:local-news-demo-secret --var NEWS_TELEGRAM_CHANNEL_ID:-1009000001
node scripts/demo-news-local.mjs
node --test scripts/test-news-eligibility.mjs scripts/test-news.mjs scripts/test-news-seed.mjs
# With an isolated Chrome CDP browser on port 9232:
node scripts/test-news-browser.mjs
```

Demo uses clearly synthetic LOCAL TEST messages 990001–990004, fake channel/secret, local DB only. It exercises eligible, ordinary, edit-add, edit-hide, caption, duplicate. It refuses non-loopback destinations. Do not deploy the demo bindings or seed these fixtures into production. For browser tests, use an isolated local database seeded from approved-v1.json (not the synthetic demo database), with the same locally supplied channel binding. Browser tests independently cover five widths (320,390,430,768,1440), card counts, long text, missing excerpt, empty/error, keyboard and safe links. Screenshots `/tmp/tri-home-news-390.png` and `/tmp/tri-home-news-1440.png` use synthetic display fixtures. `/tmp/tri-home-news-real-390.png` and `/tmp/tri-home-news-real-1440.png` show the three approved real posts.

## Future real bot/preview setup

After separate approval: create/add a bot to @trista_watt with access to channel updates; obtain exact channel ID; configure a distinct strong webhook secret server-side; create preview D1 and apply migrations; deploy HTTPS Worker; call Telegram setWebhook with secret_token and allowed_updates channel_post/edited_channel_post. Bot token is needed only to configure Telegram (or existing Feedback delivery), not this receiving endpoint. Never put credentials in Git or VITE_*. Test a real bold-heading post and an edit before enabling production. No real resources, webhook registration, bot creation or deployment are performed by this implementation task.

Reference: [Telegram Bot API update and webhook contract](https://core.telegram.org/bots/api).
