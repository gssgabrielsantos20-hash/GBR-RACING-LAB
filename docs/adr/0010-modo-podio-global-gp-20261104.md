# ADR 0010 — Modo Pódio Global: GP com observações próprias

**Status:** implementado localmente como candidato a homologação, sem publicação. **Data:** 04/11/2026.

## Contexto

O usuário solicitou, após a conversa «Gbr LAB 5», estudar globalmente os bots que alcançam o pódio em GPs, comparando classificação, largada, chegada, pneus, paradas, perda de posições e consistência, e identificar alternativas de pilotos da garagem para tentar competir pelo Top 3. A referência é o ZIP `GBR_RACING_LAB_PIT_WALL_ROTACAO_DUELOS_04_17_NOV_2026_PREVIA(3).zip`, de 193 ativos públicos. O código anterior continha `raceAnalyses` para comparativos de Duelos, mas nenhum histórico de resultados de participantes de GP.

## Decisão

1. Separar `gpPodiumObservations` (somente registros de GP manuais) de `raceAnalyses` (Inteligência GBR/Duelos), ambos dentro do JSON por usuário de `garage_states`, sem migration ou mudança de contrato de API.
2. `gbr-podium-model.js`: validar data, evento, categoria/série, pista, etapa/rodada quando confirmada, tipo de participante, posições 1–24, duas cartas de pilotos, até sete peças, até cinco compostos, paradas 0–5, perdas observadas, liderança, melhor volta e nota. Limitar a 240 registros/garagem e impedir duplicação do mesmo participante/resultado de uma mesma corrida. Informações não observadas permanecem nulas.
3. Agregar somente bots que o usuário registrou, **na mesma categoria/série**; comparar circuitos mesmo quando os eventos variam. Taxa Top 3 usa como denominador todos os bots observados, inclusive fora do pódio. Registros de jogadores humanos ficam isolados das estatísticas dos bots. Perfis mutuamente exclusivos: **Domínio de Grid** (largou até P3 e terminou Top 3); **Recuperação** (ganhou 3 ou mais posições e terminou Top 3); **Ritmo/Consistência** (outros pódios, um rótulo exploratório, não prova de ritmo).
4. `gbr-recommendation-engine.js`: novos rankings *exploratórios* de duplas próprias por atributos para cada perfil, usando a verificação já existente `GBREvents.isAllowedDriver` (série, raridade e posse). São oferecidos **somente quando** o GP possui regras confirmadas e há pelo menos 12 observações na mesma categoria/série, com 4 pódios, 3 não pódios e 2 pistas. Peças continuam provenientes de `GBREvents.computeSetup` original. Nenhuma alteração de critérios de setup dos Duelos ou do Engenheiro de GP.
5. UI responsiva no Pit Wall; conteúdo de usuário escapado antes de ser exibido em HTML. Somente sessões autenticadas e habilitadas podem gravar/excluir, utilizando `F1Session.scheduleSave()` já existente. O botão não afirma sincronização concluída.

## Alternativas rejeitadas

- Reutilizar `raceAnalyses`: causaria viés e regressão de recomendações em Duelos.
- Nova tabela Supabase/RPC: exigiria definir autorização, RLS, migration, rollback e ambiente de homologação específico, sem necessidade imediata.
- Buscar nomes/estatísticas de bots automaticamente ou alegar leitura de telemetria: não existe fonte de dados confiável acessível no navegador; não fabricar números.
- Reotimizar automaticamente todas as peças a partir dos resultados de pódio: correlação não prova causalidade e faltam medições de desempenho comparáveis.

## Escala, risco e reversibilidade

**Portão de escalabilidade: ATENÇÃO, não bloqueante para a prévia.** Análise O(N) limitada a N≤240 observações e apenas mediante entrada/atualização do usuário; nenhum polling, API extra ou IA remota. Os registros entram no JSON da garagem, já sujeito a sincronização por revisão, conflito e RLS existentes (controles de produção não verificados nesta sessão). Para crescimento 10x, medir tamanho das garagens, tempo de sincronização, p95 de leitura/gravação e conflito entre dispositivos antes de aumentar o limite. Sem estado global entre contas. Mudança **reversível** por restauração do ZIP anterior; exporte os dados antes de substituir a versão, pois a interface anterior não exibe a coleção nova.

**Limites de segurança:** autenticação é verificada na interface, porém autoridade final deve estar no servidor e no RLS. Não foi executado teste com duas contas ou auditoria de todas as políticas. Não atribuir «controle verificado» à sessão de produção. Um backup JSON pode conter registros editados pelo próprio usuário; tratar suas observações como autorrelatadas.

## Plano de testes e rollback

- `node tests/podium-global-20261104.test.js`: campos, rejeição de HTML/valores indevidos, data inválida, etapas/rodadas, perfis, filtro por categoria/série, distinção bot/jogador, baseline vs alternativas, status de login e integração.
- Demais testes legados e `node tests/mega-worker-20261029.test.js`; arquivo Worker precisa ser reconstruído com allowlist de 195 recursos e hashes atuais.
- **Pendente:** Safari iPhone, login real em duas contas, regras RLS, sincronização entre dispositivos, persistência/reabertura e homologação de páginas; tentativa de Chromium headless local bloqueada/expirou.
- Rollback: republicar o ZIP anterior exclusivamente no ambiente de homologação. Não executar SQL/alterar Supabase. Manter o novo ZIP e um backup individual em JSON para não perder observações inseridas.

## Quatro fontes verificadas

- `engenheiro-de-segurança.txt`, Regras de Conduta e Etapas 1–3, 9 e 13: deny-by-default, validar entrada, RLS/autorização, sem chaves privilegiadas, evidências e rollback; teste real de RLS continua pendente.
- `arquiteto-de-software.txt`, Portão de Escalabilidade e Etapas 3, 8 e 10: carga previsível, reversibilidade, evitar polling, testar capacidade antes de otimizar.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, Regra Principal e 2–4, 10: diagnóstico no arquivo real, fluxo por dependências, não duplicar regras e exigir testes.
- `persona-planejadora.txt`, Limites, Critérios de Parada e Ordem de Leitura: executar somente critérios acordados; **Manuais de Projeto, Testes e Persona de Testes citados no documento não foram localizados no ZIP recebido**. Não autorizar produção sem homologação e complementação das evidências aplicáveis.
