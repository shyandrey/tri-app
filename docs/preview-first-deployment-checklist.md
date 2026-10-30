# First controlled Preview Auto Deploy acceptance

Owner authorization: DEVOPS-03B.2C.7C, 2026-10-30. This operational checklist is the sole technical trigger change; it changes no runtime, data, artwork, version or pipeline configuration.

## Verified baseline before activation

- Protected Preview application/pipeline baseline: `f12aae256ca3c518966ebb26462d3b7fafbf539d`.
- Portable and Browser verification passed in [run 40707718841](https://github.com/shyandrey/tri-app/actions/runs/40707718841).
- Environment `preview` permits only branch `preview`. Repository activation must stay absent. Only the Environment activation flag may be enabled by this authorization.
- Read-only Cloudflare baseline: Worker `tri-app-preview`, enabled Custom Domain `preview.300w.app`; expected bindings, eight secret names and cron verified against the qualified pipeline.
- Rollback deployment: `e441f5f7-05d9-41dc-bbf9-594acb29fd82`; version `84653431-5134-4216-813a-2b5bb4c573fc`, traffic 100%.
- Production observation only: deployment `80ddc247-1881-4a55-a7a3-08a38415d588`; version `33a50c35-9dda-4234-afdc-2d05c918d846`. Production is never a publication target.

## Required acceptance record

1. Record this PR's resulting Preview merge SHA and push CI run. The merged SHA, not the historical baseline above, must match the artifact manifest and published health response.
2. Require Portable and all seven Browser suites before deployment. Reuse their exact artifact ID and trusted manifest digest; no independent rebuild.
3. Scoped Environment token must pass live account/Worker, settings, secret-name, cron, rollback and domain checks before Wrangler. A successful local read-only OAuth baseline is not proof of the scoped token's permissions.
4. Record actual Cloudflare deployment/version IDs, SHA and read-only smoke results for Home, Calendar, Rankings, Athlete Profile, Race Detail, More, navigation and responsive artwork.
5. Compare Preview configuration before/after. Confirm Production deployment/version and configuration are unchanged. No D1 migration or data writes are authorized.
6. If upload or smoke fails, retain logs, establish whether a version became active, disable the Environment activation flag and stop. No automatic retry, permission expansion or rollback. The rollback baseline above is a recommendation reference, not authorization to execute rollback.
7. Stop for owner review after the first publication. Physical iPhone QA remains separate from browser smoke.

Local evidence for this attempt: `/tmp/300w-devops03b2c7c/`. Do not put credential values in this document, logs or Git.
