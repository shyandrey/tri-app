# PTO pilot dry-run — 18.10.2026

Historical pre-approval-gate research. These field proposals are not approved for import. The new [profile URL review](athlete-pto-profile-url-review.md) must complete before any further field extraction.

READ-ONLY data extraction; no registry writes. Twenty athletes from the approved 300W ranking snapshot, SHA `e8a3dba1de13ab5e75964ce9c2ff9dd3e3a49745`, dataset clock `2026-10-10T12:00:00.000Z`. Identity requires unique local ID/name/gender plus exact PTO canonical/name and matching country code. All 20 passed these checks. Links came from PTO ranking/profile HTML, not guessed slugs.

Snapshots and machine-readable report: `/tmp/300w-pto-pilot/` (`report.json`, `manifest.json`, `<athleteId>.html`). Snapshot hashes below identify exact evidence; temporary files must be archived externally before any future reviewed import. No raw HTML is committed.

## Coverage

- Identity checks: 20/20.
- Reported AGE and BORN: 18/20 each.
- At least one accepted social/website URL: 16/20.
- Athletes requiring review: 6/20.

AGE/BORN disagreements are review flags, not proof that the source is wrong: reported chronological age may differ from competition age. No date of birth is inferred. `calculatedAge` is the BORN-based policy calculation, not an approved registry update. Social URL association is supported by the PTO profile; current account ownership has not been independently verified.

## Per-athlete evidence

### Hayden Wilde — ID 3

- Source: https://stats.protriathletes.org/athlete/hayden-wilde
- AGE / BORN / competition age: **29 / 1997 / 29**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `fd4432d3e59695a193a3c84c88b5f3063d9e71797be8a469e0ccd217da73265a`.
- Missing: instagram, twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear.

### Kristian Blummenfelt — ID 1

- Source: https://stats.protriathletes.org/athlete/kristian-blummenfelt
- AGE / BORN / competition age: **32 / 1994 / 32**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `c7fc3421eee42dc380923a7f98b7de0ffed89becff2895737023bcb5b5beb751`.
- Missing: facebook, tiktok, website.
- Review flags: EXISTING_YOUTUBE_CONFLICT.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.twitter.
- youtube: https://youtube.com/channel/UC3FUifepO8vXHtool8S1Z1g (original href: `https://www.youtube.com/channel/UC3FUifepO8vXHtool8S1Z1g`).
- instagram: https://instagram.com/kristianblu (original href: `https://www.instagram.com/kristianblu/`).
- twitter: https://twitter.com/kristianblu (original href: `https://twitter.com/kristianblu`).

### Jelle Geens — ID 6

- Source: https://stats.protriathletes.org/athlete/jelle-geens
- AGE / BORN / competition age: **33 / 1993 / 33**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `8efd402675d9dd3072ce72261efb3d1ef2b51fa227f9c3ac88ef9ee5d6060a73`.
- Missing: twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.instagram.
- instagram: https://instagram.com/jellegeens (original href: `https://www.instagram.com/jellegeens/`).

### Casper Stornes — ID 7

- Source: https://stats.protriathletes.org/athlete/casper-stornes
- AGE / BORN / competition age: **29 / 1997 / 29**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `9dbcdd59af289b41663cbd46f238a5216a20623675239d84fc41ed3bb417d76b`.
- Missing: instagram, youtube, facebook, tiktok, website.
- Review flags: INVALID_OR_UNCLASSIFIED_SOCIAL_URL.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.twitter.
- twitter: https://twitter.com/CasperStornes (original href: `https://twitter.com/CasperStornes`).
- Not accepted: `https://www.instagram.com/p/CTt74xIsIsl/` (source marker `_social_ig`).

### Marten Van Riel — ID 2

- Source: https://stats.protriathletes.org/athlete/marten-van-riel
- AGE / BORN / competition age: **33 / 1992 / 34**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `ced78efd8290639295b9880309fffdb64474069daeec9e001c1d53f87b33606e`.
- Missing: twitter, youtube, tiktok, website.
- Review flags: AGE_BORN_CONFLICT.
- Proposed ADD fields (review only): socials.instagram, socials.facebook.
- instagram: https://instagram.com/martenvanriel (original href: `https://www.instagram.com/martenvanriel/`).
- facebook: https://facebook.com/MartenVanRiel (original href: `https://www.facebook.com/MartenVanRiel`).

