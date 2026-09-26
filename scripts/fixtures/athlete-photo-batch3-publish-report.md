# Athlete Photo Batch 3 — successful publication

29/29 HIGH photographs explicitly approved by the user were published through the existing transactional publisher from exactly the reviewed staging bytes. No discovery, image downloads or candidate substitutions were performed. No non-HIGH athlete was published.

| Metric | Before | After |
|---|---:|---:|
| Production registry | 193 | 222 |
| Production files | 193 | 222 |
| Profiles with photo / 1161 | 193 | 222 |
| Profiles without photo / 1161 | 968 | 939 |
| Coverage | 16.62% | 19.12% |

## Evidence chain

[Selection](athlete-photo-batch3-batch.json) → [Discovery](athlete-photo-batch3-discovery.json) → [Download candidates](athlete-photo-batch3-download-candidates.json) → [Original staging manifest](athlete-photo-batch3-staging-manifest.json) → [User manual review](athlete-photo-batch3-manual-review.json) → [Approved manifest](athlete-photo-batch3-reviewed-manifest.json) → [Pre-publish baseline](athlete-photo-batch3-production-baseline.json) → [Publish validation](athlete-photo-batch3-publish-validation.json).

reviewedAt records when the user's approval was recorded; the exact visual inspection time was not supplied. The approval binds identity, verified profile URL, source URL and SHA-256 to batch 3. Original staging records/review page remain historical snapshots; authoritative APPROVED decisions are in the reviewed manifest and manual-review record.

## Preflight and safety

All 29 staging SHA-256, lengths, dimensions, decoded pixels and dHash values matched the original manifest. Identities matched runtime ID, English name, gender, country code and catalog type. Profile/source URLs matched saved HIGH discovery and its hashed download manifest. Destinations were unique and no existing runtime/registry photo was replaced. Exact-byte and identical-pixel collisions were absent. Previously recorded weak dHash findings were retained and resolved by the user's explicit visual approval; no safety gates were loosened.

Baseline/hash comparison proves byte-for-byte preservation of all 193 previous production images (149 original + 16 Pilot + 28 Batch 2), including Mika Noodt, Jelle Geens and Kristian Blummenfelt. All previous registry mappings and runtime photo paths remain connected. Blummenfelt's existing bundled runtime photo and all bundled assets are unchanged. All 44 previous evidence entries are deeply equal, and historical Pilot/Batch 2 fixture files are byte-identical.

Production audit: 222 entries / 222 files, zero missing/orphan files, duplicate paths, hashes or slug collisions. All 222 images decoded successfully; zero identical decoded-pixel pairs. All 29 new runtime image paths match their evidence and registry entries. Reviewed SHA-256 equals published SHA-256 for every new file.

Ranking order/scores and result linkage matched at the same asOf timestamp. All non-photo athlete fields matched. Protected source hashes prove unchanged results, countries, localization, ranking implementation, navigation, Athlete Profile UI, Home/Calendar and global search/filter behavior. athlete-audit.txt, ranking.txt and sof.json are unchanged.

All staging remains present and byte-identical, including .athlete-photo-staging/photo-batch-3/. It is gitignored. No git add, commit or push was performed.

## Tests/audits

- Photo tests: 33/33 passed.
- Staging tests: 13/13 passed.
- Athlete audit: exit 0; only the expected Erik Olsson and Sebastian Schober country issues; 939 profiles without photos.
- Results audit: exit 0, 0 errors / 0 warnings.
- Both audits emitted a Vite WebSocket EPERM on port 24678; audit computations completed.
- git diff --check: passed.

## Published files and hashes

Public paths below correspond to files under public/athletes/. Each hash is both reviewed and published SHA-256.

