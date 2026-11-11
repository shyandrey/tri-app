import pathlib,json,collections,urllib.parse
root=pathlib.Path('/private/tmp/300w-final-perf-20261110');rows=json.loads((root/'browser.json').read_text());inventory=json.loads((root/'image-inventory.json').read_text());assets={x['emittedAs']:x for x in inventory if x['emittedAs']};out=[]
for row in rows:
 requests=row['requests'];images=[q for q in requests if q['type']=='Image' or q.get('mime','').startswith('image/')]
 formats=collections.defaultdict(lambda:{'requests':0,'wireBytes':0});group=collections.defaultdict(list)
 for q in images:
  key=urllib.parse.urlparse(q['url']).path.lstrip('/');asset=assets.get(key);fmt=asset.get('format','svg') if asset else q.get('mime','unknown');formats[fmt]['requests']+=1;formats[fmt]['wireBytes']+=q.get('bytes',0);group[q['url']].append(q)
 large=sorted(images,key=lambda q:-q.get('bytes',0))[:3];oversized=[]
 for im in row['data']['images']:
  asset=assets.get(urllib.parse.urlparse(im['url']).path.lstrip('/'))
  if asset and asset.get('width') and im['visible'] and im['width'] and im['height']:
   density=min(asset['width']/im['width'],asset['height']/im['height'])/row['dpr']
   if density>1.5:oversized.append({'url':im['url'],'sourcePixels':[asset['width'],asset['height']],'renderedCss':[im['width'],im['height']],'factorOverDpr':density,'loading':im['loading']})
 item={'device':row['label'],'route':row['route'],'mode':row['mode'],'readyMs':row['ready'],'lcpMs':row['data']['lcp'][-1]['start'] if row['data']['lcp'] else None,'cls':sum(e['value'] for e in row['data']['cls'] if not e['input']),'totalTransferBytes':sum(q.get('bytes',0) for q in requests),'jsTransferBytes':sum(q.get('bytes',0) for q in requests if q['type']=='Script'),'imageRequestEvents':len(images),'imageTransferBytes':sum(q.get('bytes',0) for q in images),'formats':formats,'largestImages':[{'url':q['url'],'bytes':q.get('bytes',0),'priority':q.get('priority')} for q in large],'duplicateImageEvents':{k:len(v) for k,v in group.items() if len(v)>1},'duplicateImageTransfers':{k:len([q for q in v if q.get('bytes',0)>0]) for k,v in group.items() if len([q for q in v if q.get('bytes',0)>0])>1},'failedRequests':[q for q in requests if q.get('status',200)>=400 or q.get('failure')],'incompleteRequests':[q for q in requests if 'bytes' not in q and not q.get('failure')],'oversizedVisible':oversized,'errors':row['data']['errors'],'apiRequests':[q for q in requests if '/api/' in q['url']]}
 out.append(item)
(root/'network-summary.json').write_text(json.dumps(out,indent=2))
for r in out:print(r['device'],r['route'],r['mode'],r['imageRequestEvents'],r['imageTransferBytes'],list(r['formats']),len(r['failedRequests']),len(r['incompleteRequests']))
