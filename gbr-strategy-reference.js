/* GBR Racing Lab 5.5.14C — catálogo estático de fontes PÚBLICAS revisadas.
   Não executar scraping no cliente e não extrapolar estratégias PRO.
   Esta versão NÃO informa vigência oficial do evento; aplica limite interno de frescor. */
(()=>{'use strict';
const SOURCES=Object.freeze({
 event:'https://www.allclash.com/f1-clash-nightmare-fuel-event-2026-guide-junior-challenger-contender-champion/',
 series12:'https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/'
});
// Referências de exemplo verificadas em 17/10/2026 no conteúdo aberto da corrida 1 de 8.
// Uma matriz completa exige nova conferência semanal, sobretudo para eventos.
const RACES=Object.freeze([
 {id:'nf26-junior-1',mode:'event',eventId:'nightmare-fuel-2026',category:'junior',race:1,trackId:'mexico',context:'seco',laps:9,source:'event',verifiedAt:'2026-10-17',stints:[[['medium',3],['medium',3],['medium',3]],[['soft',2],['medium',3],['hard',4]]]},
 {id:'nf26-challenger-1',mode:'event',eventId:'nightmare-fuel-2026',category:'challenger',race:1,trackId:'mexico',context:'seco',laps:9,source:'event',verifiedAt:'2026-10-17',stints:[[['soft',3],['soft',3],['soft',3]],[['soft',2],['medium',3],['hard',4]]]},
 {id:'nf26-contender-1',mode:'event',eventId:'nightmare-fuel-2026',category:'contender',race:1,trackId:'mexico',context:'seco',laps:9,source:'event',verifiedAt:'2026-10-17',stints:[[['medium',4],['hard',5]],[['hard',5],['medium',4]]]},
 {id:'nf26-champion-1',mode:'event',eventId:'nightmare-fuel-2026',category:'champion',race:1,trackId:'mexico',context:'seco',laps:9,source:'event',verifiedAt:'2026-10-17',stints:[[['medium',4],['hard',5]],[['hard',5],['medium',4]]]}
]);
// Série/voltas vêm de GBRIntelligence após a inicialização dos scripts,
// evitando duas tabelas divergentes. Nunca estimar stints só pelas voltas.
function activeSeries(asOf){
 const now=new Date();
 const date=asOf?String(asOf).slice(0,10):`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 return (window.GBRIntelligence?.listNewSeries?.()||[]).filter(r=>date>='2026-10-21'&&date<='2026-11-03');
}
// Data de revisão é apenas controle interno; não afirmar expiração oficial do evento.
const MAX_AGE_DAYS=7;
function status(asOf,verifiedAt){
 const now=Date.parse(String(asOf).slice(0,10)+'T00:00:00Z'),then=Date.parse(verifiedAt+'T00:00:00Z');
 return Number.isFinite(now)&&now>=then&&now-then<=MAX_AGE_DAYS*86400000?'revisada':'revalidar';
}
function lookup({competition,series,trackId,totalLaps,context,asOf=new Date().toISOString()}={}){
 const mode=competition?.mode==='event'?'event':'series';
 if(mode==='series'){
  const meta=activeSeries(asOf).find(x=>x.series===Number(series)&&x.trackId===trackId);
  return {status:'sem-estrategia',source:meta?'Tabela fornecida pelo responsável (21/10–03/11/2026)':SOURCES.series12, ...(meta?{laps:meta.laps}:{}),reason:'Número de voltas extraído da tabela 21/10–03/11; estratégias numéricas de pneus não foram verificadas. Confirme no jogo.'};
 }
 const ref=RACES.find(x=>x.eventId===competition?.eventId&&x.category===competition?.category&&x.race===Number(competition?.race)&&x.trackId===trackId);
 if(!ref)return {status:'sem-estrategia',source:SOURCES.event,reason:'Nenhuma estratégia pública validada para esta categoria, etapa e pista.'};
 const freshness=status(asOf,ref.verifiedAt);
 if(Number(totalLaps)!==ref.laps||context!==ref.context)return {status:'divergente',source:SOURCES.event,verifiedAt:ref.verifiedAt,reason:'Número de voltas ou condição climática diferente da referência: comparação bloqueada.'};
 if(freshness!=='revisada')return {status:'revalidar',source:SOURCES.event,verifiedAt:ref.verifiedAt,reason:'A referência semanal precisa de nova revisão antes de ser recomendada.'};
 return {status:'revisada',id:ref.id,source:SOURCES.event,verifiedAt:ref.verifiedAt,laps:ref.laps,stints:ref.stints.map(p=>p.map(s=>[...s])),reason:'Referência pública condicionada a pista seca e ao número de voltas informado.'};
}
function comparePilots(tyreStrategy,reference){
 if(!tyreStrategy?.own||reference?.status!=='revisada')return [];
 return tyreStrategy.own.map((pilot,i)=>{
  const plan=reference.stints[i]||[];
  const actual=window.GBRRaceLearning.tyreStints(pilot,tyreStrategy.totalLaps).map(s=>[s.compound,s.laps]);
  const same=JSON.stringify(plan)===JSON.stringify(actual);
  return {pilot:i+1,same,actual,plan,stopDifference:pilot.stops.length-Math.max(0,plan.length-1)};
 });
}
window.GBRStrategyReference=Object.freeze({SOURCES,RACES,get SERIES(){return activeSeries();},lookup,comparePilots});
})();
