/* GBR Racing Lab — Central de Eventos GP 2026 / versão de prévia.
   Nenhuma operação remota ou mutação dos dados das garagens.
   As datas, restrições, pistas e assets são transcritos do briefing do usuário.
   Não simula ordem de corridas, durabilidade de pneus ou clima não informado. */
(()=>{
'use strict';
const EVENTS=[
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
let selectedEventId=EVENTS[0].id,selectedCategoryId='campeao',selectedTrackId=EVENTS[0].tracks[0],selectedStage='final',selectedRound=1,section='library',lastResult=null;
const getEvent=()=>EVENTS.find(e=>e.id===selectedEventId)||EVENTS[0];
const getCategory=()=>CATEGORIES.find(t=>t.id===selectedCategoryId)||CATEGORIES[3];
const getTrack=id=>window.F1Tracks?.all?.find(t=>t.id===id)||null;
const getGarage=()=>window.F1App?.getGarage?.()||{parts:[],drivers:[],trackPlans:{}};
function bonusInEffect(event){return eventStatus(event)==='Em andamento'}
function isFeaturedPart(part,event){return event.partBoosts.some(name=>norm(name)===norm(part?.name))}
function driverMatchesSpec(driver,spec){
 if(!driver||!spec)return false;
 const names=norm(driver.name).split(' ').filter(Boolean);
 return names.includes(spec.key)&&(spec.rarity==='any'||driver.rarity===spec.rarity);
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
function computeSetup(event=getEvent(),category=getCategory(),trackId=selectedTrackId,garage=getGarage()){
 const track=getTrack(trackId);if(!track||!event.tracks.includes(track.id))return null;
 const preview=window.GBRPreGPUI?.eventFor?.(event.id)||null;
 if(preview&&preview.tracks?.includes(track.id))event={...event,
  allowLegendary:event.allowLegendary&&preview.allowLegendary!==false,
  allowSpecial:event.allowSpecial&&preview.allowSpecial!==false,
  featuredPercent:preview.featuredPercent??10,
  driverBoosts:preview.driverBoosts?.length?preview.driverBoosts:event.driverBoosts,
  partBoosts:preview.partBoosts?.length?preview.partBoosts:event.partBoosts};
 const selectedRoundData=currentRace(event);
 // A prova selecionada, e não apenas a lista de pistas possíveis, é a fonte de voltas e clima do GP.
 // Não atribua a outros GPs ou Duelos as informações desta edição do evento.
 const report=window.GBRPreGPUI?.raceFor?.(event.id,category.id,trackId,selectedStage,selectedRound)||
  (selectedRoundData?.track===trackId?{
   trackId,categoryId:category.id,stage:selectedStage,round:selectedRound,
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
 const weather=report?.weather||(selectedRoundData?.rain===100?'wet':selectedRoundData?.rain===0?'dry':garage.trackPlans?.[maxSeries+':'+track.id]?.weather||'dry');
 const boosts=window.GBRBoosts?.recommend?.({track,car,driver,weather})||[];
 const complete=chosen.length===required.length&&adjustedDrivers.every(Boolean);
 return {event,category,track,carFocus:car,driverFocus:driver,carWeights:weights,parts:chosen,totals,required,drivers:adjustedDrivers,featuredCount,boosts,complete,weather,bonusInEffect:bonusInEffect(event),bonusProjected:!bonusInEffect(event)&&bonusForPlanning(event),round:currentRace(event)?selectedRound:null,reportContext:report};
}
function eventStatus(event){
 const today=new Date();const todayText=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
 return todayText<event.starts?'Em breve':todayText>event.ends?'Encerrado':'Em andamento';
}
function dateShort(str){const [year,month,day]=str.split('-');return `${day}/${month}`;}
function tagAllowed(value){return value?'<span class="gp-allowed">✓ Permitidos</span>':'<span class="gp-blocked">✕ Não permitidos</span>'}
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
function currentRounds(event){return selectedStage==='qualifying'?event.qualifying:event.rounds}
function currentRace(event=getEvent()){return currentRounds(event)?.[selectedRound-1]||null}
function tracksHtml(event){const rounds=currentRounds(event);const entries=rounds||event.tracks.map(track=>({track,rain:null}));return entries.map((race,i)=>{const id=race.track,t=getTrack(id),selected=rounds?selectedRound===i+1:selectedTrackId===id;return `<button type="button" data-gp-track="${esc(id)}" ${rounds?'data-gp-round="'+(i+1)+'"':''} class="gp-circuit ${selected?'selected':''}" aria-pressed="${String(selected)}"><span class="gp-circuit-index">${String(i+1).padStart(2,'0')}</span><span class="gp-circuit-text"><strong>${esc(t?.name||id)}</strong><small>${esc(t?.country||'Circuito não encontrado')}${Number.isInteger(race.laps)?' · '+race.laps+' voltas':''}${race.rain===100?' · ☔ Chuva 100%':race.rain===0?' · ☀ Chuva 0%':''}</small></span><span aria-hidden="true">↗</span></button>`}).join('')}

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
 const all=[...event.driverBoosts.map(spec=>({kind:'drivers',label:spec.label,detail:spec.rarity==='Legendary'?'Lendário':'Todas as raridades e Escolhas do Paddock'})),...event.partBoosts.map(part=>({kind:'parts',label:part,detail:'Peça do carro'}))];
 return all.map(a=>{
  const card=featuredCardItem(event,a);
  // Convenção única para todos os GPs: se houver arte extraída do banner já incluído no pacote,
  // ela não depende de hotlink. O componente compartilha foto cadastrada > arte GP > URL externa.
  const slug=value=>norm(value).replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const localArt=`assets/events/featured/${slug(event.id)}-${slug(a.label)}.webp`;
  return `<article class="gp-featured-item"><div class="gp-featured-mark">${window.GBRCardArt?.thumb?.(card,a.kind,{eventArt:localArt})||''}</div><div><b>${esc(a.label)}</b><small>${esc(a.detail)}</small><em>${ownedFeatured(event,a.kind,a.label)?'✓ Cadastrado na garagem':'Não identificado na garagem'}</em></div><span class="gp-featured-percentage">${bonusInEffect(event)?'+10% ATIVO':'+10% PREVISTO'}</span></article>`;
 }).join('');
}
function statRow(label,value){return `<div class="gp-stat"><small>${esc(label)}</small><strong>${Math.round(n(value)*10)/10}</strong></div>`}
function partHtml(p){return `<div class="gp-result-part"><span>${esc(p.category)}</span><div class="gbr-inline-art">${window.GBRCardArt?.thumb?.(p,'parts')||''}<strong>${esc(p.name)}</strong></div><small>Nv. ${n(p.level)} ${p.eventFeatured?'<b class="gp-part-boost">+10%</b>':''}</small></div>`}
function pilotHtml(p,index){return `<div class="gp-result-pilot"><span>PILOTO ${index+1}</span><div class="gbr-inline-art">${p?window.GBRCardArt?.thumb?.(p,'drivers')||'':''}<strong>${p?esc(p.name):'Sem piloto elegível'}</strong></div><small>${p?`${esc(p.rarity==='Legendary'?'Lendário':p.rarity==='Special'?'Especial':p.rarity==='Epic'?'Épico':p.rarity==='Rare'?'Raro':'Comum')}${p.editionLabel?' · '+esc(p.editionLabel):''} · Nv. ${n(p.level)}`:'Atualize a garagem'}</small>${p?.eventFeatured?'<span class="gp-featured-pill">+10% EVENTO</span>':''}${p?`<div class="gp-pilot-metrics"><span>Ultrap. <b>${(n(p.overtaking)).toFixed(p.eventFeatured?1:0)}</b></span><span>Defesa <b>${n(p.defending).toFixed(p.eventFeatured?1:0)}</b></span><span>Pneus <b>${n(p.tyreUse).toFixed(p.eventFeatured?1:0)}</b></span></div>`:''}</div>`}
function resultHtml(result){if(!result)return '<p class="gp-empty">Selecione uma pista válida.</p>';
 const carLabel=window.GBRCore?.TRACK_CAR?.[result.carFocus]||result.carFocus;
 const driverLabel=window.GBRCore?.TRACK_DRIVER?.[result.driverFocus]||result.driverFocus;
 return `<div class="gp-result-head"><div><span class="kicker">SETUP GP • EXCLUSIVO DA SUA GARAGEM ${result.round?'• CORRIDA '+result.round:''}</span><h3>${esc(result.track.name)}</h3><p>Carro: <b>${esc(carLabel)}</b> · Pilotos: <b>${esc(driverLabel)}</b> · Série máxima ${result.category.series}</p></div><span class="gp-result-bonus">${result.featuredCount} item(ns) com +10% ${result.bonusProjected?'(PREVISTO)':''}</span></div>
 <p class="gp-result-disclaimer">${result.round?'Prova '+result.round+' · ':''}${result.weather==='wet'?'☔ 100% de chuva no calendário de referência':'☀ Calendário de referência ou condição manual — confirme no jogo'} · ${result.bonusInEffect?'Bônus temporário ativo':result.bonusProjected?'Bônus de +10% projetado para a corrida, ainda não ativo':'Evento encerrado; bônus não aplicado'}</p>
 <div class="gp-result-metrics">${statRow('Velocidade',result.totals.speed)}${statRow('Curvas',result.totals.corner)}${statRow('Potência',result.totals.power)}${statRow('Classificação',result.totals.qualifying)}</div>
 <h4>Carro · ${result.parts.length}/${result.required.length} peças</h4><div class="gp-result-parts">${result.parts.map(partHtml).join('')||'<p>Nenhuma peça cadastrada para essa categoria.</p>'}</div>
 <h4>Dupla de pilotos</h4><div class="gp-result-pilots">${result.drivers.map(pilotHtml).join('')}</div>
 ${strategyHtml(result)}
 ${!result.complete?'<p class="gp-warning">Setup incompleto: algumas peças ou pilotos da categoria escolhida não estão cadastrados na sua garagem. Nenhum item será inventado.</p>':''}
 <div class="gp-setup-actions"><button type="button" class="btn primary" id="gpExportPNG" ${result.parts.length?'':'disabled'}>↓ EXPORTAR SETUP PNG</button><button type="button" class="btn outline" id="gpGoGarage">ATUALIZAR GARAGEM →</button></div>
 <p class="gp-result-disclaimer">Comparação relativa para sua garagem, não garantia de vitória. Bônus ativos são aplicados somente no cálculo e nunca gravados na garagem. Clima e números de voltas devem ser confirmados no jogo.</p>`}
function strategyHtml(r){
  // Sem estratégia numérica ativa para o GP dos Estados Unidos: preserve a orientação geral.
 return `<div class="gp-race-plan"><b>Planejamento conjunto dos 2 pilotos</b><p>${r.weather==='wet'?'Priorize pneus de chuva e confirme sua durabilidade.':'Compare macios, médios e duros conforme o desgaste real da pista.'} Programe as paradas em voltas diferentes sempre que viável para evitar fila nos boxes.</p><small>Orientação geral: ainda sem tempos, voltas ou compostos confirmados para esta prova e categoria. Nenhuma estratégia numérica foi inventada.</small></div>`;}
function toPNGSnapshot(result){
 const {event,category,track,parts,totals,required,drivers}=result;
 return {title:'Evento '+event.label,track,series:category.series,carFocus:result.carFocus,driverFocus:result.driverFocus,pit:'none',eventName:event.label,eventBoost:result.bonusInEffect?event.eventBoost:'Previsto, ainda não ativo',setup:{chosen:parts,totals,required},drivers,boosts:[{type:result.bonusInEffect?'BÔNUS ATIVO':'BÔNUS PREVISTO',name:event.eventBoost},...(result.boosts||[]).slice(0,2)],date:new Date().toISOString(),complete:result.complete};
}
function refreshResult(){const event=getEvent(),category=getCategory();lastResult=computeSetup(event,category,selectedTrackId);$('gbrGpResult').innerHTML=resultHtml(lastResult);
 $('gpExportPNG')?.addEventListener('click',()=>{if(!lastResult)return;if(window.GBRBuildPlus?.openPNG)window.GBRBuildPlus.openPNG(toPNGSnapshot(lastResult));else alert('Abra o Montador para gerar imagens PNG.');});
 $('gpGoGarage')?.addEventListener('click',()=>{if(window.tab)window.tab('garage');else document.querySelector('#nav [data-tab="garage"]')?.click()});
}
function render(){const host=$('gbrEventHub');if(!host)return;
 const event=getEvent(),tier=getCategory();if(event.rounds)selectedTrackId=currentRace(event)?.track||event.tracks[0];else if(!event.tracks.includes(selectedTrackId))selectedTrackId=event.tracks[0];
 host.innerHTML=`
 <div class="gp-section-top"><div><span class="kicker">GBR RACING LAB • INTELIGÊNCIA DE CORRIDA</span><h2>Central de Eventos GP</h2><p>Prepare sua garagem para cada GP: regras, pistas e escolhas de cartas com bônus temporários.</p></div><span class="gp-hub-stamp">RACE STRATEGY / 2026</span></div>
 <div class="gp-provenance"><span class="gp-provenance-icon" aria-hidden="true">✓</span><div><strong>Eventos cadastrados a partir dos anúncios fornecidos</strong><small>As imagens do Android.zip são recursos gráficos; não comprovam pistas, bônus ou regras. Não há sincronização automática com o F1 Clash.</small></div></div>
 <div class="gp-event-options">${eventCardsHtml()}</div>
 <article class="gp-event-banner ${esc(event.color)}"><img src="${esc(event.image)}" alt="Cartaz promocional do ${esc(event.label)}"><div class="gp-event-banner-body"><span class="gp-event-status">${esc(eventStatus(event))}</span><h3>${esc(event.label)}</h3><p>${esc(event.description)}</p><span>${dateShort(event.starts)} — ${dateShort(event.ends)} de 2026</span></div></article>
 <div class="gp-event-overview"><div class="gp-event-overview-card"><span>BÔNUS DO EVENTO</span><strong>⚡ ${esc(event.eventBoost)}</strong></div><div class="gp-event-overview-card"><span>PILOTOS LENDÁRIOS</span><strong>${tagAllowed(event.allowLegendary)}</strong></div><div class="gp-event-overview-card"><span>EDIÇÕES ESPECIAIS</span><strong>${tagAllowed(event.allowSpecial)}</strong></div><div class="gp-event-overview-card"><span>ASSETS DESTACADOS</span><strong>+10% nos atributos</strong></div></div>
 <div class="panel gp-panel"><span class="kicker">01 / FILTRO DE DIFICULDADE</span><h3>Em qual categoria você corre?</h3><div class="gp-categories" role="group" aria-label="Categoria do evento">${categoryHtml()}</div><p class="gp-category-foot">Na categoria <b>${esc(tier.label)}</b> entram cartas das séries 1 a ${tier.series}. Pilotos proibidos no evento nunca entram na recomendação, mesmo se estiverem na garagem.</p></div>
 <div class="panel gp-panel"><div class="gp-panel-title"><div><span class="kicker">02 / CALENDÁRIO DO EVENTO</span><h3>${event.rounds?'Corridas por etapa':'Circuitos anunciados'}</h3></div><span>${event.rounds?currentRounds(event).length+' corridas / '+event.tracks.length+' pistas únicas':event.tracks.length+' circuitos possíveis'}</span></div>
 ${event.rounds?`<div class="gp-stages" role="group" aria-label="Etapa da competição"><button type="button" data-gp-stage="qualifying" class="${selectedStage==='qualifying'?'selected':''}">Classificação · 4 provas</button><button type="button" data-gp-stage="final" class="${selectedStage==='final'?'selected':''}">Abertura / Final · 8 provas</button></div>`:''}
 <div class="gp-circuit-grid" role="group" aria-label="Pistas possíveis neste evento">${tracksHtml(event)}</div><p class="gp-note">${event.rounds?'Calendário externo consultado em 20/10/2026: voltas e probabilidade de chuva. Confira alterações diretamente no F1 Clash. Classificação e abertura/final têm ordens diferentes; GP e Duelos não compartilham clima/voltas.':'Somente os circuitos possíveis foram fornecidos para este evento; ordem, chuva e voltas ainda não confirmadas.'}</p></div>
 <div class="panel gp-panel"><div class="gp-panel-title"><div><span class="kicker">03 / CARTAS EM DESTAQUE</span><h3>Bônus de +10%</h3></div><span>Base: dados da sua garagem</span></div><div class="gp-featured-grid">${featuredHtml(event)}</div><p class="gp-note">Na análise pré-GP, bônus futuros são projetados para as corridas; o bônus só fica efetivamente ativo durante o período do evento. A garagem original nunca é modificada. O bônus <strong>${esc(event.eventBoost)}</strong> é indicado separadamente; seu efeito exato não foi presumido.</p></div>
 <details class="gp-briefing"><summary><span>◈ Ficha técnica e confiabilidade dos dados</span><span class="gp-briefing-more">VER DETALHES</span></summary><div class="gp-briefing-body"><p><strong>Informações cadastradas:</strong> datas, pistas possíveis, cartas com +10%, boost anunciado e regras de raridade, conforme os anúncios enviados.</p>${event.source?`<p><strong>Calendário:</strong> <a href="${esc(event.source)}" target="_blank" rel="noopener noreferrer">AllClash</a>, verificação em ${esc(event.verified)}. Oito corridas e sete circuitos únicos.</p>`:''}<p><strong>Informações ainda não confirmadas:</strong> ${event.rounds?'durabilidade de pneus de cada piloto, clima efetivo durante a corrida e efeitos dos Boosts':'ordem das corridas, número de voltas e clima'}, desgaste na sua garagem e efeito numérico do boost. O aplicativo não inventa esses valores.</p><p><strong>Origem:</strong> anúncios fornecidos pelo usuário. Pacotes gráficos Unity encontrados no Android.zip foram analisados separadamente; eles não demonstram que estas regras estejam codificadas neles.</p></div></details>
 <div class="panel gp-panel gp-result-panel"><span class="kicker">04 / MONTADOR DO EVENTO</span><div id="gbrGpResult" aria-live="polite"></div></div>`;
 host.querySelectorAll('[data-gp-select]').forEach(b=>b.onclick=()=>{selectedEventId=b.dataset.gpSelect;selectedRound=1;selectedStage='final';selectedTrackId=currentRace(getEvent())?.track||getEvent().tracks[0];render()});
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
window.GBREvents={all:EVENTS,categories:CATEGORIES,computeSetup,bonusForPlanning,isFeaturedDriver,isFeaturedPart,isAllowedDriver,boostedDriver,boostedPart,open:openEvents,showLibrary:()=>changeView('library'),getState:()=>({selectedEventId,selectedCategoryId,selectedTrackId,selectedStage,selectedRound}),select:(eventId,categoryId,trackId)=>{if(EVENTS.some(e=>e.id===eventId))selectedEventId=eventId;if(CATEGORIES.some(t=>t.id===categoryId))selectedCategoryId=categoryId;if(trackId&&getEvent().tracks.includes(trackId))selectedTrackId=trackId;else if(!getEvent().tracks.includes(selectedTrackId))selectedTrackId=getEvent().tracks[0];render()}};
makeNav();
})();
