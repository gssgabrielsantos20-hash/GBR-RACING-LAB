-- APENAS Supabase homologação: oageqjzrzalkpyujfyzj.
-- NÃO executar na produção. Não autentica tokens reais; simula JWT somente no SQL.
-- Os dados sintéticos abaixo são revertidos com ROLLBACK, sem contaminar o banco.
-- Requer a fixture tests/appsec/supabase-homologacao-issue3-fixture.sql
-- e a migração real supabase/migrations/20261016230000_appsec_revoke_anon_admin_move_player.sql.
BEGIN;
SET LOCAL statement_timeout = '10s';

DO $guard$
DECLARE marker text;
BEGIN
 SELECT obj_description('public.academy_admins'::regclass,'pg_class') INTO marker;
 IF marker IS DISTINCT FROM 'SOMENTE HOMOLOGACAO / Issue #3: fixture sintetica; nao representa schema de producao'
    OR (SELECT count(*) FROM public.academy_admins) > 0
    OR (SELECT count(*) FROM public.academy_members) > 0
    OR EXISTS (SELECT 1 FROM auth.users)
    OR has_function_privilege('anon','public.admin_move_player(uuid,uuid)','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.admin_move_player(uuid,uuid)','EXECUTE')
 THEN
   RAISE EXCEPTION 'ABORTADO: fixture/privilegios divergentes ou dados reais presentes';
 END IF;
END $guard$;

INSERT INTO public.academy_admins(user_id)
VALUES ('00000000-0000-0000-0000-000000000001');
INSERT INTO public.academy_teams(id,slug,name) VALUES
('00000000-0000-0000-0000-000000000101','synthetic-a','Equipe Teste A'),
('00000000-0000-0000-0000-000000000102','synthetic-b','Equipe Teste B');
INSERT INTO public.academy_members(user_id,team_id) VALUES
('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000101');

-- Teste 1: anon sem token de usuário não consegue executar a RPC.
SELECT set_config('request.jwt.claim.sub','',true);
SET LOCAL ROLE anon;
DO $test$
DECLARE st text;
BEGIN
 BEGIN
  PERFORM public.admin_move_player('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000102');
  RAISE EXCEPTION 'ERRO: anon moveu jogador';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '42501' THEN RAISE EXCEPTION 'ERRO: anon deveria receber SQLSTATE 42501, recebido %',st; END IF;
 END;
END $test$;
RESET ROLE;

-- Teste 2: authenticated não administrador é barrado por validação de cargo.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
SET LOCAL ROLE authenticated;
DO $test$
DECLARE st text; msg text;
BEGIN
 BEGIN
  PERFORM public.admin_move_player('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000102');
  RAISE EXCEPTION 'ERRO: membro comum moveu jogador';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE,msg=MESSAGE_TEXT;
  IF st <> 'P0001' OR msg <> 'Somente o administrador pode alterar equipes.' THEN
   RAISE EXCEPTION 'ERRO: recusa ao membro inesperada: % / %', st,msg;
  END IF;
 END;
END $test$;
RESET ROLE;

-- Teste 3: usuário autenticado não pode consultar tabelas administrativas diretamente.
SET LOCAL ROLE authenticated;
DO $test$
DECLARE st text;
BEGIN
 BEGIN
  PERFORM 1 FROM public.academy_admins LIMIT 1;
  RAISE EXCEPTION 'ERRO: membro acessou tabela admin diretamente';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '42501' THEN RAISE EXCEPTION 'ERRO: acesso direto deveria ser negado, SQLSTATE %',st; END IF;
 END;
END $test$;
RESET ROLE;

-- Teste 4: admin legitimado pelo papel pode mover jogador.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',true);
SET LOCAL ROLE authenticated;
SELECT public.admin_move_player('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000102');
-- Teste 5: idempotência — nova chamada com o mesmo destino não gera auditoria duplicada.
SELECT public.admin_move_player('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000102');
RESET ROLE;

DO $test$
BEGIN
 IF (SELECT team_id FROM public.academy_members WHERE user_id='00000000-0000-0000-0000-000000000002')
    IS DISTINCT FROM '00000000-0000-0000-0000-000000000102'::uuid
    OR (SELECT count(*) FROM public.academy_team_changes) <> 1
    OR (SELECT changed_by FROM public.academy_team_changes LIMIT 1) IS DISTINCT FROM '00000000-0000-0000-0000-000000000001'::uuid
 THEN RAISE EXCEPTION 'ERRO: movimento autorizado/auditoria/idempotência'; END IF;
END $test$;

-- Teste 6: movimentação inversa deve produzir segunda entrada correta de auditoria.
SET LOCAL ROLE authenticated;
SELECT public.admin_move_player('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000101');
RESET ROLE;
DO $test$
BEGIN
 IF (SELECT team_id FROM public.academy_members WHERE user_id='00000000-0000-0000-0000-000000000002')
    IS DISTINCT FROM '00000000-0000-0000-0000-000000000101'::uuid
    OR (SELECT count(*) FROM public.academy_team_changes) <> 2
 THEN RAISE EXCEPTION 'ERRO: regressão na reversão de equipe/auditoria'; END IF;
END $test$;

-- Não persistir nenhum UUID, evento ou equipe do ensaio.
ROLLBACK;
SELECT 'PASS: 6 cenários SQL/RPC da homologação; fixtures revertidas' AS result;
