/* GBR Racing Lab 5.5.10 — Lendários 2026: identidade única, aliases e referências verificadas.
   Séries/atributos não são inferidos: cada jogador registra os valores da própria carta. */
(()=>{
'use strict';
const drivers=[{"name":"Fisichella","aliases":["Giancarlo Fisichella"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-fisichella-legendary.jpg","imageStatus":"verified_reference"},{"name":"McLaren","aliases":[],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-mclaren-legendary.jpg","imageStatus":"verified_reference"},{"name":"Gilles Villeneuve","aliases":["G. Villeneuve","G.Villeneuve","G Villeneuve"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-gvilleneuve-legendary.jpg","imageStatus":"verified_reference"},{"name":"Webber","aliases":["Mark Webber"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-webber-legendary.jpg","imageStatus":"verified_reference"},{"name":"Berger","aliases":["Gerhard Berger"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-berger-legendary.jpg","imageStatus":"verified_reference"},{"name":"Massa","aliases":["Felipe Massa"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-massa-legendary.jpg","imageStatus":"verified_reference"},{"name":"Coulthard","aliases":["David Coulthard"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-coulthard-legendary.jpg","imageStatus":"verified_reference"},{"name":"Rindt","aliases":["Jochen Rindt"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-rindt-legendary.jpg","imageStatus":"verified_reference"},{"name":"Hunt","aliases":["James Hunt"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-hunt-legendary.jpg","imageStatus":"verified_reference"},{"name":"Jacques Villeneuve","aliases":["J. Villeneuve","J.Villeneuve","J Villeneuve"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-villeneuve-legendary.jpg","imageStatus":"verified_reference"},{"name":"Andretti","aliases":["Mario Andretti"],"imageUrl":null,"imageStatus":"unverified_reference"},{"name":"Button","aliases":["Jenson Button"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-button-legendary.jpg","imageStatus":"verified_reference"},{"name":"Damon Hill","aliases":["D. Hill","D.Hill","D Hill"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-dhill-legendary.jpg","imageStatus":"verified_reference"},{"name":"Mansell","aliases":["Nigel Mansell"],"imageUrl":null,"imageStatus":"unverified_reference"},{"name":"Graham Hill","aliases":["G. Hill","G.Hill","G Hill"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-ghill-legendary.jpg","imageStatus":"verified_reference"},{"name":"Fittipaldi","aliases":["Emerson Fittipaldi"],"imageUrl":null,"imageStatus":"unverified_reference"},{"name":"Lauda","aliases":["Niki Lauda"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-lauda-legendary.jpg","imageStatus":"verified_reference"},{"name":"Brabham","aliases":["Jack Brabham"],"imageUrl":null,"imageStatus":"unverified_reference"},{"name":"Fangio","aliases":["Juan Manuel Fangio"],"imageUrl":null,"imageStatus":"unavailable"},{"name":"Prost","aliases":["Alain Prost"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-prost-legendary.jpg","imageStatus":"verified_reference"},{"name":"Schumacher","aliases":["Michael Schumacher"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-schumacher-legendary.jpg","imageStatus":"verified_reference"},{"name":"Senna","aliases":["Ayrton Senna"],"imageUrl":"https://www.allclash.com/wp-content/uploads/2026/04/f1clash-driver-senna-legendary.jpg","imageStatus":"verified_reference"}];
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const names=new Map();
for(const driver of drivers){
 for(const name of [driver.name,...driver.aliases]){
  const key=normal(name);
  if(names.has(key)&&names.get(key)!==driver)throw Error('Alias de lendário ambíguo: '+name);
  names.set(key,driver);
 }
}
function lookup(name){return names.get(normal(name))||null}
function equivalent(a,b){const first=lookup(a),second=lookup(b);return Boolean(first&&second&&first===second)}
function matchesOCR(text){
 const source=' '+normal(text)+' ';
 let best=null,score=0;
 for(const driver of drivers)for(const alias of [driver.name,...driver.aliases]){
  const needle=normal(alias);
  if(source.includes(' '+needle+' ')&&needle.length>score){best=driver;score=needle.length;}
 }
 return best;
}
function register(reference){
 if(!reference||typeof reference!=='object')return;
 if(!reference.drivers||typeof reference.drivers!=='object')reference.drivers={};
 for(const driver of drivers){
  const key='Legendary|'+driver.name;
  // Não substitui entradas que já contenham atributos confirmados.
  if(!Object.hasOwn(reference.drivers,key))reference.drivers[key]={name:driver.name,rarity:'Legendary',series:0,levels:{}};
 }
}
window.GBRLegendaryDrivers=Object.freeze({all:Object.freeze(drivers.map(d=>Object.freeze({...d,aliases:Object.freeze([...d.aliases])}))),lookup,equivalent,matchesOCR,register,normal});
})();
