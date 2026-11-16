'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const event={id:'sao',name:'GP São Paulo',starts:'2026-11-04',ends:'2026-11-08',tracks:['sao-paulo','monaco'],rulesConfirmed:true,allowLegendary:false,allowSpecial:true,
 stageRounds:{qualifying:[{track:'sao-paulo',laps:9}],opening:[{track:'monaco',laps:8}]}};
const cats=[{id:'campeao',series:12,label:'Campeão'},{id:'contendor',series:9,label:'Contendor'}];
const tracks=[{id:'sao-paulo',name:'Interlagos'},{id:'monaco',name:'Mônaco'}];
const context={window:{GBREvents:{isAllowedDriver:(d,e,c)=>d.owned&&d.level>0&&d.series<=c.series&&(!d.rarity||d.rarity!=='Legendary'||e.allowLegendary)}},console,Date,Math,Number,Set,Map};
vm.createContext(context);
for(const f of ['gbr-podium-model.js','gbr-recommendation-engine.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),context,{filename:f});
const m=context.window.GBRPodiumModel,rec=context.window.GBRRecommendations;
assert(m&&rec?.podiumPairs);
let seq=0;
const opts={events:[event],categories:cats,tracks,id:()=>`ob-${++seq}`,now:()=>`2026-11-04T10:00:00.000Z`};
const make=(overrides={})=>m.create({eventId:'sao',categoryId:'campeao',trackId:'sao-paulo',stage:'qualifying',raceNumber:'1',raceDate:'2026-11-04',competitorType:'bot',name:'Bot '+(seq+1),
 gridPosition:5,finishPosition:2,drivers:['Hamilton','Colapinto'],parts:['Charge Core','Velocity'],tyreStints:['soft','medium'],stops:1,pitLoss:'0',wearLoss:'',leader:'yes',fastestLap:'unknown',bestLapSeconds:'88.125',notes:'observado',...overrides},opts);
const first=make();assert.equal(first.gridPosition-first.finishPosition,3);assert.equal(first.source,'manual-revisado-gp');
assert.equal(m.profileOf(first),'recovery');
assert.equal(m.profileOf(make({gridPosition:2,finishPosition:2})),'grid');
assert.equal(m.profileOf(make({gridPosition:4,finishPosition:3})),'consistency');
assert.equal(m.profileOf(make({finishPosition:7})),null);
for(const invalid of [{finishPosition:0},{finishPosition:25},{gridPosition:'2.5'},{pitLoss:-1},{parts:new Array(8).fill('P')},
 {tyreStints:['unknown']},{raceDate:'2026-02-30'},{stage:'opening',raceNumber:1,trackId:'sao-paulo'},{name:'<img onerror=alert(1)>'},
 {stops:0,tyreStints:['soft','medium']},{competitorType:'admin'}]){
 assert.throws(()=>make(invalid),'deve rejeitar campo inválido: '+JSON.stringify(invalid));
}
const garage={raceAnalyses:[{id:'duel1',result:'win'}],favoriteSetups:[],gpPodiumObservations:[]};
garage.gpPodiumObservations=m.add(garage,first);assert.equal(garage.raceAnalyses.length,1);
assert.throws(()=>m.add(garage,first));
let records=[first];
// 14 amostras distintas, 6 pódios e 2 pistas. A comparação permanece na Série 12 / Campeão.
for(let i=1;i<14;i++)records.push(make({name:'Bot '+i,trackId:i%2?'monaco':'sao-paulo',stage:i%2?'opening':'qualifying',
 gridPosition:i%3===0?2:8,finishPosition:i<6?(i%3)+1:7+(i%5),pitLoss:i%2?'':'2',wearLoss:i%2?'1':'',leader:i%2?'yes':'no'}));
const report=m.summarize(records,{categoryId:'campeao',series:12,competitorType:'bot'});
assert.equal(report.sample,14);assert.equal(report.podium,6);assert.equal(report.adequate,true);assert.equal(report.tracks.length,2);
assert(report.avgFinish>3);assert(report.rate<100);assert(report.avgPitLoss!==null);assert(report.pitLossN<14);
assert.equal(report.profiles.reduce((s,x)=>s+x.count,0),report.podium);
assert(report.driverPairs.some(x=>x.name.includes('Hamilton')));
const other=make({categoryId:'contendor',name:'Outra categoria'});
assert.equal(m.summarize([...records,other],{categoryId:'campeao',series:12}).sample,14);
assert.equal(m.summarize([first],{categoryId:'campeao',series:12}).adequate,false);
const human=make({competitorType:'jogador',name:'Piloto humano'});
assert.equal(m.summarize([...records,human],{categoryId:'campeao',competitorType:'bot'}).sample,14);
assert.equal(m.summarize([first,first],{categoryId:'campeao'}).sample,1,'deduplicar por id');
const drivers=[{id:'d1',name:'Hamilton',rarity:'Epic',level:5,series:12,owned:true,overtaking:90,defending:70,qualifying:75,raceStart:78,tyreUse:65},
 {id:'d2',name:'Colapinto',rarity:'Epic',level:6,series:12,owned:true,overtaking:77,defending:74,qualifying:82,raceStart:70,tyreUse:91},
 {id:'d3',name:'Mansell',rarity:'Legendary',level:1,series:12,owned:true,overtaking:99,defending:99,qualifying:99,raceStart:99,tyreUse:99}];
const candidates=rec.podiumPairs({drivers},cats[0],event,report);
assert.equal(candidates.eligible,true);assert.equal(candidates.pairs.length,3);
assert(candidates.pairs.every(x=>x.drivers.length===2&&!x.drivers.some(d=>d.name==='Mansell')));
assert.equal(rec.podiumPairs({drivers},cats[0],{...event,rulesConfirmed:false},report).eligible,false);
assert.equal(rec.podiumPairs({drivers},cats[0],event,m.summarize([first])).eligible,false);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const id of ['gbrpw-podium-form','gbrpw-podium-event','gbrpw-podium-category','gbrpw-podium-track','gbrpw-podium-report','gbrpw-podium-history','gbrpw-podium-suggestions'])assert(html.includes(`id="${id}"`),id);
assert(html.indexOf('gbr-podium-model.js')<html.indexOf('gbr-recommendation-engine.js'));
assert(html.indexOf('gbr-podium-ui.js')>html.indexOf('gbr-pit-wall.js'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');assert(app.includes('gpPodiumObservations:[]')&&app.includes('if(!Array.isArray(data.gpPodiumObservations))'));
const cloud=fs.readFileSync(path.join(root,'cloud.js'),'utf8');assert(cloud.includes('JSON.stringify(window.F1App.getGarage())'));
const ui=fs.readFileSync(path.join(root,'gbr-podium-ui.js'),'utf8');assert(ui.includes('window.F1Session.scheduleSave()')&&ui.includes('context?.enabled&&context.userId&&!context.demo'));
console.log('PASS Modo Pódio Global: validação, padrões, isolamento por categoria/série, amostra, elegibilidade, integração com JSON da garagem e proteção na UI.');
