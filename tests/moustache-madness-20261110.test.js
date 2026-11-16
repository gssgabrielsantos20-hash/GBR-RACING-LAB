/* Regressão do evento Loucura do Bigode — dados transcritos das capturas de 10/11/2026. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const store={};
const garage={drivers:[],parts:[],trackPlans:{}};
const ctx={window:{F1App:{getGarage:()=>garage}},document:{getElementById:()=>null,dispatchEvent(){}},localStorage:{getItem:key=>store[key]||null,setItem:(key,value)=>store[key]=value},URL,console,setInterval(){},clearInterval(){},CustomEvent:function(){}};
vm.createContext(ctx);
for(const name of ['legendary-drivers.js','catalog.js','special-editions.js','card-art.js'])vm.runInContext(read(name),ctx,{filename:name});
const patched=read('events-gp.js').replace('makeNav();\n})();','window.__eventTest={events:EVENTS,sponsorHtml};\n})();');
assert.notEqual(patched,read('events-gp.js'),'Gancho do teste encontrado');
vm.runInContext(patched,ctx,{filename:'events-gp.js'});
const event=ctx.window.__eventTest.events.find(e=>e.id==='moustache-madness-2026');
assert.ok(event);
assert.equal(event.starts,'2026-11-11');
assert.equal(event.ends,'2026-11-15');
assert.deepEqual(JSON.parse(JSON.stringify(event.stages)),{qualifying:'11–13/11/2026',opening:'14/11/2026',final:'15/11/2026'});
assert.equal(new Date(event.starts+'T12:00:00Z').getUTCDay(),3,'Evento começa na quarta-feira');
assert.equal(new Date(event.ends+'T12:00:00Z').getUTCDay(),0,'Evento termina no domingo');
assert.deepEqual(JSON.parse(JSON.stringify(event.stageRounds.qualifying.map(r=>[r.track,r.laps,r.rain,r.tempMin,r.tempMax]))),[
 ['monaco',7,0,28,30],['jeddah',8,0,26,28],['spielberg',10,100,18,22],['monza',9,0,22,24]
]);
const expected=[
 ['monaco',7,0,28,30],['spa',6,0,22,24],['jeddah',8,0,26,28],['hungaroring',9,0,25,27],
 ['spielberg',10,100,18,22],['melbourne',9,0,22,24],['monza',9,0,22,24],['monaco',7,0,28,30]
];
for(const stage of ['opening','final'])assert.deepEqual(JSON.parse(JSON.stringify(event.stageRounds[stage].map(r=>[r.track,r.laps,r.rain,r.tempMin,r.tempMax]))),expected);
assert.equal(event.stageRounds.opening.length,8);
assert.equal(event.stageRounds.final.length,8);
const tasks={
 junior:['Linha de Corrida','Wobble · nível 6+','+2 troféus','+3 mil moedas','+30 reputação'],
 competidor:['Desempenho Delta','Axis 3000 · nível 6+','+3 troféus','+40 mil moedas','+100 reputação'],
 contendor:['Pico Apex','Axis 3000 · nível 7+','+4 troféus','+500 mil moedas','+200 reputação'],
 campeao:['Limite Absoluto','Nigel Mansell · nível 1+','+5 troféus','+3,5 mi moedas','+850 reputação']
};
for(const [tier,values] of Object.entries(tasks)){
 const task=event.sponsor[tier];
 assert.deepEqual([task.title,task.requirement,task.qualifying,task.opening,task.final],values);
 const html=ctx.window.__eventTest.sponsorHtml(event,{id:tier,label:tier});
 for(const text of [task.title,task.description,task.requirement,task.qualifying,task.opening,task.final])assert.ok(html.includes(text),`${tier}: ${text}`);
}
assert.deepEqual(JSON.parse(JSON.stringify(event.tracks)),['monaco','jeddah','spielberg','monza','spa','hungaroring','melbourne']);
console.log('PASS: datas, 20 corridas, clima/temperatura/voltas, 4 tarefas e recompensas.');
