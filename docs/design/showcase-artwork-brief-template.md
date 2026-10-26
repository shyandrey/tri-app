# 300W — Artwork Brief

Template · **OWNER APPROVED — DS-02C, 2026-10-25.** Use [Guidelines v1.0](300w-showcase-artwork-guidelines-v1.0.md) and [technical templates](showcase-templates/index.html). Replace placeholders with evidence; unknown facts remain unresolved.

## Identity and render target

- Race name / existing raceId: `<name / ID>`
- Series / season / revision: `<series / year / vNN>`
- Component: `<Home Race Showcase | Rankings Showcase>`
- Intended use: `<scene and purpose; illustrative or documentary source>`
- Current geometry / approved render rules: `<spec link, fit, focal position, overlays>`
- Viewports / DPR / safe-area profiles: `<matrix; include tablet where relevant>`
- Composition groups: `<portrait / landscape / wide if needed>`

## References and verified race characteristics

| URL or absolute file path | Photographer / rights holder | Permission status | Reference purpose | Verified race/location fact | Owner decision |
|---|---|---|---|---|---|
| `<reference>` | `<known or unknown>` | `<evidence or unresolved>` | `<geography/course/light/etc.>` | `<fact + evidence>` | `<pending/approved + date>` |

- Geographic landmarks / architecture to preserve: `<list + evidence>`
- Discipline / race format: `<swim/bike/run/transition; drafting rules where verified>`
- Camera angle / lighting / time of day: `<direction; distinguish reference fact from artistic choice>`
- Athlete position / anatomy / equipment requirements: `<subject, required full body/wheels/contact points>`
- Branding / exact supplied logo reference: `<source, location, readability requirement>`
- Unverified claims / questions: `<do not fill with guesses>`

## Composition and final crops

| Group | Master / proposed export dimensions | Subject and landmark placement | UI exclusions / safe zones | Final rendered previews |
|---|---|---|---|---|
| Portrait | `<starting sizes + DPR>` | `<critical boxes>` | `<actual text/Back/button rectangles>` | `<absolute paths>` |
| Landscape | `<starting sizes + DPR>` | `<critical boxes>` | `<insets / overlays>` | `<absolute paths>` |
| Tablet/wide, if required | `<sizes>` | `<placement>` | `<tablet exception>` | `<absolute paths>` |

Begin with12 CSS px breathing room and8 CSS px around measured UI, then validate every crop. Home must include longest localized text and rounded corners; Rankings must include Back and embedded branding. Do not force Rankings ratios onto Home. Home independent compositions require a separately authorized migration; this brief does not enable that runtime support.

## Approval checklist

- [ ] References, rights status and race-specific facts reviewed; generated scene identified as illustrative.
- [ ] Sporting anatomy, equipment, wheels, spacing and transition stage plausible.
- [ ] Portrait and landscape final renders preserve subjects, logos and geography; wide case reviewed where needed.
- [ ] UI overlays, safe areas, dynamic text and orientation changes validated.
- [ ] Owner approved final crops, not only the master; preview paths/revision recorded.
- [ ] Optimized WebP compared at actual sizes/DPR; performance exceptions documented.
- [ ] Original and optimized metadata/hashes complete in the [handoff](showcase-codex-handoff-template.md).

Owner decision / date / evidence: `<pending>`.
Remaining changes: `<list or none>`.
Integration/deployment authorization: `<separate scope; not implied by artwork approval>`.
