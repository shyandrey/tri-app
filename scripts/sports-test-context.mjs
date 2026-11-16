// Test fixture capability: never a clean-checkout/SHA bypass or release approval.
import fs from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
export const marker = '.sports-test-only.json'
export async function testContext(root=process.cwd()) {
  const realRoot=await fs.realpath(root)
  let text
  try{text=await fs.readFile(path.join(realRoot,marker),'utf8')}catch(e){if(e.code==='ENOENT')return null;throw e}
  const context=JSON.parse(text)
  assert.equal(context.purpose,'SPORTS_E2E_ONLY');assert.equal(context.root,realRoot,'Fixture approval belongs to another checkout')
  assert.match(context.id,/^[a-f0-9-]{36}$/)
  const git=args=>execFileSync('git',args,{cwd:realRoot,encoding:'utf8'}).trim()
  assert.equal(git(['remote']),'','Fixture repository must have no remotes')
  assert.equal(git(['show','HEAD:'+marker]),text.trim(),'Fixture marker must be committed and unchanged')
  return context
}
export async function rejectTestRelease(root=process.cwd()) {
  try{await fs.lstat(path.join(root,marker))}catch(e){if(e.code==='ENOENT')return;throw e}
  throw Error('TEST-ONLY fixture repository cannot use release tooling')
}
