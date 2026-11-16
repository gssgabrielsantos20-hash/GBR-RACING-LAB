'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'card-art.js'),'utf8');

function setup(admin){
  const rows=new Map(),writes=[],loc=new Map();
  const client={
    rpc: async()=>({data:admin,error:null}),
    auth:{getUser:async()=>({data:{user:{id:'test-user-123'}},error:null})},
    channel:()=>({on(){return this},subscribe(){return this}}),
    removeChannel:async()=>{},
    from(name){assert.equal(name,'gbr_card_images');return {
      select(){return {limit:async()=>({data:[...rows.values()],error:null})}},
      upsert:async(record,opts)=>{writes.push({record,opts});rows.set(record.card_key,record);return {error:null}},
      delete(){return {eq:async(key,val)=>({error:null})}}
    }}
  };
  const ctx={window:{F1Reference:{}},URL,console,
    setInterval:()=>1,clearInterval:()=>{},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}},
    localStorage:{getItem:k=>loc.get(k)||null,setItem:(k,v)=>loc.set(k,v)},
    document:{dispatchEvent(){},visibilityState:'hidden'}
  };
  vm.createContext(ctx);vm.runInContext(source,ctx,{filename:'card-art.js'});
  return {art:ctx.window.GBRCardArt,client,writes,rows};
}

test('piloto, peça e boost compartilham o mesmo repositório e preservam seus tipos',async()=>{
  const {art,client,writes,rows}=setup(true);
  await art.connect({client});
  const list=[
    ['drivers',{name:'Lewis Hamilton',rarity:'Epic',editionLabel:''}],
    ['parts',{name:'Control',rarity:'Epic',editionLabel:''}],
    ['boosts',{name:'Warrior',rarity:'',editionLabel:''}]
  ];
  for(const [kind,item] of list){
    await art.saveRemote(item,kind,'https://images.example.org/'+kind+'.webp');
    assert.equal(art.getSource(item,kind).origin,'shared');
  }
  assert.equal(rows.size,3);assert.equal(writes.length,3);
  assert.deepEqual(writes.map(w=>w.record.kind),['drivers','parts','boosts']);
  assert(writes.every(w=>w.opts.onConflict==='card_key'));
  assert(writes.every(w=>w.record.updated_by==='test-user-123'));
  await assert.rejects(art.saveRemote({name:'Warrior'},'boosts','javascript:alert(1)'),/HTTPS/);
  await assert.rejects(art.saveRemote({name:'Warrior'},'boosts','https://www.allclash.com/wp-content/uploads/2026/10/f1booster-warrior.png'),/apenas referência externa/);
});

test('sem perfil de administrador o cliente nega salvamento de qualquer tipo',async()=>{
  const {art,client,writes}=setup(false);
  await art.connect({client});
  for(const kind of ['drivers','parts','boosts']){
    await assert.rejects(art.saveRemote({name:'Warrior'},kind,'https://images.example.org/a.webp'),/administrador/);
  }
  assert.equal(writes.length,0);
});

test('SQL proposta mantém RLS, administrador, e possui rollback conservador',()=>{
  const sql=fs.readFileSync(path.join(root,'docs/sql-review/PROPOSTA_gbr_card_images_boosts_20261105.sql'),'utf8');
  const rollback=fs.readFileSync(path.join(root,'docs/sql-review/ROLLBACK_gbr_card_images_boosts_20261105.sql'),'utf8');
  assert.match(sql,/ALTER POLICY gbr_art_upload_admin ON storage\.objects/);
  assert.match(sql,/am_i_academy_admin\(\)/);
  assert.match(sql,/gbr-card-art/);
  assert.match(sql,/ARRAY\['drivers'::text,'parts'::text,'boosts'::text\]/);
  assert.doesNotMatch(sql,/DISABLE ROW LEVEL SECURITY|service_role|\bGRANT\b/i);
  assert.match(rollback,/EXISTS\(SELECT 1 FROM public\.gbr_card_images WHERE kind = 'boosts'\)/);
  assert.match(rollback,/RAISE EXCEPTION/);
});
