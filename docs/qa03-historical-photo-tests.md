# QA-03 — Historical Photo Test Failures Investigation

2026-10-26 · P1 / pre-release · **Investigation Complete / Awaiting Owner Review**.

## Conclusion

All six reported failures reproduce with identical assertions on the current working tree and isolated historical commit `c8f52e02a75e0b413dddbfee77f477232c5301d3`. They are not GIT-01 regressions. Their immediate causes are three stale snapshot assumptions: catalog size, historical photo-baseline completeness, and preservation of a deliberately rejected Franzi Hofmann photo. These are verified test-contract conflicts; the suite itself is not obsolete and its identity/publication safeguards must remain.

No current photo-loading or new identity-mapping defect was found in the tested scope. The two batch-selection tests stop before ranking replay, so their failure does not prove the ranking replay would otherwise match. Clean-checkout staging dependencies and macOS decoding are additional test-infrastructure limitations. No test/runtime/data correction was applied.

## Environment, reproduction and evidence

Current branch `home-redesign-experiments`, HEAD `8afd925a2484bb2a4f6b066bd57b32c029efb6a9`, empty index. Existing local Home/More and unfinished Athlete Profile changes were retained. Historical source was extracted with `git archive` into `/tmp/300w-qa03/baseline`; no primary branch switch. Both runs used the existing Node 24.19.0/macOS toolchain and installed dependencies through a symlink; this is a same-environment comparison, not a fresh Linux installation.

Command, unchanged in both checkouts:

`node --test --test-concurrency=1 scripts/test-athlete-photos.mjs`

| Source | Tests | PASS | FAIL |
| --- | ---: | ---: | ---: |
| Current working tree | 33 | 27 | 6 |
| Historical c8f52e02 | 33 | 27 | 6 |

The file imports `test-athlete-photo-staging.mjs`, so its 13 synthetic staging/publication tests execute as part of these 33 and all pass. Requests in these tests use injected mock responses; no live PTO fetch was needed. Temporary synthetic roots are created and cleaned by the existing tests, without publishing to the real registry.

Evidence directory: `/tmp/300w-qa03/`. Logs: `current-photos.log`, `baseline-photos.log`, `relevant.log`, `athlete-audit.json`, `inspection.log`, `baseline-inspection.log`, `browser.json`. Read-only diagnostic scripts and complete row/hash results are retained there. The earlier full-suite **285 PASS / 6 FAIL** is historical context; this investigation reran the targeted 33, not the full 291.

## Six exact failures

All assertions are in [test-athlete-photos.mjs](../scripts/test-athlete-photos.mjs). Line numbers refer to the inspected unchanged file.

| Test (exact title) | Failing assertion/location | Actual vs expected | Verified cause |
| --- | --- | --- | --- |
| runtime exact identities include apostrophes, diacritics, hyphens, composite names and every catalog type | line 32: `assert.equal(runtime.athletes.length, 1161)` | 1167 vs 1161 | Six legitimate generated profiles were added after the photo fixture snapshot. The initial count prevents subsequent identity assertions from executing in this test. |
| published pilot preserves baseline photos and binds all 16 runtime images to manually reviewed bytes | line 230: `assert.equal(runtime.athletes.filter(a => a.image).length, 222)` | 221 vs 222 | Franzi 172's known incorrect image is suppressed. Registry count is still 222; runtime photo count is deliberately different. |
| Batch 2 selection replays production ranking at saved asOf and isolates 50 missing-photo identities | test line 254 calls selector; selector line 33 requires every current athlete ID in historical `runtimeImages` | `Incomplete photo baseline`, false vs true | Fixture covers 1161 IDs; six current IDs are absent. Failure occurs before ranking comparison. |
| published Batch 2 preserves all 165 photos and binds exactly 28 runtime portraits to user-reviewed bytes | line 285: old runtime image preservation loop | `undefined` vs `/athletes/franzi-hofmann.png` | Loop incorrectly demands preservation of Franzi's rejected association. Original file/evidence preservation assertions before it pass. |
| Batch 3 selection replays 50 per gender, excludes previous batches, and stages only HIGH without approval | test line 301 calls selector; same completeness assertion | `Incomplete photo baseline`, false vs true | Same six missing IDs; saved `asOf` alone does not freeze catalog/results/ranking inputs. |
| published Batch 3 preserves all 193 photos and binds exactly 29 runtime portraits to user-reviewed bytes | line 326: old runtime image preservation loop | `undefined` vs `/athletes/franzi-hofmann.png` | Same deliberate Franzi correction, not loss of the 29 published portraits. |

