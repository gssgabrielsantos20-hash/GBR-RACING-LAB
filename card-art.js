/* GBR Racing Lab 5.3 — referência visual AllClash 2026. Apenas URLs confirmadas, sem cópia de fotos no ZIP. */
(()=>{
'use strict';
const host='https://www.allclash.com/wp-content/uploads/2026/04/';
const partUrls={
 'Flashpoint':'frontwing-flashpoint','Leading Edge':'frontwing-leading-edge','Loose Fit':'frontwing-loose-fit',
 'Scramble':'brakes-scramble','Aegis':'brakes-aegis','Pressure Point':'brakes-pressure-point','Aura Lock':'brakes-aura-lock','Stabilix':'brakes-stabilix',
 'Curver 3.0':'suspension-curver-3-0','Motion Link V2':'suspension-motion-link-v2','Bounce':'suspension-bounce',
 'Downforce':'rearwing-downforce','Vibe Lift':'rearwing-vibe-lift','Impact':'rearwing-impact','Dominus':'rearwing-dominus',
 'Lockdown':'gearbox-lockdown','Shift X':'gearbox-shift-x','Fracture':'gearbox-fracture','Powerbox':'gearbox-powerbox',
 'Velocity':'engine-velocity','DriveOS':'engine-driveos','Overdrive':'engine-overdrive',
 'Energy Reserve':'battery-energy-reserve','Charge Core':'battery-charge-core','Spare Pack':'battery-spare-pack'
};
const driverUrls={
 'bortoleto|Special|escolhas do paddock':'driver-bortoleto-paddock-picks',
 'bearman|Special|escolhas do paddock':'driver-bearman-paddock-picks',
 'hadjar|Special|escolhas do paddock':'driver-hadjar-paddock-picks',
 'antonelli|Special|escolhas do paddock':'driver-antonelli-paddock-picks',
 'bearman|Special|escolhas do paddock: turbo':'driver-bearman-paddock-picks-turbo',
 'hadjar|Epic|':'driver-hadjar-epic','sainz|Epic|':'driver-sainz-epic','piastri|Epic|':'driver-piastri-epic',
 'button|Legendary|':'driver-button-legendary','jenson button|Legendary|':'driver-button-legendary',
 'hunt|Legendary|':'driver-hunt-legendary','james hunt|Legendary|':'driver-hunt-legendary',
 'graham hill|Legendary|':'driver-ghill-legendary','g. hill|Legendary|':'driver-ghill-legendary','g hill|Legendary|':'driver-ghill-legendary','ghill|Legendary|':'driver-ghill-legendary',
 'damon hill|Legendary|':'driver-dhill-legendary','d. hill|Legendary|':'driver-dhill-legendary','d hill|Legendary|':'driver-dhill-legendary','dhill|Legendary|':'driver-dhill-legendary',
 'prost|Legendary|':'driver-prost-legendary','alain prost|Legendary|':'driver-prost-legendary',
 'senna|Legendary|':'driver-senna-legendary','ayrton senna|Legendary|':'driver-senna-legendary',
 'schumacher|Legendary|':'driver-schumacher-legendary','michael schumacher|Legendary|':'driver-schumacher-legendary'
};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
function overrideKey(item,kind){return kind+'|'+norm(item.name)+'|'+String(item.rarity||'')+'|'+norm(item.editionLabel||'');}
function overrides(){try{const x=JSON.parse(localStorage.getItem('gbr_visual_images_v53')||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch{return {}}}
const validUrl=s=>{try{const u=new URL(String(s||''));return u.protocol==='https:'&&!u.username&&!u.password&&u.href.length<=2048;}catch{return false}};
const cloud={client:null,rows:new Map(),loaded:false,admin:false,connected:false,error:'',channel:null,generation:0,poll:null};
function isRemote(item,kind){return cloud.rows.has(overrideKey(item,kind));}
function getRow(item,kind){return cloud.rows.get(overrideKey(item,kind))||null;}
function getSource(item,kind){if(!item)return {url:'',origin:'none'};const key=overrideKey(item,kind);
 const remote=cloud.rows.get(key);if(remote&&validUrl(remote.image_url))return {url:remote.image_url,origin:'shared'};
 const manual=overrides()[key];if(manual&&validUrl(manual))return {url:manual,origin:'local'};
 if(kind==='parts')return partUrls[item.name]?{url:host+'f1clash-'+partUrls[item.name]+'.jpg',origin:'reference'}:{url:'',origin:'none'};
 const edition=norm(item.editionLabel).replace(/\s*:\s*/g,': '),raw=norm(item.name),clean=raw.replace(/\./g,'').replace(/\s+/g,' ').trim();
 const words=clean.split(' ').filter(Boolean),last=words[words.length-1]||clean,initial=words[0]?.[0]||'',candidates=[];
 for(const key of [raw,clean,initial&&last&&`${initial}. ${last}`,initial&&last&&`${initial} ${last}`,initial&&last&&`${initial}${last}`,last])if(key&&!candidates.includes(key))candidates.push(key);
 for(const nameKey of candidates){const slug=driverUrls[nameKey+'|'+item.rarity+'|'+edition];if(slug)return {url:host+'f1clash-'+slug+'.jpg',origin:'reference'};}
 return {url:'',origin:'none'};
}
function getImage(item,kind){return getSource(item,kind).url;}
function thumb(item,kind){if(!item)return '';const {url,origin}=getSource(item,kind),label=kind==='parts'?'Peça':'Piloto';
 const placeholder=kind==='parts'?'◇':'◉';return `<span class="gbr-card-thumb ${url?'has-photo':''}" title="${esc(origin==='shared'?'Foto compartilhada da academia':origin==='local'?'Foto local deste dispositivo':origin==='reference'?'Imagem externa de referência':'Foto não cadastrada')}"><span class="gbr-thumb-placeholder" aria-hidden="true">${placeholder}</span>${url?`<img src="${esc(url)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" alt="${esc(label+' '+item.name)}" onerror="this.remove()">`:''}</span>`;
}
function fireUpdate(){document.dispatchEvent(new CustomEvent('gbr-card-art-updated',{detail:status()}));if(window.F1App?.refresh){try{window.F1App.refresh()}catch(e){console.warn('Refresh de miniaturas:',e)}}}
function status(){return {connected:cloud.connected,loaded:cloud.loaded,admin:cloud.admin,error:cloud.error,shared:cloud.rows.size,local:Object.keys(overrides()).length};}
function localClear(keys){const current=overrides();for(const k of keys)delete current[k];localStorage.setItem('gbr_visual_images_v53',JSON.stringify(current));}
function disconnect(){cloud.generation++;if(cloud.channel&&cloud.client){cloud.client.removeChannel(cloud.channel).catch(()=>{});}cloud.channel=null;cloud.client=null;cloud.loaded=false;cloud.connected=false;cloud.admin=false;cloud.error='';cloud.rows.clear();if(cloud.poll)clearInterval(cloud.poll);cloud.poll=null;fireUpdate();}
async function refreshRemote(silent=false){const client=cloud.client,gen=cloud.generation;if(!client)return status();try{
 const {data,error}=await client.from('gbr_card_images').select('card_key,kind,card_name,rarity,edition_label,image_url,storage_path,updated_at').limit(1500);
 if(error)throw error;if(gen!==cloud.generation)return status();const next=new Map();for(const row of data||[])if(validUrl(row.image_url))next.set(row.card_key,row);
 let changed=next.size!==cloud.rows.size||!cloud.loaded;for(const [key,row] of next)if(cloud.rows.get(key)?.image_url!==row.image_url)changed=true;
 cloud.rows=next;cloud.loaded=true;cloud.connected=true;cloud.error='';if(changed&&!silent)fireUpdate();return status();
 }catch(e){if(gen!==cloud.generation)return status();cloud.error=e.message||'Falha de leitura';cloud.connected=false;console.warn('Biblioteca visual sem sincronização:',cloud.error);if(!silent)fireUpdate();return status();}}
async function connect({client,demo=false}={}){disconnect();if(!client||demo)return status();cloud.client=client;const gen=cloud.generation;
 const perm=await client.rpc('am_i_academy_admin');if(gen!==cloud.generation)return status();cloud.admin=!perm.error&&perm.data===true;
 await refreshRemote();if(gen!==cloud.generation)return status();
 try{cloud.channel=client.channel('gbr-card-art-v54').on('postgres_changes',{event:'*',schema:'public',table:'gbr_card_images'},()=>{refreshRemote().catch(console.warn)}).subscribe();}catch(e){console.warn('Realtime imagens:',e)}
 cloud.poll=setInterval(()=>{if(document.visibilityState==='visible')refreshRemote(true).then(()=>fireUpdate()).catch(()=>{})},120000);
 return status();}
async function ensureAdmin(){if(!cloud.client||!cloud.admin)throw Error('Entre com uma conta de administrador da academia.');}
async function saveRemote(item,kind,url,storagePath=null){await ensureAdmin();url=String(url||'').trim();if(!validUrl(url))throw Error('Informe uma URL HTTPS válida.');const card_key=overrideKey(item,kind);const {data:{user},error:authError}=await cloud.client.auth.getUser();if(authError||!user)throw Error('Sessão expirada. Entre novamente.');
 const record={card_key,kind,card_name:String(item.name),rarity:String(item.rarity||''),edition_label:String(item.editionLabel||''),image_url:url,storage_path:storagePath,updated_at:new Date().toISOString(),updated_by:user.id};
 const {error}=await cloud.client.from('gbr_card_images').upsert(record,{onConflict:'card_key'});if(error)throw error;localClear([card_key]);await refreshRemote();return record;
}
async function deleteRemote(item,kind){await ensureAdmin();const key=overrideKey(item,kind);const {error}=await cloud.client.from('gbr_card_images').delete().eq('card_key',key);if(error)throw error;localClear([key]);await refreshRemote();}
async function convertFile(file){if(!file||!/^image\/(?:jpeg|png|webp|heic|heif)$/i.test(file.type))throw Error('Selecione uma foto JPG, PNG ou WebP. Fotos HEIC precisam ser convertidas pelo iPhone.');
 if(file.size>16*1024*1024)throw Error('Imagem muito grande. Escolha uma foto de até 16 MB.');
 const src=URL.createObjectURL(file);try{const img=await new Promise((resolve,reject)=>{const v=new Image();v.onload=()=>resolve(v);v.onerror=()=>reject(Error('Não foi possível abrir a foto. Escolha JPG, PNG ou WebP.'));v.src=src;});
 const ratio=Math.min(1,760/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.round(img.naturalWidth*ratio);canvas.height=Math.round(img.naturalHeight*ratio);const ctx=canvas.getContext('2d');if(!ctx)throw Error('Seu navegador não suporta preparar esta imagem.');ctx.drawImage(img,0,0,canvas.width,canvas.height);
 let blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.83));if(!blob)throw Error('Falha ao converter imagem.');
 if(blob.type!=='image/webp')blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.81));
 if(!blob)throw Error('Falha ao converter imagem.');const mime=blob.type==='image/webp'?'image/webp':'image/jpeg';const ext=mime==='image/webp'?'webp':'jpg';if(blob.size>1572864)throw Error('A foto ainda está grande demais. Use uma versão menor.');return {blob,mime,ext};
 }finally{URL.revokeObjectURL(src)}}
async function uploadRemote(item,kind,file){await ensureAdmin();const {blob,mime,ext}=await convertFile(file);const safeKey=norm(item.name).replace(/[^a-z0-9]+/g,'-').slice(0,40)||'carta';const fileId=crypto.randomUUID();const path=`${kind}/${safeKey}-${fileId}.${ext}`;
 const {error}=await cloud.client.storage.from('gbr-card-art').upload(path,blob,{contentType:mime,cacheControl:'3600',upsert:false});if(error)throw error;
 const {data}=cloud.client.storage.from('gbr-card-art').getPublicUrl(path);if(!validUrl(data?.publicUrl))throw Error('Não foi possível gerar o endereço da imagem.');
 try{return await saveRemote(item,kind,data.publicUrl,path)}catch(e){try{await cloud.client.storage.from('gbr-card-art').remove([path])}catch{}throw e;}
}
async function migrateLocal(items,progress){await ensureAdmin();const legacy=overrides();let count=0,skip=0,failed=[];
 for(const item of items){const key=overrideKey(item,item.kind),url=legacy[key];if(!url)continue;if(cloud.rows.has(key)){skip++;continue;}try{await saveRemote(item,item.kind,url);count++}catch(e){failed.push(`${item.name}: ${e.message||e}`)}progress?.({count,skip,failed:failed.length});}
 return {count,skip,failed};}
window.GBRCardArt=Object.freeze({thumb,getImage,getSource,getRow,isRemote,overrideKey,overrides,status,connect,disconnect,refreshRemote,saveRemote,deleteRemote,uploadRemote,migrateLocal,coverage:()=>({parts:Object.keys(partUrls).length,driverVariants:Object.keys(driverUrls).length}),source:'https://www.allclash.com/'});
})();
