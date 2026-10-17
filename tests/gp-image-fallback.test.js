/* 5.5.10C — robustez: arte local do banner, prioridade da biblioteca e falha real de URL externa.
   Nenhuma conexão de rede necessária: o Worker é testado separadamente. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const store={};
const garage={parts:[
 {name:'Tailwind',category:'Asa traseira',rarity:'Common',owned:true,level:10},
 {name:'Fracture',category:'Câmbio',rarity:'Epic',owned:true,level:7},
 {name:'Motion Link V2',category:'Suspensão',rarity:'Epic',owned:true,level:6}
],drivers:[
 {name:'Oliver Bearman',rarity:'Rare',owned:true,level:4},
 {name:'Gabriel Bortoleto',rarity:'Rare',owned:true,level:3}
],trackPlans:{}};
const ctx={window:{F1App:{getGarage:()=>garage}},document:{getElementById:()=>null,dispatchEvent(){}},CustomEvent:function(){},localStorage:{getItem:()=>JSON.stringify(store)},URL,console,setInterval(){return 1},clearInterval(){}};
vm.createContext(ctx);
for(const name of ['legendary-drivers.js','card-art.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx,{filename:name});
const art=ctx.window.GBRCardArt;
const events=fs.readFileSync(path.join(root,'events-gp.js'),'utf8').replace('makeNav();\n})();','window.__testFeaturedHtml=featuredHtml;makeNav();\n})();');
vm.runInContext(events,ctx,{filename:'events-gp.js'});
const event=ctx.window.GBREvents.all.find(e=>e.id==='us-grand-prix-2026');
const html=ctx.window.__testFeaturedHtml(event);
for(const [label,slug] of [['Oliver Bearman','oliver-bearman'],['Gabriel Bortoleto','gabriel-bortoleto'],['Fracture','fracture'],['Motion Link V2','motion-link-v2'],['Tailwind','tailwind']]){
 const file=`assets/events/featured/us-grand-prix-2026-${slug}.webp`;
 assert.ok(fs.statSync(path.join(root,file)).size>1000,file+' existe e não está vazio');
 const card=html.split('<article class="gp-featured-item">').find(item=>item.includes(`<b>${label}</b>`));
 assert.ok(card,label+' aparece no evento');
 assert.ok(card.includes(`src="${file}"`),label+' usa a imagem local antes de uma URL externa não verificada');
 assert.match(card,/onerror="window\.GBRCardArt\.tryNextImage\(this\)"/,label);
}
const local='assets/events/featured/us-grand-prix-2026-tailwind.webp';
const external='https://www.allclash.com/wp-content/uploads/2026/04/f1clash-rearwing-tailwind.jpg';
const defaultImg=art.thumb({name:'Tailwind',category:'Asa traseira'},'parts',{eventArt:local});
assert.ok(defaultImg.includes(`src="${local}"`));
assert.ok(defaultImg.includes(external),'URL secundária mantida');
let removed=false;let iconRemoved=false;
const image={dataset:{fallbackUrls:JSON.stringify([external])},src:local,remove(){removed=true},closest(){return {classList:{remove(name){if(name==='has-photo')iconRemoved=true}}}}};
art.tryNextImage(image);assert.equal(image.src,external);assert.equal(removed,false);assert.equal(JSON.parse(image.dataset.fallbackUrls).length,0);
art.tryNextImage(image);assert.equal(removed,true);assert.equal(iconRemoved,true);
// Fotos cadastradas pelo usuário continuam com prioridade sobre as imagens ilustrativas do GP.
const item={name:'Tailwind',category:'Asa traseira',rarity:'Common'};
store[art.overrideKey(item,'parts')]='https://example.com/custom-tailwind.webp';
const own=art.thumb(item,'parts',{eventArt:local});
assert.ok(own.includes('src="https://example.com/custom-tailwind.webp"'), 'imagem local cadastrada é prioritária');
assert.ok(own.includes(local),'miniatura local permanece como reserva');
// Caminhos de eventos são restritos; não aceitar nome arbitrário vindo de dados do usuário.
const malicious=art.thumb(item,'parts',{eventArt:'javascript:alert(1)'});
assert.ok(!malicious.includes('javascript:alert'));
console.log('OK: artes de 5 cards, prioridade das imagens, fallback após erro e bloqueio de URLs inválidas.');
