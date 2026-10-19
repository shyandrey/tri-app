# PTO final live field review — 18.10.2026

**REVIEW ONLY. No field values applied.** Owner approval covers the 20 URL mappings only. AUTO-APPROVABLE means a conflict-free candidate for a future explicit batch field approval, not automatic permission to write. REVIEW REQUIRED remains on hold; SKIP means no change/removal.

Live snapshots, observations, raw report, selected catalog baseline and machine-readable field proposal: `/tmp/300w-pto-final-lPRt2G`. Per-field [CSV](athlete-pto-field-review-2026-10-18.csv) contains all160 AGE/BORN/social slots and exact values/actions. Snapshot hashes identify the fresh HTML; all20 pages returned HTTP200 and passed canonical/name/country + unique local ID mapping checks. Approved registry and decisions were not changed.

Requests were sequential, 1.5s apart after each extraction, timeout20s, body bound4MB, redirects manual, no retries. robots.txt returned404; no block/rate-limit/challenge was encountered. Social destinations were not contacted; account ownership/redirect equivalence beyond the source association is not established.

## Coverage and proposed writes (not executed)

- AGE/BORN: 18/20 and 18/20. At least one valid social/website URL: 16/20. Identity conflicts:0. Field-flagged athletes:6.
- Valid social fields: instagram 15; twitter 8; youtube 7; facebook 7; tiktok 0; website 5. These include existing equivalent/conflicting links, not just additions.
- AUTO-APPROVABLE additions: 72 (16 reportedAge + 16 birthYear + 40 social/website URLs); held age-field additions: 4; held replacement candidates: 1; approved/executed replacements:0.
- All160 source slots: {"AUTO-APPROVABLE":72,"REVIEW REQUIRED":5,"SKIP":83}. SKIP includes missing fields, rejected URLs and already-present equivalent values.

## Age policy / remaining decisions

Competition age uses current calendar year − explicit verified BORN (Europe/Moscow calendar year). For this observation year: Marten2026−1992=34 vs raw AGE33; Sam2026−1998=28 vs raw AGE27. Both raw values are retained in the report; four proposed age-field additions remain REVIEW REQUIRED. The discrepancy does not establish an incorrect birth year or identity: chronological-age semantics or stale AGE are possible, not proven. No exact birth date is inferred. Calculated age is derived UI data, not a new independent stored value.

AGE-only values would retain observedAt and be displayed only within that observation year, never automatically incremented. No AGE-only case occurred in this pilot. Current helper uses verifiedAt, equal to observedAt in this run; future separately timed verification must not renew an old observation's freshness.

Owner decisions still required: approve desired conflict-free additions; decide Marten/Sam age fields; preserve Kristian's current YouTube until channel/handle equivalence is verified. Casper Instagram post, Matthew LinkedIn, Sam query/mobile social forms and Laura HTTP website are SKIP, not replacement guesses. Missing fields never erase existing data (including Hayden's Instagram). Legacy ages remain unchanged.

## Per-athlete proposal

### 3 — Hayden Wilde

- PTO: https://stats.protriathletes.org/athlete/hayden-wilde
- Raw AGE / BORN: 29 / 1997; derived age: 29.
- ObservedAt: `2026-10-18T16:58:14.517Z`; SHA256: `0abc3af95440670175e9e679e470725205a4403845c939abd5d382269feb992d`.
- Conflicts: none. Missing/omitted normalized fields: instagram, twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 29 | 29 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1997 | 1997 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | missing | — | https://instagram.com/hayden_wilde | SKIP / NO_CHANGE |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 1 — Kristian Blummenfelt

- PTO: https://stats.protriathletes.org/athlete/kristian-blummenfelt
- Raw AGE / BORN: 32 / 1994; derived age: 32.
- ObservedAt: `2026-10-18T16:58:16.596Z`; SHA256: `5e8cf38bdac2075cc4b0d44d62d92ffcb826df77a0d38029a9af038bb3e72ebf`.
- Conflicts: EXISTING_YOUTUBE_CONFLICT. Missing/omitted normalized fields: facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 32 | 32 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1994 | 1994 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/kristianblu/ | https://instagram.com/kristianblu | https://instagram.com/kristianblu | SKIP / NO_CHANGE |
| socials.twitter | https://twitter.com/kristianblu | https://twitter.com/kristianblu | — | AUTO-APPROVABLE / ADD |
| socials.youtube | https://www.youtube.com/channel/UC3FUifepO8vXHtool8S1Z1g | https://youtube.com/channel/UC3FUifepO8vXHtool8S1Z1g | https://youtube.com/@kristian.blummenfelt | REVIEW REQUIRED / HOLD_REPLACEMENT |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 6 — Jelle Geens

