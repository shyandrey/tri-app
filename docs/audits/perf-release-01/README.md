# PERF-RELEASE-01 measurement evidence

Application source `91e31f78c7a068d0138447aee528601768112352`; before-biographies source `00a0488aa9b7c5af0719fcf50a87d9d72f9b681c`. See [audit](../final-image-bundle-performance-audit.md) for conclusions and limits.

- `environment.json`: network/device profile, dependency lock hash, browser/tool versions.
- `image-inventory.csv`: all 747 tracked asset/documentation images, decoded dimensions and formats, content hashes, production emission and source roles. No deletion decisions inferred from not being observed.
- `bundles.json`: complete raw/gzip/Brotli bundle sizes, emitted imports and biography-prefix location.
- `before/after-measure.json`: five mobile + three desktop passive samples per build, CDP request events, resource sizes, timing, LCP/CLS and metrics.
- `before/after-usability.json`: five real gender-switch trials per build; separate from passive LCP.
- `before/after-profile-profile.json`: five immediate + five delayed profile transitions per build; request evidence is not cleared at click.
- `summary.json`: medians/ranges/counts for these cohorts.
- `browser.json`, `network-summary.json`: 24 six-route cold/warm observations; initial request priority, response MIME, cache source, errors, transferred bytes and rendered image dimensions. Actual file formats are resolved through production asset hashes, not extensions alone. CDP completion bytes include response headers. Resource timing encoded body sizes are separate.
- Build logs and targeted-test log: actual commands/results, no deployment.

`harness/` contains the executed local measurement scripts and orchestration. Their paths explicitly target `/private/tmp/300w-final-perf-20261110` and the authorized isolated worktree; ports are localhost 5490/current, 5491/baseline and 9491/Chrome CDP. Do not run against a live domain. Build both trees before starting the server; do not rebuild while collecting. The baseline was exported with `git archive 00a0488...` and reused existing dependencies without installation. It has no Git metadata and embeds `commit: unknown`; this is disclosed rather than silently treating generated metadata as identical.

`run.py` uses a fresh Chrome process/profile per cohort, cold-cache/storage reset per sample and `caffeinate` outside the runner. `run-network.py` waits for all six main cohorts to pass before starting network collection; no overlapping browser workloads. The 14-second route window keeps Home auto-rotation. These are sampled route inventories, not exhaustive route/scene/user coverage or Lighthouse/field scores. The server returns 503 for `/api/*`; Home's `/api/news` uses its existing seed fallback and is not a live API qualification.

Screenshots and Chrome diagnostic logs remain local in `/private/tmp/300w-final-perf-20261110/`. They are supplementary, not required to interpret the committed numeric evidence. No dependencies, application files, images, sports data or test contracts were changed by this audit.

Build logs are stored as `.txt`; trailing terminal whitespace is trimmed for `git diff --check`. Unmodified raw `.log` files remain in the local evidence directory. Numeric measurements are unchanged.
