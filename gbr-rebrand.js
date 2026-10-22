/* GBR Racing Lab · Rebranding UX de homologação — somente apresentação.
   Preserva data-tab, IDs de formulários, handlers, autenticação e sincronização. */
(function () {
  'use strict';

  const VIEWS = Object.freeze({
    dashboard: {
      title:'Painel inicial', nav:'Início', navHint:'Seu próximo passo', icon:'painel',
      kicker:'SUA CENTRAL DE CORRIDA', lead:'Organize a próxima disputa sem perder tempo procurando ferramentas.',
      steps:['Atualize sua garagem','Consulte a pista','Monte seu setup'], action:'Abrir minha garagem', go:'garage'
    },
    builder: {
      title:'Monte seu carro ideal', nav:'Montar carro', navHint:'Peças e pilotos', icon:'montador',
      kicker:'ETAPA 02 · PREPARE O CARRO', lead:'Escolha a prioridade da corrida, confira a série e calcule a melhor combinação disponível.',
      steps:['Escolha o perfil','Confira a série','Calcule o setup'], action:'Configurar meu setup', focus:'preset'
    },
    raceLearning: {
      title:'Aprenda com suas corridas', nav:'Analisar corridas', navHint:'Resultados e tendências', icon:'inteligencia',
      kicker:'INTELIGÊNCIA GBR · DADOS REAIS', lead:'Registre a corrida, compare carros e pilotos e descubra padrões no seu próprio histórico.',
      steps:['Selecione a corrida','Revise os dados','Salve para comparar'], action:'Registrar uma corrida', focus:'rlSeries'
    },
    favorites: {
      title:'Guarde suas melhores combinações', nav:'Meus setups', navHint:'Favoritos salvos', icon:'meus-setups',
      kicker:'SEU BOX · CONFIGURAÇÕES FAVORITAS', lead:'Tenha as combinações já aprovadas por você à mão antes de entrar no duelo.',
      steps:['Crie ou importe','Revise suas cartas','Consulte antes de correr'], action:'Criar um setup favorito', focus:'favNew'
    },
    event: {
      title:'Escolha a pista, defina a estratégia', nav:'Pistas e eventos', navHint:'Circuitos e pneus', icon:'pistas',
      kicker:'ETAPA 01 · CONHEÇA O CIRCUITO', lead:'Busque a pista e veja prioridades, pneus e planejamento antes de escolher as peças.',
      steps:['Busque o circuito','Confira as prioridades','Planeje seus pneus'], action:'Encontrar uma pista', focus:'trackSearch'
    },
    duel: {
      title:'Planeje seu próximo duelo', nav:'Assistente de duelos', navHint:'Estratégia de corrida', icon:'duelos',
      kicker:'CORRIDA RÁPIDA · DECISÕES MAIS CLARAS', lead:'Informe a série e a característica da pista para receber uma orientação estratégica.',
      steps:['Informe a série','Escolha a prioridade','Gere a recomendação'], action:'Preparar um duelo', focus:'duelSeries'
    },
    chests: {
      title:'Acompanhe as próximas recompensas', nav:'Baús', navHint:'Progresso e prêmios', icon:'baus',
      kicker:'SEU PROGRESSO · SEQUÊNCIA DE BAÚS', lead:'Registre duelos e GPs sem confundir vitórias com a posição dos baús.',
      steps:['Confira a posição','Registre as vitórias','Veja os próximos baús'], action:'Ver meu progresso', focus:'chestTotalWins'
    },
    garage: {
      title:'Mantenha sua garagem atualizada', nav:'Minha garagem', navHint:'Seu inventário', icon:'garagem',
      kicker:'ETAPA 00 · ORGANIZE SUAS CARTAS', lead:'Cadastre suas peças e seus pilotos antes de calcular setups; só as cartas marcadas como suas entram no montador.',
      steps:['Pesquise suas cartas','Revise níveis e atributos','Use no montador'], action:'Buscar uma carta', focus:'garageSearch'
    },
    academy: {
      title:'Seu perfil e sua equipe', nav:'Minha equipe', navHint:'Academia e perfil', icon:'equipes',
      kicker:'CONTA · IDENTIDADE DO JOGADOR', lead:'Consulte seu vínculo na academia e mantenha o nome do jogo atualizado sem expor sua garagem.',
      steps:['Confira a equipe','Atualize o apelido','Salve o perfil'], action:'Editar meu nome', focus:'profileNickname'
    },
    notices: {
      title:'Novidades sem perder o foco', nav:'Avisos', navHint:'Comunicados da equipe', icon:'avisos',
      kicker:'CENTRAL DE INFORMAÇÕES', lead:'Acompanhe mudanças no aplicativo, avisos da academia e eventos em um único lugar.',
      steps:['Filtre o assunto','Leia as novidades','Marque como lido'], action:'Filtrar avisos', focus:'gbrNoticeFilter'
    }
  });

  function node(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function goTo(tab) {
    const nav = document.querySelector('#nav button[data-tab="' + tab + '"]');
    if (nav) nav.click();
    const more = document.getElementById('mobileMorePanel');
    if (more && !more.hidden) {
      const close = document.getElementById('mobileMoreClose');
      if (close) close.click();
    }
    const root = document.getElementById(tab);
    if (root) root.scrollIntoView({ block:'start', behavior:'auto' });
  }

  function navigateOrFocus(info) {
    if (info.go) { goTo(info.go); return; }
    const control = document.getElementById(info.focus);
    if (!control) return;
    control.scrollIntoView({ block:'center', behavior:'smooth' });
    if (typeof control.focus === 'function') {
      try { control.focus({preventScroll:true}); } catch (_e) { control.focus(); }
    }
  }

  // A preferência fica no navegador, separada por menu e sem dados pessoais.
  function savedGuideState(key) {
    try { return localStorage.getItem('gbr-guide-expanded-v1:' + key) === '1'; }
    catch (_error) { return false; } // armazenamento privado/bloqueado: iniciar recolhido
  }

  function buildGuide(key, info) {
    const section = node('section','gbr-ux-guide');
    section.setAttribute('aria-label','Orientações para ' + info.nav);
    section.dataset.gbrUxGuide = key;
    const header = node('div','gbr-ux-guide-top');
    const summary = node('div','gbr-ux-guide-main');
    summary.appendChild(node('span','gbr-ux-eyebrow',info.kicker));
    const heading = node('div','gbr-ux-guide-heading');
    const img = node('img','gbr-ux-module-icon');
    img.src = 'assets/gbr-brand/icons/' + info.icon + '.svg';
    img.alt = '';
    img.setAttribute('aria-hidden','true');
    heading.appendChild(img);
    heading.appendChild(node('h2','',info.title));
    summary.appendChild(heading);

    const details = node('div','gbr-ux-guide-details');
    details.id = 'gbr-ux-guide-details-' + key;
    const lead = node('div','gbr-ux-guide-intro');
    lead.appendChild(node('p','gbr-ux-lead',info.lead));
    details.appendChild(lead);

    const action = node('button','gbr-ux-action',info.action);
    action.type = 'button';
    action.setAttribute('aria-label',info.action);
    action.addEventListener('click',function(){navigateOrFocus(info);});
    action.appendChild(node('span','gbr-ux-arrow','→'));
    const steps = node('ol','gbr-ux-steps');
    info.steps.forEach(function(step,index){
      const li=node('li','');
      li.appendChild(node('span','gbr-ux-step-number',String(index+1).padStart(2,'0')));
      li.appendChild(node('span','',step));
      steps.appendChild(li);
    });
    const side = node('div','gbr-ux-guide-side');
    side.appendChild(node('span','gbr-ux-side-label','COMO USAR ESTE MENU'));
    side.appendChild(steps);
    side.appendChild(action);
    details.appendChild(side);

    const toggle = node('button','gbr-ux-guide-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-controls',details.id);
    const label = node('span','gbr-ux-toggle-text');
    const chevron = node('span','gbr-ux-chevron');
    chevron.setAttribute('aria-hidden','true');
    chevron.textContent = '⌄';
    toggle.append(label,chevron);
    function setExpanded(expanded, remember) {
      toggle.setAttribute('aria-expanded',String(expanded));
      label.textContent = expanded ? 'Ocultar orientações' : 'Mostrar orientações';
      details.hidden = !expanded;
      section.classList.toggle('is-collapsed',!expanded);
      if (remember) {
        try { localStorage.setItem('gbr-guide-expanded-v1:' + key,expanded?'1':'0'); }
        catch (_error) { /* a função continua mesmo em navegação privada */ }
      }
    }
    toggle.addEventListener('click',function(){
      setExpanded(toggle.getAttribute('aria-expanded')!=='true',true);
    });
    header.append(summary,toggle);
    section.append(header,details);
    setExpanded(savedGuideState(key),false);
    return section;
  }

  function upgradeNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const groups = {'dashboard':'VISÃO GERAL','builder':'ESTRATÉGIA DE CORRIDA','garage':'MINHA ÁREA'};
    nav.querySelectorAll('button[data-tab]').forEach(function(button){
      const key=button.dataset.tab, info=VIEWS[key];
      if (!info) return;
      if (groups[key]) {
        const label=node('div','gbr-ux-nav-group',groups[key]);
        nav.insertBefore(label,button);
      }
      const spans=button.querySelectorAll(':scope > span');
      const textSpan=spans.length>1?spans[spans.length-1]:null;
      if (textSpan){
        // Preserve the *original* unread-notice marker and its hidden state.
        // notices.js updates this live node, so never replace it with plain text.
        const noticeDot=textSpan.querySelector('.gbr-nav-notice-dot');
        const title=node('span','gbr-ux-nav-title',info.nav);
        if (noticeDot){
          title.appendChild(document.createTextNode(' '));
          title.appendChild(noticeDot);
        }
        textSpan.classList.add('gbr-ux-nav-copy');
        textSpan.replaceChildren(title,node('small','gbr-ux-nav-hint',info.navHint));
      }
      button.setAttribute('aria-label',info.nav + ' — ' + info.navHint);
      button.title=info.navHint;
    });
    document.querySelectorAll('#mobileMorePanel button[data-go]').forEach(function(button){
      const info=VIEWS[button.dataset.go];if(!info)return;
      const title=button.querySelector('b'), hint=button.querySelector('small');
      if(title)title.textContent=info.nav;
      if(hint)hint.textContent=info.navHint;
    });
  }

  function setupTabs() {
    Object.keys(VIEWS).forEach(function(key){
      const section=document.getElementById(key), info=VIEWS[key];
      if (!section || section.querySelector('[data-gbr-ux-guide]'))return;
      const guide=buildGuide(key,info);
      if (key==='dashboard') {
        const hero=section.querySelector(':scope > .hero');
        if(hero)hero.insertAdjacentElement('afterend',guide);
        else section.insertBefore(guide,section.firstChild);
      } else section.insertBefore(guide,section.firstChild);
    });
  }

  function refineLogin() {
    const card=document.querySelector('#accessGate .auth-card');
    if(!card||card.querySelector('.gbr-ux-login-helper'))return;
    const helper=node('div','gbr-ux-login-helper');
    const badge=node('span','gbr-ux-login-dot','✓');
    badge.setAttribute('aria-hidden','true');
    helper.appendChild(badge);
    helper.appendChild(node('span','', 'Seu box particular: estratégias, setups e garagem em um só lugar.'));
    const form=card.querySelector('#authForm');
    if(form)card.insertBefore(helper,form);
  }

  function run() {
    if (document.documentElement.dataset.gbrUxReady) return;
    document.documentElement.dataset.gbrUxReady='1';
    upgradeNav();setupTabs();refineLogin();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
