# GBR Racing Lab — atualização do evento Loucura do Bigode

**Data:** 10/11/2026  
**Base:** `GBR_RACING_LAB_BOOSTS_IMAGENS_REMOTAS_PREPARADO_10NOV2026.zip`  
**Escopo:** somente dados e apresentação do evento Loucura do Bigode.

## Alterações
- `events-gp.js`: corrigido encerramento para 16/11/2026.
- Cadastradas as datas das etapas: Classificatória 11–12/11, Abertura 14–15/11 e Final 15–16/11.
- Cadastradas 4 corridas da Classificatória e 8 corridas para Abertura e Final, com voltas, chuva e temperaturas conforme capturas do jogo enviadas em 10/11.
- Cadastradas as quatro tarefas do patrocinador (título, descrição, recurso exigido e bônus) conforme capturas.
- `sponsorHtml` agora exibe título e descrição próprios quando fornecidos pelo evento; os demais eventos mantêm o formato anterior.
- `_worker.js` reconstruído preservando os 199 recursos públicos do pacote e atualizando somente `/events-gp.js`.
- Adicionado teste específico `tests/moustache-madness-20261110.test.js`.

## Arquivos alterados/adicionados
- `events-gp.js`
- `_worker.js`
- `tests/worker-events-smoke-20261104.test.js`
- `tests/moustache-madness-20261110.test.js` (novo)
- `RELATORIO_ATUALIZACAO_LOUCURA_DO_BIGODE_20261110.md` (novo)
- `MANIFEST_SHA256_EVENTO_LOUCURA_BIGODE_20261110.json` (novo)

## Validação executada
- `node --check`: 43 arquivos JavaScript da raiz, sem erros.
- Testes: 22 de 23 passaram.
- Teste específico do evento: aprovado.
- Smoke test do Worker: aprovado; recursos novos do evento respondem com os mesmos bytes dos arquivos locais; arquivos privados continuam retornando 404 e POST continua 405.
- Uma suíte existente (`tests/event-photos-20261029.test.js`) falha por referência à imagem de Nigel Mansell do evento São Paulo. A mesma falha foi reproduzida no ZIP-base intocado; portanto não foi introduzida por esta atualização e ficou fora do escopo.
- Testes físicos em Safari/iPhone não executados nesta sessão.

## Segurança e implantação
Nenhuma chamada de escrita ao GitHub, Supabase ou Cloudflare foi realizada. Nenhum deploy foi iniciado. O ZIP é pacote preparado para homologação, não uma publicação.
