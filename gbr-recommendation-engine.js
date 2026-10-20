/* GBR 5.5.14 — motor determinístico pessoal; sem coleta oculta ou acesso a outras contas. */
(()=>{'use strict';
const CAR=Object.freeze(['speed','corner','power','qualifying']);
const LABEL=Object.freeze({speed:'Velocidade',corner:'Curvas',power:'Unidade de potência',qualifying:'Qualificação'});
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function normalizedWeights(weights){
 const w=Object.fromEntries(CAR.map(key=>[key,Math.max(0,Math.min(100,n(weights?.[key])))]));
 const sum=CAR.reduce((total,k)=>total+w[k],0);
 return sum>0?Object.fromEntries(CAR.map(k=>[k,100*w[k]/sum])):{speed:25,corner:25,power:25,qualifying:25};
}
function scoped(garage,series,trackId){
 if(!Number.isInteger(Number(series))||Number(series)<1||Number(series)>12||!trackId)return [];
 return (Array.isArray(garage?.raceAnalyses)?garage.raceAnalyses:[]).slice(-150).filter(r=>r&&Number(r.series)===Number(series)&&r.trackId===trackId&&['win','loss'].includes(r.result));
}
function evidence(garage,{series,trackId,baseWeights}={}){
 const base=normalizedWeights(baseWeights);
 const records=scoped(garage,series,trackId);
 const learning=window.GBRRaceLearning;
 const summary=learning?.summary?.(records,{series:Number(series),trackId})||{sample:0,wins:0,losses:0,patterns:[],quality:'insuficiente'};
 const snapshots=records.filter(r=>r.setupSnapshot?.parts?.length>=6&&r.setupSnapshot?.drivers?.length===2);
 const safe=summary.sample>=8&&summary.wins>=3&&summary.losses>=3;
 // Só elevar prioridades com histórico de composição imutável; dados antigos servem para contexto, não para treinamento.
 const canTest=safe&&snapshots.length>=6&&snapshots.filter(r=>r.result==='win').length>=3&&snapshots.filter(r=>r.result==='loss').length>=3;
 let weights={...base},reasons=[];
 if(canTest){
  const choices=(summary.patterns||[]).filter(p=>CAR.includes(p.key)&&p.gap>0&&p.observations>=6).slice(0,2);
  for(const p of choices){
   const desired=Math.min(6,Math.max(2,Math.round(p.gap/3)));
   // Modificação conservadora, máximo 6 pontos por atributo. Só sugere um teste, não afirma efeito causal.
   weights[p.key]+=desired;
   reasons.push({key:p.key,label:LABEL[p.key],observations:p.observations});
  }
  weights=normalizedWeights(weights);
 }
 const hasExperiment=canTest&&reasons.length>0;
 return {mode:hasExperiment?'experiment':'baseline',weights:hasExperiment?weights:base,baseWeights:base,
  sample:summary.sample||0,wins:summary.wins||0,losses:summary.losses||0,snapshots:snapshots.length,
  quality:summary.quality||'insuficiente',reasons,hasExperiment,
  message:hasExperiment?`Teste GBR baseado em ${summary.sample} corridas desta pista/série, sendo ${snapshots.length} com composição confirmada. É uma hipótese, não uma garantia.`:
  summary.sample===0?'Sem histórico nesta pista e série. O setup-base permanece ativo.':
  `Histórico de ${summary.sample} corridas. Dados ainda insuficientes para ajustar a recomendação automaticamente.`};
}
function eligibleFavorite(f,garage,series,trackId){
 if(!f||!trackId||String(f.trackId)!==String(trackId)||!Array.isArray(f.parts)||!Array.isArray(f.drivers)||f.drivers.length!==2)return null;
 const required=Number(series)<=3?6:7;
 if(f.parts.length!==required||new Set(f.parts.map(p=>p.category)).size!==required)return null;
 const selected=[],drivers=[];
 for(const part of f.parts){const actual=(garage.parts||[]).find(p=>p.owned&&p.id===part.id&&p.category===part.category&&p.rarity===part.rarity&&p.level===part.level&&n(p.series)<=Number(series));if(!actual||n(actual.level)<=0)return null;selected.push(actual);}
 for(const d of f.drivers){const actual=(garage.drivers||[]).find(p=>p.owned&&p.id===d.id&&p.rarity===d.rarity&&p.level===d.level&&n(p.series)<=Number(series));if(!actual||n(actual.level)<=0||drivers.some(x=>x.id===actual.id))return null;drivers.push(actual);}
 const totals={speed:0,corner:0,power:0,qualifying:0,pit:0};
 for(const p of selected)for(const k of Object.keys(totals))totals[k]+=n(p[k]);
 return {id:f.id,name:String(f.name||'').slice(0,64),chosen:selected,drivers,totals,required:selected.map(p=>p.category)};
}
function candidates(garage,{series,trackId,baseWeights}={}){
 const all=(Array.isArray(garage?.favoriteSetups)?garage.favoriteSetups:[]).map(f=>eligibleFavorite(f,garage,series,trackId)).filter(Boolean);
 const records=scoped(garage,series,trackId);
 return all.map(candidate=>{
  // Versões anteriores sem snapshot não comprovam a composição; cartas alteradas não herdam vitórias.
  const wins=records.filter(r=>r.favoriteId===candidate.id&&r.result==='win'&&r.setupSnapshot&&sameSnapshot(r.setupSnapshot,candidate));
  const allRelevant=records.filter(r=>r.favoriteId===candidate.id&&r.setupSnapshot&&sameSnapshot(r.setupSnapshot,candidate));
  return {...candidate,sample:allRelevant.length,wins:wins.length,rate:allRelevant.length?wins.length/allRelevant.length:null,validated:allRelevant.length>=10};
 });
}
function sameSnapshot(stored,candidate){
 const canon=(x,kind)=>JSON.stringify([String(x.id||''),String(x.name||''),String(x.rarity||''),String(x.editionLabel||''),String(x.category||''),Number(x.level),
  ...(kind==='parts'?['speed','corner','power','qualifying','pit']:['overtaking','defending','qualifying','raceStart','tyreUse']).map(k=>Math.round(n(x[k])*100)/100)]);
 if(!stored||!Array.isArray(stored.parts)||!Array.isArray(stored.drivers))return false;
 return stored.parts.length===candidate.chosen.length&&stored.drivers.length===candidate.drivers.length&&
 stored.parts.every((p,i)=>canon(p,'parts')===canon(candidate.chosen[i],'parts'))&&stored.drivers.every((d,i)=>canon(d,'drivers')===canon(candidate.drivers[i],'drivers'));
}
window.GBRRecommendations=Object.freeze({CAR,LABEL,evidence,candidates,eligibleFavorite,normalizedWeights,sameSnapshot});
})();