### Lionel Sanders — ID 23

- Source: https://stats.protriathletes.org/athlete/lionel-sanders
- AGE / BORN / competition age: **38 / 1988 / 38**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `a0cf8335e2ba47be0027e3c09a3091981645e76ceebe8ecb984987412df96fc7`.
- Missing: twitter, tiktok.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.youtube, socials.instagram, socials.facebook, socials.website.
- youtube: https://youtube.com/user/PBTriClinic2011 (original href: `https://www.youtube.com/user/PBTriClinic2011`).
- instagram: https://instagram.com/lsanderstri (original href: `https://www.instagram.com/lsanderstri/`).
- facebook: https://facebook.com/lsanderstri (original href: `https://www.facebook.com/lsanderstri`).
- website: https://lsanderstri.com/ (original href: `https://www.lsanderstri.com/`).

### Mika Noodt — ID 4

- Source: https://stats.protriathletes.org/athlete/mika-noodt
- AGE / BORN / competition age: **26 / 2000 / 26**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `e5a8b69361a6cc7de1435484477b05f95be6181a2da955bf6ec18c38ce4626f6`.
- Missing: twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.instagram.
- instagram: https://instagram.com/mikanoo00 (original href: `https://www.instagram.com/mikanoo00/`).

### Matthew Marquardt — ID 20

- Source: https://stats.protriathletes.org/athlete/matthew-marquardt
- AGE / BORN / competition age: **missing / missing / None**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `f8396411da1b0e5fff0b000d7d2a64f9acb22d6901e56c6a3334f321bf52ff85`.
- Missing: Age, Born, youtube, facebook, tiktok, website.
- Review flags: INVALID_OR_UNCLASSIFIED_SOCIAL_URL.
- Proposed ADD fields (review only): socials.instagram, socials.twitter.
- instagram: https://instagram.com/matthewdmarquardt (original href: `https://www.instagram.com/matthewdmarquardt/`).
- twitter: https://twitter.com/MD_Marquardt1 (original href: `https://twitter.com/MD_Marquardt1`).
- Not accepted: `https://www.linkedin.com/in/matthew-d-marquardt/` (source marker `_social_www`).

### Vincent Luis — ID 41

- Source: https://stats.protriathletes.org/athlete/vincent-luis
- AGE / BORN / competition age: **37 / 1989 / 37**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `387c79652a2ea0e80ace0d5c7eb8842e763e48a3ccd3134e0709cecc784f8f45`.
- Missing: twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.instagram.
- instagram: https://instagram.com/vincentluistri (original href: `https://www.instagram.com/vincentluistri`).

### Sam Laidlow — ID 10521

- Source: https://stats.protriathletes.org/athlete/sam-laidlow
- AGE / BORN / competition age: **27 / 1998 / 28**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `ed295718e82c2c4606a8e67bd8c1adcd711886060af7b325b66345eeeceb35c4`.
- Missing: twitter, facebook, tiktok.
- Review flags: AGE_BORN_CONFLICT, INVALID_OR_UNCLASSIFIED_SOCIAL_URL, INVALID_OR_UNCLASSIFIED_SOCIAL_URL.
- Proposed ADD fields (review only): socials.youtube, socials.instagram, socials.website.
- youtube: https://youtube.com/channel/UCP6EsU9T2RykT1quNR5moeg (original href: `https://youtube.com/channel/UCP6EsU9T2RykT1quNR5moeg`).
- instagram: https://instagram.com/samlaidlow (original href: `https://www.instagram.com/samlaidlow/`).
- website: https://samlaidlow.com/ (original href: `https://samlaidlow.com/`).
- Not accepted: `https://twitter.com/laidlowsam1?lang=en` (source marker `_social_twitter`).
- Not accepted: `https://m.facebook.com/laidlowsam` (source marker `_social_fb`).

### Taylor Knibb — ID 104

