# REL-PREP-03A — Consolidated candidate publication

Owner authorization: one new dedicated RC branch, minimum justified commit(s), normal push of that branch and one PR targeting Preview. **No merge or deployment.** Version remains `0.0.0`; this is not the Production release.

## Verified preflight

- Candidate `/private/tmp/300w-rel-prep02-candidate`, initially detached Preview HEAD `4a5f7e313809ab6bcacb907b7e85fae97e5a87db`, empty index.
- Fresh remote Preview matches exactly; development `c649ad4d08782e006831094e2f83cf7a446b0e9b`, main `23c5e52e8c0ccec1dea29cd94d6185568ec4543a` unchanged. Dedicated `release/rel-prep-03a-v1-rc` absent remotely before creation.
- All 294 existing changed/new candidate paths match the combined REL-PREP-02 and REL-PREP-02A reviewed hash manifests, including each manifest itself as an explicit publication path. No unknown incoming paths or hash discrepancies.
- Four active Preview workflow/deploy/smoke/safety files remain byte-identical to Preview. Only `preview-ci.yml` exists in the candidate workflow tree. GitHub's other registered qualification workflows are absent from this branch.
- PR #11 remains OPEN at `3aef8cde2db3b09f6b1088496952c0729ff79a22`; all four biography files are already preserved byte-for-byte. Its README is archived in REL-PREP-02 evidence. Recommend separately authorized closure as superseded after RC review; do not close now.

## Commit and inventory strategy

The current owner instruction supersedes the earlier proposed merge-commit sequence: create **one snapshot consolidation commit directly on verified Preview**, preserving all five Preview-specific ancestors. No merge/rebase or history rewrite. The eleven local reconciliation commits are provenance sources, not new ancestors of this snapshot; their original branch/history remain untouched. The commit retains their approved final file contents and full research/audit records.

Source content: reconciliation `b3f7f49e24173da117a75bf96d656c5af41db10f`, its reviewed REL-PREP-01 freeze documents, REL-PREP-02 Preview safeguard consolidation and REL-PREP-02A three corrected browser tests. Duplicate remote Høgenhaug sentence correction is already included with the additional owner-approved introduction correction, both in source Markdown and runtime ID35.

[Explicit publication file inventory](rel-prep03a-files.tsv) pins each changed/new path and SHA-256. Its own path is included explicitly but its hash is omitted to avoid self-reference. The reviewed durable report screenshots, measurement JSON, historical failure evidence and research records are included; disposable `/private/tmp` browser profiles/log trees, private backups, caches, build outputs, credentials and original dirty-worktree artifacts are excluded. No new content, generated catalog or manual-deployment experiment is imported.

## Verification and limitations

Prior exact candidate results: fast gate 18/18; full browser gate 14/14; seven Preview browser acceptance suites PASS; biography/localization integrity 12/12; Preview safety/content combined 88/88; portable photo/Rankings route 26/26. Original failures and the first unexplained image-readiness timeout remain in REL-PREP-02A. Do not represent every historical attempt as PASS.

Publication commit changes build identity metadata, so rebuild/re-run relevant integrity and corrected browser checks against the committed candidate. Record actual post-commit and GitHub CI outcomes in the PR/delivery report; this pre-publication record does not predict PASS. No automatic workflow retry or candidate edits on CI failure.

TECH-01 remains open: no full regeneration (known Emmett Gross ID reassignment). Preserve all 57 exact biographies/paragraphs/stable mappings, 1167 identities, original names/localization, results and ranking formula, photos/artwork and Kristian's four achievements. ATH-04 118 VERIFIED / 29 HOLD remain archived research only, post-release; cutoff through 2023 inclusive subject to editorial approval. No runtime achievements integration.

## CI and deployment boundary

Branch push cannot trigger this Preview-only push workflow. PR to Preview runs Portable and Browser verification on GitHub's PR merge candidate. Deploy job requires `push` AND `refs/heads/preview`, so it must be skipped for this PR regardless of Environment activation. No manual dispatch, activation change, Cloudflare call or deploy command is authorized. Latest read-only GitHub deployment baseline before publication: ID `7464359297`, SHA `4a5f7e3`, environment Preview, 2026-10-31; compare after publication. This metadata is not a fresh Cloudflare configuration audit.

System curl with normal TLS was used for public workflow/deployment GETs because connector endpoints were unavailable, gh CLI absent and Python's CA chain unavailable. No TLS bypass, credential or infrastructure changes.

PR title: **REL-PREP-03A: Consolidated TRI APP v1.0.0 release candidate**. Base `preview`, head `release/rel-prep-03a-v1-rc`. No auto-merge. Separate owner approval is required before any merge: Preview merge may trigger Auto Deploy. REL-PREP-03B should review exact head/diff, actual CI and residual stability risk, and explicitly decide Preview promotion/deployment and 57-profile visual QA. Production deployment, version/tag `v1.0.0`, E2E and announcement remain later separately authorized release operations.


## Staged whitespace findings — preserved, not suppressed

The first complete `git diff --cached --check` returns nonzero for six previously reviewed paths: approved biography Markdown 052/056/057 contains original trailing spaces; `rel-prep02/incorporation.csv` uses original CRLF; the archived `test-ui-cleanup-browser.mjs.diff` contains a context blank line; the REL-PREP-01 plan has an extra EOF blank line. Earlier unstaged checks did not inspect newly added/untracked files. These are formatting findings, not a passing staged whitespace result. Preserve exact approved biography and historical evidence bytes; no trimming, fixture-hash replacement, Git whitespace configuration change or test suppression. Explicit path/hash and staged-content checks still verify the reviewed snapshot. Post-commit clean-tree checks do not retroactively erase these findings.
