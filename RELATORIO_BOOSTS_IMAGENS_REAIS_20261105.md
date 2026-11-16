# GBR LAB 6 — Correção de imagens de boosts (05/11/2026)

## Objetivo e diagnóstico
O usuário rejeitou as miniaturas de IA geradas no pacote anterior porque não correspondem às cartas do F1 Clash. É uma falha de identificação visual, não de nome do catálogo.

## Fontes consultadas
- `engenheiro-de-segurança.txt` (regras, etapas 3/5/9): sem novas permissões, uploads ou dados privados.
- `arquiteto-de-software.txt` (portão e rollback): alteração restrita à UI, reversível.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` (seções 1–6): reutilizar a Biblioteca Visual.
- `persona-planejadora.txt` (critérios de parada): não mudar schema sem aprovação e testes.
- `REGRAS-DE-ORIGINALIDADE.txt` (1 e 5): sem artes de terceiros não autorizadas.
- Biblioteca do projeto: `01-protocolo-appsec.md`, `02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md` (requisitos de segurança, não regressão e validação).
- Levantamento do usuário `GBR_LAB_6_IMAGENS_BOOSTS_05NOV2026(1).md`: 59 URLs de terceiros, **sem licença verificada**.

## Prova adicional: Supabase (somente leitura)
Conexão Secundary, projeto `gkjqfirlcmmlhuokszlz`, `pg_constraint`: `gbr_card_images_kind_check = CHECK (kind = ANY (ARRAY['drivers','parts']))`. Leitura de constraints concluída sem dados pessoais; nenhuma alteração SQL. A tabela não permite `boosts` atualmente.

## Arquivos e alteração
- `gbr-boost-catalog.js`: remove mapeamento de 11 imagens inventadas; mantém IDs e stats.
- `boosts-plus.js`: função `boostArt()` reutiliza fonte `GBRCardArt` e fallback honesto, sem arte de IA, sem hotlink; `inventorySection()` e `suggestionsHTML()` permanecem.
- `card-art.js`: `getSource()` retorna `none` para boost ausente, sem gerar URL de piloto/peça. Mantém priorização de overrides válidos.
- `boosts-plus.css`: marcador neutro e responsivo.
- `index.html`: cache-busting `20261105boostreal1` nos quatro arquivos.
- `assets/boosts-original/*.webp`: removidas 11 ilustrações, intencionalmente.
- `tests/boost-art-link-20261105.test.js`, `tests/boosts-catalog-20261105.test.js`, `tests/boosts-real-images-20261105.test.js`: regressões ajustadas à fonte validada, sem testes fictícios.
- `_worker.js`: reempacotado com manifesto e hashes byte a byte.

## Limitações e etapa necessária
Não existem prints autênticos de boosts fornecidos nesta etapa. **Nenhuma imagem real nova está exibível até vincular ativos permitidos**. A publicação compartilhada exige migração do tipo no banco, análise de políticas e testes das contas A/B, anônima e administrador. Não executar alteração de schema por esta autorização visual.

## Portão de Escalabilidade: ATENÇÃO
Sem mudança de banco ou requisições externas por corrida. Renderização +1 lookup na mesma biblioteca em memória, sem guardar dados de garagem. Capacidade 10x não medida. Fallback de falha de imagem não altera cálculo.

## Rollback
Para retornar exatamente à versão imediatamente anterior, recuperar o ZIP `GBR_LAB_6_BOOSTS_IMAGENS_COMPLETO_05NOV2026.zip`. Para preservar o catálogo sem ilustrações, retornar a `GBR_LAB_6_BOOSTS_COMPLETO_05NOV2026.zip`. Sem migração de dados.

## Status dos testes
- **13/13 suítes executadas passaram:** `boost-art-link`, `boosts-catalog`, `boosts-real-images`, `colecoes-s12`, `duelos-rotacao`, `duelos-s9-ui`, `event-photos`, `eventos-las-vegas-catar`, `mega-auditoria`, `pit-wall`, `podium-global`, `sao-paulo-calendario`, `worker-events-smoke`.
- `node --check` aprovou **43 scripts JavaScript** na raiz.
- `tests/mega-worker-20261029.test.js` não executado devido ao limite de memória observado anteriormente, não conta como aprovado.
- Manifesto público de **198 recursos** validado por SHA-256 e bytes do Worker, com exclusão das 11 miniaturas fictícias.
- Não executado: renderização Safari/iPhone, testes de autorização de imagens, publicação/Cloudflare ou Supabase real por conta. Nenhum deploy ou migração.

