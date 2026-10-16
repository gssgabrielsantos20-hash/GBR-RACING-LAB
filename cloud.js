/*
 * GBR Racing Lab — módulo cliente.
 * A proteção entre usuários não depende deste arquivo: é imposta pelo RLS do PostgreSQL.
 * Nunca use a chave service_role no navegador.
 */
const $ = id => document.getElementById(id);
const config = window.F1CLOUD_CONFIG || {};
const configured = /^https:\/\/[\w-]+\.supabase\.co\/?$/.test(String(config.url||'').trim()) && String(config.anonKey||'').length > 20;
let client = null;
let user = null;
let team = null;
let profile = null;
let revision = 0;
let timer = null;
let dirty = false;
let working = false;
let conflict = false;
let enabled = false;
let demo = false;
let authMode = 'login';
const recoveryFromLink = /(?:[?&#](?:auth|type)=recovery)(?:[&#]|$)/.test(location.href);
let recoveryMode = recoveryFromLink;
let recoverySessionReady = false;
let booting = false;
const clientOptions = { auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } };
function setSync(mode, message) {
 const el=$('syncStatus');el.classList.remove('online','pending','error');if(mode)el.classList.add(mode);$('syncText').textContent=message;
}
function message(s, error=true){const el=$('authMessage');el.textContent=s||'';el.style.color=error?'#ffca9a':'#6be1ad'}
let toastTimer;
function toast(s){const el=$('toast');el.textContent=s;el.classList.remove('hide');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hide'),4500)}
function gateVisible(show){$('accessGate').classList.toggle('hide',!show);$('appShell').setAttribute('aria-hidden',show?'true':'false');$('mobileNav').classList.toggle('hide',show)}
function accountName(){const label=profile?.nickname || user?.email?.split('@')[0] || 'Piloto';$('accountName').textContent=label;$('topAvatar').textContent=label.slice(0,1).toUpperCase();$('dashTeamName').textContent=team?.name || (demo?'Demonstração':'Não atribuída');$('dashTeamText').textContent=demo?'Exemplo local sem sincronização.':`Sua garagem pessoal na ${team?.name || 'laboratório'}. Apenas você pode editá-la.`;$('memberTeam').textContent=team?.name||'Não atribuída';$('profileNickname').value=profile?.nickname||''}
function showJoin(show){$('joinGate').classList.toggle('hide',!show);$('authForm').classList.toggle('hide',show);document.querySelector('.auth-links').classList.toggle('hide',show);document.querySelector('.demo-section').classList.toggle('hide',show);$('authTitle').textContent=show?'Entrar na academia':'Entrar no box';$('authDescription').textContent=show?'Informe seu nome no F1 Clash e o código geral de acesso.':'Use o email e senha cadastrados na sua academia.'}
function showRecoveryForm(){
 recoveryMode=true;
 gateVisible(true);
 $('joinGate').classList.add('hide');
 $('authForm').classList.add('hide');
 document.querySelector('.auth-links').classList.add('hide');
 document.querySelector('.demo-section').classList.add('hide');
 $('passwordRecoveryForm').classList.remove('hide');
 $('recoveryRetry').classList.remove('hide');
 $('authTitle').textContent='Redefinir senha';
 $('authDescription').textContent='Crie uma nova senha para sua conta GBR Racing Lab.';
 message('Digite e confirme sua nova senha (mínimo de 8 caracteres).',false);
}
function recoveryRedirect(){const url=new URL(location.origin+location.pathname);url.searchParams.set('auth','recovery');return url.toString()}
function cleanRecoveryUrl(){const url=new URL(location.href);url.searchParams.delete('auth');url.searchParams.delete('type');url.searchParams.delete('code');url.searchParams.delete('token');url.searchParams.delete('token_hash');url.hash='';history.replaceState(null,'',url.pathname+(url.search||''))}
function showApp(){gateVisible(false);$('signOutBtn').hidden=demo;accountName();window.F1App.refresh();renderTeams();renderAdmin();window.GBRNotices?.connect?.();window.GBRCardArt?.connect?.({client:demo?null:client,demo}).catch(e=>console.warn("Imagens não sincronizadas",e));}
function clearApp(){window.GBRNotices?.disconnect?.();window.GBRCardArt?.disconnect?.();clearTimeout(timer);dirty=false;enabled=false;demo=false;user=null;team=null;profile=null;revision=0;conflict=false;working=false;$('conflictBar').classList.add('hide');window.F1App.setGarage(window.F1App.newGarage());$('signOutBtn').hidden=true;$('accountName').textContent='Visitante';$('topAvatar').textContent='?';setSync(null,'Aguardando login');showJoin(false);gateVisible(true)}
function getLocalDraft(){if(!user)return null;try{return JSON.parse(localStorage.getItem('f1-draft-v3:'+user.id)||'null')}catch{return null}}
function setDraft(){if(!user||demo)return;try{localStorage.setItem('f1-draft-v3:'+user.id,JSON.stringify({payload:window.F1App.getGarage(),savedAt:Date.now(),basedOn:revision}))}catch{}}
function removeDraft(){if(user)try{localStorage.removeItem('f1-draft-v3:'+user.id)}catch{}}
function scheduleSave(){if(!enabled||demo||!user)return;dirty=true;setDraft();setSync('pending','Alterações pendentes');clearTimeout(timer);timer=setTimeout(()=>flush(),750)}
async function flush(){if(!dirty||!enabled||demo||!user||working||conflict)return false;working=true;const uid=user.id;const snapshot=JSON.stringify(window.F1App.getGarage());const payload=JSON.parse(snapshot);const oldRevision=revision;dirty=false;setSync('pending','Sincronizando garagem');try{
 let result;
 if(oldRevision===0){result=await client.from('garage_states').insert({user_id:uid,garage:payload,revision:1}).select('revision').single()}
 else {result=await client.from('garage_states').update({garage:payload,revision:oldRevision+1,updated_at:new Date().toISOString()}).eq('user_id',uid).eq('revision',oldRevision).select('revision').maybeSingle()}
 if(result.error&&result.error.code==='23505'){conflict=true;dirty=true;setDraft();$('conflictBar').classList.remove('hide');setSync('error','Conflito entre dispositivos');return false}
 if(result.error)throw result.error;
 if(!result.data){conflict=true;dirty=true;setDraft();$('conflictBar').classList.remove('hide');setSync('error','Conflito entre dispositivos');return false}
 revision=Number(result.data.revision);
 if(!dirty&&JSON.stringify(window.F1App.getGarage())===snapshot){removeDraft();setSync('online','Salvo na nuvem')}else{dirty=true;setDraft();setSync('pending','Aguardando novas alterações')}
 return true;
 }catch(e){dirty=true;setDraft();setSync('error','Falha na sincronização');toast('Não foi possível salvar. Verifique sua conexão: '+(e.message||e));return false}
 finally{working=false;if(dirty&&!conflict&&enabled){clearTimeout(timer);timer=setTimeout(flush,3500)}}
}
async function loadRemote(){if(!user)return;const uid=user.id;const result=await client.from('garage_states').select('garage,revision').eq('user_id',uid).maybeSingle();if(result.error)throw result.error;
 revision=Number(result.data?.revision||0);const online=result.data?.garage;
 const draft=getLocalDraft();
 if(draft?.payload && (!online || draft.basedOn===revision)){
   if(!online || confirm('Há alterações locais pendentes desta conta, salvas neste navegador. Deseja recuperá-las e enviá-las à nuvem?')){
      window.F1App.setGarage(draft.payload);dirty=true;setSync('pending','Rascunho recuperado');return;
   }
 }
 if(draft?.payload && online && draft.basedOn!==revision){
   // Conflito de revisão: nunca sobrescrever silenciosamente outro dispositivo.
   window.F1App.setGarage(draft.payload);dirty=true;conflict=true;$('conflictBar').classList.remove('hide');setSync('error','Conflito entre dispositivos');return;
 }
 window.F1App.setGarage(online||window.F1App.newGarage());removeDraft();dirty=false;setSync('online',online?'Garagem sincronizada':'Garagem nova, pronta');
}
async function loadMember(){const membership=await client.from('academy_members').select('team_id,academy_teams(id,name,slug)').eq('user_id',user.id).maybeSingle();if(membership.error)throw membership.error;team=membership.data?.academy_teams||null;
 if(membership.data){const prof=await client.from('academy_profiles').select('nickname').eq('user_id',user.id).maybeSingle();if(prof.error)throw prof.error;profile=prof.data||null;}return !!membership.data;
}
async function startSession(authUser){if(recoveryMode){showRecoveryForm();return;}if(booting)return;booting=true;try{enabled=false;user=authUser;demo=false;const isMember=await loadMember();if(!isMember){showJoin(true);gateVisible(true);message('Conta conectada. Informe seu nome no F1 Clash e o código da academia.',false);setSync('pending','Aguardando ingresso');return;}
 await loadRemote();enabled=true;showApp();if(dirty&&!conflict)scheduleSave();
 }catch(e){enabled=false;gateVisible(true);message('Falha ao recuperar seus dados na nuvem: '+(e.message||e));setSync('error','Não foi possível carregar');}finally{booting=false}}
async function joinTeam(code,nickname){if(!user||!client)throw Error('Entre na sua conta primeiro.');const result=await client.rpc('join_academy',{p_code:code.trim(),p_nickname:nickname.trim()});if(result.error)throw result.error;await startSessionAfterJoin()}
async function startSessionAfterJoin(){const existing=await client.from('academy_profiles').select('user_id').eq('user_id',user.id).maybeSingle();if(existing.error)throw existing.error;if(!existing.data){const prof=await client.from('academy_profiles').insert({user_id:user.id,nickname:(user.email||'Piloto').split('@')[0].slice(0,40)});if(prof.error)throw prof.error;}team=null;profile=null;await loadMember();await loadRemote();enabled=true;showApp();message('',false);if(dirty&&!conflict)scheduleSave();}
async function renderTeams(){const grid=$('teamsGrid');if(!client||demo){grid.innerHTML=[1,2,3,4].map(i=>`<div class="panel"><div class="team-id">0${i}</div><div class="team-name">Equipe ${i}</div><div class="team-count">Demonstração — sem dados online</div></div>`).join('');return;}
 try{const r=await client.rpc('academy_team_counts');if(r.error)throw r.error;grid.innerHTML=(r.data||[]).map((t,i)=>`<div class="panel ${t.id===team?.id?'mine':''}"><div class="team-id">0${i+1}</div><div class="team-name">${safeText(t.name)}</div><div class="team-count">${Number(t.member_count||0)} integrante(s)${t.id===team?.id?' • SUA EQUIPE':''}</div></div>`).join('');}
 catch(e){grid.innerHTML=`<div class="panel"><p>Falha ao carregar as equipes: ${safeText(e.message||'erro')}</p></div>`}
}
async function renderAdmin(){const panel=$('adminPanel');if(!panel)return;panel.classList.add('hide');if(!client||!user||demo)return;try{const check=await client.rpc('am_i_academy_admin');if(check.error||!check.data)return;panel.classList.remove('hide');const [members,teams]=await Promise.all([client.rpc('admin_list_players'),client.from('academy_teams').select('id,name').order('slug')]);if(members.error)throw members.error;if(teams.error)throw teams.error;const rows=members.data||[];const options=[{id:'',name:'Não atribuída'},...(teams.data||[])];$('adminPlayers').innerHTML=rows.length?rows.map(m=>`<div class="field" style="margin-bottom:12px"><label>${safeText(m.nickname||'Sem nome')}</label><select data-player="${safeText(m.user_id)}">${options.map(t=>`<option value="${safeText(t.id)}" ${t.id===(m.team_id||'')?'selected':''}>${safeText(t.name)}</option>`).join('')}</select></div>`).join(''):'<p class="muted">Nenhum jogador vinculado.</p>';$('adminPlayers').querySelectorAll('select').forEach(sel=>sel.onchange=async()=>{const result=await client.rpc('admin_move_player',{p_user_id:sel.dataset.player,p_team_id:sel.value||null});if(result.error){toast(result.error.message);await renderAdmin();return;}toast('Equipe atualizada.');await renderAdmin();await renderTeams();});}catch(e){panel.classList.remove('hide');$('adminPlayers').textContent='Não foi possível carregar: '+(e.message||e);}}
$('adminRefresh').onclick=renderAdmin;
function safeText(value){return String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
function setAuthMode(next){
 authMode=next;
 const signup=next==='signup',reset=next==='reset';
 $('passwordRecoveryForm').classList.add('hide');
 $('recoveryRetry').classList.add('hide');
 $('authForm').classList.remove('hide');
 document.querySelector('.auth-links').classList.remove('hide');
 document.querySelector('.demo-section').classList.remove('hide');
 $('authPassword').closest('.field').classList.toggle('hide',reset);
 $('authPassword').required=!reset;
 $('authPassword').minLength=signup?8:6;
 $('authTitle').textContent=reset?'Recuperar senha':signup?'Criar conta':'Entrar no box';
 $('authDescription').textContent=reset?'Informe seu e-mail para receber um link seguro de redefinição.':signup?'Crie sua conta. Após confirmar o e-mail, informe seu nome no F1 Clash e o código geral.':'Use o e-mail e a senha cadastrados no laboratório.';
 $('authSubmit').textContent=reset?'ENVIAR LINK DE RECUPERAÇÃO →':signup?'CRIAR MINHA CONTA →':'ENTRAR →';
 $('modeSignup').classList.toggle('hide',signup||reset);
 $('modeLogin').classList.toggle('hide',!signup&&!reset);
 $('forgotPassword').classList.toggle('hide',reset);
 $('authPassword').setAttribute('autocomplete',signup?'new-password':'current-password');
 message('');
}
$('modeSignup').onclick=()=>setAuthMode('signup');
$('modeLogin').onclick=()=>setAuthMode('login');
$('forgotPassword').onclick=()=>setAuthMode('reset');
$('authForm').onsubmit=async event=>{
 event.preventDefault();if(!client){message('Não foi possível conectar ao Supabase.');return}
 const email=$('authEmail').value.trim(),password=$('authPassword').value;
 $('authSubmit').disabled=true;
 message(authMode==='reset'?'Solicitando link de recuperação...':'Autenticando...',false);
 try{
  if(authMode==='reset'){
   const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:recoveryRedirect()});
   if(error)throw error;
   message('Se esse e-mail estiver cadastrado, você receberá um link. Abra-o no mesmo navegador para criar uma nova senha.',false);
  }else if(authMode==='signup'){
   const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});if(error)throw error;
   if(!data.session)message('Conta criada. Confirme seu e-mail pelo link enviado e depois entre.',false);
   else {message('Conta criada. Informe seu nome no F1 Clash e o código geral da academia.',false);await startSession(data.user)}
  }else{
   const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;await startSession(data.user)
  }
 }catch(e){message('Não foi possível continuar: '+(e.message||e))}
 finally{$('authSubmit').disabled=false}
};
$('recoveryRetry').onclick=async()=>{if(client)await client.auth.signOut();recoveryMode=false;recoverySessionReady=false;cleanRecoveryUrl();clearApp();setAuthMode('reset');message('Informe seu e-mail para solicitar um novo link.',false)};
$('passwordRecoveryForm').onsubmit=async event=>{
 event.preventDefault();if(!client){message('Conexão indisponível.');return}
 const pw=$('newPassword').value,repeat=$('confirmPassword').value;
 if(pw.length<8){message('A nova senha precisa ter pelo menos 8 caracteres.');return}
 if(pw!==repeat){message('As senhas não coincidem.');return}
 const submit=$('saveNewPassword');submit.disabled=true;message('Atualizando sua senha...',false);
 try{
  const {data:{session},error:sessionError}=await client.auth.getSession();
  if(sessionError||!session)throw Error('Link inválido ou expirado. Solicite outro e-mail de recuperação.');
  const {error}=await client.auth.updateUser({password:pw});if(error)throw error;
  await client.auth.signOut();recoveryMode=false;recoverySessionReady=false;
  cleanRecoveryUrl();clearApp();setAuthMode('login');$('newPassword').value='';$('confirmPassword').value='';
  message('Senha redefinida com sucesso! Entre usando sua nova senha.',false);
 }catch(error){message('Não foi possível redefinir sua senha: '+(error.message||error))}
 finally{submit.disabled=false}
};
$('joinGateForm').onsubmit=async e=>{e.preventDefault();message('Validando código da academia...',false);try{await joinTeam($('joinGateCode').value,$('joinNickname').value);$('joinGateCode').value='';}catch(error){message('Não foi possível entrar na academia: '+(error.message||error))}};
$('joinLogout').onclick=async()=>{if(client)await client.auth.signOut();clearApp()};

