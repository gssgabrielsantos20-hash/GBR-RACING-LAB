/* GBR 5.0 — orientações de efeito para boosts. Não identifica itens oficiais sem fonte. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const carEffects={
 corner:{name:'Aderência nas curvas',detail:'Priorize um boost que aumente o desempenho em curvas na série escolhida.',level:'Prioridade principal',icon:'↪'},
 speed:{name:'Velocidade final',detail:'Busque efeito de velocidade para as retas e zonas de ultrapassagem.',level:'Prioridade principal',icon:'➜'},
 power:{name:'Unidade de potência',detail:'Priorize impulso de potência nas acelerações e retomadas.',level:'Prioridade principal',icon:'⚡'},
 qualifying:{name:'Classificação',detail:'Prefira impulso de performance para uma volta rápida.',level:'Prioridade principal',icon:'◈'}
};
const driverEffects={
 overtaking:{name:'Ultrapassagem',detail:'Efeito de ataque para as disputas e retomada de posição.',level:'Prioridade do piloto',icon:'↗'},
 defending:{name:'Defesa',detail:'Efeito para segurar posição nas zonas de combate.',level:'Prioridade do piloto',icon:'▣'},
 qualifying:{name:'Classificação',detail:'Efeito que favoreça a disputa por posição no grid.',level:'Prioridade do piloto',icon:'◈'},
 raceStart:{name:'Largada',detail:'Efeito de reação e aceleração no início da corrida.',level:'Prioridade do piloto',icon:'⚑'},
 tyreUse:{name:'Gerenciamento de pneus',detail:'Efeito de conservação para prolongar os stints.',level:'Prioridade do piloto',icon:'◉'}
};
function recommends({track,car,driver,weather}={}){
 const carRec=carEffects[car]||{name:'Equilíbrio do carro',detail:'Considere boosts que melhorem a combinação dos atributos do seu perfil manual.',level:'Perfil personalizado',icon:'◇'};
 const drvRec=driverEffects[driver]||driverEffects.raceStart;
 let weatherRec;
 if(weather==='wet')weatherRec={name:'Aderência na chuva',detail:'Se disponível na sua coleção, confira um boost apropriado para pista molhada.',level:'Condição de chuva',icon:'☂'};
 else if(weather==='variable')weatherRec={name:'Versatilidade de clima',detail:'Considere opções de equilíbrio; confirme a previsão antes de usar boosts específicos.',level:'Clima variável',icon:'☁'};
 else weatherRec={name:'Durabilidade de pneus',detail:'Para stints longos, avalie um efeito de menor desgaste; valide com os dados reais da corrida.',level:'Apoio à estratégia',icon:'◉'};
 return [{...carRec,type:'CARRO',key:car||'corner'},{...drvRec,type:'PILOTO',key:driver||'raceStart'},{...weatherRec,type:'ESTRATÉGIA',key:weather||'dry'}];
}
function context(){
 const info=window.GBRCore?.trackInfo?.();if(!info)return null;
 const plans=window.F1App?.getGarage?.()?.trackPlans||{};
 const pref=plans[info.series+':'+info.track.id]||{};
 const select=$('trackWeather');const weather=select?.value||pref.weather||'dry';
 return {...info,weather};
}
function card(b){return `<article class="gbr-boost-card"><span class="gbr-boost-icon" aria-hidden="true">${esc(b.icon)}</span><div><span class="gbr-boost-type">${esc(b.type)} · ${esc(b.level)}</span><strong>${esc(b.name)}</strong><p>${esc(b.detail)}</p></div></article>`}
function render(){
 const info=context(),host=$('gbrBoostPanel');if(!info||!host)return;
 const entries=recommends(info);
 host.innerHTML=`<div class="gbr-boost-head"><div><div class="kicker">03 / IMPULSOS TÁTICOS</div><h2>Boosts indicados para ${esc(info.track.name)}</h2><p>Três efeitos a procurar entre os boosts que você realmente possui, considerando pista, série e condição.</p></div><span class="pill">SÉRIE ${info.series}</span></div><div class="gbr-boost-grid">${entries.map(card).join('')}</div><p class="gbr-boost-note">Sugestões de <b>tipo de efeito</b>, não nomes de boosts oficiais nem itens confirmados na sua garagem. Os efeitos disponíveis e a duração devem ser conferidos no F1 Clash.</p>`;
}
function install(){
 const analysis=$('trackAnalysis');if(!analysis)return;
 const panel=document.createElement('div');panel.className='panel';panel.id='gbrBoostPanel';
 const tyreBlocks=analysis.querySelector('.two');tyreBlocks?.after(panel);
 const core=window.GBRCore;
 if(!core)return;
 const oldRender=window.renderRaces;
 if(typeof oldRender==='function')window.renderRaces=function(){const result=oldRender.apply(this,arguments);render();return result};
 $('trackWeather')?.addEventListener('change',render);
 render();
 window.GBRBoosts={recommend:recommends,context,render};
}
install();
})();
