# Relatório técnico — S9 ausente na interface de Duelos

## Objetivo, diagnóstico e evidência

A captura de tela iPhone fornecida em 04/11/2026 mostra a Série 9 selecionada, mas o aviso antigo menciona apenas as Séries 10, 11 e 12. O ZIP imediatamente anterior já continha S9 em `gbr-intelligence.js` (`SERIES_ROTATIONS[9]`), bem como a atualização de `index.html` com query string de versão. Portanto, existe divergência entre o que a captura exibe e o que esse ZIP distribui. **Não foi comprovado** se é versão antiga publicada, cache no Safari/PWA ou erro adicional no ambiente remoto.

## Alterações locais desta prévia

- `gbr-intelligence.js`: `mount()` inclui informação explícita sobre S9–S12; `rotationHTML()` coloca título da série e total de pistas; `syncDuelTrackOptions()` separa a rotação vigente no topo do seletor sem remover as demais pistas; `refresh()` sincroniza seletor e calendário. Alteração de série desmarca a pista anterior, evitando cenário inconsistente.
- `gbr-intelligence.css`: indicação de série legível em telas compactas.
- `index.html`: versionamento de script e CSS para reduzir risco de retenção de assets antigos no navegador.
- `tests/duelos-s9-ui-20261104.test.js`: teste funcional do HTML gerado, da seleção e de ciclos independentes.
- `_worker.js` e `AUDITORIA_MANIFEST_PUBLICOS_SHA256.json`: regenerados para incluir os arquivos alterados na distribuição embutida, com hash verificado.
- `docs/adr/0011-rotacao-duelos-series-9-a-12-video-20261104.md`: registro da correção e rollback.

## Fontes consultadas

1. `engenheiro-de-segurança.txt`, Regras de Conduta; Etapas 2, 3 e 9 — preservar autorização e RLS; scripts públicos não podem receber chaves privilegiadas. Nenhuma alteração em autenticação/banco.
2. `arquiteto-de-software.txt`, Portão de Escalabilidade, Etapas 8, 10 — mudanças reversíveis, frontend sem polling; validar regressões.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, Seções 1, 2, 10 — localizar o código e implementar por camada, com testes.
4. `persona-planejadora.txt`, Seções 3–5 — não inventar funcionalidades; requisitos ausentes não são pressupostos. Manual de projeto, manual de testes e persona de testes adicionais mencionados nessa fonte **não foram encontrados**; alteração restrita à renderização já conhecida.

## Segurança, impactos e escalabilidade

Portão de Escalabilidade: **OK para esta correção de UI**, que usa dados locais estáticos (4 pistas por série) e não cria consultas, contratos de API, sessão ou persistência. Estado de seleção é do formulário, sem escrita em banco. Nenhuma função do modelo de recomendação foi alterada. Custo de renderização do seletor é linear no número reduzido de circuitos. Porta de mão dupla. Sem mudanças de clima ou validade inferida.

## Validação e limites

Os testes locais comprovam modelos de rotação e montagem do seletor. Ver detalhes de execução no resumo da entrega. Acesso ao Safari real, cache do iPhone, autenticação, políticas do Supabase e publicação na Cloudflare **não são validados** por esses testes. O Chromium em modo headless não concluiu a captura visual neste ambiente, portanto não é contado como teste aprovado.

## Plano de reversão e implantação

1. Publicar primeiro em homologação e conferir em aba privada do Safari.
2. Validar S9, troca de série e regressões com a garagem; conferir se a versão servida contém `gbr-intelligence.js?v=20261104s9ui2`.
3. Somente após aprovação, implantar em produção.
4. Rollback pelo ZIP anterior `GBR_LAB_04NOV_ROTACAO_S9_S12.zip` sem mudanças em banco.