$('profileSave').onclick=async()=>{if(demo){toast('Demonstração: perfil não sincronizado.');return}if(!user)return;const nickname=$('profileNickname').value.trim();if(!nickname||nickname.length>40){toast('Use seu nome no F1 Clash (1 a 40 caracteres).');return}const {error}=await client.from('academy_profiles').upsert({user_id:user.id,nickname},{onConflict:'user_id'});if(error){toast(error.message);return}profile={nickname};accountName();toast('Nome de jogador salvo.')};
$('signOutBtn').onclick=async()=>{if(dirty){await flush();if(dirty||conflict){toast('Sua garagem tem alterações pendentes. Resolva a sincronização antes de sair ou exporte um backup.');return}}const {error}=await client.auth.signOut();if(error){toast(error.message);return}clearApp()};
$('reloadCloud').onclick=async()=>{if(!confirm('Descartar suas edições locais e carregar a versão da nuvem? Exporte um backup antes se precisar mantê-las.'))return;conflict=false;dirty=false;$('conflictBar').classList.add('hide');removeDraft();try{await loadRemote();toast('Versão da nuvem carregada.')}catch(e){toast(e.message)}};
$('overwriteCloud').onclick=async()=>{if(!confirm('Substituir a versão mais recente da nuvem pela garagem desta tela? Use apenas se tiver certeza.'))return;try{const r=await client.from('garage_states').select('revision').eq('user_id',user.id).maybeSingle();if(r.error)throw r.error;revision=Number(r.data?.revision||0);conflict=false;$('conflictBar').classList.add('hide');dirty=true;await flush();}catch(e){conflict=true;$('conflictBar').classList.remove('hide');toast(e.message)}};
$('demoBtn').onclick=()=>{clearApp();demo=true;const sample=window.F1App.newGarage();const source=init();const choices={parts:['Zephyr','Equilibrium','Velocity','Impact','Loose Fit','Lockdown','Energy Reserve'],drivers:['Leclerc','Hamilton']};for(const kind of ['parts','drivers'])for(const name of choices[kind]){const idx=sample[kind].findIndex(p=>p.name===name);if(idx<0)continue;const matching=source[kind].find(p=>p.name===name);if(matching){
 const ref=kind==='parts'?window.F1Reference.parts[name]:Object.values(window.F1Reference.drivers).find(p=>p.name===name&&p.rarity==='Epic');
 const level=kind==='parts'?4:3, values=ref?.levels?.[String(level)];
 sample[kind][idx]={...matching,rarity:ref?.rarity||matching.rarity,series:ref?.series||matching.series,level,owned:true};
 if(values)(kind==='parts'?['speed','corner','power','qualifying','pit']:['overtaking','defending','qualifying','raceStart','tyreUse']).forEach((key,i)=>sample[kind][idx][key]=values[i]);
 }}
 window.F1App.setGarage(sample);setSync(null,'DEMONSTRAÇÃO • sem nuvem');showApp();toast('Demonstração local. Para salvar seus dados, entre na academia.')};
