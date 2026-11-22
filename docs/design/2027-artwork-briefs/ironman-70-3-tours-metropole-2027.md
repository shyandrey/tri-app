# 300W — Artwork Brief: IRONMAN 70.3 Tours Métropole

CAL-03B2 · 2027 · v01 brief only, **NOT artwork approval**. Instantiates the [approved template](../showcase-artwork-brief-template.md). Mandatory [Guidelines v1.0](../300w-showcase-artwork-guidelines-v1.0.md), [technical templates](../showcase-templates/index.html), [validation checklist](../showcase-templates/validation-checklist.md) and [shared feasibility/approval notes](README.md). No image generation/download authorized.

## Identity and render target

- Race name / existing raceId: IRONMAN 70.3 Tours Métropole / `ironman-70-3-tours-metropole`.
- Exact editionId: `ironman-70-3-tours-metropole-2027`; series / season / revision: IRONMAN Pro Series /2027 /v01 proposed.
- Component: Home Race Showcase.
- Intended use: proposed cinematic photorealistic environmental sports artwork. Compact runner within a reference-verified Tours Métropole setting; controlled background detail. A generated scene, if separately commissioned, is illustrative, not proof of a real athlete/course/weather/result.
- Current geometry / approved render rules: Guidelines §3–6; single source, `cover/center`, rounded20/22px corners, localized text/tags/date/location/gradient/open button retained. No UI or focal-rule changes.
- Viewports / DPR / safe-area profiles:320×700,375×812,390×844,440×956;667×375,844×390,956×440;1200×1600. Both themes, larger text, longest event title, date ranges/unknown gender, zero inset + guideline synthetic stress + actual owner device insets. Start portraitDPR3/landscape-wideDPR2; approve actual quality on owner device, not emulation alone.
- Composition groups: portrait / landscape / tablet-wide **render reviews of the same source**. Independently authored orientation assets are not supported by current Home.

## References and verified race characteristics

| URL or absolute file path | Photographer / rights holder | Permission status | Reference purpose | Verified race/location fact | Owner decision |
| --- | --- | --- | --- | --- | --- |
| `/private/tmp/300w-cal02-candidate/data/calendar/2027-master.json` (event key; mapping in `src/data/calendar2027.ts`) | Owner-approved planning dataset; not a photograph | Working identity/date approval only; no image license | Identity boundary | Tours Métropole identity is approved; do not substitute French Riviera or invent a route/bridge. | NEW artwork planning approved; final crops pending |
| Not supplied — no visual reference claimed | Unknown | Unresolved | Exact geography, sporting format/course, equipment and lighting | None beyond identity above | Pending reference review |

- Geographic landmarks / architecture to preserve: none selected until a source reference verifies them; never substitute a similar city.
- Discipline / race format: proposed scene above, subject to verified race-format rules. No invented peloton/non-drafting spacing, course, transition layout or participant identity.
- Camera angle / lighting / time of day: proposed environmental viewpoint, natural cinematic light; artistic direction, not a claim about actual race timing/weather. Reference review must confirm plausibility.
- Athlete position / anatomy / equipment requirements: complete required body parts/contact points; plausible running mechanics or aero posture, bicycle frame/fork/handlebars and both complete wheels. If swim/transition selected later, apply the guideline's freestyle anatomy/water and saddle-racked bikes/stage-specific equipment checks. Do not hide defects with blur.
- Branding / exact supplied logo reference: none supplied. No invented sponsor/edition logos or generated lettering. Existing UI tags remain; any embedded branding needs exact supplied reference and crop/readability approval.
- Unverified claims / questions: reference rights/creator, exact course/landmarks, subject identity, weather/time, equipment/spacing rules, all image hashes and crop approvals remain unresolved. Artwork does not change dataset facts.

## Composition and final crops

| Group | Master / proposed export dimensions | Subject and landmark placement | UI exclusions / safe zones | Final rendered previews |
| --- | --- | --- | --- | --- |
| Portrait | Guidelines starting master≥1600×1200 with overscan; existing Home integration source1672×941 if quality passes, variants640/1280/1672 widths | Compact complete subject and verified location cue within actual shared visible area; mark critical boxes before approval | Measured title/tags/date/location/open button, rounded corners; start12CSSpx inside crop and8CSSpx beyond overlays | NOT CREATED; absolute paths, device/DPR and hashes required |
| Landscape | Guidelines starting master≥3000×1200; **same integrated source**, not an independent landscape runtime asset | Preserve required head/feet/wheels and geography through thin wide crop; no silent vertical clipping | Actual longer text blocks and controls, safe-area stress and orientation changes | NOT CREATED; all667/844/956 widths required |
| Tablet/wide | Guidelines starting master≥3200×1000; same source;2172×490 is guideline2× render target, not a currently supported new derivative | Verify subject remains identifiable without sacrificing full anatomy in1086×245 measured outer card | Actual overlays, rounded clips, dynamic height; resolve1672px maximum quality tradeoff with owner | NOT CREATED;1200×1600 required |

**Risk / STOP condition:** Distant landmark at one edge and runner at the other cannot both be guaranteed in narrow crop. No real source exists yet, so feasibility is unresolved. Request source-space critical boxes for athlete/equipment/landmark/logo, project into every rendered crop and reject any loss or UI collision. Prefer the proposed compact environmental composition; if it cannot pass, request a separate Home multi-composition decision. Do not deliver alternate orientation files as if current `srcset` could select them.

**Future delivery, not existing paths:** original/editable master and revisions in an owner-agreed durable archive; no archive location invented here. Proposed single-source integration filename `ironman-70-3-tours-metropole-2027-landscape-v01.png` under `/private/tmp/300w-cal02-candidate/src/assets/showcase/2027/`; existing generator would produce `/private/tmp/300w-cal02-candidate/src/assets/optimized/showcase/ironman-70-3-tours-metropole-2027-landscape-v01-{640,1280,1672}.webp`. “Landscape” names the common source composition, not runtime orientation selection. Confirm concrete delivery paths and dimensions before import. Previous unversioned proposed names in the B2 report are superseded; no actual assets renamed. Separate orientation proposals stay unintegrated pending authorization.

## Approval checklist

- [ ] References, rights status and race-specific facts reviewed; generated scene identified as illustrative.
- [ ] Sporting anatomy, equipment, wheels, spacing and transition stage plausible.
- [ ] Portrait and landscape final renders preserve subjects, logos and geography; wide case reviewed.
- [ ] UI overlays, safe areas, dynamic text and orientation changes validated.
- [ ] Owner approved final crops, not only the master; preview paths/revision recorded.
- [ ] Optimized WebP compared at actual sizes/DPR; performance exceptions documented.
- [ ] Original and optimized metadata/hashes complete in the [handoff](../showcase-codex-handoff-template.md).

Owner decision / date / evidence: **PENDING for references, image files and final rendered crops**. Owner-approved NEW classification is not an image approval record.
Remaining changes: supply verified references/rights; prepare separately authorized source; measure boxes/overlays; complete all viewport/crop, optimized quality/performance and physical iPhone Safari/Telegram reviews; record manifest and exact owner-approved revision/hashes.
Integration/deployment authorization: separate scope; not implied by this brief or original-image approval. Preserve neutral fallback meanwhile.
