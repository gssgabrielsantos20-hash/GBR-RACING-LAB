/* Regressões do catálogo e do calendário 2026: teste exclusivamente local e sem Supabase. */
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const state={};const ctx={window:{},URL,console,localStorage:{getItem:key=>state[key]||null,setItem:(key,value)=>state[key]=value},document:{getElementById:()=>null}};vm.createContext(ctx);
for(const n of ['legendary-drivers.js','catalog.js','special-editions.js','card-art.js'])vm.runInContext(read(n),ctx,{filename:n});
const ref=ctx.window.F1Reference,art=ctx.window.GBRCardArt,legends=ctx.window.GBRLegendaryDrivers;
assert.equal(Object.keys(ref.parts).length,53);
assert.equal(Object.keys(ref.drivers).length,111);
assert.equal(legends.all.length,23);assert.equal(legends.lookup('R. Barrichello').name,'Rubens Barrichello');
assert.equal(legends.lookup('Barrichello').name,'Rubens Barrichello');
const editions=Object.values(ref.drivers).filter(d=>d.rarity==='Special');assert.equal(editions.length,22);
assert.equal(editions.filter(d=>ctx.window.GBRSpecialEditions.groupOf(d)==='paddock').length,8);
assert.equal(editions.filter(d=>ctx.window.GBRSpecialEditions.groupOf(d)==='paddock-turbo').length,8);
assert.equal(editions.filter(d=>ctx.window.GBRSpecialEditions.groupOf(d)==='green').length,6);
const unique=new Set();let partMissing=0,driverMissing=0;
for(const [name,p] of Object.entries(ref.parts)){
 const key=name.normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g,'')+'|'+p.rarity;
 assert(!unique.has(key),'Duplicidade de peça '+key);unique.add(key);
 for(const [level,values] of Object.entries(p.levels||{})){
  assert(Number(level)>0&&Number.isInteger(Number(level)),name+' nível inválido');
  assert(Array.isArray(values)&&values.length===5&&values.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0),name+' estatísticas inválidas');
 }
 if(!art.getImage({name,rarity:p.rarity,category:p.category},'parts'))partMissing++;
}
const identities=new Set();for(const [key,d] of Object.entries(ref.drivers)){
 const identity=[d.name,d.rarity,d.editionLabel||''].join('|').toLowerCase();assert(!identities.has(identity),'Piloto duplicado '+identity);identities.add(identity);
 if(!art.getImage(d,'drivers'))driverMissing++;
}
assert.equal(partMissing,0,'Imagens das peças ausentes');assert.equal(driverMissing,0,'Barrichello com recorte do anúncio oficial enviado pelo usuário');
for(const driver of ['Verstappen','Leclerc','Lawson','Hadjar','Piastri','Sainz']){
 const item={name:driver,rarity:'Special',editionLabel:'Edições Especiais'};
 assert.match(art.getSource(item,'drivers').url,/f1clash-driver-[a-z]+-signature-stars\.jpg$/);
}
for(const name of ['Andretti','Mansell','Fittipaldi','Brabham','Fangio'])assert.equal(art.getSource({name,rarity:'Legendary'},'drivers').origin,'reference');
// Imagem cadastrada pelo jogador mantém precedência sobre links públicos.
const fav={name:'Fangio',rarity:'Legendary',editionLabel:''};
state['gbr_visual_images_v53']=JSON.stringify({[art.overrideKey(fav,'drivers')]:'https://example.com/my-fangio.jpg'});
assert.equal(art.getSource(fav,'drivers').url,'https://example.com/my-fangio.jpg');
const s12=['Adrenaline','Eco Cell+','Thunderbolt','The Singularity','Flex XXL','The Reverse','Control'];
for(const name of s12){assert.deepEqual(Object.keys(ref.parts[name].levels),['1']);assert(ctx.window.GBRPartAutoFill.resolve(name,'Epic',1));assert.equal(ctx.window.GBRPartAutoFill.resolve(name,'Epic',2),null)}
// Regressão de conta antiga: a nova referência Barrichello não deve duplicar um cadastro existente.
const appCode=read('app.js');const migrationHead=appCode.split('let currentSetup=null;')[0];
vm.runInContext(migrationHead+'\nwindow.__megaMigration={migrateGaragem};',ctx,{filename:'app-migration'});
const original={parts:[],drivers:[{id:'existing-rb',name:'Barrichello',rarity:'Legendary',series:12,level:2,owned:true,overtaking:82}],deletedCards:{parts:[],drivers:[]},schemaVersion:7};
const migrated=ctx.window.__megaMigration.migrateGaragem(original);
assert.equal(migrated.drivers.filter(d=>d.rarity==='Legendary'&&legends.equivalent(d.name,'Rubens Barrichello')).length,1);
assert.equal(migrated.drivers.find(d=>d.id==='existing-rb').overtaking,82);
// A página possui 24 circuitos; cada opção deve corresponder a um circuito existente.
const app=read('app.js');const a=app.indexOf('const TRACKS_2026 ='),b=app.indexOf('const TRACK_SERIES =',a);assert(a>0&&b>a);
vm.runInContext(app.slice(a,b)+'\nwindow.__tracks=TRACKS_2026;',ctx,{filename:'app-tracks'});
const trackIds=new Set(Array.from(ctx.window.__tracks,x=>x.id));assert.equal(trackIds.size,24);
const code=read('events-gp.js').replace('makeNav();\n})();','window.__auditEvents=EVENTS;\nwindow.__auditGP={computeSetup,boostedDriver,boostedPart,bonusForPlanning};\n})();');
assert(code.includes('window.__auditEvents=EVENTS;'));
ctx.window.F1App={getGarage:()=>({drivers:[],parts:[],trackPlans:{}})};
vm.runInContext(code,ctx,{filename:'events-gp.js'});
const events=ctx.window.__auditEvents,ids=new Set(events.map(e=>e.id));assert.equal(ids.size,events.length);
const expected={
 'sao-paulo-spectacular-2026':{tracks:7,boost:'Samba',drivers:2,parts:3,legendary:true},
 'moustache-madness-2026':{tracks:7,boost:'Handlebar',drivers:1,parts:3,legendary:true},
 'las-vegas-grand-prix-2026':{tracks:7,boost:'Glamour',drivers:2,parts:3,legendary:false},
 'qatar-legendary-event-2026':{tracks:7,boost:'Turquia',drivers:2,parts:3,legendary:true}}
