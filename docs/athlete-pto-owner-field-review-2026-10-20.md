# ATH-01/02 — owner field review, 20.10.2026

Read-only analysis; no approval, registry write or application change. Original 19 October reports remain unchanged. Exact raw/proposed/current values, PTO source URLs, observation timestamps and HTML SHA-256 are retained in the CSVs below. No new PTO profile requests.

## Owner decisions

| Set | Fields | Recommendation |
|---|---:|---|
| Original AUTO-APPROVABLE additions | 651 | Ready for owner batch approval against these exact values; not applied |
| New AGE/BORN pairs, competition-age compatible | 60 (30 athletes) | Explicit batch decision may preserve both raw values and display year − BORN |
| Collateral fields held only by profile-wide shared-channel rule | 9 | Candidate for separate field-level approval; listed individually below |
| Shared RTS YouTube | 2 | Hold for owner decision on team vs personal channels |
| Lisa Becharas AGE/BORN | 2 | Hold: additional conflicting source age discovered |
| Kristian existing YouTube replacement | 1 | Reject replacement; retain previously approved existing URL |

The last five rows account for all **74 REVIEW REQUIRED fields**. No reclassification or approval was written into the source artifacts.

## Age review

All 32 AGE/BORN discrepancies in the cohort have `2026 − BORN − reported AGE = 1`. Two pairs (Marten Van Riel and Sam Laidlow) are already approved pilot values and unchanged; the remaining 30 pairs account for 60 review fields.