The pilot's following line 231 is also stale: expected 939 profiles without an image, actual **946** (1167 − 221). This was established separately; it was not reached in the failing test and is not a seventh reported failing test.

## Catalog history and baseline completeness

Commit `71523cf33d1c4c942415c9148d8966ca6601e3f4` (2026-09-27, “Add Nice and French Riviera 2026 results”) appended the following profiles in [generated catalog](../src/data/athletes/resultAthletes.generated.ts):

| ID | Name |
| --- | --- |
| 20010 | Emmanuel Lejeune |
| 20011 | Enzo Krauss |
| 20012 | Giovanna Alves Opipari |
| 20013 | Matheus Menezes |
| 20014 | Yago Rodrigues Santos Alves |
| 20015 | Yoann Colin |

They are exactly the IDs absent from both Batch 2 and Batch 3 `production-baseline.json` runtime image lists. They are present in c8f52e02 as well as current. Missing photos for these generated athletes are normal coverage, not an identity or catalog issue. No IDs were inferred, created or merged in this investigation.

[select-athlete-photo-batch.mjs](../scripts/select-athlete-photo-batch.mjs) uses live catalog/results/ranking with a historical photo snapshot and saved date. Its completeness guard correctly prevents silently assuming unknown historical photo state. Do not simply remove the guard or append guessed historical states to satisfy it. For true historical selection replay, use a versioned complete set of historical inputs; test current selection separately. Exact remaining ranking/order deltas after such separation still require the authorized maintenance task.

## Franzi: intentional safety behavior

Commit `dc227a1111156e7276aeb064c17cb069a353ef66` (2026-10-12, “Fix Franzi Hofmann photo attribution”) introduced [photoReview.ts](../src/data/athletes/photoReview.ts) and [dedicated regression tests](../scripts/test-athlete-photo-review.mjs). It rejects only `(172, /athletes/franzi-hofmann.png)`, recorded as a Sailfish sponsor logo rather than an athlete portrait. A future different verified photo path is not suppressed. This investigation relies on the committed review evidence; no new live source verification or identity claim was made.

The registry/file is retained for audit and regeneration protection, but catalog resolution yields no image and the UI shows **FH**. Restoring the old association merely to make preservation tests pass would reintroduce the known attribution defect. Existing dedicated rejection and SSR placeholder tests pass. Browser screenshot `profile-172.png` confirms the placeholder.

## Independent file, identity and provenance checks

Called existing read-only `auditPhotoFiles` from [photo core](../scripts/athlete-photo-core.mjs), using [runtime loader](../scripts/athlete-photo-runtime.mjs):

- 222 registry entries, 222 files, **0 issues**: no missing/orphan file, duplicate path/hash, invalid path or extension leftovers under this audit's rules.
- 1167 profiles, **221 runtime photos**, 946 without photos.
- All **73** published batch entries (16 pilot + 28 Batch 2 + 29 Batch 3) match existing athlete ID/name/gender, registry/runtime path, approved review and published image SHA-256. **0 failures** in the independent checks. This verifies continuity with approved evidence; it is not fresh facial identification of all athletes.
- The only old runtime-image preservation mismatch in each later baseline is Franzi 172.
- Kristian Blummenfelt's documented dual-source case remains: bundled runtime photo, separate registry PNG. No change proposed.
- Current/baseline photo registry, catalog, results, race-edition/ranking implementation and inspected photo tests have no Git diff between c8f52e02 and HEAD. Current/baseline runtime registry, result-linkage, ranking order and score digests match at the same diagnostic date, 2026-10-26T12:00:00Z.

