# GBR Racing Lab 6 — Relatório de implementação: contexto de Pistas, Montador e Duelos

**Data:** 05/11/2026  
**Status:** implementação local para homologação; não publicada.  
**Artefato base:** `GBR_LAB6_BOOSTS_PARIDADE_COMPLETO_PREVIA(1).zip`, 271 entradas, recebido do responsável.  
**Escopo aprovado:** continuar a correção prioritária da reavaliação: priorização de pistas entre os módulos, sem presumir clima seco.

## 1. Fontes consultadas e orientação aplicada

- `engenheiro-de-segurança.txt`: alteração localizada após diagnóstico, defesa em profundidade, preservar RLS, segredos e fluxos de conta; testes e rollback.
- `arquiteto-de-software.txt`: portão de escalabilidade, mudança reversível; preservar módulos e não sobrepor validações.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: responsabilidade única por prioridade, separar UI e cálculo; regressão após mudança.
- `persona-planejadora.txt`: limites da execução, critérios de aceite, não inventar regras.
- `REGRAS-DE-ORIGINALIDADE.txt`: não copiar setups e dados sem comprovação; rotular hipóteses.
- Documentos aprovados de 16/10/2026 na Biblioteca (`01-protocolo-appsec.md`, `02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md`): mudança pequena, rastreável, sem autorização implícita para deploy ou migração; teste negativo e regressão, prova em navegador/contas reais ainda pendente.
- `RELATORIO_REAVALIACAO_GBR_LAB6_05NOV2026.md`: apontou divergência entre `builder-plus.js` e `app.js` e a conversão do clima não informado em seco.

## 2. Diagnóstico do código

- `app.js` aplicava `GBRIntelligence.priorityFor` para as prioridades da ficha Pistas; `builder-plus.js`, função `selectedContext`, usava somente `TRACK_SERIES` legado, mesmo diante de rotação vigente.
- `app.js`, Assistente de Duelos, mantinha foco e estratégia de pilotos em Equilibrado após escolha da pista.
- `app.js` definia `dry` como seleção padrão e `renderTrackStrategies` calculava stints secos quando faltava clima; `builder-plus.js`, funções `generateSnapshot` e `restoreSaved`, e `boosts-plus.js`, `context` e `recommends`, também assumiam `dry` por fallback.
- `gbr-intelligence.js` é carregado após `app.js`; a ficha inicial podia renderizar antes de conhecer a rotação vigente.

## 3. Mudanças aplicadas (arquivos públicos exatos)

| Arquivo | Função/bloco | Alteração |
| --- | --- | --- |
| `app.js` | `resolveTrackContext`, `trackInfo`, `F1Tracks.resolveContext` | Resolutor único: rotação vigente primeiro, referência comunitária depois, perfil indicativo por último; retorna `source` para explicar a escolha. |
| `app.js` | `syncDuelTrackFocus` | Seleção de pista preenche carro/piloto pela mesma regra; mantém edição manual; ao trocar de série e perder pista limpa os focos. |
| `app.js` | `readTrackPrefs`, `writeTrackPrefs`, `renderTrackStrategies` | Clima ausente = `null`; com clima não informado não gerar stints/box calculados. |
| `builder-plus.js` | `selectedContext`, `knownWeather`, `generateSnapshot`, `restoreSaved`, `renderCurrent` | Montador usa resolutor comum, não presume `dry`, informa proveniência e clima desconhecido; setups salvos históricos mantêm focos gravados. |
| `boosts-plus.js` | `recommends`, `context` | Clima não informado vira `unknown` (não `dry`); orientação condicional explicita necessidade de confirmação. |
| `gbr-intelligence.js` | `mount` | Recalcula uma vez a tela de Pistas após a rotação ser inicializada. |
| `index.html` | seletor `trackWeather`; versões de JS | Adiciona opção “Não informado / a confirmar” e atualiza recursos com cache busting. |

**Nota:** cinco recursos públicos foram modificados (`app.js`, `builder-plus.js`, `boosts-plus.js`, `gbr-intelligence.js`, `index.html`), pois `index.html` inclui UI/cache. Nenhuma tabela, endpoint, RLS, usuário ou garagem foi alterado. Não há imagens externas novas.

## 4. Critérios e testes executados

- Testes JS: **43 scripts públicos** passaram em `node --check`.
- **17 suítes executadas passaram**: as 16 suítes leves existentes e `tests/contexto-unificado-20261105.test.js` (testa seleção/ciclos S9 e S10, contexto consistente, edição manual, clima desconhecido sem stints, clima seco explícito, boosts `unknown`). As suítes antigas tiveram apenas referências de cache busting atualizadas. Nenhuma falha restante nessas 17 suítes.
- Worker: descompactados e comparados **198 de 198 recursos** com os arquivos. Resultado: 193 arquivos preservados byte a byte, 5 modificados, 0 removidos. `tests/worker-events-smoke-20261104.test.js` passou (HTTP 200, 404 e 405).
- ZIP completo e ZIP Cloudflare: CRC/integridade ZIP e manifesto SHA-256 dos 198 arquivos verificados após reconstrução.
- `tests/mega-worker-20261029.test.js` (teste pesado de fetch de cada recurso) **não executado nesta rodada** por risco conhecido de encerramento por memória em execução anterior. O seu teste foi apontado para o manifesto novo; não declarar aprovação.
- **Não executados:** interface real no Safari/iPhone; validação funcional com sessão Supabase real; concorrência de revisão; teste de carga; medição de ganhos em corridas; segurança integrada de contas.

## 5. Riscos conhecidos / limitações

1. Preferências antigas salvas com `weather:'dry'` não podem ser distinguidas de escolhas explícitas: a implementação mantém o valor e **não migra a garagem**. Usuário deve reconfirmar o clima ao usar uma configuração antiga.
2. Quando a rotação expira, só fica disponível o perfil de referência comunitária/indicativa, claramente rotulado; não há recomendação de rotação vigente até novo vídeo do jogo.
3. Planos de pneus existentes permanecem condicionados à durabilidade inserida manualmente. Não há telemetria da Hutch nem previsão automática de chuva.
4. Imagens de boosts e migração pendente do Supabase não pertencem a este diff; situação anterior preservada. Não importar imagens do AllClash sem autorização.

## 6. Rollback e próxima etapa

Para reverter, restaurar do ZIP base os cinco arquivos públicos modificados, além de `gbr-intelligence.js` (incluso entre os cinco), e reconstruir `_worker.js` e seu manifesto anterior; nenhuma migração nem transformação de dados é necessária. Proteger o deployment atual de produção e fazer preview antes de qualquer publicação.

**Portão de escalabilidade: ATENÇÃO, não bloqueante para prévia.** É processamento estático sobre pequena lista de pistas; não há consultas externas extras nem efeitos sobre isolamento. Carga real 10x não foi medida.

**Próximo passo único:** homologar Pistas → Montador → Duelos no Safari/iPhone com clima não informado, depois liberar a etapa seguinte de `gbr-strategy-reference.js` (identificação por etapa, corrida e fonte). A publicação exige aprovação separada.
