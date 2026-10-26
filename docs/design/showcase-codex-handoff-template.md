# 300W — Showcase Codex Handoff

Template · **OWNER APPROVED — DS-02C, 2026-10-25.** Follow [Guidelines v1.0](300w-showcase-artwork-guidelines-v1.0.md). Placeholders are not production metadata. Complete one record per composition/export; use [JSON skeleton](showcase-templates/asset-delivery-template.json) where helpful.

## 1. Approved artwork

- Race name / existing raceId: `<name / ID>`
- Series / season: `<series / year>`
- Showcase component / scene key: `<Home or Rankings / key>`
- Orientation/composition / revision: `<portrait | landscape | wide / vNN>`
- Owner approval status / date / evidence: `<pending or actual decision>`
- Final rendered crop preview paths and approved viewport set: `<absolute filenames + sizes/DPR/insets>`
- Optimized rendition approval evidence: `<comparison result and owner decision>`
- Reference provenance: `<URLs or absolute files; holder; permission evidence or unresolved; reference purpose>`
- Content type: `<illustrative generation | documentary source with verified provenance>`

## 2. Filesystem paths and technical metadata

All filenames must be absolute, including originals, exports, manifest and previews. Do not supply only `~`, relative paths or zip names. Paths below are placeholders, not claimed files.

| Property | Original / master | Optimized delivery |
|---|---|---|
| Full absolute filename | `<absolute path>` | `<absolute path>` |
| Actual format | `<format>` | `<WebP>` |
| Encoded width × height | `<pixels>` | `<pixels>` |
| Aspect ratio | `<width/height>` | `<width/height>` |
| Exact byte size | `<measured>` | `<measured>` |
| SHA-256 | `<computed from file>` | `<computed from file>` |

- Encoder/version/settings: `<record>`
- Manifest absolute filename: `<path>`
- Previous revision archive / rollback file: `<approved durable location; preserve bytes>`
- Source and optimized approval hashes: `<actual approved hashes>`
- Any missing metadata or unresolved permissions: `<list; do not invent values>`

## 3. Integration instructions

- Separately authorized execution scope: `<documentation | local implementation | other explicit scope>`
- Existing active mapping file/key: `<repository path and key>`
- Intended runtime asset URL / resolution variants: `<paths; additional to absolute filesystem paths>`
- Exact approved replacement: `<old reference → new reference>`
- Preserve: `<other assets/mappings, original bytes, data, navigation>`
- Render contract: `<actual container formulas, fit, focal point, ratio, tablet exception>`
- Critical subject/logo/landmark boxes and UI exclusions: `<coordinates and units or evidence file>`
- Home support dependency: `<current width-only srcset or separately authorized migration>`

Codex must verify actual format/dimensions/hash before integration. **No regeneration, artistic recrop or substitution without separate authorization.** Do not silently resize the UI to make a scene fit. STOP on missing files, material metadata mismatch, unresolved crop or approval mismatch; report the discrepancy.

## 4. Performance requirements

- Scene-specific byte budget / justified exception: `<visible, adjacent, active-window>`
- Responsive selection / DPR targets: `<selected variant policy>`
- Cold/warm baseline and test conditions: `<browser, network, cache, DPR>`
- Required adjacent decode availability: `<swipe checks>`
- Cache/versioning expectations: `<do not assume stable public URLs immutable>`

Verify no simultaneous inactive-orientation downloads, duplicate image bodies, blank adjacent frames, image embedding in JS or unintended image-induced layout shift. Report image payload and JS/CSS sizes separately; PERF-01 chunk warning remains a separate issue.

## 5. Regression and acceptance

- [ ] Decode, metadata, hashes and manifest verified; originals/previous revision preserved.
- [ ] Final crops match approved renders at320×700,375×812,390×844,440×956,667×375,844×390,956×440,1200×1600; both themes and agreed DPR/insets.
- [ ] Subjects, equipment/wheels, logos, landmarks, text/Back/open buttons and tablet behavior reviewed.
- [ ] Touch/mouse/keyboard, vertical scroll, interrupted/rapid swipe, indicators, season persistence and profile/navigation/Feedback links tested as applicable.
- [ ] Responsive image selection, cold/warm transfer, cache reuse, adjacent decode and layout stability recorded.
- [ ] Relevant tests/build/release gate and diff checks run for implementation; record actual commands/results, not inherited PASS claims.
- [ ] Physical iPhone Safari/Telegram review recorded separately from emulation where required.
- [ ] Owner acceptance of final integrated render recorded; automated tests do not replace it.

## 6. Execution restrictions and report

Default: local only; no commit/push/deployment, version bump, D1 writes/migrations, secrets/Telegram/Cloudflare changes or dependency installation. Preserve unrelated modified/untracked files and evidence archives. Any broader permission must be explicit in the execution task. Artwork approval alone does not authorize code, Preview or Production changes.

Report exact modified files, verified asset metadata, rendered previews, executed checks, performance comparison and remaining limitations. STOP for owner review after the authorized work.
