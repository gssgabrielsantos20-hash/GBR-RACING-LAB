# GBR LAB 6 — Fotos reais dos boosts: preparação segura

**Estado:** corrigido localmente, não publicado.

As 11 imagens fictícias do pacote anterior foram retiradas porque não identificam os boosts reais do F1 Clash. O site mostra o nome completo e a indicação neutra **Sem foto**, até existir uma foto autêntica autorizada para cada ID.

## Como completar o visual

Fornecer screenshots do inventário do jogo que mostrem nome e ícone dos boosts, para recorte e conferência. Depois será possível salvar versões otimizadas e associá-las por ID a `assets/boosts-game/{id}.webp` em `gbr-boost-catalog.js`, sem alterar os pesos do Montador. Os 11 nomes atualmente aceitos são: Butterfly, Pretzel, Eclipse, Surf, Dragon, Self Control, Ballast, Downforce, Warrior, Instinct, Hex.

## Biblioteca compartilhada (atenção)

O Supabase oficial, tabela `public.gbr_card_images`, restringe a coluna `kind` a `drivers` e `parts`. Para armazenar `boosts` no fluxo compartilhado dos administradores será necessária migração específica, análise RLS/Storage, testes com contas de diferentes perfis e aprovação separada. **Não houve alteração de banco nesta etapa.**

## Testes

13/13 suítes executadas passaram, `node --check` em 43 scripts e 198 recursos públicos com hashes conferidos. Sem aprovação de Safari físico, integração autenticada ou publicação.

## Implante apenas depois da homologação

A versão atual é uma prévia. Usar o ZIP de `DEPLOY` apenas quando aprovado; conservar o ZIP anterior para retorno. Não publicar conteúdo de terceiros sem licença.


> **SUPERSEDIDO EM 09/11/2026:** a migração Supabase para `boosts` foi aplicada e validada; o fluxo de upload usa o mesmo `GBRCardArt` de pilotos e peças. O catálogo visual foi ampliado para 65 nomes. Consulte `LEIA_PRIMEIRO_BOOSTS_VISUAL_20261109.md`.