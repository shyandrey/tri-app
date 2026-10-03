import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import sharp from 'sharp'
import { createServer } from 'vite'
const records=JSON.parse(await fs.readFile('src/generated/image-variants.json','utf8'))
test('all generated variants exist, match metadata, preserve alpha/aspect, and never upscale',async()=>{
 assert.equal(new Set(records.map(r=>r.file)).size,records.length)
 const originals=new Map()
 for(const r of records){
  if(!originals.has(r.source))originals.set(r.source,await sharp(r.source).metadata())
  const original=originals.get(r.source),m=await sharp(r.file).metadata()
  assert.equal(m.width,r.width);assert.equal(m.height,r.height);assert.equal(m.format,r.format)
  assert.ok(m.width<=original.width&&m.height<=original.height)
  assert.ok(Math.abs(m.height-original.height*m.width/original.width)<=1)
  // Encoders may omit an alpha channel whose samples are all fully opaque.
  if(original.hasAlpha&&!m.hasAlpha)assert.equal((await sharp(r.source).stats()).channels.at(-1).min,255)
  if(!original.hasAlpha)assert.equal(m.hasAlpha,false)
  assert.equal((await fs.stat(r.file)).size,r.bytes)
 }
 assert.equal(records.filter(r=>r.file.includes('/showcase/')).length,30)
 assert.ok(records.filter(r=>r.file.includes('/athletes/')).every(r=>r.width<=396))
})
test('every current athlete source resolves without identity changes; unknown sources fall back',async()=>{
 const server=await createServer({server:{middlewareMode:true,watch:null},appType:'custom',logLevel:'silent'})
 try{
  const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts')
  const {athleteImageDelivery}=await server.ssrLoadModule('/src/utils/athleteImageDelivery.ts')
  const registry=await server.ssrLoadModule('/src/generated/athleteImageVariants.ts')
  const {pickShowcaseImage}=await server.ssrLoadModule('/src/data/showcaseImages.ts')
  for(const a of athletes.filter(a=>a.image)){
   const props=athleteImageDelivery(a.image,'60px')
   assert.ok(props.src.endsWith('.webp?no-inline'));assert.equal(props.sizes,'60px')
   assert.equal(props.src,registry.imageVariants[a.image].at(-1).src)
   assert.equal(registry.imageVariants[a.image].length,2)
  }
  assert.deepEqual(athleteImageDelivery('/future/photo.png','60px'),{src:'/future/photo.png'})
  for(const race of ['ironman-world-championship-kona','ironman-70-3-world-championship','t100-french-riviera','t100-dubai','t100-saudi-arabia','t100-qatar'])assert.deepEqual(pickShowcaseImage(race).map(r=>r.width),[640,1280,1672])
  assert.equal(pickShowcaseImage('unknown'),undefined)
 }finally{await server.close()}
})
