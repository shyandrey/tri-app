import time,json,pathlib
for attempt in range(600):
 p=pathlib.Path('/private/tmp/300w-final-perf-20261110/runs.json')
 rows=json.loads(p.read_text()) if p.exists() else []
 if any(r['exit'] for r in rows):raise SystemExit('Main cohort failed; network not started')
 if len(rows)==6:time.sleep(2);break
 time.sleep(1)
else:raise SystemExit('Main cohort timeout')
import subprocess,os,pathlib,json,time,urllib.request
root=pathlib.Path('/private/tmp/300w-final-perf-20261110');results=[]
for label,base in [('network','http://127.0.0.1:5490')]:
 for script in ['routes']:
  key=label+'-'+script
  with open(root/(key+'.chrome.log'),'w') as clog,open(root/(key+'.log'),'w') as log:
   chrome=subprocess.Popen(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless=new','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-background-timer-throttling','--remote-debugging-port=9491',f'--user-data-dir={root}/chrome-{key}','--no-first-run','--no-default-browser-check','about:blank'],stdout=clog,stderr=subprocess.STDOUT)
   try:
    for _ in range(100):
     try: urllib.request.urlopen('http://127.0.0.1:9491/json/version',timeout=1);break
     except Exception:time.sleep(.1)
    run=subprocess.run(['node',str(root/(script+'.mjs'))],env={**os.environ,'BASE':base,'LABEL':key},stdout=log,stderr=subprocess.STDOUT,timeout=480)
    results.append({'cohort':key,'exit':run.returncode});(root/'network-runs.json').write_text(json.dumps(results));print(key,run.returncode,flush=True)
    if run.returncode:raise SystemExit(run.returncode)
   finally:chrome.terminate();chrome.wait(timeout=10)
