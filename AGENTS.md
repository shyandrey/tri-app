# TRI APP — Agent Instructions

## 1. Project

TRI APP is a professional triathlon results and statistics application built with React and TypeScript.

The repository contains:
- race and race-edition data;
- professional athlete profiles;
- race results;
- athlete ranking logic;
- data import, enrichment and audit scripts;
- UI for races, athletes and rankings.

Treat the repository as the source of truth for the current implementation.

Before making changes, inspect the relevant code and data files. Do not assume the project structure or data model from general knowledge.

## 2. Working principles

Prefer small, targeted changes over broad refactors.

Before changing existing behavior:
1. inspect the relevant implementation;
2. understand the existing data flow;
3. preserve intentional behavior unless the task explicitly changes it.

Do not silently rewrite unrelated code.

Do not introduce speculative data or "reasonable guesses" to make an audit pass.

If data cannot be verified, leave it unresolved and report it.

## 3. Git safety

The current development branch is:

`home-redesign-experiments`

The stable branch is:

`alt-series-card-tags`

Do not modify the stable branch unless explicitly instructed.

Before editing:
- check the current branch;
- check `git status`;
- preserve unrelated local changes.

Do not automatically:
- commit;
- push;
- force-push;
- rebase;
- reset;
- discard local changes.

Commit or push only when explicitly requested.

Never use destructive Git commands merely to obtain a clean working tree.

## 4. Local files that must not be committed by default

The following files may be local working artifacts:

- `ranking.txt`
- `sof.json`
- `athlete-audit.txt`

Do not add or commit them unless explicitly instructed.

Do not delete them simply because they are untracked.

## 5. Data integrity — critical rule

Never invent or infer factual triathlon data merely to fill a missing field.

This includes, without limitation:

- athlete identity;
- athlete nationality;
- gender;
- race participation;
- finishing position;
- finish time;
- swim/bike/run splits;
- DNF/DNS/DSQ status;
- race date;
- series points;
- PTO points;
- Strength of Field (SOF);
- Stats PTO profile URL;
- athlete photo.

An unresolved value is preferable to an incorrect value.

## 6. Primary data source

For imported professional race results and athlete verification, the primary source is:

`https://stats.protriathletes.org/`

Do not add tracking parameters to Stats PTO URLs.

For automated enrichment:
- verify that the returned athlete profile actually corresponds to the intended athlete;
- do not accept a result solely because a URL returned HTTP 200;
- treat redirects, name mismatches and ambiguous profiles as unresolved;
- do not overwrite verified data with weaker inferred data.

When Stats PTO does not support a value, report the unresolved case rather than guessing.

## 7. Race data model

Keep the distinction between:

### RaceEntity
The permanent race/event identity across years.

### RaceEdition
A particular edition of that race in a particular year/date.

Different editions of the same race should normally share the same `raceId`.

Do not create separate permanent races merely because the event occurred in another year.

## 8. Current results coverage

The intended professional-results coverage currently includes:

- IRONMAN Pro Series: 2024, 2025, 2026
- T100 / Triathlon World Tour: 2024, 2025, 2026
- Challenge Roth: 2024, 2025, 2026

2023 coverage is not currently required.

Challenge Roth data exists but is intentionally hidden from parts of the UI/search/filtering.

Do not restore Roth visibility unless explicitly requested.

## 9. Race UI decisions

The generic "О гонке" / "About the race" block was intentionally removed from race-result pages because it did not provide useful information.

Do not restore it unless explicitly requested.

## 10. Athlete catalog

Athletes may come from:
- curated athlete files;
- generated athlete profiles;
- verified generated profiles.

Generated profiles are legitimate catalog entries and must participate in:
- photo lookup;
- localization;
- country filtering;
- ranking;
- result linking.

Do not assume that only curated profiles are real athletes.

## 11. Athlete localization

The Russian UI should normally show:

Russian display name  
English name  
country information

Do not automatically transliterate hundreds of athlete names using an uncontrolled generic transliteration algorithm.

Prefer:
- explicit verified localization;
- a controlled generated localization dataset;
- unresolved English names where confidence is insufficient.

Preserve manually curated Russian names.

Country codes should use the project's normalized two-letter representation.

## 12. Athlete identity

Be careful with:
- accents and diacritics;
- hyphenated surnames;
- multiple given names;
- spelling variants;
- renamed/married athletes;
- athletes with similar names.