window.F1Session={scheduleSave,refreshAcademy:renderTeams,forceFlush:flush,getContext:()=>({client,userId:user?.id||null,demo,enabled})};
window.addEventListener('online',()=>{if(dirty&&!conflict&&enabled)flush()});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&dirty&&!conflict&&enabled)flush()});
// Configuração intencionalmente pendente em um pacote distribuível.
if(!configured){$('configAlert').classList.remove('hide');message('Publique os arquivos e configure a URL/chave pública do Supabase para ativar contas e sincronização.');gateVisible(true);setSync('error','Nuvem não configurada');}
else{
 try{
  const mod=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm');
  client=mod.createClient(config.url.trim().replace(/\/$/,''),config.anonKey.trim(),clientOptions);
  client.auth.onAuthStateChange((event,session)=>{
   if(event==='PASSWORD_RECOVERY'){
    recoverySessionReady=true;
    setTimeout(showRecoveryForm,0);
   }
   if(event==='SIGNED_OUT'&&!recoveryMode)setTimeout(clearApp,0);
  });
  const {data:{session},error}=await client.auth.getSession();if(error)throw error;
  if(recoveryMode){
   recoverySessionReady=!!session;
   showRecoveryForm();
   if(!session)message('Aguardando validação do link. Se ele estiver expirado, solicite outro e-mail de recuperação.');
  }else if(session?.user)await startSession(session.user);
  else{gateVisible(true);setSync(null,'Aguardando login')}
 }catch(e){gateVisible(true);setSync('error','Conexão indisponível');message('Não foi possível iniciar a nuvem: '+(e.message||e))}
}
