const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(root,'_worker.js'),'utf8');
const context={Blob,DecompressionStream,Response,Request,URL,atob,Uint8Array};
vm.createContext(context);
vm.runInContext(code.replace('export default {async fetch(request){','globalThis.__worker = {async fetch(request){'),context,{filename:'worker.js'});
const fn=context.__worker;
(async()=>{
 const cases=[
  ['/index.html','text/html'],['/catalog.js','application/javascript'],['/legendary-drivers.js','application/javascript'],
  ['/auditoria-imagens.html','text/html'],['/card-art.js','application/javascript'],['/garage-plus.js','application/javascript'],
  ['/app.js','application/javascript'],['/favorites.js','application/javascript'],['/events-gp.js','application/javascript'],['/assets/events/nightmare-fuel-2026.png','image/png']
 ];
 for(const [resource,mime] of cases){
  const r=await fn.fetch(new Request('https://example.pages.dev'+resource));
  assert.equal(r.status,200,resource);
  assert.ok(r.headers.get('content-type').startsWith(mime),resource);
  const data=Buffer.from(await r.arrayBuffer());
  assert.deepEqual(data,fs.readFileSync(path.join(root,resource.slice(1))),resource);
 }
 // A-01: documentação interna, testes, SQL e metadados não devem ficar acessíveis no Worker.
 for(const resource of ['/MIGRACAO_BIBLIOTECA_VISUAL_5_4.sql',
  '/tests/favorites-model.test.js','/tests/legendary-worker-integrity.test.js',
  '/docs/adr/0001-lendarios-2026.md','/RELATORIO_CATALOGO_LENDARIOS_5_5_10.md',
  '/MANIFEST_SHA256_5_5_10.json','/_worker.js']){
  const response=await fn.fetch(new Request('https://example.pages.dev'+resource));
  assert.equal(response.status,404,resource+' não pode ser publicado');
 }
 assert.equal((await fn.fetch(new Request('https://example.pages.dev/not-a-file'))).status,404);
 assert.equal((await fn.fetch(new Request('https://example.pages.dev',{method:'POST'}))).status,405);
 const head=await fn.fetch(new Request('https://example.pages.dev/index.html',{method:'HEAD'}));
 assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'MANIFEST_SHA256_5_5_10.json'),'utf8'));
 assert.equal(manifest.version,'5.5.10');
 console.log('OK: Worker entrega ativos reais e bloqueia SQL, testes, documentos, manifestos e rotas desconhecidas.');
})().catch(e=>{console.error(e);process.exitCode=1});
