-- GBR RACING LAB: reconstrução AUTORIZADA somente do projeto de homologação oageqjzrzalkpyujfyzj.
-- EXPORTACAO DE ESTRUTURA (SEM DADOS) obtida via catalogos PostgreSQL oficiais.
-- Projeto de origem SO LEITURA: gkjqfirlcmmlhuokszlz; estrutura 16/10/2026, PostgreSQL 17.11.
-- EXCLUIDO intencionalmente: public.dia_em_cards_agendas (outro aplicativo).
-- CUIDADO: NO banco oficial não executar. A fixture anterior será substituída na homologação.
-- Preflight exige as quatro tabelas de teste vazias com comentários marcadores, auth.users e storage vazios.
-- Rollback: restaurar o snapshot de fixture do PR #4 em projeto de testes limpo; detalhes no documento de rollback.
-- O objetivo é paridade de ESTRUTURA do GBR, não espelhar usuarios, dados privados, códigos de acesso ou objetos de Storage.

DO $check$
DECLARE table_count integer;
BEGIN
 IF to_regprocedure('public.admin_move_player(uuid,uuid)') IS NULL THEN RAISE EXCEPTION 'ABORT: fixture ausente'; END IF;
 SELECT count(*) INTO table_count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r';
 IF table_count <> 4 OR (SELECT count(*) FROM auth.users) <> 0 OR (SELECT count(*) FROM storage.objects) <> 0 OR (SELECT count(*) FROM storage.buckets) <> 0 THEN RAISE EXCEPTION 'ABORT: homologacao nao esta vazia'; END IF;
 IF EXISTS (SELECT 1 FROM public.academy_admins) OR EXISTS (SELECT 1 FROM public.academy_teams) OR EXISTS (SELECT 1 FROM public.academy_members) OR EXISTS (SELECT 1 FROM public.academy_team_changes) THEN RAISE EXCEPTION 'ABORT: dados nao esperados'; END IF;
 IF (SELECT obj_description('public.academy_admins'::regclass,'pg_class')) IS DISTINCT FROM 'SOMENTE HOMOLOGACAO / Issue #3: fixture sintetica; nao representa schema de producao' THEN RAISE EXCEPTION 'ABORT: fixture marcada incorretamente'; END IF;
END $check$;

-- [1] Remover exclusivamente a fixture descartável do PR #4.
DROP FUNCTION public.admin_move_player(uuid,uuid);
DROP TABLE public.academy_team_changes;
DROP TABLE public.academy_members;
DROP TABLE public.academy_teams;
DROP TABLE public.academy_admins;

