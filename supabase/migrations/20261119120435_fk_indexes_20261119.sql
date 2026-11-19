-- Aplicada em 19/11/2026 (auditoria P3): índices nas chaves estrangeiras apontadas pelo advisor do Supabase.
create index if not exists academy_announcements_created_by_idx on public.academy_announcements (created_by);
create index if not exists academy_team_changes_changed_by_idx on public.academy_team_changes (changed_by);
create index if not exists academy_team_changes_new_team_id_idx on public.academy_team_changes (new_team_id);
create index if not exists academy_team_changes_previous_team_id_idx on public.academy_team_changes (previous_team_id);
create index if not exists academy_team_changes_user_id_idx on public.academy_team_changes (user_id);
create index if not exists gbr_card_images_updated_by_idx on public.gbr_card_images (updated_by);
