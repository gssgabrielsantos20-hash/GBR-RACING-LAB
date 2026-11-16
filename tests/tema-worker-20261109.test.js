'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'_worker.js'),'utf8');
const ctx={Blob,DecompressionStream,Response,Request,URL,atob,Uint8Array};
vm.createContext(ctx);
vm.runInContext(code.replace('export default {async fetch(request){','globalThis.__worker={async fetch(request){'),ctx);
test('Worker exposes updated CSS, theme JS, two HTML views and blocks private files',async()=>{
 for(const file of ['gbr-visual-20261109.css','gbr-theme.js','index.html','mobile-premium.js','auditoria-imagens.html','auditoria-imagens.js','gbr-boost-catalog.js','boosts-plus.js','boosts-plus.css']){
  const result=await ctx.__worker.fetch(new Request('https://gbrracing.example/'+file));
  assert.equal(result.status,200,file);
  assert.deepEqual(Buffer.from(await result.arrayBuffer()),fs.readFileSync(path.join(root,file)),file);
  assert.equal(result.headers.get('x-content-type-options'),'nosniff');
 }
 const hidden=await ctx.__worker.fetch(new Request('https://gbrracing.example/tests/tema-visual-20261109.test.js'));
 assert.equal(hidden.status,404);
 const disallowed=await ctx.__worker.fetch(new Request('https://gbrracing.example/gbr-theme.js',{method:'POST'}));
 assert.equal(disallowed.status,405);
});
