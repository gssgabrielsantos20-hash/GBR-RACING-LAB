# GBR Intelligence — Race Behavior | Etapa 1

**Data:** 10/11/2026  
**Status:** pacote local para aprovação; sem deploy, push ou escrita remota.

## Escopo entregue
Registro opcional do contexto observado: clima, Safety Car, temperatura mínima/máxima, posições finais (sua equipe e rival), boosts, incidentes e tráfego. Campos adicionados ao formulário atual e validados em `GBRRaceLearning.cleanRaceContext()` antes de serem anexados ao registro existente `raceAnalyses`.

## Arquivos alterados
- `gbr-learning-model.js` — normalização e validação do novo objeto opcional.
- `gbr-learning-ui.js` — captura manual do contexto ao salvar a corrida.
- `index.html` — campos do formulário e cache-busting dos três recursos JS/CSS alterados.
- `_worker.js` — atualização dos quatro recursos públicos compactados, preservando o mapa de 199 recursos.
- `tests/race-behavior-context-20261110.test.js` — testes de validação e compatibilidade.
- `docs/adr/0017-gbr-intelligence-race-behavior-contexto-corrida-20261110.md` — decisão e rollback.

## Segurança / arquitetura
Não foram alterados `app.js`, `cloud.js`, autenticação, autorização, Supabase, RLS ou estrutura remota. Os campos são dados simples, com enumerações, limites numéricos e limites de texto; não aceitam HTML. Nenhuma informação é inferida quando ausente. O OCR existente continua sem preencher estes campos.

## Validação
- `node --check gbr-learning-model.js`, `node --check gbr-learning-ui.js` e `node --check _worker.js`: aprovados.
- Teste dedicado: `node tests/race-behavior-context-20261110.test.js`.
- Suíte completa: 22 de 23 testes passaram. Há uma falha preexistente conhecida em `tests/event-photos-20261029.test.js`, que espera uma imagem primária de Nigel Mansell no evento São Paulo. A mesma falha foi reproduzida executando o mesmo teste na cópia-base intocada (`gbr_moustache_baseline_check`), portanto não foi introduzida por Race Behavior.
- Worker: 4/4 recursos públicos alterados foram comparados byte a byte com os arquivos locais; mapa preservado com 199 recursos. Testes visuais reais em Safari/iPhone não executados.

## Limitações desta etapa
Os dados são armazenados, mas ainda não alimentam análise comparativa, aprendizado ou recomendações. A etapa seguinte deve estruturar recomendação vs. setup realmente utilizado e manter fonte/amostra/confiança explícitas.

## Rollback
Restaurar os quatro recursos públicos alterados e o Worker do ZIP-base. Não apagar `raceContext` dos registros; versões anteriores ignoram campos desconhecidos, preservando os dados.

## Implantação
Não realizada. ZIP destinado somente à revisão/aprovação do usuário.
