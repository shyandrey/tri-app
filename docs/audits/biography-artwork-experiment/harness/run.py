import subprocess,os,pathlib,json,time,urllib.request
root=pathlib.Path('/private/tmp/300w-bio-art-experiment-20261110');results=[]
for label,base in [('baseline','http://127.0.0.1:5490'),('bio','http://127.0.0.1:5491'),('art','http://127.0.0.1:5492')]:
 for script in ['measure','usability','profile']:
  key=label+'-'+script
  with open(root/(key+'.chrome.log'),'w') as clog,open(root/(key+'.log'),'w') as log:
   chrome=subprocess.Popen(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless=new','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-background-timer-throttling','--remote-debugging-port=9491',f'--user-data-dir={root}/chrome-{key}','--no-first-run','--no-default-browser-check','about:blank'],stdout=clog,stderr=subprocess.STDOUT)
   try:
    for _ in range(100):
     try: urllib.request.urlopen('http://127.0.0.1:9491/json/version',timeout=1);break
     except Exception:time.sleep(.1)
    run=subprocess.run(['node',str(root/(script+'.mjs'))],env={**os.environ,'BASE':base,'LABEL':key},stdout=log,stderr=subprocess.STDOUT,timeout=360)
    results.append({'cohort':key,'exit':run.returncode});(root/'runs.json').write_text(json.dumps(results));print(key,run.returncode,flush=True)
    if run.returncode:raise SystemExit(run.returncode)
   finally:chrome.terminate();chrome.wait(timeout=10)
