# Athlete photo discovery

This importer is currently discovery-only. It fetches HTML for an explicit batch,
checks profile identity, classifies image URLs and prints evidence JSON to stdout.
It never fetches images or writes staging, production photos or the registry.
Existing 149 photos have not been assigned invented provenance.

```sh
node scripts/import-athlete-photos.mjs --batch scripts/fixtures/athlete-photo-pilot-batch.json --dry-run
node --test scripts/test-athlete-photos.mjs
```

The manifest binds athlete ID, exact runtime name and gender. It covers curated,
generated and verified generated profiles. Slug generation only suggests a profile
URL: final URL, canonical URL, primary headline and profile title must all agree.
Historical slug overrides are preserved; name aliases additionally require a
source URL and explanation. Unknown redirects and identities remain unresolved.

All discovery modes run the same image/shared-asset filter. Matching PTO UUID
responsive variants are grouped; an asset seen on two distinct batch profiles is
blocked, even when its numeric score is high. This conservative policy can also
block a genuine portrait appearing in another profile's comparison widget.
The filter only knows the explicit batch; it does not claim catalog-wide coverage.
HIGH requires an explicit self-profile portrait corroborated by og:image without
conflicting portrait metadata. HIGH still requires human review, and means HTML
association, not visual identification. MEDIUM requires review; LOW and NO_PHOTO
must not be downloaded. NO_PHOTO is a dated observation of supported HTML metadata,
not proof that no photo exists elsewhere. Network/identity failures remain
RETRY_UNRESOLVED.

The historical no-photo list remains intact and undated. Normal discovery skips
it without claiming a fresh absence check. `--recheck` or `--audit-weak` bypasses
this skip only within the explicit manifest. LOW_CONFIDENCE_NAMES is retained as
historical policy data, never used to widen the manifest or certify an image.
The old `--all` and `--only` modes are rejected. In particular, the legacy npm
`import:athlete-photos:all` shortcut is intentionally disabled by this validation.

`--clean-no-photo`, `--stage` and `--publish` are unavailable outside dry-run;
inside dry-run they are explicitly ignored and cannot cause writes. Existing and
manual photos require both explicit refresh and replace plus later acceptance.
Mika Noodt, Jelle Geens and Blummenfelt's documented dual-source case are protected.

Every invocation compares filesystem hashes and directory structure before and
after, including staging and production. Only .git and node_modules are excluded.
A mismatch fails the invocation; this is detection, not rollback of external edits.
Do not redirect stdout to a repository file while this guard is running. Capture
stdout outside the repository, then save a report separately after completion.
The checked-in pilot evidence is such a separately saved report, not a dry-run
side effect. The tests cover all 128 combinations of seven optional flags with
--dry-run, including existing staging files and directories.

## Future download and publish boundary

`stagingPlan` and `validatePublishPlan` are non-writing contracts. These compatibility helpers do not enable a writer themselves. Separate staging
and publish implementations are documented below. Their workflow is:

1. Discover explicit batch, verify profile, extract image candidates, filter
   shared assets, classify confidence and preserve dated source evidence.
2. Download eligible candidates into `.athlete-photo-staging/<athleteId>/` only,
   after source/redirect validation, bounded fetches and MIME/size checks. Decode
   actual bytes, determine real extension, compute checksum and compare against
   all existing/staged images; detect content duplicates beyond identical URLs.
3. Show staged candidates for manual identity/portrait review. Bind acceptance to
   athlete ID, source URL, actual checksum, reviewer and date. Revalidate stale
   source evidence before publication. LOW/unresolved cannot advance.
4. A separately authorized publish operation must re-read and hash staged bytes,
   verify acceptance and existing-photo protection, build a prospective registry
   and filesystem, and validate one photo per athlete, no missing files, orphans,
   duplicate paths, unexplained duplicate hashes or leftover old extensions.
5. Publish image and registry transactionally with rollback; a refreshed extension
   must remove the previous file only as part of the successful transaction.
   Only then record a production local path. Preserve source/evidence metadata.
6. Run photo consistency audit, athlete/results audits, and ranking/linkage
   invariant comparisons. Review the whole first batch before scaling up.

The current contract validator trusts supplied decoded/checksum/projected-audit
metadata because the helper has no writer. It must not be treated as authorization to
write files without the actual-byte and transaction checks above.

## Staging download and manual review (second pilot phase)

Separate commands now implement the staging and publish boundaries described
above. The discovery importer itself remains non-writing. The old planning
helpers are compatibility contracts, not publish authorization.

