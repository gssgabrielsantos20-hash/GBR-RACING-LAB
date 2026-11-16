-- STATUS HISTÓRICO: migração aplicada no Supabase oficial em 09/11/2026.
-- Migration: enable_shared_boost_image_kind_20261108 (20261109030118).
-- Este arquivo é a proposta original; consulte docs/adr/0013 e 0014 para o estado validado.
-- PROPOSTA PARA REVISÃO: não executado / NÃO é uma migração aplicada.
-- Projeto esperado: GBR Racing Control (gkjqfirlcmmlhuokszlz), PostgreSQL 17.
-- Registrar como migração oficial com Supabase CLI após aprovação SEPARADA para produção.
-- Escopo: ampliar APENAS o enum CHECK e a política INSERT de objetos para a pasta boosts/.
-- Não altera equipes, privilégios, RLS, credenciais, registros ou arquivos existentes.
-- Pré-requisitos: conferir backup/restauração, diffs das políticas, ambiente de homologação e contas de teste.

BEGIN;
DO $guard$
DECLARE
  current_kind text;
  current_upload text;
BEGIN
  SELECT pg_get_constraintdef(c.oid) INTO current_kind
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  JOIN pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public' AND t.relname = 'gbr_card_images'
    AND c.conname = 'gbr_card_images_kind_check';
  IF current_kind IS NULL OR current_kind NOT LIKE '%drivers%'
     OR current_kind NOT LIKE '%parts%' OR current_kind LIKE '%boosts%' THEN
    RAISE EXCEPTION 'Baseline do CHECK alterada; revisar antes de aplicar';
  END IF;

  SELECT pg_get_expr(pol.polwithcheck, pol.polrelid) INTO current_upload
  FROM pg_policy pol
  JOIN pg_class t ON t.oid=pol.polrelid
  JOIN pg_namespace n ON n.oid=t.relnamespace
  WHERE n.nspname='storage' AND t.relname='objects' AND pol.polname='gbr_art_upload_admin';
  IF current_upload IS NULL OR current_upload NOT LIKE '%gbr-card-art%'
     OR current_upload NOT LIKE '%am_i_academy_admin%'
     OR current_upload NOT LIKE '%drivers%' OR current_upload NOT LIKE '%parts%'
     OR current_upload LIKE '%boosts%' THEN
    RAISE EXCEPTION 'Política upload divergente; revisão humana obrigatória';
  END IF;

  IF NOT (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname='public' AND c.relname='gbr_card_images')
     OR NOT (SELECT c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
          WHERE n.nspname='storage' AND c.relname='objects') THEN
    RAISE EXCEPTION 'RLS desabilitado: bloquear a alteração';
  END IF;
END
$guard$;

ALTER TABLE public.gbr_card_images DROP CONSTRAINT gbr_card_images_kind_check;
ALTER TABLE public.gbr_card_images
  ADD CONSTRAINT gbr_card_images_kind_check
  CHECK (kind = ANY (ARRAY['drivers'::text,'parts'::text,'boosts'::text]));

-- IMPORTANTE: ALTER POLICY altera apenas WITH CHECK, preservando TO authenticated,
-- cmd INSERT e as políticas existentes de SELECT/UPDATE/DELETE.
ALTER POLICY gbr_art_upload_admin ON storage.objects
  WITH CHECK (
    bucket_id = 'gbr-card-art'::text
    AND am_i_academy_admin()
    AND (storage.foldername(name))[1] = ANY
      (ARRAY['drivers'::text,'parts'::text,'boosts'::text])
  );
COMMIT;
