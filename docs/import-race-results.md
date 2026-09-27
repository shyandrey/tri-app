# Controlled Stats PTO result import

Production data stays versioned in the repository; no frontend live fetch.
Requires Node (project version), Python 3 standard library, and existing npm dependencies. No new dependencies.

## Existing pipeline and limits

Previous 2026 races (e.g. Zell am See, commit `871b6bd`) were committed as hand-authored `RaceResult[]` TS modules. There was no reusable result parser/CLI in `scripts/`. Reuse remains:

- `statsPtoRaceUrls.ts` and edition `statsPtoUrl`: source provenance / explicit source binding.
- `raceIdentity.ts` / `raceEditions.ts`: permanent race vs edition identity, separate gender editions where applicable.
- `athleteIdentity.ts`: exact normalized identity (diacritics/punctuation); no fuzzy automatic merges.
- `find-next-athletes.mjs`: generated profile pipeline.
- `results/index.ts`: combined seasons, global result IDs, legacy country fallback.
- `audit:results`: links, duplicates, positions, times, source anomaly exceptions.

Do not reuse an existing edition or create a new race identity without checking it first.

## Next race: preview first

Copy a verified exact PTO race URL and the existing edition ID (no guessed slugs). For a single-gender or combined edition:

```sh
npm run import:race-results -- --url '<verified https://stats.protriathletes.org/race/slug/year/results>' --race '<existing-edition-id>'
```

Separate MEN/WOMEN editions on one source page: repeat `--race` for each edition. The parser selects only the edition's professional gender. Nice example (already populated, so now correctly refused):

```sh
npm run import:race-results -- \
  --url 'https://stats.protriathletes.org/race/im-703-world-championship/2026/results' \
  --race ironman-70-3-world-championship-2026-women \
  --race ironman-70-3-world-championship-2026-men
```

Default is read-only, prints counts, exact unmatched identities, missing splits and source/catalog country discrepancies. The URL must equal the edition's stored `statsPtoUrl`; redirects, tracking queries, absent/unknown gender tables and unsupported result columns are rejected. Check source title/date/location against the edition before writing; event-level date may cover a multi-day race (Nice source date 12 Sep, men edition 13 Sep). Compare participant counts and source spelling. Country mismatch is reported, not silently used to update the athlete profile. Ambiguous identities must be manually investigated; do not treat a name match as proof where other evidence conflicts.

## Explicit proposed file write

After reviewing preview, repeat with:

```sh
npm run import:race-results -- --url '<verified-source-url>' --race '<edition-id>' \
  --write --out src/data/results/<year>/<series>/<race>.ts --export <resultsExportName>
```

This creates a proposed TS module and paired HTML/JSON evidence under `scripts/fixtures/result-imports/`. It does **not** wire results into the app or create profiles automatically. Existing edition results/files/evidence cannot be overwritten; there is no force option. Snapshot replay is available through `--html <saved.html>` with the original `--url`; a matching canonical URL is mandatory. For independent replay verification retain the original downloaded HTML and SHA-256, never invent a snapshot.

## Integration and identities

1. Explicitly import the reviewed array into `src/data/results/index.ts` and append it to `allResults` after existing seasons, before global `.map((row,index)=>({...row,id:index+1}))`.
2. New explicit source rows must not enter the old `countryCodeByAthlete` backfill loop: otherwise source countries can retroactively alter historical runtime rows. The new rows already include gender/edition and every available source country.
3. Run `npm run find:next-athletes` to review unmatched names. Investigate possible aliases before generating. No fuzzy auto-merge, no guessed gender/country.
4. For genuinely new identities use `npm run find:next-athletes -- --write --append`. It preserves existing records and IDs, allocates new IDs above the catalog maximum and rejects conflicting gender/country evidence. New names remain English; no photo/localization/bio is invented. A second append with no new identities is a no-op. An alternate review file can be requested with `--output /tmp/proposed-athletes.ts`.
5. Do **not** use legacy bare `--write` during incremental imports: that old full regeneration path rebuilds/order-numbers profiles. The recommended incremental workflow is explicitly `--append`.

