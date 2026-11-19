/* GBR Racing Lab 5.5.8 — vitrine da garagem: 6 recentes sem alterar o máximo de 8. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'..','favorites.js'),'utf8');
function run(count){
 const cards=Array.from({length:count},(_,i)=>({id:`f${i}`,name:`Setup ${i}`,updatedAt:new Date(Date.UTC(2026,9,1+i)).toISOString(),parts:[],drivers:[]}));
 const garage={favoriteSetups:cards,parts:[],drivers:[]};
 const elements=new Map();
 const elem=id=>{if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',hidden:false,disabled:false,title:'',onclick:null,querySelectorAll:()=>[],querySelector:()=>null,replaceChildren(){this.innerHTML=''},addEventListener(){},focus(){}});return elements.get(id);};
 const fakeDocument={getElementById:elem,querySelector:()=>null};
 const sandbox={window:{F1App:{getGarage:()=>garage,setGarage:()=>{},refresh:()=>{}},GBRFavoriteModel:{MAX:8,CATEGORIES:[],totals:()=>({speed:0,corner:0,power:0,qualifying:0,pit:0})},F1Tracks:{all:[]},F1Session:{getContext:()=>({demo:false})}},document:fakeDocument,console};
 vm.runInNewContext(code,sandbox);
 const markup=elem('gbrGarageFavoritesBody').innerHTML;
 return {html:markup,api:sandbox.window.GBRFavorites,count:elem('favCount').textContent};
}
for (const [stored,shown] of [[0,0],[3,3],[6,6],[8,6]]) {
 const {html,count}=run(stored);
 assert.equal((html.match(/class="fav-spot-card"/g)||[]).length,shown,`vitrine ${stored}`);
 assert.match(count,new RegExp('^'+stored+' / 8$'));
 if(stored===8)assert.match(html,/disabled title="Limite de favoritos alcançado"/);
 console.log(`OK: ${stored} salvos → ${shown} apresentados`);
}
const {html}=run(8);
assert.match(html,/Setup 7/);
assert.doesNotMatch(html,/Setup 0/);
assert.doesNotMatch(html,/Setup 1/);
assert.match(fs.readFileSync(path.join(__dirname,'..','favorites-model.js'),'utf8'),/const MAX=8;/);
console.log('OK: exibe os 6 mais recentes; limite pessoal de 8 intacto');
