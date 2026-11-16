-- PROPOSTA DE ROLLBACK: não executado.
-- O rollback NÃO apaga fotos, metadados nem dados de outros usuários.
-- Se houver boosts publicados/arquivos na pasta boosts/, ABORTAR e realizar exportação,
-- despublicação e validação de preservação com autorização específica antes de voltar.
BEGIN;
DO $guard$
BEGIN
  IF EXISTS(SELECT 1 FROM public.gbr_card_images WHERE kind = 'boosts') OR
     EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='gbr-card-art' AND
            (storage.foldername(name))[1]='boosts') THEN
    RAISE EXCEPTION 'Existem imagens de boosts; preserve e trate os registros antes do rollback';
  END IF;
END
$guard$;
ALTER TABLE public.gbr_card_images DROP CONSTRAINT gbr_card_images_kind_check;
ALTER TABLE public.gbr_card_images
  ADD CONSTRAINT gbr_card_images_kind_check
  CHECK (kind = ANY (ARRAY['drivers'::text,'parts'::text]));
ALTER POLICY gbr_art_upload_admin ON storage.objects
  WITH CHECK (
    bucket_id = 'gbr-card-art'::text AND am_i_academy_admin()
    AND (storage.foldername(name))[1] = ANY (ARRAY['drivers'::text,'parts'::text])
  );
COMMIT;
