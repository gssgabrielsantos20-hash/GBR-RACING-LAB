/* GBR Racing Lab 5.2 — Central de avisos: leitura de associados, escrita admin com RLS. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cats=['Atualização','Academia','Evento GP','Manutenção','Dica'];
const builtin=[{id:'gbr-built-in-v52',category:'Atualização',title:'GBR Racing Lab 5.2 · Novidades da versão',body:'Gerenciamento de duplicidade na garagem, suporte completo ao seletor de raridades, fotos de referência onde disponíveis e Central de Avisos. Esta mensagem acompanha o aplicativo e não é uma publicação da academia.',pinned:true,published:true,published_at:'2026-10-16T09:00:00Z',origin:'Sistema'}];
let items=[],admin=false,demo=false,ctx=null,busy=false,editorShown=false,sessionKey='gbr-notices-demo',loading=false;
function readSeen(){try{return JSON.parse(localStorage.getItem('gbr-notice-read:'+sessionKey)||'{}')}catch{return {}}}
function markSeen(id){const seen=readSeen();seen[id]=true;try{localStorage.setItem('gbr-notice-read:'+sessionKey,JSON.stringify(seen))}catch{} updateUnread()}
function msg(txt){$('gbrNoticeConnection').textContent=txt}
function stamp(str){try{return new Date(str).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})}catch{return ''}}
function linkAllowed(str){try{const u=new URL(str);return u.protocol==='https:'?u.href:''}catch{return ''}}
function currentVisible(){let arr=[...builtin,...items].filter(x=>admin||x.published!==false);const filter=$('gbrNoticeFilter')?.value||'all';if(filter!=='all')arr=arr.filter(x=>x.category===filter);return arr.sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||new Date(b.published_at||b.created_at)-new Date(a.published_at||a.created_at));}
function updateUnread(){const seen=readSeen();const unread=[...builtin,...items].filter(x=>x.published!==false&&!seen[x.id]).length;$('gbrNoticeUnread').textContent=`${unread} não lido${unread===1?'':'s'}`;document.querySelectorAll('.gbr-nav-notice-dot').forEach(x=>x.hidden=!unread)}
function render(){
 const visible=currentVisible();const seen=readSeen();$('gbrNoticeCreate').classList.toggle('hide',!admin);
 $('gbrNoticeList').innerHTML=visible.length?visible.map(x=>{
  const published=x.published!==false,link=linkAllowed(x.link_url);return `<article class="gbr-notice ${seen[x.id]?'':'unread'}" data-notice="${safe(x.id)}"><div class="gbr-notice-top"><span class="gbr-notice-category">${safe(x.category)}</span>${x.pinned?'<span class="gbr-notice-pin">⌁ Fixado</span>':''}${!published?'<span class="gbr-notice-draft">Rascunho</span>':''}<time>${safe(stamp(x.published_at||x.created_at))}</time></div><h3>${safe(x.title)}</h3><p>${safe(x.body)}</p><div class="gbr-notice-bottom"><span class="muted mini">${safe(x.origin||'Academia GBR')}</span><div class="gbr-notice-actions">${link?`<a href="${safe(link)}" target="_blank" rel="noopener noreferrer">Abrir referência ↗</a>`:''}${published&&!seen[x.id]?`<button type="button" class="gbr-notice-mark" data-seen="${safe(x.id)}">✓ Marcar como lido</button>`:''}${admin&&x.id!=='gbr-built-in-v52'?`<button type="button" class="gbr-notice-mark" data-edit="${safe(x.id)}">Editar</button><button type="button" class="gbr-notice-mark danger" data-delete="${safe(x.id)}">Excluir</button>`:''}</div></div></article>`;}).join(''):'<div class="panel">Nenhum aviso nesta categoria.</div>';
 $('gbrNoticeList').querySelectorAll('[data-seen]').forEach(b=>b.onclick=()=>{markSeen(b.dataset.seen);render()});
 $('gbrNoticeList').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(items.find(x=>x.id===b.dataset.edit)));
 $('gbrNoticeList').querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>remove(b.dataset.delete));
 updateUnread();
}
function openEditor(item){if(!admin)return;editorShown=true;const el=$('gbrNoticeAdminPanel');el.classList.remove('hide');$('gbrNoticeEditorTitle').textContent=item?'Editar comunicado':'Novo comunicado';$('gbrNoticeId').value=item?.id||'';$('gbrNoticeTitle').value=item?.title||'';$('gbrNoticeBody').value=item?.body||'';$('gbrNoticeLink').value=item?.link_url||'';$('gbrNoticeCategory').value=item?.category||cats[0];$('gbrNoticePinned').checked=!!item?.pinned;$('gbrNoticePublished').checked=item?.published!==false;$('gbrNoticeAdminStatus').textContent='';el.scrollIntoView({behavior:'smooth',block:'start'});}
function closeEditor(){editorShown=false;$('gbrNoticeAdminPanel').classList.add('hide');$('gbrNoticeForm').reset()}
async function load(){if(!ctx)return;loading=true;try{
 if(demo){const raw=localStorage.getItem('gbr-notices-demo-posts');items=JSON.parse(raw||'[]');admin=true;msg('Prévia local · avisos não compartilhados');}
 else if(ctx.client&&ctx.userId){
  const [perm,result]=await Promise.all([ctx.client.rpc('am_i_academy_admin'),ctx.client.from('academy_announcements').select('id,category,title,body,link_url,pinned,published,published_at,created_at').order('created_at',{ascending:false}).limit(200)]);
  if(perm.error)throw perm.error;if(result.error)throw result.error;admin=perm.data===true;items=result.data||[];msg(admin?'Administração da academia · comunicados sincronizados':'Comunicados da academia · sincronizados');
 }else{items=[];admin=false;msg('Entre na sua conta para ler os avisos da academia');}
 }catch(e){items=[];admin=false;msg('Central local disponível · para compartilhamento, aplique a migração Supabase');console.warn('Avisos não carregados:',e?.message||e)}finally{loading=false;render();}}
function connect(){ctx=window.F1Session?.getContext?.()||null;demo=!!ctx?.demo;sessionKey=demo?'demo':ctx?.userId||'guest';closeEditor();load();}
function disconnect(){ctx=null;demo=false;admin=false;items=[];sessionKey='guest';closeEditor();msg('Entre na sua conta para carregar avisos');render();}
async function persist(e){e.preventDefault();if(busy||!admin||!ctx)return;const id=$('gbrNoticeId').value;const title=$('gbrNoticeTitle').value.trim();const body=$('gbrNoticeBody').value.trim();const category=$('gbrNoticeCategory').value;
 const link=$('gbrNoticeLink').value.trim();if(title.length<3||body.length<4||!cats.includes(category)){alert('Preencha título, mensagem e categoria válidos.');return}if(link&&!linkAllowed(link)){alert('Use um link HTTPS válido.');return}
 const payload={title,body,category,pinned:$('gbrNoticePinned').checked,published:$('gbrNoticePublished').checked,link_url:link||null};
 busy=true;$('gbrNoticeSubmit').disabled=true;$('gbrNoticeAdminStatus').textContent='Salvando...';try{
 if(demo){const old=items.find(x=>x.id===id);if(old)Object.assign(old,payload);else items.unshift({...payload,id:'demo-'+Date.now(),created_at:new Date().toISOString()});localStorage.setItem('gbr-notices-demo-posts',JSON.stringify(items));}
 else {const request=id?ctx.client.from('academy_announcements').update(payload).eq('id',id):ctx.client.from('academy_announcements').insert(payload);const result=await request.select('id').single();if(result.error)throw result.error;}
 closeEditor();await load();
 }catch(error){$('gbrNoticeAdminStatus').textContent='Não foi possível salvar: '+(error.message||error)}finally{busy=false;$('gbrNoticeSubmit').disabled=false}}
async function remove(id){if(!admin||!confirm('Excluir este comunicado da Central de Avisos para todos os integrantes?'))return;try{if(demo){items=items.filter(x=>x.id!==id);localStorage.setItem('gbr-notices-demo-posts',JSON.stringify(items));}else{const {error}=await ctx.client.from('academy_announcements').delete().eq('id',id);if(error)throw error;}await load()}catch(e){alert('Falha ao excluir comunicado: '+(e.message||e))}}
$('gbrNoticeFilter').addEventListener('change',render);
$('gbrNoticeReadAll').addEventListener('click',()=>{const read=readSeen();[...builtin,...items].filter(x=>x.published!==false).forEach(x=>read[x.id]=true);try{localStorage.setItem('gbr-notice-read:'+sessionKey,JSON.stringify(read))}catch{}render()});
$('gbrNoticeCreate').onclick=()=>openEditor();$('gbrNoticeCancel').onclick=closeEditor;$('gbrNoticeForm').addEventListener('submit',persist);
window.GBRNotices={connect,disconnect,render,getState:()=>({admin,demo,loaded:!loading,items:items.length,unread:[...builtin,...items].filter(x=>x.published!==false&&!readSeen()[x.id]).length})};
render();
})();
