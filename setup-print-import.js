/* GBR Racing Lab 5.5.12 — importação assistida de dois prints de setup.
   Os arquivos e o texto OCR ficam somente nesta sessão do navegador.
   O usuário revisa as sugestões no editor existente antes de salvar. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const parser=window.GBRSetupPrintParser;
 if(!parser||!$('favPrintWizard'))return;
 const allowed=['image/png','image/jpeg','image/webp'];
 const limit=12*1024*1024;
 let urls=new Map(),busy=false,active=false,currentOnDraft=null,previousFocus=null;
 const wizard=$('favPrintWizard');
 const short=s=>String(s||'').slice(0,100);
 const cleanup=()=>{for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();};
 const status=(message,error=false)=>{const node=$('favPrintStatus');if(node){node.textContent=message;node.classList.toggle('is-error',error);}};
 function close(){
  if(busy)return false;
  active=false;wizard.hidden=true;wizard.replaceChildren();cleanup();currentOnDraft=null;
  if(previousFocus?.isConnected)previousFocus.focus();
  return true;
 }
 function filePreview(input,id){
  const target=$(id),file=input.files?.[0];if(!target)return;
  target.replaceChildren();
  if(!file)return;
  if(!allowed.includes(file.type)||file.size>limit||file.size<=0){input.value='';status('Escolha uma imagem PNG, JPG ou WebP de até 12 MB.',true);return;}
  const previous=urls.get(id);if(previous)URL.revokeObjectURL(previous);
  const url=URL.createObjectURL(file);urls.set(id,url);
  const img=document.createElement('img');img.src=url;img.alt='Prévia local: '+(id==='favPrintCarPreview'?'carro':'pilotos');img.loading='lazy';
  target.appendChild(img);
  status('Print selecionado. Clique em “Ler e identificar” ou prossiga manualmente.');
 }
 function display(result){
  const list=$('favPrintDetected');if(!list)return;
  list.replaceChildren();
  const badge=(name,match,optional=false)=>{
   const row=document.createElement('div');row.className='fav-print-found';
   const left=document.createElement('span');left.textContent=name;
   const value=document.createElement('strong');value.textContent=match|| (optional?'Opcional':'Selecione na revisão');
   if(!match)row.classList.add('needs-review');
   row.append(left,value);return row;
  };
  for(const category of parser.categories){const id=result.partIds[category];const matched=result.parts.find(x=>x.id===id);list.appendChild(badge(category,matched?.name||'',category==='Bateria'));}
  for(let i=0;i<2;i++){
   const id=result.driverIds[i];const matched=result.drivers.find(x=>x.id===id);list.appendChild(badge('Piloto '+(i+1),matched?.name||''));
  }
  const warn=$('favPrintWarnings');warn.replaceChildren();
  const missing=[...result.absent];
  if(result.driverIds.some(x=>!x))missing.push('pilotos');
  const messages=[...result.ambiguities];
  if(missing.length)messages.push('Confira manualmente: '+missing.join(', ')+'.');
  if(messages.length){const p=document.createElement('p');p.textContent=messages.join(' ');warn.appendChild(p);}
  $('favPrintReview').hidden=false;
 }
 function draftFrom(result,name,garage){
  const picked=(kind,id)=>id?(garage?.[kind]||[]).find(x=>x.owned&&String(x.id)===String(id))||null:null;
  const parts=parser.categories.map(cat=>picked('parts',result.partIds[cat])).filter(Boolean);
  const drivers=result.driverIds.map(id=>picked('drivers',id)).filter(Boolean);
  return {name:short(name.trim()||'Setup importado do print'),parts,drivers,trackId:'',notes:''};
 }
 function open({getGarage,onDraft}){
  if(busy)return;
  close();active=true;currentOnDraft=onDraft;previousFocus=document.activeElement;
  wizard.hidden=false;
  wizard.innerHTML=`<div class="fav-print-header"><div><span class="kicker">CAPTURA ASSISTIDA / GARAGEM PESSOAL</span><h2>Importar setup por print</h2><p>Selecione o print das peças e, se tiver, outro print com os dois pilotos. A leitura é feita no seu navegador. Nada será salvo até sua confirmação.</p></div><button type="button" class="btn outline" id="favPrintClose">Fechar</button></div>
  <div class="fav-print-upload-grid"><label class="fav-print-drop"><span>01 · Print do carro</span><input id="favPrintCarFile" type="file" accept="image/png,image/jpeg,image/webp"><small>As sete peças da configuração do carro</small><span id="favPrintCarPreview" class="fav-print-preview"></span></label><label class="fav-print-drop"><span>02 · Print dos pilotos</span><input id="favPrintDriverFile" type="file" accept="image/png,image/jpeg,image/webp"><small>Dupla de pilotos, em outro print</small><span id="favPrintDriverPreview" class="fav-print-preview"></span></label></div>
  <label class="fav-field fav-print-name"><span>Nome do novo setup</span><input id="favPrintName" maxlength="64" value="Setup importado do print" placeholder="Ex.: Série 12 — corrida seca"></label>
  <p class="fav-print-caution">Os prints podem pertencer a slots diferentes. Confirme que as peças e os pilotos formam o setup desejado. Somente cartas já cadastradas como suas podem ser salvas.</p>
  <div class="fav-print-buttons"><button type="button" class="btn primary" id="favPrintRead">Ler e identificar</button><button type="button" class="btn outline" id="favPrintManual">Preencher manualmente</button></div>
  <p id="favPrintStatus" class="fav-print-status" role="status" aria-live="polite">Selecione uma ou duas imagens para começar.</p>
  <div class="fav-print-review" id="favPrintReview" hidden><div class="fav-print-review-head"><b>Conferência antes de salvar</b><small>Os nomes são sugestões. Use o editor para ajustar.</small></div><div id="favPrintDetected" class="fav-print-detected"></div><div id="favPrintWarnings" class="fav-print-warnings"></div><button type="button" class="btn primary" id="favPrintApply">Revisar seleção no editor →</button></div>`;
  $('favPrintCarFile').onchange=e=>filePreview(e.target,'favPrintCarPreview');
  $('favPrintDriverFile').onchange=e=>filePreview(e.target,'favPrintDriverPreview');
  $('favPrintClose').onclick=close;
  $('favPrintManual').onclick=()=>{const fn=currentOnDraft;close();fn?.({name:'Setup importado do print',parts:[],drivers:[]});};
  $('favPrintRead').onclick=async()=>{
   if(busy)return;
   const car=$('favPrintCarFile').files?.[0],drivers=$('favPrintDriverFile').files?.[0];
   if(!car&&!drivers){status('Selecione pelo menos um print para leitura.',true);return;}
   for(const file of [car,drivers].filter(Boolean))if(!allowed.includes(file.type)||file.size<=0||file.size>limit){status('Imagem inválida: envie PNG/JPG/WebP com até 12 MB.',true);return;}
   busy=true;$('favPrintRead').disabled=true;$('favPrintManual').disabled=true;$('favPrintClose').disabled=true;
   try{
    const lib=await window.GBRGaragePlus?.loadOCR?.();
    if(!lib||typeof lib.recognize!=='function')throw Error('Motor de leitura indisponível.');
    const read=async(file,label)=>{if(!file)return '';status('Analisando '+label+' no navegador…');const output=await lib.recognize(file,'por+eng',{logger:()=>{}});return String(output?.data?.text||'').slice(0,30000);};
    const carText=await read(car,'o carro');
    const driversText=await read(drivers,'os pilotos');
    if(!carText.trim()&&!driversText.trim())throw Error('Nenhum texto reconhecido nas imagens.');
    const legends=window.GBRLegendaryDrivers?.all||[];
    const garage=getGarage();
    const result=parser.reconcile(carText,driversText,garage,legends);
    display(result);
    const foundParts=Object.values(result.partIds).filter(Boolean).length;
    const foundDrivers=result.driverIds.filter(Boolean).length;
    status(`${foundParts}/7 peças · ${foundDrivers}/2 pilotos identificados. ${result.ready?'Confira as escolhas antes de salvar.':'Complete e confirme os campos restantes no editor.'}`);
    $('favPrintApply').onclick=()=>{
      const fn=currentOnDraft;
      const draft=draftFrom(result,$('favPrintName').value,garage);
      close();fn?.(draft);
    };
   }catch(error){status('Leitura automática indisponível ou incompleta: '+short(error?.message)+'. Use “Preencher manualmente” para continuar.',true);}
   finally{busy=false;for(const id of ['favPrintRead','favPrintManual','favPrintClose'])if($(id))$(id).disabled=false;}
  };
  wizard.scrollIntoView?.({behavior:'smooth',block:'start'});
  $('favPrintCarFile').focus();
 }
 // O navegador pode dispensar a página sem passar pelo botão Fechar.
 window.addEventListener('pagehide',()=>{if(!busy)close()});
 window.GBRSetupPrint=Object.freeze({open,close,isOpen:()=>active});
})();
