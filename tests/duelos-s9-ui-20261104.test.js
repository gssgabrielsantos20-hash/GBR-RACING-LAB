'use strict';
// Regressão da tela de Duelos: a Série 9 precisa aparecer na área de rotação
// e antes das outras pistas no seletor, sem ocultar a biblioteca antiga.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'gbr-intelligence.js'),'utf8');
let simulatedDate='2026-11-04T12:00:00-03:00';
class TestDate extends Date {
 constructor(...args){super(...(args.length?args:[simulatedDate]));}
 static now(){return new Date(simulatedDate).getTime();}
}
function element(value=''){
 const listeners={};
 return {value,innerHTML:'',listeners,
  addEventListener(type,cb){listeners[type]=cb;},
  contains(){return true;},
  remove(){},
  fire(type){listeners[type]?.();}
 };
}
const nodes={
 duel:element(),garage:element(),gbrDuelRotation:element(),gbrDuelRotationBody:element(),
 gbrGarageFavoritesSpotlight:element(),duelSeries:element('9'),duelTrack:element('')
};
const document={
 readyState:'complete',
 getElementById(id){return nodes[id]||null;},
 addEventListener(){}
};
const all=[
 {id:'barcelona',name:'Barcelona'},{id:'monza',name:'Monza'},
 {id:'jeddah',name:'Jeddah'},{id:'silverstone',name:'Silverstone'},
 {id:'baku',name:'Baku'},{id:'mexico',name:'Cidade do México'},
 {id:'miami',name:'Miami'},{id:'montreal',name:'Montreal'},
 {id:'sakhir',name:'Sakhir'}
];
const ctx={document,window:{F1Tracks:{all}},Date:TestDate,console,URL,queueMicrotask,setTimeout};
vm.createContext(ctx);
vm.runInContext(source,ctx,{filename:'gbr-intelligence.js'});
const intelligence=ctx.window.GBRIntelligence;
assert(intelligence,'a UI inicializa o módulo');
assert.match(nodes.gbrDuelRotationBody.innerHTML,/Série 9 · 4 pistas/);
for(const track of ['Barcelona','Monza','Jeddah','Silverstone'])
 assert(nodes.gbrDuelRotationBody.innerHTML.includes(track),`S9 mostra ${track}`);
assert.match(nodes.gbrDuelRotationBody.innerHTML,/Rotação vigente: 04\/11\/2026 a 10\/11\/2026/);
assert.match(nodes.duelTrack.innerHTML,/Rotação vigente · Série 9/);
assert.match(nodes.duelTrack.innerHTML,/Outras pistas da biblioteca/);
assert(nodes.duelTrack.innerHTML.indexOf('id="no-match"')===-1);
assert(nodes.duelTrack.innerHTML.indexOf('Barcelona')<nodes.duelTrack.innerHTML.indexOf('Baku'));
assert(nodes.duelTrack.innerHTML.includes('Sakhir'),'não remover acesso às demais pistas da biblioteca');
// O seletor mantém a pista enquanto permanece na mesma série.
nodes.duelTrack.value='barcelona';intelligence.refresh();
assert.equal(nodes.duelTrack.value,'barcelona');
// Ao mudar de série, não carrega uma pista antiga como se fosse vigente.
nodes.duelSeries.value='10';nodes.duelSeries.fire('change');
assert.equal(nodes.duelTrack.value,'');
assert.match(nodes.gbrDuelRotationBody.innerHTML,/Série 10 · 4 pistas/);
assert.match(nodes.duelTrack.innerHTML,/Rotação vigente · Série 10/);
assert(nodes.duelTrack.innerHTML.includes('Cidade do México'));
// Após vencer o ciclo S9, mostrar aviso e não oferecer a rotação antiga como vigente.
simulatedDate='2026-11-11T12:00:00-03:00';
nodes.duelSeries.value='9';nodes.duelSeries.fire('change');
assert.match(nodes.gbrDuelRotationBody.innerHTML,/Vigência encerrada/);
assert.match(nodes.gbrDuelRotationBody.innerHTML,/Não vigente/);
assert(!nodes.duelTrack.innerHTML.includes('Rotação vigente · Série 9'));
assert(nodes.duelTrack.innerHTML.includes('Sakhir'));
// S10 continua independente até o seu próprio fim.
nodes.duelSeries.value='10';nodes.duelSeries.fire('change');
assert.match(nodes.gbrDuelRotationBody.innerHTML,/Rotação vigente: 04\/11\/2026 a 17\/11\/2026/);
assert.match(nodes.duelTrack.innerHTML,/Rotação vigente · Série 10/);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('gbr-intelligence.js?v=20261105context1'));
assert(html.includes('gbr-intelligence.css?v=20261104s9ui2'));
assert(source.includes('Rotações verificadas: Séries 9, 10, 11 e 12. A Série 9 possui período próprio.'));
console.log('PASS UI S9: 4 pistas visíveis, seletor prioriza a rotação, troca de série limpa a seleção, calendário independente e novo cache busting.');