-- [2] Recriar tabelas reais do GBR (sem linhas de produção).
CREATE TABLE public."academy_access_codes" (
  "id" integer DEFAULT 1,
  "code" text,
  "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."academy_access_codes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_access_codes" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_access_codes" TO service_role;

CREATE TABLE public."academy_admins" (
  "user_id" uuid
);
ALTER TABLE public."academy_admins" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_admins" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_admins" TO service_role;

CREATE TABLE public."academy_announcements" (
  "id" uuid DEFAULT gen_random_uuid(),
  "category" text DEFAULT 'Atualização'::text,
  "title" text,
  "body" text,
  "link_url" text,
  "pinned" boolean DEFAULT false,
  "published" boolean DEFAULT true,
  "published_at" timestamp with time zone DEFAULT now(),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid DEFAULT auth.uid()
);
ALTER TABLE public."academy_announcements" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_announcements" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_announcements" TO service_role;

CREATE TABLE public."academy_members" (
  "user_id" uuid,
  "team_id" uuid,
  "joined_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."academy_members" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_members" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_members" TO service_role;

CREATE TABLE public."academy_profiles" (
  "user_id" uuid,
  "nickname" text DEFAULT 'Piloto'::text,
  "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."academy_profiles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_profiles" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_profiles" TO service_role;

CREATE TABLE public."academy_team_changes" (
  "id" bigint GENERATED ALWAYS AS IDENTITY,
  "user_id" uuid,
  "previous_team_id" uuid,
  "new_team_id" uuid,
  "changed_by" uuid,
  "changed_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."academy_team_changes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_team_changes" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_team_changes" TO service_role;

CREATE TABLE public."academy_team_invites" (
  "team_id" uuid,
  "invite_code" text,
  "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."academy_team_invites" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_team_invites" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_team_invites" TO service_role;

CREATE TABLE public."academy_teams" (
  "id" uuid DEFAULT gen_random_uuid(),
  "slug" text,
  "name" text,
  "created_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."academy_teams" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."academy_teams" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."academy_teams" TO service_role;

CREATE TABLE public."garage_states" (
  "user_id" uuid,
  "garage" jsonb,
  "revision" bigint DEFAULT 1,
  "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."garage_states" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."garage_states" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."garage_states" TO service_role;

CREATE TABLE public."gbr_card_images" (
  "card_key" text,
  "kind" text,
  "card_name" text,
  "rarity" text DEFAULT ''::text,
  "edition_label" text DEFAULT ''::text,
  "image_url" text,
  "storage_path" text,
  "updated_by" uuid,
  "updated_at" timestamp with time zone DEFAULT now()
);
ALTER TABLE public."gbr_card_images" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public."gbr_card_images" FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public."gbr_card_images" TO service_role;

-- [3] Integridade e indices replicados do catalogo.
ALTER TABLE public."academy_access_codes" ADD CONSTRAINT "academy_access_codes_id_check" CHECK (id = 1);
ALTER TABLE public."academy_access_codes" ADD CONSTRAINT "academy_access_codes_pkey" PRIMARY KEY (id);
ALTER TABLE public."academy_admins" ADD CONSTRAINT "academy_admins_pkey" PRIMARY KEY (user_id);
ALTER TABLE public."academy_announcements" ADD CONSTRAINT "academy_announcements_body_check" CHECK (char_length(btrim(body)) >= 4 AND char_length(btrim(body)) <= 4000);
ALTER TABLE public."academy_announcements" ADD CONSTRAINT "academy_announcements_title_check" CHECK (char_length(btrim(title)) >= 3 AND char_length(btrim(title)) <= 110);
ALTER TABLE public."academy_announcements" ADD CONSTRAINT "academy_announcements_category_check" CHECK (category = ANY (ARRAY['Atualização'::text, 'Academia'::text, 'Evento GP'::text, 'Manutenção'::text, 'Dica'::text]));
ALTER TABLE public."academy_announcements" ADD CONSTRAINT "academy_announcements_link_url_check" CHECK (link_url IS NULL OR char_length(link_url) <= 500 AND link_url ~ '^https://[^[:space:]]+$'::text);
ALTER TABLE public."academy_announcements" ADD CONSTRAINT "academy_announcements_pkey" PRIMARY KEY (id);
ALTER TABLE public."academy_members" ADD CONSTRAINT "academy_members_pkey" PRIMARY KEY (user_id);
ALTER TABLE public."academy_profiles" ADD CONSTRAINT "nickname_length" CHECK (length(TRIM(BOTH FROM nickname)) >= 1 AND length(TRIM(BOTH FROM nickname)) <= 40);
ALTER TABLE public."academy_profiles" ADD CONSTRAINT "academy_profiles_pkey" PRIMARY KEY (user_id);
ALTER TABLE public."academy_team_changes" ADD CONSTRAINT "academy_team_changes_pkey" PRIMARY KEY (id);
ALTER TABLE public."academy_team_invites" ADD CONSTRAINT "strong_invite" CHECK (length(invite_code) >= 24);
ALTER TABLE public."academy_team_invites" ADD CONSTRAINT "academy_team_invites_pkey" PRIMARY KEY (team_id);
ALTER TABLE public."academy_team_invites" ADD CONSTRAINT "academy_team_invites_invite_code_key" UNIQUE (invite_code);
ALTER TABLE public."academy_teams" ADD CONSTRAINT "team_slug_format" CHECK (slug ~ '^team_[1-4]$'::text);
ALTER TABLE public."academy_teams" ADD CONSTRAINT "academy_teams_pkey" PRIMARY KEY (id);
ALTER TABLE public."academy_teams" ADD CONSTRAINT "academy_teams_slug_key" UNIQUE (slug);
ALTER TABLE public."garage_states" ADD CONSTRAINT "garage_is_object" CHECK (jsonb_typeof(garage) = 'object'::text);
ALTER TABLE public."garage_states" ADD CONSTRAINT "revision_positive" CHECK (revision >= 1);
ALTER TABLE public."garage_states" ADD CONSTRAINT "garage_states_pkey" PRIMARY KEY (user_id);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_storage_path_check" CHECK (storage_path IS NULL OR length(storage_path) <= 230);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_rarity_check" CHECK (length(rarity) <= 35);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_kind_check" CHECK (kind = ANY (ARRAY['drivers'::text, 'parts'::text]));
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_card_key_check" CHECK (length(card_key) >= 4 AND length(card_key) <= 250);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_edition_label_check" CHECK (length(edition_label) <= 120);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_image_url_check" CHECK (image_url ~ '^https://[^[:space:]]+$'::text AND length(image_url) <= 2048);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_card_name_check" CHECK (length(TRIM(BOTH FROM card_name)) >= 1 AND length(TRIM(BOTH FROM card_name)) <= 110);
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_pkey" PRIMARY KEY (card_key);
ALTER TABLE public."academy_admins" ADD CONSTRAINT "academy_admins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."academy_announcements" ADD CONSTRAINT "academy_announcements_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE RESTRICT;
ALTER TABLE public."academy_members" ADD CONSTRAINT "academy_members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES academy_teams(id);
ALTER TABLE public."academy_members" ADD CONSTRAINT "academy_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."academy_profiles" ADD CONSTRAINT "academy_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."academy_team_changes" ADD CONSTRAINT "academy_team_changes_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id);
ALTER TABLE public."academy_team_changes" ADD CONSTRAINT "academy_team_changes_new_team_id_fkey" FOREIGN KEY (new_team_id) REFERENCES academy_teams(id);
ALTER TABLE public."academy_team_changes" ADD CONSTRAINT "academy_team_changes_previous_team_id_fkey" FOREIGN KEY (previous_team_id) REFERENCES academy_teams(id);
ALTER TABLE public."academy_team_changes" ADD CONSTRAINT "academy_team_changes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."academy_team_invites" ADD CONSTRAINT "academy_team_invites_team_id_fkey" FOREIGN KEY (team_id) REFERENCES academy_teams(id) ON DELETE CASCADE;
ALTER TABLE public."garage_states" ADD CONSTRAINT "garage_states_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."gbr_card_images" ADD CONSTRAINT "gbr_card_images_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX academy_announcements_recent ON public.academy_announcements USING btree (created_at DESC);
CREATE INDEX academy_members_team_idx ON public.academy_members USING btree (team_id);

-- [4] RPCs reais. EXECUTE em PUBLIC/anon sempre revogado; grants autenticados conforme fonte.
CREATE OR REPLACE FUNCTION public.academy_team_counts()
 RETURNS TABLE(id uuid, slug text, name text, member_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if auth.uid() is null or not exists
  (select 1 from public.academy_members m where m.user_id=auth.uid())
 then raise exception 'Acesso reservado aos membros da academia.';end if;
 return query select t.id,t.slug,t.name,count(m.user_id)::bigint
 from public.academy_teams t left join public.academy_members m on m.team_id=t.id
 group by t.id,t.slug,t.name order by t.slug;
end;
$function$;
REVOKE ALL ON FUNCTION public."academy_team_counts"() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public."academy_team_counts"() TO service_role;
GRANT EXECUTE ON FUNCTION public."academy_team_counts"() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_players()
 RETURNS TABLE(user_id uuid, nickname text, team_id uuid, team_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if auth.uid() is null or not exists(select 1 from public.academy_admins where academy_admins.user_id=auth.uid()) then raise exception 'Acesso restrito ao administrador.';end if;
 return query select m.user_id,p.nickname,m.team_id,t.name from public.academy_members m
 left join public.academy_profiles p on p.user_id=m.user_id
 left join public.academy_teams t on t.id=m.team_id order by p.nickname nulls last;
end $function$;
REVOKE ALL ON FUNCTION public."admin_list_players"() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public."admin_list_players"() TO service_role;
GRANT EXECUTE ON FUNCTION public."admin_list_players"() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_move_player(p_user_id uuid, p_team_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_old uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.academy_admins where user_id=auth.uid()) then raise exception 'Somente o administrador pode alterar equipes.';end if;
 if p_team_id is not null and not exists(select 1 from public.academy_teams where id=p_team_id) then raise exception 'Equipe inexistente.';end if;
 select team_id into v_old from public.academy_members where user_id=p_user_id for update;
 if not found then raise exception 'Jogador não encontrado.';end if;
 if v_old is distinct from p_team_id then
 update public.academy_members set team_id=p_team_id where user_id=p_user_id;
 insert into public.academy_team_changes(user_id,previous_team_id,new_team_id,changed_by) values(p_user_id,v_old,p_team_id,auth.uid());
 end if;
end $function$;
REVOKE ALL ON FUNCTION public."admin_move_player"(p_user_id uuid, p_team_id uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public."admin_move_player"(p_user_id uuid, p_team_id uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public."admin_move_player"(p_user_id uuid, p_team_id uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.am_i_academy_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select auth.uid() is not null and exists(select 1 from public.academy_admins where user_id=auth.uid())
$function$;
REVOKE ALL ON FUNCTION public."am_i_academy_admin"() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public."am_i_academy_admin"() TO service_role;
GRANT EXECUTE ON FUNCTION public."am_i_academy_admin"() TO authenticated;

CREATE OR REPLACE FUNCTION public.join_academy(p_code text, p_nickname text)
 RETURNS TABLE(team_id uuid, team_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid();v_nick text:=btrim(p_nickname);v_expected text;
begin
 if v_uid is null then raise exception 'Entre na sua conta primeiro.';end if;
 if v_nick is null or char_length(v_nick)<2 or char_length(v_nick)>40 then raise exception 'Informe seu nome de jogador no F1 Clash (2 a 40 caracteres).';end if;
 select code into v_expected from public.academy_access_codes where id=1;
 if v_expected is null or upper(btrim(p_code))<>v_expected then raise exception 'Código da academia inválido.';end if;
 insert into public.academy_members(user_id,team_id) values(v_uid,null) on conflict(user_id) do nothing;
 insert into public.academy_profiles(user_id,nickname) values(v_uid,v_nick)
 on conflict(user_id) do update set nickname=excluded.nickname,updated_at=now();
 return query select m.team_id,t.name from public.academy_members m left join public.academy_teams t on t.id=m.team_id where m.user_id=v_uid;
end $function$;
REVOKE ALL ON FUNCTION public."join_academy"(p_code text, p_nickname text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public."join_academy"(p_code text, p_nickname text) TO service_role;
GRANT EXECUTE ON FUNCTION public."join_academy"(p_code text, p_nickname text) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_academy_team(p_code text)
 RETURNS TABLE(team_id uuid, team_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid := auth.uid();v_team uuid;
begin
 if v_uid is null then raise exception 'É necessário entrar na conta.'; end if;
 select i.team_id into v_team from public.academy_team_invites i
 where i.invite_code=upper(trim(p_code)) limit 1;
 if v_team is null then raise exception 'Código de convite inválido.'; end if;
 insert into public.academy_members(user_id,team_id) values (v_uid,v_team)
 on conflict(user_id) do nothing;
 if not exists(select 1 from public.academy_members m where m.user_id=v_uid and m.team_id=v_team)
 then raise exception 'Esta conta já pertence a outra equipe. Consulte o organizador.';end if;
 return query select t.id,t.name from public.academy_teams t where t.id=v_team;
end;
$function$;
REVOKE ALL ON FUNCTION public."join_academy_team"(p_code text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public."join_academy_team"(p_code text) TO service_role;

-- [5] Políticas RLS copiadas das expressões auditadas.
CREATE POLICY "GBR notices academy members and admins read" ON public."academy_announcements" FOR SELECT TO authenticated USING ((am_i_academy_admin() OR ((published = true) AND (EXISTS ( SELECT 1
   FROM academy_members m
  WHERE (m.user_id = ( SELECT auth.uid() AS uid)))))));
CREATE POLICY "GBR notices admin creates" ON public."academy_announcements" FOR INSERT TO authenticated WITH CHECK ((am_i_academy_admin() AND (created_by = ( SELECT auth.uid() AS uid))));
CREATE POLICY "GBR notices admin deletes" ON public."academy_announcements" FOR DELETE TO authenticated USING (am_i_academy_admin());
CREATE POLICY "GBR notices admin updates" ON public."academy_announcements" FOR UPDATE TO authenticated USING (am_i_academy_admin()) WITH CHECK (am_i_academy_admin());
CREATE POLICY "members read own affiliation" ON public."academy_members" FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "profiles insert own" ON public."academy_profiles" FOR INSERT TO authenticated WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "profiles select own" ON public."academy_profiles" FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "profiles update own" ON public."academy_profiles" FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));
CREATE POLICY "academy teams visible to logged users" ON public."academy_teams" FOR SELECT TO authenticated USING (true);
CREATE POLICY "garage insert only owner" ON public."garage_states" FOR INSERT TO authenticated WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM academy_members m
  WHERE (m.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "garage select only owner" ON public."garage_states" FOR SELECT TO authenticated USING (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM academy_members m
  WHERE (m.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "garage update only owner" ON public."garage_states" FOR UPDATE TO authenticated USING (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM academy_members m
  WHERE (m.user_id = ( SELECT auth.uid() AS uid)))))) WITH CHECK (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM academy_members m
  WHERE (m.user_id = ( SELECT auth.uid() AS uid))))));
CREATE POLICY "gbr_art_admin_delete" ON public."gbr_card_images" FOR DELETE TO authenticated USING (am_i_academy_admin());
CREATE POLICY "gbr_art_admin_insert" ON public."gbr_card_images" FOR INSERT TO authenticated WITH CHECK ((am_i_academy_admin() AND (updated_by = ( SELECT auth.uid() AS uid))));
CREATE POLICY "gbr_art_admin_update" ON public."gbr_card_images" FOR UPDATE TO authenticated USING (am_i_academy_admin()) WITH CHECK ((am_i_academy_admin() AND (updated_by = ( SELECT auth.uid() AS uid))));
CREATE POLICY "gbr_art_members_read" ON public."gbr_card_images" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM academy_members m
  WHERE (m.user_id = ( SELECT auth.uid() AS uid)))));

-- [6] GRANTs de minimo privilegio (deliberadamente sem TRUNCATE para usuarios autenticados).
GRANT SELECT ON TABLE public."academy_teams" TO authenticated;
GRANT SELECT ON TABLE public."academy_members" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public."academy_profiles" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public."garage_states" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."academy_announcements" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public."gbr_card_images" TO authenticated;

-- [7] Storage: somente configuracao e politicas; sem copiar objetos.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types) VALUES ('gbr-card-art','gbr-card-art',true,1572864,ARRAY['image/jpeg','image/png','image/webp']::text[]);
CREATE POLICY "gbr_art_remove_admin" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'gbr-card-art'::text) AND public.am_i_academy_admin()));
CREATE POLICY "gbr_art_replace_admin" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'gbr-card-art'::text) AND public.am_i_academy_admin())) WITH CHECK (((bucket_id = 'gbr-card-art'::text) AND public.am_i_academy_admin()));
CREATE POLICY "gbr_art_storage_read" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'gbr-card-art'::text));
CREATE POLICY "gbr_art_upload_admin" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'gbr-card-art'::text) AND public.am_i_academy_admin() AND ((storage.foldername(name))[1] = ANY (ARRAY['drivers'::text, 'parts'::text]))));
DO $realtime$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') AND
    NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='gbr_card_images')
 THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.gbr_card_images; END IF;
END $realtime$;

-- [8] Poscondicoes conservadoras.
DO $assert$ DECLARE n integer; BEGIN
 SELECT count(*) INTO n FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='public' AND c.relkind='r';
 IF n <> 10 THEN RAISE EXCEPTION 'Esquema incompleto: % tabelas',n; END IF;
 IF has_function_privilege('anon','public.admin_move_player(uuid,uuid)','EXECUTE') THEN RAISE EXCEPTION 'RPC admin permite anon'; END IF;
 IF NOT has_function_privilege('authenticated','public.admin_move_player(uuid,uuid)','EXECUTE') THEN RAISE EXCEPTION 'RPC admin negada ao papel autenticado'; END IF;
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='public' AND c.relkind='r' AND NOT c.relrowsecurity) THEN RAISE EXCEPTION 'Tabela sem RLS'; END IF;
 IF (SELECT count(*) FROM auth.users) <> 0 THEN RAISE EXCEPTION 'Dados auth inesperados'; END IF;
END $assert$;
