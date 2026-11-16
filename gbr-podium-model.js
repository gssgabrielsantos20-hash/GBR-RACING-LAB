/* GBR Racing Lab — Modo Pódio Global: observações manuais de GP.
   Não mistura GP com Duelos, não obtém dados de outros jogadores e não prevê vitórias. */
(()=>{'use strict';
const MAX=240, COMPOUNDS=['soft','medium','hard','wet'];
const PROFILES=Object.freeze([
 {id:'grid',label:'Domínio de Grid',detail:'Largou entre os 3 primeiros e terminou no pódio.'},
 {id:'recovery',label:'Recuperação de Posições',detail:'Ganhou pelo menos 3 posições e terminou no pódio.'},
 {id:'consistency',label:'Ritmo/Consistência',detail:'Terminou no pódio sem atender aos critérios anteriores; o ritmo ainda é uma hipótese.'}
]);
const norm=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
const bounded=(value,label,min,max,required=false)=>{
 if(value===null||value===undefined||String(value).trim()===''){if(required)throw Error(`Informe ${label}.`);return null}
 const number=Number(String(value).replace(',','.'));
 if(!Number.isInteger(number)||number<min||number>max)throw Error(`${label}: use um número entre ${min} e ${max}.`);
 return number;
};
const label=(x,name,max=80)=>{const text=String(x??'').trim().replace(/\s+/g,' ');
 if(text.length>max||/[<>\x00-\x1f]/.test(text))throw Error(`${name}: texto inválido ou maior que ${max} caracteres.`);return text};
function dateOnly(s){const v=String(s||'');if(!/^\d{4}-\d\d-\d\d$/.test(v))throw Error('Informe uma data válida (AAAA-MM-DD).');
 const d=new Date(v+'T12:00:00Z');if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==v)throw Error('Data da corrida inválida.');return v;}
function create(input,{events=[],categories=[],tracks=[],now=()=>new Date().toISOString(),id=()=>crypto.randomUUID()}={}){
 const event=events.find(e=>e.id===input?.eventId),category=categories.find(c=>c.id===input?.categoryId),track=tracks.find(t=>t.id===input?.trackId);
 if(!event||!category||!track||!Array.isArray(event.tracks)||!event.tracks.includes(track.id))throw Error('Selecione evento, categoria e pista cadastrados.');
 const stage=String(input.stage||'unknown');if(!['unknown','qualifying','opening','final'].includes(stage))throw Error('Etapa de GP inválida.');
 const raceNumber=bounded(input.raceNumber,'o número da corrida',1,20);
 const published=event.stageRounds?.[stage]||(!event.stageRounds&&(stage==='qualifying'?event.qualifying:stage==='final'?event.rounds:null));
 if(published&&raceNumber!==null){const expected=published[raceNumber-1];if(!expected||expected.track!==track.id)throw Error('A pista não corresponde à corrida e à etapa oficiais escolhidas.');}
 const gridPosition=bounded(input.gridPosition,'a posição de largada',1,24);
 const finishPosition=bounded(input.finishPosition,'a posição de chegada',1,24,true);
 const competitorType=String(input.competitorType||'bot');if(!['bot','jogador'].includes(competitorType))throw Error('Tipo de participante inválido.');
 const drivers=Array.isArray(input.drivers)?input.drivers.map(s=>label(s,'Piloto',65)):[];
 if(drivers.length>2)throw Error('Máximo de dois pilotos por participante.');
 if(drivers.length===2&&drivers[0]&&norm(drivers[0])===norm(drivers[1]))throw Error('Informe pilotos distintos.');
 const parts=Array.isArray(input.parts)?input.parts.map(s=>label(s,'Peça',65)).filter(Boolean):[];
 if(parts.length>7)throw Error('Máximo de sete peças por setup.');
 const tyreStints=Array.isArray(input.tyreStints)?input.tyreStints.filter(Boolean):[];
 if(tyreStints.length>5||tyreStints.some(t=>!COMPOUNDS.includes(t)))throw Error('Compostos dos pneus inválidos.');
 const stops=bounded(input.stops,'a quantidade de pit stops',0,5);
 if(stops!==null&&tyreStints.length>stops+1)throw Error('Há mais compostos informados do que stints possíveis.');
 const pitLoss=bounded(input.pitLoss,'as posições perdidas no pit stop',0,24);
 const wearLoss=bounded(input.wearLoss,'as posições perdidas por desgaste',0,24);
 const leader=String(input.leader||'unknown'),fastestLap=String(input.fastestLap||'unknown');
 if(!['unknown','yes','no'].includes(leader)||!['unknown','yes','no'].includes(fastestLap))throw Error('Marcação de liderança/volta rápida inválida.');
 const bestLapSeconds=input.bestLapSeconds===null||input.bestLapSeconds===undefined||String(input.bestLapSeconds).trim()===''?null:Number(String(input.bestLapSeconds).replace(',','.'));
 if(bestLapSeconds!==null&&(!Number.isFinite(bestLapSeconds)||bestLapSeconds<20||bestLapSeconds>400))throw Error('Melhor volta: informe 20–400 segundos ou deixe em branco.');
 const createdAt=String(now());if(!Number.isFinite(Date.parse(createdAt)))throw Error('Data de registro inválida.');
 const name=label(input.name,'Identificação do participante',65),notes=label(input.notes,'Observação',240);
 return {id:String(id()).slice(0,100),schemaVersion:1,source:'manual-revisado-gp',createdAt,
  raceDate:dateOnly(input.raceDate||createdAt.slice(0,10)),eventId:event.id,categoryId:category.id,series:Number(category.series),trackId:track.id,
  stage,raceNumber,competitorType,name,gridPosition,finishPosition,
  drivers,parts,tyreStints,stops,pitLoss,wearLoss,leader,fastestLap,
  bestLapSeconds:bestLapSeconds===null?null:Math.round(bestLapSeconds*1000)/1000,notes};
}
function add(garage,record){if(!garage||typeof garage!=='object')throw Error('Garagem indisponível.');
 const data=Array.isArray(garage.gpPodiumObservations)?garage.gpPodiumObservations:[];
 if(data.length>=MAX)throw Error(`Limite de ${MAX} observações. Exporte o backup antes de remover antigas.`);
 if(data.some(x=>x.id===record.id))throw Error('Observação repetida.');
 if(data.some(x=>x.source==='manual-revisado-gp'&&x.eventId===record.eventId&&x.categoryId===record.categoryId&&x.trackId===record.trackId&&x.stage===record.stage&&x.raceNumber===record.raceNumber&&x.raceDate===record.raceDate&&x.competitorType===record.competitorType&&norm(x.name)===norm(record.name)&&x.gridPosition===record.gridPosition&&x.finishPosition===record.finishPosition))throw Error('Esse participante/resultado já foi registrado na mesma corrida.');
 return [...data,record];
}
const avg=items=>items.length?Math.round(items.reduce((s,x)=>s+x,0)/items.length*100)/100:null;
const percent=(p,n)=>n?Math.round(p/n*1000)/10:null;
function profileOf(r){if(r.finishPosition>3)return null;
 if(r.gridPosition!==null&&r.gridPosition<=3)return 'grid';
 if(r.gridPosition!==null&&r.gridPosition-r.finishPosition>=3)return 'recovery';
 return 'consistency';
}
function summarize(records=[],filters={}){
 const seen=new Set();const data=(Array.isArray(records)?records:[]).filter(r=>{
  if(!r||r.source!=='manual-revisado-gp'||!Number.isInteger(r.finishPosition)||r.finishPosition<1||r.finishPosition>24||!r.categoryId||!Number.isInteger(r.series)||!r.trackId||typeof r.id!=='string'||seen.has(r.id)||
   (filters.categoryId&&r.categoryId!==filters.categoryId)||(filters.series&&r.series!==Number(filters.series))||(filters.eventId&&r.eventId!==filters.eventId)||(filters.competitorType&&r.competitorType!==filters.competitorType))return false;
  seen.add(r.id);return true;
 });
 const podium=data.filter(r=>r.finishPosition<=3),gains=data.filter(r=>Number.isInteger(r.gridPosition)).map(r=>r.gridPosition-r.finishPosition);
 const byTrack=new Map(),profiles=Object.fromEntries(PROFILES.map(p=>[p.id,0]));
 const driverPairs=new Map(),partsCount=new Map(),tyresCount=new Map();
 for(const r of data){const current=byTrack.get(r.trackId)||{trackId:r.trackId,sample:0,podium:0,finishes:[],gains:[],profiles:{grid:0,recovery:0,consistency:0},bestLaps:[]};
  current.sample++;current.finishes.push(r.finishPosition);
  if(Number.isFinite(r.bestLapSeconds)&&r.bestLapSeconds>=20)current.bestLaps.push(r.bestLapSeconds);
  if(r.finishPosition<=3){current.podium++;profiles[profileOf(r)]++;current.profiles[profileOf(r)]++;
   if(r.drivers?.filter(Boolean).length===2){const title=r.drivers.slice(0,2).join(' + '),key=r.drivers.slice(0,2).map(norm).sort().join('|');const entry=driverPairs.get(key)||{name:title,count:0};entry.count++;driverPairs.set(key,entry)}
   const distinctParts=new Set((r.parts||[]).map(norm));for(const key of distinctParts){if(!key)continue;const entry=partsCount.get(key)||{name:r.parts.find(p=>norm(p)===key),count:0};entry.count++;partsCount.set(key,entry)}
   for(const tyre of new Set(r.tyreStints||[]))tyresCount.set(tyre,(tyresCount.get(tyre)||0)+1);
  }
  if(Number.isInteger(r.gridPosition))current.gains.push(r.gridPosition-r.finishPosition);byTrack.set(r.trackId,current);
 }
 const leaderKnown=podium.filter(r=>r.leader!=='unknown'),fastKnown=podium.filter(r=>r.fastestLap!=='unknown');
 const podiumProfile=PROFILES.map(p=>({...p,count:profiles[p.id],share:percent(profiles[p.id],podium.length)}));
 const sorted=m=>[...m.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'pt-BR')).slice(0,5);
 const tracks=[...byTrack.values()].map(t=>({trackId:t.trackId,sample:t.sample,podium:t.podium,rate:percent(t.podium,t.sample),avgFinish:avg(t.finishes),avgGain:avg(t.gains),profiles:t.profiles,bestLap:t.bestLaps.length?Math.min(...t.bestLaps):null,bestLapN:t.bestLaps.length})).sort((a,b)=>b.sample-a.sample||a.trackId.localeCompare(b.trackId));
 const adequate=data.length>=12&&podium.length>=4&&data.length-podium.length>=3&&tracks.length>=2;
 return {sample:data.length,podium:podium.length,rate:percent(podium.length,data.length),avgFinish:avg(data.map(r=>r.finishPosition)),avgGain:avg(gains),
  avgPitLoss:avg(data.filter(r=>Number.isInteger(r.pitLoss)).map(r=>r.pitLoss)),pitLossN:data.filter(r=>Number.isInteger(r.pitLoss)).length,
  avgWearLoss:avg(data.filter(r=>Number.isInteger(r.wearLoss)).map(r=>r.wearLoss)),wearLossN:data.filter(r=>Number.isInteger(r.wearLoss)).length,
  avgStops:avg(data.filter(r=>Number.isInteger(r.stops)).map(r=>r.stops)),stopsN:data.filter(r=>Number.isInteger(r.stops)).length,
  leaderKnown:leaderKnown.length,leaderYes:leaderKnown.filter(r=>r.leader==='yes').length,fastKnown:fastKnown.length,fastYes:fastKnown.filter(r=>r.fastestLap==='yes').length,
  profiles:podiumProfile,tracks,driverPairs:sorted(driverPairs),parts:sorted(partsCount),tyres:[...tyresCount.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count),
  adequate,leadingProfile:adequate?podiumProfile.slice().sort((a,b)=>b.count-a.count)[0]?.id:null,
  note:adequate?'Padrões exploratórios, não causais. A amostra vem apenas dos participantes registrados; não representa todos os bots do jogo.':'Amostra insuficiente para orientar setups: registre ao menos 12 participantes, incluindo 4 pódios, 3 não pódios e 2 pistas na mesma categoria/série.'};
}
window.GBRPodiumModel=Object.freeze({MAX,COMPOUNDS,PROFILES,create,add,summarize,profileOf});
})();
