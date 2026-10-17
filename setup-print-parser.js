/* GBR Racing Lab 5.5.12 — interpreta nomes reconhecidos em prints de setups.
   Somente sugere IDs de cartas da garagem autorizada. Nunca cria posse nem estatísticas. */
(()=>{'use strict';
 const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const findWhole=(source,alias)=>{const key=normalize(alias);if(!key||key.length<3)return -1;return (' '+source+' ').indexOf(' '+key+' ');};
 const categories=['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio','Bateria'];
 function aliases(item,kind,legends){
  const names=[item.name];
  if(kind==='drivers')for(const row of legends||[]){
   if([row.name,...row.aliases].some(alias=>normalize(alias)===normalize(item.name)))names.push(row.name,...row.aliases);
  }
  return [...new Set(names.map(normalize).filter(x=>x.length>=3))];
 }
 function scan(text,cards,kind,legends=[]){
  const source=normalize(text);
  if(!source)return [];
  const found=[];
  for(const card of cards||[]){
   if(!card?.name||!card.id)continue;
   const positions=aliases(card,kind,legends).map(alias=>findWhole(source,alias)).filter(pos=>pos>=0);
   if(positions.length)found.push({id:String(card.id),name:String(card.name),category:card.category||'',owned:!!card.owned,position:Math.min(...positions)});
  }
  return found.sort((a,b)=>a.position-b.position);
 }
 function reconcile(partsText,driversText,garage,legends=[]){
  const parts=scan(partsText,garage?.parts,'parts',legends);
  const drivers=scan(driversText,garage?.drivers,'drivers',legends);
  const partIds={};const ambiguities=[];const absent=[];
  for(const category of categories){
   const mentions=parts.filter(p=>p.category===category);
   const names=[...new Set(mentions.map(p=>normalize(p.name)))];
   const owned=mentions.filter(p=>p.owned);
   // Se existem vários nomes mencionados para a mesma categoria, o OCR é ambíguo.
   const selected=names.length===1&&owned.length===1?owned[0]:null;
   partIds[category]=selected?.id||'';
   if(!selected&&mentions.length)ambiguities.push(`${category}: ${[...new Set(mentions.map(p=>p.name))].join(', ')}`);
   if(!mentions.length&&category!=='Bateria')absent.push(category);
  }
  const detectedNames=[...new Set(drivers.map(d=>normalize(d.name)))];
  const selections=detectedNames.map(name=>{
   const matches=drivers.filter(d=>normalize(d.name)===name);
   return matches.length===1&&matches[0].owned?matches[0].id:'';
  }).filter(Boolean);
  const driverIds=selections.slice(0,2);
  while(driverIds.length<2)driverIds.push('');
  if(drivers.length>2||detectedNames.length>2||selections.length<detectedNames.length)ambiguities.push('Pilotos: confirme as versões e raridades no editor.');
  return {partIds,driverIds,parts,drivers,ambiguities,absent,ready:categories.slice(0,6).every(cat=>!!partIds[cat])&&driverIds.every(Boolean)&&driverIds[0]!==driverIds[1]};
 }
 window.GBRSetupPrintParser=Object.freeze({normalize,scan,reconcile,categories:Object.freeze(categories)});
})();
