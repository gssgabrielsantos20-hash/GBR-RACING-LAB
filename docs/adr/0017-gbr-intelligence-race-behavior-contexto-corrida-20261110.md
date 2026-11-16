# ADR 0017 — GBR Intelligence: contexto observado da corrida

- **Status:** implementado localmente para homologação; não publicado.
- **Data:** 10/11/2026.

## Contexto
O histórico de análises já persiste em `garage.raceAnalyses`, com validação central em `gbr-learning-model.js` e salvamento pelo fluxo existente de garagem. Criar tabela ou mecanismo paralelo duplicaria persistência e aumentaria o risco de regressão.

## Decisão
Adicionar `raceContext` como objeto opcional e validado no registro existente. Campos: clima (`unknown`, `dry`, `wet`, `variable`), Safety Car (`unknown`, `yes`, `no`), temperaturas mínima/máxima (-20 a 60 °C), posições finais (1 ou 2), boosts (120 caracteres), incidentes e tráfego (160 caracteres cada). Textos são normalizados, limitados e rejeitam marcação/controles; dados vazios não são inferidos.

A interface mantém captura manual. O OCR existente não recebe novos poderes nem preenche estes campos. Registros legados não exigem migração porque o campo é opcional. Não se altera `cloud.js`, esquema do banco, RLS, autenticação ou autorização.

## Consequências
- Compatibilidade retroativa por campo opcional.
- Persistência segue o objeto de garagem já existente.
- A informação contextual ainda não participa de inferências ou recomendações; nesta etapa é apenas registrada.
- O Worker estático precisa carregar os bytes atualizados dos quatro recursos públicos alterados.

## Segurança e limitações
Validação client-side/model local protege integridade do histórico, mas não constitui controle de autorização do servidor. A propriedade dos dados continua dependendo do fluxo de garagem/autenticação/RLS existente, que não foi alterado nem auditado integralmente nesta etapa. Não foram feitas operações remotas.

## Rollback
Restaurar os bytes anteriores de `index.html`, `gbr-learning-model.js`, `gbr-learning-ui.js` e `gbr-learning.css`, bem como o `_worker.js` anterior. Como o campo é opcional, os registros que já contenham `raceContext` permanecem preservados no JSON da garagem; uma versão antiga simplesmente não os exibirá. Não apagar esses dados automaticamente.
