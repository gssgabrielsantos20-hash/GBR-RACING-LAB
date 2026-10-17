# GBR Racing Lab — reconstrução do esquema em homologação (16/10/2026)

**Escopo autorizado:** SOMENTE projeto Supabase de homologação `oageqjzrzalkpyujfyzj`, org `lleynjjtznyvrsrdzmmc`. Produção `gkjqfirlcmmlhuokszlz`: *somente leitura*, sem alterações no app publicado.

## Fontes e origem do esquema

- Protocolo AppSec do projeto: fase A (somente leitura) e fase B autorizada com testes e rollback.
- `arquiteto-de-software.txt`: mudanças pequenas, reversibilidade, privilégios mínimos.
- `INSTRUÇÕES-DE-TOMADA-DE-DESCISÃO.txt`: investigar dependências antes de alterar.
- `persona-planejadora.txt`: condições de parada e preservação do escopo.
- Metadados `pg_catalog` e `pg_policies` do Supabase **oficial**, consultados em leitura em 16/10/2026, Postgres 17.11.
- Nenhum login, código de acesso de academia, UUID de usuário, chave, imagem, objeto de Storage ou linha foi copiado.

## Baseline verificada

No banco de homologação, antes da execução: quatro tabelas da fixture Issue #3, marcadas `SOMENTE HOMOLOGACAO`, todas com 0 linhas, RLS habilitado; `auth.users=0`, `storage.objects=0`, `storage.buckets=0`; RPC `admin_move_player` protegida para `authenticated` e não `anon`. Migrações existentes: `20261016234104` e `20261016234111` (ambas de fixture da Issue #3).

## Diferenças intencionais frente à produção

- A tabela `dia_em_cards_agendas` é de outro aplicativo, não do GBR; fora do escopo.
- Privilegios de `authenticated` em `academy_announcements` e `gbr_card_images`: sem `TRUNCATE`, `REFERENCES` e `TRIGGER` (mínimo necessário para CRUD). `garage_states` e `academy_profiles`: SELECT/INSERT/UPDATE; membros/equipes: SELECT. Nenhum GRANT amplo a `anon`.
- `academy_team_changes`: sequência de identidade sem herdar permissões desnecessárias de `anon` e `authenticated`; função admin privilegiada insere pela operação autorizada.
- Tabela de códigos, membros, arte e avisos começam **sem dados**. Em especial, convite e código oficial de academia **não** foram copiados.
- A migração está em `tests/staging/migrations/`, fora de `supabase/migrations/`, para não ser usada por engano em implantação de produção.
- A migração, por definição, preserva as duas migrações de teste na tabela de histórico do Supabase; a estrutura da aplicação é reconstruída sobre essa base controlada. O histórico de homologação **não** é cópia do histórico de produção.

## Migração e pré-condições

Arquivo: `tests/staging/migrations/20261016235900_homologacao_gbr_schema_from_prod_readonly.sql`.

O SQL recusa executar se a fixture não tiver exatamente quatro tabelas vazias e o comentário de homologação esperado, se houver usuários em Auth, objetos ou buckets no Storage, ou se a RPC de teste estiver ausente. Substitui exclusivamente essas quatro tabelas + a RPC de teste, recria o esquema GBR com 10 tabelas, 41 constraints, 2 índices extras, 6 funções, 16 políticas RLS e 4 políticas para Storage e o bucket público `gbr-card-art`. Replica a publicação Realtime para a tabela da biblioteca de imagens.

## Testes exigidos

1. Execução de ensaio SQL em transação com `ROLLBACK`; verificar que não alterou o baseline.
2. Aplicação real somente na homologação.
3. Confirmar 10 tabelas, todas com RLS, 16 políticas, 6 RPCs, 4 políticas de Storage, bucket configurado, grants, FKs e objetos sem dados pessoais.
4. Repassar Supabase Advisors e destacar o que ficou fora do escopo.
5. **A integração real** (login, API REST, Storage upload, painel admin e corrida no navegador) exige identidades de teste válidas e validação end-to-end posterior. Não confundir com migração validada.

