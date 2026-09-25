# Athlete Photo Batch 2 — successful publication

28/28 user-approved HIGH photographs published from the exact reviewed staging bytes. No discovery, network downloads or candidate substitution. Reviewed SHA-256 equals published SHA-256 for every entry.

| Metric | Before | After |
|---|---:|---:|
| Registry entries | 165 | 193 |
| Production files | 165 | 193 |
| Profiles with photos / 1161 | 165 | 193 |
| Profiles without photos / 1161 | 996 | 968 |

## Evidence chain

[Selection](athlete-photo-batch2-batch.json) → [Discovery](athlete-photo-batch2-discovery.json) → [Staging](athlete-photo-batch2-staging-manifest.json) → [Manual approval](athlete-photo-batch2-manual-review.json) → [Reviewed manifest](athlete-photo-batch2-reviewed-manifest.json) → [Production baseline](athlete-photo-batch2-production-baseline.json) → [Publish validation](athlete-photo-batch2-publish-validation.json).

reviewedAt records when the user's approval was recorded, not an invented inspection time. Original staging evidence remains a historical snapshot. Approval is recorded separately.

## Safety and invariants

All 165 previous production images (149 original + 16 Pilot Batch 1) have identical before/after SHA-256, including Mika Noodt, Jelle Geens and Kristian Blummenfelt. Existing registry mappings and runtime images are unchanged; Blummenfelt's existing bundled runtime portrait remains connected. Pilot evidence entries are deeply equal, and historical pilot fixture files are byte-identical.

All 28 new runtime profiles use the corresponding production paths. Exact duplicates: zero. Weak dHash findings remain in evidence and are resolved only by the user's explicit byte-bound visual approval. No LOW, NO_PHOTO or RETRY_UNRESOLVED candidate was published.

Ranking order and scores were compared at the same asOf timestamp and match. Result linkage matches; all non-photo athlete fields match. Source hashes prove unchanged UI, results, countries, localization and ranking implementation. athlete-audit.txt, ranking.txt and sof.json are unchanged.

Staging is retained byte-for-byte and gitignored. No git add, commit or push was performed.

## Checks

- Photo tests: 31/31 passed.
- Staging/publish tests: 13/13 passed, including named batch binding and rollback.
- Photo audit: 193 registry entries, 193 files, zero issues (no missing/orphan files, duplicate paths/hashes or slug collisions).
- Athlete audit: exit 0; 968 without photo; only expected missing-country issues Erik Olsson and Sebastian Schober.
- Results audit: exit 0; 0 errors, 0 warnings; 4367/4367 linked rows; 52 documented source anomalies.
- Both audits emitted a sandbox Vite WebSocket EPERM on port 24678; computation completed.
- git diff --check: passed.

## Published production paths and SHA-256

Paths below are public paths; on disk they are under public/athletes/. The hash is both reviewed and published SHA-256.

