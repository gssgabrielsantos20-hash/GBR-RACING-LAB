# GBR Racing Lab — referências visuais de Boosts | 09/11/2026

## Resultado

Localizadas 11 imagens de referência dos boosts já existentes no catálogo do GBR: Butterfly, Pretzel, Eclipse, Surf, Dragon, Self Control, Ballast, Downforce, Warrior, Instinct e Hex. Todas as URLs individuais responderam HTTP 200 no momento da consulta; o servidor entregou `image/webp`.

Fonte de contexto: [AllClash — São Paulo Spectacular 2026](https://www.allclash.com/f1-clash-sao-paulo-spectacular-2026-guide-junior-challenger-contender-champion/). As seis opções clássicas da loja aparecem juntas na tabela do guia; os demais boosts aparecem nas tabelas de recomendações do mesmo artigo.

### Links individuais conferidos

| Boost | Abrir imagem na fonte |
|---|---|
| Butterfly | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-butterfly.png) |
| Pretzel | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-pretzel.png) |
| Eclipse | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-eclipse.png) |
| Surf | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-surf.png) |
| Dragon | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-dragon.png) |
| Self Control | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-self-control.png) |
| Ballast | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-ballast.png) |
| Downforce | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-downforce.png) |
| Warrior | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-warrior.png) |
| Instinct | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-instinct.png) |
| Hex | [AllClash](https://www.allclash.com/wp-content/uploads/2026/10/f1booster-hex.png) |

## Restrição de uso

**Permissão de reutilização não verificada.** A página de referência não prova titularidade nem concede licença de redistribuição. As [diretrizes públicas da Formula 1 (§2 e §4)](https://www.formula1.com/en/information/guidelines.4EOKE9RRqevL4niTK9kWyt) dizem que imagens/fotos/screenshots pertencem aos respectivos titulares e não devem ser reproduzidas sem consentimento. Os [créditos oficiais da Hutch para F1 Clash](https://www.hutch.io/f1-clash-credits/) reservam os direitos do produto e proíbem cópia/distribuição/extracção não autorizada. Portanto, as imagens não foram baixadas, incorporadas ao Worker ou enviadas ao bucket público.

## Atualização realizada no código local

- `gbr-boost-catalog.js`: 11 links de referência individuais; `imageSrc` continua `null`.
- `auditoria-imagens.js`: exibe link externo de referência sem tratá-lo como foto cadastrada.
- `auditoria-imagens.html`: texto atualizado; informa que boosts já estão habilitados no Supabase e que referências externas não são importadas.
- `card-art.js`: bloqueia esses URLs no salvamento local/compartilhado e ignora overrides antigos que tentem usá-los como fotos.
- `boosts-plus.js` e `boosts-plus.css`: links para consultar a imagem de origem no inventário de boosts de Pistas.
- `index.html`: cache-busting dos módulos alterados.
- `_worker.js`: recompactado com 199 recursos públicos, incluindo os arquivos atualizados.
- `docs/references/boost-imagens-externas-pendentes-20261105.json`: atualiza a revisão e registra status HTTP das 11 URLs.

## Estado do Supabase (consulta read-only em 09/11/2026)

- Constraint `gbr_card_images_kind_check` permite `drivers`, `parts` e `boosts`.
- Política `gbr_art_upload_admin` permite `boosts/` mantendo `am_i_academy_admin()`.
- RLS ativo em `public.gbr_card_images` e `storage.objects`.
- Boosts cadastrados: 0; arquivos na pasta `boosts/`: 0.
- Nenhum INSERT/UPDATE/DELETE foi executado nesta etapa.

## Testes

- 11 URLs verificadas com resposta HTTP 200 (content-type image/webp).
- 34 testes automatizados aprovados em 22 arquivos de teste; 43 scripts JavaScript de raiz passaram `node --check`; o Worker respondeu 199 recursos byte a byte e bloqueou arquivos privados/POST.
- Testes locais cobrem catálogo, links externos, bloqueio de uso dos URLs AllClash como foto, ausência de hotlink, ausência de publicação automática e preservação do fluxo administrativo.
- Safari físico, upload de captura própria e visualização em duas contas: não executados.

## Próxima etapa

Enviar capturas do inventário de boosts feitas no próprio jogo ou obter autorização escrita para reutilizar as imagens externas. Aí sim publicar as fotos reais na Biblioteca Visual via fluxo administrativo existente.