`node scripts/audit-athletes.mjs --json` completed successfully: no issues or country conflicts. Missing photos remain informational coverage; no bulk enrichment is justified by this audit.

## Hidden infrastructure dependencies

All 73 reviewed staging files are available with matching bytes in the current Mac workspace. In the clean c8f52e02 Git archive, **all 73 are absent** because `.athlete-photo-staging` is not committed. Tests for Batch 2/3 publication explicitly read `localStagingPath`; Batch 3 staging validation also reads those paths. These branches are currently masked by earlier failures. Their absent archive bytes must not be reported as missing production photo assets.

Recommended separation: portable regression tests validate committed published bytes and review evidence; synthetic staging tests create their own fixtures; optional historical archival verification requires a declared immutable archive input and reports unavailable evidence explicitly. Preserve old manifests and source files. Do not commit all staging originals or silently download them in ordinary CI.

[Decoder implementation](../scripts/athlete-photo-staging.mjs) invokes `xcrun swiftc`; its Swift source imports ImageIO/CoreGraphics. All synthetic tests passed on this Mac. Linux CI portability is not verified and cannot be assumed. Decide between a qualified macOS job for native-decoder tests and separately approved portable test infrastructure. This is not the immediate cause of the six failures reproduced here.

## Browser verification and user-facing impact

Built the actual current working tree, then served it locally with Vite preview. Chrome 155, 390×844, local assets only. No deployed environment was changed or tested.

- **81 profile routes PASS:** 73 historical published athletes, Kristian, Franzi and the six added IDs.
- Every applicable portrait loaded with positive natural dimensions; Franzi and six added profiles displayed the expected placeholder.
- **221/221 runtime photo URLs decoded**; zero runtime exceptions in the diagnostic run.
- Representative screenshots: Harry Palmer (`profile-10185.png`), Aaron Royle (`profile-10002.png`), Jannik Schaufler (`profile-20001.png`), Franzi (`profile-172.png`). Harry, Jannik and Franzi captures visually inspected.

The initial diagnostic attempted to fetch Kristian's SSR `/src/assets/...` source URL from the production build and failed one decode. That is a diagnostic URL-resolution error: the production build uses an emitted asset URL. The corrected diagnostic reads actual profile `currentSrc`; Kristian renders successfully. Initial harness is preserved as `browser-initial.mjs`; no runtime fix was needed.

No current broken portrait, wrong new ID linkage, or network-dependent loading regression was established. Browser checks certify loading/rendering, not an independent biometric identity audit. Historical manual approvals remain the identity authority. Existing unfinished Athlete Profile styling was visible but neither altered nor approved by this task.

## Verification summary

| Check actually executed | Result |
| --- | --- |
| Targeted photo suite, current | 27 PASS / 6 FAIL (assertions listed above) |
| Same suite, c8f52e02 archive | 27 PASS / same 6 FAIL |
| Photo-review + PTO registry + athlete catalog presentation tests | 12/12 PASS |
| Existing file audit | 222 entries/files, 0 issues |
| Existing athlete audit | PASS, no issues/conflicts |
| Independent 73-entry continuity check | PASS |
| Local profile/image browser diagnostics | 81 routes / 221 decoded images PASS |
| Production build used for local browser | PASS; existing sports chunk warning |
| `git diff --check` and documentation links | PASS |

Related test command: `node --test --test-concurrency=1 scripts/test-athlete-photo-review.mjs scripts/test-pto-profile-registry.mjs scripts/test-athlete-catalog-presentation.mjs`. Runs used permitted local execution to avoid the known sandbox HMR bind restriction. No full release gate/full unit suite or remote fetching was necessary to establish these causes.