for(const [id,e] of Object.entries(expected)){
 const item=events.find(x=>x.id===id);assert(item,id);assert.equal(item.tracks.length,e.tracks,id);assert.equal(item.eventBoost,e.boost,id);assert.equal(item.driverBoosts.length,e.drivers,id);assert.equal(item.partBoosts.length,e.parts,id);assert.equal(item.allowLegendary,e.legendary,id);assert(item.tracks.every(x=>trackIds.has(x)),id+' pista inexistente');
 const artPath=path.join(root,item.image);assert(fs.existsSync(artPath)&&fs.statSync(artPath).size>500,id+' banner');
 if(item.rulesConfirmed===false)assert.equal(ctx.window.__auditGP.computeSetup(item,ctx.window.GBREvents?.categories?.[0]||{id:'junior',series:3},item.tracks[0]),null);
}
assert.equal(events.find(e=>e.id==='sao-paulo-spectacular-2026').sponsor.campeao.final,'6 pontos de corrida');
for(const e of events)for(const x of e.tracks)assert(trackIds.has(x),e.id+' contém pista não cadastrada '+x);
assert(events.some(e=>e.id==='mexico-grand-prix-2026'),'GP do México deve continuar no histórico');
assert(events.some(e=>e.id==='us-grand-prix-2026'),'GP dos Estados Unidos deve continuar no histórico');
console.log(`PASS mega audit: ${Object.keys(ref.parts).length} peças, ${Object.keys(ref.drivers).length} pilotos, 0 duplicatas de identidade, imagens faltantes ${partMissing}/${driverMissing}, ${events.length} eventos e 24 circuitos.`);
