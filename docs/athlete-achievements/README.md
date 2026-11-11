# ATH-04B — Historical achievement research review

Date: 2026-11-11. Starting HEAD: `6fb4e74f61348ee63e9b2fdb24996ce73649d696`.

**Research reviewed / evidence gaps remain / awaiting owner review. No runtime integration.**

All 57 canonical athletes received external career searches alongside the existing approved-biography and local-result review. This extends beyond the application's 2024–2026 seasons. It is not a claim that every career achievement or historical record has been exhaustively established: archive access and unresolved claims remain explicit below. No unsupported result has been added to profiles.

## Outcome

- **168 verified records**, including the original 24 unchanged. Categories 9–11 remain separate owner-review proposals. Verified facts are not approval of display strings.
- **40/44** ATH-04A candidates promoted with direct evidence; **4** retain secondary corroboration but await official evidence. All 44 original records and their local provenance are preserved.
- **26 additional historical leads** are held separately. These are not approved achievements and may require discipline/age-class decisions as well as further evidence.
- **57/57** individual review records; **14** athletes currently have no verified qualifying record in this collection. This does not mean they have no achievements.
- **997** protected source/asset/biography files checked; all 57 biography texts and four existing Kristian UI achievements unchanged.

## Evidence and limitations

Every verified record has an athlete ID, canonical name, category, competition, event year, season, position/title, proposed Russian text, stable key and official source URLs. New records explain what the source establishes. The original 24 retain their exact schema/content and their original source descriptions. Sources are organizer/federation results, dated releases or historical tables. IRONMAN Group releases syndicated by Endurance Sportswire are organizer statements, not independent reporting; publication by a sponsor alone is not treated as organizer verification.

Public pages and search-visible official excerpts were inspected. Some IRONMAN pages returned HTTP 402 and USAT pages HTTP 403; where needed accessible federation or organizer-distributed reports were used. No claim that all links can be fetched without these access restrictions. External pages are mutable; URLs, review dates and claim explanations are stored, not complete copyrighted page copies. Search-result URLs in coverage are discovery evidence, **not** automatic verification of every assertion on those pages. Empty searches do not establish absence.

## Decisions on the known ambiguities

