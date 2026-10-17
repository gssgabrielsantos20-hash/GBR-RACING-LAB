/* GBR Racing Lab 5.5.10 — regressão estrutural dos ícones do GP dos Estados Unidos.
   Protege drivers com raridade flexível ('any'), ownership individual e peças com slug derivado. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const local={};
const garage={
 parts:[
  {name:'Fracture',category:'Câmbio',rarity:'Epic',owned:true,level:1},
  {name:'Motion Link V2',category:'Suspensão',rarity:'Epic',owned:true,level:1},
  {name:'Tailwind',category:'Asa traseira',rarity:'Common',owned:false,level:1}
 ],
 drivers:[
  {name:'Oliver Bearman',rarity:'Rare',owned:true,level:1},
  {name:'Gabriel Bortoleto',rarity:'Special',editionLabel:'Escolhas do Paddock',owned:false,level:1}
 ],
 trackPlans:{}
};
const noop=()=>null;
const ctx={
 window:{F1App:{getGarage:()=>garage}},
 document:{getElementById:noop,querySelector:noop,querySelectorAll:()=>[],dispatchEvent(){}},
 CustomEvent:function(){},localStorage:{getItem(){return JSON.stringify(local)}},URL,
 console,setInterval(){return 1},clearInterval(){}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'card-art.js'),'utf8'),ctx,{filename:'card-art.js'});
const art=ctx.window.GBRCardArt;
assert.equal(art.getSource({name:'Tailwind',category:'Asa traseira'},'parts').url,'https://www.allclash.com/wp-content/uploads/2026/04/f1clash-rearwing-tailwind.jpg');
assert.match(art.getSource({name:'Oliver Bearman',rarity:'any'},'drivers').url,/f1clash-driver-bearman-(?:paddock-picks|rare)\.jpg$/);
assert.match(art.getSource({name:'Gabriel Bortoleto',rarity:'any'},'drivers').url,/f1clash-driver-bortoleto-(?:paddock-picks|rare)\.jpg$/);
const eventJs=fs.readFileSync(path.join(root,'events-gp.js'),'utf8');
const instrumented=eventJs.replace('makeNav();\n})();','window.__testFeaturedHtml=featuredHtml;makeNav();\n})();');
assert.notEqual(instrumented,eventJs);
vm.runInContext(instrumented,ctx,{filename:'events-gp.js'});
const event=ctx.window.GBREvents.all.find(v=>v.id==='us-grand-prix-2026');
assert.ok(event,'Evento dos Estados Unidos não encontrado');
const html=ctx.window.__testFeaturedHtml(event);
const bearman=html.match(/<article class="gp-featured-item">[\s\S]*?<b>Oliver Bearman<\/b>[\s\S]*?<\/article>/);
const bortoleto=html.match(/<article class="gp-featured-item">[\s\S]*?<b>Gabriel Bortoleto<\/b>[\s\S]*?<\/article>/);
const tailwind=html.match(/<article class="gp-featured-item">[\s\S]*?<b>Tailwind<\/b>[\s\S]*?<\/article>/);
assert.ok(bearman&&bortoleto&&tailwind,'Cards destacados do GP dos Estados Unidos não renderizaram corretamente');
assert.match(bearman[0],/f1clash-driver-bearman-(?:paddock-picks|rare)\.jpg/);
assert.match(bortoleto[0],/f1clash-driver-bortoleto-(?:paddock-picks|rare)\.jpg/);
assert.match(tailwind[0],/f1clash-rearwing-tailwind\.jpg/);
assert.match(bearman[0],/✓ Cadastrado na garagem/);
assert.match(bortoleto[0],/Não identificado na garagem/);
console.log('OK: ícones do GP dos Estados Unidos resolvidos sem ajuste manual por evento.');