- Source: https://stats.protriathletes.org/athlete/taylor-knibb
- AGE / BORN / competition age: **28 / 1998 / 28**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `035a6ee744ec1c9865ffc108eb75a30b9448afc8dd67dcfa269195b36da460d1`.
- Missing: youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.instagram, socials.twitter.
- instagram: https://instagram.com/taylorknibb (original href: `https://www.instagram.com/taylorknibb/`).
- twitter: https://twitter.com/taylorknibb (original href: `https://twitter.com/taylorknibb`).

### Kate Waugh — ID 101

- Source: https://stats.protriathletes.org/athlete/kate-waugh
- AGE / BORN / competition age: **27 / 1999 / 27**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `c99ba3218c150e09d5aa3bb92c6ae8a3f7cef2f21dac4cd94e49a92fd89eeac6`.
- Missing: instagram, twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear.

### Julie Derron — ID 102

- Source: https://stats.protriathletes.org/athlete/julie-derron
- AGE / BORN / competition age: **30 / 1996 / 30**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `94687897c42975d31e4a4f367eea1c06f270dfc0ca402c80e525187e75489b5b`.
- Missing: twitter, youtube, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.instagram, socials.facebook.
- instagram: https://instagram.com/juliederron (original href: `https://www.instagram.com/juliederron/`).
- facebook: https://facebook.com/juliederrontri (original href: `https://www.facebook.com/juliederrontri`).

### Laura Philipp — ID 109

- Source: https://stats.protriathletes.org/athlete/laura-philipp
- AGE / BORN / competition age: **39 / 1987 / 39**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `087f2ca547504a750c6b5c73805bc5112fe3a51a3178c2b19b4b1d8da349cc4b`.
- Missing: twitter, facebook, tiktok, website.
- Review flags: INVALID_OR_UNCLASSIFIED_SOCIAL_URL.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.youtube, socials.instagram.
- youtube: https://youtube.com/channel/UCkJ1Sgtqj909kXj_kApY3rA (original href: `https://www.youtube.com/channel/UCkJ1Sgtqj909kXj_kApY3rA`).
- instagram: https://instagram.com/laura_philipp_tri (original href: `https://www.instagram.com/laura_philipp_tri/`).
- Not accepted: `http://www.lauraphilipp.de/` (source marker `_social_www`).

### Solveig Løvseth — ID 106

- Source: https://stats.protriathletes.org/athlete/solveig-loevseth
- AGE / BORN / competition age: **missing / missing / None**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `2b8cd3db10153b5d06e588de634af2e5ce4d1a8cd3c741fdc149ad690eae2e37`.
- Missing: Age, Born, instagram, twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): none.

### Lucy Charles-Barclay — ID 103

- Source: https://stats.protriathletes.org/athlete/lucy-charles-barclay
- AGE / BORN / competition age: **33 / 1993 / 33**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `bdf227e9c965701c86552bcc79e1b31186f9ab272af6b7829854a85936da5eda`.
- Missing: tiktok.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.youtube, socials.instagram, socials.twitter, socials.facebook, socials.website.
- youtube: https://youtube.com/channel/UC6PP69DCmBwMCPf9RSSTNTg (original href: `https://www.youtube.com/channel/UC6PP69DCmBwMCPf9RSSTNTg`).
- instagram: https://instagram.com/lucycharles93 (original href: `https://www.instagram.com/lucycharles93/`).
- twitter: https://twitter.com/lucyannecharles (original href: `https://twitter.com/lucyannecharles`).
- facebook: https://facebook.com/LucyAnneCharles (original href: `https://www.facebook.com/LucyAnneCharles/`).
- website: https://lucycharles.com/ (original href: `https://www.lucycharles.com/`).

### Kat Matthews — ID 108

- Source: https://stats.protriathletes.org/athlete/kat-matthews
- AGE / BORN / competition age: **35 / 1991 / 35**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `5c9536d12ec33e6cdabd1507c782b46a98f19b2bcbfd6c4152f40438304b843b`.
- Missing: youtube, tiktok.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.instagram, socials.twitter, socials.facebook, socials.website.
- instagram: https://instagram.com/katr_matthews (original href: `https://www.instagram.com/katr_matthews/`).
- twitter: https://twitter.com/Katr_Matthews (original href: `https://twitter.com/Katr_Matthews`).
- facebook: https://facebook.com/katrina.rye (original href: `https://www.facebook.com/katrina.rye`).
- website: https://katrinamatthewstri.com/ (original href: `https://www.katrinamatthewstri.com`).

