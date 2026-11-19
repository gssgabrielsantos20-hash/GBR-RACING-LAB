# Relatório técnico — Correção da Biblioteca Visual de Boosts

## Causa raiz e evidência

- Captura do usuário: erro `gbr_card_images_kind_check` ao tentar compartilhar foto de `Ballast` na Biblioteca Visual.
- Consulta direta ao Supabase oficial em leitura: CHECK `gbr_card_images_kind_check` somente `drivers`/`parts`; política `gbr_art_upload_admin` permite INSERT no bucket `gbr-card-art` apenas nas pastas `drivers`/`parts`, com `am_i_academy_admin()`. RLS está habilitado.
- Frontend em `auditoria-imagens.js` introduzia fluxo paralelo (`saveLocal`, prévia, publicação) que não existia para pilotos e peças; isso mascarava o bloqueio de banco.

## Fontes consultadas

1. `engenheiro-de-segurança.txt`: negar por padrão, não afrouxar RLS, fases A/B e prova de correção.
2. `arquiteto-de-software.txt`: reutilização e reversibilidade; portão de escalabilidade.
3. `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: selecionar a menor mudança no fluxo responsável.
4. `persona-planejadora.txt`: não assumir autorização de produção; testes antes de implantação.
5. `REGRAS-DE-ORIGINALIDADE.txt`: fotos de terceiros não autorizadas não entram no catálogo.
6. Documentos de governança aprovados em 16/10: Protocolo AppSec, Manual de Projeto, Persona de Dev Sênior, Manual de Testes, Persona de QA, consultados anteriormente nesta conversa.
7. Supabase Docs: https://supabase.com/docs/guides/storage/security/access-control

## Arquivos modificados neste pacote

- `auditoria-imagens.js`: um único `runSave()` via `art.saveRemote()`; upload via `art.uploadRemote()`, sem botões alternativos; tratamento específico do CHECK.
- `auditoria-imagens.html`: copy da página atualizada e revisão de cache.
- `index.html`, `boosts-plus.js`: revisão de cache e indicação do estado de imagem.
- `tests/`: expectativas atualizadas e cenários dinâmicos com administrador/sem administrador.
- `docs/adr/0014-paridade-imagens-boosts-20261105.md`: justificativa e rollback.
- `_worker.js`: reconstrução de artefatos estáticos para homologação.

## Dependência bloqueante

A migração SQL de produção **não foi executada** e não deve ser tratada como concluída. A proposta e rollback estão em `docs/sql-review/`. É necessária aprovação específica para aplicar alterações de esquema/política em produção e testes de integração com contas de teste antes do deploy.

## Testes

Os resultados reais da execução e hash SHA-256 do pacote serão registrados no manifesto desta entrega. Testes com Supabase real (admin, membro comum, anônimo), Safari físico e uploads reais permanecem NÃO EXECUTADOS neste ambiente.

## Resultado real dos testes locais — 05/11/2026

- `node --check`: 42 módulos JS públicos + `_worker.js` sem falha de sintaxe.
- 17 suítes locais executadas, 17 aprovadas após atualização da verificação de extensão `.webp` dos cartazes (o teste antigo exigia `.png` e havia falhado inicialmente). Essa correção foi somente no teste `tests/mega-worker-20261029.test.js`.
- `boosts-admin-permissions-parity-20261105.test.js`: mesmo `saveRemote()` de drivers/parts/boosts na simulação; usuário sem perfil administrativo bloqueado para todos os três tipos.
- `mega-worker-20261029.test.js`: 198 recursos byte a byte e respostas 200/404/405/HEAD do Worker.
- `worker-events-smoke-20261104.test.js`: seis recursos disponíveis e arquivos privados bloqueados.
- Manifesto SHA-256: 198 recursos públicos verificados, quatro atualizados, zero removidos.

**Não executados:** migração SQL, upload em Storage real, testes RLS negativos com contas de teste, Safari físico, atualização real no Cloudflare. Esses cenários não estão aprovados.
