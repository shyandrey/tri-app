# Manual Russian athlete-name review

`src/data/athletes/athleteLocalization.json` is the single editable source for explicit Russian display-name overrides. Keys are exact existing `nameEn` identities, including accents and case. Values may be a Russian string or the existing `{ "nameRu": "…", "provenance": "generated-reviewed" }` format. For new manual entries use a string; do not invent provenance.

Display priority: explicit registry override → existing profile display name → existing English fallback. Overrides apply at runtime; regenerating profiles is not necessary. Missing entries retain the current fallback. Russian names never become identity keys.

`src/data/athletes/athleteLocalizationReviewed.json` is a curated JSON array of exact `nameEn` keys approved by the project owner. It contains no Russian names and starts empty. Historical `generated-reviewed` provenance does **not** imply owner approval.

Statuses:

- MISSING: current display name has no Russian letters.
- REVIEW: a Russian display name exists but its key is not approved.
- APPROVED: a Russian display name exists and its key is in the reviewed list.

Approval is a persistent owner assertion for an identity, not a hash of a spelling. When changing a previously approved spelling, remove its key until the new spelling is checked, or explicitly reapprove it in the same review. Renaming an English identity requires an intentional registry/review-key migration; never guess or fuzzy-match identities.

## Human workflow

1. Run `npm run audit:athlete-names`.
2. Open `.generated/athlete-names/review.csv` in Numbers/Excel, or `review.md` in an editor.
3. Choose MISSING or REVIEW rows. The report covers the full catalog, ordered by Original name then ID, never ranking.
4. Verify the athlete identity and Russian spelling manually. The script never transliterates or verifies pronunciation.
5. Edit `src/data/athletes/athleteLocalization.json` using the exact Original name as the key. If the existing spelling is correct, no override change is needed.
6. Add the exact key once to `src/data/athletes/athleteLocalizationReviewed.json`.
7. Rerun `npm run audit:athlete-names`.
8. Confirm the row is APPROVED and validation passes.
9. Run `node --test scripts/test-athlete-names.mjs`, `node scripts/test-athlete-localization.mjs`, and `npm run build` before publishing a batch.
10. In review-batch commits, include only the intended curated name/review source changes. Inspect the diff. Reports are ignored working artifacts, not authoritative input.

The report uses UTF-8 with a BOM and CRLF for CSV spreadsheet compatibility. Formula-like cell prefixes are escaped for spreadsheet safety; copy identity keys from the actual registry/catalog if such a case occurs. Audit writes only the reports. Validation failure exits nonzero and does not overwrite reports; any previous report is stale until the audit passes again.

Validation covers duplicate catalog IDs, duplicate JSON keys (including escaped equivalents before JSON.parse), exact and normalized identity ambiguity, orphan localization/review keys, malformed approval lists, empty/non-string overrides, Latin-only/mixed Latin-Cyrillic names, runtime override application, ID/nameEn preservation and unchanged result linkage. Apostrophes, hyphens and punctuation do not trigger mixed-script errors. Reviewed keys without a Russian display name fail validation. Shared Russian spellings do not merge athletes.

## Runtime presentation and protected data

Athlete Profiles, Athlete Detail and search consume the localized catalog. Race Results uses the linked athlete's display name in desktop and mobile views; unmatched rows retain their original result name. Raw results and linkage stay untouched.

NEVER manually edit for this workflow:

- `src/data/athletes/resultAthletes.generated.ts`;
- generated image manifests;
- race result datasets.

Do not change `nameEn`, IDs, aliases, countries or ranking as part of a spelling review. Full profile generation currently assigns numeric IDs by sorted position; append mode preserves existing IDs. The name registry deliberately uses existing exact English identity keys, not generated numeric IDs. Do not run full generation merely to apply a Russian-name correction.
