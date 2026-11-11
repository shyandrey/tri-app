import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const root='/private/tmp/300w-bio-art-experiment-20261110';const {createServer}=await import(root+'/baseline/node_modules/vite/dist/node/index.js');
let baseline;
for(const variant of ['baseline','bio','art']){
 const server=await createServer({root:root+'/'+variant,server:{middlewareMode:true,hmr:false,watch:null},appType:'custom',logLevel:'silent'});
 try{const {athletes}=await server.ssrLoadModule('/src/data/athletes/index.ts');const payload=JSON.stringify(athletes);baseline??=payload;assert.equal(payload,baseline,variant+' exact 1167-athlete catalog');console.log('PASS '+variant+' exact catalog, biographies, metadata and achievements');}finally{await server.close()}
}
