
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('_worker.js','utf8'),ctx={Blob,DecompressionStream,Response,Request,URL,atob,Uint8Array};
vm.createContext(ctx);vm.runInContext(code.replace('export default {async fetch(request){','globalThis.__worker={async fetch(request){'),ctx);
(async()=>{for(const f of ['assets/boosts/autocontrole.png','assets/boosts/guerreiro.png','assets/boosts/lastro.png','assets/boosts/instinct.png','assets/boosts/downforce.png','assets/boosts/hex.png','card-art.js','gbr-boost-catalog.js','index.html']){
 const r=await ctx.__worker.fetch(new Request('https://example.pages.dev/'+f));assert.equal(r.status,200,f);
 const a=Buffer.from(await r.arrayBuffer()),b=fs.readFileSync(f);assert(a.equals(b),f+' bytes differ');
}console.log('PASS worker serves six local boost images and updated runtime files byte-for-byte');})().catch(e=>{console.error(e);process.exit(1)});
