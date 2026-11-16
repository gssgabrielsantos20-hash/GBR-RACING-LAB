# GBR Racing Lab — atualização do GP de Las Vegas

**Data:** 16/11/2026  
**Base:** `GBR_RACING_LAB_BOOSTS_GP_CORRIGIDO_10NOV2026.zip`  
**Escopo:** calendário e tarefas do patrocinador do GP de Las Vegas na Central de Eventos GP.

## Evidência de origem
Capturas do F1 Clash enviadas pelo usuário em 16/11/2026. Foram transcritos os períodos, circuitos, número de voltas, chuva, temperaturas e tarefas exibidas para as quatro categorias. Os dados de chuva/temperatura são os valores das capturas, não previsão ao vivo.

## Alterações
- `events-gp.js`: datas do evento 18–23/11/2026; etapas Classificatória (18–19/11), Abertura (21–22/11) e Final (22–23/11).
- Calendário da Classificatória: Las Vegas (6), Zandvoort (8), Hungaroring (9, 100% chuva), Madrid (5).
- Abertura e Final: sequência idêntica de oito corridas: Las Vegas (6), Austin (6), Zandvoort (8), Miami (6), Hungaroring (9, 100% chuva), Spielberg (10), Madrid (5), Las Vegas (6).
- Temperaturas transcritas: Las Vegas 20–22 °C; Austin 26–30 °C; Zandvoort 24–28 °C; Miami 26–28 °C; Hungaroring 22–24 °C; Spielberg 20–24 °C; Madrid 25–29 °C.
- Tarefas de patrocinador atualizadas para Júnior, Competidor, Contender e Campeão. Contender: Pico Apex; Isack Hadjar Escolhas do Paddock Standard nível 3+ nas duas primeiras etapas e nível 4+ na Final; +200 reputação por etapa.
- `_worker.js`: conteúdo incorporado de `/events-gp.js` atualizado. 205 recursos públicos mantidos no mapa do Worker.
- `tests/las-vegas-calendar-20261116.test.js`: novo teste de calendário, clima, temperaturas e tarefas.
- `tests/eventos-las-vegas-catar-20261104.test.js`: expectativa ajustada para aceitar calendário agora confirmado de Las Vegas, mantendo Catar sem sequência inventada.

## Validação
- `node --check events-gp.js`: PASS.
- `node --check _worker.js`: PASS.
- `node tests/las-vegas-calendar-20261116.test.js`: PASS.
- `node tests/worker-events-smoke-20261104.test.js`: PASS (rotas públicas, arquivos privados 404 e POST 405).
- Varredura final de 29 testes: 25 PASS, 4 FAIL. Falhas: `boost-art-link-20261105.test.js`, `duelos-rotacao-0411-1711.test.js`, `event-photos-20261029.test.js` e `mega-worker-20261029.test.js` (manifesto legado espera 199 arquivos e a comparação byte a byte diverge). As falhas de arte e rotação não são relacionadas ao calendário. A suíte de fotos já estava documentada como falha na base anterior. O mega-worker usa manifesto legado de 199 arquivos, enquanto a versão atual do Worker contém 205; requer atualização separada do manifesto/teste antes de classificar como regressão.
- Safari/iPhone e homologação remota: não executados.

## Segurança e implantação
Nenhuma escrita no GitHub, Supabase ou Cloudflare. Nenhum deploy foi iniciado. Nenhuma alteração de autenticação, autorização, RLS, garagem ou dados de usuário. O ZIP é pacote local preparado para aprovação e homologação.

## Rollback
Descartar este ZIP e restaurar o pacote-base `GBR_RACING_LAB_BOOSTS_GP_CORRIGIDO_10NOV2026.zip`. A alteração é estática e reversível; não exige migração SQL.
