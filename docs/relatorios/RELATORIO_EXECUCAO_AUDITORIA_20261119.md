# Execução da auditoria — 19/11/2026

Base: `GBR_RACING_LAB_MELHORIAS_SDK_LOCAL_18NOV2026.zip` (publicado). Autorização: responsável, 19/11/2026.

## Já em produção (Supabase)
| Item | Evidência |
| --- | --- |
| Edge Function `delete-account` (ADR 0024) | Deploy v1 ACTIVE, `verify_jwt` ligado; sem login → 4xx |
| Índices nas 6 FKs | Migration `20261119120435_fk_indexes_20261119` |
| RLS com dois usuários | `tests/sql/rls-garagem-dois-usuarios.sql`: 8/8 |

## No pacote (homologar antes de publicar)
CSP no Worker, Biblioteca Visual fora de buscadores, legibilidade e toque no celular, prévia de link
(`og:*`), `favicon.ico`, `robots.txt`, artes de eventos 3,6 MB → 0,9 MB, rótulo sem versão interna,
README, `package.json` (`npm test`), migrations versionadas (código de convite redigido),
47 relatórios em `docs/relatorios/`. Detalhes no ADR 0025.

## Testes
`npm test`: 26 de 31 (mesmas 5 falhas antigas). Worker: 208 rotas, 0 divergentes. Varredura de segredos: limpa.

## Depende do responsável
- Ativar proteção contra senhas vazadas (Authentication → Policies).
- Testar "Excluir conta" com uma conta de teste.
- Decidir banco próprio vs. compartilhado; remover `gbr_migration_backup`; domínio próprio.
- Biblioteca Visual: manter no site ou mover para ferramenta de admin.

## Homologação
1. Prévia do Cloudflare. 2. Login e logout. 3. Console sem erros de CSP. 4. Início, Duelos, Montador no
celular. 5. Colar o link no WhatsApp e ver a prévia. 6. Excluir uma conta de teste.

Rollback: republicar `GBR_RACING_LAB_MELHORIAS_SDK_LOCAL_18NOV2026.zip`.
