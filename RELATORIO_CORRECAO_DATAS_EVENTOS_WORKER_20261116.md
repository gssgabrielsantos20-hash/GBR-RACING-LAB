# GBR Racing Lab — correção de datas e sincronização do Worker

Data: 16/11/2026

## Regra confirmada pelo responsável
- Qualificação: quarta a sexta.
- Abertura: sábado.
- Final: domingo.
- Período geral: quarta a domingo.

## Escopo
A Central de Eventos foi padronizada nos seis eventos cadastrados: GP dos Estados Unidos, GP da Cidade do México, O Espetáculo de São Paulo, Loucura dos Bigodes, GP Las Vegas e Evento do Catar. Datas individuais das corridas, pistas, voltas, clima, temperaturas, restrições e tarefas foram preservadas.

## Causa identificada
O arquivo local `events-gp.js` estava correto, mas o Worker `_worker.js` servia uma cópia comprimida anterior do módulo. Além disso, `index.html` mantinha o identificador antigo de cache do script. Por isso o navegador continuava apresentando o calendário antigo.

## Correção
- Atualizado o identificador de cache de `events-gp.js` em `index.html`.
- Recomposto o payload gzip/base64 do `_worker.js` usando a allowlist existente de 205 recursos; somente `/events-gp.js` e `/index.html` foram sincronizados no payload.
- Mantidas as regras de roteamento, cabeçalhos de segurança, bloqueio de métodos e arquivos privados.

## Validação executada
- `node --check events-gp.js`: PASS.
- `node --check _worker.js`: PASS.
- `tests/event-cadence-wed-sun-20261116.test.js`: PASS (6 eventos).
- `tests/las-vegas-calendar-20261116.test.js`: PASS.
- `tests/moustache-madness-20261110.test.js`: PASS.
- `tests/worker-events-smoke-20261104.test.js`: PASS (recursos públicos byte a byte, quatro rotas privadas 404 e POST 405).
- `tests/tema-worker-20261109.test.js`: PASS.
- `tests/boosts-worker-assets-20261110.test.js`: PASS.

## Segurança, escalabilidade e implantação
A allowlist de 205 recursos foi preservada. Nenhuma rota privada foi adicionada. Nenhuma alteração em autenticação, autorização, Supabase, RLS ou dados de garagem. O payload continua estático; não há estado por usuário no Worker. Nenhuma publicação no GitHub ou deploy Cloudflare foi executado. A correção está pronta para homologação/publicação mediante autorização.

## Rollback
Restaurar `events-gp.js`, `index.html` e `_worker.js` a partir do pacote-base anterior. Não há migração ou rollback de dados.
