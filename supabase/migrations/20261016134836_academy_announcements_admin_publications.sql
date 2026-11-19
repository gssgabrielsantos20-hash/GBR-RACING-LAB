-- Exportada de supabase_migrations.schema_migrations em 19/11/2026.
CREATE TABLE IF NOT EXISTS public.academy_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'Atualização'
    CHECK (category IN ('Atualização','Academia','Evento GP','Manutenção','Dica')),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 3 AND 110),
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 4 AND 4000),
  link_url text CHECK (link_url IS NULL OR (char_length(link_url) <= 500 AND link_url ~ '^https://[^[:space:]]+$')),
  pinned boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT
);
ALTER TABLE public.academy_announcements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.academy_announcements FROM PUBLIC, anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.academy_announcements TO authenticated;
CREATE POLICY "GBR notices academy members and admins read" ON public.academy_announcements
  FOR SELECT TO authenticated
  USING (
    public.am_i_academy_admin()
    OR (
      published = true
      AND EXISTS (
        SELECT 1 FROM public.academy_members AS m
        WHERE m.user_id = (SELECT auth.uid())
      )
    )
  );
CREATE POLICY "GBR notices admin creates" ON public.academy_announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    public.am_i_academy_admin() AND created_by = (SELECT auth.uid())
  );
CREATE POLICY "GBR notices admin updates" ON public.academy_announcements
  FOR UPDATE TO authenticated
  USING (public.am_i_academy_admin())
  WITH CHECK (public.am_i_academy_admin());
CREATE POLICY "GBR notices admin deletes" ON public.academy_announcements
  FOR DELETE TO authenticated
  USING (public.am_i_academy_admin());
CREATE INDEX IF NOT EXISTS academy_announcements_recent
  ON public.academy_announcements (created_at DESC);
NOTIFY pgrst, 'reload schema';
