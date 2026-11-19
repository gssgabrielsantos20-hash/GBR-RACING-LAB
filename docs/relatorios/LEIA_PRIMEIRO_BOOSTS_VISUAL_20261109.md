# GBR Racing Lab — Boosts: catálogo visual 65 (09/11/2026)

## O que mudou

- A Biblioteca Visual passa a listar os **65 nomes distintos** da aba `Boosts` da planilha `F1 Clash 2026 Resource Sheet v1.1 by TR The Flash (1).xlsx`.
- `GBRBoostCatalog.items` continua com os **11 boosts** já usados pelo Assistente de Pistas. Nenhum atributo, ranking, peso ou cálculo foi alterado.
- `GBRBoostCatalog.visualItems` é um catálogo visual independente de GP/série.
- A Biblioteca Visual oferece busca, filtros e cadastro de imagem usando o mesmo `GBRCardArt` de pilotos e peças.
- O Assistente de Pistas exibe a foto no cartão quando ela existe em Supabase ou no aparelho; caso contrário, mantém o fallback `Sem foto`.
- O registro compartilhado `Ballast` existente foi preservado. O banco foi consultado em leitura e contém 68 pilotos, 28 peças e 1 registro de imagem de boost (97 registros). O arquivo Ballast respondeu HTTP 200 como `image/webp`; sua correspondência visual com o ícone do jogo ainda precisa de conferência no iPhone.

## Imagens externas e originalidade

O levantamento localizou 50 URLs AllClash com resposta HTTP 200 (49 reconhecidas pelo extrator; `Tire Water` requer confirmação visual) e 15 boosts sem imagem acessível confirmada. Esses URLs permanecem somente em metadados/manifesto de auditoria: **não são hotlinked, baixados, copiados nem enviados ao Supabase**, conforme ADR 0015 e `REGRAS-DE-ORIGINALIDADE.txt`.

A autorização do usuário nesta conversa aprovou alterações no GBR; não substitui licença do titular. Para preencher as demais fotos, use:
- capturas próprias do inventário de boosts do jogo, enviadas pelo usuário; ou
- arquivos com autorização escrita de publicação.

## Supabase e segurança

- A migração anterior já habilitou `boosts` no CHECK e na política administrativa de INSERT do Storage.
- RLS continua ativo em `public.gbr_card_images` e `storage.objects`.
- Upload de boost usa o mesmo caminho de pilotos/peças, apenas para administrador.
- URLs AllClash são bloqueadas em `saveLocal`, `saveRemote` e migração em lote.
- Nenhuma alteração de schema, policy ou dado foi executada nesta etapa.

## Arquivos principais

- `gbr-boost-catalog.js` — 11 recomendações + 65 itens visuais.
- `card-art.js` — resolução compartilhada/local e bloqueio de referências AllClash para persistência.
- `auditoria-imagens.js/html` — biblioteca completa, filtros, upload e verificação.
- `boosts-plus.js/css` — foto no cartão do inventário de Pistas, sem link substituindo imagem.
- `index.html` — cache-busting.
- `docs/adr/0012...`, `0013...`, `0014...`, `0015...` — decisões atualizadas.

## Testes

Executar no diretório do projeto:

```bash
node --check gbr-boost-catalog.js
node --check card-art.js
node --check boosts-plus.js
node --check auditoria-imagens.js
node --test tests/*.test.js
```

O teste em Safari físico/iPhone continua pendente. A URL pública de Ballast respondeu HTTP 200 com MIME `image/webp`; o conteúdo não foi inspecionado visualmente neste ambiente.

## Publicação e rollback

- Não publicar automaticamente no Cloudflare Pages.
- Não atualizar GitHub.
- Homologar o ZIP em ambiente separado e testar Biblioteca Visual, Pistas, login, garagem e sincronização.
- Rollback: restaurar os arquivos públicos listados no manifesto e `_worker.js` do ZIP anterior. Sem rollback de banco, pois não houve escrita no Supabase nesta etapa.
