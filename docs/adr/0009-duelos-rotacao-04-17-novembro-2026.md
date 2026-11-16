# ADR 0009 — Rotação de Duelos 04–17/11/2026 por série

**Status:** candidata a homologação no Safari e na prévia Cloudflare, sem implantação automática.

## Contexto e fonte

Em 02/11/2026 o responsável enviou a tabela visual de 12 combinações para Duelos das Séries 10, 11 e 12 com pistas, atributo prioritário do piloto, atributo prioritário do carro, clima misto/seco e voltas. A fonte é a imagem anexada à conversa `image(20261102-162019).png`. A tabela não indica percentuais de chuva, tempos de pneus, ordem de futuras rotações nem recompensas de evento GP.

O ZIP usado como base é `GBR_RACING_LAB_PIT_WALL_SAO_PAULO_ETAPAS_CORRIGIDAS_20261102_PREVIA.zip`. A rotação antiga 21/10–03/11 estava em `gbr-intelligence.js`, com referência de datas rígidas em `gbr-strategy-reference.js` e uma descrição de data desatualizada em `app.js`.

## Decisão e alternativas

- Registrar a nova rotação exclusivamente no catálogo estático `SERIES_ROTATIONS` de `gbr-intelligence.js`, reutilizando os IDs das 24 pistas existentes.
- Preservar a rotação 21/10–03/11 em `PREVIOUS_SERIES_ROTATIONS`; o catálogo ainda mais antigo 07–20/10 passa a ser `LEGACY_SERIES_ROTATIONS`.
- Comutar a tabela vigente por data local: antes de 04/11 mantém a anterior e mostra a próxima apenas como **prévia não vigente**; 04–17/11 usa a nova; após 17/11 não oferece foco/engenheiro baseado numa rotação vencida.
- Reutilizar `rotationAt` em prioridades, Engenheiro de Duelos e `gbr-strategy-reference.js`, sem introduzir novas fontes de verdade.
- `mixed` corresponde ao termo “Misto” da imagem, nunca a uma probabilidade de chuva; não são produzidas estratégias numéricas de pneus sem durabilidade confirmada.
- Reempacotar o `_worker.js` apenas com o mesmo conjunto de 193 arquivos públicos e atualizar o manifesto de integridade. Nenhum documento de auditoria ou teste vira rota pública.

Alternativa rejeitada: sobrescrever a tabela antiga ou alterar o mapa genérico de pistas `TRACK_SERIES` em `app.js` (perderia histórico e poderia contaminar a análise de GPs).

## Portão de escalabilidade, AppSec e rollback

**OK:** custo estático O(12), nenhuma requisição de rede nova e nenhum armazenamento adicional. Não lê nem altera contas, token, autenticação, Supabase, RLS, garagem, favoritos, Baús nem dados de outros jogadores. A camada de Duelos permanece separada dos eventos. O Worker mantém a política de negar acesso a arquivos privados (ADR 0002). Porta de mão dupla: reversão por reimplantação do ZIP anterior, sem migração de dados.

## Evidências e testes

- `tests/duelos-rotacao-0411-1711.test.js`: compara todas as 12 linhas da imagem, vigência, rotação anterior, mudança 03→04/11, expiração em 18/11, fonte de estratégia, ausência de stints inventados e prévia identificada.
- `tests/mega-worker-20261029.test.js`: compara byte a byte todos os 193 recursos, verifica `HEAD`, `POST` 405 e rotas internas 404.
- Os outros cinco testes do ZIP foram mantidos. Homologação visual no Safari e verificação no jogo permanecem pendentes.

## Fontes orientadoras consultadas

1. `engenheiro-de-segurança.txt` — *Regras de Conduta*, itens 1–8; negar por padrão, prova e rollback.
2. `arquiteto-de-software.txt` — *Portão de Escalabilidade* e *Protocolo de reversão*: mudanças pequenas, reversíveis, sem dependências extras.
3. `persona-planejadora.txt` — *Limites de Atuação* e *Critérios de Parada*: somente os campos explicitamente fornecidos, sem inventar estratégia.
4. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt` — *Regra Principal*, identificação da causa raiz e arquivos afetados.

Documentação da versão instalada: Node.js v22 usado nos testes do pacote, sem dependências de NPM. ADRs 0002, 0006 e 0008 do ZIP consultados; 0002 mantém o Worker público restrito, 0006 separa Pit Wall de dados do jogador, 0008 mantém a Final de São Paulo sem alterações.
