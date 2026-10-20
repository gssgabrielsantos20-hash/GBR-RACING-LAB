# ADR 0004 — Diagnóstico inicial com três corridas comparáveis

**Status:** aprovado pelo responsável; código candidato R7 validado localmente em 19/10/2026. Publicação no Cloudflare deve ser rastreada separadamente.

## Contexto
O módulo `gbr-learning-model.js` já permitia análise inicial com três registros distintos na mesma pista/série, com pelo menos uma vitória e uma derrota. O parecer em `gbr-race-verdict.js` ainda exigia oito e desconsiderava a corrida atual. A divergência impedia o parecer após o terceiro registro, embora o histórico principal estivesse pronto.

## Decisão
- Reutilizar o domínio `GBRRaceLearning.summary` como regra única para a quantidade e o agrupamento dos registros.
- Incluir a corrida examinada no histórico comparável; o domínio elimina IDs duplicados.
- Exigir **3 corridas distintas da mesma pista e série**, com resultados contrastantes (mínimo uma vitória e uma derrota) para formular hipóteses **preliminares**.
- Com amostra menor, explicar o que falta. Com resultados iguais, apresentar somente fatos e limitações.
- Preservar o limite independente de **8 setups favoritos**, o fluxo de OCR por print e as permissões da garagem. Não modificar Supabase, autenticação ou armazenamento.

## Alternativas e riscos
Conservar 8 registros: rejeitado pela solicitação de produto. Criar segunda regra no parecer: rejeitado para evitar regressões. Reutilizar o domínio existente: escolhido, custo baixo e reversão simples. Amostras de 3 observações não permitem inferir causalidade ou alta confiança; a interface deve informar isso.

## Validação e rollback
- Executar `node tests/learning-three-races.test.js` e `node tests/race-verdict-three-races.test.js`.
- Antes de publicar, conferir consistência entre fontes externas e ativos embutidos em `_worker.js`, além da navegação e login em iPhone/PC.
- O Cloudflare Pages utiliza uploads ad hoc; **commits GitHub não equivalem automaticamente ao deployment de produção**.
- Reverter por commit posterior ou pelo deployment anterior comprovadamente válido; não excluir dados de usuários.

## Escalabilidade
É mudança determinística/local e sem nova consulta de banco. Portão de escalabilidade OK no escopo funcional; teste de carga em 10x não executado.
