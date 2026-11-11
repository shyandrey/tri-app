"""ATH-04C editorial validation; no runtime import or catalog regeneration."""
import collections
import copy
import hashlib
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
START = '1dbc6f3266027fdfc58f6d1801adc331d9a20f17'

def read(name):
    return json.loads((HERE / name).read_text())

def old(path):
    return subprocess.check_output(['git', 'show', START + ':' + path], cwd=ROOT)

def check(ok, message):
    if not ok:
        raise AssertionError(message)

fixture = json.loads((ROOT / 'scripts/fixtures/approved-athlete-biographies.json').read_text())
expected = {r['id']: r for r in fixture}
data = read('v1-achievements.json')
coverage = read('v1-coverage.json')
review = read('v1-review.json')
legacy = read('batch1-achievements.json')

def validate_rows(rows):
    keys = set()
    identities = set()
    for r in rows:
        check(r['achievementKey'] not in keys, 'Duplicate achievement key')
        keys.add(r['achievementKey'])
        check(r['athleteId'] in expected and r['athleteNameEn'] == expected[r['athleteId']]['nameEn'], 'Identity mismatch')
        check(r['category'] in range(1, 9), 'Out-of-scope category')
        check(r['position'] in ((1,) if r['category'] in (4, 5) else (1, 2, 3)), 'Invalid placing')
        if r['verificationStatus'] == 'VERIFIED_EXISTING_RESULT':
            check(r['category'] == 4 and r.get('localResultEvidence') and not r['officialSourceUrls'], 'Invalid local-result promotion')
            urls = r['sourceUrls']
        else:
            check(r['verificationStatus'] == 'VERIFIED_OFFICIAL', 'Unverified promoted')
            urls = r['officialSourceUrls']
        check(r['sourceIds'] and urls == [data['sources'][s]['url'] for s in r['sourceIds']], 'Source mismatch')
        check(r['suggestedDisplayRu'].strip() and r['gender'] in ('W', 'M', 'MIXED'), 'Missing display/gender')
        identity = (r['athleteId'], r['category'], r['competitionName'], r['season'], r['gender'])
        check(identity not in identities, 'Duplicate achievement assignment')
        identities.add(identity)
        if 'localResultEvidence' in r:
            e = r['localResultEvidence']
            content = (ROOT / e['path']).read_bytes()
            check(hashlib.sha256(content).hexdigest() == e['sha256'], 'Result evidence changed')
            expected_row = "'" + r['gender'] + "','" + r['athleteNameEn'] + "'," + str(r['position']) + ','
            check(content.decode().count(expected_row) == 1, 'Finish/identity does not match result')
        if r['category'] == 8:
            check(r.get('hostCity') and r.get('finalDesignationEvidence'), 'Final needs city and designation evidence')

check(data['integrationAuthorized'] is False and data['exhaustiveCareerCompletenessClaimed'] is False, 'Unsupported authorization/completeness')
validate_rows(data['verifiedAchievements'])
check(len(expected) == len(coverage) == 57 and {c['athleteId'] for c in coverage} == set(expected), 'Cohort changed')
keys = {r['achievementKey'] for r in data['verifiedAchievements']}
excluded = {r['achievementKey'] for r in read('v1-exclusions.json')['verifiedATH04BEntries']}
legacy_keys = {r['achievementKey'] for r in legacy['verifiedAchievements']}
check(not keys & excluded and (keys | excluded) >= legacy_keys, 'Historical disposition incomplete')
for r in legacy['verifiedAchievements']:
    if r['category'] >= 8:
        check(r['achievementKey'] in excluded, 'Out-of-scope historical row retained')
    else:
        current = next(x for x in data['verifiedAchievements'] if x['achievementKey'] == r['achievementKey'])
        for k, v in r.items():
            check(current[k] == ({6: 7, 7: 6}.get(v, v) if k == 'category' else v), 'Historical evidence changed: ' + r['achievementKey'])
pending = review['pendingCandidates']
check(len({p['key'] for p in pending}) == len(pending), 'Duplicate review candidate')
for p in pending:
    check(p['athleteId'] in expected and p['category'] in range(1, 9), 'Invalid pending identity/scope')
    e = p.get('evidence', {})
    if 'sha256' in e:
        check(hashlib.sha256((ROOT / e['path']).read_bytes()).hexdigest() == e['sha256'], 'Local evidence changed')
