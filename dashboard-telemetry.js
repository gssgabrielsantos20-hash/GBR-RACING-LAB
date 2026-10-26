/* GBR Racing Lab 5.5.11E — Painel com atalhos rápidos no lugar do bloco de equipes. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const COLORS=['cyan','red','orange','blue'];
 const ICONS={parts:'<svg viewBox="0 0 24 24"><path d="M10 2h4l1 3 2 1 3-1 2 4-2 2v3l2 2-2 4-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-4 2-2v-3L2 9l2-4 3 1 2-1z"/><circle cx="12" cy="12" r="4"/></svg>',drivers:'<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 18 0v5l-4 3H7l-4-3z"/><path d="M5 13h14M8 20v-5h8v5"/></svg>',fav:'<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg>',teams:'<svg viewBox="0 0 24 24"><circle cx="12" cy="6" r="3"/><path d="M4 21v-3a8 8 0 0 1 16 0v3H4M3 8a3 3 0 0 0-1 6M21 8a3 3 0 0 1 1 6"/></svg>',builder:'<svg viewBox="0 0 24 24"><path d="M4 6h16l-1.6 3.5H5.6z"/><path d="M8 9.5V18M16 9.5V18M5 18h14"/></svg>',duel:'<svg viewBox="0 0 24 24"><path d="M20 3.5L8.5 15"/><path d="M6.2 12.7l4.6 4.6"/><path d="M8.5 15l-3 3"/><path d="M4 3.5L15.5 15"/><path d="M13.2 17.3l4.6-4.6"/><path d="M15.5 15l3 3"/></svg>',chests:'<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="12" rx="1.25"/><path d="M5.5 6.6v10.8M8.75 6.6v10.8M12 6.6v10.8M15.25 6.6v10.8M18.5 6.6v10.8"/></svg>'};
 const go=target=>{if(target==='event'){window.GBREvents?.open?.();return;}if(typeof window.tab==='function')window.tab(target);else document.querySelector('#nav [data-tab="'+target+'"]')?.click();};
 const statTemplate=(label,value,type,detail)=>`<div class="stat telemetry-stat"><span class="telemetry-stat-icon" aria-hidden="true">${ICONS[type]}</span><small>${label}</small><b>${Math.max(0,Number(value)||0)}</b><span class="telemetry-stat-detail">${detail}</span></div>`;
 function renderEvent(){
  const events=window.GBREvents?.all||[];
  if(!events.length){$('dashGpName').textContent='Consulte os Eventos GP';return;}
  const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  const ordered=events.slice().sort((a,b)=>String(a.starts).localeCompare(String(b.starts)));
  const active=ordered.find(x=>x.starts<=today&&x.ends>=today);
  const nearest=ordered.find(x=>x.starts>today);
  const chosen=active||nearest||ordered[ordered.length-1];
  const kind=active?'EM ANDAMENTO':nearest?'EM BREVE':'ENCERRADO';
  $('dashGpTitle').textContent=active?'EVENTO GP EM ANDAMENTO':nearest?'PRÓXIMO EVENTO DE GP':'ÚLTIMO EVENTO CADASTRADO';
  $('dashGpStatus').textContent=kind;$('dashGpStatus').classList.toggle('is-soon',!active);
  $('dashGpKind').textContent=String(chosen.kind||'Evento GP');
  $('dashGpName').textContent=String(chosen.label||chosen.name||'Evento GP');
  const short=date=>{const [year,month,day]=String(date||'').split('-');return day&&month&&year?day+'/'+month+'/'+year:''};
  $('dashGpDates').textContent=[short(chosen.starts),short(chosen.ends)].filter(Boolean).join(' a ');
  $('dashGpTracks').textContent=(chosen.tracks?.length||0)+' circuitos previstos';
  $('dashGpBoost').textContent=chosen.eventBoost?'Boost: '+chosen.eventBoost:'Informações do evento';
  const img=$('dashGpImage');
  const image=String(chosen.image||'');
  if(/^assets\/events\/[a-z0-9/-]+\.(?:png|svg)$/.test(image))img.setAttribute('src',image);
  img.alt='Arte de '+String(chosen.label||chosen.name||'evento GP');
  for(const id of ['dashGpOpen','dashGpDetails']){$(id).onclick=()=>{go('event');window.GBREvents?.select?.(chosen.id);};}
 }
 function renderShortcuts(){
  const node=$('dashTeamGrid');if(!node)return;
  const shortcuts=[
   {id:'builder',name:'Montador',detail:'Peças, pilotos e montagem final',icon:'builder',color:'cyan'},
   {id:'duel',name:'Duelos',detail:'Estratégia e apoio às corridas',icon:'duel',color:'red'},
   {id:'chests',name:'Baús',detail:'Acompanhe o progresso e recompensas',icon:'chests',color:'orange'},
   {id:'favorites',name:'Meus setups',detail:'Favoritos e combinações salvas',icon:'fav',color:'blue'}
  ];
  const frag=document.createDocumentFragment();
  shortcuts.forEach((item,i)=>{
   const btn=document.createElement('button');btn.type='button';btn.className='telemetry-team-card telemetry-shortcut-card';btn.dataset.color=item.color;btn.style.setProperty('--team-color',['#09e6d4','#ff4e6e','#ff922e','#2dbcf2'][i%4]);
   btn.setAttribute('aria-label','Abrir '+item.name);
   const head=document.createElement('div');head.className='telemetry-team-head';
   const num=document.createElement('span');num.className='telemetry-team-number';num.textContent=String(i+1).padStart(2,'0');
   const title=document.createElement('span');title.className='telemetry-team-name';title.textContent=item.name;
   head.append(num,title);
   const body=document.createElement('div');body.className='telemetry-shortcut-body';
   const icon=document.createElement('span');icon.className='telemetry-shortcut-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=ICONS[item.icon]||'';
   const copy=document.createElement('div');copy.className='telemetry-shortcut-copy';
   const strong=document.createElement('strong');strong.textContent=item.name;
   const small=document.createElement('small');small.textContent=item.detail;
   copy.append(strong,small);body.append(icon,copy);
   const hint=document.createElement('small');hint.className='telemetry-team-count';hint.textContent='Toque para abrir';
   btn.append(head,body,hint);btn.onclick=()=>go(item.id);frag.appendChild(btn);
  });
  node.setAttribute('aria-label','Atalhos do lab no painel');
  node.replaceChildren(frag);
  if($('dashTeamName'))$('dashTeamName').textContent='Atalhos do lab';
  if($('dashTeamText'))$('dashTeamText').textContent='Montador, Duelos, Baús e Meus Setups com acesso direto pelo painel.';
 }
 function activityRow(icon,title,detail){
  const row=document.createElement('div');row.className='telemetry-activity-row';
  const ico=document.createElement('span');ico.className='telemetry-activity-icon';ico.textContent=icon;ico.setAttribute('aria-hidden','true');
  const copy=document.createElement('div');copy.className='telemetry-activity-copy';
  const b=document.createElement('strong');b.textContent=title;
  const s=document.createElement('small');s.textContent=detail;
  copy.append(b,s);row.append(ico,copy);return row;
 }
 function renderActivity(garage){
  const list=$('dashActivityList');if(!list)return;
  const frag=document.createDocumentFragment();
  const fav=Array.isArray(garage.favoriteSetups)?garage.favoriteSetups:[];
  const ordered=fav.slice().sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
  for(const item of ordered.slice(0,2)){
   const date=item.updatedAt||item.createdAt;
   let detail='Setup favorito salvo';
   if(date){const d=new Date(date);if(!Number.isNaN(d.getTime()))detail='Atualizado em '+d.toLocaleDateString('pt-BR');}
   frag.appendChild(activityRow('★',String(item.name||'Setup favorito'),detail));
  }
  if(!ordered.length)frag.appendChild(activityRow('☆','Nenhum favorito salvo','Crie seu primeiro setup favorito'));
  const saved=Array.isArray(garage.saved)?garage.saved.length:0;
  frag.appendChild(activityRow('▤','Histórico do Montador',saved+' configurações salvas'));
  list.replaceChildren(frag);
 }
 function render(){
  if(!$('dashStats')||!window.F1App?.getGarage)return;
  const garage=window.F1App.getGarage()||{};
  const parts=(garage.parts||[]).filter(x=>x.owned).length;
  const drivers=(garage.drivers||[]).filter(x=>x.owned).length;
  const fav=(garage.favoriteSetups||[]).length;
  $('dashStats').innerHTML=[
   statTemplate('Peças cadastradas',parts,'parts','Na sua garagem'),
   statTemplate('Pilotos cadastrados',drivers,'drivers','Na sua garagem'),
   statTemplate('Setups favoritos',fav,'fav',fav?'Até 8 favoritos':'Crie seu primeiro'),
   statTemplate('Atalhos do lab',4,'teams','Montador · Duelos · Baús · Setups')
  ].join('');
  renderEvent();renderActivity(garage);renderShortcuts();
 }
 for(const b of document.querySelectorAll('#dashboard .telemetry-activity-actions [data-go]'))b.addEventListener('click',()=>go(b.dataset.go));
 // Academy/Equipes is intentionally independent of this dashboard shortcut grid.
 window.GBRDashboardTelemetry=Object.freeze({render});render();
})();
