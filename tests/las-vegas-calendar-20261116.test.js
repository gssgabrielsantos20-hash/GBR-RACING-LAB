'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const ctx={window:{F1App:{getGarage:()=>({drivers:[],parts:[],trackPlans:{}})}},document:{getElementById:()=>null},localStorage:{getItem:()=>null},Date,URL,console};vm.createContext(ctx);
const src=read('events-gp.js').replace('makeNav();\n})();','window.__test={EVENTS,sponsorHtml};\n})();');assert.notEqual(src,read('events-gp.js'));vm.runInContext(src,ctx);
const e=ctx.window.__test.EVENTS.find(x=>x.id==='las-vegas-grand-prix-2026');assert(e);assert.equal(e.starts,'2026-11-18');assert.equal(e.ends,'2026-11-22');
const rows={qualifying:[['las-vegas',6,0,20,22],['zandvoort',8,0,24,28],['hungaroring',9,100,22,24],['madrid',5,0,25,29]],opening:[['las-vegas',6,0,20,22],['austin',6,0,26,30],['zandvoort',8,0,24,28],['miami',6,0,26,28],['hungaroring',9,100,22,24],['spielberg',10,0,20,24],['madrid',5,0,25,29],['las-vegas',6,0,20,22]]};
for(const stage of ['qualifying','opening','final']){const got=e.stageRounds[stage].map(r=>[r.track,r.laps,r.rain,r.tempMin,r.tempMax]);assert.deepEqual(JSON.parse(JSON.stringify(got)),stage==='final'?rows.opening:rows[stage]);}
assert.equal(e.stages.qualifying,'18–20/11/2026');assert.equal(e.stages.opening,'21/11/2026');assert.equal(e.stages.final,'22/11/2026');
const c=e.sponsor.contendor;assert.equal(c.title,'Pico Apex');assert.equal(c.qualifying,'+200 reputação');assert.equal(c.stageRequirements.final,'Hadjar Escolhas do Paddock Standard Nv. 4');
for(const [tier,t] of Object.entries(e.sponsor)){for(const stage of ['qualifying','opening','final'])assert(t[stage],tier+stage);const html=ctx.window.__test.sponsorHtml(e,{id:tier,label:tier});assert(html.includes(t.title));}
assert.equal(e.allowLegendary,false);assert.equal(e.allowSpecial,true);console.log('PASS: calendário Las Vegas, 4 classificatórias, 8+8 corridas, chuva, temperaturas e tarefas das quatro categorias.');
