# GBR Racing Lab — padronização do calendário de eventos

Data: 16/11/2026

## Regra confirmada pelo responsável

- Período geral do evento: quarta-feira a domingo.
- Qualificação: quarta, quinta e sexta.
- Abertura: sábado.
- Final: domingo.

## Ajustes realizados

| Evento | Período geral | Qualificação | Abertura | Final |
|---|---|---|---|---|
| GP dos Estados Unidos | 21–25/10 | 21–23/10 | 24/10 | 25/10 |
| GP da Cidade do México | 28/10–01/11 | 28–30/10 | 31/10 | 01/11 |
| O Espetáculo de São Paulo | 04–08/11 | 04–06/11 | 07/11 | 08/11 |
| Loucura dos Bigodes | 11–15/11 | 11–13/11 | 14/11 | 15/11 |
| GP Las Vegas | 18–22/11 | 18–20/11 | 21/11 | 22/11 |
| Evento do Catar | 25–29/11 | 25–27/11 | 28/11 | 29/11 |

Datas calculadas pelo padrão confirmado pelo responsável, usando a quarta-feira de início já cadastrada em cada evento. As listas de pistas, voltas, clima, temperaturas, restrições e tarefas/recompensas não foram alteradas.

## Arquivos

- `events-gp.js`: período geral e rótulos de etapas corrigidos onde divergiam do padrão.
- `tests/event-cadence-wed-sun-20261116.test.js`: novo teste para os seis eventos.
- `tests/las-vegas-calendar-20261116.test.js`: expectativa do término de Las Vegas atualizada.
- `tests/moustache-madness-20261110.test.js`: validação dos rótulos de etapa atualizada.

## Validação executada

- `node --check events-gp.js`: aprovado.
- `node --check _worker.js`: aprovado.
- Teste de cadência dos seis eventos: aprovado.
- Teste específico de Las Vegas: aprovado.
- Testes de Loucura dos Bigodes, São Paulo, dados Las Vegas/Catar e contexto de etapa: aprovados.
- `worker-events-smoke-20261104.test.js`: falhou na comparação byte a byte do `events-gp.js` servido pelo Worker com o arquivo atual. A falha indica divergência entre o recurso retornado e a cópia local; não foi alterado o Worker para mascarar essa diferença. Requer investigação separada antes de considerar a homologação visual completa.

## Escopo e segurança

Nenhuma chamada remota, alteração de Supabase, publicação GitHub ou deploy Cloudflare. Alteração local e reversível.

## Rollback

Restaurar `events-gp.js` e os três testes citados a partir do pacote-base anterior, sem substituir outros módulos.
