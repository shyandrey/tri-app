import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadPhotoRuntime } from './athlete-photo-runtime.mjs'
import { makeDecoder } from './athlete-photo-staging.mjs'
import { publishApproved } from './athlete-photo-publish.mjs'
export async function publishCLI(args){
  if(args.length!==5||args[0]!=='--manifest'||args[2]!=='--reviews'||args[4]!=='--publish')throw new Error('Explicit --manifest file --reviews file --publish required')
  const manifest=JSON.parse(await fs.readFile(args[1],'utf8')),reviews=JSON.parse(await fs.readFile(args[3],'utf8'))
  const runtime=await loadPhotoRuntime(),decoder=await makeDecoder()
  try{console.log(JSON.stringify(await publishApproved({root:process.cwd(),manifest,reviews,registry:runtime.registry,athletes:runtime.athletes,decoder}),null,2))}finally{await decoder.close()}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)publishCLI(process.argv.slice(2)).catch(e=>{console.error(e);process.exitCode=1})