## Release assessment and minimal authorized-next-step proposal

**No new runtime release blocker established by these six failures.** Franzi's safety override must remain. However, the full photo suite still genuinely fails and is not suitable as an unattended CI gate in its present form. Diagnostics are complete; maintenance is not. Owner acceptance is required before changing gate classification. Do not label the suite PASS or remove it wholesale.

Propose a separate QA-03B test-maintenance authorization:

1. In `scripts/test-athlete-photos.mjs`, separate live identity integrity from historical totals; retain exact cohort identities, duplicate/unknown-ID rejection and provenance/hash assertions. Update approved current coverage expectations with explicit catalog additions and photo-review policy, not an arbitrary relaxed inequality.
2. Apply the existing review policy when comparing historical runtime photo preservation; explicitly assert Franzi is rejected and every other old mapping remains intact. Preserve original snapshots unchanged.
3. Isolate historical Batch 2/3 selection replay from current data using complete reproducible historical catalog/results/ranking inputs, or label it a separate archival replay harness and add deterministic synthetic selector fixtures. Do not weaken the selector's completeness check. Reassess the current algorithm independently.
4. Remove implicit dependency on ignored Mac staging paths from portable published-byte tests; retain separate explicit archive integrity checks and synthetic staging/publication safety tests.
5. Qualify decoder execution on the intended CI platform. Re-run targeted and complete units, profile/browser checks and release gate; report any additional assertions exposed after the six early failures are resolved.

Likely scope: the existing photo test file, explicitly versioned test fixtures/archival harness, QA-03 documentation and—only if separately approved—CI test grouping. No athlete registry, IDs, photo mappings, image files or production ranking correction is recommended. DEVOPS-03B auto-enablement should wait for this gate ownership/portability decision. No modifications from this plan were implemented.

## Preservation

Only this report and the QA-03 Project Board entry were added/updated. Pre-task SHA-256 inventory verifies all other tracked/untracked repository files unchanged, including unfinished Profile, approved Home relocation, datasets, artwork and earlier documentation. Index empty; branch/HEAD unchanged. No commit, push, deployment, credentials, version, D1 or Cloudflare modifications. Temporary diagnostic artifacts are not a durable backup and do not replace existing evidence archives.

## QA-03B — Photo test contract modernization

2026-10-26 · **Implemented / Awaiting Owner Review**. This section supersedes the six-failure maintenance status above; the original investigation is retained as historical evidence.

### Changes and evidence authority

- [Portable photo suite](../scripts/test-athlete-photos.mjs): replaces the total-only catalog assertion with sorted exact `{id, nameEn, gender, countryCode}` equality and ID uniqueness. Negative checks prove duplicate, missing, extra and substituted identities fail. Exact photo-bearing and photo-less ID sets replace stale aggregate coverage numbers. Existing signature, hash, source URL, human approval, file-audit and synthetic discovery safety assertions remain.
- New [versioned test contract](../scripts/fixtures/athlete-photo-catalog-approved.json): extracted from the isolated owner-approved `c8f52e02` catalog, not regenerated from the edited working tree. Records source commit, six-addition commit `71523cf`, rejection commit `dc227a1`, and full replay commits. It pins 1167 identities and their known photo states; no production registry is modified. Updating this fixture later requires review of an intentional catalog change, not automatic test regeneration.
- Existing historical production-baseline/review manifests remain byte-identical. The new companion metadata explicitly distinguishes `APPROVED_PUBLISHED`, `EXISTING_RUNTIME_PHOTO` (legacy runtime mapping, not a new manual approval), `REJECTED`, and `NO_APPROVED_PHOTO`. Historical baseline ID set plus the six documented additions must equal the current approved identity set. No unknown historical photo state is fabricated.
- New [local archive suite](../scripts/test-athlete-photo-archive.mjs): retains exact historical selector replay against full pinned source trees: Batch 2 `16b8b9d2ea8e17d2afe8f3bdbfec62b12db3d4b5`, Batch 3 `86bf6e15d581a89285c78b3d5cf11299984a6223`. Uses temporary `git archive` extraction, no branch switching or fetch. Confirms archived cohort fixtures match preserved current evidence, then compares exact replay, including historical Russian labels. Also verifies every reviewed staging byte and Batch 3 staging-manifest hash. Missing Git objects or staging files fail explicitly; nothing silently skips or downloads.
- Removed the implicit native-staging import from the portable suite. The native file remains unchanged and runs explicitly once. This removes duplicate execution in the complete unit scan, not coverage.
- [Release policy](../scripts/release-policy.mjs): only the non-gating diagnostic descriptions/commands were corrected; removed the obsolete blanket photo “known FAIL” label and listed the three groups. Required gate membership, exit behavior and assertions are unchanged. The unrelated localization-regeneration label remains a DOC-02 concern.

