'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ctx={window:{},crypto:require('node:crypto').webcrypto};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'..','gbr-learning-model.js'),'utf8'),ctx);
const model=ctx.window.GBRRaceLearning;
const base={series:12,trackId:'interlagos',result:'win',own:{speed:100,corner:90},rival:{speed:95,corner:85}};
const old=model.create(base,{tracks:['interlagos']},()=> 'old-record',()=> '2026-11-10T12:00:00.000Z');
assert.equal(old.raceContext,undefined,'registros antigos continuam sem contexto adicional');
const record=model.create({...base,raceContext:{weather:'wet',safetyCar:'yes',temperatureMin:18,temperatureMax:22,ownPosition:1,rivalPosition:2,boosts:'Velocidade',incidents:'Safety Car na volta 4',traffic:'Tráfego na saída dos boxes'}},{tracks:['interlagos']},()=> 'new-record',()=> '2026-11-10T12:03:00.000Z');
assert.deepEqual(JSON.parse(JSON.stringify(record.raceContext)),{weather:'wet',safetyCar:'yes',temperatureMin:18,temperatureMax:22,ownPosition:1,rivalPosition:2,boosts:'Velocidade',incidents:'Safety Car na volta 4',traffic:'Tráfego na saída dos boxes'});
for(const raceContext of [{weather:'storm'},{safetyCar:'maybe'},{temperatureMin:30,temperatureMax:20},{ownPosition:0},{rivalPosition:3},{boosts:'x'.repeat(121)},{incidents:'<script>'}])
 assert.throws(()=>model.create({...base,raceContext},{tracks:['interlagos']}));
const legacyGarage={raceAnalyses:[old]};
assert.equal(model.add(legacyGarage,record).length,2,'histórico anterior preservado ao acrescentar novo registro');
assert.equal(model.summary([old,record],{series:12,trackId:'interlagos'}).sample,2);
console.log('PASS: contexto validado, campos opcionais, compatibilidade retroativa e histórico preservado.');
