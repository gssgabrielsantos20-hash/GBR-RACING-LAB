/* GBR 5.0 · Layout: organiza operações da garagem perto do topo, sem mudar IDs ou lógica de persistência. */
(()=>{'use strict';
 function organize(){
  const panel=document.querySelector('#garage > .panel');if(!panel)return;
  const title=panel.querySelector('h2');
  const quick=panel.querySelector('#gbrGarageQuickBar');
  const backup=panel.querySelector('#garageBackup');
  const hint=panel.querySelector('.garage-hint');
  if(!title||!quick||!backup)return;
  panel.prepend(title);title.after(quick);quick.after(backup);
  if(hint)backup.after(hint);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',organize,{once:true});else organize();
})();