| Athlete | Production path | Reviewed = published SHA-256 |
|---|---|---|
| Jannik Schaufler | `/athletes/jannik-schaufler.png` | `93c830f8e96d3d278f8960698f9967ffd99a9b359954afe1c6473b109956fef1` |
| Maximilian Sperl | `/athletes/maximilian-sperl.png` | `4e967a2ed6cee33225dc269796c0ff00c50156bc8a4059bf3b8e8341546ab704` |
| Rasmus Svenningsson | `/athletes/rasmus-svenningsson.png` | `febd1188bd527a867989c32ec3118481c9e2eccd617114d642c33a2cdea1a4c3` |
| Henri Schoeman | `/athletes/henri-schoeman.png` | `17f9ab0417b14cb5effb21247b60edafd18e1b32b1a33a57287ee6cef0127268` |
| Kenji Nener | `/athletes/kenji-nener.png` | `1ce7e43e9317ca3928c47211aa814665cb6e68f5d687b4b1a4815814aa22a2ff` |
| Dylan Magnien | `/athletes/dylan-magnien.png` | `3002cfdb671bc6ccb0a844a80056177f48bb32f6b325f05ec0f3e41e0a5cd5df` |
| Thor Bendix Madsen | `/athletes/thor-bendix-madsen.png` | `e0fb7daabf6fb842e9e371e206403ea599142f0a3f65e9adde9524dc10f30c72` |
| Caleb Noble | `/athletes/caleb-noble.png` | `1e76bfe754802ba127d3f64a872fd61c29be899775284c63c49f12f41a5cf2af` |
| Florian Angert | `/athletes/florian-angert.png` | `b4276a315437d5376f8f5007a874ee40340c7444038f1ac5d2bdab75857cf827` |
| Benjamin Zorgnotti | `/athletes/benjamin-zorgnotti.png` | `9031e407f57a335c0e9aaa10322a6b9b615eb880d22133296dc430e82dca87bc` |
| Matt Burton | `/athletes/matt-burton.png` | `a9583634e731e46003f012b82228bdb818746806d92d1f751370cf333164d5f2` |
| Nicholas Quenet | `/athletes/nicholas-quenet.png` | `8f728e7e9c9d62dfb75f949d31ddcfca3699714638f69b76f3e9e72be4ad6927` |
| Ondrej Kubo | `/athletes/ondrej-kubo.png` | `8bd6f6421b14149fa485004528107de91bf046d32379739f5a7e7473953fff5e` |
| Danielle Fauteux | `/athletes/danielle-fauteux.png` | `5f8aa76d5b6bc2b1dfc6803f7f9033b29d36bd3cf241952ec30e7c83ef931e0b` |
| Daniela Ryf | `/athletes/daniela-ryf.png` | `f9e1fa5bb312781d07a52fe34be0bba80caa6d5917ef6fa738b84f1f5aeca0a2` |
| Julie Iemmolo | `/athletes/julie-iemmolo.png` | `ba0cad1bfc24616a707467f22d11a2c0b2490c0ebb7f32f9d2f4d6510a976902` |
| Jeanni Metzler | `/athletes/jeanni-metzler.png` | `9afa91845ef9328944873786b50fc0a970830e9a3e85d7363fa2bd89716d82a4` |
| Anna Bergsten | `/athletes/anna-bergsten.png` | `13ee0cbf4155c83bb5b44d42f85a74a8c0b982d7f0a6bb51aebe3085bce4f3a4` |
| Cecilia Perez | `/athletes/cecilia-perez.png` | `fe8f91806c4ecb283954ff310d7cc9c1a3645430d5dd6d827fd813ad202c1682` |
| Solenne Billouin | `/athletes/solenne-billouin.png` | `8c5b46d3c5938590531d324bcd4324f07871b508f66321ecd62e65995b1c3ffa` |
| Merle Brunnee | `/athletes/merle-brunnee.png` | `54642b1185c2a6cfbe5172247281253d8fc50e78b04b8c9ff31a14853eb33999` |
| Ai Ueda | `/athletes/ai-ueda.png` | `c45f49f711895179738bd2d0e0e9d9abf6234ad261a6b355a726a5a8f6766e31` |
| Pamella Oliveira | `/athletes/pamella-oliveira.png` | `a16fbba2678a6f036973f042c5f34bf9440853dfd5ce10b371fc1edae724fe38` |
| Justine Mathieux | `/athletes/justine-mathieux.png` | `f97f2fab6c7a0522fe1db07d85c66bd19011585552d2bef57fa2a731368bd272` |
| Lesley Smith | `/athletes/lesley-smith.png` | `253dd05873c39a76009e8ef33d9213bcc04b75ad2e41395dd91cd861c968db2e` |
| Laura Zimmermann | `/athletes/laura-zimmermann.png` | `acb4f0f91decdd39f5db010925431377fda866dbca3d852ff1585a8e0c307ccb` |
| Skye Moench | `/athletes/skye-moench.png` | `cd61b2cc250d2ff666b8e1d2c825b96aacbb03652da0cdd4a0a88b0fe7d84fcf` |
| Lisa Norden | `/athletes/lisa-norden.png` | `257a7bf71b29e7f3dc2ecff22119fc53fcd9d71c98f0d169b2a2e927fc6209ff` |
| Diana Castillo Franco | `/athletes/diana-castillo-franco.png` | `3cef76ba4acd874794e5ee2d6c50e612a4e55a8e3664c8234074573369dacad8` |

## Files changed by publication

