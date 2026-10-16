# GBR Racing Lab 5.5.2 — Atalhos de rotação dos Duelos

**Objetivo:** tornar clicáveis as pistas da rotação das Séries 10, 11 e 12, encaminhando diretamente à análise da Biblioteca de Pistas.

## Funcionamento
- Clique/toque em qualquer pista da rotação de Duelos.
- O app abre a aba **Pistas → Biblioteca de pistas**, mesmo se Eventos GP foi a última subaba aberta.
- A pista escolhida é selecionada automaticamente e a análise correspondente fica visível.
- A Série da Biblioteca de Pistas passa a coincidir com a Série do Duelo.
- Os filtros de busca e prioridade são limpos para que a pista não fique oculta.
- No iPhone, os cartões têm alvos de toque amplos; no PC, há foco visível e navegação por teclado.

## Isolamento
Nenhuma tabela, conta, garagem, baú, evento de GP, cálculo de estratégia ou sincronização Supabase foi modificada. O aplicativo permanece na mesma página; o atalho não faz login nem envia dados.

## Arquivos modificados
`app.js`, `events-gp.js`, `gbr-intelligence.js`, `gbr-intelligence.css`, `index.html`, `_worker.js`.

## Publicação
Pacote pronto para upload Cloudflare Pages, preferencialmente na branch de testes antes da `main`. A publicação não foi executada por este procedimento.
