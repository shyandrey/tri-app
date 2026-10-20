# PTO photo cohort — local application, 20.10.2026

Owner-approved local patch only; not committed, deployed or remotely applied.

## Applied scope

720 additions = 651 original AUTO-APPROVABLE + 60 raw AGE/BORN fields + 9 non-shared Jackson/Lisa fields. Zero overlapping ID/field keys, zero replacements. Total enrichment registry: 796 fields including the original 76 pilot fields. All original pilot entries and provenance remain byte-equivalent after JSON parsing.

The deterministic stdout-only generator is [prepare-pto-photo-registry.mjs](../scripts/prepare-pto-photo-registry.mjs). It rebuilds the original pilot first, reconciles every approval against the original field CSV, checks unique mappings/fields/URLs and adds only approved values. No network or registry writer. Source CSV hashes and approval date are recorded separately; observedAt/verifiedAt remain original source observation timestamps, not the approval date. The Python CSV boolean spelling difference `False` vs `false` is normalized solely for reconciliation.

| Added field | Count |
|---|---:|
| birthYear | 179 |
| reportedAge | 179 |
| socials.facebook | 70 |
| socials.instagram | 152 |
| socials.twitter | 44 |
| socials.website | 59 |
| socials.youtube | 37 |

## Runtime coverage in the 221-photo cohort

| Field | Before | After |
|---|---:|---:|
| enriched | 19 | 210 |
| reportedAge | 18 | 197 |
| birthYear | 18 | 197 |
| instagram | 16 | 168 |
| twitter | 8 | 52 |
| youtube | 7 | 44 |
| facebook | 7 | 77 |
| tiktok | 0 | 0 |
| website | 5 | 64 |

Coverage includes existing legacy social links; it is not simply new registry field counts. 210 profiles now have nonempty PTO enrichment; 11 remain without it. Missing fields remain absent.

## Excluded and preserved

- HOLD shared RTS YouTube: Jackson Laundry 38 and Lisa Becharas 10825.
- HOLD Lisa Becharas reportedAge/birthYear.
- Kristian's existing `https://youtube.com/@kristian.blummenfelt` remains unchanged; no replacement entry.
- All 57 rejected raw URLs excluded; no validator widening or URL repair.
- 1167 IDs, all non-enrichment athlete fields, all 4592 linked result objects, ranking values/order and original pilot runtime profiles compared before/after: identical.
- Age uses calendar year minus BORN; original reported AGE retained. New 30 discrepancy pairs have rollover regression assertions; no exact DOB inferred.

## Tests and snapshot

PTO tests: 44/44 PASS, including exact 720-field CSV/provenance comparison, deterministic registry generation twice, original pilot preservation, HOLD/rejected exclusions and competition-age rollover. Browser tests PASS at 320/390/768 px, including Jackson and Lisa; existing pilot assertions preserved.

Initial release gate failed only on the full Kona athlete snapshot, which includes enrichment. Restoring prior enrichment exactly reproduced the old hash `6fc44b6c9c72542395abab54f60477d24196662412f29f3ba39f771b2124f574`. Only athletesSha256 was updated to `51a92c6af38fb775999aaaaf35ea91be15b32a46b7599e59e9c018102fdaa0e5`; no assertions were removed or narrowed. Final release gate: **18/18 PASS**. Result is recorded in `/tmp/300w-cohort-apply/release-final.log`.

`npm run check` does not exist; the verified existing script is `npm run check:release`. Local evidence: `/tmp/300w-cohort-apply/` (runtime before/after, proposed registry, hashes, test/browser/gate logs). No D1, secrets, Telegram or production changes. Prior piped-parser stall remains a separate local tooling limitation; this application uses reviewed CSV values, not new extraction.

## Review sources

- [Owner field review](athlete-pto-owner-field-review-2026-10-20.md)
- [Original 651 additions](athlete-pto-owner-field-review-2026-10-20-batch-651.csv)
- [74 review fields and recommendations](athlete-pto-owner-field-review-2026-10-20-review-fields.csv)
- [Source field CSV](athlete-pto-photo-fields-2026-10-19.csv)


## Durable HTML evidence archive — verified 20.10.2026

Owner-approved local archive, outside Git and not uploaded:

`/Users/andrey.shubin/Projects/tri-app-archives/pto-photo-cohort-2026-10-20/`

Exactly 221 original HTML files (`<athleteId>.html`, 24,089,759 bytes total) and `manifest.json`. Every archived file is readable and SHA-256-identical to its previously verified source. Original `/tmp` files remain unchanged. The manifest retains ID, PTO URL, original filename/path, original capture timestamp, hash and archive-relative filename. Archive date is not a new observation date.

Manifest SHA-256: `c6cb1866e5dec466a9ff392c52fb652877b1c21bcb0cf02903f3736de8e10a06`.

Verify without modifying any files:

```sh
python3 - <<'PYVERIFY'
from pathlib import Path
import json, hashlib
root = Path('/Users/andrey.shubin/Projects/tri-app-archives/pto-photo-cohort-2026-10-20')
manifest = root / 'manifest.json'
assert hashlib.sha256(manifest.read_bytes()).hexdigest() == 'c6cb1866e5dec466a9ff392c52fb652877b1c21bcb0cf02903f3736de8e10a06'
entries = json.loads(manifest.read_text())['entries']
assert len(entries) == len({e['athleteId'] for e in entries}) == 221
assert len({e['archiveRelativePath'] for e in entries}) == 221
assert {p.name for p in root.glob('*.html')} == {e['archiveRelativePath'] for e in entries}
for entry in entries:
    data = (root / entry['archiveRelativePath']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry['sha256'], entry['athleteId']
print('PASS: 221 archived snapshots')
PYVERIFY
```

Recovery: first run the verification above. Use `archiveRelativePath` as the evidence input instead of `originalSnapshotPath`; retain `capturedAt` as observedAt/verifiedAt and the recorded hash. If a replay tool requires a scratch directory, copy validated HTML there without overwriting originals, and recheck hashes. Do not refetch or assign a new timestamp merely because the old `/tmp` directory was lost. The old `/tmp` batch/log JSON remains temporary; source HTML and capture metadata are now durable. Field proposals can be reproduced from the committed-scope CSVs using `node scripts/prepare-pto-photo-registry.mjs` (stdout only, no write).

### Python stdin limitation

The full-cohort run twice stalled in the Node `spawnSync` → Python piped-stdin path. Root cause remains unresolved; do not describe the normal extraction CLI as fixed. The successful workaround used the unchanged parser with a file descriptor for stdin, bounded subprocess timeout, and repeated byte-identical parsing; temporary JS adapters read those parsed outputs. No parser refactor is part of this task.

A single archived identity snapshot can be examined without pipe input, from repository root:

```sh
python3 scripts/parse-pto-profile.py --identity-only < /Users/andrey.shubin/Projects/tri-app-archives/pto-photo-cohort-2026-10-20/67.html
```

For a bounded batch harness, use `subprocess.run(['python3', 'scripts/parse-pto-profile.py', '--identity-only'], stdin=open(snapshot, 'rb'), stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=15, check=True)`. Remove `--identity-only` only when field extraction is authorized. Keep raw HTML outside Git; the archive is a local evidence copy, not an off-device backup.
