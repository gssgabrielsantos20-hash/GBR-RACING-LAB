# Relatório de implementação — Modo Pódio Global 04/11/2026

**Objetivo:** a partir da conversa «Gbr LAB 5», implementar no Pit Wall uma análise global dos bots que alcançam o pódio em GPs, preservando Duelos e os demais módulos do ZIP-base.

**ZIP-base:** `GBR_RACING_LAB_PIT_WALL_ROTACAO_DUELOS_04_17_NOV_2026_PREVIA(3).zip`, 222 arquivos totais, 193 públicos. Seu manifesto original passou na checagem SHA-256 antes de qualquer alteração.

## Escopo e evidências

| Arquivo | Alteração | Por quê |
|---|---|---|
| `gbr-podium-model.js` (novo) | Validação/regras/sumário de observações de GP | Não poluir a aprendizagem de Duelos nem inventar dados |
| `gbr-podium-ui.js` (novo) | Formulário, histórico, exclusão e relatório global por categoria | Interface com salvamento voluntário e visualização mobile |
| `gbr-recommendation-engine.js` → `podiumPairs()` | Ranking de duplas de pilotos elegíveis por três perfis | Aproveitar garagem real e filtros do GP, sem reescrever o Engenheiro de GP |
| `app.js` → `init()`, `migrateGaragem()` e `refreshAll()` | Campo aditivo `gpPodiumObservations` na garagem e renderização após sincronizar | Persistir no JSON da conta e backups existentes |
| `index.html` → seção `gbr-pit-wall` | Novo bloco Modo Pódio Global e inclusão dos dois scripts | Manter o mesmo menu e fluxo de navegação |
| `gbr-pit-wall.css` | Form responsivo em duas/uma coluna | Legibilidade desktop/iPhone sem mudar o tema existente |
| `_worker.js`, `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json` | Allowlist pública embutida atualizada de 193 para 195 ativos | Cloudflare Pages manual / Worker completo |
| `tests/podium-global-20261104.test.js` | Nova suíte de unidade/integração estática | Critérios de aceitação verificáveis |
| `tests/mega-worker-20261029.test.js` | Contagem e rotas dos dois recursos novos | Teste byte a byte do Worker |

**Não alterados:** `events-gp.js`, `gbr-learning-model.js`, `cloud.js`, Supabase, `raceAnalyses`, regras de login, RLS, baús, módulos de Duelos e calendário de São Paulo. A decisão de não alterar mais módulos do que necessário evita introduzir regressões no pipeline antigo.

**Como interpretar:** dados autorrelatados, sem scraping. Amostra mínima para alternativas = 12 bots observados na categoria/série, incluindo ≥4 pódios, ≥3 fora do pódio e ≥2 pistas. Sem isso, apresentar apenas informação descritiva com aviso de insuficiência. Perfis não implicam relações causais. Duplas de pilotos são ordenadas por atributos cadastrados; peças são as do Engenheiro de GP existente. Campos vazios são desconhecidos, nunca zero assumido.

## Portão de escalabilidade e segurança

**ATENÇÃO (não bloqueante na prévia):** análise limitada a 240 observações por garagem, no cliente, O(N); sem nova rede, sem polling, sem tabelas, sem serviços/segredos. Maior escala exige medir tamanho do payload, latência e conflitos na sincronização por revisão existente. Nova gravação depende de `F1Session.getContext().enabled && userId && !demo`; a autoridade final é o RLS de `garage_states`, não verificável pela inspeção do ZIP. Conteúdo do usuário é validado e escapado em relatórios. Exclusão pede confirmação; rollback por ZIP original. Auditoria com duas contas permanece pendente.

## Fontes consultadas

1. `engenheiro-de-segurança.txt`: validação, privilégios, RLS e negação por padrão; sem alegar homologação de políticas.
2. `arquiteto-de-software.txt`: evitar nova API/estado compartilhado, medir impacto 10x e documentar reversão.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: investigar fluxo real, implementar incrementalmente e testar.
4. `persona-planejadora.txt`: preservar o escopo aprovado e parar antes da produção sem os manuais complementares ou sem testes ponta a ponta.

Os documentos «Manual de Projeto», «Manual de Testes» e «Persona de Testes» indicados por `persona-planejadora.txt` não estão presentes neste ZIP; os testes técnicos utilizados são os arquivos existentes sob `tests/` e a suíte nova, sem alegar adesão a manuais inacessíveis.

## Validação executada

**Resultados locais efetivos:** oito suítes Node passaram (`colecoes-s12`, `duelos-rotacao`, `event-photos`, `mega-auditoria`, `mega-worker`, `pit-wall`, `podium-global` e `sao-paulo-calendario`). `node --check` passou nos 42 arquivos JS públicos. O Worker serviu os 195 recursos com bytes idênticos, HTTP 200, 404 internos, HEAD, POST 405 e cabeçalhos conforme os testes. SHA-256 válido para os 195 recursos. Comparado ao ZIP-base: 215 arquivos preservados byte a byte, 7 alterados, 6 adicionados, nenhum removido; dos 193 recursos públicos anteriores, 189 permanecem byte a byte idênticos. Não é teste de navegador real. **Não executados:** homologação do Cloudflare, login real, RLS de contas diferentes e Safari iPhone. Uma tentativa de Chromium headless no ambiente local expirou; não considerar teste visual aprovado.

## Próxima decisão

Inspecionar e publicar em projeto de homologação isolado, realizar critérios do guia e aprovar explicitamente antes de qualquer deploy em produção ou alteração no GitHub. Backup e rollback: ZIP-base enviado pelo usuário, sem SQL de reversão.
