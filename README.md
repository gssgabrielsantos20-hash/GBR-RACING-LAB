# GBR Racing Lab

Central de setups, Duelos, eventos GP e estratégias de F1 Clash para as equipes GBR.
Produção: https://gbr-racing-lab.pages.dev

## Como funciona

- **Frontend:** PWA estática (HTML, CSS e JavaScript modular, sem framework).
- **Entrega:** Cloudflare Pages. O `_worker.js` responde todas as rotas a partir de um mapa embutido
  (gzip + Base64); arquivos fora desse mapa não são publicados.
- **Dados e login:** Supabase (projeto compartilhado com o GBR Racing Control). Políticas RLS em
  `supabase/migrations/`; Edge Function de exclusão de conta em `supabase/functions/delete-account/`.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| raiz | Arquivos servidos pelo site (`index.html`, módulos `.js`/`.css`, `_worker.js`, `sw.js`) |
| `assets/` | Imagens, ícones e SDK do Supabase (`assets/js/vendor/`) |
| `tests/` | Testes Node (`*.test.js`) e testes SQL de RLS (`tests/sql/`) |
| `tools/` | `sincronizar-worker.mjs`: regenera e verifica o mapa do Worker |
| `supabase/` | Migrations versionadas e Edge Functions |
| `docs/adr/` | Decisões de arquitetura |
| `docs/relatorios/`, `docs/manifestos/` | Relatórios de entregas e manifestos SHA-256 |

## Antes de publicar

```
npm run worker:sync   # inclui no Worker os arquivos alterados
npm run worker:check  # confirma que o Worker bate com os arquivos locais
npm test              # roda a suíte inteira
```

Arquivo novo servido pelo site entra no Worker de forma explícita:
`node tools/sincronizar-worker.mjs --write --add=caminho/arquivo.ext:content/type`.

## Regras do projeto

Nunca versionar segredos, códigos de convite ou a chave `service_role` (o repositório é público).
Nunca desligar RLS. Dados de jogo só entram como confirmados a partir de capturas do jogo.
