# ADR 0015 — Prioridades de pista e estado meteorológico coerentes

**Data:** 05/11/2026  
**Status:** aceito para prévia local; produção ainda requer homologação.

## Contexto

`app.js` consultava `GBRIntelligence.priorityFor()` para Pistas, mas `builder-plus.js` consultava apenas `TRACK_SERIES`. O Assistente de Duelos não preenchia seus focos com a pista escolhida. `builder-plus.js` e `boosts-plus.js` presumiam `dry` ao não encontrar condição meteorológica. A tela de Pistas fazia a mesma suposição no seletor e calculava stints secos por padrão.

## Decisão

1. Centralizar as prioridades no resolvedor `resolveTrackContext(trackId,series,asOf)` de `app.js`, publicado por `F1Tracks.resolveContext`. Fonte priorizada: rotação **vigente** `GBRIntelligence.priorityFor`; fallback identificado como comunidade ou indicativo. Não reclassificar referência vencida como atual.
2. Pistas, Montador e seletor do Assistente de Duelos usam a mesma resolução. No seletor de Duelos, troca de pista preenche focos, mas os campos permanecem editáveis; mudança de série que invalide a pista zera os focos.
3. Representar clima **não informado** como `null`, preservando `dry`, `wet` e `variable` apenas quando expressos. Não gerar plano de stints se falta clima; boosts mostram orientação condicional, não previsão de seco.
4. Recarregar a ficha de Pistas após inicialização do módulo de rotação, sem tocar em contas ou sincronização.

## Alternativas

- Duplicar `priorityFor` no Montador: rejeitado; facilitaria divergência.
- Tornar toda pista sem rotação inválida: rejeitado; eliminaria acesso ao catálogo comunitário, que permanece com aviso.
- Migrar preferências de clima antigas: rejeitado; o valor `dry` já salvo pode ter sido escolha explícita ou preenchimento da interface antiga. Não há como distinguir sem evidência.

## Impacto, segurança e escala

Somente módulos JS/HTML estáticos. Sem esquema, API, privilégios, RLS ou segredos novos. Consulta local O(1) ao mapa de prioridades por série mais busca em catálogo de circuitos pequeno. Porta de mão dupla: revertendo os cinco scripts e a página do pacote anterior; o estado da garagem existente é preservado. Não há prova de ganho de desempenho ou maior taxa de vitória.

## Aceite / limitação

Teste determinístico do resolvedor vigente e após expiração S9/S10; prioridade consistente entre telas; clima desconhecido bloqueia plano de stints e não vira seco para boosts; regressão de Duelos, eventos e garagem. Safari/iPhone e sincronização Supabase real ainda requerem homologação. Verificar preferências de clima `dry` salvas anteriormente com o próprio usuário.
