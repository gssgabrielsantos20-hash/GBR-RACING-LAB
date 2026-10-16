/* GBR Racing Lab — Mobile Premium 4.0. UI navigation + contextual Help/FAQ. No data writes. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const support={
 dashboard:{title:'Início · como usar',intro:'Acompanhe sua academia e entre nas ferramentas do GBR Racing Lab. O painel mostra um resumo do seu próprio cadastro.',steps:['Entre com sua conta ou use a demonstração local para conhecer o aplicativo.','Abra Minha garagem para registrar suas cartas e seus níveis reais.','Selecione Pistas, Montador, Duelos ou Baús. Em Mais, encontre Garagem e Equipes.']},
 event:{title:'Pistas · como usar',intro:'Consulte as prioridades orientativas dos circuitos, o desenho da pista e prepare estratégias usando os dados reais da sua corrida.',steps:['Escolha uma pista pela busca e selecione a série em que está jogando.','Confira as prioridades de carro e piloto e os traçados. Algumas informações são orientativas; confirme no jogo.','Informe as voltas da corrida e o desgaste real dos pneus para comparar os planos de box.']},
 builder:{title:'Montador · como usar',intro:'O Montador Completo combina peças, dois pilotos e recomendações de boosts conforme o circuito selecionado.',steps:['Marque as peças e os pilotos que realmente possui em Minha garagem.','Escolha a pista e a série ou mantenha um perfil de carro manual. A dupla de pilotos pode ser automática ou escolhida por você.','Calcule e confira o resultado. Salve o setup para consultar depois ou exporte o PNG para compartilhar.']},
 favorites:{title:'Meus setups · como usar',intro:'Guarde até oito composições pessoais do carro e da dupla de pilotos, mesmo misturando séries.',steps:['Em Minha garagem, marque as peças e os pilotos que possui.','Abra Mais > Meus setups e crie um favorito, escolhendo seis peças, bateria opcional e dois pilotos diferentes.','Dê um nome, registre a pista e suas observações. Use Ver setup, Editar ou PNG para consultar depois. Espere a sincronização antes de mudar de aparelho.']},
 duel:{title:'Duelos · como usar',intro:'Compare as peças e os pilotos elegíveis para sua série. A sugestão depende dos dados inseridos na garagem.',steps:['Cadastre pelo menos dois pilotos e as peças que você possui.','Selecione a série e os atributos importantes para a corrida.','Calcule o carro e a dupla indicados. Confira boosts, condições e pistas dentro do jogo.']},
 chests:{title:'Baús · como usar',intro:'Controle a sequência de 240 posições. O app não lê automaticamente as vitórias do F1 Clash; você registra o progresso.',steps:['Selecione sua série e informe as vitórias totais e as vitórias de GP. Apenas vitórias de duelo avançam a sequência.','Use +1 Duelo após vencer ou ajuste a posição se já souber qual baú recebeu.','No Localizador, marque os baús anteriores para identificar possíveis posições. Confira e confirme antes de corrigir.']},
 garage:{title:'Garagem · como usar',intro:'A garagem é individual. O cadastro por print permite criar pilotos e peças sem alterar a tabela tradicional.',steps:['Toque em Importar print e selecione o tipo de carta, ou use a detecção automática.','Confira a leitura e corrija nome, raridade, nível, série e atributos antes de salvar. Lendário e Edição especial estão disponíveis.','As cartas permanecem na tabela padrão. Confira o estado de sincronização antes de trocar de aparelho.']},
 academy:{title:'Equipes · como usar',intro:'O perfil conecta seu nome de jogador à academia. A equipe é atribuída pela administração.',steps:['Faça seu cadastro, entre na academia com o código de convite e informe seu nome no F1 Clash.','Acompanhe a equipe atribuída pelo administrador.','Sua garagem e suas preferências continuam individuais, mesmo quando outros pilotos estão na mesma equipe.']},
 login:{title:'Conta · como usar',intro:'Entre ou crie sua conta no GBR Racing Lab. Não informe sua senha a outros pilotos ou administradores.',steps:['Para criar uma conta, use um e-mail seu e defina uma senha segura.','Se esqueceu a senha, toque em Esqueci minha senha para receber o link por e-mail.','Após entrar, verifique o status de sincronização. Para testar sem conta, escolha Demonstração local (não sincroniza).']}
};
support.notices={title:'Central de Avisos · como usar',intro:'Veja comunicados e notícias da academia. Administradores podem publicar, editar e fixar mensagens.',steps:['Abra Avisos no menu principal ou em Mais no iPhone.','Filtre por Atualização, Academia, Evento GP, Manutenção ou Dica.','Marque as mensagens lidas. Se você for administrador, toque em Publicar aviso para cadastrar notícias e comunicados.','Em modo demonstração, os avisos ficam apenas no navegador; para compartilhar com a academia é necessária a migração Supabase da versão 5.2.']};
support['gp-events']={title:'Eventos de GP · como usar',intro:'Monte setups para eventos temporários com regras de categoria, pistas limitadas e +10% nas cartas destacadas.',steps:['Abra Pistas > Eventos de GP e escolha o evento pelo cartaz.','Selecione Júnior, Competidor, Contendor ou Campeão para restringir as cartas elegíveis à série máxima.','Toque numa das pistas do evento e confira o carro, a dupla de pilotos, as cartas com +10% e as restrições de raridade.','Use Exportar setup PNG para guardar a estratégia. Os bônus são temporários e não alteram sua garagem.']};
const faq=[
 {areas:['gp-events'],q:'Como funcionam os +10% dos eventos?',a:'O GBR aplica uma simulação de +10% aos atributos-base das cartas destacadas durante o cálculo e não modifica seus dados no Supabase. O pit stop não é tratado como atributo aumentado.'},
 {areas:['gp-events'],q:'Por que um piloto lendário não aparece no GP dos Estados Unidos?',a:'Esse GP não permite pilotos Lendários. O Nightmare Fuel permite Lendários. Edições Especiais são permitidas nos dois eventos; cartas acima do limite da categoria também ficam de fora.'},
 {areas:['gp-events'],q:'As sete pistas indicam a ordem das corridas?',a:'Não. Os anúncios fornecem apenas pistas possíveis, não a ordem de cada rodada. Confira calendário e previsão de chuva no jogo antes de definir pneus e stints.'},
 {areas:['gp-events'],q:'O que significam Ghoulfuel e Eagle?',a:'São os bônus de evento informados nos anúncios. O nome é mostrado na estratégia, mas seu efeito numérico não foi presumido no cálculo; confirme os atributos no jogo.'},

 {areas:['chests'],q:'Como descobrir minha posição na sequência de baús?',a:'Abra Baús > Localizador. Registre os tipos de baús recebidos na ordem correta, examine as posições possíveis e confirme somente quando estiver seguro. Também é possível ajustar a posição manualmente.'},
 {areas:['chests'],q:'As vitórias de GP avançam a sequência?',a:'Não. O progresso de baús usa as vitórias de duelo. Informe o total de vitórias e as vitórias de GP separadamente, para descontá-las do avanço.'},
 {areas:['chests'],q:'A sequência de baús vale para todas as séries?',a:'A sequência compartilhada pela academia foi conferida na Série 12. Outras séries podem ter alterações; antes de confiar nas previsões, confirme a sequência exibida no seu jogo.'},
 {areas:['chests'],q:'Como corrigir uma vitória registrada por engano?',a:'Use as ferramentas de correção ou desfazer disponíveis em Baús e confira o histórico. Para calibrar, use Sei em qual baú estou. As alterações devem ser sincronizadas com sua conta.'},
 {areas:['chests'],q:'As imagens dos baús são oficiais?',a:'O GBR preserva as imagens originais de baús fornecidas na atualização anterior: Verde, Dourado, Platina e Lendário. O novo design muda apenas os cards e espaçamentos.'},
 {areas:['event'],q:'Os desenhos das pistas são iguais aos traçados do jogo?',a:'A biblioteca apresenta 24 circuitos com traçados vetoriais e referências da academia. Prioridades, voltas e disponibilidade podem variar conforme a série, evento e atualização do F1 Clash.'},
 {areas:['event'],q:'Por que devo informar as voltas e o desgaste dos pneus?',a:'Esses números variam entre séries e eventos. O aplicativo usa os valores que você observa no jogo para montar alternativas de 0, 1 ou 2 paradas, evitando estratégias inventadas.'},
 {areas:['builder','event','duel'],q:'Como montar o melhor setup?',a:'Primeiro marque na garagem as peças e pilotos que realmente possui, com níveis e atributos corretos. Depois selecione a série e o perfil desejado. As sugestões são cálculos de comparação e não garantem vitória.'},
 {areas:['notices'],q:'Os avisos são enviados automaticamente como push no iPhone?',a:'Não. A Central de Avisos funciona dentro do aplicativo; a versão 5.2 não envia push do iOS. Publicações reais exigem a tabela protegida no Supabase.'},
 {areas:['garage'],q:'Como excluir uma carta duplicada?',a:'Use a ação Excluir ao lado da carta na Minha garagem. Revise a confirmação; a exclusão será salva apenas na sua conta e impede que versões antigas do catálogo recriem a carta.'},
 {areas:['garage'],q:'Posso importar um piloto ou uma peça por print?',a:'Sim. Em Minha garagem, toque em Importar print. O reconhecimento do texto da imagem ocorre no navegador quando o serviço de leitura está disponível. Revise sempre todos os atributos antes de salvar; se a leitura falhar, use a criação manual.'},
 {areas:['garage'],q:'Os pilotos antigos mudam para cards com fotos?',a:'Não. Os dados e a visualização padrão continuam como antes. O print aparece apenas na revisão da importação e não é enviado junto com os dados da garagem.'},
 {areas:['garage','builder'],q:'Como cadastrar Lendário ou Edição especial?',a:'Abra Importar print ou a edição da carta. Selecione Lendário ou Edição especial na raridade. Insira os atributos exatos que aparecem no jogo; essas cartas não fazem parte de todas as tabelas de referência.'},
 {areas:['builder'],q:'Como exportar meu setup como PNG?',a:'Abra o Montador, escolha a pista e os pilotos e calcule a composição. Toque em Exportar PNG. No iPhone, use Compartilhar para salvar nas Fotos quando disponível; no PC, baixe o arquivo PNG.'},
 {areas:['event','builder'],q:'As recomendações de boosts indicam um item oficial?',a:'Não necessariamente. O GBR mostra efeitos estratégicos sugeridos para o carro, piloto e pneus. Confira quais boosts reais estão disponíveis na sua coleção antes de usar.'},
 {areas:['garage','builder'],q:'Como preencher os atributos de uma carta?',a:'Ao selecionar o nível de uma carta com referência disponível, o GBR preenche os atributos. Se a referência não existir, insira os valores mostrados no seu jogo e confira antes de salvar.'},
 {areas:['academy'],q:'Quem define minha equipe?',a:'A administração da academia atribui a equipe. O nome de jogador do F1 Clash identifica seu perfil, mas não substitui seu login por e-mail.'},
 {areas:['login'],q:'Como recuperar meu acesso?',a:'Use Esqueci minha senha na tela de entrada. Informe seu e-mail e abra o link de recuperação enviado. Verifique também a pasta de spam.'},
 {areas:['login','garage','chests'],q:'Meus dados sincronizam no iPhone e no computador?',a:'Sim, quando ambos usam a mesma conta e o salvamento na nuvem é concluído. Espere o indicador de sincronização antes de abrir ou alterar dados em outro aparelho. A demonstração local não sincroniza.'},
 {areas:['login','dashboard'],q:'Como instalar o GBR Racing Lab no iPhone?',a:'Abra o site no Safari, toque em Compartilhar e escolha Adicionar à Tela de Início. A opção pode variar conforme a versão do iOS. No Android, procure Instalar app ou Adicionar à tela inicial no menu do navegador.'},
 {areas:['dashboard','login'],q:'Como alterar meu nome no aplicativo?',a:'Abra Mais > Equipes e atualize o nome do jogador no perfil. Isso não altera o seu e-mail de login nem as cartas da garagem.'},
 {areas:['favorites'],q:'Posso salvar cartas de séries diferentes?',a:'Sim. Os favoritos não aplicam restrição de série: escolha qualquer peça e piloto que marcou como seu. Os valores ficam registrados como estavam no momento em que salvou.'},
 {areas:['favorites'],q:'Meus favoritos são visíveis para toda a academia?',a:'Não. Eles ficam dentro da garagem pessoal da sua conta e seguem as mesmas regras de sincronização e privacidade. O modo demonstração não sincroniza.'},
 {areas:['garage','login'],q:'O que fazer em caso de conflito de sincronização?',a:'Evite editar a garagem em dois aparelhos ao mesmo tempo. Se houver aviso de conflito, exporte um backup antes de escolher entre carregar a nuvem ou enviar sua versão atual.'}
];
let returnFocus=null;let current='dashboard';
function activeArea(){
 if(!$('accessGate')?.classList.contains('hide')) return 'login';
 const tab=document.querySelector('.tab:not(.hide)');
 if(tab?.id==='event'&&document.getElementById('gbrEventHub')&&!document.getElementById('gbrEventHub').hidden)return 'gp-events';
 return tab?.id&&support[tab.id]?tab.id:'dashboard';
}
function renderHelp(){
 current=activeArea();const data=support[current];
 $('helpTitle').textContent=data.title;$('helpIntro').textContent=data.intro;
 const steps=$('helpSteps');steps.replaceChildren();
 data.steps.forEach((step,i)=>{const el=document.createElement('div');el.className='help-step';const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');const p=document.createElement('p');p.textContent=step;el.append(n,p);steps.append(el)});
 renderFaq();
}
function renderFaq(){
 const filter=($('helpSearch').value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
 const list=faq.filter(x=>(x.areas.includes(current)||filter)&&(x.q+' '+x.a).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').includes(filter));
 const target=$('helpFaq');target.replaceChildren();$('helpFaqCount').textContent=`${list.length} respostas`;
 if(!list.length){const empty=document.createElement('p');empty.className='help-empty';empty.textContent='Nenhum resultado. Tente outra palavra ou consulte o guia acima.';target.append(empty);return}
 list.forEach(x=>{const det=document.createElement('details');det.className='help-item';const summary=document.createElement('summary');summary.textContent=x.q;const ans=document.createElement('p');ans.textContent=x.a;det.append(summary,ans);target.append(det)});
}
function openHelp(ev){
 closeMore();returnFocus=ev?.currentTarget||document.activeElement;
 $('helpSearch').value='';renderHelp();$('helpOverlay').hidden=false;$('helpOverlay').setAttribute('aria-hidden','false');document.body.classList.add('gbr-help-open');$('helpClose').focus();
}
function closeHelp(){
 $('helpOverlay').hidden=true;$('helpOverlay').setAttribute('aria-hidden','true');document.body.classList.remove('gbr-help-open');
 if(returnFocus&&returnFocus.isConnected){returnFocus.focus({preventScroll:true})}returnFocus=null;
}
function setMoreActive(){
 const open=!$('mobileMorePanel').hidden;
 const tab=activeArea();
 const active=['builder','favorites','garage','academy'].includes(tab)||open;
 $('mobileMoreBtn').classList.toggle('active',active);
 $('mobileMoreBtn').setAttribute('aria-expanded',String(open));
}
function openMore(){
 $('mobileMorePanel').hidden=false;$('mobileMoreBackdrop').hidden=false;setMoreActive();$('mobileMoreClose').focus();
}
function closeMore(){
 $('mobileMorePanel').hidden=true;$('mobileMoreBackdrop').hidden=true;setMoreActive();
}
function toggleMore(){ $('mobileMorePanel').hidden?openMore():closeMore() }
$('openHelp')?.addEventListener('click',openHelp);
$('openLoginHelp')?.addEventListener('click',openHelp);
$('helpClose')?.addEventListener('click',closeHelp);
$('helpUnderlay')?.addEventListener('click',closeHelp);
$('helpSearch')?.addEventListener('input',renderFaq);
$('mobileMoreBtn')?.addEventListener('click',toggleMore);
$('mobileMoreClose')?.addEventListener('click',()=>{closeMore();$('mobileMoreBtn').focus()});
$('mobileMoreBackdrop')?.addEventListener('click',closeMore);
$('mobileHelpFromMore')?.addEventListener('click',openHelp);
$('mobileMorePanel')?.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>{closeMore();setTimeout(setMoreActive,0)}));
$('mobileNav')?.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>{closeMore();setTimeout(setMoreActive,0)}));
$('nav')?.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>setTimeout(setMoreActive,0)));
const title=$('pageName');if(title)new MutationObserver(setMoreActive).observe(title,{childList:true,subtree:true,characterData:true});
document.addEventListener('keydown',ev=>{
 if(ev.key==='Escape'){
   if(!$('helpOverlay').hidden){ev.preventDefault();closeHelp();return}
   if(!$('mobileMorePanel').hidden){ev.preventDefault();closeMore();$('mobileMoreBtn').focus()}
 }
 if(ev.key==='Tab'&&!$('helpOverlay').hidden){
   const focusable=Array.from($('helpOverlay').querySelectorAll('button,input,summary,[tabindex="0"]')).filter(el=>el.getClientRects().length);
   if(!focusable.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}
   else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}
 }
});
// Lightweight immutable-test surface; no access to garage or authentication data.
window.GBRMobileHelp={open:()=>openHelp(),close:closeHelp,area:activeArea,faqCount:faq.length};
})();
