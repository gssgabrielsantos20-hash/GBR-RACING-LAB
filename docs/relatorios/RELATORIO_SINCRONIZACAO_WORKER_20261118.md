# Sincronização do Worker — 18/11/2026

## Problema
A produção servia versões antigas de 3 arquivos, porque o payload do `_worker.js` não acompanhava os arquivos locais:
| Rota | Efeito em produção |
|---|---|
| `/events-gp.js` | GP Las Vegas: etapas 18–19 / 21–22 / 22–23/11 (correto: 18–20 / 21 / 22/11). Loucura dos Bigodes: fim 16/11 (correto: 15/11). |
| `/gbr-pre-gp-ui.js` | Sem o bloco de boosts recomendados por pista nos eventos GP. |
| `/gbr-pre-gp-engine.js` | Nota antiga ("sem inventário…") em vez da nota da recomendação nominal. |

Confirmado em `gbr-racing-lab.pages.dev` em 18/11/2026. A rotação S10–S12 já estava correta em produção.

## Alteração
- `_worker.js`: payload regenerado; somente as 3 rotas acima mudaram. SHA-256 anterior `5736aacd…0ade`, novo `fd804176…c243`.
- `tools/sincronizar-worker.mjs` (novo; não é servido pelo Worker).
- `docs/adr/0021-sincronizacao-reprodutivel-worker-20261118.md` (novo).
- `LEIA_PRIMEIRO_NOVEMBRO_2026.md`: contagem de arquivos embutidos corrigida de 177 para 205.
- Nenhum arquivo da aplicação (.js/.css/.html/assets) foi editado.

## Testes (executados em 18/11/2026, Node 22, neste pacote)
24 de 30 passaram, entre eles `las-vegas-calendar`, `event-cadence-wed-sun`, `gp-boost-recommendations`, `gp-event-track-boosts`, `moustache-madness`, `worker-events-smoke`, `tema-worker` e `boosts-worker-assets`.

As 6 falhas abaixo **já falhavam no pacote original** e não foram causadas por esta alteração. Não foram corrigidas porque exigem decisão sobre o comportamento esperado:
| Teste | Motivo observado |
|---|---|
| `mega-worker-20261029` | No original falhava em `/events-gp.js` (a própria defasagem). Agora as 210 comparações byte a byte passam; resta a contagem fixa `199` no teste. |
| `duelos-s9-ui-20261104` | Espera "Rotação vigente: 04/11/2026 a 10/11/2026" (rotação já substituída). |
| `duelos-rotacao-0411-1711` | Espera contexto de S9 Barcelona da rotação de 04–17/11. |
| `contexto-unificado-20261105` | Espera foco `tyreUse`; os dados atuais retornam `overtaking`. |
| `boost-art-link-20261105` | Espera o parâmetro de cache `?v=20261110boosttrack1` no HTML. |
| `event-photos-20261029` | Espera a foto de Nigel Mansell como imagem principal de São Paulo. |

## Homologação manual sugerida
1. Publicar em ambiente de prévia do Cloudflare Pages (não em produção).
2. Central de Eventos → GP Las Vegas: Qualificação 18–20/11, Abertura 21/11, Final 22/11.
3. Painel pré-GP: bloco de boosts recomendados aparece.
4. Duelos: rotação S10–S12 inalterada.
5. Login e garagem com duas contas: sem mudança esperada.

## Rollback
Restaurar o `_worker.js` do ZIP `GBR_RACING_LAB_ROTACOES_OFICIAIS_S10_S12_18NOV2026.zip`.

Não houve publicação no Cloudflare, push no GitHub nem alteração no Supabase.
