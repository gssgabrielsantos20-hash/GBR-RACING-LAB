# Relatório técnico — Biblioteca Visual de Boosts | 05/11/2026

## 1. Objetivo / baseline
Base de código: `GBR_LAB_6_BOOSTS_REAIS_COMPLETO_05NOV2026.zip`, 255 entradas; Worker com 198 recursos públicos. O problema reportado é a ausência de imagens reconhecíveis, não erro nos identificadores dos 11 boosts. Não foi localizada foto real autorizada dos 11 itens no pacote de base. A Resource Sheet do usuário contém estatísticas e não imagens incorporadas.

## 2. Fontes pertinentes
- `engenheiro-de-segurança.txt`, regras e etapas 2, 3, 5, 9, 13: autorização efetiva no banco e proteção de uploads.
- `arquiteto-de-software.txt`, portão de escalabilidade/rollback: alteração mínima reversível.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`, separação de responsabilidades: reaproveitar `GBRCardArt`.
- `persona-planejadora.txt`, etapas e parada: não mudar contratos sem evidência/aprovação.
- `REGRAS-DE-ORIGINALIDADE.txt`, regras 1, 5 e fan content: não usar imagens de terceiros sem permissão.
- Biblioteca do projeto: `01-protocolo-appsec.md` (§3, §6), `02-manual-projeto.md` (§2, §5), `03-desenvolvedor-senior.md`, `04-manual-de-testes.md` (§4, §6), `05-persona-testes.md`: aprovação documental, matriz mínima de testes e liberação de produção separada.
- Supabase [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control): o upload precisa de política INSERT em `storage.objects` com `WITH CHECK` e restrição por bucket/pasta.

## 3. Investigação do sistema real
- `card-art.js`, `overrideKey()` e `getSource()` já aceitam o tipo `'boosts'`, procurando imagens compartilhadas/localmente autorizadas antes de cair no marcador `Sem foto`.
- `auditoria-imagens.js`, `items` e `render()` antes listavam `parts`, `drivers` e legado; não expunham Boosts. Seu fluxo existente usa `GBRCardArt.saveRemote()`/`uploadRemote()` e não deve ser refeito.
- `boosts-plus.js`, `inventorySection()` já identifica os 11 boosts, porém faltava acesso à área de cadastro.
- Consulta **somente leitura** ao projeto oficial Supabase `gkjqfirlcmmlhuokszlz`: `gbr_card_images_kind_check` aceita apenas `drivers`/`parts`; política `gbr_art_upload_admin` (`storage.objects`) restringe o primeiro segmento a `drivers`/`parts`; ambas as tabelas têm RLS ativo. Policies `gbr_art_admin_insert/update/delete` verificam `am_i_academy_admin()`; leitura da tabela por membro usa `academy_members`. Bucket `gbr-card-art` é público e limita a 1.572.864 bytes, JPEG/PNG/WebP. Nenhuma mutação foi realizada.

## 4. Alterações executadas (somente arquivos locais)
- `auditoria-imagens.html`: filtro Boosts, carregamento do catálogo existente, textos/aviso de licença, versões de cache.
- `auditoria-imagens.js`: `boosts` derivado de `GBRBoostCatalog.items`; `items`/`render()` exibem Boost; `runSave()` e `runUpload()` exigem confirmação de direito de uso em boost; `migrate()` mantém publicação em massa limitada a outros tipos; deep link `?kind=boosts` com allowlist.
- `boosts-plus.js`: link para o gerenciamento de fotos de boosts.
- `index.html`: link/versão ajustados, sem mudar Montador nem login.
- `docs/sql-review/PROPOSTA_gbr_card_images_boosts_20261105.sql`: **proposta** de ampliação do CHECK e da política INSERT de Storage, com guardas de baseline; **não executada**.
- `docs/sql-review/ROLLBACK_gbr_card_images_boosts_20261105.sql`: retorno sem exclusões; aborta se houver fotos publicadas.
- `docs/adr/0013-biblioteca-visual-boosts-20261105.md`: decisão e limites.
- `tests/boost-library-20261105.test.js`: cobertura da vinculação, filtro e indisponibilidade de controles para anônimo.
- `_worker.js`: reconstruído; 198 recursos públicos verificados byte a byte. Exatamente quatro recursos foram alterados: `index.html`, `auditoria-imagens.html`, `auditoria-imagens.js` e `boosts-plus.js`. Nenhum removido/adicionado ao Worker.

## 5. Segurança, impacto e portão
**ATENÇÃO, bloqueante para produção até validação do banco.** Sem novas tabelas, queries por recomendação, dados pessoais, segredos ou novas integrações. A proposta de migração mantém RLS e papéis; testes reais de bypass/admin são obrigatórios. A aplicação do SQL e a publicação do site requerem homologação e aprovação separada. Não colocar dados privados no bucket público. Direitos de imagem exigem comprovação e não são garantidos pela checkbox.

## 6. Testes observados
- 43 scripts JavaScript na raiz passaram `node --check`.
- 14 suítes de testes locais passaram (sem contar `mega-worker-20261029.test.js`, que não foi executado por limite de memória observado anteriormente).
- Teste do Worker: rotas públicas 200 e conteúdo byte a byte em seis exemplos, arquivos privados 404 e método POST 405.
- Manifesto conferido: 198 recursos públicos, 4 alterados; SHA-256 verificado contra Worker e arquivos dos ZIPs.
- **NÃO EXECUTADOS**: SQL proposto, alterações RLS/Storage, testes reais anônimo/membro/admin, Safari físico, sincronização entre contas, teste de carga e homologação do Cloudflare.

## 7. Próxima ação
Homologar e aprovar especificamente a alteração do banco e a publicação, depois cadastrar imagens autorizadas de boosts. Se a política exigir restrição adicional, rever SQL antes de executar. Nunca usar URL do AllClash automaticamente como fonte da foto.