for c in coverage:
    check(c['nameEn'] == expected[c['athleteId']]['nameEn'], 'Coverage identity')
    check(c['verifiedAchievementKeys'] == [r['achievementKey'] for r in data['verifiedAchievements'] if r['athleteId'] == c['athleteId']], 'Coverage keys')
    check(c['pendingKeys'] == [p['key'] for p in pending if p['athleteId'] == c['athleteId']], 'Coverage pending keys')
# Preserve all ATH-04A/B evidence byte for byte; the former validator remains usable at its historical commit.
for p in ['README.md','batch1-achievements.json','batch1-coverage.json','historical-candidates.json','unresolved-cases.json','ath04a-checkpoint.json','ath04a-candidate-review.json','protected-baseline.json','ath04b-preservation.json']:
    check((HERE / p).read_bytes() == old('docs/athlete-achievements/' + p), 'Historical evidence changed: ' + p)
check((HERE / 'validate-ath04b.py').read_bytes() == old('docs/athlete-achievements/validate.py'), 'Historical validator changed')
# Exact two owner-authorized substitutions, and absolutely no other runtime/data/biography change.
pairs = [
('Десять лет спустя датчанин стал чемпионом Европы на длинной дистанции.', 'Десять лет спустя датчанин стал чемпионом мира World Triathlon на длинной дистанции.'),
('В 2021 году Хогенхауг выиграл Challenge Almere-Amsterdam за 7:37:46 и стал чемпионом Европы на длинной дистанции.', 'В 2021 году Хогенхауг выиграл Challenge Almere-Amsterdam за 7:37:46 и стал чемпионом мира World Triathlon на длинной дистанции.')]
allowed = {'docs/athlete-bios/approved/050-kristian-hogenhaug.md', 'src/data/athletes/athleteBiographies.json'}
for path in allowed:
    content = old(path).decode()
    for before, after in pairs:
        check(content.count(before) == 1, 'Unexpected historical source text')
        content = content.replace(before, after)
    check((ROOT / path).read_text() == content, 'Unauthorized biography change: ' + path)
for f in fixture:
    path = 'docs/athlete-bios/approved/' + f['file']
    check(hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == f['sha256'], 'Biography pin mismatch')
    if f['id'] != 35:
        check((ROOT / path).read_bytes() == old(path), 'Other approved biography changed')
fp = 'scripts/fixtures/approved-athlete-biographies.json'
old_fixture = json.loads(old(fp))
old_fixture_hash = hashlib.sha256(old(fp)).hexdigest()
for r in old_fixture:
    if r['id'] == 35:
        r['sha256'] = expected[35]['sha256']
check(old_fixture == fixture, 'Other fixture fields changed')
cp = 'scripts/approved-biography-contract.mjs'
check((ROOT / cp).read_text() == old(cp).decode().replace(old_fixture_hash, hashlib.sha256((ROOT / fp).read_bytes()).hexdigest()), 'Biography contract weakened')
changed = subprocess.check_output(['git', 'diff', START, '--name-only', '--', 'src', 'public', 'scripts', 'docs/athlete-bios'], cwd=ROOT).decode().splitlines()
check(set(changed) <= allowed | {fp, cp}, 'Unrelated protected files changed')
check((ROOT / 'src/data/athletes/men.ts').read_bytes() == old('src/data/athletes/men.ts'), 'Kristian achievements changed')
# Negative fixtures must be rejected, not silently dropped.
for mutation in ['duplicate', 'identity', 'category', 'placing', 'source']:
    bad = copy.deepcopy(data['verifiedAchievements'])
    if mutation == 'duplicate': bad.append(copy.deepcopy(bad[0]))
    if mutation == 'identity': bad[0]['athleteId'] = -1
    if mutation == 'category': bad[0]['category'] = 10
    if mutation == 'placing': bad[0]['position'] = 4
    if mutation == 'source': bad[0]['officialSourceUrls'] = []
    try:
        validate_rows(bad)
    except AssertionError:
        pass
    else:
        raise AssertionError('Negative fixture accepted: ' + mutation)
print('PASS: 57 unique identities; exact coverage, pending and exclusion mappings')
print('PASS: v1 scope, podium/winner rules, source references; 5 negative fixtures')
print('PASS: ATH-04A/B evidence preserved; exactly two ID35 text substitutions; 56 other biographies byte-identical')
print('PASS: only expected integrity pins updated; all four Kristian runtime achievements unchanged')
print('Verified:',len(keys),'Excluded historical:',len(excluded),'Pending:',len(pending))
print('Categories:', dict(sorted(collections.Counter(r['category'] for r in data['verifiedAchievements']).items())))
