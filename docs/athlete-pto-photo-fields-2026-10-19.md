# PTO photo cohort — field review, 2026-10-19

Local review only. No field approval or import. Original pilot preserved.

221/221 identity checks PASS; nine completed batches (8 × 25 + 21). Reused verified live snapshots from 18–19 October; zero new profile requests, no retries. Original observation times and SHA-256 are retained. Historical corroboration uses PTO profile race-history rows and existing local results; no second provider or new race-page requests.

Competition age = observation calendar year (2026) − BORN. Raw AGE is retained separately. No exact DOB inferred. All additions require owner approval; AUTO-APPROVABLE is a review classification, not permission to write.

## Coverage and proposals

AGE: 198/221; BORN: 198/221; valid social/website link: 174/221.

AUTO-APPROVABLE additions: 651; REVIEW REQUIRED fields: 74; SKIP/no-change fields: 1043; proposed replacements (not applied): 1.

| Field | Proposed automatic additions |
|---|---:|
| birthYear | 148 |
| reportedAge | 148 |
| socials.facebook | 68 |
| socials.instagram | 150 |
| socials.twitter | 43 |
| socials.website | 57 |
| socials.youtube | 37 |

## AGE/BORN discrepancies

| ID | Athlete | PTO AGE | BORN | Competition age (2026) |
|---|---|---:|---:|---:|
| 2 | Marten Van Riel | 33 | 1992 | 34 |
| 10521 | Sam Laidlow | 27 | 1998 | 28 |
| 9 | Samuel Dickinson | 28 | 1997 | 29 |
| 10 | Menno Koolhaas | 30 | 1995 | 31 |
| 21 | Magnus Ditlev | 28 | 1997 | 29 |
| 22 | Sam Long | 30 | 1995 | 31 |
| 27 | Ben Kanute | 33 | 1992 | 34 |
| 33 | Pieter Heemeryck | 36 | 1989 | 37 |
| 40 | Marc Dubrick | 31 | 1994 | 32 |
| 52 | Henrik Goesch | 31 | 1994 | 32 |
| 53 | Jonas Hoffmann | 29 | 1996 | 30 |
| 72 | Kieran Lindars | 29 | 1996 | 30 |
| 74 | Sam Osborne | 34 | 1991 | 35 |
| 75 | Simon Viain | 32 | 1993 | 33 |
| 111 | Alanis Siffert | 24 | 2001 | 25 |
| 120 | Marjolaine Pierré | 26 | 1999 | 27 |
| 121 | Bianca Bogen | 27 | 1998 | 28 |
| 129 | Grace Thek | 34 | 1991 | 35 |
| 132 | Natalie Van Coevorden | 33 | 1992 | 34 |
| 135 | Cathia Schär | 24 | 2001 | 25 |
| 148 | Rebecca Clarke | 37 | 1988 | 38 |
| 151 | Johanna Ahrens | 30 | 1995 | 31 |
| 171 | Fiona Moriarty | 37 | 1988 | 38 |
| 10041 | Antony Costes | 36 | 1989 | 37 |
| 10226 | Jarrod Osborne | 27 | 1998 | 28 |
| 10457 | Ondrej Kubo | 32 | 1993 | 33 |
| 10485 | Rasmus Svenningsson | 33 | 1992 | 34 |
| 10644 | Alice Alberts | 34 | 1991 | 35 |
| 10697 | Cecilia Perez | 34 | 1991 | 35 |
| 10779 | Julie Iemmolo | 26 | 1999 | 27 |
| 10810 | Laura Madsen | 23 | 2002 | 24 |
| 10827 | Lisa Norden | 41 | 1984 | 42 |

## Validation conflicts

- AGE_BORN_CONFLICT: 32 profiles.
- CROSS_ATHLETE_SOCIAL_DUPLICATE: 2 profiles.
- EXISTING_YOUTUBE_CONFLICT: 1 profiles.
- INVALID_OR_UNCLASSIFIED_SOCIAL_URL: 56 profiles.
- SOCIAL_PLATFORM_MISMATCH: 1 profiles.

Rejected/unsupported raw URLs are retained in rejected-socials.csv and conflicts.json. Matching platform/domain does not independently verify ownership of an external social account. No external social-link reachability checks were made. Conflicting existing links are never overwritten; Kristian’s YouTube and all pilot values remain unchanged.

## Artifacts

- [Field-level CSV](athlete-pto-photo-fields-2026-10-19.csv).
- Local evidence, batch JSON, preflight, proposals, conflicts, missing fields, rejected URLs, replay runner and test logs: `/tmp/300w-photo-fields-2026-10-19/`.
- Existing source HTML paths and hashes are listed in `preflight.json`; `/tmp` is temporary, not a permanent evidence archive.
- Deterministic replay compares every parsed profile twice with the same observation timestamp. Cached evidence is suitable for this review, not a claim of a new live check.
- PTO tests: 43/43 PASS; `npm run check:release`: 18/18 PASS; `check` script does not exist.

## Local execution limitation

Two initial runs using Node spawnSync with piped Python stdin stalled and were stopped. Their logs are retained; neither performed network requests or writes to athlete data. The completed run uses a temporary file-stdin harness outside the repository: the unchanged Python parser runs twice for each snapshot in identity and full-field modes, with byte-identical outputs. Temporary copies of the JS modules change only the extraction adapter to read those parser outputs; identity and field-analysis logic is unchanged. `parser-replay.log` and `file-input-run.log` record successful completion. The normal CLI pipe stall remains an unresolved local tooling risk; it is not a failed athlete identity.

No registry or application changes were made. No field is approved by this report. Before any subsequent application, review the CSV, shared social URLs and raw AGE/BORN discrepancies, and retain the source evidence outside temporary storage.
