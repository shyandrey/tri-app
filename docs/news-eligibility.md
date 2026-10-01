# News editorial eligibility (V1)

Telegram channel formatting is the editorial signal. The meaningful textual heading in the first non-empty line must be covered by Telegram `bold` entities. Decorative prefixes and suffixes may remain unformatted. No AI, importance scoring, literal `**` parsing, or arbitrary bold fragments.

`worker/news/eligibility.ts` accepts text/entities or caption/caption_entities. Leading empty lines and whitespace are skipped; trimming does not change original entity offsets. Entity offsets use UTF-16 code units, as [specified by Telegram](https://core.telegram.org/bots/api#messageentity), including emoji surrogate pairs. Invalid entity ranges, including boundaries inside a surrogate pair, reject the candidate. Adjacent/overlapping bold entities provide union coverage. Malformed text/entity combinations are rejected.

All meaningful text (letters/numbers) must be bold. Whitespace gaps are allowed. Decorations are Unicode whitespace, Unicode punctuation (including dashes/quotes/separators) and recognized Unicode RGI emoji grapheme clusters. Their boldness does not matter before, after or within the heading. All nondecorative graphemes must be fully bold; ordinary non-bold words before, after or within the heading reject it. Arbitrary mathematical/currency symbols are not treated as decorative separators. There is no 90% coverage threshold or arbitrary three-character suffix limit, so a short bold heading with emoji qualifies. Grapheme segmentation preserves variation selectors, skin tones, flags, keycaps and ZWJ sequences. Emoji-only headings and arbitrary non-emoji symbols do not qualify as textual headings.

For example, bold `Каспер Сторнс мимо Коны` followed by unbold ` 🚑` qualifies. Unbold words at either edge or inside the heading still disqualify it. A non-bold `🔥` prefix and non-bold `🏆` suffix also qualify around a bold textual heading. This refinement matches product intent. Post 997 reached ingestion but failed eligibility; after the whole first line was made bold, its `edited_channel_post` qualified and naturally restored it to News (confirmed during preview investigation). The original Bot API entities remain unavailable, so tests do **not** establish their exact historical shape. No replay or manual insert is part of this change.

Title is the complete trimmed first non-empty line, including decorative prefix/suffix emoji, without added markup. Excerpt is the trimmed text after that line, preserving body line breaks; heading text is not prepended. A heading-only post has an empty excerpt. Media contents are not processed; captions can qualify.

`decideNewsEligibility(message, existing)` produces a storage decision for both channel_post and edited_channel_post:

- qualifying post: upsert title/excerpt, hidden=0;
- nonqualifying post without an existing news row: ignore (normal outcome);
- loss of heading on an existing row: hidden=1, retain previous qualifying title/excerpt for audit;
- later qualification: update and unhide the same row.

The rule is now integrated into the [V1 News pipeline](latest-news.md). Ingestion authenticates the exact channel, atomically orders updates, persists hide/unhide transitions and excludes hidden rows from the API. Original entity offsets are used before storage normalization/truncation. Ignored posts are normal outcomes, not failures.

Run: `node --test scripts/test-news-eligibility.mjs`.

The three explicitly approved initial seed posts use a separate offline manual-import path. This does not change automatic eligibility: every future webhook event, including edits to seed posts, applies the rule above.


## Rejection diagnostics

`evaluateNews` returns the eligibility result and rejection reason together. Reasons are `NO_BOLD`, `INVALID_ENTITY_BOUNDARY`, `UNFORMATTED_TEXT_BEFORE_HEADING`, `UNFORMATTED_TEXT_AFTER_HEADING`, `PARTIALLY_FORMATTED_HEADING`, `UNSUPPORTED_DECORATION`, and `UNSUPPORTED_CONTENT`. `INSUFFICIENT_COVERAGE` is unnecessary because percentage coverage is no longer used.

After the ingestion batch succeeds, a parsed but ineligible update emits one `console.info` JSON event per processing attempt (Telegram retries may produce another event). Fields: `event`, `message_id`, `update_id`, `event_type`, `content_source`, `first_line_utf16_length` (trimmed first non-empty line), `entities` (type/offset/length only), and `reason`. Entity types are allowlisted; unknown types log as `unknown`. No title, body, excerpt, headers, credentials, entity URLs or user objects are logged. No D1 table is added. Authentication/schema errors rejected before eligibility keep existing responses and do not produce this event. The code emits logs; this change does not enable or configure Cloudflare log storage.

Title normalization retains joiners/tag characters inside recognized emoji sequences, cleans other control/format characters, and truncates on grapheme boundaries within the existing 200-code-point limit. Existing excerpt normalization and its 1000-code-point limit remain unchanged.

If several defects coexist, the evaluator reports the first applicable reason: unsupported source/content, invalid entity boundary, no meaningful text, no bold meaningful text, then the first uncovered nondecorative grapheme. A textual defect is classified relative to the first/last bold meaningful grapheme; an unsupported symbol/format character uses `UNSUPPORTED_DECORATION`. Malformed JSON/entity structures remain the existing parser-level 400 rejection, before eligibility evaluation.

Regression coverage includes long decorations on both sides, sport/gender ZWJ emoji, flags, VS16, modifiers, adjacent/overlapping bold entities, UTF-16 boundary rejection, full title/excerpt extraction and NEW/EDIT × text/caption ingestion. For `Каспер Сторнс мимо Коны 🚑`: the textual heading has 23 UTF-16 units, the space is at 23, and the ambulance occupies units 24–25 (D83D DE91); total length is 26 units / 25 code points.
