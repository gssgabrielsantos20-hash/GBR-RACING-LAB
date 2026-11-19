const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
const sandbox={window:{}};
const dir=path.join(__dirname,'..');
for(const f of ['gbr-learning-model.js','gbr-race-verdict.js']) vm.runInNewContext(fs.readFileSync(path.join(dir,f),'utf8'),sandbox,{filename:f});
const explain=sandbox.window.GBRRaceVerdict.explain;
const rec=(id,result,trackId='monza',series=12,competition=null)=>({id,result,trackId,series,own:{speed:result==='win'?80:40,corner:65},rival:{speed:50,corner:60},competition});
let count=0;
function test(label,fn){fn();count++;process.stdout.write('OK '+label+'\n');}
function hist(r,previous){const e=explain(r,previous);return {e,txt:e.facts.join(' ')}}
test('1 corrida: faltam 2, sem regra 8',()=>{const {e,txt}=hist(rec('a','win'),[]);assert.match(txt,/Faltam 2/);assert.equal(e.confidence,'insuficiente');assert.doesNotMatch(txt,/mínimo 8/)});
test('2 corridas: falta 1',()=>{const {e,txt}=hist(rec('b','loss'),[rec('a','win')]);assert.match(txt,/Faltam 1/);assert.equal(e.confidence,'insuficiente')});
test('3 registros vitória/derrota: inicial',()=>{const {e,txt}=hist(rec('c','win'),[rec('a','win'),rec('b','loss')]);assert.match(txt,/3 corrida\(s\)/);assert.match(txt,/Diagnóstico inicial/);assert.equal(e.confidence,'preliminar');assert(e.actions.some(x=>x.includes('velocidade'))||e.actions.some(x=>x.includes('Teste variar')))});
test('3 com resultado só vitória: sem hipóteses comparativas',()=>{const {e,txt}=hist(rec('c','win'),[rec('a','win'),rec('b','win')]);assert.match(txt,/faltam resultados contrastantes/);assert.equal(e.confidence,'insuficiente')});
test('Pistas e séries diferentes não contam',()=>{const {txt}=hist(rec('c','win'),[rec('a','win','spa'),rec('b','loss','monza',11)]);assert.match(txt,/Faltam 2/)});
test('ID duplicado não acelera diagnóstico',()=>{const {txt}=hist(rec('c','win'),[rec('a','win'),rec('a','win'),rec('b','loss','spa')]);assert.match(txt,/Faltam 1/)});
test('Registros incluem corrida já existente sem contagem dupla',()=>{const r=rec('c','win');const {e,txt}=hist(r,[rec('a','win'),rec('b','loss'),r]);assert.match(txt,/3 corrida\(s\)/);assert.equal(e.confidence,'preliminar')});
test('Cenarios evento com corridas diferentes mesma pista contam',()=>{const c=n=>({mode:'event',eventId:'GP',category:'challenger',race:n});const {e,txt}=hist(rec('c','win','monza',12,c(3)),[rec('a','win','monza',12,c(1)),rec('b','loss','monza',12,c(2))]);assert.match(txt,/3 corrida\(s\)/);assert.equal(e.confidence,'preliminar')});
test('20 histórico: classificação observacional, sem promessa causal',()=>{const all=Array.from({length:19},(_,i)=>rec('r'+i,i%2===0?'loss':'win'));const {e,txt}=hist(rec('final','win'),all);assert.match(txt,/20 corrida\(s\)/);assert.equal(e.confidence,'observacional');assert.match(e.caveat,/não comprovam/)});
console.log(`${count} testes aprovados`);
