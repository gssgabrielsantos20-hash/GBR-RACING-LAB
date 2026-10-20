/* GBR 5.5.13 — extração conservadora de estatísticas em relatórios comparativos.
   As coordenadas e confidências são dados OCR não confiáveis; nenhuma sugestão é salva sem revisão humana. */
(()=>{'use strict';
const METRICS={
 cars:{speed:['velocidade'],corner:['curvas'],power:['unidade','potencia'],qualifying:['qualificacao'],pit:['tempo','medio','stop','pitstop','pit'],overtaking:['modo','ultrapassagem']},
 drivers:{overtaking:['ultrapassando','ultrapassagem'],defending:['defesa'],qualifying:['qualificacao'],raceStart:['inicio','largada','corrida'],tyreUse:['gerenciamento','gerenciamentodepneus','gestao','gestaodepneus','pneus','desgaste']}
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const allowed=txt=>/^\d{1,3}(?:[,.]\d{1,2})?s?$/i.test(String(txt||'').trim());
const val=txt=>{const n=Number(String(txt).toLowerCase().replace('s','').replace(',','.'));return Number.isFinite(n)?n:null};
const box=w=>w?.bbox||w?.boundingBox||w?.bounding_box||null;
const points=data=>{
 const arr=Array.isArray(data?.words)?data.words:[];
 return arr.filter(w=>box(w)&&typeof w.text==='string').map(w=>{
  const b=box(w);return {text:w.text,x:(Number(b.x0)+Number(b.x1))/2,y:(Number(b.y0)+Number(b.y1))/2,
   h:Math.max(9,Number(b.y1)-Number(b.y0)),confidence:Number(w.confidence||0)};
 }).filter(w=>Number.isFinite(w.x)&&Number.isFinite(w.y));
};
// O F1 Clash quebra rótulos em palavras ("Unidade de Potência", "Pit Stop",
// "Gerenciamento de pneus"). Agrupar âncoras da MESMA linha evita perder a métrica.
function anchorRows(words,maxX,aliases,type='drivers'){
 const anchors=words.filter(w=>w.x>=maxX*.32&&w.x<=maxX*(type==='cars'?.86:.70)&&w.confidence>=22&&aliases.some(a=>norm(w.text)===norm(a)));
 const groups=[];
 for(const w of anchors.sort((a,b)=>a.y-b.y)){
  const g=groups.find(g=>Math.abs(g.y-w.y)<=Math.max(14,w.h*1.5));
  if(g){g.members.push(w);g.y=g.members.reduce((s,k)=>s+k.y,0)/g.members.length}
  else groups.push({y:w.y,members:[w]});
 }
 return groups;
}
function readings(words,maxX,row,bands,limit,type){
 const h=Math.max(...row.members.map(w=>w.h));
 const near=words.filter(w=>Math.abs(w.y-row.y)<=Math.max(16,h*1.6)&&w.confidence>=48&&allowed(w.text));
 return bands.map(([a,b],i)=>{
  const minAnchor=Math.min(...row.members.map(w=>w.x)),maxAnchor=Math.max(...row.members.map(w=>w.x));
  const values=near.filter(w=>type==='cars'?(i===0?w.x<minAnchor-34:w.x>maxAnchor+34):(w.x>=maxX*a&&w.x<maxX*b)).map(w=>({number:val(w.text),confidence:w.confidence})).filter(w=>w.number!==null&&w.number>=0&&w.number<=limit);
  return values.length===1?values[0]:null;
 });
}
// As telas oficiais têm métricas em ordem fixa e espaçamento regular.
// Quando um rótulo NÃO é lido, admitir a linha pelos números somente se ao menos
// três outras linhas ancoradas sustentarem a posição e todas as colunas forem inequívocas.
// Isto evita inventar "Pneus" ou "Potência" a partir de números soltos no print.
function recoverRows(words,maxX,type,bands,observed,result){
 const keys=Object.keys(METRICS[type]),known=[...observed.entries()].map(([key,row])=>({idx:keys.indexOf(key),y:row.y,h:row.h})).sort((a,b)=>a.idx-b.idx);
 if(known.length<3)return result;
 const steps=[];
 for(let i=1;i<known.length;i++){
  const a=known[i-1],b=known[i],step=(b.y-a.y)/(b.idx-a.idx);
  if(step<20||step>120)return result;
  steps.push(step);
 }
 const ordered=steps.slice().sort((a,b)=>a-b),step=ordered[Math.floor(ordered.length/2)];
 if(steps.some(s=>Math.abs(s-step)>step*.24))return result;
 for(let idx=0;idx<keys.length;idx++){
  const key=keys[idx];if(observed.has(key))continue;
  const adjacent=known.reduce((best,k)=>!best||Math.abs(k.idx-idx)<Math.abs(best.idx-idx)?k:best,null);
  const y=adjacent.y+(idx-adjacent.idx)*step;
  if(y<0)continue; // A última linha pode estar depois da última âncora: readings() exige números realmente visíveis.
  const center=maxX*.5;
  const row={y,members:[{x:center,h:adjacent.h}]};
  const values=readings(words,maxX,row,bands,key==='pit'?60:type==='drivers'?250:1000,type);
  if(values.some(v=>!v||v.confidence<(type==='cars'&&known.length>=4?65:70)))continue;
  const actual=words.filter(w=>Math.abs(w.y-y)<=Math.max(16,adjacent.h*1.6)&&allowed(w.text));
  if(actual.length!==values.length)continue; // Não aceitar números extras/ambíguos.
  const confidence=Math.min(...values.map(v=>v.confidence));
  observed.set(key,{y,h:adjacent.h});
  result.push({key,values:values.map(v=>v.number),confidence:Math.floor(confidence),source:'aligned-row-review'});
 }
 return result;
}
// Somente linhas com colunas distintas e valores não ambíguos entram no formulário.
function extract(data,type,partial=false){
 const words=points(data),maxX=Math.max(0,...words.map(w=>w.x));if(maxX<100)return [];
 const bands=type==='cars'?[[0,.31],[.68,1.05]]:[[0,.25],[.25,.43],[.65,.84],[.84,1.05]];
 const result=[],observed=new Map();
 for(const [key,aliases] of Object.entries(METRICS[type]||{})){
  const candidates=anchorRows(words,maxX,aliases,type).map(row=>({row,values:readings(words,maxX,row,bands,key==='pit'?60:type==='drivers'?250:1000,type)}))
    .filter(r=>partial?r.values.filter(Boolean).length>=2:r.values.every(Boolean));
  if(candidates.length!==1)continue;
  const match=candidates[0];
  observed.set(key,{y:match.row.y,h:Math.max(...match.row.members.map(w=>w.h))});
  result.push({key,values:match.values.map(r=>r?.number??null),confidence:Math.floor(Math.min(...match.values.filter(Boolean).map(r=>r.confidence))),source:'labeled-row'});
 }
 // Apenas métricas ausentes: primeiro tentamos âncoras reais, depois alinhamento.
 // Em modo parcial, recuperação de linha exige as 4 colunas, nunca apenas 2.
 recoverRows(words,maxX,type,bands,observed,result);
 return result.sort((a,b)=>Object.keys(METRICS[type]).indexOf(a.key)-Object.keys(METRICS[type]).indexOf(b.key));
}
function suggest(data,type){
 const result=extract(data,type);
 return type==='cars'?result.map(r=>({key:r.key,own:r.values[0],rival:r.values[1],confidence:r.confidence})):[];
}
function suggestFourDrivers(data){return extract(data,'drivers')}
function suggestDriverColumns(data){return extract(data,'drivers',true)}
// Identificar cartas pelas cinco estatísticas individualizadas; isto NÃO é reconhecimento facial.
// O mesmo sobrenome pode ter três raridades. Só sugerir carta se o fingerprint
// numérico COMPLETO (5/5) tiver correspondência ÚNICA no catálogo versionado.
// Referências verificadas de prints são separadas do catálogo oficial.
// Mescla OCR integral e recortes de modo conservador. Regiões sobrepostas podem
// repetir exatamente os mesmos números: manter a cópia mais nítida evita que
// 69/65/73/68 seja descartado como 8 números ambíguos. Se as leituras
// discordarem, ambas continuam presentes e o parser NÃO escolhe arbitrariamente.
function withHeaderWords(data,headerData){
 const before=Array.isArray(data?.words)?data.words:[],after=Array.isArray(headerData?.words)?headerData.words:[];
 const merged=[...before];
 for(const word of after){
  const b=box(word);if(!b){merged.push(word);continue;}
  const x=(Number(b.x0)+Number(b.x1))/2,y=(Number(b.y0)+Number(b.y1))/2;
  const duplicate=merged.findIndex(existing=>{
   const e=box(existing);if(!e)return false;
   return norm(existing.text)===norm(word.text)&&Math.abs((Number(e.x0)+Number(e.x1))/2-x)<=9&&
    Math.abs((Number(e.y0)+Number(e.y1))/2-y)<=12;
  });
  if(duplicate<0)merged.push(word);
  else if(Number(word.confidence||0)>Number(merged[duplicate].confidence||0))merged[duplicate]=word;
 }
 return {words:merged};
}
// Resolver TODAS as cartas pelos mesmos critérios, tanto no OCR bruto quanto
// nas métricas já conferidas pelo formulário após leituras complementares.
// Isto evita depender de uma segunda segmentação perfeita da imagem inteira.
const DRIVER_KEYS=['overtaking','defending','qualifying','raceStart','tyreUse'];
function fingerprintCards(reference){
 const catalog=reference?.drivers,cards=[];
 if(catalog&&typeof catalog==='object')for(const [id,entry] of Object.entries(catalog)){
  if(!entry||!['Common','Rare','Epic'].includes(entry.rarity)||!entry.levels||typeof entry.levels!=='object')continue;
  for(const [level,stats] of Object.entries(entry.levels)){
   if(!Array.isArray(stats)||stats.length!==5||!stats.every(Number.isFinite))continue;
   if(!Number.isInteger(Number(level))||Number(level)<1||Number(level)>50)continue;
   cards.push({name:String(entry.name||id.split('|').slice(1).join('|')).trim(),rarity:entry.rarity,
    ...(Number.isInteger(entry.series)&&entry.series>=1&&entry.series<=12?{series:entry.series}:{}),
    level:Number(level),values:stats,source:'catalog'});
  }
 }
 // Registro do relatório é externo ao catálogo do jogo e NÃO altera a garagem.
 const reportCards=window.GBRDriverReportReferences?.cards;
 if(Array.isArray(reportCards))for(const entry of reportCards){
  if(!entry||!Array.isArray(entry.values)||entry.values.length!==5||!entry.values.every(Number.isFinite)||!Number.isInteger(entry.level))continue;
  cards.push({name:entry.name,rarity:entry.rarity,level:entry.level,values:entry.values,source:'race-report',
   ...(Number.isInteger(entry.series)&&entry.series>=1&&entry.series<=12?{series:entry.series}:{})});
 }
 return cards;
}
function matchFingerprint(observed,cards,slot){
 const available=observed.filter(Number.isFinite).length;
 const basic={slot,status:'unverified',matchedFields:available};
 if(available<4)return basic;
 const matching=cards.filter(c=>c.values.every((v,i)=>!Number.isFinite(observed[i])||v===observed[i]));
 if(matching.length===0)return {...basic,status:available===5?'not-in-catalog':'unverified'};
 if(matching.length>1)return {...basic,status:'ambiguous',candidates:matching.length};
 const card=matching[0],complete=available===5,isReport=card.source==='race-report';
 const missingIndex=complete?-1:observed.findIndex(v=>!Number.isFinite(v));
 return {slot,status:isReport?(complete?'report-reference-match':'report-reference-review'):
   (complete?'catalog-match':'catalog-suggestion'),matchedFields:available,
  name:card.name,level:card.level,rarity:card.rarity,...(card.series?{series:card.series}:{}),
  ...(missingIndex>=0?{suggestedStatKey:DRIVER_KEYS[missingIndex],suggestedStatValue:card.values[missingIndex]}:{}),
  source:isReport?'user-report-reference':complete?'stats-catalog-5-of-5':'stats-catalog-4-of-5-review'};
}
// Recebe 4 objetos (um por carta), com métricas obtidas no OCR. Nunca é usado
// para adivinhar campos que não foram capturados: 4/5 mínimos e coincidência única.
function identifyDriverCardsFromFields(columns,reference){
 if(!Array.isArray(columns)||columns.length!==4)return [];
 if(!reference?.drivers||typeof reference.drivers!=='object')return columns.map((_,slot)=>({slot,status:'unverified',matchedFields:0}));
 const cards=fingerprintCards(reference);
 return columns.map((column,slot)=>matchFingerprint(DRIVER_KEYS.map(key=>
  Number.isFinite(column?.[key])?column[key]:null),cards,slot));
}
function identifyDriverCards(data,reference){
 if(!reference?.drivers||typeof reference.drivers!=='object')return Array.from({length:4},(_,slot)=>({slot,status:'unverified',matchedFields:0}));
 const metrics=suggestDriverColumns(data);
 const cards=fingerprintCards(reference);
 const result=Array.from({length:4},(_,slot)=>matchFingerprint(
  DRIVER_KEYS.map(key=>metrics.find(m=>m.key===key)?.values?.[slot]),cards,slot));
 // Lendários não têm os cinco níveis/atributos catalogados. Ler nome e nível
 // SOMENTE se ambos estiverem explícitos na faixa superior da carta (sem inferir série).
 const words=points(data),maxX=Math.max(0,...words.map(w=>w.x));
 const firstRow=anchorRows(words,maxX,METRICS.drivers.overtaking).sort((a,b)=>a.y-b.y)[0]?.y;
 const legendary=window.GBRLegendaryDrivers?.all;
 if(firstRow&&Array.isArray(legendary)){
  const bands=[[0,.25],[.25,.43],[.65,.84],[.84,1.05]];
  for(let slot=0;slot<4;slot++){
   if(result[slot].status!=='unverified'&&result[slot].status!=='not-in-catalog')continue;
   const [a,b]=bands[slot];
   const header=words.filter(w=>w.x>=maxX*a&&w.x<maxX*b&&w.y>firstRow-235&&w.y<firstRow-75&&w.confidence>=60);
   const equalsName=(label,text)=>{
    const n=norm(label),t=norm(text).replace(/0/g,'o').replace(/1/g,'i');
    if(n.length<5)return false;
    if(t===n||(t.endsWith(n)&&t.length<=n.length+5))return true;
    // Um único caractere diferente em palavra longa é aceitável somente
    // quando a carta não coincide com nenhum outro lendário conhecido.
    if(n.length<6)return false;
    const suffix=t.slice(-n.length);
    return suffix.length===n.length&&[...n].filter((c,i)=>c!==suffix[i]).length===1;
   };
   const matches=legendary.filter(d=>d.name!=='Graham Hill'&&d.name!=='Damon Hill'&&
    header.some(w=>[d.name,...d.aliases].some(alias=>equalsName(alias,w.text))));
   if(matches.length!==1)continue;
   const hit=header.find(w=>[matches[0].name,...matches[0].aliases].some(alias=>equalsName(alias,w.text)));
   if(!hit)continue;
   const levels=words.filter(w=>w.x>=maxX*a&&w.x<maxX*b&&w.y>hit.y+18&&w.y<firstRow-35&&
    w.confidence>=60&&/^\d{1,2}$/.test(w.text)&&Number(w.text)>=1&&Number(w.text)<=15);
   const verifiedLevel=levels.length===1?Number(levels[0].text):null;
   result[slot]={slot,status:verifiedLevel?'legendary-header':'legendary-name-review',matchedFields:result[slot].matchedFields,
    name:matches[0].name,...(verifiedLevel?{level:verifiedLevel}:{}),rarity:'Legendary',
    source:verifiedLevel?'ocr-header-review':'ocr-name-only-review'};
  }
 }
 return result;
}
window.GBRLearningOCR=Object.freeze({suggest,suggestFourDrivers,suggestDriverColumns,identifyDriverCards,identifyDriverCardsFromFields,withHeaderWords});
})();
