/* GBR 5.4 — Biblioteca Visual administrativa. Autorização final: políticas RLS do Supabase. */
(()=>{'use strict';
const $=id=>document.getElementById(id),ref=window.F1Reference||{},art=window.GBRCardArt;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pieces=Object.entries(ref.parts||{}).map(([name,v])=>({kind:'parts',name,rarity:v.rarity||'Common',editionLabel:''}));
const drivers=Object.entries(ref.drivers||{}).flatMap(([key,v])=>{
 if(v.levels)return [{kind:'drivers',name:v.name||key.split('|').slice(1).join('|'),rarity:v.rarity||key.split('|')[0]||'Common',editionLabel:''}];
 return Object.entries(v).filter(([_,x])=>x&&typeof x==='object').map(([rarity])=>({kind:'drivers',name:key,rarity,editionLabel:''}));
});
const extras=[{kind:'drivers',name:'D. Hill',rarity:'Legendary',editionLabel:'',legacy:true}, // chave legada para editar fotos compartilhadas existentes
...['Bortoleto','Bearman','Hadjar','Antonelli'].map(name=>({kind:'drivers',name,rarity:'Special',editionLabel:'Escolhas do Paddock'})),{kind:'drivers',name:'Bearman',rarity:'Special',editionLabel:'Escolhas do Paddock: Turbo'}];
const byKey=new Map();for(const item of [...pieces,...drivers,...extras])byKey.set(art.overrideKey(item,item.kind),item);
const items=[...byKey.values()].sort((a,b)=>a.kind.localeCompare(b.kind)||a.name.localeCompare(b.name,'pt-BR')||a.rarity.localeCompare(b.rarity));
const statuses=new Map();let client=null,admin=false,busy=false,checking=false;
function info(s,error=false){$('notice').textContent=s||'';$('notice').style.color=error?'#ffb5ab':'#a8bec5'}
function setStatus(message,cls='warn'){$('status').textContent=message;$('status').className='status '+cls;}
function source(item){return art.getSource(item,item.kind)}
function render(){const type=$('kind').value,filter=$('filter').value,q=$('search').value.trim().toLocaleLowerCase('pt-BR'),s=art.status();
 const shared=items.filter(i=>art.isRemote(i,i.kind)).length,missing=items.filter(i=>!source(i).url).length;
 $('countAll').textContent=items.length;$('countShared').textContent=shared;$('countMissing').textContent=missing;
 $('adminTools').classList.toggle('hide',!admin);
 const rows=items.filter(i=>(type==='all'||i.kind===type)&&(!q||`${i.name} ${i.rarity} ${i.editionLabel} ${(i.kind==='drivers'&&i.rarity==='Legendary'?window.GBRLegendaryDrivers?.lookup?.(i.name)?.aliases||[]:[]).join(' ')}`.toLocaleLowerCase('pt-BR').includes(q))).filter(i=>filter==='all'||filter==='missing'&&!source(i).url||filter==='shared'&&art.isRemote(i,i.kind)||filter==='local'&&source(i).origin==='local'||filter==='broken'&&statuses.get(art.overrideKey(i,i.kind))==='broken');
 $('items').innerHTML=rows.map(i=>{const key=art.overrideKey(i,i.kind),src=source(i),remote=art.isRemote(i,i.kind),state=statuses.get(key)||'',hint=src.origin==='shared'?'Publicado no Supabase':src.origin==='local'?'Somente neste aparelho':src.origin==='reference'?'Referência externa': 'Sem referência';
 return `<article class="card" data-key="${esc(key)}"><div class="art">${src.url?`<img alt="${esc(i.name)}" loading="lazy" src="${esc(src.url)}" referrerpolicy="no-referrer" onerror="this.replaceWith(document.createTextNode('◇'))">`:'◇'}</div><div><h3>${esc(i.name)}</h3><div class="meta">${i.kind==='drivers'?'Piloto':'Peça'} • ${esc(i.rarity)} ${i.editionLabel?'• '+esc(i.editionLabel):''}${i.legacy?' • Cadastro legado de Damon Hill':''}</div><div class="source ${esc(src.origin)}">${esc(hint)}${state==='broken'?' · imagem com erro':state==='ok'?' · carregou':''}</div>${admin?`<form data-save="${esc(key)}"><input class="url" type="url" placeholder="URL HTTPS de imagem autorizada" data-url="${esc(key)}" maxlength="2048" autocomplete="off" value="${esc(art.getRow(i,i.kind)?.image_url||art.overrides()[key]||'')}"><div class="actions"><button class="minor primary" type="submit" data-action="save">Salvar URL</button>${remote?`<button class="minor danger" type="button" data-remove="${esc(key)}">Remover</button>`:''}</div><label class="addphoto" style="font-size:12px;color:#a8bec5">Ou selecionar foto do celular <input type="file" accept="image/jpeg,image/png,image/webp,image/*" data-upload="${esc(key)}" aria-label="Enviar foto de ${esc(i.name)}"></label></form>`:''}</div></article>`;
 }).join('');
 $('items').querySelectorAll('form[data-save]').forEach(form=>form.addEventListener('submit',ev=>{ev.preventDefault();const k=form.dataset.save;runSave(k)}));
 $('items').querySelectorAll('button[data-remove]').forEach(btn=>btn.addEventListener('click',()=>runDelete(btn.dataset.remove)));
 $('items').querySelectorAll('input[data-upload]').forEach(input=>input.addEventListener('change',()=>runUpload(input.dataset.upload,input.files?.[0])));
 if(!rows.length)$('items').innerHTML='<p class="alert">Nenhuma carta corresponde aos filtros.</p>';
}
async function action(fn,message){if(busy)return;busy=true;document.querySelectorAll('button,input[type=file]').forEach(x=>x.disabled=true);info('Enviando alteração...');try{await fn();info(message||'Atualização sincronizada.');}catch(e){info('Não foi possível salvar: '+(e?.message||e),true)}finally{busy=false;render()}}
async function runSave(k){const i=byKey.get(k),input=[...document.querySelectorAll('input[data-url]')].find(x=>x.dataset.url===k);if(!i||!input)return;const url=input.value.trim();if(!url)return info('Informe uma URL HTTPS, ou use a opção de enviar foto.',true);
 await action(()=>art.saveRemote(i,i.kind,url),'Imagem publicada para a academia.');}
async function runDelete(k){const i=byKey.get(k);if(!i||!confirm(`Remover a imagem compartilhada de ${i.name}? A carta voltará à referência padrão.`))return;
 await action(()=>art.deleteRemote(i,i.kind),'Imagem compartilhada removida.');}
async function runUpload(k,file){const i=byKey.get(k);if(!i||!file)return;if(art.isRemote(i,i.kind)&&!confirm(`Substituir a foto compartilhada de ${i.name}?`))return;
 await action(()=>art.uploadRemote(i,i.kind,file),'Foto enviada do celular e publicada para a academia.');}
async function auditImages(){if(checking)return;checking=true;info('Verificando as imagens...');const unique=[...new Set(items.map(i=>source(i).url).filter(Boolean))],result=new Map();let count=0;
 for(const url of unique){const ok=await new Promise(resolve=>{const img=new Image();let done=false;let timer;const finish=valid=>{if(done)return;done=true;clearTimeout(timer);resolve(valid)};img.onload=()=>finish(true);img.onerror=()=>finish(false);timer=setTimeout(()=>finish(false),6500);img.src=url;});result.set(url,ok);count++;if(count%10===0)info(`Verificando ${count}/${unique.length}...`)}
 for(const i of items){const url=source(i).url;statuses.set(art.overrideKey(i,i.kind),url?(result.get(url)?'ok':'broken'):'missing')}checking=false;render();info(`Verificação concluída: ${[...result.values()].filter(x=>!x).length} endereços com falha.`);}
function exportJSON(){const o={...art.overrides()};for(const i of items)if(art.isRemote(i,i.kind))o[art.overrideKey(i,i.kind)]=art.getRow(i,i.kind).image_url;
 const blob=new Blob([JSON.stringify(o,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='gbr-biblioteca-visual-5-4.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);}
async function importJSON(event){const file=event.target.files?.[0];if(!file)return;try{const x=JSON.parse(await file.text());if(!x||Array.isArray(x)||typeof x!=='object')throw Error('Formato inválido.');const data={...art.overrides()};let count=0;for(const [key,url] of Object.entries(x)){if(!byKey.has(key))continue;if(typeof url!=='string'||!/^https:\/\/[^\s]+$/i.test(url)||url.length>2048)throw Error('URL inválida.');data[key]=url;count++}localStorage.setItem('gbr_visual_images_v53',JSON.stringify(data));render();info(`${count} URLs importadas localmente. Toque “Enviar URLs locais para a nuvem” para compartilhar.`);}catch(e){info('Erro ao importar: '+e.message,true)}finally{event.target.value=''}}
async function migrate(){const local=art.overrides(),pending=items.filter(i=>!!local[art.overrideKey(i,i.kind)]);if(!pending.length)return info('Nenhuma URL local para compartilhar.');if(!confirm(`Publicar até ${pending.length} URLs locais para toda a academia? Cadastros já existentes na nuvem não serão substituídos.`))return;
 await action(async()=>{const result=await art.migrateLocal(items,x=>info(`Publicadas ${x.count}, ignoradas ${x.skip}, falhas ${x.failed}...`));if(result.failed.length)throw Error(`${result.count} publicadas; ${result.failed.length} falharam: ${result.failed.slice(0,2).join('; ')}`);info(`${result.count} publicadas; ${result.skip} já existiam.`)},'URLs locais transferidas para o Supabase.');}
async function boot(){render();const conf=window.F1CLOUD_CONFIG;if(!conf?.url||!conf?.anonKey)return setStatus('Conexão Supabase não configurada. Abra o aplicativo oficial e configure o projeto.', 'error');try{
 const mod=await window.GBRSupabaseSDK.load();client=mod.createClient(conf.url,conf.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data:{user},error}=await client.auth.getUser();if(error||!user){setStatus('Entre primeiro no GBR Racing Lab oficial com sua conta. Depois volte a esta página e recarregue. Os cadastros locais continuam disponíveis.', 'warn');render();return;}
 const result=await art.connect({client});admin=art.status().admin;const s=art.status();if(!s.connected){setStatus(`Não foi possível acessar o catálogo compartilhado: ${s.error}. A migração SQL 5.4 pode estar pendente.`, 'error')}else{setStatus(admin?'Administrador conectado • suas imagens serão publicadas para os integrantes.':'Biblioteca sincronizada • consulta disponível. Apenas administradores editam.', 'ok');}
 render();
 }catch(e){setStatus('Falha de conexão: '+(e.message||e),'error')}}
$('kind').onchange=render;$('filter').onchange=render;$('search').oninput=render;$('check').onclick=auditImages;$('export').onclick=exportJSON;$('import').onchange=importJSON;$('migrate').onclick=migrate;
$('refresh').onclick=()=>art.refreshRemote().then(()=>{render();info('Catálogo atualizado do Supabase.')}).catch(e=>info(e.message,true));
document.addEventListener('gbr-card-art-updated',()=>{render()});
window.addEventListener('focus',()=>{if(client)art.refreshRemote(true).then(render)});
boot();
})();
