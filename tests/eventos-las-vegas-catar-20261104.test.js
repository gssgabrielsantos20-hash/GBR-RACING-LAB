'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const garage={drivers:[],parts:[],trackPlans:{}};
const ctx={window:{F1App:{getGarage:()=>garage},GBRSpecialEditions:{groupOf:d=>d.editionLabel==='Edições Especiais'?'green':d.editionLabel==='Escolhas do Paddock'?'paddock':d.editionLabel==='Escolhas do Paddock: Turbo'?'paddock-turbo':''}},document:{getElementById:()=>null},localStorage:{getItem:()=>null},Date,URL,console};
vm.createContext(ctx);
const injected=read('events-gp.js').replace('makeNav();\n})();','window.__eventTests={EVENTS,isFeaturedDriver,isFeaturedPart,boostedDriver,boostedPart,computeSetup,sponsorHtml,featuredHtml};\n})();');
assert.notEqual(injected,read('events-gp.js'));
vm.runInContext(injected,ctx,{filename:'events-gp.js'});
const api=ctx.window.__eventTests;
const vegas=api.EVENTS.find(e=>e.id==='las-vegas-grand-prix-2026');
const qatar=api.EVENTS.find(e=>e.id==='qatar-legendary-event-2026');
for(const e of [vegas,qatar]){
 assert(e&&e.rulesConfirmed===true);
 assert.equal(e.featuredPercent,10);
 assert.equal(e.tracks.length,7);
 assert.equal(e.partBoosts.length,3);
 assert.equal(e.driverBoosts.length,2);
 assert(fs.statSync(path.join(root,e.image)).size>30000);
 if(e.id==='las-vegas-grand-prix-2026'){assert.equal(e.stageRounds.qualifying.length,4);assert.equal(e.stageRounds.opening.length,8);assert.equal(e.stageRounds.final.length,8);}else{assert(!e.stageRounds&&!e.rounds,'Ordem desconhecida não foi criada');}
 for(const tier of ['junior','competidor','contendor','campeao']){
  const t=e.sponsor[tier];assert(t);
  for(const stage of ['qualifying','opening','final']){assert(t[stage]);assert(t.stageRequirements[stage]);}
  const html=api.sponsorHtml(e,{id:tier,label:tier});
  assert(!html.includes('Eco Cell+'));assert(html.includes('Classificatória'));
 }
}
assert.equal(vegas.eventBoost,'Glamour');assert.equal(vegas.allowLegendary,false);assert.equal(vegas.allowSpecial,true);
assert.equal(qatar.eventBoost,'Turquia');assert.equal(qatar.allowLegendary,true);assert.equal(qatar.allowSpecial,true);
assert.equal(vegas.sponsor.junior.stageRequirements.final,'Hadjar comum Nv. 1');
assert.equal(vegas.sponsor.contendor.stageRequirements.final,'Hadjar Escolhas do Paddock Standard Nv. 4');
assert.equal(qatar.sponsor.campeao.final,'6 pontos de corrida por entrada exibida');
assert.equal(qatar.tracks[0],'lusail');
const d=(name,rarity,editionLabel='')=>({name,rarity,editionLabel,owned:true,level:3,series:8,speed:100,overtaking:60});
assert(api.isFeaturedDriver(d('Carlos Sainz','Epic'),vegas));
assert(api.isFeaturedDriver(d('Carlos Sainz','Special','Edições Especiais'),vegas));
assert(!api.isFeaturedDriver(d('Carlos Sainz','Special','Escolhas do Paddock'),vegas));
assert(api.isFeaturedDriver(d('Isack Hadjar','Special','Escolhas do Paddock'),vegas));
assert(api.isFeaturedDriver(d('Isack Hadjar','Special','Edições Especiais'),vegas));
assert(!api.isFeaturedDriver(d('Isack Hadjar','Special','Escolhas do Paddock: Turbo'),vegas));
assert(!api.isFeaturedDriver(d('Carlos Sainz','Legendary'),vegas));
assert(api.isFeaturedDriver(d('Michael Schumacher','Legendary'),qatar));
assert(!api.isFeaturedDriver(d('Rubens Barrichello','Common'),qatar));
assert(api.isFeaturedPart({name:'Stratos'},qatar));
const input=d('Carlos Sainz','Epic');const boosted=api.boostedDriver(input,vegas,true);
assert.equal(boosted.overtaking,66);assert.equal(input.overtaking,60,'Dados da garagem não alterados');
const noFeatured=api.boostedDriver(d('Carlos Sainz','Special','Escolhas do Paddock'),vegas,true);
assert.equal(noFeatured.overtaking,60);
assert(!vegas.description.toLowerCase().includes('azzaw'));assert(!qatar.description.toLowerCase().includes('azzaw'));
console.log('PASS: Vegas/Catar dados, 7 pistas, imagens, 8 tabelas de premiação, raridades e bônus isolado sem mutação.');