## Plano de rollback (somente homologação)

**Antes de qualquer rollback:** impedir novas gravações, verificar novamente que Auth não tem usuários reais e que não houve uploads nem dados não fictícios. **NUNCA executar no projeto oficial.** Um rollback manual exigiria:

1. Remover a publicação de Realtime da tabela `gbr_card_images`, se registrada; remover as quatro políticas de Storage `gbr_art_*` e o bucket `gbr-card-art` somente após confirmar que está vazio.
2. Remover exclusivamente as seis RPCs e as dez tabelas GBR deste plano, respeitando a ordem das FKs e sem usar `CASCADE` indiscriminadamente.
3. Reaplicar a fixture de `tests/appsec/supabase-homologacao-issue3-fixture.sql` e a migração de revogação de `supabase/migrations/20261016230000_appsec_revoke_anon_admin_move_player.sql` do PR #4, revisando o histórico de migrações da homologação. Isso não é um procedimento automático de produção.
4. Validar as permissões do anon e authenticated, ausência de dados e restauração das quatro tabelas básicas.

Este plano é **documentado mas não testado**; até testes reais de reversão, o rollback não deve ser declarado validado. Se houver usuários ou dados de teste importantes, preferir novo ambiente/snapshot, não exclusão. O estado da fixture anterior está versionado no PR #4, e o banco não possui dados pessoais a preservar na baseline.

**Portão de escalabilidade:** atenção; a estrutura corresponde ao domínio do GBR, mas indicadores de volume, carga e performance ainda não foram medidos. Nenhuma otimização especulativa foi incluída.

**Status de produção:** inalterada. Não fazer merge nem deploy sem autorização específica.


## Evidências observadas em homologação — 16/10/2026 (local)

- Migração estrutural: ensaio `BEGIN ... ROLLBACK` **PASS**; aplicação no Supabase staging versão `20261017005335` **SUCCESS**.
- Comparação entre metadados do oficial (leitura) e staging: **47/47 colunas**, **41/41 constraints**, **16/16 políticas**, **14/14 índices** e **6/6 funções** idênticas por nome/corpo, preservando gates de `anon/authenticated`.
- Storage: bucket público `gbr-card-art`, 4 políticas e Realtime habilitado para `gbr_card_images`, sem copiar objetos.
- Teste de segurança `tests/staging/validar-esquema-gbr-homologacao.sql`: **PASS** para anonimato, não-admin, códigos privados, checks de slug e HTTPS; tudo revertido via `ROLLBACK`.
- Seeds fictícios `tests/staging/migrations/20261017005500_homologacao_gbr_seed_sintetico.sql`: ensaio com rollback **PASS**, aplicação versão `20261017005626` **SUCCESS**. Apenas 4 equipes fictícias, 4 códigos aleatórios de convite e 1 código aleatório de academia.
- Pós-validação: 10 tabelas com RLS, 16 políticas, 0 usuários Auth, 0 membros, 0 garagens, 0 imagens, 0 avisos, 0 objetos Storage. A RPC admin nega `anon` e concede `EXECUTE` a `authenticated`, com autorização do cargo no corpo.
- Supabase Advisors staging: `rls_enabled_no_policy` INFO (4 tabelas, proposital), `anon_security_definer_function_executable` WARN (`rls_auto_enable`), `authenticated_security_definer_function_executable` WARN (6 funções). **Não corrigidos** nesta etapa.
- Produção permanece inalterada. A estrutura não inclui `dia_em_cards_agendas` por ser de outro aplicativo. No staging os `TRUNCATE` autenticados que constam na produção foram removidos por privilégio mínimo.

### Pendências explícitas

- Não foi realizado o fluxo real Auth + REST + Storage com usuários de teste nem preview do frontend; não declarar homologação E2E completa.
- O rollback estrutural está documentado, mas **a restauração integral não foi ensaiada**; uma recriação futura deverá primeiro verificar que não existem contas nem dados a preservar.
- Código de homologação está fora de `supabase/migrations/` para evitar implantação acidental no banco oficial; PR deve permanecer rascunho até revisão e testes adicionais.
