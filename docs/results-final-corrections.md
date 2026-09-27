# Final approved corrections

Dataset clock: 2026-09-19T12:00:00.000Z (French Riviera). Results 4493; athletes 1167. SOF unchanged: Nice M 96.35 / W 96.18; Riviera M 96.12. Nick Thompson → AU; Jeremy Maclean → US, verified registry plus generated projection. No other profiles changed; IDs/linkage retained.

## TOP-20 M

| Position | Athlete | Score |
|---|---|---|
| 1 | Hayden Wilde | 125.885074 |
| 2 | Kristian Blummenfelt | 94.967438 |
| 3 | Jelle Geens | 85.724690 |
| 4 | Marten Van Riel | 78.446573 |
| 5 | Casper Stornes | 74.053829 |
| 6 | Sam Laidlow | 65.903316 |
| 7 | Lionel Sanders | 60.729519 |
| 8 | Mika Noodt | 59.640689 |
| 9 | Matthew Marquardt | 55.230323 |
| 10 | Trevor Foley | 55.115863 |
| 11 | Rico Bogen | 54.032914 |
| 12 | Magnus Ditlev | 53.948156 |
| 13 | Sam Long | 53.101521 |
| 14 | Lasse Nygaard Priester | 50.230900 |
| 15 | Jonas Schomburg | 47.929780 |
| 16 | Harry Palmer | 45.876100 |
| 17 | Samuel Dickinson | 45.565210 |
| 18 | Morgan Pearson | 44.710079 |
| 19 | Panagiotis Bitados | 41.859103 |
| 20 | Patrick Lange | 41.295323 |

## TOP-20 W

| Position | Athlete | Score |
|---|---|---|
| 1 | Taylor Knibb | 119.068217 |
| 2 | Kate Waugh | 100.616751 |
| 3 | Julie Derron | 91.504854 |
| 4 | Solveig Løvseth | 90.887116 |
| 5 | Lucy Charles-Barclay | 86.123709 |
| 6 | Laura Philipp | 84.195140 |
| 7 | Kat Matthews | 77.442974 |
| 8 | Ashleigh Gentle | 67.197574 |
| 9 | Georgia Taylor-Brown | 62.785014 |
| 10 | Paula Findlay | 58.346908 |
| 11 | Alanis Siffert | 50.915855 |
| 12 | Lisa Perterer | 48.548376 |
| 13 | Imogen Simmonds | 46.946630 |
| 14 | Jackie Hering | 46.919778 |
| 15 | Hannah Berry | 46.401050 |
| 16 | Marjolaine Pierré | 45.207311 |
| 17 | Emma Pallant-Browne | 42.542709 |
| 18 | Marta Sánchez | 42.404453 |
| 19 | Caroline Pohle | 40.725313 |
| 20 | Katrine Græsbøll Christensen | 40.546295 |

## Validation

50/50 tests passed: import/SOF, ranking, dataset-clock, country-strength, navigation and search. Results audit: 0 errors / 0 warnings. Athletes audit: 2 pre-existing issues, no new issues, 0 profiles without linked results. Build passed (>500 kB chunk warning). ESLint: 0 errors / 1 existing RaceDetailPage useMemo warning. git diff --check passed.

Browser production build: Nice MEN 56 / WOMEN 50, Riviera MEN 20; new races in Athlete Profile, generated profile 20012 linked, Back and scroll restored. Ranking MEN/WOMEN matches production order at 390px and 1440px. Reload preserves identical Ranking MEN/WOMEN and Country Strength ALL/MEN/WOMEN. AU shows Nick and excludes Jeremy; US shows Jeremy and excludes Nick; both retain IDs, new history and Back-selected country.

126 new rows, 4367 → 4493 results; six new profiles, 1161 → 1167 athletes. Historical result rows/IDs remain identical; prior profile data remain identical except explicitly approved country fields for IDs 10435/10235. Production SOF and ranking formula are unchanged. DNF remains one start plus recency denominator and zero place-performance numerator.

Earlier import/SOF reports are historical snapshots from before the approved clock/country corrections. This document and final-ranking-dataset-clock.json represent the final state. No add/commit/push. Awaiting final approval.
