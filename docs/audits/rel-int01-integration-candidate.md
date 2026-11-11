# REL-INT-01 — Isolated pre-release technical candidate

Baseline: Preview `8e4c303093669d325784e41f3760f81c515f0315`, freshly checked against GitHub. Candidate: `/private/tmp/300w-rel-int01-candidate`, local branch `integration/rel-int01`. No commit/push/PR/merge/deployment authorized or performed. Index remains empty.

## A. Qualified smoke harness

Exactly three files copied byte-for-byte from qualification commit `56f1086c4d5d42952c80a8d39daac822d3b8cfa4`:
- `scripts/smoke-preview-ci.mjs`
- `scripts/preview-browser-readiness.mjs`
- `scripts/test-preview-browser-readiness.mjs`

[Linux qualification run 43084531381](https://github.com/shyandrey/tri-app/actions/runs/43084531381): 100/100 tests, artifact integrity and full read-only smoke PASS. Keep the documented limitation: this run reached readiness in ~1.26s; it does not prove that the 15s window alone cured all startup variability. Bounded polling, failure checks, timestamps/stderr, process cleanup and original SHA/API/browser assertions remain exactly qualified.

Explicitly excluded `.github/workflows/rel-qa02-smoke-qualification.yml`. Existing Preview workflow, deploy runner, artifact verifier and Wrangler config remain byte-identical to baseline. No new CI jobs or activation changes.

## B. Approved Moscow race-date boundary

Confirmed discrepancy: Home's shared Home/Showcase list used `dateISO > getMoscowTodayISO()`, removing events at the start of their day. Calendar already uses today-inclusive upcoming / strictly earlier finished.

Minimal runtime correction: `src/App.tsx`, change that single comparison to `>=`. Preserve grouping, ordering, Home limit 3 and Showcase limit 5, Moscow date formatter, data and navigation. Grouped events already use the last constituent date; this behavior is unchanged. No Calendar runtime change needed.

`scripts/test-race-date-boundary.mjs` renders the real Home screen, Showcase and Calendar with a test-only AppScreen export. No production exports or mocked component implementations. Actual Kona edition `ironman-world-championship-kona-2026` is checked at five UTC instants corresponding to before/start/middle/end/after its Moscow event day. Exact presence on Home and Showcase plus upcoming/finished Calendar classification and unchanged race data are asserted. Ordinary `npm run metadata` (or build) is a fresh-copy prerequisite for App imports, not catalog regeneration.

Register this test within the existing Calendar check in `scripts/release-policy.mjs`; check count remains 18 and no new workflow/job is introduced. No tests disabled or assertions weakened.

Date selection is recomputed on rendering/navigation/reload as before. This change does not introduce an automatic midnight timer for a tab left idle across midnight.

## Scope and evidence

ATH-03B is excluded. No biography research/edit/integration, athlete IDs, sports records, artworks or profile data changed. All existing 57 biographies remain the baseline files. No full catalog regeneration.

Local targeted tests: 111/111 PASS (five date boundaries, six Calendar regressions, 100 harness/pipeline checks). Date-boundary suite also PASS with host `TZ=America/Los_Angeles`. Initial fresh-copy test attempt failed on missing ignored build metadata; original log retained; normal metadata generation resolved it. No app/data change was made to address that setup prerequisite.

Final build/lint/release results recorded below after completion. Evidence logs: `/private/tmp/rel-int01-targeted.log`, `/private/tmp/rel-int01-targeted-final.log`, `/private/tmp/rel-int01-date-la.log`, `/private/tmp/rel-int01-release-final.log`. No new live browser/Linux qualification or deployment performed in this task; qualified harness evidence reused.

Reviewable file inventory: three harness/test files above; `src/App.tsx`; new date-boundary test; `scripts/release-policy.mjs`; this report; Project Board. Original dirty development, reconciliation and previous qualification copies preserved. Owner review required before any publication; Preview merge can activate existing Auto Deploy and is not authorized here.

## Final local result

Fast release gate 18/18 PASS, including production build, full lint, Calendar with the new boundary tests, athlete/results audits, ranking/navigation and release-runner checks. Known bundle-size warning remains; no warning suppression. `git diff --check` PASS; index empty. No standalone browser suite was rerun for this one-comparison date change; rendering boundaries and prior qualified harness Linux evidence are explicitly distinguished above. Candidate remains uncommitted for owner review.
