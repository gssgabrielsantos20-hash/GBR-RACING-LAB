/* GBR Racing Lab — Pit Wall 2026. Módulo de leitura da garagem atual.
   Sem alterações no Supabase, no schema, nos dados de garagem ou em autenticação.
   Cada recomendação identifica lacunas e separa fatos de hipóteses. */
(()=>{'use strict';
const STATS=['speed','corner','power','qualifying'];
const DRIVER=['overtaking','defending','qualifying','raceStart','tyreUse'];
const LABEL={speed:'Velocidade',corner:'Curvas',power:'Potência',qualifying:'Classificação',pit:'Pit stop',overtaking:'Ultrapassagem',defending:'Defesa',raceStart:'Largada',tyreUse:'Pneus'};
const n=v=>Number.isFinite(Number(v))?Number(v):0;
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const garage=()=>window.F1App?.getGarage?.()||{parts:[],drivers:[],raceAnalyses:[],favoriteSetups:[]};
const ref=()=>window.F1Reference||{parts:{},drivers:{}};
const events=()=>window.GBREvents?.all||[];
const categories=()=>window.GBREvents?.categories||[];
const trackFor=id=>(window.F1Tracks?.all||[]).find(t=>t.id===id);
const unique=x=>[...new Set(x)];
const driveIdentity=x=>{
 const legendary=x.rarity==='Legendary'?window.GBRLegendaryDrivers?.lookup?.(x.name)?.name:x.name;
 const edition=x.rarity==='Special'?window.GBRSpecialEditions?.groupOf?.(x)||norm(x.editionLabel):norm(x.editionLabel);
 return [norm(legendary||x.name),x.rarity||'',edition||''].join('|');
};
const partIdentity=x=>[norm(x.name),x.rarity||''].join('|');
function issues(data=garage()){
 const rows=[...(data.parts||[]).map(x=>({...x,_kind:'parts'})),...(data.drivers||[]).map(x=>({...x,_kind:'drivers'}))];
 const seen=new Map(), duplicates=[],unknownImages=[],missingStats=[],missingLevels=[],staleLinks=[];
 for(const x of rows){
  const key=x._kind+'|'+(x._kind==='parts'?partIdentity(x):driveIdentity(x));
  if(seen.has(key))duplicates.push({card:x,other:seen.get(key)});else seen.set(key,x);
  const source=window.GBRCardArt?.getSource?.(x,x._kind)||{url:'',origin:'none'};
  if(!source.url)unknownImages.push(x);
  else if(/^https:\/\//.test(source.url)&&source.origin==='reference')staleLinks.push(x); // URL externa: não equivale a HTTP 200 verificado
  const stats=x._kind==='parts'?STATS.concat('pit'):DRIVER;
  if(x.owned&&n(x.level)>0&&stats.every(k=>n(x[k])===0))missingStats.push(x);
  if(x._kind==='parts'&&x.owned&&n(x.level)>0){
   const r=ref().parts?.[x.name];
   if(r&&!r.levels?.[String(x.level)])missingLevels.push(x); // Valores manuais preservados; só falta referência oficial
  }
 }
 return {total:rows.length,duplicates,unknownImages,missingStats,missingLevels,staleLinks,owned:rows.filter(x=>x.owned).length};
}
function weightScore(item,weights){const w=weights||{speed:30,corner:30,power:25,qualifying:15};const total=STATS.reduce((s,k)=>s+Math.max(0,n(w[k])),0)||100;return STATS.reduce((sum,k)=>sum+n(item[k])*Math.max(0,n(w[k])),0)/total}
function comparison(a,b,coins,weights){if(!a||!b)return null;
 const groupA=a.category||'piloto',groupB=b.category||'piloto';if(groupA!==groupB)return null;
 const fields=a.category?STATS.concat('pit'):DRIVER;
 const delta=Object.fromEntries(fields.map(k=>[k,Math.round((n(b[k])-n(a[k]))*100)/100]));
 const basis=a.category?STATS:DRIVER;const score=a.category?weightScore(a,weights):basis.reduce((s,k)=>s+n(a[k]),0)/5;
 const after=a.category?weightScore(b,weights):basis.reduce((s,k)=>s+n(b[k]),0)/5;
 const gain=after-score;
 const cost=Number(coins),validCost=Number.isFinite(cost)&&cost>0;
 return {delta,gain,roi:validCost?gain/(cost/1000000):null,cost:validCost?cost:null,score,after,certainty:'Comparação aritmética entre atributos cadastrados; não prevê vitórias nem tempo de corrida.'};
}
function datesToICS(items){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//GBR Racing Lab//Pit Wall 2026//PT-BR','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 function nextDay(d){const t=new Date(d+'T12:00:00Z');t.setUTCDate(t.getUTCDate()+1);return t.toISOString().slice(0,10).replace(/-/g,'')}
 const date=s=>s.replace(/-/g,'');const clean=s=>String(s||'').replace(/[\r\n,;\\]/g,' ').slice(0,110);
 for(const e of items.filter(x=>/^\d{4}-\d\d-\d\d$/.test(x.starts)&&/^\d{4}-\d\d-\d\d$/.test(x.ends))){
  lines.push('BEGIN:VEVENT',`UID:${clean(e.id)}@gbr-racing-lab`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}`,`DTSTART;VALUE=DATE:${date(e.starts)}`,`DTEND;VALUE=DATE:${nextDay(e.ends)}`,`SUMMARY:${clean('F1 Clash - '+e.name)}`,'DESCRIPTION:Evento no GBR Racing Lab. Pistas e regras devem ser confirmadas no jogo.','BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:F1 Clash - evento começa em breve','END:VALARM','END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.join('\r\n')+'\r\n';
}
function eventPlan(eventId,categoryId,trackId){
 const event=events().find(e=>e.id===eventId),cat=categories().find(c=>c.id===categoryId);
 if(!event||!cat)return {error:'Selecione um evento e uma categoria.'};
 const track=trackFor(trackId);
 if(!event.tracks.includes(trackId)||!track)return {error:'Selecione uma das pistas possíveis do evento.'};
 const current=garage(),missing=[];
 for(const x of [...event.driverBoosts.map(a=>({name:a.label,type:'drivers',rarity:a.rarity})),...event.partBoosts.map(name=>({name,type:'parts'}))]){
  const has=x.type==='parts'?(current.parts||[]).some(p=>p.owned&&norm(p.name)===norm(x.name)):
  (current.drivers||[]).some(p=>p.owned&&p.rarity===(x.rarity==='any'?p.rarity:x.rarity)&&norm(p.name).split(' ').includes(norm(x.name).split(' ').pop()));
  if(!has)missing.push(x.name);
 }
 if(event.rulesConfirmed===false)return {event,cat,track,missing,estimate:null,warning:'Regras e elegibilidade ainda não confirmadas. Não foi calculado setup.'};
 const estimate=window.GBREvents?.computeSetup?.(event,cat,trackId,current)||null;
 const history=window.GBRRecommendations?.evidence?.(current,{series:cat.series,trackId,baseWeights:window.GBRCore?.trackWeights?.(track.car)})||null;
 return {event,cat,track,missing,estimate,history,warning:event.stageRounds?'A sequência, voltas, chuva e temperaturas de São Paulo estão na Central de Eventos GP, por etapa. Abertura e Final repetem a mesma ordem fixa de oito corridas; nenhum stint de pneus é presumido.':'Ordem das pistas, voltas, tempo e desgaste não confirmados: nenhum stint de pneus é presumido.'};
}
const selected={event:'',category:'campeao',track:'',compareA:'',compareB:'',kind:'parts',coins:''};
let summary='';
const listCards=(list,max=8)=>list.length?`<ul class="gbrpw-list">${list.slice(0,max).map(x=>`<li>${esc(x.name)}${x.level?' · Nv. '+n(x.level):''}</li>`).join('')}${list.length>max?`<li>Mais ${list.length-max} ocorrências</li>`:''}</ul>`:'<p class="gbrpw-muted">Nenhuma ocorrência identificada.</p>';
function auditRender(){
 const x=issues(),el=$('gbrpw-audit');if(!el)return;
 el.innerHTML=`<div class="gbrpw-metrics"><span><b>${x.owned}</b> cartas possuídas</span><span><b>${x.duplicates.length}</b> duplicações possíveis</span><span><b>${x.missingStats.length}</b> cartas sem atributos</span><span><b>${x.unknownImages.length}</b> sem referência visual</span></div>
 <details><summary>Peças possuídas em níveis sem tabela de referência (${x.missingLevels.length})</summary>${listCards(x.missingLevels,20)}<p class="gbrpw-muted">Números preenchidos por você são preservados; ausência na tabela não significa erro na carta.</p></details>
 <details><summary>Imagens sem referência (${x.unknownImages.length})</summary>${listCards(x.unknownImages,20)}</details>
 <details><summary>Links de imagem externos — verificar carregamento (${x.staleLinks.length})</summary>${listCards(x.staleLinks,12)}<p class="gbrpw-muted">Uma URL conhecida não comprova que a foto carregou no seu dispositivo.</p></details>
 <details><summary>Possíveis duplicações de mesma identidade/raridade/edição (${x.duplicates.length})</summary>${listCards(x.duplicates.map(y=>y.card),20)}<p class="gbrpw-muted">Não excluímos nada automaticamente: se houver registros com níveis diferentes, compare antes de corrigir.</p></details>
 <div class="gbrpw-actions"><button class="btn outline" type="button" data-pw-go="garage">Abrir minha garagem</button><button class="btn outline" type="button" id="gbrpw-audit-refresh">Rever dados</button></div>`;
 $('gbrpw-audit-refresh')?.addEventListener('click',auditRender);
}
function eventOptions(){const es=events(),el=$('gbrpw-event');if(!el)return;
 if(!selected.event)selected.event=es.find(e=>e.starts>=new Date().toISOString().slice(0,10))?.id||es[0]?.id||'';
 el.innerHTML=es.map(e=>`<option value="${esc(e.id)}" ${e.id===selected.event?'selected':''}>${esc(e.name)} · ${esc(e.starts.slice(5))}</option>`).join('');categoryOptions();trackOptions();}
function categoryOptions(){const el=$('gbrpw-category');if(!el)return;el.innerHTML=categories().map(c=>`<option value="${esc(c.id)}" ${c.id===selected.category?'selected':''}>${esc(c.label)}</option>`).join('')}
function trackOptions(){const event=events().find(e=>e.id===selected.event),el=$('gbrpw-track');if(!el)return;
 if(!event?.tracks?.includes(selected.track))selected.track=event?.tracks?.[0]||'';
 el.innerHTML=event?.tracks?.length?event.tracks.map(id=>`<option value="${esc(id)}" ${id===selected.track?'selected':''}>${esc(trackFor(id)?.name||id)}</option>`).join(''):'<option value="">Pistas a definir</option>';
}
function planRender(){const el=$('gbrpw-plan');if(!el)return;const p=eventPlan(selected.event,selected.category,selected.track);
 if(p.error){el.textContent=p.error;return}
 const e=p.event,calc=p.estimate;
 summary=`GBR RACING LAB · PLANO DE EVENTO\n${e.name} (${e.starts} a ${e.ends})\nCategoria: ${p.cat.label}\nPista possível: ${p.track.name}\nReforço anunciado: ${e.eventBoost||'A confirmar'}\nBônus: ${e.rulesConfirmed===false?'A confirmar':(e.featuredPercent??10)+'% nos ativos anunciados'}\n`;
 if(calc){summary+=`Peças: ${(calc.parts||[]).map(x=>x.name+' Nv.'+x.level).join(', ')}\nPilotos: ${(calc.drivers||[]).filter(Boolean).map(x=>x.name+' Nv.'+x.level).join(', ')}\nSetup completo: ${calc.complete?'sim':'não'}\n`}
 summary+=`Ativos anunciados ainda não identificados como possuídos: ${p.missing.join(', ')||'nenhum'}\n${p.warning}\nFonte: calendário oficial Hutch fornecido pelo organizador. Não há ordem nem clima confirmados.`;
 el.innerHTML=`<div class="gbrpw-note"><b>${esc(e.name)}</b><span>${esc(e.starts)} a ${esc(e.ends)} · ${esc(p.cat.label)} · ${esc(p.track.name)}</span><p>Reforço anunciado: <b>${esc(e.eventBoost||'A confirmar')}</b></p><p class="gbrpw-muted">${esc(p.warning)}</p></div>`+(calc?`<div class="gbrpw-two"><div><h4>Peças da sua garagem</h4>${listCards(calc.parts||[])}</div><div><h4>Pilotos indicados</h4>${listCards((calc.drivers||[]).filter(Boolean))}</div></div><p class="gbrpw-muted">Setup ${calc.complete?'completo':'incompleto'} · ${calc.featuredCount||0} ativos destacados possuídos na seleção · ${p.history?.message?esc(p.history.message):'Sem análise de histórico para esta pista.'}</p>${(calc.boosts||[]).length?`<p class="gbrpw-muted"><b>Efeitos de reforço a avaliar:</b> ${esc(calc.boosts.slice(0,2).map(b=>b.name).join(' · '))}. São categorias de efeito, não itens possuídos ou valores oficiais.</p>`:''}`:'<p class="gbrpw-muted">Cálculo bloqueado até confirmação de regras da Hutch.</p>')+(p.missing.length?`<p class="gbrpw-warning">Ativos anunciados não identificados como possuídos: ${esc(p.missing.join(', '))}</p>`:'')+`<div class="gbrpw-actions"><button class="btn outline" type="button" id="gbrpw-share">Compartilhar texto</button><button class="btn outline" type="button" id="gbrpw-card">Compartilhar card PNG</button><button class="btn outline" type="button" data-pw-go="event">Abrir Central de Eventos</button></div>`;
 $('gbrpw-share')?.addEventListener('click',()=>shareSummary(summary));$('gbrpw-card')?.addEventListener('click',shareVisualCard);
}
function comparable(){return selected.kind==='parts'?(garage().parts||[]).filter(x=>x.owned&&n(x.level)>0):(garage().drivers||[]).filter(x=>x.owned&&n(x.level)>0)}
function compareOptions(){const items=comparable(),a=$('gbrpw-a'),b=$('gbrpw-b');if(!a||!b)return;
 if(!items.some(x=>x.id===selected.compareA))selected.compareA=items[0]?.id||'';
 let first=items.find(x=>x.id===selected.compareA);let options=items.filter(x=>x.id!==selected.compareA&&(!first?.category||x.category===first.category));
 if(!options.some(x=>x.id===selected.compareB))selected.compareB=options[0]?.id||'';
 a.innerHTML=items.map(x=>`<option value="${esc(x.id)}" ${x.id===selected.compareA?'selected':''}>${esc(x.name)} · ${esc(x.rarity)} · Nv.${n(x.level)}</option>`).join('');
 b.innerHTML=options.map(x=>`<option value="${esc(x.id)}" ${x.id===selected.compareB?'selected':''}>${esc(x.name)} · ${esc(x.rarity)} · Nv.${n(x.level)}</option>`).join('');
 compareRender();}
function compareRender(){const el=$('gbrpw-compare');if(!el)return;const items=comparable(),a=items.find(x=>x.id===selected.compareA),b=items.find(x=>x.id===selected.compareB),result=comparison(a,b,selected.coins);
 if(!result){el.textContent='Cadastre ao menos dois itens possuídos da mesma categoria para comparar. A mesma identidade em versões diferentes permanece separada.';return;}
 const gain=result.gain;const stats=Object.entries(result.delta).map(([key,value])=>`<span>${esc(LABEL[key])}: <b class="${value>=0?'':'gbrpw-negative'}">${value>0?'+':''}${value.toFixed(key==='pit'?2:1)}${key==='pit'?' s':''}</b></span>`).join('');
 el.innerHTML=`<p class="gbrpw-result">Variação ponderada dos atributos: <b>${gain>0?'+':''}${gain.toFixed(2)}</b> pontos</p><div class="gbrpw-metrics">${stats}</div><p>${result.roi!==null?`Ganho comparativo por 1 milhão de moedas informado: <b>${result.roi.toFixed(2)}</b> pontos.`:'Digite o custo real do upgrade em moedas para ver o ganho por milhão investido.'}</p><p class="gbrpw-muted">${esc(result.certainty)} ${a.category?'Pit stop menor é favorável, mas não foi incluído na nota ponderada.':'Comparação dos cinco atributos sem regra de importância oficial.'} Valores de custo são informados por você, não por fonte oficial.</p>`;
}
async function shareVisualCard(){
 if(!summary)return;
 // Renderização 100% local; evita serviços de imagem e compartilhamento de dados no servidor.
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;
 const ctx=canvas.getContext('2d');if(!ctx){shareSummary(summary);return;}
 const grad=ctx.createLinearGradient(0,0,1080,1080);grad.addColorStop(0,'#081a29');grad.addColorStop(1,'#125754');ctx.fillStyle=grad;ctx.fillRect(0,0,1080,1080);
 ctx.fillStyle='#80f2d6';ctx.fillRect(65,70,12,110);ctx.font='bold 40px sans-serif';ctx.fillText('GBR RACING LAB',100,112);
 ctx.fillStyle='#fcfcfc';ctx.font='bold 74px sans-serif';ctx.fillText('PIT WALL 2026',70,210);
 const lines=summary.split('\n').filter(Boolean);ctx.font='30px sans-serif';let y=305;
 for(const line of lines.slice(0,13)){
  const words=line.split(' ');let cur='';for(const word of words){const next=(cur?cur+' ':'')+word;if(ctx.measureText(next).width>920){ctx.fillText(cur,70,y);cur=word;y+=45}else cur=next;if(y>930)break;}if(y>930)break;
  ctx.fillStyle=y===305?'#80f2d6':'#eaf7f7';ctx.fillText(cur,70,y);y+=56;if(y>930)break;
 }
 ctx.fillStyle='#83d6c4';ctx.font='24px sans-serif';ctx.fillText('Dados da minha garagem · avaliação indicativa, não garantia de vitória',70,1020);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob){shareSummary(summary);return;}
 const file=new File([blob],'GBR_Pit_Wall_Plano.png',{type:'image/png'});
 try{if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({title:'Plano GBR Racing Lab',files:[file]});return}}catch(err){if(err?.name==='AbortError')return}
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function historyRender(){const el=$('gbrpw-history');if(!el)return;const races=Array.isArray(garage().raceAnalyses)?garage().raceAnalyses:[];
 const valid=races.filter(r=>r&&['win','loss'].includes(r.result));const wins=valid.filter(r=>r.result==='win').length;
 const circuits=new Map();for(const r of valid){const key=String(r.trackId||'não informado');let v=circuits.get(key)||{win:0,loss:0};v[r.result]++;circuits.set(key,v)}
 const listed=[...circuits.entries()].sort((a,b)=>(b[1].win+b[1].loss)-(a[1].win+a[1].loss)).slice(0,6);
 const focused=valid.find(x=>x.trackId&&Number.isInteger(Number(x.series))&&Number(x.series)>=1&&Number(x.series)<=12);
 const insight=focused?window.GBRRecommendations?.evidence?.(garage(),{series:Number(focused.series),trackId:focused.trackId,baseWeights:window.GBRCore?.trackWeights?.(trackFor(focused.trackId)?.car)})||null:null;
 el.innerHTML=`<div class="gbrpw-metrics"><span><b>${valid.length}</b> corridas com resultado</span><span><b>${wins}</b> vitórias</span><span><b>${valid.length?(wins*100/valid.length).toFixed(1)+'%':'—'}</b> aproveitamento observado</span></div>`+(listed.length?`<table class="gbrpw-table"><thead><tr><th>Pista</th><th>Vitórias</th><th>Derrotas</th><th>Taxa</th></tr></thead><tbody>${listed.map(([key,v])=>`<tr><td>${esc(trackFor(key)?.name||key)}</td><td>${v.win}</td><td>${v.loss}</td><td>${(100*v.win/(v.win+v.loss)).toFixed(0)}%</td></tr>`).join('')}</tbody></table>`:'<p class="gbrpw-muted">Registre corridas na Inteligência GBR para acompanhar tendências pessoais.</p>')+`<p class="gbrpw-muted">${esc(insight?.message||'Sem evidência suficiente para propor testes personalizados nesta pista/série.')}</p>`+'<p class="gbrpw-muted">Amostra observacional. As condições, níveis das cartas e adversários mudam; vitória passada não comprova causalidade.</p>';
}
function radarRender(){const el=$('gbrpw-radar');if(!el)return;
 const latest=events().filter(e=>e.starts>='2026-11-01').slice(0,4);
 el.innerHTML=`<div class="gbrpw-news"><p><b>Hutch Update 63:</b> Lusail, melhorias nos objetivos e Loyalty Club anunciado. <a href="https://www.hutch.io/our-games/f1-clash/patch-notes/patch-notes-update-63-objectives-updates-more/" rel="noopener noreferrer" target="_blank">Comunicado oficial</a>.</p><p><b>Novembro:</b> ${esc(latest.map(e=>e.name).join(' · '))}. Datas e pistas possíveis recebidas via comunicados oficiais enviados pelo jogador; ordem e clima ainda pendentes.</p><p><b>Catálogo S12:</b> <a href="https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/" rel="noopener noreferrer" target="_blank">Referência comunitária AllClash</a> (não tratar dados interpolados como atributos oficiais).</p><p class="gbrpw-muted">Radar editorial estático desta versão, não há monitoramento automático de notícias, notificações push nem coleta de dados externos.</p></div>`;
}
async function shareSummary(text){
 if(!text)return;try{if(navigator.share){await navigator.share({title:'GBR Racing Lab — plano de GP',text});return}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);alert('Plano copiado. Cole no WhatsApp ou Discord.');return}}catch(err){if(err?.name==='AbortError')return}
 const el=$('gbrpw-share-text');if(el){el.hidden=false;el.value=text;el.focus();el.select()}
}
function downloadICS(){const data=datesToICS(events().filter(e=>e.starts>='2026-11-01'));const blob=new Blob([data],{type:'text/calendar;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='GBR_F1_Clash_Eventos_Novembro_2026.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function init(){if(!$('gbr-pit-wall'))return;
 auditRender();eventOptions();planRender();compareOptions();historyRender();radarRender();
 $('gbrpw-event')?.addEventListener('change',e=>{selected.event=e.target.value;trackOptions();planRender()});
 $('gbrpw-category')?.addEventListener('change',e=>{selected.category=e.target.value;planRender()});
 $('gbrpw-track')?.addEventListener('change',e=>{selected.track=e.target.value;planRender()});
 $('gbrpw-type')?.addEventListener('change',e=>{selected.kind=e.target.value;selected.compareA='';selected.compareB='';compareOptions()});
 $('gbrpw-a')?.addEventListener('change',e=>{selected.compareA=e.target.value;selected.compareB='';compareOptions()});
 $('gbrpw-b')?.addEventListener('change',e=>{selected.compareB=e.target.value;compareRender()});
 $('gbrpw-coins')?.addEventListener('input',e=>{selected.coins=e.target.value;compareRender()});
 $('gbrpw-reload')?.addEventListener('click',()=>{auditRender();compareOptions();historyRender();planRender()});
 $('gbrpw-calendar')?.addEventListener('click',downloadICS);
 const list=$('gbr-pit-wall');list.addEventListener('click',e=>{const t=e.target.closest('[data-pw-go]');if(!t)return;const tab=t.dataset.pwGo;const button=document.querySelector('#nav [data-tab="'+tab+'"]');button?.click()});
}
window.GBRPitWall=Object.freeze({issues,comparison,eventPlan,datesToICS,weightScore,init});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
