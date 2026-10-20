/* GBR 5.5.13 — Interface compacta. Dados privados da conta; não utiliza API de IA nem analisa terceiros. */
(()=>{'use strict';
const $=id=>document.getElementById(id),model=window.GBRRaceLearning;
let urls=[];
let ocrBusy=false;const queuedRead=new Set();
const pitEvidence={own:null,rival:null};let lastCarOCR=null;
const garage=()=>window.F1App?.getGarage?.()||null;
const records=()=>Array.isArray(garage()?.raceAnalyses)?garage().raceAnalyses.slice(-model.MAX):[];
const favorites=()=>model.favoriteInventory(garage());
const tracks=()=>Array.isArray(window.F1Tracks?.all)?window.F1Tracks.all:[];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>x===null||x===undefined?'—':Number(x).toLocaleString('pt-BR',{maximumFractionDigits:2});
const trackName=id=>tracks().find(t=>t.id===id)?.name||id;
const carFields=['speed','corner','power','qualifying','pit','overtaking'];
const carLabel=key=>key==='overtaking'?'Modo de Ultrapassagem':key==='pit'?'Tempo médio de Pit Stop (s)':model.LABELS[key];
const pilotId=(side,slot,key)=>`rlPilot-${side}-${slot}-${key}`;
function updatePitNote(){
 const node=$('rlPitEstimateNote');if(!node)return;
 const notes=[['own','Você'],['rival','Rival']].filter(([side])=>pitEvidence[side]).map(([side,label])=>
  `${label}: ≈ ${fmt(pitEvidence[side].value)} s (estimado por 7 peças, não lido do print)`);
 node.textContent=notes.join(' · ');
 node.hidden=!notes.length;
}
function clearPit(side){
 pitEvidence[side]=null;
 const input=$('rl'+(side==='own'?'Own':'Rival')+'-pit');
 if(input){delete input.dataset.estimated;delete input.dataset.estimateMethod;}
 updatePitNote();
}
function applyPitEstimate(side,estimate){
 const input=$('rl'+(side==='own'?'Own':'Rival')+'-pit');
 if(!estimate||!input||input.value.trim())return false;
 input.value=String(estimate.value);
 input.dataset.ocr='suggested';input.dataset.estimated='true';input.dataset.estimateMethod=estimate.method;
 pitEvidence[side]={value:estimate.value,method:estimate.method,partsCount:7};
 updatePitNote();return true;
}
function considerPitEstimates(data){
 const estimator=window.GBRPitEstimate;
 if(!estimator)return;
 const parts=estimator.identifyFromCarPrint?.(data,window.F1Reference)||{};
 for(const side of ['own','rival']){
  if(!parts[side])continue;
  applyPitEstimate(side,estimator.fromParts?.(parts[side],window.F1Reference));
 }
 if(!pitEvidence.own){
  const favorite=(garage()?.favoriteSetups||[]).find(f=>f.id===$('rlFavorite').value);
  if(favorite){
   const stats=Object.fromEntries(['speed','corner','power','qualifying'].map(k=>[k,$('rlOwn-'+k).value]));
   applyPitEstimate('own',estimator.fromFavorite?.(favorite,stats,window.F1Reference));
  }
 }
}
function renderDriverEditor(){
 const people=[['own',0,'VOCÊ · PILOTO 1'],['own',1,'VOCÊ · PILOTO 2'],['rival',0,'RIVAL · PILOTO 1'],['rival',1,'RIVAL · PILOTO 2']];
 const rarityOptions=[['','Conferir raridade'],['Common','Comum'],['Rare','Raro'],['Epic','Épico'],['Legendary','Lendário']];
 const raritySelect=rarityOptions.map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
 const seriesSelect='<option value="">Série desconhecida</option>'+Array.from({length:12},(_,i)=>`<option value="${i+1}">Série ${i+1}</option>`).join('');
 $('rlDriverRoster').innerHTML=people.map(([side,slot,label])=>`<div class="rl-driver-card ${side==='rival'?'rival':''}"><h4>${label}</h4><div class="rl-driver-card-fields"><label>Nome<input type="text" autocomplete="off" maxlength="70" id="${pilotId(side,slot,'name')}" aria-label="Nome ${label}" placeholder="Nome do piloto"></label><label>Nível<input type="number" inputmode="numeric" min="1" max="50" id="${pilotId(side,slot,'level')}" aria-label="Nível ${label}" placeholder="Nv."></label></div><div class="rl-driver-card-meta"><label>Raridade<select id="${pilotId(side,slot,'rarity')}" aria-label="Raridade ${label}">${raritySelect}</select></label><label>Série da carta<select id="${pilotId(side,slot,'series')}" aria-label="Série da carta ${label}">${seriesSelect}</select></label></div><small class="rl-driver-ocr-note" id="${pilotId(side,slot,'status')}">Identificação pendente de conferência.</small></div>`).join('');
 $('rlDriverRows').innerHTML=model.PILOT_FIELDS.map(key=>`<div class="rl-driver-metric-row"><label>${esc(model.PILOT_LABELS[key])}</label>${people.map(([side,slot])=>`<input type="number" inputmode="numeric" step="0.01" min="0" max="1000" id="${pilotId(side,slot,key)}" aria-label="${esc(model.PILOT_LABELS[key])} ${side==='own'?'seu':'rival'} piloto ${slot+1}" placeholder="—">`).join('')}</div>`).join('');
}
function selectedDrivers(){
 const people={};let hasAny=false;
 for(const side of ['own','rival'])people[side]=[0,1].map(slot=>{
  const name=$(pilotId(side,slot,'name')).value.trim(),level=$(pilotId(side,slot,'level')).value.trim();
  const rarity=$(pilotId(side,slot,'rarity')).value,series=$(pilotId(side,slot,'series')).value;
  const stats=Object.fromEntries(model.PILOT_FIELDS.map(key=>[key,$(pilotId(side,slot,key)).value.trim()]));
  if(name||level||rarity||series||Object.values(stats).some(Boolean))hasAny=true;
  return {name,level,rarity,series,stats};
 });
 return hasAny?people:null;
}

function renderDriverHistory(r){
 const d=r?.driverComparison;if(!d?.own||!d?.rival)return '';
 const label=(p)=>esc(p?.name)+' (Nv. '+esc(p?.level)+(p?.rarity?' · '+esc(p.rarity):'')+(p?.series?' · S'+esc(p.series):'')+')';
 const rows=model.PILOT_FIELDS.map(key=>{
  const val=(side,i)=>{
   const value=d[side][i]?.stats?.[key];
   if(model.suspiciousPilotStat(value))return `${fmt(value)} ⚠`;
   return fmt(value);
  };
  return `<div class="rl-driver-history-row"><span>${esc(model.PILOT_LABELS[key])}</span><span>${val('own',0)}</span><span>${val('own',1)}</span><span>${val('rival',0)}</span><span>${val('rival',1)}</span></div>`;
 }).join('');
 const issues=model.PILOT_FIELDS.flatMap(key=>['own','rival'].flatMap(side=>[0,1].filter(slot=>model.suspiciousPilotStat(d[side][slot]?.stats?.[key]))
  .map(slot=>`<button type="button" class="btn outline rl-correct-stat" data-fix-id="${esc(r.id)}" data-fix-side="${side}" data-fix-slot="${slot}" data-fix-key="${key}">Corrigir ${esc(d[side][slot].name)} · ${esc(model.PILOT_LABELS[key])}</button>`))).join('');
 const detail=model.pilotDifferences(d).map(x=>`${esc(x.label)}: média dupla ${fmt(x.own)} × ${fmt(x.rival)}`).join(' · ');
 return `<details class="rl-driver-history"><summary>4 pilotos: ${label(d.own[0])}, ${label(d.own[1])} × ${label(d.rival[0])}, ${label(d.rival[1])}</summary><div class="rl-driver-history-table"><div class="rl-driver-history-row"><b>Atributo</b><b>Seu 1</b><b>Seu 2</b><b>Rival 1</b><b>Rival 2</b></div>${rows}</div>${model.PILOT_FIELDS.some(k=>[...d.own,...d.rival].some(p=>model.suspiciousPilotStat(p?.stats?.[k])))?'<p class="rl-muted">⚠ Valor suspeito do OCR, excluído das médias e do parecer. Confira o print antes de corrigir.</p>':''}${issues?`<div class="rl-correction-actions">${issues}</div>`:''}<div>Médias da dupla: ${detail||'Não calculáveis por dados incompletos.'}</div></details>`;
}

function init(){const tab=$('raceLearning');if(!tab)return;
 $('rlSeries').innerHTML=Array.from({length:12},(_,i)=>`<option value="${i+1}">Série ${i+1}</option>`).join('');$('rlSeries').value='12';
 $('rlTrack').innerHTML='<option value="">Selecione a pista</option>'+tracks().map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
 $('rlMetricRows').innerHTML=carFields.map(key=>`<div class="rl-metric-row"><label for="rlOwn-${key}">${esc(carLabel(key))}</label><input type="number" inputmode="decimal" step="0.01" min="0" max="${key==='pit'?60:1000}" id="rlOwn-${key}" aria-label="Meu ${esc(carLabel(key))}" placeholder="—"><input type="number" inputmode="decimal" step="0.01" min="0" max="${key==='pit'?60:1000}" id="rlRival-${key}" aria-label="Rival ${esc(carLabel(key))}" placeholder="—"></div>`).join('');
 renderDriverEditor();
 renderTyreEditor();
 updatePitNote();
 // Correções manuais deixam de ser sugestões descartáveis quando o print muda.
 for(const id of ['rlDriverRoster','rlDriverRows','rlMetricRows'])for(const kind of ['input','change'])
  $(id).addEventListener(kind,event=>{
   if(event.target?.dataset?.ocr)delete event.target.dataset.ocr;
   if(event.target?.dataset?.reference)delete event.target.dataset.reference;
   if(event.target?.id==='rlOwn-pit')clearPit('own');
   if(event.target?.id==='rlRival-pit')clearPit('rival');
  });
 $('rlForm').addEventListener('submit',saveRace);
 $('rlOCR').addEventListener('click',()=>enqueueRead(['cars','drivers']));
 $('rlFavorite').addEventListener('change',applyFavorite);
 for(const id of ['rlSeries','rlTrack'])$(id).addEventListener('change',()=>{renderSummary();updateReference();});
 for(const id of ['rlEventName','rlEventRace','rlContext'])$(id).addEventListener('change',updateReference);
 $('rlEventCategory').addEventListener('change',syncEventSeries);
 $('rlRaceKind').addEventListener('change',()=>{$('rlEventFields').hidden=$('rlRaceKind').value!=='event';syncEventSeries();});
 $('rlTotalLaps').addEventListener('input',updateStintPreview);
 $('rlRecords').addEventListener('click',event=>{
  const fix=event.target.closest?.('button[data-fix-id]');
  if(fix){correctHistoricalStat(fix.dataset);return;}
  const b=event.target.closest?.('button[data-race-remove]');if(b)removeRace(b.dataset.raceRemove);
 });
 for(const side of ['cars','drivers']){
  $('rlImage-'+side).addEventListener('change',()=>{previewFile(side);if($('rlImage-'+side).files?.[0])enqueueRead([side]);});
 }
 $('rlClear').addEventListener('click',()=>{if(!confirm('Limpar os campos do comparativo? Nada salvo será apagado.'))return;resetRaceEditor();document.querySelectorAll('#raceLearning [data-ocr]').forEach(el=>delete el.dataset.ocr);});
 refresh();
 updateReference();
}
function clearPreviews(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[];for(const s of ['cars','drivers']){$('rlPreview-'+s).replaceChildren();$('rlImage-'+s).value='';}}
function clearAutoSuggestions(side){
 if(side==='cars'){clearPit('own');clearPit('rival');lastCarOCR=null;}
 const ids=side==='drivers'?['rlDriverRoster','rlDriverRows']:['rlMetricRows'];
 for(const id of ids)for(const input of $(id).querySelectorAll('input[data-ocr="suggested"],select[data-ocr="suggested"]')){
  input.value='';delete input.dataset.ocr;
 }
 if(side==='drivers')for(const team of ['own','rival'])for(const slot of [0,1]){
  $(pilotId(team,slot,'status')).textContent='Identificação pendente de conferência.';
 }
}
function previewFile(side){clearAutoSuggestions(side);const file=$('rlImage-'+side).files?.[0];const target=$('rlPreview-'+side);target.replaceChildren();if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){$('rlMessage').textContent='Envie somente PNG, JPG ou WebP com até 12 MB.';$('rlImage-'+side).value='';return;}
 const u=URL.createObjectURL(file);urls.push(u);const img=document.createElement('img');img.src=u;img.alt='Print selecionado para conferência';target.appendChild(img);
 $('rlMessage').textContent='Compare visualmente os números do seu lado (esquerda) e do rival (direita). O print não será armazenado.';
}
// Preencher SOMENTE cartas comprovadas por fingerprint único; campos preexistentes
// (digitados ou originados de favorito) são autoridade maior que sugestões OCR.
function applyCardMatches(matches){
 let filled=0,conflicts=0,unverified=0;
 const sameName=(a,b)=>{
  const clean=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/[^a-z ]/g,' ').trim().split(/\s+/).at(-1);
  return clean(a)===clean(b)&&clean(a)!=='hill'; // Hill exige nome completo.
 };
 for(const suggestion of matches){
  const i=suggestion.slot,side=i<2?'own':'rival',slot=i%2;
  const status=$(pilotId(side,slot,'status'));
  if(!['catalog-match','catalog-suggestion','report-reference-match','report-reference-review','legendary-header','legendary-name-review'].includes(suggestion.status)){
   unverified++;
   if(status)status.textContent=suggestion.status==='ambiguous'?'Várias cartas possíveis: escolha manualmente.':
    suggestion.status==='not-in-catalog'?'Carta sem correspondência no catálogo: confira manualmente (ex.: lendário).':
    'Dados incompletos para identificar esta carta. Confira manualmente.';
   continue;
  }
  const keys=['name','level','rarity','series'];
  const contradicts=keys.some(k=>{
   const input=$(pilotId(side,slot,k));if(!input||!input.value.trim()||suggestion[k]===undefined)return false;
   return k==='name'?!sameName(input.value,suggestion.name):String(input.value)!==String(suggestion[k]);
  });
  if(contradicts){conflicts++;if(status)status.textContent='Divergência entre OCR e campo preenchido: revisão manual necessária.';continue;}
  for(const key of keys){
   const input=$(pilotId(side,slot,key)),value=suggestion[key];
   if(!input||input.value.trim()||value===undefined)continue;
   input.value=String(value);input.dataset.ocr='suggested';filled++;
  }
  // O quinto atributo só é sugerido se a carta for única entre TODAS as referências
  // e quatro atributos observados baterem exatamente. Nunca chamar isso de OCR.
  if(suggestion.suggestedStatKey&&Number.isFinite(suggestion.suggestedStatValue)){
   const input=$(pilotId(side,slot,suggestion.suggestedStatKey));
   if(input&&!input.value.trim()){
    input.value=String(suggestion.suggestedStatValue);
    input.dataset.ocr='suggested';input.dataset.reference='card';filled++;
   }
  }
  if(status)status.textContent=suggestion.status==='report-reference-review'?
   'Fangio provável: 4/5 atributos conferem com relatório anterior. Valor faltante sugerido pela referência (NÃO OCR). Confirme no print antes de salvar.':
   suggestion.status==='report-reference-match'?'Lendário reconhecido pelos 5 atributos de relatório anterior. Confirme no print atual.':
   suggestion.status==='catalog-match'?'Carta identificada pelo catálogo (5/5). Confira os dados antes de salvar.':
   suggestion.status==='legendary-header'?'Nome e nível lidos do print; lendário sem atributos catalogados. Confira antes de salvar.':
   suggestion.status==='legendary-name-review'?'Lendário provável identificado pelo nome; informe o nível do print e confirme raridade.':
   'Carta provável pelo catálogo (4/5 atributos). O quinto valor foi sugerido pela carta (NÃO OCR). Confira antes de salvar.';
 }
 return {filled,conflicts,unverified};
}
// A seleção de ambos os prints pode ocorrer antes de o OCR anterior terminar.
// A fila garante leitura individual, inclusive se um novo arquivo chegar durante o OCR.
function enqueueRead(sides){
 for(const side of sides)if(['cars','drivers'].includes(side)&&$('rlImage-'+side).files?.[0])queuedRead.add(side);
 if(!ocrBusy&&queuedRead.size)void readPrints();
}
// Segunda leitura LOCAL de uma faixa da imagem: pode recuperar letras pequenas
// sem enviar o arquivo a serviços externos. No Safari sem canvas/bitmap, falha
// silenciosamente e o fluxo de conferência manual continua disponível.
async function scanBand(ocr,file,start,end){
 if(typeof createImageBitmap!=='function'||!document?.createElement)return null;
 let image;
 try{
  image=await createImageBitmap(file);
  const left=0,top=Math.round(image.height*start),width=image.width,height=Math.round(image.height*end)-top;
  if(width<100||height<40)return null;
  const scale=Math.min(2,1800/width,1350/height);
  const canvas=document.createElement('canvas');if(typeof canvas.getContext!=='function')return null;
  canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
  const context=canvas.getContext('2d',{willReadFrequently:false});if(!context)return null;
  context.filter='grayscale(1) contrast(150%)';
  context.drawImage(image,left,top,width,height,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)return null;
  const parsed=await ocr.recognize(blob,'por+eng',{logger:()=>{}});
  const words=(Array.isArray(parsed?.data?.words)?parsed.data.words:[]).map(word=>{
   const b=word.bbox||word.boundingBox||word.bounding_box;
   if(!b)return word;
   return {...word,bbox:{x0:b.x0/scale+left,x1:b.x1/scale+left,y0:b.y0/scale+top,y1:b.y1/scale+top}};
  });
  // Ancora a largura conhecida para as mesmas bandas horizontais do OCR original.
  words.push({text:'',confidence:0,bbox:{x0:width-1,x1:width,y0:0,y1:1}});
  return {words};
 }catch(_error){return null;}
 finally{image?.close?.();}
}
function useCarReadings(data){
 let filled=0,conflicts=0;
 const suggestions=window.GBRLearningOCR?.suggest?.(data,'cars')||[];
 for(const suggestion of suggestions)for(const [side,which,value] of [['own','Own',suggestion.own],['rival','Rival',suggestion.rival]]){
  const input=$('rl'+which+'-'+suggestion.key);if(!input||!Number.isFinite(value))continue;
  if(input.value.trim()){
   if(input.dataset.estimated==='true'&&suggestion.key==='pit'){
    input.value=String(value);input.dataset.ocr='suggested';clearPit(side);filled++;continue;
   }
   if(Math.abs(Number(input.value)-Number(value))>.005)conflicts++;
   continue;
  }
  input.value=String(value);input.dataset.ocr='suggested';filled++;
 }
 return {filled,conflicts};
}
function useDriverReadings(data){
 let filled=0,conflicts=0,unverified=0;
 const suggestions=window.GBRLearningOCR?.suggestDriverColumns?.(data)||window.GBRLearningOCR?.suggestFourDrivers?.(data)||[];
 for(const suggestion of suggestions)for(const [i,value] of suggestion.values.entries()){
  if(!Number.isFinite(value))continue;
  if(model.suspiciousPilotStat(value)){
   unverified++;
   const team=i<2?'own':'rival',slot=i%2;
   const note=$(pilotId(team,slot,'status'));
   if(note)note.textContent=`Leitura de ${model.PILOT_LABELS[suggestion.key]} suspeita (${value}). Confira o print e preencha manualmente.`;
   continue;
  }
  const which=i<2?'own':'rival',slot=i%2,input=$(pilotId(which,slot,suggestion.key));if(!input)continue;
  if(input.value.trim()){
   // OCR real tem prioridade sobre valor sugerido por referência da carta.
   // Edições manuais nunca recebem dataset.reference e continuam preservadas.
   if(input.dataset.reference==='card'){
    input.value=String(value);input.dataset.ocr='suggested';delete input.dataset.reference;filled++;continue;
   }
   if(Math.abs(Number(input.value)-value)>.005)conflicts++;
   continue;
  }
  input.value=String(value);input.dataset.ocr='suggested';filled++;
 }
 const cards=window.GBRLearningOCR?.identifyDriverCards?.(data,window.F1Reference)||[];
 const match=applyCardMatches(cards);filled+=match.filled;conflicts+=match.conflicts;unverified+=match.unverified;
 for(const suggestion of suggestions)for(const [i,value] of suggestion.values.entries())if(model.suspiciousPilotStat(value)){
  const side=i<2?'own':'rival',slot=i%2,note=$(pilotId(side,slot,'status'));
  if(note)note.textContent=`⚠ ${model.PILOT_LABELS[suggestion.key]} = ${value} parece erro do OCR. Digite o valor do print.`;
 }
 return {filled,conflicts,unverified};
}
async function readPrints(){
 if(ocrBusy)return;
 const button=$('rlOCR');ocrBusy=true;button.disabled=true;button.textContent='LENDO NO NAVEGADOR...';
 $('rlMessage').textContent='Lendo os prints no navegador; revise todos os valores antes de salvar.';
 let filled=0,conflicts=0,unverified=0;
 try{
  const ocr=await window.GBRGaragePlus?.loadOCR?.();if(!ocr)throw Error('Biblioteca OCR indisponível no momento.');
  while(queuedRead.size){
   const side=queuedRead.values().next().value;queuedRead.delete(side);
   const id='rlImage-'+side,file=$(id).files?.[0];if(!file)continue;
   const parsed=await ocr.recognize(file,'por+eng',{logger:()=>{}});
   if($(id).files?.[0]!==file){$('rlMessage').textContent='Print trocado durante a leitura; analisando a imagem mais recente.';continue;}
   if(side==='drivers'){
    const main=useDriverReadings(parsed?.data);filled+=main.filled;conflicts+=main.conflicts;unverified=main.unverified;
    const missingMetrics=model.PILOT_FIELDS.some(key=>[0,1].some(i=>
     [['own',i],['rival',i]].some(([team,slot])=>{const input=$(pilotId(team,slot,key));return !input.value||input.dataset.reference==='card';})));
    if(missingMetrics){
     const retry=await scanBand(ocr,file,.43,.68);
     if(retry&&$(id).files?.[0]===file){
      const combined=window.GBRLearningOCR?.withHeaderWords?.(parsed?.data,retry)||retry;
      const again=useDriverReadings(combined);filled+=again.filled;conflicts+=again.conflicts;unverified+=again.unverified;
     }
    }
    // Refazer apenas a faixa inferior em escala ampliada; rótulo completo é
    // "Gerenciamento de pneus" no jogo. A estimativa pela carta continua revisável.
    if([0,1].some(i=>[['own',i],['rival',i]].some(([team,slot])=>{const input=$(pilotId(team,slot,'tyreUse'));return !input.value||input.dataset.reference==='card';}))){
     const tyreBand=await scanBand(ocr,file,.58,.65);
     if(tyreBand&&$(id).files?.[0]===file){
      const combined=window.GBRLearningOCR?.withHeaderWords?.(parsed?.data,tyreBand)||tyreBand;
      const again=useDriverReadings(combined);filled+=again.filled;conflicts+=again.conflicts;unverified+=again.unverified;
     }
    }
    const missingIdentity=[['own',0],['own',1],['rival',0],['rival',1]].some(([team,slot])=>!$(pilotId(team,slot,'name')).value);
    if(missingIdentity){
     const header=await scanBand(ocr,file,.335,.42);
     if(header&&$(id).files?.[0]===file){
      const joined=window.GBRLearningOCR?.withHeaderWords?.(parsed?.data,header)||parsed?.data;
      const match=applyCardMatches(window.GBRLearningOCR?.identifyDriverCards?.(joined,window.F1Reference)||[]);
      filled+=match.filled;conflicts+=match.conflicts;unverified=match.unverified;
     }
    }
    // Última checagem: 4/5 atributos únicos podem identificar a carta mesmo
    // quando Tesseract não consegue ler o nome pequeno na foto.
    const finalMatch=applyCardMatches(window.GBRLearningOCR?.identifyDriverCards?.(parsed?.data,window.F1Reference)||[]);
    filled+=finalMatch.filled;conflicts+=finalMatch.conflicts;unverified+=finalMatch.unverified;
    // O OCR pode separar as quatro linhas em leituras diferentes. Embora os
    // atributos estejam nos inputs, identificar apenas a partir do bloco OCR
    // original deixava Fangio em branco. Reconciliar os quatro valores já
    // reconhecidos, SEM usar sugestões de carta como se fossem OCR.
    const observedColumns=[['own',0],['own',1],['rival',0],['rival',1]].map(([team,slot])=>
     Object.fromEntries(model.PILOT_FIELDS.map(key=>{
      const field=$(pilotId(team,slot,key));
      const fromRealOcr=field?.dataset.ocr==='suggested'&&field?.dataset.reference!=='card';
      const raw=fromRealOcr?field.value.trim():'';
      const num=raw!==''?Number(raw):NaN;
      return [key,Number.isFinite(num)&&!model.suspiciousPilotStat(num)?num:null];
     })));
    const candidates=window.GBRLearningOCR?.identifyDriverCardsFromFields?.(observedColumns,window.F1Reference)||[];
    const reconciled=applyCardMatches(candidates);
    filled+=reconciled.filled;conflicts+=reconciled.conflicts;unverified+=reconciled.unverified;
   }else{
    lastCarOCR=parsed?.data;
    const main=useCarReadings(parsed?.data);filled+=main.filled;conflicts+=main.conflicts;
    const missing=carFields.some(key=>!$('rlOwn-'+key).value||!$('rlRival-'+key).value);
    if(missing){
     const retry=await scanBand(ocr,file,.48,.82);
     if(retry&&$(id).files?.[0]===file){
      const combined=window.GBRLearningOCR?.withHeaderWords?.(parsed?.data,retry)||retry;
      const again=useCarReadings(combined);filled+=again.filled;conflicts+=again.conflicts;
     }
     const stillMissing=['pit','overtaking'].some(key=>!$('rlOwn-'+key).value||!$('rlRival-'+key).value);
     if(stillMissing){
      const bottom=await scanBand(ocr,file,.57,.78);
      if(bottom&&$(id).files?.[0]===file){
       const combined=window.GBRLearningOCR?.withHeaderWords?.(parsed?.data,bottom)||bottom;
       const again=useCarReadings(combined);filled+=again.filled;conflicts+=again.conflicts;
      }
     }
    }
    const pitMissing=!$('rlOwn-pit').value||!$('rlRival-pit').value;
    if(pitMissing){
     const header=await scanBand(ocr,file,.22,.46);
     if(header&&$(id).files?.[0]===file)lastCarOCR=window.GBRLearningOCR?.withHeaderWords?.(lastCarOCR,header)||lastCarOCR;
     considerPitEstimates(lastCarOCR);
    }
   }
  }
  $('rlMessage').textContent=filled?`Leitura automática: ${filled} campo(s) sugerido(s). Confira os dados antes de salvar.${unverified?' '+unverified+' piloto(s) sem identificação suficiente.':''}${conflicts?' '+conflicts+' divergência(s) exigem revisão.':''}`:
   'Nenhum campo pôde ser identificado com segurança. Revise o print e complete manualmente.';
 }catch(e){$('rlMessage').textContent='Leitura indisponível ou inconclusiva: '+String(e?.message||'erro')+'. Nenhum histórico foi salvo.';queuedRead.clear();}
 finally{ocrBusy=false;button.disabled=false;button.textContent='▣ Reler prints (assistido)';
  if(queuedRead.size)void readPrints();}
}

