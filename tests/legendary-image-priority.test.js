const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const sources=name=>fs.readFileSync(path.join(root,name),'utf8');
const local={};
const fakeStorage={getItem:()=>JSON.stringify(local)};
const ctx={window:{},document:{dispatchEvent(){}},CustomEvent:function(){},localStorage:fakeStorage,URL,console,setInterval(){return 1},clearInterval(){}};
vm.createContext(ctx);
vm.runInContext(sources('legendary-drivers.js'),ctx);
vm.runInContext(sources('card-art.js'),ctx);
const art=ctx.window.GBRCardArt;
const driver={name:'Damon Hill',rarity:'Legendary',editionLabel:''};
const key=art.overrideKey(driver,'drivers');
assert.equal(art.getSource(driver,'drivers').origin,'reference');
local[key]='https://example.com/local-hill.jpg';
assert.equal(art.getSource(driver,'drivers').origin,'local');
assert.equal(art.getSource(driver,'drivers').url,local[key]);
async function main(){
 const keyLegacy=art.overrideKey({name:'D. Hill',rarity:'Legendary',editionLabel:''},'drivers');
 const fakeClient={
  rpc:async()=>({error:null,data:false}),
  from:()=>({select:()=>({limit:async()=>({error:null,data:[{card_key:keyLegacy,image_url:'https://example.com/remote-hill.jpg'}]})})}),
  channel:()=>({on(){return this},subscribe(){return this}}),
  removeChannel:async()=>{}
 };
 await art.connect({client:fakeClient});
 assert.equal(art.getSource(driver,'drivers').origin,'shared');
 assert.equal(art.getSource(driver,'drivers').url,'https://example.com/remote-hill.jpg');
 const graham=art.getSource({name:'Graham Hill',rarity:'Legendary'},'drivers');
 assert.notEqual(graham.url,'https://example.com/remote-hill.jpg','não cruzar Hill');
 assert.match(graham.url,/driver-ghill-legendary\.jpg$/);
 art.disconnect();
 console.log('OK: prioridade foto compartilhada legada > local > referência, sem cruzar Graham e Damon Hill.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
