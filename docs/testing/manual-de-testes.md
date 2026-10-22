# Manual de Testes e Regressão — GBR Racing Lab

> **STATUS: APROVADO PELO RESPONSÁVEL EM 16/10/2026 — DIRETRIZ OFICIAL DO PROJETO.** Aprovação documental; não implica controles já implementados ou liberação automática para mudanças em produção.  
> Base: três fontes disponíveis (`arquiteto-de-software.txt`, `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, `persona-planejadora.txt`), repositório GitHub `gssgabrielsantos20-hash/GBR-RACING-LAB` (commit `e82562b`), diagnóstico Fase A de 16/10/2026, metadados read-only do Supabase/Cloudflare.  
> **Proveniência:** documento elaborado a partir das fontes indicadas e aprovado expressamente em 16/10/2026. Não é transcrição de protocolo AppSec preexistente; requisitos técnicos são diretrizes, não evidência de implementação.

## 1. Objetivo

Provar que cada alteração preserva os fluxos essenciais e não enfraquece segurança, consistência, UX, performance ou operação. **Todos os casos abaixo são planos; não foram executados nesta entrega documental.**

## 2. Ambientes e preparação

- Verificar commit exato do GitHub e conteúdo/manifesto do deployment de preview antes de testar. Não testar DDL/permissões destrutivas diretamente na produção.
- Preparar usuários de teste específicos: anônimo, membro A, membro B, administrador; nenhuma conta real deve ter dados apagados.
- Usar dados fictícios isolados e backups verificáveis; chaves nunca em logs, exemplos ou capturas compartilhadas.
- Inventariar runtime/browser/versões dependentes no relatório; checar iPhone Safari real e navegador PC quando possível.
- Comandos `node --check` só são válidos quando Node estiver disponível e os arquivos locais forem os testados; não deduzir testes de relatório passado.

## 3. Pirâmide de testes

| Camada | Exemplos | Evidência esperada |
|---|---|---|
| Checagens estáticas | parsing JS, referências HTML→arquivos, dependências versionadas, secrets, policy migrations | saída real, commit/sha, arquivo |
| Unitários | cálculo de otimização, rotação/vigência, baús/ciclo, resolução de nomes, serialização/revisão | testes automatizados determinísticos |
| Integração | Supabase Auth, RLS, `garage_states`, biblioteca visual, RPC admin, avisos | requests e expectativas com identidades de teste |
| E2E/UI | login, recuperação, garagem, seleção de pista, clique nos Duelos, print/OCR, baús, mudança de tela | execução em desktop e Safari iPhone com registro |
| Resiliência/escala | desconexão, conflito de `revision`, limitação de consulta, falha de terceiros, 1x/10x | métricas p95/erro/carga quando aprovadas |

## 4. Matriz mínima de regressão (proposta)

| ID | Fluxo | Cenário mínimo e resultado esperado | Prioridade |
|---|---|---|---|
| T01 | Identidade | cadastro, confirmação, login, logout e recuperação preservados | P0 |
| T02 | Isolamento | membro A não lê/grava garagem de B em chamadas diretas | P0 |
| T03 | Conflito | duas sessões com revisões concorrentes não apagam alterações silenciosamente | P0 |
| T04 | Administração | usuários anon/comum não administram equipes nem publicam imagens/avisos | P0 |
| T05 | RLS/Storage | upload permitido ao admin, negado ao comum; nenhum arquivo privado exposto | P0 |
| T06 | Cadastro garagem | importar/exportar e editar itens sem duplicação, perdas ou alterações involuntárias | P0 |
| T07 | Hill | Graham Hill ≠ Damon Hill em busca, galeria, fallback, OCR, referências e imagens | P1 |
| T08 | Pistas/Duelos | atalho de rotação abre circuito correto e não troca involuntariamente garagem | P1 |
| T09 | Vigência | 07–20/10 ativa, dia anterior/final/posterior com estado correto; próximo ciclo exige nova fonte | P1 |
| T10 | Eventos/Montador | série, raridade, propriedade das cartas e restrições de GP respeitadas | P1 |
| T11 | Baús | sequência, calibração, posição, histórico, desfazer e persistência consistentes | P1 |
| T12 | Imagens | prioridade compartilhada/local/fallback; ausência de imagem; URL inválida; sync em dois aparelhos | P1 |
| T13 | Avisos | admin publica/edita/exclui; membro lê; nota de versão corresponde a deploy validado | P1 |
| T14 | Mobile | Safari físico: toque, modais, viewport, teclado, scroll, login e recarga | P1 |
| T15 | Falha/recuperação | indisponibilidade Supabase, retries finitos, estado não perdido, mensagem compreensível | P1 |
| T16 | Release | manifesto, `_worker.js`, routes 200/404/405, assets e volta a deployment anterior | P0 |
| T17 | Escala | medidas base/10x, consultas paginadas e isolamento de cache sem regressão | P2 |

## 5. Segurança — casos negativos

Para cada RPC `SECURITY DEFINER`: verificar grants e corpo, requisição anônima, membro comum, administrador e entrada inválida **apenas em ambiente autorizado**, sem alterar dados reais. Testar permissões para `garage_states`, imagens e notices. Testar valores maliciosos para campos de texto/URL, XSS na apresentação, escopo de tenant, limites de upload e brute force/rate-limit com configuração segura de teste. Não realizar exploração disruptiva em produção.

## 6. Resultado e aprovação de teste

- Anotar ID, build/commit, ambiente, pré-condição, passos, esperado, observado, status (`PASSOU`, `FALHOU`, `BLOQUEADO`, `NÃO EXECUTADO`), evidência e responsável.
- Um teste marcado `PASSOU` exige execução observada. `NÃO EXECUTADO` não pode ser convertido em êxito por inspeção do código.
- Critério proposto de liberação: T01–T06 e T16 concluídos sem falhas bloqueantes; escopo afetado com testes adicionais; aprovação de usuário para produção e plano de rollback testável.
- Erros intermitentes devem ser investigados e documentados; não esconder falhas por repetição infinita.

## 7. Falhas e rollback

Interromper release quando houver falha de isolamento, dados, auth, quebra de import/export ou regressão severa. Guardar artefato/ID da implantação anterior. Uma alteração em banco requer restauração ou plano de reversão compatível; não prometer reversão automática de perda de dados.

## 8. Pendências

Versões de runtime/SDK, comandos locais de testes, conta de homologação, automação de CI e metas SLO não verificados. Definir esses pontos depois de inspecionar ambiente e aprovar os documentos.