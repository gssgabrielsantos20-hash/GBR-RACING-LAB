/*
 * GBR Racing Lab — carregamento resiliente do SDK público de Supabase 2.57.0.
 * O SDK não contém credenciais. Este arquivo não consulta nem modifica garagens.
 * Fontes independentes, fixadas na mesma versão, são tentadas sequencialmente.
 * TODO: substituir as fontes remotas por bundle local reprodutível com integridade
 * verificada assim que o pacote autenticado estiver disponível no build.
 */
(function(global){
 'use strict';
 const sources=Object.freeze([
  {type:'script',url:'https://unpkg.com/@supabase/supabase-js@2.57.0/dist/umd/supabase.js'},
  {type:'module',url:'https://esm.sh/@supabase/supabase-js@2.57.0?bundle&target=es2022'},
  {type:'module',url:'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm'}
 ]);
 const TIMEOUT_MS=9000;
 const valid=module=>!!module&&typeof module.createClient==='function';
 let inFlight=null;
 let loaded=null;
 function scriptSDK(url){
  if(valid(global.supabase))return Promise.resolve(global.supabase);
  return new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.async=true;
   script.crossOrigin='anonymous';
   script.referrerPolicy='no-referrer';
   script.src=url;
   let finished=false;
   let timer;
   const finish=(error)=>{
    if(finished)return;
    finished=true;
    clearTimeout(timer);
    script.onload=null;
    script.onerror=null;
    if(error){script.remove();reject(error)}
    else resolve(global.supabase);
   };
   script.onload=()=>{
    if(valid(global.supabase))finish(null);
    else finish(new Error('O SDK carregado não apresentou uma interface válida.'));
   };
   script.onerror=()=>finish(new Error('O servidor de scripts está temporariamente indisponível.'));
   timer=setTimeout(()=>finish(new Error('Tempo de carregamento do SDK esgotado.')),TIMEOUT_MS);
   document.head.appendChild(script);
  });
 }
 function moduleSDK(url){return import(url)}
 async function withTimeout(promise,ms){
  let timer;
  try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Tempo de carregamento esgotado.')),ms)})]);}
  finally{clearTimeout(timer)}
 }
 async function load(options){
  if(loaded)return loaded;
  if(inFlight)return inFlight;
  const scriptLoader=options?.scriptLoader||scriptSDK;
  const importer=options?.importer||moduleSDK;
  inFlight=(async()=>{
   for(const entry of sources){
    try{
     const module=await withTimeout(entry.type==='script'?scriptLoader(entry.url):importer(entry.url),TIMEOUT_MS+1000);
     if(!valid(module))throw new Error('SDK incompleto.');
     loaded=module;
     return module;
    }catch(error){
     // Logs deliberadamente sem dados de conta, tokens ou chaves.
     console.warn('[GBR] Provedor de SDK indisponível:',entry.type, String(error?.message||error));
    }
   }
   throw new Error('Biblioteca de conexão indisponível. Verifique a rede e tente novamente.');
  })();
  try{return await inFlight}
  finally{inFlight=null}
 }
 global.GBRSupabaseSDK=Object.freeze({load});
})(window);
