# Melhorias de desempenho, correção e UX — 18/11/2026

Base: `GBR_RACING_LAB_WORKER_SINCRONIZADO_18NOV2026.zip` (publicado em produção em 18/11/2026).

## Correção
| Item | Antes | Depois |
|---|---|---|
| Cartão "Evento GP" no Início | GP Las Vegas com arte do GP dos EUA (regra só `.png`) | Arte correta; Catar (25/11, `.webp`) também coberto |

## Desempenho
| Item | Antes | Depois |
|---|---|---|
| Cache de código/páginas | `no-store` (rebaixa tudo) | `no-cache` + ETag → 304 sem corpo |
| Cache de imagens `/assets/` | `no-store` | 1 dia |
| Imagem padrão do cartão de evento | `us-gp-2026.png` (1,5 MB) baixada sempre | placeholder transparente |

## UX
- Atalhos do Início: nome uma vez só; sem "Toque para abrir".
- Duelos: cartões à esquerda com etiquetas (piloto, carro, voltas, clima). Clima ausente continua explícito.
- Celular: evento GP logo após o destaque, antes dos indicadores.
- Montador: perfil, pit stop e pesos em "Ajustes avançados" recolhido (≈300 px a menos).

## Segurança — SDK do Supabase (ADR 0023)
- SDK oficial 2.57.0 hospedado em `assets/js/vendor/supabase.js` (129.604 bytes, SHA-256 conferido com o hash publicado pelo jsDelivr).
- Loader: cópia local → jsDelivr → unpkg, todas com `integrity="sha256-FJmM+nlMH6s/izxFy6pgyjchr1O4rKv6J2WPRT5Ssmc="`. Removidas esm.sh e jsDelivr `+esm`.
- Chrome: SDK real carrega da cópia local, sem chamar CDNs; cópia adulterada é bloqueada e não executa.
- **Não verificado:** login real contra o Supabase (sem rede neste ambiente).

## Não aplicado (e por quê)
- **Imagens PNG pesadas → WebP:** os caminhos `.png` são exigidos por testes de eventos; converter exige atualizar esses testes. Mitigado pelo cache de 1 dia.
- **Texto pequeno do logo no celular:** está dentro do SVG da marca; alterar é decisão de identidade visual.
- **Texto "Rotações verificadas: Séries 9…"** em Duelos: exigido literalmente por `duelos-s9-ui-20261104`.
- **Menu "Mais" com itens repetidos:** remover entradas é decisão de produto.
- **Aviso do modo demonstração:** já some sozinho em 4,5 s (observação anterior incorreta).
- **Expiração da rotação:** já tratada no código (após 01/12 mostra "Vigência encerrada… aguardando nova rotação").

## Testes (executados em 18/11/2026, Node 22, neste pacote)
26 de 31 passaram (antes: 24 de 30), também após o SRI. `mega-worker` voltou a passar; novo `regras-estruturais-20261118` passou e foi validado negativamente (detecta a regra antiga só `.png`).
As 5 falhas restantes são as mesmas do pacote original, com as mesmas mensagens: `boost-art-link`, `contexto-unificado`, `duelos-rotacao-0411-1711`, `duelos-s9-ui`, `event-photos` (esperam valores de rotações/eventos já substituídos).

Verificação visual: celular 390px e desktop 1440px, modo demonstração, sem erros de console. Login, garagem e Supabase não testados (sem rede neste ambiente).

## Homologação sugerida
1. Prévia do Cloudflare Pages.
1a. **Login com e-mail/senha e sair** (valida o SDK com SRI). No console, nenhum erro de integrity.
2. Início (celular): GP Las Vegas logo abaixo do destaque, com a arte de Las Vegas.
3. Duelos: etiquetas legíveis nos temas escuro e claro.
4. Montador: "Ajustes avançados" abre/fecha; calcular setup com pista selecionada.
5. Recarregar a página duas vezes e conferir no DevTools (Rede) respostas 304 para .js/.css.
6. Login com duas contas e garagem: sem mudança esperada.

## Rollback
Tudo: restaurar `GBR_RACING_LAB_WORKER_SINCRONIZADO_18NOV2026.zip`. Só o SRI: restaurar `supabase-sdk-loader.js` e `_worker.js` de `GBR_RACING_LAB_MELHORIAS_CACHE_UX_18NOV2026.zip`.

Não houve publicação no Cloudflare, push no GitHub nem alteração no Supabase.
