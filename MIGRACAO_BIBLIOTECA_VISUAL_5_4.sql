-- GBR Racing Lab 5.4 — Catálogo visual compartilhado (aditivo; não modifica garage_states).
-- Administradores podem publicar e substituir artes; integrantes autenticados consultam.
CREATE TABLE IF NOT EXISTS public.gbr_card_images (
  card_key text PRIMARY KEY CHECK (length(card_key) BETWEEN 4 AND 250),
  kind text NOT NULL CHECK (kind IN ('drivers','parts')),
  card_name text NOT NULL CHECK (length(trim(card_name)) BETWEEN 1 AND 110),
  rarity text NOT NULL DEFAULT '' CHECK (length(rarity) <= 35),
  edition_label text NOT NULL DEFAULT '' CHECK (length(edition_label) <= 120),
  image_url text NOT NULL CHECK (image_url ~ '^https://[^[:space:]]+$' AND length(image_url) <= 2048),
  storage_path text CHECK (storage_path IS NULL OR length(storage_path) <= 230),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gbr_card_images ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.gbr_card_images FROM anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.gbr_card_images TO authenticated;

DROP POLICY IF EXISTS "gbr_art_members_read" ON public.gbr_card_images;
CREATE POLICY "gbr_art_members_read" ON public.gbr_card_images FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.academy_members m WHERE m.user_id=(SELECT auth.uid())));

DROP POLICY IF EXISTS "gbr_art_admin_insert" ON public.gbr_card_images;
CREATE POLICY "gbr_art_admin_insert" ON public.gbr_card_images FOR INSERT TO authenticated
WITH CHECK (public.am_i_academy_admin() AND updated_by=(SELECT auth.uid()));

DROP POLICY IF EXISTS "gbr_art_admin_update" ON public.gbr_card_images;
CREATE POLICY "gbr_art_admin_update" ON public.gbr_card_images FOR UPDATE TO authenticated
USING (public.am_i_academy_admin())
WITH CHECK (public.am_i_academy_admin() AND updated_by=(SELECT auth.uid()));

DROP POLICY IF EXISTS "gbr_art_admin_delete" ON public.gbr_card_images;
CREATE POLICY "gbr_art_admin_delete" ON public.gbr_card_images FOR DELETE TO authenticated
USING (public.am_i_academy_admin());

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('gbr-card-art','gbr-card-art',true,1572864,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=EXCLUDED.public,
 file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "gbr_art_upload_admin" ON storage.objects;
CREATE POLICY "gbr_art_upload_admin" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id='gbr-card-art' AND public.am_i_academy_admin()
 AND (storage.foldername(name))[1] IN ('drivers','parts'));
DROP POLICY IF EXISTS "gbr_art_replace_admin" ON storage.objects;
CREATE POLICY "gbr_art_replace_admin" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id='gbr-card-art' AND public.am_i_academy_admin())
WITH CHECK (bucket_id='gbr-card-art' AND public.am_i_academy_admin());
DROP POLICY IF EXISTS "gbr_art_remove_admin" ON storage.objects;
CREATE POLICY "gbr_art_remove_admin" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id='gbr-card-art' AND public.am_i_academy_admin());
-- Objetos públicos são servidos por URL do Storage, mas apenas administradores podem criar/alterar.
DROP POLICY IF EXISTS "gbr_art_storage_read" ON storage.objects;
CREATE POLICY "gbr_art_storage_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id='gbr-card-art');

-- Atualizações em tempo real no catálogo visual para demais aparelhos.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') AND
    NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='gbr_card_images')
 THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.gbr_card_images; END IF;
END $$;
