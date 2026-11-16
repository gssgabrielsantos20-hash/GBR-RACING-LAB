-- APENAS LEITURA: antes/depois e na homologação.
SELECT n.nspname,c.relname,c.relrowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE (n.nspname='public' AND c.relname='gbr_card_images')
   OR (n.nspname='storage' AND c.relname='objects');

SELECT c.conname,pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
JOIN pg_namespace n ON n.oid=t.relnamespace
WHERE n.nspname='public' AND t.relname='gbr_card_images'
  AND c.conname='gbr_card_images_kind_check';

SELECT schemaname,tablename,policyname,roles,cmd,qual,with_check
FROM pg_policies WHERE (schemaname='public' AND tablename='gbr_card_images')
OR (schemaname='storage' AND tablename='objects' AND policyname LIKE 'gbr_art_%')
ORDER BY schemaname,tablename,policyname;

SELECT kind, count(*) AS registros FROM public.gbr_card_images
GROUP BY kind ORDER BY kind;
