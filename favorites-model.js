/* GBR Racing Lab 5.5.7 — domínio dos favoritos: validação e cópia imutável das cartas. */
(()=>{
'use strict';
const CATEGORIES=Object.freeze(['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio','Bateria']);
const STATS=Object.freeze({parts:['speed','corner','power','qualifying','pit'],drivers:['overtaking','defending','qualifying','raceStart','tyreUse']});
const MAX=8;
const num=x=>Number.isFinite(Number(x))?Number(x):0;
function snapshot(card,kind){
 const copy={id:String(card.id||''),name:String(card.name||'').slice(0,100),rarity:String(card.rarity||''),editionLabel:String(card.editionLabel||''),level:num(card.level),series:num(card.series)};
 if(kind==='parts')copy.category=String(card.category||'');
 for(const field of STATS[kind])copy[field]=num(card[field]);
 return copy;
}
function resolve(garage,kind,id,old){
 if(!id)return null;
 // Somente as cartas realmente possuídas podem ser escolhidas numa composição nova.
 const current=(Array.isArray(garage[kind])?garage[kind]:[]).find(c=>c.owned&&String(c.id)===String(id));
 if(current)return snapshot(current,kind);
 // Na edição, uma carta removida da garagem pode permanecer no favorito já salvo.
 const previous=kind==='parts'?(old?.parts||[]):(old?.drivers||[]);
 const retained=previous.find(c=>c&&String(c.id)===String(id));
 return retained?snapshot(retained,kind):null;
}
function make(garage,form,existing=null,idFactory=()=>crypto.randomUUID(),now=()=>new Date().toISOString()){
 if(!garage||!Array.isArray(garage.parts)||!Array.isArray(garage.drivers))throw Error('A garagem não está disponível.');
 const all=Array.isArray(garage.favoriteSetups)?garage.favoriteSetups:[];
 if(!existing&&all.length>=MAX)throw Error('Limite de 8 favoritos atingido. Exclua um para salvar outro.');
 if(existing&&!all.some(x=>x.id===existing.id))throw Error('Este favorito não existe mais na garagem.');
 const name=String(form.name||'').trim().replace(/\s+/g,' ');
 if(name.length<2||name.length>64)throw Error('Informe um nome entre 2 e 64 caracteres.');
 const notes=String(form.notes||'').trim();
 if(notes.length>300)throw Error('As observações podem ter até 300 caracteres.');
 const trackId=String(form.trackId||'').slice(0,80);
 const parts=[];
 for(const category of CATEGORIES){
  const id=String(form.partIds?.[category]||'');
  if(!id){if(category==='Bateria')continue;throw Error(`Escolha uma peça para ${category}.`)}
  const card=resolve(garage,'parts',id,existing);
  if(!card||card.category!==category)throw Error(`A peça de ${category} não está disponível na sua garagem.`);
  parts.push(card);
 }
 const ids=Array.isArray(form.driverIds)?form.driverIds.map(x=>String(x||'')):[];
 if(ids.length!==2||ids.some(x=>!x))throw Error('Selecione os dois pilotos.');
 if(ids[0]===ids[1])throw Error('Escolha dois pilotos diferentes.');
 const drivers=ids.map(id=>resolve(garage,'drivers',id,existing));
 if(drivers.some(x=>!x))throw Error('Um dos pilotos não está disponível na sua garagem.');
 const record={id:existing?.id||String(idFactory()),name,notes,trackId,parts,drivers,createdAt:existing?.createdAt||now(),updatedAt:now(),schemaVersion:1};
 if(record.id.length>100)throw Error('Identificador inválido.');
 return record;
}
function totals(record){
 const t={speed:0,corner:0,power:0,qualifying:0,pit:0};
 for(const p of record.parts||[])for(const k of Object.keys(t))t[k]+=num(p?.[k]);
 return t;
}
window.GBRFavoriteModel=Object.freeze({CATEGORIES,MAX,make,snapshot,totals});
})();