### Six approved additional identities

These entries were verified against the committed catalog and the `71523cf` addition, and remain normal profiles without an approved photo:

| ID | Name | Gender | Country | Photo state |
| --- | --- | --- | --- | --- |
| 20010 | Emmanuel Lejeune | M | BE | NO_APPROVED_PHOTO |
| 20011 | Enzo Krauss | M | BR | NO_APPROVED_PHOTO |
| 20012 | Giovanna Alves Opipari | W | BR | NO_APPROVED_PHOTO |
| 20013 | Matheus Menezes | M | BR | NO_APPROVED_PHOTO |
| 20014 | Yago Rodrigues Santos Alves | M | BR | NO_APPROVED_PHOTO |
| 20015 | Yoann Colin | M | AU | NO_APPROVED_PHOTO |

No live identity research or inferred nationality was used. The current selector still receives an incomplete historic baseline in a negative test and must throw `Incomplete photo baseline`; its production guard was not weakened. The archival test verifies the historical algorithm/data, not current selector ranking on newly added results; current ranking has its existing independent unit coverage.

### Rejection invariant

The only historical preservation exception is the exact `(172, /athletes/franzi-hofmann.png)` decision pinned to the existing review policy. Tests require no runtime image, no approved published evidence pointing to the rejected path, and no reviewed publication cohort assigning it to Franzi. All other old runtime images remain exact matches. Existing dedicated tests still prove regeneration cannot restore that path, FH renders, and a different future verified path is not categorically blocked. The sponsor file remains preserved for audit; no deletion or mapping change occurred. This is regression protection for current approved state, not a new denylist implementation in the publisher.

### Explicit execution groups

**Portable CI group — no Git history, local staging, Swift or external network required:**

```sh
node --test --test-concurrency=1 scripts/test-athlete-photos.mjs scripts/test-athlete-photo-review.mjs
```

Covers identity set, current photo state, source/approval chain, published bytes/files, rejected images, SSR fallback and mocked discovery. Photo discovery assertions use mock responses; the real live discovery tool remains separately authorized local tooling. Node/npm dependencies and permitted local Vite execution remain prerequisites.

**Local native tools group — isolated synthetic staging/publication, macOS `xcrun swiftc`, ImageIO/CoreGraphics:**

```sh
node --test --test-concurrency=1 scripts/test-athlete-photo-staging.mjs
```

Creates its own temporary staging/production roots, uses mock downloads and does not write real production data. No original staging dependency, but it is not certified portable to Linux.

**Local archival evidence group — full pinned Git history, preserved `.athlete-photo-staging`, Git/tar and installed dependencies:**

```sh
node --test --test-concurrency=1 scripts/test-athlete-photo-archive.mjs
```

No network fallback, no credentials, no global `/Users/...` path embedded in the new test. Paths come from historical manifests relative to the checkout. Shallow checkouts without the pinned objects or workspaces without archived bytes fail clearly. Existing staging files are read only; only newly created temporary replay directories are cleaned.

**Full local photo suite:**

