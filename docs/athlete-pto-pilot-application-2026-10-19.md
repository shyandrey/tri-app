# PTO pilot local application — 19.10.2026

Owner approved 72 AUTO-APPROVABLE additions plus four raw AGE/BORN fields for Marten Van Riel and Sam Laidlow. Applied locally only; no commit/push/deployment. Kristian's existing YouTube is preserved. Original CSV classifications and URL mapping registry remain historical approval/evidence records; this document and enrichment registry record the later field approval.

## Applied data

- 76 exact fields: 18 reportedAge + 18 birthYear + 40 social/website URLs, across19 existing profiles. Solveig has no usable fields and no enrichment entry; Matthew has socials only.
- [Registry](../src/data/athletes/ptoProfileEnrichment.json) is a persistent stable-ID overlay, separate from generated athlete catalogs. [Adapter](../src/data/athletes/ptoProfileEnrichment.ts) preserves existing fields/socials. Existing UI consumes ptoProfile without registry edits elsewhere.
- Every value/raw/source URL/observation timestamp/hash was compared with the [reviewed CSV](athlete-pto-field-review-2026-10-18.csv) and original final extraction report before application. Original HTML/proposal remain in `/tmp/300w-pto-final-lPRt2G/`.
- `node scripts/prepare-pto-pilot-registry.mjs` deterministically emits the exact registry JSON to stdout; it never writes the registry itself. Two outputs matched the applied file byte-for-byte. No source re-fetch or regenerated sports data was used.
- Marten raw33/1992 and Sam raw27/1998 are preserved with explicit owner discrepancy decisions; displayed competition age in2026 is34 and28. No DOB inferred. AGE-only freshness now uses observedAt (verifiedAt fallback for legacy test inputs), so later approval cannot refresh old observations.
- No replacements: Kristian YouTube unchanged; Casper Instagram post, Matthew LinkedIn, Sam rejected Twitter/Facebook forms and Laura HTTP website excluded. Missing values produce no entries or removals. Other SKIP values preserved.

## Coverage before / after

Before = local patch immediately before registry application, including the previously reviewed UI which already hid undated legacy ages. Legacy static ages remain2 in source data; they are not treated as verified current observations.

| Metric | Before | After |
|---|---:|---:|
| Athlete IDs | 1167 | 1167 |
| Profiles with enrichment | 0 | 19 |
| PTO reported AGE | 0 | 18 |
| Verified BORN | 0 | 18 |
| Displayed age (2026) | 0 | 18 |
| Unmodified legacy age fields | 2 | 2 |
| Profiles with social links | 2 | 17 |
| Total effective social links | 3 | 43 |
| instagram | 2 | 16 |
| twitter | 0 | 8 |
| youtube | 1 | 7 |
| facebook | 0 | 7 |
| tiktok | 0 | 0 |
| website | 0 | 5 |

## Invariants and tests

- 1167 original athlete IDs and all pre-existing profile fields unchanged; 4592 result rows/IDs/order and ranking scores/order equal the before-application snapshot. Standalone registry regression also compares against the un-enriched catalog construction.
- All76 fields match reviewed evidence; no duplicate imported social URLs. Existing verified values are protected by adapter and tests.
- `node --test scripts/test-pto-profiles.mjs scripts/test-pto-profile-mapping.mjs scripts/test-pto-profile-registry.mjs`:32 PASS.
- `node scripts/test-pto-profile-browser.mjs`:PASS, local real pilot profiles plus synthetic six-platform layout at320/390/768px; no live social navigation.
- `npm run check:release`:PASS, includes build, ESLint, athlete/results audits and ranking. `npm run check` does not exist in package.json. One existing RaceDetailPage hook-dependency lint warning remains.
- Kona historical athlete snapshot changed solely because of the added ptoProfile projection. Verified old hash against before data, compared all old fields/results/ranking, then updated ONLY athletesSha256 to `6fc44b6c9c72542395abab54f60477d24196662412f29f3ba39f771b2124f574`. Test logic and other hashes preserved.

## Remaining review

Local patch still requires owner review. Kristian channel/handle equivalence remains unresolved; no replacement. Excluded URL forms and missing age/social coverage remain untouched. The accepted Marten/Sam discrepancy is retained as provenance, not erased or treated as an identity conflict. No mass import or full regeneration is authorized. Rollback of this local feature can remove its overlay integration/registry in a separately reviewed patch; never restore entire unrelated files from Git.
