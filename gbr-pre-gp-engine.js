/* GBR Pré-GP v1.1 — motor de relatório do GP e estratégia baseada exclusivamente na garagem. */
(()=>{'use strict';
const MAX_CHARS=20000, MAX_LINES=160, MAX_RACES=64;
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const aliases={'interlagos':'sao-paulo','sao paulo':'sao-paulo','cota':'austin','circuit of the americas':'austin','madri':'madrid','madring':'madrid','bahrein':'sakhir','bahrain':'sakhir','spa francorchamps':'spa','albert park':'melbourne','yas marina':'abu-dhabi','cidade do mexico':'mexico','red bull ring':'spielberg'};
const categoryMap={'junior':'junior','challenger':'competidor','competidor':'competidor','contender':'contendor','contendor':'contendor','champion':'campeao','campeao':'campeao'};
const carMap={'speed':'speed','velocidade':'speed','curvas':'corner','cornering':'corner','unidade de potencia':'power','potencia':'power','power':'power','qualificacao':'qualifying','classificacao':'qualifying'};
const driverMap={'ultrapassagem':'overtaking','overtaking':'overtaking','defesa':'defending','defending':'defending','largada':'raceStart','race start':'raceStart','pneus':'tyreUse','gerenciamento de pneus':'tyreUse','classificacao':'qualifying'};
const safeInt=x=>x===null||x===undefined||String(x).trim()===''?null:Number.isInteger(Number(x))?Number(x):null;
function knownTrack(value,tracks){
 const query=norm(value);const hits=new Set();
 for(const t of tracks||[]){if(!t?.id)continue;
  const names=[t.id,t.name,String(t.name||'').split('·')[0],...Object.keys(aliases).filter(k=>aliases[k]===t.id)];
  if(names.map(norm).includes(query))hits.add(t.id);
 }
 return hits.size===1?[...hits][0]:null;
}
function scanTrack(line,tracks){
 const s=norm(line),ids=new Set();
 for(const t of tracks||[]){if(!t?.id)continue;
  const choices=[t.id,t.name,String(t.name||'').split('·')[0],...Object.keys(aliases).filter(k=>aliases[k]===t.id)];
  if(choices.map(norm).some(v=>v&&(' '+s+' ').includes(' '+v+' ')))ids.add(t.id);
 }return ids.size===1?[...ids][0]:null;
}
function validate(text){if(typeof text!=='string'||text.length>MAX_CHARS)throw Error('Relatório inválido ou maior que 20 mil caracteres.');
 const lines=text.replace(/\r/g,'').split('\n');if(lines.length>MAX_LINES)throw Error('Máximo de 160 linhas.');return lines;}
function weather(line){
 const s=String(line).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const m=s.match(/(?:chuva|rain)\s*(?:de|chance|probabilidade)?\s*(\d{1,3})\s*%/)||s.match(/(\d{1,3})\s*%\s*(?:de\s*)?(?:chuva|rain)/);
 if(m){const p=+m[1];return p>100?{invalid:true}:{weather:p===0?'dry':p===100?'wet':'variable',rain:p};}
 if(/\b(seco|seca|dry)\b/.test(s))return {weather:'dry',rain:null};
 if(/\b(chuva|molhado|molhada|wet)\b/.test(s))return {weather:'wet',rain:null};
 if(/\b(misto|mista|variavel|variable)\b/.test(s))return {weather:'variable',rain:null};
 return {weather:null,rain:null};
}
function matchingFocus(line,field){
 const raw=String(line).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const m=raw.match(field==='car'?/\b(?:carro|componente|foco do carro)\s*[:=-]\s*([^|,;]+)/:/\b(?:piloto|foco do piloto)\s*[:=-]\s*([^|,;]+)/);
 if(!m)return null;const key=norm(m[1]);const map=field==='car'?carMap:driverMap;
 return Object.entries(map).find(([k])=>norm(k)===key)?.[1]||null;
}
function parseBriefing(text,{tracks=[]}={}){
 const lines=validate(text),entries=[],warnings=[];let categoryId=null,stage=null;
 for(let i=0;i<lines.length;i++){
  const raw=lines[i].trim(),s=norm(raw);if(!raw)continue;
  const type=Object.entries(categoryMap).find(([k])=>s===k||s==='categoria '+k||s==='dificuldade '+k);
  if(type){categoryId=type[1];continue;}
  if(/^(qualifying|classificacao|qualificacao)/.test(s)){stage='qualifying';continue;}
  if(/^(opening|final|abertura)/.test(s)){stage='final';continue;}
  if(!/\b(corrida|prova|volta|voltas|laps?)\b/.test(s)&&!/^\d{1,2}\s*[.):\-]/.test(raw))continue;
  const id=scanTrack(raw,tracks);if(!id){if(/\b(corrida|prova)\b/.test(s))warnings.push('Linha '+(i+1)+': pista não reconhecida.');continue;}
  const l=s.match(/\b(\d{1,3})\s*(?:voltas?|laps?)\b/),laps=l?+l[1]:null;
  if(laps!==null&&(laps<2||laps>100)){warnings.push('Linha '+(i+1)+': quantidade de voltas inválida.');continue;}
  const w=weather(raw);if(w.invalid){warnings.push('Linha '+(i+1)+': chuva fora de 0–100%.');continue;}
  const round=s.match(/\b(?:corrida|prova)\s*(\d{1,2})\b/)||raw.match(/^\s*(\d{1,2})\s*[.):\-]/);
  entries.push({trackId:id,categoryId,stage,round:round?+round[1]:null,laps,weather:w.weather,rain:w.rain,carFocus:matchingFocus(raw,'car'),driverFocus:matchingFocus(raw,'driver'),line:i+1});
  if(entries.length>=MAX_RACES){warnings.push('Limite de 64 corridas atingido.');break;}
 }
 return {entries,warnings,source:'texto_informado',version:1};
}
function parseEventBriefing(text,{tracks=[],drivers=[],parts=[]}={}){
 const lines=validate(text),races=parseBriefing(text,{tracks});
 const data={eventTitle:null,featuredPercent:null,driverBoosts:[],partBoosts:[],eventBoost:null,allowLegendary:null,allowSpecial:null,tracks:[],entries:races.entries,warnings:[...races.warnings],source:'texto_informado',version:2};
 let mode=null;
 const find=(list,label)=>list.find(v=>norm(typeof v==='string'?v:v?.name||v?.label)===norm(label));
 for(let i=0;i<lines.length;i++){
  const raw=lines[i].trim(),line=norm(raw);if(!line)continue;
  if(!data.eventTitle&&/^(grande premio|gp)\s+/.test(line))data.eventTitle=raw.split(/\s+[—–-]\s+/)[0].trim().slice(0,160);
  if(/\b\d{1,3}\s*%/.test(raw)&&/(aumento|estat|featured|destaque)/.test(line)){
   const n=+raw.match(/(\d{1,3})\s*%/)[1];if(n<=100)data.featuredPercent=n;
  }
  const b=raw.match(/^(?:b[oô]nus|boost)\s+do\s+evento\s*:\s*(.+)$/i);
  if(b){data.eventBoost=b[1].trim().slice(0,60);mode=null;continue;}
  if(/^pilotos?\s+lend[aá]rios?\s*:/i.test(raw)){data.allowLegendary=/\b(?:sim|permitidos?|yes)\b/i.test(raw)&&!/n[aã]o\s+permitidos?/i.test(raw);mode=null;continue;}
  if(/^edi[cç][oõ]es\s+especiais?\s*:/i.test(raw)){data.allowSpecial=/\b(?:sim|permitidas?|yes)\b/i.test(raw)&&!/n[aã]o\s+permitidas?/i.test(raw);mode=null;continue;}
  if(/^(?:op[cç][oõ]es\s+de\s+pista|pistas?\s+(?:poss[ií]veis|dispon[ií]veis))\s*:/i.test(raw)){mode='tracks';continue;}
  if(/^(?:os\s+itens\s+que\s+receber[aã]o|(?:featured assets|itens\s+(?:destacados?|com\s+b[oô]nus)))/i.test(raw)){mode='featured';continue;}
  if(/^(?:categorias?|classifica[cç][aã]o|qualifying|opening|final|abertura|etapas?|restri[cç][oõ]es?)\b/i.test(raw)){mode=null;continue;}
  if(mode==='tracks'){
   const id=knownTrack(raw.replace(/^\s*[-*•\d).:]+/,''),tracks);
   if(id){if(!data.tracks.includes(id))data.tracks.push(id);else data.warnings.push('Pista duplicada na lista de opções: '+raw);}
   else data.warnings.push('Linha '+(i+1)+': pista não cadastrada: '+raw.slice(0,90));
  }else if(mode==='featured'){
   const label=raw.replace(/^[-*•]\s*/,'').split('(')[0].trim();
   const d=find(drivers,label),p=find(parts,label);
   if(d){const name=typeof d==='string'?d:d.name||d.label;if(!data.driverBoosts.some(e=>norm(e.label)===norm(name)))data.driverBoosts.push({key:norm(name).split(' ').pop(),label:name,rarity:'any'});}
   else if(p){const name=typeof p==='string'?p:p.name||p.label;if(!data.partBoosts.some(e=>norm(e)===norm(name)))data.partBoosts.push(name);}
   else data.warnings.push('Linha '+(i+1)+': carta destacada desconhecida: '+label.slice(0,90));
  }
 }
 if(!data.tracks.length&&data.entries.length)data.tracks=[...new Set(data.entries.map(x=>x.trackId))];
 if(!data.tracks.length)data.warnings.push('Nenhuma pista identificada.');
 return data;
}
function resolve(parsed,{trackId,categoryId,stage,round}={}){
 let c=(parsed?.entries||[]).filter(e=>e.trackId===trackId);
 if(!c.length)return {race:null,warning:null};
 const exact=c.filter(e=>e.categoryId===categoryId);c=exact.length?exact:c.filter(e=>!e.categoryId);
 c=c.filter(e=>!e.stage||e.stage===stage);
 if(c.some(e=>e.round!==null))c=c.filter(e=>e.round===safeInt(round));
 return c.length===1?{race:c[0],warning:null}:{race:null,warning:'Faltam dados para identificar esta corrida sem ambiguidade.'};
}
function buildPlan({result,garage,race}={}){
 if(!result)return null;
 const series=Number(result.category?.series),trackId=result.track?.id;
 const originalLaps=safeInt(race?.laps),laps=originalLaps!==null&&originalLaps>=2&&originalLaps<=100?originalLaps:null,weatherKind=['dry','wet','variable'].includes(race?.weather)?race.weather:null;
 const plan=garage?.trackPlans?.[series+':'+trackId]||{},warnings=[],tyreOptions=[];
 if(laps===null)warnings.push('Sem número confirmado de voltas: planejamento de paradas não calculado.');
 if(!weatherKind)warnings.push('Condição meteorológica não informada: estratégia de pneus pendente.');
 if(laps!==null&&weatherKind==='variable')warnings.push('Clima variável: não é possível definir a volta de troca sem evolução da chuva.');
 if(laps!==null&&weatherKind==='dry'){
  const lim=Object.fromEntries(['soft','medium','hard'].map(k=>[k,Number.isInteger(+plan[k])&&+plan[k]>0&&+plan[k]<=100?+plan[k]:null]));
  const raw=Object.values(lim).some(Boolean)?window.F1Tracks?.plans?.(laps,lim,3)||[]:[];
  for(const p of raw.slice(0,3))if(p.stints.reduce((sum,s)=>sum+s.laps,0)===laps)tyreOptions.push({stints:p.stints.map(s=>({compound:s.type,laps:s.laps})),stops:p.stops});
  if(!tyreOptions.length)warnings.push('Sem durabilidade validada suficiente para calcular as paradas.');
 }
 if(laps!==null&&weatherKind==='wet'){
  const life=+plan.wet;
  if(Number.isInteger(life)&&life>=1&&life<=100){let remain=laps,stints=[];while(remain>0&&stints.length<10){const n=Math.min(remain,life);stints.push({compound:'wet',laps:n});remain-=n;}
   if(remain===0)tyreOptions.push({stints,stops:stints.length-1});}
  if(!tyreOptions.length)warnings.push('Sem durabilidade do pneu de chuva validada.');
 }
 const stats={speed:'velocidade',corner:'curvas',power:'potência',qualifying:'classificação'};
 const driver={overtaking:'ultrapassagem',defending:'defesa',raceStart:'largada',tyreUse:'gerenciamento de pneus',qualifying:'classificação'};
 const a=result.drivers?.[0],b=result.drivers?.[1],tyreA=Number(a?.tyreUse),tyreB=Number(b?.tyreUse);
 const driverAdvice=a&&b&&Number.isFinite(tyreA)&&Number.isFinite(tyreB)?(tyreA===tyreB?'Os pilotos têm gerenciamento de pneus equivalente.':'O piloto '+(tyreA>tyreB?'1':'2')+' apresenta maior atributo de gerenciamento de pneus; considere o stint mais longo somente após validar o desgaste real.'):'Cadastre os atributos dos dois pilotos.';
 const battery=(result.parts||[]).some(x=>x.category==='Bateria');
 const energy=['Volta 1: potência rápida apenas se houver disputa; Overtake Mode indisponível na primeira volta.',battery?'Da segunda volta em diante: carregue nos trechos sem alvo e use Overtake Mode nas oportunidades reais, sem inventar pontos exatos da pista.':'Sem bateria montada nesta classe: não considere o Overtake Mode como opção disponível.','Volta final: use a reserva apenas se os pneus e a distância para o adversário permitirem.'];
 // Evite contaminação de aprendizado: GP e Duelo podem ter volta/clima/bônus diferentes.
 // Registros históricos sem modalidade explícita não são usados para afirmar desempenho.
 const raceMode=race?.mode==='duel'?'duel':'gp';
 const history=(Array.isArray(garage?.raceAnalyses)?garage.raceAnalyses:[])
  .filter(r=>r&&(r.mode===raceMode||r.raceType===raceMode));
 const base=window.GBRRecommendations?.evidence?.({...garage,raceAnalyses:history},{series,trackId,baseWeights:result.carWeights});
 return {laps: laps!==null&&laps>=2&&laps<=100?laps:null,weather:weatherKind,tyreOptions,warnings,energy,driverAdvice,
  pitAdvice:'Evite parar os dois pilotos simultaneamente quando for seguro alternar; nunca ultrapasse a durabilidade cadastrada.',
  boostFocus:weatherKind==='wet'?'efeito útil na chuva': 'efeitos de '+(stats[result.carFocus]||'equilíbrio')+' e '+(driver[result.driverFocus]||'piloto'),boostVerified:false,
  boostNote:'Sem inventário de Boosts cadastrado: recomenda-se somente a prioridade de efeito, não um item ou quantidade específica.',
  evidenceSample:history.filter(r=>r?.trackId===trackId&&Number(r.series)===series).length,
  evidenceMode:base?.mode||'baseline',confidence:{setup:result.complete?'comparação de cartas verificável':'garagem incompleta',tyres:tyreOptions.length?'condicional às durabilidades registradas':'sem dados suficientes',energy:'heurística, sem telemetria por setor',boosts:'inventário não verificado'},
  recommendation:'Plano orientativo; não é previsão validada de vitória.'};
}
window.GBRPreGP=Object.freeze({version:'1.1.0',parseBriefing,parseEventBriefing,resolve,buildPlan,identifyTrack:scanTrack});
})();
