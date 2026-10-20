/* GBR Racing Lab 5.5.14C — explicação observacional, não atribuição causal. */
(()=>{'use strict';
const label=(k)=>window.GBRRaceLearning?.LABELS?.[k]||k;
const round=x=>Math.round(Number(x)*100)/100;
function explain(record,previous=[],reference=null){
 const model=window.GBRRaceLearning;
 const insight=model.recordInsights(record);
 // Inclui a corrida em análise: o primeiro parecer após o terceiro registro
 // deve observar as três corridas, sem exigir um quarto registro.
 // O resumo do domínio descarta IDs duplicados e cruza apenas mesma pista/série.
 const peer=(Array.isArray(previous)?previous:[]).filter(r=>r&&r.trackId===record.trackId&&Number(r.series)===Number(record.series));
 const history=model.summary([record,...peer],{series:record.series,trackId:record.trackId});
 const facts=[],hypotheses=[],actions=[];
 const result=record.result==='win'?'vitória':'derrota';
 facts.push(`Resultado registrado: ${result}. ${record.series}ª série selecionada; pista e condições conforme informações revisadas.`);
 if(insight.diffs.length){
  const p=insight.positives[0],n=insight.negatives[0];
  if(p)facts.push(`Carro: sua maior vantagem observada foi ${p.label.toLowerCase()} (${round(Math.abs(p.delta))}${p.unit?' '+p.unit:''}).`);
  if(n)facts.push(`Carro: a maior desvantagem observada foi ${n.label.toLowerCase()} (${round(Math.abs(n.delta))}${n.unit?' '+n.unit:''}).`);
  if(n&&record.result==='loss')hypotheses.push(`A desvantagem em ${n.label.toLowerCase()} pode ter prejudicado o desempenho, mas o relatório sozinho não demonstra que causou a derrota.`);
  if(p&&record.result==='win')hypotheses.push(`A vantagem em ${p.label.toLowerCase()} pode ter ajudado na vitória; não é possível isolar seu efeito.`);
  if(p&&record.result==='loss')hypotheses.push(`Mesmo com vantagem em ${p.label.toLowerCase()}, a equipe perdeu; outras variáveis precisam ser observadas.`);
 }
 const pd=insight.pilotDiffs||[];
 if(pd.length){
  const behind=pd.slice().filter(d=>d.delta<0).sort((a,b)=>a.delta-b.delta)[0];
  const ahead=pd.slice().filter(d=>d.delta>0).sort((a,b)=>b.delta-a.delta)[0];
  if(behind)facts.push(`Pilotos (média de duas cartas): o rival teve +${round(-behind.delta)} em ${behind.label.toLowerCase()}.`);
  if(ahead)facts.push(`Pilotos (média de duas cartas): você teve +${round(ahead.delta)} em ${ahead.label.toLowerCase()}.`);
 }
 if(record.pitEvidence){
  const names={own:'seu carro',rival:'carro rival'};
  for(const [side,evidence] of Object.entries(record.pitEvidence)){
   facts.push(`Pit stop de ${names[side]}: aproximadamente ${round(evidence.value).toFixed(2)} s pelas 7 peças do catálogo; não foi lido do relatório e não é usado como causa do resultado.`);
  }
 }
 const tyres=record.tyreStrategy;
 if(tyres){
  facts.push(`Pneus: ${tyres.totalLaps} voltas; ${tyres.own.map((p,i)=>`piloto ${i+1} ${p.stops.length} parada(s)`).join(', ')}.`);
  const common=tyres.own[0].stops.map(s=>s.lap).filter(l=>tyres.own[1].stops.some(t=>t.lap===l));
  if(common.length)hypotheses.push(`Ambos os seus carros pararam ao final da(s) volta(s) ${common.join(', ')}. Se dividiram o mesmo box, pode ter ocorrido espera; o relatório não comprova fila ou tempo perdido.`);
  const cmp=window.GBRStrategyReference?.comparePilots?.(tyres,reference)||[];
  if(reference?.status==='revisada'){
   facts.push(`Referência AllClash revisada em ${reference.verifiedAt}: ${cmp.filter(x=>x.same).length}/2 estratégia(s) de pilotos coincidiram integralmente.`);
   for(const c of cmp.filter(x=>!x.same)){
    hypotheses.push(`Piloto ${c.pilot}: compostos/duração dos stints divergiram da referência pública. Isso indica alternativa estratégica, não erro comprovado.`);
   }
   if(cmp.some(x=>!x.same))actions.push('Compare a estratégia alternativa em várias corridas da mesma pista e condição, considerando tráfego, desgaste e boosts.');
  }
 }else facts.push('Estratégia de pneus não informada; não é possível avaliar paradas ou stints.');
 if(history.diagnosticReady){
  facts.push(`Histórico comparável nesta pista e série (incluindo esta corrida): ${history.sample} corrida(s), ${history.wins} vitória(s) e ${history.losses} derrota(s). Diagnóstico inicial baseado em amostra pequena; hipóteses sem comprovação causal.`);
  for(const p of (history.patterns||[]).slice(0,2))actions.push(`Teste variar ${label(p.key).toLowerCase()} com os demais fatores semelhantes; associação observacional em ${p.observations} comparações.`);
 }else if(history.sample<3){
  facts.push(`Histórico comparável nesta pista e série (incluindo esta corrida): ${history.sample} corrida(s). Faltam ${3-history.sample} registro(s) distinto(s) para iniciar o diagnóstico de 3 corridas.`);
 }else{
  facts.push(`Histórico comparável nesta pista e série (incluindo esta corrida): ${history.sample} corrida(s), mas faltam resultados contrastantes: pelo menos uma vitória e uma derrota para gerar hipóteses comparativas.`);
 }
 if(!actions.length)actions.push('Registre corrida, compostos, paradas e resultado na mesma pista para comparar hipóteses sem alterar muitas variáveis de uma só vez.');
 return {headline:record.result==='win'?'Vitória registrada — fatores favoráveis e ressalvas':'Derrota registrada — pontos de atenção e ressalvas',facts,hypotheses,actions,
  confidence:history.quality==='insuficiente'?'insuficiente':history.quality==='preliminar'?'preliminar':'observacional',
  caveat:'Parecer observacional: números, pneus e coincidência com guias não comprovam por que ganhou ou perdeu. Faltam telemetria por volta, tráfego, boosts e incidentes.'};
}
window.GBRRaceVerdict=Object.freeze({explain});
})();
