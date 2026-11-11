import {createRequire} from 'node:module';import fs from 'node:fs/promises';import crypto from 'node:crypto';
const require=createRequire('/private/tmp/300w-reconciliation-20261110/package.json'),sharp=require('sharp');const out='/private/tmp/300w-bio-art-experiment-20261110';await fs.mkdir(out+'/images-current',{recursive:true});let rows=[];
for(const s of ['ironman','t100']){
 const source=`/private/tmp/300w-reconciliation-20261110/public/images/showcase/rankings/optimized/${s}_04_transition.webp`;const bytes=await fs.readFile(source);let base=`/private/tmp/300w-reconciliation-20261110/public/images/showcase/rankings/optimized/${s}_04_transition.webp`;let meta=await sharp(bytes).metadata();
 for(const format of ['webp','avif']){
 let file=out+`/images-current/${s}-1320.${format}`;
 await sharp(bytes).resize({width:1320,withoutEnlargement:true})[format]({quality:format==='webp'?85:65,effort:6}).toFile(file);
 rows.push({series:s,source,sourceSha:crypto.createHash('sha256').update(bytes).digest('hex'),sourceWidth:meta.width,sourceHeight:meta.height,format,width:1320,quality:format==='webp'?85:65,bytes:(await fs.stat(file)).size,baselineBytes:(await fs.stat(base)).size});
 }
 const files=[base,out+`/images-current/${s}-1320.webp`,out+`/images-current/${s}-1320.avif`];const images=[];
 for(let i=0;i<files.length;i++){let b=await sharp(files[i]).resize({width:1170}).toBuffer();let m=await sharp(b).metadata();let h=498;let top=Math.round((m.height-h)*(s==='ironman'?.3:.5));let crop=await sharp(b).extract({left:0,top,width:1170,height:h}).png().toBuffer();images.push({input:crop,left:0,top:i*h});}
 await sharp({create:{width:1170,height:1494,channels:3,background:'#111'}}).composite(images).png().toFile(out+`/images-current/${s}-comparison.png`);
}
await fs.writeFile(out+'/image-variants-current.json',JSON.stringify(rows,null,2));console.log(rows);
