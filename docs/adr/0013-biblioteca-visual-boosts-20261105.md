# ADR 0013 — Boosts na Biblioteca Visual, preservando controles existentes

**Situação:** biblioteca visual implementada; migração SQL de `boosts` aplicada no Supabase oficial em 09/11/2026 e validada. Atualização do catálogo de 65 nomes em 09/11/2026 preparada para homologação.

## Problema
A interface de pistas contém 11 boosts com nomes e atributos, mas as imagens do jogo não estão cadastradas. A tabela `public.gbr_card_images` e a política INSERT de `storage.objects` aceitam apenas `drivers` e `parts`, conforme inspeção de leitura do projeto oficial em 05/11/2026. Desenhos de IA não permitem identificação correta.

## Decisão proposta
Reutilizar o identificador de imagem existente `boosts|<nome normalizado>||` e a UI administrativa da Biblioteca Visual, sem nova tabela, fornecedor ou sincronização de estoque. Exibir os boosts do catálogo atual com opção de foto por administrador. Exigir confirmação do direito de uso para cada publicação de boost; impedir a publicação em massa de URLs herdadas para essa categoria. Os membros mantêm acesso somente à consulta. O domínio só usará imagens realmente cadastradas, com fallback `Sem foto`.

Proposta SQL separada: permitir `boosts` no CHECK de `gbr_card_images` e na política de INSERT de `storage.objects`. RLS, políticas de SELECT/UPDATE/DELETE, bucket, autenticação, limite de tamanho e formatos não mudam. Não aplicar sem teste negativo e aprovação específica para produção.

## Alternativas rejeitadas
- Incorporar imagens do AllClash: direitos de reutilização não demonstrados e potencial hotlink bloqueado.
- Criar catálogo/sistema paralelo no banco: duplicaria autenticação e autorização.
- Inserir fotos em base64/localStorage: cota, dados persistentes inconsistentes e ausência de compartilhamento.

## Segurança, regressão e portabilidade
A publicação deve ser validada no servidor por RLS e política do Storage, não por checkbox. O checkbox registra apenas uma declaração do editor, não demonstra titularidade. A consulta ao bucket é pública, portanto não conter dados privados nas imagens. Verificar autorização A/B/anônimo/admin em homologação e RLS; sem testes reais, status NÃO VERIFICADO.

## Rollback
Reverter frontend/Worker ao pacote anterior. Proposta de rollback SQL preserva dados e **aborta** se já existirem imagens de boosts publicadas; retirar dados requer aprovação, backup e procedimento específico. Compatível com camada de autorização no servidor independente de fornecedor no desenho futuro.

## Portão de escalabilidade
**ATENÇÃO:** +11 entradas no catálogo compartilhado, sem novas consultas por recomendação. `refreshRemote()` usa `.limit(1500)` e faz polling em 120 s; mudança não melhora sua escala. Métricas 10x e sincronização reais não verificadas.

## Revisão 05/11/2026 — URL de boost sem checkbox de atestação

Feedback da administração: a checkbox de declaração de direitos causava bloqueio de uso sem comprovar licenciamento. Foi removida por solicitação expressa. Mantém-se a orientação de cadastrar apenas conteúdo que possa ser compartilhado e, sobretudo, não se importam automaticamente imagens do AllClash.

Para não sugerir que uma URL foi publicada quando ainda não há suporte no banco, foi separada a ação de **salvar neste aparelho** (URL HTTPS previamente carregada pelo navegador) da ação explícita de **compartilhar com academia**, que ainda depende de admin, RLS e migração SQL aprovada. A prévia de URL acontece somente por ação do usuário; falha de carregamento bloqueia salvamento da URL em vez de registrar uma miniatura invisível. A URL local não contém a imagem e pode deixar de carregar caso o host a bloqueie depois.

Alternativa descartada: importar automaticamente os arquivos de imagem de sites terceiros; não há prova de licença ou de que o servidor autorize acesso externo. Rollback: restaurar `card-art.js`, `auditoria-imagens.js/html`, `index.html`, `boosts-plus.js` e `_worker.js` anteriores.


## Adendo — migração Supabase confirmada (09/11/2026)

Consulta read-only atual confirmou:
- `gbr_card_images_kind_check` aceita `drivers`, `parts` e `boosts`.
- Política `gbr_art_upload_admin` permite INSERT apenas a `authenticated` com `am_i_academy_admin()` e pasta `drivers/`, `parts/` ou `boosts/`.
- RLS continua ativo em `public.gbr_card_images` e `storage.objects`.
- Estado atual: 97 registros (68 drivers, 28 parts e 1 boost: `Ballast`). O objeto `boosts/ballast-cd9b941b-8251-41c6-8bf1-ea8ca3096928.webp` existe no bucket `gbr-card-art`, MIME `image/webp`, 5.648 bytes.
- Nenhuma alteração de política ou schema foi feita nesta etapa. A imagem de Ballast foi preservada.
