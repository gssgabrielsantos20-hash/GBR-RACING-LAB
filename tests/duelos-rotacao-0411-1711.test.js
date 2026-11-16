'use strict';
// Gravação do F1 Clash de 04/11/2026: S9 com ciclo de 7 dias, S10–12 de 14 dias.
const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..'),src=name=>fs.readFileSync(path.join(root,name),'utf8');
const ctx={window:{},document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},console,Date,URL};vm.createContext(ctx);
vm.runInContext(src('gbr-intelligence.js'),ctx,{filename:'gbr-intelligence.js'});
const intel=ctx.window.GBRIntelligence;
const expected={
 9:[['barcelona','tyreUse','speed',7],['monza','defending','speed',4],['jeddah','defending','speed',6],['silverstone','tyreUse','speed',7]],
 10:[['baku','tyreUse','power',7],['mexico','tyreUse','power',9],['barcelona','tyreUse','speed',10],['silverstone','tyreUse','speed',7]],
 11:[['miami','overtaking','speed',6],['las-vegas','overtaking','speed',6],['spa','overtaking','power',6],['hungaroring','overtaking','corner',8]],
 12:[['montreal','raceStart','power',8],['melbourne','raceStart','corner',9],['spielberg','raceStart','corner',7],['singapore','raceStart','speed',6]]
};
let count=0;
for(const [series,rows] of Object.entries(expected)){
 const found=intel.rotations[series]?.rotation;
 assert.equal(found.length,4,`4 pistas Série ${series}`);
 found.forEach((row,i)=>{
  assert.deepEqual([row.id,row.driver,row.car,row.laps],rows[i],`Série ${series}, pista ${i+1}`);
  assert.equal(row.weather,null,`clima não comprovado na gravação: S${series} ${row.id}`);
  const context=intel.duelContext(series,row.id,'2026-11-04');
  assert(context,`contexto para S${series} ${row.id}`);
  assert.equal(context.periodStart,'2026-11-04');
  assert.equal(context.periodEnd,Number(series)===9?'2026-11-10':'2026-11-17');
  assert.equal(context.mode,'duel');
  assert(context.source.includes('Vídeo do F1 Clash'));
  assert.equal(intel.priorityFor(series,row.id,'2026-11-04')[0],row.driver);
  count++;
 });
}
assert.equal(count,16);
// Rotações antigas preservadas no histórico, e nenhuma nova prioridade antes de 04/11.
assert.equal(intel.listNewSeries('2026-11-03').length,12);
assert.equal(intel.rotationEntry(12,'miami','2026-11-03')?.laps,6);
assert.equal(intel.rotationEntry(12,'montreal','2026-11-03'),null);
assert.equal(intel.rotationEntry(9,'barcelona','2026-11-03'),null,'S9 anterior desconhecida');
assert.equal(intel.listNewSeries('2026-11-04').length,16);
assert.equal(intel.rotationEntry(12,'montreal','2026-11-04')?.laps,8);
assert.equal(intel.rotationEntry(10,'monza','2026-11-04'),null,'S10 antiga não vigente');
assert.equal(intel.rotationEntry(11,'singapore','2026-11-04'),null,'S11 antiga não vigente');
assert.equal(intel.duelContext(9,'barcelona','2026-11-10')?.laps,7);
assert.equal(intel.duelContext(9,'barcelona','2026-11-11'),null,'S9 encerra antes da S10');
assert.equal(intel.priorityFor(9,'barcelona','2026-11-11'),null);
assert.equal(intel.rotationPeriodStatus('2026-11-10',9).status.includes('vigente'),true);
assert.equal(intel.rotationPeriodStatus('2026-11-11',9).expired,true);
assert.equal(intel.rotationPeriodStatus('2026-11-11',10).expired,undefined);
assert.equal(intel.rotationPeriodStatus('2026-11-11',10).period.end,'2026-11-17');
assert.equal(intel.rotationPeriodStatus('2026-11-03',9).unverified,true);
assert.equal(intel.rotationPeriodStatus('2026-11-03',10).upcoming.includes('04/11/2026'),true);
assert.equal(intel.listNewSeries('2026-11-11').length,12,'S9 não deve alimentar recomendações após 10/11');
assert.equal(intel.listNewSeries('2026-11-17').length,12);
assert.equal(intel.listNewSeries('2026-11-18').length,0);
assert.equal(intel.duelContext(12,'montreal','2026-11-18'),null);
assert.equal(intel.rotationPeriodStatus('2026-11-18',12).expired,true);
// Integração com referência de pneus: apenas voltas comprovadas, sem stints inventados.
vm.runInContext(src('gbr-strategy-reference.js'),ctx,{filename:'gbr-strategy-reference.js'});
const ref=ctx.window.GBRStrategyReference;
const old=ref.lookup({competition:{mode:'series'},series:12,trackId:'miami',asOf:'2026-11-03'});
assert.equal(old.laps,6);assert.equal(old.status,'sem-estrategia');
const fresh=ref.lookup({competition:{mode:'series'},series:12,trackId:'montreal',asOf:'2026-11-04'});
assert.equal(fresh.laps,8);assert.equal(fresh.status,'sem-estrategia');assert(fresh.source.includes('Vídeo do F1 Clash'));
assert(!('stints' in fresh));
const s9valid=ref.lookup({competition:{mode:'series'},series:9,trackId:'jeddah',asOf:'2026-11-10'});
assert.equal(s9valid.laps,6);
const s9expired=ref.lookup({competition:{mode:'series'},series:9,trackId:'jeddah',asOf:'2026-11-11'});
assert.equal(s9expired.laps,undefined,'S9 expirada não gera estratégia');
const expired=ref.lookup({competition:{mode:'series'},series:12,trackId:'montreal',asOf:'2026-11-18'});
assert.equal(expired.laps,undefined);
const text=src('gbr-intelligence.js'),engineer=src('gbr-duel-engineer.js');
assert(text.includes('Prévia da próxima rotação'));assert(text.includes('NÃO vigente até 04/11.'));
assert(text.includes('Clima não informado'));
assert(engineer.includes('clima não informado no vídeo'));
assert(engineer.includes("duel.weather==='mixed'?'variable':null"));
const html=src('index.html');
assert(html.includes('gbr-intelligence.js?v=20261105context1'));
assert(html.includes('gbr-podium-model.js?v=20261104podio1'),'manter Modo Pódio');
assert(html.includes('gbr-podium-ui.js?v=20261104podio1'),'manter UI Pódio');
const app=src('app.js');assert(app.includes('gpPodiumObservations:[]'),'não perder dados de GP');
// Teste real do motor de planejamento: mesmo com durabilidades cadastradas, clima
// desconhecido não produz stints numéricos nem recupera histórico de GP.
const engineCtx={window:{},document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},console,Date,URL};
vm.createContext(engineCtx);
for(const filename of ['gbr-intelligence.js','gbr-pre-gp-engine.js'])
 vm.runInContext(src(filename),engineCtx,{filename});
