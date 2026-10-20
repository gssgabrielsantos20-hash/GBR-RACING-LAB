/* GBR 5.5.14C-R2 — aproximação transparente pelo catálogo 2026.
   Nunca usa atributos de pilotos como bônus de pit stop: não existe regra verificada para isso.
   Sem sete peças distintas, carta/raridade/nível verificáveis, não há estimativa. */
(()=>{'use strict';
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const finite=v=>typeof v==='number'&&Number.isFinite(v);
function fromParts(parts,reference){
 const db=reference?.parts;
 if(!Array.isArray(parts)||parts.length!==7||!db||typeof db!=='object')return null;
 const index=new Map();
 for(const [name,entry] of Object.entries(db)){
  const key=norm(name);if(!key)continue;
  index.set(key,index.has(key)?null:{name,entry});
 }
 const names=new Set(),categories=new Set(),confirmed=[];let sum=0;
 for(const card of parts){
  const key=norm(card?.name),level=Number(card?.level),match=index.get(key);
  if(!key||names.has(key)||!match||!Number.isInteger(level)||level<1||level>20)return null;
  if(card.rarity&&card.rarity!==match.entry.rarity)return null;
  if(card.series!==undefined&&card.series!==null&&String(card.series)!==''&&Number(card.series)!==match.entry.series)return null;
  if(card.category){if(categories.has(card.category))return null;categories.add(card.category);}
  const stats=match.entry.levels?.[String(level)],pit=stats?.[4];
  if(!Array.isArray(stats)||!finite(pit)||pit<=0||pit>10)return null;
  names.add(key);sum+=pit;
  confirmed.push({name:match.name,level,rarity:match.entry.rarity,series:match.entry.series});
 }
 if(!(sum>0&&sum<60))return null;
 return {value:Math.round((sum+Number.EPSILON)*100)/100,method:'parts-catalog',parts:confirmed,reference:'F1 Clash 2026 Resource Sheet v1.1'};
}
function fromFavorite(favorite,observed,reference){
 if(!favorite||!Array.isArray(favorite.parts))return null;
 const calculated=fromParts(favorite.parts,reference);if(!calculated)return null;
 // O favorito selecionado é uma escolha explícita, mas atributos disponíveis
 // que o contradizem invalidam a hipótese; até 5 pontos de diferença
 // são tolerados por possíveis bônus do jogo, não por mudança de configuração.
 const expected=window.GBRFavoriteModel?.totals?.(favorite);
 if(!expected)return null;
 let checked=0;
 for(const key of ['speed','corner','power','qualifying']){
  const raw=observed?.[key];if(raw===''||raw===null||raw===undefined)continue;
  const v=Number(raw);
  if(!Number.isFinite(v)||Math.abs(v-expected[key])>5)return null;
  checked++;
 }
 if(checked<3)return null;
 return {...calculated,method:'favorite-catalog',verifiedMetrics:checked};
}
// Reconhece somente os SETE nomes e níveis explicitamente lidos nas posições
// das cartas da imagem oficial. Sem correspondência única, mantém "não verificado".
function identifyFromCarPrint(data,reference){
 const words=(Array.isArray(data?.words)?data.words:[]).filter(w=>w&&typeof w.text==='string'&&w.bbox&&Number(w.confidence)>=55).map(w=>({
  text:w.text,x:(Number(w.bbox.x0)+Number(w.bbox.x1))/2,y:(Number(w.bbox.y0)+Number(w.bbox.y1))/2,c:Number(w.confidence)
 })).filter(w=>Number.isFinite(w.x)&&Number.isFinite(w.y));
 const width=Math.max(Number(data?.imageWidth)||0,...words.map(w=>w.x),0);
 if(width<300)return {own:null,rival:null};
 const speed=words.filter(w=>norm(w.text)==='velocidade').sort((a,b)=>b.c-a.c)[0];
 if(!speed)return {own:null,rival:null};
 const lookup=Object.entries(reference?.parts||{});
 const groups={own:[[],[]],rival:[[],[]]};
 // Layout de relatório 2026, 3 cartas na primeira linha e 4 na segunda.
 // As faixas horizontais ficam restritas ao cartão correspondente.
 const top=[.132,.247,.358],bottom=[.088,.193,.301,.412];
 const columns={own:[top,bottom],rival:[top.map(x=>x+.515),bottom.map(x=>x+.515)]};
 const yBounds=[[speed.y-455,speed.y-295],[speed.y-305,speed.y-125]];
 for(const team of ['own','rival'])for(let row=0;row<2;row++){
  for(const xRatio of columns[team][row]){
   const center=xRatio*width,[y0,y1]=yBounds[row],near=words.filter(w=>Math.abs(w.x-center)<width*.052&&w.y>=y0&&w.y<=y1);
   const label=near.filter(w=>w.y>y0+40&&w.y<y1-23).sort((a,b)=>a.y-b.y||a.x-b.x).map(w=>norm(w.text)).join('');
   const matched=lookup.filter(([name])=>{const n=norm(name);return n.length>=5&&label.includes(n)});
   const levels=near.filter(w=>w.y>y1-42&&w.y<=y1&&/^\d{1,2}$/.test(w.text)&&w.c>=70&&Number(w.text)>=1&&Number(w.text)<=20);
   groups[team][row].push(matched.length===1&&levels.length===1?{
    name:matched[0][0],level:Number(levels[0].text),rarity:matched[0][1].rarity,series:matched[0][1].series
   }:null);
  }
 }
 const build=team=>{const cards=groups[team].flat();return cards.length===7&&cards.every(Boolean)?cards:null};
 return {own:build('own'),rival:build('rival')};
}
window.GBRPitEstimate=Object.freeze({fromParts,fromFavorite,identifyFromCarPrint});
})();
