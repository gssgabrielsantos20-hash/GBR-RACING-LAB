# GBR LAB 6 — análise da live e correção do contexto de setups

**Data:** 07/11/2026. **Status:** Fase B local, prévia; sem publicação, migração ou alteração de garagens.

## Objetivo e evidências

Live indicada: https://www.youtube.com/watch?v=t61lOEsYvrY — “Our First Champs Saturday! | Sao Paulo Spectacular Gp Opening Round | F1 Clash Live”, AzzaW, 07/11/2026, 1h19min02s. A página e metadados foram consultados, mas a reprodução em navegador remoto retornou “Something went wrong” e o controle informa “Subtitles/closed captions unavailable”. **Não foi possível observar corridas, setups, pneus ou comportamento real de adversários da live; nenhuma conclusão sobre bots foi extraída.** O autor da live não foi incorporado ao aplicativo.

Baseline local: `GBR_LAB6_CONTEXTO_UNIFICADO_COMPLETO_PREVIA.zip` (05/11). Comparação de código com o relatório `GBR LAB 6 — levantamento consolidado AllClash` e o calendário do usuário para São Paulo. Regra: fatos do jogo observados no material do usuário não se confundem com rankings externos nem hipóteses do motor.

### Calendário de São Paulo cadastrado

Campeão, Abertura/Final: 1. São Paulo (9 voltas, seco cadastrado); 2. Shanghai (7, seco); 3. Abu Dhabi (8, seco); 4. Spa (6, seco); 5. Suzuka (7, chuva 100%); 6. Silverstone (8, seco); 7. Zandvoort (8, seco); 8. São Paulo (9, seco). Proveniência no `events-gp.js`, linhas 8–19. Clima é do calendário fornecido, não meteorologia ao vivo.

### Falha reproduzida e corrigida

- **ID GP-CTX-01 | severidade média/alta de recomendação:** `events-gp.js:119–168` usava `currentRace(event)` ligado ao estado da interface. Em chamada externa por pista, Suzuka retornou `dry` por herdar a primeira corrida de São Paulo, embora `opening[4].rain=100`.
- **Correção:** adicionar `knownRaceContext` e argumento opcional `{stage,round}`. Central e Pré-GP passam contexto exato; Pit Wall, sem etapa, consulta consenso do calendário. Condições conflitantes retornam `unknown`. Arquivos: `events-gp.js`, `gbr-pre-gp-ui.js`, `index.html` (versões), `_worker.js` (empacotamento); sem mudanças no Supabase.
- **Teste antes:** `node probe.js` retornou Suzuka `weather:dry` e `expectedWeather:wet`.
- **Teste depois:** 5 casos unitários em `tests/gp-context-stage-20261107.test.js`, incluindo discrepância de clima e seleção por etapa, passaram. Dezoito suítes executadas separadamente passaram, excluído o teste `mega-worker-20261029.test.js`, por uso elevado de memória anterior. Validação manual no Safari/iPhone e testes de contas reais não executados.

### Melhorias ainda propostas, NÃO implementadas

1. **Pit stop na seleção de peças:** `events-gp.js:147–154` calcula `scorePart` apenas com velocidade, curvas, potência e classificação. Em dois motores fictícios com quatro atributos iguais e `pit` diferente, a opção com tempo de pit maior venceu por ordem de lista. O Montador (`app.js:83–86`) já possui opção de prioridade de pit. Recomendação: apresentar um comparador de trade-off por quantidade prevista de paradas; não introduzir penalidade arbitrária até medir efeito de uma escolha contra outra em corridas comparáveis. Teste sintético não representa uma carta existente.
2. **Pilotos sob chuva:** `events-gp.js:115–117` prioriza o atributo-alvo da pista e ignora explicitamente clima, distâncias de stint e posição de grid no escore. Suzuka S12 já prioriza Gerenciamento de pneus no catálogo, o que mitiga, mas não valida, a escolha. Criar comparativo condicional sem alterar o ranking automaticamente antes de medir desgaste.
3. **Boosts por piloto:** `events-gp.js:166` e `boosts-plus.js:22–30` mostram prioridade de efeitos, enquanto `gbr-boost-catalog.js:59–69` pode selecionar itens nominais apenas com quantidades informadas. Integrar a escolha nominal no GP por piloto, respeitando `1 + paradas`, disponibilidade, atributos incertos e consumo; não inferir estoque.
4. **Observação de adversários:** `gbr-podium-model.js` já diferencia GP de Duelos e exige amostra; registrar confrontos por etapa, pista, condição e categoria antes de comparar perfis de Top 3. Não classificar adversário como bot comprovado só pela aparência. Nenhuma análise de bots da live é afirmada.

### Prioridades atuais do GBR — provisórias, não verificadas na live

| Prova | Pilotos | Carro |
|---|---|---|
| São Paulo 1 e 8 | Ultrapassagem | Unidade de potência |
| Shanghai 2 | Defesa | Unidade de potência |
| Abu Dhabi 3 | Ultrapassagem | Velocidade |
| Spa 4 | Ultrapassagem | Unidade de potência |
| Suzuka 5 | Gerenciamento de pneus | Curvas |
| Silverstone 6 | Gerenciamento de pneus | Velocidade |
| Zandvoort 7 | Defesa | Curvas |

Referência interna de `app.js`, `TRACKS_2026` e `TRACK_SERIES`, não ranking do criador e não prova de vitória.

## Fontes e governança

Fontes originais diretamente consultadas: `engenheiro-de-segurança.txt` (Fases A/B, testes e rollback), `arquiteto-de-software.txt` (reversibilidade e portão), `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` (responsabilidades e cálculos determinísticos), `persona-planejadora.txt` (não inventar regra), `REGRAS-DE-ORIGINALIDADE.txt` (não copiar terceiros). Governança aprovada: `01-protocolo-appsec.md`, `02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md`, consultados em continuidade ao projeto. Documentação oficial: https://hutch.helpshift.com/hc/en/10-f1-clash/faq/1489-what-do-the-boosts-symbols-mean/ (boosts não elevam Qualificação; uma unidade na largada e por pit stop) e https://hutch.helpshift.com/hc/en/10-f1-clash/faq/606-which-tyres-should-i-use-in-the-race/ (compostos e chuva).

**Portão de Escalabilidade: OK para correção local**, pois não adiciona consultas remotas, dados privados ou dependências; tempo de busca linear ao número de provas do evento. Benchmark 10x não realizado. **Risco residual:** teste visual mobile, autorização real e integração PWA não homologados. Uma mudança de regra de pontuação exigirá avaliação separada.

## Rollback

Restaurar as quatro entradas públicas modificadas do ZIP-base e o Worker original; não há dados nem migrações para reverter. Documento de arquitetura em `docs/adr/0015-contexto-gp-explicito-20261107.md`. **Sem deployment em Cloudflare/GitHub/Supabase.**