### Ashleigh Gentle — ID 147

- Source: https://stats.protriathletes.org/athlete/ashleigh-gentle
- AGE / BORN / competition age: **35 / 1991 / 35**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `72784d8e56a8db7ce3d4564bdfa7bc95b6f867cf071c93b2314a911caf376dfd`.
- Missing: tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.youtube, socials.instagram, socials.twitter, socials.facebook.
- youtube: https://youtube.com/channel/UCdpue5OolKQqxKfoXY9Y9Bw (original href: `https://www.youtube.com/channel/UCdpue5OolKQqxKfoXY9Y9Bw`).
- instagram: https://instagram.com/gentle_ash (original href: `https://www.instagram.com/gentle_ash/`).
- twitter: https://twitter.com/AshleighGentle (original href: `https://twitter.com/AshleighGentle`).
- facebook: https://facebook.com/AshleighGentleTri (original href: `https://www.facebook.com/AshleighGentleTri/`).

### Georgia Taylor-Brown — ID 105

- Source: https://stats.protriathletes.org/athlete/georgia-taylor-brown
- AGE / BORN / competition age: **32 / 1994 / 32**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `ba186660cca70f65b83e4d7dc5c7b04bb10b979f6a0155fd013dcb298212644c`.
- Missing: instagram, twitter, youtube, facebook, tiktok, website.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear.

### Paula Findlay — ID 114

- Source: https://stats.protriathletes.org/athlete/paula-findlay
- AGE / BORN / competition age: **37 / 1989 / 37**.
- Verified at: `2026-10-18T16:32:35.985327+00:00`; HTML SHA256: `a42d38ea1f97b9a9cd0071ee71dc5ed8ba1368cc4470d9dc333a9ad54bd72ac4`.
- Missing: tiktok.
- Review flags: none.
- Proposed ADD fields (review only): reportedAge, birthYear, socials.youtube, socials.instagram, socials.twitter, socials.facebook, socials.website.
- youtube: https://youtube.com/channel/UC8Wjskc9fSkYLporjscGIBQ (original href: `https://www.youtube.com/channel/UC8Wjskc9fSkYLporjscGIBQ`).
- instagram: https://instagram.com/paula_findlay (original href: `https://www.instagram.com/paula_findlay/`).
- twitter: https://twitter.com/PaulaFindlay (original href: `https://twitter.com/PaulaFindlay`).
- facebook: https://facebook.com/paula.findlay.triathlete (original href: `https://www.facebook.com/paula.findlay.triathlete/`).
- website: https://paulafindlay.blogspot.com/ (original href: `https://paulafindlay.blogspot.com/`).

## Review required

- Kristian YouTube: existing handle and PTO channel ID are not proven equivalent; existing link preserved.
- Marten / Sam: preserve both raw AGE/BORN; no age-field proposal until review.
- Casper Instagram post, Matthew LinkedIn (not allowlisted), Laura HTTP website, Sam language-query/mobile Facebook forms are reported without automatic URL repair.
- Missing AGE/BORN for Matthew and Solveig cause no removal. Missing socials never remove existing links (including Hayden).
- No changes to athlete IDs, countries, race results or ranking; no registry writer exists in this patch.

## Validation

- `node --test scripts/test-pto-profiles.mjs`: 17 PASS.
- `node scripts/test-pto-profile-browser.mjs`: PASS (local Vite + isolated Chrome; 320/390/768px; synthetic data only in browser memory).
- Two offline replays: byte-identical JSON.
- `npm run check:release`: PASS (includes build, ESLint, athlete/results audits, ranking and regression checks). `npm run check` does not exist.
- ESLint has one pre-existing RaceDetailPage hook dependency warning, no errors.
- Existing catalog IDs/results/ranking are not edited. Legacy undated static ages are hidden by the UI adapter until separately approved verified fields exist; existing social links remain.