- Methodology-compatible: 30 new pairs, plus 2 existing pilot pairs. A +1 difference is possible if PTO reports birthday age before the birthday and 300W uses competition age. This is an arithmetic explanation, **not confirmation of birthday timing or an exact DOB**. Preserve AGE and BORN independently with original provenance.
- Not explained by this methodology: 0 discrepancies in those 32 pairs. This does not independently prove either raw value correct.
- Missing source: 23 profiles have neither AGE nor BORN; remain SKIP, not invented data. Missing values are outside the 74 review fields.
- Additional inconsistency: Lisa Becharas (10825) has PTO AGE 36 / BORN 1990 (internally consistent for 2026), while the [RTS 2026 roster](https://www.realtrisquad.com/athletes) says age 31. The roster may be stale; no source priority override or correction is justified. Hold both fields for verification. Jackson Laundry's PTO pair is internally consistent; the RTS roster's age 32 vs competition age 33 is compatible with +1 methodology, again without confirming DOB.

## Shared YouTube investigation

The exact [channel UC3dcuj1H1Mk-cG4gcL2QpPw](https://www.youtube.com/channel/UC3dcuj1H1Mk-cG4gcL2QpPw) is titled **The Real Triathlon Squad** in the retrieved YouTube page. The [official team website](https://www.realtrisquad.com/) advertises the RTS YouTube channel, linking to `@RealTriSquad`; its [2026 roster](https://www.realtrisquad.com/athletes) includes Jackson Laundry and Lisa Becharas. Sources inspected 20 October; YouTube's indexed page may not be a fresh channel snapshot.

Conclusion: evidence supports a **shared team channel**, not a demonstrated erroneous PTO identity mapping. It is not evidence of two personal channels. Do not import either YouTube field without owner review. If team channels are allowed later, represent/document that relationship explicitly and use narrow reviewed duplicate handling, not a global duplicate bypass.

Collateral fields can be reviewed independently; none has an existing-value conflict:

| ID | Athlete | Field | Exact proposed value |
|---|---|---|---|
| 38 | Jackson Laundry | reportedAge | `33` |
| 38 | Jackson Laundry | birthYear | `1993` |
| 38 | Jackson Laundry | socials.instagram | `https://instagram.com/jacksonlaundrytri` |
| 38 | Jackson Laundry | socials.twitter | `https://twitter.com/jacklaundry93` |
| 38 | Jackson Laundry | socials.facebook | `https://facebook.com/jack.laundry.7` |
| 38 | Jackson Laundry | socials.website | `https://jacksonlaundry.com/` |
| 10825 | Lisa Becharas | socials.instagram | `https://instagram.com/lisabecharas` |
| 10825 | Lisa Becharas | socials.facebook | `https://facebook.com/lisa.becharas` |
| 10825 | Lisa Becharas | socials.website | `https://lisabecharas.com/` |

## All 57 rejected URLs

Mutually exclusive primary categories (raw hrefs are preserved):

| Category | Count | Resolution |
|---|---:|---|
| Unsupported platform | 3 | LinkedIn: keep SKIP unless scope separately expands |
| Invalid URL format for intended platform | 1 | Rico Bogen: channel ID used as hostname; do not construct a replacement |
| Non-HTTPS | 18 | Verify HTTPS endpoint/identity separately; never silently change scheme |
| Post/content instead of profile | 1 | Casper Instagram post: SKIP |
| Duplicate/shared | 0 | Shared RTS channel is in the 74-field set, not the rejected 57 |
| Confirmed athlete identity mismatch | 0 | This is not a claim that all external accounts were verified |
| Other | 34 | 33 recognizable profile/channel forms + 1 Google redirect wrapper |

**33 valid-form candidates rejected by strict validation**: language/tracking queries, supported-platform mobile/locale subdomains, numeric Facebook profile/page paths, YouTube channel tabs, whitespace, and one PTO platform-slot mismatch. These are syntactic/profile-form candidates, not newly verified live accounts. External availability, ownership and canonical redirects were not checked for all 33; no automatic repair or acceptance is proposed.

| Strict-validator reason | Count |
|---|---:|
| Language/tracking query rejected wholesale | 16 |
| Recognizable platform subdomain excluded by exact-host validator | 6 |
| Facebook numeric profile identity in query; id MUST be preserved | 4 |
| Facebook page path excluded by one-segment rule | 2 |
| YouTube channel tab excluded by terminal-path rule | 1 |
| Instagram URL in website slot (PTO target mismatch) | 1 |
| Facebook named/numeric page path excluded by one-segment rule | 2 |
| Trailing whitespace | 1 |

Potential future targeted fixes require separate approval and regression tests: permit only known non-identity query parameters; retain Facebook `profile.php?id=...` identity parameters; validate trusted platform subdomains; support verified page/channel paths. A Facebook `/p/name-id/` page is not automatically a content post. Sara Svensk's Instagram href is in the website slot: review platform attribution, not athlete identity. Trevor Foley's Google wrapper remains held; extracting its query target is not proof of destination identity. Keep Sam Laidlow's previously excluded links and all other pilot values untouched pending explicit new approval.

## Validation and limits

- All 651 original additions compared with current runtime catalog, legacy social links and PTO fields: **0 existing-value conflicts, 0 pilot modifications, 0 cross-catalog duplicate social values**. This checks repository consistency, not independent real-world correctness of every PTO field.
- All 221 source HTML hashes checked; unchanged Python parser run twice with file stdin in identity/full modes: byte-identical output. Replayed field analysis and cross-athlete duplicate detection match the original consolidated report exactly.
- PTO parser/mapping/registry tests: **43/43 PASS**. File-input harness used because the prior Node piped-input stall remains unresolved; no importer code changed.
- Original files preserved by SHA-256 comparison. Registry, athlete IDs, AGE/BORN/social data and pilot provenance unchanged. Local Markdown links and `git diff --check` checked.

## Exact review artifacts

- [651 original batch candidates](athlete-pto-owner-field-review-2026-10-20-batch-651.csv).
- [All 74 fields with recommendations](athlete-pto-owner-field-review-2026-10-20-review-fields.csv).
- [All 57 rejected URLs with categories and limitations](athlete-pto-owner-field-review-2026-10-20-rejected-urls.csv).
- Replay, validation JSON, source hashes and test logs: `/tmp/300w-field-review-2026-10-20/`. This temporary directory is not a durable evidence archive.
