# News editorial eligibility (V1)

Telegram channel formatting is the editorial signal. Only a first meaningful line fully (or nearly fully) covered by Telegram `bold` entities qualifies. No AI, importance scoring, literal `**` parsing, or arbitrary bold fragments.

`worker/news/eligibility.ts` accepts text/entities or caption/caption_entities. Leading empty lines and whitespace are skipped; trimming does not change original entity offsets. Entity offsets use UTF-16 code units, as [specified by Telegram](https://core.telegram.org/bots/api#messageentity), including emoji surrogate pairs. Invalid ranges are ignored. Overlapping entities cannot inflate coverage.

“Nearly fully” is deliberately conservative: all words must be bold. Whitespace gaps are allowed. At most three trailing punctuation characters (`.!?…:;—–`) may be unbold, provided at least 90% of non-whitespace code points are bold. An unbold word at either edge or inside the line disqualifies it, regardless of the percentage. A bold athlete name in an ordinary sentence never qualifies unless the entire meaningful line is that name.

Title is the trimmed first line, without added markup. Excerpt is the trimmed text after that line, preserving body line breaks; heading text is not prepended. A heading-only post has an empty excerpt. Media contents are not processed; captions can qualify.

`decideNewsEligibility(message, existing)` produces a storage decision for both channel_post and edited_channel_post:

- qualifying post: upsert title/excerpt, hidden=0;
- nonqualifying post without an existing news row: ignore (normal outcome);
- loss of heading on an existing row: hidden=1, retain previous qualifying title/excerpt for audit;
- later qualification: update and unhide the same row.

The rule is now integrated into the [V1 News pipeline](latest-news.md). Ingestion authenticates the exact channel, atomically orders updates, persists hide/unhide transitions and excludes hidden rows from the API. Original entity offsets are used before storage normalization/truncation. Ignored posts are normal outcomes, not failures.

Run: `node --test scripts/test-news-eligibility.mjs`.

The three explicitly approved initial seed posts use a separate offline manual-import path. This does not change automatic eligibility: every future webhook event, including edits to seed posts, applies the rule above.
