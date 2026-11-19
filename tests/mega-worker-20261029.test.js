'use strict';const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');const code=fs.readFileSync(path.join(root,'_worker.js'),'utf8');const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_PUBLICOS_BOOST_REFERENCES_20261109_SHA256.json'),'utf8'));
const context={Blob,DecompressionStream,Response,Request,URL,atob,Uint8Array};vm.createContext(context);vm.runInContext(code.replace('export default {async fetch(request){','globalThis.__worker={async fetch(request){'),context,{filename:'_worker.js'});
(async()=>{
 let count=0;
 for(const [file,sha] of Object.entries(manifest.files)){
  const route=file.startsWith('/')?file:'/'+file;const r=await context.__worker.fetch(new Request('https://example.pages.dev'+route));assert.equal(r.status,200,file);
  assert.equal(r.headers.get('x-content-type-options'),'nosniff',file);
  assert.deepEqual(Buffer.from(await r.arrayBuffer()),fs.readFileSync(path.join(root,file)),file);
  count++;
 }
 // Contagem derivada do manifesto (antes fixa em 199 e desatualizada a cada novo arquivo público).
 assert.equal(count,Object.keys(manifest.files).length);
 for(const file of ['/_worker.js','/tests/mega-auditoria-20261029.test.js','/tests/colecoes-s12.test.js','/MANIFEST_PUBLICOS_BOOST_REFERENCES_20261109_SHA256.json','/AUDITORIA_MANIFEST_PUBLICOS_SHA256.json','/docs/adr/0005-auditoria-catalogo-novembro-2026.md','/RELATORIO_MEGA_AUDITORIA_20261029.md','/MIGRACAO_BIBLIOTECA_VISUAL_5_4.sql','/config.js.bak','/.env','/not-found']){
  assert.equal((await context.__worker.fetch(new Request('https://example.pages.dev'+file))).status,404,file+' private');
 }
 assert.equal((await context.__worker.fetch(new Request('https://example.pages.dev/api/',{method:'POST'}))).status,405);
 assert.equal((await context.__worker.fetch(new Request('https://example.pages.dev/'))).status,200);
 const h=await context.__worker.fetch(new Request('https://example.pages.dev/index.html',{method:'HEAD'}));assert.equal(h.status,200);assert.equal((await h.arrayBuffer()).byteLength,0);
 for(const file of ['gbr-boost-catalog.js','auditoria-imagens.html','auditoria-imagens.js','boosts-plus.js','boosts-plus.css','gbr-pit-wall.js','gbr-pit-wall.css','gbr-podium-model.js','gbr-podium-ui.js','events-gp.js','card-art.js','legendary-drivers.js','assets/events/sao-paulo-spectacular-2026.png','assets/events/moustache-madness-2026.png','assets/events/las-vegas-calendar-2026.svg','assets/events/las-vegas-gp-2026.webp','assets/events/qatar-legendary-2026.webp'])assert.equal((await context.__worker.fetch(new Request('https://example.pages.dev/'+file))).status,200,file);
 console.log('PASS mega worker: '+count+' arquivos byte a byte, HTTP 200, HTTP 404 interno, HEAD, POST 405, headers, eventos, imagens e biblioteca de boosts.');
})().catch(error=>{console.error(error);process.exitCode=1});