engineCtx.window.GBRCore={trackWeights:()=>({speed:1,corner:1,power:1,qualifying:1}),scorePart:()=>1};
engineCtx.window.F1Tracks={all:[{id:'barcelona',name:'Barcelona'}],plans:()=>[{stints:[{type:'soft',laps:7}],stops:0}]};
vm.runInContext(src('gbr-duel-engineer.js'),engineCtx,{filename:'gbr-duel-engineer.js'});
const mockGarage={drivers:[
 {name:'Piloto Alfa',owned:true,level:1,series:1,tyreUse:100,overtaking:30,defending:20,qualifying:10,raceStart:10},
 {name:'Piloto Beta',owned:true,level:1,series:1,tyreUse:90,overtaking:20,defending:30,qualifying:10,raceStart:10}
],parts:[],trackPlans:{'9:barcelona':{soft:7,medium:7,hard:7}},raceAnalyses:[{mode:'gp',series:9,trackId:'barcelona'}]};
const actual=engineCtx.window.GBRDuelEngineer.planFor(9,'barcelona',mockGarage);
assert(actual,'Engenheiro de Duelos usa contexto de S9');
assert.equal(actual.race.weather,null,'clima desconhecido permanece null até o motor');
assert.equal(actual.plan.tyreOptions.length,0,'não inventar plano de pneus, mesmo com durabilidade');
assert(actual.plan.warnings.some(w=>w.includes('Condição meteorológica não informada')));
assert.equal(actual.plan.evidenceSample,0,'nenhum GP conta como Duelo');
console.log('PASS: 16 pistas S9–S12, ciclos independentes, clima desconhecido e GP isolado, incluindo motor real de planejamento.');
