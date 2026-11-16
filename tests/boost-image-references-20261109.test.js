'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

test('catálogo visual lista os 65 nomes da planilha e mantém o motor com 11 boosts',()=>{
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(read('gbr-boost-catalog.js'),ctx);
 const C=ctx.window.GBRBoostCatalog;
 assert.equal(C.visualItems.length,65);
 const refManifest=JSON.parse(read('docs/references/boost-imagens-externas-pendentes-20261105.json'));
 assert.deepEqual(JSON.parse(JSON.stringify(C.visualItems.map(x=>x.name))),refManifest.workbookBoostNames);
 assert.equal(new Set(C.visualItems.map(x=>x.id)).size,65);
 assert.equal(new Set(C.visualItems.map(x=>x.name)).size,65);
 assert.equal(C.items.length,11,'não ampliar nem alterar o motor de recomendação');
 assert.equal(new Set(C.items.map(x=>x.id)).size,11);
 assert.equal(C.getVisual('warrior').name,'Warrior');
 assert.equal(C.getVisual('Warrior').id,'warrior');
 assert.equal(C.getVisual('__proto__'),null);
 const withImage=C.visualItems.filter(x=>x.imageReferenceUrl);
 const withoutImage=C.visualItems.filter(x=>!x.imageReferenceUrl);
 assert.equal(withImage.length,50);
 assert.equal(withoutImage.length,15);
 for(const item of withImage){
  const u=new URL(item.imageReferenceUrl);
  assert.equal(u.protocol,'https:');assert.equal(u.hostname,'www.allclash.com');
  assert.match(u.pathname,/^\/wp-content\/uploads\/2026\/10\/f1booster-[a-z0-9-]+\.png$/);
  assert.equal(item.imageReferencePermission,'not_verified');
 }
 assert(withoutImage.some(x=>x.name==='Schooner'));
 assert(withoutImage.some(x=>x.name==='Tune-In'));
});

test('card-art usa referências AllClash confirmadas como imagem remota, sem persistir como foto compartilhada',()=>{
 const cat={window:{}};vm.createContext(cat);vm.runInContext(read('gbr-boost-catalog.js'),cat);
 const ctx={URL,window:{F1Reference:{},GBRBoostCatalog:cat.window.GBRBoostCatalog},localStorage:{getItem(){return null},setItem(){}},console};
 vm.createContext(ctx);vm.runInContext(read('card-art.js'),ctx);
 const art=ctx.window.GBRCardArt;
 assert.equal(art.overrideKey({name:'Ballast',rarity:'',editionLabel:''},'boosts'),'boosts|ballast||','chave coincide com o registro compartilhado existente');
 const warrior={name:'Warrior',rarity:'',editionLabel:''};
 const ref=art.getSource(warrior,'boosts');
 assert.equal(ref.origin,'reference','boost com URL confirmada usa imagem externa diretamente');
 assert.match(ref.url,/^https:\/\/www\.allclash\.com\/wp-content\/uploads\/2026\/10\/f1booster-warrior\.png$/);
 assert.equal(art.getSource({name:'Schooner'},'boosts').origin,'none');
 const external=cat.window.GBRBoostCatalog.getVisual('warrior').imageReferenceUrl;
 assert.throws(()=>art.saveLocal(warrior,'boosts',external),/apenas referência externa/,'referência pode ser exibida, mas não salva como foto própria');
 assert.equal(art.isUnlicensedBoostReference(external,'boosts'),true);
 assert.equal(art.isUnlicensedBoostReference(external,'parts'),false);
});

test('Biblioteca Visual lista 65 boosts e mantém upload administrativo separado',()=>{
 const js=read('auditoria-imagens.js'),html=read('auditoria-imagens.html');
 assert.match(js,/GBRBoostCatalog\?\.visualItems/);
 assert.match(js,/data-card-art/);
 assert.match(js,/Fonte identificada · foto não publicada/);
 assert.match(js,/art\.saveRemote\(i,i\.kind,url\)/);
 assert.match(js,/art\.uploadRemote\(i,i\.kind,file\)/);
 assert.doesNotMatch(js,/Ver imagem de referência no AllClash/);
 assert.match(html,/65 boosts/);
 assert.match(html,/Referências externas/);
 assert.match(html,/nem copiadas para o bucket/);
 assert.match(html,/countReference/);
});

test('Assistente de Pistas exibe imagens compartilhadas, locais e referências externas nos cartões',()=>{
 const js=read('boosts-plus.js'),css=read('boosts-plus.css');
 assert.match(js,/function boostArt\(item,compact=false\)/);
 assert.match(js,/image\?\.origin/);
 assert.match(js,/\['shared','local','reference'\]\.includes\(image\?\.origin\)/);
 assert.match(js,/data-boost-art/);
 assert.doesNotMatch(js,/referenceLink|Ver imagem na fonte/);
 assert.match(css,/\.gbr-boost-art\.has-photo/);
 assert.match(css,/\.gbr-boost-art\.image-error/);
});

test('manifesto de referências mantém URLs, status HTTP e licença não presumida',()=>{
 const refs=JSON.parse(read('docs/references/boost-imagens-externas-pendentes-20261105.json'));
 assert.equal(refs.workbookBoostCount,65);
 assert.equal(refs.catalogDisplayCount,65);
 assert.equal(refs.availableReferenceCount,50);
 assert.equal(refs.unavailableCount,15);
 assert.equal(refs.candidates.length,64,'59 referências anteriores + 5 novas');
 assert.equal(refs.sharedBoostImageCount,1);
 assert.equal(refs.currentSharedBoostImages[0].name,'Ballast');
 assert(refs.candidates.every(x=>x.permission==='not_verified'));
});
