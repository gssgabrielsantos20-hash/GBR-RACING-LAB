/* GBR Pit Wall — entrada manual, comparativos globais e sugestões conservadoras.
   Nenhum dado é coletado automaticamente de bots ou enviado a serviços externos. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const model=()=>window.GBRPodiumModel;
const garage=()=>window.F1App?.getGarage?.();
const events=()=>window.GBREvents?.all||[];
const categories=()=>window.GBREvents?.categories||[];
const tracks=()=>window.F1Tracks?.all||[];
const eventSelected=()=>events().find(e=>e.id===$('gbrpw-podium-event')?.value);
const categorySelected=()=>categories().find(c=>c.id===$('gbrpw-podium-category')?.value);
const trackSelected=()=>tracks().find(t=>t.id===$('gbrpw-podium-track')?.value);
const formats={soft:'Macio',medium:'Médio',hard:'Duro',wet:'Chuva'};
let initialized=false;
function updateSelect(id,options,value){const node=$(id);if(!node)return;
 node.innerHTML=options.map(x=>`<option value="${esc(x.id)}">${esc(x.label)}</option>`).join('');
 if(options.some(x=>x.id===value))node.value=value;
}
function updateTracks(){const ev=eventSelected();const previous=$('gbrpw-podium-track')?.value;
 updateSelect('gbrpw-podium-track',(ev?.tracks||[]).map(id=>({id,label:tracks().find(t=>t.id===id)?.name||id})),previous);updateRaceNumbers();}
function updateRaceNumbers(){const ev=eventSelected(),stage=$('gbrpw-podium-stage')?.value;
 const list=ev?.stageRounds?.[stage]||(!ev?.stageRounds&&(stage==='qualifying'?ev?.qualifying:stage==='final'?ev?.rounds:null));
 const previous=$('gbrpw-podium-round')?.value||'';
 const choices=[{id:'',label:'Não informada'},...(list||[]).map((r,i)=>({id:String(i+1),label:`Corrida ${i+1} · ${tracks().find(t=>t.id===r.track)?.name||r.track}`}))];
 if(!list)choices.push(...Array.from({length:12},(_,i)=>({id:String(i+1),label:`Corrida ${i+1} (informada)`})));
 updateSelect('gbrpw-podium-round',choices,previous);
 // A seleção de um número confirmado deve apontar para a pista publicada.
 const number=Number($('gbrpw-podium-round')?.value||0);
 if(list&&number>=1&&list[number-1]?.track&&ev.tracks.includes(list[number-1].track))$('gbrpw-podium-track').value=list[number-1].track;
}
function message(text,bad=false){const el=$('gbrpw-podium-message');if(!el)return;el.textContent=text;el.classList.toggle('gbrpw-warning',bad);el.setAttribute('role','status')}
function loggedIn(){const context=window.F1Session?.getContext?.();return Boolean(context?.enabled&&context.userId&&!context.demo)}
function val(id){return $(id)?.value??''}
function formRecord(){const tyreStints=['gbrpw-podium-tyre1','gbrpw-podium-tyre2','gbrpw-podium-tyre3'].map(val).filter(Boolean);
 return {raceDate:val('gbrpw-podium-date'),eventId:val('gbrpw-podium-event'),categoryId:val('gbrpw-podium-category'),trackId:val('gbrpw-podium-track'),
  stage:val('gbrpw-podium-stage'),raceNumber:val('gbrpw-podium-round'),competitorType:val('gbrpw-podium-type'),name:val('gbrpw-podium-name'),
  gridPosition:val('gbrpw-podium-grid'),finishPosition:val('gbrpw-podium-finish'),
  drivers:[val('gbrpw-podium-driver1'),val('gbrpw-podium-driver2')],parts:val('gbrpw-podium-parts').split(/[,;\n]/).map(s=>s.trim()).filter(Boolean),
  tyreStints,stops:val('gbrpw-podium-stops'),pitLoss:val('gbrpw-podium-pit-loss'),wearLoss:val('gbrpw-podium-wear-loss'),
  leader:val('gbrpw-podium-leader'),fastestLap:val('gbrpw-podium-fastest'),bestLapSeconds:val('gbrpw-podium-best-lap'),notes:val('gbrpw-podium-notes')};
}
function save(event){event.preventDefault();if(!loggedIn()){message('Entre na sua conta para salvar observações na garagem sincronizada.',true);return}
 try{const data=garage();if(!data)throw Error('Garagem indisponível.');
  const record=model().create(formRecord(),{events:events(),categories:categories(),tracks:tracks()});
  const next=model().add(data,record); // Validação completa antes da única mutação.
  data.gpPodiumObservations=next;
  window.F1Session.scheduleSave();
  message('Observação registrada na garagem. Confira o indicador de sincronização na nuvem.');
  for(const id of ['gbrpw-podium-name','gbrpw-podium-grid','gbrpw-podium-finish','gbrpw-podium-driver1','gbrpw-podium-driver2','gbrpw-podium-parts','gbrpw-podium-tyre1','gbrpw-podium-tyre2','gbrpw-podium-tyre3','gbrpw-podium-stops','gbrpw-podium-pit-loss','gbrpw-podium-wear-loss','gbrpw-podium-best-lap','gbrpw-podium-notes']){const element=$(id);if(element)element.value=''}
  $('gbrpw-podium-leader').value='unknown';$('gbrpw-podium-fastest').value='unknown';render();
 }catch(error){message(error?.message||'Falha ao salvar observação.',true)}
}
function remove(event){const button=event.target.closest('[data-gbr-podium-delete]');if(!button)return;
 if(!loggedIn()){message('É necessário estar autenticado para excluir registros.',true);return}
 const id=button.dataset.gbrPodiumDelete,all=garage()?.gpPodiumObservations;if(!Array.isArray(all)||!all.some(x=>x.id===id))return;
 if(!confirm('Excluir esta observação de GP? A alteração será sincronizada com sua conta.'))return;
 garage().gpPodiumObservations=all.filter(x=>x.id!==id);
 window.F1Session.scheduleSave();message('Observação excluída. Sincronização pendente.');render();
}
const f=v=>v===null||v===undefined?'—':String(v);
function rowProfiles(report){return report.profiles.map(p=>`<tr><td>${esc(p.label)}</td><td>${p.count}</td><td>${f(p.share)}%</td></tr>`).join('')}
function render(){const result=$('gbrpw-podium-report'),history=$('gbrpw-podium-history');if(!result||!history||!model())return;
 const cat=categorySelected(),ev=eventSelected(),track=trackSelected();
 const all=garage()?.gpPodiumObservations||[];
 const report=model().summarize(all,{categoryId:cat?.id,series:cat?.series,competitorType:'bot'});
 const registered=all.filter(x=>x.source==='manual-revisado-gp'&&x.categoryId===cat?.id);
 const formatName=id=>tracks().find(x=>x.id===id)?.name||id;
 result.innerHTML=`<p class="gbrpw-muted"><b>Visão global:</b> bots observados em todos os GPs e pistas da categoria ${esc(cat?.label||'—')} (até Série ${esc(cat?.series||'—')}). Duelos e jogadores humanos não entram nos cálculos.</p>
 <div class="gbrpw-metrics"><span><b>${report.sample}</b> bots observados</span><span><b>${report.podium}</b> no Top 3</span><span><b>${f(report.rate)}%</b> Top 3 na amostra</span><span><b>${f(report.avgFinish)}</b> chegada média</span><span><b>${f(report.avgGain)}</b> posições ganhas (média)</span></div>
 <div class="gbrpw-metrics"><span><b>${f(report.avgPitLoss)}</b> perdas no pit (${report.pitLossN})</span><span><b>${f(report.avgWearLoss)}</b> perdas por desgaste (${report.wearLossN})</span><span><b>${f(report.avgStops)}</b> paradas (${report.stopsN})</span><span><b>${report.leaderYes}/${report.leaderKnown}</b> liderou (informado)</span><span><b>${report.fastYes}/${report.fastKnown}</b> melhor volta (informado)</span></div>
 <p class="${report.adequate?'gbrpw-muted':'gbrpw-warning'}">${esc(report.note)}</p>
 <div class="gbrpw-two"><div><h4>Três perfis do pódio</h4><table class="gbrpw-table"><thead><tr><th>Perfil</th><th>Bots</th><th>Do Top 3</th></tr></thead><tbody>${rowProfiles(report)}</tbody></table></div><div><h4>Comparação entre circuitos</h4><div class="gbrpw-scroll"><table class="gbrpw-table"><thead><tr><th>Pista</th><th>Amostra</th><th>Top 3</th><th>Grid</th><th>Recuperação</th><th>Ritmo</th><th>Chegada</th><th>Ganho</th><th>Melhor volta*</th></tr></thead><tbody>${report.tracks.length?report.tracks.map(t=>`<tr><td>${esc(formatName(t.trackId))}</td><td>${t.sample}</td><td>${t.podium}/${t.sample}</td><td>${t.profiles.grid}</td><td>${t.profiles.recovery}</td><td>${t.profiles.consistency}</td><td>${f(t.avgFinish)}</td><td>${f(t.avgGain)}</td><td>${t.bestLap!==null?f(t.bestLap)+" s":"—"}</td></tr>`).join(''):'<tr><td colspan="9">Nenhuma observação.</td></tr>'}</tbody></table></div></div></div>
 <div class="gbrpw-two"><div><h4>Duplas de pilotos no Top 3</h4><p class="gbrpw-muted">${report.driverPairs.length?report.driverPairs.map(x=>`${esc(x.name)} (${x.count})`).join(' · '):'Ainda não há duplas completas informadas.'}</p><h4>Peças mais relatadas</h4><p class="gbrpw-muted">${report.parts.length?report.parts.map(x=>`${esc(x.name)} (${x.count})`).join(' · '):'Nenhuma composição de carro completa/ parcial informada.'}</p></div><div><h4>Pneus observados no Top 3</h4><p class="gbrpw-muted">${report.tyres.length?report.tyres.map(x=>`${esc(formats[x.name]||x.name)} (${x.count})`).join(' · '):'Sem compostos registrados.'}</p><p class="gbrpw-muted">*Melhores voltas são informadas manualmente e só devem ser comparadas dentro de uma mesma pista e condições semelhantes. Contagens refletem registros informados; não há telemetria automática ou comprovação de causalidade.</p></div></div>`;
 const plan=ev&&cat&&track?window.GBRPitWall?.eventPlan?.(ev.id,cat.id,track.id):null;
 const alternatives=window.GBRRecommendations?.podiumPairs?.(garage(),cat,ev,report);
 const baseline=plan?.estimate?.parts||[];
 const suggested=$('gbrpw-podium-suggestions');if(suggested){suggested.innerHTML=`<h4>Setups exploratórios para disputar o pódio</h4><p class="gbrpw-muted">${esc(alternatives?.reason||'Análise indisponível.')}</p>`+
  (!alternatives?.eligible?'<p class="gbrpw-warning">Sem recomendação personalizada por perfil até validar as regras, cadastrar a garagem e atingir a amostra mínima.</p>':
   `<p class="gbrpw-muted"><b>Carro-base do GP (${esc(formatName(track.id))}):</b> ${baseline.length?baseline.map(x=>`${esc(x.name)} (Nv. ${Number(x.level)||'?'})`).join(' · '):'Peças não cadastradas para completar o setup.'} ${plan?.estimate?.complete?'':'· Setup incompleto'}</p>
   <div class="gbrpw-profile-grid">${(alternatives.pairs||[]).map(p=>`<article class="gbrpw-profile"><strong>${esc(model().PROFILES.find(x=>x.id===p.profile)?.label||p.profile)}</strong><p>${p.drivers.map(d=>`${esc(d.name)} · Nv. ${Number(d.level)||'?'}`).join(' + ')||'Sem pilotos elegíveis'}</p><small>${esc(model().PROFILES.find(x=>x.id===p.profile)?.detail||'')}</small></article>`).join('')}</div><p class="gbrpw-muted">As peças são do Engenheiro de GP existente. As alternativas variam apenas a ênfase dos atributos dos pilotos, respeitando série, raridades e regras do evento; bônus e estratégia precisam de confirmação no jogo.</p>`)};
 history.innerHTML=`<h4>Observações registradas nesta categoria (${registered.length})</h4>`+(registered.length?`<div class="gbrpw-scroll"><table class="gbrpw-table"><thead><tr><th>Data</th><th>Participante</th><th>GP / pista</th><th>Largada → chegada</th><th>Tipo</th><th>Ação</th></tr></thead><tbody>${registered.slice().reverse().slice(0,40).map(r=>`<tr><td>${esc(r.raceDate)}</td><td>${esc(r.name||'Sem identificação')}</td><td>${esc(formatName(r.trackId))}</td><td>${f(r.gridPosition)} → ${r.finishPosition}</td><td>${r.competitorType==='bot'?'Bot':'Jogador'}</td><td><button type="button" class="btn outline gbrpw-mini" data-gbr-podium-delete="${esc(r.id)}">Excluir</button></td></tr>`).join('')}</tbody></table></div>${registered.length>40?'<p class="gbrpw-muted">Mostrando os 40 mais recentes. O backup JSON contém todos.</p>':''}`:'<p class="gbrpw-muted">Nenhum GP cadastrado nessa categoria. Registros anteriores de Duelos não são reutilizados.</p>');
}
function init(){if(initialized||!$('gbrpw-podium-form')||!model())return;initialized=true;
 const todayDate=new Date(),today=[todayDate.getFullYear(),String(todayDate.getMonth()+1).padStart(2,'0'),String(todayDate.getDate()).padStart(2,'0')].join('-');
 const suggested=events().find(e=>e.starts<=today&&e.ends>=today)||events().find(e=>e.starts>today)||events()[0];
 updateSelect('gbrpw-podium-event',events().map(e=>({id:e.id,label:e.name})),suggested?.id);
 updateSelect('gbrpw-podium-category',categories().map(c=>({id:c.id,label:c.label+' (Série '+c.series+')'})),'campeao');
 updateTracks();$('gbrpw-podium-date').value=today;
 $('gbrpw-podium-event').addEventListener('change',()=>{updateTracks();render()});
 $('gbrpw-podium-category').addEventListener('change',render);
 $('gbrpw-podium-stage').addEventListener('change',updateRaceNumbers);
 $('gbrpw-podium-round').addEventListener('change',updateRaceNumbers);
 $('gbrpw-podium-track').addEventListener('change',render);
 $('gbrpw-podium-form').addEventListener('submit',save);
 $('gbrpw-podium-history').addEventListener('click',remove);
 $('gbrpw-podium-refresh')?.addEventListener('click',render);
 render();
}
window.GBRPodiumUI=Object.freeze({init,render});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
