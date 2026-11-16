'use strict';
// Teste pequeno de roteamento do Worker; o manifesto SHA-256 de todos os 199 recursos
// é validado por Python sem acumular 197 respostas HTTP em memória.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const dir=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(dir,'_worker.js'),'utf8');
const ctx={Blob,DecompressionStream,Response,Request,URL,atob,Uint8Array};
vm.createContext(ctx);
vm.runInContext(code.replace('export default {async fetch(request){','globalThis.__worker={async fetch(request){'),ctx,{filename:'_worker.js'});
(async()=>{
 for(const file of ['index.html','gbr-boost-catalog.js','boosts-plus.js','boosts-plus.css','auditoria-imagens.html','auditoria-imagens.js','events-gp.js','events-gp.css','assets/events/las-vegas-gp-2026.webp','assets/events/qatar-legendary-2026.webp','assets/events/moustache-madness-2026.png','assets/events/featured/moustache-madness-2026-nigel-mansell.webp','assets/events/featured/moustache-madness-2026-axis-3000.webp','assets/events/featured/moustache-madness-2026-wobble.webp','assets/events/featured/moustache-madness-2026-bounce.webp']){
  const resp=await ctx.__worker.fetch(new Request('https://gbr-racing-lab.pages.dev/'+file));
  assert.equal(resp.status,200,file);
  assert.deepEqual(Buffer.from(await resp.arrayBuffer()),fs.readFileSync(path.join(dir,file)),file);
 }
 const privateFiles=['_worker.js','MANIFEST_PUBLICOS_BOOSTS_20261105_SHA256.json','tests/eventos-las-vegas-catar-20261104.test.js','config.js.bak'];
 for(const file of privateFiles){const r=await ctx.__worker.fetch(new Request('https://gbr-racing-lab.pages.dev/'+file));assert.equal(r.status,404,file);}
 assert.equal((await ctx.__worker.fetch(new Request('https://gbr-racing-lab.pages.dev/api/',{method:'POST'}))).status,405);
 console.log('PASS: Worker responde os recursos previstos e nega 4 privados e POST.');
})().catch(e=>{console.error(e);process.exitCode=1});
