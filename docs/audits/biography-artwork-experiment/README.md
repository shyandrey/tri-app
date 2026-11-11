# Experiment evidence

Application baseline `92ad43414adc1792fc6048ac4f8509f5eca17967`; delivery parent `c6b6fee409030a7ec47cada336ca4684ca954758` differs only in documentation.

- `summary.json`, `*-measure.json`, `*-usability.json`, `*-profile-profile.json`: all timing samples; mobile five cold trials per cohort, desktop three. `paired-*.json` are additional AB/BA table checks, kept separate.
- `acceptance.json`: decision thresholds. `bundles.json`: bundle composition/sizes. `candidate-files.json`: accepted A and rejected B path/hash inventories.
- `harness/`: actual measurement and diagnostic helpers. Paths/ports assume isolated exports at `/private/tmp/300w-bio-art-experiment-20261110`; these are reproducibility artifacts, not CI scripts. Chrome CDP and production servers must run as described in the report. `visual-initial.mjs` preserves the failed selector; `visual.mjs` is corrected.
- `bio-candidate.patch` / `art-candidate.patch`: zero-context experimental diffs. Only reproduce in a disposable baseline export with `git apply --unidiff-zero`; never apply B to the accepted runtime. These patches record runtime experiments only; accepted generator, fixtures and test adaptations are delivered as normal repository files. Binary artwork is supplied separately. The B patch includes its new identity module.
- `*-build.txt`, `art-release-gate.txt`, `*-targeted-tests.txt`, `invariants.txt`, `checks/`: actual checks. `browser-results.json` intentionally retains the first auxiliary visual-harness failure; `visual-corrected-results.json` records its corrected run. No performance sample was retried.
- `visual.json`: currentSrc, decoded dimensions, actual request format/bytes and fallback observations. `screenshots/`: 24 before/after review copies resized to CSS width and encoded WebP q90; not pixel-exact evidence. Full-resolution original PNGs are preserved under `/private/tmp/300w-bio-art-experiment-20261110/visual-corrected/`. `images/` and `gallery.html` preserve actual candidate encodings for direct visual comparison.
- `image-variants.json`: excluded historical PNG provenance; these visually different sources were not used. `image-variants-current.json`: actual approved WebP source and derivative measurements.

Commands actually run included production builds for all candidates; `npm run check:release` in the matching isolated Git worktree; B lint; `node --test --test-concurrency=1 scripts/test-approved-biographies.mjs scripts/test-rankings-route.mjs scripts/test-sports-loader.mjs scripts/test-image-delivery.mjs` for B/A; and five existing browser suites through fresh profiles (see `harness/browser-checks.py`). Final derivative regeneration used `node scripts/generate-rankings-transition-variants.mjs`, followed by fixture SHA checks.

No production, CDN, physical-device, full-suite or WebP-only five-run timing result is implied.
