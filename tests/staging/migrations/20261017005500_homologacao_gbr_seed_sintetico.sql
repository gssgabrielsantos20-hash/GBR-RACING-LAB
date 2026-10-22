-- EXCLUSIVAMENTE Supabase HOMOLOGACAO oageqjzrzalkpyujfyzj.
-- Seeds sintéticos (NÃO vêm do banco oficial): 4 equipes sem membros,
-- 1 codigo de acesso e 4 convites aleatórios. Nunca publicar códigos ou copiar para produção.
DO $preflight$
BEGIN
 IF (SELECT count(*) FROM auth.users)<>0 OR
    (SELECT count(*) FROM public.academy_teams)<>0 OR
    (SELECT count(*) FROM public.academy_team_invites)<>0 OR
    (SELECT count(*) FROM public.academy_access_codes)<>0 OR
    (SELECT count(*) FROM public.academy_members)<>0 OR
    (SELECT count(*) FROM storage.objects)<>0 OR
    (SELECT count(*) FROM pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r')<>10
 THEN RAISE EXCEPTION 'ABORTADO: staging nao esta vazio ou divergente'; END IF;
END $preflight$;

INSERT INTO public.academy_teams(slug,name) VALUES
 ('team_1','Equipe de Teste 1'),('team_2','Equipe de Teste 2'),
 ('team_3','Equipe de Teste 3'),('team_4','Equipe de Teste 4');

-- Código forte gerado na homologação e nunca exposto pelo SQL ou GitHub.
INSERT INTO public.academy_access_codes(id,code)
VALUES (1,upper(encode(extensions.gen_random_bytes(24),'hex')));

INSERT INTO public.academy_team_invites(team_id,invite_code)
SELECT id,upper(encode(extensions.gen_random_bytes(24),'hex')) FROM public.academy_teams;

DO $verify$
BEGIN
 IF (SELECT count(*) FROM public.academy_teams)<>4 OR
    (SELECT count(*) FROM public.academy_team_invites)<>4 OR
    (SELECT count(*) FROM public.academy_access_codes)<>1 OR
    (SELECT count(*) FROM auth.users)<>0 OR
    (SELECT count(*) FROM public.academy_members)<>0
 THEN RAISE EXCEPTION 'Seeds de homologacao inconsistentes'; END IF;
END $verify$;
