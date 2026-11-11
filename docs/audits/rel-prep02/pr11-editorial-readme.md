# Approved athlete biographies — 300W

This directory stores **owner-approved Russian biographies** for later import into the application. The approved text is the editorial source of truth; do not overwrite it with generated content.

| Athlete ID | Athlete | File | Status |
|---|---|---|---|
| 2 | Marten Van Riel | 002-marten-van-riel.md | APPROVED |
| 3 | Hayden Wilde | 003-hayden-wilde.md | APPROVED |
| 4 | Mika Noodt | 004-mika-noodt.md | APPROVED |
| 5 | Rico Bogen | 005-rico-bogen.md | APPROVED |

## Workflow

1. Research official athlete, race and statistics sources; draft one athlete at a time.
2. Owner reviews and edits. Fact-check every newly drafted or revised biography; fix minor inaccuracies rather than rejecting an otherwise sound biography.
3. After owner approval, store final Russian prose and source URLs with the stable Athlete ID.
4. Integrate approved biographies into athlete data in a separate scoped PR, preserving athlete IDs, original names, rankings and results.
5. Maintain achievements separately; no runtime imports or deployments are implied by this editorial directory.

**TECH-01:** Full catalog regeneration remains prohibited until the ID reassignment defect is fixed.
