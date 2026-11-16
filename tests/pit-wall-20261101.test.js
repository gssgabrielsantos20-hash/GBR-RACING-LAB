'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.join(__dirname,'..');const code=fs.readFileSync(path.join(root,'gbr-pit-wall.js'),'utf8');
const parts=[{id:'p1',name:'Adrenaline',rarity:'Epic',category:'Bateria',level:4,owned:true,speed:10,corner:11,power:12,qualifying:13,pit:3},
{id:'p2',name:'Eco Cell+',rarity:'Epic',category:'Bateria',level:1,owned:true,speed:18,corner:14,power:16,qualifying:15,pit:2}];
const drivers=[{id:'d1',name:'Nigel Mansell',rarity:'Legendary',level:1,owned:true,overtaking:10,defending:15,qualifying:12,raceStart:13,tyreUse:11},
{id:'d2',name:'Nigel Mansell',rarity:'Legendary',level:1,owned:false},
{id:'d3',name:'Nigel Mansell',rarity:'Epic',level:5,owned:true,overtaking:20,defending:25,qualifying:22,raceStart:23,tyreUse:21},
{id:'d4',name:'Max Verstappen',rarity:'Special',editionLabel:'Edições Especiais',owned:false}];
const garage={parts,drivers,raceAnalyses:[],deletedCards:{parts:[],drivers:[]}};
const ctx={window:{F1App:{getGarage:()=>garage},F1Reference:{parts:{Adrenaline:{levels:{1:[1,2,3,4,5]}},'Eco Cell+':{levels:{1:[1,2,3,4,5]}}}},GBRCardArt:{getSource:()=>({url:'',origin:'none'})},GBRLegendaryDrivers:{lookup:name=>({name})},GBRSpecialEditions:{groupOf:x=>x.editionLabel==='Edições Especiais'?'green':''},F1Tracks:{all:[{id:'sao-paulo',name:'São Paulo',car:'balanced'}]},GBREvents:{all:[{id:'sao',name:'O Espetáculo de São Paulo',starts:'2026-11-04',ends:'2026-11-08',eventBoost:'Samba',tracks:['sao-paulo'],driverBoosts:[{key:'mansell',label:'Nigel Mansell',rarity:'Legendary'}],partBoosts:['Adrenaline'],rulesConfirmed:true,featuredPercent:10},{id:'qatar',name:'Catar',starts:'2026-11-25',ends:'2026-11-29',eventBoost:'A confirmar',tracks:['sao-paulo'],driverBoosts:[],partBoosts:[],rulesConfirmed:false}],categories:[{id:'campeao',label:'Campeão',series:12}],computeSetup:()=>({complete:false,parts,drivers:[drivers[0],null],featuredCount:1})},GBRCore:{trackWeights:()=>({speed:30,corner:30,power:25,qualifying:15})}},document:{readyState:'loading',addEventListener:()=>{},getElementById:()=>null},URL,console,Date,Number,Set,Map,navigator:{},alert:()=>{}};
vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'gbr-pit-wall.js'});const pit=ctx.window.GBRPitWall;
assert(pit,'módulo não exposto');let r=pit.issues();assert.equal(r.owned,4);assert.equal(r.duplicates.length,1,'cartas de mesma raridade e edição');assert.equal(r.missingLevels.length,1,'não inventar níveis de peças S12');assert.equal(r.unknownImages.length,6);
const cmp=pit.comparison(parts[0],parts[1],1000000);assert.equal(cmp.delta.speed,8);assert(cmp.gain>0);assert.equal(cmp.roi,cmp.gain);
assert.equal(pit.comparison(parts[0],drivers[0],500),null,'não comparar classes diferentes');
let p=pit.eventPlan('sao','campeao','sao-paulo');assert(p.estimate&&p.event.eventBoost==='Samba');assert.equal(p.warning.includes('nenhum stint'),true);
p=pit.eventPlan('qatar','campeao','sao-paulo');assert.equal(p.estimate,null);assert(p.warning.includes('não confirmadas'));
// Mantém a rota antiga sem ordem e diferencia calendários oficiais já conhecidos.
ctx.window.GBREvents.all[0].stageRounds={qualifying:[{track:'sao-paulo',laps:9,rain:0}]};
p=pit.eventPlan('sao','campeao','sao-paulo');assert(p.warning.includes('sequência')&&p.warning.includes('nenhum stint'));
const ics=pit.datesToICS(ctx.window.GBREvents.all);assert(ics.includes('DTSTART;VALUE=DATE:20261104'));assert(ics.includes('DTEND;VALUE=DATE:20261109'));assert(ics.includes('TRIGGER:-P1D'));assert(!ics.includes('Nigel Mansell'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const x of ['gbr-pit-wall','gbrpw-audit','gbrpw-event','gbrpw-plan','gbrpw-compare','gbrpw-history','gbrpw-radar','gbrpw-calendar'])assert(html.includes(`id="${x}"`),x);assert(html.indexOf('gbr-pit-wall.js')>html.indexOf('cloud.js'),'Pit Wall deve carregar depois do app');
console.log('PASS Pit Wall: identidade/edições, S12 sem dados inventados, comparador ROI, evento confirmado/bloqueado, calendário e integração HTML.');
