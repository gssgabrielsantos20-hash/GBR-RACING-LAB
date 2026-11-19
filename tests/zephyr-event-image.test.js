/* GBR Racing Lab 5.5.10 Final — regressão da miniatura da Zephyr em Eventos GP.
   Os módulos são testados sem sessão autenticada nem acesso à rede. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const local={};
const ctx={
 window:{},
 document:{getElementById:()=>null,dispatchEvent(){}},
 CustomEvent:function(){},localStorage:{getItem(){return JSON.stringify(local)}},URL,
 console,setInterval(){return 1},clearInterval(){}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'card-art.js'),'utf8'),ctx,{filename:'card-art.js'});
const art=ctx.window.GBRCardArt;
const zephyr={name:'Zephyr',rarity:'Epic',category:'Asa dianteira'};
const url='https://www.allclash.com/wp-content/uploads/2026/04/f1clash-frontwing-zephyr.jpg';
assert.deepEqual(JSON.parse(JSON.stringify(art.getSource(zephyr,'parts'))),{url,origin:'reference'});
assert.match(art.thumb(zephyr,'parts'),/f1clash-frontwing-zephyr\.jpg/);
assert.match(art.thumb(zephyr,'parts'),/has-photo/);
const eventJs=fs.readFileSync(path.join(root,'events-gp.js'),'utf8');
assert.match(eventJs,/partBoosts:\['Stabilix','Lockdown','Zephyr'\]/);
// Expõe apenas no contexto do teste a função interna utilizada por "03 / Cartas em destaque".
const instrumented=eventJs.replace('makeNav();\n})();','window.__testFeaturedHtml=featuredHtml;makeNav();\n})();');
assert.notEqual(instrumented,eventJs);
vm.runInContext(instrumented,ctx,{filename:'events-gp.js'});
const html=ctx.window.__testFeaturedHtml(ctx.window.GBREvents.all[0]);
const card=html.match(/<article class="gp-featured-item">[\s\S]*?<b>Zephyr<\/b>[\s\S]*?<\/article>/);
assert.ok(card,'Card da Zephyr não foi encontrado no evento');
assert.match(card[0],/f1clash-frontwing-zephyr\.jpg/);
assert.match(card[0],/\+10%/);
local[art.overrideKey(zephyr,'parts')]='https://example.org/zephyr-academia-local.jpg';
assert.deepEqual(JSON.parse(JSON.stringify(art.getSource(zephyr,'parts'))),{url:local[art.overrideKey(zephyr,'parts')],origin:'local'});
assert.ok(!art.getSource({name:'Zephyr',rarity:'Epic'},'drivers').url,'Não associar peça a piloto');
console.log('OK: Zephyr em Cartas em destaque, +10% preservado, imagem correta e prioridade local.');
