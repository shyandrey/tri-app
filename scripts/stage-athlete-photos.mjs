import fs from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { loadPhotoRuntime } from './athlete-photo-runtime.mjs'
import { sha256 } from './athlete-photo-core.mjs'
import { makeDecoder, stageDownloads, writeReviewPage, stagingBase } from './athlete-photo-staging.mjs'
export async function stageCLI(args){
  if(![4,6].includes(args.length) || args[0]!=='--discovery'||args[2]!=='--accepted'||(args.length===6&&args[4]!=='--batch-id'))throw new Error('Use --discovery file --accepted file [--batch-id ID]; no implicit/all mode')
  const batchId=args[5]??null
  stagingBase(batchId)
  const bytes=await fs.readFile(args[1]),discovery=JSON.parse(bytes),accepted=JSON.parse(await fs.readFile(args[3],'utf8'))
  const runtime=await loadPhotoRuntime(),decoder=await makeDecoder()
  try {const manifest=await stageDownloads({root:process.cwd(),discovery,accepted,discoveryHash:sha256(bytes),registry:runtime.registry,decoder,batchId});await writeReviewPage(process.cwd(),manifest);console.log(JSON.stringify({downloaded:manifest.entries.length,duplicates:manifest.duplicates,reviewPage:stagingBase(batchId)+'/review.html'},null,2))}
  finally{await decoder.close()}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)stageCLI(process.argv.slice(2)).catch(e=>{console.error(e);process.exitCode=1})