Do not merge profiles solely on approximate string similarity.

Existing result-to-athlete linkage must not be broken merely to make names look consistent.

## 13. Athlete photos

Athlete photos are stored locally under:

`public/athletes/`

Photo mappings are maintained through the project's generated photo registry.

Do not introduce runtime hotlinking to third-party athlete images.

A missing photo is acceptable.

The initials placeholder is intentional and should remain available when no verified local photo exists.

Do not accept a photo match solely because an image search/import scoring algorithm gives it a high score.

## 14. Athlete audit

The project contains:

`npm run audit:athletes`

Use it after changes affecting athlete data, identity, localization, countries, photos or result linkage.

Important audit categories include:
- generated profiles still using English-only display names;
- code-like country labels;
- missing country codes;
- missing photos;
- profiles without linked results;
- consistency issues.

Do not manipulate data merely to reduce audit counts.

An audit count of zero is useful only when the underlying data is correct.

## 15. Result audit

The project contains:

`npm run audit:results`

Run it after changes affecting:
- race results;
- result parsing;
- athlete-result linking;
- race edition data;
- result status handling.

Known source anomalies may be documented by the existing audit implementation.

Do not "fix" documented source anomalies by inventing replacement data.

## 16. SOF

RaceEdition may contain:

`sof?: { women?: number; men?: number }`

SOF collection uses stored Stats PTO URLs.

Never guess a Stats PTO race URL or race slug merely to obtain SOF.

If a race page cannot be verified, leave SOF unresolved.

## 17. Athlete ranking

TRI APP uses its own internal athlete-ranking model.

Production implementation:

`src/utils/athleteRanking.ts`

Do not replace or materially modify the ranking formula unless explicitly requested.

Current important characteristics include:
- performance score based on finishing place;
- race tiers;
- recency weighting;
- confidence adjustment based on number of starts;
- S-tier podium bonuses;
- bounded activity bonus;
- DNF/DSQ starts count as starts with zero performance score;
- DNS is excluded.

When changing unrelated athlete/catalog code, preserve ranking order.

## 18. UI filtering

Athlete filters should compose rather than unexpectedly reset one another.

Country ordering should remain stable when gender filters change.

Search/filter changes must not silently change athlete ranking order.

Preserve wrong-keyboard-layout search support unless explicitly changing search behavior.

## 19. Generated files

Before manually editing a generated file, inspect the script that generates it.

Determine whether the change would be lost the next time the generator runs.

Where enrichment must survive regeneration, prefer a persistent registry/override mechanism or update the generator itself.

Do not build long-term manually curated state into a generated file without considering regeneration.

## 20. Validation workflow

For a typical code/data change:

1. inspect `git status`;
2. inspect relevant files;
3. make the smallest appropriate change;
4. run the relevant audit/test;
5. inspect the resulting diff;
6. report what changed and any unresolved cases.

When appropriate, also run the project's available typecheck/build checks.

Do not claim that a build, typecheck, audit or test passed unless it was actually executed.

## 21. Reporting results

After completing a task, report concisely:

- files changed;
- what behavior/data changed;
- commands/checks actually run;
- their result;
- unresolved issues;
- whether anything remains uncommitted.

Distinguish clearly between:
- verified facts;
- assumptions;
- unresolved data.

## 22. Working with other agents

This repository may be edited by both ChatGPT and Codex.

Treat committed repository state as the shared technical state.

Do not assume another agent's uncommitted local changes are visible.

When continuing work performed by another agent:
- inspect the current repository state;
- inspect recent relevant commits/diffs if necessary;
- do not rely solely on a prose description of what was supposedly changed.

`AGENTS.md` contains persistent operating rules, not a chronological development log.

## 23. Autonomy boundaries

Unless the task explicitly grants broader autonomy:

The agent MAY:
- read any repository file;
- search the codebase;
- run read-only Git commands;
- run existing audits, tests, typechecks and builds;
- edit files necessary for the assigned task;
- inspect diffs.

The agent MUST ASK before:
- committing;
- pushing;
- changing dependencies;
- deleting significant data;
- changing the data model;
- materially changing ranking logic;
- performing broad refactors outside the assigned task.

The agent MUST NOT:
- force-push;
- discard unrelated local changes;
- fabricate missing sports data;
- weaken audits merely to make them pass.