```sh
node scripts/stage-athlete-photos.mjs --discovery scripts/fixtures/athlete-photo-pilot-discovery.json --accepted scripts/fixtures/athlete-photo-pilot-staging-accepted.json
```

The accepted list pins the discovery file SHA-256 and precisely 16 previously
accepted HIGH URLs. No candidate substitution, rediscovery, redirects or fallback
images are allowed. Only PNG/JPEG from the recorded PTO content host are accepted.
Response status, final URL, MIME, bounded bytes, magic, PNG CRC/chunk completeness,
and actual decoding are checked. The native decoder requires macOS ImageIO and
Xcode Command Line Tools; no npm dependencies were added. Compilation/cache live
in the OS temporary directory. Animated/unsupported/incomplete images are rejected.

Files go only to `.athlete-photo-staging/<athleteId>/<sha256>.<actualExtension>`.
The manifest preserves identity, URLs, dates, validation, dimensions, byte size,
SHA-256, decoded-pixel SHA-256 and dHash. Completed entries are checkpointed;
reruns verify existing bytes and resume missing entries without downloading again.
The `complete` flag is set only after duplicate comparisons. No local production
path is recorded before publish. All actual pilot entries are PENDING_MANUAL_REVIEW.

Open `.athlete-photo-staging/review.html`. It references local files, shows all
16 portraits and expandable possible-match pairs against staging/production.
Checkboxes are temporary visual notes only: they neither persist approval nor
publish anything. SHA-256 candidates are also checked by actual byte equality.
Decoded-pixel equality catches identical images with different encodings. dHash
Hamming distance <=6 flags possible composition similarity, not a biometric match;
false positives are expected for uniformly framed headshots. Such entries are
validation REVIEW_REQUIRED while reviewStatus stays PENDING_MANUAL_REVIEW. No
heuristic resolves them automatically.

The publisher exists but has NOT been run on this repository:

```sh
node scripts/publish-athlete-photos.mjs --manifest path/to/reviewed-manifest.json --reviews path/to/explicit-reviews.json --publish
```

A human-reviewed manifest must mark each selected row APPROVED. The separate
reviews file binds `manifestSha256` to SHA-256(JSON.stringify(parsed manifest)),
and each review to `athleteId`, `sourceImageUrl`, `sha256`, `reviewer`, `reviewedAt`,
and `reviewStatus: APPROVED`. Omitted athletes cannot publish. Any supplied pending,
rejected or unresolved row aborts the entire operation. Duplicate findings must
first be resolved explicitly; the publisher also repeats current-content duplicate
checks and conservatively refuses unresolved similarities. Existing photos require
both `refresh: true` and `replace: true`; changing extension removes the old file
only within the transaction. Runtime/bundled overrides are not rewritten.

Preflight re-hashes and re-decodes staged bytes, validates identity and projected
files/registry in a temporary directory, and checks production again before writing.
A lock and persistent backup journal protect the write phase. Caught failures
restore original image/registry/evidence bytes and remove newly created files.
A successful transaction writes evidence only for newly approved photos, verifies
published hashes, runs the photo audit and removes its journal. The first 149
photos receive no invented provenance. Staging remains available after publish.

A killed process can leave `.download.lock` and `.publish-transaction/journal.json`.
Do not delete them blindly or rerun publish: recover the listed original bytes
from the journal before proceeding. This is rollback-based publication, not a
single atomic filesystem operation across multiple files; no concurrent importer
or external editor may modify production during publication.

## Published first pilot

The user explicitly approved all 16 downloaded images and their original SHA-256.
Approval metadata is saved in `fixtures/athlete-photo-pilot-manual-review.json`,
bound to `athlete-photo-pilot-reviewed-manifest.json`. `reviewedAt` records when
that approval was recorded, not an invented exact time of visual inspection.

Weak dHash findings are preserved. A byte-bound manual visual approval may resolve
only already recorded POSSIBLE_VISUAL_MATCH findings, with an explicit reason and
findings hash. New findings, exact-byte collisions and identical decoded images
still block publication. Ten rows therefore became
VALIDATED_AFTER_MANUAL_REVIEW; all 16 are APPROVED. This does not claim that dHash
identified a person or that the user individually compared every flagged pair.

The transaction added 16 files and evidence entries, retaining the historical 149
files unchanged and without fabricated provenance. `.athlete-photo-staging/` is
retained locally and ignored by Git. The original discovery/staging reports remain
historical snapshots; the publication report records current production state.
