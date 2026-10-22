/* GBR Pré-GP — visualização individual somente-leitura.
   Formulários de publicação de eventos não pertencem ao bundle público.
   Nenhum dado de garagem é persistido ou enviado por este módulo. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tyres=Object.freeze({soft:'Macio',medium:'Médio',hard:'Duro',wet:'Chuva'});
function detailedPlan(result,plan){
 const carFocus=window.GBRCore?.TRACK_CAR?.[result.carFocus]||result.carFocus;
 const driverFocus=window.GBRCore?.TRACK_DRIVER?.[result.driverFocus]||result.driverFocus;
 const wrap=(items,ordered)=>'<'+(ordered?'ol':'ul')+'>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</'+(ordered?'ol':'ul')+'>';
 const tyreHTML=plan.tyreOptions.length?plan.tyreOptions.map((o,i)=>'<p><b>'+(i===0?'Pneus':'Alternativa '+(i+1))+':</b> '+o.stints.map(x=>esc(tyres[x.compound]||x.compound)+' '+x.laps+'v').join(' → ')+' · '+o.stops+' parada(s)</p>').join(''):
  '<p>Sem estratégia numérica individual calculada: confirme a durabilidade dos pneus no perfil desta pista/série. O calendário pode informar voltas e chuva, mas não desgaste de cada piloto.</p>';
 return '<section class="gp-race-plan gp-pre-gp-result" aria-label="Estratégia GBR individual">'+
  '<span class="kicker">ENGENHEIRO DE CORRIDA GBR</span>'+
  '<h3>'+esc(result.track.name)+' · '+esc(result.category.label)+'</h3>'+
  '<p><b>Setup:</b> '+result.parts.length+'/'+result.required.length+' peças próprias elegíveis. <b>Foco carro:</b> '+esc(carFocus)+'. <b>Foco piloto:</b> '+esc(driverFocus)+'.</p>'+
  '<p><b>Bônus destacado:</b> '+(result.bonusInEffect?'ativo nesta data':result.bonusProjected?'projetado para o GP; ainda não ativo':'não ativo nesta data')+'.</p>'+
  '<p><b>Corrida:</b> '+(plan.laps===null?'voltas não informadas':plan.laps+' voltas')+' · '+esc(plan.weather==='wet'?'chuva (100% no guia)':plan.weather==='dry'?'seco (0% no guia)':plan.weather==='variable'?'clima variável':'clima não confirmado')+'. <small>'+esc(result.reportContext?.source||'Contexto ainda não verificado')+'</small></p>'+
  '<h4>Pneus e boxes</h4>'+tyreHTML+'<p>'+esc(plan.driverAdvice)+' '+esc(plan.pitAdvice)+'</p>'+
  '<h4>Gestão de potência e Overtake Mode</h4>'+wrap(plan.energy,true)+
  '<h4>Reforços / Boosts</h4><p>Prioridade de efeito: '+esc(plan.boostFocus)+'. '+esc(plan.boostNote)+'</p>'+
  '<p><b>Aprendizado pessoal:</b> '+plan.evidenceSample+' corrida(s) nesta pista/série; '+esc(plan.evidenceMode)+'. Histórico não é pré-requisito.</p>'+
  (plan.warnings.length?wrap(plan.warnings,false):'')+
  '<small>Confiança: setup — '+esc(plan.confidence.setup)+'; pneus — '+esc(plan.confidence.tyres)+'; energia — '+esc(plan.confidence.energy)+'; Boosts — '+esc(plan.confidence.boosts)+'. Sem garantia de vitória.</small></section>';
}
function mount(){
 const hub=$('gbrEventHub'),state=window.GBREvents?.getState?.();
 if(!hub||!state||!window.GBRPreGP)return;
 const event=window.GBREvents.all.find(e=>e.id===state.selectedEventId);
 const category=window.GBREvents.categories.find(c=>c.id===state.selectedCategoryId);
 const panel=hub.querySelector('.gp-result-panel');
 if(!event||!category||!panel)return;
 // Remova formulários antigos apenas do DOM, caso outro trecho tenha renderizado UI prévia.
 hub.querySelector('.gp-pre-gp-input')?.remove();
 const garage=window.F1App?.getGarage?.();
 const result=window.GBREvents.computeSetup(event,category,state.selectedTrackId,garage);
 const plan=window.GBRPreGP.buildPlan({result,garage,race:result?.reportContext});
 const resultHost=$('gbrGpResult');
 resultHost?.querySelector('.gp-race-plan')?.remove();
 panel.querySelector('.gp-pre-gp-result')?.remove();
 if(result&&plan)panel.insertAdjacentHTML('beforeend',detailedPlan(result,plan));
}
window.GBRPreGPUI=Object.freeze({mount});
mount();
})();
