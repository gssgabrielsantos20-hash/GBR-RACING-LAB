# ADR 0023 — SDK do Supabase hospedado no pacote, com verificação de integridade (SRI) (18/11/2026)

**Status:** incorporado ao pacote de homologação; não publicado.

## Contexto
`supabase-sdk-loader.js` buscava o SDK 2.57.0 em unpkg (`<script>`), esm.sh e jsDelivr `+esm` (`import()`), sem verificação de integridade. Uma CDN comprometida executaria código arbitrário com acesso à sessão do usuário, e a queda das CDNs derrubava o login.

## Decisão
- Cópia oficial de `@supabase/supabase-js@2.57.0/dist/umd/supabase.js` em `assets/js/vendor/supabase.js`, servida pelo Worker (rota adicionada com `tools/sincronizar-worker.mjs --add=...`, opção nova e explícita).
- Ordem do loader: cópia local → jsDelivr → unpkg, todas `<script>` com `integrity="sha256-FJmM+nlMH6s/izxFy6pgyjchr1O4rKv6J2WPRT5Ssmc="` e `crossorigin="anonymous"`.
- Removidas esm.sh e jsDelivr `+esm` (via `import()`, sem SRI possível).
- Regra automatizada (`tests/regras-estruturais-20261118.test.js`): fonte local primeiro; toda fonte `<script>` com `integrity`; arquivo local confere byte a byte com `SDK_INTEGRITY`; rota servida pelo Worker.

## Evidência (18/11/2026)
- Hash oficial lido do índice do jsDelivr (`data.jsdelivr.com/v1/packages/npm/@supabase/supabase-js@2.57.0?structure=flat`) por dois caminhos independentes, com valor idêntico.
- Arquivo obtido de `unpkg.com` (via Firecrawl): 129.604 bytes, SHA-256 igual ao hash oficial (SHA-256 hex `14998cfa794c1fab3f8b3c45cbaa60ca3721af53b8acabfa27658f453e52b267`).
- Chrome, servido pelo próprio Worker: o SDK real carrega da cópia local com SRI verificado pelo navegador; `createClient`, `auth.signInWithPassword` e `from` disponíveis; nenhuma requisição às CDNs.
- Cópia local adulterada (1 trecho anexado): bloqueada pelo navegador ("Failed to find a valid digest in the 'integrity' attribute"), código adulterado não executou, loader tentou as CDNs.
- Simulação com CDNs interceptadas: adulterado → bloqueado; íntegro → carrega; queda/adulteração da primeira → a seguinte assume.

**Não verificado:** login ponta a ponta contra o Supabase real (sem rede neste ambiente). Validar na prévia.

## Consequências
- O login deixa de depender de terceiros no caminho normal; CDNs só como reserva.
- +129,6 KB no Worker; o arquivo fica 1 dia em cache no navegador (`/assets/`).
- Trocar a versão do SDK exige atualizar arquivo local, URLs e hash juntos; o teste de regra acusa divergência.

## Reversibilidade
Porta de mão dupla. Rollback: restaurar `supabase-sdk-loader.js` e `_worker.js` de `GBR_RACING_LAB_MELHORIAS_CACHE_UX_18NOV2026.zip`.
