/* GBR Racing Lab — 2026-10-20 · Aparência escura única (reversível).
   O modo claro permanece suspenso; nenhuma regra de dados/autenticação é alterada. */
(function () {
  'use strict';
  const html=document.documentElement;
  const STORAGE_KEY='gbr-visual-theme-v1';
  function applyDark(){
    html.setAttribute('data-theme','dark');
    html.style.colorScheme='dark';
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content','#0B0B0F');
    document.querySelectorAll('[data-gbr-theme-state]').forEach(function(el){el.textContent='Escuro';});
    document.querySelectorAll('img[data-gbr-logo-dark]').forEach(function(img){
      const url=img.getAttribute('data-gbr-logo-dark');if(url&&img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
    document.querySelectorAll('[data-gbr-brand-emblem]').forEach(function(img){
      const url='assets/gbr-brand/logos/simbolo-transparente.svg';
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
    window.GBRNavigationIcons?.setTheme?.('dark');
    document.querySelectorAll('img[data-gbr-theme-icon]').forEach(function(img){
      const id=img.getAttribute('data-gbr-theme-icon');
      if(!id||['pistas','eventos','pilotos','pecas'].includes(id))return;
      const url='assets/gbr-brand/icons/'+id+'.svg';
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
  }
  // A preferência antiga 'light' não é reaplicada após atualização.
  try{if(window.localStorage.getItem(STORAGE_KEY)==='light')window.localStorage.removeItem(STORAGE_KEY);}catch(_e){}
  applyDark(); // Sincroniza o visual antes do primeiro render.
  function initSettings(){
    const dialog=document.getElementById('gbrSettingsDialog');let trigger=null;
    document.querySelectorAll('[data-gbr-settings-open]').forEach(function(button){button.addEventListener('click',function(){
      if(!dialog||typeof dialog.showModal!=='function')return;
      const panel=document.getElementById('mobileMorePanel');
      if(panel&&!panel.hidden){panel.hidden=true;const backdrop=document.getElementById('mobileMoreBackdrop');if(backdrop)backdrop.hidden=true;const more=document.getElementById('mobileMoreBtn');if(more)more.setAttribute('aria-expanded','false');}
      trigger=button;applyDark();if(!dialog.open)dialog.showModal();
    });});
    if(dialog){
      dialog.addEventListener('close',function(){if(trigger&&trigger.isConnected)trigger.focus();});
      dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});
    }
    applyDark();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initSettings,{once:true});else initSettings();
  window.addEventListener('storage',function(event){if(event.key===STORAGE_KEY)applyDark();});
})();
