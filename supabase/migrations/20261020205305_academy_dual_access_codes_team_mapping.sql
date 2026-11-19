-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
DO $preflight$
BEGIN
  IF (SELECT count(*) FROM public.academy_access_codes) <> 1
     OR NOT EXISTS (SELECT 1 FROM public.academy_access_codes WHERE id = 1)
     OR NOT EXISTS (SELECT 1 FROM public.academy_teams WHERE slug = 'team_1')
     OR NOT EXISTS (SELECT 1 FROM public.academy_teams WHERE slug = 'team_2')
  THEN
    RAISE EXCEPTION 'Precondicoes do cadastro de convites mudaram; interromper migracao e reavaliar';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.academy_access_codes'::regclass
      AND conname = 'academy_access_codes_id_check'
      AND pg_get_constraintdef(oid) = 'CHECK ((id = 1))'
  ) THEN
    RAISE EXCEPTION 'Restricao de id de convites inesperada; interromper migracao';
  END IF;
END
$preflight$;

ALTER TABLE public.academy_access_codes
  DROP CONSTRAINT academy_access_codes_id_check,
  ADD CONSTRAINT academy_access_codes_id_check CHECK (id IN (1, 2)),
  ADD CONSTRAINT academy_access_codes_member_code_length_check
    CHECK (id <> 2 OR char_length(btrim(code)) BETWEEN 16 AND 128);

CREATE UNIQUE INDEX academy_access_codes_code_normalized_uidx
  ON public.academy_access_codes (upper(btrim(code)));

CREATE OR REPLACE FUNCTION public.join_academy(p_code text, p_nickname text)
RETURNS TABLE(team_id uuid, team_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_nick text := btrim(p_nickname);
  v_code_id integer;
  v_team_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Necessario estar autenticado';
  END IF;
  IF v_nick IS NULL OR char_length(v_nick) < 2 OR char_length(v_nick) > 40 THEN
    RAISE EXCEPTION 'Nome de piloto deve ter entre 2 e 40 caracteres';
  END IF;
  IF p_code IS NULL OR char_length(btrim(p_code)) > 256 OR btrim(p_code) = '' THEN
    RAISE EXCEPTION 'Convite invalido';
  END IF;

  SELECT c.id INTO v_code_id
  FROM public.academy_access_codes AS c
  WHERE upper(btrim(c.code)) = upper(btrim(p_code));
  IF v_code_id IS NULL THEN
    RAISE EXCEPTION 'Convite invalido';
  END IF;

  SELECT t.id INTO v_team_id
  FROM public.academy_teams AS t
  WHERE t.slug = CASE v_code_id
    WHEN 1 THEN 'team_1'
    WHEN 2 THEN 'team_2'
    ELSE NULL END;
  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Equipe de ingresso indisponivel';
  END IF;

  INSERT INTO public.academy_members(user_id, team_id)
    VALUES (v_uid, v_team_id)
    ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.academy_profiles(user_id, nickname)
    VALUES (v_uid, v_nick)
    ON CONFLICT (user_id) DO UPDATE
      SET nickname = EXCLUDED.nickname, updated_at = now();

  RETURN QUERY
    SELECT m.team_id, t.name
    FROM public.academy_members AS m
    LEFT JOIN public.academy_teams AS t ON t.id = m.team_id
    WHERE m.user_id = v_uid;
END
$function$;

CREATE OR REPLACE FUNCTION public.join_academy(
  p_code text, p_nickname text, p_requested_team_id uuid
)
RETURNS TABLE(team_id uuid, team_name text)
LANGUAGE sql
SECURITY INVOKER
SET search_path TO ''
AS $function$
  SELECT * FROM public.join_academy(p_code, p_nickname);
$function$;

REVOKE EXECUTE ON FUNCTION public.join_academy(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_academy(text,text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.join_academy(text,text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_academy(text,text,uuid) TO authenticated;
