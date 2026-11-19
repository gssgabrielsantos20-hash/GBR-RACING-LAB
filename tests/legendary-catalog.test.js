/* GBR Racing Lab 5.5.10 — testes de catálogo, compatibilidade e fontes de imagem. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const src=name=>fs.readFileSync(path.join(root,name),'utf8');
const ctx={window:{},localStorage:{getItem:()=>null,setItem:()=>{}},URL,console,setInterval:()=>0,clearInterval:()=>{},document:{addEventListener:()=>{},dispatchEvent:()=>{}},CustomEvent:function(){}};
vm.createContext(ctx);
for(const f of ['legendary-drivers.js','catalog.js','card-art.js'])vm.runInContext(src(f),ctx,{filename:f});
const g=ctx.window.GBRLegendaryDrivers,ref=ctx.window.F1Reference,art=ctx.window.GBRCardArt;
const names=g.all.map(x=>x.name);
assert.equal(names.length,22);
assert.equal(new Set(names).size,22);
assert.equal(Object.values(ref.drivers).filter(x=>x.rarity==='Legendary').length,22);
assert.equal(Object.values(ref.drivers).filter(x=>x.rarity!=='Legendary').length,66);
for(const name of names){
 const d=ref.drivers['Legendary|'+name];
 assert.equal(d.name,name);
 assert.equal(d.rarity,'Legendary');
 assert.equal(d.series,0,'série sem verificação deve permanecer não atribuída');
 assert.equal(Object.keys(d.levels).length,0,'não inventar atributos de level');
}
for(const [alias,expected] of [
 ['G. Hill','Graham Hill'],['G.Hill','Graham Hill'],['D.Hill','Damon Hill'],['D. Hill','Damon Hill'],
 ['G. Villeneuve','Gilles Villeneuve'],['J. Villeneuve','Jacques Villeneuve'],
 ['Gilles Villeneuve','Gilles Villeneuve'],['Jacques Villeneuve','Jacques Villeneuve'],
 ['Graham Hill','Graham Hill'],['Damon Hill','Damon Hill'],
]){
 assert.equal(g.lookup(alias)?.name,expected,'alias '+alias);
 assert.equal(g.matchesOCR('PILOTO: '+alias+' \nLENDÁRIO')?.name,expected,'OCR '+alias);
}
for(const [text,expected] of [['G. Villeneuve','Gilles Villeneuve'],['J. Villeneuve','Jacques Villeneuve'],['Graham Hill','Graham Hill'],['Damon Hill','Damon Hill']]){
 assert.equal(g.matchesOCR(text)?.name,expected);
}
for(const ambiguous of ['Hill','Villeneuve'])assert.equal(g.lookup(ambiguous),null);
const verified=g.all.filter(x=>x.imageUrl);
assert.equal(verified.length,17);
for(const d of g.all){
 const a=art.getSource({name:d.name,rarity:'Legendary',editionLabel:''},'drivers');
 assert.equal(a.url,d.imageUrl||'',d.name);
 assert.equal(a.origin,d.imageUrl?'reference':'none',d.name);
}
assert.match(art.getSource({name:'G. Hill',rarity:'Legendary'},'drivers').url,/driver-ghill-legendary\.jpg$/);
assert.match(art.getSource({name:'D. Hill',rarity:'Legendary'},'drivers').url,/driver-dhill-legendary\.jpg$/);
assert.match(art.getSource({name:'G. Villeneuve',rarity:'Legendary'},'drivers').url,/driver-gvilleneuve-legendary\.jpg$/);
assert.match(art.getSource({name:'J. Villeneuve',rarity:'Legendary'},'drivers').url,/driver-villeneuve-legendary\.jpg$/);
assert.equal(art.getSource({name:'Villeneuve',rarity:'Legendary'},'drivers').origin,'none');
assert.equal(art.getSource({name:'Hill',rarity:'Legendary'},'drivers').origin,'none');
console.log('OK: 22 lendários, 66 existentes preservados, 17 referências confirmadas, 5 imagens não confirmadas, aliases distintos.');
