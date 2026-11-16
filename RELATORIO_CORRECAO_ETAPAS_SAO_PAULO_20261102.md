# GBR Racing Lab — Correção das etapas de São Paulo — 02/11/2026

## Objetivo e causa raiz

A versão anterior apresentava Qualificação 04–05/11, Abertura 07–08/11, Final 08–09/11 e somente três provas na Final, classificando-a como parcial. O responsável confirmou em 02/11/2026 que as datas reais de cada etapa são **04–06/11 (Qualificação), 07/11 (Abertura), 08/11 (Final)** e que a Final tem **as mesmas oito pistas, na mesma ordem e com as mesmas condições da Abertura**.

As telas anteriores exibiam um banner geral '4–9', mas o responsável forneceu depois as datas exatas de cada etapa, adotadas na nova versão. A divergência histórica foi documentada no ADR 0008.

## Resultado do calendário

- Qualificação — **04 a 06/11** — quatro provas: São Paulo (9 voltas, chuva 0%, 26–30 °C), Abu Dhabi (8, 0%, 26–30 °C), Suzuka (7, 100%, 18–22 °C), Zandvoort (8, 0%, 24–28 °C).
- Abertura — **07/11** — oito provas: São Paulo (9, 0%, 26–30 °C); Xangai (7, 0%, 22–24 °C); Abu Dhabi (8, 0%, 26–30 °C); Spa (6, 0%, 22–24 °C); Suzuka (7, 100%, 18–22 °C); Silverstone (8, 0%, 22–23 °C); Zandvoort (8, 0%, 24–28 °C); São Paulo (9, 0%, 26–30 °C).
- Final — **08/11** — as mesmas oito corridas da Abertura, sem marcação de parcial.

## Arquivos e blocos alterados

- `events-gp.js`: objeto `EVENTS`, evento `sao-paulo-spectacular-2026`, campos `stages`, `stageRounds`, `partialStages`, `ends`, `description` e `scheduleProvenance`; mensagem geral de integridade de dados e resumo técnico. Demais eventos preservados.
- `gbr-pit-wall.js`: mensagem da função de planejamento `planEvent` (retorno `warning`); agora informa igualdade da sequência e não diz que a Final é parcial.
- `tests/sao-paulo-calendario-oficial-20261102.test.js`: regressões de datas, contagem 4+8+8, igualdade de dados corrida a corrida e calendário iPhone com fim inclusivo no dia 8.
- `_worker.js` e `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json`: reempacotamento somente dos dois JS públicos alterados, preservando a allowlist de 193 recursos; hash atualizado.
- `docs/adr/0007-calendario-sao-paulo-oficial-20261102.md`: anotação de histórico superado.
- `docs/adr/0008-sao-paulo-datas-final-fixa-20261102.md`: documentação da nova decisão, limitações e rollback.
- `LEIA_PRIMEIRO_SAO_PAULO_OFICIAL_20261102.md`: guia de homologação atualizado.

## Fontes consultadas

1. `engenheiro-de-segurança.txt`, regras de conduta, privilégios mínimos, teste e rollback: apenas dados de eventos, sem tocar login, RLS ou credenciais.
2. `arquiteto-de-software.txt`, portão de escalabilidade, reuso e reversibilidade: mesmo evento e função existente, sem novas dependências ou requisições.
3. `persona-planejadora.txt`, limites e critérios de aceite: datas e ordem confirmadas explicitamente pelo responsável, sem criar novas regras de produto.
4. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, diagnóstico, arquivos exatos e validação da causa raiz: substituição do cadastro parcial por oito corridas confirmadas.
5. `docs/adr/0007-calendario-sao-paulo-oficial-20261102.md`, base de decisão anterior substituída pelo ADR 0008.
6. Prints do F1 Clash e confirmação escrita fornecidos na conversa em 02/11/2026.

## Testes executados (reais)

- `node --check` em 39 arquivos JavaScript de front-end: **39 aprovados**.
- `node tests/colecoes-s12.test.js`: **aprovado**.
- `node tests/event-photos-20261029.test.js`: **aprovado**.
- `node tests/mega-auditoria-20261029.test.js`: **aprovado**.
- `node tests/mega-worker-20261029.test.js`: **aprovado** (193 recursos comparados byte a byte e proteção de rotas internas).
- `node tests/pit-wall-20261101.test.js`: **aprovado**.
- `node tests/sao-paulo-calendario-oficial-20261102.test.js`: **aprovado**.
- **Não verificado**: autenticação e layout real no Safari iPhone / ambiente de homologação.

## Implantação e rollback

Este ZIP é para **prévia**, não é uma publicação. Recomenda-se usar `gbr-racing-lab-homologacao` e verificar as três etapas no iPhone. O arquivo não executa migração no banco, não altera garagem, tabelas, tokens, RLS, Auth, nem os recursos de outras seções.

Rollback: reimplantar o ZIP anterior `GBR_RACING_LAB_PIT_WALL_SAO_PAULO_OFICIAL_20261102_PREVIA.zip`, mantendo cópia local de ambas as versões.
