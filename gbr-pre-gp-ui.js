/* GBR Pré-GP UI v1 — análise em memória, sem alteração de garagem, conta ou nuvem. */
(()=>{
'use strict';
const reports=new Map();
let lastSessionKey=null;
function sessionKey(){const c=window.F1Session?.getContext?.();return c?.demo?'demo':c?.userId?'user:'+c.userId:'no-session';}
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABELS={soft:'Macio',medium:'Médio',hard:'Duro',wet:'Chuva'};
function parsedFor(eventId){
 const entry=reports.get(eventId);
 if(entry)return entry.parsed;
 const event=window.GBREvents?.all?.find(e=>e.id===eventId);
 if(!event?.briefingText||!window.GBRPreGP)return null;
 try{return window.GBRPreGP.parseBriefing(event.briefingText,{tracks:window.F1Tracks?.all||[]})}
 catch{return null}
}
function raceFor(eventId,categoryId,trackId,stage,round){
 const parsed=parsedFor(eventId);
 return window.GBRPreGP?.resolve?.(parsed,{categoryId,trackId,stage,round})?.race||null;
}
function reportFeedback(eventId){
 const entry=reports.get(eventId),parsed=parsedFor(eventId);
 if(!parsed)return 'Sem relatório adicional: usando pistas e regras já cadastradas no GBR.';
 const matching=parsed.entries.length;
 const warnings=parsed.warnings.slice(0,3).join(' ');
 return matching+' corrida(s) reconhecida(s) no texto. '+warnings+
  (entry?' O texto está somente na memória desta sessão.':' Briefing cadastrado no evento.');
}
function briefingHTML(eventId){
 const text=reports.get(eventId)?.text||'';
 return '<section class="panel gp-panel gp-pre-gp-input" aria-label="Texto detalhado do GP">'+
  '<span class="kicker">GBR PRÉ-GP / DADOS PRÓPRIOS</span><h3>Relatório do GP</h3>'+
  '<p>Cole o texto do evento com pistas, categorias, voltas, clima e prioridades. O GBR interpreta as linhas reconhecidas e cruza com sua garagem. Sem vídeos, importação de estratégias ou serviços externos.</p>'+
  '<label for="gpBriefingText">Exemplo: Júnior: / Corrida 1: Austin | 6 voltas | chuva 0% | carro: curvas | piloto: largada</label>'+
  '<textarea id="gpBriefingText" class="gp-pre-gp-textarea" maxlength="20000" rows="5" placeholder="Júnior:\nCorrida 1: Austin | 6 voltas | chuva 0% | carro: curvas | piloto: largada">'+esc(text)+'</textarea>'+
  '<div class="gp-pre-gp-actions"><button type="button" class="btn primary" id="gpBriefingApply">ANALISAR RELATÓRIO</button><button type="button" class="btn outline" id="gpBriefingClear">LIMPAR</button></div>'+
  '<p id="gpBriefingFeedback" class="gp-note" role="status">'+esc(reportFeedback(eventId))+'</p>'+
  '<p class="gp-note">Este campo é uma prévia local: não cadastra um GP para outras contas. Para distribuição global, o texto precisa entrar no cadastro oficial do evento após validação e autorização.</p></section>';
}
function tyresHTML(plan){
 if(!plan.tyreOptions.length)return '<p>Sem voltas, clima e durabilidades suficientes para recomendar stints numéricos. Cadastre a durabilidade por pista e série na Biblioteca de Pistas.</p>';
 return plan.tyreOptions.map((option,i)=>{
  const total=option.stints.reduce((sum,st)=>sum+st.laps,0);
  if(total!==plan.laps)return '';
  return '<p><b>'+(i?'Alternativa '+(i+1):'Plano de pneus')+':</b> '+
   option.stints.map(st=>esc(LABELS[st.compound]||st.compound)+' '+st.laps+'v').join(' → ')+
   ' · '+option.stops+' parada(s)</p>';
 }).join('')+
 '<small>Stints condicionais às durabilidades cadastradas; ainda não representam simulação individual de desgaste dos dois pilotos. Evite parar os dois carros juntos quando possível.</small>';
}
function planHTML(result,plan,reportInfo){
 const source=reportInfo?.race?'Dados da corrida extraídos do relatório':'Prioridades internas da pista, sem briefing específico confirmado';
 const energy=plan.energy.map(v=>'<li>'+esc(v)+'</li>').join('');
 const warnings=plan.warnings.map(v=>'<li>'+esc(v)+'</li>').join('');
 const focus=window.GBRCore?.TRACK_CAR?.[result.carFocus]||result.carFocus;
 const driver=window.GBRCore?.TRACK_DRIVER?.[result.driverFocus]||result.driverFocus;
 return '<section class="gp-race-plan gp-pre-gp-result" aria-label="Estratégia personalizada de GP">'+
  '<span class="kicker">ESTRATÉGIA AUTOMÁTICA / SUA GARAGEM</span><h3>Plano para '+esc(result.track.name)+' · '+esc(result.category.label)+'</h3>'+
  '<p><b>Configuração:</b> '+esc(result.parts.length)+'/'+esc(result.required.length)+' peças elegíveis; dupla de pilotos '+(result.complete?'completa':'incompleta')+'. Foco carro: '+esc(focus)+'; foco piloto: '+esc(driver)+'.</p>'+
  '<p><b>Contexto:</b> '+esc(source)+' · '+esc(plan.laps?plan.laps+' voltas':'voltas não informadas')+' · '+esc(plan.weather==='wet'?'chuva':plan.weather==='dry'?'seco':plan.weather==='variable'?'clima variável':'clima não confirmado')+'</p>'+
  '<h4>Pneus e paradas</h4>'+tyresHTML(plan)+'<p><b>Dupla:</b> '+esc(plan.driverAdvice)+' <b>Boxes:</b> '+esc(plan.pitAdvice)+'</p>'+
  '<h4>Bateria e impulso</h4><ol>'+energy+'</ol>'+
  '<h4>Reforços (Boosts)</h4><p>Prioridade de efeito: '+esc(plan.boostFocus)+'. '+esc(plan.boostNote)+'</p>'+
  '<p><b>Aprendizado próprio:</b> '+plan.evidenceSample+' registro(s) da mesma pista e série; '+esc(plan.evidenceMode==='experiment'?'hipótese experimental habilitada pelo histórico':'recomendação-base, sem histórico mínimo obrigatório')+'.</p>'+
  (warnings?'<ul class="gp-pre-gp-warnings">'+warnings+'</ul>':'')+
  '<p class="gp-note">Confiança: setup — '+esc(plan.confidence.setup)+'; pneus — '+esc(plan.confidence.tyres)+'; energia — '+esc(plan.confidence.energy)+'; Boost — '+esc(plan.confidence.boosts)+'. '+esc(plan.recommendation)+'</p></section>';
}
function mount(){
 const currentKey=sessionKey();
 if(lastSessionKey!==null&&lastSessionKey!==currentKey)reports.clear();
 lastSessionKey=currentKey;
 const hub=$('gbrEventHub'),state=window.GBREvents?.getState?.();
 if(!hub||!state||!window.GBRPreGP)return;
 const event=window.GBREvents.all.find(e=>e.id===state.selectedEventId);
 if(!event)return;
 const resultPanel=hub.querySelector('.gp-result-panel'),resultHost=$('gbrGpResult');
 if(!resultPanel||!resultHost)return;
 hub.querySelector('.gp-pre-gp-input')?.remove();
 resultPanel.insertAdjacentHTML('beforebegin',briefingHTML(event.id));
 const garage=window.F1App?.getGarage?.();
 const category=window.GBREvents.categories.find(c=>c.id===state.selectedCategoryId);
 const result=window.GBREvents.computeSetup(event,category,state.selectedTrackId,garage);
 const plan=window.GBRPreGP.buildPlan({result,garage,race:result?.reportContext});
 const generic=resultHost.querySelector('.gp-race-plan');
 if(plan&&result){generic?.remove();resultPanel.querySelector('.gp-pre-gp-result')?.remove();resultPanel.insertAdjacentHTML('beforeend',planHTML(result,plan,{race:result.reportContext}));}
 $('gpBriefingApply')?.addEventListener('click',()=>{
  const text=$('gpBriefingText')?.value||'';
  try{
   const parsed=window.GBRPreGP.parseBriefing(text,{tracks:window.F1Tracks?.all||[]});
   if(!parsed.entries.length){$('gpBriefingFeedback').textContent=parsed.warnings.join(' ');return;}
   reports.set(event.id,{text,parsed});
   window.GBREvents.select(state.selectedEventId,state.selectedCategoryId,state.selectedTrackId);
  }catch(err){$('gpBriefingFeedback').textContent='Relatório não aceito: '+String(err?.message||'erro de leitura');}
 });
 $('gpBriefingClear')?.addEventListener('click',()=>{
  reports.delete(event.id);
  window.GBREvents.select(state.selectedEventId,state.selectedCategoryId,state.selectedTrackId);
 });
}
window.GBRPreGPUI=Object.freeze({mount,raceFor});
mount();
})();
