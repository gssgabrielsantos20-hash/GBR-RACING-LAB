/* Regressao: fotos oficiais dos tres eventos, sem hotlinks nem dependencias da conta. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const store={};
const garage={drivers:[],parts:[],trackPlans:{}};
const ctx={window:{F1App:{getGarage:()=>garage}},document:{getElementById:()=>null,dispatchEvent(){}},localStorage:{getItem:key=>store[key]||null,setItem:(key,value)=>store[key]=value},URL,console,setInterval(){},clearInterval(){},CustomEvent:function(){}};
vm.createContext(ctx);
for(const name of ['legendary-drivers.js','catalog.js','special-editions.js','card-art.js'])vm.runInContext(read(name),ctx,{filename:name});
const patched=read('events-gp.js').replace('makeNav();\n})();','window.__photoTest={events:EVENTS,featuredHtml};\n})();');
assert.notEqual(patched,read('events-gp.js'),'Gancho de teste do evento encontrado');
vm.runInContext(patched,ctx,{filename:'events-gp.js'});
const {events,featuredHtml}=ctx.window.__photoTest;
const expected={
 'sao-paulo-spectacular-2026':['rubens-barrichello','nigel-mansell','eco-cell','aura-lock','zephyr'],
 'moustache-madness-2026':['nigel-mansell','bounce','wobble','axis-3000'],
 'mexico-grand-prix-2026':['charles-leclerc','liam-lawson','the-reverse','power-grid','laminar'],
 'us-grand-prix-2026':['oliver-bearman','gabriel-bortoleto','fracture','motion-link-v2','tailwind']
};
let checked=0;
for(const [eventId,names] of Object.entries(expected)){
 const event=events.find(e=>e.id===eventId);
 assert.ok(event,eventId);
 const html=featuredHtml(event);
 for(const name of names){
  const resource=`assets/events/featured/${eventId}-${name}.webp`;
  assert.ok(html.includes(`src="${resource}"`),resource+' deve ser a imagem primaria');
  const bytes=fs.readFileSync(path.join(root,resource));
  assert.ok(bytes.length>2000,resource+' vazia');
  assert.equal(bytes.subarray(0,4).toString(),'RIFF',resource+' nao e WebP');
  assert.equal(bytes.subarray(8,12).toString(),'WEBP',resource+' nao e WebP');
  checked++;
 }
}
assert.equal(checked,19);
const barrichello={name:'Rubens Barrichello',rarity:'Legendary'};
const expectedRubens='assets/events/featured/sao-paulo-spectacular-2026-rubens-barrichello.webp';
assert.equal(ctx.window.GBRCardArt.getSource(barrichello,'drivers').url,expectedRubens,'A carta de Barrichello usa arte oficial fornecida');
const key=ctx.window.GBRCardArt.overrideKey(barrichello,'drivers');
store.gbr_visual_images_v53=JSON.stringify({[key]:'https://example.com/minha-foto.jpg'});
assert.equal(ctx.window.GBRCardArt.getSource(barrichello,'drivers').url,'https://example.com/minha-foto.jpg','Foto cadastrada pelo jogador tem prioridade');
const html=featuredHtml(events.find(e=>e.id==='sao-paulo-spectacular-2026'));
assert.ok(html.includes('src="https://example.com/minha-foto.jpg"'),'Override aparece na ficha');
assert.ok(html.includes(expectedRubens),'Arte do evento permanece como fallback');
console.log(`PASS: ${checked} imagens locais presentes e visiveis na ficha, formato WebP, prioridade do usuario e Barrichello com fallback.`);
