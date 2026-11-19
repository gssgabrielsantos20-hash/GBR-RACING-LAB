# ADR 0021 — Sincronização reprodutível do payload do `_worker.js` (18/11/2026)

**Status:** incorporado ao pacote de homologação; não publicado.

## Contexto
O `_worker.js` responde todas as rotas a partir de um mapa embutido (gzip + Base64) e nunca consulta os arquivos estáticos soltos. Em 18/11/2026, a comparação byte a byte do pacote `GBR_RACING_LAB_ROTACOES_OFICIAIS_S10_S12_18NOV2026.zip` mostrou 202 de 205 rotas idênticas e 3 defasadas: `events-gp.js`, `gbr-pre-gp-ui.js` e `gbr-pre-gp-engine.js`. A produção (`gbr-racing-lab.pages.dev`) confirmou o sintoma: GP Las Vegas com etapas 18–19 / 21–22 / 22–23/11 em vez de 18–20 / 21 / 22/11 (regra quarta–domingo, relatório de 16/11) e ausência de `boostRecommendationsHTML` (ADR 0019 de 10/11). A causa é que o payload foi reconstruído sem partir do estado local completo e não havia ferramenta de verificação no pacote (`verificar-worker.mjs` citado em entregas antigas não está presente).

## Decisão
Adicionar `tools/sincronizar-worker.mjs`:
- `--check`: compara cada rota do payload com o arquivo local (SHA-256); sai com código 1 se houver divergência.
- `--write`: regrava somente o conteúdo das rotas existentes, preservando ordem, content-type e todo o código do Worker fora do literal `compressed`.
- Nunca adiciona rota nova, para impedir a publicação acidental de docs, testes ou SQL.

Payload regenerado com essa ferramenta. Verificado: mesmas 205 rotas e ordem, mesmos content-types, código do Worker fora do payload idêntico, apenas as 3 rotas acima alteradas, 205/205 idênticas aos arquivos locais.

## Alternativas
- Editar o payload manualmente: descartado (não reproduzível).
- Fazer o Worker ler arquivos via `env.ASSETS`: eliminaria o payload, mas muda a arquitetura de entrega e os headers; fica como opção futura, com ADR próprio.

## Consequências
Toda mudança em arquivo público passa a exigir `node tools/sincronizar-worker.mjs --write` seguido de `--check` antes de empacotar. Sem impacto em Supabase, RLS, login, garagem, contratos ou dados persistidos.

## Reversibilidade
Porta de mão dupla. Rollback: restaurar o `_worker.js` anterior (SHA-256 `5736aacd3d23a49e6a52eebaea57b3c6e693e36c70253c3558bcbc0d64e70ade`).

## Gatilho de revisão
Se o número de rotas crescer a ponto de o `_worker.js` se aproximar do limite de tamanho do plano Cloudflare, ou se for preciso servir arquivos novos, reavaliar a migração para `env.ASSETS`.
