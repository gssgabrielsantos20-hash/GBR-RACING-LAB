# ADR 0024 — Exclusão de conta e banco compartilhado (19/11/2026)

**Status:** função publicada no Supabase em 19/11/2026; migrations versionadas.

## Contexto
A auditoria de 19/11 encontrou o botão "Excluir conta" quebrado: `cloud.js` chama a Edge Function
`delete-account`, mas o projeto não tinha nenhuma Edge Function publicada. O projeto Supabase
(`gkjqfirlcmmlhuokszlz`, "GBR Racing Control") é compartilhado com a Academia e com o app Dia em Cards.

## Decisão
- `supabase/functions/delete-account/index.ts`, publicada com `verify_jwt: true`:
  usuário identificado só pelo JWT validado no servidor; senha reconferida; frase `EXCLUIR MINHA CONTA`
  obrigatória; CORS restrito a `*.gbr-racing-lab.pages.dev`; único administrador bloqueado
  (`409 LAST_ADMIN`); exclusão definitiva via Admin API; garagem, perfil, matrícula e agenda saem por
  `ON DELETE CASCADE`. Sem dados pessoais em log.
- Migrations exportadas de `supabase_migrations.schema_migrations` para `supabase/migrations/`,
  com o código de convite substituído por `<CODIGO_DE_ACESSO_REDIGIDO>` (repositório público).
- Índices nas 6 chaves estrangeiras apontadas pelo advisor (`20261119120435_fk_indexes_20261119`).

## Evidência
- Deploy: versão 1, status ACTIVE. Chamada sem login recusada (4xx).
- RLS com dois usuários reais (`tests/sql/rls-garagem-dois-usuarios.sql`): 8/8 conforme esperado.
- **Não verificado:** exclusão ponta a ponta com uma conta real (fazer com conta de teste).

## Limites conhecidos
- Admin que publicou avisos (`ON DELETE RESTRICT`) só pode sair depois de transferir a autoria; hoje
  isso só atinge o único admin, que já é bloqueado por `LAST_ADMIN`.
- A exclusão apaga o login nos três apps do projeto (a tela já avisa o usuário).

## Pendências de decisão (responsável)
- Manter o Lab no banco compartilhado ou separar.
- Remover o schema `gbr_migration_backup` (cópia de 08/11) depois de confirmar que não é mais necessário.
- Ativar a proteção contra senhas vazadas em Authentication → Policies (painel do Supabase).

## Reversibilidade
Função: excluir `delete-account` no painel. Índices: `drop index` dos 6 nomes. Ambos de mão dupla.
