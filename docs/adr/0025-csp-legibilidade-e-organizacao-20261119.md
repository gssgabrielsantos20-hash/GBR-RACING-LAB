# ADR 0025 — CSP, legibilidade, prévia de link e organização (19/11/2026)

**Status:** incorporado ao pacote de homologação; não publicado.

## Decisão
1. **CSP no Worker:** `script-src 'self'` + hash do único script inline (registro do service worker) +
   jsDelivr e unpkg (reserva do SDK); `connect-src` só para o Supabase do projeto; `object-src 'none'`;
   `base-uri`/`form-action 'self'`; `frame-ancestors 'none'`. `img-src https:` mantido amplo porque
   artes de cartas vêm do Storage e de referências externas. `style-src` mantém `'unsafe-inline'`
   (15 estilos inline no HTML e estilos aplicados por script).
2. **Biblioteca Visual:** continua no site (escrita já protegida no banco), agora com
   `X-Robots-Tag: noindex` e bloqueada no `robots.txt`. Tirar do site depende do responsável.
3. **Legibilidade no celular (≤ 700 px):** rótulos com mínimo de 11 px, textos auxiliares 12 px, alvos
   de toque de 44 px, contraste do aviso do login elevado. Rótulos dos indicadores quebram em 2 linhas.
4. **Prévia de link:** `og:*`, `twitter:card` e `canonical` com a arte existente
   `assets/og-brand-1200x630.png`; `favicon.ico` e `robots.txt` adicionados ao Worker.
5. **Artes de eventos:** 4 PNG recomprimidas (256 cores, mesmo caminho e formato): 3,6 MB → 0,9 MB.
6. **Interface:** removido "5.0" do rótulo "MONTADOR COMPLETO".
7. **Organização:** 47 relatórios para `docs/relatorios/`, 6 manifestos para `docs/manifestos/`;
   `README.md`; `package.json` com `npm test`, `worker:sync` e `worker:check`.

## Não aplicado (e por quê)
- **Build com bundler:** sem rede no ambiente para instalar esbuild; juntar os 64 arquivos à mão
  quebraria 8 testes que conferem as tags `<script>` e arriscaria a ordem de carregamento.
- **WebP nas artes de eventos:** 7 testes que passam exigem os caminhos `.png`.
- **Tokens de design e redução dos 23 CSS / 535 `!important`:** refatoração grande (G), precisa de
  rodada própria com revisão visual tela a tela.
- **Logo compacto, menu "Mais", um rótulo por tela:** decisões de marca e produto.

## Evidência
Chrome com o Worker do pacote: nenhuma violação de CSP; textos < 11 px de 41 para 8; alvos < 44 px
de 10 para 1 (43 px). `npm test`: 26 de 31 (mesmas 5 falhas antigas).

## Reversibilidade
Mão dupla. Rollback: `_worker.js`, `index.html`, `mobile-premium.css` e as 4 artes de
`GBR_RACING_LAB_MELHORIAS_SDK_LOCAL_18NOV2026.zip`.
