'use strict';
// GBR Fase B / Etapa 1: fixture sintética, sem leitura do Supabase ou dados pessoais.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '..', 'app.js'), 'utf8');
function extract(name, stopName) {
  const start = source.indexOf('function ' + name + '(');
  const stop = source.indexOf('\nfunction ' + stopName + '(', start);
  assert.ok(start >= 0 && stop > start, 'Funções reais não localizadas: ' + name);
  return source.slice(start, stop);
}
const categories = ['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio','Bateria'];
const script = [
  'const n = x => Number(x)||0;',
  'let db={parts:[]};',
  'const types=' + JSON.stringify(categories) + ';',
  extract('scorePart','optimize'),
  extract('optimize','setupHtml'),
  '({optimize,scorePart,load:parts=>{db.parts=parts;}})'
].join('\n');
const engine=vm.runInNewContext(script,{});
const weights={speed:12,corner:65,power:12,qualifying:11};
function card(category,name,attrs={}) {return {id:name,name,category,owned:true,level:4,series:9,speed:30,corner:30,power:30,qualifying:30,pit:.42,...attrs};}
const filled=()=>categories.map((c,i)=>card(c,'normal-'+i));
function pick(parts,series=12,pit='none'){engine.load(parts);return engine.optimize(weights,series,pit);}
function chosen(parts,category='Freios'){return pick(parts).chosen.find(p=>p.category===category)?.name;}
const winner='normal-4';
test('Sete categorias são preservadas quando completas',()=>{let r=pick(filled());assert.equal(r.required.length,7);assert.equal(r.chosen.length,7)});
test('Série 3 não inclui bateria',()=>{let r=pick(filled().map(p=>({...p,series:3})),3);assert.equal(r.required.length,6);assert.equal(r.chosen.length,6)});
test('Inventário vazio não inventa peças',()=>{let r=pick([]);assert.equal(r.chosen.length,0);assert.equal(r.required.length,7)});
test('Inventário incompleto mantém ausência das categorias',()=>assert.equal(pick([card('Freios','única')]).chosen.length,1));
test('Exclui não possuídas',()=>assert.equal(chosen([...filled(),card('Freios','falsa',{owned:false,corner:999})]),winner));
test('Exclui acima da série',()=>assert.equal(chosen([...filled(),card('Freios','bloqueada',{series:13,corner:999})]),winner));
for (const [label, level] of [['zero',0],['texto inválido','NaN'],['infinito',Infinity],['booleano',true],['vazio',''],['negativo',-1]]) {
 test('Exclui nível ' + label,()=>assert.equal(chosen([...filled(),card('Freios','inválida',{level,corner:999})]),winner));
}
test('Mantém níveis legados numéricos em texto',()=>assert.equal(chosen([...filled(),card('Freios','válida',{level:'5',corner:60})]),'válida'));
test('Mantém melhor peça válida',()=>assert.equal(chosen([...filled(),card('Freios','válida',{corner:60})]),'válida'));
test('Mantém pontuação heurística Madrid (nenhum peso foi modificado)',()=>{
 const a={speed:148,corner:270,power:113,qualifying:122,pit:3.34};
 const b={speed:176,corner:213,power:140,qualifying:126,pit:3.37};
 assert.equal(Math.round(engine.scorePart(a,weights,'none')*100)/100,220.24);
 assert.equal(Math.round(engine.scorePart(b,weights,'none')*100)/100,190.23);
});