/* GBR 5.5.13 — inteligência própria: evidência observacional, sem IA remota nem acesso a outros usuários. */
(()=>{'use strict';
const FIELDS=Object.freeze(['speed','corner','power','qualifying','pit','overtaking','defending','raceStart','tyreUse']);
const LABELS=Object.freeze({speed:'Velocidade',corner:'Curvas',power:'Unidade de potência',qualifying:'Qualificação',pit:'Pit stop (s)',overtaking:'Ultrapassagem',defending:'Defesa',raceStart:'Largada',tyreUse:'Gerenciamento de pneus'});
const MAX=150;
// Metadados opcionais de cartas e pneus, compatíveis com registros 1–3.
// Canonizar usando a nomenclatura do catálogo 2026, sem inferir carta por sobrenome.
const RARITIES=Object.freeze(['Common','Rare','Epic','Legendary']);
const COMPOUNDS=Object.freeze(['soft','medium','hard','wet']);
// Quatro cartas distintas no relatório de Pilotos: dois meus e dois rivais.
// Não substituir por médias implícitas; preservar os valores individuais confirmados.
const PILOT_FIELDS=Object.freeze(['overtaking','defending','qualifying','raceStart','tyreUse']);
const PILOT_LABELS=Object.freeze({overtaking:'Ultrapassagem',defending:'Defesa',qualifying:'Qualificação',raceStart:'Início de corrida',tyreUse:'Gerenciamento de pneus'});
// Limite de plausibilidade de OCR para relatórios 2026. O catálogo oficial versionado
// desta build possui valores de cartas até 99; 250 é limite defensivo alto para NÃO
// tratar concatenações como '773' como dados confiáveis. Não converter 773 em 73.
const PILOT_OCR_PLAUSIBLE_MAX=250;
const suspiciousPilotStat=value=>typeof value==='number'&&Number.isFinite(value)&&value>PILOT_OCR_PLAUSIBLE_MAX;
const toNumber=(x)=>x===''||x===null||x===undefined?null:(typeof x==='number'?x:Number(String(x).replace(',','.')));
const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
const cleanStats=(obj={})=>Object.fromEntries(FIELDS.map(key=>{const value=toNumber(obj?.[key]);if(!finite(value)||value<0||value>(key==='pit'?60:1000))return [key,null];return [key,Math.round(value*100)/100]}));
const mean=arr=>arr.length?arr.reduce((a,b)=>a+b,0)/arr.length:0;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function differences(own,rival){const a=cleanStats(own),b=cleanStats(rival);return FIELDS.filter(key=>a[key]!==null&&b[key]!==null).map(key=>({key,label:LABELS[key],own:a[key],rival:b[key],delta:Math.round((key==='pit'?b[key]-a[key]:a[key]-b[key])*100)/100,unit:key==='pit'?'s':''}));}
function makeId(){if(typeof crypto.randomUUID==='function')return crypto.randomUUID();const b=new Uint8Array(16);crypto.getRandomValues(b);return Array.from(b,v=>v.toString(16).padStart(2,'0')).join('');}
function setupSnapshot(favorite){
 if(!favorite||!Array.isArray(favorite.parts)||!Array.isArray(favorite.drivers)||favorite.parts.length<6||favorite.parts.length>7||favorite.drivers.length!==2)return null;
 const partFields=['id','name','category','rarity','level','series','speed','corner','power','qualifying','pit'];
 const driverFields=['id','name','rarity','editionLabel','level','series','overtaking','defending','qualifying','raceStart','tyreUse'];
 const copy=(item,fields)=>Object.fromEntries(fields.map(key=>{
  const value=item?.[key];return [key,typeof value==='number'?Number.isFinite(value)?value:0:String(value??'').slice(0,80)];
 }));
 const parts=favorite.parts.map(p=>copy(p,partFields)),drivers=favorite.drivers.map(d=>copy(d,driverFields));
 if(new Set(parts.map(p=>p.category)).size!==parts.length||drivers[0].id===drivers[1].id)return null;
 return {parts,drivers};
}

function cleanDriverComparison(input){
 if(input===undefined||input===null)return null;
 const sides=['own','rival'];
 if(!input||typeof input!=='object'||sides.some(side=>!Array.isArray(input[side])||input[side].length!==2))throw Error('Informe dois pilotos seus e dois pilotos do rival.');
 const exists=sides.some(side=>input[side].some(p=>String(p?.name??'').trim()||String(p?.level??'').trim()||String(p?.rarity??'').trim()||String(p?.series??'').trim()||PILOT_FIELDS.some(k=>String(p?.stats?.[k]??'').trim())));
 if(!exists)return null;
 const parsed={};
 for(const side of sides){
  parsed[side]=input[side].map((pilot,i)=>{
   const name=String(pilot?.name||'').trim().replace(/\s+/g,' ');
   if(name.length<2||name.length>70)throw Error(`Informe o nome do piloto ${i+1} do ${side==='own'?'seu time':'rival'} (até 70 caracteres).`);
   // Não usar nomes dos jogadores, URLs, HTML ou prompts como nome de carta.
   if(/[<>\x00-\x1f]/.test(name))throw Error('Nome de piloto contém caracteres inválidos.');
   const rawLevel=pilot?.level;
   const level=Number(rawLevel);
   if(rawLevel===''||rawLevel===null||rawLevel===undefined||!Number.isInteger(level)||level<1||level>50)throw Error(`Confira o nível de ${name} (1–50).`);
   const stats={};let count=0;
   for(const field of PILOT_FIELDS){
    const raw=pilot?.stats?.[field];const value=toNumber(raw);
    if(raw!==undefined&&raw!==null&&raw!==''&&(value===null||!finite(value)||value<0||value>PILOT_OCR_PLAUSIBLE_MAX))throw Error(`Atributo de ${name} inválido: ${PILOT_LABELS[field]}.`);
    stats[field]=value===null?null:Math.round(value*100)/100;
    if(stats[field]!==null)count++;
   }
   if(count===0)throw Error(`Informe ao menos um atributo confirmado para ${name}.`);
   const rawRarity=String(pilot?.rarity??'').trim();
   const rarity=rawRarity?RARITIES.find(r=>norm(r)===norm(rawRarity)):null;
   if(rawRarity&&!rarity)throw Error(`Raridade de ${name} inválida.`);
   const rawSeries=pilot?.series;
   const hasSeries=rawSeries!==undefined&&rawSeries!==null&&String(rawSeries).trim()!=='';
   const series=hasSeries?Number(rawSeries):null;
   if(hasSeries&&(!Number.isInteger(series)||series<1||series>12))throw Error(`Série da carta de ${name} inválida (1–12).`);
   // Série da carta é distinta da série da corrida; lendários podem não ter série conhecida.
   return {name,level,stats,...(rarity?{rarity}:{}),...(hasSeries?{series}:{})};
  });
  if(norm(parsed[side][0].name)===norm(parsed[side][1].name))throw Error('Os dois pilotos do mesmo time precisam ser diferentes.');
 }
 return parsed;
}
// Paradas em 'lap' ocorrem AO FINAL da volta; o composto novo inicia na volta seguinte.
// Não inferir parada, composto ou dados do adversário quando não foram informados.
function cleanTyreStrategy(input){
 if(input===undefined||input===null)return null;
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Estratégia de pneus inválida.');
 const totalLaps=Number(input.totalLaps);
 if(!Number.isInteger(totalLaps)||totalLaps<1||totalLaps>200)throw Error('Informe o total de voltas (1–200).');
 const parsePilot=(pilot,side,index)=>{
  if(pilot===null&&side==='rival')return null;
  if(!pilot||typeof pilot!=='object'||Array.isArray(pilot))throw Error(`Informe o pneu inicial do piloto ${index+1} de ${side==='own'?'sua equipe':'rival'}.`);
  const startCompound=String(pilot.startCompound??'').trim().toLowerCase();
  if(!COMPOUNDS.includes(startCompound))throw Error('Composto inicial inválido (soft, medium, hard, wet).');
  if(!Array.isArray(pilot.stops)||pilot.stops.length>3)throw Error('Informe de zero a três paradas por piloto.');
  let previous=0;
  const stops=pilot.stops.map((stop,i)=>{
   const rawLap=stop?.lap,lap=Number(rawLap),compound=String(stop?.compound??'').trim().toLowerCase();
   if(rawLap===''||rawLap===undefined||rawLap===null||!Number.isInteger(lap)||lap<=previous||lap>=totalLaps)
    throw Error(`Confira a volta da ${i+1}ª parada: deve ser crescente e anterior à última volta.`);
   if(!COMPOUNDS.includes(compound))throw Error(`Composto da ${i+1}ª parada inválido.`);
   previous=lap;
   return {lap,compound};
  });
  return {startCompound,stops};
 };
 if(!Array.isArray(input.own)||input.own.length!==2)throw Error('Informe os pneus dos dois pilotos da sua equipe.');
 const own=input.own.map((p,i)=>parsePilot(p,'own',i));
 const rival=input.rival===undefined||input.rival===null?null:(()=>{
  if(!Array.isArray(input.rival)||input.rival.length!==2)throw Error('A estratégia rival deve conter dois pilotos, quando informada.');
  return input.rival.map((p,i)=>parsePilot(p,'rival',i));
 })();
 return {totalLaps,own,...(rival?{rival}:{})};
}
function tyreStints(pilot,totalLaps){
 if(!pilot||!Array.isArray(pilot.stops)||!Number.isInteger(totalLaps)||totalLaps<1)return [];
 let from=1,compound=pilot.startCompound;
 return [...pilot.stops,{lap:totalLaps,compound:null}].map(stop=>{
  const stint={from,to:stop.lap,laps:stop.lap-from+1,compound};
  from=stop.lap+1;compound=stop.compound;
  return stint;
 });
}
function pilotDifferences(value){
 if(!value?.own||!value?.rival)return [];
 return PILOT_FIELDS.map(key=>{
  const own=value.own.map(p=>p.stats?.[key]),rival=value.rival.map(p=>p.stats?.[key]);
  if([...own,...rival].some(n=>!finite(n)||suspiciousPilotStat(n)))return null;
  const ownMean=(own[0]+own[1])/2,rivalMean=(rival[0]+rival[1])/2;
  return {key,label:PILOT_LABELS[key],own:Math.round(ownMean*100)/100,rival:Math.round(rivalMean*100)/100,delta:Math.round((ownMean-rivalMean)*100)/100,
   values:{own:[...own],rival:[...rival]},method:'media-dos-dois-pilotos'};
 }).filter(Boolean);
}
function compareFavoriteDrivers(favorite,drivers){
 if(!favorite||!drivers)return;
 const old=favorite.drivers||[];
 if(old.length!==2)return;
 const matches=(a,b)=>{
  const words=x=>norm(x).replace(/[^a-z0-9 ]/g,'').split(/\s+/).filter(Boolean);
  const aw=words(a.name),bw=words(b.name),lastA=aw.at(-1),lastB=bw.at(-1);
  const protectedSurnames=['hill','villeneuve'];
  const sameName=norm(a.name)===norm(b.name)||(lastA&&lastA===lastB&&
   (!protectedSurnames.includes(lastA)||aw.length>1&&bw.length>1&&aw[0][0]===bw[0][0]));
  return sameName&&(!Number(b.level)||Number(a.level)===Number(b.level))&&
   (!a.rarity||!b.rarity||norm(a.rarity)===norm(b.rarity))&&
   (!Number(a.series)||!Number(b.series)||Number(a.series)===Number(b.series));
 };
 const direct=matches(drivers.own[0],old[0])&&matches(drivers.own[1],old[1]);
 const swapped=matches(drivers.own[0],old[1])&&matches(drivers.own[1],old[0]);
 if(!direct&&!swapped)throw Error('Os pilotos do print não correspondem ao setup favorito selecionado. Remova o vínculo ou confira a composição e os níveis.');
}
// Dados opcionais do evento. Série do jogador != categoria do evento.
function cleanCompetition(input){
 if(input===undefined||input===null||input.mode==='series')return null;
 if(!input||input.mode!=='event'||input.eventId!=='nightmare-fuel-2026'||
  !['junior','challenger','contender','champion'].includes(input.category)||
  !Number.isInteger(Number(input.race))||Number(input.race)<1||Number(input.race)>8)
  throw Error('Confira evento, categoria e número da corrida (1–8).');
 return {mode:'event',eventId:'nightmare-fuel-2026',category:input.category,race:Number(input.race)};
}
// Marcar explicitamente quando o pit stop é calculado pelas sete peças, não
// reconhecido no print. O mesmo valor numérico NÃO significa a mesma evidência.
function cleanPitEvidence(input,own,rival){
 if(input===undefined||input===null)return null;
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Origem do pit stop inválida.');
 const result={};
 for(const side of ['own','rival']){
  const raw=input[side];if(raw===undefined||raw===null)continue;
  if(!raw||!['favorite-catalog','parts-catalog'].includes(raw.method)||raw.partsCount!==7||
   !finite(raw.value)||raw.value<=0||raw.value>60||raw.value!==(side==='own'?own:rival).pit)
   throw Error('Pit stop estimado incompatível com o indicador ou com a fonte.');
  result[side]={method:raw.method,partsCount:7,value:raw.value};
 }
 if(Object.keys(input).some(k=>!['own','rival'].includes(k)))throw Error('Origem do pit stop inválida.');
 return Object.keys(result).length?result:null;
}
function create(input,{ids=[],tracks=[],favoriteRecords=[]}={},id=makeId,now=()=>new Date().toISOString()){
 const series=Number(input?.series),trackId=String(input?.trackId||'');
 if(!Number.isInteger(series)||series<1||series>12)throw Error('Selecione uma série válida (1–12).');
 if(!trackId||!tracks.includes(trackId))throw Error('Selecione uma pista cadastrada.');
 if(!['win','loss'].includes(input?.result))throw Error('Informe se ganhou ou perdeu.');
 const favoriteId=String(input.favoriteId||'');if(favoriteId&&!ids.includes(favoriteId))throw Error('Favorito não encontrado na sua garagem.');
 const own=cleanStats(input.own),rival=cleanStats(input.rival);
 const pitEvidence=cleanPitEvidence(input.pitEvidence,own,rival);
 const driverComparison=cleanDriverComparison(input.driverComparison);
 const tyreStrategy=cleanTyreStrategy(input.tyreStrategy);
 const competition=cleanCompetition(input.competition);
 // Categorias do evento possuem limites de desbloqueio diferentes no guia 2026.
 if(competition){const limits={junior:3,challenger:6,contender:9,champion:12};
  if(series>limits[competition.category])throw Error(`Esta categoria permite cartas até a Série ${limits[competition.category]}. Revise a série da corrida.`);
 }

 const available=differences(own,rival);
 if(available.length<2&&pilotDifferences(driverComparison).length<2)throw Error('Confira dois indicadores completos dos carros ou dois atributos dos quatro pilotos.');
 const note=String(input.note||'').trim();if(note.length>240)throw Error('Observação muito longa (máximo 240 caracteres).');
 const context=String(input.context||'nao-informado');if(!['nao-informado','seco','chuva','misto'].includes(context))throw Error('Condição da pista inválida.');
 const createdAt=String(now());if(!Number.isFinite(Date.parse(createdAt)))throw Error('Data inválida.');
 const favorite=(Array.isArray(favoriteRecords)?favoriteRecords:[]).find(f=>String(f.id)===favoriteId);
 if(driverComparison&&favorite)compareFavoriteDrivers(favorite,driverComparison);
 const snapshot=favoriteId?setupSnapshot(favorite):null;
 const richCards=driverComparison&&['own','rival'].some(side=>driverComparison[side].some(p=>p.rarity||p.series));
 return {id:String(id()).slice(0,100),schemaVersion:(richCards||tyreStrategy||competition||pitEvidence)?4:driverComparison?3:snapshot?2:1,
  createdAt,series,trackId,result:input.result,favoriteId,context,own,rival,note,source:'manual-revisado',
  ...(snapshot?{setupSnapshot:snapshot}:{}),...(driverComparison?{driverComparison}:{}),...(tyreStrategy?{tyreStrategy}:{}),...(competition?{competition}:{}),...(pitEvidence?{pitEvidence}:{})};
}
function add(garage,record){
 if(!garage||typeof garage!=='object')throw Error('Garagem indisponível.');
 const current=Array.isArray(garage.raceAnalyses)?garage.raceAnalyses:[];
 if(current.length>=MAX)throw Error(`Histórico limitado a ${MAX} corridas. Exporte sua garagem e exclua registros antigos antes de continuar.`);
 if(current.some(x=>x.id===record.id))throw Error('Corrida já registrada.');
 // Janela curta de deduplicação evita duplo clique, sem proibir corridas legitimamente idênticas em dias diferentes.
 if(current.some(x=>Math.abs(Date.parse(x.createdAt)-Date.parse(record.createdAt))<120000&&
  x.trackId===record.trackId&&x.series===record.series&&x.result===record.result&&
  JSON.stringify(x.own)===JSON.stringify(record.own)&&JSON.stringify(x.rival)===JSON.stringify(record.rival)&&
  JSON.stringify(x.driverComparison||null)===JSON.stringify(record.driverComparison||null)&&
  JSON.stringify(x.tyreStrategy||null)===JSON.stringify(record.tyreStrategy||null)&&
  JSON.stringify(x.competition||null)===JSON.stringify(record.competition||null)))throw Error('Este comparativo já foi registrado há pouco.');
 return [...current,record];
}
function recordInsights(record){
 // Estimativas não entram como medição confirmada do relatório ou padrão histórico.
 const diffs=differences(record?.own,record?.rival).filter(d=>!(d.key==='pit'&&record?.pitEvidence));
 const positives=diffs.filter(x=>x.delta>0).sort((a,b)=>b.delta-a.delta);
 const negatives=diffs.filter(x=>x.delta<0).sort((a,b)=>a.delta-b.delta);
 return {diffs,positives,negatives,coverage:diffs.length,pilotDiffs:pilotDifferences(record?.driverComparison),warning:'Os atributos mostram diferenças, não provam a causa da vitória ou derrota. Pneus, boosts, pista, estratégia e decisões durante a corrida podem alterar o resultado.'};
}
function wilson(wins,total){if(!total)return {low:0,high:1};const z=1.96,p=wins/total,d=1+z*z/total,ctr=(p+z*z/(2*total))/d,err=z*Math.sqrt(p*(1-p)/total+z*z/(4*total*total))/d;return {low:Math.max(0,ctr-err),high:Math.min(1,ctr+err)};}
function summary(records=[],filters={}){
 const valid=(Array.isArray(records)?records:[]).filter(x=>x&&Number.isInteger(x.series)&&x.series>=1&&x.series<=12&&typeof x.trackId==='string'&&['win','loss'].includes(x.result));
 // Um mesmo identificador representa uma única corrida, mesmo que um backup repetido
 // tenha introduzido linhas iguais. Registros legados sem ID preservam a contagem anterior.
 const seenIds=new Set();
 const distinct=valid.filter(x=>{const id=String(x.id??'').trim();if(!id)return true;if(seenIds.has(id))return false;seenIds.add(id);return true;});
 const scoped=distinct.filter(x=>(!filters.series||x.series===Number(filters.series))&&(!filters.trackId||x.trackId===filters.trackId));
 const wins=scoped.filter(x=>x.result==='win').length,losses=scoped.length-wins,n=scoped.length;
 const ci=wilson(wins,n);
 const winDiffs={},lossDiffs={},pilotWins={},pilotLosses={};
 for(const r of scoped){
  for(const d of differences(r.own,r.rival).filter(d=>!(d.key==='pit'&&r.pitEvidence))){const bucket=r.result==='win'?winDiffs:lossDiffs;(bucket[d.key]??=[]).push(d.delta);}
  // Evidência dos pilotos é separada dos indicadores do carro e dos registros legados.
  for(const d of pilotDifferences(r.driverComparison)){const bucket=r.result==='win'?pilotWins:pilotLosses;(bucket[d.key]??=[]).push(d.delta);}
 }
 // Diagnóstico exploratório após 3 corridas distintas na MESMA pista e série.
 // Para comparar vitórias e derrotas, exige ao menos uma de cada.
 // Mantemos os limites de diferença e a classificação de evidência moderada para 20+.
 // Não gerar uma hipótese cruzando pistas/séries no resumo global.
 const hasScope=typeof filters.trackId==='string'&&filters.trackId.trim()!==''&&Number.isInteger(Number(filters.series))&&Number(filters.series)>=1&&Number(filters.series)<=12;
 const hasComparison=hasScope&&n>=3&&wins>=1&&losses>=1;
 const patterns=[];
 if(hasComparison){for(const k of FIELDS){const w=winDiffs[k]||[],l=lossDiffs[k]||[];if(w.length<1||l.length<1)continue;const wm=mean(w),lm=mean(l),gap=wm-lm;
  if(Math.abs(gap)<(k==='pit'?0.05:4))continue;
  patterns.push({key:k,label:LABELS[k],winsMean:Math.round(wm*100)/100,lossesMean:Math.round(lm*100)/100,gap:Math.round(gap*100)/100,observations:w.length+l.length});
 }}
 patterns.sort((a,b)=>Math.abs(b.gap)-Math.abs(a.gap));
 const pilotPatterns=[];
 if(hasComparison){for(const key of PILOT_FIELDS){
  const win=pilotWins[key]||[],loss=pilotLosses[key]||[];
  if(win.length<1||loss.length<1)continue;
  const wm=mean(win),lm=mean(loss),gap=wm-lm;
  if(Math.abs(gap)<4)continue;
  pilotPatterns.push({key,label:PILOT_LABELS[key],winsMean:Math.round(wm*100)/100,lossesMean:Math.round(lm*100)/100,
   gap:Math.round(gap*100)/100,observations:win.length+loss.length,basis:'media-da-dupla'});
 }}
 pilotPatterns.sort((a,b)=>Math.abs(b.gap)-Math.abs(a.gap));
 // Hipóteses reversíveis e rastreáveis, nunca conclusões causais ou promessas de vitória.
 const experiments=patterns.filter(p=>p.gap>0).slice(0,2).map(p=>({key:p.key,label:p.label,
  evidence:p.observations,
  text:`Nas vitórias registradas, a vantagem relativa em ${p.label.toLowerCase()} foi maior. Teste um setup que favoreça esse indicador na mesma pista e série e compare várias corridas, mantendo os demais fatores tão parecidos quanto possível.`
 }));
 const favoriteUsage=new Map();for(const r of scoped){if(!r.favoriteId)continue;const stats=favoriteUsage.get(r.favoriteId)||{favoriteId:r.favoriteId,wins:0,total:0};stats.total++;if(r.result==='win')stats.wins++;favoriteUsage.set(r.favoriteId,stats);}
 const favorites=Array.from(favoriteUsage.values()).sort((a,b)=>b.total-a.total).map(x=>({...x,rate:x.total?x.wins/x.total:0,ci:wilson(x.wins,x.total),status:x.total>=10?'amostra-em-observacao':'insuficiente'}));
 return {sample:n,wins,losses,rate:n?wins/n:null,ci,experiments,pilotPatterns,diagnosticReady:hasComparison,missingToStart:Math.max(0,3-n),quality:n>=20&&wins>=5&&losses>=5?'observacao-moderada':hasComparison?'preliminar':'insuficiente',patterns,favorites,scope:{series:filters.series||null,trackId:filters.trackId||null},disclaimer:'Resultados são observacionais e individuais. Não há inferência causal, previsão garantida, treino remoto nem acesso a garagens de terceiros.'};
}
function favoriteInventory(garage){return (Array.isArray(garage?.favoriteSetups)?garage.favoriteSetups:[]).map(f=>{let t={speed:0,corner:0,power:0,qualifying:0,pit:0};for(const p of f.parts||[])for(const k of Object.keys(t))t[k]+=(Number(p?.[k])||0);t.pit=Math.round(t.pit*100)/100;return {id:f.id,name:String(f.name||''),trackId:f.trackId||'',parts:(f.parts||[]).length,drivers:(f.drivers||[]).length,stats:t};});}
window.GBRRaceLearning=Object.freeze({FIELDS,LABELS,PILOT_FIELDS,PILOT_LABELS,PILOT_OCR_PLAUSIBLE_MAX,suspiciousPilotStat,RARITIES,COMPOUNDS,MAX,cleanStats,cleanDriverComparison,cleanCompetition,cleanTyreStrategy,tyreStints,pilotDifferences,differences,create,add,setupSnapshot,recordInsights,summary,favoriteInventory,wilson});
})();
