'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('settings provide accessible dark and light choices to all screens',()=>{
 const html=read('index.html');
 assert.match(html,/name="gbrTheme" value="dark"/);
 assert.match(html,/name="gbrTheme" value="light"/);
 assert.match(html,/gbr-visual-20261109\.css\?v=20261109visual1/);
 assert.match(html,/gbr-theme\.js\?v=20261109visual1/);
 assert.doesNotMatch(html,/escuro fixo|O tema claro está temporariamente suspenso|Aparência escura fixa/);
 const library=read('auditoria-imagens.html');
 assert.match(library,/name="gbrTheme" value="dark"/);
 assert.match(library,/name="gbrTheme" value="light"/);
 assert.match(library,/gbr-visual-20261109\.css/);
 assert.match(read('mobile-premium.js'),/Abra Configurações.*escolha Claro ou Escuro/);
});

test('theme selector persists choice, updates logo, system bar and approved icons',()=>{
 const listeners={};
 const el=props=>Object.assign({attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]??null},addEventListener(k,fn){this.listeners[k]=fn}},props);
 const html=el({style:{}}),meta=el(),state=el({textContent:''}),logo=el({attributes:{'data-gbr-logo-dark':'dark.svg','data-gbr-logo-light':'light.svg','src':'dark.svg'}}),icon=el({attributes:{'data-gbr-theme-icon':'painel','src':'assets/gbr-brand/icons/painel.svg'}}),emblem=el({attributes:{src:'assets/gbr-brand/logos/simbolo-transparente.svg'}});
 const radioDark=el({value:'dark',checked:true}),radioLight=el({value:'light',checked:false});
 const trigger=el(),dialog=el({open:false,showModal(){this.open=true},close(){this.open=false}});
 const local={};const storage={getItem:k=>local[k]||null,setItem:(k,v)=>{local[k]=v}};
 const selectors={"[data-gbr-theme-state]":[state],"input[name=\"gbrTheme\"]":[radioDark,radioLight],"img[data-gbr-logo-dark]":[logo],".gbr-brand-emblem img,[data-gbr-brand-emblem]":[emblem],"img[data-gbr-theme-icon]":[icon],"[data-gbr-settings-open]":[trigger]};
 const document={documentElement:html,readyState:'complete',querySelector:s=>s==='meta[name="theme-color"]'?meta:null,querySelectorAll:s=>selectors[s]||[],getElementById:id=>id==='gbrSettingsDialog'?dialog:null};
 let navMode='';
 const win={localStorage:storage,GBRNavigationIcons:{setTheme:v=>{navMode=v}},addEventListener:(name,fn)=>{listeners[name]=fn}};
 const ctx={document,window:win};vm.createContext(ctx);vm.runInContext(read('gbr-theme.js'),ctx);
 assert.equal(html.getAttribute('data-theme'),'dark');
 trigger.listeners.click();assert.equal(dialog.open,true);
 radioLight.checked=true;radioLight.listeners.change();
 assert.equal(html.getAttribute('data-theme'),'light');assert.equal(meta.getAttribute('content'),'#e5f2ff');assert.equal(state.textContent,'Claro');assert.equal(storage.getItem('gbr-visual-theme-v1'),'light');assert.equal(navMode,'light');
 assert.equal(logo.getAttribute('src'),'light.svg');assert.equal(icon.getAttribute('src'),'assets/gbr-brand/icons-light/painel.svg');
 assert.equal(emblem.getAttribute('src'),'assets/gbr-brand/logos/simbolo-escuro.svg');
 radioDark.checked=true;radioDark.listeners.change();
 assert.equal(html.getAttribute('data-theme'),'dark');assert.equal(meta.getAttribute('content'),'#0a1728');assert.equal(icon.getAttribute('src'),'assets/gbr-brand/icons/painel.svg');
 // Theme is an appearance preference, not a call into Supabase or garage state.
 assert.doesNotMatch(read('gbr-theme.js'),/\.from\(|\.insert\(|\.upsert\(|getGarage\(|saveGarage\(/);
});

test('visual CSS scopes its palette and preserves real card artwork',()=>{
 const css=read('gbr-visual-20261109.css');
 assert.match(css,/html\[data-theme="dark"\]/);
 assert.match(css,/html\[data-theme="light"\]/);
 assert.match(css,/\.telemetry-hero/);
 assert.match(css,/\.gbr-audit-theme-picker/);
 assert.doesNotMatch(css,/filter:\s*invert\(/i);
});
