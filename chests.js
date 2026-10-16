// GBR Racing Lab — Controle individual de baús / ciclo 1–240.
// Referência visual da série 12 fornecida pela academia (2026-10-15).
// Este módulo não se conecta ao F1 Clash e não afirma obter resultados automaticamente.
(function(){
'use strict';
const $ = id => document.getElementById(id);
const TOTAL = 240;
const BOX_TYPES = {"verde":[1,2,3,4,5,6,7,9,10,11,12,14,15,17,18,19,21,22,23,24,26,28,29,30,31,33,34,35,36,38,39,41,42,43,44,46,47,49,50,51,52,54,55,57,58,59,61,62,63,64,66,68,69,70,71,73,74,75,76,78,79,81,82,83,85,86,87,89,90,91,92,94,95,97,98,99,101,102,103,104,106,108,109,110,111,113,114,115,116,118,119,121,122,123,124,126,127,129,130,131,132,134,135,137,138,139,141,142,143,144,146,148,149,150,151,153,154,155,156,158,159,161,162,163,164,166,167,169,170,171,172,174,175,177,178,179,181,182,183,184,186,188,189,190,191,193,194,195,196,198,199,201,202,203,204,206,207,209,210,211,212,214,215,217,218,219,221,222,223,224,226,228,229,230,231,233,234,235,236,238,239],"dourado":[8,13,16,20,25,27,37,40,48,53,56,60,65,67,77,80,84,88,96,100,105,107,112,117,120,125,128,136,140,145,147,152,157,160,168,173,176,180,185,187,192,197,200,205,208,216,220,225,227,232,237],"platina":[45,93,165,213],"lendario":[32,72,133,240]};
const TYPE_OF = Array(TOTAL+1).fill('verde');
for(const [kind,indices] of Object.entries(BOX_TYPES))for(const pos of indices)TYPE_OF[pos]=kind;
const TYPES = {
  verde:{label:'Verde · Comum',short:'Verde',symbol:'▣'},
  dourado:{label:'Dourado · Raro',short:'Dourado',symbol:'▣'},
  platina:{label:'Platina · Épico',short:'Platina',symbol:'◆'},
  lendario:{label:'Lendário',short:'Lendário',symbol:'★'}
};
const stateDefault=()=>({series:12,totalWins:0,gpWins:0,offset:0,calibrated:false,locator:{pattern:[],searched:false},history:[]});
function isValidInteger(v,min,max){return Number.isSafeInteger(Number(v)) && String(v).trim()!=='' && Number(v)>=min && Number(v)<=max}
function clampInt(x,min,max){return isValidInteger(x,min,max)?Number(x):min}
function state(){
  const garage=window.F1App?.getGarage?.();
  if(!garage)return stateDefault();
  if(!garage.chests || typeof garage.chests!=='object'||Array.isArray(garage.chests))garage.chests=stateDefault();
  const v=garage.chests;
  v.series=isValidInteger(v.series,1,12)?Number(v.series):12;
  v.totalWins=clampInt(v.totalWins,0,99999999);
  v.gpWins=clampInt(v.gpWins,0,v.totalWins);
  v.offset=clampInt(v.offset,0,239);
  if(!Array.isArray(v.history))v.history=[];
  v.calibrated=v.calibrated===true;
  if(!v.locator || typeof v.locator!=='object' || Array.isArray(v.locator))v.locator={pattern:[],searched:false};
  if(!Array.isArray(v.locator.pattern))v.locator.pattern=[];
  v.locator.pattern=v.locator.pattern.filter(k=>Object.hasOwn(TYPES,k)).slice(0,120);
  v.locator.searched=v.locator.searched===true;
  return v;
}
const loop=x=>((x%TOTAL)+TOTAL)%TOTAL;
function position(c){
  const wins=c.totalWins-c.gpWins;
  if(!wins && !c.offset && !c.calibrated)return 0;
  return loop(wins+c.offset-1)+1;
}
function distance(p,target){return loop(target-p)||TOTAL}
function nextByType(p,kind){
  for(let steps=1;steps<=TOTAL;steps++){
    const dest=loop(p+steps-1)+1;
    if(TYPE_OF[dest]===kind)return {pos:dest,in:steps};
  }
  return null;
}
function msg(message){const el=$('chestError');if(!message){el.textContent='';el.classList.add('hide');return}el.textContent=message;el.classList.remove('hide')}
function numericFields(){
  const totalRaw=$('chestTotalWins').value;
  const gpRaw=$('chestGpWins').value;
  if(!isValidInteger(totalRaw,0,99999999))throw new Error('Informe um total de vitórias válido, sem números negativos.');
  if(!isValidInteger(gpRaw,0,99999999))throw new Error('Informe o número de vitórias em GPs válido.');
  const totalWins=Number(totalRaw),gpWins=Number(gpRaw);
  if(gpWins>totalWins)throw new Error('As vitórias em GPs não podem ser maiores que o total de vitórias.');
  return {totalWins,gpWins};
}
function snapshot(c){return {series:c.series,totalWins:c.totalWins,gpWins:c.gpWins,offset:c.offset,calibrated:!!c.calibrated}}
function persist(c,label,before){
  const b=before||snapshot(c);
  const a=snapshot(c);
  if(JSON.stringify(a)===JSON.stringify(b))return false;
  c.history.unshift({at:new Date().toISOString(),label,before:b,after:a});
  c.history=c.history.slice(0,50);
  window.F1Session?.scheduleSave?.();
  return true;
}
function saveTotals(label){
  try{
    const {totalWins,gpWins}=numericFields(),c=state(),before=snapshot(c);
    c.totalWins=totalWins;c.gpWins=gpWins;
    const changed=persist(c,label||'Contadores atualizados',before);
    msg('');render();
    if(!changed)$('chestSyncHint').textContent='Nenhuma mudança nos contadores.';
    return true;
  }catch(err){msg(err.message);return false}
}
function plus(kind){
 try{
   const vals=numericFields(),c=state(),before=snapshot(c);
   if(vals.totalWins>=99999999)throw new Error('Limite de vitórias excedido.');
   c.totalWins=vals.totalWins+1;
   c.gpWins=vals.gpWins+(kind==='gp'?1:0);
   persist(c,kind==='gp'?'Vitória de GP registrada':'Vitória de duelo registrada',before);
   msg('');render();
 }catch(err){msg(err.message)}
}
function setSeries(){const c=state();const next=Number($('chestSeries').value);if(!isValidInteger(next,1,12))return;const before=snapshot(c);c.series=next;persist(c,'Série atualizada',before);msg('');render()}
function adjustPosition(){
 try{
   const val=$('chestKnownPosition').value;
   if(!isValidInteger(val,1,TOTAL))throw new Error('Informe uma posição entre 1 e 240.');
   if(!pendingCalibration)throw new Error('Confira a prévia antes de confirmar.');
   const vals=numericFields(),c=state();
   if(pendingCalibration.pos!==Number(val)||pendingCalibration.totalWins!==vals.totalWins||pendingCalibration.gpWins!==vals.gpWins||pendingCalibration.series!==c.series){pendingCalibration=null;throw new Error('Os dados mudaram. Confira a prévia novamente.');}
   const before=snapshot(c);
   c.totalWins=vals.totalWins;c.gpWins=vals.gpWins;
   c.offset=loop(Number(val)-(c.totalWins-c.gpWins));c.calibrated=true;
   persist(c,'Posição calibrada em '+Number(val)+(pendingCalibration.source==='locator'?' pelo localizador':''),before);
   pendingCalibration=null;$('chestCalibration').classList.add('hide');
   msg('');render();$('chestLocatorStatus').textContent='Posição aplicada. Você pode desfazer pelo histórico de alterações.';
 }catch(err){msg(err.message)}
}
let pendingCalibration=null;
function openCalibration(pos='',source='manual'){
 pendingCalibration=null;
 $('chestCalibration').classList.remove('hide');
 $('chestKnownPosition').value=pos;
 $('chestCalibration').dataset.source=source;
 $('chestCalibrationPreview').textContent='Informe a posição do último baú recebido, de 1 a 240. Seus contadores reais serão mantidos.';
 $('chestConfirmPosition').disabled=true;
 $('chestKnownPosition').focus();
 if(pos)previewCalibration();
 $('chestCalibration').scrollIntoView?.({behavior:'smooth',block:'center'});
}
function previewCalibration(){
 try{
  const val=$('chestKnownPosition').value,c=state(),vals=numericFields();
  if(!isValidInteger(val,1,TOTAL))throw new Error('Informe uma posição entre 1 e 240.');
  const pos=Number(val),next=loop(pos)+1;
  pendingCalibration={pos,...vals,series:c.series,source:$('chestCalibration').dataset.source};
  $('chestCalibrationPreview').innerHTML=`${chestImage(TYPE_OF[pos])}<div>Posição atual: <b>${position(c)||'não definida'}</b> → <b>${pos} / 240</b><br>Último recebido: ${TYPES[TYPE_OF[pos]].label}. Próximo: ${next} · ${TYPES[TYPE_OF[next]].short}.<br>Total: ${vals.totalWins}; GPs: ${vals.gpWins}. A calibração será salva separadamente.</div>`;
  $('chestConfirmPosition').disabled=false;msg('');
 }catch(err){pendingCalibration=null;$('chestConfirmPosition').disabled=true;msg(err.message)}
}
function findCandidates(pattern){
 if(!Array.isArray(pattern)||!pattern.length||pattern.length>120||pattern.some(k=>!Object.hasOwn(TYPES,k)))return [];
 const found=[];
 for(let end=1;end<=TOTAL;end++){
  if(pattern.every((kind,index)=>TYPE_OF[loop(end-pattern.length+index)+1]===kind))found.push(end);
 }
 return found;
}
function locatorSave(){window.F1Session?.scheduleSave?.()}
function editPattern(action,value){
 const c=state(),loc=c.locator;
 if(action==='add'){
  if(loc.pattern.length>=120){$('chestLocatorStatus').textContent='Limite de 120 baús atingido. Remova uma entrada antes de continuar.';return}
  if(!Object.hasOwn(TYPES,value))return;
  loc.pattern.push(value);
 }else if(action==='remove')loc.pattern.splice(value,1);
 else if(action==='undo')loc.pattern.pop();
 else if(action==='clear')loc.pattern=[];
 loc.searched=false;locatorSave();renderLocator(c);
}
function searchPattern(){const c=state();c.locator.searched=true;locatorSave();renderLocator(c)}
function renderLocator(c){
 if(!$('chestPattern'))return;
 const loc=c.locator,verified=c.series===12;
 $('chestPatternCount').textContent=loc.pattern.length+' / 120';
 $('chestPattern').innerHTML=loc.pattern.length?loc.pattern.map((kind,index)=>`<li>${chestImage(kind)}<span>${index+1}º · ${TYPES[kind].short}</span><button type="button" class="btn outline" data-remove-chest="${index}" aria-label="Remover baú ${index+1}, ${TYPES[kind].short}">×</button></li>`).join(''):'<li class="muted">Adicione os baús na ordem em que foram recebidos.</li>';
 $('chestPatternUndo').disabled=!loc.pattern.length;$('chestPatternClear').disabled=!loc.pattern.length;
 $('chestPatternSearch').disabled=!verified||!loc.pattern.length;
 const root=$('chestLocatorResults');root.innerHTML='';
 if(!verified){$('chestLocatorStatus').textContent='Localização suspensa: o mapa foi validado apenas para a Série 12. Seu rascunho foi preservado.';return}
 if(!loc.searched){$('chestLocatorStatus').textContent=loc.pattern.length?'Sequência atualizada. Toque em Buscar posições.':'Use apenas baús que avançam este ciclo. Informe a ordem de recebimento, não a ordem de abertura.';return}
 if(!loc.pattern.length){$('chestLocatorStatus').textContent='Adicione pelo menos um baú para buscar.';return}
 const candidates=findCandidates(loc.pattern);
 $('chestLocatorStatus').textContent=!candidates.length?'Nenhuma correspondência. Confira a ordem e se houve baús não registrados.':candidates.length===1?'Uma correspondência no mapa cadastrado. Confira os próximos baús antes de aplicar.':candidates.length+' posições possíveis. Adicione mais baús recebidos para reduzir as possibilidades.';
 root.innerHTML=candidates.map(pos=>{
  const next=Array.from({length:3},(_,i)=>{const at=loop(pos+i)+1;return `<div>${chestImage(TYPE_OF[at])}<small>${at} · ${TYPES[TYPE_OF[at]].short}</small></div>`}).join('');
  return `<article class="chest-candidate"><h3>Posição ${pos} / 240</h3><p>Último recebido: ${TYPES[TYPE_OF[pos]].short}</p><div class="chest-candidate-next">${next}</div><button type="button" class="btn primary" data-candidate-pos="${pos}">CONFERIR POSIÇÃO ${pos}</button></article>`;
 }).join('');
}
function undo(){
 const c=state();
 if(!c.history.length){msg('Não há alterações anteriores para desfazer.');return}
 const last=c.history.shift();
 c.series=last.before.series;c.totalWins=last.before.totalWins;c.gpWins=last.before.gpWins;c.offset=last.before.offset;c.calibrated=last.before.calibrated===true;
 window.F1Session?.scheduleSave?.();msg('');render();
}
function chestImage(kind,extra=''){return `<img class="chest-photo ${extra}" src="assets/chests/${kind}.png" width="76" height="76" alt="Baú ${TYPES[kind].short}" decoding="async">`}
function upcomingCards(p){
 const cards=[];
 for(let i=1;i<=5;i++){
  const at=loop(p+i-1)+1;
  const kind=TYPE_OF[at],t=TYPES[kind];
  cards.push(`<div class="chest-next ${kind}">${chestImage(kind)}<div><b>${at} · ${t.short}</b><small>Em ${i} ${i===1?'vitória':'vitórias'} de duelo</small></div></div>`);
 }
 return cards.join('')
}
function renderMap(p){
 const el=$('chestMap');if(!el)return;
 let html='';
 for(let col=0;col<12;col++)html+=`<div class="chest-map-header" aria-hidden="true">${col*20+1}–${col*20+20}</div>`;
 for(let row=0;row<20;row++)for(let col=0;col<12;col++){
   const pos=col*20+row+1,kind=TYPE_OF[pos];
   // Display order matches the reference: columns 1–20, 21–40, ... 221–240.
   const marked=p===pos?' current':p && pos<p?' past':'';
   const next=pos===(loop(p)+1)&&p!==pos?' next':'';
   const aria=`Baú ${pos}, ${TYPES[kind].label}${pos===p?', sua posição atual':''}`;
   html+=`<div class="chest-cell ${kind}${marked}${next}" data-chest-pos="${pos}" role="img" aria-label="${aria}" title="${aria}">${pos}</div>`;
 }
 el.innerHTML=html;
}
function renderHistory(c){
 const root=$('chestHistory');if(!root)return;
 if(!c.history.length){root.innerHTML='<p class="muted mini">Nenhuma alteração registrada até o momento.</p>';return}
 root.innerHTML=c.history.slice(0,8).map(item=>{
   const date=new Date(item.at);
   const moment=Number.isFinite(date.getTime())?date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'—';
   const description=typeof item.label==='string'?item.label.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])):'Alteração';
   const cur=(item.after?.totalWins||0)-(item.after?.gpWins||0);
   return `<div class="chest-history-row"><div><b>${description}</b><small>${moment}</small></div><span>${cur} vitórias de duelos</span></div>`;
 }).join('');
}
function render(){
 if(!$('chestSeries'))return;
 const c=state();const p=position(c);const verified=c.series===12;
 $('chestSeries').value=String(c.series);
 $('chestTotalWins').value=String(c.totalWins);
 $('chestGpWins').value=String(c.gpWins);
 $('chestPositionDisplay').textContent=p?p+' / 240':'— / 240';
 const duel=c.totalWins-c.gpWins;
 const platinum=nextByType(p,'platina'),legendary=nextByType(p,'lendario');
 const stat=(title,value,info='',kind='')=>`<div class="chest-stat${kind?' has-photo':''}">${kind?chestImage(kind,'chest-stat-photo'):''}<span>${title}</span><b>${value}</b>${info?`<small class="muted">${info}</small>`:''}</div>`;
 $('chestStats').innerHTML=[
   stat('Vitórias em duelos',duel.toLocaleString('pt-BR')),
   stat('Posição no ciclo',p||'—','de 240',p?TYPE_OF[p]:''),
   stat('Próximo Platina',verified?platinum.in:'—',verified?'duelos restantes':'sequência não verificada','platina'),
   stat('Próximo Lendário',verified?legendary.in:'—',verified?'duelos restantes':'sequência não verificada','lendario')
 ].join('');
 $('chestSeriesNotice').textContent=verified
  ?'Sequência da série 12 conferida com a imagem enviada pela academia. Vitórias de GP não avançam os baús.'
  :'A sequência de 240 baús foi confirmada apenas para a série 12. Abaixo exibimos esse mapa como referência; previsões para a série selecionada estão suspensas até serem verificadas.';
 $('chestUpcoming').innerHTML=verified?upcomingCards(p):'<div class="warn">Aguardando validação da sequência de recompensas desta série. Seu progresso continua registrado normalmente.</div>';
 $('chestSyncHint').textContent=document.getElementById('syncText')?.textContent?.includes('DEMONSTRAÇÃO')?'Demonstração local: sem sincronização.':'O progresso fica guardado junto à sua garagem particular na nuvem. Aguarde o status “Salvo na nuvem”.';
 renderMap(p);renderHistory(c);renderLocator(c);
}
function gotoCurrent(){const p=position(state());const pos=p||1;const el=$('chestMap')?.querySelector(`[data-chest-pos="${pos}"]`);if(el)el.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}
function init(){
 const sel=$('chestSeries');if(!sel)return;
 for(let i=1;i<=12;i++){const o=document.createElement('option');o.value=String(i);o.textContent='Série '+i;sel.appendChild(o)}
 sel.addEventListener('change',setSeries);
 $('chestSaveTotals').addEventListener('click',()=>saveTotals());
 $('chestDuelPlus').addEventListener('click',()=>plus('duel'));
 $('chestGpPlus').addEventListener('click',()=>plus('gp'));
 $('chestUndo').addEventListener('click',undo);
 $('chestSetPosition').addEventListener('click',()=>openCalibration(position(state())||''));
 $('chestCancelPosition').addEventListener('click',()=>{pendingCalibration=null;$('chestCalibration').classList.add('hide');msg('')});
 $('chestPreviewPosition').addEventListener('click',previewCalibration);
 $('chestKnownPosition').addEventListener('input',()=>{pendingCalibration=null;$('chestConfirmPosition').disabled=true});
 $('chestConfirmPosition').addEventListener('click',adjustPosition);
 $('chestGoCurrent').addEventListener('click',gotoCurrent);
 $('chestPatternAdd').addEventListener('click',event=>{const b=event.target.closest('[data-add-chest]');if(b)editPattern('add',b.dataset.addChest)});
 $('chestPattern').addEventListener('click',event=>{const b=event.target.closest('[data-remove-chest]');if(b)editPattern('remove',Number(b.dataset.removeChest))});
 $('chestPatternUndo').addEventListener('click',()=>editPattern('undo'));
 $('chestPatternClear').addEventListener('click',()=>editPattern('clear'));
 $('chestPatternSearch').addEventListener('click',searchPattern);
 $('chestLocatorResults').addEventListener('click',event=>{const b=event.target.closest('[data-candidate-pos]');if(!b)return;const c=state(),pos=Number(b.dataset.candidatePos);if(c.series!==12||!findCandidates(c.locator.pattern).includes(pos))return;openCalibration(pos,'locator')});
 render();
}
window.F1Chests={render,position,nextByType,findCandidates,sequence:TYPE_OF,verify:(total,gp)=>position({totalWins:total,gpWins:gp,offset:0})};
init();
})();
