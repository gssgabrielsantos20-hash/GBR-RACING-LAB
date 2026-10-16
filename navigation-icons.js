/* GBR Racing Lab · Menu SVG unificado. Fonte: SVGs anexados pelo responsável.
 * A arte de Baús permanece contêiner corrugado conforme a decisão de identidade. */
(() => {
 'use strict';
 const paths = {"dashboard":"<path d=\"M4 17a8 8 0 1 1 16 0\"/><path d=\"M12 17l4-5\"/><path d=\"M6.3 11.3l1.2 1M12 7.5v1.6M17.7 11.3l-1.2 1\"/><circle cx=\"12\" cy=\"17\" r=\"1.4\" fill=\"currentColor\"/>","builder":"<path d=\"M4 6h16l-1.6 3.5H5.6z\"/><path d=\"M8 9.5V18M16 9.5V18M5 18h14\"/>","event":"<path d=\"M5 18V9a4 4 0 0 1 4-4h2l3 4-3 3h8a1 1 0 0 1 1 1v5H5z\"/><circle cx=\"5\" cy=\"18\" r=\"1.7\" fill=\"currentColor\"/>","duel":"<path d=\"M20 3.500L8.500 15M6.200 12.700l4.600 4.600M8.500 15l-3 3\"/><path d=\"M4 3.500L15.500 15M13.200 17.300l4.600-4.600M15.500 15l3 3\"/><circle cx=\"4.700\" cy=\"18.800\" r=\"1.200\" fill=\"currentColor\"/><circle cx=\"19.300\" cy=\"18.800\" r=\"1.200\" fill=\"currentColor\"/>","garage":"<path d=\"M3 10l9-6 9 6v10H3z\"/><path d=\"M7 20v-7h10v7M7 15.200h10M7 17.600h10\"/>","academy":"<path d=\"M4 14a8 8 0 0 1 8-8h1a7 7 0 0 1 7 7v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z\"/><path d=\"M12 10.500h8v3.500h-8z\" fill=\"currentColor\" fill-opacity=\".35\"/>","chests":"<rect x=\"2.5\" y=\"6\" width=\"19\" height=\"12\" rx=\"1.25\"/><path d=\"M5.5 6.6v10.8M8.75 6.6v10.8M12 6.6v10.8M15.25 6.6v10.8M18.5 6.6v10.8\"/><path d=\"M3 9h1.25M19.75 15h1.25\"/>","notices":"<path d=\"M5 17h14l-1.6-2.5V10a5.4 5.4 0 0 0-10.8 0v4.5z\"/><path d=\"M10 20h4\"/><circle cx=\"18.5\" cy=\"5.5\" r=\"2.5\" fill=\"currentColor\" stroke=\"none\"/>","more":"<path d=\"M4 6h16M4 12h16M4 18h16\"/>"};
 const svg = id => `<svg class="gbr-nav-svg gbr-nav-svg-${id}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[id]}</svg>`;
 function installIcons(){
  [ ['#nav button[data-tab]', el=>el.dataset.tab],
    ['#mobileNav button[data-tab]',el=>el.dataset.tab],
    ['#mobileMorePanel button[data-go]',el=>el.dataset.go] ].forEach(([selector,get]) => {
      document.querySelectorAll(selector).forEach(button=>{
       const key=get(button); if(!paths[key])return;
       const holder=button.querySelector('.nav-icon')||button.querySelector('span');
       if(holder){holder.innerHTML=svg(key); holder.setAttribute('aria-hidden','true')}
      });
    });
  const more=document.querySelector('#mobileMoreBtn .nav-icon');
  if(more){more.innerHTML=svg('more');more.setAttribute('aria-hidden','true')}
 }
 function currentTab(){return document.querySelector('.tab:not(.hide)')?.id||'dashboard'}
 function syncNavigation(next=currentTab()){
  const secondary=['builder','garage','academy','notices'].includes(next);
  const more=document.getElementById('mobileMoreBtn');
  if(more){ more.classList.toggle('active',secondary); if(secondary)more.setAttribute('aria-current','page');else more.removeAttribute('aria-current'); }
  document.querySelectorAll('#mobileNav button[data-tab]').forEach(button=>{
   const active=button.dataset.tab===next;button.classList.toggle('active',active);
   if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('#nav button[data-tab]').forEach(button=>{
   const active=button.dataset.tab===next;button.classList.toggle('active',active);
   if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('#mobileMorePanel button[data-go]').forEach(button=>{
   const active=button.dataset.go===next;button.classList.toggle('active',active);
   if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
  });
 }
 function init(){
  installIcons();syncNavigation();
  if(typeof window.tab==='function'&&!window.tab.__gbrIconSync){
   const oldTab=window.tab;
   const decorated=function(tabName){const result=oldTab.apply(this,arguments);syncNavigation(tabName);return result};
   decorated.__gbrIconSync=true;window.tab=decorated;
  }
  window.GBRNavigationIcons=Object.freeze({types:Object.freeze(Object.keys(paths)),install:installIcons,sync:syncNavigation,source:'GBR_Icones_Menu_SVG(1).zip'});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
