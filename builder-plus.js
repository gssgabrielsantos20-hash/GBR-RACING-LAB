/* GBR Racing Lab — Montador Completo, dados individuais e exportação PNG. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const value=x=>Number(x)||0;
const core=window.GBRCore;
if(!core||!window.F1App)return;
let lastSnapshot=null,previewModal=null,lastPNG=null;
let driverChoices=['auto','auto'];
function db(){return window.F1App.getGarage()}
function availableDrivers(series){return db().drivers.filter(d=>d.owned&&value(d.level)>0&&value(d.series)<=series)}
function selectedTrack(){const id=$('gbrBuildTrack')?.value;return window.F1Tracks?.all?.find(t=>t.id===id)||null}
function selectedContext(){
 const track=selectedTrack();const series=value($('seriesLimit').value)||12;
 const override=track?core.TRACK_SERIES[series]?.[track.id]:null;
 const car=override?.[1]||track?.car||$('preset').value;
 const driver=override?.[0]||track?.driver||'overtaking';
 return {track,series,car,driver};
}
function driverRank(d,focus){
 const basis=value(d[focus])*0.65;
 return basis+['overtaking','defending','qualifying','raceStart','tyreUse'].reduce((total,k)=>total+value(d[k])*0.07,0);
}
function bestDriverPair(ctx,ids=driverChoices){
 const available=availableDrivers(ctx.series).slice().sort((a,b)=>driverRank(b,ctx.driver)-driverRank(a,ctx.driver));
 const chosen=[];
 for(let i=0;i<2;i++){
  const id=ids[i];const manual=id&&id!=='auto'?available.find(d=>d.id===id):null;
  const choice=manual&&!chosen.some(d=>d.id===manual.id)?manual:available.find(d=>!chosen.some(s=>s.id===d.id))||null;
  chosen.push(choice);
 }
 return chosen;
}
function ensureDriverSelectors(){
 const series=value($('seriesLimit').value)||12;
 const eligible=availableDrivers(series);
 for(let i=0;i<2;i++){
  const sel=$('gbrPilot'+(i+1));if(!sel)return;
  const previous=driverChoices[i];
  sel.replaceChildren(new Option('Automático (recomendado)','auto'));
  eligible.forEach(d=>sel.add(new Option(`${d.name}${d.editionLabel?' · '+d.editionLabel:''} · Nv.${d.level} · ${rarity(d.rarity)}`,d.id)));
  sel.value=eligible.some(d=>d.id===previous)?previous:'auto';
  driverChoices[i]=sel.value;
 }
}
function rarity(r){return {Common:'Comum',Rare:'Raro',Epic:'Épico',Legendary:'Lendário',Special:'Edição especial'}[r]||r||'—'}
function driverHTML(d,i){
 return `<div class="gbr-bld-driver"><span class="gbr-bld-number">${i+1}</span><div><small>PILOTO ${i+1}</small><strong>${d?esc(d.name):'Não selecionado'}</strong><span>${d?`${esc(rarity(d.rarity))}${d.editionLabel?' · '+esc(d.editionLabel):''} · Nv. ${value(d.level)} · Série ${value(d.series)}`:'Cadastre pilotos elegíveis em Minha garagem'}</span>${d?`<p>Ultrap. <b>${value(d.overtaking)}</b> · Defesa <b>${value(d.defending)}</b> · Classif. <b>${value(d.qualifying)}</b> · Largada <b>${value(d.raceStart)}</b> · Pneus <b>${value(d.tyreUse)}</b></p>`:''}</div></div>`;
}
function generateSnapshot(overrides){
 const ctx=selectedContext();
 const base=ctx.track&&$('gbrFollowTrack').checked?core.trackWeights(ctx.car):null;
 const learned=base?window.GBRRecommendations?.evidence?.(db(),{series:ctx.series,trackId:ctx.track.id,baseWeights:base}):null;
 const priority=base&&$('gbrBuildRecommendationMode')?.value==='gbr'&&learned?.hasExperiment?learned.weights:base;
 const series=value($('seriesLimit').value)||12;
 const pit=$('pitMode').value;
 const setup=priority?core.optimize(priority,series,pit):core.getCurrentSetup()||core.optimize(core.profiles[$('preset').value]||core.profiles.balanced,series,pit);
 const [driver1,driver2]=bestDriverPair(ctx);
 const weather=ctx.track?db().trackPlans?.[series+':'+ctx.track.id]?.weather||'dry':'dry';
 const boosts=window.GBRBoosts?.recommend({track:ctx.track,car:ctx.car,driver:ctx.driver,weather})||[];
 return {title:'Setup GBR Racing Lab',track:ctx.track,series,carFocus:ctx.car,driverFocus:ctx.driver,pit,setup,drivers:[driver1,driver2],boosts,date:new Date().toISOString(),complete:setup.chosen.length===setup.required.length&&!!driver1&&!!driver2, ...overrides};
}
function renderSaved(){
 const host=$('gbrSavedSetups');if(!host)return;
 const entries=db().saved||[];
 host.innerHTML=entries.length?entries.slice().reverse().slice(0,20).map((e,i)=>{
  const idx=entries.length-1-i;
  const track=window.F1Tracks.all.find(t=>t.id===e.trackId);
  return `<div class="gbr-saved-row"><div><b>${esc(e.name||'Setup sem nome')}</b><small>${esc(track?.name||'Montagem por perfil')} · ${e.series?'Série '+value(e.series):'Série original'} · ${(e.driverIds||[]).length?'Com pilotos':'Somente carro (anterior)'}</small></div><button type="button" class="btn outline" data-export-saved="${idx}">EXPORTAR PNG</button><button type="button" class="gbr-icon-button" aria-label="Excluir setup salvo" title="Excluir setup" data-delete-saved="${idx}">×</button></div>`;
 }).join(''):'<p class="muted mini">Nenhum setup salvo nesta garagem.</p>';
 host.querySelectorAll('[data-export-saved]').forEach(b=>b.onclick=()=>openPNG(restoreSaved(entries[Number(b.dataset.exportSaved)])));
 host.querySelectorAll('[data-delete-saved]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.deleteSaved);if(!confirm('Excluir este setup salvo? Isso não apaga peças ou pilotos.'))return;db().saved.splice(id,1);window.F1Session?.scheduleSave?.();renderSaved();window.renderDashboard?.()});
}
function restoreSaved(saved){
 const garage=db();const track=window.F1Tracks.all.find(t=>t.id===saved.trackId)||null;
 const chosen=(saved.ids||[]).map(id=>garage.parts.find(p=>p.id===id)).filter(Boolean);
 const totals={speed:0,corner:0,power:0,qualifying:0,pit:0};chosen.forEach(p=>Object.keys(totals).forEach(k=>totals[k]+=value(p[k])));
 const required=chosen.map(x=>x.category);
 const drivers=(saved.driverIds||[]).map(id=>garage.drivers.find(d=>d.id===id)||null);
 while(drivers.length<2)drivers.push(null);
 const carFocus=saved.carFocus||track?.car||'speed',driverFocus=saved.driverFocus||track?.driver||'overtaking';
 const weather=track?garage.trackPlans?.[(saved.series||12)+':'+track.id]?.weather||'dry':'dry';
 const boosts=window.GBRBoosts?.recommend({track,car:carFocus,driver:driverFocus,weather})||[];
 return {title:saved.name||'Setup salvo',track,series:saved.series||12,carFocus,driverFocus,setup:{chosen,totals,required},drivers,boosts,date:saved.date||new Date().toISOString(),complete:chosen.length>=6&&drivers.every(Boolean),fromSaved:true};
}
function renderCurrent(){
 const host=$('gbrFullBuildOutput');if(!host)return;
 ensureDriverSelectors();
 lastSnapshot=generateSnapshot();
 const s=lastSnapshot,ctx=selectedContext();
 const insight=ctx.track?window.GBRRecommendations?.evidence?.(db(),{series:ctx.series,trackId:ctx.track.id,baseWeights:core.trackWeights(ctx.car)}):null;
 const isExperiment=$('gbrBuildRecommendationMode')?.value==='gbr'&&insight?.hasExperiment&&$('gbrFollowTrack')?.checked;
 host.innerHTML=`<div class="panel gbr-full-panel"><div class="gbr-build-head"><div><div class="kicker">SEU SETUP COMPLETO</div><h2>Carro + dupla de pilotos</h2><p class="muted mini">${s.track?`Pista: ${esc(s.track.name)}`:'Selecione um circuito para adaptar automaticamente o conjunto à pista.'} · Série ${s.series} · Foco: ${esc(core.TRACK_CAR[s.carFocus]||'Personalizado')} / ${esc(core.TRACK_DRIVER[s.driverFocus]||'Equilibrado')}</p>${insight?`<p class="gbr-bld-learning">${esc(isExperiment?'TESTE GBR • '+insight.message:insight.message)}</p>`:''}</div><button id="gbrExportCurrent" class="btn primary" type="button">↓ EXPORTAR PNG</button></div>
 <div class="gbr-pilot-pair">${s.drivers.map(driverHTML).join('')}</div>
 <div class="gbr-build-sub"><b>Carro selecionado</b><span>${s.setup.chosen.length} de ${s.setup.required.length} posições preenchidas</span></div>
 <div class="gbr-part-chips">${s.setup.chosen.map(p=>`<div><small>${esc(p.category)}</small><b>${esc(p.name)}</b><span>Nível ${value(p.level)}</span></div>`).join('')||'<p class="muted mini">Cadastre peças na garagem antes de montar.</p>'}</div>
 <div class="gbr-build-sub"><b>Boosts orientativos</b><span>Confira os efeitos disponíveis no jogo</span></div>
 <div class="gbr-build-boosts">${s.boosts.map(x=>`<div><b>${esc(x.type)}</b><span>${esc(x.name)}</span></div>`).join('')}</div>
 ${!s.complete?'<p class="gbr-incomplete">Este setup está incompleto: cadastre peças e dois pilotos elegíveis para uma composição completa.</p>':''}</div>`;
 $('gbrExportCurrent').onclick=()=>openPNG(lastSnapshot);
 renderSaved();
}
function refresh(){ensureDriverSelectors();renderCurrent()}
function openBuilder(){
 const panel=$('builder')?.querySelector('.panel');if(!panel)return;
 const top=document.createElement('div');top.className='gbr-build-controls';top.innerHTML=`<div class="gbr-build-title"><div class="kicker">MONTADOR COMPLETO 5.0</div><h3>Monte o carro e escolha os pilotos</h3><p>Use os seus níveis reais e selecione uma pista para aplicar as prioridades da corrida.</p></div><div class="gbr-build-fields"><div class="field"><label for="gbrBuildTrack">Pista</label><select id="gbrBuildTrack"><option value="">Sem pista · perfil manual</option>${window.F1Tracks.all.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('')}</select></div><label class="gbr-check-track"><input id="gbrFollowTrack" type="checkbox" checked> Dar prioridade ao atributo da pista</label><div class="field"><label for="gbrBuildRecommendationMode">Modo de recomendação</label><select id="gbrBuildRecommendationMode"><option value="baseline">Prioridades da pista</option><option value="gbr">Inteligência GBR · testar</option></select></div><div class="field"><label for="gbrPilot1">Piloto 1</label><select id="gbrPilot1"><option value="auto">Automático</option></select></div><div class="field"><label for="gbrPilot2">Piloto 2</label><select id="gbrPilot2"><option value="auto">Automático</option></select></div></div><div class="gbr-build-hint">A recomendação usa somente cartas que você marcou como suas, respeitando a série. Você pode substituir cada piloto manualmente.</div>`;
 panel.prepend(top);
 const results=$('buildOutput');const extended=document.createElement('div');extended.id='gbrFullBuildOutput';results.after(extended);
 const saved=document.createElement('div');saved.className='panel gbr-saved-panel';saved.innerHTML='<div class="kicker">HISTÓRICO PESSOAL</div><h2>Setups salvos</h2><div id="gbrSavedSetups"></div>';extended.after(saved);
 const calc=$('optimize'),save=$('saveSetup');
 calc.addEventListener('click',()=>{if($('gbrFollowTrack').checked&&selectedTrack()){
  const ctx=selectedContext(),base=core.trackWeights(ctx.car);
  const data=window.GBRRecommendations?.evidence?.(db(),{series:ctx.series,trackId:ctx.track.id,baseWeights:base});
  core.applyWeights($('gbrBuildRecommendationMode').value==='gbr'&&data?.hasExperiment?data.weights:base);
 }},true);
 calc.addEventListener('click',()=>queueMicrotask(renderCurrent));
 $('gbrBuildTrack').onchange=()=>calc.click();
 $('gbrBuildRecommendationMode').onchange=()=>calc.click();
 $('gbrFollowTrack').onchange=()=>calc.click();
 $('seriesLimit').addEventListener('change',()=>{ensureDriverSelectors();calc.click()});
 $('pitMode').addEventListener('change',()=>calc.click());
 $('preset').addEventListener('change',()=>{if(!selectedTrack()||!$('gbrFollowTrack').checked)calc.click()});
 for(let i=0;i<2;i++){$('gbrPilot'+(i+1)).onchange=e=>{driverChoices[i]=e.target.value;if(driverChoices[i]!=='auto'&&driverChoices[1-i]===driverChoices[i]){alert('Escolha dois pilotos diferentes. O segundo voltará ao modo automático.');driverChoices[i]='auto';e.target.value='auto';}renderCurrent()}}
 save.onclick=()=>{
  const s=generateSnapshot();if(!s.setup.chosen.length){alert('Sua garagem ainda não possui peças selecionadas.');return}
  const suggested=s.track?`Setup ${s.track.name}`:'Meu setup completo';const name=prompt('Nome do setup:',suggested)?.trim();if(!name)return;
  db().saved.push({schemaVersion:5,name,ids:s.setup.chosen.map(p=>p.id),driverIds:s.drivers.filter(Boolean).map(d=>d.id),trackId:s.track?.id||null,series:s.series,carFocus:s.carFocus,driverFocus:s.driverFocus,pit:s.pit,date:s.date});
  window.F1Session?.scheduleSave?.();window.renderDashboard?.();renderSaved();alert('Setup completo salvo na sua garagem. Confira a sincronização.');
 };
 const originalRefresh=window.F1App.refresh;
 window.F1App.refresh=function(){const result=originalRefresh.apply(this,arguments);queueMicrotask(refresh);return result};
 const originalSetGarage=window.F1App.setGarage;
 window.F1App.setGarage=function(garage){const result=originalSetGarage(garage);queueMicrotask(refresh);return result};
 ensureDriverSelectors();renderCurrent();
 window.GBRBuildPlus={refresh,generateSnapshot,restoreSaved,openPNG,exportPNG:savePNG};
}
// ------- PNG nativo (canvas; funciona sem serviços de imagem) -------
function wrap(ctx,text,max){const parts=String(text||'').split(/\s+/),out=[];let line='';for(const word of parts){const next=line?line+' '+word:word;if(ctx.measureText(next).width>max&&line){out.push(line);line=word}else line=next}if(line)out.push(line);return out}
function rounded(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function fill(ctx,t,x,y,size=23,color='#ebfaf6',weight='700',maxWidth){ctx.fillStyle=color;ctx.font=`${weight} ${size}px system-ui, -apple-system, sans-serif`;ctx.fillText(String(t||''),x,y,maxWidth||undefined)}
function bar(ctx,label,val,x,y,w){
 fill(ctx,label.toUpperCase(),x,y,15,'#98bcb7','700');fill(ctx,String(value(val).toFixed(0)),x+w-38,y,23,'#f5ffff','800');rounded(ctx,x,y+13,w,7,3,'#253940');rounded(ctx,x,y+13,Math.max(0,Math.min(100,value(val)))*w/100,7,3,'#00e5d4');
}
function drawCanvas(s){
 const c=document.createElement('canvas');c.width=1080;c.height=1720;const ctx=c.getContext('2d');
 const grad=ctx.createLinearGradient(0,0,1080,1720);grad.addColorStop(0,'#081219');grad.addColorStop(.65,'#0b141d');grad.addColorStop(1,'#071719');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1720);
 ctx.fillStyle='#00e5d4';ctx.fillRect(0,0,1080,11);ctx.fillRect(54,66,104,84);fill(ctx,'GBR',66,124,38,'#061115','900');fill(ctx,'RACING LAB',181,112,42,'#f6ffff','900');fill(ctx,s.eventName?'EVENTO: '+s.eventName.toUpperCase():'F1 CLASH 2026 • SETUP DA GARAGEM',184,148,19,'#0ee4d6','800',810);
 ctx.textAlign='right';if(s.showDate!==false)fill(ctx,new Date(s.date).toLocaleDateString('pt-BR'),1022,110,21,'#9dbbbd','600');ctx.textAlign='left';
 const title=s.track?.name||'Montagem personalizada';rounded(ctx,54,196,972,190,22,'#122428','#246b62');fill(ctx,'ESTRATÉGIA DE CORRIDA',78,242,18,'#00e8d6','800');fill(ctx,title,78,304,40,'#ffffff','900',915);fill(ctx,`Série ${s.series}  •  Carro: ${core.TRACK_CAR[s.carFocus]||'Perfil manual'}  •  Piloto: ${core.TRACK_DRIVER[s.driverFocus]||'Equilíbrio'}`,78,352,21,'#bfd7d6','500',925);
 if(s.track){const map=core.TRACK_MAPS[s.track.id];if(map){ctx.save();ctx.translate(795,238);ctx.scale(1.27,1.04);ctx.strokeStyle='#00d5c8';ctx.lineWidth=4;ctx.shadowColor='#00dbc8';ctx.shadowBlur=6;try{ctx.stroke(new Path2D(map.path))}catch{}ctx.restore()}}
 // Totais e carro
 rounded(ctx,54,410,972,220,20,'#111f28','#274a4d');fill(ctx,'CARRO • ATRIBUTOS SOMADOS',78,451,22,'#eaf8f4','800');
 const stats=[['VELOCIDADE','speed'],['CURVAS','corner'],['POTÊNCIA','power'],['CLASSIF.','qualifying']];
 stats.forEach(([label,k],i)=>{const x=80+i*238;fill(ctx,label,x,506,16,'#95b2b2','700');fill(ctx,Math.round(value(s.setup.totals?.[k])),x,571,47,'#effffd','900')});
 fill(ctx,`${s.setup.chosen.length}/${s.setup.required.length} posições  •  Pit comparativo: ${value(s.setup.totals?.pit).toFixed(2)} s`,78,605,18,'#90adaf','500');
 rounded(ctx,54,650,972,444,20,'#111b23','#31454b');fill(ctx,'PEÇAS DO SETUP',78,693,23,'#f2ffff','900');
 const slots=s.setup.chosen||[]; const desired=['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio','Bateria'];
 desired.forEach((cat,i)=>{
  const col=i%2,row=Math.floor(i/2),x=78+col*485,y=736+row*82;
  rounded(ctx,x,y,461,70,11,'#0c161e','#233e42');fill(ctx,cat.toUpperCase(),x+13,y+23,15,'#18d9ca','700');const item=slots.find(p=>p.category===cat);
  fill(ctx,item?item.name:(cat==='Bateria'&&s.series<=3?'Indisponível na categoria':'Não cadastrada'),x+13,y+51,22,item?'#eff9f8':'#617680','700',380);
  if(item){ctx.textAlign='right';fill(ctx,`Nv ${value(item.level)}`,x+447,y+23,15,'#b6c9c9','700');ctx.textAlign='left'}
 });
 rounded(ctx,54,1114,972,296,20,'#10232a','#31625f');fill(ctx,'DUPLA DE PILOTOS',78,1157,23,'#f0ffff','900');
 s.drivers.forEach((d,i)=>{
  const x=78+i*485,y=1183;
  rounded(ctx,x,y,460,201,14,i===0?'#112b2d':'#1a2530',i===0?'#277e72':'#325569');
  fill(ctx,`PILOTO ${i+1}`,x+16,y+32,16,'#0fe3d4','800');
  fill(ctx,d?d.name:'Não selecionado',x+16,y+73,25,'#ffffff','900',423);
  fill(ctx,d?`${rarity(d.rarity)} • Nível ${value(d.level)}`:'Escolha na garagem',x+16,y+104,17,'#bed3d2','500');
  if(d){bar(ctx,'Ultrapassagem',d.overtaking,x+16,y+134,202);bar(ctx,'Largada',d.raceStart,x+238,y+134,202)}
 });
 rounded(ctx,54,1430,972,210,20,'#142026','#324952');fill(ctx,'BOOSTS • EFEITOS RECOMENDADOS',78,1476,22,'#efffff','900');
 (s.boosts||[]).slice(0,3).forEach((b,i)=>{let x=78+i*317;fill(ctx,b.type,x,1521,17,'#20e2d3','800');ctx.font='700 19px system-ui';wrap(ctx,b.name,295).slice(0,2).forEach((line,j)=>fill(ctx,line,x,1555+j*26,19,'#eaf8f7','700'))});
 fill(ctx,'As sugestões de boosts são orientativas; confirme os itens disponíveis no jogo.',78,1609,15,'#9bb4b2','500',912);
 fill(ctx,'GBR RACING LAB  •  SETUP PESSOAL  •  APLICATIVO NÃO OFICIAL',56,1677,16,'#7cb9b1','700',970);
 return c;
}
function filename(s){const slug=(s.track?.name||s.title||'setup').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase();return `GBR_Setup_${slug}_serie${s.series}.png`}
async function toBlob(s){const canvas=drawCanvas(s);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Falha ao gerar PNG')),'image/png'))}
function downloadBlob(blob,name){const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),12000)}
async function savePNG(s,share){
 const blob=await toBlob(s),name=filename(s);
 if(share&&navigator.share&&navigator.canShare){
  const file=new File([blob],name,{type:'image/png'});
  if(navigator.canShare({files:[file]})){
   try{await navigator.share({files:[file],title:'Setup GBR Racing Lab'});return}catch(e){if(e.name==='AbortError')return;}
  }
 }
 downloadBlob(blob,name);
}
function openPNG(s){
 if(previewModal)previewModal.remove();lastPNG=s;
 const canvas=drawCanvas(s);const dataURL=canvas.toDataURL('image/png');
 const dialog=document.createElement('div');dialog.className='gbr-png-modal';dialog.innerHTML=`<div class="gbr-png-back" data-close></div><section class="gbr-png-dialog" role="dialog" aria-modal="true" aria-label="Prévia do setup para salvar"><header><b>Prévia do PNG • ${esc(s.track?.name||'Meu setup')}</b><button type="button" data-close aria-label="Fechar">×</button></header><div class="gbr-png-scroll"><img src="${dataURL}" alt="Prévia do setup com carro, pilotos e boosts"><p>iPhone: use Compartilhar e escolha Salvar Imagem, quando disponível. PC: faça download do PNG.</p></div><footer><button type="button" id="gbrSharePng" class="btn primary">COMPARTILHAR / SALVAR</button><button type="button" id="gbrDownloadPng" class="btn outline">BAIXAR PNG</button></footer></section>`;
 document.body.append(dialog);previewModal=dialog;document.body.classList.add('gbr-png-open');
 dialog.querySelectorAll('[data-close]').forEach(el=>el.onclick=()=>{dialog.remove();previewModal=null;document.body.classList.remove('gbr-png-open')});
 dialog.querySelector('#gbrSharePng').onclick=async()=>{try{await savePNG(s,true)}catch(e){alert('Falha ao exportar: '+e.message)}};
 dialog.querySelector('#gbrDownloadPng').onclick=async()=>{try{await savePNG(s,false)}catch(e){alert('Falha ao gerar PNG: '+e.message)}};
}
openBuilder();
})();
