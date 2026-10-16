/* GBR Racing Lab 5 — cadastro rápido por print. Não muda a apresentação da garagem padrão. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const fields={drivers:[['overtaking','Ultrapassagem'],['defending','Defesa'],['qualifying','Qualificação'],['raceStart','Início de corrida'],['tyreUse','Gerenciamento de pneus']],parts:[['speed','Velocidade'],['corner','Curvas'],['power','Unidade de potência'],['qualifying','Classificação'],['pit','Pit stop (segundos)']]};
const rarities=[['Common','Comum'],['Rare','Rara'],['Epic','Épica'],['Legendary','Lendário'],['Special','Escolhas do Paddock / Edição especial']];
const categories=['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio','Bateria'];
let view=null,selectedFile=null,filePreviewUrl=null,ocrText='',busy=false;
// Identidade da carta: a variante/edição é parte da chave. Cartas do mesmo piloto
// com títulos de edição diferentes devem coexistir, sem sobrescrita.
const editionKey = value=>norm(value).replace(/[^a-z0-9]+/g,' ').trim();
const sameCard=(existing,next,kind)=>norm(existing.name)===norm(next.name)&&existing.rarity===next.rarity&&(kind!=='drivers'||editionKey(existing.editionLabel)===editionKey(next.editionLabel));
function extractEdition(text){
 const raw=String(text||'');
 // Captura título e modificador mesmo com quebra de linha do OCR.
 const found=raw.match(/ESCOLHAS\s+DO\s+PADDOCK\s*(?::|[-–—])?\s*(TURBO|[A-ZÀ-Ú][A-ZÀ-Ú0-9 -]{1,35})?/i);
 if(!found)return '';
 const suffix=(found[1]||'').replace(/\s+/g,' ').trim();
 if(/^TURBO/i.test(suffix))return 'ESCOLHAS DO PADDOCK: TURBO';
 if(suffix && !/^(?:ESTAT|DISPON|COLET|ULTRAP|DEFESA|QUALIF|EVENTO|GERENC|IN[IÍ]CIO|ATRIB)/i.test(suffix))return ('ESCOLHAS DO PADDOCK: '+suffix).slice(0,70);
 return 'ESCOLHAS DO PADDOCK';
}
function alertMsg(message){let el=$('toast');if(!el)return;el.textContent=message;el.classList.remove('hide');clearTimeout(alertMsg.timer);alertMsg.timer=setTimeout(()=>el.classList.add('hide'),3300)}
function empty(kind){let obj={name:'',rarity:'Common',owned:true,level:1,series:1,progressCurrent:0,progressMax:0,importedByPrint:false};(fields[kind]||[]).forEach(([k])=>obj[k]=0);if(kind==='parts')obj.category='Motor';else obj.editionLabel='';return obj;}
function cleanNumber(v){const x=Number(String(v).replace(',','.'));return Number.isFinite(x)?Math.max(0,x):0}
function parseOCR(text,forced){
 const lines=String(text||'').split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
 const joined=lines.join(' '),normal=norm(joined);
 const driverSignal=['ultrapass','defesa','inicio de corrida','gerenciamento de pneus'].filter(t=>normal.includes(t)).length;
 const partSignal=['velocidade','curvas','unidade de potencia','pit stop'].filter(t=>normal.includes(t)).length;
 const kind=forced==='drivers'||forced==='parts'?forced:(driverSignal>=partSignal?'drivers':'parts');
 const data=empty(kind);data.importedByPrint=true;
 // Nome é sugestão: usa catálogo quando possível, mas aceita cartas inéditas.
 const candidates=kind==='drivers'?Array.from(new Set([...Object.values(window.F1Reference?.drivers||{}).map(x=>x.name),'Jenson Button','James Hunt','Graham Hill','Damon Hill','Alain Prost','Ayrton Senna','Michael Schumacher','Andrea Kimi Antonelli'])):Object.keys(window.F1Reference?.parts||{});
 const includes=candidates.filter(name=>normal.includes(norm(name)));
 if(includes.length)data.name=includes.sort((a,b)=>b.length-a.length)[0];
 else {
   const statIndex=lines.findIndex(l=>/estat.sticas|ultrapass|velocidade|power|defesa|qualifica/i.test(l));
   const segment=lines.slice(0,statIndex<0?Math.min(12,lines.length):statIndex);
   const rejected=/Disponibilidade|Contendor|Colete|Evento|Nível|Atribu|^\d+|Estat|F1 Clash|Especial|Lend|Comum|Rar|Épic|Epi[cq]|ESCOLHAS DO PADDOCK/i;
   const words=segment.filter(x=>!rejected.test(x)&&/[a-záàãéêíóôõúç]{3}/i.test(x)&&x.length<42);
   data.name=words.slice(-2).join(' ').trim().slice(0,60);
 }
 if(/edi..o especial|\bespecial\b|escolhas do paddock/i.test(normal))data.rarity='Special';
 else if(/lend.rio|legendary|legend.rio/i.test(normal))data.rarity='Legendary';
 else if(/\b.pic[ao]?\b|\bepic\b/i.test(normal))data.rarity='Epic';
 else if(/\brar[ao]\b|\brare\b/i.test(normal))data.rarity='Rare';
 else data.rarity='Common';
 if(kind==='drivers')data.editionLabel=extractEdition(joined);
 const progress=joined.match(/(?:\b|\s)(\d{1,3})\s*\/\s*(\d{1,4})(?:\b|\s)/);
 if(progress){data.progressCurrent=+progress[1];data.progressMax=+progress[2]}
 // OCR de nível separado da fração, ou número próximo ao progresso; incerto → usuário confirma.
 const levelHint=joined.match(/(?:n[ií]vel|level|lvl|nv\.?)[\s:#-]*(\d{1,2})/i);
 if(levelHint)data.level=+levelHint[1];
 else if(progress){const near=joined.match(/(?:^|\s)(\d{1,2})\s+(\d{1,3})\s*\/\s*(\d{1,4})(?=\s|$)/);if(near&&+near[2]===data.progressCurrent&&+near[3]===data.progressMax)data.level=+near[1];}
 const labels=kind==='drivers'?{
  overtaking:['Ultrapassando','Ultrapassagem','Overtaking'],defending:['Defesa','Defending'],
  qualifying:['Qualificação','Qualificacao','Qualifying'],raceStart:['Início de Corrida','Inicio de Corrida','Largada','Race Start'],
  tyreUse:['Gerenciamento de pneus','Gestão de pneus','Tyre Management']
 }: {speed:['Velocidade','Speed'],corner:['Curvas','Cornering'],power:['Unidade de potência','Potência','Potencia','Power Unit'],qualifying:['Classificação','Classificacao','Qualificação','Qualificacao'],pit:['Pit stop','Tempo de pit','Pit']};
 for(const [key,options] of Object.entries(labels)){
   let value=null;
   for(const label of options){
     // Aceita quebra de linha, mas evita capturar número de um campo distante.
     const exact=lines.findIndex(line=>norm(line).startsWith(norm(label)));
     if(exact>=0){
       const row=lines[exact];const rest=row.slice(label.length).match(/\b(\d{1,3}(?:[,.]\d+)?)\b/);
       if(rest){value=cleanNumber(rest[1]);break}
       const next=lines[exact+1]; if(next&&/^\d{1,3}(?:[,.]\d+)?$/.test(next)){value=cleanNumber(next);break}
     }
   }
   if(value!==null)data[key]=value;
 }
 if(kind==='parts'){
   const ref=window.F1Reference?.parts?.[data.name];
   if(ref){data.category=window.GBRPartCategories?.[data.name]||data.category;data.series=ref.series||1;}
 }
 return {kind,data,text:joined};
}
async function loadOCR(){
 if(window.Tesseract)return window.Tesseract;
 if(loadOCR.promise)return loadOCR.promise;
 loadOCR.promise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
   script.referrerPolicy='no-referrer';script.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(Error('Motor OCR indisponível'));
   script.onerror=()=>reject(Error('Não foi possível carregar a leitura automática de imagens. Verifique a conexão.'));
   document.head.appendChild(script);
 }).catch(e=>{loadOCR.promise=null;throw e});
 return loadOCR.promise;
}
function openModal(){
 if(view)return;
 const modal=document.createElement('div');modal.id='gbrQuickModal';modal.className='gbr-sheet';
 modal.innerHTML=`<div class="gbr-sheet-back" data-close></div><section class="gbr-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="gbrQuickTitle"><header class="gbr-sheet-head"><div><div class="kicker">MINHA GARAGEM / CADASTRO ASSISTIDO</div><h2 id="gbrQuickTitle">Importar por print</h2></div><button type="button" class="gbr-x" data-close aria-label="Fechar">×</button></header><div class="gbr-sheet-body"><div class="gbr-print-mode"><label class="field">Tipo de carta <select id="gbrQuickKind"><option value="auto">Detectar automaticamente</option><option value="drivers">Piloto</option><option value="parts">Peça</option></select></label><label class="gbr-drop" for="gbrQuickFile"><span class="gbr-drop-icon">▧</span><b>Escolher print do F1 Clash</b><small>PNG, JPG ou WebP • até 12 MB • sem enviar a imagem à garagem</small><input id="gbrQuickFile" type="file" accept="image/png,image/jpeg,image/webp" hidden></label></div><div class="gbr-print-preview" id="gbrPrintPreview"></div><p class="gbr-ocr-status" id="gbrOcrStatus" role="status">O reconhecimento sugere dados. Sempre confira antes de salvar.</p><div class="gbr-btnbar"><button class="btn outline" type="button" id="gbrManualDriver">Criar piloto manual</button><button class="btn outline" type="button" id="gbrManualPart">Criar peça manual</button></div></div></section>`;
 document.body.appendChild(modal);document.body.classList.add('gbr-sheet-open');view=modal;
 modal.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);
 $('gbrManualDriver').onclick=()=>showEditor('drivers',empty('drivers'));
 $('gbrManualPart').onclick=()=>showEditor('parts',empty('parts'));
 $('gbrQuickFile').onchange=async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){$('gbrOcrStatus').textContent='Arquivo inválido: envie PNG, JPG ou WebP com até 12 MB.';return}
  selectedFile=file;if(filePreviewUrl)URL.revokeObjectURL(filePreviewUrl);
  filePreviewUrl=URL.createObjectURL(file);
  $('gbrPrintPreview').innerHTML=`<img src="${safe(filePreviewUrl)}" alt="Prévia do print enviado"><span>A imagem é usada apenas na revisão; não será gravada na garagem.</span>`;
  $('gbrOcrStatus').textContent='Analisando imagem no navegador. Aguarde...';
  try{
   busy=true;const lib=await loadOCR();const result=await lib.recognize(file,'por+eng',{logger:()=>{}});
   ocrText=result?.data?.text||'';if(!ocrText.trim())throw Error('Não foi possível identificar textos neste print.');
   const parsed=parseOCR(ocrText,$('gbrQuickKind').value);
   showEditor(parsed.kind,parsed.data,{sourceScreenshot:true});
  }catch(error){$('gbrOcrStatus').textContent=`Leitura automática não concluída: ${error.message}. Escolha criação manual para continuar.`;}
  finally{busy=false;e.target.value='';}
 };
}
function closeModal(){if(busy)return;if(view){view.remove();view=null}if(filePreviewUrl){URL.revokeObjectURL(filePreviewUrl);filePreviewUrl=null}selectedFile=null;ocrText='';document.body.classList.remove('gbr-sheet-open');}
function editExisting(kind,id){const target=window.F1App?.getGarage?.()?.[kind]?.find(x=>x.id===id);if(!target)return;showEditor(kind,{...target},{id});}
function showEditor(kind,initial,meta={}){
 if(!view)openModal();const box=view.querySelector('.gbr-sheet-body');const isDriver=kind==='drivers';const item={...empty(kind),...(initial||{})};const hasScreenshot=!!meta.sourceScreenshot;
 const preview=hasScreenshot&&filePreviewUrl?`<div class="gbr-original-preview"><img src="${safe(filePreviewUrl)}" alt="Print original do jogo usado na leitura"><div><b>Conferência do print</b><small>Confira o original e corrija os campos ao lado. Esta foto não será salva na garagem.</small></div></div>`:'';
 const fieldRows=fields[kind].map(([key,label])=>`<label class="field gbr-edit-stat"><span>${safe(label)}</span><input name="${safe(key)}" inputmode="decimal" type="number" min="0" max="9999" step="${key==='pit'?'0.01':'1'}" value="${Number(item[key]||0)}" required></label>`).join('');
 box.innerHTML=`${preview}<form id="gbrQuickForm" class="gbr-quick-form"><p class="gbr-review-note">${meta.id?'Editando carta existente. Os demais dados serão preservados.':'Confira as informações. A leitura por imagem pode errar números e nomes.'}</p><div class="gbr-form-grid"><label class="field gbr-span2">Nome ${isDriver?'do piloto':'da peça'}<input name="name" maxlength="80" required value="${safe(item.name)}" placeholder="Nome como aparece no jogo"></label><label class="field">Raridade<select name="rarity">${rarities.filter(([v])=>isDriver||!['Legendary','Special'].includes(v)).map(([v,t])=>`<option value="${v}" ${v===item.rarity?'selected':''}>${t}</option>`).join('')}</select></label><label class="field">Nível<input type="number" name="level" min="0" max="99" value="${Number(item.level)||0}" required></label><label class="field">Série<input type="number" name="series" min="1" max="12" value="${Number(item.series)||1}" required></label>${isDriver?`<label class="field gbr-span2">Edição / subtítulo<input name="editionLabel" maxlength="70" placeholder="Ex.: Escolhas do Paddock" value="${safe(item.editionLabel||'')}"></label>`:`<label class="field">Categoria<select name="category">${categories.map(c=>`<option ${item.category===c?'selected':''}>${c}</option>`).join('')}</select></label>`}<label class="field">Cartas atuais<input type="number" name="progressCurrent" min="0" value="${Number(item.progressCurrent)||0}"></label><label class="field">Próximo upgrade<input type="number" name="progressMax" min="0" value="${Number(item.progressMax)||0}"></label></div><h3>Estatísticas ${isDriver?'do piloto':'da peça'}</h3><div class="gbr-stat-grid">${fieldRows}</div><label class="gbr-own"><input name="owned" type="checkbox" ${item.owned?'checked':''}> <span>Possuo esta ${isDriver?'carta de piloto':'peça'}</span></label><div class="gbr-btnbar"><button type="button" class="btn outline" id="gbrEditBack">Voltar</button><button type="submit" class="btn primary">${meta.id?'Salvar alterações':'Adicionar à minha garagem'}</button></div></form>`;
 view.querySelector('#gbrQuickTitle').textContent=meta.id?`Editar ${isDriver?'piloto':'peça'}`:`Conferir ${isDriver?'piloto':'peça'} do print`;
 // Identificação imediata: evita tentar salvar uma raridade já existente.
 const hint=document.createElement('div');hint.className='gbr-existing-hint';hint.setAttribute('role','status');$('gbrQuickForm').querySelector('.gbr-form-grid').after(hint);
 function validateDuplicate(){const f=$('gbrQuickForm');const test={name:f.elements.name.value.trim(),rarity:f.elements.rarity.value,editionLabel:isDriver?f.elements.editionLabel.value:''};const match=window.F1App?.getGarage?.()?.[kind]?.find(x=>x.id!==meta.id&&sameCard(x,test,kind));if(match){hint.textContent=match.owned?'Esta carta já está na sua garagem nesta raridade. Use a ficha existente para editar ou exclua a duplicata.':'Esta carta já existe no catálogo, mas você ainda não a marcou como sua; ao salvar, ela será atualizada.';hint.classList.add('has-match')}else{hint.textContent='✓ Nenhuma carta idêntica encontrada.';hint.classList.remove('has-match')}}
 ['name','rarity',...(isDriver?['editionLabel']:[])].forEach(k=>$('gbrQuickForm').elements[k]?.addEventListener('input',validateDuplicate));validateDuplicate();

 $('gbrEditBack').onclick=()=>{closeModal();openModal();};
 $('gbrQuickForm').onsubmit=e=>{
  e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;
  const raw=Object.fromEntries(new FormData(form));
  const name=String(raw.name||'').trim();if(name.length<2){alert('Informe um nome com pelo menos 2 caracteres.');return;}
  const payload={...item,name,rarity:raw.rarity,level:+raw.level,series:+raw.series,progressCurrent:+raw.progressCurrent||0,progressMax:+raw.progressMax||0,owned:form.querySelector('[name="owned"]').checked};
  if(kind==='parts')payload.category=raw.category;else payload.editionLabel=String(raw.editionLabel||'').trim().slice(0,70);
  fields[kind].forEach(([key])=>payload[key]=cleanNumber(raw[key]));
  if(hasScreenshot)payload.importedByPrint=true;
  if(kind==='parts'&&!['Common','Rare','Epic'].includes(payload.rarity)){alertMsg('Peças aceitam raridades Comum, Rara ou Épica.');return;}
  const list=window.F1App?.getGarage?.()?.[kind];if(!list){alert('Não foi possível abrir a garagem.');return}
  let target=meta.id?list.find(x=>x.id===meta.id):null;
  if(!target){
   const dupe=list.find(x=>sameCard(x,payload,kind));
   if(dupe){
     const unused=!dupe.owned&&(!dupe.level||dupe.level===0);
     if(!unused){alertMsg('Carta já cadastrada nesta raridade. Abra a ficha existente para editar.');showEditor(kind,{...dupe},{id:dupe.id});return;}
     target=dupe;
   }
  }
  // Mesmo em edição manual, nunca sobrescrever outra variante inadvertidamente.
  const conflict=list.find(x=>x.id!==target?.id && sameCard(x,payload,kind));
  if(conflict){alertMsg('Já existe esta carta com essa raridade e edição. Exclua ou edite a versão existente.');return;}
  const garage=window.F1App.getGarage();
  if(Array.isArray(garage.deletedCards?.[kind]))garage.deletedCards[kind]=garage.deletedCards[kind].filter(key=>key!==cardKey(payload,kind));
  if(target)Object.assign(target,payload);
  else list.push({id:(kind==='drivers'?'dcustom_':'pcustom_')+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'_'+Math.random().toString(36).slice(2)),...payload});
  window.F1App.refresh();window.F1Session?.scheduleSave?.();closeModal();alertMsg('Carta salva na sua garagem. Confira o status de sincronização.');
 };
}
function cardKey(x,kind){return [norm(x.name),x.rarity||'Common',kind==='drivers'?editionKey(x.editionLabel):''].join('|')}
function deleteCard(kind,id){
 const db=window.F1App?.getGarage?.();const list=db?.[kind];const index=list?.findIndex(x=>x.id===id)??-1;
 if(index<0)return false;
 const card=list[index];const references=(db.saved||[]).filter(x=>Array.isArray(x.ids)&&x.ids.includes(id)).length;
 const extra=references?` Ela aparece em ${references} setup(s) salvos, que precisarão ser revisados.`:'';
 if(!confirm(`Excluir ${card.name} (${rarities.find(([k])=>k===card.rarity)?.[1]||card.rarity}) desta garagem? Esta exclusão será sincronizada com sua conta.${extra}`))return false;
 if(!db.deletedCards||typeof db.deletedCards!=='object')db.deletedCards={parts:[],drivers:[]};
 if(!Array.isArray(db.deletedCards[kind]))db.deletedCards[kind]=[];
 const key=cardKey(card,kind);if(!db.deletedCards[kind].includes(key))db.deletedCards[kind].push(key);
 list.splice(index,1);
 window.F1App.refresh();window.F1Session?.scheduleSave?.();alertMsg('Carta excluída. Confira a sincronização antes de trocar de dispositivo.');return true;
}
function openManual(kind){openModal();showEditor(kind,empty(kind))}
function decorateGarage(){
 const garage=$('garage');if(!garage)return;
 const panel=garage.querySelector('.panel');if(!panel)return;
 if(!garage.querySelector('#gbrGarageQuickBar')){
  const bar=document.createElement('div');bar.id='gbrGarageQuickBar';bar.className='gbr-quick-bar';
  bar.innerHTML='<div><span class="kicker">CADASTRO RÁPIDO</span><strong>Peças e pilotos por print</strong><small>Cartas repetidas são detectadas por nome + raridade + edição.</small><span id="gbrDupSummary" class="gbr-duplicate-summary" aria-live="polite"></span></div><div class="gbr-bar-buttons"><button type="button" id="gbrOpenPrint" class="btn primary">▧ IMPORTAR PRINT</button><button type="button" id="gbrOpenManual" class="btn outline">+ NOVO ITEM</button></div>';
  const hint=panel.querySelector('.garage-hint');hint?hint.after(bar):panel.prepend(bar);
  $('gbrOpenPrint').onclick=openModal;
  $('gbrOpenManual').onclick=()=>openManual($('garageType').value);
 }
 const kind=$('garageType').value;const data=window.F1App?.getGarage?.()?.[kind]||[];const counts=new Map();data.forEach(c=>{const k=cardKey(c,kind);counts.set(k,(counts.get(k)||0)+1)});const copies=[...counts.values()].reduce((n,count)=>n+Math.max(0,count-1),0);if($('gbrDupSummary'))$('gbrDupSummary').textContent=copies?`⚠ ${copies} duplicata(s) detectada(s) · use Excluir na carta repetida`:'✓ Nenhuma duplicata identificada nesta categoria';
 const filter=$('rarityFilter');rarities.forEach(([value,label])=>{if(!Array.from(filter.options).some(o=>o.value===value))filter.add(new Option(label,value));});
 const table=$('garageTable')?.querySelector('table');if(!table)return;
 table.querySelectorAll('tbody tr').forEach(tr=>{
  const dataInput=tr.querySelector('input[data-id]');const id=dataInput?.dataset.id;
  if(!id)return;
  const cell=tr.querySelector('td:nth-child(2)');if(!cell||cell.querySelector('.gbr-row-edit'))return;
  if($('garageType').value==='drivers'){
    const item=window.F1App?.getGarage?.()?.drivers?.find(x=>x.id===id);
    if(item?.editionLabel){const variant=document.createElement('div');variant.className='gbr-edition-inline';variant.textContent=item.editionLabel;cell.append(variant);}
  }
  const btn=document.createElement('button');btn.type='button';btn.className='gbr-row-edit';btn.textContent='✎ Editar nome / ficha';btn.setAttribute('aria-label','Editar nome e dados desta carta');
  btn.addEventListener('click',()=>editExisting($('garageType').value,id));cell.append(btn);
 });
 // O seletor principal é preenchido e validado em renderGarage (app.js).
}
function bootstrap(){
 decorateGarage();const target=$('garageTable');if(!target)return;
 const observer=new MutationObserver(()=>decorateGarage());observer.observe(target,{childList:true});
 // Alt. de categoria e busca usam a renderização original do app.
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&view&&!busy)closeModal()});
 window.GBRGaragePlus={parseOCR,openPrint:openModal,openManual,deleteCard,editExisting,editionKey,sameCard,cardKey};
}
bootstrap();
})();
