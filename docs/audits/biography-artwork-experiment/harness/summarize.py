import json,pathlib,statistics,collections
root=pathlib.Path('/private/tmp/300w-bio-art-experiment-20261110');summary={}
def stats(values):return {'median':statistics.median(values),'min':min(values),'max':max(values),'n':len(values)}
for variant in ['baseline','bio','art']:
 f=root/(variant+'-measure.json')
 if not f.exists():continue
 rows=json.loads(f.read_text());item={}
 for device in ['mobile','desktop']:
  xs=[r for r in rows if r['label']==device]
  if not xs:continue
  item[device]={
   'lcpMs':stats([r['data']['lcp'][-1]['start'] for r in xs]),
   'tableVisibleMs':stats([r['data']['tableVisible'] for r in xs]),
   'initialJsTransferBytes':stats([sum(q.get('bytes',0) for q in r['requests'] if q['type']=='Script') for r in xs]),
   'initialJsBodyBytes':stats([sum(q['encoded'] for q in r['data']['resources'] if '.js' in q['name']) for r in xs]),
   'cls':stats([sum(q['value'] for q in r['data']['cls'] if not q['input']) for r in xs]),
   'scriptDurationMs':stats([next(q['value'] for q in r['metrics'] if q['name']=='ScriptDuration')*1000 for r in xs]),
   'longTaskExcessMs':stats([sum(max(0,q['duration']-50) for q in r['data']['long']) for r in xs])}
 f=root/(variant+'-usability.json')
 if f.exists():
  xs=json.loads(f.read_text());item['tableUsableMs']=stats([r['data']['tableUsable'] for r in xs]);item['genderResponseMs']=stats([r['data']['tableUsable']-r['data']['clickStart'] for r in xs])
 f=root/(variant+'-profile-profile.json')
 if f.exists():
  xs=json.loads(f.read_text());item['profile']={m:stats([r['profileMs'] for r in xs if r['mode']==m]) for m in ['immediate','delayed']}
 summary[variant]=item
(root/'summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary,indent=2))
