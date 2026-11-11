"""Read-only validation of the ATH-04B research continuation (not a runtime importer)."""
import collections
import hashlib
import json
import subprocess
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]

def read(name):
    return json.loads((HERE / name).read_text())

def check(condition, message):
    if not condition:
        raise AssertionError(message)

data = read('batch1-achievements.json')
coverage = read('batch1-coverage.json')
baseline = read('protected-baseline.json')
fixture = json.loads((ROOT / 'scripts/fixtures/approved-athlete-biographies.json').read_text())
expected = {r['id']: r for r in fixture}
check(len(fixture) == len(expected) == len(coverage) == 57, '57 unique cohort members required')
check(sorted(r['athleteId'] for r in coverage) == sorted(expected) == baseline['cohortIds'], 'Cohort IDs changed')
check(data['integrationAuthorized'] is False, 'Research cannot authorize profile import')
all_rows = data['verifiedAchievements'] + data['localCandidatesNotApprovedForIntegration']
keys = [r['achievementKey'] for r in all_rows]
check(len(keys) == len(set(keys)), 'Duplicate achievement key')
identities = [(r['athleteId'], r['category'], r['competitionName'], r['season'], r['gender'], r['kind']) for r in all_rows]
check(len(identities) == len(set(identities)), 'Duplicate achievement assignment')
for row in all_rows:
    aid = row['athleteId']
    check(aid in expected and row['athleteNameEn'] == expected[aid]['nameEn'], 'Canonical identity mismatch')
    check(row['category'] in range(1, 12), 'Unknown category')
    check(row['gender'] in ('M', 'W', 'MIXED'), 'Unknown gender')
    check(row['eventYear'] <= 2026, 'Future achievement')
    check(row['suggestedDisplayRu'].strip(), 'Missing proposed display string')
    if row['category'] in (1, 2, 3):
        check(row['position'] in (1, 2, 3), 'Non-podium in podium category')
    if row['category'] in (4, 5, 6, 7, 11):
        check(row['position'] == 1, 'Non-winner in winner-only category')
    if row['verificationStatus'] == 'VERIFIED_OFFICIAL':
        check(row['sourceIds'] and row['officialSourceUrls'], 'Missing official evidence')
        check(row['officialSourceUrls'] == [data['sources'][k]['url'] for k in row['sourceIds']], 'Source mapping mismatch')
        for url in row['officialSourceUrls']:
            check(urlparse(url).scheme == 'https', 'Non-HTTPS official source')
        check(row['ownerCategoryReviewRequired'] == (row['category'] >= 9), 'Optional category not separated')
    else:
        check(row['verificationStatus'] == 'LOCAL_RESULT_MATCH_OFFICIAL_CORROBORATION_PENDING', 'Unknown pending status')
        check(not row['officialSourceUrls'], 'Pending official evidence mislabeled')
        check(row['localEvidence']['paths'], 'Missing local provenance')
        check(all((ROOT / p).is_file() for p in row['localEvidence']['paths']), 'Missing local result file')
for c in coverage:
    check(c['reviewStatus'] == 'EXTERNAL_CAREER_REVIEWED_WITH_EVIDENCE_GAPS', 'Incorrect completion claim')
    check(c['externalReview']['resultUrls'] and c['externalReview']['athleteId'] == c['athleteId'], 'Missing individual review')
    check(c['biographySha256'] == expected[c['athleteId']]['sha256'], 'Biography provenance mismatch')
    actual = hashlib.sha256((ROOT / c['biographyFile']).read_bytes()).hexdigest()
    check(actual == c['biographySha256'], 'Approved biography changed')
    for field, arr in [('verifiedAchievementKeys', data['verifiedAchievements']), ('localCandidateKeys', data['localCandidatesNotApprovedForIntegration'])]:
        check(c[field] == [r['achievementKey'] for r in arr if r['athleteId'] == c['athleteId']], 'Coverage count mismatch')
preservation = read('ath04b-preservation.json')
checkpoint = read('ath04a-checkpoint.json')
reviews = read('ath04a-candidate-review.json')
check(checkpoint == json.loads(subprocess.check_output(['git','show',preservation['startingCommit']+':docs/athlete-achievements/batch1-achievements.json'], cwd=ROOT)), 'Historical checkpoint altered')
check(data['verifiedAchievements'][:24] == checkpoint['verifiedAchievements'], 'Original 24 records changed')
check(all(data['sources'].get(k) == v for k,v in checkpoint['sources'].items()), 'Original source evidence changed')
check(len(reviews) == 44 and {r['achievementKey'] for r in reviews} == {r['achievementKey'] for r in checkpoint['localCandidatesNotApprovedForIntegration']}, 'All 44 candidates need a disposition')
check(data['exhaustiveCareerCompletenessClaimed'] is False, 'Do not claim exhaustive coverage')
for path, sha in baseline['protectedTrackedFiles'].items():
    actual = hashlib.sha256((ROOT / path).read_bytes()).hexdigest()
    delta = preservation['preExistingChangesSinceAth04A'].get(path)
    if delta:
        old = subprocess.check_output(['git','show',baseline['catalogCommit']+':'+path], cwd=ROOT)
        at_start = subprocess.check_output(['git','show',preservation['startingCommit']+':'+path], cwd=ROOT)
        check(hashlib.sha256(old).hexdigest() == sha == delta['ath04aSha256'], 'Historical baseline altered: '+path)
        check(hashlib.sha256(at_start).hexdigest() == actual == delta['ath04bStartSha256'], 'Pre-existing change altered: '+path)
    else:
        check(actual == sha, 'Protected file changed: '+path)
check(not subprocess.check_output(['git','diff',preservation['startingCommit'],'--','src','public','scripts'],cwd=ROOT), 'Runtime, assets or test contracts changed')
check(len(baseline['kristianAchievements']) == 4, 'Kristian reference incomplete')
leads = read('historical-candidates.json')
check(len({r['candidateKey'] for r in leads}) == len(leads), 'Duplicate historical lead')
for r in leads:
    check(r['athleteId'] in expected and r['athleteNameEn'] == expected[r['athleteId']]['nameEn'], 'Historical lead identity mismatch')
    check(r['verificationStatus'] == 'HOLD_NOT_APPROVED' and r['sourceUrl'].startswith('https://'), 'Historical lead mislabeled')
    check(r['ownerCategoryReviewRequired'] == (r['category'] >= 9), 'Optional lead scope missing')
for review in reviews:
    destination = data['verifiedAchievements'] if review['outcome'] == 'PROMOTED_OFFICIAL' else data['localCandidatesNotApprovedForIntegration']
    check(any(r['achievementKey'] == review['achievementKey'] for r in destination), 'Candidate disposition does not match dataset')
print('PASS: 57 canonical IDs, biography hashes and individual external review records')
print('PASS: original 24 entries byte-equivalent as JSON; all 44 candidate dispositions retained')
print('PASS: unique assignments, podium/winner constraints, source mappings, optional scopes')
print('PASS: protected source/assets/biography files:', len(baseline['protectedTrackedFiles']))
print('PASS: 4 existing Kristian achievement strings protected; runtime/tests unchanged from ATH-04B start')
print('PASS: historical baseline retained; 2 already-approved Rankings changes match starting commit')
print('Verified:',len(data['verifiedAchievements']),'Local pending:',len(data['localCandidatesNotApprovedForIntegration']),'Historical leads:',len(leads))
print('Verified counts:', dict(sorted(collections.Counter(r['category'] for r in data['verifiedAchievements']).items())))
