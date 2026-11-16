/* GBR Racing Lab 5.5.4 — Inteligência de duelos 2026, modo de leitura; nenhuma alteração no Supabase ou nas garagens. */
(()=>{
'use strict';
const LEGACY_SERIES_ROTATIONS={
  10:{
    guide:'https://www.allclash.com/BEAT-SERIES-10-IN-F1-CLASH-BEST-CAR-SETUP-DRIVERS-PIT-STOP-STRATEGY-REC-BOOSTERS/',
    updated:'2026-09-23',
    checked:'16/10/2026',
    label:'Duelos — Série 10',
    notice:'A página do AllClash indicava nova rotação prevista para 08/10/2026. Use esta lista como referência validada da última atualização disponível e confirme no jogo caso a rotação já tenha mudado.',
    rotation:[{id:'madrid',name:'Madri'},{id:'zandvoort',name:'Zandvoort'},{id:'austin',name:'Austin - COTA'},{id:'suzuka',name:'Suzuka'}]
  },
  11:{
    guide:'https://www.allclash.com/beat-series-11-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
    updated:'2026-10-07',
    checked:'16/10/2026',
    label:'Duelos — Série 11',
    notice:'Rotação comunitária consultada no AllClash e ainda dentro da janela quinzenal de revisão mencionada pela fonte.',
    rotation:[{id:'shanghai',name:'Shanghai'},{id:'monza',name:'Monza'},{id:'monaco',name:'Monaco'},{id:'zandvoort',name:'Zandvoort'}]
  },
  12:{
    guide:'https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
    updated:'2026-10-07',
    checked:'16/10/2026',
    label:'Duelos — Série 12',
    notice:'Rotação comunitária consultada no AllClash e ainda dentro da janela quinzenal de revisão mencionada pela fonte.',
    rotation:[{id:'monza',name:'Monza'},{id:'abu-dhabi',name:'Abu Dhabi'},{id:'singapore',name:'Singapura'},{id:'jeddah',name:'Jeddah'}]
  }
};
const PREVIOUS_SERIES_ROTATIONS={
  10:{
    guide:'https://www.allclash.com/BEAT-SERIES-10-IN-F1-CLASH-BEST-CAR-SETUP-DRIVERS-PIT-STOP-STRATEGY-REC-BOOSTERS/',
    updated:'2026-10-19',checked:'19/10/2026',label:'Duelos — Série 10',
    notice:'Rotação 21/10–03/11/2026 fornecida pelo responsável (tabela). Prioridades, clima e voltas são dados da tabela, não uma estratégia de pneus.',
    rotation:[
      {id:'shanghai',name:'Shanghai',driver:'defending',car:'power',weather:'mixed',laps:7},
      {id:'sakhir',name:'Sakhir',driver:'tyreUse',car:'power',weather:'dry',laps:8},
      {id:'baku',name:'Baku',driver:'tyreUse',car:'power',weather:'mixed',laps:7},
      {id:'mexico',name:'Cidade do México',driver:'tyreUse',car:'power',weather:'mixed',laps:9}
    ]
  },
  11:{
    guide:'https://www.allclash.com/beat-series-11-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
    updated:'2026-10-19',checked:'19/10/2026',label:'Duelos — Série 11',
    notice:'Rotação 21/10–03/11/2026 fornecida pelo responsável (tabela). Prioridades, clima e voltas são dados da tabela, não uma estratégia de pneus.',
    rotation:[
      {id:'baku',name:'Baku',driver:'tyreUse',car:'power',weather:'mixed',laps:7},
      {id:'mexico',name:'Cidade do México',driver:'tyreUse',car:'power',weather:'mixed',laps:9},
      {id:'barcelona',name:'Barcelona',driver:'tyreUse',car:'speed',weather:'dry',laps:10},
      {id:'silverstone',name:'Silverstone',driver:'tyreUse',car:'speed',weather:'mixed',laps:7}
    ]
  },
  12:{
    guide:'https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
    updated:'2026-10-19',checked:'19/10/2026',label:'Duelos — Série 12',
    notice:'Rotação 21/10–03/11/2026 fornecida pelo responsável (tabela). Prioridades, clima e voltas são dados da tabela, não uma estratégia de pneus.',
    rotation:[
      {id:'miami',name:'Miami',driver:'overtaking',car:'speed',weather:'mixed',laps:6},
      {id:'las-vegas',name:'Las Vegas',driver:'overtaking',car:'speed',weather:'dry',laps:6},
      {id:'spa',name:'Spa-Francorchamps',driver:'overtaking',car:'power',weather:'dry',laps:6},
      {id:'hungaroring',name:'Hungaroring',driver:'overtaking',car:'corner',weather:'mixed',laps:8}
    ]
  }
};
// Gravação do jogo enviada em 04/11/2026: confirma circuito, voltas e focos.
// O vídeo NÃO exibe clima: usar null, nunca converter para seco ou misto por inferência.
// Série 9 troca a cada ~7 dias; as Séries 10–12 mostram ~14 dias no vídeo.
const SERIES_ROTATIONS={
 9:{
  updated:'2026-11-04',checked:'04/11/2026',label:'Duelos — Série 9',
  notice:'Vídeo do jogo de 04/11/2026. Janela de 7 dias inferida do contador: verificar novamente em 11/11. Clima não informado no vídeo.',
  rotation:[
   {id:'barcelona',name:'Barcelona',driver:'tyreUse',car:'speed',weather:null,laps:7},
   {id:'monza',name:'Monza',driver:'defending',car:'speed',weather:null,laps:4},
   {id:'jeddah',name:'Jeddah',driver:'defending',car:'speed',weather:null,laps:6},
   {id:'silverstone',name:'Silverstone',driver:'tyreUse',car:'speed',weather:null,laps:7}
  ]
 },
 10:{
  guide:'https://www.allclash.com/BEAT-SERIES-10-IN-F1-CLASH-BEST-CAR-SETUP-DRIVERS-PIT-STOP-STRATEGY-REC-BOOSTERS/',
  updated:'2026-11-04',checked:'04/11/2026',label:'Duelos — Série 10',
  notice:'Rotação observada no vídeo de 04/11/2026. Janela de 14 dias inferida do contador; clima não informado no vídeo.',
  rotation:[
   {id:'baku',name:'Baku',driver:'tyreUse',car:'power',weather:null,laps:7},
   {id:'mexico',name:'Cidade do México',driver:'tyreUse',car:'power',weather:null,laps:9},
   {id:'barcelona',name:'Barcelona',driver:'tyreUse',car:'speed',weather:null,laps:10},
   {id:'silverstone',name:'Silverstone',driver:'tyreUse',car:'speed',weather:null,laps:7}
  ]
 },
 11:{
  guide:'https://www.allclash.com/beat-series-11-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
  updated:'2026-11-04',checked:'04/11/2026',label:'Duelos — Série 11',
  notice:'Rotação observada no vídeo de 04/11/2026. Janela de 14 dias inferida do contador; clima não informado no vídeo.',
  rotation:[
   {id:'miami',name:'Miami',driver:'overtaking',car:'speed',weather:null,laps:6},
   {id:'las-vegas',name:'Las Vegas',driver:'overtaking',car:'speed',weather:null,laps:6},
   {id:'spa',name:'Spa-Francorchamps',driver:'overtaking',car:'power',weather:null,laps:6},
   {id:'hungaroring',name:'Hungaroring',driver:'overtaking',car:'corner',weather:null,laps:8}
  ]
 },
 12:{
  guide:'https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
  updated:'2026-11-04',checked:'04/11/2026',label:'Duelos — Série 12',
  notice:'Rotação observada no vídeo de 04/11/2026. Janela de 14 dias inferida do contador; clima não informado no vídeo.',
  rotation:[
   {id:'montreal',name:'Montreal',driver:'raceStart',car:'power',weather:null,laps:8},
   {id:'melbourne',name:'Melbourne',driver:'raceStart',car:'corner',weather:null,laps:9},
   {id:'spielberg',name:'Spielberg',driver:'raceStart',car:'corner',weather:null,laps:7},
   {id:'singapore',name:'Singapura',driver:'raceStart',car:'speed',weather:null,laps:6}
  ]
 }
};
const IDEAL=[
 {category:'Asa dianteira',ideal:'Loose Fit',alternative:'Flashpoint'},
 {category:'Freios',ideal:'Pressure Point',alternative:'Stabilix'},
 {category:'Suspensão',ideal:'Bounce',alternative:'Curver 3-0'},
 {category:'Asa traseira',ideal:'Downforce',alternative:'Dominus'},
 {category:'Câmbio',ideal:'Lockdown',alternative:'Powerbox'},
 {category:'Motor',ideal:'Velocity',alternative:'Overdrive'},
 {category:'Bateria',ideal:'Spare Pack',alternative:'Energy Reserve'}
];
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function same(a,b){return norm(a)===norm(b)}
function garage(){return window.F1App?.getGarage?.()||{parts:[],drivers:[]}}
function formatDate(iso){const [y,m,d]=String(iso||'').split('-');return d&&m&&y?`${d}/${m}/${y}`:String(iso||'')}
const LEGACY_ROTATION_START='2026-10-07';
const LEGACY_ROTATION_END='2026-10-20';
const PREVIOUS_ROTATION_START='2026-10-21';
const PREVIOUS_ROTATION_END='2026-11-03';
const ROTATION_START='2026-11-04';
const ROTATION_END='2026-11-17';
// Fim inferido da contagem regressiva no jogo; não reusar a janela de S10–S12 para S9.
const SERIES_WINDOW_END=Object.freeze({9:'2026-11-10',10:ROTATION_END,11:ROTATION_END,12:ROTATION_END});
const STAT_DRIVER=Object.freeze({defending:'Defesa',raceStart:'Largada',tyreUse:'Gerenciamento de pneus',overtaking:'Ultrapassagem'});
const STAT_CAR=Object.freeze({power:'Unidade de potência',speed:'Velocidade',corner:'Curvas'});
const STAT_WEATHER=Object.freeze({mixed:'Misto',dry:'Seco'});
function localDay(now=new Date()){
 return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
// Nenhuma pista fora da sua janela própria entra nas recomendações do Montador/Engenheiro.
function rotationAt(today=localDay()){
 if(today>=ROTATION_START&&today<=ROTATION_END){
  const rotations=Object.fromEntries(Object.entries(SERIES_ROTATIONS).filter(([series])=>today<=SERIES_WINDOW_END[series]));
  return {rotations,start:ROTATION_START,end:ROTATION_END,source:'Vídeo do F1 Clash gravado em 04/11/2026; pista, voltas e atributos visíveis',phase:'vigente'};
 }
 if(today>=PREVIOUS_ROTATION_START&&today<=PREVIOUS_ROTATION_END)
  return {rotations:PREVIOUS_SERIES_ROTATIONS,start:PREVIOUS_ROTATION_START,end:PREVIOUS_ROTATION_END,source:'Tabela de rotação 21/10–03/11/2026 fornecida pelo responsável',phase:'vigente'};
 // Dados 07–20/10 não trazem todos os metadados necessários ao engenheiro de Duelos.
 return null;
}
function rotationPeriodStatus(today=localDay(),series=12){
 const chosen=Number(series),active=rotationAt(today);
 if(chosen===9&&today<ROTATION_START){
  return {status:'Série 9: rotação anterior não verificada',upcoming:'Prévia: 04/11/2026 a 10/11/2026 (vídeo fornecido)',unverified:true};
 }
 if(chosen===9&&today> SERIES_WINDOW_END[9]&&today<=ROTATION_END){
  return {status:'Vigência encerrada: 04/11/2026 a 10/11/2026 · Série 9',upcoming:'A Série 9 rotaciona antes de S10–S12. Consulte a nova lista no jogo; não usar estes circuitos como vigentes.',expired:true};
 }
 if(active&&active.rotations[chosen]){
  const periodEnd=active.start===ROTATION_START?SERIES_WINDOW_END[chosen]:active.end;
  const current=`${formatDate(active.start)} a ${formatDate(periodEnd)}`;
  const upcoming=active.end===PREVIOUS_ROTATION_END?
   `Próxima rotação prevista: ${formatDate(ROTATION_START)} a ${formatDate(SERIES_WINDOW_END[chosen]||ROTATION_END)} (vídeo do jogo)`:
   'Pistas/voltas/atributos observados no jogo. Clima não confirmado; verifique no duelo.';
  return {status:`Rotação vigente: ${current}`,upcoming,period:{...active,end:periodEnd}};
 }
 if(today<PREVIOUS_ROTATION_START){
  const dates=`${formatDate(LEGACY_ROTATION_START)} a ${formatDate(LEGACY_ROTATION_END)}`;
  return {status:today<LEGACY_ROTATION_START?`Última rotação cadastrada: ${dates}`:`Rotação vigente: ${dates}`,upcoming:`Próxima rotação arquivada: ${formatDate(PREVIOUS_ROTATION_START)} a ${formatDate(PREVIOUS_ROTATION_END)}`,legacy:true};
 }
 const end=SERIES_WINDOW_END[chosen]||ROTATION_END;
 return {status:`Vigência encerrada: ${formatDate(ROTATION_START)} a ${formatDate(end)} · aguardando nova rotação`,upcoming:'Não utilizar as prioridades desta série como rotação vigente após o encerramento.',expired:true};
}
function rotationEntry(series,trackId,asOf=localDay()){
 return rotationAt(asOf)?.rotations[Number(series)]?.rotation.find(row=>row.id===trackId)||null;
}
function duelContext(series,trackId,asOf=localDay()){
 const active=rotationAt(asOf),chosen=Number(series),row=active?.rotations[chosen]?.rotation.find(r=>r.id===trackId);
 if(!row)return null;
 const periodEnd=active.start===ROTATION_START?SERIES_WINDOW_END[chosen]:active.end;
 return {...row,series:chosen,mode:'duel',phase:active.phase,periodStart:active.start,periodEnd,source:active.source};
}
function priorityFor(series,trackId,asOf=localDay()){
 const row=rotationEntry(series,trackId,asOf);
 return row?[row.driver,row.car]:null;
}
function listNewSeries(asOf=localDay()){
 const active=rotationAt(asOf);
 if(!active)return [];
 return Object.entries(active.rotations).flatMap(([series,v])=>v.rotation.map(r=>({series:Number(series),trackId:r.id,laps:r.laps,weather:r.weather,driver:r.driver,car:r.car,source:active.source})));
}
// O seletor mantém todas as pistas da biblioteca, mas prioriza as quatro da
// rotação confirmada da série escolhida. Não classifica como vigente uma S9 vencida.
let previousDuelSeries=null;
let previousDuelDay=null;
function syncDuelTrackOptions(series){
 const select=$('duelTrack'),tracks=window.F1Tracks?.all;
 if(!select||!Array.isArray(tracks)||!tracks.length)return;
 const today=localDay();
 if(previousDuelSeries===series&&previousDuelDay===today)return;
 const changed=previousDuelSeries!==null&&previousDuelSeries!==series;
 const chosen=select.value;
 const rotation=rotationAt(today)?.rotations[series]?.rotation||[];
 const inRotation=new Set(rotation.map(row=>row.id));
 const options=rows=>rows.map(row=>`<option value="${esc(row.id)}">${esc(row.name)}</option>`).join('');
 const current=rotation.length?`<optgroup label="Rotação vigente · Série ${series}">${options(rotation)}</optgroup>`:'';
 const other=tracks.filter(row=>!inRotation.has(row.id));
 select.innerHTML='<option value="">Sem pista específica</option>'+current+`<optgroup label="Outras pistas da biblioteca">${options(other)}</optgroup>`;
 select.value=!changed&&tracks.some(row=>row.id===chosen)?chosen:'';
 previousDuelSeries=series;previousDuelDay=today;
}
function rotationRowsHTML(info,series,preview=false){
 if(!info)return '';
 return info.rotation.map((r,i)=>{
  const details=r.laps?`<small class="gbr-intel-track-stats">${esc(STAT_DRIVER[r.driver])} · ${esc(STAT_CAR[r.car])} · ${esc(STAT_WEATHER[r.weather]||'Clima não informado')} · ${r.laps} voltas</small>`:'';
  const body=`<span class="gbr-intel-track-body"><b>${i+1}. ${esc(r.name)}</b>${details}</span>`;
  return preview?`<div class="gbr-intel-track-link" aria-label="Rotação não vigente: ${esc(r.name)}">${body}<small>Não vigente</small></div>`:
   `<button type="button" class="gbr-intel-track-link" data-gbr-duel-track="${esc(r.id)}" data-gbr-duel-series="${series}" aria-label="Abrir ${esc(r.name)} na Biblioteca de Pistas, Série ${series}" title="Abrir análise de ${esc(r.name)}">${body}<span class="gbr-intel-track-arrow" aria-hidden="true">↗</span></button>`;
 }).join('');
}
function rotationHTML(series,asOf=localDay()){
 const period=rotationPeriodStatus(asOf,series);
 const info=period.period?.rotations[series]||(period.legacy?LEGACY_SERIES_ROTATIONS[series]:SERIES_ROTATIONS[series]);
 if(!info)return '';
 const summary=period.unverified?'':rotationRowsHTML(info,series,Boolean(period.expired));
 const upcoming=asOf>=PREVIOUS_ROTATION_START&&asOf<ROTATION_START?
  `<div class="gbr-intel-status"><strong>Prévia da próxima rotação · ${formatDate(ROTATION_START)} a ${formatDate(SERIES_WINDOW_END[series]||ROTATION_END)}</strong><small>Disponível para planejamento, NÃO vigente até 04/11.</small></div><div class="gbr-intel-rotation">${rotationRowsHTML(SERIES_ROTATIONS[series],series,true)}</div>`:'';
 return `<p class="gbr-intel-series-heading"><strong>Série ${series} · ${info.rotation.length} pistas</strong></p><div class="gbr-intel-status"><strong>${esc(period.status)}</strong><small>${esc(period.upcoming)}</small></div><div class="gbr-intel-rotation">${summary}</div><p class="muted mini">Esta é a lista da ${esc(info.label)}, não a lista completa de pistas nem o calendário dos GPs. ${esc(info.notice)} As voltas são referências observadas, não estratégia de pit-stop.</p>${upcoming}`;
}
function bestOwned(set,parts){return parts.find(p=>p.owned&&Number(p.level)>0&&set.some(n=>same(p.name,n)))||null}
function comparisonHTML(){const parts=garage().parts||[];let ideal=0,alternative=0;
 const rows=IDEAL.map((rule)=>{
   const a=bestOwned([rule.ideal],parts),b=bestOwned([rule.alternative],parts),pick=a||b;
   if(a)ideal++;else if(b)alternative++;
   return `<tr><td>${esc(rule.category)}</td><td>${esc(rule.ideal)}<small>ou ${esc(rule.alternative)}</small></td><td>${pick?`${window.GBRCardArt?.thumb?.(pick,'parts')||''} ${esc(pick.name)} · Nv. ${Number(pick.level)||0}`:'Não identificada'}</td><td>${a?'<b>Principal</b>':b?'Alternativa':'Sem referência'}</td></tr>`;
 }).join('');
 return `<p class="muted mini">Compare a referência comunitária da Série 12 com os <b>seus níveis cadastrados</b>. ${ideal} principais, ${alternative} alternativas e ${7-ideal-alternative} categorias sem as peças de referência. A comparação não decide upgrades nem substitui o cálculo por atributos.</p><div class="gbr-intel-table-wrap"><table class="gbr-intel-table"><thead><tr><th>Tipo</th><th>Referência AllClash</th><th>Sua garagem</th><th>Disponibilidade</th></tr></thead><tbody>${rows}</tbody></table></div><p class="muted mini">Se uma alternativa estiver mais de dois níveis acima da peça principal, ela pode ser melhor. O Montador continua calculando pelos atributos reais da sua garagem, sem atribuir automaticamente as cartas ideais.</p>`;
}
function mount(){const duel=$('duel'),garageEl=$('garage');if(!duel||!garageEl)return;
 if(!$('gbrDuelRotation')){
  const section=document.createElement('section');section.id='gbrDuelRotation';section.className='panel gbr-intel-card';section.innerHTML='<div class="kicker">ROTATIVIDADE / 2026</div><h2>Pistas dos duelos por série</h2><p class="muted mini">Rotações verificadas: Séries 9, 10, 11 e 12. A Série 9 possui período próprio.</p><div id="gbrDuelRotationBody" aria-live="polite"></div>';
  duel.prepend(section);
 }
 if(!$('gbrGarageFavoritesSpotlight')){
  const section=document.createElement('section');section.id='gbrGarageFavoritesSpotlight';section.className='panel gbr-intel-card';section.innerHTML='<div id="gbrGarageFavoritesBody"></div>';
  garageEl.appendChild(section);
 }
 $('gbrGarageComparison')?.remove();
 $('gbrDuelRotationBody')?.addEventListener('click',event=>{
  const button=event.target.closest?.('button[data-gbr-duel-track]');
  if(!button||!event.currentTarget.contains(button))return;
  window.F1Tracks?.openTrack?.(button.dataset.gbrDuelTrack,Number(button.dataset.gbrDuelSeries));
 });
 $('duelSeries')?.addEventListener('change',refresh);
 document.addEventListener('gbr-card-art-updated',refresh);
 $('garageTable')?.addEventListener('change',()=>queueMicrotask(refresh));
 $('addCard')?.addEventListener('click',()=>setTimeout(refresh,900));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
 refresh();
 // O app base carrega antes deste módulo; sincroniza a ficha inicial de Pistas
 // assim que a rotação vigente fica disponível, sem alterar dados da garagem.
 window.F1Tracks?.render?.();
}
function refresh(){const s=Number($('duelSeries')?.value||12),r=$('gbrDuelRotationBody');syncDuelTrackOptions(s);if(r)r.innerHTML=(SERIES_ROTATIONS[s]||PREVIOUS_SERIES_ROTATIONS[s])?rotationHTML(s):`<p class="muted mini">As rotações verificadas nesta atualização são das Séries 9, 10, 11 e 12. Para a Série ${s}, consulte a rotação atual no jogo antes de usar a recomendação.</p>`;window.GBRFavorites?.renderGarageSpotlight?.('gbrGarageFavoritesBody')}
window.GBRIntelligence=Object.freeze({refresh,rotations:SERIES_ROTATIONS,previousRotations:PREVIOUS_SERIES_ROTATIONS,rotationAt,rotationEntry,duelContext,priorityFor,listNewSeries,rotationPeriodStatus,source:'Vídeo do jogo: 04/11/2026; Série 9 com janela diferente de 10–12',updated:SERIES_ROTATIONS[12].updated});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
