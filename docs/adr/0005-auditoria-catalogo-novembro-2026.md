# ADR 0005 — Auditoria do catálogo, visuais e calendário de novembro de 2026

**Status:** pacote candidato para homologação (29/10/2026).

## Contexto
A base do GP México tinha 53 peças, 110 registros de piloto, 19 peças sem referência visual e 11 pilotos sem imagem, com três coleções separadas. Novos eventos de novembro foram informados oficialmente pelo usuário. As sete peças S12 têm apenas nível 1 confirmado.

## Decisão
- Preservar catálogo e migração por identidade/edição; incluir Rubens Barrichello lendário por anúncio oficial informado pelo usuário, sem presumir posse ou números.
- Acrescentar URLs externas presentes no índice público do AllClash somente para cartas identificadas; fotos do usuário (Biblioteca Visual) mantêm prioridade.
- Central de Eventos recebe quatro calendários de novembro. São Paulo e Bigodes têm banners oficiais fornecidos, reforços, +10%, pista e permissão; Las Vegas e Catar ficam sem elegibilidade/setups quando regras não foram divulgadas. Números de ordem são omitidos para listas sem ordem.
- `_worker.js` incorpora apenas 177 ativos públicos; testes/ADR/manifestos não entram em rotas HTTP.

## Alternativas rejeitadas
Preencher estatísticas de níveis S12 usando séries interpoladas (não comprovadas); reutilizar foto de piloto de outra edição; criar ordem de corridas inexistente; gravar dados pessoais no app ou Supabase; mover lógica de catálogo para banco.

## Segurança, custo e reversibilidade
Mudanças estáticas e localizadas. Não altera `config.js`, `cloud.js`, RLS, auth ou dados persistentes. Custos de inicialização O(n) em catálogo pequeno; um lançamento pode disparar chamadas HTTPS de imagens externas (já parte da arquitetura). Alteração reversível por reimplantar o último ZIP validado, sem migração SQL. A UI deve ser homologada em iPhone/PC após deploy de prévia.

## Riscos pendentes
Imagem do Barrichello individual não verificada; fotos remotas podem falhar; números S12 níveis superiores desconhecidos; teste de login real, rede e browser local não executados por bloqueio do ambiente; vídeo AzzaW inacessível (YouTube 401). Revisar assim que houver dados autoritativos.