```sh
node --test --test-concurrency=1 scripts/test-athlete-photos.mjs scripts/test-athlete-photo-review.mjs scripts/test-athlete-photo-staging.mjs scripts/test-athlete-photo-archive.mjs
```

Do not label the portable command a full native/archival test run. Each job must report its explicitly selected group and requirements.

### Final verification

Artifacts: `/tmp/300w-qa03b/`. Current complete unit scan enumerated all 33 `scripts/test*.mjs` files importing `node:test`, ran each sequentially and retained per-file output and exact inventory in `full-units/results.json`; none failed or timed out. Other standalone tools and browser scripts are not implicitly called unit tests.

| Check | Result |
| --- | --- |
| Before: unchanged QA-03 targeted photo suite | 27 PASS / 6 FAIL |
| Final full local photo suite (four explicit files) | **41/41 PASS**, no skipped tests |
| Portable group in clean Git archive without staging/history | **25/25 PASS**, no skipped tests |
| Full current node:test scan | **284/284 PASS**, 33 files, 0 failures |
| Athlete/Profile tests | Included PASS: photo review, PTO profile/mapping/registry, catalog/current-athlete and other full-scan suites |
| Existing photo file audit | **222 entries / 222 files / 0 issues** |
| Existing athlete audit | **PASS**, no issues/country conflicts |
| Approved published continuity | **73/73 PASS**, IDs/paths/review hashes retained |
| Local browser | **81 profile routes / 221 decoded runtime photos PASS**, placeholders retained, zero runtime exceptions |
| Production build and lint | **PASS** through final release gate; separate final lint PASS |
| Final release gate | **18/18 PASS** |
| `git diff --check`, documentation links | **PASS** |

Counts are deliberately reconciled: historical full-unit 291 executions included the 13 staging tests twice (directly and through the photo-suite import). Removing that duplicate and adding six tests (three archival, three negative/status/guard) gives **291 − 13 + 6 = 284**. The historical six failures are resolved without discarding the original safety coverage. The full photo group includes existing two photo-review tests as well as the native group once.

Portable checks passed in `/tmp/300w-qa03b/portable`, a fresh Git archive with only the updated test and new contract overlaid, no `.athlete-photo-staging` and no `.git`. This is strong local filesystem-isolation evidence, not a Linux CI execution; dependencies were reused from the installed Mac toolchain. Browser captures and JSON are in the same task artifact directory. Runtime/data source hashes and actual browser image paths are unchanged from QA-03.

### Remaining blockers and DEVOPS-03B recommendation

No photo assertions remain failing on this machine. Recommend adding the explicit portable group as a required DEVOPS-03B check after clean Linux qualification. It is not automatically added to `check:release` in this task. Keep native staging and archival verification visible as separate local/macOS/evidence jobs; do not silently skip them or require private staging evidence in ordinary cloud CI. Decide separately whether to provision a macOS job or authorize portable decoder work. No dependency installation is proposed here.

Known sports chunk warning remains. Historical localization full-regeneration and shared-browser Navigation stability concerns are separate from these photo fixes. DEVOPS-03A credential/packaging/permissions approval is still outstanding; passing photo tests does not authorize automated deployment or certify the entire CI pipeline.

Exact task file scope:

1. `scripts/test-athlete-photos.mjs`
2. `scripts/test-athlete-photo-archive.mjs` (new)
3. `scripts/fixtures/athlete-photo-catalog-approved.json` (new)
4. `scripts/release-policy.mjs` (diagnostic descriptions only)
5. `docs/qa03-historical-photo-tests.md`
6. `docs/PROJECT_BOARD.md`

All existing staging file hashes are unchanged. Unfinished Athlete Profile, HOME-UI-01B, DEVOPS-03A, photo mappings, assets, identities, results/ranking and unrelated local files are preserved. No runtime, version, Git index, commit/push, deployment, D1 or infrastructure changes. Awaiting owner review; not owner-approved by this report.
