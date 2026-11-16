/* GBR Racing Lab 2026-10-26 — Catálogo não destrutivo de edições especiais.
   A Hutch confirmou oito Paddock Picks, cada um em Standard e Turbo Charged.
   O print IMG_9794(3).jpeg identifica seis cartas verdes; atributos ainda não confirmados.
   Não presume posse, nível, série, estatísticas ou imagem oficial. */
(()=>{'use strict';
 const names=Object.freeze(['Piastri','Bortoleto','Gasly','Bearman','Colapinto','Antonelli','Hadjar','Lindblad']);
 // Print próprio IMG_9794(3).jpeg: seis cartas assinadas de fundo verde.
 const greenNames=Object.freeze(['Verstappen','Leclerc','Lawson','Hadjar','Piastri','Sainz']);
 const variants=Object.freeze([
  Object.freeze({id:'paddock-standard',label:'Escolhas do Paddock',official:'Standard'}),
  Object.freeze({id:'paddock-turbo',label:'Escolhas do Paddock: Turbo',official:'Turbo Charged'})
 ]);
 function register(ref){
  if(!ref||!ref.drivers||typeof ref.drivers!=='object')return 0;
  let count=0;
  for(const name of names)for(const v of variants){
   const key='Special|'+v.id+'|'+name;
   if(Object.hasOwn(ref.drivers,key))continue;
   ref.drivers[key]={name,rarity:'Special',editionLabel:v.label,series:0,levels:{},catalogSource:'Hutch Paddock Picks 2026'};
   count++;
  }
  for(const name of greenNames){
   const key='Special|green|'+name;
   if(Object.hasOwn(ref.drivers,key))continue;
   ref.drivers[key]={name,rarity:'Special',editionLabel:'Edições Especiais',series:0,levels:{},catalogSource:'Hutch Signature Collection 26/10/2026 (atributos não publicados)'};
   count++;
  }
  return count;
 }
 // Os três grupos são distintos. "Signature Collection" é um rótulo legado/tema
 // reconhecido como grupo verde sem reescrever os dados salvos de cada jogador.
 const collections=Object.freeze([
  Object.freeze({id:'paddock',label:'Escolhas do Paddock',editionLabel:'Escolhas do Paddock'}),
  Object.freeze({id:'paddock-turbo',label:'Escolhas do Paddock Turbo',editionLabel:'Escolhas do Paddock: Turbo'}),
  Object.freeze({id:'green',label:'Edições Especiais',editionLabel:'Edições Especiais'})
 ]);
 const normal=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 function groupOf(card){
  if(!card||card.rarity!=='Special')return '';
  const edition=normal(card.editionLabel);
  if(/(?:escolhas do paddock|paddock picks)/.test(edition))return /(?:turbo|turbo charged)/.test(edition)?'paddock-turbo':'paddock';
  if(/(?:edicoes especiais|special editions|signature collection|colecao signature|edicao signature|assinaturas)/.test(edition))return 'green';
  return ''; // Nunca classificar silenciosamente uma carta sem edição como Paddock ou verde.
 }
 function equivalentEdition(a,b){
  const left=groupOf({rarity:'Special',editionLabel:a}),right=groupOf({rarity:'Special',editionLabel:b});
  return left&&right?left===right:normal(a)===normal(b);
 }
 const manifest=Object.freeze({
  paddockPicks:Object.freeze({drivers:names,variants,source:'https://www.hutch.io/blog/games/paddock-picks/'}),
  signature:Object.freeze({themeConfirmedByBundle:true,driversVerified:true,drivers:greenNames,identityEvidence:'IMG_9794(3).jpeg',statsVerified:false,artExtracted:false,
   sourceOfficial:'https://f1clashgame.com/news/f1-clash-signature-collection/',
   imagesReference:'https://www.allclash.com/beat-series-12-in-f1-clash-best-car-setup-drivers-pit-stop-strategy-rec-boosters/',
   bundle:'Android/collectiontheme_signaturecollection_assets_all_cd8fd0356dc8ae1b367bd709bfffebd6.bundle'})
 });
 window.GBRSpecialEditions=Object.freeze({register,manifest,collections,groupOf,equivalentEdition});
 register(window.F1Reference);
})();
