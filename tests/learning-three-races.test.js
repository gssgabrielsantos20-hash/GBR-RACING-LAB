/* Testes puros do domínio, sem login, dados reais ou gravação no banco. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const base = path.join(__dirname, '..');
const sandbox={window:{},crypto:{randomUUID:()=> 'fake-id'}};
vm.runInNewContext(fs.readFileSync(path.join(base,'gbr-learning-model.js'),'utf8'),sandbox);
const m=sandbox.window.GBRRaceLearning;
const win = (id, track='monza', series=12) => ({id,series,trackId:track,result:'win',own:{speed:70,corner:60},rival:{speed:45,corner:50}});
const loss=(id, track='monza', series=12) => ({id,series,trackId:track,result:'loss',own:{speed:25,corner:40},rival:{speed:50,corner:55}});
const filter={trackId:'monza',series:12};
let result=m.summary([win('a'),loss('b')],filter);
assert.equal(result.sample,2);assert.equal(result.missingToStart,1);assert.equal(result.diagnosticReady,false);
assert.equal(result.quality,'insuficiente');assert.equal(result.patterns.length,0);
result=m.summary([win('a'),loss('b'),win('c')],filter);
assert.equal(result.sample,3);assert.equal(result.missingToStart,0);assert.equal(result.diagnosticReady,true);
// Mesmo ID recebido duas vezes não representa duas corridas distintas.
let repeated=m.summary([win('a'),loss('b'),win('a')],filter);
assert.equal(repeated.sample,2);assert.equal(repeated.diagnosticReady,false);
// Estatísticas globais continuam disponíveis sem permitir hipóteses misturando pistas.
let aggregate=m.summary([win('a'),loss('b'),win('c')]);
assert.equal(aggregate.sample,3);assert.equal(aggregate.diagnosticReady,false);
assert.equal(aggregate.patterns.length,0);
assert.equal(result.quality,'preliminar');assert(result.patterns.some(x=>x.key==='speed'));
assert(result.experiments.some(x=>x.key==='speed'));
result=m.summary([win('a'),win('b'),win('c')],filter);
assert.equal(result.sample,3);assert.equal(result.diagnosticReady,false);assert.equal(result.quality,'insuficiente');assert.equal(result.patterns.length,0);
result=m.summary([win('a'),loss('b'),win('c','spa')],filter);
assert.equal(result.sample,2);assert.equal(result.missingToStart,1);assert.equal(result.diagnosticReady,false);
result=m.summary([win('a'),loss('b'),win('c','monza',11)],filter);
assert.equal(result.sample,2);assert.equal(result.diagnosticReady,false);
result=m.summary([win('a'),loss('b'),win('c'),loss('d')],{trackId:'spa',series:12});
assert.equal(result.sample,0);assert.equal(result.missingToStart,3);
const many=Array.from({length:20},(_,i)=>i%2?loss('l'+i):win('w'+i));
result=m.summary(many,filter);assert.equal(result.quality,'observacao-moderada');
// A prevenção original de duplo clique permanece; não atribuir identidade a duas corridas iguais em outra data.
const garage={raceAnalyses:[{...win('a'),createdAt:'2026-10-19T10:00:00Z',rival:{speed:45,corner:50},driverComparison:null,tyreStrategy:null,competition:null}]};
const dup={...win('b'),createdAt:'2026-10-19T10:00:30Z',rival:{speed:45,corner:50},driverComparison:null,tyreStrategy:null,competition:null};
assert.throws(()=>m.add(garage,dup),/já foi registrado/);
console.log('OK 10 cenários: 2 registros; 3 mistos; 3 iguais; pista; série; filtro vazio; 20 históricos; deduplicação.');
