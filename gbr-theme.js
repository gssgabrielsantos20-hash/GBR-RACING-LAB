/* GBR Racing Lab · 2026-11-09 · Alternância escuro/claro.
 * Apresentação apenas: preferência local, sem escrita na garagem, auth ou Supabase. */
(function () {
  'use strict';
  const root=document.documentElement;
  const key='gbr-visual-theme-v1';
  const allowed=['dark','light'];
  function stored(){
    try{const value=window.localStorage.getItem(key);return allowed.includes(value)?value:'dark';}
    catch(_e){return 'dark';}
  }
  let mode=stored();
  function apply(next,persist){
    mode=allowed.includes(next)?next:'dark';
    root.setAttribute('data-theme',mode); // before page paints when this script runs in <head>
    root.style.colorScheme=mode;
    if(persist){try{window.localStorage.setItem(key,mode);}catch(_e){/* private browsing */}}
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',mode==='light'?'#e5f2ff':'#0a1728');
    document.querySelectorAll('[data-gbr-theme-state]').forEach(function(el){
      el.textContent=mode==='light'?'Claro':'Escuro';
    });
    document.querySelectorAll('input[name="gbrTheme"]').forEach(function(input){
      input.checked=input.value===mode;
    });
    document.querySelectorAll('img[data-gbr-logo-dark]').forEach(function(img){
      const url=img.getAttribute(mode==='light'?'data-gbr-logo-light':'data-gbr-logo-dark');
      if(url&&img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
    document.querySelectorAll('.gbr-brand-emblem img,[data-gbr-brand-emblem]').forEach(function(img){
      const url='assets/gbr-brand/logos/'+(mode==='light'?'simbolo-escuro.svg':'simbolo-transparente.svg');
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
    // Navigation and dashboard icons use the approved light/dark art. Pilots and parts are untouched.
    window.GBRNavigationIcons?.setTheme?.(mode);
    document.querySelectorAll('img[data-gbr-theme-icon]').forEach(function(img){
      const id=img.getAttribute('data-gbr-theme-icon');
      if(!id||['pistas','eventos','pilotos','pecas'].includes(id))return;
      const url='assets/gbr-brand/'+(mode==='light'?'icons-light':'icons')+'/'+id+'.svg';
      if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    });
  }
  apply(mode,false);
  function initialize(){
    const dialog=document.getElementById('gbrSettingsDialog');
    let opener=null;
    document.querySelectorAll('[data-gbr-settings-open]').forEach(function(button){
      button.addEventListener('click',function(){
        if(!dialog||typeof dialog.showModal!=='function')return;
        const panel=document.getElementById('mobileMorePanel');
        if(panel&&!panel.hidden){
          panel.hidden=true;
          const backdrop=document.getElementById('mobileMoreBackdrop');if(backdrop)backdrop.hidden=true;
          const more=document.getElementById('mobileMoreBtn');if(more)more.setAttribute('aria-expanded','false');
        }
        opener=button;apply(mode,false);if(!dialog.open)dialog.showModal();
      });
    });
    document.querySelectorAll('input[name="gbrTheme"]').forEach(function(input){
      input.addEventListener('change',function(){if(input.checked)apply(input.value,true);});
    });
    if(dialog){
      dialog.addEventListener('close',function(){if(opener&&opener.isConnected)opener.focus();});
      dialog.addEventListener('click',function(event){if(event.target===dialog)dialog.close();});
    }
    apply(mode,false);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
  else initialize();
  window.addEventListener('storage',function(event){
    if(event.key===key){apply(stored(),false);}
  });
  // Expose read-only current theme for UI test tooling. No external data or persistence APIs.
  window.GBRTheme=Object.freeze({current:function(){return mode;}});
})();