- PTO: https://stats.protriathletes.org/athlete/jelle-geens
- Raw AGE / BORN: 33 / 1993; derived age: 33.
- ObservedAt: `2026-10-18T16:58:19.333Z`; SHA256: `2b3fcadb52e28e26106a11bbfa012802922b71a0b855a9f97878bd25e5e4493d`.
- Conflicts: none. Missing/omitted normalized fields: twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 33 | 33 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1993 | 1993 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/jellegeens/ | https://instagram.com/jellegeens | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 7 — Casper Stornes

- PTO: https://stats.protriathletes.org/athlete/casper-stornes
- Raw AGE / BORN: 29 / 1997; derived age: 29.
- ObservedAt: `2026-10-18T16:58:21.216Z`; SHA256: `ff1ba3f3b98d1c376bbbe220ab369026480c0fe27a9cb82ccf41ed4a33ff3aa4`.
- Conflicts: INVALID_OR_UNCLASSIFIED_SOCIAL_URL. Missing/omitted normalized fields: instagram, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 29 | 29 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1997 | 1997 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/p/CTt74xIsIsl/ | — | — | SKIP / NO_CHANGE |
| socials.twitter | https://twitter.com/CasperStornes | https://twitter.com/CasperStornes | — | AUTO-APPROVABLE / ADD |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 2 — Marten Van Riel

- PTO: https://stats.protriathletes.org/athlete/marten-van-riel
- Raw AGE / BORN: 33 / 1992; derived age: 34.
- ObservedAt: `2026-10-18T16:58:23.123Z`; SHA256: `3e87f4473906285f1a23a9e1001c277313d399b3350e0677aa8ba8e6df393fca`.
- Conflicts: AGE_BORN_CONFLICT. Missing/omitted normalized fields: twitter, youtube, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 33 | 33 | — | REVIEW REQUIRED / HOLD_ADD |
| birthYear | 1992 | 1992 | — | REVIEW REQUIRED / HOLD_ADD |
| socials.instagram | https://www.instagram.com/martenvanriel/ | https://instagram.com/martenvanriel | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | https://www.facebook.com/MartenVanRiel | https://facebook.com/MartenVanRiel | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 23 — Lionel Sanders

