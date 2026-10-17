-- TESTE SOMENTE Supabase projeto oageqjzrzalkpyujfyzj (homologação).
-- Integração de produção PROIBIDA; nenhum usuário real, arquivo, código de acesso ou dado real.
-- Teste pós-migração com transação revertida.
BEGIN;
SET LOCAL statement_timeout = '15s';
DO $preflight$
BEGIN
 IF (SELECT count(*) FROM auth.users) <> 0 THEN RAISE EXCEPTION 'STOP: conta Auth existente'; END IF;
 IF (SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r') <> 10 THEN RAISE EXCEPTION 'STOP: schema de homologação divergente'; END IF;
 IF (SELECT count(*) FROM storage.objects) <> 0 THEN RAISE EXCEPTION 'STOP: storage nao vazio'; END IF;
 IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename <> 'dia_em_cards_agendas') <> 16 THEN RAISE EXCEPTION 'STOP: politicas RLS incompletas'; END IF;
END $preflight$;

-- Anon não recebe EXECUTE de funções administrativas nem acesso direto.
SET LOCAL ROLE anon;
DO $t$
DECLARE st text;
BEGIN
 BEGIN
  PERFORM public.admin_move_player('00000000-0000-0000-0000-000000000002',null::uuid);
  RAISE EXCEPTION 'FAIL: anon executou RPC admin';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '42501' THEN RAISE EXCEPTION 'FAIL: anon denial SQLSTATE %',st; END IF;
 END;
 BEGIN
  PERFORM 1 FROM public.academy_members LIMIT 1;
  RAISE EXCEPTION 'FAIL: anon leu membros';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '42501' THEN RAISE EXCEPTION 'FAIL: anon member read SQLSTATE %',st; END IF;
 END;
END $t$;
RESET ROLE;

-- Usuário autenticado sem cargo admin não pode mover jogadores nem consultar access_codes.
SELECT set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000003',true);
SET LOCAL ROLE authenticated;
DO $t$
DECLARE st text; msg text;
BEGIN
 BEGIN
  PERFORM public.admin_move_player('00000000-0000-0000-0000-000000000002',null::uuid);
  RAISE EXCEPTION 'FAIL: usuario comum moveu jogador';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE,msg=MESSAGE_TEXT;
  IF st <> 'P0001' OR msg <> 'Somente o administrador pode alterar equipes.' THEN RAISE EXCEPTION 'FAIL: admin guard % / %',st,msg; END IF;
 END;
 BEGIN
  PERFORM code FROM public.academy_access_codes LIMIT 1;
  RAISE EXCEPTION 'FAIL: membro leu codigo de academia';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '42501' THEN RAISE EXCEPTION 'FAIL: access code SQLSTATE %',st; END IF;
 END;
END $t$;
RESET ROLE;

-- Dados exclusivamente sintéticos, revertidos ao final. Constraints refletem o modelo oficial.
INSERT INTO public.academy_teams(id,slug,name)
 VALUES ('00000000-0000-0000-0000-000000000101','team_1','Equipe Sintética 1');
INSERT INTO public.gbr_card_images(card_key,kind,card_name,image_url)
 VALUES ('test-hom-driver-01','drivers','Piloto Sintético','https://example.invalid/piloto.png');

DO $t$
DECLARE st text;
BEGIN
 BEGIN
  INSERT INTO public.academy_teams(id,slug,name)
  VALUES('00000000-0000-0000-0000-000000000102','team_5','Slug Inválido');
  RAISE EXCEPTION 'FAIL: slug sem check';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '23514' THEN RAISE EXCEPTION 'FAIL: slug check SQLSTATE %',st; END IF;
 END;
 BEGIN
  INSERT INTO public.gbr_card_images(card_key,kind,card_name,image_url)
  VALUES('test-hom-driver-02','drivers','Piloto Sintético','http://inseguro.invalid/p.png');
  RAISE EXCEPTION 'FAIL: URL sem HTTPS aceita';
 EXCEPTION WHEN OTHERS THEN
  GET STACKED DIAGNOSTICS st=RETURNED_SQLSTATE;
  IF st <> '23514' THEN RAISE EXCEPTION 'FAIL: HTTPS check SQLSTATE %',st; END IF;
 END;
END $t$;

ROLLBACK;
SELECT 'PASS: anon bloqueado, membro nao-admin bloqueado, codigos privados, CHECKs validados, transacao revertida' AS resultado;
