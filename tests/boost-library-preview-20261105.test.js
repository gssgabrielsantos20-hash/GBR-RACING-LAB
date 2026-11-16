'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('fonte de foto de boost aceita URL HTTPS validada apenas localmente e não afrouxa autorização compartilhada',()=>{
 const map = new Map(); const events=[];
 const context={URL,window:{F1Reference:{}},console,
  localStorage:{getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)},
  CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}},
  document:{dispatchEvent:e=>events.push(e.type)}};
 vm.createContext(context);vm.runInContext(read('gbr-boost-catalog.js'),context,{filename:'gbr-boost-catalog.js'});vm.runInContext(read('card-art.js'),context,{filename:'card-art.js'});
 const art=context.window.GBRCardArt;const item={name:'Warrior',rarity:'',editionLabel:''};
 assert.equal(art.getSource(item,'boosts').origin,'reference');
 const entry=art.saveLocal(item,'boosts','https://images.example.org/warrior.png');
 assert.equal(entry.scope,'this-browser');
 assert.equal(art.getSource(item,'boosts').origin,'local');
 assert.equal(art.getSource(item,'boosts').url,'https://images.example.org/warrior.png');
 assert.equal(art.status().shared,0);
 assert.deepEqual(events,['gbr-card-art-updated']);
 assert.throws(()=>art.saveLocal(item,'boosts','http://example.org/w.png'),/HTTPS/);
 assert.throws(()=>art.saveLocal(item,'boosts','javascript:alert(1)'),/HTTPS/);
 assert.throws(()=>art.saveLocal(item,'boosts','https://user:pass@example.org/w.png'),/HTTPS/);
 assert.throws(()=>art.saveLocal(item,'unknown','https://example.org/w.png'),/Tipo/);
 assert.equal(art.getSource(item,'boosts').url,'https://images.example.org/warrior.png');
 const external='https://www.allclash.com/wp-content/uploads/2026/10/f1booster-warrior.png';
 assert.throws(()=>art.saveLocal(item,'boosts',external),/apenas referência externa/);
 assert.equal(art.isUnlicensedBoostReference(external,'boosts'),true);
 assert.equal(art.isUnlicensedBoostReference(external,'parts'),false);
 const legacyCtx={URL,window:{F1Reference:{}},localStorage:{getItem(){return JSON.stringify({'boosts|warrior||':external})}}};
 vm.createContext(legacyCtx);vm.runInContext(read('card-art.js'),legacyCtx,{filename:'card-art-legacy.js'});
 vm.runInContext(read('gbr-boost-catalog.js'),legacyCtx,{filename:'gbr-boost-catalog.js'});
 assert.equal(legacyCtx.window.GBRCardArt.getSource(item,'boosts').origin,'reference','override antigo AllClash não substitui a referência catalogada');
});

test('UI de boost usa o mesmo caminho compartilhado de pilotos e peças',()=>{
 const admin=read('auditoria-imagens.js'),html=read('auditoria-imagens.html');
 assert.doesNotMatch(admin,/data-usage-right|hasRightForBoost|Declaro que posso compartilhar/);
 assert.doesNotMatch(admin,/data-preview-url|data-publish-url|runPreview\(k\)|runPublish\(k\)/);
 assert.doesNotMatch(admin,/Salvar neste aparelho|Compartilhar com academia/);
 assert.match(admin,/art\.saveRemote\(i,i.kind,url\)/);
 assert.match(admin,/art\.uploadRemote\(i,i.kind,file\)/);
 assert.match(admin,/gbr_card_images_kind_check/);
 assert.match(html,/Boosts já estão habilitados no Supabase/);
 assert.match(admin,/GBRBoostCatalog\?\.visualItems/);
 assert.match(admin,/data-card-art/);
 assert.doesNotMatch(admin,/Ver imagem de referência no AllClash/);
 assert.match(html,/fontes externas localizadas ficam separadas/i);
 assert.match(read('gbr-boost-catalog.js'),/visualItems:VISUAL_DATA/);
 assert.match(read('gbr-boost-catalog.js'),/imageSrc:null/);
});
