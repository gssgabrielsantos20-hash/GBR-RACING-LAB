/* GBR Pré-GP v1 — interpretação conservadora de briefing e plano local, sem rede ou persistência.
   Nenhum campo ausente é inferido como dado confirmado do jogo. */
(()=>{
'use strict';
const MAX_TEXT=20000,MAX_LINES=160,MAX_RACES=64;
const CAR={velocidade:'speed',speed:'speed',retas:'speed',curvas:'corner',curva:'corner',cornering:'corner',potencia:'power',motor:'power',power:'power',unidade:'power',qualificacao:'qualifying',classificacao:'qualifying',qualifying:'qualifying'};
const DRIVER={ultrapassagem:'overtaking',ultrapassagens:'overtaking',overtaking:'overtaking',defesa:'defending',defending:'defending',largada:'raceStart',inicio:'raceStart',race:'raceStart',pneus:'tyreUse',desgaste:'tyreUse',gerenciamento:'tyreUse',qualificacao:'qualifying',classificacao:'qualifying'};
const CATEGORIES={junior:'junior',competidor:'competidor',challenger:'competidor',contendor:'contendor',contender:'contendor',campeao:'campeao',champion:'campeao'};
const ALIASES={'cota':'austin','circuit of the americas':'austin','interlagos':'sao-paulo','sao paulo':'sao-paulo','bahrein':'sakhir','bahrain':'sakhir','cidade do mexico':'mexico','mexico city':'mexico','madring':'madrid','yas marina':'abu-dhabi','marina bay':'singapore','red bull ring':'spielberg','albert park':'melbourne','catalunya':'barcelona','spa francorchamps':'spa'};
const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const integer=x=>Number.isInteger(Number(x))?Number(x):null;
const wholeWord=(text,term)=>(' '+text+' ').includes(' '+term+' ');
function identifyTrack(line,tracks){
 const text=clean(line),hits=new Set();
 for(const t of Array.isArray(tracks)?tracks:[]){
  if(!t?.id)continue;
  const variants=[clean(t.id),clean(t.name),clean(String(t.name||'').split('·')[0])];
  if(variants.some(v=>v&&wholeWord(text,v)))hits.add(t.id);
 }
 for(const [alias,id] of Object.entries(ALIASES)){
  if(wholeWord(text,alias)&&(tracks||[]).some(t=>t.id===id))hits.add(id);
 }
 return hits.size===1?{id:[...hits][0],ambiguous:false}:hits.size>1?{id:null,ambiguous:true}:{id:null,ambiguous:false};
}
function categoryFrom(line){
 const found=new Set();
 const text=clean(line);
 for(const [alias,id] of Object.entries(CATEGORIES))if(wholeWord(text,alias))found.add(id);
 return found.size===1?[...found][0]:null;
}
function focusFrom(line,kind){
 const text=String(line??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),names=kind==='car'?CAR:DRIVER;
 const prefix=kind==='car'?/(?:carro|componente|strong car|atributo do carro|foco do carro)\s*[:=-]\s*([a-z ]+)/:
  /(?:piloto|strong driver|atributo do piloto|foco do piloto)\s*[:=-]\s*([a-z ]+)/;
 const match=text.match(prefix);
 if(!match)return null;
 const value=match[1].trim();
 const keys=Object.keys(names).sort((a,b)=>b.length-a.length);
 const key=keys.find(k=>wholeWord(value,k));
 return key?names[key]:null;
}
function parseWeather(line){
 const text=String(line??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9%]+/g,' ').trim();
 const a=text.match(/(?:chuva|rain)\s*(?:probabilidade|chance|de)?\s*(\d{1,3})\s*(?:por cento|%)/);
 const b=text.match(/(\d{1,3})\s*(?:por cento|%)\s*(?:de\s*)?(?:chuva|rain)/);
 const value=a||b?Number((a||b)[1]):null;
 if(value!==null){
  if(value>100)return {weather:null,rain:null,invalid:true};
  return {weather:value===0?'dry':value===100?'wet':'variable',rain:value,invalid:false};
 }
 if(/\b(?:molhada|molhado|wet|pista de chuva)\b/.test(text))return {weather:'wet',rain:null,invalid:false};
 if(/\b(?:seco|seca|dry)\b/.test(text))return {weather:'dry',rain:null,invalid:false};
 if(/\b(?:misto|mista|variavel|variable)\b/.test(text))return {weather:'variable',rain:null,invalid:false};
 return {weather:null,rain:null,invalid:false};
}
function parseBriefing(text,{tracks=[]}={}){
 if(typeof text!=='string'||text.length>MAX_TEXT)throw Error('Relatório inválido ou maior que 20 mil caracteres.');
 const lines=text.replace(/\r/g,'').split('\n');
 if(lines.length>MAX_LINES)throw Error('Relatório excede o limite de 160 linhas.');
 const entries=[],warnings=[];
 let sectionCategory=null,sectionStage=null;
 for(let i=0;i<lines.length;i++){
  const line=lines[i].trim();if(!line)continue;
  const normalized=clean(line),category=categoryFrom(line);
  if(category&&/^(?:categoria|classe|dificuldade|junior|competidor|challenger|contendor|contender|campeao|champion)\b/.test(normalized))sectionCategory=category;
  if(/^(?:etapa|fase|classificacao|qualificacao|qualifying|opening|final|abertura)\b/.test(normalized)){
   if(/\b(?:classificacao|qualificacao|qualifying)\b/.test(normalized))sectionStage='qualifying';
   else if(/\b(?:final|abertura|opening)\b/.test(normalized))sectionStage='final';
  }
  const candidate=/(?:\bcorrida\b|\bprova\b|\bvoltas?\b|\blaps?\b)/.test(normalized)||/\b(?:pista|circuito)\s*:/i.test(line)||/^\d{1,2}\s*[).:-]/.test(line);
  if(!candidate||/^(?:pistas|circuitos)\s*:/.test(normalized))continue;
  const match=identifyTrack(line,tracks);
  if(match.ambiguous){warnings.push('Linha '+(i+1)+': várias pistas identificadas; confirme a corrida.');continue;}
  if(!match.id){warnings.push('Linha '+(i+1)+': circuito não identificado no catálogo GBR.');continue;}
  const lapMatch=normalized.match(/\b(\d{1,3})\s*(?:voltas?|laps?)\b/);
  const laps=lapMatch?Number(lapMatch[1]):null;
  if(laps!==null&&(laps<2||laps>100)){warnings.push('Linha '+(i+1)+': número de voltas fora do limite.');continue;}
  const weather=parseWeather(line);
  if(weather.invalid){warnings.push('Linha '+(i+1)+': probabilidade de chuva inválida.');continue;}
  const roundMatch=normalized.match(/\b(?:corrida|prova)\s*(\d{1,2})\b/)||line.match(/^\s*(\d{1,2})\s*[).:-]/);
  entries.push({trackId:match.id,categoryId:category||sectionCategory||null,stage:sectionStage,round:roundMatch?Number(roundMatch[1]):null,laps,weather:weather.weather,rain:weather.rain,carFocus:focusFrom(line,'car'),driverFocus:focusFrom(line,'driver'),line:i+1});
  if(entries.length>=MAX_RACES){warnings.push('Limite de 64 corridas atingido.');break;}
 }
 if(!entries.length)warnings.push('Nenhuma corrida reconhecida. Use uma linha por prova com pista e, quando disponíveis, voltas e clima.');
 return {entries,warnings,source:'texto_informado',version:1};
}
function resolve(parsed,{trackId,categoryId,stage,round}={}){
 if(!parsed?.entries?.length)return {race:null,warning:null};
 let candidates=parsed.entries.filter(e=>e.trackId===trackId);
 if(!candidates.length)return {race:null,warning:null};
 const exact=candidates.filter(e=>e.categoryId===categoryId);
 candidates=exact.length?exact:candidates.filter(e=>!e.categoryId);
 if(!candidates.length)return {race:null,warning:null};
 candidates=candidates.filter(e=>!e.stage||e.stage===stage);
 if(!candidates.length)return {race:null,warning:'O relatório não possui esta pista na etapa selecionada.'};
 const numbered=candidates.filter(e=>e.round===integer(round));
 if(candidates.some(e=>e.round!==null))candidates=numbered;
 if(!candidates.length)return {race:null,warning:'Não há correspondência entre rodada selecionada e relatório.'};
 if(candidates.length!==1)return {race:null,warning:'Há mais de uma corrida para esta pista e categoria; especifique a rodada no texto.'};
 return {race:candidates[0],warning:null};
}
function buildPlan({result,garage,race}={}){
 if(!result)return null;
 const series=Number(result.category?.series),trackId=result.track?.id;
 const explicitLaps=integer(race?.laps);
 const laps=explicitLaps!==null&&explicitLaps>=2&&explicitLaps<=100?explicitLaps:null;
 const weather=['dry','wet','variable'].includes(race?.weather)?race.weather:null;
 const plan=garage?.trackPlans?.[series+':'+trackId]||{};
 const warnings=[];
 const limits={soft:integer(plan.soft),medium:integer(plan.medium),hard:integer(plan.hard),wet:integer(plan.wet)};
 let tyreOptions=[];
 if(laps===null)warnings.push('Número de voltas não informado no relatório: sem pit-stop numérico.');
 if(!weather)warnings.push('Clima não confirmado: estratégia de pneus condicional.');
 if(laps!==null&&weather==='variable')warnings.push('Clima variável: não há como prever a volta de troca sem a evolução da chuva.');
 if(laps!==null&&weather==='dry'){
  const safe=Object.fromEntries(['soft','medium','hard'].map(k=>[k,limits[k]&&limits[k]>=1&&limits[k]<=100?limits[k]:null]));
  if(Object.values(safe).some(Boolean)){
   tyreOptions=(window.F1Tracks?.plans?.(laps,safe,3)||[]).slice(0,3).map(p=>({stints:p.stints.map(s=>({compound:s.type,laps:s.laps})),stops:p.stops}));
   if(!tyreOptions.length)warnings.push('Durabilidades informadas não permitem fechar a prova com até duas paradas.');
  }else warnings.push('Informe a durabilidade de pneus da pista/série na Biblioteca de Pistas para calcular paradas.');
 }
 if(laps!==null&&weather==='wet'){
  const life=limits.wet&&limits.wet>=1&&limits.wet<=100?limits.wet:null;
  if(life){
   const stints=[];let remain=laps;
   while(remain>0&&stints.length<10){const count=Math.min(remain,life);stints.push({compound:'wet',laps:count});remain-=count;}
   if(!remain)tyreOptions=[{stints,stops:stints.length-1}];
   else warnings.push('Durabilidade de chuva insuficiente para calcular plano limitado a dez stints.');
  }else warnings.push('Informe a durabilidade do pneu de chuva para calcular paradas.');
 }
 const stats={speed:'velocidade',corner:'curvas',power:'unidade de potência',qualifying:'classificação'};
 const driverStats={overtaking:'ultrapassagem',defending:'defesa',raceStart:'largada',tyreUse:'gerenciamento de pneus',qualifying:'classificação'};
 const hasBattery=(result.parts||[]).some(p=>p.category==='Bateria');
 const pair=result.drivers||[];
 const tyreA=Number(pair[0]?.tyreUse),tyreB=Number(pair[1]?.tyreUse);
 const driverAdvice=pair[0]&&pair[1]&&Number.isFinite(tyreA)&&Number.isFinite(tyreB)?
  (tyreA===tyreB?'Os dois pilotos têm o mesmo gerenciamento de pneus cadastrado.':'O piloto '+(tyreA>tyreB?'1':'2')+' tem maior gerenciamento de pneus ('+Math.max(tyreA,tyreB)+' contra '+Math.min(tyreA,tyreB)+'). Considere esse diferencial antes de atribuir o stint mais longo.'):
  'Complete os atributos dos dois pilotos para comparar gerenciamento de pneus.';
 const pitAdvice='Evite paradas simultâneas quando os dois stints suportarem voltas diferentes; não force uma volta extra além da durabilidade cadastrada.';
 const nature=result.track?.nature;
 const energy=[
  'Volta 1: modo rápido apenas em disputa vantajosa; retorne ao neutro para não desperdiçar pneus e potência. Overtake Mode indisponível na primeira volta.',
  nature==='rapida'?'Após a volta 1: priorize Overtake Mode nas retas longas, se permitido e houver adversário alcançável.':
   nature==='tecnica'?'Após a volta 1: conserve energia nas curvas encadeadas e reserve o impulso para oportunidades reais de ultrapassagem.':
   'Após a volta 1: use neutro como padrão; economize em trechos sem disputa e ataque nas oportunidades de ultrapassagem.',
  'Volta final: reduza a reserva de energia somente se houver posição a ganhar ou defender e a condição de pneus permitir.'
 ];
 if(!hasBattery)energy[1]='Sem bateria equipada nesta categoria: não presuma disponibilidade de Overtake Mode. Use gestão de potência e pneus.';
 const boostFocus=weather==='wet'?'efeito útil em chuva, se disponível':result.carFocus==='qualifying'?'desempenho de corrida e gerenciamento de pneus (Boost não melhora qualificação)':'efeito de '+(stats[result.carFocus]||'equilíbrio')+' e '+(driverStats[result.driverFocus]||'desempenho de piloto');
 const scoped=(Array.isArray(garage?.raceAnalyses)?garage.raceAnalyses:[]).filter(r=>r&&r.trackId===trackId&&Number(r.series)===series);
 const evidence=window.GBRRecommendations?.evidence?.(garage,{series,trackId,baseWeights:result.carWeights});
 return {
  laps,weather,tyreOptions,energy,warnings,boostFocus,driverAdvice,pitAdvice,boostVerified:false,
  boostNote:'A garagem não cadastra quantidades e atributos dos Boosts. O GBR recomenda efeitos, não inventa um item possuído.',
  evidenceSample:scoped.length,evidenceMode:evidence?.mode||'baseline',
  setupComplete:!!result.complete,
  confidence:{setup:result.complete?'comparação de cartas verificável':'garagem incompleta',
   tyres:tyreOptions.length?'condicional às durabilidades cadastradas':'não verificado',
   energy:'heurística; não há telemetria por setor',
   boosts:'tipo de efeito; inventário não verificado'},
  source:'perfil interno de pista + texto GP + garagem individual',
  recommendation:'Plano orientativo, sem garantia de vitória.'
 };
}

