# Manual de Projeto e Padrões de Arquitetura — GBR Racing Lab

> **STATUS: APROVADO PELO RESPONSÁVEL EM 16/10/2026 — DIRETRIZ OFICIAL DO PROJETO.** Aprovação documental; não implica controles já implementados ou liberação automática para mudanças em produção.  
> Base: três fontes disponíveis (`arquiteto-de-software.txt`, `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, `persona-planejadora.txt`), repositório GitHub `gssgabrielsantos20-hash/GBR-RACING-LAB` (commit `e82562b`), diagnóstico Fase A de 16/10/2026, metadados read-only do Supabase/Cloudflare.  
> **Proveniência:** documento elaborado a partir das fontes indicadas e aprovado expressamente em 16/10/2026. Não é transcrição de protocolo AppSec preexistente; requisitos técnicos são diretrizes, não evidência de implementação.

## 1. Escopo e baseline

Produto: app web/PWA de F1 Clash 2026 para usuários de academia, com garagens privadas, Montador, Biblioteca de Pistas, Duelos, Eventos GP, Baús, equipes, Biblioteca Visual, central de avisos e importação assistida.

- Repositório privado: `gssgabrielsantos20-hash/GBR-RACING-LAB`, branch `main` (commit verificado `e82562b`).
- Pasta atual do app: `GBR_Racing_Lab_5_5_5_HILL_CORRIGIDO_VALIDADO/`.
- Interface: HTML/CSS/JS em arquivos estáticos (não afirmar uso de framework não demonstrado); roteamento/tabulação no cliente.
- Publicação: Cloudflare Pages, projeto `gbr-racing-lab`, deploy por upload ad hoc, Worker `_worker.js` (aproximadamente 5,4 MB no repositório).
- Dados/Auth: Supabase (PostgreSQL 17 em 16/10/2026, `supabase-js` no cliente); estado da garagem sincronizado em `garage_states`, controle de revisão no `cloud.js`.
- RLS: habilitado nas 11 tabelas públicas auditadas; comportamento negativo precisa de testes; não presumir camada de domínio independente do fornecedor implementada.
- Métricas de usuários, p95/p99, disponibilidade, custo, taxa de erros: **não verificadas**. Não fixar SLO sem aprovação.

## 2. Mapa inicial dos módulos e responsabilidades

| Arquivo/módulo | Responsabilidade observada | Observação |
|---|---|---|
| `index.html`, CSSs, `mobile-premium.js` | Estrutura e apresentação responsiva | Priorizar navegação/operabilidade iPhone e PC |
| `app.js`, `catalog.js` | Estado de garagem, cálculos, UI de pistas/Montador | Atenção à concentração de responsabilidades de `app.js` |
| `cloud.js`, `config.js` | Sessão, login, integração Supabase, sincronização e controles de revisão | Config somente de credenciais publicáveis |
| `garage-plus.js` | Cadastro e importação por print/OCR | Não gravar automaticamente interpretações incertas |
| `card-art.js`, `auditoria-imagens.js` | Resolução, edição e sincronização de imagens | Chaves distintas Graham/Damon Hill |
| `gbr-intelligence.js` | Duelos Série 10/11/12 e setups de referência | Rotação 07–20/10/2026 precisa atualização após vigência |
| `chests.js` | Controle, posição, calibração e localizador de baús | Preservar histórico e estado |
| `events-gp.js`, `builder-plus.js` | Eventos GP e ferramentas de setup | Comparar cálculos e restrições às regras do jogo verificadas |
| `notices.js` | Avisos da academia e notas | Última nota Supabase encontrada: v5.5.4 |
| `sw.js`, `manifest.webmanifest`, `_worker.js` | PWA e entrega de arquivos | Não assumir offline sem teste real |

## 3. Padrões arquiteturais propostos

1. **Preservar comportamento existente:** nenhum módulo pode perder função sem critério de aceite explícito; modificar uma camada por vez; mapear todas as chamadas antes de refatorar.
2. **Responsabilidades separadas:** regras de F1 Clash e autorização devem poder ser testadas independentemente da UI e, quando evoluídas, independentes do fornecedor Supabase; não introduzir abstrações desnecessárias.
3. **Autorização em profundidade:** camada de domínio/serviço independente + enforcement no servidor/RLS; nunca confiar somente em estado visual ou cliente.
4. **Fonte da verdade:** usuário/identidade e garagem por `user_id` com atualização condicional `revision`; não alterar schema/regras de conflito sem plano de migração.
5. **APIs, dados e migrações:** não quebrar contratos; migrações versionadas e reversíveis quando possível; nunca reaplicar SQL histórico sem conferir migrações atuais.
6. **Fontes externas/IA:** tratar dados recuperados como não confiáveis, anotar origem e vigência; regras determinísticas devem ficar no código; prompts não substituem autorização/cálculos; nenhuma integração IA implementada foi verificada.
7. **Escalabilidade:** avaliar 1x/10x/100x (índices, paginação, limites, idempotência, retries, fila/worker quando justificado, observabilidade e custo) antes de escolher; não alegar capacidade sem teste.
8. **UX e PWA:** preservar iPhone/PC, acessibilidade, estados vazios, fluxo de edição de garagem, dados offline somente quando suportados e testados.
9. **Rastreabilidade:** commit, artefato, manifesto, preview, deployment `success` e notas de versão ligados à mesma entrega; manter rollback anterior identificado.
10. **ADRs:** registrar decisões estruturais sob `docs/adr/NNNN-titulo.md`, com alternativas, escala, reversibilidade e gatilho de revisão; pasta ainda não identificada no repositório auditado.

## 4. Portão de escalabilidade

Antes de implementar: 10x de usuários/dados/concorrência; estado em memória; índices/N+1/limites/paginação; necessidade de filas; idempotência; custos; porta de mão única/dupla; logs/métricas; falha de terceiros; segurança/isolamento. Classificar OK / ATENÇÃO / REPROVADO com evidências. Se REPROVADO e bloqueante, não empilhar features.

## 5. Pipeline obrigatório de mudança

Demanda + critérios de aceite → consultar 4 fontes e docs técnicas → inspeção do fluxo/código + baseline → alternativas → análise AppSec e escala → plano com arquivo/função → aprovação quando requerida → branch/alteração mínima → teste automatizado e manual → preview → aprovação de produção → deploy → validação iPhone/PC, Supabase/segurança e rollback verificável → notas/ADR.

## 6. Pendências técnicas sem decisão tomada

- Link GitHub→Cloudflare ausente; `source: null` em Pages: validar equivalência de artefatos antes de automatizar deploy.
- `card-art.js` limita leitura a 1.500 imagens: confirmar paginação necessária com métricas.
- Arquivos de teste reexecutáveis/CI não identificados; criar somente após aprovar padrões/escopo.
- Dependências/bibliotecas de CDN e respectivas versões devem ser inventariadas antes de mudanças.
- Dados de usuários, limites de planos, backups/restauração, metas de capacidade e camada de autorização de domínio: **não verificados**.