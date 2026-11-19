// Regras que não envelhecem com a rotação/evento da semana (ADR 0022).
// Verificam estrutura e coerência, não valores de uma data específica.
const fs=require('fs'),path=require('path'),assert=require('assert'),zlib=require('zlib'),crypto=require('crypto'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

// 1. Worker idêntico aos arquivos locais (o incidente de 18/11/2026).
const worker=read('_worker.js');
const map=JSON.parse(zlib.gunzipSync(Buffer.from(worker.match(/const compressed = `([^`]+)`/)[1].replace(/\s+/g,''),'base64')).toString());
for(const route of Object.keys(map)){
 const local=fs.readFileSync(path.join(root,route.slice(1)));
 assert.equal(crypto.createHash('sha256').update(Buffer.from(map[route].b,'base64')).digest('hex'),crypto.createHash('sha256').update(local).digest('hex'),'Worker defasado: '+route+' (rode node tools/sincronizar-worker.mjs --write)');
}
assert(!Object.keys(map).some(r=>/^\/(docs|tests|tools)\/|\.(md|sql|mjs)$/.test(r)),'Worker não pode servir docs, testes, ferramentas ou SQL');

// 2. Toda imagem de evento existe, é servida e é aceita pelo cartão do Início.
const events=read('events-gp.js');
const dashboard=read('dashboard-telemetry.js');
const marker=dashboard.indexOf('/.test(image))img.setAttribute');assert(marker>0,'Regra de imagem do Início não encontrada');
const accept=new RegExp(dashboard.slice(dashboard.lastIndexOf('if(/',marker)+4,marker));
for(const image of new Set([...events.matchAll(/image:'([^']+)'/g)].map(m=>m[1]))){
 assert(fs.existsSync(path.join(root,image)),'Imagem de evento ausente: '+image);
 assert(map['/'+image],'Imagem de evento não servida pelo Worker: '+image);
 assert(accept.test(image),'Cartão do Início não aceita a imagem: '+image);
}

// 3. Eventos: início <= fim e datas ISO.
for(const m of events.matchAll(/starts:'(\d{4}-\d{2}-\d{2})',ends:'(\d{4}-\d{2}-\d{2})'/g))assert(m[1]<=m[2],'Evento com fim antes do início: '+m[0]);

// 4. Rotações: toda janela tem início <= fim e a vigente tem data de término.
const intel=read('gbr-intelligence.js');
for(const k of ['LEGACY_ROTATION','PREVIOUS_ROTATION','ROTATION']){
 const s=intel.match(new RegExp('const '+k+"_START='(\\d{4}-\\d{2}-\\d{2})'"))[1],e=intel.match(new RegExp('const '+k+"_END='(\\d{4}-\\d{2}-\\d{2})'"))[1];
 assert(s<=e,k+': fim antes do início');
}

// 4b. SDK do Supabase: toda fonte é <script> HTTPS com SRI sha256/384/512 (ADR 0023).
const loaderSrc=read('supabase-sdk-loader.js');
const sri=loaderSrc.match(/const SDK_INTEGRITY='(sha(256|384|512)-[A-Za-z0-9+/]+=*)'/);
assert(sri,'SDK_INTEGRITY ausente ou inválido no loader');
const sourceBlock=loaderSrc.match(/const sources=Object\.freeze\(\[([\s\S]*?)\]\);/)[1];
const entries=sourceBlock.split('\n').filter(l=>l.includes('url:'));
assert(entries.length>=2,'Mantenha ao menos duas fontes para o SDK');
assert(/url:'\/assets\/js\/vendor\/supabase\.js'/.test(entries[0]),'A primeira fonte do SDK deve ser a cópia local');
for(const e of entries){
 assert(/type:'script'/.test(e),'Fonte do SDK sem verificação possível (import() não aceita SRI): '+e.trim());
 assert(/url:'(\/assets\/js\/vendor\/supabase\.js|https:\/\/[^']+@\d+\.\d+\.\d+\/dist\/umd\/supabase\.js)'/.test(e),'Fonte do SDK deve ser a cópia local ou fixar versão e o arquivo UMD verificado: '+e.trim());
 assert(/integrity:SDK_INTEGRITY/.test(e),'Fonte do SDK sem integrity: '+e.trim());
}
// A cópia local precisa bater byte a byte com o hash; senão o navegador a bloquearia.
const [algo,b64]=sri[1].split(/-(.+)/);
const localSdk=fs.readFileSync(path.join(root,'assets/js/vendor/supabase.js'));
assert.equal(crypto.createHash(algo).update(localSdk).digest('base64'),b64,'assets/js/vendor/supabase.js não confere com SDK_INTEGRITY');
assert(map['/assets/js/vendor/supabase.js'],'Cópia local do SDK não é servida pelo Worker');
assert(/script\.integrity=integrity/.test(loaderSrc),'Loader não aplica o atributo integrity');

// 5. Cache do Worker: código revalida, binários de /assets/ ficam 1 dia, ETag gera 304.
(async()=>{
 const ctx={Blob,DecompressionStream,Response,Request,URL,atob,Uint8Array,crypto:globalThis.crypto};vm.createContext(ctx);
 vm.runInContext(worker.replace('export default {async fetch(request){','globalThis.__worker={async fetch(request){'),ctx);
 const w=ctx.__worker,u='https://example.pages.dev';
 const js=await w.fetch(new Request(u+'/app.js?v=x'));assert.equal(js.headers.get('cache-control'),'no-cache');
 const tag=js.headers.get('etag');assert(tag,'ETag ausente');
 const again=await w.fetch(new Request(u+'/app.js',{headers:{'if-none-match':tag}}));assert.equal(again.status,304);assert.equal((await again.arrayBuffer()).byteLength,0);
 assert.equal(again.headers.get('x-content-type-options'),'nosniff');
 assert.equal((await w.fetch(new Request(u+'/'))).headers.get('cache-control'),'no-cache');
 assert.equal((await w.fetch(new Request(u+'/assets/icon-192.png'))).headers.get('cache-control'),'public, max-age=86400');
 assert.equal((await w.fetch(new Request(u+'/docs/adr/0022-cache-e-ux-20261118.md'))).status,404);
 console.log('PASS regras estruturais: Worker sincronizado, imagens de eventos, datas, rotações, SDK com SRI e cache/ETag.');
})().catch(e=>{console.error(e);process.exit(1)});
