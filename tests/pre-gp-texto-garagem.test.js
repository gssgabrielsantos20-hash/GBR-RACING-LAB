/* Testes de regressão do GBR Pré-GP: texto próprio + garagem isolada. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const tracks=[
 {id:'austin',name:'Austin · COTA',nature:'mista',car:'corner',driver:'raceStart'},
 {id:'baku',name:'Baku',nature:'mista',car:'power',driver:'tyreUse'},
 {id:'monza',name:'Monza',nature:'rapida',car:'speed',driver:'defending'}
];
const window={
 F1Tracks:{all:tracks,plans:(laps,limits)=>{
  if(laps===6&&limits.soft===3)return [{stints:[{type:'soft',laps:3},{type:'soft',laps:3}],stops:1}];
  return [];
 }},
 GBRCore:{TRACK_SERIES:{3:{austin:['raceStart','corner']}},trackWeights:focus=>focus==='speed'?
  {speed:65,corner:10,power:15,qualifying:10}:{speed:15,corner:65,power:10,qualifying:10}},
 GBRRecommendations:{evidence:()=>({mode:'baseline'})},
 GBRBoosts:{recommend:()=>[]}
};
const context={window,document:{getElementById:()=>null,querySelectorAll:()=>[],querySelector:()=>null},console,Date};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'gbr-pre-gp-engine.js'),'utf8'),context);
const engine=window.GBRPreGP;
const briefing=[
 'GP dos Estados Unidos',
 'Júnior:',
 'Corrida 1: Austin | 6 voltas | chuva 0% | carro: velocidade | piloto: ultrapassagem',
 'Competidor:',
 'Corrida 1: Austin | 6 voltas | chuva 100% | carro: curvas | piloto: largada',
 'Corrida 2: Baku | 7 voltas | chuva 35%'
].join('\n');
const parsed=engine.parseBriefing(briefing,{tracks});
assert.equal(parsed.entries.length,3);
const junior=engine.resolve(parsed,{trackId:'austin',categoryId:'junior',stage:'final',round:1});
assert.equal(junior.race.laps,6);
assert.equal(junior.race.weather,'dry');
assert.equal(junior.race.rain,0);
assert.equal(junior.race.carFocus,'speed');
assert.equal(junior.race.driverFocus,'overtaking');
const competitor=engine.resolve(parsed,{trackId:'austin',categoryId:'competidor',stage:'final',round:1});
assert.equal(competitor.race.weather,'wet');
assert.equal(competitor.race.rain,100);
assert.equal(competitor.race.carFocus,'corner');
assert.equal(competitor.race.driverFocus,'raceStart');
assert.equal(engine.resolve(parsed,{trackId:'austin',categoryId:'campeao',stage:'final',round:1}).race,null);
assert.equal(engine.resolve(parsed,{trackId:'baku',categoryId:'competidor',stage:'final',round:2}).race.weather,'variable');
assert.equal(engine.parseBriefing('Corrida 1: COTA | 6 voltas | seco',{tracks}).entries[0].trackId,'austin');
assert.equal(engine.parseBriefing('Corrida 1: Interlagos | 6 voltas',{tracks}).entries.length,0);
assert.equal(engine.parseBriefing('Corrida 1: Austin e Baku | 6 voltas',{tracks}).entries.length,0);
assert.throws(()=>engine.parseBriefing('x'.repeat(20001),{tracks}));
const malformed=engine.parseBriefing('Corrida 1: Austin | 6 voltas | chuva 150%',{tracks});
assert.equal(malformed.entries.length,0);
const missing=engine.parseBriefing('Corrida 1: Austin | carro: velocidade',{tracks});
assert.equal(missing.entries[0].laps,null);
assert.equal(missing.entries[0].weather,null);
const categories=['Suspensão','Motor','Asa traseira','Asa dianteira','Freios','Câmbio','Bateria'];
const parts=categories.map((category,i)=>({
 id:'p'+i,name:'Peça '+i,category,series:2,owned:true,level:4,speed:50,corner:40,power:30,qualifying:20,pit:1
}));
parts.push({id:'not_owned',name:'Carta impossível',category:'Motor',series:1,owned:false,level:9,speed:999,corner:999,power:999,qualifying:999});
const drivers=[
 {id:'d1',name:'Alice Silva',rarity:'Rare',series:2,owned:true,level:4,overtaking:75,defending:50,qualifying:60,raceStart:70,tyreUse:60},
 {id:'d2',name:'Bruno Costa',rarity:'Rare',series:2,owned:true,level:4,overtaking:55,defending:70,qualifying:60,raceStart:80,tyreUse:60},
 {id:'d3',name:'Alice Silva',rarity:'Epic',series:2,owned:true,level:5,overtaking:100,defending:100,qualifying:100,raceStart:100,tyreUse:100},
 {id:'legend',name:'César Ferreira',rarity:'Legendary',series:1,owned:true,level:5,overtaking:150,defending:150,qualifying:150,raceStart:150,tyreUse:150}
];
const garage={parts,drivers,trackPlans:{'3:austin':{soft:3,medium:4,hard:5,wet:4}},raceAnalyses:[]};
window.F1App={getGarage:()=>garage};
window.GBRPreGPUI={raceFor:()=>junior.race};
vm.runInContext(fs.readFileSync(path.join(root,'events-gp.js'),'utf8'),context);
const event=window.GBREvents.all[0],category=window.GBREvents.categories[0];
const setup=window.GBREvents.computeSetup(event,category,'austin',garage);
assert.equal(setup.carFocus,'speed');
assert.equal(setup.driverFocus,'overtaking');
assert.equal(setup.parts.length,6);
assert.equal(setup.complete,true);
assert.equal(setup.parts.some(p=>p.id==='not_owned'),false);
assert.equal(setup.drivers.some(d=>d.rarity==='Legendary'),false);
assert.notEqual(setup.drivers[0].name,setup.drivers[1].name);
const plan=engine.buildPlan({result:setup,garage,race:junior.race});
assert.equal(plan.laps,6);
assert.equal(plan.weather,'dry');
assert.equal(plan.tyreOptions[0].stints.reduce((sum,s)=>sum+s.laps,0),6);
assert.equal(plan.boostVerified,false);
assert.match(plan.boostNote,/não cadastra quantidades/);
assert.match(plan.energy[0],/indisponível na primeira volta/);
assert.equal(engine.buildPlan({result:setup,garage,race:null}).tyreOptions.length,0);
const wet=engine.buildPlan({result:setup,garage,race:competitor.race});
assert.equal(wet.tyreOptions[0].stints.reduce((sum,s)=>sum+s.laps,0),6);
assert.ok(!fs.readFileSync(path.join(root,'gbr-pre-gp-ui.js'),'utf8').includes('fetch('));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(html.indexOf('gbr-pre-gp-engine.js')<html.indexOf('events-gp.js'));
assert.ok(html.indexOf('events-gp.js')<html.indexOf('gbr-pre-gp-ui.js'));
assert.equal(engine.parseBriefing('Pista: Austin',{tracks}).entries[0].trackId,'austin');
// A leitura de relatório da conta anterior deve ser negada ANTES de calcular novo setup.
let currentUser='conta-1',applyHandler=null;
const textField={value:'Júnior:\nCorrida 1: Austin | 6 voltas | chuva 0%'};
const fakeHub={querySelector:selector=>selector==='.gp-result-panel'?fakePanel:null};
const fakePanel={insertAdjacentHTML(){},querySelector:()=>null};
const fakeResult={querySelector:()=>null};
const fakeDoc={getElementById:id=>({
 gbrEventHub:fakeHub,gbrGpResult:fakeResult,gpBriefingText:textField,
 gpBriefingApply:{addEventListener:(event,fn)=>{if(event==='click')applyHandler=fn}},
 gpBriefingClear:{addEventListener(){}},gpBriefingFeedback:{textContent:''}
})[id]||null};
const uiWin={
 GBRPreGP:engine,F1Tracks:window.F1Tracks,
 F1Session:{getContext:()=>({userId:currentUser,demo:false})},
 GBREvents:{
  all:[{id:'gp',name:'GP de teste',tracks:['austin']}],
  categories:[{id:'junior',label:'Júnior',series:3}],
  getState:()=>({selectedEventId:'gp',selectedCategoryId:'junior',selectedTrackId:'austin',selectedStage:'final',selectedRound:1}),
  computeSetup:()=>null,select(){}
 },
 F1App:{getGarage:()=>garage}
};
const uiCtx={window:uiWin,document:fakeDoc,console};
vm.createContext(uiCtx);
vm.runInContext(fs.readFileSync(path.join(root,'gbr-pre-gp-ui.js'),'utf8'),uiCtx);
assert.equal(typeof applyHandler,'function');
applyHandler();
assert.equal(uiWin.GBRPreGPUI.raceFor('gp','junior','austin','final',1).laps,6);
currentUser='conta-2';
assert.equal(uiWin.GBRPreGPUI.raceFor('gp','junior','austin','final',1),null);
// O comunicado original do GP deve funcionar SEM corridas/voltas explícitas.
const allUS=[...tracks,
 {id:'sakhir',name:'Sakhir'},{id:'hungaroring',name:'Hungaroring'},
 {id:'madrid',name:'Madri · Madring'},{id:'barcelona',name:'Barcelona-Catalunya'},
 {id:'sao-paulo',name:'São Paulo · Interlagos'}];
const original=ctx.window.GBRPreGP.parseEventBriefing(event.briefingText,{
 tracks:allUS,drivers:event.driverBoosts.map(x=>x.label),parts:event.partBoosts
});
assert.equal(original.tracks.length,7,'Comunicado: sete circuitos reconhecidos');
assert.equal(original.entries.length,0,'Lista de pistas não é calendário de corridas');
assert.equal(original.driverBoosts.length,2);
assert.equal(original.partBoosts.length,3);
assert.equal(original.featuredPercent,10);
assert.equal(original.eventBoost,'Eagle');
assert.equal(original.allowLegendary,false);
assert.equal(original.allowSpecial,true);
assert.equal(original.warnings.length,0);
assert.equal(ctx.window.GBRPreGP.resolve(original,{trackId:'austin',categoryId:'junior',stage:'final',round:1}).race,null);
console.log('OK: parser, categorias, clima, garagem, pneus, bateria, Boost e integração Pré-GP.');
