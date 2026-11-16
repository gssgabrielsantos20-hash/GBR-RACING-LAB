# ADR 0015 — Referências externas de imagens dos boosts (09/11/2026)

**Status:** aprovado como referência de navegação local; imagens não autorizadas para publicação.

## Contexto

O catálogo ativo do GBR contém 11 boosts. O guia público AllClash São Paulo Spectacular 2026 apresenta as imagens desses nomes e os URLs individuais responderam HTTP 200 em 09/11/2026 (content-type servido: image/webp). A autorização para copiar, redistribuir ou armazenar esses arquivos no bucket público `gbr-card-art` não foi demonstrada.

## Decisão

1. Adicionar `imageReferenceUrl`, `imageReferencePage`, `imageReferenceCheckedOn` e `imageReferencePermission='not_verified'` aos itens do catálogo, sem preencher `imageSrc`.
2. Exibir links externos com `target=_blank`, `rel=noopener noreferrer` e `referrerpolicy=no-referrer` na Biblioteca Visual e no inventário de boosts.
3. O `GBRCardArt.getSource()` continua retornando apenas fotos locais/compartilhadas autorizadas; não deve usar `imageReferenceUrl` como imagem. O resolvedor rejeita os URLs catalogados do AllClash em `saveLocal`/`saveRemote` e ignora overrides antigos desses links.
4. Não fazer hotlink, download, upload ou publicação dessas imagens sem permissão verificável do titular.
5. A publicação na academia continua pelo mesmo fluxo admin de pilotos e peças, protegida por RLS e Storage.

## Alternativas rejeitadas

- Hotlink automático no `<img>`: dependência de terceiro, disponibilidade/termos não controlados e uso de imagem sem licença verificada.
- Copiar as imagens para Storage: redistribuição pública sem autorização demonstrada.
- Gerar ícones parecidos por IA: já foi rejeitado pelo usuário por não permitir identificar os boosts reais.

## Direitos e referências

- [AllClash — São Paulo Spectacular 2026](https://www.allclash.com/f1-clash-sao-paulo-spectacular-2026-guide-junior-challenger-contender-champion/) apresenta os arquivos referenciados.
- [Formula 1 — Guidelines](https://www.formula1.com/en/information/guidelines.4EOKE9RRqevL4niTK9kWyt): §2 e §4, still images/assets e necessidade de consentimento do titular.
- [Hutch — F1 Clash Credits](https://www.hutch.io/f1-clash-credits/): direitos e restrição contra cópia/distribuição/extracção não autorizada do produto.

## Impacto e segurança

Sem alterações no Supabase, Storage, garagem, cálculos, estoque, rankings ou regras de corrida. Os links são dados estáticos validados por allowlist de host/caminho e escapados antes da renderização. A política de upload e RLS não foram modificadas.

## Testes e rollback

Testar catálogo com 11 URLs únicas, `imageSrc=null`, ausência de `<img src>` externo, link externo com `noopener`, mesmo caminho de upload admin e worker com 199 recursos íntegros. Rollback: restaurar `gbr-boost-catalog.js`, `auditoria-imagens.js/html`, `boosts-plus.js/css`, `index.html` e `_worker.js` do pacote anterior.

## Pendência

Para fotos compartilhadas, fornecer capturas próprias do inventário do jogo ou licença escrita que autorize a publicação.


## Adendo — auditoria ampliada e regra mantida (09/11/2026)

- A aba `Boosts` da planilha contém 65 nomes. Foram auditados 64 caminhos de referência AllClash (59 inventariados anteriormente + 5 caminhos adicionais); `Nuke Boost` não consta na planilha e não foi incluído.
- 50 URLs responderam HTTP 200 no teste da origem (49 reconhecidas pelo extrator; `Tire Water` retornou 200 com MIME `image/png`, mas requer validação visual no navegador). 15 itens não têm imagem acessível confirmada: 13 candidatos antigos responderam 404 e `Schooner`/`Tune-In` não têm caminho localizado.
- **A decisão original permanece:** URLs são metadados de auditoria, não fontes `<img>`. Não há hotlink, download, proxy, upload ou cópia para o bucket sem licença escrita do titular.
- A Biblioteca Visual mostra os 65 itens e exibe apenas fotos locais/compartilhadas cadastradas via `GBRCardArt`. Em 09/11/2026 o Supabase contém 1 registro de imagem de boost (`Ballast`); os demais itens usam fallback até receberem foto autorizada.
- A aprovação do usuário nesta conversa autorizou a mudança de código, não substituiu licença do titular.


## Adendo — decisão do usuário para exibição remota (10/11/2026)

**Status:** decisão anterior parcialmente substituída para exibição visual no GBR.

O usuário autorizou expressamente o uso das imagens públicas do AllClash para exibição dos boosts no site. A partir deste adendo, URLs AllClash confirmadas podem ser usadas como `img src` remoto, sem baixar, armazenar, proxyar ou enviar os arquivos ao Supabase. O bloqueio de persistência em `saveLocal`/`saveRemote` permanece: uma referência remota não se torna uma foto própria/compartilhada da academia.

Prioridade de resolução: imagem compartilhada (Supabase) → imagem local do usuário → referência remota AllClash confirmada → fallback neutro. Os 15 boosts sem URL HTTP 200 confirmada permanecem sem foto até nova fonte ser validada. O motor de recomendação (11 itens), RLS, Storage, garagem e permissões não mudam.

Risco operacional: o carregamento depende da disponibilidade, política de hotlink e formato servido pelo AllClash; Safari/ad blockers/CSP podem impedir a exibição. A interface deve manter fallback neutro em erro. Esta decisão registra a preferência do usuário, mas não constitui declaração de licença concedida pelo titular externo.