- PTO: https://stats.protriathletes.org/athlete/lionel-sanders
- Raw AGE / BORN: 38 / 1988; derived age: 38.
- ObservedAt: `2026-10-18T16:58:26.624Z`; SHA256: `859345446665be6eb2bae814e77df2c4ee7deea22aa52fd0c0dc9ae74652845e`.
- Conflicts: none. Missing/omitted normalized fields: twitter, tiktok (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 38 | 38 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1988 | 1988 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/lsanderstri/ | https://instagram.com/lsanderstri | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | https://www.youtube.com/user/PBTriClinic2011 | https://youtube.com/user/PBTriClinic2011 | — | AUTO-APPROVABLE / ADD |
| socials.facebook | https://www.facebook.com/lsanderstri | https://facebook.com/lsanderstri | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | https://www.lsanderstri.com/ | https://lsanderstri.com/ | — | AUTO-APPROVABLE / ADD |

### 4 — Mika Noodt

- PTO: https://stats.protriathletes.org/athlete/mika-noodt
- Raw AGE / BORN: 26 / 2000; derived age: 26.
- ObservedAt: `2026-10-18T16:58:28.476Z`; SHA256: `fa6616eeb82d670bcf64f17625e740395ea3711f415d57487b60bf9ba9698136`.
- Conflicts: none. Missing/omitted normalized fields: twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 26 | 26 | — | AUTO-APPROVABLE / ADD |
| birthYear | 2000 | 2000 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/mikanoo00/ | https://instagram.com/mikanoo00 | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 20 — Matthew Marquardt

- PTO: https://stats.protriathletes.org/athlete/matthew-marquardt
- Raw AGE / BORN: - / -; derived age: missing.
- ObservedAt: `2026-10-18T16:58:30.305Z`; SHA256: `b057779ed4266bc81ba26f559a9ac2cecc6019d0a4b9216ed4b5241f4cf91fa5`.
- Conflicts: INVALID_OR_UNCLASSIFIED_SOCIAL_URL. Missing/omitted normalized fields: Age, Born, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | - | — | — | SKIP / NO_CHANGE |
| birthYear | - | — | — | SKIP / NO_CHANGE |
| socials.instagram | https://www.instagram.com/matthewdmarquardt/ | https://instagram.com/matthewdmarquardt | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/MD_Marquardt1 | https://twitter.com/MD_Marquardt1 | — | AUTO-APPROVABLE / ADD |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | https://www.linkedin.com/in/matthew-d-marquardt/ | — | — | SKIP / NO_CHANGE |

### 41 — Vincent Luis

- PTO: https://stats.protriathletes.org/athlete/vincent-luis
- Raw AGE / BORN: 37 / 1989; derived age: 37.
- ObservedAt: `2026-10-18T16:58:32.143Z`; SHA256: `ca6d592a2bb122073e7ba70e9480d958515cb43da3d91917862dc411530ab516`.
- Conflicts: none. Missing/omitted normalized fields: twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 37 | 37 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1989 | 1989 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/vincentluistri | https://instagram.com/vincentluistri | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 10521 — Sam Laidlow

- PTO: https://stats.protriathletes.org/athlete/sam-laidlow
- Raw AGE / BORN: 27 / 1998; derived age: 28.
- ObservedAt: `2026-10-18T16:58:33.975Z`; SHA256: `0e66b8332ac2899e3a80776bcf61aff167bd0fc09e6acfe92ee0fe971112c7df`.
- Conflicts: AGE_BORN_CONFLICT; INVALID_OR_UNCLASSIFIED_SOCIAL_URL; INVALID_OR_UNCLASSIFIED_SOCIAL_URL. Missing/omitted normalized fields: twitter, facebook, tiktok (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 27 | 27 | — | REVIEW REQUIRED / HOLD_ADD |
| birthYear | 1998 | 1998 | — | REVIEW REQUIRED / HOLD_ADD |
| socials.instagram | https://www.instagram.com/samlaidlow/ | https://instagram.com/samlaidlow | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/laidlowsam1?lang=en | — | — | SKIP / NO_CHANGE |
| socials.youtube | https://youtube.com/channel/UCP6EsU9T2RykT1quNR5moeg | https://youtube.com/channel/UCP6EsU9T2RykT1quNR5moeg | — | AUTO-APPROVABLE / ADD |
| socials.facebook | https://m.facebook.com/laidlowsam | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | https://samlaidlow.com/ | https://samlaidlow.com/ | — | AUTO-APPROVABLE / ADD |

### 104 — Taylor Knibb

- PTO: https://stats.protriathletes.org/athlete/taylor-knibb
- Raw AGE / BORN: 28 / 1998; derived age: 28.
- ObservedAt: `2026-10-18T16:58:35.895Z`; SHA256: `0cf5878149ea73778c54306c41d84c8f0fb9f5bb6183602c0608d30d4198d81f`.
- Conflicts: none. Missing/omitted normalized fields: youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 28 | 28 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1998 | 1998 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/taylorknibb/ | https://instagram.com/taylorknibb | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/taylorknibb | https://twitter.com/taylorknibb | — | AUTO-APPROVABLE / ADD |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 101 — Kate Waugh

- PTO: https://stats.protriathletes.org/athlete/kate-waugh
- Raw AGE / BORN: 27 / 1999; derived age: 27.
- ObservedAt: `2026-10-18T16:58:38.525Z`; SHA256: `0d08b326e74c26efbacccdedf80fdbd5b62c46d974641b8e50b9d877a4247c2c`.
- Conflicts: none. Missing/omitted normalized fields: instagram, twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 27 | 27 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1999 | 1999 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | missing | — | — | SKIP / NO_CHANGE |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 102 — Julie Derron

- PTO: https://stats.protriathletes.org/athlete/julie-derron
- Raw AGE / BORN: 30 / 1996; derived age: 30.
- ObservedAt: `2026-10-18T16:58:40.904Z`; SHA256: `6d0c5bca3dbfecfbdf2840abbedb92e208362a374c191c81466ac6d5057d60b6`.
- Conflicts: none. Missing/omitted normalized fields: twitter, youtube, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 30 | 30 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1996 | 1996 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/juliederron/ | https://instagram.com/juliederron | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | https://www.facebook.com/juliederrontri | https://facebook.com/juliederrontri | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 109 — Laura Philipp

- PTO: https://stats.protriathletes.org/athlete/laura-philipp
- Raw AGE / BORN: 39 / 1987; derived age: 39.
- ObservedAt: `2026-10-18T16:58:42.707Z`; SHA256: `ff3f2c70985be1a6c26bf25d33c0448fbce2ef5e27ae7d20e981b1254d8251b2`.
- Conflicts: INVALID_OR_UNCLASSIFIED_SOCIAL_URL. Missing/omitted normalized fields: twitter, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 39 | 39 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1987 | 1987 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/laura_philipp_tri/ | https://instagram.com/laura_philipp_tri | — | AUTO-APPROVABLE / ADD |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | https://www.youtube.com/channel/UCkJ1Sgtqj909kXj_kApY3rA | https://youtube.com/channel/UCkJ1Sgtqj909kXj_kApY3rA | — | AUTO-APPROVABLE / ADD |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | http://www.lauraphilipp.de/ | — | — | SKIP / NO_CHANGE |

### 106 — Solveig Løvseth

- PTO: https://stats.protriathletes.org/athlete/solveig-loevseth
- Raw AGE / BORN: - / -; derived age: missing.
- ObservedAt: `2026-10-18T16:58:45.414Z`; SHA256: `510f5f57d8f209751d00a4a70ed0b26787373add728f10a3edad33fba7837149`.
- Conflicts: none. Missing/omitted normalized fields: Age, Born, instagram, twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | - | — | — | SKIP / NO_CHANGE |
| birthYear | - | — | — | SKIP / NO_CHANGE |
| socials.instagram | missing | — | — | SKIP / NO_CHANGE |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 103 — Lucy Charles-Barclay

- PTO: https://stats.protriathletes.org/athlete/lucy-charles-barclay
- Raw AGE / BORN: 33 / 1993; derived age: 33.
- ObservedAt: `2026-10-18T16:58:47.243Z`; SHA256: `8fafadee45ea860ed24416e0b7c7543a616a364400a12c8211a44216e83e49b8`.
- Conflicts: none. Missing/omitted normalized fields: tiktok (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 33 | 33 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1993 | 1993 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/lucycharles93/ | https://instagram.com/lucycharles93 | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/lucyannecharles | https://twitter.com/lucyannecharles | — | AUTO-APPROVABLE / ADD |
| socials.youtube | https://www.youtube.com/channel/UC6PP69DCmBwMCPf9RSSTNTg | https://youtube.com/channel/UC6PP69DCmBwMCPf9RSSTNTg | — | AUTO-APPROVABLE / ADD |
| socials.facebook | https://www.facebook.com/LucyAnneCharles/ | https://facebook.com/LucyAnneCharles | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | https://www.lucycharles.com/ | https://lucycharles.com/ | — | AUTO-APPROVABLE / ADD |

### 108 — Kat Matthews

- PTO: https://stats.protriathletes.org/athlete/kat-matthews
- Raw AGE / BORN: 35 / 1991; derived age: 35.
- ObservedAt: `2026-10-18T16:58:49.155Z`; SHA256: `ec75cee83a2c18fc19178fbfcdff73ce97bb7143f620606d0a2ddab09631100c`.
- Conflicts: none. Missing/omitted normalized fields: youtube, tiktok (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 35 | 35 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1991 | 1991 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/katr_matthews/ | https://instagram.com/katr_matthews | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/Katr_Matthews | https://twitter.com/Katr_Matthews | — | AUTO-APPROVABLE / ADD |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | https://www.facebook.com/katrina.rye | https://facebook.com/katrina.rye | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | https://www.katrinamatthewstri.com | https://katrinamatthewstri.com/ | — | AUTO-APPROVABLE / ADD |

### 147 — Ashleigh Gentle

- PTO: https://stats.protriathletes.org/athlete/ashleigh-gentle
- Raw AGE / BORN: 35 / 1991; derived age: 35.
- ObservedAt: `2026-10-18T16:58:51.314Z`; SHA256: `f7a3696a7888e3c493ef508b6f34dff921f783cbd65c7b9a779d540ca65f1e35`.
- Conflicts: none. Missing/omitted normalized fields: tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 35 | 35 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1991 | 1991 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/gentle_ash/ | https://instagram.com/gentle_ash | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/AshleighGentle | https://twitter.com/AshleighGentle | — | AUTO-APPROVABLE / ADD |
| socials.youtube | https://www.youtube.com/channel/UCdpue5OolKQqxKfoXY9Y9Bw | https://youtube.com/channel/UCdpue5OolKQqxKfoXY9Y9Bw | — | AUTO-APPROVABLE / ADD |
| socials.facebook | https://www.facebook.com/AshleighGentleTri/ | https://facebook.com/AshleighGentleTri | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 105 — Georgia Taylor-Brown

- PTO: https://stats.protriathletes.org/athlete/georgia-taylor-brown
- Raw AGE / BORN: 32 / 1994; derived age: 32.
- ObservedAt: `2026-10-18T16:58:54.003Z`; SHA256: `cd685764268be201ca3dca7a390bfb95e8c71856827de08dbdeec16859f1af39`.
- Conflicts: none. Missing/omitted normalized fields: instagram, twitter, youtube, facebook, tiktok, website (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 32 | 32 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1994 | 1994 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | missing | — | — | SKIP / NO_CHANGE |
| socials.twitter | missing | — | — | SKIP / NO_CHANGE |
| socials.youtube | missing | — | — | SKIP / NO_CHANGE |
| socials.facebook | missing | — | — | SKIP / NO_CHANGE |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | missing | — | — | SKIP / NO_CHANGE |

### 114 — Paula Findlay

- PTO: https://stats.protriathletes.org/athlete/paula-findlay
- Raw AGE / BORN: 37 / 1989; derived age: 37.
- ObservedAt: `2026-10-18T16:58:55.844Z`; SHA256: `434fd559aba4de1cd6020fcc86814f993edf014eb31e5b82de91c7ed210c0553`.
- Conflicts: none. Missing/omitted normalized fields: tiktok (rejected URLs are distinguished below).

| Field | Actual PTO raw/href | Proposed value | Existing | Classification / action |
|---|---|---|---|---|
| reportedAge | 37 | 37 | — | AUTO-APPROVABLE / ADD |
| birthYear | 1989 | 1989 | — | AUTO-APPROVABLE / ADD |
| socials.instagram | https://www.instagram.com/paula_findlay/ | https://instagram.com/paula_findlay | — | AUTO-APPROVABLE / ADD |
| socials.twitter | https://twitter.com/PaulaFindlay | https://twitter.com/PaulaFindlay | — | AUTO-APPROVABLE / ADD |
| socials.youtube | https://www.youtube.com/channel/UC8Wjskc9fSkYLporjscGIBQ | https://youtube.com/channel/UC8Wjskc9fSkYLporjscGIBQ | — | AUTO-APPROVABLE / ADD |
| socials.facebook | https://www.facebook.com/paula.findlay.triathlete/ | https://facebook.com/paula.findlay.triathlete | — | AUTO-APPROVABLE / ADD |
| socials.tiktok | missing | — | — | SKIP / NO_CHANGE |
| socials.website | https://paulafindlay.blogspot.com/ | https://paulafindlay.blogspot.com/ | — | AUTO-APPROVABLE / ADD |

## Validation

- Parser/mapping/URL/age tests:29 PASS (network error scenarios mocked).
- Live extraction identity:20/20 PASS. Cached replay of all20 new HTML files with their original observation timestamps: deep-equal report PASS.
- Field proposal determinism and policy assertions: PASS;160 slots, no AUTO-APPROVABLE overwrite, prescribed exclusions and five review fields held.
- Registry, catalog, application/scripts and previous artifacts unchanged. Project Board updated separately; no commit/push/deploy.