// 5.5.14C: a volta da parada é a ÚLTIMA volta do stint anterior.
const tyreNames={soft:'Macio',medium:'Médio',hard:'Duro',wet:'Chuva'};
const tyreOptions='<option value="">Escolha</option>'+Object.entries(tyreNames).map(([value,name])=>`<option value="${value}">${name}</option>`).join('');
const tyreId=(i,key,j)=>`rlTyre-${i}-${key}${j===undefined?'':'-'+j}`;
function renderTyreEditor(){
 const host=$('rlTyrePilots');if(!host)return;
 host.innerHTML=[0,1].map(i=>`<div class="rl-tyre-pilot"><h4>Seu piloto ${i+1} · estratégia</h4>
  <label class="rl-field">Pneu de largada<select id="${tyreId(i,'start')}">${tyreOptions}</select></label>
  <label class="rl-field">Número de paradas<select id="${tyreId(i,'count')}"><option value="0">Nenhuma</option><option value="1" selected>1 parada</option><option value="2">2 paradas</option><option value="3">3 paradas</option></select></label>
  ${[0,1,2].map(j=>`<div class="rl-tyre-stop" id="${tyreId(i,'row',j)}" ${j?'hidden':''}>
   <label class="rl-field">${j+1}ª parada: ao final da volta<input type="number" inputmode="numeric" min="1" max="199" id="${tyreId(i,'lap',j)}" placeholder="Volta"></label>
   <label class="rl-field">Pneu colocado<select id="${tyreId(i,'compound',j)}">${tyreOptions}</select></label></div>`).join('')}
  </div>`).join('');
 for(const i of [0,1])$(tyreId(i,'count')).addEventListener('change',()=>{
  const n=Number($(tyreId(i,'count')).value);
  for(let j=0;j<3;j++)$(tyreId(i,'row',j)).hidden=j>=n;
  updateStintPreview();
 });
 for(const action of ['input','change'])host.addEventListener(action,updateStintPreview);
}
function selectedTyres(){
 const totalLaps=$('rlTotalLaps').value;
 const own=[0,1].map(i=>{
  const count=Number($(tyreId(i,'count')).value);
  return {startCompound:$(tyreId(i,'start')).value,stops:Array.from({length:count},(_,j)=>({lap:$(tyreId(i,'lap',j)).value,compound:$(tyreId(i,'compound',j)).value}))};
 });
 return model.cleanTyreStrategy({totalLaps,own});
}
function syncEventSeries(){
 if($('rlRaceKind').value==='event'){
  const max={junior:3,challenger:6,contender:9,champion:12}[$('rlEventCategory').value];
  if(Number($('rlSeries').value)>max)$('rlSeries').value=String(max);
 }
 updateReference();
}
function competition(){
 if($('rlRaceKind')?.value!=='event')return null;
 return {mode:'event',eventId:$('rlEventName').value,category:$('rlEventCategory').value,race:$('rlEventRace').value};
}
function lookupReference(data){
 const ref=window.GBRStrategyReference;
 return ref?.lookup?.({competition:data.competition,series:data.series,trackId:data.trackId,
  totalLaps:data.totalLaps,context:data.context,asOf:new Date().toISOString()})||null;
}
function updateReference(){
 const panel=$('rlReferencePanel'),note=$('rlReferenceNote');if(!note||!panel)return;
 const ref=lookupReference({competition:competition(),series:Number($('rlSeries').value),trackId:$('rlTrack').value,
  totalLaps:Number($('rlTotalLaps').value),context:$('rlContext').value});
 // Fonte externa continua disponível ao parecer interno. Não ocupar a tela
 // com avisos de referência indisponível em cada corrida.
 if(ref?.status!=='revisada'||!Array.isArray(ref.stints)){panel.hidden=true;note.textContent='';return;}
 panel.hidden=false;
 note.textContent='AllClash · '+ref.stints.map((p,i)=>`Piloto ${i+1}: ${p.map(([c,n])=>`${tyreNames[c]} ${n}v`).join(' → ')}`).join(' | ');
}
function updateStintPreview(){
 const node=$('rlStintPreview');if(!node)return;
 try{
  const tyres=selectedTyres();
  node.textContent=tyres.own.map((p,i)=>`Piloto ${i+1}: `+model.tyreStints(p,tyres.totalLaps).map(stint=>`${tyreNames[stint.compound]} ${stint.from}–${stint.to}`).join(' → ')).join(' | ');
 }catch(e){node.textContent='Confira voltas, compostos e paradas dos dois pilotos antes de salvar.';}
 updateReference();
}
function renderVerdict(record,previous,host){
 const ref=lookupReference({competition:record.competition,series:record.series,trackId:record.trackId,
  totalLaps:record.tyreStrategy?.totalLaps,context:record.context});
 const result=window.GBRRaceVerdict?.explain?.(record,previous,ref);
 if(!result||!host)return;
 const items=arr=>arr.map(s=>`<li>${esc(s)}</li>`).join('');
 host.innerHTML=`<strong>${esc(result.headline)}</strong><p class="rl-verdict-subtitle">${esc(result.confidence)} · parecer sem inferência causal</p>
  <h3>Fatos registrados</h3><ul>${items(result.facts)}</ul><h3>Hipóteses a testar</h3><ul>${items(result.hypotheses.length?result.hypotheses:['Não há evidência suficiente para sugerir uma causa.'])}</ul>
  <h3>O que testar na próxima corrida</h3><ul>${items(result.actions)}</ul><p class="rl-muted">${esc(result.caveat)}</p>`;
}
function resetRaceEditor(keepSeries=null,keepTrack=null){
 $('rlForm').reset();$('rlSeries').value=keepSeries?String(keepSeries):'12';
 if(keepTrack)$('rlTrack').value=keepTrack;
 $('rlRaceKind').value='series';$('rlEventFields').hidden=true;
 clearPreviews();for(const side of ['cars','drivers'])clearAutoSuggestions(side);updatePitNote();
 for(const i of [0,1])for(let j=0;j<3;j++)$(tyreId(i,'row',j)).hidden=j>0;
 updateStintPreview();renderSummary();
}
function applyFavorite(){const found=favorites().find(f=>f.id===$('rlFavorite').value);if(!found)return;
 for(const key of ['speed','corner','power','qualifying']){const input=$('rlOwn-'+key);if(!input.value.trim())input.value=found.stats[key]||'';}
 const favorite=(garage()?.favoriteSetups||[]).find(f=>f.id===found.id);
 // Não sobrescrever valores já conferidos; números da garagem são somente sugestões.
 if(favorite?.drivers?.length===2)for(let i=0;i<2;i++){
  const d=favorite.drivers[i];
  for(const key of ['name','level','rarity','series',...model.PILOT_FIELDS]){
   const input=$(pilotId('own',i,key));if(!input||input.value.trim())continue;
   const value=d[key];
   if(value!==null&&value!==undefined&&value!=='')input.value=String(value);
  }
 }
 considerPitEstimates(lastCarOCR);
 $('rlMessage').textContent='Carro e seus dois pilotos pré-preenchidos pelo favorito. Compare com o relatório da corrida e confirme os dois pilotos rivais; não salvamos valores automaticamente.';
}
function previewSummary(){const info=model.summary(records(),{series:Number($('rlSeries').value),trackId:$('rlTrack').value});const all=model.summary(records());
 const wins=all.wins;const pct=all.rate===null?'—':Math.round(all.rate*100)+'%';
 $('rlHighlights').innerHTML=`<div><small>SETUPS SALVOS</small><strong>${favorites().length}</strong></div><div><small>CORRIDAS REVISADAS</small><strong>${all.sample}</strong></div><div><small>VITÓRIAS REGISTRADAS</small><strong>${wins}</strong></div><div><small>TAXA OBSERVADA</small><strong>${pct}</strong></div>`;
 const name=$('rlTrack').value?trackName($('rlTrack').value):'Todas as pistas';
 $('rlEvidence').innerHTML=`<strong>${esc(name)} · Série ${Number($('rlSeries').value)||12}</strong><p>${info.sample} corrida(s), ${info.wins} vitória(s), ${info.losses} derrota(s). ${info.rate===null?'Sem taxa calculável.':`Vitórias observadas: ${Math.round(info.rate*100)}%.`}</p><p class="rl-muted">${info.sample<3?`Faltam ${3-info.sample} corrida(s) distinta(s) nesta pista e série para iniciar o diagnóstico. Os registros são somente desta garagem.`:info.quality==='insuficiente'?'Três ou mais corridas registradas, mas ainda é preciso ter pelo menos uma vitória e uma derrota para comparar resultados. Os dados já salvos continuam disponíveis.':info.quality==='preliminar'?'Diagnóstico inicial baseado em amostra pequena. As hipóteses não são previsões nem recomendações comprovadas.':'Observações mais consistentes, mas sem comprovação de causalidade.'}</p>`;
 const carPatterns=info.patterns.slice(0,3).map(p=>`<li><b>Carro · ${esc(p.label)}</b>: vantagem média nas vitórias ${fmt(p.winsMean)}; nas derrotas ${fmt(p.lossesMean)} (${p.observations} comparações). Não há prova causal.</li>`);
 const pilotPatterns=(info.pilotPatterns||[]).slice(0,3).map(p=>`<li><b>Pilotos · ${esc(p.label)}</b>: média das duas cartas; vantagem relativa nas vitórias ${fmt(p.winsMean)}, nas derrotas ${fmt(p.lossesMean)} (${p.observations} comparações completas). Hipótese observacional.</li>`);
 $('rlPatterns').innerHTML=[...carPatterns,...pilotPatterns].join('')||'<li>Não há padrão estatístico suficiente para esta combinação de pista e série.</li>';
 $('rlExperiments').innerHTML=info.experiments.length?info.experiments.map(p=>`<li>${esc(p.text)} <small>Base: ${p.evidence} comparações · hipótese não comprovada.</small></li>`).join(''):'<li>Para gerar uma hipótese comparativa, registre ao menos 3 corridas diferentes da mesma pista e série, incluindo vitória e derrota, com indicadores comparáveis. Não inventamos padrões sem dados.</li>';
 const groups=info.favorites.filter(f=>favorites().some(s=>s.id===f.favoriteId));
 $('rlFavoritesInsight').innerHTML=groups.length?groups.map(f=>`<li><b>${esc(favorites().find(x=>x.id===f.favoriteId)?.name)}</b> — ${f.wins}/${f.total} vitórias; ${f.total>=10?'amostra em observação':'dados insuficientes para recomendação'}.</li>`).join(''):'<li>Selecione um favorito ao registrar corridas para medir seu histórico real nessa pista e série.</li>';
}
function renderSummary(){previewSummary();}
function refresh(){if(!$('raceLearning'))return;
 const selection=$('rlFavorite')?.value||'';
 $('rlFavorite').innerHTML='<option value="">Sem favorito vinculado</option>'+favorites().map(f=>`<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');
 $('rlFavorite').value=favorites().some(f=>f.id===selection)?selection:'';
 renderSummary();
 const data=records().slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 $('rlRecords').innerHTML=data.length?data.slice(0,25).map(r=>{const favorite=favorites().find(x=>x.id===r.favoriteId);const insight=model.recordInsights(r);const positives=insight.positives[0],negatives=insight.negatives[0];return `<article class="rl-record"><div><strong>${r.result==='win'?'✓ Vitória':'✕ Derrota'} · ${esc(trackName(r.trackId))}</strong><small>Série ${esc(r.series)} · ${esc(String(r.createdAt).slice(0,10))}${favorite?' · '+esc(favorite.name):''}</small><p>${positives?'Vantagem: '+esc(positives.label)+' '+fmt(positives.delta):'Sem vantagem mensurada'} · ${negatives?'Ponto de atenção: '+esc(negatives.label)+' '+fmt(Math.abs(negatives.delta)):'Sem desvantagem mensurada'}</p>${renderDriverHistory(r)}${r.tyreStrategy?`<p>Estratégia: ${r.tyreStrategy.totalLaps} voltas · paradas ${r.tyreStrategy.own.map(p=>p.stops.length).join("/")}</p>`:""}${r.competition?.mode==="event"?`<p>Evento: ${esc(r.competition.eventId)} · ${esc(r.competition.category)} · corrida ${esc(r.competition.race)}</p>`:""}<details class="rl-verdict-inline" data-verdict-id="${esc(r.id)}"><summary>Ver parecer da Inteligência GBR</summary><div class="rl-verdict-content"></div></details></div><button type="button" class="btn outline" data-race-remove="${esc(r.id)}" aria-label="Excluir este registro">Excluir</button></article>`;}).join(''):'<p class="rl-muted">Nenhuma corrida analisada nesta garagem. Seu histórico começa quando você salvar o primeiro comparativo revisado.</p>';
 // Parecer escapado; não modifica registros históricos.
 const visible=data.slice(0,25);
 for(const record of visible){
  const detail=[...$('rlRecords').querySelectorAll('details[data-verdict-id]')].find(el=>el.dataset.verdictId===record.id);
  if(detail)renderVerdict(record,data,detail.querySelector('.rl-verdict-content'));
 }
}
function saveRace(event){event.preventDefault();const own={},rival={};
 for(const key of carFields){own[key]=$('rlOwn-'+key).value;rival[key]=$('rlRival-'+key).value;}
 const driverComparison=selectedDrivers();
 try{
  const tyreStrategy=selectedTyres();
  const context=competition();
  const r=model.create({series:$('rlSeries').value,trackId:$('rlTrack').value,result:$('rlResult').value,
   favoriteId:$('rlFavorite').value,context:$('rlContext').value,note:$('rlNote').value,
   own,rival,driverComparison,tyreStrategy,competition:context,
   pitEvidence:{...Object.fromEntries(Object.entries(pitEvidence).filter(([side,v])=>v&&$('rl'+(side==='own'?'Own':'Rival')+'-pit').dataset.estimated==='true'))}},
   {ids:favorites().map(f=>f.id),tracks:tracks().map(t=>t.id),favoriteRecords:garage()?.favoriteSetups||[]});
  const previous=records();
  const list=model.add(garage(),r);garage().raceAnalyses=list;
  window.F1Session?.scheduleSave?.();
  const info=model.recordInsights(r);
  $('rlMessage').textContent=`Corrida registrada. ${info.coverage} atributos do carro comparados. Quatro pilotos individuais ${r.driverComparison?'registrados':'não informados'}. ${r.tyreStrategy.totalLaps} voltas, pneus registrados. Aguarde a sincronização da garagem.`;
  resetRaceEditor(r.series,r.trackId);refresh();
  const panel=$('rlVerdictPanel');panel.hidden=false;renderVerdict(r,previous,$('rlVerdictContent'));
  $('rlMessage').textContent='Corrida salva. Consulte o parecer GBR abaixo; aguarde a sincronização da garagem.';
 }catch(e){$('rlMessage').textContent=String(e?.message||'Confira os dados informados.');}
}
// A correção de dado histórico só é aplicada depois de validação e confirmação.
// O backup da garagem permanece externo; nunca importar dados privados como catálogo público.
function correctHistoricalStat(data){
 const side=data.fixSide,key=data.fixKey,slot=Number(data.fixSlot),id=data.fixId;
 if(!['own','rival'].includes(side)||!model.PILOT_FIELDS.includes(key)||![0,1].includes(slot))return;
 const current=records(),item=current.find(x=>x.id===id),old=item?.driverComparison?.[side]?.[slot]?.stats?.[key];
 if(!model.suspiciousPilotStat(old))return;
 const pilot=item.driverComparison[side][slot];
 const input=prompt(`O valor ${old} de ${model.PILOT_LABELS[key]} (${pilot.name}) parece incorreto. Confira o print e informe o valor certo:`,String(old));
 if(input===null)return;
 const value=Number(String(input).trim().replace(',','.'));
 if(!String(input).trim()||!Number.isFinite(value)||value<0||value>model.PILOT_OCR_PLAUSIBLE_MAX){
  $('rlMessage').textContent='Valor não corrigido: informe um número entre 0 e '+model.PILOT_OCR_PLAUSIBLE_MAX+'.';return;
 }
 if(!confirm(`Corrigir somente ${pilot.name}: ${model.PILOT_LABELS[key]} de ${old} para ${value}?`))return;
 const next=current.map(r=>r.id!==id?r:{...r,driverComparison:{...r.driverComparison,[side]:r.driverComparison[side].map((p,i)=>i!==slot?p:{...p,stats:{...p.stats,[key]:value}})}});
 garage().raceAnalyses=next;
 window.F1Session?.scheduleSave?.();refresh();
 $('rlMessage').textContent='Atributo corrigido no histórico. Aguarde a sincronização da garagem.';
}
function removeRace(id){const current=records(),item=current.find(x=>x.id===id);if(!item||!confirm('Excluir esta corrida do seu histórico privado?'))return;garage().raceAnalyses=current.filter(x=>x.id!==id);window.F1Session?.scheduleSave?.();refresh();$('rlMessage').textContent='Registro excluído. Aguarde a sincronização.';}
window.GBRLearningUI=Object.freeze({refresh});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
