'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const load=n=>fs.readFileSync(path.join(root,n),'utf8');
const sandbox={window:{},console,URL,Object};vm.createContext(sandbox);
for(const n of ['legendary-drivers.js','catalog.js','special-editions.js'])vm.runInContext(load(n),sandbox,{filename:n});
const ref=sandbox.window.F1Reference;
const edition=sandbox.window.GBRSpecialEditions;
assert.deepEqual(Array.from(edition.collections,x=>x.id),['paddock','paddock-turbo','green']);
const cases=[
 ['Escolhas do Paddock','paddock'],
 ['Paddock Picks Standard','paddock'],
 ['Escolhas do Paddock: Turbo','paddock-turbo'],
 ['Paddock Picks Turbo Charged','paddock-turbo'],
 ['Signature Collection','green'],
 ['Edições Especiais','green'],
 ['Edição Signature','green'],
 ['','']
];
for(const [label,expected] of cases)assert.equal(edition.groupOf({rarity:'Special',editionLabel:label}),expected,`group ${label}`);
assert.equal(edition.groupOf({rarity:'Epic',editionLabel:'Edições Especiais'}),'');
assert.equal(edition.equivalentEdition('Signature Collection','Edições Especiais'),true);
assert.equal(edition.equivalentEdition('Escolhas do Paddock','Escolhas do Paddock: Turbo'),false);
const special=Object.values(ref.drivers).filter(x=>x.rarity==='Special');
assert.equal(special.length,22);
assert.equal(special.filter(x=>edition.groupOf(x)==='paddock').length,8);
assert.equal(special.filter(x=>edition.groupOf(x)==='paddock-turbo').length,8);
assert.equal(special.filter(x=>edition.groupOf(x)==='green').length,6,'six green cards evidenced by game print');
assert.deepEqual(Array.from(special.filter(x=>edition.groupOf(x)==='green'),x=>x.name).sort(),['Hadjar','Lawson','Leclerc','Piastri','Sainz','Verstappen']);
assert.equal(Object.values(ref.drivers).filter(x=>x.rarity==='Legendary').length,23);
assert.equal(edition.register(ref),0);
assert.equal(Object.values(ref.drivers).filter(x=>x.name==='Rubens Barrichello'&&x.rarity==='Legendary').length,1);
const partNames=['Adrenaline','Eco Cell+','Thunderbolt','The Singularity','Flex XXL','The Reverse','Control'];
for(const name of partNames){
 const r=ref.parts[name];assert.equal(r.series,12);assert.equal(r.rarity,'Epic');assert.equal(r.introduced,'2026-10-22');
 assert.deepEqual(Object.keys(r.levels),['1'],`Only verified level 1 for ${name}`);
 assert(sandbox.window.GBRPartAutoFill.resolve(name,'Epic',1),`Level 1 auto fill for ${name}`);
 for(let level=2;level<=8;level++)assert.equal(sandbox.window.GBRPartAutoFill.resolve(name,'Epic',level),null,`No fabricated level ${level} for ${name}`);
}
const pre=load('app.js').split('let currentSetup=null;')[0];vm.runInContext(pre+'\nwindow.__test={emptyGarage,migrateGaragem};',sandbox);
const fresh=sandbox.window.__test.emptyGarage();
assert.equal(new Set(fresh.drivers.map(x=>x.id)).size,fresh.drivers.length);
assert.equal(fresh.drivers.filter(x=>x.rarity==='Special').length,22);
const old={parts:[{id:'s12',name:'Adrenaline',rarity:'Epic',series:12,level:4,owned:true,speed:50,corner:22,power:18,qualifying:25,pit:0.33}],drivers:[{id:'green',name:'Leclerc',rarity:'Special',editionLabel:'Signature Collection',level:4,series:12,owned:true,overtaking:77},{id:'turbo',name:'Bearman',rarity:'Special',editionLabel:'Escolhas do Paddock: Turbo',level:2,owned:true,overtaking:49}],deletedCards:{parts:[],drivers:[]},schemaVersion:7};
const newData=sandbox.window.__test.migrateGaragem(old);
assert.equal(newData.parts.find(p=>p.id==='s12').speed,50,'never overwrite entered S12 levels');
assert.equal(newData.drivers.find(d=>d.id==='green').editionLabel,'Signature Collection','keep legacy green title');
assert.equal(newData.drivers.find(d=>d.id==='green').overtaking,77);
assert.equal(newData.drivers.filter(d=>d.name==='Leclerc'&&d.rarity==='Special'&&edition.groupOf(d)==='green').length,1,'legacy green card not duplicated by new catalogue');
assert.equal(newData.drivers.filter(d=>d.name==='Bearman'&&d.editionLabel==='Escolhas do Paddock: Turbo').length,1);
const count=newData.drivers.length;sandbox.window.__test.migrateGaragem(newData);assert.equal(newData.drivers.length,count,'idempotent');
const deleted=sandbox.window.__test.migrateGaragem({parts:[],drivers:[],deletedCards:{parts:['adrenaline|Epic|'],drivers:['bearman|Special|escolhas do paddock: turbo']},schemaVersion:7});
assert(!deleted.drivers.some(d=>d.name==='Bearman'&&d.editionLabel==='Escolhas do Paddock: Turbo'));
const erasedGreen=sandbox.window.__test.migrateGaragem({parts:[],drivers:[],deletedCards:{parts:[],drivers:['leclerc|Special|signature collection']},schemaVersion:7});
assert(!erasedGreen.drivers.some(d=>d.name==='Leclerc'&&d.rarity==='Special'&&edition.groupOf(d)==='green'),'legacy deletion is respected');
assert(deleted.drivers.some(d=>d.name==='Bearman'&&d.editionLabel==='Escolhas do Paddock'));
assert(!deleted.parts.some(p=>p.name==='Adrenaline'));
// OCR function test without launching modal/observer; no DOM changes.
let code=load('garage-plus.js').replace('bootstrap();\n})();','window.__quickOCR={extractEdition,sameCard};\n})();');
assert(code.includes('window.__quickOCR'));sandbox.document={};vm.runInContext(code,sandbox);
const ocr=sandbox.window.__quickOCR;
for(const [src,expected] of [['Escolhas do Paddock','Escolhas do Paddock'],['Escolhas do Paddock Turbo','Escolhas do Paddock: Turbo'],['Signature Collection','Edições Especiais'],['Edições Especiais','Edições Especiais']])assert.equal(ocr.extractEdition(src),expected);
assert(ocr.sameCard({name:'Leclerc',rarity:'Special',editionLabel:'Signature Collection'},{name:'Leclerc',rarity:'Special',editionLabel:'Edições Especiais'},'drivers'));
assert(!ocr.sameCard({name:'Leclerc',rarity:'Special',editionLabel:'Edições Especiais'},{name:'Leclerc',rarity:'Special',editionLabel:'Escolhas do Paddock'},'drivers'));
const index=load('index.html');for(const group of edition.collections)assert(index.includes(`value="${group.id}"`));
assert(index.includes('gbrS12ReferenceNotice'));
const editor=load('garage-plus.js');assert(editor.includes('if(levelWasChanged&&ref?.introduced'), 'S12 invalidates stale stats when level changes');
assert(load('events-gp.js').includes('mexico-grand-prix-2026'));
assert(load('notices.js').includes('seis pilotos identificados'));
assert(load('card-art.js').includes("groupOf?.(item)==='green'"));
assert(load('auditoria-imagens.html').includes('special-editions.js?v=20261029mega1'));
assert(load('auditoria-imagens.js').includes('editionLabel:v.editionLabel||')); 
console.log('PASS: three collections, 16 Paddock variants, 6 evidenced green cards, 23 legendary, green manual/legacy, OCR, S12 7 parts level 1 only, missing levels guarded, non-destructive migration/tombstones, Mexico GP.');
