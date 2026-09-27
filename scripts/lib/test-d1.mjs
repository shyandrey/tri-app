import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {spawnSync} from 'node:child_process'
export function testD1(t) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tri-news-test-')),file=path.join(dir,'db.sqlite')
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}))
 const execute=(operations,script)=>{
  const r=spawnSync('python3',['-c',`import sqlite3,json,sys
p=json.load(sys.stdin); c=sqlite3.connect(p['file']); c.row_factory=sqlite3.Row; out=[]
with c:
 if p.get('script'): c.executescript(p['script'])
 else:
  for op in p['operations']: out.append({'results':[dict(r) for r in c.execute(op['sql'],op['params']).fetchall()],'success':True})
print(json.dumps(out))`],{input:JSON.stringify({file,operations,script}),encoding:'utf8'})
  if(r.status!==0)throw Error(r.stderr)
  return JSON.parse(r.stdout)
 }
 for(const migration of ['0001_feedback_news.sql','0002_feedback_delivery.sql','0003_news_ingestion.sql','0004_news_source.sql'])execute([],fs.readFileSync('migrations/'+migration,'utf8'))
 const db={prepare(sql){return {sql,params:[],bind(...params){this.params=params;return this},async all(){return execute([this])[0]},async first(){return execute([this])[0].results[0]??null},async run(){return execute([this])[0]}}},async batch(statements){return execute(statements)},query(sql,params=[]){return execute([{sql,params}])[0].results},script(sql){execute([],sql)}}
 return db
}
