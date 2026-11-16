'use strict';
// Conferência com os prints do F1 Clash e a confirmação posterior do responsável em 02/11/2026.
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.resolve(__dirname,'..');const js=fs.readFileSync(path.join(root,'events-gp.js'),'utf8');
const patched=js.replace('makeNav();\n})();',`window.__officialTest={EVENTS,currentRounds,stageButtonsHtml,tracksHtml};\n})();`);
assert.notEqual(patched,js,'hook de teste localizado');
const ctx={window:{F1App:{getGarage:()=>({parts:[],drivers:[],trackPlans:{}})},F1Tracks:{all:[]}},document:{getElementById:()=>null},console,Date};
vm.createContext(ctx);vm.runInContext(patched,ctx,{filename:'events-gp.js'});
const {EVENTS,stageButtonsHtml,tracksHtml}=ctx.window.__officialTest;
const sp=EVENTS.find(e=>e.id==='sao-paulo-spectacular-2026');
assert(sp);assert.equal(sp.starts,'2026-11-04');assert.equal(sp.ends,'2026-11-08');
assert.deepEqual(Array.from(sp.tracks),['sao-paulo','abu-dhabi','suzuka','zandvoort','shanghai','spa','silverstone']);
assert.equal(sp.stageRounds.qualifying.length,4);assert.equal(sp.stageRounds.opening.length,8);assert.equal(sp.stageRounds.final.length,8);
const key=x=>[x.track,x.laps,x.rain,x.tempMin,x.tempMax];
const q=[['sao-paulo',9,0,26,30],['abu-dhabi',8,0,26,30],['suzuka',7,100,18,22],['zandvoort',8,0,24,28]];
const o=[['sao-paulo',9,0,26,30],['shanghai',7,0,22,24],['abu-dhabi',8,0,26,30],['spa',6,0,22,24],['suzuka',7,100,18,22],['silverstone',8,0,22,23],['zandvoort',8,0,24,28],['sao-paulo',9,0,26,30]];
const f=o; // Ordem, voltas e condições iguais às da Abertura, confirmadas pelo responsável.
for(const [stage,rows] of [['qualifying',q],['opening',o],['final',f]]){
 assert.deepEqual(Array.from(sp.stageRounds[stage],x=>key(x)),rows,stage);
 for(const x of sp.stageRounds[stage])assert(x.tempMin<=x.tempMax&&[0,100].includes(x.rain));
}
assert.deepEqual(Array.from(sp.stageRounds.opening,key),Array.from(sp.stageRounds.final,key),'Abertura e Final têm sequência e condições idênticas');
assert.notStrictEqual(sp.stageRounds.opening,sp.stageRounds.final,'etapas não compartilham objeto editável');
assert.deepEqual(Array.from(sp.partialStages),[]);
assert.deepEqual(Array.from(Object.entries(sp.stages)),[['qualifying','04–06/11/2026'],['opening','07/11/2026'],['final','08/11/2026']]);
assert.match(fs.readFileSync(path.join(root,'events-gp.css'),'utf8'),/\.gp-stages>button/);assert.match(stageButtonsHtml(sp),/Classificatória/);assert.match(stageButtonsHtml(sp),/Abertura/);assert.doesNotMatch(stageButtonsHtml(sp),/parcial/);assert.match(stageButtonsHtml(sp),/Final \(08\/11\/2026\).*8 prova/);
assert.equal(sp.sponsor.junior.requirement,'Zephyr · nível 5+');assert.equal(sp.sponsor.junior.qualifying,'2 troféus de Pit Pass');
assert.equal(sp.sponsor.junior.opening,'3.000 moedas');assert.equal(sp.sponsor.junior.final,'3 pontos de corrida');
assert.equal(sp.sponsor.competidor.requirement,'Zephyr · nível 7+');assert.equal(sp.sponsor.competidor.opening,'40.000 moedas');
assert.equal(sp.sponsor.contendor.opening,'500.000 moedas');assert.match(sp.sponsor.contendor.requirement,/Barrichello/);
assert.equal(sp.sponsor.campeao.qualifying,'6 pontos de corrida');assert.equal(sp.sponsor.campeao.final,'6 pontos de corrida');
assert.match(tracksHtml({...sp,stageRounds:{},qualifying:sp.stageRounds.qualifying,rounds:sp.stageRounds.opening}),/26–30 °C/);
const js2=fs.readFileSync(path.join(root,'gbr-pit-wall.js'),'utf8');
ctx.window.GBREvents={all:EVENTS,categories:ctx.window.GBREvents.categories};
ctx.document.readyState='loading';ctx.document.addEventListener=()=>{};
vm.runInContext(js2,ctx,{filename:'gbr-pit-wall.js'});
const ics=ctx.window.GBRPitWall.datesToICS([sp]);
assert(ics.includes('DTSTART;VALUE=DATE:20261104'));
assert(ics.includes('DTEND;VALUE=DATE:20261109'),'Calendário iPhone precisa incluir o dia 8/11 (DTEND exclusivo em 9/11)');
console.log('PASS São Paulo corrigido: 4+8+8 corridas, Final=Abertura, qualificação 04–06/11, abertura 07/11 e final 08/11, patrocinador e ICS.');
