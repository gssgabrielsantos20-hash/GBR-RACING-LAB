/* GBR Racing Lab 5.5.4 — Inteligência de duelos 2026, modo de leitura; nenhuma alteração no Supabase ou nas garagens. */
(()=>{
'use strict';
const PREVIOUS_SERIES_ROTATIONS={
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
const SERIES_ROTATIONS={
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
const PREVIOUS_ROTATION_START='2026-10-07';
const PREVIOUS_ROTATION_END='2026-10-20';
const ROTATION_START='2026-10-21';
const ROTATION_END='2026-11-03';
const STAT_DRIVER=Object.freeze({defending:'Defesa',tyreUse:'Gerenciamento de pneus',overtaking:'Ultrapassagem'});
const STAT_CAR=Object.freeze({power:'Unidade de potência',speed:'Velocidade',corner:'Curvas'});
const STAT_WEATHER=Object.freeze({mixed:'Misto',dry:'Seco'});
function localDay(now=new Date()){
 return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
function rotationPeriodStatus(today=localDay()){
 if(today<ROTATION_START){
  const current=`${formatDate(PREVIOUS_ROTATION_START)} a ${formatDate(PREVIOUS_ROTATION_END)}`;
  return {status:today<PREVIOUS_ROTATION_START?`Última rotação cadastrada: ${current}`:`Rotação vigente: ${current}`,upcoming:`Próxima rotação: ${formatDate(ROTATION_START)} a ${formatDate(ROTATION_END)} (tabela fornecida pelo responsável)`,past:true};
 }
 const dates=`${formatDate(ROTATION_START)} a ${formatDate(ROTATION_END)}`;
 if(today>ROTATION_END)return {status:`Vigência encerrada: ${dates} · aguardando nova rotação`,upcoming:'Não utilize esta rotação como atual após o prazo indicado.',past:false};
 return {status:`Rotação vigente: ${dates}`,upcoming:'Dados da tabela fornecida pelo responsável; confirme eventuais mudanças no jogo.',past:false};
}
function rotationEntry(series,trackId,asOf=localDay()){
 if(asOf<ROTATION_START||asOf>ROTATION_END)return null;
 return SERIES_ROTATIONS[Number(series)]?.rotation.find(row=>row.id===trackId)||null;
}
function duelContext(series,trackId,asOf=localDay()){
 const row=SERIES_ROTATIONS[Number(series)]?.rotation.find(r=>r.id===trackId);
 if(!row||asOf>ROTATION_END)return null;
 const phase=asOf<ROTATION_START?'prevista':'vigente';
 return {...row,series:Number(series),mode:'duel',phase,periodStart:ROTATION_START,periodEnd:ROTATION_END,
  source:'Tabela de rotação 21/10–03/11/2026 fornecida pelo responsável'};
}
function priorityFor(series,trackId,asOf=localDay()){
 const row=rotationEntry(series,trackId,asOf);
 return row?[row.driver,row.car]:null;
}
function listNewSeries(){return Object.entries(SERIES_ROTATIONS).flatMap(([series,v])=>v.rotation.map(r=>({series:Number(series),trackId:r.id,laps:r.laps,weather:r.weather,driver:r.driver,car:r.car})));}
function rotationHTML(series){
 const period=rotationPeriodStatus();
 const info=(period.past?PREVIOUS_SERIES_ROTATIONS:SERIES_ROTATIONS)[series];
 if(!info)return '';
 const summary=info.rotation.map((r,i)=>{
  const details=r.laps?`<small class="gbr-intel-track-stats">${esc(STAT_DRIVER[r.driver])} · ${esc(STAT_CAR[r.car])} · ${esc(STAT_WEATHER[r.weather])} · ${r.laps} voltas</small>`:'';
  return `<button type="button" class="gbr-intel-track-link" data-gbr-duel-track="${esc(r.id)}" data-gbr-duel-series="${series}" aria-label="Abrir ${esc(r.name)} na Biblioteca de Pistas, Série ${series}" title="Abrir análise de ${esc(r.name)}"><span class="gbr-intel-track-body"><b>${i+1}. ${esc(r.name)}</b>${details}</span><span class="gbr-intel-track-arrow" aria-hidden="true">↗</span></button>`;
 }).join('');
 return `<div class="gbr-intel-status"><strong>${esc(period.status)}</strong><small>${esc(period.upcoming)}</small></div><div class="gbr-intel-rotation">${summary}</div><p class="muted mini">Esta é a lista da ${esc(info.label)}, não a lista completa de pistas nem o calendário dos GPs. ${esc(info.notice)} As voltas são referências do briefing, não estratégia de pit-stop.</p>`;
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
  const section=document.createElement('section');section.id='gbrDuelRotation';section.className='panel gbr-intel-card';section.innerHTML='<div class="kicker">ROTATIVIDADE / 2026</div><h2>Pistas dos duelos por série</h2><div id="gbrDuelRotationBody"></div>';
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
}
function refresh(){const s=Number($('duelSeries')?.value||12),r=$('gbrDuelRotationBody');if(r)r.innerHTML=(SERIES_ROTATIONS[s]||PREVIOUS_SERIES_ROTATIONS[s])?rotationHTML(s):`<p class="muted mini">As rotações verificadas disponíveis nesta atualização são as das Séries 10, 11 e 12. Para a Série ${s}, consulte a rotação atual no jogo antes de usar a recomendação.</p>`;window.GBRFavorites?.renderGarageSpotlight?.('gbrGarageFavoritesBody')}
window.GBRIntelligence=Object.freeze({refresh,rotations:SERIES_ROTATIONS,previousRotations:PREVIOUS_SERIES_ROTATIONS,rotationEntry,duelContext,priorityFor,listNewSeries,rotationPeriodStatus,source:"Tabela fornecida pelo responsável: 21/10–03/11/2026",updated:SERIES_ROTATIONS[12].updated});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
