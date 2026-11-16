/* GBR Racing Lab — Central de Eventos GP 2026 / versão de prévia.
   Nenhuma operação remota ou mutação dos dados das garagens.
   As datas, restrições, pistas e assets são transcritos do briefing do usuário.
   Não simula ordem de corridas, durabilidade de pneus ou clima não informado. */
(()=>{
'use strict';
const EVENTS=[
 {id:'sao-paulo-spectacular-2026',name:'O Espetáculo de São Paulo',label:'O Espetáculo de São Paulo',kind:'Evento oficial Hutch / novembro',starts:'2026-11-04',ends:'2026-11-08',image:'assets/events/sao-paulo-spectacular-2026.png',color:'yellow',description:'Calendário por etapa: Classificatória de 04 a 06/11, Abertura em 07/11 e Final em 08/11. Abertura e Final usam a mesma ordem fixa de oito corridas.',eventBoost:'Samba',allowLegendary:true,allowSpecial:true,featuredPercent:10,rulesConfirmed:true,
  scheduleProvenance:'Voltas, ordem, chuva (%) e temperaturas transcritos dos prints do F1 Clash enviados em 02/11/2026. Responsável confirmou em 02/11/2026 que a Final repete a ordem e condições das oito corridas da Abertura e que as datas corretas das etapas são 04–06, 07 e 08/11. A faixa do print anterior exibia 04–09/11; datas das etapas seguem a confirmação posterior. Chuva e temperaturas não são previsão ao vivo.',
  stages:{qualifying:'04–06/11/2026',opening:'07/11/2026',final:'08/11/2026'},
  stageRounds:{
   qualifying:[{track:'sao-paulo',laps:9,rain:0,tempMin:26,tempMax:30},{track:'abu-dhabi',laps:8,rain:0,tempMin:26,tempMax:30},{track:'suzuka',laps:7,rain:100,tempMin:18,tempMax:22},{track:'zandvoort',laps:8,rain:0,tempMin:24,tempMax:28}],
   opening:[{track:'sao-paulo',laps:9,rain:0,tempMin:26,tempMax:30},{track:'shanghai',laps:7,rain:0,tempMin:22,tempMax:24},{track:'abu-dhabi',laps:8,rain:0,tempMin:26,tempMax:30},{track:'spa',laps:6,rain:0,tempMin:22,tempMax:24},{track:'suzuka',laps:7,rain:100,tempMin:18,tempMax:22},{track:'silverstone',laps:8,rain:0,tempMin:22,tempMax:23},{track:'zandvoort',laps:8,rain:0,tempMin:24,tempMax:28},{track:'sao-paulo',laps:9,rain:0,tempMin:26,tempMax:30}],
   final:[{track:'sao-paulo',laps:9,rain:0,tempMin:26,tempMax:30},{track:'shanghai',laps:7,rain:0,tempMin:22,tempMax:24},{track:'abu-dhabi',laps:8,rain:0,tempMin:26,tempMax:30},{track:'spa',laps:6,rain:0,tempMin:22,tempMax:24},{track:'suzuka',laps:7,rain:100,tempMin:18,tempMax:22},{track:'silverstone',laps:8,rain:0,tempMin:22,tempMax:23},{track:'zandvoort',laps:8,rain:0,tempMin:24,tempMax:28},{track:'sao-paulo',laps:9,rain:0,tempMin:26,tempMax:30}],
  },
  partialStages:[],
  driverBoosts:[{key:'barrichello',label:'Rubens Barrichello',rarity:'Legendary'},{key:'mansell',label:'Nigel Mansell',rarity:'Legendary'}],partBoosts:['Eco Cell+','Aura Lock','Zephyr'],
  tracks:['sao-paulo','abu-dhabi','suzuka','zandvoort','shanghai','spa','silverstone'],
  sponsor:{junior:{requirement:'Zephyr · nível 5+',qualifying:'2 troféus de Pit Pass',opening:'3.000 moedas',final:'3 pontos de corrida'},competidor:{requirement:'Zephyr · nível 7+',qualifying:'3 troféus de Pit Pass',opening:'40.000 moedas',final:'4 pontos de corrida'},contendor:{requirement:'Rubens Barrichello Lendário · nível 1+',qualifying:'4 troféus de Pit Pass',opening:'500.000 moedas',final:'5 pontos de corrida'},campeao:{requirement:'Barrichello Lendário ou Eco Cell+ (nível 1+); ambos aparecem na tarefa',qualifying:'6 pontos de corrida',opening:'6 pontos de corrida',final:'6 pontos de corrida'}}},
 {id:'moustache-madness-2026',name:'Loucura dos Bigodes',label:'Loucura dos Bigodes',kind:'Evento oficial Hutch / novembro',starts:'2026-11-11',ends:'2026-11-15',image:'assets/events/moustache-madness-2026.png',color:'yellow',description:'Evento temático do bigode de Mansell. Classificatória, Abertura e Final com circuitos, voltas e condições transcritos das capturas do jogo.',eventBoost:'Handlebar',allowLegendary:true,allowSpecial:true,featuredPercent:10,rulesConfirmed:true,
  scheduleProvenance:'Capturas do F1 Clash enviadas pelo usuário em 10/11/2026. Voltas, chuva e temperaturas foram transcritas das telas. Regra geral confirmada pelo responsável: Classificatória de quarta a sexta, Abertura no sábado e Final no domingo. Período geral: 11–15/11/2026. A ordem e os dados das corridas permanecem conforme as capturas; condições não são previsão ao vivo.',
  stages:{qualifying:'11–13/11/2026',opening:'14/11/2026',final:'15/11/2026'},
  stageRounds:{
   qualifying:[{track:'monaco',laps:7,rain:0,tempMin:28,tempMax:30},{track:'jeddah',laps:8,rain:0,tempMin:26,tempMax:28},{track:'spielberg',laps:10,rain:100,tempMin:18,tempMax:22},{track:'monza',laps:9,rain:0,tempMin:22,tempMax:24}],
   opening:[{track:'monaco',laps:7,rain:0,tempMin:28,tempMax:30},{track:'spa',laps:6,rain:0,tempMin:22,tempMax:24},{track:'jeddah',laps:8,rain:0,tempMin:26,tempMax:28},{track:'hungaroring',laps:9,rain:0,tempMin:25,tempMax:27},{track:'spielberg',laps:10,rain:100,tempMin:18,tempMax:22},{track:'melbourne',laps:9,rain:0,tempMin:22,tempMax:24},{track:'monza',laps:9,rain:0,tempMin:22,tempMax:24},{track:'monaco',laps:7,rain:0,tempMin:28,tempMax:30}],
   final:[{track:'monaco',laps:7,rain:0,tempMin:28,tempMax:30},{track:'spa',laps:6,rain:0,tempMin:22,tempMax:24},{track:'jeddah',laps:8,rain:0,tempMin:26,tempMax:28},{track:'hungaroring',laps:9,rain:0,tempMin:25,tempMax:27},{track:'spielberg',laps:10,rain:100,tempMin:18,tempMax:22},{track:'melbourne',laps:9,rain:0,tempMin:22,tempMax:24},{track:'monza',laps:9,rain:0,tempMin:22,tempMax:24},{track:'monaco',laps:7,rain:0,tempMin:28,tempMax:30}]
  },
  driverBoosts:[{key:'mansell',label:'Nigel Mansell',rarity:'Legendary'}],partBoosts:['Bounce','Wobble','Axis 3000'],
  tracks:['monaco','jeddah','spielberg','monza','spa','hungaroring','melbourne'],
  sponsor:{
   junior:{title:'Linha de Corrida',description:'Garanta uma vantagem logo no início. Reduza sua diferença em relação aos adversários seguindo as recomendações para manter uma distância segura do pelotão.',requirement:'Wobble · nível 6+',qualifying:'+2 troféus',opening:'+3 mil moedas',final:'+30 reputação'},
   competidor:{title:'Desempenho Delta',description:'Reduza a diferença. Otimize sua configuração para se aproximar do pelotão mais rápido.',requirement:'Axis 3000 · nível 6+',qualifying:'+3 troféus',opening:'+40 mil moedas',final:'+100 reputação'},
   contendor:{title:'Pico Apex',description:'Aprimore sua trajetória de corrida. Supere a diferença de desempenho ajustando sua configuração para ganhar vantagem sobre os futuros campeões.',requirement:'Axis 3000 · nível 7+',qualifying:'+4 troféus',opening:'+500 mil moedas',final:'+200 reputação'},
   campeao:{title:'Limite Absoluto',description:'Alcance a eficiência total. Obtenha o máximo desempenho com esses testes de eficiência para competir entre os melhores dos melhores.',requirement:'Nigel Mansell · nível 1+',qualifying:'+5 troféus',opening:'+3,5 mi moedas',final:'+850 reputação'}
  },sponsorNote:'Tarefas e recompensas transcritas das capturas enviadas pelo usuário. Em cada etapa, use ao menos um recurso indicado. Confirme a conclusão e os valores no jogo.'},
 {id:'las-vegas-grand-prix-2026',name:'Grande Prêmio de Las Vegas',label:'GP Las Vegas',kind:'Evento oficial Hutch / novembro',starts:'2026-11-18',ends:'2026-11-22',image:'assets/events/las-vegas-gp-2026.webp',color:'blue',description:'+10% nos ativos em destaque. Regra de calendário: Classificatória de quarta a sexta (18–20/11), Abertura no sábado (21/11) e Final no domingo (22/11).',eventBoost:'Glamour',allowLegendary:false,allowSpecial:true,featuredPercent:10,rulesConfirmed:true,
  scheduleProvenance:'Ordem, voltas, chuva (%) e temperaturas transcritos das capturas do F1 Clash enviadas pelo usuário em 16/11/2026. Datas das etapas seguem a regra geral confirmada pelo responsável: Classificatória quarta–sexta, Abertura sábado e Final domingo. As condições são os dados exibidos no jogo, não previsão ao vivo.',
  stages:{qualifying:'18–20/11/2026',opening:'21/11/2026',final:'22/11/2026'},
  stageRounds:{
   qualifying:[{track:'las-vegas',laps:6,rain:0,tempMin:20,tempMax:22},{track:'zandvoort',laps:8,rain:0,tempMin:24,tempMax:28},{track:'hungaroring',laps:9,rain:100,tempMin:22,tempMax:24},{track:'madrid',laps:5,rain:0,tempMin:25,tempMax:29}],
   opening:[{track:'las-vegas',laps:6,rain:0,tempMin:20,tempMax:22},{track:'austin',laps:6,rain:0,tempMin:26,tempMax:30},{track:'zandvoort',laps:8,rain:0,tempMin:24,tempMax:28},{track:'miami',laps:6,rain:0,tempMin:26,tempMax:28},{track:'hungaroring',laps:9,rain:100,tempMin:22,tempMax:24},{track:'spielberg',laps:10,rain:0,tempMin:20,tempMax:24},{track:'madrid',laps:5,rain:0,tempMin:25,tempMax:29},{track:'las-vegas',laps:6,rain:0,tempMin:20,tempMax:22}],
   final:[{track:'las-vegas',laps:6,rain:0,tempMin:20,tempMax:22},{track:'austin',laps:6,rain:0,tempMin:26,tempMax:30},{track:'zandvoort',laps:8,rain:0,tempMin:24,tempMax:28},{track:'miami',laps:6,rain:0,tempMin:26,tempMax:28},{track:'hungaroring',laps:9,rain:100,tempMin:22,tempMax:24},{track:'spielberg',laps:10,rain:0,tempMin:20,tempMax:24},{track:'madrid',laps:5,rain:0,tempMin:25,tempMax:29},{track:'las-vegas',laps:6,rain:0,tempMin:20,tempMax:22}]
  },
  driverBoosts:[{key:'sainz',label:'Carlos Sainz',rarity:'any',rarities:['Common','Rare','Epic','Special'],specialGroups:['green'],variantDetail:'Comum, Raro, Épico e Coleção Exclusiva'},{key:'hadjar',label:'Isack Hadjar',rarity:'any',rarities:['Common','Rare','Epic','Special'],specialGroups:['paddock','green'],variantDetail:'Comum, Raro, Épico, Escolhas do Paddock e Coleção Exclusiva'}],partBoosts:['Control','Curver 3.0','Tailwind'],
  tracks:['las-vegas','austin','zandvoort','miami','hungaroring','spielberg','madrid'],
  sponsor:{
   junior:{title:'Linha de Corrida',description:'Garanta uma vantagem logo no início. Reduza sua diferença em relação aos adversários seguindo as recomendações para manter uma distância segura do pelotão.',requirement:'Isack Hadjar Comum · nível 1+',qualifying:'+3 mil moedas',opening:'+3 mil moedas',final:'+3 mil moedas',stageRequirements:{qualifying:'Hadjar comum Nv. 1',opening:'Hadjar comum Nv. 1',final:'Hadjar comum Nv. 1'}},
   competidor:{title:'Desempenho Delta',description:'Reduza a diferença. Otimize sua configuração para se aproximar do pelotão mais rápido.',requirement:'Carlos Sainz Comum · nível 2+',qualifying:'+100 reputação',opening:'+100 reputação',final:'+100 reputação',stageRequirements:{qualifying:'Sainz comum Nv. 2',opening:'Sainz comum Nv. 2',final:'Sainz comum Nv. 2'}},
   contendor:{title:'Pico Apex',description:'Aprimore sua trajetória de corrida. Supere a diferença de desempenho ajustando sua configuração para ganhar vantagem sobre os futuros campeões.',requirement:'Isack Hadjar Escolhas do Paddock (Standard) · nível 3+ na Classificatória/Abertura e 4+ na Final',qualifying:'+200 reputação',opening:'+200 reputação',final:'+200 reputação',stageRequirements:{qualifying:'Hadjar Escolhas do Paddock Standard Nv. 3',opening:'Hadjar Escolhas do Paddock Standard Nv. 3',final:'Hadjar Escolhas do Paddock Standard Nv. 4'}},
   campeao:{title:'Limite Absoluto',description:'Alcance a eficiência total. Obtenha o máximo desempenho com esses testes de eficiência para competir entre os melhores dos melhores.',requirement:'Carlos Sainz Coleção Exclusiva · nível 1+ na Classificatória/Abertura e 2+ na Final',qualifying:'+850 reputação',opening:'+850 reputação',final:'+850 reputação',stageRequirements:{qualifying:'Sainz Coleção Exclusiva Nv. 1',opening:'Sainz Coleção Exclusiva Nv. 1',final:'Sainz Coleção Exclusiva Nv. 2'}}
  },sponsorNote:'Tarefas e recompensas transcritas das capturas enviadas pelo usuário em 16/11/2026. Cada etapa indica o requisito de nível e a recompensa exibida; confirme a conclusão no jogo.'},
 {id:'qatar-legendary-event-2026',name:'O Evento Lendário do Catar',label:'Evento do Catar',kind:'Evento anunciado / novembro',starts:'2026-11-25',ends:'2026-11-29',image:'assets/events/qatar-legendary-2026.webp',color:'yellow',description:'Evento lendário com +10% nos ativos destacados. Pistas possíveis anunciadas; ordem, voltas e clima não informados.',eventBoost:'Turquia',allowLegendary:true,allowSpecial:true,featuredPercent:10,rulesConfirmed:true,
  scheduleProvenance:'Cartaz, regras, opções de pista e tabela de recompensa enviados em 04/11/2026. A ordem das provas, as voltas e o clima não foram informados.',
  driverBoosts:[{key:'schumacher',label:'Michael Schumacher',rarity:'Legendary'},{key:'barrichello',label:'Rubens Barrichello',rarity:'Legendary'}],partBoosts:['The Singularity','Downforce','Stratos'],
  tracks:['lusail','sakhir','silverstone','mexico','suzuka','barcelona','baku'],
  sponsor:{
   junior:{requirement:'Stratos · nível 5+',qualifying:'3 pontos de corrida',opening:'3 pontos de corrida',final:'3 pontos de corrida',stageRequirements:{qualifying:'Stratos Nv. 5',opening:'Stratos Nv. 5',final:'Stratos Nv. 5'}},
   competidor:{requirement:'Stratos · nível 7+',qualifying:'4 pontos de corrida',opening:'4 pontos de corrida',final:'4 pontos de corrida',stageRequirements:{qualifying:'Stratos Nv. 7',opening:'Stratos Nv. 7',final:'Stratos Nv. 7'}},
   contendor:{requirement:'Rubens Barrichello Lendário · nível 1+',qualifying:'5 pontos de corrida',opening:'5 pontos de corrida',final:'5 pontos de corrida',stageRequirements:{qualifying:'Barrichello lendário Nv. 1',opening:'Barrichello lendário Nv. 1',final:'Barrichello lendário Nv. 1'}},
   campeao:{requirement:'Michael Schumacher Lendário e The Singularity · nível 1+ (ambos listados)',qualifying:'6 pontos de corrida por entrada exibida',opening:'6 pontos de corrida por entrada exibida',final:'6 pontos de corrida por entrada exibida',stageRequirements:{qualifying:'Schumacher lendário Nv. 1 / The Singularity Nv. 1',opening:'Schumacher lendário Nv. 1 / The Singularity Nv. 1',final:'Schumacher lendário Nv. 1 / The Singularity Nv. 1'}}
  },sponsorNote:'Na categoria Campeão, a captura lista Schumacher e The Singularity com 6 pontos cada. Não presumimos soma automática, nem obrigatoriedade de usar ambos simultaneamente.'},
 {id:'mexico-grand-prix-2026',name:'Grande Prêmio da Cidade do México',label:'GP da Cidade do México',kind:'GP oficial / Hermanos Rodríguez',starts:'2026-10-28',ends:'2026-11-01',image:'assets/events/mexico-gp-2026.png',color:'red',description:'GP do México 2026 · treino de equipes por pista. Qualificatória 28 a 30/10, abertura 31/10, final 01/11.',eventBoost:'Caveira',allowLegendary:false,allowSpecial:true,featuredPercent:10,
  scheduleProvenance:'Calendário e clima informados pelo jogador a partir dos prints do F1 Clash em 26/10/2026; confirme no jogo antes de correr',
  stages:{qualifying:'28 a 30/10/2026',opening:'31/10/2026',final:'01/11/2026'},
  driverBoosts:[{key:'leclerc',label:'Charles Leclerc',rarity:'any'},{key:'lawson',label:'Liam Lawson',rarity:'any'}],partBoosts:['The Reverse','Power Grid','Laminar'],
  tracks:['mexico','monaco','zandvoort','sakhir','sao-paulo','suzuka','spielberg'],
  qualifying:[{track:'mexico',laps:9,rain:0},{track:'zandvoort',laps:8,rain:0},{track:'sao-paulo',laps:9,rain:100},{track:'spielberg',laps:10,rain:0}],
  rounds:[{track:'mexico',laps:9,rain:0},{track:'monaco',laps:7,rain:0},{track:'zandvoort',laps:8,rain:0},{track:'sakhir',laps:8,rain:0},{track:'sao-paulo',laps:9,rain:100},{track:'suzuka',laps:7,rain:0},{track:'spielberg',laps:10,rain:0},{track:'mexico',laps:9,rain:0}],
  sponsor:{
   junior:{requirement:'Liam Lawson comum · nível 2+',qualifying:'3 mil moedas',opening:'+2 troféus',final:'+3 pontos de corrida'},
   competidor:{requirement:'Charles Leclerc comum · nível 5+',qualifying:'40 mil moedas',opening:'+3 troféus',final:'+4 pontos de corrida'},
   contendor:{requirement:'Liam Lawson épico · nível 5+',qualifying:'500 mil moedas',opening:'+4 troféus',final:'+5 pontos de corrida'},
   campeao:{requirement:'Leclerc e Lawson da Coleção Exclusiva · nível 1+ na classificatória/abertura; nível 2+ na final',qualifying:'3,5 milhões de moedas por carta',opening:'+5 troféus por carta',final:'+6 pontos de corrida por carta'}
  }},
 {id:'us-grand-prix-2026',name:'Grande Prêmio dos Estados Unidos',label:'GP dos Estados Unidos',kind:'GP oficial / Austin',starts:'2026-10-21',ends:'2026-10-25',image:'assets/events/us-gp-2026.png',color:'blue',description:'O desafio de Austin e suas mudanças de direção exige um setup bem equilibrado.',eventBoost:'Eagle',allowLegendary:false,allowSpecial:true,driverBoosts:[{key:'bearman',label:'Oliver Bearman',rarity:'any'},{key:'bortoleto',label:'Gabriel Bortoleto',rarity:'any'}],partBoosts:['Fracture','Motion Link V2','Tailwind'],tracks:['sakhir','hungaroring','madrid','austin','baku','barcelona','sao-paulo'],
  source:'https://www.allclash.com/f1-clash-unites-states-grand-prix-2026-guide-junior-challenger-contender-champion/',verified:'20/10/2026',
  scheduleProvenance:'Referência externa de 20/10/2026; confirme no F1 Clash antes de correr',
  qualifying:[{track:'austin',laps:6,rain:0},{track:'sakhir',laps:8,rain:0},{track:'hungaroring',laps:9,rain:100},{track:'madrid',laps:5,rain:0}],
  rounds:[{track:'austin',laps:6,rain:0},{track:'baku',laps:7,rain:0},{track:'sakhir',laps:8,rain:0},{track:'barcelona',laps:10,rain:0},
   {track:'hungaroring',laps:9,rain:100},{track:'sao-paulo',laps:9,rain:0},{track:'madrid',laps:5,rain:0},{track:'austin',laps:6,rain:0}]}
];
const CATEGORIES=[
 {id:'junior',label:'Júnior',series:3,description:'Séries 1 a 3'},
 {id:'competidor',label:'Competidor',series:6,description:'Séries 1 a 6'},
 {id:'contendor',label:'Contendor',series:9,description:'Séries 1 a 9'},
 {id:'campeao',label:'Campeão',series:12,description:'Séries 1 a 12'}
];
const CAR_KEYS=['speed','corner','power','qualifying'];
const DRIVER_KEYS=['overtaking','defending','qualifying','raceStart','tyreUse'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const n=v=>Number(v)||0;
const $=id=>document.getElementById(id);
const localToday=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const firstEvent=EVENTS.find(e=>e.starts<=localToday()&&e.ends>=localToday())||EVENTS.find(e=>e.starts>localToday())||EVENTS[0];
let selectedEventId=firstEvent.id,selectedCategoryId='contendor',selectedTrackId=firstEvent.tracks[0]||'',selectedStage=firstEvent.stageRounds?'qualifying':'final',selectedRound=1,section='library',lastResult=null;
const getEvent=()=>EVENTS.find(e=>e.id===selectedEventId)||EVENTS[0];
const getCategory=()=>CATEGORIES.find(t=>t.id===selectedCategoryId)||CATEGORIES[3];
const getTrack=id=>window.F1Tracks?.all?.find(t=>t.id===id)||null;
const getGarage=()=>window.F1App?.getGarage?.()||{parts:[],drivers:[],trackPlans:{}};
function bonusInEffect(event){return eventStatus(event)==='Em andamento'}
function isFeaturedPart(part,event){return event.partBoosts.some(name=>norm(name)===norm(part?.name))}
function driverMatchesSpec(driver,spec){
 if(!driver||!spec)return false;
 const names=norm(driver.name).split(' ').filter(Boolean);
 if(!names.includes(spec.key))return false;
 if(Array.isArray(spec.rarities)&&!spec.rarities.includes(driver.rarity))return false;
 if(spec.rarity!=='any'&&driver.rarity!==spec.rarity)return false;
 // Diferenciar Paddock, Turbo e Coleção Exclusiva para não aplicar bônus a versões não anunciadas.
 if(driver.rarity==='Special'&&Array.isArray(spec.specialGroups)){
  return spec.specialGroups.includes(window.GBRSpecialEditions?.groupOf?.(driver)||'');
 }
 return true;
}
function isFeaturedDriver(driver,event){
 return event.driverBoosts.some(spec=>driverMatchesSpec(driver,spec));
}
function isAllowedDriver(d,event,category){
 if(!d?.owned||n(d.level)<1||n(d.series)>category.series)return false;
 if(d.rarity==='Legendary'&&!event.allowLegendary)return false;
 if(d.rarity==='Special'&&!event.allowSpecial)return false;
 return true;
}
function withBonus(item,keys,featured,percentage=10){
 const pct=Number.isFinite(Number(percentage))?Math.max(0,Math.min(100,Number(percentage))):10;
 const x={...item,eventFeatured:featured,eventBoostPercentage:featured?pct:0};
 keys.forEach(k=>x[k]=featured?n(item[k])*(1+pct/100):n(item[k]));
 return x;
}
function bonusForPlanning(event){return eventStatus(event)!=='Encerrado'}
function boostedPart(part,event,forPlan=false){return withBonus(part,CAR_KEYS,(forPlan?bonusForPlanning(event):bonusInEffect(event))&&isFeaturedPart(part,event),event.featuredPercent??10)}
function boostedDriver(driver,event,forPlan=false){return withBonus(driver,DRIVER_KEYS,(forPlan?bonusForPlanning(event):bonusInEffect(event))&&isFeaturedDriver(driver,event),event.featuredPercent??10)}
function driverIdentity(d){const pieces=norm(d?.name).split(' ');return pieces[pieces.length-1]||'';}
function driverScore(d,focus){
 return n(d[focus])*.65+DRIVER_KEYS.reduce((total,k)=>total+n(d[k])*.07,0)
}
// Contexto de corrida é explícito: um pedido do Pit Wall por pista não herda
// a etapa/corrida que ficou selecionada na Central de Eventos.
function knownRaceContext(event,trackId,selection){
 const stage=['qualifying','opening','final'].includes(selection?.stage)?selection.stage:null;
 const round=Number(selection?.round);
 const list=stage?(event.stageRounds?.[stage]||(stage==='qualifying'?event.qualifying:event.rounds)):null;
 const specific=stage&&Number.isInteger(round)&&round>=1&&round<=20&&list?.[round-1]?.track===trackId?list[round-1]:null;
 if(specific)return {race:specific,stage,round,sourceType:'corrida'};
 const all=event.stageRounds?Object.values(event.stageRounds).flat():[...(event.qualifying||[]),...(event.rounds||[])];
 const matches=all.filter(r=>r?.track===trackId);
 if(!matches.length)return null;
 const same=field=>matches.every(r=>r[field]===matches[0][field])?matches[0][field]:null;
 return {race:{track:trackId,laps:same('laps'),rain:same('rain')},stage:null,round:null,sourceType:'pista'};
}
function computeSetup(event=getEvent(),category=getCategory(),trackId=selectedTrackId,garage=getGarage(),raceContext=null){
 if(event.rulesConfirmed===false)return null; // Não gerar elegibilidade para GP sem regras confirmadas.
 const track=getTrack(trackId);if(!track||!event.tracks.includes(track.id))return null;
 const preview=window.GBRPreGPUI?.eventFor?.(event.id)||null;
 if(preview&&preview.tracks?.includes(track.id))event={...event,
  allowLegendary:event.allowLegendary&&preview.allowLegendary!==false,
  allowSpecial:event.allowSpecial&&preview.allowSpecial!==false,
  featuredPercent:preview.featuredPercent??10,
  driverBoosts:preview.driverBoosts?.length?preview.driverBoosts:event.driverBoosts,
  partBoosts:preview.partBoosts?.length?preview.partBoosts:event.partBoosts};
 // Usar a prova fornecida pelo chamador, ou um consenso de todas as ocorrências
 // desta pista no calendário. Não misturar a corrida selecionada em outra tela.
 const known=knownRaceContext(event,trackId,raceContext);
 const selectedRoundData=known?.race||null;
 const reported=known?.sourceType==='corrida'?window.GBRPreGPUI?.raceFor?.(event.id,category.id,trackId,known.stage,known.round):null;
 const report=reported&&reported.trackId===trackId?reported:(selectedRoundData?{
   trackId,categoryId:category.id,stage:known.stage,round:known.round,
   laps:Number.isInteger(selectedRoundData.laps)?selectedRoundData.laps:null,
   weather:selectedRoundData.rain===100?'wet':selectedRoundData.rain===0?'dry':null,
   rain:selectedRoundData.rain??null,mode:'gp',source:event.scheduleProvenance||'sem fonte verificada',
   carFocus:null,driverFocus:null
  }:null);
 const priority=window.GBRCore?.TRACK_SERIES?.[category.series]?.[track.id];
 const car=report?.carFocus||priority?.[1]||track.car;
 const driver=report?.driverFocus||priority?.[0]||track.driver;
 const weights=window.GBRCore?.trackWeights?.(car)||{speed:30,corner:30,power:25,qualifying:15};
 const maxSeries=category.series;
 const required=['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio',...(maxSeries>3?['Bateria']:[])];
 const candidates=garage.parts.filter(p=>p?.owned&&n(p.level)>0&&n(p.series)<=maxSeries).map(p=>boostedPart(p,event,true));
 const chosen=required.map(cat=>{
   const options=candidates.filter(p=>p.category===cat);
   options.sort((a,b)=>scorePart(b)-scorePart(a));
   return options[0]||null;
 }).filter(Boolean);
 function scorePart(p){return CAR_KEYS.reduce((total,k)=>total+n(p[k])*n(weights[k]),0)/100}
 const totals={speed:0,corner:0,power:0,qualifying:0,pit:0};
 for(const p of chosen){for(const k of Object.keys(totals)){totals[k]+=n(p[k])}}
 const drivers=garage.drivers.filter(d=>isAllowedDriver(d,event,category)).map(d=>boostedDriver(d,event,true));
 drivers.sort((a,b)=>driverScore(b,driver)-driverScore(a,driver));
 const driverPair=[];
 for(const d of drivers){
  // No mesmo setup, pilotos da mesma identidade não podem ocupar ambas as vagas.
  if(driverPair.every(chosen=>driverIdentity(chosen)!==driverIdentity(d)))driverPair.push(d);
  if(driverPair.length===2)break;
 }
 const adjustedDrivers=[driverPair[0]||null,driverPair[1]||null];
 const featuredCount=chosen.filter(p=>p.eventFeatured).length+adjustedDrivers.filter(d=>d?.eventFeatured).length;
 const weather=report?.weather||(known?'unknown':garage.trackPlans?.[maxSeries+':'+track.id]?.weather||'unknown');
 const boosts=window.GBRBoosts?.recommend?.({track,car,driver,weather})||[];
 const complete=chosen.length===required.length&&adjustedDrivers.every(Boolean);
 return {event,category,track,carFocus:car,driverFocus:driver,carWeights:weights,parts:chosen,totals,required,drivers:adjustedDrivers,featuredCount,boosts,complete,weather,bonusInEffect:bonusInEffect(event),bonusProjected:!bonusInEffect(event)&&bonusForPlanning(event),round:known?.round??null,reportContext:report};
}
function eventStatus(event){
 const today=new Date();const todayText=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 return todayText<event.starts?'Em breve':todayText>event.ends?'Encerrado':'Em andamento';
}
function dateShort(str){const [year,month,day]=str.split('-');return `${day}/${month}`;}
function tagAllowed(value){return value===null?'<span> A confirmar </span>':value?'<span class="gp-allowed">✓ Permitidos</span>':'<span class="gp-blocked">✕ Não permitidos</span>'}
function syncRoute(){
 document.querySelectorAll('.gp-view-switch [data-gp-view]').forEach(b=>{const on=b.dataset.gpView===section;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false')});
 if($('gbrStandardTracks'))$('gbrStandardTracks').hidden=section!=='library';
 if($('gbrEventHub'))$('gbrEventHub').hidden=section!=='events';
 $('gbrNavEvents')?.classList.toggle('active',section==='events');
 $('gbrMobileMoreEvents')?.classList.toggle('active',section==='events');
}
function changeView(target){section=target==='events'?'events':'library';syncRoute();if(section==='events')render();}
function eventCardsHtml(){return EVENTS.map(e=>`<button type="button" class="gp-event-choice ${e.id===selectedEventId?'selected':''}" data-gp-select="${esc(e.id)}" aria-pressed="${String(e.id===selectedEventId)}"><img src="${esc(e.image)}" alt="Imagem divulgada do evento ${esc(e.label)}" loading="lazy"><span class="gp-event-choice-title"><b>${esc(e.label)}</b><small>${dateShort(e.starts)} a ${dateShort(e.ends)} · ${esc(eventStatus(e))}</small></span></button>`).join('')}
function categoryHtml(){return CATEGORIES.map(t=>`<button type="button" class="gp-tier ${t.id===selectedCategoryId?'selected':''}" data-gp-category="${esc(t.id)}" aria-pressed="${String(t.id===selectedCategoryId)}"><strong>${esc(t.label)}</strong><small>${esc(t.description)}</small></button>`).join('')}
function currentRounds(event){return event.stageRounds?.[selectedStage]||(selectedStage==='qualifying'?event.qualifying:event.rounds)}
function currentRace(event=getEvent()){return currentRounds(event)?.[selectedRound-1]||null}
function hasSchedule(event){return Boolean(event.stageRounds||event.rounds)}
function roundsNote(event){
 if(event.stageRounds){return event.partialStages?.includes(selectedStage)?'Esta etapa possui provas ainda não confirmadas.':''}
 return '';
}
function stageButtonsHtml(event){
 if(event.stageRounds){return ['qualifying','opening','final'].map(id=>{
  const label={qualifying:'Classificatória',opening:'Abertura',final:'Final'}[id];
  const count=event.stageRounds[id]?.length||0;
  const incomplete=event.partialStages?.includes(id)?' · parcial':'';
  return `<button type="button" data-gp-stage="${id}" class="${selectedStage===id?'selected':''}">${label} (${esc(event.stages?.[id]||'data a definir')}) · ${count} prova(s)${incomplete}</button>`;
 }).join('')}
 return `<button type="button" data-gp-stage="qualifying" class="${selectedStage==='qualifying'?'selected':''}">Classificação ${event.stages?`(${esc(event.stages.qualifying)})`:''} · 4 provas</button><button type="button" data-gp-stage="final" class="${selectedStage==='final'?'selected':''}">Abertura ${event.stages?`(${esc(event.stages.opening)})`:''} / Final ${event.stages?`(${esc(event.stages.final)})`:''} · 8 provas</button>`;
}
function tracksHtml(event){if(!event.tracks.length)return '<p class="gp-empty">Pistas a definir pela Hutch. Nenhuma ordem foi presumida.</p>';const rounds=currentRounds(event);const entries=rounds||event.tracks.map(track=>({track,rain:null}));return entries.map((race,i)=>{const id=race.track,t=getTrack(id),selected=rounds?selectedRound===i+1:selectedTrackId===id;const temperatures=Number.isFinite(race.tempMin)&&Number.isFinite(race.tempMax)?` · ${race.tempMin}–${race.tempMax} °C`:'';return `<button type="button" data-gp-track="${esc(id)}" ${rounds?'data-gp-round="'+(i+1)+'"':''} class="gp-circuit ${selected?'selected':''}" aria-pressed="${String(selected)}"><span class="gp-circuit-index">${rounds?String(i+1).padStart(2,'0'):'◇'}</span><span class="gp-circuit-text"><strong>${esc(t?.name||id)}</strong><small>${esc(t?.country||'Circuito não encontrado')}${Number.isInteger(race.laps)?' · '+race.laps+' voltas':''}${race.rain===100?' · ☔ Chuva 100%':race.rain===0?' · ☀ Chuva 0%':''}${temperatures}</small></span><span aria-hidden="true">↗</span></button>`}).join('')}


function gpBoostStatsLabel(item){
 const attrs=window.GBRBoostCatalog?.attributes||{};
 return Object.entries(item?.stats||{}).map(([key,value])=>`${attrs[key]||key} +${value}`).join(' · ');
}
function gpBoostRecommendationsHtml(event,tier){
 const race=currentRace(event);
 const trackId=race?.track||selectedTrackId;
 const track=getTrack(trackId);
 const catalog=window.GBRBoostCatalog;
 if(!track||!catalog?.rank)return '<p class="gp-empty">Catálogo de boosts indisponível nesta prévia.</p>';
 const priority=window.GBRCore?.TRACK_SERIES?.[tier.series]?.[track.id];
 const car=priority?.[1]||track.car||'';
 const driver=priority?.[0]||track.driver||'';
 const weather=race?.rain===100?'wet':race?.rain===0?'dry':null;
 const ranked=catalog.rank({track,car,driver,weather});
 const picks=ranked.slice(0,3);
 if(!picks.length)return '<p class="gp-empty">Não há boosts nominais com atributos confirmados suficientes para este foco de pista.</p>';
 return `<ol class="gp-boost-recommendations">${picks.map(item=>{
  const source=catalog.get(item.id);
  const asset=typeof source?.localAsset==='string'&&/^assets\/boosts\/[a-z0-9-]+\.png$/.test(source.localAsset)?source.localAsset:'';
  const img=asset?`<img src="${esc(asset)}" alt="" loading="lazy" decoding="async">`:'<span class="gp-boost-placeholder" aria-hidden="true">⚡</span>';
  return `<li class="gp-boost-recommendation">${img}<span><b>${esc(item.name)}</b><small>${esc(gpBoostStatsLabel(source))}</small></span></li>`;
 }).join('')}</ol><p class="gp-note">Pista: ${esc(track.name||trackId)} · foco de carro: ${esc(car||'não confirmado')} · foco de piloto: ${esc(driver||'não confirmado')}${weather?` · condição: ${weather==='wet'?'chuva':'seco'}`:''}. Recomendação orientativa pelos atributos publicados, sem cadastro de quantidade ou disponibilidade. Não altera Qualificação nem garante vantagem.</p>`;
}
function gpBoostPanelHtml(event,tier){
 const race=currentRace(event),track=getTrack(race?.track||selectedTrackId);
 return `<div class="panel gp-panel"><div class="gp-panel-title"><div><span class="kicker">02B / REFORÇOS TÁTICOS</span><h3>Boosts recomendados para ${esc(track?.name||'a pista selecionada')}</h3></div><span>Por pista e categoria</span></div>${gpBoostRecommendationsHtml(event,tier)}<p class="gp-note">A seleção acompanha a pista/rodada e a categoria escolhidas acima. A quantidade que você possui não é considerada.</p></div>`;
}
function findFeaturedPart(name){
 const parts=(getGarage().parts||[]).filter(p=>norm(p.name)===norm(name));
 parts.sort((a,b)=>Number(Boolean(window.GBRCardArt?.getImage?.(b,'parts')))-Number(Boolean(window.GBRCardArt?.getImage?.(a,'parts')))||Number(Boolean(b.owned))-Number(Boolean(a.owned))||n(b.level)-n(a.level));
 return parts[0]||{name,category:'',rarity:''};
}
function findFeaturedDriver(spec){
 const drivers=(getGarage().drivers||[]).filter(driver=>driverMatchesSpec(driver,spec));
 const imageScore=driver=>Number(Boolean(window.GBRCardArt?.getImage?.(driver,'drivers')));
 const rarityScore=driver=>spec.rarity!=='any'&&driver.rarity===spec.rarity?20:spec.rarity==='any'&&driver.rarity==='Special'?12:0;
 const editionScore=driver=>spec.rarity==='any'&&norm(driver.editionLabel).includes('paddock')?8:0;
 drivers.sort((a,b)=>Number(Boolean(b.owned))-Number(Boolean(a.owned))||imageScore(b)-imageScore(a)||rarityScore(b)-rarityScore(a)||editionScore(b)-editionScore(a)||n(b.level)-n(a.level));
 return drivers[0]||{name:spec.label,rarity:spec.rarity==='any'?'Special':spec.rarity,editionLabel:spec.rarity==='any'?'Escolhas do Paddock':''};
}
function ownedFeatured(event,kind,name){
 const garage=getGarage();
 if(kind==='drivers'){
  const spec=event.driverBoosts.find(d=>d.label===name);
  return spec?garage.drivers.some(d=>d.owned&&driverMatchesSpec(d,spec)):false;
 }
 return garage.parts.some(p=>p.owned&&norm(p.name)===norm(name));
}
function featuredCardItem(event,entry){
 if(entry.kind==='drivers'){
  const spec=event.driverBoosts.find(v=>v.label===entry.label);
  return spec?findFeaturedDriver(spec):{name:entry.label,rarity:''};
 }
 return findFeaturedPart(entry.label);
}
function featuredHtml(event){
 if(!event.driverBoosts.length&&!event.partBoosts.length)return '<p class="gp-empty">Ativos em destaque ainda não anunciados; nenhum bônus presumido.</p>';
 const all=[...event.driverBoosts.map(spec=>({kind:'drivers',label:spec.label,detail:spec.variantDetail|| (spec.rarity==='Legendary'?'Lendário':'Todas as raridades e Escolhas do Paddock')})),...event.partBoosts.map(part=>({kind:'parts',label:part,detail:'Peça do carro'}))];
 return all.map(a=>{
  const card=featuredCardItem(event,a);
  // Convenção única para todos os GPs: se houver arte extraída do banner já incluído no pacote,
  // ela não depende de hotlink. O componente compartilha foto cadastrada > arte GP > URL externa.
  const slug=value=>norm(value).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  // Só referenciar miniatura embutida nos GPs cuja arte foi incorporada e auditada.
  // Não gerar requisições 404 para futuros eventos sem imagens locais.
  const localEvents=['us-grand-prix-2026','mexico-grand-prix-2026','sao-paulo-spectacular-2026','moustache-madness-2026'];
  const localArt=localEvents.includes(event.id)?`assets/events/featured/${slug(event.id)}-${slug(a.label)}.webp`:'';
  return `<article class="gp-featured-item"><div class="gp-featured-mark">${window.GBRCardArt?.thumb?.(card,a.kind,{eventArt:localArt})||''}</div><div><b>${esc(a.label)}</b><small>${esc(a.detail)}</small><em>${ownedFeatured(event,a.kind,a.label)?'✓ Cadastrado na garagem':'Não identificado na garagem'}</em></div><span class="gp-featured-percentage">${bonusInEffect(event)?'+10% ATIVO':'+10% PREVISTO'}</span></article>`;
 }).join('');
}
function sponsorHtml(event,tier){
 const task=event.sponsor?.[tier.id];
 if(!task)return '';
 return `<div class="panel gp-panel"><span class="kicker">04 / TAREFA DO PATROCINADOR</span><h3>${esc(task.title||`Requisitos da ${tier.label}`)}</h3>
  ${task.description?`<p>${esc(task.description)}</p>`:''}
  <p><b>Recurso destacado (use ao menos um indicado):</b> ${esc(task.requirement)}</p>
  ${task.stageRequirements?`<p><b>Classificatória:</b> ${esc(task.stageRequirements.qualifying)} → ${esc(task.qualifying)}</p><p><b>Abertura:</b> ${esc(task.stageRequirements.opening)} → ${esc(task.opening)}</p><p><b>Final:</b> ${esc(task.stageRequirements.final)} → ${esc(task.final)}</p>`:`<p><b>Classificatória:</b> ${esc(task.qualifying)} · <b>Abertura:</b> ${esc(task.opening)} · <b>Final:</b> ${esc(task.final)}</p>`}
  <p class="gp-note">${esc(event.sponsorNote||(event.id==='sao-paulo-spectacular-2026'?'O jogo pede usar ao menos um recurso destacado do nível exigido em cada etapa. Na categoria Campeão, Barrichello e Eco Cell+ aparecem juntos, mas a captura mostra bônus de +6 pontos; não presumimos +12 nem exigência simultânea dos dois. “Recurso” não significa automaticamente reforço consumível. Confira a conclusão no jogo.':'Requisitos por etapa conforme cadastro disponível. Confirme a elegibilidade e a recompensa diretamente no jogo.'))}</p></div>`;
}
function statRow(label,value){return `<div class="gp-stat"><small>${esc(label)}</small><strong>${Math.round(n(value)*10)/10}</strong></div>`}
function partHtml(p){return `<div class="gp-result-part"><span>${esc(p.category)}</span><div class="gbr-inline-art">${window.GBRCardArt?.thumb?.(p,'parts')||''}<strong>${esc(p.name)}</strong></div><small>Nv. ${n(p.level)} ${p.eventFeatured?'<b class="gp-part-boost">+10%</b>':''}</small></div>`}
function pilotHtml(p,index){return `<div class="gp-result-pilot"><span>PILOTO ${index+1}</span><div class="gbr-inline-art">${p?window.GBRCardArt?.thumb?.(p,'drivers')||'':''}<strong>${p?esc(p.name):'Sem piloto elegível'}</strong></div><small>${p?`${esc(p.rarity==='Legendary'?'Lendário':p.rarity==='Special'?'Especial':p.rarity==='Epic'?'Épico':p.rarity==='Rare'?'Raro':'Comum')}${p.editionLabel?' · '+esc(p.editionLabel):''} · Nv. ${n(p.level)}`:'Atualize a garagem'}</small>${p?.eventFeatured?'<span class="gp-featured-pill">+10% EVENTO</span>':''}${p?`<div class="gp-pilot-metrics"><span>Ultrap. <b>${(n(p.overtaking)).toFixed(p.eventFeatured?1:0)}</b></span><span>Defesa <b>${n(p.defending).toFixed(p.eventFeatured?1:0)}</b></span><span>Pneus <b>${n(p.tyreUse).toFixed(p.eventFeatured?1:0)}</b></span></div>`:''}</div>`}
function resultHtml(result){if(!result)return '<p class="gp-empty">Selecione um evento e pista com regras confirmadas. Não geramos setup com restrições desconhecidas.</p>';
 const carLabel=window.GBRCore?.TRACK_CAR?.[result.carFocus]||result.carFocus;
 const driverLabel=window.GBRCore?.TRACK_DRIVER?.[result.driverFocus]||result.driverFocus;
 return `<div class="gp-result-head"><div><span class="kicker">SETUP GP • EXCLUSIVO DA SUA GARAGEM ${result.round?'• CORRIDA '+result.round:''}</span><h3>${esc(result.track.name)}</h3><p>Carro: <b>${esc(carLabel)}</b> · Pilotos: <b>${esc(driverLabel)}</b> · Série máxima ${result.category.series}</p></div><span class="gp-result-bonus">${result.featuredCount} item(ns) com +10% ${result.bonusProjected?'(PREVISTO)':''}</span></div>
 <p class="gp-result-disclaimer">${result.round?'Prova '+result.round+' · ':''}${result.weather==='wet'?'☔ Chuva informada no calendário':result.weather==='dry'?'☀ Seco informado no calendário':'☁ Clima não confirmado — consulte o jogo'} · ${result.bonusInEffect?'Bônus temporário ativo':result.bonusProjected?'Bônus de +10% projetado para a corrida, ainda não ativo':'Evento encerrado; bônus não aplicado'}</p>
 <div class="gp-result-metrics">${statRow('Velocidade',result.totals.speed)}${statRow('Curvas',result.totals.corner)}${statRow('Potência',result.totals.power)}${statRow('Classificação',result.totals.qualifying)}</div>
 <h4>Carro · ${result.parts.length}/${result.required.length} peças</h4><div class="gp-result-parts">${result.parts.map(partHtml).join('')||'<p>Nenhuma peça cadastrada para essa categoria.</p>'}</div>
 <h4>Dupla de pilotos</h4><div class="gp-result-pilots">${result.drivers.map(pilotHtml).join('')}</div>
 ${strategyHtml(result)}
 ${!result.complete?'<p class="gp-warning">Setup incompleto: algumas peças ou pilotos da categoria escolhida não estão cadastrados na sua garagem. Nenhum item será inventado.</p>':''}
 <div class="gp-setup-actions"><button type="button" class="btn primary" id="gpExportPNG" ${result.parts.length?'':'disabled'}>↓ EXPORTAR SETUP PNG</button><button type="button" class="btn outline" id="gpGoGarage">ATUALIZAR GARAGEM →</button></div>
 <p class="gp-result-disclaimer">Comparação relativa para sua garagem, não garantia de vitória. Bônus ativos são aplicados somente no cálculo e nunca gravados na garagem. Clima e números de voltas devem ser confirmados no jogo.</p>`}
// Planejador exploratório: nenhum composto ou duração é sugerido sem evidência.
// O usuário informa os stints; validação é local e não altera garagem, histórico ou servidor.
function validateTyreStints(stints,laps){
 if(!Number.isInteger(laps)||laps<1)return {valid:false,reason:'Número de voltas não confirmado.',pits:[]};
 const active=stints.filter(s=>s.tyre||s.laps);
 if(!active.length)return {valid:false,reason:'Preencha os compostos e as voltas de cada stint.',pits:[]};
 if(active.some(s=>!['soft','medium','hard','wet'].includes(s.tyre)||!Number.isInteger(s.laps)||s.laps<1))return {valid:false,reason:'Cada stint precisa de um pneu e de um número inteiro de voltas maior que zero.',pits:[]};
 const total=active.reduce((n,s)=>n+s.laps,0);
 if(total!==laps)return {valid:false,reason:`A soma dos stints é ${total}; a corrida tem ${laps} voltas.`,pits:[]};
 let elapsed=0;const pits=[];for(let i=0;i<active.length-1;i++){elapsed+=active[i].laps;pits.push(elapsed)}
 return {valid:true,reason:`${active.length-1} parada(s), ${laps} voltas.`,pits};
}
function strategyHtml(r){
 const race=r.reportContext;
 const laps=Number.isInteger(race?.laps)?race.laps:null;
 const label=r.weather==='wet'?'Chuva indicada: confira pneus de chuva no jogo.':r.weather==='dry'?'Condição seca indicada: confira a durabilidade real dos pneus.':'Clima não informado: confirme as condições da corrida no jogo.';
 const options='<option value="">Selecionar pneu</option><option value="soft">Macio</option><option value="medium">Médio</option><option value="hard">Duro</option><option value="wet">Chuva</option>';
 const rows=[1,2].map(driver=>`<fieldset class="gp-tyre-driver" data-tyre-driver="${driver}"><legend>Piloto ${driver}</legend><div class="gp-tyre-stints">${[1,2,3].map(i=>`<label>Stint ${i}<select aria-label="Piloto ${driver}, pneu do stint ${i}" data-tyre-compound="${i}">${options}</select><input type="number" min="1" max="${laps||99}" step="1" inputmode="numeric" placeholder="Voltas" aria-label="Piloto ${driver}, voltas do stint ${i}" data-tyre-laps="${i}"></label>`).join('')}</div><output class="gp-tyre-feedback" data-tyre-result="${driver}">Aguardando planejamento.</output></fieldset>`).join('');
 return `<div class="gp-race-plan"><b>Planejamento de pneus — 2 pilotos</b><p>${esc(label)} Informe seus próprios stints e confira se a soma corresponde às voltas da corrida. Planeje paradas diferentes para evitar fila no box.</p><small>Ferramenta manual, sem recomendação automática de compostos ou garantia de durabilidade. Nenhuma informação é salva.</small>${laps?`<div class="gp-tyre-planner" data-tyre-total="${laps}"><p><b>${laps} voltas</b> · ${esc(r.track.name)} · ${esc(r.category.label)}</p>${rows}<output class="gp-tyre-warning" aria-live="polite">Preencha ambos os pilotos para verificar coincidências de parada.</output><output class="gp-boost-consumption" aria-live="polite">Consumo de reforços: aguardando plano validado dos dois pilotos.</output></div>`:'<p class="gp-warning">Voltas não confirmadas: o planejamento manual ficará disponível quando a corrida tiver um número de voltas verificado.</p>'}</div>`;
}
function bindTyrePlanner(){
 const root=$('gbrGpResult')?.querySelector('.gp-tyre-planner');if(!root)return;
 const total=Number(root.dataset.tyreTotal);
 const update=()=>{
  const plans=[1,2].map(driver=>{
   const field=root.querySelector(`[data-tyre-driver="${driver}"]`);
   const stints=[1,2,3].map(i=>({tyre:field.querySelector(`[data-tyre-compound="${i}"]`).value,laps:Number(field.querySelector(`[data-tyre-laps="${i}"]`).value)||0}));
   const result=validateTyreStints(stints,total);
   field.querySelector('[data-tyre-result]').textContent=result.valid?'✓ '+result.reason:result.reason;
   return result;
  });
  const warning=root.querySelector('.gp-tyre-warning');
  const consumption=root.querySelector('.gp-boost-consumption');
  if(!plans.every(p=>p.valid)){
   warning.textContent='Preencha ambos os pilotos para verificar coincidências de parada.';
   if(consumption)consumption.textContent='Consumo de reforços: aguardando plano validado dos dois pilotos.';
   return;
  }
  // Hutch: uma unidade por piloto na largada + uma após cada parada de seu próprio plano.
  const boosts=plans.map(p=>p.pits.length+1);
  if(consumption)consumption.textContent=`Reforços necessários: piloto 1 = ${boosts[0]}, piloto 2 = ${boosts[1]}; total = ${boosts[0]+boosts[1]} unidades (se equipados). Estoque não verificado.`;
  const same=plans[0].pits.filter(lap=>plans[1].pits.includes(lap));
  warning.textContent=same.length?`⚠ Paradas dos dois pilotos após a(s) volta(s) ${same.join(', ')}: risco de fila nos boxes.`:'✓ Nenhuma parada simultânea planejada.';
 };
 root.addEventListener('input',update);root.addEventListener('change',update);
}

function toPNGSnapshot(result){
 const {event,category,track,parts,totals,required,drivers}=result;
 return {title:'Evento '+event.label,track,series:category.series,carFocus:result.carFocus,driverFocus:result.driverFocus,pit:'none',eventName:event.label,eventBoost:result.bonusInEffect?event.eventBoost:'Previsto, ainda não ativo',setup:{chosen:parts,totals,required},drivers,boosts:[{type:result.bonusInEffect?'BÔNUS ATIVO':'BÔNUS PREVISTO',name:event.eventBoost},...(result.boosts||[]).slice(0,2)],date:new Date().toISOString(),complete:result.complete};
}
function refreshResult(){const event=getEvent(),category=getCategory();lastResult=computeSetup(event,category,selectedTrackId,getGarage(),{stage:selectedStage,round:selectedRound});$('gbrGpResult').innerHTML=resultHtml(lastResult);bindTyrePlanner();
 $('gpExportPNG')?.addEventListener('click',()=>{if(!lastResult)return;if(window.GBRBuildPlus?.openPNG)window.GBRBuildPlus.openPNG(toPNGSnapshot(lastResult));else alert('Abra o Montador para gerar imagens PNG.');});
 $('gpGoGarage')?.addEventListener('click',()=>{if(window.tab)window.tab('garage');else document.querySelector('#nav [data-tab="garage"]')?.click()});
}
function render(){const host=$('gbrEventHub');if(!host)return;
 const event=getEvent(),tier=getCategory();if(hasSchedule(event))selectedTrackId=currentRace(event)?.track||event.tracks[0];else if(!event.tracks.includes(selectedTrackId))selectedTrackId=event.tracks[0]||'';
 host.innerHTML=`
 <div class="gp-section-top"><div><span class="kicker">GBR RACING LAB • INTELIGÊNCIA DE CORRIDA</span><h2>Central de Eventos GP</h2><p>Prepare sua garagem para cada GP: regras, pistas e escolhas de cartas com bônus temporários.</p></div><span class="gp-hub-stamp">RACE STRATEGY / 2026</span></div>
 <div class="gp-provenance"><span class="gp-provenance-icon" aria-hidden="true">✓</span><div><strong>Eventos cadastrados a partir dos anúncios fornecidos</strong><small>As imagens do Android.zip são recursos gráficos; não comprovam pistas, bônus ou regras. Não há sincronização automática com o F1 Clash.</small></div></div>
 <div class="gp-event-options">${eventCardsHtml()}</div>
 <article class="gp-event-banner ${esc(event.color)}"><img src="${esc(event.image)}" alt="Cartaz promocional do ${esc(event.label)}"><div class="gp-event-banner-body"><span class="gp-event-status">${esc(eventStatus(event))}</span><h3>${esc(event.label)}</h3><p>${esc(event.description)}</p><span>${dateShort(event.starts)} — ${dateShort(event.ends)} de 2026</span></div></article>
 <div class="gp-event-overview"><div class="gp-event-overview-card"><span>BÔNUS DO EVENTO</span><strong>⚡ ${esc(event.eventBoost)}</strong></div><div class="gp-event-overview-card"><span>PILOTOS LENDÁRIOS</span><strong>${tagAllowed(event.allowLegendary)}</strong></div><div class="gp-event-overview-card"><span>EDIÇÕES ESPECIAIS</span><strong>${tagAllowed(event.allowSpecial)}</strong></div><div class="gp-event-overview-card"><span>ASSETS DESTACADOS</span><strong>${event.featuredPercent===10?'+10% nos atributos':'A confirmar'}</strong></div></div>
 <div class="panel gp-panel"><span class="kicker">01 / FILTRO DE DIFICULDADE</span><h3>Em qual categoria você corre?</h3><div class="gp-categories" role="group" aria-label="Categoria do evento">${categoryHtml()}</div><p class="gp-category-foot">Na categoria <b>${esc(tier.label)}</b> entram cartas das séries 1 a ${tier.series}. Pilotos proibidos no evento nunca entram na recomendação, mesmo se estiverem na garagem.</p></div>
 <div class="panel gp-panel"><div class="gp-panel-title"><div><span class="kicker">02 / CALENDÁRIO DO EVENTO</span><h3>${hasSchedule(event)?'Corridas por etapa':'Circuitos anunciados'}</h3></div><span>${hasSchedule(event)?currentRounds(event).length+' corrida(s) registrada(s) / '+event.tracks.length+' pistas únicas':event.tracks.length+' circuitos possíveis'}</span></div>
 ${hasSchedule(event)?`<div class="gp-stages" role="group" aria-label="Etapa da competição">${stageButtonsHtml(event)}</div>`:''}
 <div class="gp-circuit-grid" role="group" aria-label="Pistas possíveis neste evento">${tracksHtml(event)}</div><p class="gp-note">${hasSchedule(event)?`${esc(event.scheduleProvenance||'Ordem e condições registradas conforme a fonte informada; confira no jogo.')}${roundsNote(event)?' '+esc(roundsNote(event)):''}`:'Lista de opções, não uma ordem de provas. Chuva e voltas ainda não confirmadas.'}</p></div>
 ${gpBoostPanelHtml(event,tier)}
 <div class="panel gp-panel"><div class="gp-panel-title"><div><span class="kicker">03 / CARTAS EM DESTAQUE</span><h3>${event.featuredPercent===10?'Bônus de +10%':'Cartas ainda não anunciadas'}</h3></div><span>Base: dados da sua garagem</span></div><div class="gp-featured-grid">${featuredHtml(event)}</div><p class="gp-note">Na análise pré-GP, bônus futuros são projetados para as corridas; o bônus só fica efetivamente ativo durante o período do evento. A garagem original nunca é modificada. O reforço <strong>${esc(event.eventBoost)}</strong> é indicado separadamente; seu efeito exato não foi presumido. </p></div>
 <details class="gp-briefing"><summary><span>◈ Ficha técnica e confiabilidade dos dados</span><span class="gp-briefing-more">VER DETALHES</span></summary><div class="gp-briefing-body"><p><strong>Informações cadastradas:</strong> ${event.rulesConfirmed===false?'somente calendário e pistas divulgadas, quando disponíveis':'datas, pistas possíveis, cartas com +10%, reforço anunciado e regras de raridade'}, conforme os anúncios enviados.</p>${event.source?`<p><strong>Calendário:</strong> <a href="${esc(event.source)}" target="_blank" rel="noopener noreferrer">AllClash</a>, verificação em ${esc(event.verified)}. Oito corridas e sete circuitos únicos.</p>`:''}<p><strong>Informações ainda não confirmadas:</strong> ${hasSchedule(event)?'durabilidade de pneus, condições reais na largada e efeitos dos reforços':'ordem das corridas, número de voltas e clima'}, desgaste na sua garagem e efeito numérico do boost. O aplicativo não inventa esses valores.</p><p><strong>Origem:</strong> anúncios fornecidos pelo usuário. Pacotes gráficos Unity encontrados no Android.zip foram analisados separadamente; eles não demonstram que estas regras estejam codificadas neles.</p></div></details>
 ${sponsorHtml(event,tier)}
 <div class="panel gp-panel gp-result-panel"><span class="kicker">${event.sponsor?'05':'04'} / MONTADOR DO EVENTO</span><div id="gbrGpResult" aria-live="polite"></div></div>`;
 host.querySelectorAll('[data-gp-select]').forEach(b=>b.onclick=()=>{selectedEventId=b.dataset.gpSelect;selectedRound=1;selectedStage=getEvent().stageRounds?'qualifying':'final';selectedTrackId=currentRace(getEvent())?.track||getEvent().tracks[0];render()});
 host.querySelectorAll('[data-gp-category]').forEach(b=>b.onclick=()=>{selectedCategoryId=b.dataset.gpCategory;render()});
 host.querySelectorAll('[data-gp-stage]').forEach(b=>b.onclick=()=>{selectedStage=b.dataset.gpStage;selectedRound=1;selectedTrackId=currentRace(getEvent())?.track||getEvent().tracks[0];render()});
 host.querySelectorAll('[data-gp-track]').forEach(b=>b.onclick=()=>{selectedTrackId=b.dataset.gpTrack;if(b.dataset.gpRound)selectedRound=Number(b.dataset.gpRound);render();if(window.innerWidth<821)$('gbrGpResult')?.scrollIntoView({behavior:'smooth',block:'start'})});
 refreshResult();
 window.GBRPreGPUI?.mount?.();
}
function openEvents(){if(window.tab)window.tab('event');else document.querySelector('#nav [data-tab="event"]')?.click();changeView('events');if(window.innerWidth<=820)document.getElementById('mobileMoreClose')?.click()}
function makeNav(){const trackSection=$('event');if(!trackSection)return;
 const elements=[...trackSection.children];const library=document.createElement('div');library.id='gbrStandardTracks';
 elements.forEach(el=>library.appendChild(el));
 const switcher=document.createElement('div');switcher.className='gp-view-switch';switcher.setAttribute('role','tablist');switcher.setAttribute('aria-label','Pistas e eventos');
 switcher.innerHTML='<button type="button" data-gp-view="library" role="tab" aria-selected="true">◇ Biblioteca de pistas</button><button type="button" data-gp-view="events" role="tab" aria-selected="false">🏆 Eventos de GP</button>';
 const events=document.createElement('section');events.id='gbrEventHub';events.hidden=true;events.setAttribute('aria-label','Eventos de GP');
 trackSection.append(switcher,library,events);
 switcher.querySelectorAll('button').forEach(button=>button.onclick=()=>changeView(button.dataset.gpView));
 const navButton=document.querySelector('#nav button[data-tab="event"]');
 if(navButton){const sub=document.createElement('button');sub.type='button';sub.id='gbrNavEvents';sub.className='gp-sidebar-sub';sub.innerHTML='<span aria-hidden="true">↳</span> Eventos de GP';navButton.after(sub);sub.onclick=openEvents;navButton.addEventListener('click',()=>changeView('library'))}
 const more=$('mobileMorePanel');if(more){const btn=document.createElement('button');btn.type='button';btn.id='gbrMobileMoreEvents';btn.className='gp-more-entry';btn.innerHTML='<span aria-hidden="true">🏆</span><b>Eventos de GP</b><small>GPs, bônus e setup por classe</small><i>›</i>';more.querySelector('[data-go="builder"]')?.before(btn);btn.onclick=openEvents}
 document.querySelectorAll('#mobileNav button[data-tab="event"]').forEach(btn=>btn.addEventListener('click',()=>changeView('library')));
 // Não interferir em demais tabs, contas, Supabase ou manutenção das pistas.
 syncRoute();render();
 const originalSet=window.F1App.setGarage;
 window.F1App.setGarage=function(next){const out=originalSet.apply(this,arguments);if(section==='events')render();return out};
}
window.GBREvents={all:EVENTS,categories:CATEGORIES,computeSetup,bonusForPlanning,isFeaturedDriver,isFeaturedPart,isAllowedDriver,boostedDriver,boostedPart,boostRecommendationsHtml:gpBoostRecommendationsHtml,open:openEvents,showLibrary:()=>changeView('library'),getState:()=>({selectedEventId,selectedCategoryId,selectedTrackId,selectedStage,selectedRound}),select:(eventId,categoryId,trackId)=>{if(EVENTS.some(e=>e.id===eventId)&&eventId!==selectedEventId){selectedEventId=eventId;selectedStage=getEvent().stageRounds?'qualifying':'final';selectedRound=1;}else if(EVENTS.some(e=>e.id===eventId))selectedEventId=eventId;if(CATEGORIES.some(t=>t.id===categoryId))selectedCategoryId=categoryId;if(trackId&&getEvent().tracks.includes(trackId))selectedTrackId=trackId;else if(!getEvent().tracks.includes(selectedTrackId))selectedTrackId=getEvent().tracks[0];render()}};
makeNav();
})();