/* Comunicado de GP: fatos verificáveis, sem inferir voltas ou usar creators. */
function parseEventBriefing(text,{tracks=[],drivers=[],parts=[]}={}){
 const fallback=parseBriefing(text,{tracks});
 const lines=text.replace(/\r/g,'').split('\n');
 const warnings=fallback.warnings.filter(w=>!w.includes('Nenhuma corrida reconhecida')&&!/circuito não identificado/.test(w));
 const result={eventTitle:null,featuredPercent:null,driverBoosts:[],partBoosts:[],eventBoost:null,allowLegendary:null,allowSpecial:null,tracks:[],entries:fallback.entries,warnings,source:'texto_informado',version:2};
 let trackSection=false,featureSection=false;
 const strictTrack=raw=>{
  const t=clean(raw.replace(/^[\s\-*•\d).:]+/,'').replace(/\s*[—-]\s*(?:seco|chuva|dry|wet).*$/i,''));
  for(const entry of tracks){
   const names=[entry.id,entry.name,String(entry.name||'').split('·')[0],...Object.entries(ALIASES).filter(v=>v[1]===entry.id).map(v=>v[0])].map(clean);
   if(names.includes(t))return entry.id;
  }
  return null;
 };
 const seenDriver=new Set(),seenPart=new Set(),seenTrack=new Set();
 const normalizedKnown=(src,label)=>src.find(x=>clean(typeof x==='string'?x:x?.name||x?.label)===clean(label));
 for(let i=0;i<lines.length;i++){
  const raw=lines[i].trim(),line=clean(raw);if(!raw)continue;
  if(!result.eventTitle&&/^(?:grande premio|gp)\s+(?:do|da|de|dos|das)?\s*\S+/.test(line))result.eventTitle=raw.split(/\s+[–—-]\s+/)[0].trim().slice(0,160);
  const pct=line.match(/(?:aumento|incremento|featured assets|estatisticas)[^\n]{0,90}?\b(\d{1,3})\s*(?:por cento)?/);
  if(/\b(?:10\s*%|10\s*por cento)\b/.test(line)||(/10\s*%/.test(raw)&&/(aumento|estat|featured)/.test(line)))result.featuredPercent=10;
  else if(pct&&/%/.test(raw)&&result.featuredPercent===null){const v=Number(pct[1]);if(v>=0&&v<=100)result.featuredPercent=v;}
  const boost=raw.match(/^(?:b[oô]nus|boost)\s+do\s+evento\s*:\s*(.+)$/i);
  if(boost){result.eventBoost=boost[1].trim().slice(0,70);trackSection=false;featureSection=false;continue;}
  if(/^pilotos?\s+lend[aá]rios?\s*:/i.test(raw)){result.allowLegendary=/\b(?:permitidos?|sim|yes|allowed)\b/i.test(raw)&&!/n[aã]o\s+permitidos?/i.test(raw);trackSection=false;featureSection=false;continue;}
  if(/^edi[cç][oõ]es\s+especiais?\s*:/i.test(raw)){result.allowSpecial=/\b(?:permitidas?|sim|yes|allowed)\b/i.test(raw)&&!/n[aã]o\s+permitidas?/i.test(raw);trackSection=false;featureSection=false;continue;}
  if(/^(?:op[cç][oõ]es\s+de\s+pista|pistas?\s+(?:poss[ií]veis|dispon[ií]veis)|circuitos?\s+(?:poss[ií]veis|dispon[ií]veis))\s*:/i.test(raw)){trackSection=true;featureSection=false;continue;}
  if(/^(?:os\s+itens\s+que\s+receber[aã]o|(?:itens|cartas|pilotos|componentes)\s+(?:com\s+)?(?:b[oô]nus|em\s+destaque)|featured assets)/i.test(raw)){featureSection=true;trackSection=false;continue;}
  if(/^(?:categorias?|classifica[cç][aã]o|qualifying|opening|final|abertura|etapas?|restri[cç][oõ]es?)\s*:/i.test(raw)){trackSection=false;featureSection=false;}
  if(trackSection){
   const id=strictTrack(raw);
   if(id){if(!seenTrack.has(id)){result.tracks.push(id);seenTrack.add(id);}else warnings.push('Pista repetida na lista: '+raw);}
   else warnings.push('Linha '+(i+1)+': pista não reconhecida na lista do GP: '+raw.slice(0,80));
   continue;
  }
  if(featureSection){
   const label=raw.replace(/^[-*•]\s*/,'').split('(')[0].trim();
   const d=normalizedKnown(drivers,label),p=normalizedKnown(parts,label);
   if(d){const name=typeof d==='string'?d:d.name||d.label;if(!seenDriver.has(clean(name))){result.driverBoosts.push({key:clean(name).split(' ').pop(),label:name,rarity:'any'});seenDriver.add(clean(name));}}
   else if(p){const name=typeof p==='string'?p:p.name||p.label;if(!seenPart.has(clean(name))){result.partBoosts.push(name);seenPart.add(clean(name));}}
   else warnings.push('Linha '+(i+1)+': ativo destacado desconhecido: '+label.slice(0,80));
  }
 }
 if(!result.tracks.length&&result.entries.length)result.tracks=[...new Set(result.entries.map(e=>e.trackId))];
 if(!result.tracks.length)warnings.push('Nenhuma pista válida detectada na lista do GP.');
 if(result.featuredPercent===null&&(result.driverBoosts.length||result.partBoosts.length))warnings.push('Percentual dos ativos destacados não encontrado.');
 return result;
}

window.GBRPreGP=Object.freeze({parseEventBriefing,parseBriefing,resolve,buildPlan,identifyTrack,version:'1.0.0'});
})();
