/* GBR Racing Lab — testes de alternância de tema, sem dependências externas. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const main = read('index.html');
const audit = read('auditoria-imagens.html');
const js = read('gbr-theme.js');
const css = read('gbr-theme.css');

assert.equal((main.match(/data-gbr-settings-open/g) || []).length, 3,
  'Configurações disponíveis no PC, Mais do iPhone e login');
assert.match(main, /<dialog id="gbrSettingsDialog"/);
assert.match(main, /name="gbr-theme" value="dark"/);
assert.match(main, /name="gbr-theme" value="light"/);
assert.match(main, /gbr-theme\.css\?v=/);
assert.match(main, /gbr-theme\.js\?v=/);
assert.match(audit, /class="gbr-audit-page"/);
assert.match(audit, /data-gbr-theme-select/);
assert.match(audit, /gbr-theme\.css\?v=/);
assert.match(audit, /gbr-theme\.js\?v=/);
for (const selector of [
  ':root[data-theme="light"]', '.access-gate', '.telemetry-panel',
  '.fav-record', '.gp-event-choice', '.rl-panel', '.gbr-audit-page'
]) assert.ok(css.includes(selector), selector);
assert.ok(!js.includes('supabase'), 'Não acessar persistência da garagem');

function makeEnvironment(saved) {
  const data = new Map();
  if (saved !== undefined) data.set('gbr-visual-theme-v1', saved);
  const listeners = {};
  const rootAttributes = {};
  const rootNode = {
    style: {},
    setAttribute(key, value) { rootAttributes[key] = value; }
  };
  const meta = {
    attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; }
  };
  const radioDark = {value:'dark',checked:false};
  const radioLight = {value:'light',checked:false};
  const select = {value:'dark',events:{},addEventListener(name,fn){this.events[name]=fn;}};
  const state = {textContent:''};
  const dialog = {
    open:false,
    events:{},
    addEventListener(name,fn){this.events[name]=fn;},
    showModal(){this.open=true;},
    close(){this.open=false;if(this.events.close)this.events.close();}
  };
  const button = {
    isConnected:true,
    events:{},
    addEventListener(name,fn){this.events[name]=fn;},
    focus(){this.didFocus=true;}
  };
  const document = {
    documentElement:rootNode,
    readyState:'loading',
    addEventListener(name,fn){listeners[name]=fn;},
    querySelector(sel){return sel==='meta[name="theme-color"]'?meta:null;},
    querySelectorAll(sel){
      if(sel==='input[name="gbr-theme"]')return [radioDark,radioLight];
      if(sel==='[data-gbr-theme-select]')return [select];
      if(sel==='[data-gbr-theme-state]')return [state];
      if(sel==='[data-gbr-settings-open]')return [button];
      return [];
    },
    getElementById(id){return id==='gbrSettingsDialog'?dialog:null;}
  };
  const windowListeners = {};
  const window = {
    localStorage:{
      getItem(key){return data.get(key)??null;},
      setItem(key,value){data.set(key,value);}
    },
    addEventListener(name,fn){windowListeners[name]=fn;}
  };
  vm.runInNewContext(js,{window,document,Set});
  listeners.DOMContentLoaded();
  return {data,rootAttributes,rootNode,meta,radioDark,radioLight,select,state,dialog,button,windowListeners};
}

const initial = makeEnvironment();
assert.equal(initial.rootAttributes['data-theme'],'dark','Padrão original escuro');
assert.equal(initial.meta.attributes.content,'#0B0B0F');
assert.equal(initial.radioDark.checked,true);
initial.button.events.click();
assert.equal(initial.dialog.open,true,'Abre configurações');
initial.dialog.events.change({target:{name:'gbr-theme',value:'light'}});
assert.equal(initial.rootAttributes['data-theme'],'light');
assert.equal(initial.rootNode.style.colorScheme,'light');
assert.equal(initial.data.get('gbr-visual-theme-v1'),'light');
assert.equal(initial.select.value,'light');
assert.equal(initial.state.textContent,'Claro');
assert.equal(initial.meta.attributes.content,'#F3F7FA');
initial.dialog.close();
assert.equal(initial.button.didFocus,true,'Devolve foco ao fechar');

const stored = makeEnvironment('light');
assert.equal(stored.rootAttributes['data-theme'],'light','Restaura escolha após recarga');
stored.select.value='dark';
stored.select.events.change();
assert.equal(stored.rootAttributes['data-theme'],'dark');
assert.equal(stored.data.get('gbr-visual-theme-v1'),'dark');
stored.windowListeners.storage({key:'gbr-visual-theme-v1',newValue:'light'});
assert.equal(stored.rootAttributes['data-theme'],'light','Sincroniza abas');
const invalid = makeEnvironment('theme-invalido');
assert.equal(invalid.rootAttributes['data-theme'],'dark','Nega valores desconhecidos');
console.log('OK: tema escuro/claro, preferências, modal e biblioteca visual.');