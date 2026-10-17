const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
const ctx={window:{}};
vm.createContext(ctx);
vm.runInContext(source('legendary-drivers.js'),ctx);
vm.runInContext(source('catalog.js'),ctx);
const app=source('app.js');
const code=app.slice(0,app.indexOf('db=migrateGaragem(db);'))+'\nwindow.__unit={emptyGarage,migrateGaragem};';
vm.runInContext(code,ctx,{filename:'app init+migration'});
const {emptyGarage,migrateGaragem}=ctx.window.__unit;
const names=ctx.window.GBRLegendaryDrivers.all.map(d=>d.name);
const owned=emptyGarage();
assert.equal(owned.drivers.filter(d=>d.rarity==='Legendary').length,22);
for(const d of owned.drivers.filter(d=>d.rarity==='Legendary')){
 assert.equal(d.owned,false,'não atribui posse');
 assert.equal(d.level,0,'não atribui nível');
 assert.equal(d.series,0,'não inventa série');
 assert.equal([d.overtaking,d.defending,d.qualifying,d.raceStart,d.tyreUse].reduce((a,b)=>a+b,0),0,'não inventa atributos');
}
const old=JSON.parse(JSON.stringify(owned));
old.schemaVersion=7;old.favoriteSetups=[{id:'fav',name:'Meu teste',parts:[],drivers:[]}];
old.drivers=old.drivers.filter(d=>d.rarity!=='Legendary');
old.drivers.push({id:'my_ghill',name:'G. Hill',rarity:'Legendary',owned:true,level:4,series:12,overtaking:91,defending:70,qualifying:65,raceStart:51,tyreUse:58});
old.drivers.push({id:'my_dhill',name:'D. Hill',rarity:'Legendary',owned:true,level:1,series:9,overtaking:37,defending:33,qualifying:32,raceStart:30,tyreUse:31});
old.drivers.push({id:'my_jvill',name:'J. Villeneuve',rarity:'Legendary',owned:true,level:2,series:12,overtaking:41,defending:42,qualifying:43,raceStart:44,tyreUse:45});
old.deletedCards.drivers.push('g. villeneuve|Legendary|');
const migrated=migrateGaragem(old);
assert.equal(migrated.drivers.filter(x=>x.rarity==='Legendary').length,21,'um removido intencionalmente');
for(const [id,name,level] of [['my_ghill','G. Hill',4],['my_dhill','D. Hill',1],['my_jvill','J. Villeneuve',2]]){
 const matched=migrated.drivers.filter(x=>x.rarity==='Legendary'&&ctx.window.GBRLegendaryDrivers.equivalent(name,x.name));
 assert.equal(matched.length,1,'não criar duplicata de '+name);
 assert.equal(matched[0].id,id);
 assert.equal(matched[0].level,level);
 assert.equal(matched[0].owned,true);
}
assert.equal(migrated.drivers.find(d=>d.id==='my_ghill').overtaking,91);
assert.equal(migrated.drivers.some(d=>d.rarity==='Legendary'&&ctx.window.GBRLegendaryDrivers.equivalent(d.name,'Gilles Villeneuve')),false,'não recria excluído');
assert.equal(migrated.favoriteSetups.length,1);
assert.equal(migrated.favoriteSetups[0].id,'fav');
const again=migrateGaragem(migrated);
assert.equal(again.drivers.length,migrated.drivers.length,'idempotência');
assert.equal(again.drivers.filter(x=>x.rarity==='Legendary').length,21);
console.log('OK: novos usuários recebem 22 vazios; migração mantém dados, aliases, exclusões, favoritos e idempotência.');
