# CAL-04C — Git publication preflight

2026-11-22 · **GO for separately authorized Git publication; no authorization implied.** No upstream drift or unresolved merge conflict identified. This task changed only this document and Project Board; no builds/tests/browser runs, publication or deployment.

## Repository and authoritative remote

| Item | Verified value |
| --- | --- |
| Candidate | `/private/tmp/300w-cal02-candidate` |
| Branch | `calendar/cal02-2027` |
| HEAD / base | `b97aad29e0468b6ea4a98449ebb7d97e9de12239` |
| GitHub remote | `https://github.com/shyandrey/tri-app.git` |
| Live `refs/heads/preview` | `b97aad29e0468b6ea4a98449ebb7d97e9de12239` |
| Divergence HEAD…remote tip |0 ahead /0 behind |
| Index |Empty; all candidate changes unstaged |
| Master source branch |`data/cal02-2027-master` at `aabb2ea22c82d1711be50effcb92431e6973acc8` |
| Approved master blob |`5a42e87cc1c6855c3c7d655e9a077769ee3c4b1b` |

`git ls-remote` read authoritative GitHub tips rather than relying on cached origin/preview. The first sandbox request failed DNS; permitted network read succeeded. Since remote tip equals locally available HEAD, fetching objects/updating refs is unnecessary. No candidate branch/index/files were changed by Git. The approved master commit is not fetched into this independent local object store; this alone is not evidence of corruption. The GitHub connector retrieved the file from the exact immutable commit; `cmp` against the local master succeeded, as did blob hashing. Source: [approved master](https://github.com/shyandrey/tri-app/blob/aabb2ea22c82d1711be50effcb92431e6973acc8/data/calendar/2027-master.json).

## Drift and conflicts

Remote-minus-base file diff is empty. Therefore no files changed on both sides, no intervening behavior/tooling/data/results/version/release-note changes and no reconciliation required **at this observation**. Candidate changes are the reviewed CAL scope, not upstream drift. This is not a claim of future GitHub PR mergeability or branch-protection approval; re-read refs immediately before publication/merge.

If preview advances: preserve this candidate, use a fresh independent publication clone, compare upstream paths with this allowlist, STOP on overlaps/conflicts or unexpected behavior/data/config changes. Do not rebase/reset/merge the dirty candidate or resolve conflicts silently. If unrelated upstream changes can be preserved, propose the exact transfer and relevant validation before proceeding within authorization.

## Candidate invariants — preserved qualification, not rerun

Git/file comparisons and existing CAL-04A/B evidence establish the current scope. CAL-04A final file hashes remain identical except the documented CAL-04B normalizer/type changes and audit/Board updates; two B-only paths are the URL resolver and focused test. No further runtime change in CAL-04C. Prior evidence is explicitly distinguished from newly executed tests:

| Invariant | Evidence/status |
| --- | --- |
|25 races |Approved master unchanged; prior master/runtime comparison16 IM /8 T100 /1 Roth PASS |
|Explicit seasons |`season.config.json`: Preview2027 /Production2026; prior both builds PASS, no date-driven switch |
|Roth |2024–2027 identity/history/profile/Home integration qualified; results79/85/56/0 |
|TRI Ranking |Tier A1.10; formula unchanged versus HEAD; CAL-04A baseline ranking deep equality PASS |
|Official Standings |IRONMAN/T100 only; registry unchanged |
|Athletes/results |1170/4633, prior deep equality; current Git diff on athlete/result registries empty |
|PTO URL guard |CAL-04B18→0; all87 historical URLs preserved; explicit matching review required. Guard source inspected; no new review record |
|Artwork |15 USE APPROVED /10 NEW;4 mapped (Kona/French Riviera/Saudi/Qatar),21 neutral. Mapping hashes unchanged |
|Qatar title |Wrapping fix intact; prior390/1024 and320/375/440 regression evidence retained |
|Version/config/history |1.0.1, package/lock/CHANGELOG/workflows/Wrangler unchanged |

CAL-04A68 targeted tests +two builds +Chrome; CAL-04B7 focused tests +one build passed previously. No tests or builds repeated here, as requested. Source/date/gender/geography gaps and missing artwork remain visible Preview limitations, not invented verified facts. Production default2026 does not hide2027 from explicit calendar selection/search/deep links; no Production publication authorized.

## Exact final publication allowlist

CAL-04A55 +CAL-04B2 +this CAL-04C report1 = **58 files (25 modified,33 new)**. Project Board was already included. Categories are mutually exclusive for inventory; files may implement cross-cutting behavior.

| Category | Count |
| --- | --- |
| Runtime | 13 |
| Tests | 12 |
| Documentation | 21 |
| Calendar data | 6 |
| Artwork mappings | 1 |
| Release tooling | 5 |

| Status | Category | Exact path |
| --- | --- | --- |
| new | Calendar data | `data/calendar/2027-master.json` |
| modified | Documentation | `docs/PROJECT_BOARD.md` |
| new | Documentation | `docs/audits/cal02-2027-mapping.md` |
| new | Documentation | `docs/audits/cal02c-dataset-readiness.md` |
| new | Documentation | `docs/audits/cal03a-season-card-integrity.md` |
| new | Documentation | `docs/audits/cal03b-artwork-inventory.md` |
| new | Documentation | `docs/audits/cal03b2-preview-readiness.md` |
| new | Documentation | `docs/audits/cal04a-release-candidate-qualification.md` |
| new | Documentation | `docs/audits/cal04c-git-publication-preflight.md` |
| modified | Documentation | `docs/deployment-cloudflare.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/README.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/challenge-roth-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-jonkoping-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-leipzig-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-mont-tremblant-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-muscat-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-tours-metropole-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-valencia-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-70-3-world-championship-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/ironman-lanzarote-2027.md` |
| new | Documentation | `docs/design/2027-artwork-briefs/t100-spain-2027.md` |
| modified | Documentation | `docs/scripts.md` |
| modified | Release tooling | `scripts/manual-release-artifact.mjs` |
| modified | Release tooling | `scripts/manual-release.mjs` |
| new | Release tooling | `scripts/release-season.mjs` |
| new | Tests | `scripts/test-cal02-browser.mjs` |
| new | Tests | `scripts/test-cal02.mjs` |
| new | Tests | `scripts/test-cal03a-browser.mjs` |
| new | Tests | `scripts/test-cal03a.mjs` |
| new | Tests | `scripts/test-cal03b2-browser.mjs` |
| new | Tests | `scripts/test-cal03b2.mjs` |
| new | Tests | `scripts/test-cal03c-browser.mjs` |
| new | Tests | `scripts/test-cal04b-pto-urls.mjs` |
| modified | Tests | `scripts/test-calendar.mjs` |
| modified | Tests | `scripts/test-image-delivery.mjs` |
| modified | Tests | `scripts/test-manual-release.mjs` |
| new | Tests | `scripts/test-race-location.mjs` |
| new | Release tooling | `season.config.json` |
| modified | Runtime | `src/App.tsx` |
| modified | Runtime | `src/components/HomeShowcase.css` |
| modified | Runtime | `src/components/HomeShowcase.tsx` |
| modified | Runtime | `src/components/RaceCard.tsx` |
| new | Runtime | `src/config/season.ts` |
| modified | Calendar data | `src/data/archiveIronmanProSeries.ts` |
| modified | Calendar data | `src/data/archiveT100.ts` |
| new | Calendar data | `src/data/calendar2027.ts` |
| modified | Calendar data | `src/data/raceEditions.ts` |
| modified | Calendar data | `src/data/raceEntities.ts` |
| modified | Artwork mappings | `src/data/showcaseImages.ts` |
| modified | Runtime | `src/data/statsPtoRaceUrls.ts` |
| modified | Runtime | `src/pages/CalendarPage.tsx` |
| modified | Runtime | `src/pages/RaceDetailPage.tsx` |
| modified | Runtime | `src/types/Race.ts` |
| modified | Runtime | `src/utils/raceChampionshipGroup.ts` |
| modified | Runtime | `src/utils/raceDate.ts` |
| modified | Runtime | `src/utils/raceGender.ts` |
| new | Runtime | `src/utils/raceLocation.ts` |
| modified | Release tooling | `vite.config.ts` |

All58 paths are the exact proposed staging allowlist. Include the approved master **as one file with its exact bytes**, not a cherry-pick/merge of the master branch. Its source branch may contain unrelated changes; no such changes need transfer. Preserve the source commit URL/blob in audit provenance.

### Exclusions and scan

- Exclude ignored `dist/`, `.generated/`, shared `node_modules` symlink, all browser screenshots/profiles/logs and `/private/tmp` evidence/recovery/deployment packages. No cleanup performed.
- No new binary/image assets, generated athlete/result catalogs, unexpected deletions or symlinks in the allowlist. Artwork is mapping-only plus Markdown briefs, not an asset delivery.
- Pattern scan and scope review found no credential values/private-key blocks/token matches; security tests intentionally contain synthetic credentials and credential-variable names. This is a focused scan, not a guarantee that arbitrary secrets are machine-detectable.
- No machine-local paths in runtime source. Absolute paths in docs/tests identify evidence/default local harness locations; they do not enter runtime URLs. No private evidence contents staged.
- Largest proposed file is existing Project Board (~137KB); no unintended large asset. Local master downloaded for comparison resides outside candidate at `/private/tmp/cal04c-approved-master.json`.

`git diff --check`, empty-index check, CAL-04A/B allowlist comparison, protected-file diff checks and authoritative remote comparison PASS. No repair/maintenance/reset/clean occurred.

## Reproducible publication plan — requires owner authorization

### Gate1: authorization for Git scope

Request explicit authorization for **58-file Commit → Push → PR**, and whether **merge into preview** is included. These can be one bounded owner authorization; no redundant intermediate approval is needed if all checks pass. None is currently granted. Suggested branch `release/cal04-2027-preview`; suggested one coherent commit `feat: prepare explicit 2027 preview season`. One commit keeps the data/model/profile/guards inseparable. No reason for a release tag or version bump.

After authorization only (commands below are a plan, not executed):

```sh
git clone --branch preview --single-branch https://github.com/shyandrey/tri-app.git /private/tmp/300w-cal04-publication
cd /private/tmp/300w-cal04-publication
git rev-parse HEAD
git status --porcelain
git fsck --connectivity-only --no-dangling
git switch -c release/cal04-2027-preview
```

Use a new path, independent clone (no `--shared`, no dirty-worktree reuse). STOP unless HEAD equals the freshly rechecked approved base `b97aad29e0468b6ea4a98449ebb7d97e9de12239`, clone integrity passes, branch is not already occupied and checkout is clean. Recheck remote branch existence before choosing the proposed name; it was not reserved in this preflight.

For a deterministic transfer, export the58 `Exact path` rows above into an external JSON list. Before copying, verify the candidate's changed+untracked set equals that list, no symlink paths, each file SHA256 recorded, and no source changes during transfer. Copy only those relative files byte-for-byte, creating required parent directories; never copy `.git`, ignored content or parent directories wholesale. Compare destination SHA256 to source for every file. Master must also match blob `5a42e87cc1c6855c3c7d655e9a077769ee3c4b1b`. Keep checksum evidence outside both repositories.

Verify destination changed-file set is exactly58, diff against clean preview contains only reviewed changes, protected histories/config unchanged, diff-check passes, and source remained unchanged. Stage explicitly using argument-array `git add -- <58 exact paths>` (no wildcard or `git add .`); verify `git diff --cached --name-only` equals allowlist and inspect complete staged diff. Identical source+baseline means prior qualification can be reused; only necessary checks for changed reconciliation are repeated.

```sh
git commit -m 'feat: prepare explicit 2027 preview season'
git push -u origin release/cal04-2027-preview
```

Create exactly one PR targeting `preview`, suggested title `CAL-04: Explicit 2027 Preview season candidate`. Body:25 races, preserved history/Roth/ranking, explicit season profiles, URL guard, artwork4mapped/21neutral, pending sources and owner-working dates, precise validation, no Production promotion. Use the connector or `gh pr create --base preview --head release/cal04-2027-preview --title ... --body-file <external-review-body>`; no manually dispatched Actions or configuration changes. Read back exact head/base/file list and mergeability. STOP on drift, unexpected CI activation/protection requirements or extra files; do not bypass checks.

### Gate2: merge scope

Merge only if included in owner authorization or separately approved. Use ordinary repository merge-commit workflow, preserving candidate commit, no squash/rebase/admin bypass unless explicitly agreed otherwise. Record PR URL, candidate commit, merge SHA and read back `preview`. A successful merge is **not deployment authorization**.

### Gate3: clean immutable revision/package qualification

After separately authorized clean-revision qualification, create a clean checkout of exact resulting merge SHA, install locked dependencies with Node24.19.0/Wrangler4.142.0, and verify no build metadata/environment overrides. Do not deploy current dirty-tree build output (it carries old base SHA). Prepare once:

```sh
npm run release:prepare -- --sha <EXACT_MERGE_SHA> --env preview --season-profile preview2027 --package <NEW_ABSOLUTE_PACKAGE> --evidence <NEW_ABSOLUTE_EVIDENCE>
```

Verify manifest digest/inventory, source SHA/version1.0.1, Preview Worker identity, `dist/season.json` and manifest/evidence profilepreview2027, no artifact changes after qualification, operational config outside package and artifact-only dry-run. Existing source clean-SHA/digest guards must not be bypassed. This package qualification was NOT performed here; separate authorization is required before operational qualification/actions outside this preflight.

### Gate4: one manual Preview deployment

Require explicit owner deployment approval identifying exactSHA, artifact digest, tri-app-preview/environment, visible limitations, QA scope and rollback candidate. Then fresh live preflight: account/Worker, existing deployment/version/traffic, bindings/vars/secret names/cron, compatible rollback, disabled Auto Deploy and no competing publisher. `release:qualify` is read-only evidence, never authorization. One manual `release:deploy` with exactSHA/digest and `--authorize preview:<SHA>`; then readiness and read-only smoke,390/1024/local seasonal checks and owner Telegram/iPhone QA. No build during upload, automatic retry or rollback. Production untouched.

Production2027 remains a separate Deployment Request/Owner Approval stage after required2026 closure and2027 QA; neither Git merge nor Preview success permits it.

## Recommended next task

**CAL-04D — Authorized Git publication of the58-file candidate**, explicitly stating whether merge is included. Fresh remote/allowlist checks remain mandatory. No technical publication blockers found in CAL-04C; known source/artwork gaps and future package/live qualification remain. Await owner authorization; stop here.