| Athlete | Production path | Reviewed = published SHA-256 |
|---|---|---|
| Aaron Royle | `/athletes/aaron-royle.png` | `989d35fa0c9243eade83275050f41c45f23ab74c1e920942955d417ea80a340d` |
| Robert Kallin | `/athletes/robert-kallin.png` | `52375c3d0d125d88518292f2d48c57bcca3b0fd6a7af9c45b1f0ae3b4793cd42` |
| Paul Schuster | `/athletes/paul-schuster.png` | `7c54573f8a7df9ab9955269f5fbc851f374bdf468c5d0e404fa02ba384e838f1` |
| Ben Hamilton | `/athletes/ben-hamilton.png` | `917fd2837211a05c6662ed38e82061890a8c730d07c4270af50053b54c685549` |
| Jarrod Osborne | `/athletes/jarrod-osborne.png` | `e82ec65e8ca424a5ddcc44276eb0b656fbaea4d8667add0366a8fd88d512c27b` |
| Will Draper | `/athletes/will-draper.png` | `a1ba15f0249b478411fd3e8f13416174b4f3862666d0ccc2128fd2974336e46b` |
| Thomas Bishop | `/athletes/thomas-bishop.png` | `d8d12664461f6a889fa5d93397b376e3fcf06ca3cb6566e4770a2652f339b5a2` |
| Antony Costes | `/athletes/antony-costes.png` | `5de8027d7cdb9002567042d8d9d4328e5fe9ed7b7262f28e17914b080e30e631` |
| Bradley Weiss | `/athletes/bradley-weiss.png` | `7bd636a34121ff1ddbfd4706a2890fecb56911a4b85fa32c718979bcb43c0138` |
| Josh Amberger | `/athletes/josh-amberger.png` | `d7a9eb27488739b299def108b3cf0f07cd6b3d9730e95079fba896b415cd3e0a` |
| Valdemar Solok | `/athletes/valdemar-solok.png` | `fe30033eabd25dc56f54222568b5233e98ac4695be2b8cf889d3470b3dfbe383` |
| Mattia Ceccarelli | `/athletes/mattia-ceccarelli.png` | `805fb5d295cae4ae5c58d018f97341fd885d116d682b8c1088c04353a856e387` |
| Kirsten Kasper | `/athletes/kirsten-kasper.png` | `73ef6d8f4c37fea19285f66c9d2db2e242e77970e1621bd74eeaf22cd2bb7708` |
| Jessica Fullagar | `/athletes/jessica-fullagar.png` | `3fc3545b132e3b0b7b3fba445d29b2cc795e5fa263fa6475f27974a626f3b35e` |
| Flora Duffy | `/athletes/flora-duffy.png` | `3246f2d24ebbb9e74768a4342e9592e9cac758576d9dc991e4991581b1341cc5` |
| Chelsea Sodaro | `/athletes/chelsea-sodaro.png` | `1595a2e80d50e829fb7a15686d83de0530459f3c38dee9c7706991d1f0144c78` |
| Charlene Clavel | `/athletes/charlene-clavel.png` | `ec5e330088ab24aab890b909ee1147db0b68f230b07596716d03e80e52dbd041` |
| Daniela Bleymehl | `/athletes/daniela-bleymehl.png` | `9bea8918fdff52991ee719c46bd6a4f0f0a4b781a8ceeb4f9f69ffde4ced896b` |
| Rachel Zilinskas | `/athletes/rachel-zilinskas.png` | `669d013461699e264b0bd0d348fa11c096f231c6e5622766cf9cc473121a58b0` |
| Kylie Simpson | `/athletes/kylie-simpson.png` | `7b99f16de7127550c24473145a6e5ed5d44f1722336d96a3eef92d94cdfcc9ed` |
| Marlene De Boer | `/athletes/marlene-de-boer.png` | `aaf26b310f35cc329c930d5f0c2d994c24baf28d9900fdb900cf62274f72df67` |
| Chloe Hartnett | `/athletes/chloe-hartnett.png` | `e3c42b3f3be689cdfeb8be1a7cc4c418935cf73d350a800226e9febe5f0ca8c8` |
| Amelia Watkinson | `/athletes/amelia-watkinson.png` | `594e2fd7e9cc859f73c9882557ca63a66274807fe6691775f3e127be939453dc` |
| Sif Bendix Madsen | `/athletes/sif-bendix-madsen.png` | `10916c15381a56a2c13091fa8196587a595e1d0efe10dc9d66fc6f1f6c9a18a5` |
| Gurutze Frades Larralde | `/athletes/gurutze-frades-larralde.png` | `b8ca1fdb86261a902618dfa3f7277e6c2b0caafa223c3692627481e2b62ecaf7` |
| Jocelyn McCauley | `/athletes/jocelyn-mccauley.png` | `6d16ac37c56fecc3cddf6de564987fd59130187a8b35eae2ba36823e01d07d75` |
| Elisabetta Curridori | `/athletes/elisabetta-curridori.png` | `b2d810aa13aec4707fbed7185af7459b9037f33cee9af2efddcddc36cb389d3a` |
| Lauren Brandon | `/athletes/lauren-brandon.png` | `cc032931e6118d4c95e62fd324284152263328ce054a9aac2e7aa449700b04ad` |

## Files changed by this publication task

