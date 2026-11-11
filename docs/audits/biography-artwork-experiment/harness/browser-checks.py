import subprocess,os,pathlib,json,time,urllib.request
root=pathlib.Path('/private/tmp/300w-bio-art-experiment-20261110');results=[]
scripts=['test-official-rankings-browser.mjs','test-rankings-swipe-browser.mjs','test-rankings-showcase-browser.mjs','test-navigation-browser.mjs','test-approved-biographies-browser.mjs','visual.mjs']
for script in scripts:
 key=script.removesuffix('.mjs'); art=root/'browser'/key;art.mkdir(parents=True,exist_ok=True)
 with open(art/'chrome.txt','w') as clog,open(art/'result.txt','w') as log:
  chrome=subprocess.Popen(['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','--headless=new','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-background-timer-throttling','--remote-debugging-port=9491',f'--user-data-dir={art}/profile','--no-first-run','--no-default-browser-check','about:blank'],stdout=clog,stderr=subprocess.STDOUT)
  try:
   for _ in range(100):
    try:urllib.request.urlopen('http://127.0.0.1:9491/json/version',timeout=1);break
    except Exception:time.sleep(.1)
   command=['node',str(root/script) if script=='visual.mjs' else 'scripts/'+script]
   env={**os.environ,'TRI_APP_URL':'http://127.0.0.1:5492','TRI_CDP_URL':'http://127.0.0.1:9491','TRI_ARTIFACT_DIR':str(art),'TRI_SHOWCASE_OUTPUT':str(art/'screenshots')}
   r=subprocess.run(command,cwd=root/'art',env=env,stdout=log,stderr=subprocess.STDOUT,timeout=600)
   results.append({'suite':script,'exit':r.returncode});(root/'browser-results.json').write_text(json.dumps(results,indent=2));print(script,r.returncode,flush=True)
   if r.returncode:raise SystemExit(r.returncode)
  finally:chrome.terminate();chrome.wait(timeout=10)
