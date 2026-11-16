# ADR 0008 — Datas corrigidas e ordem fixa da Final de São Paulo 2026

**Status:** candidato à homologação; substitui as datas e a classificação "Final parcial" do ADR 0007.

## Contexto e evidências

A primeira captura mostrava o banner geral "novembro 4–9" e a parte inferior da Final estava oculta pelo botão Voltar. O pacote anterior registrava indevidamente 04–05/11, 07–08/11, 08–09/11 e apenas 3 corridas de Final. Em 02/11/2026, o responsável confirmou explicitamente que a Qualificação é 04–06/11, a Abertura é 07/11 e a Final é 08/11, com **exatamente a mesma ordem fixa de circuitos e condições da Abertura na Final**. Esta confirmação posterior define as regras de cadastro; o banner anterior divergente permanece documentado.

## Decisão

- Manter um único evento `sao-paulo-spectacular-2026` e o mesmo `stageRounds` em `events-gp.js`.
- Classificatória: 4 provas, 04–06/11. Abertura: 8 provas, 07/11. Final: 8 provas, 08/11; copiar a sequência e as condições já cadastradas para Abertura, **sem compartilhar a mesma referência mutável entre arrays**.
- `ends` passa a `2026-11-08` para refletir o encerramento da última etapa, com `DTEND` de calendário em 09/11 (limite exclusivo do formato iCalendar).
- Retirar o rótulo "Final parcial" e avisos antigos do Pit Wall; manter os dados de recompensas sem alteração.

## Impacto e alternativas

Escopo exclusivamente de front-end e dados estáticos do evento. Nenhuma alteração de autenticação, RLS, conta, Supabase, garagem, montagem ou estratégias de outros GPs. Não duplicar o evento inteiro (pior para manutenção). Portão de escalabilidade: OK, três arrays pequenos, nenhuma chamada de rede, sem custo crescente relevante. Rollback: reimplantar `GBR_RACING_LAB_PIT_WALL_SAO_PAULO_OFICIAL_20261102_PREVIA.zip`.

## Testes

`tests/sao-paulo-calendario-oficial-20261102.test.js`: datas, 4+8+8, igualdade de ordem/clima/temperatura/voltas, separação de arrays e `.ics`. `tests/mega-worker-20261029.test.js`: integridade byte a byte dos 193 recursos públicos e bloqueio de rotas internas. Homologação em Safari real permanece necessária.

## Fontes

- Comunicação e imagens fornecidas pelo responsável em 02/11/2026: confirmação direta da sequência fixa e datas das etapas.
- `engenheiro-de-segurança.txt`, itens 1–8 de Regras de Conduta.
- `arquiteto-de-software.txt`, Portão de Escalabilidade e rollback.
- `persona-planejadora.txt`, Critérios de Parada e aceitação explícita do requisito.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, Regra Principal e sequência de correção.
