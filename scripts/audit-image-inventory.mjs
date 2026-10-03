import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import {createServer} from 'vite'
const out=process.env.TRI_IMAGE_OUT??'/tmp/tri-images-review'
const before=JSON.parse(await fs.readFile(out+'/before.json','utf8'))
const after=JSON.parse(await fs.readFile(out+'/after.json','utf8'))
const derivatives=JSON.parse(await fs.readFile('src/generated/image-variants.json','utf8'))
const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'silent'})
let athletes
try{({athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts'))}finally{await server.close()}
const used=new Set(athletes.map(a=>a.image).filter(Boolean))
const files=(await Promise.all(['src/assets','public'].map(async dir=>(await fs.readdir(dir,{recursive:true})).filter(f=>/\.(png|jpe?g|webp|avif)$/i.test(f)&&!f.startsWith('optimized/')).map(f=>path.join(dir,f))))).flat().sort()
const rows=[]
const matches=(url,file)=>{const p=new URL(url,'http://localhost').pathname;return file.startsWith('public/')?p===file.slice(6):p.startsWith('/assets/'+path.parse(file).name+'-')||p==='/'+file}
for(const file of files){
 const m=await sharp(file).metadata(),photo=file.includes('/athletes/'),showcase=file.includes('/showcase/'),series=file.includes('/series/')
 const active=showcase||series||used.has(file.startsWith('public/')?file.slice(6):'/'+file)
 const versions=derivatives.filter(d=>d.source===file)
 const scenarios={}
 for(const [phase,samples]of [['before',before],['after',after]])for(const sample of samples.filter(s=>['home','athletes-50'].includes(s.name))){
  const candidate=phase==='before'?[file]:versions.map(v=>v.file)
  const requested=sample.requests.filter(r=>candidate.some(f=>matches(r.url,f)))
  const dom=sample.images.filter(i=>candidate.some(f=>matches(i.src,f)))
  scenarios[`${phase}:${sample.name}:${sample.width}@${sample.dpr}`]={requested:requested.length>0,wireBytes:requested.reduce((n,r)=>n+r.wire,0),rendered:dom.map(i=>({width:i.width,height:i.height,visible:i.visible,loading:i.loading}))}
 }
 rows.push({source:file,format:m.format,width:m.width,height:m.height,bytes:(await fs.stat(file)).size,alpha:m.hasAlpha,used:!!active,
  whereUsed:!active?'not referenced by current UI/catalog':showcase?'HomeShowcase (random image per race; current Home uses Kona/Dubai/Saudi/Qatar)':series?'RaceCard: Home and Calendar':'Athletes / Athlete Detail / RaceResultsTable',
  cssDimensions:!active?'not rendered':showcase?'366x230 @390; 416x230 @440; 804x245 @844; 1086x245 @1440':series?'48x48 mobile; 58x58 desktop':'list 56x56 mobile / 60x60 desktop; detail 104/112/132 square; results 30/32/34 square',
  dprRequirement:showcase?'DPR 2/3: 640/1280/1672 variants, original 1672 cap; cover crop included':series?'up to DPR 3, 216px preserving aspect':'up to DPR 3: 180px list/results; 396px detail; no upscale',
  behaviorBefore:showcase?'all mounted backgrounds eager':active?'img eager':'unused',
  behaviorAfter:showcase?'current + next mounted; IntersectionObserver one slide margin; visited images retained':series?'eager, reduced lossless PNG':active?'native lazy list/results; eager detail; responsive WebP':'unused',
  belowFold:!active?'not rendered':showcase?'all but active slide horizontally outside view':series?'depends on card position':'list/results: rows beyond viewport; only matching rendered profiles exist in DOM',
  derivatives:versions,scenarios})
}
await fs.writeFile(out+'/inventory.json',JSON.stringify(rows,null,2))
const cols=['source','format','width','height','bytes','alpha','used','whereUsed','cssDimensions','dprRequirement','behaviorBefore','behaviorAfter','belowFold']
const csv=v=>'"'+String(v??'').replaceAll('"','""')+'"'
await fs.writeFile(out+'/inventory.csv',cols.join(',')+'\n'+rows.map(r=>cols.map(c=>csv(r[c])).join(',')).join('\n')+'\n')
console.log({sourceRasterFiles:rows.length,used:rows.filter(r=>r.used).length,originalBytes:rows.reduce((n,r)=>n+r.bytes,0),generatedFiles:derivatives.length,generatedBytes:derivatives.reduce((n,r)=>n+r.bytes,0)})
