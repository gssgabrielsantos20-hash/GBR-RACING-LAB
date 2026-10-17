/* GBR Racing Lab 5.5.9 — menu premium de setups favoritos.
   Mantém o domínio 5.5.7/5.5.8, melhora a visualização no iPhone/PC e preserva o limite pessoal de 8 favoritos. */
(()=>{
'use strict';
const model=window.GBRFavoriteModel;
if(!model||!window.F1App)return;
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=x=>Number.isFinite(Number(x))?Number(x):0;
const el=$('favorites');
if(!el)return;
let editing=null;
let draftCopy=null;
let mode='list';
let selectedId='';
const getGarage=()=>window.F1App.getGarage();
const items=()=>Array.isArray(getGarage()?.favoriteSetups)?getGarage().favoriteSetups:[];
const tracks=()=>window.F1Tracks?.all||[];
const allSorted=()=>items().slice().sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
const recentItems=(limit=6)=>allSorted().slice(0,limit);
const findItem=id=>items().find(x=>String(x.id)===String(id))||null;
function ensureSelected(){
 const sorted=allSorted();
 if(!sorted.length){selectedId='';return null;}
 const chosen=findItem(selectedId);
 if(chosen){selectedId=String(chosen.id);return chosen;}
 selectedId=String(sorted[0].id);
 return sorted[0];
}
function cardName(c){return `${c.name} · ${c.rarity==='Legendary'?'Lendário':c.rarity==='Special'?'Especial':c.rarity==='Epic'?'Épico':c.rarity==='Rare'?'Raro':'Comum'} · Nv.${val(c.level)} · S${val(c.series)}`;}
function selectedCards(kind,category,previous){
 const avail=(getGarage()[kind]||[]).filter(c=>c.owned&&(!category||c.category===category));
 const selected=kind==='parts'?(previous?.parts||[]).find(p=>p.category===category):(previous?.drivers||[]);
 const old=kind==='parts'?(selected?[selected]:[]):selected;
 const unique=new Map();
 for(const c of avail)unique.set(String(c.id),c);
 for(const c of old||[])if(!unique.has(String(c.id)))unique.set(String(c.id),c);
 return [...unique.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')||val(a.series)-val(b.series));
}
function selector(kind,category,previous,index){
 const id=kind==='parts'?`favPart${model.CATEGORIES.indexOf(category)}`:`favDriver${index}`;
 const old=kind==='parts'?(previous?.parts||[]).find(p=>p.category===category):(previous?.drivers||[])[index];
 const opts=selectedCards(kind,category,kind==='parts'?previous:previous).map(c=>`<option value="${esc(c.id)}" ${old&&String(old.id)===String(c.id)?'selected':''}>${esc(cardName(c))}${!(getGarage()[kind]||[]).some(x=>x.owned&&String(x.id)===String(c.id))?' · registro preservado':''}</option>`).join('');
 return `<label class="fav-field"><span>${esc(kind==='parts'?category:`Piloto ${index+1}`)} ${category==='Bateria'?'<em>opcional</em>':''}</span><select id="${id}" aria-label="${esc(kind==='parts'?category:`Piloto ${index+1}`)}"><option value="">${kind==='parts'&&category==='Bateria'?'Sem bateria':'Selecione uma carta'}</option>${opts}</select></label>`;
}
function drawForm(){
 const previous=editing||draftCopy;
 const choices=tracks().map(t=>`<option value="${esc(t.id)}" ${t.id===previous?.trackId?'selected':''}>${esc(t.name)}</option>`).join('');
 $('favEditor').innerHTML=`<div class="fav-editor-head"><div><div class="kicker">${previous?'EDITAR FAVORITO':'NOVO FAVORITO'}</div><h2>${previous?'Atualizar composição':'Monte seu setup livre'}</h2><p>Use peças de qualquer série. Selecione apenas cartas que você possui; os atributos salvos ficam preservados.</p></div><button type="button" class="btn outline" id="favCancel">Cancelar</button></div>
 <form id="favForm" novalidate><div class="fav-form-meta"><label class="fav-field"><span>Nome do setup</span><input id="favName" maxlength="64" required placeholder="Ex.: Monza — classificação perfeita" value="${esc(previous?.name||'')}"></label><label class="fav-field"><span>Pista (opcional)</span><select id="favTrack"><option value="">Qualquer pista</option>${choices}</select></label></div>
 <div class="fav-block-title">CARRO <small>6 peças obrigatórias + bateria opcional</small></div><div class="fav-fields">${model.CATEGORIES.map(c=>selector('parts',c,previous)).join('')}</div>
 <div class="fav-block-title">PILOTOS <small>Escolha dois diferentes, sem restrição de série</small></div><div class="fav-fields">${[0,1].map(i=>selector('drivers',null,previous,i)).join('')}</div>
 <label class="fav-field fav-notes"><span>Observações de corrida (opcional)</span><textarea id="favNotes" maxlength="300" rows="3" placeholder="Ex.: deu certo com chuva, duelos de 8 voltas, ótima largada…">${esc(previous?.notes||'')}</textarea></label>
 <div class="fav-actions"><button class="btn primary" type="submit">${previous?'SALVAR ALTERAÇÕES':'★ SALVAR FAVORITO'}</button><span id="favFormError" role="alert" class="fav-error" aria-live="polite"></span></div>
 </form>`;
 $('favCancel').onclick=()=>{mode='list';editing=null;draftCopy=null;render();};
 $('favForm').onsubmit=event=>{
  event.preventDefault();
  const form={name:$('favName').value,notes:$('favNotes').value,trackId:$('favTrack').value,partIds:Object.fromEntries(model.CATEGORIES.map((c,i)=>[c,$('favPart'+i).value])),driverIds:[$('favDriver0').value,$('favDriver1').value]};
  try{
   const record=model.make(getGarage(),form,editing);
   if(!Array.isArray(getGarage().favoriteSetups))getGarage().favoriteSetups=[];
   const list=getGarage().favoriteSetups;
   if(editing){const idx=list.findIndex(x=>x.id===editing.id);if(idx<0)throw Error('Favorito não encontrado.');list[idx]=record;}
   else list.push(record);
   selectedId=String(record.id);
   mode='list';
   editing=null;draftCopy=null;
   window.F1Session?.scheduleSave?.();
   render();
   $('favFeedback').textContent='Favorito guardado na sua garagem. Confira o indicador de sincronização antes de trocar de aparelho.';
  }catch(e){$('favFormError').textContent=e.message||'Não foi possível salvar.';}
 };
}
function trackName(record){return tracks().find(t=>t.id===record.trackId)?.name||'Setup livre';}
function openNew(){if(items().length>=model.MAX)return;window.GBRSetupPrint?.close?.();editing=null;draftCopy=null;mode='new';if(document.querySelector('#nav [data-tab="favorites"]'))window.GBRFavorites?.open?.();$('favEditor')?.replaceChildren();$('favFeedback')&&($('favFeedback').textContent='');render();$('favName')?.focus();}
function openEdit(recordOrId){
 const record=typeof recordOrId==='string'?items().find(x=>x.id===recordOrId):recordOrId;
 if(!record)return;
 selectedId=String(record.id);
 editing=record;draftCopy=null;mode='edit';if(document.querySelector('#nav [data-tab="favorites"]'))window.GBRFavorites?.open?.();$('favEditor')?.replaceChildren();$('favFeedback')&&($('favFeedback').textContent='');render();$('favName')?.focus();
}
function cardDetails(c,kind){return `<span class="fav-card-thumb">${window.GBRCardArt?.thumb?.(c,kind)||''}</span><span class="fav-item-text"><b>${esc(c.name||'Carta não identificada')}</b><small>${esc(c.rarity||'')} · Nv. ${val(c.level)} · Série ${val(c.series)}</small></span>`;}
function toPNGSnap(rec){
 const track=tracks().find(t=>t.id===rec.trackId)||null;
 const parts=rec.parts||[],drivers=(rec.drivers||[]).slice(0,2);
 while(drivers.length<2)drivers.push(null);
 return {title:rec.name,track,series:'Mista',carFocus:'balanced',driverFocus:'balanced',setup:{chosen:parts,required:model.CATEGORIES,totals:model.totals(rec)},drivers,boosts:[],date:rec.updatedAt||new Date().toISOString(),complete:parts.length>=6&&drivers.every(Boolean),showDate:true};
}
function driverTotals(rec){
 const totals={overtaking:0,defending:0,qualifying:0,raceStart:0,tyreUse:0};
 for(const d of rec.drivers||[])for(const key of Object.keys(totals))totals[key]+=val(d?.[key]);
 return totals;
}
function analyzeRecord(rec){
 const parts=model.totals(rec);
 const drivers=driverTotals(rec);
 // Índice ilustrativo: soma de atributos, não é a pontuação de equipe oficial do F1 Clash.
 const score=Math.round(parts.speed+parts.corner+parts.power+parts.qualifying+drivers.overtaking+drivers.defending+drivers.qualifying+drivers.raceStart+drivers.tyreUse);
 return {parts,drivers,score};
}
function formatDate(rec){
 try{return new Date(rec.updatedAt||rec.createdAt||Date.now()).toLocaleDateString('pt-BR');}catch{return '—';}
}
function partCardHtml(part){
 return `<article class="fav-premium-card fav-premium-part">
   <div class="fav-premium-badge">${esc(part.category||'Peça')}</div>
   <div class="fav-premium-photo">${window.GBRCardArt?.thumb?.(part,'parts')||''}</div>
   <div class="fav-premium-name">${esc(part.name||'Peça')}</div>
   <div class="fav-premium-meta"><span>Nv ${val(part.level)}</span><span>S${val(part.series)}</span><span>${esc(part.rarity||'')}</span></div>
 </article>`;
}
function driverCardHtml(driver,index){
 if(!driver)return `<article class="fav-premium-driver empty"><div class="fav-premium-badge">Piloto ${index+1}</div><div class="fav-premium-photo"></div><div class="fav-premium-name">Sem piloto</div><div class="fav-premium-meta"><span>Selecione um piloto</span></div></article>`;
 return `<article class="fav-premium-driver">
   <div class="fav-premium-badge">Piloto ${index+1}</div>
   <div class="fav-premium-photo">${window.GBRCardArt?.thumb?.(driver,'drivers')||''}</div>
   <div class="fav-premium-name">${esc(driver.name||'Piloto')}</div>
   <div class="fav-premium-meta"><span>Nv ${val(driver.level)}</span><span>S${val(driver.series)}</span><span>${esc(driver.rarity||'')}</span></div>
 </article>`;
}
function stageHtml(rec){
 const insight=analyzeRecord(rec);
 const parts=(rec.parts||[]).map(partCardHtml).join('');
 const drivers=(rec.drivers||[]).slice(0,2).map((driver,index)=>driverCardHtml(driver,index)).join('');
 const summary=[
  ['Velocidade',insight.parts.speed],
  ['Curvas',insight.parts.corner],
  ['Unidade de potência',insight.parts.power],
  ['Classificação',insight.parts.qualifying],
  ['Ultrapassagem',insight.drivers.overtaking],
  ['Defesa',insight.drivers.defending],
  ['Largada',insight.drivers.raceStart],
  ['Gerenc. de pneus',insight.drivers.tyreUse],
  ['Pit stop',`${insight.parts.pit.toFixed(2)} s`]
 ];
 const ordered=allSorted();
 const slots=Array.from({length:model.MAX},(_,index)=>{
  const item=ordered[index];
  if(!item)return `<button type="button" class="fav-slot vacant" data-fav-create="" aria-label="Adicionar setup ao slot ${index+1}" title="Novo setup"><span>+</span></button>`;
  const active=String(item.id)===String(rec.id);
  return `<button type="button" class="fav-slot ${active?'active':''}" data-fav-select="${esc(item.id)}" aria-pressed="${active}" aria-label="Abrir setup ${esc(item.name)}"><span>${index+1}</span></button>`;
 }).join('');
 return `<section class="fav-premium-stage">
  <div class="fav-premium-summary">
   <div class="fav-premium-slots-wrap">
    <div class="fav-premium-slots-label">CONFIGURAÇÕES SALVAS</div>
    <div class="fav-premium-slots">${slots}</div>
   </div>
   <div class="fav-premium-score"><small>ÍNDICE DE ATRIBUTOS</small><strong>${insight.score}</strong><small>Somatório ilustrativo; não é a pontuação oficial</small></div>
  </div>
  <div class="fav-premium-banner">
   <div class="fav-premium-banner-copy">
    <div class="fav-premium-kicker">${esc(trackName(rec))} · atualizado em ${esc(formatDate(rec))}</div>
    <h2>${esc(rec.name||'Setup sem nome')}</h2>
    <p>Composição salva na sua garagem pessoal. Mistura livre de peças e pilotos de qualquer série, pronta para consulta rápida no iPhone ou no PC.</p>
   </div>
   <div class="fav-premium-banner-art" aria-hidden="true">
    <div class="fav-premium-car-mark">GBR FAVORITO</div>
    <svg viewBox="0 0 560 160" fill="none" xmlns="http://www.w3.org/2000/svg" class="fav-premium-car-svg">
      <path d="M84 94h46l25-26h74l49-18h92l33 15h48l17 15h35v17h-45l-11 15h-49l-10-15H219l-28 15h-44L130 97H84z" fill="currentColor" opacity=".92"/>
      <circle cx="156" cy="112" r="24" fill="currentColor"/>
      <circle cx="156" cy="112" r="12" fill="#071217"/>
      <circle cx="423" cy="112" r="24" fill="currentColor"/>
      <circle cx="423" cy="112" r="12" fill="#071217"/>
      <path d="M232 68l34-28h40l15 28h-89z" fill="currentColor" opacity=".78"/>
      <path d="M95 84l-25 3-18 10 27 5h22l11-18H95z" fill="currentColor" opacity=".82"/>
      <path d="M490 80h29l18 9-16 12h-39l8-21z" fill="currentColor" opacity=".82"/>
    </svg>
   </div>
  </div>
  <div class="fav-premium-actions">
   <button type="button" class="btn primary" data-act="edit">Editar setup</button>
   <button type="button" class="btn outline" data-act="png">Exportar PNG</button>
   <button type="button" class="btn outline" data-act="duplicate">Duplicar</button>
   <button type="button" class="btn outline fav-delete fav-delete-text" data-act="delete">Excluir</button>
  </div>
  <div class="fav-premium-grid">${parts}</div>
  <div class="fav-premium-driver-row">${drivers}</div>
  <div class="fav-premium-stats">${summary.map(([label,value])=>`<div class="fav-premium-stat"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`).join('')}</div>
  ${rec.notes?`<div class="fav-premium-notes"><b>Observações salvas</b><p>${esc(rec.notes)}</p></div>`:''}
 </section>`;
}
function listCardHtml(rec,index){
 const insight=analyzeRecord(rec);
 return `<button type="button" class="fav-library-card ${String(rec.id)===String(selectedId)?'active':''}" data-fav-select="${esc(rec.id)}" aria-pressed="${String(rec.id)===String(selectedId)}">
   <div class="fav-library-top"><span class="fav-library-index">${index+1}</span><div><strong>${esc(rec.name||'Setup sem nome')}</strong><small>${esc(trackName(rec))}</small></div></div>
   <div class="fav-library-meta"><span>${(rec.parts||[]).length} peças</span><span>${(rec.drivers||[]).length} pilotos</span><span>Índice ${insight.score}</span></div>
 </button>`;
}
function libraryHtml(sorted){
 if(!sorted.length)return '';
 return `<section class="fav-library"><div class="fav-library-head"><div><div class="kicker">BIBLIOTECA PESSOAL</div><h3>Todos os seus setups favoritos</h3></div><span class="fav-library-total">${sorted.length} / ${model.MAX}</span></div><div class="fav-library-grid">${sorted.map(listCardHtml).join('')}</div></section>`;
}
function wireStage(){
 $('favList').querySelectorAll('[data-fav-select]').forEach(btn=>btn.addEventListener('click',()=>{selectedId=btn.dataset.favSelect;mode='list';editing=null;draftCopy=null;render();}));
 $('favList').querySelectorAll('[data-fav-create]').forEach(btn=>btn.addEventListener('click',openNew));
 $('favList').querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{
  const record=findItem(selectedId)||ensureSelected();
  if(!record)return;
  const action=b.dataset.act;
  if(action==='edit'){editing=record;draftCopy=null;selectedId=String(record.id);mode='edit';render();$('favEditor')?.scrollIntoView?.({behavior:'smooth',block:'start'});return;}
  if(action==='png'){
   if(!window.GBRBuildPlus?.openPNG){$('favFeedback').textContent='O exportador PNG está indisponível. Atualize a página.';return;}
   try{window.GBRBuildPlus.openPNG(toPNGSnap(record));}catch(e){$('favFeedback').textContent='Não foi possível gerar o PNG: '+e.message;}
   return;
  }
  if(action==='duplicate'){
   if(items().length>=model.MAX){$('favFeedback').textContent='Limite de 8 favoritos atingido. Exclua um para duplicar.';return;}
   try{
    draftCopy={...record,name:`${String(record.name).slice(0,56)} (cópia)`};
    editing=null;
    mode='new';
    render();
    $('favEditor')?.scrollIntoView?.({behavior:'smooth',block:'start'});
   }catch(e){$('favFeedback').textContent='Não foi possível duplicar este setup.';}
   return;
  }
  if(action==='delete'){
   if(!confirm(`Excluir “${record.name}” dos seus favoritos? Isso não apaga cartas nem o histórico do Montador.`))return;
   const index=items().findIndex(x=>x.id===record.id);if(index<0)return;
   items().splice(index,1);draftCopy=null;
   window.F1Session?.scheduleSave?.();
   const next=allSorted()[0];
   selectedId=next?String(next.id):'';
   render();
   $('favFeedback').textContent='Favorito excluído da sua garagem.';
  }
 });
}
function garageSpotlightCard(rec){
 const sum=model.totals(rec);
 const drivers=(rec.drivers||[]).slice(0,2).map(d=>`<div class="fav-spot-driver">${window.GBRCardArt?.thumb?.(d,'drivers')||''}<span>${esc(d.name||'Piloto')}</span></div>`).join('');
 return `<article class="fav-spot-card" data-id="${esc(rec.id)}"><div class="fav-spot-top"><div><span class="kicker">${esc(trackName(rec))}</span><h3>${esc(rec.name||'Setup sem nome')}</h3></div><button type="button" class="btn outline fav-spot-open" data-fav-open-id="${esc(rec.id)}">Abrir</button></div><div class="fav-spot-metrics">${[['Vel.','speed'],['Curvas','corner'],['Pot.','power'],['Quali','qualifying']].map(([label,key])=>`<div><small>${label}</small><strong>${Math.round(sum[key])}</strong></div>`).join('')}</div><div class="fav-spot-drivers">${drivers||'<span class="muted mini">Sem pilotos vinculados</span>'}</div></article>`;
}
function renderGarageSpotlight(targetId='gbrGarageFavoritesBody'){
 const target=typeof targetId==='string'?$(targetId):targetId;
 if(!target)return;
 const count=items().length;
 const html=`<div class="fav-spot-head"><div><div class="kicker">MEUS SETUPS / FAVORITOS</div><h2>Seus setups salvos</h2><p class="muted mini">Guarde até <b>${model.MAX} setups</b> misturando peças e pilotos de qualquer série. Abra o menu completo para editar, exportar PNG ou revisar observações.</p></div><div class="fav-spot-actions"><span class="fav-spot-count">${count} / ${model.MAX}</span><button type="button" class="btn primary" id="gbrGarageFavOpen">Abrir meus setups</button><button type="button" class="btn outline" id="gbrGarageFavNew" ${count>=model.MAX?'disabled title="Limite de favoritos alcançado"':''}>Novo favorito</button></div></div>${count?`<div class="fav-spot-grid">${recentItems(6).map(garageSpotlightCard).join('')}</div>`:'<div class="fav-empty fav-spot-empty"><strong>Salve aqui seus setups que deram certo.</strong><p>Você pode guardar até 8 composições e voltar nelas quando quiser, sem depender da série atual.</p></div>'}`;
 target.innerHTML=html;
 target.querySelector('#gbrGarageFavOpen')?.addEventListener('click',()=>window.GBRFavorites?.open?.());
 target.querySelector('#gbrGarageFavNew')?.addEventListener('click',()=>openNew());
 target.querySelectorAll('[data-fav-open-id]').forEach(btn=>btn.addEventListener('click',()=>{selectedId=btn.dataset.favOpenId;window.GBRFavorites?.open?.();render();}));
}
function render(){
 const count=items().length;
 const selected=ensureSelected();
 $('favCount').textContent=`${count} / ${model.MAX}`;
 const demo=window.F1Session?.getContext?.()?.demo;
 if($('favNote'))$('favNote').textContent=demo?'Demonstração local: os favoritos não são sincronizados. Entre com sua conta para guardá-los na nuvem.':'Os favoritos pertencem somente à sua conta e usam a sincronização da garagem. Os cards abaixo preservam o setup que já deu certo para você, sem depender da série atual.';
 $('favNew').disabled=count>=model.MAX;
 $('favImport').disabled=count>=model.MAX;
 $('favNew').title=count>=model.MAX?'Limite de 8 favoritos alcançado. Exclua um para criar outro.':'Criar novo setup favorito';
 $('favList').innerHTML=count&&selected?`${stageHtml(selected)}${libraryHtml(allSorted())}`:'<div class="fav-empty"><strong>Seus melhores setups começam aqui.</strong><p>Monte um carro usando suas peças e pilotos, salve até 8 combinações e consulte sempre que precisar.</p></div>';
 wireStage();
 renderGarageSpotlight();
 $('favEditor').hidden=mode==='list';
 if(mode==='list')$('favEditor').replaceChildren();
 else if(!$('favForm'))drawForm();
}
function openPrintImporter(){
 if(items().length>=model.MAX){$('favFeedback').textContent='Limite de 8 setups atingido. Exclua um para importar.';return;}
 editing=null;draftCopy=null;mode='list';render();
 window.GBRSetupPrint?.open?.({getGarage,onDraft:draft=>{
  if(items().length>=model.MAX){$('favFeedback').textContent='Limite de 8 setups atingido.';return;}
  editing=null;draftCopy=draft;mode='new';render();
  $('favEditor')?.scrollIntoView?.({behavior:'smooth',block:'start'});
 }});
}
$('favImport').onclick=openPrintImporter;
$('favNew').onclick=()=>{if(items().length>=model.MAX)return;openNew();};
const previousSet=window.F1App.setGarage;
window.F1App.setGarage=function(state){window.GBRSetupPrint?.close?.();editing=null;draftCopy=null;mode='list';selectedId='';const result=previousSet.call(this,state);render();$('favFeedback').textContent='';return result;};
const previousRefresh=window.F1App.refresh;
window.F1App.refresh=function(){const result=previousRefresh.apply(this,arguments);render();return result;};
window.GBRFavorites=Object.freeze({render,renderGarageSpotlight,openPrintImporter,open:()=>document.querySelector('#nav [data-tab="favorites"]')?.click(),openNew,openEdit,count:()=>items().length});
render();
})();
