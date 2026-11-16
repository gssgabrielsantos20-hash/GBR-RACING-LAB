'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx={window:{F1App:{getGarage:()=>({drivers:[],parts:[],trackPlans:{}})}},document:{getElementById:()=>null},localStorage:{getItem:()=>null},Date,URL,console};vm.createContext(ctx);
const file=fs.readFileSync(path.join(root,'events-gp.js'),'utf8');
const src=file.replace('makeNav();\n})();','window.__testEvents=EVENTS;\n})();');assert.notEqual(src,file);vm.runInContext(src,ctx);
const events=ctx.window.__testEvents;
const fmt=d=>`${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
for(const e of events){
 const start=new Date(`${e.starts}T00:00:00Z`),end=new Date(`${e.ends}T00:00:00Z`);
 assert.equal(start.getUTCDay(),3,`${e.id}: evento começa quarta`);
 assert.equal(end.getUTCDay(),0,`${e.id}: evento termina domingo`);
 const fri=new Date(start);fri.setUTCDate(fri.getUTCDate()+2);
 const sat=new Date(start);sat.setUTCDate(sat.getUTCDate()+3);
 const sun=new Date(start);sun.setUTCDate(sun.getUTCDate()+4);
 assert.equal(fmt(end),fmt(sun),`${e.id}: período geral quarta-domingo`);
 if(e.stages){
  const compact=`${String(start.getUTCDate()).padStart(2,'0')}–${String(fri.getUTCDate()).padStart(2,'0')}/${String(start.getUTCMonth()+1).padStart(2,'0')}/${start.getUTCFullYear()}`;
  assert([`${fmt(start)} – ${fmt(fri)}`,compact,`${String(start.getUTCDate()).padStart(2,'0')} a ${String(fri.getUTCDate()).padStart(2,'0')}/${String(start.getUTCMonth()+1).padStart(2,'0')}/${start.getUTCFullYear()}`].includes(e.stages.qualifying),`${e.id}: qualificação quarta-sexta`);
  assert.equal(e.stages.opening,fmt(sat),`${e.id}: abertura sábado`);
  assert.equal(e.stages.final,fmt(sun),`${e.id}: final domingo`);
 }
}
console.log(`PASS: ${events.length} eventos seguem quarta–domingo; qualificação quarta–sexta, abertura sábado e final domingo.`);
