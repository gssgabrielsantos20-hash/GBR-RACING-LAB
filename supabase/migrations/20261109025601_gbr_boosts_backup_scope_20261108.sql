-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
-- Criou o schema gbr_migration_backup (cópia de segurança de 08/11). Ver pendência de limpeza no ADR 0024.
BEGIN;
DO $guard$
DECLARE v_fingerprint text; v_kind text; v_policy text;
BEGIN
 SELECT md5(string_agg(md5(row_to_json(t)::text),',' ORDER BY card_key)) INTO v_fingerprint FROM public.gbr_card_images t;
 SELECT pg_get_constraintdef(c.oid) INTO v_kind FROM pg_constraint c WHERE c.conrelid='public.gbr_card_images'::regclass AND c.conname='gbr_card_images_kind_check';
 SELECT pg_get_expr(p.polwithcheck,p.polrelid) INTO v_policy FROM pg_policy p WHERE p.polrelid='storage.objects'::regclass AND p.polname='gbr_art_upload_admin';
 IF v_fingerprint IS DISTINCT FROM '9e1a5449519d8ce29b17d97d10fe074d' OR
 v_kind IS DISTINCT FROM 'CHECK ((kind = ANY (ARRAY[''drivers''::text, ''parts''::text])))' OR
 v_policy IS NULL OR v_policy NOT LIKE '%am_i_academy_admin%' OR v_policy LIKE '%boosts%' THEN
   RAISE EXCEPTION 'Baseline divergente: cópia interrompida';
 END IF;
END
$guard$;
CREATE SCHEMA gbr_migration_backup;
REVOKE ALL ON SCHEMA gbr_migration_backup FROM PUBLIC, anon, authenticated;
CREATE TABLE gbr_migration_backup.images_20261108 AS SELECT * FROM public.gbr_card_images;
ALTER TABLE gbr_migration_backup.images_20261108 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON gbr_migration_backup.images_20261108 FROM PUBLIC, anon, authenticated;
CREATE TABLE gbr_migration_backup.rules_20261108 AS
SELECT 'kind_check'::text AS rule, pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c WHERE c.conrelid='public.gbr_card_images'::regclass AND c.conname='gbr_card_images_kind_check'
UNION ALL
SELECT 'storage_insert'::text,pg_get_expr(p.polwithcheck,p.polrelid)
FROM pg_policy p WHERE p.polrelid='storage.objects'::regclass AND p.polname='gbr_art_upload_admin';
ALTER TABLE gbr_migration_backup.rules_20261108 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON gbr_migration_backup.rules_20261108 FROM PUBLIC, anon, authenticated;
CREATE TEMP TABLE gbr_images_restore_probe (LIKE public.gbr_card_images INCLUDING ALL) ON COMMIT DROP;
INSERT INTO gbr_images_restore_probe SELECT * FROM gbr_migration_backup.images_20261108;
DO $verify$
DECLARE n int; fingerprint text; rules int;
BEGIN
 SELECT count(*)::int,md5(string_agg(md5(row_to_json(t)::text),',' ORDER BY card_key))
 INTO n,fingerprint FROM gbr_images_restore_probe t;
 SELECT count(*)::int INTO rules FROM gbr_migration_backup.rules_20261108;
 IF n<>96 OR fingerprint <> '9e1a5449519d8ce29b17d97d10fe074d' OR rules<>2 THEN
   RAISE EXCEPTION 'Falha de teste de recuperação: linhas %, hash %, regras %',n,fingerprint,rules;
 END IF;
END
$verify$;
COMMIT;
