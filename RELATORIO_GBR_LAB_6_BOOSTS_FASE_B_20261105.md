# GBR LAB 6 — Fase B / Boosts — relatório de implementação (05/11/2026)

## Escopo autorizado
Dar continuidade à primeira implementação de Boosts com catálogo nominal e recomendação condicionada à quantidade informada. **Não foi publicado** no Cloudflare, GitHub ou Supabase. Nenhuma garagem foi modificada; nenhum dado é enviado ao AllClash.

## Fontes efetivamente consultadas
1. `engenheiro-de-segurança.txt`: regras de conduta, RLS, entradas e segredos. Preservar contas e dados privados.
2. `arquiteto-de-software.txt`: portão de escalabilidade e mudanças reversíveis com rollback.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: investigar código antes de alterar, modularidade e testes.
4. `persona-planejadora.txt`: sequência e critérios de parada, sem novas regras não autorizadas.
5. `REGRAS-DE-ORIGINALIDADE.txt`: não copiar interface ou rankings, marcar dados de jogo não testados.
6. Documentos de governança **encontrados na Biblioteca**, aprovados em 16/10/2026: `01-protocolo-appsec.md`, `02-manual-projeto.md`, `03-desenvolvedor-senior.md`, `04-manual-de-testes.md`, `05-persona-testes.md`. Não são prova de controles implementados hoje.
7. Anexos `GBR_LAB_6_VARREDURA_ALLCLASH_05NOV2026.md` e `GBR_LAB_6_LEVANTAMENTO_FINAL_ALLCLASH_05NOV2026(1).md`: levantamento público e limites; ainda não é confirmação de estatísticas no jogo.
8. Hutch: https://hutch.helpshift.com/hc/en/10-f1-clash/faq/1489-what-do-the-boosts-symbols-mean/ — Boosts não modificam Qualificação; consumo ao largar e por parada.
9. AllClash S5, S10–S12 e São Paulo: referências públicas para campos nominais; nenhuma tabela completa, ranking, algoritmo ou conteúdo PRO foi importado.
10. Conversa `analisar melhorias F1 Clash` recuperada: manter cálculos próprios, evitar importação cega, respeitar dados da garagem e prioridade de boosts antes de pneus/peças.

## Diagnóstico e intervenção
Baseline: `GBR_RACING_LAB_EVENTOS_CLOUDFLARE_DEPLOY.zip`, SHA-256 `856bde96b1acc9c4374cb565542e55e62be573d7ed1f4be498473868285cf4f7`. Frontend HTML/CSS/JS, PWA, Worker e Supabase no fluxo original. A versão corrente foi comparada à baseline. Preserve explicitamente todos os módulos de garagem, eventos, Duelos, Pódio, baús, equipes, imagens, sincronização e autorização sem alterações.

- `gbr-boost-catalog.js` (novo): 11 entradas públicas (5 iniciais + 6 clássicos identificados), somente atributos presentes em fontes; registra `source`, `verifiedOn` (data da revisão, não teste no jogo), `confidence` e divergências. Inclui função `rank` independente da UI e de fornecedores; estoque vazio não significa posse e o escore é apenas heurístico.
- `boosts-plus.js` / `inventorySection()`, `suggestionsHTML()` e `render()`: leitura transitória de quantidade, cálculo `1 + paradas` por piloto, filtros de clássicos e conservação de pneus, orientações antigas preservadas, output escapado contra HTML arbitrário e limpeza ao trocar de garagem. Nenhuma gravação remota.
- `boosts-plus.css`: suporte visual aos campos e filtros.
- `index.html`: carregamento do catálogo antes da integração e revisão das query strings para reduzir mistura de versão no iPhone.
- `_worker.js` e `MANIFEST_PUBLICOS_BOOSTS_20261105_SHA256.json`: distribuição regenerada mantendo os bytes dos demais assets.
- `tests/boosts-catalog-20261105.test.js`: cenários de estoque desconhecido, quantidade zero/positiva, limites de paradas, conflitos, filtros, protótipos e não mutação da garagem.
- `docs/adr/0012-catalogo-boosts-referencia-local-20261105.md`: decisão e reversão.

### Conflito de referência (não resolvido automaticamente)
**Self Control:** o relatório anexado descreve +5 Pit Stop; o resultado público atual da S5 posiciona o +5 em Curvas. Mantidos apenas Gerenciamento de pneus +5 e Unidade de potência +5; terceiro atributo não importado. Item visível como pendente **não selecionável e fora do ranking** até print do jogo. Não presumir que ausência de campo equivale a zero.

## Validação local — resultados observados
- `node --check` em todos os JavaScripts do projeto e testes: **PASSOU**.
- Testes unitários de boosts, S9/S10/S11/S12, interface S9, coleções, imagens de eventos, Las Vegas/Catar, Pit Wall, Pódio Global, calendário São Paulo, auditoria de catálogo: **PASSOU**.
- `tests/worker-events-smoke-20261104.test.js`: 6 recursos servidos, 4 privados negados, POST negado: **PASSOU**.
- Reconstrução do Worker: 198 recursos públicos, byte a byte do diretório e manifesto: **PASSOU**.
- `tests/mega-worker-20261029.test.js`: **NÃO EXECUTADO**, teste conhecido por consumo excessivo de memória no ambiente; a cobertura de recursos foi feita por decodificação do manifesto e smoke test.
- Navegadores reais iPhone Safari / Windows e testes Auth/RLS/Supabase com A/B: **NÃO EXECUTADO**. Teste de carga e eficácia em corrida: **NÃO EXECUTADO**.
- Esta análise não constitui revisão externa ou comprovação de performance em corrida.

## Riscos, Portão de Escalabilidade e rollback
Portão: **ATENÇÃO, não bloqueante**. Catálogo estático (198 assets, 11 itens), sem rede por recomendação e sem novo estado persistente/consulta de banco, favorece custo previsível até 10x. Desempenho móvel, robustez com catálogos grandes e carga real **não verificados**. PWA pode manter HTML antigo no Safari: arquivos receberam versão distinta. O Worker usa `cache-control:no-store`. Catálogo parcial exige revisão com prints do jogo.

Rollback local: restaurar o ZIP baseline de SHA acima, inclusive `index.html`, `boosts-plus.js`, `boosts-plus.css` e `_worker.js`; o novo módulo deixa de ser referenciado. Não houve migração de dados. Em produção, rollback do Pages deve apontar para o deployment anterior após conferência do ID vigente; não assumir que o ID de 04/11 continue como último em 05/11.

## Próxima ação (separada desta Fase B)
Homologar visualmente no iPhone, validar em conta teste sem fuga entre usuários e comparar a versão efetiva do Cloudflare antes de autorizar publicação. Depois, abrir etapa de `gbr-strategy-reference.js` para chave completa evento/categoria/etapa/corrida/pista/voltas/clima/fonte; não importar dados PRO nem inventar pneus ou pilotos.