- `public/athletes/aaron-royle.png`
- `public/athletes/amelia-watkinson.png`
- `public/athletes/antony-costes.png`
- `public/athletes/ben-hamilton.png`
- `public/athletes/bradley-weiss.png`
- `public/athletes/charlene-clavel.png`
- `public/athletes/chelsea-sodaro.png`
- `public/athletes/chloe-hartnett.png`
- `public/athletes/daniela-bleymehl.png`
- `public/athletes/elisabetta-curridori.png`
- `public/athletes/flora-duffy.png`
- `public/athletes/gurutze-frades-larralde.png`
- `public/athletes/jarrod-osborne.png`
- `public/athletes/jessica-fullagar.png`
- `public/athletes/jocelyn-mccauley.png`
- `public/athletes/josh-amberger.png`
- `public/athletes/kirsten-kasper.png`
- `public/athletes/kylie-simpson.png`
- `public/athletes/lauren-brandon.png`
- `public/athletes/marlene-de-boer.png`
- `public/athletes/mattia-ceccarelli.png`
- `public/athletes/paul-schuster.png`
- `public/athletes/rachel-zilinskas.png`
- `public/athletes/robert-kallin.png`
- `public/athletes/sif-bendix-madsen.png`
- `public/athletes/thomas-bishop.png`
- `public/athletes/valdemar-solok.png`
- `public/athletes/will-draper.png`
- `scripts/athlete-photo-import.md`
- `scripts/athlete-photo-publish.mjs`
- `scripts/fixtures/athlete-photo-batch2-manual-review.json`
- `scripts/fixtures/athlete-photo-batch2-production-baseline.json`
- `scripts/fixtures/athlete-photo-batch2-publish-report.md`
- `scripts/fixtures/athlete-photo-batch2-publish-validation.json`
- `scripts/fixtures/athlete-photo-batch2-reviewed-manifest.json`
- `scripts/select-athlete-photo-batch.mjs`
- `scripts/test-athlete-photo-staging.mjs`
- `scripts/test-athlete-photos.mjs`
- `src/data/athletes/athletePhotoEvidence.json`
- `src/data/athletes/athletePhotos.generated.ts`

The pre-existing UI changes and unrelated local artifacts were preserved. All new files are currently untracked; tracked changes remain unstaged.

## Git status

```text
## home-redesign-experiments...origin/home-redesign-experiments
 M scripts/athlete-photo-import.md
 M scripts/athlete-photo-publish.mjs
 M scripts/athlete-photo-staging.mjs
 M scripts/stage-athlete-photos.mjs
 M scripts/test-athlete-photo-staging.mjs
 M scripts/test-athlete-photos.mjs
 M src/athlete-detail.css
 M src/data/athletes/athletePhotoEvidence.json
 M src/data/athletes/athletePhotos.generated.ts
 M src/pages/AthleteDetailPage.tsx
?? athlete-audit.txt
?? public/athletes/aaron-royle.png
?? public/athletes/amelia-watkinson.png
?? public/athletes/antony-costes.png
?? public/athletes/ben-hamilton.png
?? public/athletes/bradley-weiss.png
?? public/athletes/charlene-clavel.png
?? public/athletes/chelsea-sodaro.png
?? public/athletes/chloe-hartnett.png
?? public/athletes/daniela-bleymehl.png
?? public/athletes/elisabetta-curridori.png
?? public/athletes/flora-duffy.png
?? public/athletes/gurutze-frades-larralde.png
?? public/athletes/jarrod-osborne.png
?? public/athletes/jessica-fullagar.png
?? public/athletes/jocelyn-mccauley.png
?? public/athletes/josh-amberger.png
?? public/athletes/kirsten-kasper.png
?? public/athletes/kylie-simpson.png
?? public/athletes/lauren-brandon.png
?? public/athletes/marlene-de-boer.png
?? public/athletes/mattia-ceccarelli.png
?? public/athletes/paul-schuster.png
?? public/athletes/rachel-zilinskas.png
?? public/athletes/robert-kallin.png
?? public/athletes/sif-bendix-madsen.png
?? public/athletes/thomas-bishop.png
?? public/athletes/valdemar-solok.png
?? public/athletes/will-draper.png
?? ranking.txt
?? scripts/fixtures/athlete-photo-batch2-batch.json
?? scripts/fixtures/athlete-photo-batch2-discovery.json
?? scripts/fixtures/athlete-photo-batch2-download-candidates.json
?? scripts/fixtures/athlete-photo-batch2-manual-review.json
?? scripts/fixtures/athlete-photo-batch2-production-baseline.json
?? scripts/fixtures/athlete-photo-batch2-publish-report.md
?? scripts/fixtures/athlete-photo-batch2-publish-validation.json
?? scripts/fixtures/athlete-photo-batch2-report.md
?? scripts/fixtures/athlete-photo-batch2-reviewed-manifest.json
?? scripts/fixtures/athlete-photo-batch2-staging-manifest.json
?? scripts/fixtures/athlete-photo-batch2-staging-validation.json
?? scripts/select-athlete-photo-batch.mjs
?? sof.json
```

Batch 2 publication and validation are complete. Awaiting user review.
