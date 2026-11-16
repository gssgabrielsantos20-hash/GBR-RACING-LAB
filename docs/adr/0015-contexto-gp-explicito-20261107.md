# ADR 0015 — Contexto explícito de etapa/corrida no GP

**Data:** 07/11/2026  
**Status:** implementação local para homologação, sem publicação.

## Contexto e evidência

`events-gp.js` calculava `selectedRoundData=currentRace(event)` a partir de `selectedStage`/`selectedRound` mantidos na Central de Eventos, inclusive quando a chamada partia do Pit Wall com outra pista. Em teste reproduzível, ao solicitar Suzuka pelo Pit Wall enquanto a primeira prova seca de São Paulo estava selecionada na Central, `computeSetup(...,'suzuka')` devolveu `weather='dry'`, contradizendo o calendário do evento (`opening[4].rain=100`). O problema afeta contexto de boosts e pneus.

## Decisão

Permitir um quinto argumento opcional `raceContext={stage,round}` em `GBREvents.computeSetup`, fornecido explicitamente pelas telas de Eventos e Pré-GP. Sem etapa/corrida explícita (chamada do Pit Wall), usar apenas o consenso de **todas** as ocorrências da pista no calendário do evento, sem herdar a seleção de outra interface. Se as ocorrências discordam sobre chuva/voltas, retornar campo desconhecido. Não inventar clima, desgaste, stints ou probabilidade de vitória.

## Alternativas

- Manter estado global: descartado, mistura provas diferentes.
- Fixar condições apenas pelo circuito: descartado, uma mesma pista pode aparecer em climas diferentes.
- Exigir etapa para todos os atalhos: alto custo de UX para Pit Wall; consenso quando inequívoco mantém o atalho útil.

## Impacto e rollback

Mudança aditiva e reversível, sem esquema ou API remota alterados e sem escrita na garagem. Custo proporcional ao número de corridas no calendário, pequeno e limitado nesta versão. Para reverter, restaurar `events-gp.js`, `gbr-pre-gp-ui.js`, `index.html` e `_worker.js` do ZIP-base, junto ao manifesto anterior. Regression T08, T10, T14 e T16 aplicáveis. A QA do iPhone/Supabase não está comprovada nesta entrega.