1. **Frankfurt 2026:** TRI247, Triathlete and Triathlon Magazine describe Stornes as European champion on a shortened 3.8 km / 125 km / 21.1 km course. The title is corroborated, but an inspected organizer notice is still missing. Keep this candidate pending; do not treat 4:50:23 as a full-distance record. [TRI247 report](https://www.tri247.com/triathlon-news/elite/ironman-frankfurt-2026-results-report).
2. **Records:** distinguish course, split, championship best, IRONMAN-branded best and organizer-reported full-distance best. Recorded achievements are historical at the event date. Laidlow's Roth-2026 7:21:04 is explicitly reported by Challenge Family; universal ratification and present-day record status are not claimed. Bogen's split and Texas/assisted-record conditions remain unresolved. [Organizer statement](https://challengefamily.com/news/world-record-holder-sam-laidlow-confirms-start-at-challenge-samarkand/).
3. **T100 season:** retain Wilde 2025 from article body plus independent federation confirmation. The contradictory 2026 image/title is preserved as a metadata conflict, not used to create a 2026 champion. Ordinary Tour race wins and third places are not overall titles.
4. **Edition versus date:** St George was held 7 May 2022 but awarded the **2021** IRONMAN world title. New rows use eventYear 2022 and season/editionYear 2021. Tokyo-2020 observations remain intact. A January-2023 PTO release announcing 2022 year-end rankings is not a 2023 ranking result.
5. **PTO #1:** snapshot observations (Long May-2024, Gentle June-2024, preserved Wilde observation) are separate from explicit year-end classifications (Iden/Charles-Barclay 2021, Blummenfelt 2022/2023). National #1 is not world #1; an individual PTO Open victory is not an overall title.
6. **Biography conflict:** World Triathlon explicitly calls Hogenhaug's Almere-2021 win a world championship; the approved biography says European. The research records the official world title and flags the discrepancy. The approved biography is untouched. [Federation report](https://triathlon.org/news/denmarks-kristian-hogenhaug-claims-the-long-distance-world-title-in-almere).

## Files

- [Current dataset](batch1-achievements.json): verified and local-pending arrays, sources and proposed Russian strings.
- [57-athlete coverage](batch1-coverage.json): individual queries, discovered URLs, exclusions and biography hashes.
- [44 candidate dispositions](ath04a-candidate-review.json): precise ATH-04A-to-ATH-04B transition.
- [Historical leads](historical-candidates.json): held claims with IDs, categories and source leads; no publication authorization.
- [Unresolved cases](unresolved-cases.json): historical observations preserved, continuation findings appended.
- [ATH-04A dataset archive](ath04a-checkpoint.json) and [original report](ath04a-checkpoint.md): preserved checkpoint evidence.
- [Original baseline](protected-baseline.json) remains unchanged. [Continuation baseline](ath04b-preservation.json) records the two Rankings files already changed by the approved artwork commit before this task. The validator checks their historical hashes against the old commit and current hashes against the task's starting commit; it does not exempt them from protection.
- [Validator](validate.py), [ATH-04B validation results](ath04b-validation-results.txt). The original validation log is preserved.

## Counts by category

| Category | Verified records |
|---|---:|
| 1: Olympic medal | 15 |
| 2: IRONMAN World Championship podium | 36 |
| 3: IRONMAN 70.3 World Championship podium | 34 |
| 4: Challenge Roth victory | 6 |
| 5: IRONMAN European Championship victory | 4 |
| 6: IRONMAN Pro Series overall champion | 4 |
| 7: T100/TWT overall champion | 3 |
| 8: Officially reported record | 13 |
| 9: Historical PTO World #1 — owner review | 7 |
| 10: Other World Championship podium — owner review | 40 |
| 11: Other European Championship victory — owner review | 6 |

## Complete cohort coverage

Counts include optional categories; 0 is an evidence outcome, not a career judgment. All names and IDs below come from the canonical cohort. Detailed sources and unresolved leads are in the linked JSON files.

| ID | Athlete | Verified | Local pending | Historical leads | Review outcome |
|---:|---|---:|---:|---:|---|
| 104 | Taylor Knibb | 12 | 0 | 1 | Evidence collected; open leads retained |
| 2 | Marten Van Riel | 3 | 0 | 0 | Evidence collected; open leads retained |
| 3 | Hayden Wilde | 9 | 0 | 1 | Evidence collected; open leads retained |
| 4 | Mika Noodt | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 5 | Rico Bogen | 1 | 0 | 1 | Evidence collected; open leads retained |
| 6 | Jelle Geens | 3 | 0 | 0 | Evidence collected; open leads retained |
| 7 | Casper Stornes | 3 | 1 | 0 | Evidence collected; open leads retained |
| 8 | Jonas Schomburg | 1 | 0 | 0 | Evidence collected; open leads retained |
| 9 | Samuel Dickinson | 1 | 0 | 1 | Evidence collected; open leads retained |
| 11 | Lasse Nygaard Priester | 0 | 0 | 1 | Reviewed; no qualifying achievement verified |
| 102 | Julie Derron | 3 | 0 | 2 | Evidence collected; open leads retained |
| 1 | Kristian Blummenfelt | 14 | 0 | 1 | Evidence collected; open leads retained |
| 109 | Laura Philipp | 7 | 1 | 2 | Evidence collected; open leads retained |
| 106 | Solveig Løvseth | 1 | 1 | 0 | Evidence collected; open leads retained |
| 103 | Lucy Charles-Barclay | 9 | 0 | 1 | Evidence collected; open leads retained |
| 108 | Kat Matthews | 8 | 0 | 0 | Evidence collected; open leads retained |
| 147 | Ashleigh Gentle | 3 | 0 | 1 | Evidence collected; open leads retained |
| 105 | Georgia Taylor-Brown | 10 | 0 | 0 | Evidence collected; open leads retained |
| 23 | Lionel Sanders | 2 | 0 | 1 | Evidence collected; open leads retained |
| 20 | Matthew Marquardt | 2 | 0 | 1 | Evidence collected; open leads retained |
| 41 | Vincent Luis | 6 | 0 | 1 | Evidence collected; open leads retained |
| 10521 | Sam Laidlow | 5 | 0 | 1 | Evidence collected; open leads retained |
| 114 | Paula Findlay | 1 | 0 | 0 | Evidence collected; open leads retained |
| 22 | Sam Long | 2 | 0 | 1 | Evidence collected; open leads retained |
| 111 | Alanis Siffert | 1 | 1 | 0 | Evidence collected; open leads retained |
| 39 | Trevor Foley | 0 | 0 | 1 | Reviewed; no qualifying achievement verified |
| 119 | Lisa Perterer | 1 | 0 | 0 | Evidence collected; open leads retained |
| 25 | Gustav Iden | 6 | 0 | 0 | Evidence collected; open leads retained |
| 21 | Magnus Ditlev | 7 | 0 | 0 | Evidence collected; open leads retained |
| 112 | Imogen Simmonds | 1 | 0 | 1 | Evidence collected; open leads retained |
| 113 | Hannah Berry | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 10185 | Harry Palmer | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 138 | Jackie Hering | 1 | 0 | 0 | Evidence collected; open leads retained |
| 15 | Morgan Pearson | 2 | 0 | 1 | Evidence collected; open leads retained |
| 10736 | Emma Pallant-Browne | 8 | 0 | 0 | Evidence collected; open leads retained |
| 16 | Gregory Barnaby | 1 | 0 | 0 | Evidence collected; open leads retained |
| 10458 | Panagiotis Bitados | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 130 | Marta Sánchez | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 120 | Marjolaine Pierré | 2 | 0 | 0 | Evidence collected; open leads retained |
| 13 | Mathis Margirier | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 107 | Jessica Learmonth | 3 | 0 | 0 | Evidence collected; open leads retained |
| 129 | Grace Thek | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 10 | Menno Koolhaas | 2 | 0 | 0 | Evidence collected; open leads retained |
| 42 | Léo Bergère | 7 | 0 | 1 | Evidence collected; open leads retained |
| 24 | Patrick Lange | 8 | 0 | 0 | Evidence collected; open leads retained |
| 122 | Lotte Wilms | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 131 | India Lee | 1 | 0 | 0 | Evidence collected; open leads retained |
| 35 | Kristian Høgenhaug | 2 | 0 | 0 | Evidence collected; open leads retained |
| 14 | Jason West | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 44 | Antonio Benito López | 3 | 0 | 1 | Evidence collected; open leads retained |
| 49 | Matt Hanson | 1 | 0 | 1 | Evidence collected; open leads retained |
| 146 | Els Visser | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 34 | Frederic Funk | 2 | 0 | 1 | Evidence collected; open leads retained |
| 116 | Sara Pérez Sala | 0 | 0 | 0 | Reviewed; no qualifying achievement verified |
| 37 | Cameron Wurf | 0 | 0 | 1 | Reviewed; no qualifying achievement verified |
| 10701 | Chelsea Sodaro | 2 | 0 | 0 | Evidence collected; open leads retained |
| 28 | Daniel Bækkegård | 1 | 0 | 1 | Evidence collected; open leads retained |

## Remaining official-evidence blockers

- **Laura Philipp — IRONMAN Hamburg European Championship, 2025:** Athlete results and independent race coverage agree on Hamburg 2025 European victory. Direct organizer/federation final report not obtained; retain pending official corroboration. [Cross-check](https://www.lauraphilipp.de/results/).
- **Solveig Løvseth — IRONMAN Hamburg European Championship, 2026:** K226 race report explicitly calls Lovseth European champion; broadcaster NDR corroborates. Syndicated organizer authorship not established; retain pending official evidence. [Cross-check](https://www.k226.com/news/newsitem.aspx?id=15801).
- **Casper Stornes — Mainova IRONMAN Frankfurt European Championship, 2026:** TRI247, Triathlete and Triathlon Magazine agree on 3.8 km swim, 125 km bike, 21.1 km run and European title. Direct organizer format/title notice not obtained; not a full-distance record. [Cross-check](https://www.tri247.com/triathlon-news/elite/ironman-frankfurt-2026-results-report).
- **Alanis Siffert — Challenge Roth, 2026:** BR on-site report and PTO results confirm Roth victory. Direct organizer finish evidence not obtained; do not elevate pre-race organizer preview to result evidence. [Cross-check](https://www.sportschau.de/regional/br/br-schweizerin-siffert-ueberrascht-beim-challenge-roth-2026-102.html).

## Owner decisions and next action

- Review categories 9–11 independently, especially junior/U23, relay, aquathlon/duathlon and non-triathlon disciplines. Do not silently broaden elite triathlon achievements.
- Decide whether to display historical split records and organizer-branded bests; include the year and explicit scope. No current world-record badge is justified by this collection alone.
- Resolve the Hogenhaug biography discrepancy through a separate editorial task; do not rewrite approved text during achievements integration.
- Obtain the four missing official result/title confirmations and resolve the enumerated historical leads before calling the inventory exhaustive. Review all proposed Russian strings before any import.
- Existing Kristian items stay unchanged. No runtime adapter, new icons, data regeneration, push, PR, merge or deployment is authorized by this report.

## Validation

The research validator verifies identity, key/assignment uniqueness, podium/winner categories, source references, all 44 dispositions, exact preservation of the first 24 entries, all biography hashes and application preservation. It cannot prove factual correctness of external pages. Relevant biography tests separately exercise exact text/paragraph preservation and rejection of changed identities/names/text. Actual command output is recorded in `ath04b-validation-results.txt`; no build or browser suite is claimed for this documentation-only change.
