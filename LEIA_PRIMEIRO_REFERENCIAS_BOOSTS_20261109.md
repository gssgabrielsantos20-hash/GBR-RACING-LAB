# GBR LAB 6 — referências visuais de boosts (09/11/2026)

- Foram localizados 11 URLs de imagem do AllClash e todos responderam HTTP 200 (content-type `image/webp`) na verificação de 09/11/2026.
- A biblioteca mostra links individuais para abrir a imagem na origem; os arquivos não são incorporados ao site.
- Permissão de reutilização continua `not_verified`; nenhuma imagem foi enviada ao Supabase.
- Supabase: `boosts` já aceito pelo CHECK e pela policy de upload admin; RLS preservado.
- Validação local: 34 casos de teste aprovados em 22 arquivos; 43 scripts JS da raiz passaram `node --check`; Worker verificado byte a byte.
- Próximo passo para fotos compartilhadas: capturas próprias do jogo ou licença escrita.
- Pacote é prévia local, sem deploy Cloudflare ou alteração GitHub.

Consulte `RELATORIO_REFERENCIAS_BOOSTS_20261109.md` e ADR 0015 para evidências, decisões e rollback.


> **SUPERSEDIDO EM 09/11/2026 (revisão final):** o inventário foi ampliado para 65 nomes; 50 URLs retornaram HTTP 200 e 15 não têm imagem acessível confirmada. As URLs ficam apenas como metadados, sem links/imagens embutidas. O Supabase tem 1 registro de imagem de boost (Ballast). Consulte `LEIA_PRIMEIRO_BOOSTS_VISUAL_20261109.md`.