- `public/athletes/ai-ueda.png`
- `public/athletes/anna-bergsten.png`
- `public/athletes/benjamin-zorgnotti.png`
- `public/athletes/caleb-noble.png`
- `public/athletes/cecilia-perez.png`
- `public/athletes/daniela-ryf.png`
- `public/athletes/danielle-fauteux.png`
- `public/athletes/diana-castillo-franco.png`
- `public/athletes/dylan-magnien.png`
- `public/athletes/florian-angert.png`
- `public/athletes/henri-schoeman.png`
- `public/athletes/jannik-schaufler.png`
- `public/athletes/jeanni-metzler.png`
- `public/athletes/julie-iemmolo.png`
- `public/athletes/justine-mathieux.png`
- `public/athletes/kenji-nener.png`
- `public/athletes/laura-zimmermann.png`
- `public/athletes/lesley-smith.png`
- `public/athletes/lisa-norden.png`
- `public/athletes/matt-burton.png`
- `public/athletes/maximilian-sperl.png`
- `public/athletes/merle-brunnee.png`
- `public/athletes/nicholas-quenet.png`
- `public/athletes/ondrej-kubo.png`
- `public/athletes/pamella-oliveira.png`
- `public/athletes/rasmus-svenningsson.png`
- `public/athletes/skye-moench.png`
- `public/athletes/solenne-billouin.png`
- `public/athletes/thor-bendix-madsen.png`
- `scripts/fixtures/athlete-photo-batch3-manual-review.json`
- `scripts/fixtures/athlete-photo-batch3-production-baseline.json`
- `scripts/fixtures/athlete-photo-batch3-publish-report.md`
- `scripts/fixtures/athlete-photo-batch3-publish-validation.json`
- `scripts/fixtures/athlete-photo-batch3-reviewed-manifest.json`
- `scripts/test-athlete-photos.mjs`
- `src/data/athletes/athletePhotoEvidence.json`
- `src/data/athletes/athletePhotos.generated.ts`

The existing uncommitted Batch 3 preparation changes remain present. Publication additionally changes the photo regression tests, production registry/evidence, adds 29 PNG and the five publication records. No historical Pilot/Batch 2 record was edited.

## Git status

```text
## home-redesign-experiments...origin/home-redesign-experiments
 M scripts/athlete-photo-staging.mjs
 M scripts/select-athlete-photo-batch.mjs
 M scripts/test-athlete-photo-staging.mjs
 M scripts/test-athlete-photos.mjs
 M src/data/athletes/athletePhotoEvidence.json
 M src/data/athletes/athletePhotos.generated.ts
?? athlete-audit.txt
?? public/athletes/ai-ueda.png
?? public/athletes/anna-bergsten.png
?? public/athletes/benjamin-zorgnotti.png
?? public/athletes/caleb-noble.png
?? public/athletes/cecilia-perez.png
?? public/athletes/daniela-ryf.png
?? public/athletes/danielle-fauteux.png
?? public/athletes/diana-castillo-franco.png
?? public/athletes/dylan-magnien.png
?? public/athletes/florian-angert.png
?? public/athletes/henri-schoeman.png
?? public/athletes/jannik-schaufler.png
?? public/athletes/jeanni-metzler.png
?? public/athletes/julie-iemmolo.png
?? public/athletes/justine-mathieux.png
?? public/athletes/kenji-nener.png
?? public/athletes/laura-zimmermann.png
?? public/athletes/lesley-smith.png
?? public/athletes/lisa-norden.png
?? public/athletes/matt-burton.png
?? public/athletes/maximilian-sperl.png
?? public/athletes/merle-brunnee.png
?? public/athletes/nicholas-quenet.png
?? public/athletes/ondrej-kubo.png
?? public/athletes/pamella-oliveira.png
?? public/athletes/rasmus-svenningsson.png
?? public/athletes/skye-moench.png
?? public/athletes/solenne-billouin.png
?? public/athletes/thor-bendix-madsen.png
?? ranking.txt
?? scripts/fixtures/athlete-photo-batch3-batch.json
?? scripts/fixtures/athlete-photo-batch3-discovery.json
?? scripts/fixtures/athlete-photo-batch3-download-candidates.json
?? scripts/fixtures/athlete-photo-batch3-manual-review.json
?? scripts/fixtures/athlete-photo-batch3-production-baseline.json
?? scripts/fixtures/athlete-photo-batch3-publish-report.md
?? scripts/fixtures/athlete-photo-batch3-publish-validation.json
?? scripts/fixtures/athlete-photo-batch3-report.md
?? scripts/fixtures/athlete-photo-batch3-reviewed-manifest.json
?? scripts/fixtures/athlete-photo-batch3-staging-manifest.json
?? scripts/fixtures/athlete-photo-batch3-staging-validation.json
?? sof.json
```

Batch 3 publication is fully validated. Awaiting user review; no commit/push.
