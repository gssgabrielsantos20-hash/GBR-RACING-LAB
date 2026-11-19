const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=f=>fs.readFileSync(path.join(root,f),'utf8');
const c={window:{}, document:{getElementById:()=>null}, console};vm.createContext(c);
vm.runInContext(source('legendary-drivers.js'),c);
vm.runInContext(source('catalog.js'),c);
const garageSource=source('garage-plus.js');
const fnCode=garageSource.slice(garageSource.indexOf('const $='),garageSource.indexOf('async function loadOCR()'));
vm.runInContext(fnCode+'\nwindow.__parseOCR=parseOCR;',c);
const parse=c.window.__parseOCR;
for(const [alias,expected] of [
 ['G. Hill','Graham Hill'],['D.Hill','Damon Hill'],['J. Villeneuve','Jacques Villeneuve'],['G. Villeneuve','Gilles Villeneuve'],
 ['Mansell','Mansell'],['Fittipaldi','Fittipaldi'],['Fisichella','Fisichella'],['Fangio','Fangio'],['Rindt','Rindt'],
]){
 const result=parse(`F1 Clash\n${alias}\nLendário\nUltrapassagem\n71\nDefesa\n62`, 'drivers');
 assert.equal(result.kind,'drivers');
 assert.equal(result.data.name,expected,`OCR alias ${alias}`);
 assert.equal(result.data.rarity,'Legendary',`Raridade ${alias}`);
}
console.log('OK: OCR reconhece aliases e novos pilotos lendários; mantém raridade Legendary.');
