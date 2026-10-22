/* GBR Engenheiro de Duelos v1 — motor pré-GP compartilhado, contexto de modalidade isolado.
   Usa exclusivamente o contexto de voltas/clima dos Duelos; não importa regras nem bônus de GPs.
   Não lê dados de outras contas, não grava resultados e não consulta fontes externas. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=x=>Number.isFinite(Number(x))?Number(x):0;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const TYRES={soft:'Macio',medium:'Médio',hard:'Duro',wet:'Chuva'};
const DRIVER_FIELDS=['overtaking','defending','qualifying','raceStart','tyreUse'];
function distinctDrivers(garage,focus,series){
 const drivers=(garage.drivers||[]).filter(d=>d&&d.owned&&n(d.level)>0&&n(d.series)<=series)
  .map(d=>({d,score:.65*n(d[focus])+DRIVER_FIELDS.reduce((sum,k)=>sum+.07*n(d[k]),0)}))
  .sort((a,b)=>b.score-a.score);
 const selected=[],identities=new Set();
 for(const row of drivers){
  const identity=norm(row.d.name).split(' ').pop();
  if(!identity||identities.has(identity))continue;
  selected.push(row.d);identities.add(identity);if(selected.length===2)break;
 }
 return selected;
}
function planFor(series,trackId,garage){
 const duel=window.GBRIntelligence?.duelContext?.(series,trackId);
 if(!duel||!window.GBRCore||!window.GBRPreGP)return null;
 const track=window.F1Tracks?.all?.find(t=>t.id===trackId);
 if(!track)return null;
 const weights=window.GBRCore.trackWeights(duel.car);
 // Não use GBRCore.optimize() aqui: ele lê a garagem global do app.js, ignorando
 // o objeto recebido por planFor(). Mantemos a pontuação oficial do Montador
 // através de scorePart(), porém isolamos explicitamente o estado da conta.
 const required=['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio',...(Number(series)>3?['Bateria']:[])];
 const owned=(garage?.parts||[]).filter(p=>p?.owned&&n(p.level)>0&&n(p.series)<=Number(series));
 const score=p=>typeof window.GBRCore.scorePart==='function'?window.GBRCore.scorePart(p,weights,'none'):
  (n(p.speed)*n(weights.speed)+n(p.corner)*n(weights.corner)+n(p.power)*n(weights.power)+n(p.qualifying)*n(weights.qualifying)) /
  (n(weights.speed)+n(weights.corner)+n(weights.power)+n(weights.qualifying)||1);
 const chosen=required.map(category=>owned.filter(p=>p.category===category).sort((a,b)=>score(b)-score(a))[0]).filter(Boolean);
 const build={chosen,required};
 const drivers=distinctDrivers(garage,duel.driver,series);
 // Apenas corridas explicitamente marcadas como Duelo entram no histórico desta modalidade.
 // Registros sem modalidade não são interpretados como vitória em Duelo.
 const scoped={...garage,raceAnalyses:(garage.raceAnalyses||[]).filter(r=>r&&(r.mode==='duel'||r.raceType==='duel'))};
 const result={track,category:{series,label:'Série '+series},parts:build.chosen||[],required:build.required||[],
  drivers,complete:build.chosen?.length===build.required?.length&&drivers.length===2,
  carFocus:duel.car,driverFocus:duel.driver,carWeights:weights};
 // Clima "misto" indica incerteza; não traduzir em chuva 0%/100%, nem copiar contexto de GP.
 const race={laps:duel.laps??null,weather:duel.weather==='dry'?'dry':duel.weather==='mixed'?'variable':null,
  rain:null,source:duel.source,mode:'duel'};
 const plan=window.GBRPreGP.buildPlan({result,garage:scoped,race});
 return {duel,result,plan,race};
}
function render(){
 const spot=$('gbrDuelEngineer'),analysis=$('trackAnalysis');
 if(!analysis)return;
 const info=window.F1Tracks?.trackInfo?.();
 const context=info&&window.GBRIntelligence?.duelContext?.(info.series,info.track.id);
 if(!context){spot?.remove();return;}
 const garage=window.F1App?.getGarage?.();
 if(!garage)return;
 const response=planFor(info.series,info.track.id,garage);
 if(!response||!response.plan)return;
 const {result,plan,duel}=response;
 let host=spot;
 if(!host){host=document.createElement('section');host.id='gbrDuelEngineer';host.className='panel gbr-duel-engineer';analysis.append(host)}
 const carName=window.GBRCore?.TRACK_CAR?.[duel.car]||duel.car;
 const driverName=window.GBRCore?.TRACK_DRIVER?.[duel.driver]||duel.driver;
 const tyrePlans=plan.tyreOptions.length?plan.tyreOptions.map((p,i)=>'<p><b>'+(i?'Alternativa '+(i+1):'Plano condicional')+':</b> '+p.stints.map(st=>esc(TYRES[st.compound]||st.compound)+' '+st.laps+'v').join(' → ')+' · '+p.stops+' parada(s)</p>').join(''):
  '<p>A quantidade de voltas é conhecida na rotação, mas não há durabilidade de pneus validada para calcular stints seguros nesta garagem/série, ou o clima é variável.</p>';
 host.innerHTML='<div class="kicker">ENGENHEIRO DE DUELOS GBR · '+esc(duel.phase.toUpperCase())+'</div>'+
  '<h2>'+esc(result.track.name)+' · Série '+info.series+'</h2>'+
  '<p><b>Rotação:</b> '+esc(duel.periodStart)+' a '+esc(duel.periodEnd)+' · '+esc(duel.laps)+' voltas · '+(duel.weather==='dry'?'seco na tabela':'clima misto, sem previsão de chuva por volta')+'.</p>'+
  '<p><b>Foco da pista:</b> carro — '+esc(carName)+'; pilotos — '+esc(driverName)+'.</p>'+
  '<p><b>Seu carro:</b> '+result.parts.length+'/'+result.required.length+' peças elegíveis. '+(result.parts.length?esc(result.parts.map(p=>p.name+' Nv.'+p.level).join(' · ')):'Cadastre peças da série')+'.</p>'+
  '<p><b>Sua dupla:</b> '+(result.drivers.length?esc(result.drivers.map(p=>p.name+' Nv.'+p.level).join(' + ')):'Cadastre dois pilotos diferentes e elegíveis')+'.</p>'+
  '<h3>Pneus e boxes</h3>'+tyrePlans+'<p>'+esc(plan.driverAdvice)+' '+esc(plan.pitAdvice)+'</p>'+
  '<h3>Potência e Overtake Mode</h3><ol>'+plan.energy.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ol>'+
  '<h3>Boosts</h3><p>'+esc(plan.boostFocus)+'. '+esc(plan.boostNote)+'</p>'+
  '<p><b>Histórico de Duelos identificado:</b> '+plan.evidenceSample+' corrida(s) desta pista/série com modalidade explícita. Registros de GP ou sem modalidade não foram usados.</p>'+
  (plan.warnings.length?'<ul>'+plan.warnings.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':'')+
  '<small>Fonte: '+esc(duel.source)+'. As voltas e o clima do GP dos Estados Unidos NÃO são utilizados nos Duelos. Valide a rotação e o desgaste no jogo. Sem previsão garantida de vitória.</small>';
}
function mount(){
 const old=window.renderRaces;
 if(typeof old==='function'&&!old.__gbrDuelWrapped){
  function next(...args){const output=old.apply(this,args);render();return output;}
  next.__gbrDuelWrapped=true;window.renderRaces=next;
 }
 $('trackSeries')?.addEventListener('change',render);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render()});
 render();
}
window.GBRDuelEngineer=Object.freeze({planFor,render,distinctDrivers});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
