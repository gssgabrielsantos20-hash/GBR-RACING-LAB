# ADR 0012 — Catálogo local de referência para Boosts (05/11/2026)

## Contexto
A base publica tipos de efeito, mas não reconhece o estoque do jogador. O levantamento GBR LAB 6 identifica fontes com nomes e atributos parciais. Não há autorização para copiar rankings externos, criar novas tabelas ou mudar o Montador.

## Decisão
Criar `gbr-boost-catalog.js` como módulo de **referência pública parcial**, com atributos por nome, URLs de origem e data de revisão. Uso exclusivo no módulo existente `boosts-plus.js`, sem gravação em garagem, Supabase ou IA. Quantidade desconhecida é `null`, zero é ausência informada; consumo de um piloto = 1 + paradas. Excluir itens com atributos contraditórios da classificação até conferência no jogo. Calcular ordenação exploratória local com pesos declarados no código, sem garantia de desempenho. Manter orientação antiga por tipo de efeito como fallback.

## Alternativas rejeitadas
- Scraping em cada consulta: fragilidade, custo e dependência externa.
- Copiar ranking do AllClash: não considera inventário real nem regras do GBR.
- Salvar inventário na garagem sem esquema/testes de autorização: impacto indevido em privacidade e sincronização.

## Reversibilidade, escala e revisão
Mudança reversível: restaurar `index.html`, `boosts-plus.*` e o Worker do ZIP anterior, remover `gbr-boost-catalog.js`. Sem migração de banco. Dados do catálogo crescem linearmente com novos itens; sem chamadas de rede, cache privado ou estado multiusuário no servidor. Revisar ao confirmar valores em print do jogo e se o número de itens prejudicar a renderização móvel. Benchmark de carga 10x não executado.

## Adendo — miniaturas ilustrativas por ID (05/11/2026)
- Para o catálogo de 11 boosts, cada `id` está associado explicitamente ao seu arquivo WebP local em `assets/boosts-original/`. Os arquivos foram recortados de arte original criada para este aplicativo, **não** das imagens oficiais do jogo ou do AllClash.
- `boosts-plus.js` usa o mesmo campo `imageSrc` em cada cartão e no resumo da recomendação, sem depender da posição ou do filtro; quando a imagem falha, o texto/monograma continua legível.
- A lista de 59 links externos permanece apenas em `docs/references/boost-imagens-externas-pendentes-20261105.json` para auditoria e eventual conferência de licença. Nenhum URL externo é exibido automaticamente ou armazenado na garagem.
- Custos: ~80 KB adicionais de imagens WebP; renderização sem API extra e com carregamento sob demanda. Riscos residuais: testar carregamento e largura em Safari real; imagens ilustrativas não devem ser confundidas com cartas oficiais.
- **Reversão:** restaurar `index.html`, `gbr-boost-catalog.js`, `boosts-plus.js` e `.css`, e o Worker do ZIP `GBR_LAB_6_BOOSTS_DEPLOY_05NOV2026.zip`; excluir as 11 imagens novas. Sem migração de dados.

## Adendo corretivo — 05/11/2026: imagens inventadas substituídas
- O próprio usuário identificou que as miniaturas ilustrativas não permitiam reconhecer boosts do jogo. O recurso foi revertido: os 11 `assets/boosts-original/*.webp` foram retirados do pacote e `imageSrc` permanece `null` até haver imagens reais autorizadas.
- `boosts-plus.js` agora consulta `GBRCardArt.getSource({name,rarity:'',editionLabel:''},'boosts')` e aceita, futuramente, arquivos locais auditados sob `assets/boosts-game/`. Quando a imagem está ausente, apresenta `Sem foto`, sem ícone inventado.
- Verificação somente leitura no projeto oficial Supabase `gkjqfirlcmmlhuokszlz` confirmou que `gbr_card_images_kind_check` admite **apenas** `drivers` e `parts`. Não foi feita migração; uploads de boosts compartilhados estão **bloqueados** até aprovação separada, migração e testes RLS/Storage. A implementação de leitura é futura e não afirma que imagens compartillhadas de boost já existem.
- Os 59 URLs externos permanecem apenas como inventário de proveniência, sem publicação/cópia/hotlink. A ativação de imagens reais requer capturas do próprio usuário ou licença apropriada.
- Reversão: restaurar o ZIP `GBR_LAB_6_BOOSTS_IMAGENS_COMPLETO_05NOV2026.zip` (com ilustrações) apenas se for aprovado, ou retornar à base `GBR_LAB_6_BOOSTS_COMPLETO_05NOV2026.zip` (sem arte). Nenhum estado de conta/garagem foi alterado.


## Adendo — catálogo visual ampliado (09/11/2026)

- `GBRBoostCatalog.items` continua com os 11 itens usados pelo motor de recomendação; atributos, pesos, ranking e cálculo não mudam.
- `GBRBoostCatalog.visualItems` passa a conter os 65 nomes distintos da aba `Boosts` da planilha do usuário, sem filtro por GP/série.
- URLs de imagem do AllClash ficam apenas em metadados de auditoria; não são carregadas como `<img>`, copiadas ou enviadas ao Supabase. Segue válida a regra do ADR 0015.
- A Biblioteca Visual usa o mesmo `GBRCardArt` para fotos locais/compartilhadas e mantém `Sem foto` quando não houver imagem cadastrada.
- Rollback: restaurar `gbr-boost-catalog.js`, `auditoria-imagens.js/html`, `boosts-plus.js/css`, `card-art.js`, `index.html` e `_worker.js` do pacote anterior. Sem mudança de banco nesta etapa.
