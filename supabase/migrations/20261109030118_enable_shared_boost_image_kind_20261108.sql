-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='15s';
DO $guard$
DECLARE
 kind_rule text; storage_rule text; role_names text; policy_cmd text;
 row_fingerprint text; snapshot_fingerprint text;
BEGIN
 SELECT pg_get_constraintdef(c.oid) INTO kind_rule FROM pg_constraint c
 WHERE c.conrelid='public.gbr_card_images'::regclass AND c.conname='gbr_card_images_kind_check';
 SELECT pg_get_expr(p.polwithcheck,p.polrelid) INTO storage_rule FROM pg_policy p
 WHERE p.polrelid='storage.objects'::regclass AND p.polname='gbr_art_upload_admin';
 SELECT roles::text,cmd INTO role_names,policy_cmd FROM pg_policies
 WHERE schemaname='storage' AND tablename='objects' AND policyname='gbr_art_upload_admin';
 SELECT md5(string_agg(md5(row_to_json(t)::text),',' ORDER BY card_key)) INTO row_fingerprint FROM public.gbr_card_images t;
 SELECT md5(string_agg(md5(row_to_json(t)::text),',' ORDER BY card_key)) INTO snapshot_fingerprint
 FROM gbr_migration_backup.images_20261108 t;
 IF kind_rule IS DISTINCT FROM 'CHECK ((kind = ANY (ARRAY[''drivers''::text, ''parts''::text])))'
 OR storage_rule IS NULL OR storage_rule NOT LIKE '%am_i_academy_admin()%' OR storage_rule NOT LIKE '%gbr-card-art%'
 OR storage_rule NOT LIKE '%drivers%' OR storage_rule NOT LIKE '%parts%' OR storage_rule LIKE '%boosts%'
 OR role_names <> '{authenticated}' OR policy_cmd <> 'INSERT'
 OR row_fingerprint IS DISTINCT FROM '9e1a5449519d8ce29b17d97d10fe074d'
 OR snapshot_fingerprint IS DISTINCT FROM row_fingerprint
 OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.gbr_card_images'::regclass)
 OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='storage.objects'::regclass)
 OR EXISTS(SELECT 1 FROM public.gbr_card_images WHERE kind='boosts')
 OR EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='gbr-card-art' AND (storage.foldername(name))[1]='boosts')
 THEN RAISE EXCEPTION 'Pré-condição divergente; migração de boosts cancelada';
 END IF;
END $guard$;
ALTER TABLE public.gbr_card_images DROP CONSTRAINT gbr_card_images_kind_check;
ALTER TABLE public.gbr_card_images ADD CONSTRAINT gbr_card_images_kind_check
CHECK (kind = ANY (ARRAY['drivers'::text,'parts'::text,'boosts'::text]));
ALTER POLICY gbr_art_upload_admin ON storage.objects WITH CHECK (
 bucket_id='gbr-card-art'::text AND am_i_academy_admin()
 AND (storage.foldername(name))[1] = ANY(ARRAY['drivers'::text,'parts'::text,'boosts'::text])
);
DO $verify$
DECLARE k text; p text; fp text; roles_now text; cmd_now text;
BEGIN
 SELECT pg_get_constraintdef(c.oid) INTO k FROM pg_constraint c
 WHERE c.conrelid='public.gbr_card_images'::regclass AND c.conname='gbr_card_images_kind_check';
 SELECT pg_get_expr(pol.polwithcheck,pol.polrelid) INTO p FROM pg_policy pol
 WHERE pol.polrelid='storage.objects'::regclass AND pol.polname='gbr_art_upload_admin';
 SELECT roles::text,cmd INTO roles_now,cmd_now FROM pg_policies
 WHERE schemaname='storage' AND tablename='objects' AND policyname='gbr_art_upload_admin';
 SELECT md5(string_agg(md5(row_to_json(t)::text),',' ORDER BY card_key)) INTO fp FROM public.gbr_card_images t;
 IF k NOT LIKE '%boosts%' OR p NOT LIKE '%boosts%' OR p NOT LIKE '%am_i_academy_admin()%'
 OR roles_now<>'{authenticated}' OR cmd_now<>'INSERT'
 OR fp IS DISTINCT FROM '9e1a5449519d8ce29b17d97d10fe074d'
 OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.gbr_card_images'::regclass)
 OR NOT (SELECT relrowsecurity FROM pg_class WHERE oid='storage.objects'::regclass)
 THEN RAISE EXCEPTION 'Verificação pós-DDL falhou; transação desfeita';
 END IF;
END $verify$;
COMMIT;
