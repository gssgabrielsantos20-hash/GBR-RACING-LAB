'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const w={};const ctx={window:w};vm.createContext(ctx);vm.runInContext(read('gbr-boost-catalog.js'),ctx);
const expected={
 'self-control':['Autocontrole','Self Control','assets/boosts/autocontrole.png'],
 warrior:['Guerreiro','Warrior','assets/boosts/guerreiro.png'],
 ballast:['Lastro','Ballast','assets/boosts/lastro.png'],
 instinct:['Instinto','Instinct','assets/boosts/instinct.png'],
 downforce:['Sustentação Negativa','Downforce','assets/boosts/downforce.png'],
 hex:['Hex','Hex','assets/boosts/hex.png']
};
for(const [id,[name,canonical,file]] of Object.entries(expected)){
 const item=w.GBRBoostCatalog.get(id);assert(item,id+' existe');assert.equal(item.name,name);assert.equal(item.canonicalName,canonical);assert.equal(item.localAsset,file);assert(fs.existsSync(path.join(root,file)),file+' existe');
}
assert.equal(w.GBRBoostCatalog.get('self-control').disputed,true,'conflito de atributo preservado; fora das recomendações nominais');
assert.deepEqual(Object.keys(w.GBRBoostCatalog.get('ballast').stats).sort(),['corner','pitStop','raceStart']);
console.log('PASS seis ícones identificados, nomes PT-BR, atributos e imagens locais conferidos.');