Source per-row spelling and flags remain in results. `athleteId` is resolved through the existing runtime linking machinery; IDs are recorded in identity evidence/review, not guessed in source rows. Missing splits stay absent; no subtraction or synthetic finish times. DNF/DNS/DSQ are statuses, not numeric places. PTO and T100 points are kept only when present in their explicit source columns.

## Validation / review gate

```sh
node --test scripts/test-race-result-import.mjs
npm run audit:results
npm run audit:athletes
npm run build
npm run lint
git diff --check
```

Compare old runtime rows/IDs and existing profiles against a before snapshot; audit duplicate identities/results and all new edition/athlete links. Compare before/after rankings with one `asOf` and the unchanged production utility. Browser-check Calendar → Race → Athlete → Back and the new profile history at mobile width. Record exact source URLs, counts/statuses, top finishers, generated IDs, unresolved source discrepancies and ranking movements for human review. No implicit commit/deploy.

Current regression fixtures cover Nice / French Riviera 2026, full field extraction, DNS/DSQ synthetic test inputs, malformed/unknown source rejection, safe overwrite refusal, complete linkage and preservation of pre-import production rows/profiles.

## SOF metadata (required review step)

The parser reads SOF from the `.sof-heading` inside each explicit `#MPRO` / `#FPRO` panel, never from page order. Dry-run includes `editionSof`: the selected existing edition ID, confirmed gender-specific source values and `missing` genders. Missing values stay undefined; they are not estimated. Malformed or ambiguous SOF fails closed.

`--write` saves this **metadata proposal in the evidence JSON** alongside proposed result rows. It does not edit TypeScript edition definitions automatically. During integration, apply only confirmed values to the explicitly selected existing edition in the existing edition data architecture. Preserve any other metadata; do not copy another gender's value. The importer rejects a source/stored SOF conflict before creating output files; resolving a conflict requires separate evidence and review, never a force flag. For an edition without existing SOF, review and apply the proposal before ranking validation. If the source lacks SOF, leave it undefined (an existing stored value is not deleted).

Nice 2026 (MEN 96.35 / WOMEN 96.18) and French Riviera 2026 (MEN 96.12) already had matching production SOF, so this import required no production SOF edits. French Riviera has no WOMEN source field. Existing source HTML snapshots and hashes are retained; evidence now explicitly exposes parsed SOF and its panel selector. Existing result editions still cannot be re-imported merely to update metadata.

## Production dataset clock (approved final correction)

Standard workflow: (1) identify a completed race; (2) verify its Stats PTO URL; (3) run import dry-run; (4) parse results + SOF; (5) inspect identities/anomalies; (6) human review; (7) explicit --write and reviewed result/edition integration; (8) generated athlete append; (9) audits/tests; (10) authorized commit/deploy.

`getRankingDatasetClock` derives noon UTC on the latest represented edition date with a ranking-participating linked result. Empty, unknown-athlete and DNS-only editions do not advance it; DNF/DSQ do. Empty datasets use the Unix epoch and yield no ranking rows. Completed-only data is an import/review invariant; the browser clock is deliberately not consulted. Future calendar editions without results do not affect it.

App passes one shared date to ranking and sort; utility defaults derive the same date when callers omit asOf. Ranking screen, Athletes ordering and Country Strength consume these shared derived values. After a new completed result import/build/deploy/reload, all update automatically. No production ranking.json, countryRanking.json or scheduled ranking recalculation is required. Race results + race metadata remain source of truth; fixtures are review artifacts only.

DNF treatment is intentionally unchanged: one start, recency denominator contribution, zero place-performance numerator. This is not a new warning/error.

Reviewed country corrections are persisted in countryEnrichment.json with stats-pto-verified provenance and matching-result evidence, and projected to the two existing generated records without regenerating IDs. The legacy full generator refuses conflicting historic result countries rather than silently overwriting the registry; use incremental --append for future imports.
